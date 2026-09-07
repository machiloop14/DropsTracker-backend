import { prisma } from "../db.js";
import { OAuth2Client } from "google-auth-library";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  persistRefreshToken,
  rotateRefreshToken,
  setRefreshCookie,
} from "../utils/auth.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const handleLogin = async (req, res) => {
  try {
    //verify googleId token
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    //check if user already exists in prisma.
    let user = await prisma.user.findUnique({
      where: {
        googleId: payload.sub,
      },
    });

    //if no, add user to database
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          avatar: payload.picture,
        },
      });
    }

    // JWT AUTHENTICATION FLOW
    //generate access and refresh tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    //store refreshToken in db
    await persistRefreshToken(refreshToken, user.id);

    //store refreshToken in http-only Cookie
    // setRefreshCookie(res, refreshToken);

    //return success response to frontend
    res.status(200).json({
      success: true,
      message: "user logged in successfully",
      data: { ...user, accessToken, refreshToken },
    });

    console.log("google login SUCCESSFUL");
  } catch (error) {
    console.error("Google auth error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const handleRefresh = async (req, res) => {
  // const token = req.cookies.refreshToken;
  const { token } = req.body;
  console.log(token);

  // console.log(req.cookies);

  //if no token in body params, send a 401 (unauthorized) code
  if (!token)
    return res.status(401).json({ success: false, message: "No token passed" });

  //if exists, verify the token
  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (error) {
    return res
      .status(401)
      .json({ sucess: false, message: "Invalid or expired refresh token " });
  }

  //find token in db
  const tokenHash = hashToken(token);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  //if token does not exist in db, return error
  if (!storedToken)
    return res
      .status(401)
      .json({ success: false, message: "Token does not exist in DB" });

  //if token exists in db, but has expired, return error
  if (storedToken.expiresAt < new Date())
    return res.status(401).json({ sucess: false, message: "Token is expired" });

  // generate new access token >> generate new refresh token >> persist refresh token >> set refresh cookie >> return access token
  const result = await rotateRefreshToken(res, storedToken.userId);

  // console.log("cookies token: " + token);

  return res.json({
    success: true,
    message: "token refresh successful",
    data: {
      userId: storedToken.userId,
      newAccessToken: result.newAccessToken,
      newRefreshToken: result.newRefeshToken,
    },
  });
};

export const handleFetchUser = async (req, res) => {
  try {
    console.log("/me route reached");
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. return user
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
