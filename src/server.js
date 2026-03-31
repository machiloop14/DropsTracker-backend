import express from "express";
import { prisma } from "./db.js";
import authRoute from "./routes/authRoute.js";
import dropsRoute from "./routes/dropsRoute.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 8083;

dotenv.config();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoute);
app.use("/drops", dropsRoute);

app.listen(PORT, "0.0.0.0", () => console.log("hello"));
