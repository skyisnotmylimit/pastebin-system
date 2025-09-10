import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
import Paste from "../models/Paste.js";
import generateHash from "../utils/generateHash.js";
import { presignedGetUrl, presignedPutUrl } from "../utils/presignedUrls.js";

const bucketName = process.env.AWS_BUCKET_NAME || "pastebin-system-bucket";

const createPaste = async (req, res) => {
  const hash = generateHash(6);
  try {
    const putUrl = await presignedPutUrl(bucketName, hash);
    const newPaste = new Paste({ hash });
    await newPaste.save();
    return res.status(200).json({ putUrl, hash });
  } catch (error) {
    return res.status(500).json({ error: "Error generating PUT URL" });
  }
};

const getPaste = async (req, res) => {
  const { hash } = req.params;
  try {
    const paste = await Paste.findOne({ hash });
    if (!paste) {
      return res.status(404).json({ error: "Paste not found" });
    }
    const getUrl = await presignedGetUrl(bucketName, hash);
    return res.status(200).json({ getUrl });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export { createPaste, getPaste };
