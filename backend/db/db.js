import mongoose from "mongoose";
export const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGO_CONNECTION_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(
      `database connected on host!!!: ,${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(error);
    throw error;
    process.exit(1);
  }
};
