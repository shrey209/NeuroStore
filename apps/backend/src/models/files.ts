import mongoose from "mongoose";
import {
  AccessLevel,
  SharedAccessEntry,
  FileMetadataEntry,
} from '@neurostore/shared/types';

const fileSchema = new mongoose.Schema({
  file_id: { type: String, required: true, unique: true },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  file_name: { type: String, required: true },
  file_extension: { type: String },
  file_size: { type: Number },
  mime_type: { type: String },

  is_public: { type: Boolean, default: false },

  shared_with: [
    {
      user_id: { type: String },
      github_id: { type: String },
      gmail: { type: String },
      access_level: {
        type: String,
        enum: ["read", "write"],
        default: "read",
      },
    },
  ],

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
  tags: [{ type: String }],
});

export default mongoose.model("File", fileSchema);
