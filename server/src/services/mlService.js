import axios from "axios";
import { config } from "../config/env.js";

export async function analyzeReviews(reviews){
  const url = `${config.flaskUrl}/analyze`;
  const res = await axios.post(url, { reviews });
  return res.data;
}

export async function analyzeFileByS3Key(s3Key){
  const url = `${config.flaskUrl}/analyze-file`;
  const res = await axios.post(url, { s3_key: s3Key });
  return res.data;
}
