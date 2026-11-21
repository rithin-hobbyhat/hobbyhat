/**
 * Task 3: Contamination Detective
 * - Single unified window (NO box effect, NO partitions)
 * - Realistic open-top collection bin viewing angle
 * - Items inside are pure physical waste objects
 * - Seamless detective telemetry
 */

class ContaminationDetectiveMode {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentCaseIndex = 0;
    this.cases = [
      {
        id: 'case_blue_recycling',
        binType: 'Curbside Blue Recycling Bin',
        binColor: '#1565c0',
        icon: '♻️',
        description: 'Find and extract the 3 dangerous contaminants that will ruin the dry paper and plastic batch!',
        items: [
          { id: 'c_clean_can', name: 'Clean Soda Can', icon: '🥫', isContaminant: false, note: 'Belongs here! Clean aluminum is 100% recyclable.' },
          { id: 'c_paper', name: 'Clean Newspaper', icon: '📰', isContaminant: false, note: 'Belongs here! Clean paper makes great recycled pulp.' },
          { id: 'c_box', name: 'Flattened Box', icon: '📦', isContaminant: false, note: 'Belongs here! Flattened cardboard saves truck space.' },
          { id: 'c_clean_bottle', name: 'Rinsed Water Bottle', icon: '🧴', isContaminant: false, note: 'Belongs here! Clear PET plastic is easily re-melted.' },
          // Contaminants:
          {
            id: 'c_greasy_pizza',
            name: 'Greasy Pizza Box',
            icon: '🍕',
            isContaminant: true,
            reason: 'Food oil soaks into paper fibers, preventing them from bonding during paper recycling!'
          },
          {
            id: 'c_battery',
            name: 'Dead AA Battery',
            icon: '🔋',
            isContaminant: true,
            reason: 'Batteries get crushed inside paper compactors and spark catastrophic recycling plant fires!'
          },
          {
            id: 'c_needle',
            name: 'Loose Injection Syringe',
            icon: '💉',
            isContaminant: true,
            reason: 'Needles in recycling bins severely injure sanitation workers sorting items along conveyor belts!'
          }
        ]
      },
      {
        id: 'case_green_compost',
        binType: 'Green Municipal Compost Bin',
        binColor: '#2e7d32',
        icon: '🌱',
        description: 'Extract the 3 non-compostable contaminants before the organic soil batch is ruined!',
        items: [
          { id: 'c_banana', name: 'Banana Peel', icon: '🍌', isContaminant: false, note: 'Belongs here! Great source of potassium for garden soil.' },
          { id: 'c_apple', name: 'Apple Core', icon: '🍏', isContaminant: false, note: 'Belongs here! Decomposes into rich organic loam.' },
          { id: 'c_leaves', name: 'Garden Leaves', icon: '🍂', isContaminant: false, note: 'Belongs here! Brown leaves balance compost moisture.' },
          { id: 'c_teabag', name: 'Pure Tea Leaves', icon: '🫖', isContaminant: false, note: 'Belongs here! Organic herbs enrich soil microbes.' },
          // Contaminants:
          {
            id: 'c_plastic_bag',
            name: 'Single-Use Plastic Bag',
            icon: '🛍️',
            isContaminant: true,
            reason: 'Plastic bags never break down in compost and shred into toxic microplastics that poison worms!'
          },
          {
            id: 'c_metal_tin',
            name: 'Steel Soup Can',
            icon: '🥫',
            isContaminant: true,
            reason: 'Steel does not decompose in compost piles and can cut gardeners and farming machinery.'
          },
          {
            id: 'c_glass_shard',
            name: 'Broken Glass Tumbler',
            icon: '🍸',
            isContaminant: true,
            reason: 'Glass does not rot and creates dangerous sharp shards that injure farmers handling the soil!'
          }
        ]
      }
    ];

