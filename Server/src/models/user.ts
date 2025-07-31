import { UserSchema, IUser } from "../Validations/userValidation";
import * as mongoose from "mongoose";

// Mongoose Schema
const userSchema = new mongoose.Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'employee'], default: 'employee' },
profile: {
        name: String,
        avatar: String,
        lastLogin: Date
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    activityLog: [{
        action: String,
        timestamp: Date,

    }]
}, { timestamps: true });

// Add pre-save validation
userSchema.pre("save", async function (next) {
    const user = this;
    try {
        await UserSchema.parseAsync(user.toObject());
        next();
    } catch (error) {
        next(error as Error);
    }
});

export const User = mongoose.model<IUser>("User", userSchema);