// Require express
const express = require('express');

const connectDB = require('./config/connectDB');

// Require routes
const userRouter = require('./routes/api/user');
const profileRouter = require('./routes/api/profile');
const postRouter = require('./routes/api/post');

// Initialize express
const app = express();

// MiddleWares
app.use(express.json());

// Connect the dataBase
connectDB();

// Routes
app.use('/api/user', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/post', postRouter);

// Create PORT
const PORT = process.env.PORT || 5000;

// Launch the server
app.listen(PORT, (error) => {
  error
    ? console.log('Could not run the server')
    : console.log(`The server is running on port ${PORT}...`);
});
