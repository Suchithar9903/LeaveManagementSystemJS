const checkRole = (...roles) => {
    return (req, res, next) => {
      // Check if the user object exists (it should be set by the `auth` middleware)
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Access denied: insufficient permissions" });
      }
      next(); // If the user has one of the allowed roles, proceed to the next middleware or route handler
    };
  };
  
  module.exports = { checkRole };
  