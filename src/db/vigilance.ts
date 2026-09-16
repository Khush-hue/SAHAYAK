import { db } from './index.ts';
import { statutoryActions, meetHearings, auditLogs } from './schema.ts';
import { desc, eq } from 'drizzle-orm';

export async function recordStatutoryAction(data: {
  userId?: number;
  actionType: string;
  institutionId?: string;
  institutionName?: string;
  amountFrozenCr?: string;
  reason?: string;
  dscHash?: string;
}) {
  try {
    const result = await db.insert(statutoryActions)
      .values({
        userId: data.userId,
        actionType: data.actionType,
        institutionId: data.institutionId,
        institutionName: data.institutionName,
        amountFrozenCr: data.amountFrozenCr,
        reason: data.reason,
        dscHash: data.dscHash || `SHA256-${Date.now()}`,
        status: 'ENFORCED',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to record statutory action:', error);
    throw new Error('Database statutory action record failed.', { cause: error });
  }
}

export async function getStatutoryActions(limitCount = 20) {
  try {
    return await db.select().from(statutoryActions).orderBy(desc(statutoryActions.createdAt)).limit(limitCount);
  } catch (error) {
    console.error('Failed to query statutory actions:', error);
    throw new Error('Database query for statutory actions failed.', { cause: error });
  }
}

export async function createMeetHearing(data: {
  userId?: number;
  title: string;
  meetingSpaceName: string;
  meetingUri: string;
  institutionId?: string;
  institutionName?: string;
  inquiryType: string;
  notes?: string;
}) {
  try {
    const result = await db.insert(meetHearings)
      .values({
        userId: data.userId,
        title: data.title,
        meetingSpaceName: data.meetingSpaceName,
        meetingUri: data.meetingUri,
        institutionId: data.institutionId,
        institutionName: data.institutionName,
        inquiryType: data.inquiryType,
        status: 'SCHEDULED',
        notes: data.notes || '',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to save Google Meet hearing to Cloud SQL:', error);
    throw new Error('Database meet hearing creation failed.', { cause: error });
  }
}

export async function getMeetHearings() {
  try {
    return await db.select().from(meetHearings).orderBy(desc(meetHearings.createdAt));
  } catch (error) {
    console.error('Failed to query meet hearings:', error);
    throw new Error('Database query for meet hearings failed.', { cause: error });
  }
}

export async function updateMeetHearingStatus(id: number, status: 'SCHEDULED' | 'ACTIVE' | 'CONCLUDED') {
  try {
    const result = await db.update(meetHearings)
      .set({ status })
      .where(eq(meetHearings.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to update meet hearing status:', error);
    throw new Error('Database meet hearing status update failed.', { cause: error });
  }
}
