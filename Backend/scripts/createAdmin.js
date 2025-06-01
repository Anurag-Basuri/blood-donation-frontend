import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.models.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        // Create new admin
        const admin = await Admin.create({
            email: process.env.ADMIN_EMAIL || 'admin@blooddonation.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123',
            fullName: 'System Administrator',
            role: 'admin'
        });

        console.log('Admin created successfully:', admin.email);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createAdmin();