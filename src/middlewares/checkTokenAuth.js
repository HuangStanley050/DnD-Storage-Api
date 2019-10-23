export default {
  checkAuth: async (req, res, next) => {
    const { token } = req.headers.authorization.split(" ")[1];
    const auth = req.app.get("auth");
    if (!req.headers.authorization) {
      const error = new Error("No auth in header");
      error.statusCode = 401;
      return next(error);
    }

    try {
      await auth.verifyIdToken(token);
    } catch (err) {
      const error = new Error("Unable to verify token");
      error.statusCode = 500;
      return next(error);
    }
    return next();
  }
};
