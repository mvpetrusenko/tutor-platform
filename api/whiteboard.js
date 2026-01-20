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
            const data = await readJson('whiteboard.json', { drawing: null });
            res.json({ drawing: data.drawing || null });
        } else if (req.method === 'POST') {
            const { drawing } = req.body;
            await writeJson('whiteboard.json', { drawing, updatedAt: new Date().toISOString() });
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling whiteboard:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};
