import dotenv from "dotenv";
dotenv.config();
export const config = {
  port: process.env.PORT || 5000,
  flaskUrl: process.env.FLASK_URL || "http://localhost:5001",
  awsRegion: process.env.AWS_REGION,
  awsBucket: process.env.AWS_S3_BUCKET
};
