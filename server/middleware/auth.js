import jwt from 'jsonwebtoken';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', // distributor admin
  DRIVER: 'driver',
};

export const TOKEN_COOKIE = 'aquaflow_token';

/**
 * Verifies the JWT and attaches the payload to req.user.
 * Token is read from the httpOnly cookie (primary) or a Bearer header
 * (fallback, useful for API clients and tests).
 * Payload shape: { userId, role, distributorId } — distributorId is null
 * for the super admin.
 */
export function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token =
    req.cookies?.[TOKEN_COOKIE] ||
    (header.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    res.clearCookie(TOKEN_COOKIE);
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

/** Cookie options for the auth token. Secure only in production so local HTTP works. */
export function tokenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000, // matches token expiry
    path: '/',
  };
}
