/**
 * Task 4: 5S Practice Section
 * 5 Dedicated interactive stages:
 * 1. Seiri (Sort unneeded/expired clutter)
 * 2. Seiton (Set in Order / shadow-board station arrangement)
 * 3. Seiso (Shine / interactive sponge scrubbing of spills & dust)
 * 4. Seiketsu (Standardize / match official pictograms & color rules)
 * 5. Shitsuke (Sustain / daily 5-point workplace eco audit)
 */

class FiveSMode {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentStageIdx = 0;
    this.stageState = {};
  }

  init() {
    this.render();
    this.loadStage(0);
  }

  render() {
    this.container.innerHTML = `
      <!-- 5S Stage Navigation Tabs -->
      <div class="five-s-nav-row" id="five-s-tabs">
        ${FIVE_S_STAGES.map((stg, i) => `
          <button class="five-s-tab-btn ${i === 0 ? 'active' : ''}" data-stage-idx="${i}">
            <span class="stg-num">${stg.number}S</span>
            <span class="stg-name">${stg.english}</span>
          </button>
        `).join('')}
      </div>

      <!-- Stage Active Play Arena -->
      <div class="five-s-stage-arena" id="stage-arena">
        <!-- Rendered dynamically per stage -->
      </div>
    `;

    this.bindTabEvents();
  }

  bindTabEvents() {
    this.container.querySelectorAll('.five-s-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.stageIdx, 10);
        this.loadStage(idx);
      });
    });
  }

  updateTabs(activeIdx) {
    this.container.querySelectorAll('.five-s-tab-btn').forEach((btn, i) => {
      if (i === activeIdx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  loadStage(idx) {
    this.currentStageIdx = idx;
    this.updateTabs(idx);
    const stage = FIVE_S_STAGES[idx];

    const arena = this.container.querySelector('#stage-arena');
    arena.innerHTML = `
      <div class="stage-banner-header">
        <div class="banner-title-box">
          <span class="stg-badge-pill">${stage.japanese} - ${stage.subtitle}</span>
          <h3>${stage.number}S: ${stage.english}</h3>
          <p class="stg-motto">"${stage.motto}"</p>
        </div>
        <p class="stg-instructions">👉 <strong>How to play:</strong> ${stage.instructions}</p>
      </div>
      <div class="stage-interactive-body" id="stage-body"></div>
    `;

    const body = arena.querySelector('#stage-body');

    switch (stage.id) {
      case 'seiri':
        this.renderStage1Seiri(body, stage);
        break;
      case 'seiton':
        this.renderStage2Seiton(body, stage);
        break;
      case 'seiso':
        this.renderStage3Seiso(body, stage);
        break;
      case 'seiketsu':
        this.renderStage4Seiketsu(body, stage);
        break;
      case 'shitsuke':
        this.renderStage5Shitsuke(body, stage);
        break;
    }
  }

  // ==========================================
  // STAGE 1: SEIRI (SORT / RED TAG)
  // ==========================================
  renderStage1Seiri(body, stage) {
    const itemsRemaining = [...stage.items];
    let storedCount = 0;
    let discardedCount = 0;

    body.innerHTML = `
      <div class="seiri-layout">
        <!-- Items to Evaluate Tray -->
        <div class="seiri-tray">
          <div class="seiri-tray-header">
            <h4>📦 Items to Evaluate (<span id="seiri-remaining-count">${itemsRemaining.length}</span> remaining)</h4>
            <p class="seiri-tray-hint">Place wanted tools onto the <strong>Workshop Shelf</strong>; discard clutter into the <strong>Trashbin</strong>.</p>
          </div>
          <div class="seiri-items-list" id="seiri-list"></div>
        </div>

        <!-- Drop Destinations: Workshop Shelf & Red-Tag Trashbin -->
        <div class="seiri-stations-col">
          <!-- 1. WORKSHOP SHELF (WANTED ITEMS) -->
          <div class="seiri-station-card seiri-shelf-station" id="seiri-shelf" data-seiri-target="keep">
            <div class="station-header">
              <div class="station-title-row">
                <span class="station-icon">🛠️</span>
                <div>
                  <h4 class="station-title">Workshop Tool Shelf</h4>
                  <span class="station-sub">Store & organize essential tools</span>
                </div>
              </div>
              <span class="shelf-badge" id="shelf-badge">0 / 4 Stored</span>
            </div>

            <!-- Realistic Shelf Tiers -->
            <div class="workshop-shelf-unit">
              <div class="shelf-tier shelf-tier-upper">
                <div class="shelf-tier-label">Top Shelf (Inspection & Sorting Tools)</div>
                <div class="shelf-tier-slots" id="shelf-slots-1">
                  <div class="shelf-slot-placeholder"><span class="slot-dot">▪</span> Empty Slot</div>
                  <div class="shelf-slot-placeholder"><span class="slot-dot">▪</span> Empty Slot</div>
                </div>
                <div class="shelf-plank"></div>
              </div>
              <div class="shelf-tier shelf-tier-lower">
                <div class="shelf-tier-label">Bottom Shelf (Safety Gear & Labels)</div>
                <div class="shelf-tier-slots" id="shelf-slots-2">
                  <div class="shelf-slot-placeholder"><span class="slot-dot">▪</span> Empty Slot</div>
                  <div class="shelf-slot-placeholder"><span class="slot-dot">▪</span> Empty Slot</div>
                </div>
                <div class="shelf-plank"></div>
              </div>
            </div>

            <div class="station-drop-zone shelf-drop-target">
              📥 Drop Wanted Tools Here (Workshop Shelf)
            </div>
          </div>

          <!-- 2. RED-TAG TRASHBIN (UNWANTED ITEMS) -->
          <div class="seiri-station-card seiri-trashbin-station" id="seiri-trashbin" data-seiri-target="discard">
            <div class="station-header">
              <div class="station-title-row">
                <span class="station-icon">🗑️</span>
                <div>
                  <h4 class="station-title">Red-Tag Discard Trashbin</h4>
                  <span class="station-sub">Dispose damaged, expired & hazardous clutter</span>
                </div>
              </div>
              <span class="trashbin-badge" id="trashbin-badge">0 / 4 Discarded</span>
            </div>

            <!-- Realistic Red-Tag Trashbin Graphic -->
            <div class="trashbin-station-graphic">
              <div class="trashbin-lid-assembly" id="trashbin-lid">
                <div class="trashbin-lid-handle"></div>
                <div class="trashbin-lid-cover"></div>
              </div>
              <div class="trashbin-body-canister">
                <div class="trashbin-red-tag">RED TAG<br>CLUTTER</div>
                <div class="trashbin-canister-symbol">⚠️ 🗑️</div>
              </div>
              <div class="trashbin-wheel-base">
                <div class="trashbin-wheel"></div>
                <div class="trashbin-axle"></div>
                <div class="trashbin-wheel"></div>
              </div>
            </div>

            <div class="station-drop-zone trashbin-drop-target">
              ⬇️ Drop Clutter / Hazards Here (Trashbin)
            </div>
          </div>
        </div>
      </div>
    `;

    const list = body.querySelector('#seiri-list');
    const remainingCountEl = body.querySelector('#seiri-remaining-count');
    const shelfBadge = body.querySelector('#shelf-badge');
    const trashbinBadge = body.querySelector('#trashbin-badge');
    const trashbinLid = body.querySelector('#trashbin-lid');

    itemsRemaining.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'seiri-item-card';
      itemEl.id = `seiri-${item.id}`;
      itemEl.innerHTML = `
        <span class="seiri-icon">${item.icon}</span>
        <strong>${item.name}</strong>
      `;

      list.appendChild(itemEl);
      DragEngine.makeDraggable(itemEl, item);
    });

    DragEngine.registerDropZones('.seiri-station-card');
    DragEngine.setDropHandler((itemData, targetZoneEl, sourceEl) => {
      const card = targetZoneEl.closest('.seiri-station-card') || targetZoneEl;
      const targetType = card.dataset.seiriTarget;
      const isCorrect = (targetType === 'keep' && itemData.isNeeded) || (targetType === 'discard' && !itemData.isNeeded);

      if (isCorrect) {
        AudioPlayer.dropSuccess();
        State.addScore(50);
        showToast(`🌟 Correct! ${itemData.reason}`, 'success');
        if (sourceEl) sourceEl.remove();

        if (targetType === 'keep') {
          storedCount++;
          shelfBadge.textContent = `${storedCount} / 4 Stored`;
          // Place item onto shelf
          const placeholder = body.querySelector('.shelf-slot-placeholder');
          if (placeholder) {
            placeholder.outerHTML = `
              <div class="shelved-tool-item">
                <span>${itemData.icon}</span>
                <span>${itemData.name}</span>
              </div>
            `;
          }
        } else {
          discardedCount++;
          trashbinBadge.textContent = `${discardedCount} / 4 Discarded`;
          // Open trashbin lid animation
          if (trashbinLid) {
            trashbinLid.classList.add('lid-open');
            setTimeout(() => trashbinLid.classList.remove('lid-open'), 650);
          }
        }

        const remaining = list.querySelectorAll('.seiri-item-card').length;
        if (remainingCountEl) remainingCountEl.textContent = remaining;

        if (remaining === 0) {
          setTimeout(() => this.completeStage(stage), 700);
        }
      } else {
        AudioPlayer.errorBuzz();
        State.recordMistake(false);
        const errorAdvice = itemData.isNeeded 
          ? `❌ That's a useful tool! Place it on the Workshop Shelf.`
          : `❌ That's clutter/hazard! Discard it in the Red-Tag Trashbin.`;
        showToast(errorAdvice, 'error');
        if (sourceEl) {
          sourceEl.classList.add('shake-error');
          setTimeout(() => sourceEl.classList.remove('shake-error'), 600);
        }
      }
    });

    body.querySelectorAll('.seiri-station-card').forEach(box => {
      box.addEventListener('click', () => DragEngine.handleDropZoneClick(box));
    });
  }

  // ==========================================
  // STAGE 2: SEITON (SET IN ORDER)
  // ==========================================
  renderStage2Seiton(body, stage) {
    body.innerHTML = `
      <div class="seiton-layout">
        <div class="seiton-station-floor">
          <h4>Shadow Board Workstation Layout</h4>
          <div class="seiton-slots-grid" id="seiton-slots"></div>
        </div>

        <div class="seiton-staging-tray">
          <h4>Station Items to Place</h4>
          <div class="seiton-items-row" id="seiton-items"></div>
        </div>
      </div>
    `;

    const slotsGrid = body.querySelector('#seiton-slots');
    stage.slots.forEach(slot => {
      const slotEl = document.createElement('div');
      slotEl.className = 'seiton-slot-card';
      slotEl.dataset.slotId = slot.id;
      slotEl.dataset.expectedItem = slot.expectedId;
      slotEl.innerHTML = `
        <div class="slot-shadow-icon">${slot.icon}</div>
        <span class="slot-shadow-label">${slot.label}</span>
      `;
      slotsGrid.appendChild(slotEl);
    });

    const itemsRow = body.querySelector('#seiton-items');
    stage.draggableItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'seiton-draggable-item';
      itemEl.dataset.itemId = item.id;
      itemEl.style.borderColor = item.color;
      itemEl.innerHTML = `
        <span class="s-icon">${item.icon}</span>
        <span class="s-name">${item.name}</span>
      `;
      itemsRow.appendChild(itemEl);
      DragEngine.makeDraggable(itemEl, item);
    });

    DragEngine.registerDropZones('.seiton-slot-card');
    DragEngine.setDropHandler((itemData, targetZoneEl, sourceEl) => {
      const slot = targetZoneEl.closest('.seiton-slot-card') || targetZoneEl;
      const expected = slot.dataset.expectedItem;
      if (itemData.id === expected) {
        AudioPlayer.dropSuccess();
        State.addScore(60);
        targetZoneEl.classList.add('slot-filled');
        targetZoneEl.innerHTML = `
          <div class="slot-filled-icon">${itemData.icon}</div>
          <span class="slot-filled-label">✅ ${itemData.name}</span>
        `;
        if (sourceEl) sourceEl.remove();

        const remaining = itemsRow.querySelectorAll('.seiton-draggable-item').length;
        if (remaining === 0) {
          this.completeStage(stage);
        }
      } else {
        AudioPlayer.errorBuzz();
        State.recordMistake(false);
        showToast('❌ Not quite! Match each station item to its designated shadow outline.', 'error');
      }
    });

    body.querySelectorAll('.seiton-slot-card').forEach(slot => {
      slot.addEventListener('click', () => DragEngine.handleDropZoneClick(slot));
    });
  }

  // ==========================================
  // STAGE 3: SEISO (SHINE / CLEANING WITH MOUSE SPONGE)
  // ==========================================
  renderStage3Seiso(body, stage) {
    const stains = JSON.parse(JSON.stringify(stage.stains));
    let cleanedCount = 0;
    let lastAudioTime = 0;

    body.innerHTML = `
      <div class="seiso-layout">
        <div class="seiso-cleanliness-bar-card">
          <div class="clean-bar-header">
            <div class="clean-title-group">
              <span class="clean-icon">✨</span>
              <span class="clean-text">Counter Cleanliness & Safety Inspection:</span>
            </div>
            <strong id="clean-percent">0% Clean</strong>
          </div>
          <div class="clean-bar-track">
            <div class="clean-bar-fill" id="clean-fill" style="width: 0%"></div>
          </div>
          <div class="clean-instruction-hint">
            🧽 <strong>Move the sponge with your mouse (or drag/tap) over each stain</strong> to scrub the workbench spotless!
          </div>
        </div>

        <div class="seiso-table-surface" id="clean-table">
          <!-- Interactive Mouse-Controlled Sponge -->
          <div class="interactive-sponge" id="interactive-sponge" style="left: 50%; top: 50%;">
            <div class="sponge-body">
              <div class="sponge-foam-layer">
                <div class="sponge-pores">
                  <span class="pore"></span><span class="pore"></span><span class="pore"></span>
                  <span class="pore"></span><span class="pore"></span><span class="pore"></span>
                </div>
                <span class="sponge-label">🧽 SPONGE</span>
              </div>
              <div class="sponge-scour-layer"></div>
            </div>
          </div>

          <!-- Stains positioned here -->
        </div>
      </div>
    `;

    const table = body.querySelector('#clean-table');
    const spongeEl = body.querySelector('#interactive-sponge');
    const fill = body.querySelector('#clean-fill');
    const percentLabel = body.querySelector('#clean-percent');

    // Spawn suds / soap bubbles around the scrubbed spot
    const spawnBubbles = (cx, cy) => {
      for (let i = 0; i < 3; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'sponge-bubble-particle';
        const size = Math.floor(Math.random() * 10) + 8;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${cx + (Math.random() * 26 - 13)}px`;
        bubble.style.top = `${cy + (Math.random() * 18 - 9)}px`;
        bubble.style.setProperty('--bubble-dx', `${(Math.random() - 0.5) * 30}px`);
        bubble.style.setProperty('--bubble-dy', `${-12 - Math.random() * 20}px`);
        table.appendChild(bubble);
        setTimeout(() => bubble.remove(), 550);
      }
    };

    // Scrub handler for a given stain
    const scrubStain = (stain, stainEl, contactX, contactY) => {
      const now = Date.now();
      if (stain.scrubbed >= stain.required) return;
      if (stain.lastScrub && now - stain.lastScrub < 150) return;

      stain.lastScrub = now;
      stain.scrubbed++;

      spawnBubbles(contactX, contactY);

      if (now - lastAudioTime > 130) {
        AudioPlayer.spongeScrub();
        lastAudioTime = now;
      }

      spongeEl.classList.add('sponge-active-scrubbing');
      setTimeout(() => spongeEl.classList.remove('sponge-active-scrubbing'), 180);

      const remainingScrubs = stain.required - stain.scrubbed;
      stainEl.style.opacity = `${Math.max(0.15, remainingScrubs / stain.required)}`;
      stainEl.classList.add('scrub-wiggle');
      setTimeout(() => stainEl.classList.remove('scrub-wiggle'), 200);

      if (stain.scrubbed >= stain.required) {
        AudioPlayer.dropSuccess();
        stainEl.remove();
        cleanedCount++;
        showToast(`✨ ${stain.name} scrubbed clean!`, 'success');

        const progress = Math.round((cleanedCount / stains.length) * 100);
        fill.style.width = `${progress}%`;
        percentLabel.textContent = `${progress}% Clean`;

        if (cleanedCount === stains.length) {
          State.addScore(150);
          setTimeout(() => this.completeStage(stage), 700);
        }
      }
    };

    // Check collision between sponge center and all stains
    const checkCollisions = (spongeX, spongeY, rect) => {
      stains.forEach(stain => {
        if (stain.scrubbed >= stain.required) return;
        const stainCenterX = (stain.x / 100) * rect.width;
        const stainCenterY = (stain.y / 100) * rect.height;
        const dx = spongeX - stainCenterX;
        const dy = spongeY - stainCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const threshold = (stain.size / 2) + 38;

        if (dist < threshold) {
          const stainEl = table.querySelector(`#stain-${stain.id}`);
          if (stainEl) {
            scrubStain(stain, stainEl, stainCenterX, stainCenterY);
          }
        }
      });
    };

    // Move sponge with mouse or touch pointer
    const handlePointerMove = (e) => {
      const rect = table.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      if (!clientX && !clientY) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const clampedX = Math.max(38, Math.min(rect.width - 38, x));
      const clampedY = Math.max(26, Math.min(rect.height - 26, y));

      spongeEl.style.left = `${clampedX}px`;
      spongeEl.style.top = `${clampedY}px`;

      checkCollisions(clampedX, clampedY, rect);
    };

    table.addEventListener('pointermove', handlePointerMove);
    table.addEventListener('pointerdown', handlePointerMove);

    stains.forEach(stain => {
      const stainEl = document.createElement('div');
      stainEl.className = 'stain-spot';
      stainEl.id = `stain-${stain.id}`;
      stainEl.style.left = `${stain.x}%`;
      stainEl.style.top = `${stain.y}%`;
      stainEl.style.width = `${stain.size}px`;
      stainEl.style.height = `${stain.size}px`;
      stainEl.innerHTML = `<span class="stain-icon">${stain.icon}</span><span class="stain-label">${stain.name}</span>`;

      // Fallback click/tap on stain directly
      stainEl.addEventListener('click', (e) => {
        const rect = table.getBoundingClientRect();
        const stainCenterX = (stain.x / 100) * rect.width;
        const stainCenterY = (stain.y / 100) * rect.height;
        spongeEl.style.left = `${stainCenterX}px`;
        spongeEl.style.top = `${stainCenterY}px`;
        scrubStain(stain, stainEl, stainCenterX, stainCenterY);
      });

      table.appendChild(stainEl);
    });
  }

  // ==========================================
  // STAGE 4: SEIKETSU (STANDARDIZE / SYMBOLS)
  // ==========================================
  renderStage4Seiketsu(body, stage) {
    let matchedCount = 0;

    body.innerHTML = `
      <div class="seiketsu-layout">
        <div class="symbols-source-col">
          <h4>Visual Hazard & Waste Pictograms</h4>
          <div class="symbols-list" id="symbols-list"></div>
        </div>
        <div class="standards-target-col">
          <h4>Standardized Container Specifications</h4>
          <div class="standards-list" id="standards-list"></div>
        </div>
      </div>
    `;

    const symList = body.querySelector('#symbols-list');
    const stdList = body.querySelector('#standards-list');

    stage.matches.forEach(m => {
      const symEl = document.createElement('div');
      symEl.className = 'pictogram-card';
      symEl.dataset.matchId = m.id;
      symEl.innerHTML = `
        <span class="p-symbol">${m.symbol}</span>
        <strong>${m.symbolName}</strong>
      `;
      symList.appendChild(symEl);
      DragEngine.makeDraggable(symEl, m);

      const targetEl = document.createElement('div');
      targetEl.className = 'standard-slot-card';
      targetEl.dataset.targetId = m.id;
      targetEl.innerHTML = `
        <span class="target-title">🎯 ${m.targetLabel}</span>
        <p class="target-help">Drop matching hazard pictogram here</p>
      `;
      stdList.appendChild(targetEl);
    });

    DragEngine.registerDropZones('.standard-slot-card');
    DragEngine.setDropHandler((itemData, targetZoneEl, sourceEl) => {
      const card = targetZoneEl.closest('.standard-slot-card') || targetZoneEl;
      if (itemData.id === (card.dataset.targetId || card.getAttribute('data-target-id'))) {
        AudioPlayer.dropSuccess();
        State.addScore(75);
        matchedCount++;
        targetZoneEl.classList.add('standard-verified');
        targetZoneEl.innerHTML = `
          <div class="verified-head">${itemData.symbol} ${itemData.symbolName}</div>
          <p class="verified-desc">✅ Standard Verified: ${itemData.explanation}</p>
        `;
        if (sourceEl) sourceEl.remove();

        if (matchedCount === stage.matches.length) {
          this.completeStage(stage);
        }
      } else {
        AudioPlayer.errorBuzz();
        State.recordMistake(false);
        showToast('❌ Mismatch! Follow international color and symbol guidelines.', 'error');
      }
    });

    body.querySelectorAll('.standard-slot-card').forEach(slot => {
      slot.addEventListener('click', () => DragEngine.handleDropZoneClick(slot));
    });
  }

  // ==========================================
  // STAGE 5: SHITSUKE (SUSTAIN / AUDIT)
  // ==========================================
  renderStage5Shitsuke(body, stage) {
    let questionIdx = 0;
    const questions = stage.auditQuestions;

    const renderQuestion = () => {
      if (questionIdx >= questions.length) {
        State.unlockBadge('five_s_master');
        this.completeStage(stage);
        return;
      }

      const q = questions[questionIdx];
      body.innerHTML = `
        <div class="audit-card">
          <div class="audit-header">
            <span class="audit-step-tag">Checklist Item ${questionIdx + 1} of ${questions.length}</span>
            <h3>${q.title}</h3>
          </div>
          <p class="audit-question-text">"${q.question}"</p>
          <div class="audit-options-list">
            ${q.options.map((opt, i) => `
              <button class="btn btn-audit-option" data-opt-idx="${i}">
                ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      body.querySelectorAll('.btn-audit-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const opt = q.options[parseInt(btn.dataset.optIdx, 10)];
          if (opt.correct) {
            AudioPlayer.dropSuccess();
            State.addScore(50);
            showToast(`🌟 ${opt.feedback}`, 'success');
            questionIdx++;
            setTimeout(renderQuestion, 600);
          } else {
            AudioPlayer.errorBuzz();
            State.recordMistake(true);
            showToast(`❌ ${opt.feedback}`, 'error');
          }
        });
      });
    };

    renderQuestion();
  }

  completeStage(stage) {
    AudioPlayer.levelUp();
    State.addStars(2);
    if (!State.state.fiveSCompletedStages.includes(stage.id)) {
      State.state.fiveSCompletedStages.push(stage.id);
    }

    const arena = this.container.querySelector('#stage-arena');
    arena.innerHTML = `
      <div class="stage-complete-card">
        <div class="stg-trophy">✨</div>
        <h3>${stage.english} Stage Mastered!</h3>
        <p>You have demonstrated excellence in <strong>${stage.japanese}</strong>.</p>
        <div class="stg-badge-reward">
          <span>Earned: <strong>${stage.badge}</strong> (+2 Stars)</span>
        </div>
        <div class="stg-next-actions">
          ${this.currentStageIdx + 1 < FIVE_S_STAGES.length ? `
            <button class="btn btn-primary btn-large" id="btn-next-stg">
              ➡️ Proceed to ${FIVE_S_STAGES[this.currentStageIdx + 1].english} (${this.currentStageIdx + 2}S)
            </button>
          ` : `
            <button class="btn btn-primary btn-large" id="btn-replay-all-5s">
              🏅 Complete 5S Mastery Review
            </button>
          `}
        </div>
      </div>
    `;

    const nextBtn = arena.querySelector('#btn-next-stg');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.loadStage(this.currentStageIdx + 1);
      });
    }

    const replayBtn = arena.querySelector('#btn-replay-all-5s');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.loadStage(0);
      });
    }
  }
}
