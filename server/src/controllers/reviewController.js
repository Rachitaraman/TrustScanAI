import { analyzeReviews } from "../services/mlService.js";

export async function analyzeReviewHandler(req, res, next){
  try {
    const { reviews } = req.body;
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: "Field 'reviews' must be a non-empty array" });
    }
    const data = await analyzeReviews(reviews);
    res.json(data);
  } catch (err) { next(err); }
}
