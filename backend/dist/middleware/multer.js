"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
exports.cloudinary = cloudinary_1.default;
//configure multer for file storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.multerUpload = upload;
