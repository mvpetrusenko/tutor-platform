// Whiteboard functionality
const canvas = document.getElementById('whiteboardCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let brushSize = 5;
let lastX = 0;
let lastY = 0;

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 40;
    canvas.height = Math.max(500, window.innerHeight * 0.7);
    
    // Restore saved drawing if exists
    const saved = localStorage.getItem('whiteboardDrawing');
    if (saved) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = saved;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (currentTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
    } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
    
    // Auto-save to localStorage
    saveToLocalStorage();
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveToLocalStorage();
    }
}

// Event listeners for mouse
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Event listeners for touch
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Color buttons
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
        currentTool = 'pen';
        document.getElementById('penTool').classList.add('active');
        document.getElementById('eraserTool').classList.remove('active');
        updateCursor();
    });
});

// Tool buttons
document.getElementById('penTool').addEventListener('click', () => {
    currentTool = 'pen';
    document.getElementById('penTool').classList.add('active');
    document.getElementById('eraserTool').classList.remove('active');
    updateCursor();
});

document.getElementById('eraserTool').addEventListener('click', () => {
    currentTool = 'eraser';
    document.getElementById('eraserTool').classList.add('active');
    document.getElementById('penTool').classList.remove('active');
    updateCursor();
});

// Update cursor based on tool and size
function updateCursor() {
    const size = brushSize;
    const angle = 20; // Same angle for both tools
    const angleRad = angle * Math.PI / 180;
    
    if (currentTool === 'pen') {
        // Create modern marker cursor - sleek design like real markers
        const canvasCursor = document.createElement('canvas');
        const markerLength = size * 5 + 35;
        const markerWidth = size * 2.2 + 12;
        canvasCursor.width = markerWidth + 15;
        canvasCursor.height = markerLength + 15;
        const ctxCursor = canvasCursor.getContext('2d');
        
        const offsetX = 7;
        const offsetY = 7;
        
        ctxCursor.save();
        ctxCursor.translate(offsetX + markerWidth/2, offsetY + markerLength/2);
        ctxCursor.rotate(angleRad);
        ctxCursor.translate(-markerWidth/2, -markerLength/2);
        
        // Modern marker body (sleek cylindrical)
        const bodyStart = 10;
        const bodyEnd = markerLength - size * 1.8 - 6;
        const bodyWidth = markerWidth - 3;
        
        // Main body with modern gradient
        const gradient = ctxCursor.createLinearGradient(0, bodyStart, 0, bodyEnd);
        const darkerColor = darkenColor(currentColor, 0.25);
        const lighterColor = lightenColor(currentColor, 0.15);
        gradient.addColorStop(0, lighterColor);
        gradient.addColorStop(0.3, currentColor);
        gradient.addColorStop(0.7, darkerColor);
        gradient.addColorStop(1, currentColor);
        
        ctxCursor.fillStyle = gradient;
        ctxCursor.beginPath();
        ctxCursor.ellipse(markerWidth/2, bodyStart, bodyWidth/2, bodyWidth/3.5, 0, 0, Math.PI * 2);
        ctxCursor.fill();
        
        // Modern 3D side shadow
        ctxCursor.fillStyle = darkenColor(currentColor, 0.4);
        ctxCursor.beginPath();
        ctxCursor.moveTo(1, bodyStart);
        ctxCursor.lineTo(1, bodyEnd);
        ctxCursor.lineTo(-1, bodyEnd + 1);
        ctxCursor.lineTo(-1, bodyStart + 1);
        ctxCursor.closePath();
        ctxCursor.fill();
        
        // Sleek highlight stripe
        ctxCursor.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctxCursor.beginPath();
        ctxCursor.ellipse(markerWidth/2 - 1, bodyStart + 1, bodyWidth/3.5, bodyWidth/6, 0, 0, Math.PI * 2);
        ctxCursor.fill();
        
        // Modern marker tip (chisel/beveled tip)
        const tipX = markerWidth / 2;
        const tipY = markerLength - 3;
        const tipBaseY = bodyEnd;
        const tipWidth = size * 1.3;
        
        // Tip with beveled edge
        ctxCursor.fillStyle = currentColor;
        ctxCursor.beginPath();
        ctxCursor.moveTo(tipX - tipWidth/2, tipBaseY);
        ctxCursor.lineTo(tipX + tipWidth/2, tipBaseY);
        ctxCursor.lineTo(tipX + tipWidth/3, tipY);
        ctxCursor.lineTo(tipX - tipWidth/3, tipY);
        ctxCursor.closePath();
        ctxCursor.fill();
        
        // Tip highlight
        ctxCursor.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctxCursor.beginPath();
        ctxCursor.moveTo(tipX - tipWidth/3, tipBaseY);
        ctxCursor.lineTo(tipX, tipY);
        ctxCursor.lineTo(tipX - tipWidth/4, tipY);
        ctxCursor.closePath();
        ctxCursor.fill();
        
        // Tip outline
        ctxCursor.strokeStyle = '#111';
        ctxCursor.lineWidth = 1.2;
        ctxCursor.stroke();
        
        // Modern cap (sleek design)
        const capWidth = bodyWidth - 4;
        ctxCursor.fillStyle = '#f5f5f5';
        ctxCursor.beginPath();
        ctxCursor.ellipse(markerWidth/2, 5, capWidth/2, capWidth/4.5, 0, 0, Math.PI * 2);
        ctxCursor.fill();
        
        // Cap rim
        ctxCursor.strokeStyle = '#bbb';
        ctxCursor.lineWidth = 1;
        ctxCursor.stroke();
        
        // Cap highlight
        ctxCursor.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctxCursor.beginPath();
        ctxCursor.ellipse(markerWidth/2 - 0.5, 4, capWidth/3, capWidth/7, 0, 0, Math.PI * 2);
        ctxCursor.fill();
        
        // Modern grip section (near tip)
        ctxCursor.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctxCursor.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            const y = bodyEnd - 8 - i * 3;
            ctxCursor.beginPath();
            ctxCursor.moveTo(markerWidth/2 - bodyWidth/3, y);
            ctxCursor.lineTo(markerWidth/2 + bodyWidth/3, y);
            ctxCursor.stroke();
        }
        
        ctxCursor.restore();
        
        // Hotspot at the tip
        const hotspotX = offsetX + markerWidth/2 + Math.sin(angleRad) * (markerLength/2 - 3);
        const hotspotY = offsetY + markerLength/2 - Math.cos(angleRad) * (markerLength/2 - 3);
        
        canvas.style.cursor = `url(${canvasCursor.toDataURL()}) ${hotspotX} ${hotspotY}, auto`;
    } else if (currentTool === 'eraser') {
        // Create modern eraser cursor - sleek design like real erasers
        const canvasCursor = document.createElement('canvas');
        const eraserLength = size * 4 + 25;
        const eraserWidth = size * 2.8 + 10;
        canvasCursor.width = eraserWidth + 15;
        canvasCursor.height = eraserLength + 15;
        const ctxCursor = canvasCursor.getContext('2d');
        
        const offsetX = 7;
        const offsetY = 7;
        
        ctxCursor.save();
        ctxCursor.translate(offsetX + eraserWidth/2, offsetY + eraserLength/2);
        ctxCursor.rotate(angleRad);
        ctxCursor.translate(-eraserWidth/2, -eraserLength/2);
        
        // Modern eraser body (sleek rectangular with rounded edges)
        const padding = 3;
        const eraserBodyWidth = eraserWidth - padding * 2;
        const eraserBodyHeight = eraserLength - padding * 2 - 6;
        const radius = 4;
        
        // Main eraser body (modern pink/white)
        const eraserGradient = ctxCursor.createLinearGradient(padding, padding, padding, padding + eraserBodyHeight);
        eraserGradient.addColorStop(0, '#ffc0cb');
        eraserGradient.addColorStop(0.5, '#ffb6c1');
        eraserGradient.addColorStop(1, '#ff91a4');
        
        ctxCursor.fillStyle = eraserGradient;
        ctxCursor.beginPath();
        ctxCursor.moveTo(padding + radius, padding);
        ctxCursor.lineTo(padding + eraserBodyWidth - radius, padding);
        ctxCursor.quadraticCurveTo(padding + eraserBodyWidth, padding, padding + eraserBodyWidth, padding + radius);
        ctxCursor.lineTo(padding + eraserBodyWidth, padding + eraserBodyHeight - radius);
        ctxCursor.quadraticCurveTo(padding + eraserBodyWidth, padding + eraserBodyHeight, padding + eraserBodyWidth - radius, padding + eraserBodyHeight);
        ctxCursor.lineTo(padding + radius, padding + eraserBodyHeight);
        ctxCursor.quadraticCurveTo(padding, padding + eraserBodyHeight, padding, padding + eraserBodyHeight - radius);
        ctxCursor.lineTo(padding, padding + radius);
        ctxCursor.quadraticCurveTo(padding, padding, padding + radius, padding);
        ctxCursor.closePath();
        ctxCursor.fill();
        
        // Modern 3D side shadow
        ctxCursor.fillStyle = '#ff91a4';
        ctxCursor.beginPath();
        ctxCursor.moveTo(padding, padding);
        ctxCursor.lineTo(padding - 2, padding + 2);
        ctxCursor.lineTo(padding - 2, padding + eraserBodyHeight + 2);
        ctxCursor.lineTo(padding, padding + eraserBodyHeight);
        ctxCursor.closePath();
        ctxCursor.fill();
        
        // Top highlight (sleek)
        ctxCursor.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctxCursor.fillRect(padding + 2, padding, eraserBodyWidth - 4, 4);
        
        // Modern metal band (chrome-like)
        const bandGradient = ctxCursor.createLinearGradient(padding + 1, padding, padding + 1, padding + 6);
        bandGradient.addColorStop(0, '#e8e8e8');
        bandGradient.addColorStop(0.3, '#ffffff');
        bandGradient.addColorStop(0.7, '#d0d0d0');
        bandGradient.addColorStop(1, '#b0b0b0');
        
        ctxCursor.fillStyle = bandGradient;
        ctxCursor.fillRect(padding + 1, padding, eraserBodyWidth - 2, 6);
        
        // Metal band highlight
        ctxCursor.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctxCursor.fillRect(padding + 2, padding, eraserBodyWidth - 4, 2);
        
        // Metal band shadow
        ctxCursor.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctxCursor.fillRect(padding + 1, padding + 4, eraserBodyWidth - 2, 2);
        
        // Modern texture pattern (subtle)
        ctxCursor.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctxCursor.lineWidth = 0.6;
        for (let i = 0; i < 5; i++) {
            const y = padding + 12 + i * 4;
            ctxCursor.beginPath();
            ctxCursor.moveTo(padding + 4, y);
            ctxCursor.lineTo(padding + eraserBodyWidth - 4, y);
            ctxCursor.stroke();
        }
        
        // Modern outline
        ctxCursor.strokeStyle = '#999';
        ctxCursor.lineWidth = 1.5;
        ctxCursor.stroke();
        
        // Bottom shadow (depth)
        ctxCursor.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctxCursor.fillRect(padding, padding + eraserBodyHeight - 3, eraserBodyWidth, 3);
        
        // Modern corner highlights
        ctxCursor.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctxCursor.beginPath();
        ctxCursor.arc(padding + radius, padding + radius, radius - 1, Math.PI, Math.PI * 1.5);
        ctxCursor.fill();
        
        ctxCursor.restore();
        
        // Hotspot at the bottom center
        const hotspotX = offsetX + eraserWidth/2 + Math.sin(angleRad) * (eraserLength/2 - 3);
        const hotspotY = offsetY + eraserLength/2 - Math.cos(angleRad) * (eraserLength/2 - 3);
        
        canvas.style.cursor = `url(${canvasCursor.toDataURL()}) ${hotspotX} ${hotspotY}, auto`;
    }
}

