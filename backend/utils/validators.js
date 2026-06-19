import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().lowercase().trim().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(128).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    }),
});

export const verifyOTPSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
        'string.length': 'OTP must be 6 digits',
        'string.pattern.base': 'OTP must contain only digits',
        'any.required': 'OTP is required',
    }),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
        'string.length': 'OTP must be 6 digits',
        'string.pattern.base': 'OTP must contain only digits',
        'any.required': 'OTP is required',
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'New password is required',
    }),
});

export const resendOTPSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
    purpose: Joi.string().valid('verification', 'password-reset').required().messages({
        'any.only': 'Purpose must be verification or password-reset',
        'any.required': 'Purpose is required',
    }),
});
