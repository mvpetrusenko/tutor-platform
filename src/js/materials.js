// Materials Management
const materials = {
    photos: JSON.parse(localStorage.getItem('materialsPhotos') || '[]'),
    texts: JSON.parse(localStorage.getItem('materialsTexts') || '[]'),
    exercises: JSON.parse(localStorage.getItem('materialsExercises') || '[]'),
    homework: JSON.parse(localStorage.getItem('materialsHomework') || '[]')
};

function getMaterials() {
    return {
        photos: JSON.parse(localStorage.getItem('materialsPhotos') || '[]'),
        texts: JSON.parse(localStorage.getItem('materialsTexts') || '[]'),
        exercises: JSON.parse(localStorage.getItem('materialsExercises') || '[]'),
        homework: JSON.parse(localStorage.getItem('materialsHomework') || '[]')
    };
}

// Save materials to localStorage and backend
async function saveMaterials() {
    localStorage.setItem('materialsPhotos', JSON.stringify(materials.photos));
    localStorage.setItem('materialsTexts', JSON.stringify(materials.texts));
    localStorage.setItem('materialsExercises', JSON.stringify(materials.exercises));
    localStorage.setItem('materialsHomework', JSON.stringify(materials.homework));
    
    // Sync to backend
    if (window.apiService) {
        try {
            for (const type of ['photos', 'texts', 'exercises', 'homework']) {
                for (const material of materials[type]) {
                    await window.apiService.saveMaterialToBackend(type, material);
                }
            }
        } catch (error) {
            console.error('Error syncing materials to backend:', error);
        }
    }
}

// Reload materials from localStorage
function reloadMaterials() {
    materials.photos = JSON.parse(localStorage.getItem('materialsPhotos') || '[]');
    materials.texts = JSON.parse(localStorage.getItem('materialsTexts') || '[]');
    materials.exercises = JSON.parse(localStorage.getItem('materialsExercises') || '[]');
    materials.homework = JSON.parse(localStorage.getItem('materialsHomework') || '[]');
}

// Modern Alert System (same as whiteboard)
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

// Handle photo upload
document.getElementById('materialPhotoUpload').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
        reader.onload = async (event) => {
            const material = {
                id: Date.now() + Math.random(),
                name: file.name,
                data: event.target.result,
                type: 'image',
                date: new Date().toLocaleDateString()
            };
            materials.photos.push(material);
            await saveMaterials();
            
            // Sync to backend
            if (window.apiService) {
                try {
                    await window.apiService.saveMaterialToBackend('photos', material);
                } catch (error) {
                    console.error('Error syncing photo to backend:', error);
                }
            }
            
            displayMaterials();
            showAlert('success', 'Saved', `Photo "${file.name}" uploaded and saved successfully!`);
        };
            reader.readAsDataURL(file);
        }
    });
    e.target.value = '';
});

// Handle text upload
document.getElementById('materialTextUpload').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const material = {
                id: Date.now() + Math.random(),
                name: file.name,
                data: event.target.result,
                type: 'text',
                date: new Date().toLocaleDateString()
            };
            materials.texts.push(material);
            saveMaterials();
            displayMaterials();
            showAlert('success', 'Saved', `Text "${file.name}" uploaded and saved successfully!`);
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
});

// Handle exercise upload
document.getElementById('materialExerciseUpload').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const material = {
                id: Date.now() + Math.random(),
                name: file.name,
                data: event.target.result,
                type: 'exercise',
                date: new Date().toLocaleDateString()
            };
            materials.exercises.push(material);
            await saveMaterials();
            
            // Sync to backend
            if (window.apiService) {
                try {
                    await window.apiService.saveMaterialToBackend('exercises', material);
                } catch (error) {
                    console.error('Error syncing exercise to backend:', error);
                }
            }
            
            displayMaterials();
            showAlert('success', 'Saved', `Exercise "${file.name}" uploaded and saved successfully!`);
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
});

// Handle homework upload
document.getElementById('materialHomeworkUpload').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const material = {
                id: Date.now() + Math.random(),
                name: file.name,
                data: event.target.result,
                type: 'homework',
                date: new Date().toLocaleDateString()
            };
            materials.homework.push(material);
            await saveMaterials();
            
            // Sync to backend
            if (window.apiService) {
                try {
                    await window.apiService.saveMaterialToBackend('homework', material);
                } catch (error) {
                    console.error('Error syncing homework to backend:', error);
                }
            }
            
            displayMaterials();
            showAlert('success', 'Saved', `Homework "${file.name}" uploaded and saved successfully!`);
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
});

// Display materials
function displayMaterials() {
    displayMaterialCategory('photos', materials.photos, document.getElementById('photosGrid'));
    displayMaterialCategory('texts', materials.texts, document.getElementById('textsGrid'));
    displayMaterialCategory('exercises', materials.exercises, document.getElementById('exercisesGrid'));
    displayMaterialCategory('homework', materials.homework, document.getElementById('homeworkGrid'));
}

function displayMaterialCategory(type, items, container) {
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No ${type} uploaded yet</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const materialCard = document.createElement('div');
        materialCard.className = 'material-item';
        materialCard.dataset.id = item.id;
        materialCard.dataset.type = type;

        if (type === 'photos' && item.type === 'image') {
            materialCard.innerHTML = `
                <div class="material-item-actions">
                    <button class="material-action-btn select-btn" title="Use on Home Page" data-id="${item.id}" data-type="${type}">✓</button>
                    <button class="material-action-btn delete-btn" title="Delete" data-id="${item.id}" data-type="${type}">🗑️</button>
                </div>
                <img src="${item.data}" alt="${item.name}" class="material-item-image">
                <h4 class="material-item-name">${item.name}</h4>
                <p class="material-item-date">${item.date}</p>
            `;
        } else {
            const icons = {
                texts: '📄',
                exercises: '✏️',
                homework: '📚'
            };
            materialCard.innerHTML = `
                <div class="material-item-actions">
                    <button class="material-action-btn select-btn" title="Use on Home Page" data-id="${item.id}" data-type="${type}">✓</button>
                    <button class="material-action-btn delete-btn" title="Delete" data-id="${item.id}" data-type="${type}">🗑️</button>
                </div>
                <div class="material-item-icon">${icons[type] || '📄'}</div>
                <h4 class="material-item-name">${item.name}</h4>
                <p class="material-item-date">${item.date}</p>
            `;
        }

        container.appendChild(materialCard);
    });

    // Add delete functionality
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            deleteMaterial(type, id);
        });
    });

    // Add select functionality (for all types)
    container.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            selectMaterialForHomePage(type, id);
        });
    });
}

// Select material to use on home page
function selectMaterialForHomePage(type, id) {
    const materialId = parseFloat(id);
    const material = materials[type].find(item => {
        const itemId = parseFloat(item.id);
        return itemId === materialId || String(item.id) === String(id);
    });

    if (!material) {
        showAlert('error', 'Error', 'Material not found.');
        return;
    }

    // Map type to localStorage key (matching script.js format)
    // For photos: 'photos' -> 'photo' -> 'Photo' -> 'selectedPhotos'
    // For texts: 'texts' -> 'text' -> 'Text' -> 'selectedTexts'
    const previewType = type === 'photos' ? 'photo' : type.slice(0, -1);
    const key = previewType.charAt(0).toUpperCase() + previewType.slice(1);
    const selectedKey = `selected${key}s`;

    // Get current selected materials
    const currentSelected = JSON.parse(localStorage.getItem(selectedKey) || '[]');
    
    // Check if already selected
    const alreadySelected = currentSelected.some(item => {
        const itemId = parseFloat(item.id);
        return itemId === materialId || String(item.id) === String(id);
    });

    if (alreadySelected) {
        showAlert('info', 'Already Selected', `"${material.name}" is already selected on the home page.`);
        return;
    }

    // Add to selected materials
    currentSelected.push(material);
    localStorage.setItem(selectedKey, JSON.stringify(currentSelected));
    
    // Sync to backend
    if (window.apiService) {
        try {
            window.apiService.saveSelectedMaterialsToBackend(type, currentSelected);
        } catch (error) {
            console.error('Error syncing selected materials to backend:', error);
        }
    }

    showAlert('success', 'Selected', `"${material.name}" has been added to the home page. You can now use it in the "${type === 'photos' ? 'Download Photo' : type === 'texts' ? 'Choose Text' : type === 'exercises' ? 'Choose Exercise' : 'Choose Homework'}" section.`);
}

// Delete material
function deleteMaterial(type, id) {
    showAlert('warning', 'Delete Material', 'Are you sure you want to delete this material? This will also remove it from any selected materials on the home page.', () => {
        // Convert id to number for comparison
        const materialId = parseFloat(id);

        // Remove from materials array
        const initialLength = materials[type].length;
        materials[type] = materials[type].filter(item => {
            const itemId = parseFloat(item.id);
            return itemId !== materialId;
        });

        // If no item was removed, try string comparison
        if (materials[type].length === initialLength) {
            materials[type] = materials[type].filter(item => String(item.id) !== String(id));
        }

        // Save to localStorage
        saveMaterials();

        // Reload materials to ensure sync
        materials.photos = JSON.parse(localStorage.getItem('materialsPhotos') || '[]');
        materials.texts = JSON.parse(localStorage.getItem('materialsTexts') || '[]');
        materials.exercises = JSON.parse(localStorage.getItem('materialsExercises') || '[]');
        materials.homework = JSON.parse(localStorage.getItem('materialsHomework') || '[]');

        // Refresh display
        displayMaterials();

        // Also remove from selected materials on home page (check all selected arrays)
        const typeMap = {
            photos: 'Photo',
            texts: 'Text',
            exercises: 'Exercise',
            homework: 'Homework'
        };
        const selectedKey = `selected${typeMap[type]}s`;
        const selected = localStorage.getItem(selectedKey);
        if (selected) {
            try {
                const selectedMaterials = JSON.parse(selected);
                const updated = selectedMaterials.filter(item => {
                    const itemId = parseFloat(item.id);
                    return itemId !== materialId && String(item.id) !== String(id);
                });
                localStorage.setItem(selectedKey, JSON.stringify(updated));
            } catch (e) {
                console.error('Error updating selected materials:', e);
            }
        }

        showAlert('success', 'Deleted', 'Material deleted successfully!');
    });
}

// Display exercise tabs on materials page
function displayExerciseTabs() {
    const tabsContainer = document.getElementById('materialsExerciseTabs');
    if (!tabsContainer) return;
    
    // Get exercises from exercises.js (if available) or use default
    let exercisesList = [];
    if (typeof exercises !== 'undefined' && Array.isArray(exercises)) {
        exercisesList = exercises;
    } else {
        // Fallback: try to get from script.js or use default
        exercisesList = [
            { id: 1, name: 'Word/Phrases Cards', url: 'exercise-1.html' },
            { id: 2, name: 'Repeat It', url: 'exercise-2.html' }
        ];
    }
    
    tabsContainer.innerHTML = '';
    
    exercisesList.forEach(exercise => {
        const tab = document.createElement('a');
        tab.className = 'exercise-tab';
        tab.href = exercise.url;
        tab.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 40px 14px 24px;
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
            <span class="exercise-number">${exercise.id}</span>
            <span class="exercise-name">${exercise.name}</span>
        `;
        
        // Add select button overlay
        const selectBtn = document.createElement('button');
        selectBtn.className = 'material-action-btn select-btn';
        selectBtn.title = 'Use on Home Page';
        selectBtn.style.cssText = `
            position: absolute;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(52, 211, 153, 0.3);
            z-index: 10;
            flex-shrink: 0;
        `;
        selectBtn.innerHTML = '✓';
        selectBtn.onmouseover = () => {
            selectBtn.style.transform = 'translateY(-50%) scale(1.1)';
            selectBtn.style.boxShadow = '0 4px 12px rgba(52, 211, 153, 0.5)';
            selectBtn.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        };
        selectBtn.onmouseout = () => {
            selectBtn.style.transform = 'translateY(-50%) scale(1)';
            selectBtn.style.boxShadow = '0 2px 8px rgba(52, 211, 153, 0.3)';
            selectBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        };
        selectBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectExerciseForHomePage(exercise);
        };
        
        // Add hover effect for the tab
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
        
        tab.appendChild(selectBtn);
        tabsContainer.appendChild(tab);
    });
}

// Select exercise for home page
function selectExerciseForHomePage(exercise) {
    const selectedKey = 'selectedExercises';
    const currentSelected = JSON.parse(localStorage.getItem(selectedKey) || '[]');
    
    // Check if already selected
    const alreadySelected = currentSelected.some(item => {
        return item.id === exercise.id || item.url === exercise.url;
    });
    
    if (alreadySelected) {
        showAlert('info', 'Already Selected', `"${exercise.name}" is already selected on the home page.`);
        return;
    }
    
    // Add to selected exercises
    currentSelected.push(exercise);
    localStorage.setItem(selectedKey, JSON.stringify(currentSelected));
    
    showAlert('success', 'Selected', `"${exercise.name}" has been added to the home page. You can now use it in the "Choose Exercise" section.`);
}

// Initialize display
displayMaterials();
displayExerciseTabs();