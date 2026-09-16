import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('CVO'),
  officerId: text('officer_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Statutory Vigilance Actions (Tranche Freezes, Show Cause, Roll Calls)
export const statutoryActions = pgTable('statutory_actions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  actionType: text('action_type').notNull(),
  institutionId: text('institution_id'),
  institutionName: text('institution_name'),
  amountFrozenCr: text('amount_frozen_cr'),
  reason: text('reason'),
  dscHash: text('dsc_hash'),
  status: text('status').default('ENFORCED'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Google Meet Vigilance Hearings & Virtual Inquiries
export const meetHearings = pgTable('meet_hearings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  meetingSpaceName: text('meeting_space_name').notNull(), // e.g. spaces/ABC-XYZ
  meetingUri: text('meeting_uri').notNull(), // e.g. https://meet.google.com/xxx-yyyy-zzz
  institutionId: text('institution_id'),
  institutionName: text('institution_name'),
  inquiryType: text('inquiry_type').notNull(), // 'Statutory Show-Cause', 'Field Briefing', 'Biometric Audit'
  status: text('status').default('SCHEDULED'), // 'SCHEDULED', 'ACTIVE', 'CONCLUDED'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Central Audit & Telemetry Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  timestamp: text('timestamp').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  severity: text('severity').default('INFO'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  actions: many(statutoryActions),
  hearings: many(meetHearings),
  logs: many(auditLogs),
}));

export const statutoryActionsRelations = relations(statutoryActions, ({ one }) => ({
  officer: one(users, {
    fields: [statutoryActions.userId],
    references: [users.id],
  }),
}));

export const meetHearingsRelations = relations(meetHearings, ({ one }) => ({
  officer: one(users, {
    fields: [meetHearings.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  officer: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
