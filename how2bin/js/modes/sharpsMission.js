/**
 * Task 2: Indian Biomedical Waste Standard Mission
 *
 * Implements the official Indian Biomedical Waste Color Standard:
 * 1. Yellow: Human anatomical waste, soiled waste (blood-soaked cotton, gauze, dressings),
 *    microbiological/lab cultures, chemical waste, and expired or discarded medicines.
 * 2. Red: Recyclable contaminated plastics (IV sets, tubing, catheters, syringes without needles,
 *    used gloves, specimen containers).
 * 3. White (Translucent): Puncture-proof container for metallic sharps (needles, syringes with fixed
 *    needles, scalpels, blades, lancets).
 * 4. Blue: Glassware (vials, ampoules, broken or unbroken glass slides) and metallic body implants.
 *
 * Features:
 * - Identical 3D wheelie bins with upward lifting lids on drop matching Task 1 format
 * - Pure draggable physical hospital items in center stage
 * - Clear 1-sentence educational feedback on mistakes
 * - Automatic progression to Task 3 (Contamination Detective) upon completion
 */

const HOSPITAL_WASTE_ITEMS = [
  // 1. YELLOW BIN: Anatomical, Soiled, Lab Cultures, Chemical, Expired Medicines
  {
    id: 'bmw_blood_cotton',
    name: 'Blood-Soaked Cotton & Gauze',
    targetBin: 'bmw_yellow',
    icon: '🩸',
    description: 'Cotton swabs soaked with blood from wound cleaning.',
    isHazardous: true,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_red: 'Red bin is only for recyclable plastics, not blood-soaked soiled cotton!',
      bmw_white: 'White container is strictly for metallic sharps (needles & blades)!',
      bmw_blue: 'Blue bin is strictly for glassware and orthopedic implants!'
    }
  },
  {
    id: 'bmw_iv_tubing',
    name: 'Used IV Drip Tubing & Set',
    targetBin: 'bmw_red',
    icon: '🩺',
    description: 'Contaminated plastic intravenous infusion tubing.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'IV plastic tubing belongs in the Red Bin for polymer recycling, not yellow incineration!',
      bmw_white: 'White container is only for sharp metallic needles and blades!',
      bmw_blue: 'Blue container is for glass vials and metallic implants, not flexible plastic tubing!'
    }
  },
  {
    id: 'bmw_hypodermic_needle',
    name: 'Used Hypodermic Injection Needle',
    targetBin: 'bmw_white',
    icon: '🪡',
    description: 'Metallic sharp needle. Severe puncture hazard!',
    isHazardous: true,
    requiresTongs: true,
    incorrectFeedback: {
      bmw_yellow: 'Needles will puncture yellow bags! Put them in the puncture-proof White Container.',
      bmw_red: 'Never put metallic sharps into Red plastic recycling bags! Use the White Container.',
      bmw_blue: 'Blue bin is for glassware and implants. Sharps belong in the White Container!'
    }
  },
  {
    id: 'bmw_glass_ampoule',
    name: 'Glass Medicine Ampoule',
    targetBin: 'bmw_blue',
    icon: '🧪',
    description: 'Snapped glass injection ampoule with sharp glass edges.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'Broken/unbroken glassware belongs in the Blue Bin, not Yellow!',
      bmw_red: 'Glass is not recyclable plastic! Put medicine ampoules in the Blue Bin.',
      bmw_white: 'White container is for metallic sharps; glass ampoules go into the Blue Bin!'
    }
  },

  // Second Batch
  {
    id: 'bmw_soiled_dressing',
    name: 'Post-Surgery Soiled Dressing',
    targetBin: 'bmw_yellow',
    icon: '🩹',
    description: 'Surgical wound dressing stained with bodily fluids.',
    isHazardous: true,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_red: 'Soiled wound dressings belong in the Yellow Bin for safe incineration, not plastics!',
      bmw_white: 'White container is only for puncture-causing metallic sharps!',
      bmw_blue: 'Blue bin is for glass vials, ampoules, and implants!'
    }
  },
  {
    id: 'bmw_syringe_no_needle',
    name: 'Plastic Syringe (Without Needle)',
    targetBin: 'bmw_red',
    icon: '💉',
    description: 'Contaminated plastic syringe barrel with the needle safely detached.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'Needleless plastic syringes go into the Red Bin for plastics recycling!',
      bmw_white: 'The needle has been detached, so this plastic barrel belongs in Red, not White Sharps!',
      bmw_blue: 'Blue bin is for glassware, not plastic syringe barrels!'
    }
  },
  {
    id: 'bmw_scalpel_blade',
    name: 'Surgical Scalpel Blade',
    targetBin: 'bmw_white',
    icon: '🗡️',
    description: 'Razor-sharp surgical steel blade removed after operation.',
    isHazardous: true,
    requiresTongs: true,
    incorrectFeedback: {
      bmw_yellow: 'Blades tear through yellow bags! Always drop in the puncture-proof White Container.',
      bmw_red: 'Red bin is for recyclable plastics, never for razor-sharp surgical blades!',
      bmw_blue: 'White container is the certified puncture-proof box for scalpel blades!'
    }
  },
  {
    id: 'bmw_glass_vial',
    name: 'Empty Glass Vaccine Vial',
    targetBin: 'bmw_blue',
    icon: '🫙',
    description: 'Empty borosilicate glass vial from antibiotic or vaccine injection.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'Glass vials belong in the Blue Bin for glass recycling and chemical disinfection!',
      bmw_red: 'Glass vials are not plastic! Place them in the Blue Bin.',
      bmw_white: 'White container is for metallic needles; glass vials belong in Blue!'
    }
  },

  // Third Batch
  {
    id: 'bmw_expired_medicine',
    name: 'Expired Antibiotic Syrup & Pills',
    targetBin: 'bmw_yellow',
    icon: '💊',
    description: 'Expired pharmaceutical drugs and discarded antibiotics.',
    isHazardous: true,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_red: 'Expired medicines are chemical hazards and belong in the Yellow Bin, not plastics!',
      bmw_white: 'White container is only for metallic needles and blades!',
      bmw_blue: 'Blue bin is for glassware and implants, not pharmaceutical pills!'
    }
  },
  {
    id: 'bmw_latex_gloves',
    name: 'Used Examination Latex Gloves',
    targetBin: 'bmw_red',
    icon: '🧤',
    description: 'Contaminated examination and surgical rubber gloves.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'Contaminated gloves are recyclable polymers and belong in the Red Bin!',
      bmw_white: 'Gloves are not metallic sharps! They belong in the Red Bin.',
      bmw_blue: 'Blue container is strictly for glassware and metallic implants!'
    }
  },
  {
    id: 'bmw_fixed_syringe',
    name: 'Fixed-Needle Auto-Disable Syringe',
    targetBin: 'bmw_white',
    icon: '💉',
    description: 'Vaccine syringe with non-detachable metallic needle.',
    isHazardous: true,
    requiresTongs: true,
    incorrectFeedback: {
      bmw_yellow: 'Syringes with fixed needles must go into the puncture-proof White Container!',
      bmw_red: 'Because the needle cannot be detached, it cannot go in Red! Use White Container.',
      bmw_blue: 'White container protects workers from fixed needle punctures!'
    }
  },
  {
    id: 'bmw_microscope_slides',
    name: 'Microscope Glass Slides',
    targetBin: 'bmw_blue',
    icon: '🔬',
    description: 'Glass diagnostic pathology slides.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'Glass slides belong in the Blue Bin for glassware!',
      bmw_red: 'Glassware must go to Blue Bin, never in Red plastics!',
      bmw_white: 'White container is for metallic sharps; glassware belongs in Blue.'
    }
  },

  // Fourth Batch
  {
    id: 'bmw_lab_culture',
    name: 'Microbiology Lab Culture Plate',
    targetBin: 'bmw_yellow',
    icon: '🧫',
    description: 'Diagnostic specimen dish containing infectious bacterial colonies.',
    isHazardous: true,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_red: 'Microbiological cultures must be incinerated/autoclaved via the Yellow Bin!',
      bmw_white: 'White container is only for sharp metallic objects!',
      bmw_blue: 'Blue bin is for glass and body implants!'
    }
  },
  {
    id: 'bmw_catheter_bag',
    name: 'Urine Drainage Bag & Catheter',
    targetBin: 'bmw_red',
    icon: '👝',
    description: 'Plastic urine collection bag and silicone catheter.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'Plastic drainage bags belong in the Red Bin for decontamination and plastic recycling!',
      bmw_white: 'White bin is for metallic sharps only!',
      bmw_blue: 'Blue bin is for glass bottles, ampoules, and implants!'
    }
  },
  {
    id: 'bmw_blood_lancet',
    name: 'Finger-Prick Blood Lancet',
    targetBin: 'bmw_white',
    icon: '📍',
    description: 'Metallic prick needle used in capillary blood testing.',
    isHazardous: true,
    requiresTongs: true,
    incorrectFeedback: {
      bmw_yellow: 'Lancets are sharp puncture hazards! Always place into the White Container.',
      bmw_red: 'Metallic sharps are prohibited in the Red Bin! Use White Container.',
      bmw_blue: 'Blue is for glass and implants; metallic lancets go into the White Container.'
    }
  },
  {
    id: 'bmw_bone_screw',
    name: 'Titanium Orthopedic Bone Implant',
    targetBin: 'bmw_blue',
    icon: '🔩',
    description: 'Metallic orthopedic bone screw removed during surgery.',
    isHazardous: false,
    requiresTongs: false,
    incorrectFeedback: {
      bmw_yellow: 'Metallic body implants belong in the Blue Bin, not Yellow!',
      bmw_red: 'Metal implants are not plastic! Put in the Blue Bin.',
      bmw_white: 'White container is for needles & cutting blades; metallic implants go to Blue.'
    }
  }
];

