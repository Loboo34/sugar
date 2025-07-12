import { Router } from "express";
import {getExpenses, getTotalSales, getSalesByTimeframe, getTotalSalesForProduct} from '../controllers/sales.controller';

const router = Router();

router.get("/expenses", getExpenses);
router.get("/total-sales", getTotalSales);
router.get("/sales-by-timeframe", getSalesByTimeframe);
router.get("/total-sales/:productId", getTotalSalesForProduct);

export default router;
