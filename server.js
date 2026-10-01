require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// PWA: Service Worker & Web App Manifest specific headers
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Proxies AI calls to Gemini or Anthropic, and falls back to a smart mock generator
const aiHandler = require('./api/ai');
app.post('/api/ai', aiHandler);

// Fallback to index.html for any other route (simple SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`SkillSphere running at http://localhost:${PORT}`);
  });
}

module.exports = app;
