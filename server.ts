import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getOrCreateUser, getUsers } from './src/db/users.ts';
import { 
  recordStatutoryAction, 
  getStatutoryActions, 
  createMeetHearing, 
  getMeetHearings, 
  updateMeetHearingStatus 
} from './src/db/vigilance.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory synced state matching DoSJE Surveillance specs
let serverSyncState = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  activeHoldsTotalCr: 42.8,
  activeAuditsCount: 38,
  frozenTranchesCount: 19,
  isTranche3Frozen: false,
  rollCallActive: false,
  rollCallSecondsRemaining: 0,
  inspectionNote: '',
  showCauseIssued: false,
  verifiedPin: false,
  telemetryLogs: [
    {
      id: 'tel-1',
      timestamp: '14:22:04 IST',
      title: 'Team 08 locked at Divyang Kendra, Rohini',
      description: 'Inspector #DL-092 verified distance: 18.2m to NGO Darpan registered coordinates. Inspection sheet unlocked.',
      type: 'geofence',
      tags: ['EXIF PASS', '28.7041° N, 77.1025° E']
    },
    {
      id: 'tel-2',
      timestamp: '14:19:50 IST',
      title: 'Shanti Rehabilitation Home (UP/2018/0192)',
      description: 'AEBAS server reported 0 logins today despite ₹18.4L tranche draw claim for 40 resident in-patients. CCTV telemetry dropped 36 consecutive hours.',
      type: 'anomaly',
      actionLabel: 'Auto-Freeze Tranche'
    },
    {
      id: 'tel-3',
      timestamp: '14:15:12 IST',
      title: 'Cam #02 Gateway: Navjyoti Drug Center, Dwarka',
      description: 'AI Headcount CV module counted 11 persons; attendance roster registered 42 beneficiaries. Variance: 73.8%.',
      type: 'rtsp'
    },
    {
      id: 'tel-4',
      timestamp: '14:02:44 IST',
      title: 'Surprise Unit UP-VIG-12 En Route',
      description: 'Assigned target: Jagriti Bal Vikas Sansthan, Ghaziabad. Target ETA: 24 mins. Real-time geo-tracking active.',
      type: 'dispatch'
    }
  ],
  institutionsStatus: {
    'pragati-shiksha': { isFrozen: false, riskScore: 88, physicalCount: 31, aebasRegistered: 45 },
    'asha-kiran': { isFrozen: false, riskScore: 81, physicalCount: 34, aebasRegistered: 48 },
    'jeevan-disha': { isFrozen: false, riskScore: 76, physicalCount: 26, aebasRegistered: 30 },
    'samarpan-sc': { isFrozen: false, riskScore: 84, physicalCount: 72, aebasRegistered: 120 }
  }
};

// SSE active clients
const sseClients: Response[] = [];

