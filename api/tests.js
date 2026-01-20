const { readJson, writeJson } = require('./_shared/storage');
const { v4: uuidv4 } = require('uuid');

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
            const data = await readJson('tests.json', { tests: [] });
            const tests = data.tests || [];
            res.json(tests);
        } else if (req.method === 'POST') {
            const test = req.body;
            
            if (!test.id) {
                test.id = uuidv4();
            }
            if (!test.createdAt) {
                test.createdAt = new Date().toISOString();
            }
            test.updatedAt = new Date().toISOString();
            
            const data = await readDataFile('tests.json');
            if (!data.tests) {
                data.tests = [];
            }
            
            const existingIndex = data.tests.findIndex(t => t.id === test.id || t.name === test.name);
            if (existingIndex !== -1) {
                data.tests[existingIndex] = test;
            } else {
                data.tests.push(test);
            }
            
            await writeJson('tests.json', data);
            res.json(test);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling tests:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
};
