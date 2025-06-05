import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from "readline";
import Admin from "../models/admin.models.js";

// Load env variables
dotenv.config();

// Optional: Prompt for confirmation before creating admin (in CLI)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askConfirmation = () => {
    return new Promise((resolve) => {
        rl.question(
            "⚠️  This will create a new admin account. Continue? (yes/no): ",
            (answer) => {
                rl.close();
                resolve(answer.trim().toLowerCase() === "yes");
            }
        );
    });
};

const createAdmin = async () => {
    try {
        const proceed = await askConfirmation();
        if (!proceed) {
            console.log("❌ Admin creation aborted.");
            process.exit(0);
        }

        if (
            !process.env.MONGODB_URI ||
            !process.env.ADMIN_EMAIL ||
            !process.env.ADMIN_PASSWORD
        ) {
            throw new Error("Missing required environment variables.");
        }

        // Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Check for existing admin
        const existingAdmin = await Admin.findOne({
            email: process.env.ADMIN_EMAIL,
        });
        if (existingAdmin) {
            console.log(
                "ℹ️  Admin already exists with email:",
                process.env.ADMIN_EMAIL
            );
            process.exit(0);
        }

        // Create new admin
        const admin = await Admin.create({
            fullName: "System Administrator",
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: "admin",
        });

        console.log(`✅ Admin created successfully: ${admin.email}`);
    } catch (error) {
        console.error("❌ Error during admin creation:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

createAdmin();
