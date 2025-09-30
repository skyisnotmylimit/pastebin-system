import { deletePasteFromBucket } from "../../services/aws/s3Service.js";

const deletePasteJob = async (job) => {
  try {
    const { hashKey } = job.data;
    await deletePasteFromBucket(hashKey);
    console.log(`Successfully deleted paste with hashKey: ${hashKey}`);
  } catch (error) {
    console.error("Error in deletePasteJob:", error);
    throw error;
  }
};
export default deletePasteJob;
