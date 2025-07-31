import { Request, Response } from "express";
import {loginUser, registerUser, verifyRefreshToken} from "../services/user";
import config from "config";
import jwt from "jsonwebtoken";

export const userLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Single source of validation (in service)
        const { refreshToken,accessToken, user } = await loginUser(email, password);

        // Set HTTP-only cookie
        res.cookie('token', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            user
        });

    } catch (error:any) {
        console.error('Login error:', error);

        // Handle different error types
        switch (error.type) {
            case 'VALIDATION_ERROR':
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input data',
                    details: error.details
                });

            case 'AUTH_ERROR':
                return res.status(401).json({
                    success: false,
                    error: error.message || 'Invalid credentials'
                });

            case 'CONFIG_ERROR':
                return res.status(500).json({
                    success: false,
                    error: 'Server configuration error'
                });

            default:
                return res.status(500).json({
                    success: false,
                    error: 'Login failed. Please try again.'
                });
        }
    }
};


export const userRegister = async (req: Request, res: Response) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error:any) {
        switch (error.type) {
            case 'VALIDATION_ERROR':
                return res.status(400).json(error);
            case 'USER_EXISTS':
                return res.status(409).json(error);
            default:
                return res.status(500).json({
                    type: 'SERVER_ERROR',
                    message: 'Registration failed'
                });
        }
    }
};


export const handleRefreshToken = (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return res.sendStatus(403); // Invalid or expired

    const jwtSecret = process.env.JWT_SECRET || config.get<string>("jwt.secret");

    const newAccessToken =jwt.sign(
        { userId: (decoded as any).userId, role: (decoded as any).role },
        jwtSecret,
        { expiresIn: "15m" }
    );

    res.cookie('token', newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000
    });

    res.sendStatus(200); // Frontend will retry original request
};