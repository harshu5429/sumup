import { users, transactions, challenges, activities, userBadges } from '../shared/schema.js';

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

// Database storage implementation (when database is available)
export class DatabaseStorage {
  constructor() {
    // This will be implemented when database connection is working
  }

  async getUser(id) {
    throw new Error('Database not available yet');
  }

  async getUserByEmail(email) {
    throw new Error('Database not available yet');
  }

  async createUser(user) {
    throw new Error('Database not available yet');
  }

  async updateUser(id, updates) {
    throw new Error('Database not available yet');
  }

  async createTransaction(transaction) {
    throw new Error('Database not available yet');
  }

  async getUserTransactions(userId, limit) {
    throw new Error('Database not available yet');
  }

  async getUserChallenges(userId) {
    throw new Error('Database not available yet');
  }

  async createChallenge(challenge) {
    throw new Error('Database not available yet');
  }

  async updateChallenge(id, updates) {
    throw new Error('Database not available yet');
  }

  async createActivity(activity) {
    throw new Error('Database not available yet');
  }

  async getUserActivities(userId, limit) {
    throw new Error('Database not available yet');
  }

  async getUserBadges(userId) {
    throw new Error('Database not available yet');
  }

  async updateUserBadge(userId, badgeId, earned) {
    throw new Error('Database not available yet');
  }
}

// Initialize storage (fallback to memory storage for now)
export const storage = new MemoryStorage();

console.log('Storage initialized with MemoryStorage (fallback mode)');