function broadcastStateUpdate() {
  serverSyncState.version += 1;
  serverSyncState.lastUpdated = new Date().toISOString();
  const payload = JSON.stringify({ type: 'SYNC_UPDATE', state: serverSyncState });
  
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(`data: ${payload}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// REST API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'DoSJE Surveillance & Vigilance Central Node',
    timestamp: new Date().toISOString(),
    connectedClients: sseClients.length
  });
});

app.get('/api/sync/state', (_req: Request, res: Response) => {
  res.json(serverSyncState);
});

// Cloud SQL User Sync endpoint
app.post('/api/auth/sync-user', async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName, role, officerId } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'uid and email required' });
    }
    const user = await getOrCreateUser(uid, email, displayName, role, officerId);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('User sync to Cloud SQL error:', error);
    res.status(500).json({ error: error.message || 'User sync failed' });
  }
});

// Cloud SQL Statutory Actions
app.get('/api/sql/actions', async (_req: Request, res: Response) => {
  try {
    const actions = await getStatutoryActions(50);
    res.json(actions);
  } catch (error: any) {
    console.error('Failed to fetch statutory actions from Cloud SQL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google Meet Integration APIs
app.get('/api/meet/hearings', async (_req: Request, res: Response) => {
  try {
    const hearings = await getMeetHearings();
    res.json(hearings);
  } catch (error: any) {
    console.error('Failed to query meet hearings from Cloud SQL:', error);
    res.status(500).json({ error: error.message || 'Failed to query meet hearings' });
  }
});

app.post('/api/meet/create-space', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const { title, inquiryType, institutionId, institutionName, notes, userId } = req.body;
    let meetingUri = '';
    let meetingSpaceName = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.split('Bearer ')[1];
      try {
        const meetRes = await fetch('https://meet.googleapis.com/v2/spaces', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        if (meetRes.ok) {
          const data = await meetRes.json();
          meetingSpaceName = data.name || `spaces/${Math.random().toString(36).substring(2, 10)}`;
          meetingUri = data.meetingUri || `https://meet.google.com/${meetingSpaceName.replace('spaces/', '')}`;
        }
      } catch (meetErr) {
        console.warn('Google Meet API space generation fallback:', meetErr);
      }
    }

    // Fallback if token is unavailable
    if (!meetingUri) {
      const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      meetingSpaceName = `spaces/${randomCode}`;
      meetingUri = `https://meet.google.com/${randomCode}`;
    }

    const hearing = await createMeetHearing({
      userId: userId ? Number(userId) : undefined,
      title: title || 'Section 44A Statutory Virtual Inquiry',
      meetingSpaceName,
      meetingUri,
      institutionId: institutionId || 'pragati-shiksha',
      institutionName: institutionName || 'Pragati Shiksha Trust',
      inquiryType: inquiryType || 'Statutory Show-Cause Hearing',
      notes: notes || 'Summoned before Joint Secretary & Central Vigilance Officer via Google Meet.',
    });

    res.json({ success: true, hearing });
  } catch (error: any) {
    console.error('Error creating Google Meet space:', error);
    res.status(500).json({ error: error.message || 'Error creating Google Meet space' });
  }
});

app.patch('/api/meet/hearings/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const updated = await updateMeetHearingStatus(id, status);
    res.json({ success: true, updated });
  } catch (error: any) {
    console.error('Error updating hearing status:', error);
    res.status(500).json({ error: error.message || 'Error updating hearing status' });
  }
});

// SSE endpoint for multi-device real-time sync
app.get('/api/sync/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected state
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', state: serverSyncState })}\n\n`);
  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) {
      sseClients.splice(idx, 1);
    }
  });
});

