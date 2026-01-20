const { readJson, writeJson } = require('../../_shared/storage');

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
            // Extract id and type from URL path for Vercel
            const pathParts = req.url.split('/').filter(p => p);
            const type = pathParts[pathParts.length - 2];
            const id = pathParts[pathParts.length - 1] || req.query.id;
            
            const data = await readJson('materials.json', {});
            
            if (data[type]) {
                data[type] = data[type].filter(m => m.id !== id);
                await writeJson('materials.json', data);
            }
            
            res.json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
};
