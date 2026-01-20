// Progress Tracking System

document.addEventListener('DOMContentLoaded', () => {
    // Initialize progress tracking
    initializeProgress();
    loadProgressData();
    updateProgressDisplay();
});

// Progress data structure
let progressData = {
    exercises: {},
    tests: [],
    studyTime: 0, // in minutes
    lastStudyDate: null,
    streak: 0,
    achievements: [],
    weeklyActivity: {}
};

// Exercise definitions
const exercises = [
    { id: 'word-cards', name: 'Word/Phrases Cards' },
    { id: 'repeat-it', name: 'Repeat It' },
    { id: 'check-level', name: 'Check Your Level' },
    { id: 'test-yourself', name: 'Test Yourself' }
];

// Achievement definitions
const achievements = [
    { id: 'first-exercise', name: 'Getting Started', description: 'Complete your first exercise', icon: '🎯', unlocked: false },
    { id: 'five-exercises', name: 'On a Roll', description: 'Complete 5 exercises', icon: '🔥', unlocked: false },
    { id: 'ten-exercises', name: 'Dedicated Learner', description: 'Complete 10 exercises', icon: '⭐', unlocked: false },
    { id: 'first-test', name: 'Test Taker', description: 'Complete your first test', icon: '📝', unlocked: false },
    { id: 'perfect-score', name: 'Perfect Score', description: 'Get 100% on a test', icon: '💯', unlocked: false },
    { id: 'week-streak', name: 'Weekly Warrior', description: 'Study 7 days in a row', icon: '🔥', unlocked: false },
    { id: 'month-streak', name: 'Monthly Master', description: 'Study 30 days in a row', icon: '👑', unlocked: false },
    { id: 'study-hour', name: 'Hour of Power', description: 'Study for 1 hour total', icon: '⏰', unlocked: false }
];

// Initialize progress data
function initializeProgress() {
    const saved = localStorage.getItem('progressData');
    if (saved) {
        progressData = { ...progressData, ...JSON.parse(saved) };
    }
    
    // Initialize exercises
    exercises.forEach(ex => {
        if (!progressData.exercises[ex.id]) {
            progressData.exercises[ex.id] = {
                completed: 0,
                lastCompleted: null,
                bestScore: 0
            };
        }
    });
}

// Save progress data
function saveProgressData() {
    localStorage.setItem('progressData', JSON.stringify(progressData));
    
    // Sync to backend
    if (window.apiService) {
        window.apiService.saveProgressToBackend(progressData).catch(err => {
            console.error('Error syncing progress to backend:', err);
        });
    }
}

// Load progress data from backend
async function loadProgressData() {
    if (window.apiService) {
        try {
            const backendData = await window.apiService.getProgressFromBackend();
            if (backendData) {
                // Merge with local data
                progressData = { ...progressData, ...backendData };
                saveProgressData();
            }
        } catch (error) {
            console.error('Error loading progress from backend:', error);
        }
    }
}

// Track exercise completion
function trackExerciseCompletion(exerciseId) {
    if (!progressData.exercises[exerciseId]) {
        progressData.exercises[exerciseId] = {
            completed: 0,
            lastCompleted: null,
            bestScore: 0
        };
    }
    
    progressData.exercises[exerciseId].completed++;
    progressData.exercises[exerciseId].lastCompleted = new Date().toISOString();
    
    updateStudyStreak();
    checkAchievements();
    saveProgressData();
    updateProgressDisplay();
}

// Track test completion
function trackTestCompletion(testName, score, totalQuestions) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    progressData.tests.push({
        name: testName,
        score: percentage,
        date: new Date().toISOString(),
        correct: score,
        total: totalQuestions
    });
    
    // Keep only last 50 tests
    if (progressData.tests.length > 50) {
        progressData.tests = progressData.tests.slice(-50);
    }
    
    updateStudyStreak();
    checkAchievements();
    saveProgressData();
    updateProgressDisplay();
}

// Track study time
function trackStudyTime(minutes) {
    progressData.studyTime += minutes;
    updateStudyStreak();
    checkAchievements();
    saveProgressData();
    updateProgressDisplay();
}

