// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGODB_URI = 'mongodb+srv://apparaopuchakayala:apparao%407218@group-partician.nkz0t4g.mongodb.net/groupData?retryWrites=true&w=majority';
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
