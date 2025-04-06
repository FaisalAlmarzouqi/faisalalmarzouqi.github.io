import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Use this workaround to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Prevent caching for login and profile pages
app.use('/index.html', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // Disable cache
  res.set('Pragma', 'no-cache'); // For HTTP/1.0
  res.set('Expires', '0'); // Prevent cache expiry
  next();
});

const AUTH_URL = "https://learn.reboot01.com/api/auth/signin";
const GRAPHQL_URL = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

// Proxy for login
app.post("/login", async (req, res) => {
  try {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to login." });
  }
});

// Proxy for GraphQL
app.post("/graphql", async (req, res) => {
  const { token, query, variables } = req.body;
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "GraphQL request failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