    this.removedContaminants = new Set();
  }

  init() {
    this.render();
    this.loadCase(0);
  }

  render() {
    this.container.innerHTML = `
      <div class="unified-play-stage">
        <!-- Minimal Top Controls Bar -->
        <div class="stage-top-bar">
          <div class="stage-headline">
            <span class="stage-cue" id="case-progress-label">Case 1 of 2</span>
          </div>
          <span class="purity-meter" id="purity-meter">Purity: 55%</span>
        </div>

        <!-- Center Stage: Unified Single Window -->
        <div class="unified-item-arena">
          <div class="item-floating-hud">
            <h3 class="floating-item-title" id="bin-title">Inspecting Bin...</h3>
            <p class="floating-item-hint" id="hud-item-desc">Drag or tap wrongly placed contaminants from inside the bin to the Quarantine Station.</p>
          </div>

          <div class="detective-unified-stage">
            <!-- Open Bin Cavity (Looking right inside the bin) -->
            <div class="open-bin-cavity-wrap" id="bin-window">
              <div class="bin-cavity-rim">
                <span>PEERING INSIDE BIN CAVITY</span>
              </div>
              <div class="real-bin-interior-cavity-borderless" id="bin-items-field">
                <!-- Pure physical waste objects rendered here -->
              </div>
            </div>

            <!-- Seamless Quarantine Drop Tray -->
            <div class="quarantine-seamless-tray" id="quarantine-station">
              <div class="quarantine-tag">🚯 HAZARD QUARANTINE</div>
              <div class="quarantine-items-list-seamless" id="quarantine-list">
                <!-- Extracted contaminants placed here -->
              </div>
            </div>
          </div>

          <div class="floating-drag-instruction">
            <span>👇 Drag contaminants from the bin cavity into the Quarantine zone</span>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    DragEngine.registerDropZones('#quarantine-station');
    DragEngine.setDropHandler((itemData, targetZoneEl, sourceEl) => {
      this.handleQuarantineExtraction(itemData, sourceEl);
    });

    const quarantineZone = this.container.querySelector('#quarantine-station');
    quarantineZone.addEventListener('click', () => {
      DragEngine.handleDropZoneClick(quarantineZone);
    });
  }

  loadCase(caseIdx) {
    this.currentCaseIndex = caseIdx;
    this.removedContaminants.clear();
    const activeCase = this.cases[this.currentCaseIndex];

    this.container.querySelector('#case-progress-label').textContent = `Case ${this.currentCaseIndex + 1} of ${this.cases.length}`;
    this.container.querySelector('#bin-title').textContent = `${activeCase.icon} ${activeCase.binType}`;
    this.container.querySelector('#hud-item-desc').textContent = activeCase.description;

    this.renderBinItems();
    this.updatePurity();
  }

  renderBinItems() {
    const activeCase = this.cases[this.currentCaseIndex];
    const field = this.container.querySelector('#bin-items-field');
    const quarantineList = this.container.querySelector('#quarantine-list');
    field.innerHTML = '';
    quarantineList.innerHTML = '';

    activeCase.items.forEach(item => {
      if (this.removedContaminants.has(item.id)) return;

      const itemEl = document.createElement('div');
      itemEl.className = 'bin-interior-waste-object';
      itemEl.id = `inspect-${item.id}`;
      itemEl.innerHTML = `
        <div class="cavity-shadow"></div>
        <div class="cavity-waste-emoji">${item.icon}</div>
      `;

      itemEl.addEventListener('mouseenter', () => this.updateScanner(item));
      itemEl.addEventListener('click', () => {
        this.updateScanner(item);
        this.handleQuarantineExtraction(item, itemEl);
      });

      field.appendChild(itemEl);
      DragEngine.makeDraggable(itemEl, item);
    });
  }

  updateScanner(item) {
    if (!item) return;
    this.container.querySelector('#hud-item-desc').textContent = item.isContaminant ? 
      `🚨 ${item.name}: ${item.reason}` : 
      `✅ ${item.name}: ${item.note}`;
  }

  handleQuarantineExtraction(item, itemEl) {
    if (this.removedContaminants.has(item.id)) return;

    if (item.isContaminant) {
      AudioPlayer.dropSuccess();
      this.removedContaminants.add(item.id);
      const pts = State.addScore(100);

      const quarantineList = this.container.querySelector('#quarantine-list');
      const qEl = document.createElement('div');
      qEl.className = 'quarantined-item-card fade-in-scale';
      qEl.innerHTML = `
        <span class="q-icon">${item.icon}</span>
        <div class="q-info">
          <strong>${item.name} (Quarantined!)</strong>
          <p>${item.reason}</p>
        </div>
      `;
      quarantineList.prepend(qEl);
      // Clean contaminant extraction without details toast box

      this.renderBinItems();
      this.updatePurity();
      this.checkCaseCompletion();
    } else {
      AudioPlayer.errorBuzz();
      State.recordMistake(false);
      showToast(`⚠️ Wait! ${item.name} belongs here! ${item.note}`, 'warning');
      if (itemEl) {
        itemEl.classList.add('shake-error');
        setTimeout(() => itemEl.classList.remove('shake-error'), 600);
      }
    }
  }

  updatePurity() {
    const activeCase = this.cases[this.currentCaseIndex];
    const totalContaminants = activeCase.items.filter(i => i.isContaminant).length;
    const removedCount = this.removedContaminants.size;
    const purity = Math.round(55 + (removedCount / totalContaminants) * 45);

    const purityEl = this.container.querySelector('#purity-meter');
    purityEl.textContent = `Purity: ${purity}%`;
    if (purity === 100) {
      purityEl.classList.add('purity-perfect');
    }
  }

  checkCaseCompletion() {
    const activeCase = this.cases[this.currentCaseIndex];
    const totalContaminants = activeCase.items.filter(i => i.isContaminant).length;

    if (this.removedContaminants.size === totalContaminants) {
      AudioPlayer.levelUp();
      State.addStars(2);
      State.state.contaminationRoundsPassed++;

      if (this.currentCaseIndex + 1 < this.cases.length) {
        showToast('🎉 Batch Cleaned! Moving to next case...', 'success');
        setTimeout(() => {
          this.loadCase(this.currentCaseIndex + 1);
        }, 1500);
      } else {
        State.unlockBadge('contamination_sleuth');
        this.finishAllCases();
      }
    }
  }

  finishAllCases() {
    const field = this.container.querySelector('#bin-items-field');
    field.innerHTML = `
      <div class="round-finish-trophy">🕵️‍♂️</div>
      <div style="text-align: center; color: #ffffff;">
        <h3 style="font-size: 1.4rem; font-family: var(--font-display);">All Batches Cleaned & Certified!</h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 4px;">You stopped dangerous contaminants from ruining the city's recycling and composting lines.</p>
        <button class="btn btn-primary btn-large" id="btn-replay-detective" style="margin-top: 14px;">
          🔄 Play Detective Again
        </button>
      </div>
    `;

    field.querySelector('#btn-replay-detective').addEventListener('click', () => {
      this.loadCase(0);
    });
  }
}
