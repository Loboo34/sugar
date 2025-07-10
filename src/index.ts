import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import ProductRoutes from "./routes/product.routes";

const app = express();
app.use(express.json());
app.use(cors());

const apiVersion = `/api/${process.env.API_VERSION}`;   


app.use(`${apiVersion}/products`, ProductRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});