// Student Section - Display all lessons for students to study
(function () {
    const STORAGE_KEY = 'lessons';

    function $(id) {
        return document.getElementById(id);
    }

    function loadLessons() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function renderLesson(lesson, container) {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'student-lesson-card';

        const header = document.createElement('div');
        header.className = 'student-lesson-header';
        
        const title = document.createElement('h3');
        title.className = 'student-lesson-title';
        title.textContent = lesson.meta.title || 'Untitled Lesson';
        header.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'student-lesson-meta';
        if (lesson.meta.createdAt) {
            const date = new Date(lesson.meta.createdAt);
            meta.textContent = 'Created: ' + date.toLocaleDateString();
        }
        header.appendChild(meta);

        lessonCard.appendChild(header);

        const content = document.createElement('div');
        content.className = 'student-lesson-content';

        const blocks = (lesson.blocks || []).slice().sort(function (a, b) {
            return (a.order || 0) - (b.order || 0);
        });

        if (blocks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'student-lesson-empty';
            empty.textContent = 'This lesson has no content yet.';
            content.appendChild(empty);
        } else {
            // Group image blocks with following text blocks
            let i = 0;
            while (i < blocks.length) {
                const block = blocks[i];
                
                // Check if current block is image and next block is text
                if (block.type === 'image' && i + 1 < blocks.length && blocks[i + 1].type === 'text') {
                    // Create a wrapper for image + text layout
                    const wrapper = document.createElement('div');
                    wrapper.className = 'student-lesson-image-text-wrapper';
                    
                    const imageBlockEl = renderBlock(block);
                    if (imageBlockEl) {
                        wrapper.appendChild(imageBlockEl);
                    }
                    
                    const textBlockEl = renderBlock(blocks[i + 1]);
                    if (textBlockEl) {
                        wrapper.appendChild(textBlockEl);
                    }
                    
                    content.appendChild(wrapper);
                    i += 2; // Skip both blocks
                } else {
                    // Render block normally
                    const blockEl = renderBlock(block);
                    if (blockEl) {
                        content.appendChild(blockEl);
                    }
                    i++;
                }
            }
        }

        lessonCard.appendChild(content);

        const progressBar = document.createElement('div');
        progressBar.className = 'student-lesson-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'student-lesson-progress-fill';
        progressFill.style.width = '0%';
        progressBar.appendChild(progressFill);
        lessonCard.appendChild(progressBar);

        container.appendChild(lessonCard);
    }

    function renderBlock(block) {
        const el = document.createElement('div');
        el.className = 'student-lesson-block student-lesson-block-' + block.type;

        if (block.title) {
            const h = document.createElement('h4');
            h.textContent = block.title;
            el.appendChild(h);
        }

        if (block.type === 'text') {
            const d = document.createElement('div');
            d.className = 'student-lesson-text';
            d.innerHTML = block.html || '';
            el.appendChild(d);
        } else if (block.type === 'image') {
            if (block.imageUrl) {
                const img = document.createElement('img');
                img.src = block.imageUrl;
                img.alt = block.alt || '';
                img.className = 'student-lesson-image';
                el.appendChild(img);
            }
            if (block.caption) {
                const cap = document.createElement('div');
                cap.className = 'student-lesson-caption';
                cap.textContent = block.caption;
                el.appendChild(cap);
            }
        } else if (block.type === 'video') {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'student-lesson-video-container';
            
            if (block.videoUrl) {
                // Try to extract YouTube video ID
                let videoId = null;
                const ytMatch = block.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
                if (ytMatch) {
                    videoId = ytMatch[1];
                }

                if (videoId) {
                    const iframe = document.createElement('iframe');
                    iframe.src = 'https://www.youtube.com/embed/' + videoId;
                    iframe.allowFullscreen = true;
                    iframe.className = 'student-lesson-video';
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    videoContainer.appendChild(iframe);
                } else {
                    const link = document.createElement('a');
                    link.href = block.videoUrl;
                    link.target = '_blank';
                    link.className = 'student-lesson-video-link';
                    link.textContent = 'Watch Video: ' + block.videoUrl;
                    videoContainer.appendChild(link);
                }
            } else {
                const info = document.createElement('div');
                info.className = 'student-lesson-video-info';
                info.textContent = 'Video URL not provided.';
                videoContainer.appendChild(info);
            }
            el.appendChild(videoContainer);
        } else if (block.type === 'quiz-single') {
            const question = document.createElement('p');
            question.className = 'student-lesson-quiz-question';
            question.textContent = block.question || 'Question';
            el.appendChild(question);

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'student-lesson-quiz-options';

            (block.options || []).forEach(function (opt) {
                const btn = document.createElement('button');
                btn.className = 'student-lesson-quiz-option';
                btn.textContent = opt.text || '';
                btn.dataset.optionId = opt.id || '';
                btn.dataset.correct = (block.correctOptionId === opt.id) ? 'true' : 'false';
                
                btn.addEventListener('click', function () {
                    const isCorrect = block.correctOptionId === opt.id;
                    const allOptions = optionsContainer.querySelectorAll('.student-lesson-quiz-option');
                    
                    allOptions.forEach(function (option) {
                        option.disabled = true;
                        if (option.dataset.correct === 'true') {
                            option.classList.add('correct');
                        } else if (option === btn && !isCorrect) {
                            option.classList.add('incorrect');
                        }
                    });

                    if (typeof window.showAlert === 'function') {
                        if (isCorrect) {
                            window.showAlert('success', 'Correct!', block.explanation || 'Well done!');
                        } else {
                            window.showAlert('warning', 'Incorrect', 'Try again or check the explanation.');
                        }
                    }
                });

                optionsContainer.appendChild(btn);
            });

            el.appendChild(optionsContainer);
        } else if (block.type === 'vocab') {
            const vocabContainer = document.createElement('div');
            vocabContainer.className = 'student-lesson-vocab-container';

            if (block.layout === 'cards') {
                vocabContainer.classList.add('vocab-cards');
            }

            (block.items || []).forEach(function (item) {
                const itemEl = document.createElement('div');
                itemEl.className = 'student-lesson-vocab-item';
                itemEl.innerHTML = '<strong>' + (item.word || '') + '</strong> – ' + (item.translation || '');
                if (item.example) {
                    const example = document.createElement('div');
                    example.className = 'student-lesson-vocab-example';
                    example.textContent = 'Example: ' + item.example;
                    itemEl.appendChild(example);
                }
                vocabContainer.appendChild(itemEl);
            });

            el.appendChild(vocabContainer);
        } else if (block.type === 'input-gap') {
            const gapContainer = document.createElement('div');
            gapContainer.className = 'student-lesson-gap-container';

            (block.items || []).forEach(function (item) {
                const itemEl = document.createElement('div');
                itemEl.className = 'student-lesson-gap-item';

                const prompt = document.createElement('div');
                prompt.className = 'student-lesson-gap-prompt';
                prompt.textContent = item.prompt || '';
                itemEl.appendChild(prompt);

                const inputGroup = document.createElement('div');
                inputGroup.className = 'student-lesson-gap-input-group';

                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'student-lesson-gap-input';
                input.placeholder = 'Enter your answer';

                const checkBtn = document.createElement('button');
                checkBtn.className = 'student-lesson-gap-check-btn';
                checkBtn.textContent = 'Check';

                checkBtn.addEventListener('click', function () {
                    const val = (input.value || '').trim().toLowerCase();
                    const isCorrect = (item.correctAnswers || []).some(function (ans) {
                        return ans.toLowerCase() === val;
                    });

                    input.disabled = true;
                    checkBtn.disabled = true;

                    if (isCorrect) {
                        input.classList.add('correct');
                        checkBtn.classList.add('correct');
                        if (typeof window.showAlert === 'function') {
                            window.showAlert('success', 'Correct!', item.explanation || 'Well done!');
                        }
                    } else {
                        input.classList.add('incorrect');
                        checkBtn.classList.add('incorrect');
                        if (typeof window.showAlert === 'function') {
                            window.showAlert('warning', 'Incorrect', item.explanation || 'Try again.');
                        }
                    }
                });

                input.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        checkBtn.click();
                    }
                });

                inputGroup.appendChild(input);
                inputGroup.appendChild(checkBtn);
                itemEl.appendChild(inputGroup);

                gapContainer.appendChild(itemEl);
            });

            el.appendChild(gapContainer);
        }

        return el;
    }

    function renderAllLessons() {
        const container = $('studentLessonsContainer');
        if (!container) return;

        container.innerHTML = '';

        const lessons = loadLessons();

        if (lessons.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'student-lessons-empty';
            empty.innerHTML = '<p>No lessons available yet.</p><p>Lessons will appear here once they are created in the Lesson Builder.</p>';
            container.appendChild(empty);
            return;
        }

        lessons.forEach(function (lesson) {
            renderLesson(lesson, container);
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAllLessons);
    } else {
        renderAllLessons();
    }
})();