// Helper function to darken color
function darkenColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (num & 0xff) * (1 - amount));
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Helper function to lighten color
function lightenColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + ((num >> 16) & 0xff) * amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + ((num >> 8) & 0xff) * amount);
    const b = Math.min(255, (num & 0xff) + (num & 0xff) * amount);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Helper function to darken color
function darkenColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (num & 0xff) * (1 - amount));
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Brush size slider
const sizeSlider = document.getElementById('brushSize');
const sizeValue = document.getElementById('sizeValue');

sizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    sizeValue.textContent = brushSize + 'px';
    updateCursor();
});

// Clear button
document.getElementById('clearBtn').addEventListener('click', () => {
    showAlert('warning', 'Clear Whiteboard', 'Are you sure you want to clear the whiteboard?', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem('whiteboardDrawing');
        showAlert('success', 'Cleared', 'Whiteboard has been cleared successfully!');
    });
});

// Save function
function saveToLocalStorage() {
    const dataURL = canvas.toDataURL('image/png');
    localStorage.setItem('whiteboardDrawing', dataURL);
}

// Save button
document.getElementById('saveBtn').addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'whiteboard-' + Date.now() + '.png';
    link.href = dataURL;
    link.click();
    
    // Also save to localStorage
    saveToLocalStorage();
    showAlert('success', 'Saved', 'Whiteboard saved successfully!');
});

// Load button
document.getElementById('loadBtn').addEventListener('click', () => {
    document.getElementById('loadFile').click();
});

document.getElementById('loadFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            showAlert('error', 'Invalid File', 'Please select an image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                saveToLocalStorage();
                showAlert('success', 'Loaded', 'Image loaded successfully!');
            };
            img.onerror = () => {
                showAlert('error', 'Load Error', 'Failed to load image. Please try another file.');
            };
            img.src = event.target.result;
        };
        reader.onerror = () => {
            showAlert('error', 'Read Error', 'Failed to read file. Please try again.');
        };
        reader.readAsDataURL(file);
    }
});

// Initialize canvas settings
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Initialize cursor
updateCursor();

// Modern Alert System
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

// Load saved drawing on page load
window.addEventListener('load', () => {
    const saved = localStorage.getItem('whiteboardDrawing');
    if (saved) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = saved;
    }
    updateCursor();
});
