/**
 * Game State Management for how2bin
 * Tracks scores, stars, safety shield, badges, and eco-town upgrades
 * Persists progress in localStorage with export/reset options
 */

class GameState {
  constructor() {
    this.storageKey = 'how2bin_save_v1';
    this.listeners = [];
    this.resetToDefaults();
    this.load();
  }

  resetToDefaults() {
    this.state = {
      score: 0,
      stars: 0,
      safetyShield: 100, // 0 - 100%
      hazardMistakes: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      streak: 0,
      maxStreak: 0,
      currentMode: 'prep_rush',
      prepRushLevel: 1,
      sharpsMissionPassed: false,
      contaminationRoundsPassed: 0,
      fiveSCompletedStages: [],
      itemsProcessed: 0,
      repairsCompleted: 0,
      badges: {
        sharps_protector: false,
        compost_hero: false,
        contamination_sleuth: false,
        five_s_master: false,
        repair_wizard: false,
        eco_legend: false
      },
      ecoTownLevel: 1
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state);
  }

  notify() {
    this.save();
    this.listeners.forEach(cb => cb(this.state));
  }

  addScore(points, isBonus = false) {
    const multiplier = 1 + Math.min(Math.floor(this.state.streak / 3) * 0.2, 1.0);
    const finalPoints = Math.round(points * multiplier);
    this.state.score += finalPoints;
    this.state.itemsProcessed++;
    this.state.correctAttempts++;
    this.state.totalAttempts++;
    this.state.streak++;
    if (this.state.streak > this.state.maxStreak) {
      this.state.maxStreak = this.state.streak;
    }

    // Boost safety shield slowly back up
    if (this.state.safetyShield < 100) {
      this.state.safetyShield = Math.min(100, this.state.safetyShield + 5);
    }

    this.checkEcoTownProgression();
    this.notify();
    return finalPoints;
  }

  recordMistake(isHazardous = false) {
    this.state.totalAttempts++;
    this.state.streak = 0;
    if (isHazardous) {
      this.state.hazardMistakes++;
      this.state.safetyShield = Math.max(0, this.state.safetyShield - 25);
    }
    this.notify();
  }

  addStars(count = 1) {
    this.state.stars += count;
    this.checkEcoTownProgression();
    this.notify();
  }

  unlockBadge(badgeKey) {
    if (!this.state.badges[badgeKey]) {
      this.state.badges[badgeKey] = true;
      this.state.stars += 3;
      this.state.score += 150;
      AudioPlayer.badgeEarned();
      this.notify();
      return true;
    }
    return false;
  }

  checkEcoTownProgression() {
    let newLevel = 1;
    if (this.state.score >= 1500 || this.state.stars >= 15) {
      newLevel = 4; // Clean Metropolis
    } else if (this.state.score >= 800 || this.state.stars >= 8) {
      newLevel = 3; // Thriving Eco-Town
    } else if (this.state.score >= 300 || this.state.stars >= 3) {
      newLevel = 2; // Green Village
    }

    if (newLevel > this.state.ecoTownLevel) {
      this.state.ecoTownLevel = newLevel;
      AudioPlayer.levelUp();
      if (newLevel === 4) {
        this.unlockBadge('eco_legend');
      }
    }
  }

  getAccuracy() {
    if (this.state.totalAttempts === 0) return 100;
    return Math.round((this.state.correctAttempts / this.state.totalAttempts) * 100);
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      // Local storage not available or full
    }
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.state = Object.assign({}, this.state, parsed);
      }
    } catch (e) {
      console.warn('Could not load saved state', e);
    }
  }

  resetProgress() {
    this.resetToDefaults();
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {}
    this.notify();
  }
}

const State = new GameState();
