// Modern Alert System (same as materials page)
function showAlert(type, title, message, onConfirm = null) {
    const container = document.getElementById('alertContainer');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert ${type}`;

    const icons = {
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌'
    };

    alert.innerHTML = `
        <span class="alert-icon">${icons[type] || icons.info}</span>
        <div class="alert-content">
            <h4 class="alert-title">${title}</h4>
            <p class="alert-message">${message}</p>
        </div>
        <button class="alert-close" aria-label="Close">×</button>
    `;

    container.appendChild(alert);

    // Close button
    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
        removeAlert(alert);
    });

    // Auto-remove after 4 seconds (or 6 seconds for warnings with confirm)
    const autoRemove = setTimeout(() => {
        removeAlert(alert);
    }, onConfirm ? 6000 : 4000);

    // If there's a confirm action, add confirm button
    if (onConfirm) {
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.cssText = `
            margin-top: 8px;
            padding: 6px 16px;
            background: var(--accent-gradient);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        confirmBtn.onmouseover = () => {
            confirmBtn.style.transform = 'scale(1.05)';
            confirmBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        };
        confirmBtn.onmouseout = () => {
            confirmBtn.style.transform = 'scale(1)';
            confirmBtn.style.boxShadow = 'none';
        };
        confirmBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            removeAlert(alert);
            onConfirm();
        });
        alert.querySelector('.alert-content').appendChild(confirmBtn);
    }

    // Remove on click outside (for warnings)
    if (onConfirm) {
        const clickHandler = (e) => {
            if (!alert.contains(e.target)) {
                clearTimeout(autoRemove);
                removeAlert(alert);
                document.removeEventListener('click', clickHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', clickHandler), 100);
    }
}

function removeAlert(alert) {
    alert.classList.add('hiding');
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 300);
}

// Initialize backend sync on page load
window.addEventListener('load', async () => {
    // Check if backend is available and load data
    if (window.apiService) {
        const isBackendAvailable = await window.apiService.checkBackendHealth();
        if (isBackendAvailable) {
            await window.apiService.loadFromBackend();
            // Sync existing localStorage data to backend
            setTimeout(() => {
                window.apiService.syncToBackend();
            }, 1000);
        }
    }
});

// Theme Management
const themeSwitcher = document.getElementById('themeSwitcher');
const themeIcon = themeSwitcher ? themeSwitcher.querySelector('.theme-icon') : null;

// Load saved theme or default to light
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeSwitcher.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Animation Switcher Management
const animationSwitcher = document.getElementById('animationSwitcher');
const animationMenu = document.getElementById('animationMenu');
const animationOptions = document.querySelectorAll('.animation-option');
const bgAnimation = document.getElementById('bgAnimation');

// Load saved animation or default to none
const currentAnimation = localStorage.getItem('backgroundAnimation') || 'none';
bgAnimation.setAttribute('data-animation', currentAnimation);
updateActiveAnimationOption(currentAnimation);

// Sync animation preference to backend
if (window.apiService) {
    window.apiService.savePreferencesToBackend({ animation: currentAnimation });
}

animationSwitcher.addEventListener('click', (e) => {
    e.stopPropagation();
    animationMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!animationSwitcher.contains(e.target) && !animationMenu.contains(e.target)) {
        animationMenu.classList.remove('active');
    }
});

animationOptions.forEach(option => {
    option.addEventListener('click', async () => {
        const animation = option.getAttribute('data-animation');
        bgAnimation.setAttribute('data-animation', animation);
        localStorage.setItem('backgroundAnimation', animation);
        updateActiveAnimationOption(animation);
        animationMenu.classList.remove('active');
        
        // Sync to backend
        if (window.apiService) {
            await window.apiService.savePreferencesToBackend({ animation });
        }
    });
});

