const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Attempt to retrieve the token from Authorization header, x-auth-token header, or query parameters
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.header("x-auth-token") ||
    req.query.token;

  // If no token is found, respond with an error
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach the user object from the decoded token to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" }); // Token validation failure
  }
};

module.exports = auth;
