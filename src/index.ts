import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import productRoutes from "./routes/product.routes";
import storeRoutes from "./routes/store.routes";
import orderRoutes from "./routes/order.routes";
import salesRoutes from "./routes/sales.routes";
const app = express();
app.use(express.json());
app.use(cors());

const apiVersion = `/api/${process.env.API_VERSION}`;   


app.use(`${apiVersion}/products`, productRoutes);
app.use(`${apiVersion}/stores`, storeRoutes);
app.use(`${apiVersion}/orders`, orderRoutes);
app.use(`${apiVersion}/sales`, salesRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});