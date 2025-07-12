import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import Auth from '../models/auth.model';
import {logger} from '../config/logger';
import { generateToken } from '../utils/jwt';

// Extend the Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}


export const register = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, name, role } = req.body;
    
    try {
        const existingUser = await Auth.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Auth({
            email,
            password: hashedPassword,
            name,
            role
        });
        await newUser.save();
        const token = generateToken({ id: newUser._id, email: newUser.email });
        return res.status(201).json({ token });
    } catch (error) {
        logger.error('Error registering user', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    try {
        const user = await Auth.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken({ id: user._id, email: user.email });
        return res.status(200).json({ token, user });
    } catch (error) {
        logger.error('Error logging in user', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
export const getUserProfile = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id; // Assuming user ID is set in req.user by authentication middleware

    try {
        const user = await Auth.findById(userId).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        logger.error('Error fetching user profile', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id; // Assuming user ID is set in req.user by authentication middleware
    const { name, role } = req.body;

    try {
        const updatedUser = await Auth.findByIdAndUpdate(userId, { name, role }, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(updatedUser);
    } catch (error) {
        logger.error('Error updating user profile', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};