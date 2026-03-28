import { prisma } from "../db.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const handleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    //check if user already exists in prisma. if yes, inform frontend
    const existingUser = await prisma.user.findUnique({
      where: {
        googleId: payload.sub,
      },
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "user already exists",
        data: existingUser,
      });
    }

    //if no, add user to database

    const newUser = await prisma.user.create({
      data: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      },
    });

    //return success response to frontend
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: newUser,
    });
    // res.json({payload})

    console.log(idToken);
    console.log("google login SUCCESSFUL");
  } catch (error) {
    console.error("Google auth error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
