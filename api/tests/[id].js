const { readJson, writeJson } = require('../_shared/storage');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'DELETE') {
            // Extract id from URL path for Vercel
            const id = req.url.split('/').filter(p => p).pop() || req.query.id;
            req.query.id = id;
            
            const data = await readJson('tests.json', { tests: [] });
            
            if (data.tests) {
                data.tests = data.tests.filter(t => t.id !== id);
                await writeJson('tests.json', data);
            }
            
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};
