// Web Audio API Sound Synthesizer for Circuit Lab
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.motorOsc = null;
    this.motorGain = null;
    this.isMotorRunning = false;
    this.buzzerOsc = null;
    this.buzzerGain = null;
    this.isBuzzerRunning = false;
    this.fgOsc = null;
    this.fgGain = null;
    this.isFgRunning = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.ctx) {
      if (this.motorGain) {
        this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      if (this.buzzerGain) {
        this.buzzerGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      if (this.fgGain) {
        this.fgGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    }
    return this.muted;
  }

  // Pleasant UI click sound for buttons and level navigation
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Safe fallback
    }
  }

  playConnect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playDisconnect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playSwitch(on = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(on ? 400 : 250, now);
    osc.frequency.exponentialRampToValueAtTime(on ? 800 : 180, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playSpark() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Noise buffer for spark/short circuit
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Task Completion Celebration: Expressive "WOW!" Vocal Sound Effect, Chime Fanfare & Voice Appreciation
  playSuccess() {
    this.playWow();
  }

  playWow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Dual-Formant Acoustic "W-O-W!" Vocal Synthesis
    // Fundamental pitch glides with excitement: 240Hz -> 395Hz -> 285Hz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(395, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(285, now + 0.46);

    // Formant 1 (Vocal tract opening): sweeps from 320Hz up to 780Hz then down to 360Hz
    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.Q.setValueAtTime(4.2, now);
    f1.frequency.setValueAtTime(320, now);
    f1.frequency.exponentialRampToValueAtTime(780, now + 0.16);
    f1.frequency.exponentialRampToValueAtTime(360, now + 0.46);

    // Formant 2 (Oral cavity / vowel 'AW'/'OH' resonance): sweeps 720Hz -> 1220Hz -> 780Hz
    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.Q.setValueAtTime(4.8, now);
    f2.frequency.setValueAtTime(720, now);
    f2.frequency.exponentialRampToValueAtTime(1220, now + 0.16);
    f2.frequency.exponentialRampToValueAtTime(780, now + 0.46);

    // Dynamic amplitude envelope for the word "WOW"
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.07);
    gain.gain.setValueAtTime(0.26, now + 0.20);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.50);

    osc.connect(f1);
    osc.connect(f2);
    f1.connect(gain);
    f2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);

    // 2. Celebratory Ascending Sparkle Fanfare (C5, E5, G5, C6, E6)
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    fanfareNotes.forEach((freq, i) => {
      const fOsc = this.ctx.createOscillator();
      const fGain = this.ctx.createGain();
      const t = now + 0.15 + i * 0.085;

      fOsc.type = 'triangle';
      fOsc.frequency.setValueAtTime(freq, t);

      fGain.gain.setValueAtTime(0.18, t);
      fGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      fOsc.connect(fGain);
      fGain.connect(this.ctx.destination);

      fOsc.start(t);
      fOsc.stop(t + 0.35);
    });

    // 3. Spoken Voice Appreciation: "Wow! Fantastic job!"
    setTimeout(() => {
      this.speak("Wow! Fantastic job! Task completed successfully!", 1.35, 1.08);
    }, 180);
  }

  // Multimeter Continuity Beeper (Pure 2.4 kHz Crystal Piezo Tone)
  playContinuityBeep(duration = 0.2) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(2400, now); // Standard Fluke 2.4kHz piezo frequency
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.setValueAtTime(0.18, now + duration - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Safe fallback
    }
  }

  setMotorState(running, speed = 1) {
    if (this.muted || !running || speed <= 0) {
      if (this.isMotorRunning && this.motorGain && this.ctx) {
        this.motorGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        this.isMotorRunning = false;
      }
      return;
    }

    this.init();
    if (!this.ctx) return;

    if (!this.motorOsc) {
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();
      this.motorFilter = this.ctx.createBiquadFilter();

      this.motorOsc.type = 'sawtooth';
      this.motorOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.motorFilter.type = 'lowpass';
      this.motorFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

      this.motorOsc.connect(this.motorFilter);
      this.motorFilter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start();
    }

    // Physical motor acoustic synthesis:
    // Speed varies from 0.0 (stopped) to 1.0 (full speed 12,000 RPM)
    // Low speed (high resistance): deep low rumbling purr (~45-80 Hz, soft volume)
    // Medium speed (mid resistance): steady buzzing hum (~120-180 Hz)
    // High speed (low/no resistance): energetic whirring whine (~260-340 Hz, high volume)
    const clampedSpeed = Math.max(0.01, Math.min(1.0, speed));
    const freq = Math.min(360, Math.max(45, Math.round(45 + Math.pow(clampedSpeed, 0.85) * 280)));
    const targetGain = Math.min(0.14, Math.max(0.008, Math.pow(clampedSpeed, 1.15) * 0.12));
    const filterFreq = Math.min(1800, Math.max(180, Math.round(180 + clampedSpeed * 1200)));

    this.motorOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.04);
    if (this.motorFilter) {
      this.motorFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.04);
    }
    this.motorGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.04);
    this.isMotorRunning = true;
  }

  setBuzzerState(active, voltage = 9.0) {
    if (this.muted || !active || voltage < 0.6) {
      if (this.buzzerGain && this.ctx) {
        try {
          this.buzzerGain.gain.cancelScheduledValues(this.ctx.currentTime);
          this.buzzerGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } catch (e) {}
      }
      if (this.buzzerOsc) {
        try {
          this.buzzerOsc.stop(this.ctx.currentTime);
          this.buzzerOsc.disconnect();
        } catch (e) { }
        this.buzzerOsc = null;
      }
      this.isBuzzerRunning = false;
      return;
    }

    this.init();
    if (!this.ctx) return;

    const v = Math.max(0.6, voltage);
    // Real-world piezoelectric buzzer acoustic response across resistance divider:
    // Frequency shifts down as drive voltage decreases with series resistors
    const freq = Math.min(2200, Math.max(260, Math.round(320 + (v / 9.0) * 780)));
    // Sound Pressure Level (Volume) responds dynamically: quiet whisper at ~1V, full 85dB blast at 9V+
    const normV = Math.max(0, (v - 0.50) / 8.50);
    const targetGain = Math.min(0.20, Math.max(0.006, 0.008 + Math.pow(normV, 1.30) * 0.17));
    const filterFreq = Math.min(4800, Math.max(650, Math.round(750 + v * 380)));

    if (!this.buzzerOsc) {
      this.buzzerOsc = this.ctx.createOscillator();
      this.buzzerGain = this.ctx.createGain();
      this.buzzerFilter = this.ctx.createBiquadFilter();

      this.buzzerOsc.type = 'triangle';
      this.buzzerOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      this.buzzerGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.buzzerFilter.type = 'lowpass';
      this.buzzerFilter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

      this.buzzerOsc.connect(this.buzzerFilter);
      this.buzzerFilter.connect(this.buzzerGain);
      this.buzzerGain.connect(this.ctx.destination);
      this.buzzerOsc.start();
    } else {
      // Dynamic frequency, harmonic filter, and loudness tracking as voltage changes
      this.buzzerOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.04);
      if (this.buzzerFilter) {
        this.buzzerFilter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.04);
      }
    }

    this.buzzerGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.03);
    this.isBuzzerRunning = true;
  }

  updateFunctionGeneratorTone(freq, waveform, amplitudeVpp, isAudible = true) {
    if (this.muted || !isAudible) {
      this.stopFunctionGeneratorTone();
      return;
    }
    this.init();
    if (!this.ctx) return;

    // Audible safety limits (20Hz to 16kHz)
    const audibleFreq = Math.max(20, Math.min(16000, freq || 1000));
    const targetGain = Math.min(0.08, Math.max(0.005, (amplitudeVpp || 10) / 120));
    let oscType = 'sine';
    if (waveform === 'square') oscType = 'square';
    else if (waveform === 'triangle') oscType = 'triangle';
    else if (waveform === 'ramp') oscType = 'sawtooth';
    else if (waveform === 'dc') {
      this.stopFunctionGeneratorTone();
      return;
    }

    try {
      if (!this.fgOsc || !this.isFgRunning) {
        this.fgOsc = this.ctx.createOscillator();
        this.fgGain = this.ctx.createGain();
        this.fgOsc.type = oscType;
        this.fgOsc.frequency.setValueAtTime(audibleFreq, this.ctx.currentTime);
        this.fgGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.fgOsc.connect(this.fgGain);
        this.fgGain.connect(this.ctx.destination);
        this.fgOsc.start();
      } else {
        this.fgOsc.type = oscType;
        this.fgOsc.frequency.setTargetAtTime(audibleFreq, this.ctx.currentTime, 0.04);
      }
      this.fgGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.04);
      this.isFgRunning = true;
    } catch (e) {
      // Audio node lifecycle safety
    }
  }

  stopFunctionGeneratorTone() {
    if (this.fgGain && this.ctx) {
      try {
        this.fgGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      } catch (e) {}
    }
    this.isFgRunning = false;
  }

  playBuzzer(freq = 950) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playBurn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Immediately stop all speech synthesis / voice offers
    this.stopSpeech();

    const now = this.ctx.currentTime;

    // 1. Explosive Shockwave Transient (Supersonic package crack)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(450, now);
    snapOsc.frequency.exponentialRampToValueAtTime(35, now + 0.18);
    snapGain.gain.setValueAtTime(0.75, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.19);

    // 2. Low-Frequency Subwoofer Explosion Thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.5);
    subGain.gain.setValueAtTime(0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.51);

    // 3. Electrical Arc Blast & Sizzle Shower
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.7);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.6);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  playReplace() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Pleasant mechanical click/wrench repair sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(300, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(600, now + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.09);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.2);
  }

  // Cartoon Crying Sob / Overvoltage Panic Whine
  playCry() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Two descending sobbing vibrato waves (wah-wah)
    [0, 0.18, 0.36].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + offset;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600 - idx * 60, t);
      osc.frequency.exponentialRampToValueAtTime(320 - idx * 40, t + 0.16);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  // Cheerful Chirp / Delight sound when component is happy
  playHappy() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [659.25, 880, 1174.66].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // Cute Character Talk Blip (like Animal Crossing / cartoon talk blip)
  playTalk(pitch = 1.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = 420 * pitch;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Web Speech API Text-To-Speech for Character Stories and Warnings
  speak(text, pitch = 1.25, rate = 1.05) {
    if (this.muted) return;
    if (!window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const cleanedText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[★☆✨⚡💥🔥😭💔]/g, '').trim();
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.pitch = Math.max(0.6, Math.min(1.8, pitch));
      utterance.rate = Math.max(0.8, Math.min(1.3, rate));
      utterance.volume = 0.9;

      // Prefer friendly english voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha')));
        if (preferred) utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  }

  stopSpeech() {
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}

window.sounds = new SoundEffects();
