import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
import Paste from "../models/Paste.js";
import User from "../models/User.js";
import generateHash from "../utils/generateHash.js";
import { presignedGetUrl, presignedPutUrl } from "../services/aws/s3Service.js";
import jwt from "jsonwebtoken";
import { addSendEmailJob, addDeletePasteJob } from "../queues/producer.js";
import { createInvitationEmail } from "../utils/createEmail.js";

const bucketName = process.env.AWS_BUCKET_NAME || "pastebin-system-bucket";

const createPaste = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let { expiration, inviteList } = req.body;

  // Validate invite list
  if (inviteList && !Array.isArray(inviteList)) {
    return res.status(400).json({ error: "inviteList must be an array" });
  }

  // Validate expiration
  if (expiration && typeof expiration === "string") {
    if (expiration.endsWith("d")) {
      expiration = parseInt(expiration.slice(0, -1)) * 1440; // days to minutes
    } else if (expiration.endsWith("h")) {
      expiration = parseInt(expiration.slice(0, -1)) * 60; // hours to minutes
    } else if (expiration.endsWith("m")) {
      expiration = parseInt(expiration.slice(0, -1)) * 1440 * 30; // minutes
    } else if (expiration.endsWith("w")) {
      expiration = parseInt(expiration.slice(0, -1)) * 1440 * 7; // hours to minutes
    } else if (expiration === "never") {
      expiration = null;
    } else {
      return res.status(400).json({ error: "Invalid expiration format" });
    }
  }

  let user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.email) {
        user = await User.findOne({ email: decoded.email });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
      }
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  const expiresAt = expiration
    ? new Date(Date.now() + expiration * 60000)
    : null;

  const isPrivate = inviteList && inviteList.length > 0;
  if (isPrivate && !user) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Token required for invite-only pastes" });
  }

  try {
    const hash = generateHash(6);
    const putUrl = await presignedPutUrl(bucketName, hash);

    const newPaste = new Paste({
      author: user ? user._id : null,
      hash,
      expiresAt,
      accessList: inviteList || [],
      isPrivate,
    });
    if (isPrivate && inviteList && inviteList.length > 0) {
      for (const email of inviteList) {
        try {
          const recievedFrom = user ? user.email : process.env.APP_USERNAME;
          const sendTo = email;
          const mailOptions = createInvitationEmail(sendTo, recievedFrom, hash);
          await addSendEmailJob(mailOptions);
        } catch (err) {
          console.error(`Failed to add email job for ${email}:`, err);
        }
      }
    }
    if (expiresAt) {
      await addDeletePasteJob(hash, expiresAt);
    }
    await newPaste.save();
    return res.status(201).json({ putUrl, hash });
  } catch (error) {
    console.error("Error creating paste:", error);
    return res.status(500).json({ error: "Server error while creating paste" });
  }
};

const getPaste = async (req, res) => {
  const { hash } = req.params;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const paste = await Paste.findOne({ hash });
    if (!paste) {
      return res.status(404).json({ error: "Paste not found" });
    }
    if (paste.isPrivate) {
      if (!token) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Token required for private pastes" });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.email) {
          const user = await User.findOne({ email: decoded.email });
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          if (
            !paste.accessList.includes(user.email) &&
            paste.author &&
            !paste.author.equals(user._id)
          ) {
            return res.status(403).json({
              error: "Forbidden: You do not have access to this paste",
            });
          }
        }
      } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    const getUrl = await presignedGetUrl(bucketName, hash);
    return res.status(200).json({ getUrl });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export { createPaste, getPaste };
