import crypto from "crypto";

const generatePassword = () => {
  return crypto.randomBytes(4).toString("hex");
};

export default generatePassword;