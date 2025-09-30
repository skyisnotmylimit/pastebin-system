import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_USERNAME,
    pass: process.env.APP_PASSWORD,
  },
});
export default transporter;
