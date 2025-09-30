import transporter from "./transporter.js";
const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending Email:", error);
    throw new Error("Failed to send Email");
  }
};
export default sendEmail;
