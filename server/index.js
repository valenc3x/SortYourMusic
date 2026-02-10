import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Config endpoint — injects env vars into client
app.get('/config', (req, res) => {
  res.json({
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI || '',
  });
});

// Serve static build
app.use(express.static(path.join(__dirname, '..', 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
