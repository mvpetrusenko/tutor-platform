const mongoose = require('mongoose');

const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_platform';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            autoIndex: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;

