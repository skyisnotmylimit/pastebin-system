import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
import { Worker } from "bullmq";
import sendEmailJob from "./jobs/sendEmailJob.js";
import deletePasteJob from "./jobs/deletePasteJob.js";
const sendEmailWorker = new Worker(
  "sendEmailQueue",
  async (job) => {
    await sendEmailJob(job.data);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
sendEmailWorker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});

sendEmailWorker.on("failed", (job, err) => {
  console.error(`Job with id ${job.id} has failed with error ${err.message}`);
});

const deletePasteWorker = new Worker(
  "deletePasteQueue",
  async (job) => {
    await deletePasteJob(job);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
deletePasteWorker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has been completed`);
});
deletePasteWorker.on("failed", (job, err) => {
  console.error(`Job with id ${job.id} has failed with error ${err.message}`);
});
