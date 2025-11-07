import jwt from "jsonwebtoken";
export const generateJwt = (
  payload,
  secretKey = process.env.JWT_SECRET_KEY,
  expiresIn = "1h"
) => {
  const token = jwt.sign(payload, secretKey, {
    expiresIn,
  });
  return token;
};
