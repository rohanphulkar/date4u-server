import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    return connection;
  } catch (err) {
    console.log(err);
  }
};
