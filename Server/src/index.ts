import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import config from "config";
import authRoutes from "./routes/auth";
import cookieParser from 'cookie-parser';
const app = express();
app.use(cookieParser());
const port = config.get<number>("app.port");
const dbConnectionString = config.get<string>("db.connectionString");
// Connect to MongoDB
mongoose
    .connect(dbConnectionString)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req: Request, res: Response) => {
    res.send(`Hello from ${config.get<string>("app.name")}`);
});

//routes
app.use("/Auth",authRoutes)

app.listen(port, () => {
    console.log(`${config.get<string>("app.name")} listening on port ${port}`);
});