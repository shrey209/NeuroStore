import mongoose from "mongoose";

const metadataSchema = new mongoose.Schema({
  metadata_id: { type: String, required: true, unique: true }, // UUID
  blocks: [
    {
      block_index: Number,
      offset: {
        start: Number,
        end: Number,
      },
      sha: String,
      chunk_size: Number,
      s3_object_key: String,
      encryption: { type: Boolean, default: false },
      compressed: { type: Boolean, default: false },
    },
  ],
});

export default mongoose.model("Metadata", metadataSchema);
