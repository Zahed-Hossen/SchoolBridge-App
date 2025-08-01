const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userDoc) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Authentication required.',
      });
    }

    if (!roles.includes(req.userDoc.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

export default authorize;
