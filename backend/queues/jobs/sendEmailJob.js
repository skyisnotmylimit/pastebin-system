import sendEmail from "../../services/mail-service/sendEmail.js";

const sendEmailJob = async (mailOptions) => {
  try {
    await sendEmail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error("Error in sendEmailJob:", error);
    throw error;
  }
};

export default sendEmailJob;
