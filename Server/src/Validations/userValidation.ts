import { z } from "zod";
import {User} from "../models/user";

// Base validation schema
export const UserSchema = z.object({
    email: z.string()
        .email("Please enter a valid email address")
        .min(1, "Email is required"),

    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),

    role: z.enum(['admin', 'manager', 'employee'])
        .default('employee')
        .describe("User role: admin, manager, or employee"),

    profile: z.object({
        name: z.string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name cannot exceed 50 characters")
            .optional(),

        avatar: z.string()
            .url("Please enter a valid URL for the avatar")
            .optional(),

        lastLogin: z.date()
            .optional()
    }).optional(),

    resetPasswordToken: z.string().optional(),
    resetPasswordExpires: z.date().optional(),
    activityLog: z.array(
        z.object({
            action: z.string(),
            timestamp: z.date(),

        })
    ).optional()
});
export const loginUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
})
// For API request validation (excludes Mongoose-specific fields)
export const CreateUserDto = UserSchema.omit({
    activityLog: true,
    resetPasswordToken: true,
    resetPasswordExpires: true
});

// Correct ✅
export const validateUser = (data: unknown) => {
    return UserSchema.safeParse(data)
}

// Correct ✅
export const validateLogin = (data: unknown) => {
    return loginUserSchema.safeParse(data)
}
// TypeScript type inference
export type IUser = z.infer<typeof UserSchema>;