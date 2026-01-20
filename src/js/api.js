// API Service Layer for Backend Communication
// This file provides functions to sync data with the backend server

// Detect environment and set API base URL
const API_BASE_URL = (() => {
    // In production (Vercel), use relative URLs
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api';
    }
    // In development, use localhost
    return 'http://localhost:3000/api';
})();

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API call failed (${endpoint}):`, error);
        // Return null or empty data on error to allow fallback to localStorage
        return null;
    }
}

// ==================== MATERIALS API ====================

async function getMaterialsFromBackend(type) {
    return await apiCall(`/materials/${type}`);
}

async function saveMaterialToBackend(type, material) {
    return await apiCall(`/materials/${type}`, 'POST', material);
}

async function deleteMaterialFromBackend(type, id) {
    return await apiCall(`/materials/${type}/${id}`, 'DELETE');
}

// ==================== SELECTED MATERIALS API ====================

async function getSelectedMaterialsFromBackend(type) {
    return await apiCall(`/selected/${type}`);
}

async function saveSelectedMaterialsToBackend(type, materials) {
    return await apiCall(`/selected/${type}`, 'POST', materials);
}

// ==================== HOMEWORK API ====================

async function getHomeworkFromBackend() {
    const result = await apiCall('/homework');
    return result ? result.content : null;
}

async function saveHomeworkToBackend(content) {
    return await apiCall('/homework', 'POST', { content });
}

// ==================== TESTS API ====================

async function getTestsFromBackend() {
    return await apiCall('/tests');
}

async function saveTestToBackend(test) {
    return await apiCall('/tests', 'POST', test);
}

async function deleteTestFromBackend(id) {
    return await apiCall(`/tests/${id}`, 'DELETE');
}

// ==================== WHITEBOARD API ====================

async function getWhiteboardFromBackend() {
    const result = await apiCall('/whiteboard');
    return result ? result.drawing : null;
}

async function saveWhiteboardToBackend(drawing) {
    return await apiCall('/whiteboard', 'POST', { drawing });
}

// ==================== PREFERENCES API ====================

async function getPreferencesFromBackend() {
    return await apiCall('/preferences');
}

async function savePreferencesToBackend(preferences) {
    return await apiCall('/preferences', 'POST', preferences);
}

// ==================== SYNC FUNCTIONS ====================

// Sync localStorage data to backend (called on page load)
async function syncToBackend() {
    try {
        // Sync materials
        const materialTypes = ['photos', 'texts', 'exercises', 'homework'];
        for (const type of materialTypes) {
            const materials = JSON.parse(localStorage.getItem(`materials${type.charAt(0).toUpperCase() + type.slice(1)}`) || '[]');
            if (materials.length > 0) {
                for (const material of materials) {
                    await saveMaterialToBackend(type, material);
                }
            }
        }
        
        // Sync selected materials
        const selectedTypes = ['photos', 'texts', 'exercises', 'homework'];
        for (const type of selectedTypes) {
            const key = type === 'photos' ? 'selectedPhotos' : `selected${type.charAt(0).toUpperCase() + type.slice(1)}s`;
            const selected = JSON.parse(localStorage.getItem(key) || '[]');
            if (selected.length > 0) {
                await saveSelectedMaterialsToBackend(type, selected);
            }
        }
        
        // Sync homework
        const homeworkContent = localStorage.getItem('homepageContent');
        if (homeworkContent) {
            await saveHomeworkToBackend(homeworkContent);
        }
        
        // Sync tests
        const tests = JSON.parse(localStorage.getItem('savedTests') || '[]');
        if (tests.length > 0) {
            for (const test of tests) {
                await saveTestToBackend(test);
            }
        }
        
        // Sync whiteboard
        const whiteboardDrawing = localStorage.getItem('whiteboardDrawing');
        if (whiteboardDrawing) {
            await saveWhiteboardToBackend(whiteboardDrawing);
        }
        
        // Sync preferences
        const theme = localStorage.getItem('theme');
        const animation = localStorage.getItem('backgroundAnimation');
        if (theme || animation) {
            await savePreferencesToBackend({ theme, animation });
        }
        
        console.log('Sync to backend completed');
    } catch (error) {
        console.error('Error syncing to backend:', error);
    }
}

// Load data from backend and merge with localStorage
async function loadFromBackend() {
    try {
        // Load materials
        const materialTypes = ['photos', 'texts', 'exercises', 'homework'];
        for (const type of materialTypes) {
            const backendMaterials = await getMaterialsFromBackend(type);
            if (backendMaterials && backendMaterials.length > 0) {
                const storageKey = `materials${type.charAt(0).toUpperCase() + type.slice(1)}`;
                const localMaterials = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                // Merge: backend takes priority, but keep local items not in backend
                const merged = [...backendMaterials];
                localMaterials.forEach(local => {
                    if (!merged.find(m => m.id === local.id)) {
                        merged.push(local);
                    }
                });
                
                localStorage.setItem(storageKey, JSON.stringify(merged));
            }
        }
        
        // Load selected materials
        const selectedTypes = ['photos', 'texts', 'exercises', 'homework'];
        for (const type of selectedTypes) {
            const backendSelected = await getSelectedMaterialsFromBackend(type);
            if (backendSelected && backendSelected.length > 0) {
                const key = type === 'photos' ? 'selectedPhotos' : `selected${type.charAt(0).toUpperCase() + type.slice(1)}s`;
                localStorage.setItem(key, JSON.stringify(backendSelected));
            }
        }
        
        // Load homework
        const backendHomework = await getHomeworkFromBackend();
        if (backendHomework) {
            localStorage.setItem('homepageContent', backendHomework);
        }
        
        // Load tests
        const backendTests = await getTestsFromBackend();
        if (backendTests && backendTests.length > 0) {
            const localTests = JSON.parse(localStorage.getItem('savedTests') || '[]');
            const merged = [...backendTests];
            localTests.forEach(local => {
                if (!merged.find(t => t.id === local.id || t.name === local.name)) {
                    merged.push(local);
                }
            });
            localStorage.setItem('savedTests', JSON.stringify(merged));
        }
        
        // Load whiteboard
        const backendWhiteboard = await getWhiteboardFromBackend();
        if (backendWhiteboard) {
            localStorage.setItem('whiteboardDrawing', backendWhiteboard);
        }
        
        // Load preferences
        const backendPrefs = await getPreferencesFromBackend();
        if (backendPrefs) {
            if (backendPrefs.theme) {
                localStorage.setItem('theme', backendPrefs.theme);
                document.documentElement.setAttribute('data-theme', backendPrefs.theme);
            }
            if (backendPrefs.animation) {
                localStorage.setItem('backgroundAnimation', backendPrefs.animation);
            }
        }
        
        console.log('Load from backend completed');
    } catch (error) {
        console.error('Error loading from backend:', error);
    }
}

// ==================== PROGRESS API ====================

async function getProgressFromBackend() {
    return await apiCall('/progress');
}

async function saveProgressToBackend(progressData) {
    return await apiCall('/progress', 'POST', progressData);
}

// Check if backend is available
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.apiService = {
        getMaterialsFromBackend,
        saveMaterialToBackend,
        deleteMaterialFromBackend,
        getSelectedMaterialsFromBackend,
        saveSelectedMaterialsToBackend,
        getHomeworkFromBackend,
        saveHomeworkToBackend,
        getTestsFromBackend,
        saveTestToBackend,
        deleteTestFromBackend,
        getWhiteboardFromBackend,
        saveWhiteboardToBackend,
        getPreferencesFromBackend,
        savePreferencesToBackend,
        getProgressFromBackend,
        saveProgressToBackend,
        syncToBackend,
        loadFromBackend,
        checkBackendHealth
    };
}
