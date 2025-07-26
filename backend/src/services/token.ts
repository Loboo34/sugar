import axios from "axios";
import { Buffer } from "buffer";
import {logger} from "../config/logger";

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;

const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

export const getAccessToken = async () => {
    try{
        const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        if (response.status !== 200) {
            throw new Error("Failed to get access token");
        }

        logger.info("Access token retrieved successfully");
        return response.data.access_token;
    } catch(error: any) {
        logger.error(`Error getting access token: ${error.message}`);
        throw new Error("Failed to get access token");
    }
}