// Update study streak
function updateStudyStreak() {
    const today = new Date().toDateString();
    const lastDate = progressData.lastStudyDate ? new Date(progressData.lastStudyDate).toDateString() : null;
    
    if (lastDate === today) {
        // Already studied today
        return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (lastDate === yesterdayStr) {
        // Continuing streak
        progressData.streak++;
    } else if (lastDate !== today) {
        // Streak broken
        progressData.streak = 1;
    }
    
    progressData.lastStudyDate = new Date().toISOString();
    
    // Update weekly activity
    const weekDay = new Date().getDay();
    const weekKey = `week-${weekDay}`;
    if (!progressData.weeklyActivity[weekKey]) {
        progressData.weeklyActivity[weekKey] = 0;
    }
    progressData.weeklyActivity[weekKey]++;
}

// Check achievements
function checkAchievements() {
    const totalExercises = Object.values(progressData.exercises).reduce((sum, ex) => sum + ex.completed, 0);
    const totalTests = progressData.tests.length;
    const hasPerfectScore = progressData.tests.some(t => t.score === 100);
    const studyHours = progressData.studyTime / 60;
    
    achievements.forEach(achievement => {
        if (progressData.achievements.includes(achievement.id)) {
            return; // Already unlocked
        }
        
        let shouldUnlock = false;
        
        switch (achievement.id) {
            case 'first-exercise':
                shouldUnlock = totalExercises >= 1;
                break;
            case 'five-exercises':
                shouldUnlock = totalExercises >= 5;
                break;
            case 'ten-exercises':
                shouldUnlock = totalExercises >= 10;
                break;
            case 'first-test':
                shouldUnlock = totalTests >= 1;
                break;
            case 'perfect-score':
                shouldUnlock = hasPerfectScore;
                break;
            case 'week-streak':
                shouldUnlock = progressData.streak >= 7;
                break;
            case 'month-streak':
                shouldUnlock = progressData.streak >= 30;
                break;
            case 'study-hour':
                shouldUnlock = studyHours >= 1;
                break;
        }
        
        if (shouldUnlock) {
            progressData.achievements.push(achievement.id);
            showAchievementNotification(achievement);
        }
    });
}

// Show achievement notification
function showAchievementNotification(achievement) {
    if (window.showAlert) {
        window.showAlert('success', '🏆 Achievement Unlocked!', `${achievement.name}: ${achievement.description}`);
    }
}

// Update progress display
function updateProgressDisplay() {
    updateOverviewStats();
    updateExerciseProgress();
    updateTestResults();
    updateStudyStreak();
    updateAchievements();
    updateWeeklyActivity();
}

// Update overview stats
function updateOverviewStats() {
    const hours = Math.floor(progressData.studyTime / 60);
    const minutes = progressData.studyTime % 60;
    document.getElementById('totalStudyTime').textContent = `${hours}h ${minutes}m`;
    
    const totalExercises = Object.values(progressData.exercises).reduce((sum, ex) => sum + ex.completed, 0);
    document.getElementById('exercisesCompleted').textContent = totalExercises;
    
    document.getElementById('testsCompleted').textContent = progressData.tests.length;
    
    const avgScore = progressData.tests.length > 0
        ? Math.round(progressData.tests.reduce((sum, t) => sum + t.score, 0) / progressData.tests.length)
        : 0;
    document.getElementById('averageScore').textContent = `${avgScore}%`;
}

// Update exercise progress
function updateExerciseProgress() {
    const grid = document.getElementById('exerciseProgressGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    exercises.forEach(ex => {
        const data = progressData.exercises[ex.id] || { completed: 0, lastCompleted: null };
        const progress = Math.min((data.completed / 10) * 100, 100);
        
        const item = document.createElement('div');
        item.className = 'exercise-progress-item';
        item.innerHTML = `
            <h4>${ex.name}</h4>
            <div class="progress-bar-container">
                <div class="progress-bar-label">
                    <span>Progress</span>
                    <span>${data.completed} completed</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="exercise-stats">
                <span>✅ ${data.completed} times</span>
                ${data.lastCompleted ? `<span>📅 ${new Date(data.lastCompleted).toLocaleDateString()}</span>` : ''}
            </div>
        `;
        grid.appendChild(item);
    });
}

// Update test results
function updateTestResults() {
    const container = document.getElementById('testResultsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (progressData.tests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No tests completed yet.</p>';
        return;
    }
    
    // Show last 10 tests
    const recentTests = progressData.tests.slice(-10).reverse();
    
    recentTests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'test-result-item';
        
        let scoreClass = 'poor';
        if (test.score >= 90) scoreClass = 'excellent';
        else if (test.score >= 70) scoreClass = 'good';
        else if (test.score >= 50) scoreClass = 'fair';
        
        item.innerHTML = `
            <div class="test-result-info">
                <h4>${test.name}</h4>
                <div class="test-result-meta">
                    <span>📅 ${new Date(test.date).toLocaleDateString()}</span>
                    <span>✅ ${test.correct}/${test.total} correct</span>
                </div>
            </div>
            <div class="test-result-score ${scoreClass}">${test.score}%</div>
        `;
        container.appendChild(item);
    });
}

// Update study streak
function updateStudyStreak() {
    document.getElementById('currentStreak').textContent = progressData.streak;
    
    const calendar = document.getElementById('streakCalendar');
    if (!calendar) return;
    
    calendar.innerHTML = '';
    
    // Show last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const isActive = progressData.lastStudyDate && new Date(progressData.lastStudyDate).toDateString() === dateStr;
        
        const day = document.createElement('div');
        day.className = `streak-day ${isActive ? 'active' : ''}`;
        day.textContent = days[date.getDay()];
        calendar.appendChild(day);
    }
}

// Update achievements
function updateAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const isUnlocked = progressData.achievements.includes(achievement.id);
        
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        `;
        grid.appendChild(item);
    });
}

// Update weekly activity
function updateWeeklyActivity() {
    const chart = document.getElementById('activityChart');
    if (!chart) return;
    
    chart.innerHTML = '';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxActivity = Math.max(...Object.values(progressData.weeklyActivity), 1);
    
    days.forEach((day, index) => {
        const weekKey = `week-${index}`;
        const activity = progressData.weeklyActivity[weekKey] || 0;
        const height = (activity / maxActivity) * 100;
        
        const bar = document.createElement('div');
        bar.className = 'activity-bar';
        bar.style.height = `${Math.max(height, 4)}%`;
        
        const label = document.createElement('div');
        label.className = 'activity-bar-label';
        label.textContent = day;
        bar.appendChild(label);
        
        chart.appendChild(bar);
    });
}

// Export functions for use in other scripts
window.progressTracker = {
    trackExerciseCompletion,
    trackTestCompletion,
    trackStudyTime,
    getProgressData: () => progressData
};
