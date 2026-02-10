import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
    console.log('Testing MONGO_URI:', process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connection successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
};

testConnection();
