import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findWhere } from '../sheets/db.js';
import { signToken, ROLES } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
// Body: { email, password, role: 'super_admin' | 'admin' | 'driver' }
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password and role are required' });
    }

    if (role === ROLES.SUPER_ADMIN) {
      // Super admin credentials come from env, not from the spreadsheet.
      if (
        email === process.env.SUPER_ADMIN_EMAIL &&
        password === process.env.SUPER_ADMIN_PASSWORD
      ) {
        const token = signToken({ sub: 'super_admin', role: ROLES.SUPER_ADMIN });
        return res.json({ token, role: ROLES.SUPER_ADMIN });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sheet = role === ROLES.ADMIN ? 'Admins' : role === ROLES.DRIVER ? 'Drivers' : null;
    if (!sheet) return res.status(400).json({ error: 'Invalid role' });

    const [user] = await findWhere(sheet, { email });
    if (!user || user.status === 'inactive') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ sub: user.id, role, distributor_id: user.distributor_id });
    return res.json({ token, role, distributor_id: user.distributor_id, name: user.name });
  } catch (err) {
    next(err);
  }
});

export default router;
