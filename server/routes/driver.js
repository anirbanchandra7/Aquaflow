// Driver routes — receive and complete delivery tasks.
// Mounted at /api/driver, restricted to the driver role.

import { Router } from 'express';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireRole(ROLES.DRIVER));

// TODO: implement in the next phase
// GET   /orders               → list orders assigned to this driver
// PATCH /orders/:id/status    → in_transit / delivered
// PATCH /live                 → toggle is_live availability flag

router.get('/health', (req, res) => res.json({ scope: 'driver', ok: true }));

export default router;
