"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callBack = void 0;
const logger_1 = require("../config/logger");
const mpesa_models_1 = __importDefault(require("../models/mpesa.models"));
const order_model_1 = __importDefault(require("../models/order.model"));
const callBack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        logger_1.logger.info("=== CALLBACK DEBUG INFO ===");
        logger_1.logger.info("Headers:", JSON.stringify(req.headers, null, 2));
        logger_1.logger.info("Body:", JSON.stringify(req.body, null, 2));
        logger_1.logger.info("Raw body:", req.body);
        logger_1.logger.info("Body type:", typeof req.body);
        logger_1.logger.info("Body keys:", Object.keys(req.body || {}));
        logger_1.logger.info("=== END DEBUG INFO ===");
        // const safaricomIPs = process.env.SAFARICOM_IPS?.split(",") || [];
        // const clientIP = req.ip || req.connection.remoteAddress;
        // if (
        //   process.env.NODE_ENV === "production" &&
        //   safaricomIPs.length > 0 &&
        //   !safaricomIPs.includes(clientIP)
        // ) {
        //   logger.warn(`Unauthorized callback attempt from IP: ${clientIP}`);
        //   return res.status(403).json({ error: "Unauthorized" });
        // }
        const body = req.body;
        if (!((_b = (_a = body === null || body === void 0 ? void 0 : body.Body) === null || _a === void 0 ? void 0 : _a.stkCallback) === null || _b === void 0 ? void 0 : _b.CheckoutRequestID)) {
            logger_1.logger.error("Missing required callback fields");
            return res.status(400).json({ error: "Invalid callback format" });
        }
        if (!body || Object.keys(body).length === 0) {
            logger_1.logger.error("Empty callback body received");
            const transaction = new mpesa_models_1.default({
                amount: 0,
                phoneNumber: "Unknown",
                name: "Empty Callback",
                status: "failed",
                resultDesc: "Empty callback body received",
            });
            yield transaction.save();
            return res.status(200).json({ message: "Empty callback processed" });
        }
        const stkCallback = (_c = body.Body) === null || _c === void 0 ? void 0 : _c.stkCallback;
        if (!stkCallback) {
            logger_1.logger.error("Invalid callback structure - missing stkCallback", body);
            const transaction = new mpesa_models_1.default({
                amount: 0,
                phoneNumber: "Unknown",
                name: "Invalid Structure",
                status: "failed",
                resultDesc: "Invalid callback structure",
            });
            yield transaction.save();
            return res.status(200).json({ message: "Invalid callback processed" });
        }
        const resultCode = stkCallback.ResultCode;
        let resultStatus = "failed";
        if (resultCode === 0) {
            resultStatus = "paid";
        }
        else if (resultCode === 1032) {
            resultStatus = "cancelled";
        }
        else if (resultCode === 1037) {
            resultStatus = "timeout";
        }
        else {
            resultStatus = "failed";
        }
        const resultDesc = stkCallback.ResultDesc;
        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const merchantRequestId = stkCallback.MerchantRequestID;
        let amount = 0;
        let phoneNumber = "Unknown";
        let mpesaReceiptNumber = "";
        let transactionDate = "";
        if (resultCode === 0 && stkCallback.CallbackMetadata) {
            const items = stkCallback.CallbackMetadata.Item;
            logger_1.logger.info("CallbackMetadata items:", items);
            for (const item of items) {
                switch (item.Name) {
                    case "Amount":
                        amount = parseFloat(item.Value);
                        break;
                    case "PhoneNumber":
                        phoneNumber = item.Value.toString();
                        break;
                    case "MpesaReceiptNumber":
                        mpesaReceiptNumber = item.Value;
                        break;
                    case "TransactionDate":
                        transactionDate = item.Value.toString();
                        break;
                }
            }
        }
        let accountReference = null;
        if (stkCallback.AccountReference) {
            accountReference = stkCallback.AccountReference;
        }
        // Check for duplicate transaction
        const isTransactionProcessed = (checkoutRequestId) => __awaiter(void 0, void 0, void 0, function* () {
            const existingTransaction = yield mpesa_models_1.default.findOne({
                checkoutRequestId: checkoutRequestId,
            });
            return !!existingTransaction;
        });
        if (yield isTransactionProcessed(checkoutRequestId)) {
            logger_1.logger.info(`Duplicate callback received for CheckoutRequestID: ${checkoutRequestId}`);
            return res.status(200).json({ message: "Transaction already processed" });
        }
        // Create transaction record
        const transaction = new mpesa_models_1.default({
            amount: amount,
            phoneNumber: phoneNumber,
            name: mpesaReceiptNumber || "Unknown",
            status: resultCode === 0 ? "success" : "failed",
            mpesaReceiptNumber: mpesaReceiptNumber,
            checkoutRequestId: checkoutRequestId,
            merchantRequestId: merchantRequestId,
            resultCode: resultCode,
            resultDesc: resultDesc,
            transactionDate: transactionDate,
        });
        yield transaction.save();
        const maskPhoneNumber = (phone) => {
            if (!phone || phone === "Unknown")
                return phone;
            return phone.slice(0, 5) + "****" + phone.slice(-3);
        };
        logger_1.logger.info("Transaction saved successfully:", {
            amount,
            phoneNumber: maskPhoneNumber(phoneNumber),
            status: resultCode === 0 ? "success" : "failed",
            mpesaReceiptNumber,
        });
        // After extracting accountReference or CheckoutRequestID from callback:
        const query = [];
        if (accountReference)
            query.push({ _id: accountReference });
        if (checkoutRequestId)
            query.push({ mpesaCheckoutRequestID: checkoutRequestId });
        const order = yield order_model_1.default.findOne(query.length ? { $or: query } : {});
        if (order) {
            if (resultCode === 0) {
                order.paymentStatus = "paid";
            }
            else if (resultCode === 1032) {
                order.paymentStatus = "failed";
            }
            else if (resultCode === 1037) {
                order.paymentStatus = "failed";
            }
            else {
                order.paymentStatus = "failed";
            }
            order.mpesaReceiptNumber = mpesaReceiptNumber || "";
            order.resultDesc = resultDesc;
            yield order.save();
            transaction.products = order.products;
            transaction.order = order._id;
            yield transaction.save();
        }
        res.status(200).json({ message: "Callback processed successfully" });
    }
    catch (error) {
        logger_1.logger.error("Error processing M-Pesa callback:", error);
        return res.status(500).json({ error: "Failed to process callback" });
    }
});
exports.callBack = callBack;
