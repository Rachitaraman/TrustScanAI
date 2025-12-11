import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./env.js";

const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default s3Client;
