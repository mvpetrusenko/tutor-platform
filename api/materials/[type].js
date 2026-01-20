const { getMaterials, saveMaterial } = require('../materials');

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
    const type = req.url.split('/').filter(p => p).pop() || req.query.type;
    req.query.type = type; // Set for the helper functions

    if (req.method === 'GET') {
        await getMaterials(req, res);
    } else if (req.method === 'POST') {
        await saveMaterial(req, res);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
