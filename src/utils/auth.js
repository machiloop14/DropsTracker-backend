import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
