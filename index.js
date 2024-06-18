import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Content from './models/contentModel.js';
import User from './models/usersModel.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const secretKey = 'your_secret_key';

// Middleware to combine Content and User data
const combineContentAndUser = async (req, res, next) => {
    try {
        const contents = await Content.find({});
        const users = await User.find({});

        // Combine content and user data as needed
        const combinedData = {
            contents,
            users
        };

        // Attach combined data to request object for downstream middleware or route handlers
        req.combinedData = combinedData;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Route to get combined data of content and users
app.get('/', combineContentAndUser, (req, res) => {
    const { contents, users } = req.combinedData;

    // Prepare the combined response
    const combinedResponse = {
        contents,
        users
    };

    res.status(200).json(combinedResponse);
});

// Route for Content CRUD operations

// Get all contents
app.get('/content', async (req, res) => {
    try {
        const contents = await Content.find({});
        res.status(200).json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get content by ID
app.get('/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findById(id);
        if (!content) {
            return res.status(404).json({ message: `Content with id ${id} not found` });
        }
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new content
app.post('/content', async (req, res) => {
    try {
        const content = await Content.create(req.body);
        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update content by ID
app.put('/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findByIdAndUpdate(id, req.body, { new: true });
        if (!content) {
            return res.status(404).json({ message: `Content with id ${id} not found` });
        }
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete content by ID
app.delete('/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findByIdAndDelete(id);
        if (!content) {
            return res.status(404).json({ message: `Content with id ${id} not found` });
        }
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route for User registration
app.post('/signup', async (req, res) => {
    try {
        const { email, password, confirm_password } = req.body;

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please choose a different email." });
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user data
        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route for User login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });
