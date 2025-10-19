"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const db_1 = __importDefault(require("./config/db"));
const logger_1 = require("./config/logger");
const cron_1 = require("./scripts/cron");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const store_routes_1 = __importDefault(require("./routes/store.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const mpesa_routes_1 = __importDefault(require("./routes/mpesa.routes"));
// Add at the start of your app
const requiredEnvVars = [
    'CONSUMER_KEY',
    'CONSUMER_SECRET',
    'PASS_KEY',
    'BASE_URL',
    "MONGOURI",
    "JWT_SECRET",
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        logger_1.logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(logger_1.httpLogger);
(0, cron_1.startNotifications)();
//createAdmin();
const apiVersion = `/api/${process.env.API_VERSION}`;
app.use(`${apiVersion}/auth`, auth_routes_1.default);
app.use(`${apiVersion}/products`, product_routes_1.default);
app.use(`${apiVersion}/stores`, store_routes_1.default);
app.use(`${apiVersion}/orders`, order_routes_1.default);
app.use(`${apiVersion}/sales`, sales_routes_1.default);
app.use(`${apiVersion}/notifications`, notification_routes_1.default);
app.use(`${apiVersion}/mpesa`, mpesa_routes_1.default);
const PORT = process.env.PORT || 3000;
(0, db_1.default)()
    .then(() => {
    app.listen(PORT, () => {
        logger_1.logger.info(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    logger_1.logger.error("Database connection failed:", error);
});
