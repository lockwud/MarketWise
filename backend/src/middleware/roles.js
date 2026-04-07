function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userRole = req.user.role; // stored as uppercase in JWT e.g. "BUYER"
    const allowed = roles.map((r) => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

module.exports = { requireRole };
