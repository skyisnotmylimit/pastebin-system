import mongoose from "mongoose";
const PasteSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 },
      default: null,
    },
    accessList: {
      type: [String],
      default: [],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Paste = mongoose.models.Paste || mongoose.model("Paste", PasteSchema);
export default Paste;
