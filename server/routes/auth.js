import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findWhere } from '../sheets/db.js';
import {
  signToken,
  verifyToken,
  ROLES,
  TOKEN_COOKIE,
  tokenCookieOptions,
} from '../middleware/auth.js';

const router = Router();

const INVALID = { error: 'Invalid email or password' };

/**
 * Resolve credentials to a user across the three account types:
 * super admin (env credentials), then Admins sheet, then Drivers sheet.
 * Returns { userId, role, distributorId, name } or null.
 */
async function authenticate(email, password) {
  if (
    process.env.SUPER_ADMIN_EMAIL &&
    email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase()
  ) {
    if (password === process.env.SUPER_ADMIN_PASSWORD) {
      return {
        userId: 'super_admin',
        role: ROLES.SUPER_ADMIN,
        distributorId: null,
        name: 'Super Admin',
      };
    }
    return null;
  }

  for (const [sheet, role] of [
    ['Admins', ROLES.ADMIN],
    ['Drivers', ROLES.DRIVER],
  ]) {
    const [user] = await findWhere(sheet, { email });
    if (!user) continue;
    if (user.status === 'inactive') return null;
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;
    return {
      userId: user.id,
      role,
      distributorId: user.distributor_id,
      name: user.name,
    };
  }
  return null;
}

// POST /api/auth/login — body: { email, password }
// Sets the JWT in an httpOnly cookie and returns the user profile.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await authenticate(String(email).trim(), String(password));
    if (!user) return res.status(401).json(INVALID);

    const token = signToken({
      userId: user.userId,
      role: user.role,
      distributorId: user.distributorId,
    });
    res.cookie(TOKEN_COOKIE, token, tokenCookieOptions());
    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — returns the current user from the token cookie.
router.get('/me', verifyToken, (req, res) => {
  const { userId, role, distributorId } = req.user;
  res.json({ user: { userId, role, distributorId } });
});

// POST /api/auth/logout — clears the auth cookie.
router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_COOKIE, { ...tokenCookieOptions(), maxAge: undefined });
  res.json({ ok: true });
});

export default router;
