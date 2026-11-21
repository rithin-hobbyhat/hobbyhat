/**
 * Eco-Town Visualizer for how2bin
 * Shows the town thriving as kids properly bin waste and practice 5S
 */

class EcoTownManager {
  constructor(containerEl) {
    this.container = containerEl;
  }

  render() {
    const level = State.state.ecoTownLevel;
    const score = State.state.score;
    const stars = State.state.stars;

    const townLevels = [
      {
        level: 1,
        title: 'Level 1: Rookie Sorting Depot',
        desc: 'A humble neighborhood depot beginning its journey towards zero-waste.',
        unlocked: ['Basic Sorting Bins', 'Manual Tongs Station'],
        nextReq: 'Earn 300 Eco-Points to upgrade to Green Village!',
        skyColor: 'linear-gradient(to bottom, #90caf9, #e0f2fe)',
        groundEmoji: '🏚️ 🪣 📦'
      },
      {
        level: 2,
        title: 'Level 2: Green Garden Village',
        desc: 'Compost is enriching community gardens and the local stream is flowing clear!',
        unlocked: ['Compost Flower Beds', 'Clean Creek Sanctuary', 'Cardboard Baler'],
        nextReq: 'Earn 800 Eco-Points to upgrade to Thriving Eco-Town!',
        skyColor: 'linear-gradient(to bottom, #81d4fa, #e8f5e9)',
        groundEmoji: '🏡 🌻 🍃 🦆 🌲'
      },
      {
        level: 3,
        title: 'Level 3: Thriving Eco-Town',
        desc: 'Solar roofs and wind turbines power our zero-emission recycling lines!',
        unlocked: ['Wind Energy Mill', 'Solar Panels', 'Toy Repair Hub', 'E-Waste Recovery Lab'],
        nextReq: 'Earn 1500 Eco-Points to reach Clean Metropolis!',
        skyColor: 'linear-gradient(to bottom, #4fc3f7, #c8e6c9)',
        groundEmoji: '🏢 🌾 💨 ☀️ 🚴 🐝'
      },
      {
        level: 4,
        title: 'Level 4: Spotless Zero-Waste Metropolis',
        desc: 'A world-class clean city! Zero landfill waste, 100% circular safety standards.',
        unlocked: ['Full 5S Hospital Clinic', 'Puncture-Proof Sharps System', 'Circular Upcycling Plaza'],
        nextReq: 'Maximum Level Achieved! You are a Legendary Eco-Guardian!',
        skyColor: 'linear-gradient(to bottom, #29b6f6, #a5d6a7)',
        groundEmoji: '🏙️ 🌳 🚊 🕊️ 🌈 🚴‍♂️ 🌿'
      }
    ];

    const currentTown = townLevels[level - 1] || townLevels[0];

    this.container.innerHTML = `
      <div class="eco-town-view">
        <div class="mode-header">
          <div class="mode-title-group">
            <h2>🌍 Your Growing Eco-Town</h2>
            <p class="mode-subtitle">Every correct item sorted, needle secured, and surface cleaned helps your town blossom!</p>
          </div>
          <div class="town-level-badge">
            <span>Town Status: <strong>${currentTown.title}</strong></span>
          </div>
        </div>

        <!-- Visual Town Panorama -->
        <div class="town-panorama-card" style="background: ${currentTown.skyColor}">
          <div class="sun-orb">☀️</div>
          <div class="town-clouds">☁️ &nbsp; &nbsp; ☁️</div>
          <div class="town-landscape-elements">
            <div class="landscape-ground">
              <span class="landscape-emojis">${currentTown.groundEmoji}</span>
            </div>
          </div>
        </div>

        <!-- Town Status & Milestones -->
        <div class="town-details-grid">
          <div class="town-card">
            <h3>🌱 Community Achievements</h3>
            <p>${currentTown.desc}</p>
            <ul class="town-perks-list">
              ${currentTown.unlocked.map(p => `<li>✅ ${p}</li>`).join('')}
            </ul>
            <div class="town-next-milestone">
              <strong>Next Goal:</strong> ${currentTown.nextReq}
            </div>
          </div>

          <div class="town-card">
            <h3>🏅 Your Badges & Honors</h3>
            <div class="badges-grid-display">
              ${this.renderBadges()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderBadges() {
    const badges = [
      { key: 'sharps_protector', icon: '🛡️', name: 'Sharps Hero', desc: 'Handled needles & medicines with 100% tongs safety' },
      { key: 'compost_hero', icon: '🌱', name: 'Compost Champion', desc: 'Diverted organic food scraps into rich soil' },
      { key: 'contamination_sleuth', icon: '🕵️', name: 'Contamination Buster', desc: 'Extracted dangerous items from mixed bins' },
      { key: 'five_s_master', icon: '🏅', name: '5S Grandmaster', desc: 'Completed all 5 stages of the 5S method' },
      { key: 'repair_wizard', icon: '🛠️', name: 'Repair Wizard', desc: 'Upcycled & fixed toys instead of throwing them away' },
      { key: 'eco_legend', icon: '👑', name: 'Eco Legend', desc: 'Built the Spotless Zero-Waste Metropolis' }
    ];

    return badges.map(b => {
      const isUnlocked = State.state.badges[b.key];
      return `
        <div class="badge-item-box ${isUnlocked ? 'badge-earned' : 'badge-locked'}">
          <span class="badge-emoji">${b.icon}</span>
          <strong>${b.name}</strong>
          <small>${b.desc}</small>
          <span class="badge-status-tag">${isUnlocked ? 'EARNED' : 'LOCKED'}</span>
        </div>
      `;
    }).join('');
  }
}
