import express from "express";
import { prisma } from "./db.js";

const app = express();
const PORT = process.env.PORT || 8083;

app.get("/add", async (req, res) => {
  const user = await prisma.user.create({
    data: {
      email: "Hamidusodiq14@gmail.com",
      name: "hamidu sodiq",
    },
  });

  res.json(user);
});

app.listen(PORT, () => console.log("hello"));
