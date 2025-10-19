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
exports.updateUserProfile = exports.getUserProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_model_1 = __importDefault(require("../models/auth.model"));
const logger_1 = require("../config/logger");
const jwt_1 = require("../utils/jwt");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, role } = req.body;
    try {
        const existingUser = yield auth_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = new auth_model_1.default({
            email,
            password: hashedPassword,
            name,
            role
        });
        yield newUser.save();
        const token = (0, jwt_1.generateToken)({ id: newUser._id, email: newUser.email });
        return res.status(201).json({ token });
    }
    catch (error) {
        logger_1.logger.error('Error registering user', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield auth_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = (0, jwt_1.generateToken)({ id: user._id, email: user.email });
        return res.status(200).json({ token, user });
    }
    catch (error) {
        logger_1.logger.error('Error logging in user', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const user = yield auth_model_1.default.findById(userId).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        logger_1.logger.error('Error fetching user profile', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming user ID is set in req.user by authentication middleware
    const { name, role } = req.body;
    try {
        const updatedUser = yield auth_model_1.default.findByIdAndUpdate(userId, { name, role }, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(updatedUser);
    }
    catch (error) {
        logger_1.logger.error('Error updating user profile', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateUserProfile = updateUserProfile;
