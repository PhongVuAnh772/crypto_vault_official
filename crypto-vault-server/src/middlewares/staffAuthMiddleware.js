const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const STAFF_JWT_SECRET = process.env.STAFF_JWT_SECRET || process.env.JWT_SECRET || 'staff_secret_key_2026';

/**
 * Staff Authentication Middleware
 * Verifies JWT tokens issued to staff members (scanner app).
 * Attaches req.staff with staff data.
 */
const requireStaffAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, STAFF_JWT_SECRET);

    if (decoded.type !== 'staff') {
      return res.status(403).json({ success: false, error: 'Token is not a staff token' });
    }

    req.staff = {
      id: decoded.id,
      partnerId: decoded.partnerId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (err) {
    logger.warn(`[STAFF_AUTH] Invalid token: ${err.message}`);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

/**
 * Require specific staff role.
 * Must be used after requireStaffAuth.
 */
const requireStaffRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.staff || !allowedRoles.includes(req.staff.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient staff role' });
    }
    next();
  };
};

/**
 * Generate a staff JWT token.
 */
function generateStaffToken(staffData) {
  return jwt.sign(
    {
      id: staffData.id,
      partnerId: staffData.partner_id,
      email: staffData.email,
      name: staffData.name,
      role: staffData.role,
      type: 'staff'
    },
    STAFF_JWT_SECRET,
    { expiresIn: '12h' }
  );
}

module.exports = {
  requireStaffAuth,
  requireStaffRole,
  generateStaffToken,
  STAFF_JWT_SECRET
};
