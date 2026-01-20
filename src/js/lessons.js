// Simple Lesson Builder (vanilla JS) using block-based schema
// This is a minimal implementation inspired by the TS design.

(function () {
    const BLOCK_TYPES = ['text', 'image', 'video', 'quiz-single', 'vocab', 'input-gap'];
    const STORAGE_KEY = 'lessons';

    let lessons = [];
    let lesson = createEmptyLesson();
    let selectedBlockId = null;

    function $(id) {
        return document.getElementById(id);
    }

    function createEmptyLesson() {
        const now = Date.now();
        return {
            id: 'lesson-' + now,
            version: 1,
            meta: {
                id: 'meta-' + now,
                title: 'New Lesson',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            blocks: []
        };
    }

    function updateLessonMetaTitle() {
        const titleInput = $('lessonTitleInput');
        if (!titleInput) return;
        lesson.meta.title = titleInput.value || 'New Lesson';
        lesson.meta.updatedAt = new Date().toISOString();
        renderPreview();
    }

    function addBlock(type) {
        const order = lesson.blocks.length;
        const id = 'b-' + Date.now() + '-' + Math.random().toString(16).slice(2);
        let block = { id, type, order, required: true };

        if (type === 'text') {
            block.html = '<p>New text block</p>';
        } else if (type === 'image') {
            block.imageUrl = '';
            block.alt = '';
            block.caption = '';
        } else if (type === 'video') {
            block.videoUrl = '';
        } else if (type === 'quiz-single') {
            block.question = 'New question';
            block.options = [
                { id: id + '-o1', text: 'Option 1' },
                { id: id + '-o2', text: 'Option 2' }
            ];
            block.correctOptionId = '';
            block.explanation = '';
        } else if (type === 'vocab') {
            block.items = [];
            block.layout = 'cards';
        } else if (type === 'input-gap') {
            block.items = [
                {
                    id: id + '-g1',
                    prompt: 'She ____ (to watch) TV every evening.',
                    correctAnswers: ['watches'],
                    explanation: ''
                }
            ];
            block.showInstantFeedback = true;
        }

        lesson.blocks.push(block);
        selectedBlockId = id;
        normalizeOrder();
        renderBlockList();
        renderEditor();
        renderPreview();
    }

    function normalizeOrder() {
        lesson.blocks
            .sort(function (a, b) { return a.order - b.order; })
            .forEach(function (b, idx) { b.order = idx; });
        lesson.meta.updatedAt = new Date().toISOString();
    }

    function selectBlock(id) {
        selectedBlockId = id;
        renderBlockList();
        renderEditor();
    }

    function removeBlock(id) {
        lesson.blocks = lesson.blocks.filter(function (b) { return b.id !== id; });
        if (selectedBlockId === id) {
            selectedBlockId = null;
        }
        normalizeOrder();
        renderBlockList();
        renderEditor();
        renderPreview();
    }

    function moveBlock(id, direction) {
        const blocks = lesson.blocks.slice().sort(function (a, b) { return a.order - b.order; });
        const index = blocks.findIndex(function (b) { return b.id === id; });
        if (index === -1) return;
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= blocks.length) return;
        const tmp = blocks[index];
        blocks[index] = blocks[newIndex];
        blocks[newIndex] = tmp;
        blocks.forEach(function (b, idx) { b.order = idx; });
        lesson.blocks = blocks;
        normalizeOrder();
        renderBlockList();
        renderEditor();
        renderPreview();
    }

    function renderBlockList() {
        const list = $('lessonBlockList');
        if (!list) return;
        list.innerHTML = '';
        var sorted = lesson.blocks.slice().sort(function (a, b) { return a.order - b.order; });
        sorted.forEach(function (block, idx) {
            var item = document.createElement('div');
            item.className = 'lesson-block-list-item' + (block.id === selectedBlockId ? ' selected' : '');
            item.innerHTML =
                '<div class="lesson-block-list-main">' +
                '<span class="lesson-block-index">' + (idx + 1) + '.</span>' +
                '<span class="lesson-block-type">' + block.type + '</span>' +
                '</div>' +
                '<div class="lesson-block-list-actions">' +
                '<button data-action="up">↑</button>' +
                '<button data-action="down">↓</button>' +
                '<button data-action="delete">✕</button>' +
                '</div>';
            item.addEventListener('click', function (e) {
                var target = e.target;
                if (target.tagName === 'BUTTON') {
                    e.stopPropagation();
                    var action = target.getAttribute('data-action');
                    if (action === 'delete') {
                        removeBlock(block.id);
                    } else if (action === 'up') {
                        moveBlock(block.id, -1);
                    } else if (action === 'down') {
                        moveBlock(block.id, 1);
                    }
                } else {
                    selectBlock(block.id);
                }
            });
            list.appendChild(item);
        });
    }

    function renderEditor() {
        const container = $('lessonBlockEditor');
        if (!container) return;
        if (!selectedBlockId) {
            container.className = 'lesson-block-editor-empty';
            container.textContent = 'Select a block from the left or add a new block.';

            return;
        }
        const block = lesson.blocks.find(function (b) { return b.id === selectedBlockId; });
        if (!block) {
            container.className = 'lesson-block-editor-empty';
            container.textContent = 'Select a block from the left or add a new block.';
            return;
        }

        container.className = 'lesson-block-editor';
        container.innerHTML = '';

        var titleInput = document.createElement('input');
        titleInput.className = 'lesson-block-title-input';
        titleInput.placeholder = 'Optional block title';
        titleInput.value = block.title || '';
        titleInput.addEventListener('input', function () {
            block.title = titleInput.value;
            lesson.meta.updatedAt = new Date().toISOString();
            renderPreview();
        });
        container.appendChild(titleInput);

        if (block.type === 'text') {
            var ta = document.createElement('textarea');
            ta.className = 'lesson-block-textarea';
            ta.value = block.html || '';
            ta.addEventListener('input', function () {
                block.html = ta.value;
                lesson.meta.updatedAt = new Date().toISOString();
                renderPreview();
            });
            container.appendChild(labelWrap('Content (HTML)', ta));
        } else if (block.type === 'image') {
            // Upload from computer
            var uploadInput = document.createElement('input');
            uploadInput.type = 'file';
            uploadInput.accept = 'image/*';
            uploadInput.addEventListener('change', function (e) {
                var file = e.target.files && e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (event) {
                    block.imageUrl = (event && event.target && event.target.result) || '';
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderEditor();
                    renderPreview();
                };
                reader.readAsDataURL(file);
            });
            container.appendChild(labelWrap('Upload from computer', uploadInput));

            // Pick from Materials (photos saved on Materials page) - modern gallery
            var photos = [];
            try {
                photos = JSON.parse(localStorage.getItem('materialsPhotos') || '[]');
            } catch (e) {
                photos = [];
            }

            if (photos && photos.length) {
                var gallery = document.createElement('div');
                gallery.className = 'lesson-materials-photo-picker';

                photos.forEach(function (photo) {
                    var item = document.createElement('button');
                    item.type = 'button';
                    item.className = 'lesson-materials-photo-item';

                    var img = document.createElement('img');
                    img.className = 'lesson-materials-photo-thumb';
                    img.src = photo.data || '';
                    img.alt = photo.name || 'Photo';

                    var name = document.createElement('div');
                    name.className = 'lesson-materials-photo-name';
                    name.textContent = photo.name || 'Photo';

                    if (block.imageUrl && photo.data && block.imageUrl === photo.data) {
                        item.classList.add('selected');
                    }

                    item.addEventListener('click', function () {
                        block.imageUrl = photo.data || '';
                        lesson.meta.updatedAt = new Date().toISOString();
                        renderEditor();
                        renderPreview();
                    });

                    item.appendChild(img);
                    item.appendChild(name);
                    gallery.appendChild(item);
                });

                container.appendChild(labelWrap('Or pick from Materials (Photos)', gallery));
            } else {
                var info = document.createElement('div');
                info.className = 'lesson-field-info';
                info.textContent = 'No photos saved in Materials yet. Upload photos on the Materials page first.';
                container.appendChild(labelWrap('Or pick from Materials (Photos)', info));
            }

            // Direct URL & meta (optional override)
            container.appendChild(labelWrap('Image URL (optional, overrides selection)', inputFor(block, 'imageUrl')));
            container.appendChild(labelWrap('Alt text', inputFor(block, 'alt')));
            container.appendChild(labelWrap('Caption', inputFor(block, 'caption')));
        } else if (block.type === 'video') {
            container.appendChild(labelWrap('Video URL (YouTube or file URL)', inputFor(block, 'videoUrl')));
        } else if (block.type === 'quiz-single') {
            var qInput = document.createElement('textarea');
            qInput.className = 'lesson-block-textarea';
            qInput.value = block.question || '';
            qInput.addEventListener('input', function () {
                block.question = qInput.value;
                lesson.meta.updatedAt = new Date().toISOString();
                renderJson();
                renderPreview();
            });
            container.appendChild(labelWrap('Question', qInput));

            var optionsContainer = document.createElement('div');
            optionsContainer.className = 'lesson-quiz-options-editor';
            (block.options || []).forEach(function (opt) {
                var row = document.createElement('div');
                row.className = 'lesson-quiz-option-row';

                var radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'correct-' + block.id;
                radio.checked = block.correctOptionId === opt.id;
                radio.addEventListener('change', function () {
                    block.correctOptionId = opt.id;
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderPreview();
                });
                row.appendChild(radio);

                var optInput = document.createElement('input');
                optInput.className = 'lesson-quiz-option-input';
                optInput.value = opt.text || '';
                optInput.addEventListener('input', function () {
                    opt.text = optInput.value;
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderPreview();
                });
                row.appendChild(optInput);

                var delBtn = document.createElement('button');
                delBtn.textContent = '✕';
                delBtn.addEventListener('click', function () {
                    block.options = block.options.filter(function (o) { return o.id !== opt.id; });
                    if (block.correctOptionId === opt.id) block.correctOptionId = '';
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderEditor();
                    renderPreview();
                });
                row.appendChild(delBtn);

                optionsContainer.appendChild(row);
            });

            var addOptBtn = document.createElement('button');
            addOptBtn.textContent = '+ Add option';
            addOptBtn.addEventListener('click', function () {
                var newId = block.id + '-o' + (block.options.length + 1);
                block.options.push({ id: newId, text: 'New option' });
                lesson.meta.updatedAt = new Date().toISOString();
                renderEditor();
                renderPreview();
            });
            optionsContainer.appendChild(addOptBtn);

            container.appendChild(labelWrap('Options', optionsContainer));

            var expTa = document.createElement('textarea');
            expTa.className = 'lesson-block-textarea';
            expTa.value = block.explanation || '';
            expTa.addEventListener('input', function () {
                block.explanation = expTa.value;
                lesson.meta.updatedAt = new Date().toISOString();
                renderPreview();
            });
            container.appendChild(labelWrap('Explanation (optional)', expTa));
        } else if (block.type === 'vocab') {
            var list = document.createElement('div');
            list.className = 'lesson-vocab-editor';
            (block.items || []).forEach(function (item) {
                var row = document.createElement('div');
                row.className = 'lesson-vocab-row';

                var wordInput = document.createElement('input');
                wordInput.placeholder = 'Word';
                wordInput.value = item.word || '';
                wordInput.addEventListener('input', function () {
                    item.word = wordInput.value;
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderPreview();
                });

                var trInput = document.createElement('input');
                trInput.placeholder = 'Translation';
                trInput.value = item.translation || '';
                trInput.addEventListener('input', function () {
                    item.translation = trInput.value;
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderPreview();
                });

                var exInput = document.createElement('input');
                exInput.placeholder = 'Example (optional)';
                exInput.value = item.exampleSentence || '';
                exInput.addEventListener('input', function () {
                    item.exampleSentence = exInput.value;
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderPreview();
                });

                var delBtn2 = document.createElement('button');
                delBtn2.textContent = '✕';
                delBtn2.addEventListener('click', function () {
                    block.items = block.items.filter(function (i) { return i.id !== item.id; });
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderEditor();
                    renderPreview();
                });

                row.appendChild(wordInput);
                row.appendChild(trInput);
                row.appendChild(exInput);
                row.appendChild(delBtn2);
                list.appendChild(row);
            });

            var addVocabBtn = document.createElement('button');
            addVocabBtn.textContent = '+ Add word';
            addVocabBtn.addEventListener('click', function () {
                var vid = block.id + '-v' + (block.items.length + 1);
                block.items.push({ id: vid, word: '', translation: '' });
                lesson.meta.updatedAt = new Date().toISOString();
                renderEditor();
                renderPreview();
            });
            list.appendChild(addVocabBtn);

            container.appendChild(labelWrap('Vocabulary items', list));
        } else if (block.type === 'input-gap') {
            var gaps = document.createElement('div');
            gaps.className = 'lesson-input-gap-editor';
            (block.items || []).forEach(function (item) {
                var row = document.createElement('div');
                row.className = 'lesson-input-gap-row';

                var promptTa = document.createElement('textarea');
                promptTa.placeholder = 'Prompt with gap';
                promptTa.value = item.prompt || '';
                promptTa.addEventListener('input', function () {
                    item.prompt = promptTa.value;
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderPreview();
                });

                var ansInput = document.createElement('input');
                ansInput.placeholder = 'Correct answers (comma separated)';
                ansInput.value = (item.correctAnswers || []).join(', ');
                ansInput.addEventListener('input', function () {
                    item.correctAnswers = ansInput.value
                        .split(',')
                        .map(function (s) { return s.trim(); })
                        .filter(function (s) { return s.length > 0; });
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderPreview();
                });

                var delBtn3 = document.createElement('button');
                delBtn3.textContent = '✕';
                delBtn3.addEventListener('click', function () {
                    block.items = block.items.filter(function (i) { return i.id !== item.id; });
                    lesson.meta.updatedAt = new Date().toISOString();
                    renderEditor();
                    renderPreview();
                });

                row.appendChild(promptTa);
                row.appendChild(ansInput);
                row.appendChild(delBtn3);
                gaps.appendChild(row);
            });

            var addGapBtn = document.createElement('button');
            addGapBtn.textContent = '+ Add gap item';
            addGapBtn.addEventListener('click', function () {
                var gid = block.id + '-g' + (block.items.length + 1);
                block.items.push({
                    id: gid,
                    prompt: '',
                    correctAnswers: []
                });
                lesson.meta.updatedAt = new Date().toISOString();
                renderEditor();
                renderPreview();
            });
            gaps.appendChild(addGapBtn);

            container.appendChild(labelWrap('Input items', gaps));
        }
    }

    function labelWrap(labelText, element) {
        var wrapper = document.createElement('div');
        wrapper.className = 'lesson-field';
        var label = document.createElement('label');
        label.className = 'lesson-field-label';
        label.textContent = labelText;
        wrapper.appendChild(label);
        wrapper.appendChild(element);
        return wrapper;
    }

    function inputFor(block, field) {
        var input = document.createElement('input');
        input.className = 'lesson-block-input';
        input.value = block[field] || '';
        input.addEventListener('input', function () {
            block[field] = input.value;
            lesson.meta.updatedAt = new Date().toISOString();
            renderPreview();
        });
        return input;
    }

    function renderPreview() {
        var container = $('lessonPreview');
        var progressFill = $('lessonPreviewProgressFill');
        var progressText = $('lessonPreviewProgressText');
        if (!container || !progressFill || !progressText) return;

        container.innerHTML = '';
        var blocks = lesson.blocks.slice().sort(function (a, b) { return a.order - b.order; });

        var totalRequired = blocks.length;
        var completed = 0;

        blocks.forEach(function (block) {
            var el = document.createElement('div');
            el.className = 'lesson-preview-block lesson-preview-block-' + block.type;

            if (block.title) {
                var h = document.createElement('h3');
                h.textContent = block.title;
                el.appendChild(h);
            }

            if (block.type === 'text') {
                var d = document.createElement('div');
                d.className = 'lesson-preview-text';
                d.innerHTML = block.html || '';
                el.appendChild(d);
                completed++;
            } else if (block.type === 'image') {
                var img = document.createElement('img');
                img.src = block.imageUrl || '';
                img.alt = block.alt || '';
                img.className = 'lesson-preview-image';
                el.appendChild(img);
                if (block.caption) {
                    var cap = document.createElement('div');
                    cap.className = 'lesson-preview-caption';
                    cap.textContent = block.caption;
                    el.appendChild(cap);
                }
                completed++;
            } else if (block.type === 'video') {
                var info = document.createElement('div');
                info.className = 'lesson-preview-video';
                info.textContent = 'Video: ' + (block.videoUrl || '(no URL)');
                el.appendChild(info);
                completed++;
            } else if (block.type === 'quiz-single') {
                var p = document.createElement('p');
                p.textContent = block.question || '';
                el.appendChild(p);
                (block.options || []).forEach(function (opt) {
                    var btn = document.createElement('button');
                    btn.className = 'lesson-preview-quiz-option';
                    btn.textContent = opt.text || '';
                    btn.addEventListener('click', function () {
                        var isCorrect = block.correctOptionId === opt.id;
                        if (typeof window.showAlert === 'function') {
                            if (isCorrect) {
                                window.showAlert('success', 'Correct', 'Good job!');
                            } else {
                                window.showAlert('warning', 'Try again', 'This is not correct.');
                            }
                        }
                    });
                    el.appendChild(btn);
                });
            } else if (block.type === 'vocab') {
                (block.items || []).forEach(function (item) {
                    var row = document.createElement('div');
                    row.className = 'lesson-preview-vocab-row';
                    row.textContent = (item.word || '') + ' – ' + (item.translation || '');
                    el.appendChild(row);
                });
                completed++;
            } else if (block.type === 'input-gap') {
                (block.items || []).forEach(function (item) {
                    var row = document.createElement('div');
                    row.className = 'lesson-preview-gap-row';
                    var label = document.createElement('div');
                    label.textContent = item.prompt || '';
                    var input = document.createElement('input');
                    input.className = 'lesson-preview-gap-input';
                    var btn = document.createElement('button');
                    btn.textContent = 'Check';
                    btn.addEventListener('click', function () {
                        var val = (input.value || '').trim().toLowerCase();
                        var ok = (item.correctAnswers || []).some(function (ans) {
                            return ans.toLowerCase() === val;
                        });
                        if (typeof window.showAlert === 'function') {
                            if (ok) {
                                window.showAlert('success', 'Correct', 'Well done!');
                            } else {
                                window.showAlert('warning', 'Incorrect', 'Try again.');
                            }
                        }
                    });
                    row.appendChild(label);
                    row.appendChild(input);
                    row.appendChild(btn);
                    el.appendChild(row);
                });
            }

            container.appendChild(el);
        });

        var progress = totalRequired ? Math.round((completed / totalRequired) * 100) : 0;
        progressFill.style.width = progress + '%';
        progressText.textContent = progress + '% completed';
    }

    function bindToolbar() {
        var toolbarButtons = document.querySelectorAll('.lesson-toolbar-btn');
        toolbarButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var type = btn.getAttribute('data-block-type');
                if (BLOCK_TYPES.indexOf(type) !== -1) {
                    addBlock(type);
                }
            });
        });
    }

    function bindMeta() {
        var titleInput = $('lessonTitleInput');
        if (titleInput) {
            titleInput.addEventListener('input', updateLessonMetaTitle);
        }
    }

    function bindActions() {
        var saveBtn = $('saveLessonBtn');
        var clearBtn = $('clearLessonBtn');
        var newBtn = $('newLessonBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                saveCurrentLesson();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (window.showAlert) {
                    window.showAlert(
                        'warning',
                        'Clear lesson',
                        'Are you sure you want to clear the current lesson?',
                        function () {
                            lesson = createEmptyLesson();
                            selectedBlockId = null;
                            normalizeOrder();
                            renderBlockList();
                            renderEditor();
                            renderPreview();
                        }
                    );
                } else {
                    lesson = createEmptyLesson();
                    selectedBlockId = null;
                    normalizeOrder();
                    renderBlockList();
                    renderEditor();
                    renderPreview();
                }
            });
        }
        if (newBtn) {
            newBtn.addEventListener('click', function () {
                lesson = createEmptyLesson();
                selectedBlockId = null;
                var titleInput = $('lessonTitleInput');
                if (titleInput) {
                    titleInput.value = lesson.meta.title || 'New Lesson';
                }
                normalizeOrder();
                renderBlockList();
                renderEditor();
                renderPreview();
            });
        }
    }

    function saveCurrentLesson() {
        if (!lesson.meta.title || !lesson.meta.title.trim()) {
            if (window.showAlert) {
                window.showAlert('warning', 'Title required', 'Please enter a lesson title before saving.');
            }
            return;
        }

        if (!lesson.meta.createdAt) {
            lesson.meta.createdAt = new Date().toISOString();
        }
        lesson.meta.updatedAt = new Date().toISOString();

        var idx = lessons.findIndex(function (l) { return l.id === lesson.id; });
        var clone = JSON.parse(JSON.stringify(lesson));
        if (idx === -1) {
            lessons.push(clone);
        } else {
            lessons[idx] = clone;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
        renderLessonList();

        if (window.showAlert) {
            window.showAlert('success', 'Lesson saved', 'Your lesson has been saved.');
        }
    }

    function renderLessonList() {
        var listEl = $('lessonList');
        if (!listEl) return;
        listEl.innerHTML = '';

        if (!lessons.length) {
            var empty = document.createElement('div');
            empty.className = 'lesson-block-editor-empty';
            empty.textContent = 'No saved lessons yet.';
            listEl.appendChild(empty);
            return;
        }

        lessons.forEach(function (l) {
            var item = document.createElement('div');
            item.className = 'lesson-block-list-item' + (l.id === lesson.id ? ' selected' : '');
            item.innerHTML =
                '<div class="lesson-block-list-main">' +
                '<span class="lesson-block-type">' + (l.meta.title || 'Untitled lesson') + '</span>' +
                '</div>' +
                '<div class="lesson-block-list-actions">' +
                '<button data-action="load">✎</button>' +
                '<button data-action="delete">🗑️</button>' +
                '</div>';

            item.addEventListener('click', function (e) {
                var target = e.target;
                if (target.tagName === 'BUTTON') {
                    e.stopPropagation();
                    var action = target.getAttribute('data-action');
                    if (action === 'load') {
                        loadLessonById(l.id);
                    } else if (action === 'delete') {
                        deleteLessonById(l.id);
                    }
                } else {
                    loadLessonById(l.id);
                }
            });

            listEl.appendChild(item);
        });
    }

    function loadLessonById(id) {
        var found = lessons.find(function (l) { return l.id === id; });
        if (!found) return;
        lesson = JSON.parse(JSON.stringify(found));
        selectedBlockId = null;
        var titleInput = $('lessonTitleInput');
        if (titleInput) {
            titleInput.value = lesson.meta.title || 'New Lesson';
        }
        normalizeOrder();
        renderBlockList();
        renderEditor();
        renderPreview();
    }

    function deleteLessonById(id) {
        var doDelete = function () {
            lessons = lessons.filter(function (l) { return l.id !== id; });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
            if (lesson.id === id) {
                lesson = createEmptyLesson();
                selectedBlockId = null;
            }
            renderLessonList();
            renderBlockList();
            renderEditor();
            renderPreview();
        };

        if (window.showAlert) {
            window.showAlert(
                'warning',
                'Delete lesson',
                'Are you sure you want to delete this lesson?',
                doDelete
            );
        } else {
            doDelete();
        }
    }

    window.addEventListener('load', function () {
        if (!document.getElementById('lessonBuilder')) return;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            lessons = raw ? JSON.parse(raw) : [];
        } catch (e) {
            lessons = [];
        }
        bindToolbar();
        bindMeta();
        bindActions();
        renderLessonList();
        renderBlockList();
        renderEditor();
        renderPreview();
    });
})();

