require('dotenv').config();
const express = require('express');
const axios = require("axios")
const mongoose = require('mongoose');
const cors = require('cors');
const UserInfo = require('./models/user');
const bcrypt = require('bcrypt');

const allowedOrigins = ['http://127.0.0.1:5500', 'https://praktika-one.vercel.app'];

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: allowedOrigins, // Use your allowed origins here
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify methods you want to allow
    // credentials: true, // Include credentials if needed
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));


// Basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Sign-up endpoint
app.post('/sign-up', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const userExists = await UserInfo.findOne({ email });
        if (userExists) {
            return res.status(400).send("User Already Exists big head");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await UserInfo.create({
            email: email, 
            password: hashedPassword,
            name: name
        });
    
        res.status(201).send({ message: 'Sign-up successful', user: newUser, redirectUrl: '/html/login.html' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error during sign-up');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await UserInfo.findOne({ email });
        if (!user) {
            return res.status(401).send("Invalid email or password");
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid email or password");
        }

        // Successful login response
        res.status(200).send({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error');
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
