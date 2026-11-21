/**
 * Audio Synthesizer for how2bin
 * Uses Web Audio API to produce cheerful, crisp sound effects and ambient melody
 * Works 100% offline with zero external audio assets!
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.musicInterval = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported in this browser', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
    return this.musicEnabled;
  }

  // Play a simple tone with envelope
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2, attack = 0.02) {
    if (!this.soundEnabled || !this.ctx) return;
    this.resume();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      // Audio error fallback
    }
  }

  // Play a chord / arpeggio
  playChord(notes, interval = 0.08, type = 'sine', duration = 0.2) {
    if (!this.soundEnabled || !this.ctx) return;
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, type, duration, 0.15);
      }, idx * (interval * 1000));
    });
  }

  // SOUND FX PRESETS

  click() {
    this.playTone(600, 'triangle', 0.06, 0.1, 0.005);
  }

  grab() {
    this.playTone(440, 'sine', 0.08, 0.15);
  }

  dropSuccess() {
    // Joyful major triad
    this.playChord([523.25, 659.25, 783.99, 1046.50], 0.07, 'triangle', 0.25);
  }

  prepAction() {
    // Mechanical tool sound
    this.playTone(350, 'sawtooth', 0.12, 0.15);
    setTimeout(() => this.playTone(700, 'sine', 0.15, 0.2), 100);
  }

  repair() {
    // Ratchet / repair chime
    this.playChord([440, 554.37, 659.25, 880, 1108.73], 0.06, 'triangle', 0.25);
  }

  spongeScrub() {
    // Friction swoosh
    this.playTone(280 + Math.random() * 80, 'sine', 0.09, 0.08);
  }

  tongsClack() {
    // Metallic clamp sound
    this.playTone(850, 'triangle', 0.04, 0.25);
    setTimeout(() => this.playTone(1100, 'triangle', 0.05, 0.2), 40);
  }

  errorBuzz() {
    if (!this.soundEnabled || !this.ctx) return;
    this.resume();
    // Low double buzz
    this.playTone(180, 'sawtooth', 0.18, 0.2);
    setTimeout(() => this.playTone(150, 'sawtooth', 0.22, 0.2), 150);
  }

  hazardAlarm() {
    if (!this.soundEnabled || !this.ctx) return;
    this.resume();
    // High alert warble
    [900, 750, 900, 750].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.1, 0.18), i * 110);
    });
  }

  levelUp() {
    // Victory fanfare
    const notes = [440, 554.37, 659.25, 880, 1046.5, 1318.51];
    this.playChord(notes, 0.09, 'sine', 0.35);
  }

  badgeEarned() {
    // Shimmering reward
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98];
    this.playChord(notes, 0.07, 'triangle', 0.3);
  }

  // Soft ambient background melody
  startAmbientMusic() {
    if (this.musicInterval) return;
    const melody = [261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 329.63, 261.63];
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled) return;
      const freq = melody[noteIdx % melody.length];
      this.playTone(freq, 'sine', 0.35, 0.035, 0.08);
      noteIdx++;
    }, 600);
  }

  stopAmbientMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

const AudioPlayer = new SoundSystem();
