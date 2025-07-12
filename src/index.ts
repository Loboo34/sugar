import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();
import createAdmin from "./scripts/admin";
import connectDB from "./config/db";
import logger from "./config/logger";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import storeRoutes from "./routes/store.routes";
import orderRoutes from "./routes/order.routes";
import salesRoutes from "./routes/sales.routes";

const app = express();
app.use(express.json());
app.use(cors());

createAdmin();

const apiVersion = `/api/${process.env.API_VERSION}`;

app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/products`, productRoutes);
app.use(`${apiVersion}/stores`, storeRoutes);
app.use(`${apiVersion}/orders`, orderRoutes);
app.use(`${apiVersion}/sales`, salesRoutes);

const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Database connection failed:", error);
  });
