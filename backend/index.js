import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./database/db.js";
import cors from "cors";
import pasteRoutes from "./routes/paste.routes.js";
import userRoutes from "./routes/user.routes.js";
const app = express();
const bucketName = process.env.AWS_BUCKET_NAME || "pastebin-system-bucket";
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

app.use("/api/users", userRoutes);
app.use("/api/pastes", pasteRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });
