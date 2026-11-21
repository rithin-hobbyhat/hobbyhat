/**
 * Main Application Controller for how2bin
 * Orchestrates HUD, Navigation, Modals, Audio, and Active Modes
 */

// App Controller
class App {
  constructor() {
    this.currentMode = 'prep_rush';
    this.modeInstances = {};
    this.init();
  }

  init() {
    this.bindHUD();
    this.bindNavigation();
    this.bindModals();
    this.bindAudioControls();
    this.bindZoomControls();

    // Subscribe HUD updates to GameState
    State.subscribe(state => this.updateHUD(state));

    // Load initial mode (supports #sharps_mission, #prep_rush, etc.)
    const hashMode = window.location.hash.replace('#', '');
    const validModes = ['prep_rush', 'sharps_mission', 'contamination', 'five_s', 'eco_town'];
    const initialMode = validModes.includes(hashMode) ? hashMode : 'prep_rush';
    this.switchMode(initialMode);
  }

  bindHUD() {
    // Reset progress button
    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      if (confirm('Start fresh? This will reset all your Eco-Scores, stars, and badges.')) {
        State.resetProgress();
        showToast('Progress reset to Level 1.', 'info');
        this.switchMode(this.currentMode);
      }
    });

    // Rules & guide modal button
    document.getElementById('btn-guide')?.addEventListener('click', () => {
      document.getElementById('guide-modal-overlay')?.classList.remove('hidden');
    });

    document.getElementById('guide-modal-close')?.addEventListener('click', () => {
      document.getElementById('guide-modal-overlay')?.classList.add('hidden');
    });
  }

  updateHUD(state) {
    const scoreVal = document.getElementById('hud-score-val');
    const starsVal = document.getElementById('hud-stars-val');
    const shieldVal = document.getElementById('hud-shield-fill');
    const shieldPercent = document.getElementById('hud-shield-percent');
    const streakVal = document.getElementById('hud-streak-val');
    const townLevel = document.getElementById('hud-town-level');

    if (scoreVal) scoreVal.textContent = state.score;
    if (starsVal) starsVal.textContent = state.stars;
    if (streakVal) streakVal.textContent = `${state.streak}x`;
    if (townLevel) townLevel.textContent = `Lv.${state.ecoTownLevel}`;

    if (shieldVal && shieldPercent) {
      shieldVal.style.width = `${state.safetyShield}%`;
      shieldPercent.textContent = `${state.safetyShield}%`;

      if (state.safetyShield <= 35) {
        shieldVal.style.background = '#e53935';
      } else if (state.safetyShield <= 70) {
        shieldVal.style.background = '#fb8c00';
      } else {
        shieldVal.style.background = '#43a047';
      }
    }
  }

  bindNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.switchMode(mode);
      });
    });
  }

  switchMode(modeKey) {
    this.currentMode = modeKey;
    AudioPlayer.click();

    // Task Full Name Map
    const TASK_FULL_NAMES = {
      prep_rush: 'Task 1: Bin Match & Prep Rush',
      sharps_mission: 'Task 2: Indian Biomedical Waste Mission',
      contamination: 'Task 3: Contamination Detective',
      five_s: 'Task 4: 5S Practice Section',
      eco_town: 'Eco-Town & Badges'
    };

    // Update Current Task Name Banner
    const taskTitleEl = document.getElementById('current-task-name-text');
    if (taskTitleEl && TASK_FULL_NAMES[modeKey]) {
      taskTitleEl.textContent = TASK_FULL_NAMES[modeKey];
    }

    // Update active nav button
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.dataset.mode === modeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const arena = document.getElementById('main-game-arena');
    arena.innerHTML = '';

    // Instantiate appropriate mode
    switch (modeKey) {
      case 'prep_rush':
        this.modeInstances.prepRush = new PrepRushMode(arena);
        this.modeInstances.prepRush.init();
        break;

      case 'sharps_mission':
        this.modeInstances.sharps = new SharpsSafetyMissionMode(arena);
        this.modeInstances.sharps.init();
        break;

      case 'contamination':
        this.modeInstances.contamination = new ContaminationDetectiveMode(arena);
        this.modeInstances.contamination.init();
        break;

      case 'five_s':
        this.modeInstances.fiveS = new FiveSMode(arena);
        this.modeInstances.fiveS.init();
        break;

      case 'eco_town':
        this.modeInstances.ecoTown = new EcoTownManager(arena);
        this.modeInstances.ecoTown.render();
        break;
    }
  }

  bindZoomControls() {
    this.zoomLevel = 1.0;
    const arena = document.getElementById('main-game-arena');
    const badge = document.getElementById('zoom-level-badge');

    const setZoom = (val) => {
      this.zoomLevel = Math.min(Math.max(Math.round(val * 10) / 10, 0.6), 1.6);
      if (arena) {
        arena.style.transform = `scale(${this.zoomLevel})`;
        arena.style.transformOrigin = 'top center';
        arena.style.transition = 'transform 0.18s ease-out';
      }
      if (badge) {
        badge.textContent = `${Math.round(this.zoomLevel * 100)}%`;
      }
    };

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => setZoom(this.zoomLevel + 0.1));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => setZoom(this.zoomLevel - 0.1));
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => setZoom(1.0));
  }

  bindModals() {
    // Backdrop click to close guide
    document.getElementById('guide-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'guide-modal-overlay') {
        e.target.classList.add('hidden');
      }
    });
  }

  bindAudioControls() {
    const soundBtn = document.getElementById('btn-sound-toggle');
    const musicBtn = document.getElementById('btn-music-toggle');

    soundBtn?.addEventListener('click', () => {
      const enabled = AudioPlayer.toggleSound();
      soundBtn.innerHTML = enabled 
        ? '<span class="ctrl-icon">🔊</span><span class="ctrl-text"> Sound: ON</span>' 
        : '<span class="ctrl-icon">🔇</span><span class="ctrl-text"> Sound: OFF</span>';
      soundBtn.classList.toggle('btn-muted', !enabled);
    });

    musicBtn?.addEventListener('click', () => {
      const enabled = AudioPlayer.toggleMusic();
      musicBtn.innerHTML = enabled 
        ? '<span class="ctrl-icon">🎵</span><span class="ctrl-text"> Music: ON</span>' 
        : '<span class="ctrl-icon">🎶</span><span class="ctrl-text"> Music: OFF</span>';
      musicBtn.classList.toggle('btn-active', enabled);
    });
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.how2binApp = new App();
});
