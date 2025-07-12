import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Auth from "../models/auth.model";
import logger from "../config/logger";

async function createAdmin() {
  try {

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      logger.error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set");
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Auth.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists:", email);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new Auth({
      email,
      password: hashedPassword,
      role: "admin",
      name: "Administrator",
    });

    await admin.save();
  logger.info("Admin user created successfully:", email);
  } catch (error) {
    logger.error("Error creating admin:", error);
  }
}

export default createAdmin;
