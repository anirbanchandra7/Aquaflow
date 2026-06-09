import jwt from 'jsonwebtoken';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', // distributor admin
  DRIVER: 'driver',
};

/** Verifies the Bearer JWT and attaches the payload to req.user. */
export function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }
  try {
    // payload: { sub, role, distributor_id? }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Restricts a route to one or more roles. Use after verifyToken. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    return next();
  };
}

export function signToken(payload, options = {}) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h', ...options });
}
