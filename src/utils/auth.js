import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../db.js";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";
const REFRESH_TTL_DAYS = 7;

export const generateAccessToken = (id) => {
  return jwt.sign({ userId: id }, process.env.ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ userId: id }, process.env.REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const persistRefreshToken = async (refreshToken, id) => {
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: id,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });

  console.log("cookie stored");
};

export const rotateRefreshToken = async (res, userId) => {
  // new access token >> new refresh token >> delete previous tokens >> persist new refresh token >> set refresh cookie >> return access token
  const newAccessToken = generateAccessToken(userId);
  const newRefeshToken = generateRefreshToken(userId);

  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  await persistRefreshToken(newRefeshToken, userId);

  // console.log("new refresh: " + newRefeshToken);
  // console.log("new access: " + newAccessToken);

  setRefreshCookie(res, newRefeshToken);

  return { newAccessToken, newRefeshToken };
};
