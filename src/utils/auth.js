import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../db.js";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";
const REFRESH_TTL_DAYS = 7;

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

export const persistRefreshToken = async (refreshToken, user) => {
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
};
