import mongoose, { Schema, Document } from "mongoose";
import { ChunkData } from '@neurostore/shared/types';



export interface MetadataDocument extends Document {
  chunks: ChunkData[];
}

const chunkSchema = new Schema<ChunkData>(
  {
    chunk_no: { type: Number, required: true },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    sha: { type: String, required: true },
  },
  { _id: false } 
);

const metadataSchema = new Schema<MetadataDocument>({
  chunks: [chunkSchema],
});

export default mongoose.model<MetadataDocument>("Metadata", metadataSchema);
