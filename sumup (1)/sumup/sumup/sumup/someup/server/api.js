import { storage } from './storage.js';

// API endpoints for the SaveUp app
export const handleAPI = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Parse request body for POST/PUT requests
    let body = null;
    if (method === 'POST' || method === 'PUT') {
      body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (err) {
            reject(err);
          }
        });
        req.on('error', reject);
      });
    }

    // Route handlers
    if (path === '/api/users' && method === 'POST') {
      // Validate required fields
      if (!body.email || !body.username || !body.name) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email, username, and name are required' }));
        return;
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(body.email);
      if (existingUser) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User with this email already exists' }));
        return;
      }
      
      const user = await storage.createUser(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        totalSavings: user.totalSavings,
        currentStreak: user.currentStreak,
        memberSince: user.memberSince
      }));
    } 
    else if (path === '/api/users/login' && method === 'POST') {
      if (!body.email || !body.password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email and password are required' }));
        return;
      }
      
      const user = await storage.getUserByEmail(body.email);
      if (user) {
        // For demo purposes, accept any password for existing users
        // In production, you would verify the password hash here
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          totalSavings: user.totalSavings,
          currentStreak: user.currentStreak,
          memberSince: user.memberSince
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password' }));
      }
    }
    else if (path.match(/^\/api\/users\/(\d+)$/) && method === 'GET') {
      const userId = parseInt(path.match(/^\/api\/users\/(\d+)$/)[1]);
      const user = await storage.getUser(userId);
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
      }
    }
    else if (path.match(/^\/api\/users\/(\d+)$/) && method === 'PUT') {
      const userId = parseInt(path.match(/^\/api\/users\/(\d+)$/)[1]);
      const user = await storage.updateUser(userId, body);
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
      }
    }
    else if (path === '/api/transactions' && method === 'POST') {
      const transaction = await storage.createTransaction(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transaction));
    }
    else if (path.match(/^\/api\/users\/(\d+)\/transactions$/) && method === 'GET') {
      const userId = parseInt(path.match(/^\/api\/users\/(\d+)\/transactions$/)[1]);
      const limit = parseInt(url.searchParams.get('limit')) || 20;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(transactions));
    }
    else if (path === '/api/challenges' && method === 'POST') {
      const challenge = await storage.createChallenge(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(challenge));
    }
    else if (path.match(/^\/api\/users\/(\d+)\/challenges$/) && method === 'GET') {
      const userId = parseInt(path.match(/^\/api\/users\/(\d+)\/challenges$/)[1]);
      const challenges = await storage.getUserChallenges(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(challenges));
    }
    else if (path.match(/^\/api\/challenges\/(\d+)$/) && method === 'PUT') {
      const challengeId = parseInt(path.match(/^\/api\/challenges\/(\d+)$/)[1]);
      const challenge = await storage.updateChallenge(challengeId, body);
      if (challenge) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(challenge));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Challenge not found' }));
      }
    }
    else if (path === '/api/activities' && method === 'POST') {
      const activity = await storage.createActivity(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(activity));
    }
    else if (path.match(/^\/api\/users\/(\d+)\/activities$/) && method === 'GET') {
      const userId = parseInt(path.match(/^\/api\/users\/(\d+)\/activities$/)[1]);
      const limit = parseInt(url.searchParams.get('limit')) || 10;
      const activities = await storage.getUserActivities(userId, limit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(activities));
    }
    else if (path.match(/^\/api\/users\/(\d+)\/badges$/) && method === 'GET') {
      const userId = parseInt(path.match(/^\/api\/users\/(\d+)\/badges$/)[1]);
      const badges = await storage.getUserBadges(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(badges));
    }
    else if (path.match(/^\/api\/users\/(\d+)\/badges\/(\w+)$/) && method === 'PUT') {
      const userId = parseInt(path.match(/^\/api\/users\/(\d+)\/badges\/(\w+)$/)[1]);
      const badgeId = path.match(/^\/api\/users\/(\d+)\/badges\/(\w+)$/)[2];
      await storage.updateUserBadge(userId, badgeId, body.earned);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    }
    else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }

  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};