import { Queue } from "bullmq";

const sendEmailQueue = new Queue("sendEmailQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const deletePasteQueue = new Queue("deletePasteQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const addDeletePasteJob = async (hashKey, deleteAt) => {
  if (deleteAt) {
    const delay = deleteAt.getTime() - Date.now();
    if (delay < 0) {
      console.error("Delete time is in the past. Job not added.");
      return;
    }
    await deletePasteQueue.add("deletePaste", { hashKey }, { delay });
    console.log(
      `Job scheduled to delete paste with ID: ${hashKey} on ${deleteAt}`
    );
  } else {
    await deletePasteQueue.add("deletePaste", { hashKey });
    console.log(`Job added to delete paste with ID: ${hashKey}`);
  }
};

const addSendEmailJob = async (mailOptions) => {
  await sendEmailQueue.add("sendEmail", mailOptions);
  console.log(`Job added to send email to: ${mailOptions.to}`);
};

export { addSendEmailJob, addDeletePasteJob };
