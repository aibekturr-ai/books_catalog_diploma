export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      return next(err);
    }
    if (!roles.includes(req.user.role)) {
      const err = new Error("Forbidden");
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
}
