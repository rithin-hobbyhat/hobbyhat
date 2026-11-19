/**
 * MCQ Practice Arena - Client-Side Engine
 * Fast, lightweight vanilla JavaScript with offline support,
 * multi-subject selection, instant explanation feedback, score tracking,
 * and 5-Minute Pocket Study Alarm Mode (Sound, Vibration & Notifications).
 * Monochrome Black & White Theme (Zero Emojis, High Contrast)
 */

(function () {
  'use strict';

  // State Management
  const state = {
    subjects: [],                // All subjects loaded from subjects.json
    selectedSubjects: new Set(), // Set of selected subject names
    allQuestionsCache: null,     // Cached questions array
    activePool: [],              // Final filtered & prepared questions for practice
    currentIndex: 0,             // Current question index in activePool
    userAnswers: {},             // Map of qIndex -> { selected: 'A', isCorrect: bool, question: {} }
    
    // Settings
    orderMode: 'random',         // 'random' | 'sequential'
    questionLimit: 'all',        // Always run all available MCQs
    showExplanationOnWrong: true,
    autoScrollExp: true,
    soundEnabled: true,

    // Pocket Study Mode (5-min Background Alarm & Notification)
    pocketMode: false,
    pocketIntervalMinutes: 5,
    pocketStandbyActive: false,
    targetAlertTime: null,
    wakeLock: null,

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
    } catch (e) {}

    // Smartphone Haptic Vibration
    if (navigator.vibrate) {
      if (type === 'correct') {
        navigator.vibrate(35);
      } else if (type === 'wrong') {
        navigator.vibrate([40, 50, 40]);
      }
    }
  }

  // 8-Second Pocket Alarm & Pressure State
  const alarmState = {
    active: false,
    timerId: null,
    vibrateInterval: null,
    audioInterval: null,
    uiInterval: null,
    endTime: 0
  };

  // Urgent dual-pitch alarm pulse (repeats during the 8-second window)
  function playUrgentAlarmTone() {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      // High-urgency dual frequency tone (A5 -> D6)
      const tones = [
        { freq: 880, start: 0, dur: 0.14 },
        { freq: 1175, start: 0.16, dur: 0.22 }
      ];

      tones.forEach(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(t.freq, now + t.start);
        gain.gain.setValueAtTime(0.18, now + t.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur);
      });
    } catch (e) {}
  }

  // Starts 8-Second Pressure Notification with Vibration & Sound
  function start8SecondPocketAlarm() {
    stop8SecondPocketAlarm();
    alarmState.active = true;
    const durationMs = 8000;
    alarmState.endTime = Date.now() + durationMs;

    // 1. Play urgent audio pulse every 750ms for 8 seconds
    playUrgentAlarmTone();
    alarmState.audioInterval = setInterval(() => {
      if (Date.now() >= alarmState.endTime) {
        stop8SecondPocketAlarm();
      } else {
        playUrgentAlarmTone();
      }
    }, 750);

    // 2. 8-Second Smartphone Vibration
    if (navigator.vibrate) {
      try {
        // Full 8-second vibration pattern (8,000 ms)
        const pattern = [600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 800];
        navigator.vibrate(pattern);

        // Keep re-triggering pulse in case mobile OS limits single vibration call
        alarmState.vibrateInterval = setInterval(() => {
          if (Date.now() >= alarmState.endTime) {
            if (alarmState.vibrateInterval) clearInterval(alarmState.vibrateInterval);
          } else {
            try { navigator.vibrate([600, 150]); } catch (e) {}
          }
        }, 750);
      } catch (e) {}
    }

    // 3. Visual 8-Second UI Progress Bar & Countdown
    if (DOM.pocketAlarmBanner) {
      DOM.pocketAlarmBanner.style.display = 'block';
      if (DOM.alarmCountdownSec) DOM.alarmCountdownSec.textContent = '8s';
      if (DOM.alarmTimerFill) DOM.alarmTimerFill.style.width = '100%';

      alarmState.uiInterval = setInterval(() => {
        const remainingMs = Math.max(0, alarmState.endTime - Date.now());
        const remainingSec = Math.ceil(remainingMs / 1000);
        if (DOM.alarmCountdownSec) DOM.alarmCountdownSec.textContent = `${remainingSec}s`;
        if (DOM.alarmTimerFill) {
          const pct = Math.max(0, (remainingMs / durationMs) * 100);
          DOM.alarmTimerFill.style.width = `${pct}%`;
        }
        if (remainingMs <= 0) {
          stop8SecondPocketAlarm();
        }
      }, 100);
    }

    // 4. Master timeout to stop after 8 seconds
    alarmState.timerId = setTimeout(() => {
      stop8SecondPocketAlarm();
    }, durationMs);
  }

  // Stops and silences 8-second alarm immediately
  function stop8SecondPocketAlarm() {
    if (!alarmState.active) return;
    alarmState.active = false;

    if (alarmState.timerId) clearTimeout(alarmState.timerId);
    if (alarmState.audioInterval) clearInterval(alarmState.audioInterval);
    if (alarmState.vibrateInterval) clearInterval(alarmState.vibrateInterval);
    if (alarmState.uiInterval) clearInterval(alarmState.uiInterval);
    alarmState.timerId = null;
    alarmState.audioInterval = null;
    alarmState.vibrateInterval = null;
    alarmState.uiInterval = null;

    if (navigator.vibrate) {
      try { navigator.vibrate(0); } catch (e) {}
    }

    if (DOM.pocketAlarmBanner) {
      DOM.pocketAlarmBanner.style.display = 'none';
    }
  }

  // Request Notification Permissions
  async function requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }

  // Send Pocket System Notification with 8-second vibration
  function sendPocketNotification(q) {
    const title = `🚨 8s MCQ ALERT [${q.subject_code || q.subject}]`;
    const snippet = q.question.length > 85 ? q.question.slice(0, 85) + '...' : q.question;
    const body = `${snippet}\n⚡ 8-second vibration ringing! Tap to answer now!`;
    const options = {
      body: body,
      icon: './icon.png',
      badge: './icon.png',
      tag: 'pocket-mcq-alarm',
      renotify: true,
      requireInteraction: true,
      vibrate: [600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 600, 200, 800],
      data: { url: './index.html' }
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, options);
      }).catch(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, options);
        }
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
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

    // Pocket Mode Settings
    chkPocketMode: document.getElementById('chk-pocket-mode'),
    pocketOptionsSub: document.getElementById('pocket-options-sub'),
    pocketIntervalSelector: document.getElementById('pocket-interval-selector'),
    btnTestNotification: document.getElementById('btn-test-notification'),

    // Practice Screen
    qCounter: document.getElementById('q-counter'),
    scorePoints: document.getElementById('score-points'),
    scorePct: document.getElementById('score-pct'),
    progressFill: document.getElementById('progress-fill'),
    statCorrect: document.getElementById('stat-correct'),
    statWrong: document.getElementById('stat-wrong'),
    statRemaining: document.getElementById('stat-remaining'),
    btnGridToggle: document.getElementById('btn-grid-toggle'),

    // Pocket Standby View
    pocketStandbyView: document.getElementById('pocket-standby-view'),
    standbyIntervalBadge: document.getElementById('standby-interval-badge'),
    standbyCountdownText: document.getElementById('standby-countdown-text'),
    btnStandbyAnswerNow: document.getElementById('btn-standby-answer-now'),
    btnPocketResume: document.getElementById('btn-pocket-resume'),

    // 8-Second Alarm Pressure Banner
    pocketAlarmBanner: document.getElementById('pocket-alarm-banner'),
    alarmCountdownSec: document.getElementById('alarm-countdown-seconds'),
    alarmTimerFill: document.getElementById('alarm-timer-fill'),

    // Question Card
    practiceCardWrapper: document.getElementById('practice-card-wrapper'),
    currentQuestionCard: document.getElementById('current-question-card'),
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
      stopPocketTimer();
    } else if (screenId === 'practice') {
      DOM.screenPractice.classList.add('active');
      DOM.navSubtitle.textContent = state.pocketMode 
        ? `Pocket Mode (${state.pocketIntervalMinutes}m Alerts)`
        : `Practicing: ${state.selectedSubjects.size} Subject(s)`;
    } else if (screenId === 'results') {
      DOM.screenResults.classList.add('active');
      DOM.navSubtitle.textContent = 'Performance Report';
      stopPocketTimer();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // =========================================================================
  // INITIALIZATION & SUBJECT LOADING
  // =========================================================================
  async function init() {
    loadPreferences();
    setupEventListeners();
    initWebWorkerTimer();
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
  // BACKGROUND TIMER WORKER (Prevents Throttling When Minimized / In Pocket)
  // =========================================================================
  let timerWorker = null;

  function initWebWorkerTimer() {
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            clearInterval(timer);
            timer = setInterval(() => { self.postMessage('tick'); }, 1000);
          } else if (e.data === 'stop') {
            clearInterval(timer);
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      timerWorker = new Worker(URL.createObjectURL(blob));
      timerWorker.onmessage = handleWorkerTick;
    } catch (e) {
      // Fallback to standard setInterval if Web Worker is restricted
      setInterval(handleWorkerTick, 1000);
    }

    // Wake check: when phone wakes up or user returns to tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && state.pocketStandbyActive && state.targetAlertTime) {
        if (Date.now() >= state.targetAlertTime) {
          triggerPocketQuestionAlert();
        }
      }
    });
  }

  function handleWorkerTick() {
    if (!state.pocketStandbyActive || !state.targetAlertTime) return;

    const remainingSec = Math.max(0, Math.round((state.targetAlertTime - Date.now()) / 1000));
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (DOM.standbyCountdownText) {
      DOM.standbyCountdownText.textContent = timeStr;
    }

    if (remainingSec <= 0) {
      triggerPocketQuestionAlert();
    }
  }

  function startPocketTimer() {
    state.pocketStandbyActive = true;
    state.targetAlertTime = Date.now() + (state.pocketIntervalMinutes * 60 * 1000);

    // Show Standby view, hide question card
    DOM.pocketStandbyView.style.display = 'block';
    DOM.practiceCardWrapper.style.display = 'none';
    DOM.standbyIntervalBadge.textContent = `${state.pocketIntervalMinutes}-Min Alert Active`;

    if (timerWorker) {
      timerWorker.postMessage('start');
    }
  }

  function stopPocketTimer() {
    state.pocketStandbyActive = false;
    state.targetAlertTime = null;
    stop8SecondPocketAlarm();
    if (timerWorker) {
      timerWorker.postMessage('stop');
    }
  }

  // Fires when 5-min timer completes
  function triggerPocketQuestionAlert() {
    stopPocketTimer();

    // Advance to next question
    if (state.currentIndex < state.activePool.length - 1) {
      state.currentIndex++;
    } else {
      state.currentIndex = 0; // Loop or finish
    }

    const nextQ = state.activePool[state.currentIndex];

    // Push system notification with 8-second vibration
    if (nextQ) {
      sendPocketNotification(nextQ);
    }

    // Render new question and bring card back
    DOM.pocketStandbyView.style.display = 'none';
    DOM.practiceCardWrapper.style.display = 'block';
    renderCurrentQuestion();

    // Trigger urgent 8-second pressure alarm with vibration, sound & visual countdown
    start8SecondPocketAlarm();
    showToast('MCQ Alert! 8s Alarm Ringing...');
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

    // Pocket Study Mode Toggle
    DOM.chkPocketMode.addEventListener('change', async (e) => {
      state.pocketMode = e.target.checked;
      DOM.pocketOptionsSub.style.display = state.pocketMode ? 'block' : 'none';
      if (state.pocketMode) {
        const granted = await requestNotificationPermission();
        if (!granted && 'Notification' in window && Notification.permission === 'denied') {
          showToast('Please allow browser notifications in site settings for pocket alerts');
        } else {
          showToast('5-Minute Pocket Mode Enabled');
        }
      }
    });

    // Pocket Interval Selector
    DOM.pocketIntervalSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      DOM.pocketIntervalSelector.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.pocketIntervalMinutes = parseInt(btn.dataset.interval, 10) || 5;
    });

    // Test Sound, Vibration & Notification button (8-second demo)
    DOM.btnTestNotification.addEventListener('click', async () => {
      await requestNotificationPermission();
      start8SecondPocketAlarm();
      sendPocketNotification({
        subject_code: 'TEST',
        subject: 'Demo 8s Alert',
        question: 'This is an 8-second urgent alert test! Sound and vibration are ringing.'
      });
      showToast('8-Second pressure alert & vibration started!');
    });

    // Pocket Standby View: Answer Question Now
    DOM.btnStandbyAnswerNow.addEventListener('click', () => {
      stopPocketTimer();
      DOM.pocketStandbyView.style.display = 'none';
      DOM.practiceCardWrapper.style.display = 'block';
      renderCurrentQuestion();
    });

    // Resume Standby Button inside explanation box
    DOM.btnPocketResume.addEventListener('click', () => {
      DOM.explanationBox.style.display = 'none';
      startPocketTimer();
      showToast(`Standby active for ${state.pocketIntervalMinutes} minutes`);
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
      DOM.pocketStandbyView.style.display = 'none';
      DOM.practiceCardWrapper.style.display = 'block';
      renderCurrentQuestion();
      updateScoreboard();

      if (state.pocketMode) {
        await requestNotificationPermission();
        showToast(`Pocket Mode Active: 5-minute interval started`);
      }
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
    DOM.btnPocketResume.style.display = 'none';

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

      btn.addEventListener('click', () => handleOptionClick(letter, btn));
      btn.addEventListener('dblclick', () => handleOptionDblClick(letter));

      DOM.optionsContainer.appendChild(btn);
    });

    // If already answered and was wrong, show description automatically
    if (isAnswered && !answerRecord.isCorrect) {
      showExplanation(q, false);
      if (state.pocketMode) {
        DOM.btnPocketResume.style.display = 'block';
      }
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
      return;
    }

    // Immediately stop & silence 8-second pressure alarm when player attends question
    stop8SecondPocketAlarm();

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

    updateScoreboard();

    // INNOVATION: POCKET MODE LOGIC
    if (state.pocketMode) {
      if (isCorrect) {
        // "After we clicking right answer, it will go."
        // Show brief 1.2s check, then put into 5-minute standby!
        showToast(`Correct! Next MCQ alert in ${state.pocketIntervalMinutes} minutes.`);
        setTimeout(() => {
          startPocketTimer();
        }, 1200);
      } else {
        // "if we select wrong answer, the discription about right answer should show."
        showExplanation(q, false);
        DOM.btnPocketResume.style.display = 'block';
        showToast('Incorrect. Review description, then resume 5-min timer.');
      }
    } else {
      // Normal practice mode
      if (!isCorrect && state.showExplanationOnWrong) {
        showExplanation(q, false);
      }
    }
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
    stop8SecondPocketAlarm();
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
    stopPocketTimer();
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

    DOM.revFilterWrong.textContent = wrong;
    DOM.revFilterCorrect.textContent = correct;

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

      if (!ans) continue;

      const isCorrect = ans.isCorrect;
      const isWrong = !ans.isCorrect;

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
    DOM.pocketStandbyView.style.display = 'none';
    DOM.practiceCardWrapper.style.display = 'block';
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
    DOM.pocketStandbyView.style.display = 'none';
    DOM.practiceCardWrapper.style.display = 'block';
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
