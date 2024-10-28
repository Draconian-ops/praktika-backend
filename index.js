require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const User = require('./models/user');
const bcrypt = require('bcrypt')

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'https://praktika-one.vercel.app']
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Endpoint to handle Google Sign-In
app.post('/auth/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID
        });

        const payload = ticket.getPayload();
        const userId = payload['sub']; // Google user ID

        // Check if user already exists in the database
        let user = await User.findOne({ googleId: userId });
        if (!user) {
            // Create a new user in the database
            const newUser = new User({
                googleId: userId,
                name: payload.name,
                email: payload.email,
                // Add other fields as necessary
            });
            try {
                user = await newUser.save(); // Save the new user to the database
            } catch (saveError) {
                console.error('Error saving new user:', saveError);
                return res.status(500).json({ error: 'Error saving user' });
            }
        }

        // Respond with user info
        console.log('User logged in:', user);
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/sign-up', async(req, res) => {
    const {email, password, name} = req.body
    try {
        const userExists =await User.findOne({email})
        if (userExists) {
            return res.status(400).send("User Already Exists big head")
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = User.create({
            email: email, 
            password: hashedPassword,
            name: name
    })
    
        res.status(201).send({message:'sign-up successful', user: newUser, redirectUrl: '/html/login.html'})
    } catch (error) {
        console.log(error)
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
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



