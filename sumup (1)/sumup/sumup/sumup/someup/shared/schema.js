import { pgTable, serial, varchar, text, decimal, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  upiId: varchar('upi_id', { length: 100 }),
  totalSavings: decimal('total_savings', { precision: 10, scale: 2 }).default('0.00'),
  todayRoundUp: decimal('today_round_up', { precision: 10, scale: 2 }).default('0.00'),
  currentStreak: integer('current_streak').default(0),
  memberSince: timestamp('member_since').defaultNow(),
  profilePicture: text('profile_picture'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // 'payment', 'round-up', 'auto-save', 'challenge'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal('original_amount', { precision: 10, scale: 2 }),
  roundUpAmount: decimal('round_up_amount', { precision: 10, scale: 2 }),
  payee: varchar('payee', { length: 255 }),
  upiId: varchar('upi_id', { length: 100 }),
  note: text('note'),
  status: varchar('status', { length: 20 }).default('completed'), // 'pending', 'completed', 'failed'
  createdAt: timestamp('created_at').defaultNow()
});

// Savings goals/challenges table
export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  targetAmount: decimal('target_amount', { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 10, scale: 2 }).default('0.00'),
  deadline: timestamp('deadline'),
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'completed', 'paused'
  category: varchar('category', { length: 100 }), // 'vacation', 'emergency', 'gadget', etc.
  isTemplate: boolean('is_template').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

// User badges/achievements table
export const userBadges = pgTable('user_badges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  badgeId: varchar('badge_id', { length: 100 }).notNull(),
  badgeName: varchar('badge_name', { length: 255 }).notNull(),
  badgeIcon: varchar('badge_icon', { length: 100 }),
  badgeColor: varchar('badge_color', { length: 50 }),
  earned: boolean('earned').default(false),
  earnedAt: timestamp('earned_at')
});

// Activity feed table
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  metadata: jsonb('metadata'), // For additional flexible data
  createdAt: timestamp('created_at').defaultNow()
});

// Friends/connections table for P2P leaderboard tracking
export const friendConnections = pgTable('friend_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  friendId: integer('friend_id').notNull().references(() => users.id),
  friendUpiId: varchar('friend_upi_id', { length: 100 }).notNull(),
  friendName: varchar('friend_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'blocked', 'pending'
  connectionSource: varchar('connection_source', { length: 50 }), // 'invite_link', 'qr_code', 'direct_add', 'transaction'
  totalTransactions: integer('total_transactions').default(0),
  totalVolume: decimal('total_volume', { precision: 12, scale: 2 }).default('0.00'),
  lastTransactionAt: timestamp('last_transaction_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// P2P Transaction tracking table for competitive leaderboard
export const p2pTransactions = pgTable('p2p_transactions', {
  id: serial('id').primaryKey(),
  fromUserId: integer('from_user_id').notNull().references(() => users.id),
  toUserId: integer('to_user_id').references(() => users.id), // Nullable for external UPI IDs
  toUpiId: varchar('to_upi_id', { length: 100 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(), // 'payment', 'request', 'split'
  note: text('note'),
  status: varchar('status', { length: 20 }).default('completed'),
  competitionPoints: integer('competition_points').default(1), // Points for leaderboard
  createdAt: timestamp('created_at').defaultNow()
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  challenges: many(challenges),
  badges: many(userBadges),
  activities: many(activities),
  friendConnections: many(friendConnections),
  sentP2PTransactions: many(p2pTransactions, { relationName: 'sentTransactions' }),
  receivedP2PTransactions: many(p2pTransactions, { relationName: 'receivedTransactions' })
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  })
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
  user: one(users, {
    fields: [challenges.userId],
    references: [users.id]
  })
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id]
  })
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  })
}));

export const friendConnectionsRelations = relations(friendConnections, ({ one }) => ({
  user: one(users, {
    fields: [friendConnections.userId],
    references: [users.id]
  }),
  friend: one(users, {
    fields: [friendConnections.friendId],
    references: [users.id]
  })
}));

export const p2pTransactionsRelations = relations(p2pTransactions, ({ one }) => ({
  fromUser: one(users, {
    fields: [p2pTransactions.fromUserId],
    references: [users.id],
    relationName: 'sentTransactions'
  }),
  toUser: one(users, {
    fields: [p2pTransactions.toUserId],
    references: [users.id],
    relationName: 'receivedTransactions'
  })
}));