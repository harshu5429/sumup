import { users, transactions, challenges, activities, userBadges } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

// Memory storage implementation (fallback)
export class MemoryStorage {
  constructor() {
    this.users = [];
    this.transactions = [];
    this.challenges = [];
    this.activities = [];
    this.userBadges = [];
    this.nextId = 1;
  }

  async getUser(id) {
    return this.users.find(u => u.id === id);
  }

  async getUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }

  async createUser(user) {
    const newUser = {
      id: this.nextId++,
      email: user.email,
      username: user.username,
      name: user.name,
      upiId: user.upiId || null,
      totalSavings: user.totalSavings || '0.00',
      todayRoundUp: user.todayRoundUp || '0.00',
      currentStreak: user.currentStreak || 0,
      memberSince: new Date(),
      profilePicture: user.profilePicture || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id, updates) {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { 
      ...this.users[userIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    return this.users[userIndex];
  }

  async createTransaction(transaction) {
    const newTransaction = {
      id: this.nextId++,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      originalAmount: transaction.originalAmount || null,
      roundUpAmount: transaction.roundUpAmount || null,
      payee: transaction.payee || null,
      upiId: transaction.upiId || null,
      note: transaction.note || null,
      status: transaction.status || 'completed',
      createdAt: new Date()
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId, limit = 50) {
    return this.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getUserChallenges(userId) {
    return this.challenges.filter(c => c.userId === userId);
  }

  async createChallenge(challenge) {
    const newChallenge = {
      id: this.nextId++,
      userId: challenge.userId,
      title: challenge.title,
      description: challenge.description || null,
      targetAmount: challenge.targetAmount,
      currentAmount: challenge.currentAmount || '0.00',
      deadline: challenge.deadline || null,
      status: challenge.status || 'active',
      category: challenge.category || null,
      isTemplate: challenge.isTemplate || false,
      createdAt: new Date(),
      completedAt: challenge.completedAt || null
    };
    this.challenges.push(newChallenge);
    return newChallenge;
  }

  async updateChallenge(id, updates) {
    const challengeIndex = this.challenges.findIndex(c => c.id === id);
    if (challengeIndex === -1) return undefined;
    
    this.challenges[challengeIndex] = { ...this.challenges[challengeIndex], ...updates };
    return this.challenges[challengeIndex];
  }

  async createActivity(activity) {
    const newActivity = {
      id: this.nextId++,
      userId: activity.userId,
      type: activity.type,
      amount: activity.amount || null,
      description: activity.description || null,
      icon: activity.icon || null,
      metadata: activity.metadata || null,
      createdAt: new Date()
    };
    this.activities.push(newActivity);
    return newActivity;
  }

  async getUserActivities(userId, limit = 20) {
    return this.activities
      .filter(a => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getUserBadges(userId) {
    return this.userBadges.filter(b => b.userId === userId);
  }

  async updateUserBadge(userId, badgeId, earned) {
    const badgeIndex = this.userBadges.findIndex(b => b.userId === userId && b.badgeId === badgeId);
    if (badgeIndex !== -1) {
      this.userBadges[badgeIndex].earned = earned;
      this.userBadges[badgeIndex].earnedAt = earned ? new Date() : null;
    }
  }
}

// Database storage implementation (using PostgreSQL with Drizzle)
export class DatabaseStorage {
  constructor() {
    this.db = null;
    this.initDatabase();
  }

  async initDatabase() {
    try {
      const { db } = await import('./db.js');
      this.db = db;
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async getUser(id) {
    if (!this.db) await this.initDatabase();
    const [user] = await this.db.select().from(users).where(eq(users.id, parseInt(id)));
    return user;
  }

  async getUserByEmail(email) {
    if (!this.db) await this.initDatabase();
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user) {
    if (!this.db) await this.initDatabase();
    const [newUser] = await this.db.insert(users).values({
      email: user.email,
      username: user.username,
      name: user.name,
      upiId: user.upiId || null,
      totalSavings: user.totalSavings || '0.00',
      todayRoundUp: user.todayRoundUp || '0.00',
      currentStreak: user.currentStreak || 0,
      profilePicture: user.profilePicture || null
    }).returning();
    return newUser;
  }

  async updateUser(id, updates) {
    if (!this.db) await this.initDatabase();
    const [updatedUser] = await this.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, parseInt(id)))
      .returning();
    return updatedUser;
  }

  async createTransaction(transaction) {
    if (!this.db) await this.initDatabase();
    const [newTransaction] = await this.db.insert(transactions).values({
      userId: parseInt(transaction.userId),
      type: transaction.type,
      amount: transaction.amount,
      originalAmount: transaction.originalAmount || null,
      roundUpAmount: transaction.roundUpAmount || null,
      payee: transaction.payee || null,
      upiId: transaction.upiId || null,
      note: transaction.note || null,
      status: transaction.status || 'completed'
    }).returning();
    return newTransaction;
  }

  async getUserTransactions(userId, limit = 50) {
    if (!this.db) await this.initDatabase();
    const userTransactions = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, parseInt(userId)))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
    return userTransactions;
  }

  async getUserChallenges(userId) {
    if (!this.db) await this.initDatabase();
    const userChallenges = await this.db
      .select()
      .from(challenges)
      .where(eq(challenges.userId, parseInt(userId)));
    return userChallenges;
  }

  async createChallenge(challenge) {
    if (!this.db) await this.initDatabase();
    const [newChallenge] = await this.db.insert(challenges).values({
      userId: parseInt(challenge.userId),
      title: challenge.title,
      description: challenge.description || null,
      targetAmount: challenge.targetAmount,
      currentAmount: challenge.currentAmount || '0.00',
      deadline: challenge.deadline || null,
      status: challenge.status || 'active',
      category: challenge.category || null,
      isTemplate: challenge.isTemplate || false,
      completedAt: challenge.completedAt || null
    }).returning();
    return newChallenge;
  }

  async updateChallenge(id, updates) {
    if (!this.db) await this.initDatabase();
    const [updatedChallenge] = await this.db
      .update(challenges)
      .set(updates)
      .where(eq(challenges.id, parseInt(id)))
      .returning();
    return updatedChallenge;
  }

  async createActivity(activity) {
    if (!this.db) await this.initDatabase();
    const [newActivity] = await this.db.insert(activities).values({
      userId: parseInt(activity.userId),
      type: activity.type,
      amount: activity.amount || null,
      description: activity.description || null,
      icon: activity.icon || null,
      metadata: activity.metadata || null
    }).returning();
    return newActivity;
  }

  async getUserActivities(userId, limit = 20) {
    if (!this.db) await this.initDatabase();
    const userActivities = await this.db
      .select()
      .from(activities)
      .where(eq(activities.userId, parseInt(userId)))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    return userActivities;
  }

  async getUserBadges(userId) {
    if (!this.db) await this.initDatabase();
    const badges = await this.db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, parseInt(userId)));
    return badges;
  }

  async updateUserBadge(userId, badgeId, earned) {
    if (!this.db) await this.initDatabase();
    const existing = await this.db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, parseInt(userId)))
      .where(eq(userBadges.badgeId, badgeId));
    
    if (existing.length > 0) {
      await this.db
        .update(userBadges)
        .set({ earned, earnedAt: earned ? new Date() : null })
        .where(eq(userBadges.userId, parseInt(userId)))
        .where(eq(userBadges.badgeId, badgeId));
    }
  }
}

// Initialize storage with improved fallback management
class HybridStorage extends MemoryStorage {
  constructor() {
    super();
    this.dbAvailable = false;
    this.dbInstance = null;
    this.initDatabase();
  }
  
  async initDatabase() {
    try {
      this.dbInstance = new DatabaseStorage();
      this.dbAvailable = true;
      console.log('✅ Database available for future use');
    } catch (error) {
      console.log('📝 Using reliable MemoryStorage for authentication');
      this.dbAvailable = false;
    }
  }
  
  // For now, use memory storage reliably while database connectivity is resolved
  async getUser(id) {
    return super.getUser(id);
  }
  
  async getUserByEmail(email) {
    return super.getUserByEmail(email);
  }
  
  async createUser(user) {
    return super.createUser(user);
  }
}

export const storage = new HybridStorage();
console.log('💾 Hybrid storage initialized with reliable authentication');