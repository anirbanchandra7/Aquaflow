// Super Admin routes — manage distributors and support tickets.
// Mounted at /api/admin, restricted to the super_admin role.

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { verifyToken, requireRole, ROLES } from '../middleware/auth.js';
import { getAll, findById, findWhere, insert, updateById, nowIso } from '../sheets/db.js';
import { ENUMS } from '../sheets/schema.js';

const router = Router();
router.use(verifyToken, requireRole(ROLES.SUPER_ADMIN));

// Readable temp passwords: no ambiguous chars (0/O, 1/l/I).
const tempPassword = customAlphabet('23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ', 10);

function countBy(records, key) {
  const counts = {};
  for (const r of records) counts[r[key]] = (counts[r[key]] || 0) + 1;
  return counts;
}

function isThisMonth(isoDate) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// GET /api/admin/stats — platform-wide counts for the dashboard cards.
router.get('/stats', async (req, res, next) => {
  try {
    const [distributors, customers, drivers, tickets] = await Promise.all([
      getAll('Distributors'),
      getAll('Customers'),
      getAll('Drivers'),
      getAll('SupportTickets'),
    ]);
    res.json({
      total_distributors: distributors.length,
      total_customers: customers.length,
      total_drivers: drivers.length,
      open_tickets: tickets.filter((t) => t.status === 'open').length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/distributors — all distributors with customer/driver counts.
router.get('/distributors', async (req, res, next) => {
  try {
    const [distributors, customers, drivers] = await Promise.all([
      getAll('Distributors'),
      getAll('Customers'),
      getAll('Drivers'),
    ]);
    const customerCounts = countBy(customers, 'distributor_id');
    const driverCounts = countBy(drivers, 'distributor_id');
    res.json({
      distributors: distributors.map((d) => ({
        ...d,
        customer_count: customerCounts[d.id] || 0,
        driver_count: driverCounts[d.id] || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/distributors — onboard a distributor and create its admin
// account. Returns the temp password ONCE; only the bcrypt hash is stored.
router.post('/distributors', async (req, res, next) => {
  try {
    const {
      company_name,
      contact_email,
      contact_phone,
      trade_license,
      registration_doc_url,
      emirate,
      status,
    } = req.body || {};

    if (!company_name || !contact_email || !contact_phone || !trade_license || !emirate) {
      return res.status(400).json({
        error: 'company_name, contact_email, contact_phone, trade_license and emirate are required',
      });
    }
    if (!ENUMS.emirates.includes(emirate)) {
      return res.status(400).json({ error: `emirate must be one of: ${ENUMS.emirates.join(', ')}` });
    }

    const [existing] = await findWhere('Admins', { email: contact_email });
    if (existing) {
      return res.status(409).json({ error: 'An admin account with this email already exists' });
    }

    const distributor = await insert('Distributors', {
      company_name,
      trade_license,
      registration_doc_url: registration_doc_url || '',
      contact_email,
      contact_phone,
      emirate,
      status: status === 'inactive' ? 'inactive' : 'active',
    });

    const password = tempPassword();
    const admin = await insert('Admins', {
      distributor_id: distributor.id,
      name: company_name,
      email: contact_email,
      password_hash: await bcrypt.hash(password, 10),
      status: 'active',
    });

    res.status(201).json({
      distributor,
      admin: { id: admin.id, email: admin.email, temp_password: password },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/distributors/:id — full detail for the distributor page.
router.get('/distributors/:id', async (req, res, next) => {
  try {
    const distributor = await findById('Distributors', req.params.id);
    if (!distributor) return res.status(404).json({ error: 'Distributor not found' });

    const [customers, drivers, orders, tickets] = await Promise.all([
      findWhere('Customers', { distributor_id: distributor.id }),
      findWhere('Drivers', { distributor_id: distributor.id }),
      findWhere('Orders', { distributor_id: distributor.id }),
      findWhere('SupportTickets', { distributor_id: distributor.id }),
    ]);

    res.json({
      distributor,
      stats: {
        total_customers: customers.length,
        active_drivers: drivers.filter((d) => d.status === 'active').length,
        orders_this_month: orders.filter((o) => isThisMonth(o.created_at)).length,
      },
      customers,
      drivers: drivers.map(({ password_hash, ...rest }) => rest),
      tickets,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/distributors/:id — update distributor fields / status.
router.patch('/distributors/:id', async (req, res, next) => {
  try {
    const allowed = [
      'company_name',
      'trade_license',
      'registration_doc_url',
      'contact_email',
      'contact_phone',
      'emirate',
      'status',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.status && !['active', 'inactive'].includes(updates.status)) {
      return res.status(400).json({ error: 'status must be active or inactive' });
    }
    if (updates.emirate && !ENUMS.emirates.includes(updates.emirate)) {
      return res.status(400).json({ error: 'Invalid emirate' });
    }
    const updated = await updateById('Distributors', req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Distributor not found' });
    res.json({ distributor: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/support-tickets — all tickets, newest first, with company names.
router.get('/support-tickets', async (req, res, next) => {
  try {
    const [tickets, distributors] = await Promise.all([
      getAll('SupportTickets'),
      getAll('Distributors'),
    ]);
    const names = Object.fromEntries(distributors.map((d) => [d.id, d.company_name]));
    const enriched = tickets
      .map((t) => ({ ...t, distributor_name: names[t.distributor_id] || 'Unknown' }))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    res.json({ tickets: enriched });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/support-tickets/:id — update status / resolve with note.
router.patch('/support-tickets/:id', async (req, res, next) => {
  try {
    const { status, resolution_note } = req.body || {};
    if (!ENUMS.ticketStatus.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ENUMS.ticketStatus.join(', ')}` });
    }
    const updates = { status };
    if (resolution_note !== undefined) updates.resolution_note = resolution_note;
    if (status === 'resolved') updates.resolved_at = nowIso();
    const updated = await updateById('SupportTickets', req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ ticket: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
