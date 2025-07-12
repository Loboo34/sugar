import mongoose from "mongoose";
import logger from "./logger";

const mongoUri = process.env.MONGOURI;

if (!mongoUri) {
  throw new Error("MONGOURI is not defined in the environment variables");
}

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error("MongoDB connection failed", error);
        process.exit(1);
    }
};

export default connectDB;
