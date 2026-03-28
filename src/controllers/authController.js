import { prisma } from "../db.js";
import { OAuth2Client } from "google-auth-library";
import {
  generateAccessToken,
  generateRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
} from "../utils/auth.js";

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
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    //store refreshToken in db
    await persistRefreshToken(refreshToken, user);

    //store refreshToken in http-only Cookie
    setRefreshCookie(res, refreshToken);

    //return success response to frontend
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: { ...user, token: accessToken },
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
