import express from "express";
import { handleLogin, handleRefresh } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", handleLogin);

router.post("/refresh", handleRefresh);

export default router;
