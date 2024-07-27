const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const app = express();
dotenv.config();

const uploadDir = path.join(__dirname, 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const excelRoute = require('./routes/excelRoute');
const processRoute = require('./routes/processRoute');

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected from server');
  })
  .catch(err => console.error('MongoDB connection error:', err.message));

app.use('/api/excel-upload', excelRoute);
app.use('/api/excel-process', processRoute);

// Serve the static files from frontend
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Handle any other requests by sending back the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
