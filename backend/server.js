// backend/server.js
import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
app.use(cookieParser());

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT;
const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT;
const JWT_SECRET = process.env.JWT_SECRET;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'page.html'));
});

// backend/server.js (update signin & graphql routes only)

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
      await axios.post(AUTH_ENDPOINT, { login: username, password });
  
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: 'Strict',
        maxAge: 3600000, // 1 hour
      });
  
      res.json({ message: 'Logged in successfully' });
    } catch (error) {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
  
  app.post('/graphql', async (req, res) => {
    const { query } = req.body;
    const token = req.cookies?.token;
  
    try {
      jwt.verify(token, JWT_SECRET);
      const response = await axios.post(GRAPHQL_ENDPOINT, { query });
      res.json(response.data);
    } catch (error) {
      res.status(403).json({ error: 'Unauthorized or invalid token' });
    }
  });
  

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
