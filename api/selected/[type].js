const { readJson, writeJson } = require('../_shared/storage');

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

    // Extract type from URL path for Vercel
    const type = req.url.split('/').pop() || req.query.type;

    try {
        if (req.method === 'GET') {
            const data = await readJson('selected.json', {});
            const selected = data[type] || [];
            res.json(selected);
        } else if (req.method === 'POST') {
            const selected = req.body;
            const data = await readJson('selected.json', {});
            data[type] = selected;
            await writeJson('selected.json', data);
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling selected materials:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};
