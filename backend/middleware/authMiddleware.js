import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Check if the token was sent in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract the token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database and attach it to the request (excluding the password)
      req.user = await User.findById(decoded.id).select("-password");

      // Move on to the next function (the controller)
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res.status(401).json({ message: "Not authorized, token failed or expired." });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided." });
  }
};