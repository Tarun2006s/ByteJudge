require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth_routes');
const problemRoutes = require('./routes/problem_routes');
const submissionRoutes = require('./routes/submission_routes');
const DBconnection = require('./database/db');

const app = express();

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', authRoutes);
app.use('/problems', problemRoutes);
app.use('/', submissionRoutes);

const startServer = async () => {
  try {
    await DBconnection();
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error.message);
    process.exit(1);
  }
};

startServer();
