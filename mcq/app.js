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

    // Pocket Study Mode (Background Alarm & Notification in 3, 5, or 10 min intervals)
    pocketMode: false,
    pocketIntervalMinutes: (() => {
      const saved = parseInt(localStorage.getItem('mcq_pocket_interval'), 10);
      return [3, 5, 10].includes(saved) ? saved : 5;
    })(),
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

  let vibrationState = {
    intervalId: null,
    timeoutId: null
  };

  const alarmState = {
    active: false,
    timerId: null,
    uiInterval: null,
    endTime: 0
  };

  let wrongAnswerResumeTimer = null;

  // Industrial Dual-Rotor Siren State
  let sirenNodes = {
    oscLower: null,
    oscUpper: null,
    lfo: null,
    lfoGainLower: null,
    lfoGainUpper: null,
    hornFilter: null,
    shaper: null,
    gain: null,
    stopTimeout: null
  };

  // Soft-clipping curve for aggressive industrial horn saturation
  function makeIndustrialDistortionCurve(k = 25) {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
  const industrialCurve = makeIndustrialDistortionCurve(18);

  // Auto-retry handler for HTML5 siren audio playback.
  // When another app (like Instagram, TikTok, YouTube) is active, audio focus may be briefly
  // contended. Retrying every 350ms ensures the siren sounds the moment audio focus can be gained or ducked.
  let sirenRetryTimer = null;

  function attemptPlayHtml5Siren(retries = 25) {
    if (!DOM.audioSiren || !alarmState.active) return;
    try {
      DOM.audioSiren.currentTime = 0;
      DOM.audioSiren.volume = 1.0;
      const playPromise = DOM.audioSiren.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (sirenRetryTimer) {
            clearTimeout(sirenRetryTimer);
            sirenRetryTimer = null;
          }
        }).catch(err => {
          console.log('HTML5 siren play waiting for audio focus/gesture, retrying...', err);
          if (retries > 0 && alarmState.active) {
            if (sirenRetryTimer) clearTimeout(sirenRetryTimer);
            sirenRetryTimer = setTimeout(() => {
              attemptPlayHtml5Siren(retries - 1);
            }, 350);
          }
        });
      }
    } catch (e) {
      if (retries > 0 && alarmState.active) {
        if (sirenRetryTimer) clearTimeout(sirenRetryTimer);
        sirenRetryTimer = setTimeout(() => {
          attemptPlayHtml5Siren(retries - 1);
        }, 350);
      }
    }
  }

  // Synthesizes a true heavy mechanical dual-rotor industrial factory / plant siren
  function startSirenSound(durationSeconds = 20) {
    stopSirenSound();
    if (!state.soundEnabled) return;

    // 1. Play dedicated 20-second industrial siren WAV via HTML5 Audio element with auto-retry
    // HTML5 Audio has full background/screen-off audio routing on mobile devices (Android/iOS)!
    attemptPlayHtml5Siren(25);

    // 2. Dual-Engine Web Audio Synthesizer (for enriched harmonics when foreground/active)
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      // Master Gain for Industrial Siren
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      // Realistic mechanical spool-up (wind-up) ramp: rises in volume & power over 1.8 seconds
      gain.gain.exponentialRampToValueAtTime(0.28, now + 1.8);
      gain.connect(audioCtx.destination);

      // Industrial Horn Resonator Filter (Acoustic megaphone/steel horn body)
      const hornFilter = audioCtx.createBiquadFilter();
      hornFilter.type = 'lowpass';
      hornFilter.frequency.setValueAtTime(1600, now);
      hornFilter.Q.setValueAtTime(2.5, now);
      hornFilter.connect(gain);

      // Waveshaper for raw metallic industrial horn bite
      const shaper = audioCtx.createWaveShaper();
      shaper.curve = industrialCurve;
      shaper.oversample = '2x';
      shaper.connect(hornFilter);

      // Dual-Rotor Mixer Gain
      const mixer = audioCtx.createGain();
      mixer.gain.setValueAtTime(0.5, now);
      mixer.connect(shaper);

      // Rotor 1 (Lower Port - Heavy fundamental drone: 380 Hz base, sweeps +/- 100 Hz: 280 Hz - 480 Hz)
      const oscLower = audioCtx.createOscillator();
      oscLower.type = 'sawtooth';
      oscLower.frequency.setValueAtTime(380, now);

      // Rotor 2 (Upper Port - Dual-port 5:6 minor third dissonant tone: 456 Hz base, sweeps +/- 120 Hz: 336 Hz - 576 Hz)
      const oscUpper = audioCtx.createOscillator();
      oscUpper.type = 'sawtooth';
      oscUpper.frequency.setValueAtTime(456, now);

      // Slow mechanical motor LFO (0.28 Hz = 3.6-second heavy industrial wail cycle)
      const lfo = audioCtx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(0.28, now);

      // Lower Rotor Frequency Modulation
      const lfoGainLower = audioCtx.createGain();
      lfoGainLower.gain.setValueAtTime(100, now);
      lfo.connect(lfoGainLower);
      lfoGainLower.connect(oscLower.frequency);

      // Upper Rotor Frequency Modulation (maintains exact industrial harmonic ratio)
      const lfoGainUpper = audioCtx.createGain();
      lfoGainUpper.gain.setValueAtTime(120, now);
      lfo.connect(lfoGainUpper);
      lfoGainUpper.connect(oscUpper.frequency);

      // Connect dual rotors to mixer
      oscLower.connect(mixer);
      oscUpper.connect(mixer);

      oscLower.start(now);
      oscUpper.start(now);
      lfo.start(now);

      // Mechanical wind-down at end of duration
      gain.gain.setValueAtTime(0.28, now + durationSeconds - 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);
      oscLower.stop(now + durationSeconds + 0.1);
      oscUpper.stop(now + durationSeconds + 0.1);
      lfo.stop(now + durationSeconds + 0.1);

      sirenNodes = { oscLower, oscUpper, lfo, lfoGainLower, lfoGainUpper, hornFilter, shaper, gain };

      sirenNodes.stopTimeout = setTimeout(() => {
        stopSirenSound();
      }, durationSeconds * 1000);
    } catch (e) {
      console.warn('Industrial siren error:', e);
    }
  }

  function stopSirenSound() {
    if (sirenRetryTimer) {
      clearTimeout(sirenRetryTimer);
      sirenRetryTimer = null;
    }
    if (DOM.audioSiren) {
      try {
        DOM.audioSiren.pause();
        DOM.audioSiren.currentTime = 0;
      } catch (e) {}
    }
    if (sirenNodes.stopTimeout) {
      clearTimeout(sirenNodes.stopTimeout);
      sirenNodes.stopTimeout = null;
    }
    if (sirenNodes.gain && audioCtx) {
      try {
        sirenNodes.gain.gain.setValueAtTime(0, audioCtx.currentTime);
      } catch (e) {}
    }
    if (sirenNodes.oscLower) {
      try { sirenNodes.oscLower.stop(); sirenNodes.oscLower.disconnect(); } catch (e) {}
      sirenNodes.oscLower = null;
    }
    if (sirenNodes.oscUpper) {
      try { sirenNodes.oscUpper.stop(); sirenNodes.oscUpper.disconnect(); } catch (e) {}
      sirenNodes.oscUpper = null;
    }
    if (sirenNodes.lfo) {
      try { sirenNodes.lfo.stop(); sirenNodes.lfo.disconnect(); } catch (e) {}
      sirenNodes.lfo = null;
    }
    if (sirenNodes.lfoGainLower) {
      try { sirenNodes.lfoGainLower.disconnect(); } catch (e) {}
      sirenNodes.lfoGainLower = null;
    }
    if (sirenNodes.lfoGainUpper) {
      try { sirenNodes.lfoGainUpper.disconnect(); } catch (e) {}
      sirenNodes.lfoGainUpper = null;
    }
    if (sirenNodes.hornFilter) {
      try { sirenNodes.hornFilter.disconnect(); } catch (e) {}
      sirenNodes.hornFilter = null;
    }
    if (sirenNodes.shaper) {
      try { sirenNodes.shaper.disconnect(); } catch (e) {}
      sirenNodes.shaper = null;
    }
    if (sirenNodes.gain) {
      try { sirenNodes.gain.disconnect(); } catch (e) {}
      sirenNodes.gain = null;
    }
  }

  // 10-Second Vibration Engine
  function start10SecondVibration() {
    stopVibration();
    if (!navigator.vibrate) return;

    try {
      // 10-second vibration pattern: 800ms buzz, 200ms pause x 10 = 10,000 ms (10 seconds)
      const pattern10s = [
        800, 200, 800, 200, 800, 200, 800, 200, 800, 200,
        800, 200, 800, 200, 800, 200, 800, 200, 800, 200
      ];
      navigator.vibrate(pattern10s);

      // Interval pulse keeps vibrating for 10 seconds without early OS cutoff
      const vibrateEndTime = Date.now() + 10000;
      vibrationState.intervalId = setInterval(() => {
        if (Date.now() >= vibrateEndTime) {
          stopVibration();
        } else {
          try { navigator.vibrate([800, 200]); } catch (e) {}
        }
      }, 1000);

      vibrationState.timeoutId = setTimeout(() => {
        stopVibration();
      }, 10000);
    } catch (e) {}
  }

  function stopVibration() {
    if (vibrationState.intervalId) {
      clearInterval(vibrationState.intervalId);
      vibrationState.intervalId = null;
    }
    if (vibrationState.timeoutId) {
      clearTimeout(vibrationState.timeoutId);
      vibrationState.timeoutId = null;
    }
    if (navigator.vibrate) {
      try { navigator.vibrate(0); } catch (e) {}
    }
  }

  // =========================================================================
  // BACKGROUND AUDIO & SLEEP-PREVENTION ENGINE (Works with phone screen off)
  // =========================================================================
  let wakeLockObj = null;

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !wakeLockObj) {
        wakeLockObj = await navigator.wakeLock.request('screen');
        wakeLockObj.addEventListener('release', () => { wakeLockObj = null; });
      }
    } catch (e) {}
  }

  function releaseWakeLock() {
    if (wakeLockObj) {
      try { wakeLockObj.release(); } catch (e) {}
      wakeLockObj = null;
    }
  }

  // Starts a silent background keep-alive audio loop.
  // Mobile browsers (Chrome Android / iOS Safari) treat active audio sessions as high-priority
  // media playback, preventing the OS from killing the Web Worker or throttling timers when
  // the phone is minimized or screen is locked/turned off.
  function startBackgroundKeepAlive() {
    if (DOM.audioKeepAlive) {
      try {
        DOM.audioKeepAlive.volume = 0.01;
        DOM.audioKeepAlive.play().catch(e => {
          console.log('Keep-alive audio standby waiting for gesture:', e);
        });
      } catch (e) {}
    }

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Pocket Study Mode (${state.pocketIntervalMinutes}m Alert)`,
          artist: 'MCQ Reminder Active',
          album: 'Runs even if phone is off or minimized',
          artwork: [
            { src: './icon.png', sizes: '192x192', type: 'image/png' },
            { src: './icon.png', sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.setActionHandler('pause', () => silenceSirenOnly());
        navigator.mediaSession.setActionHandler('stop', () => silenceSirenOnly());
      } catch (e) {}
    }

    requestWakeLock();
  }

  function stopBackgroundKeepAlive() {
    if (DOM.audioKeepAlive) {
      try {
        DOM.audioKeepAlive.pause();
        DOM.audioKeepAlive.currentTime = 0;
      } catch (e) {}
    }
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
      } catch (e) {}
    }
    releaseWakeLock();
  }

  // Starts 20-Second Emergency Siren & 10-Second Vibration Alert
  function startPocketEmergencyAlarm() {
    stopPocketEmergencyAlarm();
    alarmState.active = true;
    const durationMs = 20000;
    alarmState.endTime = Date.now() + durationMs;

    // 1. Start 20-Second Emergency Siren Sound (Plays via HTML5 Audio and Web Audio)
    startSirenSound(20);

    // 2. Start 10-Second Smartphone Vibration
    start10SecondVibration();

    // 3. MediaSession lock-screen card with pause/silence button
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `🚨 ${state.pocketIntervalMinutes}-MIN MCQ INDUSTRIAL SIREN!`,
          artist: 'Press Pause or Tap to Answer Question',
          album: 'Pocket Study Mode Alert',
          artwork: [
            { src: './icon.png', sizes: '192x192', type: 'image/png' },
            { src: './icon.png', sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.setActionHandler('pause', () => silenceSirenOnly());
        navigator.mediaSession.setActionHandler('stop', () => silenceSirenOnly());
        navigator.mediaSession.setActionHandler('nexttrack', () => silenceSirenOnly());
      } catch (e) {}
    }

    // 4. Visual 20-Second Countdown & Pressure Bar
    if (DOM.pocketAlarmBanner) {
      DOM.pocketAlarmBanner.style.display = 'block';
      if (DOM.alarmCountdownSec) DOM.alarmCountdownSec.textContent = '20s';
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
          stopPocketEmergencyAlarm();
        }
      }, 100);
    }

    // 5. Master timeout to stop after 20 seconds
    alarmState.timerId = setTimeout(() => {
      stopPocketEmergencyAlarm();
    }, durationMs);
  }

  // Stops and silences all alarms immediately
  function stopPocketEmergencyAlarm() {
    if (!alarmState.active) return;
    alarmState.active = false;

    if (alarmState.timerId) clearTimeout(alarmState.timerId);
    if (alarmState.uiInterval) clearInterval(alarmState.uiInterval);
    alarmState.timerId = null;
    alarmState.uiInterval = null;

    stopSirenSound();
    stopVibration();

    if (DOM.pocketAlarmBanner) {
      DOM.pocketAlarmBanner.style.display = 'none';
    }

    // If Pocket Study Mode is still active, restore background keep-alive audio so next reminder fires!
    if (state.pocketMode) {
      startBackgroundKeepAlive();
    }
  }

  // Silence Siren Only (stops sound and vibration without canceling Pocket Study Mode)
  function silenceSirenOnly() {
    stopPocketEmergencyAlarm();
    showToast('Siren silenced. Take your time to answer!');
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

  // Send Pocket System Notification with 10-second vibration and lock screen action buttons
  function sendPocketNotification(q) {
    const intervalText = `${state.pocketIntervalMinutes}-Min`;
    const title = `🚨 ${intervalText} MCQ ALERT [${q.subject_code || q.subject}]`;
    const snippet = q.question.length > 85 ? q.question.slice(0, 85) + '...' : q.question;
    const body = `${snippet}\n⚡ 20s industrial siren & 10s vibration ringing! Tap to answer!`;
    const options = {
      body: body,
      icon: './icon.png',
      badge: './icon.png',
      tag: 'pocket-mcq-industrial-siren',
      renotify: true,
      requireInteraction: true,
      silent: false,
      // 10 full seconds vibration pattern (10,000 ms)
      vibrate: [
        800, 200, 800, 200, 800, 200, 800, 200, 800, 200,
        800, 200, 800, 200, 800, 200, 800, 200, 800, 200
      ],
      actions: [
        { action: 'silence', title: '🔕 Silence Siren' },
        { action: 'open', title: '📝 Open Question' }
      ],
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

  // Schedules background Heads-Up Notification & Alarm in Service Worker.
  // This timer runs independently in the Service Worker background thread,
  // so even if the user minimizes the tab to scroll Instagram or watch reels,
  // the notification pops up at the exact interval (3m, 5m, 10m) and triggers the industrial siren!
  function scheduleServiceWorkerAlarm(targetTime) {
    if (!('serviceWorker' in navigator)) return;
    const currentQ = state.activePool[state.currentIndex];
    const intervalText = `${state.pocketIntervalMinutes}-Min`;
    const subjectName = currentQ ? (currentQ.subject_code || currentQ.subject || 'MCQ') : 'MCQ';
    const qSnippet = currentQ ? (currentQ.question.length > 85 ? currentQ.question.slice(0, 85) + '...' : currentQ.question) : 'Time for your next MCQ question!';

    const notifPayload = {
      title: `🚨 ${intervalText} MCQ ALERT [${subjectName}]`,
      options: {
        body: `${qSnippet}\n⚡ 20s industrial siren & 10s vibration ringing! Tap to answer!`,
        icon: './icon.png',
        badge: './icon.png',
        tag: 'pocket-mcq-industrial-siren',
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [
          800, 200, 800, 200, 800, 200, 800, 200, 800, 200,
          800, 200, 800, 200, 800, 200, 800, 200, 800, 200
        ],
        actions: [
          { action: 'silence', title: '🔕 Silence Siren' },
          { action: 'open', title: '📝 Open Question' }
        ],
        data: { url: './index.html' }
      }
    };

    const msg = {
      action: 'SCHEDULE_ALARM',
      targetTime: targetTime,
      notification: notifPayload
    };

    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(msg);
      } else {
        navigator.serviceWorker.ready.then(reg => {
          if (reg && reg.active) reg.active.postMessage(msg);
        }).catch(() => {});
      }
    } catch (e) {}
  }

  function cancelServiceWorkerAlarm() {
    if (!('serviceWorker' in navigator)) return;
    const msg = { action: 'CANCEL_ALARM' };
    try {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(msg);
      } else {
        navigator.serviceWorker.ready.then(reg => {
          if (reg && reg.active) reg.active.postMessage(msg);
        }).catch(() => {});
      }
    } catch (e) {}
  }

  // Listen for background messages from Service Worker (e.g. user tapped 'Silence Siren' or SW alarm triggered)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.action === 'SILENCE_SIREN') {
        silenceSirenOnly();
      } else if (event.data.action === 'OPEN_MCQ') {
        silenceSirenOnly();
      } else if (event.data.action === 'TRIGGER_ALARM') {
        // Triggered by Service Worker background timer even when phone is minimized or running Instagram
        if (state.pocketMode && !alarmState.active) {
          triggerPocketQuestionAlert();
        }
      }
    });
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
    navPocketGroup: document.getElementById('nav-pocket-group'),
    navPocketTimer: document.getElementById('nav-pocket-timer'),
    navPocketIntervalMini: document.getElementById('nav-pocket-interval-mini'),
    btnNavPocketToggle: document.getElementById('btn-nav-pocket-toggle'),
    navPocketDot: document.getElementById('nav-pocket-dot'),
    navPocketLabel: document.getElementById('nav-pocket-label'),

    // Setup Screen
    subjectsContainer: document.getElementById('subjects-container'),
    subjectCounter: document.getElementById('subject-selection-counter'),
    btnSelectAll: document.getElementById('btn-select-all'),
    btnClearAll: document.getElementById('btnClearAll') || document.getElementById('btn-clear-all'),
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

    // Scoreboard Pocket Top Bar Widget
    scoreboardPocketWidget: document.getElementById('scoreboard-pocket-widget'),
    scoreboardPocketTimer: document.getElementById('scoreboard-pocket-timer'),
    scoreboardPocketIntervalMini: document.getElementById('scoreboard-pocket-interval-mini'),
    btnScoreboardPocketToggle: document.getElementById('btn-scoreboard-pocket-toggle'),
    scoreboardPocketDot: document.getElementById('scoreboard-pocket-dot'),
    scoreboardPocketLabel: document.getElementById('scoreboard-pocket-label'),

    // Background Audio Elements
    audioSiren: document.getElementById('audio-siren'),
    audioKeepAlive: document.getElementById('audio-keepalive'),

    // Pocket Standby View
    pocketStandbyView: document.getElementById('pocket-standby-view'),
    standbyIntervalBadge: document.getElementById('standby-interval-badge'),
    standbyCountdownText: document.getElementById('standby-countdown-text'),
    btnStandbyAnswerNow: document.getElementById('btn-standby-answer-now'),
    btnStandbyStopPocket: document.getElementById('btn-standby-stop-pocket'),
    btnPocketResume: document.getElementById('btn-pocket-resume'),
    btnStopPocketMode: document.getElementById('btn-stop-pocket-mode'),

    // 20-Second Siren & 10-Second Vibration Alert Banner
    pocketAlarmBanner: document.getElementById('pocket-alarm-banner'),
    alarmCountdownSec: document.getElementById('alarm-countdown-seconds'),
    alarmTimerFill: document.getElementById('alarm-timer-fill'),
    btnSilenceSiren: document.getElementById('btn-silence-siren'),

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
    updatePocketTopBar(state.pocketMode);
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

  const FALLBACK_SUBJECTS = [
    { "name": "AMVI", "code": "AMVI", "slug": "amvi", "count": 281 },
    { "name": "AUTOMOBILE", "code": "AUTO", "slug": "auto", "count": 587 },
    { "name": "AUTOMOBILE POLLUTION AND CONTROL", "code": "APC", "slug": "apc", "count": 100 },
    { "name": "CHASSIS", "code": "CHS", "slug": "chs", "count": 700 },
    { "name": "DRIVER-MECHANIC", "code": "DM", "slug": "dm", "count": 200 },
    { "name": "ELECTRICAL SYSTEM", "code": "ELS", "slug": "els", "count": 750 },
    { "name": "ENGINE AND RELATED SYSTEMS", "code": "ERS", "slug": "ers", "count": 580 },
    { "name": "FLUID MECHANICS AND HYDRAULIC MACHINES", "code": "FMHM", "slug": "fmhm", "count": 205 },
    { "name": "HYBRID AND ELECTRIC VEHICLES", "code": "HEV", "slug": "hev", "count": 200 },
    { "name": "JOB RELATED TOPICS", "code": "JRT", "slug": "jrt", "count": 600 },
    { "name": "MACHINE ELEMENTS, MATERIALS AND BOILERS", "code": "MEMB", "slug": "memb", "count": 284 },
    { "name": "MODERN TECHNOLOGIES IN AUTOMOBILES", "code": "MTA", "slug": "mta", "count": 300 },
    { "name": "STRENGTH OF MATERIALS", "code": "SOM", "slug": "som", "count": 249 },
    { "name": "THERMAL ENGINEERING", "code": "TE", "slug": "te", "count": 162 },
    { "name": "TOPIC BASED ON DRIVING LICENCE", "code": "TBDL", "slug": "tbdl", "count": 200 },
    { "name": "TRANSMISSION SYSTEM", "code": "TRN", "slug": "trn", "count": 700 },
    { "name": "TRANSPORTATION MANAGEMENT", "code": "TRM", "slug": "trm", "count": 400 }
  ];

  async function loadSubjectsData() {
    try {
      const res = await fetch('./data/subjects.json');
      if (res.ok) {
        state.subjects = await res.json();
      } else {
        state.subjects = FALLBACK_SUBJECTS;
      }
    } catch (err) {
      console.warn('Fetch subjects failed, using fallback subjects catalog:', err);
      state.subjects = FALLBACK_SUBJECTS;
    }
    renderSubjectsGrid(state.subjects);
    updateSelectionSummary();
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

  // Sets and synchronizes pocket alert interval (3, 5, or 10 min)
  function setPocketInterval(minutes) {
    minutes = parseInt(minutes, 10);
    if (![3, 5, 10].includes(minutes)) return;
    state.pocketIntervalMinutes = minutes;
    localStorage.setItem('mcq_pocket_interval', minutes);

    // Synchronize all interval button groups across setup and top bars
    document.querySelectorAll('#pocket-interval-selector .chip-btn, .pocket-interval-mini-group .btn-interval-mini').forEach(b => {
      const bMin = parseInt(b.dataset.interval, 10);
      if (bMin === minutes) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // If Pocket Study Mode is running, immediately reset the countdown to the newly selected interval
    if (state.pocketMode && state.pocketStandbyActive) {
      state.targetAlertTime = Date.now() + (minutes * 60 * 1000);
      scheduleServiceWorkerAlarm(state.targetAlertTime);
      updatePocketTopBar(true);
      showToast(`MCQ Siren Interval changed to ${minutes} Minutes`);
    }
  }

  // Updates Top Bar Pocket Timer & ON/OFF Buttons (Navbar & Scoreboard)
  function updatePocketTopBar(isActive, timeStr) {
    const isPlaying = DOM.screenPractice && DOM.screenPractice.classList.contains('active');
    
    // Top bar in navbar
    if (DOM.navPocketGroup) {
      DOM.navPocketGroup.style.display = isPlaying ? 'inline-flex' : 'none';
    }
    // Top bar in scoreboard stats
    if (DOM.scoreboardPocketWidget) {
      DOM.scoreboardPocketWidget.style.display = isPlaying ? 'inline-flex' : 'none';
    }

    const isModeOn = !!state.pocketMode;
    const statusText = isModeOn ? 'Pocket: ON' : 'Pocket: OFF';
    const displayTime = timeStr || (isModeOn ? `${String(state.pocketIntervalMinutes).padStart(2, '0')}:00` : 'Off');

    if (DOM.navPocketLabel) DOM.navPocketLabel.textContent = statusText;
    if (DOM.scoreboardPocketLabel) DOM.scoreboardPocketLabel.textContent = statusText;

    if (DOM.navPocketTimer) {
      DOM.navPocketTimer.textContent = isModeOn ? `⏱️ ${displayTime}` : '⏱️ Off';
      DOM.navPocketTimer.title = `Next ${state.pocketIntervalMinutes}-minute reminder alert`;
    }
    if (DOM.scoreboardPocketTimer) {
      DOM.scoreboardPocketTimer.textContent = isModeOn ? `⏱️ ${displayTime}` : '⏱️ Off';
      DOM.scoreboardPocketTimer.title = `Next ${state.pocketIntervalMinutes}-minute reminder alert`;
    }

    // Sync active mini interval chips in top bars
    document.querySelectorAll('.pocket-interval-mini-group .btn-interval-mini').forEach(btn => {
      const bMin = parseInt(btn.dataset.interval, 10);
      if (bMin === state.pocketIntervalMinutes) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (DOM.navPocketDot) {
      DOM.navPocketDot.style.display = isModeOn ? 'inline-block' : 'none';
    }
    if (DOM.scoreboardPocketDot) {
      DOM.scoreboardPocketDot.style.display = isModeOn ? 'inline-block' : 'none';
    }

    const toggleBtns = [DOM.btnNavPocketToggle, DOM.btnScoreboardPocketToggle].filter(Boolean);
    toggleBtns.forEach(btn => {
      if (isModeOn) {
        btn.classList.add('active');
        btn.title = `Pocket Study Mode is ON (${state.pocketIntervalMinutes}m cycle). Click to turn OFF`;
      } else {
        btn.classList.remove('active');
        btn.title = 'Pocket Study Mode is OFF. Click to turn ON';
      }
    });
  }

  function handleWorkerTick() {
    if (!state.pocketMode || !state.targetAlertTime) return;

    const remainingSec = Math.max(0, Math.round((state.targetAlertTime - Date.now()) / 1000));
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (DOM.navPocketTimer) DOM.navPocketTimer.textContent = `⏱️ ${timeStr}`;
    if (DOM.scoreboardPocketTimer) DOM.scoreboardPocketTimer.textContent = `⏱️ ${timeStr}`;

    if (DOM.standbyCountdownText) {
      DOM.standbyCountdownText.textContent = timeStr;
    }

    if (remainingSec <= 0) {
      triggerPocketQuestionAlert();
    }
  }

  function startPocketTimer() {
    if (!state.pocketMode) return;
    state.pocketStandbyActive = true;
    state.targetAlertTime = Date.now() + (state.pocketIntervalMinutes * 60 * 1000);

    // Keep MCQ question card visible in natural flow! Never hide questions!
    if (DOM.pocketStandbyView) DOM.pocketStandbyView.style.display = 'none';
    if (DOM.practiceCardWrapper) DOM.practiceCardWrapper.style.display = 'block';

    updatePocketTopBar(true);

    // Start background audio keepalive to prevent smartphone throttling when minimized or screen off
    startBackgroundKeepAlive();

    // Schedule background alarm in Service Worker (fires over Instagram/other apps)
    scheduleServiceWorkerAlarm(state.targetAlertTime);

    if (timerWorker) {
      timerWorker.postMessage('start');
    }
  }

  function stopPocketTimer() {
    state.pocketStandbyActive = false;
    state.targetAlertTime = null;
    cancelServiceWorkerAlarm();
    stopPocketEmergencyAlarm();
    stopBackgroundKeepAlive();
    updatePocketTopBar(false);
    if (timerWorker) {
      timerWorker.postMessage('stop');
    }
  }

  function stopPocketStudyMode() {
    state.pocketMode = false;
    if (DOM.chkPocketMode) DOM.chkPocketMode.checked = false;
    stopPocketTimer();
    stopPocketEmergencyAlarm();
    stopBackgroundKeepAlive();
    if (wrongAnswerResumeTimer) {
      clearTimeout(wrongAnswerResumeTimer);
      wrongAnswerResumeTimer = null;
    }
    if (DOM.pocketOptionsSub) DOM.pocketOptionsSub.style.display = 'none';
    if (DOM.pocketStandbyView) DOM.pocketStandbyView.style.display = 'none';
    if (DOM.practiceCardWrapper) DOM.practiceCardWrapper.style.display = 'block';
    if (DOM.btnPocketResume) DOM.btnPocketResume.style.display = 'none';
    updatePocketTopBar(false);
    showToast('Pocket Study Mode turned OFF');
  }

  async function startPocketStudyMode() {
    state.pocketMode = true;
    if (DOM.chkPocketMode) DOM.chkPocketMode.checked = true;
    await requestNotificationPermission();
    startPocketTimer();
    updatePocketTopBar(true);
    showToast(`Pocket Study Mode ON: ${state.pocketIntervalMinutes}-minute alert cycle active (Works when minimized & screen off)`);
  }

  async function togglePocketStudyMode() {
    if (state.pocketMode) {
      stopPocketStudyMode();
    } else {
      await startPocketStudyMode();
    }
  }

  // Fires when selected interval timer completes
  function triggerPocketQuestionAlert() {
    stopPocketEmergencyAlarm();

    // If current question has already been answered, advance to next question
    const currentAnswered = !!state.userAnswers[state.currentIndex];
    if (currentAnswered) {
      if (state.currentIndex < state.activePool.length - 1) {
        state.currentIndex++;
      } else {
        state.currentIndex = 0; // Loop or finish
      }
      renderCurrentQuestion();
    }

    const currentQ = state.activePool[state.currentIndex];

    // Push system notification with 10-second vibration
    if (currentQ) {
      sendPocketNotification(currentQ);
    }

    // Keep question card visible
    if (DOM.pocketStandbyView) DOM.pocketStandbyView.style.display = 'none';
    if (DOM.practiceCardWrapper) DOM.practiceCardWrapper.style.display = 'block';

    // Trigger urgent 20-second industrial siren & 10-second vibration
    startPocketEmergencyAlarm();
    showToast(`🚨 ${state.pocketIntervalMinutes}-Minute MCQ Alert! 20s Industrial Siren & 10s Vibration ringing...`);

    // Automatically loop: reset timer so next alert fires at chosen interval!
    if (state.pocketMode) {
      state.targetAlertTime = Date.now() + (state.pocketIntervalMinutes * 60 * 1000);
      scheduleServiceWorkerAlarm(state.targetAlertTime);
      updatePocketTopBar(true);
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
          stopPocketStudyMode();
          showScreen('setup');
        }
      } else {
        stopPocketStudyMode();
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
          showToast(`${state.pocketIntervalMinutes}-Minute Pocket Mode Enabled (Works in background & screen off)`);
        }
      }
    });

    // Pocket Interval Selectors (Setup Screen & Top Bars)
    function attachIntervalGroup(container) {
      if (!container) return;
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-interval]');
        if (!btn) return;
        const minutes = parseInt(btn.dataset.interval, 10);
        setPocketInterval(minutes);
      });
    }

    attachIntervalGroup(DOM.pocketIntervalSelector);
    attachIntervalGroup(DOM.navPocketIntervalMini);
    attachIntervalGroup(DOM.scoreboardPocketIntervalMini);

    // Initialize interval selector state from saved settings
    setPocketInterval(state.pocketIntervalMinutes);

    // Test Sound, Vibration & Notification button (20s industrial siren & 10s vibration)
    DOM.btnTestNotification.addEventListener('click', async () => {
      await requestNotificationPermission();
      startPocketEmergencyAlarm();
      sendPocketNotification({
        subject_code: 'TEST',
        subject: `Demo ${state.pocketIntervalMinutes}m Industrial Siren Alert`,
        question: `This is a test: 20-second industrial siren and 10-second vibration are ringing for your ${state.pocketIntervalMinutes}-minute reminder!`
      });
      showToast('20s Industrial Siren & 10s Vibration triggered!');
    });

    // Pocket Standby View: Answer Question Now
    DOM.btnStandbyAnswerNow.addEventListener('click', () => {
      stopPocketTimer();
      DOM.pocketStandbyView.style.display = 'none';
      DOM.practiceCardWrapper.style.display = 'block';
      renderCurrentQuestion();
    });

    // Silence Siren Button (Mutes alarm immediately without stopping Pocket Study Mode)
    if (DOM.btnSilenceSiren) {
      DOM.btnSilenceSiren.addEventListener('click', (e) => {
        e.stopPropagation();
        silenceSirenOnly();
      });
    }
    if (DOM.pocketAlarmBanner) {
      DOM.pocketAlarmBanner.addEventListener('click', () => {
        silenceSirenOnly();
      });
    }

    // Top Bar Pocket Study Mode ON/OFF Toggles
    if (DOM.btnNavPocketToggle) {
      DOM.btnNavPocketToggle.addEventListener('click', togglePocketStudyMode);
    }
    if (DOM.btnScoreboardPocketToggle) {
      DOM.btnScoreboardPocketToggle.addEventListener('click', togglePocketStudyMode);
    }

    // Stop Pocket Study Mode Buttons
    if (DOM.btnStopPocketMode) {
      DOM.btnStopPocketMode.addEventListener('click', stopPocketStudyMode);
    }
    if (DOM.btnStandbyStopPocket) {
      DOM.btnStandbyStopPocket.addEventListener('click', stopPocketStudyMode);
    }

    // Resume Standby Button inside explanation box
    DOM.btnPocketResume.addEventListener('click', () => {
      if (wrongAnswerResumeTimer) clearTimeout(wrongAnswerResumeTimer);
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

    // Auto-resume keep-alive audio if Instagram or other background apps pause or duck audio
    if (DOM.audioKeepAlive) {
      DOM.audioKeepAlive.addEventListener('pause', () => {
        if (state.pocketMode && !alarmState.active) {
          setTimeout(() => {
            if (state.pocketMode && !alarmState.active && DOM.audioKeepAlive && DOM.audioKeepAlive.paused) {
              DOM.audioKeepAlive.play().catch(() => {});
            }
          }, 800);
        }
      });
    }

    // Auto-resume siren if temporarily ducked/paused while alarm is active
    if (DOM.audioSiren) {
      DOM.audioSiren.addEventListener('pause', () => {
        if (alarmState.active && (Date.now() < alarmState.endTime)) {
          setTimeout(() => {
            if (alarmState.active && DOM.audioSiren && DOM.audioSiren.paused) {
              DOM.audioSiren.play().catch(() => {});
            }
          }, 350);
        }
      });
    }

    // Tab visibility change: ensure audioContext and keep-alive are alive when user switches back
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        if (state.pocketMode && !alarmState.active && DOM.audioKeepAlive && DOM.audioKeepAlive.paused) {
          DOM.audioKeepAlive.play().catch(() => {});
        }
        if (alarmState.active && DOM.audioSiren && DOM.audioSiren.paused) {
          DOM.audioSiren.play().catch(() => {});
        }
      }
    });
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
      if (DOM.pocketStandbyView) DOM.pocketStandbyView.style.display = 'none';
      DOM.practiceCardWrapper.style.display = 'block';
      renderCurrentQuestion();
      updateScoreboard();

      if (state.pocketMode) {
        await requestNotificationPermission();
        startPocketTimer();
        showToast(`Pocket Mode Active: ${state.pocketIntervalMinutes}-minute reminders started (Works in background)`);
      } else {
        updatePocketTopBar(false);
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

  // Standard Math & Scientific Symbols Renderer (supports KaTeX and standard Unicode formatting)
  function formatScientificMath(rawText) {
    if (!rawText) return '';
    let text = String(rawText);

    // 1. Extract and render KaTeX math expressions if KaTeX is loaded
    const katexTokens = [];
    if (window.katex) {
      // Double dollar display math: $$ ... $$
      text = text.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
        try {
          const rendered = window.katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
          const token = `@@@KATEX_${katexTokens.length}@@@`;
          katexTokens.push(rendered);
          return token;
        } catch (e) { return match; }
      });

      // Inline math: $ ... $
      text = text.replace(/\$([^$]+)\$/g, (match, math) => {
        try {
          const rendered = window.katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
          const token = `@@@KATEX_${katexTokens.length}@@@`;
          katexTokens.push(rendered);
          return token;
        } catch (e) { return match; }
      });

      // Bare \frac{...}{...} or \sqrt{...}
      if (text.includes('\\frac') || text.includes('\\sqrt')) {
        text = text.replace(/\\(frac\{[^{}]*\}\{[^{}]*\}|sqrt\{[^{}]*\})/g, (math) => {
          try {
            const rendered = window.katex.renderToString(math, { displayMode: false, throwOnError: false });
            const token = `@@@KATEX_${katexTokens.length}@@@`;
            katexTokens.push(rendered);
            return token;
          } catch (e) { return math; }
        });
      }
    } else {
      // If KaTeX is not loaded, strip $ delimiters so raw dollars don't show
      text = text.replace(/\$\$([^$]+)\$\$/g, '$1').replace(/\$([^$]+)\$/g, '$1');
    }

    // 2. Escape raw inequalities and HTML special characters (< and >) on plain text
    text = text.replace(/&(?!amp;|lt;|gt;|quot;|#039;)/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // 3. Degree & temperature
    text = text.replace(/\^?\\circ\\text\{C\}|\^?\\circ\s*C|\\circ\s*C/g, '°C');
    text = text.replace(/\^?\\circ\\text\{F\}|\^?\\circ\s*F|\\circ\s*F/g, '°F');
    text = text.replace(/\^?\\circ|\\circ|\\degree/g, '°');

    // 4. Standard symbols
    const symMap = [
      [/\\times(?![a-zA-Z])/g, '×'],
      [/\\pm(?![a-zA-Z])/g, '±'],
      [/\\mu(?![a-zA-Z])/g, 'µ'],
      [/\\Omega(?![a-zA-Z])/g, 'Ω'],
      [/\\approx(?![a-zA-Z])/g, '≈'],
      [/\\leq(?![a-zA-Z])/g, '≤'],
      [/\\le(?![a-zA-Z])/g, '≤'],
      [/\\geq(?![a-zA-Z])/g, '≥'],
      [/\\ge(?![a-zA-Z])/g, '≥'],
      [/\\neq(?![a-zA-Z])/g, '≠'],
      [/\\ne(?![a-zA-Z])/g, '≠'],
      [/\\Delta(?![a-zA-Z])/g, 'Δ'],
      [/\\alpha(?![a-zA-Z])/g, 'α'],
      [/\\beta(?![a-zA-Z])/g, 'β'],
      [/\\gamma(?![a-zA-Z])/g, 'γ'],
      [/\\theta(?![a-zA-Z])/g, 'θ'],
      [/\\pi(?![a-zA-Z])/g, 'π'],
      [/\\sim(?![a-zA-Z])/g, '~']
    ];
    symMap.forEach(([reg, rep]) => { text = text.replace(reg, rep); });

    // 5. Delta variants (Engineering pressure drops, temperature, elongation, boundary layer, electrical delta)
    text = text.replace(/\bdelta_p_([a-zA-Z0-9]+)\b/g, 'Δp_$1');
    text = text.replace(/\bdelta_([a-zA-Z0-9]+)\b/g, 'Δ$1');
    text = text.replace(/\bdelta\s+([QWHEUSTVhpL])\b/g, 'Δ$1');
    text = text.replace(/\bdelta_p\b/gi, 'Δp');
    text = text.replace(/\bdelta_T\b/g, 'ΔT');
    text = text.replace(/\bdelta_t\b/g, 'Δt');
    text = text.replace(/\bdelta_L([0-9]*)\b/g, 'ΔL$1');
    text = text.replace(/\bdelta_V\b/g, 'ΔV');
    text = text.replace(/\bdelta_h\b/g, 'Δh');
    text = text.replace(/\bdelta_taper\b/g, 'δ_taper');
    text = text.replace(/\bdelta_uniform\b/g, 'δ_uniform');
    text = text.replace(/\bdelta_e\b/g, 'δₑ');
    text = text.replace(/\bDelta\s+omega\b/g, 'Δω');
    text = text.replace(/\bDelta-ferrite\b/g, 'δ-ferrite');
    text = text.replace(/\bAlpha-ferrite\b/g, 'α-ferrite');
    text = text.replace(/\bGamma-iron\b/g, 'γ-iron');
    text = text.replace(/\bGamma-austenite\b/g, 'γ-austenite');

    // Electrical Delta connections
    text = text.replace(/\bDelta\s*\(Delta\)/g, 'Δ (Delta)');
    text = text.replace(/\bDelta-connected\b/g, 'Δ-connected');
    text = text.replace(/\bDelta\s+stator\b/g, 'Δ stator');
    text = text.replace(/\bDelta\s+connection\b/g, 'Δ connection');
    text = text.replace(/\bDelta\s+winding\b/g, 'Δ winding');

    // Displacement thickness & boundary layer delta
    text = text.replace(/\bdelta\*/g, 'δ*');
    text = text.replace(/\bdelta\b(?!\s*connec|\s*stator|\s*wind|\s*loop)/g, 'δ');

    // 6. Polytropic & thermodynamic equations (pv^n = constant, pv^0 = constant, etc.)
    text = text.replace(/\bpv\^n\b/gi, 'p · vⁿ');
    text = text.replace(/\bpvⁿ\b/gi, 'p · vⁿ');
    text = text.replace(/\bpv\^0\b/gi, 'p · v⁰');
    text = text.replace(/\bpv⁰\b/gi, 'p · v⁰');
    text = text.replace(/\bpv\^1\b/gi, 'p · v¹');
    text = text.replace(/\bpv¹\b/gi, 'p · v¹');
    text = text.replace(/\bpv\^[γy]\b/gi, 'p · vᵞ');
    text = text.replace(/\bpv\^gamma\b/gi, 'p · vᵞ');
    text = text.replace(/\bpvᵞ\b/gi, 'p · vᵞ');

    // 7. Greek engineering & physics variables
    const subNumMap = {'1':'₁','2':'₂','3':'₃','4':'₄','0':'₀'};
    
    // Sigma (normal stress, Stefan-Boltzmann constant, standard deviation)
    text = text.replace(/\bsigma_([a-zA-Z0-9]+)\b/g, 'σ_$1');
    text = text.replace(/\bsigma([1-4])\b/g, (m, d) => 'σ' + (subNumMap[d] || d));
    text = text.replace(/\bsigma\b(?!\s*engine|\s*company)/g, 'σ');

    // Tau (shear stress, time constant)
    text = text.replace(/\btau_([a-zA-Z0-9]+)\b/g, 'τ_$1');
    text = text.replace(/\btau([1-4])\b/g, (m, d) => 'τ' + (subNumMap[d] || d));
    text = text.replace(/\btau\b/g, 'τ');

    // Theta (angles, temperatures, steering angles)
    text = text.replace(/\btheta_([a-zA-Z0-9]+)\b/g, 'θ_$1');
    text = text.replace(/\btheta([1-4])\b/g, (m, d) => 'θ' + (subNumMap[d] || d));
    text = text.replace(/\btheta\b/g, 'θ');

    // Epsilon (strain, emissivity)
    text = text.replace(/\bepsilon_([a-zA-Z0-9]+)\b/g, 'ε_$1');
    text = text.replace(/\bepsilon([1-4])\b/g, (m, d) => 'ε' + (subNumMap[d] || d));
    text = text.replace(/\bepsilon\b/g, 'ε');

    // Eta (efficiency, thermal/mechanical/volumetric efficiency)
    text = text.replace(/\beta_([a-zA-Z0-9]+)\b/g, 'η_$1');
    text = text.replace(/\beta([1-4])\b/g, (m, d) => 'η' + (subNumMap[d] || d));
    text = text.replace(/\beta\b(?!\s*carr|\s*hour)/g, 'η');

    // Rho (density, cut-off ratio)
    text = text.replace(/\brho_([a-zA-Z0-9]+)\b/g, 'ρ_$1');
    text = text.replace(/\brho([1-4])\b/g, (m, d) => 'ρ' + (subNumMap[d] || d));
    text = text.replace(/\brho\b/g, 'ρ');

    // Zeta (vorticity, damping ratio)
    text = text.replace(/\bzeta\b/g, 'ζ');

    // Omega (angular velocity, rotational frequency)
    text = text.replace(/\bomega_([a-zA-Z0-9]+)\b/g, 'ω_$1');
    text = text.replace(/\bomega([1-4])\b/g, (m, d) => 'ω' + (subNumMap[d] || d));
    text = text.replace(/\bomega²\b/g, 'ω²');
    text = text.replace(/\bomega\b/g, 'ω');

    // Gamma (adiabatic index, specific heat ratio, shear strain)
    text = text.replace(/\bgamma_([a-zA-Z0-9]+)\b/g, 'γ_$1');
    text = text.replace(/\bgamma([1-4])\b/g, (m, d) => 'γ' + (subNumMap[d] || d));
    text = text.replace(/\bgamma\b/g, 'γ');
    text = text.replace(/\bGamma\b(?!\s*Ray|\s*ray)/g, 'γ');

    // Lambda (air-fuel equivalence ratio, slenderness ratio, wavelength)
    text = text.replace(/\blambda_([a-zA-Z0-9]+)\b/g, 'λ_$1');
    text = text.replace(/\bLambda\s*=\s*([0-9\.]+)\b/g, 'λ = $1');
    text = text.replace(/\(Lambda\s*\/\s*O2\)/g, '(λ / O₂)');
    text = text.replace(/\(Lambda\s+or\s+O2\)/g, '(λ or O₂)');
    text = text.replace(/\bLambda\s+Window\b/g, 'λ-Window');
    text = text.replace(/(?:λ-sensor\s*\()?λ-sensor\s*\((?:Lambda|Lamda)\s+sensor\)\)?/g, 'λ-sensor');
    text = text.replace(/\b(?:Lambda|Lamda)\s+sensor\b/gi, 'λ-sensor');
    text = text.replace(/\blambda\b/g, 'λ');

    // Alpha & Beta (angles, slip angles, expansion coefficients)
    text = text.replace(/\balpha_([a-zA-Z0-9]+)\b/g, 'α_$1');
    text = text.replace(/\balpha([1-4])\b/g, (m, d) => 'α' + (subNumMap[d] || d));
    text = text.replace(/\balpha\b(?!\s*ferrite|\s*particle|\s*ray)/g, 'α');
    text = text.replace(/\bbeta_([a-zA-Z0-9]+)\b/g, 'β_$1');
    text = text.replace(/\bbeta([1-4])\b/g, (m, d) => 'β' + (subNumMap[d] || d));
    text = text.replace(/\bbeta\b(?!\s*particle|\s*ray|\s*brass)/g, 'β');

    // Phi
    text = text.replace(/\bphi\b/g, 'ϕ');

    // Mu & Nu (viscosity, friction coefficient, Poisson's ratio)
    text = text.replace(/\bmu_([a-zA-Z0-9]+)\b/g, 'µ_$1');
    text = text.replace(/(?<=[0-9\s*+\-\/(\[=])mu(?=[0-9\s*+\-\/)\]\,]|$)/g, 'µ');
    text = text.replace(/\bmu\b/g, 'µ');
    text = text.replace(/(?<=[0-9\s*+\-\/(\[=])nu(?=[0-9\s*+\-\/)\]\,]|$)/g, 'ν');
    text = text.replace(/\bnu\b(?!\s*Unit|\s*number)/g, 'ν');

    // Psi (Stream function in fluid mechanics vs tire pressure psi)
    text = text.replace(/\bstream function \(psi\)/gi, 'stream function (ψ)');
    text = text.replace(/\bstream function\s*\(?psi\)?/gi, 'stream function ψ');
    text = text.replace(/d\(psi\)\s*\/\s*d([txytz])/g, 'd(ψ)/d$1');
    text = text.replace(/\bpsi(?=\s*[*\/=])/g, 'ψ');
    text = text.replace(/=\s*psi\b/g, '= ψ');
    text = text.replace(/\(psi\)/g, '(ψ)');

    // Pi in equations
    text = text.replace(/\bPi\s*\*\s*([a-zA-Z0-9])/g, 'π · $1');
    text = text.replace(/2\s*\*\s*Pi\s*\*\s*N/gi, '2 · π · N');
    text = text.replace(/\bPi\s*\/\s*4/g, 'π / 4');
    text = text.replace(/(?<=[0-9\s*+\-\/(\[=])pi(?=[0-9\s*+\-\/)\]\,]|$)/g, 'π');
    text = text.replace(/\bpi\b(?!\s*pipe|\s*pin|\s*pilot|\s*piston|\s*pitot)/g, 'π');

    // Greek Subscripts: σ_x -> σₓ, σ_y -> σᵧ, τ_xy -> τₓᵧ, θ_o -> θₒ, θ_i -> θᵢ
    text = text.replace(/([στθερωνλαβΔ])_([xy])\b/g, (m, g, v) => g + (v === 'x' ? 'ₓ' : 'ᵧ'));
    text = text.replace(/([στθερωνλαβΔ])_max\b/g, '$1ₘₐₓ');
    text = text.replace(/([στθερωνλαβΔ])_min\b/g, '$1ₘᵢₙ');
    text = text.replace(/([στθερωνλαβΔ])_avg\b/g, '$1ₐᵥ');
    text = text.replace(/([στθερωνλαβΔ])_th\b/g, '$1ₜₕ');
    text = text.replace(/([στθερωνλαβΔ])_xy\b/g, '$1ₓᵧ');
    text = text.replace(/([στθερωνλαβΔ])_yx\b/g, '$1ᵧₓ');
    text = text.replace(/([στθερωνλαβΔ])_o\b/g, '$1ₒ');
    text = text.replace(/([στθερωνλαβΔ])_i\b/g, '$1ᵢ');
    text = text.replace(/([στθερωνλαβΔ])_outer\b/g, '$1<sub>outer</sub>');
    text = text.replace(/([στθερωνλαβΔ])_inner\b/g, '$1<sub>inner</sub>');
    text = text.replace(/([στθερωνλαβΔ])_theta\b/g, '$1<sub>θ</sub>');

    // 8. Standard Engineering variables & subscripts (Hf, Qth, Qact, Cd, Cc, Cv, Cp, etc.)
    const engVars = [
      [/\b(h_f|Hf|hf)\b/g, 'h<sub>f</sub>'],
      [/\b(h_s|hs|Hs)\b(?!\s*head|\s*and|\s*to)/g, 'h<sub>s</sub>'],
      [/\b(h_d|hd|Hd)\b(?!\s*head|\s*and|\s*to)/g, 'h<sub>d</sub>'],
      [/\bhfs\b/g, 'h<sub>fs</sub>'],
      [/\bhfd\b/g, 'h<sub>fd</sub>'],
      [/\b(H_m|Hm)\b/g, 'H<sub>m</sub>'],
      [/\b(Q_th|Qth)\b/g, 'Q<sub>th</sub>'],
      [/\b(Q_act|Qact)\b/g, 'Q<sub>act</sub>'],
      [/\b(C_d|Cd)\b/g, 'C<sub>d</sub>'],
      [/\b(C_c|Cc)\b/g, 'C<sub>c</sub>'],
      [/\b(C_v|Cv)\b/g, 'C<sub>v</sub>'],
      [/\b(C_p|Cp)\b/g, 'C<sub>p</sub>'],
      [/\b(V_s|Vs)\b(?!\s*versus)/g, 'V<sub>s</sub>'],
      [/\b(V_c|Vc)\b/g, 'V<sub>c</sub>'],
      [/\b(V_d|Vd)\b/g, 'V<sub>d</sub>'],
      [/\b(v_d²|vd²|v_d\^2|vd\^2)\b/g, 'v<sub>d</sub>²'],
      [/\b(v_s²|vs²|v_s\^2|vs\^2)\b/g, 'v<sub>s</sub>²'],
      [/\bA_act\b/g, 'A<sub>act</sub>'],
      [/\bA_th\b/g, 'A<sub>th</sub>'],
      [/\bV_act\b/g, 'V<sub>act</sub>'],
      [/\bV_th\b/g, 'V<sub>th</sub>'],
      [/\bV_L\b/g, 'V<sub>L</sub>'],
      [/\bI_L\b/g, 'I<sub>L</sub>'],
      [/\bV_ph\b/g, 'V<sub>ph</sub>'],
      [/\bI_ph\b/g, 'I<sub>ph</sub>'],
      [/\b(W_ps|Wps)\b/g, 'W<sub>ps</sub>'],
      [/\b(W_m|Wm)\b/g, 'W<sub>m</sub>'],
      [/\b(L_e|Le)\b(?=\s*=|\s*of|\s*\/)/g, 'L<sub>e</sub>']
    ];
    engVars.forEach(([reg, rep]) => { text = text.replace(reg, rep); });

    // 9. Powers on subscripted variables: H<sub>m</sub>^(3/4) -> H<sub>m</sub><sup>3/4</sup>
    text = text.replace(/<sub>([a-zA-Z0-9]+)<\/sub>\^\(?([0-9\/]+)\)?/g, '<sub>$1</sub><sup>$2</sup>');
    text = text.replace(/\^(\d+\/\d+)/g, '<sup>$1</sup>');

    // 10. Square root: sqrt(...) -> √( ... )
    text = text.replace(/\bsqrt\(([^()]+)\)/g, '√($1)');
    text = text.replace(/\bsqrt\(([^)]+)\)/g, '√($1)');

    // 11. Integrals & Approximations
    text = text.replace(/integral from 0 to ([a-zA-ZδΔ]+) of/g, '∫₀^$1');
    text = text.replace(/integral from ([a-zA-Z0-9]+) to ([a-zA-Z0-9]+) of/g, '∫_{$1}^{$2}');
    text = text.replace(/\bapprox\.?\b/g, '≈');

    // 12. Chemical formulas with common LaTeX wrappers
    text = text.replace(/\\text\{PbO\}_2/g, 'PbO₂');
    text = text.replace(/\\text\{H\}_2\\text\{SO\}_4/g, 'H₂SO₄');
    text = text.replace(/\\text\{PbSO\}_4/g, 'PbSO₄');
    text = text.replace(/\\text\{CO\}_2/g, 'CO₂');
    text = text.replace(/\\text\{O\}_2/g, 'O₂');
    text = text.replace(/\\text\{NO\}_\\text\{x\}/g, 'NOₓ');
    text = text.replace(/\\text\{NO\}_x/g, 'NOₓ');

    // 13. Unwrap any bare \text{...}
    text = text.replace(/\\text\{([^}]*)\}/g, '$1');

    // 14. Clean up escaped symbols and extra backslashes
    text = text.replace(/\\_/g, '_').replace(/\\ /g, ' ').replace(/\\%/g, '%');

    // 15. Engineering sub-indices: L1 -> L₁, A1 -> A₁, etc.
    const subNum = {'1':'₁','2':'₂','3':'₃','4':'₄'};
    text = text.replace(/\b([yLAdEPVTrFrασ])[1-4]\b/g, (m, l) => l + (subNum[m.slice(-1)] || m.slice(-1)));
    text = text.replace(/_max/g, 'ₘₐₓ').replace(/_min/g, 'ₘᵢₙ').replace(/_ph/g, 'ₚₕ');

    // 16. General subscripts
    const subMap = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','x':'ₓ','n':'ₙ','m':'ₘ','v':'ᵥ','p':'ₚ','t':'ₜ'};
    text = text.replace(/_([0-9xnmvpt])\b/g, (m, c) => subMap[c] || m);
    text = text.replace(/_\{([0-9xnmvpt]+)\}/g, (m, cs) => cs.split('').map(c => subMap[c] || c).join(''));

    // 17. Superscripts
    const supMap = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','x':'ˣ','st':'ˢᵗ','nd':'ⁿᵈ','rd':'ʳᵈ','th':'ᵗʰ'};
    text = text.replace(/\^([0-9nx])\b/g, (m, c) => supMap[c] || m);
    text = text.replace(/\^\\text\{([a-z]+)\}/g, (m, cs) => supMap[cs] || cs);
    text = text.replace(/\^\{([0-9]+)\}/g, (m, cs) => cs.split('').map(c => supMap[c] || c).join(''));

    // 18. Multiplication in equations: 2 * pi -> 2 · π
    text = text.replace(/([a-zA-Z0-9\u0370-\u03FF\u2070-\u209F]+)\s*\*\s*([a-zA-Z0-9\u0370-\u03FF\u2070-\u209F√]+)/g, '$1 · $2');
    text = text.replace(/\)\s*\*\s*\(/g, ') · (');

    // 19. Restore KaTeX blocks
    katexTokens.forEach((rendered, idx) => {
      text = text.replace(`@@@KATEX_${idx}@@@`, rendered);
    });

    return text;
  }

  // Scramble options A, B, C, D into a different random order each time question is presented
  function scrambleQuestionOptions(q) {
    if (!q || !q.options) return;

    // Cache original pristine options and answer on first encounter
    if (!q._origOptions) {
      q._origOptions = { ...q.options };
      q._origAnswer = (q.answer || 'A').trim().toUpperCase();
    }

    const letters = ['A', 'B', 'C', 'D'];
    const activeLetters = letters.filter(l => q._origOptions[l] !== undefined && q._origOptions[l] !== '');
    if (activeLetters.length <= 1) return;

    // Map each original option and whether it was the correct answer
    const items = activeLetters.map(l => ({
      text: q._origOptions[l],
      isCorrect: l === q._origAnswer
    }));

    // Randomize option order
    shuffleArray(items);

    // Reassign shuffled options to A, B, C, D and track new correct answer letter
    const newOptions = {};
    let newCorrectLetter = 'A';

    activeLetters.forEach((l, idx) => {
      newOptions[l] = items[idx].text;
      if (items[idx].isCorrect) {
        newCorrectLetter = l;
      }
    });

    q.options = newOptions;
    q.answer = newCorrectLetter;
  }

  // =========================================================================
  // PRACTICE VIEW RENDERING & INTERACTION
  // =========================================================================
  function renderCurrentQuestion() {
    const q = state.activePool[state.currentIndex];
    if (!q) return;

    // Scramble options into a fresh random order if question has not been answered yet in this session
    if (!state.userAnswers[state.currentIndex]) {
      scrambleQuestionOptions(q);
    }

    // Reset Explanation box
    DOM.explanationBox.style.display = 'none';
    if (DOM.btnPocketResume) DOM.btnPocketResume.style.display = 'none';

    // Tags & statement
    DOM.qSubjectTag.textContent = `${q.subject_code ? '[' + q.subject_code + '] ' : ''}${q.subject}`;
    DOM.qIdTag.textContent = q.id || `Q${state.currentIndex + 1}`;
    DOM.qDiffTag.textContent = q.difficulty || 'Medium';
    DOM.qText.innerHTML = formatScientificMath(q.question);

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
      btn.title = 'Tap to select • Long-press to search Google and study';

      btn.innerHTML = `
        <span class="opt-badge">${letter}</span>
        <span class="opt-text">${formatScientificMath(optText)}</span>
        <span class="opt-status-icon"></span>
      `;

      if (isAnswered) {
        if (answerRecord.selected === letter) {
          if (answerRecord.isCorrect) {
            btn.classList.add('selected-correct');
            btn.querySelector('.opt-status-icon').textContent = 'Correct';
            btn.title = 'Double-click to view answer description • Long-press to search Google';
          } else {
            btn.classList.add('selected-wrong');
            btn.querySelector('.opt-status-icon').textContent = 'Incorrect';
            btn.title = 'Double-click to view answer description • Long-press to search Google';
          }
        } else if (!answerRecord.isCorrect && letter === correctLetter) {
          btn.classList.add('reveal-correct');
          btn.querySelector('.opt-status-icon').textContent = 'Correct';
          btn.title = 'Double-click to view answer description • Long-press to search Google';
        }
      }

      // Long-press handling to search Google for this option without selecting it
      let pressTimer = null;
      let didLongPress = false;
      let touchStartX = 0;
      let touchStartY = 0;

      const triggerLongPressSearch = () => {
        didLongPress = true;
        if (navigator.vibrate) {
          try { navigator.vibrate(40); } catch (e) {}
        }
        const cleanOpt = optText.replace(/<[^>]+>/g, '').replace(/[$_^{}]/g, '').trim();
        const cleanQ = (q.question || '').replace(/<[^>]+>/g, '').replace(/[$_^{}]/g, '').trim().slice(0, 70);
        const subj = (q.subject || state.activeSubjectName || '').trim();
        const searchQuery = `${cleanOpt} ${cleanQ} ${subj}`.trim();
        showToast(`🔍 Searching Google: "${cleanOpt.slice(0, 32)}..."`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank', 'noopener,noreferrer');
      };

      const startPress = (e) => {
        didLongPress = false;
        if (e.type === 'touchstart' && e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
        clearTimeout(pressTimer);
        pressTimer = setTimeout(triggerLongPressSearch, 500);
      };

      const cancelPress = () => {
        clearTimeout(pressTimer);
      };

      const movePress = (e) => {
        if (e.type === 'touchmove' && e.touches && e.touches[0]) {
          const dx = Math.abs(e.touches[0].clientX - touchStartX);
          const dy = Math.abs(e.touches[0].clientY - touchStartY);
          if (dx > 10 || dy > 10) {
            clearTimeout(pressTimer);
          }
        }
      };

      btn.addEventListener('touchstart', startPress, { passive: true });
      btn.addEventListener('touchmove', movePress, { passive: true });
      btn.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
        if (didLongPress) {
          setTimeout(() => { didLongPress = false; }, 250);
        }
      });
      btn.addEventListener('touchcancel', cancelPress);

      btn.addEventListener('mousedown', (e) => {
        if (e.button === 0) startPress(e);
      });
      btn.addEventListener('mouseup', cancelPress);
      btn.addEventListener('mouseleave', cancelPress);
      btn.addEventListener('contextmenu', (e) => {
        if (didLongPress) {
          e.preventDefault();
        }
      });

      btn.addEventListener('click', (e) => {
        if (didLongPress) {
          e.preventDefault();
          e.stopPropagation();
          didLongPress = false;
          return;
        }
        handleOptionClick(letter, btn);
      });
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

    // Immediately stop & silence 20s siren and 10s vibration when player attends question
    stopPocketEmergencyAlarm();

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

    // Silence industrial siren if it was ringing when the user answers
    if (alarmState.active) {
      silenceSirenOnly();
    }

    // Natural MCQ practice flow:
    // When wrong answer is selected, show description about right answer
    if (!isCorrect) {
      showExplanation(q, false);
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
      ${correctText ? `— <em>${formatScientificMath(correctText)}</em>` : ''}
    `;

    DOM.expText.innerHTML = formatScientificMath(q.explanation || 'No detailed explanation provided for this question.').replace(/\n/g, '<br>');
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
    stopPocketEmergencyAlarm();
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

        <div class="rev-q-text">${formatScientificMath(q.question)}</div>

        <div class="rev-answers-summary">
          ${isWrong ? `
            <div class="rev-ans-row user-wrong">
              <span>Your Answer:</span>
              <strong>Option ${userSelected}: ${formatScientificMath(userSelectedText)}</strong>
            </div>
            <div class="rev-ans-row correct-ans">
              <span>Correct Answer:</span>
              <strong>Option ${correctLetter}: ${formatScientificMath(correctText)}</strong>
            </div>
          ` : `
            <div class="rev-ans-row user-correct">
              <span>Answered:</span>
              <strong>Option ${userSelected}: ${formatScientificMath(userSelectedText)} (Correct)</strong>
            </div>
          `}
        </div>

        <div class="rev-exp-box">
          <strong style="color: #ffffff;">Explanation / Description:</strong> ${formatScientificMath(q.explanation || 'No explanation available.') .replace(/\n/g, '<br>')}
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
