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
exports.mpesaController = void 0;
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const logger_1 = require("../config/logger");
const token_1 = require("./token");
const mpesa_models_1 = __importDefault(require("../models/mpesa.models"));
const envRequired = [
    "PASS_KEY",
    "BASE_URL"
];
const generateTimestamp = () => {
    return new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
};
const shortCode = 174379; // Example shortcode, replace with actual
const PASS_KEY = process.env.PASS_KEY;
function initiatePayment(_a) {
    return __awaiter(this, arguments, void 0, function* ({ amount, products, phoneNumber, accountReference, transactionDesc, }) {
        try {
            const accessToken = yield (0, token_1.getAccessToken)();
            if (!accessToken) {
                logger_1.logger.error("Failed to retrieve access token");
                return;
            }
            const timestamp = generateTimestamp();
            const headers = {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            };
            const payload = {
                BusinessShortCode: shortCode,
                Password: buffer_1.Buffer.from(`${shortCode}${PASS_KEY}${timestamp}`).toString("base64"),
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: shortCode,
                PhoneNumber: phoneNumber,
                CallBackURL: `${process.env.BASE_URL}/api/v1/mpesa/callback`,
                AccountReference: accountReference || "BakersApp",
                TransactionDesc: transactionDesc || "Payment for goods/services",
                Metadata: products
                    ? products.map((product) => ({
                        ProductName: product.name,
                        Quantity: product.quantity,
                        Price: product.price,
                    }))
                    : [],
            };
            const response = yield axios_1.default.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", payload, { headers });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error("Error initiating payment", error);
            return { error: "Failed to initiate payment" };
        }
    });
}
;
exports.mpesaController = {
    initiatePayment,
    getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transactions = yield mpesa_models_1.default.find();
                return res.status(200).json(transactions);
            }
            catch (error) {
                logger_1.logger.error("Error fetching transactions", error);
                return res.status(500).json({ error: "Failed to fetch transactions" });
            }
        });
    },
};
