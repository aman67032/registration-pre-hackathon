import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://solomaze67032_db_user:hackjklu2025cta@registration.hxjfaww.mongodb.net/prehackathon?retryWrites=true&w=majority&appName=REGISTRATION';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected successfully');
        console.log(`   Database: Data_Collection_Pre-Hackthon`);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
