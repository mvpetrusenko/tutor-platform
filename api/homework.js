const { readJson, writeJson } = require('./_shared/storage');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const data = await readJson('homework.json', { content: '' });
            res.json({ content: data.content || '' });
        } else if (req.method === 'POST') {
            const { content } = req.body;
            await writeJson('homework.json', { content, updatedAt: new Date().toISOString() });
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling homework:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};
