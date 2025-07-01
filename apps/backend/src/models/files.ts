import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  file_id: { type: String, required: true, unique: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  file_name: { type: String, required: true },
  file_size: { type: Number },
  mime_type: { type: String },
  metadata: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metadata",
        required: true,
      },
      version: {
        type: Number,
        default: 1,
      },
    },
  ],
  uploaded_at: { type: Date, default: Date.now },
});

export default mongoose.model("File", fileSchema);
