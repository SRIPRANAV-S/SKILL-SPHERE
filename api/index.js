const aiHandler = require('./ai');

module.exports = async (req, res) => {
  const url = req.url || '';
  if (url === '/api/ai' || url === '/ai' || url.startsWith('/api/ai') || url.startsWith('/ai')) {
    return aiHandler(req, res);
  }
  return res.status(404).json({ error: 'Endpoint not found' });
};
