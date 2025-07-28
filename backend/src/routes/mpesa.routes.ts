import { Router } from "express";
import { mpesaController } from "../services/mpesaController";
import { callBack } from "../services/callBack";

const router = Router();

//router.post("/lipanampesa", mpesaController.initiatePayment);
router.post("/callback", callBack);
router.get("/transactions", mpesaController.getTransactions);

export default router;