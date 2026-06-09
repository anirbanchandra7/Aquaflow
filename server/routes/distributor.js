// Distributor (Admin) routes — manage own customers, drivers and orders.
// Mounted at /api/distributor, restricted to the admin role.
// All queries must be scoped to req.user.distributor_id (tenant isolation).

import { Router } from 'express';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken, requireRole(ROLES.ADMIN));

// TODO: implement in the next phase
// GET/POST/PATCH /customers         → manage own customers
// GET/POST/PATCH /drivers           → manage own drivers
// GET/POST/PATCH /orders            → create and assign orders
// POST           /support-tickets   → raise a ticket to super admin

router.get('/health', (req, res) =>
  res.json({ scope: 'distributor', distributor_id: req.user.distributor_id, ok: true })
);

export default router;
