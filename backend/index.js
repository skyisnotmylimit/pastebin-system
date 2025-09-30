import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./database/db.js";
import cors from "cors";
import pasteRoutes from "./routes/paste.routes.js";
import userRoutes from "./routes/user.routes.js";
import { addDeletePasteJob } from "./queues/producer.js";

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

app.use("/api/users", userRoutes);
app.use("/api/pastes", pasteRoutes);

app.delete("/api/pastes/:hashKey", async (req, res) => {
  const { hashKey } = req.params;
  try {
    await addDeletePasteJob(hashKey);
    res.status(200).json({ message: "Delete job added to the queue" });
  } catch (error) {
    console.error("Error adding delete job to the queue:", error);
    res.status(500).json({ error: "Failed to add delete job to the queue" });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });
