import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const createInvitationEmail = (to, from, hashKey) => {
  return {
    from: from,
    to: to,
    subject: "You have been invited",
    html: `<p>You have been invited by ${from} to view a paste. Click <a href="http://localhost:5173/${hashKey}">here</a> to view.</p>`,
  };
};

const createOTPEmail = (to, otp) => {
  return {
    from: process.env.APP_USERNAME,
    to: to,
    subject: "Your OTP Code",
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };
};

export { createInvitationEmail, createOTPEmail };
