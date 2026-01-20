// Word/Phrases Cards Exercise Functionality

document.addEventListener('DOMContentLoaded', () => {
    const wordsTextarea = document.getElementById('wordsTextarea');
    const doneButton = document.getElementById('doneButton');
    const clearWordsButton = document.getElementById('clearWordsButton');
    const translationsTextarea = document.getElementById('translationsTextarea');
    const translationDoneButton = document.getElementById('translationDoneButton');
    const clearTranslationsButton = document.getElementById('clearTranslationsButton');
    const wordCardsContainer = document.getElementById('wordCardsContainer');

    if (!wordsTextarea || !doneButton || !clearWordsButton || !translationsTextarea || !translationDoneButton || !clearTranslationsButton || !wordCardsContainer) return;

    let words = [];
    let translations = [];
    let cards = [];

    // Handle Done button click for words
    doneButton.addEventListener('click', () => {
        const text = wordsTextarea.value.trim();
        
        if (!text) {
            showAlert('warning', 'Input Required', 'Please enter some words or phrases!');
            return;
        }

        // Split by commas and clean up each word
        words = text
            .split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0);

        if (words.length === 0) {
            showAlert('warning', 'Invalid Input', 'Please enter valid words separated by commas!');
            return;
        }

        // Clear existing cards
        wordCardsContainer.innerHTML = '';
        cards = [];

        // Create a card for each word with animation delay
        words.forEach((word, index) => {
            setTimeout(() => {
                const card = createWordCard(word, index);
                cards.push(card);
            }, index * 150); // 150ms delay between each card
        });
        
        // Track exercise completion
        if (window.progressTracker) {
            window.progressTracker.trackExerciseCompletion('word-cards');
        }
    });

    // Handle Done button click for translations
    translationDoneButton.addEventListener('click', () => {
        const text = translationsTextarea.value.trim();
        
        if (!text) {
            showAlert('warning', 'Input Required', 'Please enter some translations!');
            return;
        }

        // Split by commas and clean up each translation
        translations = text
            .split(',')
            .map(translation => translation.trim())
            .filter(translation => translation.length > 0);

        if (translations.length === 0) {
            showAlert('warning', 'Invalid Input', 'Please enter valid translations separated by commas!');
            return;
        }

        if (cards.length === 0) {
            showAlert('info', 'No Cards', 'Please create cards first by entering words and clicking the first Done button!');
            return;
        }

        // Update card backs with translations
        cards.forEach((card, index) => {
            const translation = translations[index] || `Translation ${index + 1}`;
            const translationElement = card.querySelector('.card-translation');
            if (translationElement) {
                translationElement.textContent = translation;
            }
        });
    });

    function createWordCard(word, index) {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Use placeholder translation initially
        const translation = translations[index] || 'Enter translation';
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-content">
                        <h4 class="card-title">${escapeHtml(word)}</h4>
                        <p class="card-description">Click to flip</p>
                    </div>
                </div>
                <div class="card-back">
                    <div class="card-content">
                        <h4 class="card-title">Translation</h4>
                        <p class="card-translation">${escapeHtml(translation)}</p>
                        <p class="card-hint">Click to flip back</p>
                    </div>
                </div>
            </div>
        `;

        // Add click event to flip the card
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });

        wordCardsContainer.appendChild(card);

        // Trigger animation
        requestAnimationFrame(() => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9) translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'scale(1) translateY(0)';
            }, 10);
        });

        return card;
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clear words textarea
    clearWordsButton.addEventListener('click', () => {
        showAlert('warning', 'Clear Words', 'Are you sure you want to clear the words textarea?', () => {
            wordsTextarea.value = '';
            showAlert('success', 'Cleared', 'Words textarea cleared!');
        });
    });

    // Clear translations textarea
    clearTranslationsButton.addEventListener('click', () => {
        showAlert('warning', 'Clear Translations', 'Are you sure you want to clear the translations textarea?', () => {
            translationsTextarea.value = '';
            showAlert('success', 'Cleared', 'Translations textarea cleared!');
        });
    });
});
