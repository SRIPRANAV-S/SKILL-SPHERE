require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxies AI calls to Anthropic so the API key never reaches the browser.
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Server is missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key.',
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'AI request failed' });
    }

    const text = (data.content || [])
      .map((block) => block.text || '')
      .join('\n')
      .trim();

    res.json({ text });
  } catch (err) {
    console.error('AI proxy error:', err);
    res.status(500).json({ error: 'Something went wrong calling the AI service.' });
  }
});

// Fallback to index.html for any other route (simple SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SkillSphere running at http://localhost:${PORT}`);
});
