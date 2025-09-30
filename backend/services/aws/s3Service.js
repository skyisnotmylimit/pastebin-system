import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
import s3Client from "../../database/s3Client.js";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const deletePasteFromBucket = async (hashKey) => {
  const bucketName = process.env.AWS_BUCKET_NAME || "pastebin-system-bucket";
  const deleteParams = {
    Bucket: bucketName,
    Key: hashKey,
  };
  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(
      `Successfully deleted object: ${hashKey} from bucket: ${bucketName}`
    );
  } catch (err) {
    console.error("Error deleting object:", err);
    throw err;
  }
};

async function presignedGetUrl(bucketName, keyName) {
  const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: keyName });
  const getUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 120 });
  return getUrl;
}

async function presignedPutUrl(bucketName, keyName) {
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: keyName,
  });
  const putUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });
  return putUrl;
}

export { deletePasteFromBucket, presignedGetUrl, presignedPutUrl };
