// Exercises Page Functionality

// Exercise tabs data
const exercises = [
    { id: 1, name: 'Word/Phrases Cards', url: 'exercise-1.html' },
    { id: 2, name: 'Repeat It', url: 'exercise-2.html' },
    { id: 3, name: 'Check Your Level', url: 'exercise-3.html' },
    { id: 4, name: 'Test Yourself', url: 'exercise-4.html' }
    // More exercises can be added here
];

// Initialize exercise tabs
function initializeExerciseTabs() {
    const tabsContainer = document.getElementById('exerciseTabs');
    
    if (!tabsContainer) return;
    
    // Clear existing tabs (except the first one if it exists)
    const existingTabs = tabsContainer.querySelectorAll('.exercise-tab');
    if (existingTabs.length > 1) {
        existingTabs.forEach((tab, index) => {
            if (index > 0) tab.remove();
        });
    }
    
    // Create tabs for each exercise
    exercises.forEach((exercise, index) => {
        // Skip first exercise as it's already in HTML
        if (index === 0) {
            // Update the existing first tab
            const firstTab = tabsContainer.querySelector('.exercise-tab');
            if (firstTab) {
                firstTab.href = exercise.url;
                const numberSpan = firstTab.querySelector('.exercise-number');
                const nameSpan = firstTab.querySelector('.exercise-name');
                if (numberSpan) numberSpan.textContent = exercise.id;
                if (nameSpan) nameSpan.textContent = exercise.name;
            }
            return;
        }
        
        // Create new tab as link
        const tab = document.createElement('a');
        tab.className = 'exercise-tab';
        tab.href = exercise.url;
        tab.innerHTML = `
            <span class="exercise-number">${exercise.id}</span>
            <span class="exercise-name">${exercise.name}</span>
        `;
        
        tabsContainer.appendChild(tab);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeExerciseTabs();
});
