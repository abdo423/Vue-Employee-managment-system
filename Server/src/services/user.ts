import { User } from "../models/user";
import {IUser, validateLogin, validateUser} from "../Validations/userValidation";
import jwt from "jsonwebtoken";
import config from "config";
import bcrypt from "bcryptjs";

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        _id: string;
        email: string;
        role: 'admin' | 'manager' | 'employee';
        name?: string;
        lastLogin?: Date;
    };
}

const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.success) {
        throw {
            type: 'VALIDATION_ERROR',
            details: validation.error.format()
        };
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        throw { type: 'AUTH_ERROR', message: 'Invalid credentials' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw { type: 'AUTH_ERROR', message: 'Invalid credentials' };
    }

    // JWT configuration
    const jwtSecret = process.env.JWT_SECRET || config.get<string>("jwt.secret");
    if (!jwtSecret) {
        throw { type: 'CONFIG_ERROR', message: 'Server configuration error' };
    }

    // Generate token
    const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        jwtSecret,
        { expiresIn: "1h" }
    );
    //refresh token
    const refreshToken = jwt.sign(
        { userId: user._id },
        jwtSecret,
        { expiresIn: "7d" }
    );

    // Update last login
    try {
        user.profile = {
            name: user.profile?.name || '',
            ...user.profile,
            lastLogin: new Date()
        };
        await user.save();
    } catch (error) {
        console.error("Login time update failed:", error);
    }

    return {
        accessToken,
        refreshToken,
        user: {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.profile?.name,
            lastLogin: user.profile?.lastLogin
        }
    };
};
const registerUser = async (userData: IUser) => {
    // 1. Validate input
    const validation = validateUser(userData);
    if (!validation.success) {
        throw {
            type: 'VALIDATION_ERROR',
            details: validation.error.format()
        };
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw {
            type: 'USER_EXISTS',
            message: 'User with this email already exists'
        };
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 4. Create new user
    const newUser = new User({
        ...userData,
        password: hashedPassword,
        profile: userData.profile || {
            name: userData.email.split('@')[0], // Default name from email
            lastLogin: new Date()
        }
    });

    // 5. Save to database
    try {
        const savedUser = await newUser.save();

        // 6. Return user data (excluding password)
        const { password, ...userWithoutPassword } = savedUser.toObject();

        return {
            success: true,
            user: userWithoutPassword
        };

    } catch (error) {
        console.error("Registration failed:", error);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Failed to create user'
        };
    }
};



export const verifyRefreshToken = (token: string) => {
    const jwtSecret = process.env.JWT_SECRET || config.get<string>("jwt.secret");

    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded;
    } catch (err) {
        return null;
    }
};

export { loginUser, registerUser };

