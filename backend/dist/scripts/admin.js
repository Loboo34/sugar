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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_model_1 = __importDefault(require("../models/auth.model"));
const logger_1 = require("../config/logger");
function createAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = process.env.ADMIN_EMAIL;
            const password = process.env.ADMIN_PASSWORD;
            if (!email || !password) {
                logger_1.logger.error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set");
                return;
            }
            // Check if admin already exists
            const existingAdmin = yield auth_model_1.default.findOne({ email });
            if (existingAdmin) {
                console.log("Admin already exists:", email);
                return;
            }
            // Hash the password
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            // Create admin user
            const admin = new auth_model_1.default({
                email,
                password: hashedPassword,
                role: "admin",
                name: "Administrator",
            });
            yield admin.save();
            logger_1.logger.info("Admin user created successfully:", email);
        }
        catch (error) {
            logger_1.logger.error("Error creating admin:", error);
        }
    });
}
exports.default = createAdmin;