class SharpsSafetyMissionMode {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentItem = null;
    this.itemQueue = [];
    this.tongsEquipped = false;
  }

  init() {
    this.render();
    this.startMission();
  }

  render() {
    this.container.innerHTML = `
      <div class="unified-play-stage">
        <!-- Stage Top Bar -->
        <div class="stage-top-bar">
          <div class="stage-headline">
            <span class="stage-cue" id="bmw-queue-count">Hospital Waste 1 of 8</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-bmw-tongs" title="Equip virtual safety tongs">
            <span class="btn-icon">🗜️</span> <span id="bmw-tongs-label">Equip Safety Tongs</span>
          </button>
        </div>

        <!-- Center Stage: Draggable Hospital Waste Item -->
        <div class="unified-item-arena">
          <div class="item-floating-hud">
            <h3 class="floating-item-title" id="bmw-item-title">Loading Hospital Waste...</h3>
          </div>

          <!-- Pure Draggable Hospital Waste Item -->
          <div class="pure-waste-spot" id="bmw-staging-area">
            <!-- Rendered dynamically -->
          </div>

          <div class="floating-drag-instruction">
            <span>👇 Drag item into matching biomedical bin below</span>
          </div>
        </div>

        <!-- 4 Indian Biomedical Waste Bins (Yellow, Red, White, Blue) -->
        <div class="bins-floor-row" id="bmw-bins-container">
          <!-- Rendered dynamically matching Task 1 3D wheelie bins -->
        </div>
      </div>
    `;

    this.renderBins();
    this.bindEvents();
  }

  renderBins() {
    const binsContainer = this.container.querySelector('#bmw-bins-container');
    binsContainer.innerHTML = '';

    const bins = (typeof BIOMEDICAL_BINS_DATA !== 'undefined') ? BIOMEDICAL_BINS_DATA : {
      bmw_yellow: { id: 'bmw_yellow', shortName: 'Yellow Bin', color: '#d97706' },
      bmw_red: { id: 'bmw_red', shortName: 'Red Bin', color: '#dc2626' },
      bmw_white: { id: 'bmw_white', shortName: 'White Bin', color: '#e2e8f0' },
      bmw_blue: { id: 'bmw_blue', shortName: 'Blue Bin', color: '#2563eb' }
    };

    Object.values(bins).forEach(bin => {
      const binItem = document.createElement('div');
      binItem.className = 'real-bin-natural-item';
      binItem.dataset.binId = bin.id;
      binItem.style.setProperty('--bin-accent', bin.color);

      // Compact white box with bold black title only
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
    const tongsBtn = this.container.querySelector('#btn-bmw-tongs');
    tongsBtn?.addEventListener('click', () => {
      this.toggleTongs();
    });

    DragEngine.setDropHandler((itemData, targetZoneEl, sourceEl) => {
      const targetBinId = targetZoneEl.dataset.binId;
      this.handleDrop(itemData, targetBinId, sourceEl);
    });
  }

  toggleTongs(forcedState = null) {
    this.tongsEquipped = (forcedState !== null) ? forcedState : !this.tongsEquipped;
    const tongsBtn = this.container.querySelector('#btn-bmw-tongs');
    const label = this.container.querySelector('#bmw-tongs-label');

    if (tongsBtn && label) {
      if (this.tongsEquipped) {
        tongsBtn.classList.add('btn-tongs-active');
        tongsBtn.style.background = '#15803d';
        tongsBtn.style.color = '#ffffff';
        label.textContent = 'Safety Tongs EQUIPPED';
        AudioPlayer.tongsClack();
        showToast('🗜️ Safety Tongs Equipped! Metallic sharps can now be grabbed safely.', 'info');
      } else {
        tongsBtn.classList.remove('btn-tongs-active');
        tongsBtn.style.background = '';
        tongsBtn.style.color = '';
        label.textContent = 'Equip Safety Tongs';
      }
    }
  }

  startMission() {
    // Shuffle and pick 8 hospital wastes for this session
    this.itemQueue = [...HOSPITAL_WASTE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 8);
    this.totalInQueue = this.itemQueue.length;
    this.itemsSortedCount = 0;
    this.tongsEquipped = false;
    this.loadNextItem();
  }

  loadNextItem() {
    if (this.itemQueue.length === 0) {
      this.finishMission();
      return;
    }

    this.currentItem = this.itemQueue.shift();
    this.itemsSortedCount++;

    const countEl = this.container.querySelector('#bmw-queue-count');
    if (countEl) {
      countEl.textContent = `Hospital Waste ${this.itemsSortedCount} of ${this.totalInQueue}`;
    }

    const titleEl = this.container.querySelector('#bmw-item-title');
    if (titleEl) {
      titleEl.textContent = this.currentItem.name;
    }

    const stagingArea = this.container.querySelector('#bmw-staging-area');
    stagingArea.innerHTML = '';

    const wasteToken = document.createElement('div');
    wasteToken.className = 'pure-physical-waste-token';
    wasteToken.id = `waste-item-${this.currentItem.id}`;
    wasteToken.innerHTML = `
      <div class="waste-shadow-disc"></div>
      <div class="physical-waste-graphic">${this.currentItem.icon}</div>
    `;

    wasteToken.addEventListener('click', () => {
      DragEngine.handleItemClick(wasteToken, this.currentItem);
    });

    stagingArea.appendChild(wasteToken);
    DragEngine.makeDraggable(wasteToken, this.currentItem);
  }

  handleDrop(item, targetBinId, itemEl) {
    if (!item) return;

    // Safety tongs requirement check for metallic sharps
    if (item.requiresTongs && !this.tongsEquipped) {
      AudioPlayer.warningSiren();
      State.recordMistake(true);
      showSafetyModal(
        '⚠️ Sharp Metal Hazard: Use Safety Tongs!',
        `You attempted to handle "${item.name}" bare-handed! In hospitals, injection needles and surgical scalpels can cause dangerous needle-stick injuries. Always use Safety Tongs or Droppers!`,
        'Never touch needles, syringes with fixed needles, or scalpels bare-handed!'
      );
      this.toggleTongs(true);
      return;
    }

    // Check if placed in correct biomedical bin
    if (item.targetBin === targetBinId) {
      AudioPlayer.dropSuccess();

      // Lift the lid upward on the target bin
      const targetBinEl = this.container.querySelector(`.real-bin-natural-item[data-bin-id="${targetBinId}"]`);
      if (targetBinEl) {
        targetBinEl.classList.add('lid-opening');
        setTimeout(() => {
          targetBinEl.classList.remove('lid-opening');
        }, 650);
      }

      const pts = State.addScore(100);
      showToast(`+${pts} Points! Correctly placed in ${targetBinEl?.querySelector('.bin-clean-name')?.textContent || 'Bin'}!`, 'success');

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

      const targetBinName = (typeof BIOMEDICAL_BINS_DATA !== 'undefined' && BIOMEDICAL_BINS_DATA[item.targetBin])
        ? BIOMEDICAL_BINS_DATA[item.targetBin].name
        : item.targetBin;

      const feedback = item.incorrectFeedback[targetBinId] ||
        `Hospital waste error: That item belongs in the ${targetBinName}!`;

      showToast(`❌ ${feedback}`, 'error');

      if (itemEl) {
        itemEl.classList.add('shake-error');
        setTimeout(() => itemEl.classList.remove('shake-error'), 600);
      }
    }
  }

  finishMission() {
    AudioPlayer.levelUp();
    State.addStars(3);
    State.unlockBadge('sharps_protector');
    State.state.sharpsMissionPassed = true;
    State.checkEcoTownProgression();

    const stagingArea = this.container.querySelector('#bmw-staging-area');
    const floatingHud = this.container.querySelector('.item-floating-hud');

    stagingArea.innerHTML = `
      <div class="round-finish-trophy">🏥</div>
    `;

    floatingHud.innerHTML = `
      <h3 class="floating-item-title" style="color: #4ade80;">Task 2 Complete! 🎉</h3>
      <p style="color: #e2e8f0; font-size: 0.95rem; margin: 4px 0;">Indian Biomedical Waste Expert! All hospital wastes correctly segregated.</p>
      <div class="summary-stats-inline" style="display: flex; gap: 8px; justify-content: center; margin: 8px 0;">
        <span class="stat-pill-inline" style="background: #ffffff; color: #000; font-weight: 800; padding: 4px 10px; border-radius: 6px;">⭐ +3 Stars</span>
        <span class="stat-pill-inline" style="background: #ffffff; color: #000; font-weight: 800; padding: 4px 10px; border-radius: 6px;">🎯 ${State.getAccuracy()}% Accuracy</span>
      </div>
      <button class="btn btn-primary btn-large" id="btn-start-task-3" style="margin-top: 10px; background: #16a34a; color: #fff; font-weight: 800; border-radius: 8px; padding: 8px 16px; border: none; cursor: pointer;">
        🚀 Start Task 3: Contamination Detective
      </button>
    `;

    const startTask3Btn = floatingHud.querySelector('#btn-start-task-3');
    const transitionTimer = setTimeout(() => {
      if (window.how2binApp) {
        window.how2binApp.switchMode('contamination');
      }
    }, 2000);

    startTask3Btn.addEventListener('click', () => {
      clearTimeout(transitionTimer);
      if (window.how2binApp) {
        window.how2binApp.switchMode('contamination');
      }
    });
  }
}
