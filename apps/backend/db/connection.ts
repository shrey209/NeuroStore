require("dotenv").config();

import mongoose from "mongoose";

const URI = process.env.MONGO_URI;

console.log(URI);

const connectionSetup = () => {
  if (!URI) {
    throw new Error("MONGO_URI environment variable is not defined");
  }
  return mongoose.connect(URI);
};

export default connectionSetup;
