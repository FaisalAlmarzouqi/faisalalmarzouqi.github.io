import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Disable caching for key pages
app.use('/index.html', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const GRAPHQL_URL = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

// Proxy GraphQL queries
app.post("/fetch-graphql", async (req, res) => {
  const authHeader = req.headers.authorization;
  const query = req.body.query;

  if (!authHeader || !query) {
    return res.status(400).json({ error: "Missing token or query" });
  }

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "GraphQL fetch failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
