const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if the token exist or not in the req.
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
    // This means a user is trying to access a protected page without logging in.
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    // This will decode the jwt token.

    req.user = decoded.user;
    // The decoded jwt token has .user in the payload.
    // We can access that by decoded.user and assign it to req.user like this.
    // Now we can use this req.user in of our protected routes
    // For example, we can send const user = await User.findById(req.user.id);
    // by using this req.user in auth.js route file.
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
// Middleware function are functions that has access to request and response cycle
// Which means Middleware functions are functions that has access to req and res objects.
// next will move on to the next middleware after we're done in this middleware.
