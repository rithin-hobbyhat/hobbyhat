/**
 * Task 1: Bin Match & Prep Rush
 * - Single unified window with NO partitions or box frames
 * - Bins stand freely on the floor as realistic 3D bins without box cards around them
 * - Clean item presentation with seamless floating info & prep controls
 * - Direct drag and drop into any bin with auto-prep support
 */

class PrepRushMode {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentItem = null;
    this.itemQueue = [];
    this.tongsEquipped = false;
    this.preppedStatus = {}; // { itemId: true }
  }

  init() {
    this.render();
    this.startRound();
  }

  render() {
    this.container.innerHTML = `
      <!-- Single Unified Window (No Partitions, No Split Cards) -->
      <div class="unified-play-stage">
        <!-- Minimal Top Controls Bar -->
        <div class="stage-top-bar">
          <div class="stage-headline">
            <span class="stage-cue" id="queue-count">Item 1 of 8</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-toggle-tongs" title="Equip virtual safety tongs">
            <span class="btn-icon">🗜️</span> <span id="tongs-btn-label">Equip Safety Tongs</span>
          </button>
        </div>

        <!-- Center Stage: Pure Waste Object (No Cluttered Description Boxes, No Yellow Boxes) -->
        <div class="unified-item-arena">
          <div class="item-floating-hud">
            <h3 class="floating-item-title" id="item-title">Loading Waste...</h3>
          </div>

          <!-- Pure Draggable Waste Item (Stands freely in center stage) -->
          <div class="pure-waste-spot" id="staging-area">
            <!-- Pure draggable physical waste item placed here -->
          </div>

          <div class="floating-drag-instruction">
            <span>👇 Drag item into matching bin below</span>
          </div>
        </div>

        <!-- Real Waste Bins Floor (Tightly spaced for smartphone vertical play) -->
        <div class="bins-floor-row" id="bins-container">
          <!-- Realistic SVGs rendered freely with no box cards -->
        </div>
      </div>
    `;

    this.renderBins();
    this.bindEvents();
  }

  renderBins() {
    const binsContainer = this.container.querySelector('#bins-container');
    binsContainer.innerHTML = '';

    Object.values(BINS_DATA).forEach(bin => {
      const binItem = document.createElement('div');
      binItem.className = 'real-bin-natural-item';
      binItem.dataset.binId = bin.id;
      binItem.style.setProperty('--bin-accent', bin.color);

      // Compact white box with bold black title only (no cluttering description boxes)
      binItem.innerHTML = `
        <div class="bin-svg-chassis" data-drop-target="${bin.id}">
          ${getRealisticBinSvg(bin.id)}
          <div class="bin-ground-shadow"></div>
        </div>
        <div class="bin-clean-label">
          <span class="bin-clean-name">${bin.shortName || bin.name}</span>
        </div>
      `;

      // Allow click for tap-to-select fallback
      binItem.addEventListener('click', () => {
        DragEngine.handleDropZoneClick(binItem);
      });

      binsContainer.appendChild(binItem);
    });

    DragEngine.registerDropZones('.real-bin-natural-item');
  }

  bindEvents() {
    const tongsBtn = this.container.querySelector('#btn-toggle-tongs');
    tongsBtn.addEventListener('click', () => {
      this.toggleTongs();
    });

    DragEngine.setDropHandler((itemData, targetZoneEl, sourceEl) => {
      const binItem = targetZoneEl.closest('[data-bin-id]') || targetZoneEl.closest('[data-drop-target]') || targetZoneEl;
      const binId = binItem.dataset.binId || binItem.dataset.dropTarget || binItem.getAttribute('data-drop-target');
      this.handleBinDrop(itemData, binId, sourceEl);
    });
  }

  toggleTongs(forceState = null) {
    this.tongsEquipped = forceState !== null ? forceState : !this.tongsEquipped;
    const tongsBtn = this.container.querySelector('#btn-toggle-tongs');
    const label = this.container.querySelector('#tongs-btn-label');

    if (this.tongsEquipped) {
      tongsBtn.classList.add('btn-active');
      label.textContent = 'Safety Tongs EQUIPPED';
      AudioPlayer.tongsClack();
      showToast('🗜️ Safety Tongs Equipped! You can safely handle sharps & chemicals.', 'info');
    } else {
      tongsBtn.classList.remove('btn-active');
      label.textContent = 'Equip Safety Tongs';
    }
  }

  startRound() {
    const shuffled = [...WASTE_ITEMS].sort(() => 0.5 - Math.random());
    this.itemQueue = shuffled.slice(0, 8);
    this.loadNextItem();
  }

  loadNextItem() {
    if (this.itemQueue.length === 0) {
      this.finishRound();
      return;
    }

    this.currentItem = this.itemQueue.shift();
    const remaining = 8 - this.itemQueue.length;
    this.container.querySelector('#queue-count').textContent = `Item ${remaining} of 8`;

    this.renderCurrentItem();
  }

  renderCurrentItem() {
    const stagingArea = this.container.querySelector('#staging-area');
    const titleEl = this.container.querySelector('#item-title');
    const hintEl = this.container.querySelector('#item-hint');

    const item = this.currentItem;
    const isPrepped = !!this.preppedStatus[item.id];

    stagingArea.innerHTML = '';

    // Update Floating Title (Crisp, clean, no yellow boxes)
    titleEl.textContent = item.name;
    if (hintEl) hintEl.textContent = item.hint;

    // Pure Physical Waste Token
    const physicalWaste = document.createElement('div');
    physicalWaste.className = `pure-physical-waste-token ${item.isHazardous ? 'hazard-waste' : ''} ${isPrepped ? 'prepped-waste' : ''}`;
    physicalWaste.id = `waste-${item.id}`;

    physicalWaste.innerHTML = `
      <div class="waste-shadow-disc"></div>
      <div class="physical-waste-graphic">${item.icon}</div>
      <div class="waste-interact-glow"></div>
    `;

    stagingArea.appendChild(physicalWaste);
    DragEngine.makeDraggable(physicalWaste, item);
  }

  performPrepAction(item, physicalWasteEl) {
    AudioPlayer.prepAction();
    this.preppedStatus[item.id] = true;

    if (item.prepRequired === 'tongs' && !this.tongsEquipped) {
      this.toggleTongs(true);
    }

    if (item.prepRequired === 'repair') {
      AudioPlayer.repair();
      State.state.repairsCompleted++;
      State.unlockBadge('repair_wizard');
      State.addScore(100, true);
    }

    if (physicalWasteEl) {
      physicalWasteEl.classList.add('prep-success-bounce');
    }
  }

  handleBinDrop(item, targetBinId, itemEl) {
    if (!targetBinId) return;

    // Check if the item matches targetBin or accepted alternative real-world bins
    const validBins = [item.targetBin];
    if (Array.isArray(item.acceptedBins)) {
      validBins.push(...item.acceptedBins);
    }
    if (item.category === 'red') validBins.push('red');
    if (item.id === 'injection_needle' || item.id === 'blood_lancet') {
      validBins.push('black', 'red');
    }
    if (item.id === 'snotty_tissue' || item.id === 'cotton_swab') {
      validBins.push('red', 'green', 'black');
    }
    if (item.id === 'used_bandaid' || item.id === 'blood_bandage' || item.id === 'sanitary_napkin' || item.id === 'baby_diaper') {
      validBins.push('red', 'black');
    }
    if (item.id === 'tea_bag') {
      validBins.push('green');
    }
    if (item.id === 'broken_plastic_ruler' || item.id === 'empty_glue_stick' || item.id === 'chocolate_foil_wrapper') {
      validBins.push('blue', 'black');
    }
    if (item.id === 'broken_headphones' || item.id === 'broken_calculator' || item.id === 'frayed_charger_cable' || item.id === 'desk_lamp_bulb' || item.id === 'kids_fever_syrup') {
      validBins.push('black', 'blue', 'red');
    }

    const isMatch = validBins.includes(targetBinId);

    if (isMatch) {
      // Auto-equip tongs if required
      if (item.requiresTongs && !this.tongsEquipped) {
        this.toggleTongs(true);
        AudioPlayer.tongsClack();
      }

      // Auto-prep if needed
      let bonusPoints = 0;
      if (item.prepRequired && !this.preppedStatus[item.id]) {
        this.preppedStatus[item.id] = true;
        if (item.prepRequired === 'repair') {
          AudioPlayer.repair();
          State.state.repairsCompleted++;
          State.unlockBadge('repair_wizard');
          bonusPoints = 80;
        } else {
          AudioPlayer.prepAction();
        }
      } else if (this.preppedStatus[item.id]) {
        bonusPoints = 30; // Manual prep bonus
      }

      // Success drop!
      // Lift the bin top upward smoothly as waste is put inside
      const binZone = this.container.querySelector(`.real-bin-natural-item[data-bin-id="${targetBinId}"]`);
      if (binZone) {
        binZone.classList.add('bin-drop-open');
        setTimeout(() => binZone.classList.remove('bin-drop-open'), 800);
      }

      AudioPlayer.dropSuccess();
      const finalPts = State.addScore(item.points + bonusPoints);
      showSparkles(itemEl || this.container);
      // Clean drop without intrusive details toast box

      if (item.category === 'organic') {
        State.unlockBadge('compost_hero');
      }

      if (itemEl) {
        itemEl.classList.add('fall-into-bin');
      }

      setTimeout(() => {
        this.loadNextItem();
      }, 700);
    } else {
      // Incorrect bin: educational feedback
      AudioPlayer.errorBuzz();
      State.recordMistake(item.isHazardous);

      const feedback = item.incorrectFeedback[targetBinId] ||
        `That item belongs in the ${BINS_DATA[item.targetBin].name}, not here!`;

      showToast(`❌ ${feedback}`, 'error');

      if (itemEl) {
        itemEl.classList.add('shake-error');
        setTimeout(() => itemEl.classList.remove('shake-error'), 600);
      }
    }
  }

  finishRound() {
    AudioPlayer.levelUp();
    State.addStars(2);
    State.checkEcoTownProgression();

    const stagingArea = this.container.querySelector('#staging-area');
    const floatingHud = this.container.querySelector('.item-floating-hud');

    stagingArea.innerHTML = `
      <div class="round-finish-trophy">🏆</div>
    `;

    floatingHud.innerHTML = `
      <h3 class="floating-item-title" style="color: #4ade80;">Task 1 Complete! 🎉</h3>
      <p style="color: #e2e8f0; font-size: 0.95rem; margin: 4px 0;">All items sorted! Advancing to Task 2: Biomedical Waste...</p>
      <div class="summary-stats-inline" style="display: flex; gap: 8px; justify-content: center; margin: 8px 0;">
        <span class="stat-pill-inline" style="background: #ffffff; color: #000; font-weight: 800; padding: 4px 10px; border-radius: 6px;">⭐ +2 Stars</span>
        <span class="stat-pill-inline" style="background: #ffffff; color: #000; font-weight: 800; padding: 4px 10px; border-radius: 6px;">🎯 ${State.getAccuracy()}% Accuracy</span>
      </div>
      <button class="btn btn-primary btn-large" id="btn-next-batch" style="margin-top: 10px; background: #16a34a; color: #fff; font-weight: 800; border-radius: 8px; padding: 8px 16px; border: none; cursor: pointer;">
        🚀 Start Task 2: Biomedical Waste Now
      </button>
    `;

    const startTask2Btn = floatingHud.querySelector('#btn-next-batch');
    const transitionTimer = setTimeout(() => {
      if (window.how2binApp) {
        window.how2binApp.switchMode('sharps_mission');
      }
    }, 1800);

    startTask2Btn.addEventListener('click', () => {
      clearTimeout(transitionTimer);
      if (window.how2binApp) {
        window.how2binApp.switchMode('sharps_mission');
      }
    });
  }
}
