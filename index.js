const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 5000;
const Content = require('./models/contentModel');
const User = require('./models/usersModel');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cors());  // Tambahkan cors middleware jika diperlukan

const secretKey = 'your_secret_key';

app.get('/content', async (req, res) => {
    try {
        const contents = await Content.find({});
        res.status(200).json(contents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findById(id);
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/content', async (req, res) => {
    try {
        const content = await Content.create(req.body);
        res.status(200).json(content);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

app.put('/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findByIdAndUpdate(id, req.body, { new: true });  // Menambahkan opsi { new: true }
        if (!content) {
            return res.status(404).json({ message: `Konten dengan id ${id} tidak ditemukan` });
        }
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findByIdAndDelete(id);
        if (!content) {
            return res.status(404).json({ message: `Konten dengan id ${id} tidak ditemukan` });
        }
        res.status(200).json(content);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Register

app.post('/signup', async (req, res) => {
    try {
        const { email, password, confirm_password } = req.body;

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please choose a different email." });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match." });
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user data
        const userData = {
            email,
            password: hashedPassword,
            confirm_password: hashedPassword
        };

        // Save user to the database
        const newUser = await User.create(userData);

        res.status(201).json(newUser);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});


// Endpoint login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Buat token JWT
        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});






mongoose.connect('mongodb://sayuti123:ucok123@ac-huf940l-shard-00-00.45ehmnd.mongodb.net:27017,ac-huf940l-shard-00-01.45ehmnd.mongodb.net:27017,ac-huf940l-shard-00-02.45ehmnd.mongodb.net:27017/Legacy-API?ssl=true&replicaSet=atlas-57pm5q-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });
        console.log('Connected to mongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error.message);
    });




