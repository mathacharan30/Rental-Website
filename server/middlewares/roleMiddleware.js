/**
 * Middleware factory: allowRoles
 * Usage: router.get('/...', verifyFirebaseToken, attachUserRole, allowRoles(['super_admin']), handler)
 *
 * @param {string[]} roles - Array of allowed role strings
 */
const allowRoles = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required role(s): ${roles.join(', ')}`,
    });
  }
  next();
};

module.exports = { allowRoles };