app.post('/api/sync/action', (req: Request, res: Response) => {
  const { action, payload } = req.body;

  if (action === 'FREEZE_TRANCHE') {
    serverSyncState.isTranche3Frozen = true;
    serverSyncState.activeHoldsTotalCr = parseFloat((serverSyncState.activeHoldsTotalCr + 0.425).toFixed(3));
    serverSyncState.frozenTranchesCount += 1;
    if (serverSyncState.institutionsStatus['pragati-shiksha']) {
      serverSyncState.institutionsStatus['pragati-shiksha'].isFrozen = true;
    }
    serverSyncState.telemetryLogs.unshift({
      id: `tel-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: 'Statutory Grant Freeze Enforced • DL/2019/0228391',
      description: 'DSC Class-3 Applied by Dr. Rajiv Verma, IAS. Tranche-3 (₹42,50,000) frozen on PFMS & e-Anudaan gateways.',
      type: 'freeze',
      tags: ['DSC VERIFIED', 'PFMS HOLD: 90281-F']
    });
    recordStatutoryAction({
      actionType: 'FREEZE_TRANCHE',
      institutionId: 'pragati-shiksha',
      institutionName: 'Pragati Shiksha Trust',
      amountFrozenCr: '0.425',
      reason: 'Biometric variance 73.8% and attendance mismatch under Section 44A.',
      dscHash: 'SHA256-RV-IAS-DSC-2026',
    }).catch(e => console.warn('Cloud SQL record warning:', e));
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  if (action === 'TRIGGER_ROLL_CALL') {
    serverSyncState.rollCallActive = true;
    serverSyncState.rollCallSecondsRemaining = 900; // 15 mins
    serverSyncState.telemetryLogs.unshift({
      id: `tel-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: 'Live Biometric Roll-Call Triggered by HQ',
      description: 'Inspector INS-2026-904 terminal mandated to physically scan and verify 45 enrolled residents within 15:00 window.',
      type: 'geofence',
      tags: ['ROLL-CALL ACTIVE', 'TIMER: 15:00']
    });
    recordStatutoryAction({
      actionType: 'TRIGGER_ROLL_CALL',
      institutionId: 'pragati-shiksha',
      institutionName: 'Pragati Shiksha Trust',
      reason: '15-minute biometric physical roll-call mandated by Vigilance HQ.',
    }).catch(e => console.warn('Cloud SQL record warning:', e));
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  if (action === 'ISSUE_SHOW_CAUSE') {
    serverSyncState.showCauseIssued = true;
    serverSyncState.telemetryLogs.unshift({
      id: `tel-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: '7-Day Statutory Notice Issued to Trustees',
      description: 'Notice served to Pragati Shiksha Trust under Section 44A of Central Vigilance Act for 14 beneficiary discrepancies.',
      type: 'anomaly',
      tags: ['NOTICE SERVED', 'SEC 44A']
    });
    recordStatutoryAction({
      actionType: 'ISSUE_SHOW_CAUSE',
      institutionId: 'pragati-shiksha',
      institutionName: 'Pragati Shiksha Trust',
      reason: '7-Day Statutory Notice under Section 44A for resident count discrepancy.',
    }).catch(e => console.warn('Cloud SQL record warning:', e));
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  if (action === 'FORCE_GEOFENCE') {
    serverSyncState.telemetryLogs.unshift({
      id: `tel-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: 'Forced PostGIS GPS Ping Re-verified',
      description: 'Officer INS-2026-904 verified: 9.4m inside boundary perimeter. Accuracy: ±0.4m RTK corrected.',
      type: 'geofence',
      tags: ['PASS', '9.4m ACCURATE']
    });
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  if (action === 'RE_RUN_ML') {
    serverSyncState.activeAuditsCount += 3;
    serverSyncState.telemetryLogs.unshift({
      id: `tel-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: 'National ML Anomaly Detection Model Run Complete',
      description: 'Analyzed 14,820 monitored NGO facilities across 28 States. 142 High-risk anomalies prioritized.',
      type: 'anomaly',
      tags: ['YOLOv9-CV', 'AEBAS-DELTA']
    });
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  if (action === 'DISPATCH_SQUAD') {
    serverSyncState.activeAuditsCount += 1;
    serverSyncState.telemetryLogs.unshift({
      id: `tel-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: `Field Inspection Squad Dispatched (${payload?.squadId || 'UP-VIG-12'})`,
      description: `Target: ${payload?.targetName || 'Jagriti Sansthan'}. Warrant Clause: Section 12-B unannounced entry.`,
      type: 'dispatch',
      tags: ['DISPATCHED', 'BODYCAM ON']
    });
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  if (action === 'OFFLINE_QUEUE_SYNC') {
    const queue = payload?.queue || [];
    serverSyncState.telemetryLogs.unshift({
      id: `tel-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      title: `Offline Encrypted Audit Packet Reconciled (${queue.length} items)`,
      description: 'Offline-recorded field inspections from mobile squad reconciled with central cryptographic registry.',
      type: 'geofence',
      tags: ['SQLCIPHER SYNC', 'SHA-256 MATCH']
    });
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  if (action === 'RESET_DEFAULT') {
    serverSyncState.isTranche3Frozen = false;
    serverSyncState.rollCallActive = false;
    serverSyncState.showCauseIssued = false;
    serverSyncState.activeHoldsTotalCr = 42.8;
    serverSyncState.frozenTranchesCount = 19;
    if (serverSyncState.institutionsStatus['pragati-shiksha']) {
      serverSyncState.institutionsStatus['pragati-shiksha'].isFrozen = false;
    }
    broadcastStateUpdate();
    return res.json({ success: true, state: serverSyncState });
  }

  return res.json({ success: true, state: serverSyncState });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DoSJE Surveillance Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
