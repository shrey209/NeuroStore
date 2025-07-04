import mongoose, { Schema, Document, Model } from "mongoose";
import { User as SharedUser } from "@neurostore/shared/types";

export interface IUserModel extends Omit<SharedUser, "created_at" | "file_details">, Document {
  created_at: Date;
  file_details: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUserModel>({
  user_name: { type: String, required: true },
  provider: {
    type: String,
    enum: ["google", "github"],
    required: true,
  },
  gmail: { type: String },
  profile_picture: { type: String },
  email_verified: { type: Boolean, default: false },
  file_details: [
    {
      type: Schema.Types.ObjectId,
      ref: "File",
    },
  ],
  created_at: { type: Date, default: Date.now },
  google_sub_id: { type: String, index: true, sparse: true, unique: true },
  github_id: { type: String, index: true, sparse: true, unique: true },
});

const User: Model<IUserModel> = mongoose.model<IUserModel>("User", userSchema);
export default User;
