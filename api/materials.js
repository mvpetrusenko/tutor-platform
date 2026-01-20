const { readJson, writeJson } = require('./_shared/storage');
const { v4: uuidv4 } = require('uuid');

// GET /api/materials/:type
async function getMaterials(req, res) {
    try {
        const { type } = req.query;
        const data = await readJson('materials.json', {});
        const materials = data[type] || [];
        res.json(materials);
    } catch (error) {
        console.error('Error getting materials:', error);
        res.status(500).json({ error: 'Failed to get materials' });
    }
}

// POST /api/materials/:type
async function saveMaterial(req, res) {
    try {
        const { type } = req.query;
        const material = req.body;
        
        if (!material.id) {
            material.id = uuidv4();
        }
        if (!material.createdAt) {
            material.createdAt = new Date().toISOString();
        }
        material.updatedAt = new Date().toISOString();
        
        const data = await readJson('materials.json', {});
        if (!data[type]) {
            data[type] = [];
        }
        
        const existingIndex = data[type].findIndex(m => m.id === material.id);
        if (existingIndex !== -1) {
            data[type][existingIndex] = material;
        } else {
            data[type].push(material);
        }
        
        await writeDataFile('materials.json', data);
        res.json(material);
    } catch (error) {
        console.error('Error saving material:', error);
        res.status(500).json({ error: 'Failed to save material' });
    }
}

// DELETE /api/materials/:type/:id
async function deleteMaterial(req, res) {
    try {
        const { type, id } = req.query;
        const data = await readJson('materials.json', {});
        
        if (data[type]) {
            data[type] = data[type].filter(m => m.id !== id);
            await writeJson('materials.json', data);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
}

module.exports = { getMaterials, saveMaterial, deleteMaterial };
