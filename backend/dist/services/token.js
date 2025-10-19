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
exports.getAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const logger_1 = require("../config/logger");
let tokenCache = {
    token: '',
    expiry: 0
};
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const credentials = buffer_1.Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
const getAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (tokenCache.token && tokenCache.expiry > Date.now()) {
            logger_1.logger.info("Using cached access token");
            return tokenCache.token;
        }
        logger_1.logger.info("Fetching new access token");
        const response = yield axios_1.default.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });
        if (response.status !== 200) {
            throw new Error("Failed to get access token");
        }
        tokenCache = {
            token: response.data.access_token,
            expiry: Date.now() + response.data.expires_in * 1000
        };
        logger_1.logger.info("Access token retrieved successfully");
        return response.data.access_token;
    }
    catch (error) {
        logger_1.logger.error(`Error getting access token: ${error.message}`);
        throw new Error("Failed to get access token");
    }
});
exports.getAccessToken = getAccessToken;
