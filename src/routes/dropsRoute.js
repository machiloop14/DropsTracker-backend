import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { dropSchema } from "../validators/dropSchema.js";
import validateSchema from "../middlewares/validate.js";
import { handleAddAirdrop } from "../controllers/dropsController.js";

const router = express.Router();

router.use(isAuth);
router.post("/", validateSchema(dropSchema), handleAddAirdrop);

export default router;
