import express from "express";
import { analyzeReviewHandler } from "../controllers/reviewController.js";
const router = express.Router();
router.post("/analyze", analyzeReviewHandler);
export default router;
