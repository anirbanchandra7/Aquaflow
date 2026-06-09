// Super Admin routes — manage distributors and their admin accounts.
// Mounted at /api/admin, restricted to the super_admin role.

import { Router } from 'express';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireRole(ROLES.SUPER_ADMIN));

// TODO: implement in the next phase
// GET    /distributors          → list all distributors
// POST   /distributors          → onboard a new distributor (+ admin account)
// PATCH  /distributors/:id      → update distributor / change status
// GET    /support-tickets       → list all support tickets
// PATCH  /support-tickets/:id   → update ticket status

router.get('/health', (req, res) => res.json({ scope: 'super_admin', ok: true }));

export default router;
