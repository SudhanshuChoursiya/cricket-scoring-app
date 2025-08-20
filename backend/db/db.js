import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_CONNECTION_URL);

    console.log(`database connected on host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("database connection failed:", error.message);
    process.exit(1); // Exit app if DB connection fails
  }
};