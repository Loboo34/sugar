import { Router } from "express";
import { mpesaController } from "../services/mpesaController";
import { callBack } from "../services/callBack";

const router = Router();

router.post("/lipa-na-mpesa-online", mpesaController.lipaNaMpesaOnline);
router.post("/callback", callBack);


export default router;