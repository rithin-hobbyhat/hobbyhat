/**
 * MCQ Practice Arena - Client-Side Engine
 * Fast, lightweight vanilla JavaScript with offline support,
 * multi-subject selection, instant explanation feedback, and score tracking.
 * Monochrome Black & White Theme (Zero Emojis, High Contrast)
 */

(function () {
  'use strict';

  // State Management
  const state = {
    subjects: [],             // All subjects loaded from subjects.json
    selectedSubjects: new Set(), // Set of selected subject names
    allQuestionsCache: null,  // Cached questions array
    activePool: [],           // Final filtered & prepared questions for practice
    currentIndex: 0,          // Current question index in activePool
    userAnswers: {},          // Map of qIndex -> { selected: 'A', isCorrect: bool, question: {} }
    
    // Settings
    orderMode: 'random',      // 'random' | 'sequential'
    questionLimit: 'all',     // Always run all available MCQs
    showExplanationOnWrong: true,
    autoScrollExp: true,
    soundEnabled: true,

    // Statistics
    stats: {
      correct: 0,
      wrong: 0,
      attended: 0,
      startTime: null,
      endTime: null
    }
  };

  // Sound Synthesizer via Web Audio API (zero audio assets to download)
  const audioCtx = window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;

  function playSound(type) {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch (e) {
      // Audio autoplay policy catch
    }

    // Smartphone Haptic Vibration
    if (navigator.vibrate) {
      if (type === 'correct') {
        navigator.vibrate(30);
      } else if (type === 'wrong') {
        navigator.vibrate([40, 50, 40]);
      }
    }
  }

  // DOM Elements
  const DOM = {
    // Screens
    screenSetup: document.getElementById('screen-setup'),
    screenPractice: document.getElementById('screen-practice'),
    screenResults: document.getElementById('screen-results'),
    
    // Navbar
    btnHome: document.getElementById('btn-home'),
    btnSound: document.getElementById('btn-sound'),
    soundIconSvg: document.getElementById('sound-icon-svg'),
    navSubtitle: document.getElementById('nav-subtitle'),

    // Setup Screen
    subjectsContainer: document.getElementById('subjects-container'),
    subjectCounter: document.getElementById('subject-selection-counter'),
    btnSelectAll: document.getElementById('btn-select-all'),
    btnClearAll: document.getElementById('btn-clear-all'),
    subjectSearchInput: document.getElementById('subject-search-input'),
    chkWrongExp: document.getElementById('chk-wrong-explanation'),
    chkAutoScroll: document.getElementById('chk-auto-scroll'),
    btnStartPractice: document.getElementById('btn-start-practice'),
    startBtnText: document.getElementById('start-btn-text'),

    // Practice Screen
    qCounter: document.getElementById('q-counter'),
    scorePoints: document.getElementById('score-points'),
    scorePct: document.getElementById('score-pct'),
    progressFill: document.getElementById('progress-fill'),
    statCorrect: document.getElementById('stat-correct'),
    statWrong: document.getElementById('stat-wrong'),
    statRemaining: document.getElementById('stat-remaining'),
    btnGridToggle: document.getElementById('btn-grid-toggle'),

    // Question Card
    qSubjectTag: document.getElementById('q-subject-tag'),
    qIdTag: document.getElementById('q-id-tag'),
    qDiffTag: document.getElementById('q-diff-tag'),
    qText: document.getElementById('q-text'),
    optionsContainer: document.getElementById('options-container'),
    
    // Explanation Box
    explanationBox: document.getElementById('explanation-box'),
    expHeader: document.getElementById('exp-header'),
    expTitle: document.getElementById('exp-title'),
    expCorrectBanner: document.getElementById('exp-correct-banner'),
    expText: document.getElementById('exp-text'),

    // Navigation Controls
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnNextText: document.getElementById('btn-next-text'),
    btnFinishEarly: document.getElementById('btn-finish-early'),

    // Results Screen
    resultBadge: document.getElementById('result-badge'),
    resScoreRatio: document.getElementById('res-score-ratio'),
    resScorePct: document.getElementById('res-score-pct'),
    resHeadline: document.getElementById('res-headline'),
    resSub: document.getElementById('res-sub'),
    resCorrectCount: document.getElementById('res-correct-count'),
    resWrongCount: document.getElementById('res-wrong-count'),
    resAttendedCount: document.getElementById('res-attended-count'),
    resUnattendedCount: document.getElementById('res-unattended-count'),
    btnRestartMistakes: document.getElementById('btn-restart-mistakes'),
    retestCount: document.getElementById('retest-count'),
    btnRestartSame: document.getElementById('btn-restart-same'),
    btnNewSetup: document.getElementById('btn-new-setup'),
    reviewFilters: document.getElementById('review-filters'),
    reviewListContainer: document.getElementById('review-list-container'),
    revFilterWrong: document.getElementById('rev-filter-wrong'),
    revFilterCorrect: document.getElementById('rev-filter-correct'),

    // Jump Grid Modal
    gridModal: document.getElementById('grid-modal'),
    btnCloseGrid: document.getElementById('btn-close-grid'),
    jumpMatrixContainer: document.getElementById('jump-matrix-container'),

    // Toast
    toast: document.getElementById('toast')
  };

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');
    toastTimer = setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, 2200);
  }

  // Switch Screens
  function showScreen(screenId) {
    [DOM.screenSetup, DOM.screenPractice, DOM.screenResults].forEach(s => s.classList.remove('active'));
    if (screenId === 'setup') {
      DOM.screenSetup.classList.add('active');
      DOM.navSubtitle.textContent = '5,700+ Questions • Technical Question Bank';
    } else if (screenId === 'practice') {
      DOM.screenPractice.classList.add('active');
      DOM.navSubtitle.textContent = `Practicing: ${state.selectedSubjects.size} Subject(s)`;
    } else if (screenId === 'results') {
      DOM.screenResults.classList.add('active');
      DOM.navSubtitle.textContent = 'Performance Report';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // =========================================================================
  // INITIALIZATION & SUBJECT LOADING
  // =========================================================================
  async function init() {
    loadPreferences();
    setupEventListeners();
    await loadSubjectsData();
    registerServiceWorker();
  }

  function loadPreferences() {
    const savedSound = localStorage.getItem('mcq_sound');
    if (savedSound === 'off') {
      state.soundEnabled = false;
      if (DOM.soundIconSvg) DOM.soundIconSvg.style.opacity = '0.35';
    } else {
      state.soundEnabled = true;
      if (DOM.soundIconSvg) DOM.soundIconSvg.style.opacity = '1.0';
    }
  }

  async function loadSubjectsData() {
    try {
      const res = await fetch('./data/subjects.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.subjects = await res.json();
      renderSubjectsGrid(state.subjects);
      updateSelectionSummary();
    } catch (err) {
      console.error('Failed to load subjects:', err);
      DOM.subjectsContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--danger);">
          Failed to load subjects. Please ensure you are running via a web server or hosting online.
          <br><br>
          <small>${err.message}</small>
        </div>
      `;
    }
  }

  function renderSubjectsGrid(list) {
    if (!list || list.length === 0) {
      DOM.subjectsContainer.innerHTML = '<div style="padding: 15px; color: var(--text-secondary);">No subjects found matching query.</div>';
      return;
    }

    DOM.subjectsContainer.innerHTML = '';
    list.forEach(subj => {
      const isSelected = state.selectedSubjects.has(subj.name);
      const item = document.createElement('div');
      item.className = `subject-item ${isSelected ? 'selected' : ''}`;
      item.dataset.name = subj.name;
      item.dataset.code = subj.code;
      item.dataset.slug = subj.slug;
      item.dataset.count = subj.count;

      item.innerHTML = `
        <div class="subj-info">
          <div class="subj-name">${escapeHtml(subj.name)}</div>
          <div class="subj-meta">
            <span class="subj-code-badge">${escapeHtml(subj.code)}</span>
            <span>${subj.count} Questions</span>
          </div>
        </div>
        <div class="subj-checkbox"></div>
      `;

      item.addEventListener('click', () => toggleSubjectSelection(subj.name));
      DOM.subjectsContainer.appendChild(item);
    });
  }

  function toggleSubjectSelection(name) {
    if (state.selectedSubjects.has(name)) {
      state.selectedSubjects.delete(name);
    } else {
      state.selectedSubjects.add(name);
    }

    const elements = DOM.subjectsContainer.querySelectorAll('.subject-item');
    elements.forEach(el => {
      if (el.dataset.name === name) {
        if (state.selectedSubjects.has(name)) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        }
      }
    });

    updateSelectionSummary();
  }

  function updateSelectionSummary() {
    let totalQuestions = 0;
    state.subjects.forEach(s => {
      if (state.selectedSubjects.has(s.name)) {
        totalQuestions += s.count;
      }
    });

    const count = state.selectedSubjects.size;
    DOM.subjectCounter.textContent = `${count} of ${state.subjects.length} subjects selected (${totalQuestions.toLocaleString()} questions)`;

    if (count > 0) {
      DOM.btnStartPractice.disabled = false;
      DOM.startBtnText.textContent = `Start Practice with All ${totalQuestions.toLocaleString()} Questions (${count} Subject${count > 1 ? 's' : ''})`;
    } else {
      DOM.btnStartPractice.disabled = true;
      DOM.startBtnText.textContent = 'Select at least 1 subject to start';
    }
  }

  // =========================================================================
  // SETUP EVENT LISTENERS
  // =========================================================================
  function setupEventListeners() {
    // Sound toggle
    DOM.btnSound.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      if (state.soundEnabled) {
        if (DOM.soundIconSvg) DOM.soundIconSvg.style.opacity = '1.0';
        localStorage.setItem('mcq_sound', 'on');
        showToast('Sound feedback enabled');
      } else {
        if (DOM.soundIconSvg) DOM.soundIconSvg.style.opacity = '0.35';
        localStorage.setItem('mcq_sound', 'off');
        showToast('Sound feedback muted');
      }
    });

    // Home button
    DOM.btnHome.addEventListener('click', () => {
      if (DOM.screenPractice.classList.contains('active')) {
        if (confirm('Leave current practice session and return to subject setup?')) {
          showScreen('setup');
        }
      } else {
        showScreen('setup');
      }
    });

    // Select All / Clear All
    DOM.btnSelectAll.addEventListener('click', () => {
      state.subjects.forEach(s => state.selectedSubjects.add(s.name));
      const items = DOM.subjectsContainer.querySelectorAll('.subject-item');
      items.forEach(el => el.classList.add('selected'));
      updateSelectionSummary();
    });

    DOM.btnClearAll.addEventListener('click', () => {
      state.selectedSubjects.clear();
      const items = DOM.subjectsContainer.querySelectorAll('.subject-item');
      items.forEach(el => el.classList.remove('selected'));
      updateSelectionSummary();
    });

    // Subject Search filter
    DOM.subjectSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = state.subjects.filter(s => 
        s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
      renderSubjectsGrid(filtered);
    });

    // Order Mode Radio buttons
    document.querySelectorAll('input[name="order-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.orderMode = e.target.value;
      });
    });

    // Checkboxes
    DOM.chkWrongExp.addEventListener('change', (e) => {
      state.showExplanationOnWrong = e.target.checked;
    });

    DOM.chkAutoScroll.addEventListener('change', (e) => {
      state.autoScrollExp = e.target.checked;
    });

    // Start Practice Button
    DOM.btnStartPractice.addEventListener('click', startPracticeSession);

    // Practice Navigation Controls
    DOM.btnPrev.addEventListener('click', () => navigateQuestion(state.currentIndex - 1));
    DOM.btnNext.addEventListener('click', handleNextClick);
    DOM.btnFinishEarly.addEventListener('click', () => {
      const attended = Object.keys(state.userAnswers).length;
      const total = state.activePool.length;
      if (confirm(`Finish practice now?\nYou have attended ${attended} of ${total} questions.`)) {
        finishPractice();
      }
    });

    // Question Matrix Grid Modal
    DOM.btnGridToggle.addEventListener('click', openGridModal);
    DOM.btnCloseGrid.addEventListener('click', () => DOM.gridModal.style.display = 'none');
    DOM.gridModal.addEventListener('click', (e) => {
      if (e.target === DOM.gridModal) DOM.gridModal.style.display = 'none';
    });

    // Results screen buttons
    DOM.btnRestartMistakes.addEventListener('click', startMistakesPractice);
    DOM.btnRestartSame.addEventListener('click', () => restartPractice(false));
    DOM.btnNewSetup.addEventListener('click', () => showScreen('setup'));

    // Results Review Filters (Mistakes vs Correct only)
    DOM.reviewFilters.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      DOM.reviewFilters.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderReviewList(pill.dataset.filter);
    });

    // Keyboard Shortcuts for Rapid Practice on Desktop / Laptop
    document.addEventListener('keydown', handleKeyboardShortcuts);
  }

  function handleKeyboardShortcuts(e) {
    if (!DOM.screenPractice.classList.contains('active')) return;
    if (DOM.gridModal.style.display === 'flex') {
      if (e.key === 'Escape') DOM.gridModal.style.display = 'none';
      return;
    }

    const key = e.key.toUpperCase();
    if (['1', 'A'].includes(key)) handleOptionClick('A');
    else if (['2', 'B'].includes(key)) handleOptionClick('B');
    else if (['3', 'C'].includes(key)) handleOptionClick('C');
    else if (['4', 'D'].includes(key)) handleOptionClick('D');
    else if (e.key === 'ArrowRight' || key === 'N' || e.key === 'Enter') {
      if (state.userAnswers[state.currentIndex]) {
        handleNextClick();
      }
    }
    else if (e.key === 'ArrowLeft' || key === 'P') {
      navigateQuestion(state.currentIndex - 1);
    }
  }

  // =========================================================================
  // PRACTICE SESSION PREPARATION & LAUNCH
  // =========================================================================
  async function startPracticeSession() {
    if (state.selectedSubjects.size === 0) {
      alert('Please select at least one subject to begin practice.');
      return;
    }

    DOM.btnStartPractice.disabled = true;
    DOM.startBtnText.textContent = 'Loading questions...';

    try {
      const questions = await fetchSelectedQuestions();
      if (!questions || questions.length === 0) {
        alert('No questions found for the selected subject(s).');
        DOM.btnStartPractice.disabled = false;
        updateSelectionSummary();
        return;
      }

      // Always run ALL available questions from selected subjects
      let pool = [...questions];
      if (state.orderMode === 'random') {
        shuffleArray(pool);
      }

      state.activePool = pool;
      state.currentIndex = 0;
      state.userAnswers = {};
      state.stats = {
        correct: 0,
        wrong: 0,
        attended: 0,
        startTime: Date.now(),
        endTime: null
      };

      showScreen('practice');
      renderCurrentQuestion();
      updateScoreboard();
    } catch (err) {
      console.error('Failed to prepare practice pool:', err);
      alert('Error loading questions: ' + err.message);
    } finally {
      DOM.btnStartPractice.disabled = false;
      updateSelectionSummary();
    }
  }

  async function fetchSelectedQuestions() {
    const countSelected = state.selectedSubjects.size;
    const totalSubjects = state.subjects.length;

    if (state.allQuestionsCache) {
      return state.allQuestionsCache.filter(q => state.selectedSubjects.has(q.subject));
    }

    // Optimization: If selecting only 1 or 2 subjects, fetch individual subject JSON files
    if (countSelected <= 2 && countSelected < totalSubjects) {
      const selectedSlugs = state.subjects
        .filter(s => state.selectedSubjects.has(s.name))
        .map(s => s.slug);

      const loadedArrays = await Promise.all(
        selectedSlugs.map(slug => 
          fetch(`./data/by_subject/${slug}.json`).then(r => r.json())
        )
      );
      return loadedArrays.flat();
    }

    // Otherwise fetch the consolidated questions.json
    const res = await fetch('./data/questions.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.allQuestionsCache = await res.json();
    return state.allQuestionsCache.filter(q => state.selectedSubjects.has(q.subject));
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // =========================================================================
  // PRACTICE VIEW RENDERING & INTERACTION
  // =========================================================================
  function renderCurrentQuestion() {
    const q = state.activePool[state.currentIndex];
    if (!q) return;

    // Reset Explanation box
    DOM.explanationBox.style.display = 'none';

    // Tags & statement
    DOM.qSubjectTag.textContent = `${q.subject_code ? '[' + q.subject_code + '] ' : ''}${q.subject}`;
    DOM.qIdTag.textContent = q.id || `Q${state.currentIndex + 1}`;
    DOM.qDiffTag.textContent = q.difficulty || 'Medium';
    DOM.qText.textContent = q.question;

    // Options rendering
    DOM.optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    const answerRecord = state.userAnswers[state.currentIndex];
    const isAnswered = !!answerRecord;
    const correctLetter = (q.answer || 'A').toUpperCase();

    // Next button disabled by default until answered
    DOM.btnNext.disabled = !isAnswered;

    letters.forEach(letter => {
      const optText = q.options[letter] || '';
      if (!optText) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.dataset.letter = letter;

      btn.innerHTML = `
        <span class="opt-badge">${letter}</span>
        <span class="opt-text">${escapeHtml(optText)}</span>
        <span class="opt-status-icon"></span>
      `;

      if (isAnswered) {
        if (answerRecord.selected === letter) {
          if (answerRecord.isCorrect) {
            btn.classList.add('selected-correct');
            btn.querySelector('.opt-status-icon').textContent = 'Correct';
            btn.title = 'Double-click to view answer description';
          } else {
            btn.classList.add('selected-wrong');
            btn.querySelector('.opt-status-icon').textContent = 'Incorrect';
          }
        } else if (!answerRecord.isCorrect && letter === correctLetter) {
          btn.classList.add('reveal-correct');
          btn.querySelector('.opt-status-icon').textContent = 'Correct';
          btn.title = 'Double-click to view answer description';
        }
      }

      // Handle single click (attending) and repeated click/tap (showing right answer description)
      btn.addEventListener('click', () => handleOptionClick(letter, btn));
      btn.addEventListener('dblclick', () => handleOptionDblClick(letter));

      DOM.optionsContainer.appendChild(btn);
    });

    // If already answered and was wrong, show description automatically
    if (isAnswered && !answerRecord.isCorrect) {
      showExplanation(q, false);
    }

    // Update Next button text
    if (state.currentIndex === state.activePool.length - 1) {
      DOM.btnNextText.textContent = 'Finish Practice';
    } else {
      DOM.btnNextText.textContent = 'Next';
    }

    DOM.btnPrev.disabled = state.currentIndex === 0;

    updateScoreboard();
  }

  // Unified option click handler
  function handleOptionClick(chosenLetter) {
    const q = state.activePool[state.currentIndex];
    if (!q) return;

    const correctLetter = (q.answer || 'A').trim().toUpperCase();
    const answerRecord = state.userAnswers[state.currentIndex];

    // If already answered:
    if (answerRecord) {
      // If clicking or tapping on the right answer option after being attended, toggle explanation
      if (chosenLetter.toUpperCase() === correctLetter) {
        toggleExplanation(q, true);
      }
      return;
    }

    // First time attending:
    pickOption(chosenLetter);
  }

  // Double click handler specifically for desktop mouse users
  function handleOptionDblClick(chosenLetter) {
    const q = state.activePool[state.currentIndex];
    if (!q) return;

    const correctLetter = (q.answer || 'A').trim().toUpperCase();
    if (chosenLetter.toUpperCase() === correctLetter) {
      showExplanation(q, true);
    }
  }

  // Handling User Choice
  function pickOption(chosenLetter) {
    if (state.userAnswers[state.currentIndex]) {
      return; // Already answered
    }

    const q = state.activePool[state.currentIndex];
    if (!q) return;

    const correctLetter = (q.answer || 'A').trim().toUpperCase();
    const isCorrect = chosenLetter.toUpperCase() === correctLetter;

    // Save answer record
    state.userAnswers[state.currentIndex] = {
      selected: chosenLetter.toUpperCase(),
      correctAnswer: correctLetter,
      isCorrect: isCorrect,
      question: q
    };

    // Update stats
    if (isCorrect) {
      state.stats.correct++;
      playSound('correct');
    } else {
      state.stats.wrong++;
      playSound('wrong');
    }
    state.stats.attended++;

    // Enable Next button immediately after attending
    DOM.btnNext.disabled = false;

    // Apply visual feedback to option buttons
    const buttons = DOM.optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      const letter = btn.dataset.letter;
      const statusIcon = btn.querySelector('.opt-status-icon');

      if (letter === chosenLetter) {
        if (isCorrect) {
          btn.classList.add('selected-correct');
          statusIcon.textContent = 'Correct';
          btn.title = 'Double-click to view answer description';
        } else {
          btn.classList.add('selected-wrong');
          statusIcon.textContent = 'Incorrect';
        }
      } else if (!isCorrect && letter === correctLetter) {
        btn.classList.add('reveal-correct');
        statusIcon.textContent = 'Correct';
        btn.title = 'Double-click to view answer description';
      }
    });

    // Show Description / Explanation if wrong answer selected automatically
    if (!isCorrect && state.showExplanationOnWrong) {
      showExplanation(q, false);
    }

    updateScoreboard();
  }

  function toggleExplanation(q, isCorrect) {
    if (DOM.explanationBox.style.display === 'block') {
      DOM.explanationBox.style.display = 'none';
    } else {
      showExplanation(q, isCorrect);
    }
  }

  function showExplanation(q, isCorrect) {
    const correctLetter = (q.answer || 'A').trim().toUpperCase();
    const correctText = q.options[correctLetter] || '';

    DOM.expTitle.textContent = isCorrect 
      ? 'Correct Answer Description & Explanation:' 
      : 'Answer Description & Explanation:';

    DOM.expCorrectBanner.innerHTML = `
      <strong>Correct Answer: Option ${correctLetter}</strong>
      ${correctText ? `— <em>${escapeHtml(correctText)}</em>` : ''}
    `;

    DOM.expText.textContent = q.explanation || 'No detailed explanation provided for this question.';
    DOM.explanationBox.style.display = 'block';

    if (state.autoScrollExp) {
      setTimeout(() => {
        DOM.explanationBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  // Update Live Scoreboard
  function updateScoreboard() {
    const total = state.activePool.length;
    const current = state.currentIndex + 1;
    const attended = state.stats.attended;
    const correct = state.stats.correct;
    const wrong = state.stats.wrong;
    const remaining = total - attended;

    DOM.qCounter.textContent = `${current} / ${total}`;
    DOM.scorePoints.textContent = `${correct} / ${attended}`;
    
    const pct = attended > 0 ? ((correct / attended) * 100).toFixed(1) : '0';
    DOM.scorePct.textContent = `(${pct}%)`;

    const progressPct = total > 0 ? (current / total) * 100 : 0;
    DOM.progressFill.style.width = `${progressPct}%`;

    DOM.statCorrect.textContent = correct;
    DOM.statWrong.textContent = wrong;
    DOM.statRemaining.textContent = remaining;
  }

  function handleNextClick() {
    // Next button only works after attending the answer
    if (!state.userAnswers[state.currentIndex]) {
      showToast('Please attend an answer first to proceed');
      return;
    }

    if (state.currentIndex >= state.activePool.length - 1) {
      finishPractice();
    } else {
      navigateQuestion(state.currentIndex + 1);
    }
  }

  function navigateQuestion(newIndex) {
    if (newIndex < 0 || newIndex >= state.activePool.length) return;
    state.currentIndex = newIndex;
    renderCurrentQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // JUMP MATRIX MODAL
  // =========================================================================
  function openGridModal() {
    DOM.jumpMatrixContainer.innerHTML = '';
    const total = state.activePool.length;

    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jump-btn';
      btn.textContent = i + 1;

      const ans = state.userAnswers[i];
      if (ans) {
        if (ans.isCorrect) btn.classList.add('is-correct');
        else btn.classList.add('is-wrong');
      }
      if (i === state.currentIndex) {
        btn.classList.add('is-current');
      }

      btn.addEventListener('click', () => {
        DOM.gridModal.style.display = 'none';
        navigateQuestion(i);
      });

      DOM.jumpMatrixContainer.appendChild(btn);
    }

    DOM.gridModal.style.display = 'flex';
  }

  // =========================================================================
  // RESULTS & REVIEW ENGINE
  // =========================================================================
  function finishPractice() {
    state.stats.endTime = Date.now();
    showScreen('results');

    const attended = state.stats.attended;
    const correct = state.stats.correct;
    const wrong = state.stats.wrong;
    const total = state.activePool.length;
    const skipped = total - attended;

    const pct = attended > 0 ? ((correct / attended) * 100).toFixed(1) : '0';

    DOM.resScoreRatio.textContent = `${correct} / ${attended}`;
    DOM.resScorePct.textContent = `${pct}% Accuracy`;

    DOM.resCorrectCount.textContent = correct;
    DOM.resWrongCount.textContent = wrong;
    DOM.resAttendedCount.textContent = attended;
    DOM.resUnattendedCount.textContent = skipped;

    const numPct = parseFloat(pct);
    if (numPct >= 85) {
      DOM.resultBadge.textContent = 'Outstanding Performance';
      DOM.resHeadline.textContent = 'High Accuracy Achieved';
      DOM.resSub.textContent = 'Excellent grasp of the selected subjects.';
    } else if (numPct >= 65) {
      DOM.resultBadge.textContent = 'Good Job';
      DOM.resHeadline.textContent = 'Strong Performance';
      DOM.resSub.textContent = 'Review your incorrect answers below to strengthen weak areas.';
    } else {
      DOM.resultBadge.textContent = 'Practice Completed';
      DOM.resHeadline.textContent = 'Session Complete';
      DOM.resSub.textContent = 'Review the detailed descriptions below and retest incorrect questions.';
    }

    if (wrong > 0) {
      DOM.btnRestartMistakes.style.display = 'inline-flex';
      DOM.retestCount.textContent = wrong;
    } else {
      DOM.btnRestartMistakes.style.display = 'none';
    }

    // Set filter counts for Mistakes and Correct only
    DOM.revFilterWrong.textContent = wrong;
    DOM.revFilterCorrect.textContent = correct;

    // Show Mistakes tab by default if any mistakes exist, otherwise show Correct
    const defaultTab = wrong > 0 ? 'wrong' : 'correct';
    DOM.reviewFilters.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    const defaultPill = DOM.reviewFilters.querySelector(`[data-filter="${defaultTab}"]`);
    if (defaultPill) defaultPill.classList.add('active');

    renderReviewList(defaultTab);
  }

  function renderReviewList(filterType) {
    DOM.reviewListContainer.innerHTML = '';
    const total = state.activePool.length;

    let itemsShown = 0;
    for (let i = 0; i < total; i++) {
      const q = state.activePool[i];
      const ans = state.userAnswers[i];

      // Only show attended answers (ignore unvisited/skipped questions)
      if (!ans) continue;

      const isCorrect = ans.isCorrect;
      const isWrong = !ans.isCorrect;

      // Filter condition: Mistakes vs Correct
      if (filterType === 'wrong' && !isWrong) continue;
      if (filterType === 'correct' && !isCorrect) continue;

      itemsShown++;
      const itemEl = document.createElement('div');
      itemEl.className = `review-item ${isCorrect ? 'is-correct' : 'is-wrong'}`;

      const correctLetter = (q.answer || 'A').toUpperCase();
      const correctText = q.options[correctLetter] || '';
      const userSelected = ans.selected;
      const userSelectedText = q.options[userSelected] || '';

      const statusHtml = isCorrect 
        ? '<span class="rev-status correct">Correct</span>'
        : '<span class="rev-status wrong">Incorrect</span>';

      itemEl.innerHTML = `
        <div class="rev-header">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">
            Q${i + 1}. [${q.subject_code || q.subject}] ${q.id}
          </div>
          ${statusHtml}
        </div>

        <div class="rev-q-text">${escapeHtml(q.question)}</div>

        <div class="rev-answers-summary">
          ${isWrong ? `
            <div class="rev-ans-row user-wrong">
              <span>Your Answer:</span>
              <strong>Option ${userSelected}: ${escapeHtml(userSelectedText)}</strong>
            </div>
            <div class="rev-ans-row correct-ans">
              <span>Correct Answer:</span>
              <strong>Option ${correctLetter}: ${escapeHtml(correctText)}</strong>
            </div>
          ` : `
            <div class="rev-ans-row user-correct">
              <span>Answered:</span>
              <strong>Option ${userSelected}: ${escapeHtml(userSelectedText)} (Correct)</strong>
            </div>
          `}
        </div>

        <div class="rev-exp-box">
          <strong style="color: #ffffff;">Explanation / Description:</strong> ${escapeHtml(q.explanation || 'No explanation available.')}
        </div>
      `;

      DOM.reviewListContainer.appendChild(itemEl);
    }

    if (itemsShown === 0) {
      const emptyMsg = filterType === 'wrong' 
        ? 'No mistakes recorded in this session! Great job!'
        : 'No correct answers to display.';
      DOM.reviewListContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-secondary); font-weight: 600;">${emptyMsg}</div>`;
    }
  }

  function startMistakesPractice() {
    const mistakesPool = [];
    state.activePool.forEach((q, idx) => {
      const ans = state.userAnswers[idx];
      if (ans && !ans.isCorrect) {
        mistakesPool.push(q);
      }
    });

    if (mistakesPool.length === 0) {
      showToast('No incorrect questions to practice');
      return;
    }

    state.activePool = mistakesPool;
    state.currentIndex = 0;
    state.userAnswers = {};
    state.stats = {
      correct: 0,
      wrong: 0,
      attended: 0,
      startTime: Date.now(),
      endTime: null
    };

    showScreen('practice');
    renderCurrentQuestion();
    updateScoreboard();
    showToast(`Retesting ${mistakesPool.length} mistakes`);
  }

  function restartPractice(shuffle = false) {
    if (shuffle) shuffleArray(state.activePool);
    state.currentIndex = 0;
    state.userAnswers = {};
    state.stats = {
      correct: 0,
      wrong: 0,
      attended: 0,
      startTime: Date.now(),
      endTime: null
    };

    showScreen('practice');
    renderCurrentQuestion();
    updateScoreboard();
  }

  // =========================================================================
  // UTILITIES & SERVICE WORKER
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('PWA ServiceWorker registered'))
        .catch(err => console.warn('ServiceWorker registration error:', err));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
