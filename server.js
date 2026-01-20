const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Helper function to read JSON file
async function readDataFile(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

// Helper function to write JSON file
async function writeDataFile(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize data directory on startup
ensureDataDir();

// ==================== MATERIALS API ====================

// Get all materials by type
app.get('/api/materials/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const data = await readDataFile('materials.json');
        const materials = data[type] || [];
        res.json(materials);
    } catch (error) {
        console.error('Error getting materials:', error);
        res.status(500).json({ error: 'Failed to get materials' });
    }
});

// Save material
app.post('/api/materials/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const material = req.body;
        
        if (!material.id) {
            material.id = uuidv4();
        }
        if (!material.createdAt) {
            material.createdAt = new Date().toISOString();
        }
        material.updatedAt = new Date().toISOString();
        
        const data = await readDataFile('materials.json');
        if (!data[type]) {
            data[type] = [];
        }
        
        // Check if material already exists
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
});

// Delete material
app.delete('/api/materials/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const data = await readDataFile('materials.json');
        
        if (data[type]) {
            data[type] = data[type].filter(m => m.id !== id);
            await writeDataFile('materials.json', data);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
});

// ==================== SELECTED MATERIALS API ====================

// Get selected materials
app.get('/api/selected/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const data = await readDataFile('selected.json');
        const selected = data[type] || [];
        res.json(selected);
    } catch (error) {
        console.error('Error getting selected materials:', error);
        res.status(500).json({ error: 'Failed to get selected materials' });
    }
});

// Save selected materials
app.post('/api/selected/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const selected = req.body;
        
        const data = await readDataFile('selected.json');
        data[type] = selected;
        await writeDataFile('selected.json', data);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving selected materials:', error);
        res.status(500).json({ error: 'Failed to save selected materials' });
    }
});

// ==================== HOMEWORK API ====================

// Get homework content
app.get('/api/homework', async (req, res) => {
    try {
        const data = await readDataFile('homework.json');
        res.json({ content: data.content || '' });
    } catch (error) {
        console.error('Error getting homework:', error);
        res.status(500).json({ error: 'Failed to get homework' });
    }
});

// Save homework content
app.post('/api/homework', async (req, res) => {
    try {
        const { content } = req.body;
        await writeDataFile('homework.json', { content, updatedAt: new Date().toISOString() });
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving homework:', error);
        res.status(500).json({ error: 'Failed to save homework' });
    }
});

// ==================== TESTS API ====================

// Get all tests
app.get('/api/tests', async (req, res) => {
    try {
        const data = await readDataFile('tests.json');
        const tests = data.tests || [];
        res.json(tests);
    } catch (error) {
        console.error('Error getting tests:', error);
        res.status(500).json({ error: 'Failed to get tests' });
    }
});

// Save test
app.post('/api/tests', async (req, res) => {
    try {
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
        
        // Check if test already exists
        const existingIndex = data.tests.findIndex(t => t.id === test.id || t.name === test.name);
        if (existingIndex !== -1) {
            data.tests[existingIndex] = test;
        } else {
            data.tests.push(test);
        }
        
        await writeDataFile('tests.json', data);
        res.json(test);
    } catch (error) {
        console.error('Error saving test:', error);
        res.status(500).json({ error: 'Failed to save test' });
    }
});

// Delete test
app.delete('/api/tests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readDataFile('tests.json');
        
        if (data.tests) {
            data.tests = data.tests.filter(t => t.id !== id);
            await writeDataFile('tests.json', data);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({ error: 'Failed to delete test' });
    }
});

// ==================== WHITEBOARD API ====================

// Get whiteboard drawing
app.get('/api/whiteboard', async (req, res) => {
    try {
        const data = await readDataFile('whiteboard.json');
        res.json({ drawing: data.drawing || null });
    } catch (error) {
        console.error('Error getting whiteboard:', error);
        res.status(500).json({ error: 'Failed to get whiteboard' });
    }
});

// Save whiteboard drawing
app.post('/api/whiteboard', async (req, res) => {
    try {
        const { drawing } = req.body;
        await writeDataFile('whiteboard.json', { drawing, updatedAt: new Date().toISOString() });
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving whiteboard:', error);
        res.status(500).json({ error: 'Failed to save whiteboard' });
    }
});

// ==================== USER PREFERENCES API ====================

// Get user preferences
app.get('/api/preferences', async (req, res) => {
    try {
        const data = await readDataFile('preferences.json');
        res.json(data);
    } catch (error) {
        console.error('Error getting preferences:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// Save user preferences
app.post('/api/preferences', async (req, res) => {
    try {
        const preferences = req.body;
        await writeDataFile('preferences.json', { ...preferences, updatedAt: new Date().toISOString() });
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving preferences:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
