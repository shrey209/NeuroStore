import mongoose from "mongoose";

const SchemaModel = mongoose.Schema;

const userSchema = new SchemaModel({
  user_id: { type: String, unique: true, required: true },
  user_name: { type: String, required: true },
  file_details: [
    {
      type: SchemaModel.Types.ObjectId,
      ref: "File",
    },
  ],
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
