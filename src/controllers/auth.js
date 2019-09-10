import axios from "axios";
const authEndPoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.API_KEY}`;

export default {
  login: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const loginData = {
      email,
      password,
      returnSecureToken: true
    };
    let loginResult = null;
    try {
      loginResult = await axios.post(authEndPoint, loginData);
      res.json({ msg: "Login successful", token: loginResult.data.idToken });
    } catch (err) {
      const error = new Error("Login failed");
      error.statusCode = 401;
      return next(error);
    }
  }
};
