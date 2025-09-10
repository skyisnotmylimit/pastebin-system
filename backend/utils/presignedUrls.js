import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
import {GetObjectCommand,PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../database/s3Client.js";

async function presignedGetUrl(bucketName, keyName) {
  const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: keyName });
  const getUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 120 });
  console.log("Presigned GET URL:", getUrl);
  return getUrl;
}

async function presignedPutUrl(bucketName, keyName) {
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: keyName,
  });
  const putUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });
  console.log("Presigned PUT URL:", putUrl);
  return putUrl;
}

export { presignedGetUrl,presignedPutUrl };