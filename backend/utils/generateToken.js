import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },          // token contains both id + role
    process.env.JWT_SECRET,
    { expiresIn: "7d" }    // valid for 7 days
  );
};

export default generateToken;
