
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =============================
        AUTHENTICATION
============================= */

export const protect = async (req, res, next) => {

  try {

    let token;

    /* GET TOKEN FROM HEADER */

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided. Access denied."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    /* VERIFY TOKEN */

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Invalid token"
      });
    }

    /* FETCH USER */

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found for this token"
      });
    }

    req.user = user;

    next();

  } catch (error) {

    console.error("AUTH ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again."
      });
    }

    return res.status(401).json({
      message: "Invalid authentication token"
    });

  }

};



/* =============================
      ROLE AUTHORIZATION
============================= */

export const authorize = (...roles) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied for your role"
      });
    }

    next();

  };

};