function updateActiveAnimationOption(animation) {
    animationOptions.forEach(option => {
        if (option.getAttribute('data-animation') === animation) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// About Me Dropdown
const aboutToggle = document.getElementById('aboutToggle');
const aboutSection = aboutToggle.closest('.about-section');
const aboutContent = document.getElementById('aboutContent');

aboutToggle.addEventListener('click', () => {
    aboutSection.classList.toggle('active');
});

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Materials Management
function getMaterials() {
    return {
        photos: JSON.parse(localStorage.getItem('materialsPhotos') || '[]'),
        texts: JSON.parse(localStorage.getItem('materialsTexts') || '[]'),
        exercises: JSON.parse(localStorage.getItem('materialsExercises') || '[]'),
        homework: JSON.parse(localStorage.getItem('materialsHomework') || '[]')
    };
}

// File Upload Management
const fileInputs = {
    photo: document.getElementById('photoUpload'),
    text: document.getElementById('textUpload'),
    exercise: document.getElementById('exerciseUpload'),
    homework: document.getElementById('homeworkUpload')
};

const previews = {
    photo: document.getElementById('photoPreview'),
    text: document.getElementById('textPreview'),
    exercise: document.getElementById('exercisePreview'),
    homework: document.getElementById('homeworkPreview')
};

// Download material function
// Delete material from library (called from materials selector)
function deleteMaterialFromLibrary(type, material) {
    // Confirm deletion
    showAlert('warning', 'Delete Material', `Are you sure you want to delete "${material.name}" from your materials library? This will also remove it from any selected materials on the home page.`, () => {
        // Get materials from localStorage
        const typeMap = {
            photos: 'materialsPhotos',
            texts: 'materialsTexts',
            exercises: 'materialsExercises',
            homework: 'materialsHomework'
        };
        
        const storageKey = typeMap[type];
        if (!storageKey) {
            console.error('Invalid material type:', type);
            return;
        }
        
        // Get current materials
        const materials = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Remove the material
        const materialId = parseFloat(material.id);
        const updated = materials.filter(item => {
            const itemId = parseFloat(item.id);
            return itemId !== materialId && String(item.id) !== String(material.id);
        });
        
        // Save updated materials
        localStorage.setItem(storageKey, JSON.stringify(updated));
        
        // Also remove from selected materials on home page
        const previewType = type === 'photos' ? 'photo' : type.slice(0, -1);
        const key = previewType.charAt(0).toUpperCase() + previewType.slice(1);
        const selectedKey = `selected${key}s`;
        const selected = JSON.parse(localStorage.getItem(selectedKey) || '[]');
        const updatedSelected = selected.filter(item => {
            const itemId = parseFloat(item.id);
            return itemId !== materialId && String(item.id) !== String(material.id);
        });
        localStorage.setItem(selectedKey, JSON.stringify(updatedSelected));
        
        // Refresh the selector display
        showMaterialsSelector(type);
        
        // Refresh displayed materials on home page
        displaySelectedMaterials(type);
        
        showAlert('success', 'Deleted', `"${material.name}" has been deleted from your materials library.`);
    });
}

function downloadMaterial(material, type) {
    try {
        const dataUrl = material.data;
        const filename = material.name;
        
        if (type === 'photos' && material.type === 'image') {
            // For images, convert data URL to blob
            // Handle both data:image/... and base64 formats
            let base64Data = dataUrl;
            let mimeType = 'image/png'; // default
            
            if (dataUrl.includes(',')) {
                const parts = dataUrl.split(',');
                const header = parts[0];
                base64Data = parts[1];
                
                // Extract MIME type from header if present
                if (header.includes('data:')) {
                    const mimeMatch = header.match(/data:([^;]+)/);
                    if (mimeMatch) {
                        mimeType = mimeMatch[1];
                    }
                }
            }
            
            try {
                // Convert base64 to blob
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });
                
                // Create download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (error) {
                console.error('Error converting image to blob:', error);
                // Fallback: try using fetch
                fetch(dataUrl).then(response => response.blob()).then(blobData => {
                    const url = URL.createObjectURL(blobData);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 100);
                }).catch(err => {
                    console.error('Error downloading image:', err);
                    showAlert('error', 'Error', 'Error downloading file. Please try again.');
                });
            }
            return;
        } else {
            // For other files, try to determine MIME type from extension
            const extension = filename.split('.').pop().toLowerCase();
            const mimeTypes = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt': 'text/plain'
            };
            const mimeType = mimeTypes[extension] || 'application/octet-stream';
            
            // Convert base64 data URL to blob
            let base64Data = dataUrl;
            if (dataUrl.includes(',')) {
                base64Data = dataUrl.split(',')[1];
            }
            
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        }
    } catch (error) {
        console.error('Error downloading material:', error);
        showAlert('error', 'Error', 'Error downloading file. Please try again.');
    }
}

