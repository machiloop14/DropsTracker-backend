import express from "express";
import { prisma } from "./db.js";
import authRoute from "./routes/authRoute.js";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const PORT = process.env.PORT || 8083;

dotenv.config();

// app.get("/add", async (req, res) => {
//   const user = await prisma.user.create({
//     data: {
//       email: "Hamidusodiq14@gmail.com",
//       name: "hamidu sodiq",
//     },
//   });

//   res.json(user);
// });
app.use(cors())
app.use(express.json());

app.use("/auth", authRoute);
app.listen(PORT, "0.0.0.0", () => console.log("hello"));
