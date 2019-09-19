export default {
  checkAuth: async (req, res, next) => {
    let token;
    const auth = req.app.get("auth");
    if (!req.headers.authorization) {
      const error = new Error("No auth in header");
      console.log("no token in header");
      error.statusCode = 401;
      return next(error);
    }
    token = req.headers.authorization.split(" ")[1];
    try {
      await auth.verifyIdToken(token);
    } catch (err) {
      const error = new Error("Unable to verify token");
      console.log("unable to verify token");
      error.statusCode = 500;
      return next(error);
    }
    next();
  }
};