// Materials Selector Functions
function showMaterialsSelector(type) {
    const selector = document.getElementById(`${type}Selector`);
    if (!selector) {
        console.error(`Selector not found: ${type}Selector`);
        return;
    }
    
    // If this is the photo selector, temporarily hide the photo overlay
    if (type === 'photos') {
        const photoCard = document.querySelector('.photo-card');
        if (photoCard) {
            const photoOverlay = photoCard.querySelector('.photo-overlay');
            if (photoOverlay) {
                photoOverlay.style.display = 'none';
            }
        }
    }
    
    const materials = getMaterials();
    const materialList = materials[type] || [];
    const grid = document.getElementById(`${type}SelectorGrid`);
    
    if (!grid) {
        console.error(`Grid not found: ${type}SelectorGrid`);
        return;
    }
    
    grid.innerHTML = '';
    
    if (materialList.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 20px;">No materials available. Go to Materials page to upload.</p>';
    } else {
        materialList.forEach(material => {
            const item = document.createElement('div');
            item.className = 'material-select-item';
            item.dataset.id = material.id;
            item.style.cssText = `
                position: relative;
                overflow: visible;
                min-height: 140px;
            `;
            
            // Create container for content
            const contentDiv = document.createElement('div');
            contentDiv.style.cssText = 'position: relative; width: 100%; height: 100%;';
            
            if (type === 'photos' && material.type === 'image') {
                contentDiv.innerHTML = `
                    <img src="${material.data}" alt="${material.name}" class="material-select-image">
                    <p class="material-select-name">${material.name}</p>
                `;
            } else {
                const icons = {
                    texts: '📄',
                    exercises: '✏️',
                    homework: '📚'
                };
                contentDiv.innerHTML = `
                    <div class="material-select-icon">${icons[type] || '📄'}</div>
                    <p class="material-select-name">${material.name}</p>
                `;
            }
            
            // Create action buttons container
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'material-select-actions';
            actionsDiv.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                display: flex;
                gap: 8px;
                z-index: 100;
            `;
            
            // Delete button (to remove from materials library)
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = 'Delete from Library';
            deleteBtn.style.cssText = `
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
                z-index: 101;
            `;
            deleteBtn.onmouseover = () => {
                deleteBtn.style.transform = 'scale(1.1)';
                deleteBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.5)';
            };
            deleteBtn.onmouseout = () => {
                deleteBtn.style.transform = 'scale(1)';
                deleteBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            };
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteMaterialFromLibrary(type, material);
            };
            
            // Download button
            const downloadBtn = document.createElement('button');
            downloadBtn.innerHTML = '⬇️';
            downloadBtn.title = 'Download';
            downloadBtn.style.cssText = `
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                z-index: 101;
            `;
            downloadBtn.onmouseover = () => {
                downloadBtn.style.transform = 'scale(1.1)';
                downloadBtn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.5)';
            };
            downloadBtn.onmouseout = () => {
                downloadBtn.style.transform = 'scale(1)';
                downloadBtn.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
            };
            downloadBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                downloadMaterial(material, type);
            };
            
            // Select button
            const selectBtn = document.createElement('button');
            selectBtn.innerHTML = '✓';
            selectBtn.title = 'Select';
            selectBtn.style.cssText = `
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(129, 140, 248, 0.3);
                z-index: 101;
            `;
            selectBtn.onmouseover = () => {
                selectBtn.style.transform = 'scale(1.1)';
                selectBtn.style.boxShadow = '0 4px 12px rgba(129, 140, 248, 0.5)';
            };
            selectBtn.onmouseout = () => {
                selectBtn.style.transform = 'scale(1)';
                selectBtn.style.boxShadow = '0 2px 8px rgba(129, 140, 248, 0.3)';
            };
            selectBtn.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                selectMaterial(type, material);
            };
            
            actionsDiv.appendChild(deleteBtn);
            actionsDiv.appendChild(downloadBtn);
            actionsDiv.appendChild(selectBtn);
            
            item.appendChild(contentDiv);
            item.appendChild(actionsDiv);
            
            // Also allow clicking the item itself to select
            contentDiv.addEventListener('click', () => {
                selectMaterial(type, material);
            });
            
            grid.appendChild(item);
        });
    }
    
    selector.style.display = 'block';
    selector.style.visibility = 'visible';
    selector.style.opacity = '1';
    selector.style.zIndex = '1002';
}

function closeMaterialsSelector(type) {
    const selector = document.getElementById(`${type}Selector`);
    if (selector) {
        selector.style.display = 'none';
    }
    
    // If this is the photo selector, restore the photo overlay if there are selected photos
    if (type === 'photos') {
        const selected = getSelectedMaterials('photos');
        if (selected.length > 0) {
            const photoCard = document.querySelector('.photo-card');
            if (photoCard) {
                const photoOverlay = photoCard.querySelector('.photo-overlay');
                if (photoOverlay) {
                    photoOverlay.style.display = '';
                }
            }
        }
    }
}

// Choose from library buttons
if (document.getElementById('choosePhotoBtn')) {
    document.getElementById('choosePhotoBtn').addEventListener('click', () => {
        showMaterialsSelector('photos');
    });
    document.getElementById('closePhotoSelector').addEventListener('click', () => {
        closeMaterialsSelector('photos');
    });
}

if (document.getElementById('chooseTextBtn')) {
    document.getElementById('chooseTextBtn').addEventListener('click', () => {
        showMaterialsSelector('texts');
    });
    document.getElementById('closeTextSelector').addEventListener('click', () => {
        closeMaterialsSelector('texts');
    });
}

if (document.getElementById('chooseExerciseBtn')) {
    document.getElementById('chooseExerciseBtn').addEventListener('click', () => {
        showMaterialsSelector('exercises');
    });
    document.getElementById('closeExerciseSelector').addEventListener('click', () => {
        closeMaterialsSelector('exercises');
    });
}

if (document.getElementById('chooseHomeworkBtn')) {
    document.getElementById('chooseHomeworkBtn').addEventListener('click', () => {
        showMaterialsSelector('homework');
    });
    document.getElementById('closeHomeworkSelector').addEventListener('click', () => {
        closeMaterialsSelector('homework');
    });
}

// Homepage Editor Functionality
const homepageTextarea = document.getElementById('homepageTextarea');
const saveHomepageBtn = document.getElementById('saveHomepageBtn');
const clearHomepageBtn = document.getElementById('clearHomepageBtn');

if (homepageTextarea && saveHomepageBtn && clearHomepageBtn) {
    // Load saved homepage content
    const savedContent = localStorage.getItem('homepageContent');
    if (savedContent) {
        homepageTextarea.value = savedContent;
    }
    
    // Save button functionality
    saveHomepageBtn.addEventListener('click', async () => {
        const content = homepageTextarea.value;
        localStorage.setItem('homepageContent', content);
        
        // Sync to backend
        if (window.apiService) {
            await window.apiService.saveHomeworkToBackend(content);
        }
        
        showAlert('success', 'Saved', 'Homepage content saved successfully!');
    });
    
    // Clear button functionality
    clearHomepageBtn.addEventListener('click', () => {
        showAlert('warning', 'Clear Content', 'Are you sure you want to clear all text? This action cannot be undone.', () => {
            homepageTextarea.value = '';
            localStorage.removeItem('homepageContent');
            showAlert('success', 'Cleared', 'Content cleared successfully!');
        });
    });
}

// Load saved selections on page load
window.addEventListener('load', () => {
    // Ensure all selectors are hidden on page load
    ['photos', 'texts', 'exercises', 'homework'].forEach(type => {
        const selector = document.getElementById(`${type}Selector`);
        if (selector) {
            selector.style.display = 'none';
        }
    });
    
    // Load and display selected materials
    ['photo', 'text', 'exercise', 'homework'].forEach(type => {
        const materialType = type === 'photo' ? 'photos' : type + 's';
        displaySelectedMaterials(materialType);
    });
});

// Get selected materials for a type
function getSelectedMaterials(type) {
    const previewType = type === 'photos' ? 'photo' : type.slice(0, -1);
    const key = previewType.charAt(0).toUpperCase() + previewType.slice(1);
    const saved = localStorage.getItem(`selected${key}s`) || '[]';
    try {
        return JSON.parse(saved);
    } catch (e) {
        return [];
    }
}

// Save selected materials for a type
function saveSelectedMaterials(type, materials) {
    const previewType = type === 'photos' ? 'photo' : type.slice(0, -1);
    const key = previewType.charAt(0).toUpperCase() + previewType.slice(1);
    localStorage.setItem(`selected${key}s`, JSON.stringify(materials));
}

// Display all selected materials in preview
function displaySelectedMaterials(type) {
    const previewType = type === 'photos' ? 'photo' : type.slice(0, -1);
    const preview = previews[previewType];
    if (!preview) return;
    
    const selected = getSelectedMaterials(type);
    
    // Special handling for photos - overlay the entire section
    if (type === 'photos') {
        const photoCard = document.querySelector('.photo-card');
        if (!photoCard) return;
        
        // Get all elements to hide/show
        const uploadIcon = photoCard.querySelector('.upload-icon');
        const uploadTitle = photoCard.querySelector('h2');
        const uploadDescription = photoCard.querySelector('.upload-description');
        const uploadButtons = photoCard.querySelector('.upload-buttons');
        
        if (selected.length === 0) {
            // No photos selected - show normal content
            preview.innerHTML = '';
            preview.style.display = '';
            if (uploadIcon) uploadIcon.style.display = '';
            if (uploadTitle) uploadTitle.style.display = '';
            if (uploadDescription) uploadDescription.style.display = '';
            if (uploadButtons) uploadButtons.style.display = '';
            
            // Remove any existing photo overlay
            const existingOverlay = photoCard.querySelector('.photo-overlay');
            if (existingOverlay) existingOverlay.remove();
            
            return;
        }
        
        // Hide normal content
        if (uploadIcon) uploadIcon.style.display = 'none';
        if (uploadTitle) uploadTitle.style.display = 'none';
        if (uploadDescription) uploadDescription.style.display = 'none';
        if (uploadButtons) uploadButtons.style.display = 'none';
        
        // Remove existing overlay if any
        const existingOverlay = photoCard.querySelector('.photo-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        // Create photo overlay that covers the entire card
        const photoOverlay = document.createElement('div');
        photoOverlay.className = 'photo-overlay';
        photoOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            border-radius: 24px;
            overflow: hidden;
            z-index: 5;
        `;
        
        // Display the first photo (or all if multiple)
        selected.forEach((material, index) => {
            if (material.type === 'image') {
                const materialItem = document.createElement('div');
                materialItem.style.cssText = `
                    position: ${index === 0 ? 'absolute' : 'relative'};
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    ${index > 0 ? 'margin-top: 8px;' : ''}
                `;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'material-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.style.cssText = `
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 22px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 20;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                `;
                deleteBtn.onmouseover = () => {
                    deleteBtn.style.transform = 'scale(1.15)';
                    deleteBtn.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.6)';
                };
                deleteBtn.onmouseout = () => {
                    deleteBtn.style.transform = 'scale(1)';
                    deleteBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                };
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    const updated = selected.filter(item => item.id !== material.id);
                    saveSelectedMaterials(type, updated);
                    displaySelectedMaterials(type);
                };
                
                const img = document.createElement('img');
                img.src = material.data;
                img.alt = material.name;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
                materialItem.appendChild(img);
                materialItem.appendChild(deleteBtn);
                photoOverlay.appendChild(materialItem);
            }
        });
        
        // Make sure the card is positioned relative
        photoCard.style.position = 'relative';
        photoCard.appendChild(photoOverlay);
        
        // Clear the preview area
        preview.innerHTML = '';
        preview.style.display = 'none';
    } else if (type === 'texts') {
        // Special handling for texts - overlay the entire section with book reader
        const textCard = document.querySelector('.upload-right .upload-card');
        if (!textCard) {
            console.error('Text card not found!');
            return;
        }
        
        console.log('Displaying text materials. Selected count:', selected.length);
        
        // Get all elements to hide/show
        const uploadIcon = textCard.querySelector('.upload-icon');
        const uploadTitle = textCard.querySelector('h2');
        const uploadDescription = textCard.querySelector('.upload-description');
        const uploadButtons = textCard.querySelector('.upload-buttons');
        
        if (selected.length === 0) {
            // No texts selected - show normal content
            preview.innerHTML = '';
            preview.style.display = '';
            if (uploadIcon) uploadIcon.style.display = '';
            if (uploadTitle) uploadTitle.style.display = '';
            if (uploadDescription) uploadDescription.style.display = '';
            if (uploadButtons) uploadButtons.style.display = '';
            
            // Remove any existing text overlay
            const existingOverlay = textCard.querySelector('.text-overlay');
            if (existingOverlay) existingOverlay.remove();
            
            return;
        }
        
        // Hide normal content
        if (uploadIcon) uploadIcon.style.display = 'none';
        if (uploadTitle) uploadTitle.style.display = 'none';
        if (uploadDescription) uploadDescription.style.display = 'none';
        if (uploadButtons) uploadButtons.style.display = 'none';
        
        // Remove existing overlay if any
        const existingOverlay = textCard.querySelector('.text-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        // Create text overlay that covers the entire card
        const textOverlay = document.createElement('div');
        textOverlay.className = 'text-overlay';
        textOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            border-radius: 24px;
            overflow: hidden;
            z-index: 5;
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
        `;
        
        // Get the first selected text
        const material = selected[0];
        
        // Create header with delete button
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--glass-border);
        `;
        
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            margin-right: 12px;
        `;
        title.textContent = material.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'material-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        `;
        deleteBtn.onmouseover = () => {
            deleteBtn.style.transform = 'scale(1.1)';
            deleteBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.5)';
        };
        deleteBtn.onmouseout = () => {
            deleteBtn.style.transform = 'scale(1)';
            deleteBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
        };
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            const updated = selected.filter(item => item.id !== material.id);
            saveSelectedMaterials(type, updated);
            displaySelectedMaterials(type);
        };
        
        header.appendChild(title);
        header.appendChild(deleteBtn);
        
        // Create text reader content area
        const textContent = document.createElement('div');
        textContent.className = 'text-reader-content';
        textContent.style.cssText = `
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            overflow-x: hidden;
            font-size: 16px;
            line-height: 1.8;
            color: var(--text-primary);
            font-family: 'Georgia', 'Times New Roman', serif;
            background: rgba(255, 255, 255, 0.02);
            min-height: 300px;
            height: 100%;
            display: block;
            visibility: visible;
        `;
        
        // Decode text content from base64 data URL
        try {
            let text = '';
            const fileName = material.name || '';
            const fileExtension = fileName.split('.').pop().toLowerCase();
            
            // Handle different file formats
            if (fileExtension === 'docx') {
                // Use mammoth.js to convert .docx to HTML
                if (typeof mammoth === 'undefined') {
                    textContent.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Document reader library not loaded. Please refresh the page.</p>';
                } else {
                    textContent.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Loading document...</p>';
                    textOverlay.appendChild(header);
                    textOverlay.appendChild(textContent);
                    textCard.style.position = 'relative';
                    textCard.style.minHeight = '400px';
                    textCard.appendChild(textOverlay);
                    
                    // Convert data URL to array buffer
                    if (material.data && material.data.startsWith('data:')) {
                        const commaIndex = material.data.indexOf(',');
                        if (commaIndex !== -1) {
                            const base64Data = material.data.substring(commaIndex + 1);
                            const binaryString = atob(base64Data);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            const arrayBuffer = bytes.buffer;
                            
                            mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                                .then(function(result) {
                                    textContent.innerHTML = `
                                        <div style="padding: 24px; font-size: 16px; line-height: 1.8; color: var(--text-primary);">
                                            ${result.value}
                                        </div>
                                    `;
                                    if (result.messages.length > 0) {
                                        console.warn('Mammoth conversion messages:', result.messages);
                                    }
                                })
                                .catch(function(error) {
                                    console.error('Error converting .docx:', error);
                                    textContent.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Error reading document: ${error.message}</p>`;
                                });
                        }
                    }
                    preview.innerHTML = '';
                    preview.style.display = 'none';
                }
                return;
            } else if (fileExtension === 'pdf') {
                // Use pdf.js to extract text from PDF
                if (typeof pdfjsLib === 'undefined') {
                    textContent.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">PDF reader library not loaded. Please refresh the page.</p>';
                } else {
                    textContent.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Loading PDF...</p>';
                    textOverlay.appendChild(header);
                    textOverlay.appendChild(textContent);
                    textCard.style.position = 'relative';
                    textCard.style.minHeight = '400px';
                    textCard.appendChild(textOverlay);
                    
                    // Set up PDF.js worker
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    
                    // Convert data URL to Uint8Array
                    if (material.data && material.data.startsWith('data:')) {
                        const commaIndex = material.data.indexOf(',');
                        if (commaIndex !== -1) {
                            const base64Data = material.data.substring(commaIndex + 1);
                            const binaryString = atob(base64Data);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            
                            pdfjsLib.getDocument({ data: bytes }).promise
                                .then(function(pdf) {
                                    const numPages = pdf.numPages;
                                    console.log('PDF loaded successfully. Total pages:', numPages);
                                    
                                    // Clear loading message
                                    textContent.innerHTML = '';
                                    textContent.style.display = 'flex';
                                    textContent.style.flexDirection = 'column';
                                    textContent.style.alignItems = 'center';
                                    textContent.style.gap = '16px';
                                    textContent.style.padding = '24px';
                                    
                                    // Get the container width for scaling
                                    const containerWidth = textContent.clientWidth || 600;
                                    const scale = Math.min(containerWidth / 612, 2); // 612 is standard PDF width in points
                                    
                                    // Render all pages
                                    const renderPromises = [];
                                    
                                    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                                        renderPromises.push(
                                            pdf.getPage(pageNum).then(function(page) {
                                                // Get viewport with scale
                                                const viewport = page.getViewport({ scale: scale });
                                                
                                                // Create canvas for this page
                                                const canvas = document.createElement('canvas');
                                                const canvasContext = canvas.getContext('2d');
                                                canvas.height = viewport.height;
                                                canvas.width = viewport.width;
                                                
                                                // Create page container
                                                const pageContainer = document.createElement('div');
                                                pageContainer.style.cssText = `
                                                    width: 100%;
                                                    display: flex;
                                                    justify-content: center;
                                                    margin-bottom: 16px;
                                                    padding: 8px;
                                                    background: white;
                                                    border-radius: 4px;
                                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                                `;
                                                
                                                canvas.style.cssText = `
                                                    max-width: 100%;
                                                    height: auto;
                                                    display: block;
                                                `;
                                                
                                                pageContainer.appendChild(canvas);
                                                
                                                // Render the page
                                                const renderContext = {
                                                    canvasContext: canvasContext,
                                                    viewport: viewport
                                                };
                                                
                                                return page.render(renderContext).promise.then(function() {
                                                    console.log(`Page ${pageNum} rendered successfully`);
                                                    return { pageNum: pageNum, container: pageContainer };
                                                });
                                            })
                                        );
                                    }
                                    
                                    // Wait for all pages to render, then display them in order
                                    Promise.all(renderPromises).then(function(pageContainers) {
                                        // Sort by page number to ensure correct order
                                        pageContainers.sort((a, b) => a.pageNum - b.pageNum);
                                        
                                        // Append all page containers
                                        pageContainers.forEach(function(item) {
                                            textContent.appendChild(item.container);
                                        });
                                        
                                        console.log('PDF rendered successfully. Pages displayed:', pageContainers.length);
                                    }).catch(function(error) {
                                        console.error('Error rendering PDF pages:', error);
                                        textContent.innerHTML = `
                                            <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                                                <p style="font-size: 16px; margin-bottom: 12px;">❌ Error Rendering PDF</p>
                                                <p style="margin-bottom: 8px;">${error.message || 'Unknown error occurred'}</p>
                                                <p style="font-size: 12px; margin-top: 16px; opacity: 0.7;">Please check the browser console for more details.</p>
                                            </div>
                                        `;
                                    });
                                })
                                .catch(function(error) {
                                    console.error('Error loading PDF:', error);
                                    textContent.innerHTML = `
                                        <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                                            <p style="font-size: 16px; margin-bottom: 12px;">❌ Error Loading PDF</p>
                                            <p style="margin-bottom: 8px;">${error.message || 'Unknown error occurred'}</p>
                                            <p style="font-size: 12px; margin-top: 16px; opacity: 0.7;">Please check the browser console for more details.</p>
                                        </div>
                                    `;
                                });
                        }
                    }
                    preview.innerHTML = '';
                    preview.style.display = 'none';
                }
                return;
            } else if (fileExtension !== 'txt') {
                // For other formats (like .doc), show message
                textContent.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                        <p style="font-size: 18px; margin-bottom: 12px;">⚠️ Unsupported File Format</p>
                        <p style="margin-bottom: 8px;">This file format (.${fileExtension}) is not supported for text display.</p>
                        <p style="font-size: 14px; margin-top: 16px;">Supported formats: <strong>.txt, .docx, .pdf</strong></p>
                    </div>
                `;
                textOverlay.appendChild(header);
                textOverlay.appendChild(textContent);
                textCard.style.position = 'relative';
                textCard.style.minHeight = '400px';
                textCard.appendChild(textOverlay);
                preview.innerHTML = '';
                preview.style.display = 'none';
                return;
            }
            
            if (material.data) {
                const dataStr = material.data;
                
                // Check if it's a data URL (base64 encoded)
                if (dataStr.startsWith('data:')) {
                    // Extract base64 part after the comma
                    const commaIndex = dataStr.indexOf(',');
                    if (commaIndex !== -1 && commaIndex < dataStr.length - 1) {
                        const base64Data = dataStr.substring(commaIndex + 1);
                        try {
                            // Decode base64 to bytes first
                            const binaryString = atob(base64Data);
                            // Convert binary string to bytes
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            // Decode bytes as UTF-8
                            try {
                                const decoder = new TextDecoder('utf-8');
                                text = decoder.decode(bytes);
                            } catch (utf8Error) {
                                // Fallback to simple atob if TextDecoder fails
                                text = binaryString;
                            }
                            console.log('Successfully decoded text file:', material.name, 'Length:', text.length);
                        } catch (decodeError) {
                            console.error('Error decoding base64:', decodeError);
                            console.error('Material:', material);
                            text = 'Error: Could not decode file content. The file might be corrupted or in an unsupported format.';
                        }
                    } else {
                        console.error('Invalid data URL format - no comma found or empty data');
                        text = 'Error: Invalid data URL format.';
                    }
                } else {
                    // Might already be plain text (not base64) - sometimes stored directly
                    text = dataStr;
                    console.log('Using text data directly (not base64):', material.name);
                }
            } else {
                console.warn('No data found in material:', material);
                text = 'No content available.';
            }
            
            // Format text content - preserve line breaks and paragraphs
            if (!text || text.trim() === '') {
                textContent.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No text content found in this file.</p>';
            } else {
                // Split into lines and format as paragraphs
                const lines = text.split(/\r?\n/);
                let formattedText = '';
                
                lines.forEach((line, index) => {
                    const trimmed = line.trim();
                    if (trimmed === '') {
                        // Empty line - add spacing
                        formattedText += '<br>';
                    } else {
                        // Regular line - format as paragraph
                        // Preserve original line including leading/trailing spaces if needed
                        formattedText += `<p style="margin: 0 0 1em 0; text-align: justify; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">${escapeHtml(line)}</p>`;
                    }
                });
                
                // Ensure we have content to display
                if (formattedText) {
                    textContent.innerHTML = formattedText;
                    console.log('Text content formatted and set. Character count:', formattedText.length);
                } else {
                    textContent.innerHTML = '<p style="color: var(--text-secondary);">No content available</p>';
                }
            }
            
            // Ensure content is visible
            textContent.style.display = 'block';
            textContent.style.visibility = 'visible';
            textContent.style.opacity = '1';
        } catch (error) {
            console.error('Error reading text content:', error);
            console.error('Material data:', material);
            textContent.innerHTML = `<p style="color: var(--text-secondary);">Error loading text content: ${error.message}</p>`;
            textContent.style.display = 'block';
            textContent.style.visibility = 'visible';
        }
        
        // Append elements to overlay
        textOverlay.appendChild(header);
        textOverlay.appendChild(textContent);
        
        // Ensure overlay is visible
        textOverlay.style.display = 'flex';
        textOverlay.style.visibility = 'visible';
        
        // Make sure the card is positioned relative and has min-height
        textCard.style.position = 'relative';
        textCard.style.minHeight = '400px';
        textCard.appendChild(textOverlay);
        
        // Clear the preview area
        preview.innerHTML = '';
        preview.style.display = 'none';
        
        // Ensure overlay is visible
        console.log('Text overlay created and appended to card');
        console.log('Material:', material.name, 'Data type:', typeof material.data, 'Data length:', material.data ? material.data.length : 0);
    } else if (type === 'exercises') {
        // Special handling for exercises - show as tabs
        const exerciseCard = document.querySelector('.exercise-card');
        if (!exerciseCard) return;
        
        const tabsPreview = document.getElementById('exerciseTabsPreview');
        if (!tabsPreview) return;
        
        // Get all elements to hide/show
        const uploadIcon = exerciseCard.querySelector('.upload-icon');
        const uploadTitle = exerciseCard.querySelector('h2');
        const uploadDescription = exerciseCard.querySelector('.upload-description');
        const uploadButtons = exerciseCard.querySelector('.upload-buttons');
        
        if (selected.length === 0) {
            // No exercises selected - show normal content
            tabsPreview.innerHTML = '';
            tabsPreview.style.display = 'none';
            preview.innerHTML = '';
            preview.style.display = '';
            if (uploadIcon) uploadIcon.style.display = '';
            if (uploadTitle) uploadTitle.style.display = '';
            if (uploadDescription) uploadDescription.style.display = '';
            if (uploadButtons) uploadButtons.style.display = '';
            return;
        }
        
        // Hide only icon, description, and buttons - keep title visible
        if (uploadIcon) uploadIcon.style.display = 'none';
        // Keep title visible: if (uploadTitle) uploadTitle.style.display = 'none';
        if (uploadDescription) uploadDescription.style.display = 'none';
        if (uploadButtons) uploadButtons.style.display = 'none';
        
        // Show tabs preview
        tabsPreview.style.display = 'flex';
        tabsPreview.style.flexWrap = 'wrap';
        tabsPreview.style.gap = '12px';
        tabsPreview.style.marginTop = '20px';
        tabsPreview.innerHTML = '';
        
        selected.forEach(exercise => {
            // Check if it's an exercise from exercises.js (has url property)
            if (exercise.url) {
                const tab = document.createElement('a');
                tab.className = 'exercise-tab';
                tab.href = exercise.url;
                tab.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 24px;
                    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
                    border: 1px solid var(--accent-color);
                    border-radius: 16px;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 8px var(--shadow);
                    text-decoration: none;
                    position: relative;
                `;
                tab.innerHTML = `
                    <span class="exercise-number">${exercise.id || exercise.number || ''}</span>
                    <span class="exercise-name">${exercise.name}</span>
                    <button class="exercise-tab-delete" style="
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                        color: white;
                        border: none;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
                        z-index: 10;
                    ">×</button>
                `;
                
                const deleteBtn = tab.querySelector('.exercise-tab-delete');
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const updated = selected.filter(item => item.id !== exercise.id);
                    saveSelectedMaterials(type, updated);
                    displaySelectedMaterials(type);
                };
                
                tab.onmouseover = () => {
                    tab.style.background = 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)';
                    tab.style.transform = 'translateY(-2px)';
                    tab.style.boxShadow = '0 4px 12px var(--shadow-lg)';
                };
                tab.onmouseout = () => {
                    tab.style.background = 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)';
                    tab.style.transform = 'translateY(0)';
                    tab.style.boxShadow = '0 2px 8px var(--shadow)';
                };
                
                tabsPreview.appendChild(tab);
            } else {
                // Regular uploaded exercise file - show in grid
                preview.style.display = 'grid';
                preview.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
                preview.style.gap = '12px';
                
                const materialItem = document.createElement('div');
                materialItem.className = 'selected-material-item';
                materialItem.style.cssText = `
                    position: relative;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 12px;
                    border: 1px solid var(--glass-border);
                    transition: all 0.3s ease;
                    overflow: hidden;
                `;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'material-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.style.cssText = `
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    z-index: 10;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
                `;
                deleteBtn.onmouseover = () => {
                    deleteBtn.style.transform = 'scale(1.1)';
                    deleteBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.5)';
                };
                deleteBtn.onmouseout = () => {
                    deleteBtn.style.transform = 'scale(1)';
                    deleteBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                };
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    const updated = selected.filter(item => item.id !== exercise.id);
                    saveSelectedMaterials(type, updated);
                    displaySelectedMaterials(type);
                };
                
                const iconDiv = document.createElement('div');
                iconDiv.style.cssText = 'font-size: 48px; text-align: center; margin-bottom: 8px; height: 120px; display: flex; align-items: center; justify-content: center;';
                iconDiv.textContent = '✏️';
                materialItem.appendChild(iconDiv);
                
                const nameDiv = document.createElement('div');
                nameDiv.style.cssText = 'font-size: 12px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                nameDiv.textContent = exercise.name;
                materialItem.appendChild(nameDiv);
                materialItem.appendChild(deleteBtn);
                preview.appendChild(materialItem);
            }
        });
        
        preview.innerHTML = '';
        preview.style.display = selected.some(e => !e.url) ? 'grid' : 'none';
    } else {
        // For other types, use grid layout
        preview.style.display = 'grid';
        preview.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        preview.style.gap = '12px';
        
        selected.forEach(material => {
            const materialItem = document.createElement('div');
            materialItem.className = 'selected-material-item';
            materialItem.style.cssText = `
                position: relative;
                background: var(--bg-secondary);
                border-radius: 12px;
                padding: 12px;
                border: 1px solid var(--glass-border);
                transition: all 0.3s ease;
                overflow: hidden;
            `;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'material-delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                z-index: 10;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
            `;
            deleteBtn.onmouseover = () => {
                deleteBtn.style.transform = 'scale(1.1)';
                deleteBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.5)';
            };
            deleteBtn.onmouseout = () => {
                deleteBtn.style.transform = 'scale(1)';
                deleteBtn.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            };
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                const updated = selected.filter(item => item.id !== material.id);
                saveSelectedMaterials(type, updated);
                displaySelectedMaterials(type);
            };
            
            const icons = {
                texts: '📄',
                exercises: '✏️',
                homework: '📚'
            };
            const iconDiv = document.createElement('div');
            iconDiv.style.cssText = 'font-size: 48px; text-align: center; margin-bottom: 8px; height: 120px; display: flex; align-items: center; justify-content: center;';
            iconDiv.textContent = icons[type] || '📄';
            materialItem.appendChild(iconDiv);
            
            const nameDiv = document.createElement('div');
            nameDiv.style.cssText = 'font-size: 12px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
            nameDiv.textContent = material.name;
            materialItem.appendChild(nameDiv);
            
            materialItem.appendChild(deleteBtn);
            preview.appendChild(materialItem);
        });
    }
}

// Select material function
function selectMaterial(type, material, saveSelection = true) {
    closeMaterialsSelector(type);
    
    // Map type for preview lookup (photos -> photo, texts -> text, etc.)
    const previewType = type === 'photos' ? 'photo' : type.slice(0, -1);
    const preview = previews[previewType];
    if (!preview) return;
    
    // Add to selected materials (check if already exists)
    const selected = getSelectedMaterials(type);
    if (!selected.find(item => item.id === material.id)) {
        selected.push(material);
        if (saveSelection) {
            saveSelectedMaterials(type, selected);
        }
    }
    
    displaySelectedMaterials(type);
}


// Handle file uploads
Object.keys(fileInputs).forEach(type => {
    fileInputs[type].addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(type, file);
        }
    });
});

function handleFileUpload(type, file) {
    // Save to materials library
    const reader = new FileReader();
    reader.onload = (event) => {
        const materials = getMaterials();
        const materialType = type === 'photo' ? 'photos' : type + 's';
        
        const material = {
            id: Date.now() + Math.random(),
            name: file.name,
            data: event.target.result,
            type: type === 'photo' ? 'image' : 'file',
            date: new Date().toLocaleDateString()
        };
        
        materials[materialType].push(material);
        localStorage.setItem(`materials${materialType.charAt(0).toUpperCase() + materialType.slice(1)}`, JSON.stringify(materials[materialType]));
        
        // Add to selected materials
        const selected = getSelectedMaterials(materialType);
        if (!selected.find(item => item.id === material.id)) {
            selected.push(material);
            saveSelectedMaterials(materialType, selected);
        }
        
        displaySelectedMaterials(materialType);
    };
    
    if (type === 'photo' && file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
    } else {
        reader.readAsDataURL(file);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showImagePreview(file) {
    // Create modal or preview for image
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    modal.onclick = () => {
        document.body.removeChild(modal);
        URL.revokeObjectURL(img.src);
    };
}

function showFileDetails(file) {
    showAlert('info', 'File Details', `File: ${file.name}\nSize: ${formatFileSize(file.size)}\nType: ${file.type}`);
}
