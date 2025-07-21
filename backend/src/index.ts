import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();
import createAdmin from "./scripts/admin";
import connectDB from "./config/db";
import { logger, httpLogger } from "./config/logger";
import { startNotifications } from "./scripts/cron";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import storeRoutes from "./routes/store.routes";
import orderRoutes from "./routes/order.routes";
import salesRoutes from "./routes/sales.routes";
import notificationRoutes from "./routes/notification.routes";


const app = express();
app.use(express.json());
app.use(cors());

app.use(httpLogger);

startNotifications();
//createAdmin();

const apiVersion = `/api/${process.env.API_VERSION}`;

app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/products`, productRoutes);
app.use(`${apiVersion}/stores`, storeRoutes);
app.use(`${apiVersion}/orders`, orderRoutes);
app.use(`${apiVersion}/sales`, salesRoutes);
app.use(`${apiVersion}/notifications`, notificationRoutes);

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
