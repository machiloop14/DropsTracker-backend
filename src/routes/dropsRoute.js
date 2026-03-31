import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { dropSchema } from "../validators/dropSchema.js";
import validateSchema from "../middlewares/validate.js";

const router = express.Router();

router.use(isAuth);
router.post("/", validateSchema(dropSchema), (req, res) => {
  console.log("validated data: " + req.validatedData.data);
  res.status(200).json({
    success: true,
    message: "drops route reached",
    data: req.validatedData,
  });
});

export default router;
