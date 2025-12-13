import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import axios from "axios";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------- AWS SETUP ----------
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const upload = multer({ dest: "uploads/" });

// ---------- HEALTH ----------
app.get("/", (req, res) => {
  res.send("Review Guardian Server Running");
});

// ---------- LATEST SUMMARY ENDPOINT ----------
app.get("/api/summary/latest", async (req, res) => {
  try {
    const key = "latest_summary.json";

    const data = await s3.getObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }).promise();

    const summary = JSON.parse(data.Body.toString());
    return res.json({ ok: true, summary });
  } catch (err) {
    console.error("Summary fetch error:", err);
    return res.json({ ok: false, summary: null });
  }
});

// ---------- UPLOAD FILE ROUTE ----------
app.post("/api/uploads/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileContent = fs.readFileSync(req.file.path);

    // Upload file to S3
    const uploadRes = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Key: `uploads/${req.file.originalname}`,
      Body: fileContent,
      ContentType: req.file.mimetype,
    }).promise();

    // Send file to ML server for analysis
    const mlRes = await axios.post("http://localhost:5001/analyze-file", {
      s3_key: uploadRes.Key,
    });

    const summary = mlRes.data.summary;

    // SAVE SUMMARY TO S3 AS latest_summary.json
    await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Key: "latest_summary.json",
      Body: JSON.stringify(summary),
      ContentType: "application/json",
    }).promise();

    return res.json({
      message: "File uploaded & analyzed successfully",
      s3Key: uploadRes.Key,
      analysis: mlRes.data,
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

// ---------- START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
