import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// route to analyze reviews via Flask
app.post("/api/reviews/analyze", async (req, res) => {
  try {
    const { reviews } = req.body; // array of strings
    const flaskUrl = process.env.FLASK_URL || "http://localhost:5001/analyze";

    const response = await axios.post(flaskUrl, { reviews });
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to analyze reviews" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
