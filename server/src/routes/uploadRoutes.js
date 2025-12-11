import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/aws.js";
import { config } from "../config/env.js";
import { analyzeFileByS3Key } from "../services/mlService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/file", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const key = `uploads/${Date.now()}_${req.file.originalname}`;
    const command = new PutObjectCommand({ Bucket: config.awsBucket, Key: key, Body: req.file.buffer, ContentType: req.file.mimetype });
    await s3Client.send(command);

    // call Flask to analyze
    let analysis = null;
    try { analysis = await analyzeFileByS3Key(key); } catch (e) { console.warn("ML analyze failed:", e.message); }

    res.json({ message: "File uploaded successfully", s3Key: key, analysis });
  } catch (err) { next(err); }
});

export default router;
