import express from "express";
import { handleLogin, handleRefresh } from "../controllers/authController.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", handleLogin);

router.post("/refresh", handleRefresh);

router.post("/protected", isAuth, (req, res) => {
  res.status(200).json({ message: "Protected route working" });
});

export default router;
