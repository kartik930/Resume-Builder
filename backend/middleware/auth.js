import { verifyAccessToken } from '../utils/generateToken.js';
import User from '../models/User.js';

/**
 * Protect routes — Verify JWT access token from Authorization header
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from "Bearer <token>" header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — no token provided',
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user to request (exclude password)
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — user not found',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired — please refresh',
                code: 'TOKEN_EXPIRED',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Not authorized — invalid token',
        });
    }
};

/**
 * Validate request body against a Joi schema
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: messages[0], // Return first error for simplicity
                errors: messages,
            });
        }
        next();
    };
};
