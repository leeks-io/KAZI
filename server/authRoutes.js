const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet, dbAll } = require('../database/db');

const router = express.Router();

// JWT secret — in production use a proper env variable
const JWT_SECRET = process.env.JWT_SECRET || 'kazi_jwt_secret_africa_2024';
const TOKEN_EXPIRY = '7d';

// ─── Helper: Generate JWT Token ──────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// ─── Helper: Auth Middleware ──────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Validation
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ success: false, error: 'First name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const validRoles = ['worker', 'employer'];
    const userRole = validRoles.includes(role) ? role : 'worker';

    // Check if email already exists
    const existing = await dbGet('SELECT id FROM web_users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists. Please sign in.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await dbRun(
      `INSERT INTO web_users (first_name, last_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        firstName.trim(),
        (lastName || '').trim(),
        email.trim().toLowerCase(),
        (phone || '').trim(),
        passwordHash,
        userRole
      ]
    );

    // Fetch the newly created user
    const newUser = await dbGet('SELECT * FROM web_users WHERE id = ?', [result.id]);

    // Generate token
    const token = generateToken(newUser);

    console.log(`✅ New user registered: ${newUser.email} (${newUser.role})`);

    res.status(201).json({
      success: true,
      message: `Welcome to Kazi, ${newUser.first_name}!`,
      user: {
        id: newUser.id,
        name: `${newUser.first_name} ${newUser.last_name}`.trim(),
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        telegramId: newUser.telegram_id,
        isVerified: !!newUser.is_verified,
        createdAt: newUser.created_at
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ─── POST /api/auth/signin ───────────────────────────────────────────────────
router.post('/signin', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    // Find user by email
    const user = await dbGet('SELECT * FROM web_users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with this email. Please sign up first.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    // Update last login time and role if changed
    const validRoles = ['worker', 'employer'];
    const loginRole = validRoles.includes(role) ? role : user.role;
    await dbRun(
      'UPDATE web_users SET last_login = CURRENT_TIMESTAMP, role = ? WHERE id = ?',
      [loginRole, user.id]
    );

    // Generate token
    const token = generateToken({ ...user, role: loginRole });

    console.log(`✅ User signed in: ${user.email} (${loginRole})`);

    res.json({
      success: true,
      message: `Welcome back, ${user.first_name}!`,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: loginRole,
        telegramId: user.telegram_id,
        isVerified: !!user.is_verified,
        createdAt: user.created_at
      },
      token
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM web_users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        telegramId: user.telegram_id,
        isVerified: !!user.is_verified,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ─── POST /api/auth/link-telegram ────────────────────────────────────────────
// Allows a web user to link their Telegram account
router.post('/link-telegram', authMiddleware, async (req, res) => {
  try {
    const { telegramId } = req.body;
    if (!telegramId) {
      return res.status(400).json({ success: false, error: 'Telegram ID is required.' });
    }

    await dbRun(
      'UPDATE web_users SET telegram_id = ? WHERE id = ?',
      [String(telegramId), req.user.id]
    );

    // Also update the telegram_users table if the user exists there
    const tgUser = await dbGet('SELECT * FROM telegram_users WHERE telegram_id = ?', [String(telegramId)]);
    if (tgUser) {
      await dbRun(
        'UPDATE telegram_users SET email = ? WHERE telegram_id = ?',
        [req.user.email, String(telegramId)]
      );
    }

    res.json({ success: true, message: 'Telegram account linked successfully!' });
  } catch (err) {
    console.error('Link Telegram error:', err);
    res.status(500).json({ success: false, error: 'Failed to link Telegram account.' });
  }
});

// ─── GET /api/auth/telegram-login/:telegramId ────────────────────────────────
// Check if a Telegram user has a linked web account and auto-login
router.get('/telegram-login/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;

    // First check web_users for linked telegram
    const webUser = await dbGet('SELECT * FROM web_users WHERE telegram_id = ?', [String(telegramId)]);
    if (webUser) {
      const token = generateToken(webUser);
      return res.json({
        success: true,
        found: true,
        user: {
          id: webUser.id,
          name: `${webUser.first_name} ${webUser.last_name}`.trim(),
          firstName: webUser.first_name,
          lastName: webUser.last_name,
          email: webUser.email,
          phone: webUser.phone,
          role: webUser.role,
          telegramId: webUser.telegram_id,
          isVerified: !!webUser.is_verified
        },
        token
      });
    }

    // Check telegram_users table for basic info
    const tgUser = await dbGet('SELECT * FROM telegram_users WHERE telegram_id = ?', [String(telegramId)]);
    if (tgUser) {
      return res.json({
        success: true,
        found: true,
        needsRegistration: true,
        telegramProfile: {
          name: tgUser.name,
          phone: tgUser.phone,
          email: tgUser.email,
          role: tgUser.role
        }
      });
    }

    res.json({ success: true, found: false });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = { authRouter: router, authMiddleware };
