require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT;
const JWT_SECRET = process.env.JWT_SECRET;

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'page.html'));
});

// User authentication (login)
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const response = await axios.post(AUTH_ENDPOINT, { login: username, password });
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Fetch user profile data
app.post('/graphql', async (req, res) => {
    const { token, query } = req.body;
    try {
        jwt.verify(token, JWT_SECRET);
        const response = await axios.post(GRAPHQL_ENDPOINT, { query });
        res.json(response.data);
    } catch (error) {
        res.status(403).json({ error: 'Unauthorized' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
