// ElectroCraft Main Application Controller

class CircuitApp {
  constructor() {
    this.mode = 'curriculum'; // 'curriculum' or 'sandbox'
    this.currentLevelIndex = 0;
    this.components = [];
    this.wires = [];
    this.selectedComponent = null;

    this.activeWireColor = '#ff3b30'; // default red wire
    this.flowMode = 'conventional'; // 'conventional' | 'electrons' | 'off'
    this.showXRay = true;
    this.soundEnabled = true;

    this.solver = new window.CircuitSolver();
    this.wireDrag = null; // { fromComp, fromPin, startX, startY }
    this.compDrag = null; // { comp, offsetX, offsetY }
    this.rotateDrag = null; // { comp, cx, cy, startAngle, startMouseRad, startSnapshot }
    this.resizeDrag = null; // { comp, cx, cy, startDist, startScale, startSnapshot }
    this.techSpecsComp = null; // Active component open in technical specifications modal
    this.probeDrag = null; // { probe: 'red' | 'black', element, offsetX, offsetY }

    this.electronOffset = 0;
    this.levelCompleted = false;

    // Multimeter State
    this.multimeterActive = false;
    this.ohmsCalcActive = false;
    this.probes = {
      red: { x: 300, y: 120, snappedPin: null },
      black: { x: 340, y: 120, snappedPin: null }
    };

    // Undo / Redo History Stack
    this.history = [];
    this.future = [];
    this.isRestoringState = false;
    this.maxHistorySteps = 40;

    this.confettiParticles = [];
    this.advancedSidebarOpen = false;

    // Joule Heating & Thermal Camera Mode
    this.isThermalMode = false;
    this.thermalParticles = [];
    this.wireParticleOffsets = new Map();

    // Gaming Ground Zoom & Pan State (Only Circuit Canvas Zooms)
    this.stageZoom = 1.0;
    this.stagePanX = 0;
    this.stagePanY = 0;
    this.minZoom = 0.4;
    this.maxZoom = 2.6;
    this.isPinching = false;
    this.pinchStartDist = 0;
    this.pinchStartZoom = 1.0;
    this.pinchCenter = { x: 0, y: 0 };
    this.pinchStartPan = { x: 0, y: 0 };
    this.panDrag = null;
  }

  init() {
    this.cacheDom();
    this.setupCatalog();
    this.bindEvents();
    this.initConfetti();
    this.initTheme();
    this.initStudentView();
    const urlParams = new URLSearchParams(window.location.search);
    const hashMatch = window.location.hash.match(/level=(\d+)/);
    const lvlParam = urlParams.get('level') || (hashMatch ? hashMatch[1] : null);
    let startIdx = 0;
    const lvlList = window.GAME_LEVELS || window.LEVELS;
    if (lvlParam && lvlList) {
      const foundIdx = lvlList.findIndex(l => l.id === parseInt(lvlParam, 10));
      if (foundIdx >= 0) startIdx = foundIdx;
    }
    this.loadLevel(startIdx);
    this.toggleAdvancedSidebar(false);
    if (window.innerWidth <= 950) {
      this.setToolboxCollapsed(true);
    }
    this.startAnimationLoop();
  }

  cacheDom() {
    this.dom = {
      stage: document.getElementById('circuit-stage'),
      componentsContainer: document.getElementById('components-container'),
      wiresGroup: document.getElementById('wires-group'),
      tempWirePath: document.getElementById('temp-wire-path'),
      wiresLayer: document.getElementById('wires-layer'),

      // Header elements
      levelBadge: document.getElementById('level-badge-display'),
      levelTitleDisplay: document.getElementById('level-title-display'),
      levelDots: document.getElementById('level-progress-dots'),
      modeCurriculumBtn: document.getElementById('mode-curriculum-btn'),
      modeSandboxBtn: document.getElementById('mode-sandbox-btn'),

      // Tool buttons
      btnHint: document.getElementById('btn-hint'),
      btnAdvancedToggle: document.getElementById('btn-advanced-toggle'),
      btnEdgeAdvancedToggle: document.getElementById('btn-edge-advanced-toggle'),
      btnOhmsToggle: document.getElementById('btn-ohms-toggle'),
      btnAnalysisToggle: document.getElementById('btn-analysis-toggle'),
      btnThermalToggle: document.getElementById('btn-thermal-toggle'),
      btnMultimeterToggle: document.getElementById('btn-multimeter-toggle'),
      btnXrayToggle: document.getElementById('btn-xray-toggle'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),
      soundIcon: document.getElementById('sound-icon'),
      btnResetLevel: document.getElementById('btn-reset-level'),
      btnClearCanvas: document.getElementById('btn-clear-canvas'),
      btnStudentView: document.getElementById('btn-student-view'),
      studentViewIcon: document.getElementById('student-view-icon'),
      studentViewLabel: document.getElementById('student-view-label'),
      topbarCompPill: document.getElementById('topbar-comp-pill'),
      topbarCompSymBox: document.getElementById('topbar-comp-sym-box'),
      topbarCompName: document.getElementById('topbar-comp-name'),
      topbarCompBadgeType: document.getElementById('topbar-comp-badge-type'),
      topbarCompMetrics: document.getElementById('topbar-comp-metrics'),
      btnUndo: document.getElementById('btn-undo'),
      btnRedo: document.getElementById('btn-redo'),

      // Ohm's Law & Power Calculator
      ohmsCalcWindow: document.getElementById('ohms-calc-window'),
      ohmsDragHandle: document.getElementById('ohms-drag-handle'),
      btnOhmsClose: document.getElementById('btn-ohms-close'),
      tabOhmsLive: document.getElementById('tab-ohms-live'),
      tabOhmsGamer: document.getElementById('tab-ohms-gamer'),
      tabOhmsResistor: document.getElementById('tab-ohms-resistor'),
      panelOhmsLive: document.getElementById('panel-ohms-live'),
      panelOhmsGamer: document.getElementById('panel-ohms-gamer'),
      panelOhmsResistor: document.getElementById('panel-ohms-resistor'),
      ohmsResCurVal: document.getElementById('ohms-res-cur-val'),
      btnOhmsOpenFullResistor: document.getElementById('btn-ohms-open-full-resistor'),
      ohmsResStripesDisplay: document.getElementById('ohms-res-stripes-display'),
      ohmsResCodeDesc: document.getElementById('ohms-res-code-desc'),
      ohmsResChipsGrid: document.getElementById('ohms-res-chips-grid'),
      calcV: document.getElementById('calc-v'),
      calcI: document.getElementById('calc-i'),
      calcR: document.getElementById('calc-r'),
      calcP: document.getElementById('calc-p'),
      calcSubOhms: document.getElementById('calc-sub-ohms'),
      calcSubPower: document.getElementById('calc-sub-power'),
      gamerCalcV: document.getElementById('gamer-calc-v'),
      gamerCalcI: document.getElementById('gamer-calc-i'),
      gamerUnitI: document.getElementById('gamer-unit-i'),
      gamerCalcR: document.getElementById('gamer-calc-r'),
      gamerUnitR: document.getElementById('gamer-unit-r'),
      btnGamerSolve: document.getElementById('btn-gamer-solve'),
      btnGamerLoad: document.getElementById('btn-gamer-load'),
      btnGamerClear: document.getElementById('btn-gamer-clear'),
      gamerCalcResult: document.getElementById('gamer-calc-result'),
      gamerResBanner: document.getElementById('gamer-res-banner'),
      gamerResSteps: document.getElementById('gamer-res-steps'),
      gamerResPower: document.getElementById('gamer-res-power'),
      shortHazardBanner: document.getElementById('short-hazard-banner'),

      // Standard Resistor Values & Color Code Guide Modal
      btnResistorCodes: document.getElementById('btn-resistor-codes'),
      resistorCodesModal: document.getElementById('resistor-codes-modal'),
      btnCloseResistorCodes: document.getElementById('btn-close-resistor-codes'),
      btnCloseResistorCodesBottom: document.getElementById('btn-close-resistor-codes-bottom'),
      decoderBand1: document.getElementById('decoder-band-1'),
      decoderBand2: document.getElementById('decoder-band-2'),
      decoderBand3: document.getElementById('decoder-band-3'),
      decoderBand4: document.getElementById('decoder-band-4'),
      decoderValText: document.getElementById('decoder-val-text'),
      decoderCodeText: document.getElementById('decoder-code-text'),
      decoderTolText: document.getElementById('decoder-tol-text'),
      decoderResistorSvg: document.getElementById('decoder-resistor-svg'),
      resistorCatPills: document.getElementById('resistor-cat-pills'),
      resistorSearchInput: document.getElementById('resistor-search-input'),
      resistorValuesContainer: document.getElementById('resistor-values-container'),
      resistorModalTargetNotice: document.getElementById('resistor-modal-target-notice'),

      // Sidebar
      inspectorSidebar: document.getElementById('inspector-sidebar'),
      btnSidebarClose: document.getElementById('btn-sidebar-close'),
      catalog: document.getElementById('components-catalog'),
      colorSwatches: document.getElementById('color-swatches'),
      sidebarLevelTitle: document.getElementById('sidebar-level-title'),
      sidebarLevelDesc: document.getElementById('sidebar-level-desc'),
      taskChecklist: document.getElementById('task-checklist'),
      theoryTitle: document.getElementById('theory-title'),
      theoryContent: document.getElementById('theory-content'),

      // Inspector
      inspectorCard: document.getElementById('component-inspector'),
      inspIcon: document.getElementById('insp-icon'),
      inspName: document.getElementById('insp-name'),
      inspType: document.getElementById('insp-type'),
      inspDesc: document.getElementById('insp-desc'),
      inspControls: document.getElementById('insp-controls'),
      inspReplaceSelect: document.getElementById('insp-replace-select'),
      btnReplaceSelected: document.getElementById('btn-replace-selected'),
      btnRepairSelected: document.getElementById('btn-repair-selected'),
      btnDeleteSelected: document.getElementById('btn-delete-selected'),

      // Character Story & Personality
      inspCharStoryBox: document.getElementById('insp-character-story-box'),
      inspCharBadge: document.getElementById('insp-char-badge'),
      btnInspSpeakStory: document.getElementById('btn-insp-speak-story'),
      inspCharSuperpowerText: document.getElementById('insp-char-superpower-text'),
      inspCharStoryText: document.getElementById('insp-char-story-text'),
      inspCharRated: document.getElementById('insp-char-rated'),
      inspCharIdeal: document.getElementById('insp-char-ideal'),
      inspCharImportance: document.getElementById('insp-char-importance'),

      // Trash Drop Zone (drag-to-delete)
      trashDropZone: document.getElementById('trash-drop-zone'),

      // Circuit Ribbon
      statusRibbon: document.getElementById('circuit-status-ribbon'),
      statusDot: document.getElementById('status-dot'),
      statusHeadline: document.getElementById('status-headline'),
      statusDetail: document.getElementById('status-detail'),
      statusVoltage: document.getElementById('status-voltage'),

      // Multimeter
      multimeterRig: document.getElementById('multimeter-rig'),
      btnMmClose: document.getElementById('btn-mm-close'),
      mmValueDisplay: document.getElementById('mm-value-display'),
      mmStatusDisplay: document.getElementById('mm-status-display'),
      probeRed: document.getElementById('probe-red'),
      probeBlack: document.getElementById('probe-black'),

      // Burning Toast & Failure Modal
      burnToast: document.getElementById('burn-countdown-toast'),
      burnToastTitle: document.getElementById('burn-toast-component-title'),
      burnToastDesc: document.getElementById('burn-toast-desc'),
      burnProgressBar: document.getElementById('burn-progress-bar'),

      // Technical Specifications Data Sheet Modal
      techSpecsModal: document.getElementById('tech-specs-modal'),
      btnCloseTechSpecs: document.getElementById('btn-close-tech-specs-modal'),
      btnTechSpecsClose: document.getElementById('btn-tech-specs-close'),
      btnTechSpecsRotate: document.getElementById('btn-tech-specs-rotate'),
      techSpecsIcon: document.getElementById('tech-specs-icon'),
      techSpecsCategoryPill: document.getElementById('tech-specs-category-pill'),
      techSpecsStatusPill: document.getElementById('tech-specs-status-pill'),
      techSpecsIecPill: document.getElementById('tech-specs-iec-pill'),
      techSpecsTitle: document.getElementById('tech-specs-title'),
      techSpecsSubtitle: document.getElementById('tech-specs-subtitle'),
      techSpecsRatingsGrid: document.getElementById('tech-specs-ratings-grid'),
      techSpecsTelemetryGrid: document.getElementById('tech-specs-telemetry-grid'),
      techSpecsFormulaBox: document.getElementById('tech-specs-formula-box'),
      techSpecsGeometryRow: document.getElementById('tech-specs-geometry-row'),

      failureModal: document.getElementById('failure-modal'),
      btnCloseFailureModal: document.getElementById('btn-close-failure-modal'),
      faultIcon: document.getElementById('fault-icon'),
      faultCulpritPill: document.getElementById('fault-culprit-pill'),
      faultModalTitle: document.getElementById('fault-modal-title'),
      faultSubtitle: document.getElementById('fault-subtitle'),
      faultReasonText: document.getElementById('fault-reason-text'),
      faultWhyText: document.getElementById('fault-why-text'),
      faultRemedyText: document.getElementById('fault-remedy-text'),
      faultPrincipleTitle: document.getElementById('fault-principle-title'),
      faultEquationBadge: document.getElementById('fault-equation-badge'),
      btnReplaceFailedComp: document.getElementById('btn-replace-failed-comp'),
      btnFixCircuit: document.getElementById('btn-fix-circuit'),

      // Day / Dark Mode Theme
      btnThemeToggle: document.getElementById('btn-theme-toggle'),
      themeToggleIcon: document.getElementById('theme-toggle-icon'),
      themeToggleLabel: document.getElementById('theme-toggle-label'),

      // Fullscreen & Mobile Viewport Controls
      btnFullscreenToggle: document.getElementById('btn-fullscreen-toggle'),
      fullscreenIcon: document.getElementById('fullscreen-icon'),
      fullscreenLabel: document.getElementById('fullscreen-label'),
      btnEdgeToolboxToggle: document.getElementById('btn-edge-toolbox-toggle'),
      btnToolboxClose: document.getElementById('btn-toolbox-close'),
      toolboxSidebar: document.getElementById('toolbox-sidebar'),
      rotateOverlay: document.getElementById('rotate-device-overlay'),
      btnRotateFullscreen: document.getElementById('btn-rotate-fullscreen'),
      btnRotateDismiss: document.getElementById('btn-rotate-dismiss'),

      // Scalable Gaming Ground & Zoom HUD
      workbenchWorld: document.getElementById('workbench-world'),
      canvasZoomHud: document.getElementById('canvas-zoom-hud'),
      btnZoomIn: document.getElementById('btn-zoom-in'),
      btnZoomOut: document.getElementById('btn-zoom-out'),
      btnZoomReset: document.getElementById('btn-zoom-reset'),
      btnZoomFit: document.getElementById('btn-zoom-fit'),

      // Modals & Celebrations
      victoryModal: document.getElementById('victory-modal'),
      btnCloseVictory: document.getElementById('btn-close-victory'),
      btnMinimizeVictory: document.getElementById('btn-minimize-victory'),
      btnInspectWorkbench: document.getElementById('btn-inspect-workbench'),
      victoryMainTitle: document.getElementById('victory-main-title'),
      victoryLevelName: document.getElementById('victory-level-name'),
      victoryAppreciationText: document.getElementById('victory-appreciation-text'),
      analysisCircuitType: document.getElementById('analysis-circuit-type'),
      analysisVTotal: document.getElementById('analysis-v-total'),
      analysisITotal: document.getElementById('analysis-i-total'),
      analysisPTotal: document.getElementById('analysis-p-total'),
      analysisRTotal: document.getElementById('analysis-r-total'),
      analysisComponentsList: document.getElementById('analysis-components-list'),
      victoryTheory: document.getElementById('victory-theory'),
      btnReplayLevel: document.getElementById('btn-replay-level'),
      btnNextLevel: document.getElementById('btn-next-level'),
      nextTaskBtnText: document.getElementById('next-task-btn-text'),
      btnSkipTask: document.getElementById('btn-skip-task'),
      btnSkipTaskSidebar: document.getElementById('btn-skip-task-sidebar'),
      victoryCompactDock: document.getElementById('victory-compact-dock'),
      vDockLevelName: document.getElementById('v-dock-level-name'),
      btnDockTable: document.getElementById('btn-dock-table'),
      btnDockNext: document.getElementById('btn-dock-next'),
      btnDockClose: document.getElementById('btn-dock-close'),

      hintModal: document.getElementById('hint-modal'),
      btnCloseHint: document.getElementById('btn-close-hint'),
      btnGotIt: document.getElementById('btn-got-it'),
      hintModalTitle: document.getElementById('hint-modal-title'),
      hintModalContent: document.getElementById('hint-modal-content'),

      // Logic Gate Simulator Modal
      btnLogicSimToggle: document.getElementById('btn-logic-sim-toggle'),
      logicSimModal: document.getElementById('logic-sim-modal'),
      btnCloseLogicSim: document.getElementById('btn-close-logic-sim'),
      btnCloseLogicSimBottom: document.getElementById('btn-close-logic-sim-bottom'),
      btnSpawnLogicGate: document.getElementById('btn-spawn-logic-gate'),
      logicGateTabs: document.getElementById('logic-gate-tabs'),
      logicSimCanvasBox: document.getElementById('logic-sim-canvas-box'),
      logicSimEq: document.getElementById('logic-sim-eq'),
      logicSimDesc: document.getElementById('logic-sim-desc'),
      logicTruthTable: document.getElementById('logic-truth-table'),
      logicIcSpecsBox: document.getElementById('logic-ic-specs-box'),

      confettiCanvas: document.getElementById('confetti-canvas')
    };
  }

  setupCatalog() {
    if (!this.dom || !this.dom.catalog) return;
    // Filter out multimeter so it does not appear in the component box
    const list = Object.keys(window.COMPONENT_DEFINITIONS).filter(type => type !== 'multimeter');
    this.dom.catalog.innerHTML = '';

    list.forEach(type => {
      const def = window.COMPONENT_DEFINITIONS[type];
      const item = document.createElement('div');
      item.className = 'catalog-item';
      item.dataset.type = type;

      const thumbSvg = window.ComponentRenderer.renderCatalogThumbnail(type);
      const schemSvg = window.ComponentRenderer.getSchematicSymbol(type);

      item.innerHTML = `
        <div class="catalog-icon" title="${def.name}">
          ${thumbSvg}
        </div>
        <div class="catalog-details">
          <div class="catalog-name">
            <span>${def.name}</span>
            <span class="catalog-schematic-badge" title="Schematic Symbol">
              <svg width="24" height="15" viewBox="0 0 28 18">${schemSvg}</svg>
            </span>
          </div>
          <div class="catalog-type">${def.category.toUpperCase()}</div>
        </div>
        <div class="catalog-add-btn">+</div>
      `;

      item.addEventListener('click', () => {
        this.spawnComponent(type);
      });

      this.dom.catalog.appendChild(item);
    });
  }

  bindEvents() {
    // Mode Switcher
    if (this.dom.modeCurriculumBtn) this.dom.modeCurriculumBtn.addEventListener('click', () => this.setMode('curriculum'));
    if (this.dom.modeSandboxBtn) this.dom.modeSandboxBtn.addEventListener('click', () => this.setMode('sandbox'));

    // Sound toggle
    if (this.dom.btnSoundToggle) {
      this.dom.btnSoundToggle.addEventListener('click', () => {
        const isMuted = window.sounds.toggleMute();
        this.soundEnabled = !isMuted;
        if (this.dom.soundIcon) this.dom.soundIcon.textContent = isMuted ? '🔇' : '🔊';
        this.dom.btnSoundToggle.classList.toggle('active', !isMuted);
      });
    }

    // Flow Mode: Conventional Current (+ to -) vs Real Electron Flow (- to +) vs Off
    if (this.dom.btnXrayToggle) {
      this.dom.btnXrayToggle.addEventListener('click', () => this.cycleFlowMode());
    }

    // Sidebar & Panel Flow Mode Pill Selectors
    document.addEventListener('click', (e) => {
      const pill = e.target.closest('.flow-pill-btn');
      if (pill) {
        const mode = pill.getAttribute('data-flow-mode');
        if (mode) this.setFlowMode(mode);
      }
    });

    // Multimeter Toggle
    if (this.dom.btnMultimeterToggle) this.dom.btnMultimeterToggle.addEventListener('click', () => this.toggleMultimeter());
    if (this.dom.btnMmClose) this.dom.btnMmClose.addEventListener('click', () => this.toggleMultimeter(false));

    // Advanced Info Sidebar Toggle Events
    if (this.dom.btnAdvancedToggle) {
      this.dom.btnAdvancedToggle.addEventListener('click', () => this.toggleAdvancedSidebar());
    }
    if (this.dom.btnEdgeAdvancedToggle) {
      this.dom.btnEdgeAdvancedToggle.addEventListener('click', () => this.toggleAdvancedSidebar(true));
    }
    if (this.dom.btnSidebarClose) {
      this.dom.btnSidebarClose.addEventListener('click', () => this.toggleAdvancedSidebar(false));
    }

    // Day / Dark Mode Theme Toggle
    if (this.dom.btnThemeToggle) {
      this.dom.btnThemeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Student View & Lifted Topbar Component Inspector
    if (this.dom.btnStudentView) {
      this.dom.btnStudentView.addEventListener('click', () => this.toggleStudentView());
    }
    if (this.dom.topbarCompPill) {
      this.dom.topbarCompPill.addEventListener('click', () => {
        if (this.selectedComponent) {
          this.showInspector(this.selectedComponent);
        } else if (this.components && this.components.length > 0) {
          this.selectComponent(this.components[0]);
        }
      });
    }

    // Fullscreen Landscape Toggle
    if (this.dom.btnFullscreenToggle) {
      this.dom.btnFullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
    }
    const onFullscreenChange = () => this.updateFullscreenUI();
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    // Mobile Landscape Rotate Overlay Actions
    if (this.dom.btnRotateFullscreen) {
      this.dom.btnRotateFullscreen.addEventListener('click', () => {
        if (this.dom.rotateOverlay) {
          this.dom.rotateOverlay.classList.add('dismissed');
        }
        this.toggleFullscreen(true);
      });
    }
    if (this.dom.btnRotateDismiss) {
      this.dom.btnRotateDismiss.addEventListener('click', () => {
        if (this.dom.rotateOverlay) {
          this.dom.rotateOverlay.classList.add('dismissed');
        }
      });
    }

    // Mobile Toolbox Drawer Toggle
    if (this.dom.btnEdgeToolboxToggle) {
      this.dom.btnEdgeToolboxToggle.addEventListener('click', () => this.toggleToolboxDrawer());
    }
    if (this.dom.btnToolboxClose) {
      this.dom.btnToolboxClose.addEventListener('click', () => this.toggleToolboxDrawer(true));
    }

    // Viewport resize & device orientation change handling
    window.addEventListener('resize', () => {
      this.clampComponentsToStage();
    });
    // Device Autorotate listener & screen orientation handling
    const onDeviceRotate = () => {
      setTimeout(() => {
        this.clampComponentsToStage();
        this.updateFullscreenUI();
        this.applyStageTransform();
      }, 250);
    };
    window.addEventListener('orientationchange', onDeviceRotate);
    if (window.screen && screen.orientation && typeof screen.orientation.addEventListener === 'function') {
      screen.orientation.addEventListener('change', onDeviceRotate);
    }

    // Gaming Ground Zoom HUD Control Buttons
    if (this.dom.btnZoomIn) {
      this.dom.btnZoomIn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setZoom(this.stageZoom * 1.25);
      });
    }
    if (this.dom.btnZoomOut) {
      this.dom.btnZoomOut.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setZoom(this.stageZoom / 1.25);
      });
    }
    if (this.dom.btnZoomReset) {
      this.dom.btnZoomReset.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetZoom();
      });
    }
    if (this.dom.btnZoomFit) {
      this.dom.btnZoomFit.addEventListener('click', (e) => {
        e.stopPropagation();
        this.zoomToFit();
      });
    }

    // Ohm's Law & Watt Calculator Toggle and Interactive Events
    if (this.dom.btnOhmsToggle) {
      this.dom.btnOhmsToggle.addEventListener('click', () => this.toggleOhmsCalc());
    }
    if (this.dom.btnOhmsClose) {
      this.dom.btnOhmsClose.addEventListener('click', () => this.toggleOhmsCalc(false));
    }
    this.setupOhmsCalcEvents();
    this.initResistorCodesModal();
    this.initLogicSimulatorModal();

    // Joule Heating Thermal Camera Toggle
    if (this.dom.btnThermalToggle) {
      this.dom.btnThermalToggle.addEventListener('click', () => this.toggleThermalMode());
    }

    // Circuit Working Analysis Toggle
    if (this.dom.btnAnalysisToggle) {
      this.dom.btnAnalysisToggle.addEventListener('click', () => this.openCircuitAnalysis(false));
    }

    // Click on short hazard banner or status ribbon to open diagnostic breakdown
    if (this.dom.shortHazardBanner) {
      this.dom.shortHazardBanner.style.cursor = 'pointer';
      this.dom.shortHazardBanner.title = 'Click to inspect Short Circuit Diagnostic & Remedy';
      this.dom.shortHazardBanner.addEventListener('click', () => {
        this.showFailureModal(null, this.solver.status.failureReason, this.solver.status.faultDiagnostic);
      });
    }

    // Technical Specifications Modal Close & Geometry Actions
    if (this.dom.btnCloseTechSpecs) {
      this.dom.btnCloseTechSpecs.addEventListener('click', () => this.hideTechnicalSpecificationsModal());
    }
    if (this.dom.btnTechSpecsClose) {
      this.dom.btnTechSpecsClose.addEventListener('click', () => this.hideTechnicalSpecificationsModal());
    }
    if (this.dom.btnTechSpecsRotate) {
      this.dom.btnTechSpecsRotate.addEventListener('click', () => {
        if (this.techSpecsComp) {
          this.rotateComponent(this.techSpecsComp.id, 90);
        }
      });
    }
    if (this.dom.techSpecsModal) {
      this.dom.techSpecsModal.addEventListener('click', (e) => {
        if (e.target === this.dom.techSpecsModal) {
          this.hideTechnicalSpecificationsModal();
        }
      });
    }

    if (this.dom.statusRibbon) {
      this.dom.statusRibbon.addEventListener('click', () => {
        if (this.solver.status.circuitFailed || this.solver.status.isShortCircuit || this.components.some(c => c.state && c.state.burnt)) {
          this.showFailureModal(null, this.solver.status.failureReason, this.solver.status.faultDiagnostic);
        }
      });
    }

    // Reset & Clear
    if (this.dom.btnResetLevel) {
      this.dom.btnResetLevel.addEventListener('click', () => {
        if (this.mode === 'curriculum') {
          this.loadLevel(this.currentLevelIndex);
        } else {
          this.clearBoard(true, true);
        }
      });
    }
    if (this.dom.btnClearCanvas) {
      this.dom.btnClearCanvas.addEventListener('click', () => this.clearBoard(true, true));
    }

    // Trash Drop Zone (Click or Tap to delete selected component)
    if (this.dom.trashDropZone) {
      this.dom.trashDropZone.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.selectedComponent) {
          const comp = this.selectedComponent;
          this.dom.trashDropZone.classList.add('trash-shake');
          setTimeout(() => {
            if (this.dom.trashDropZone) this.dom.trashDropZone.classList.remove('trash-shake');
          }, 400);
          this.removeComponent(comp.id, true);
          if (typeof this.showToast === 'function') {
            const def = window.COMPONENT_DEFINITIONS[comp.type];
            this.showToast('Deleted ' + (def ? def.name : 'component'), 'info');
          }
        } else {
          if (typeof this.showToast === 'function') {
            this.showToast('Drag any component here to delete it', 'info');
          }
        }
      });
    }

    // Undo & Redo
    if (this.dom.btnUndo) {
      this.dom.btnUndo.addEventListener('click', () => this.undo());
    }
    if (this.dom.btnRedo) {
      this.dom.btnRedo.addEventListener('click', () => this.redo());
    }

    // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        this.undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        this.redo();
      }
    });

    // Hint
    if (this.dom.btnHint) this.dom.btnHint.addEventListener('click', () => this.openHint());
    if (this.dom.btnCloseHint) this.dom.btnCloseHint.addEventListener('click', () => this.closeHint());
    if (this.dom.btnGotIt) this.dom.btnGotIt.addEventListener('click', () => this.closeHint());

    // Victory & Circuit Analysis Modal Actions
    if (this.dom.btnAnalysisToggle) {
      this.dom.btnAnalysisToggle.addEventListener('click', () => {
        this.openCircuitAnalysis(false);
      });
    }
    if (this.dom.victoryModal) {
      this.dom.victoryModal.addEventListener('click', (e) => {
        if (e.target === this.dom.victoryModal) {
          this.dom.victoryModal.style.display = 'none';
          if (this.dom.victoryCompactDock && this.levelCompleted) {
            this.dom.victoryCompactDock.style.display = 'flex';
          }
        }
      });
    }
    if (this.dom.btnCloseVictory) {
      this.dom.btnCloseVictory.addEventListener('click', () => {
        this.dom.victoryModal.style.display = 'none';
        if (this.dom.victoryCompactDock && this.levelCompleted) {
          this.dom.victoryCompactDock.style.display = 'flex';
        }
      });
    }
    if (this.dom.btnMinimizeVictory) {
      this.dom.btnMinimizeVictory.addEventListener('click', () => {
        this.dom.victoryModal.style.display = 'none';
        if (this.dom.victoryCompactDock && this.levelCompleted) {
          this.dom.victoryCompactDock.style.display = 'flex';
        }
      });
    }
    if (this.dom.btnInspectWorkbench) {
      this.dom.btnInspectWorkbench.addEventListener('click', () => {
        this.dom.victoryModal.style.display = 'none';
        if (this.dom.victoryCompactDock && this.levelCompleted) {
          this.dom.victoryCompactDock.style.display = 'flex';
        }
      });
    }
    if (this.dom.btnReplayLevel) {
      this.dom.btnReplayLevel.addEventListener('click', () => {
        this.dom.victoryModal.style.display = 'none';
        if (this.dom.victoryCompactDock) this.dom.victoryCompactDock.style.display = 'none';
        this.loadLevel(this.currentLevelIndex);
      });
    }
    if (this.dom.btnNextLevel) {
      this.dom.btnNextLevel.addEventListener('click', () => {
        this.skipTask();
      });
    }

    // Skip Task Buttons (Bottom Status Ribbon & Objective Card)
    const handleSkip = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.skipTask();
    };

    if (this.dom.btnSkipTask) {
      this.dom.btnSkipTask.addEventListener('click', handleSkip);
      this.dom.btnSkipTask.addEventListener('touchstart', handleSkip, { passive: false });
    }
    if (this.dom.btnSkipTaskSidebar) {
      this.dom.btnSkipTaskSidebar.addEventListener('click', handleSkip);
      this.dom.btnSkipTaskSidebar.addEventListener('touchstart', handleSkip, { passive: false });
    }

    // Victory Celebratory Bottom Dock Handlers
    if (this.dom.btnDockTable) {
      this.dom.btnDockTable.addEventListener('click', () => {
        this.openCircuitAnalysis(true);
      });
    }
    if (this.dom.btnDockNext) {
      this.dom.btnDockNext.addEventListener('click', () => {
        if (this.dom.victoryCompactDock) this.dom.victoryCompactDock.style.display = 'none';
        if (this.dom.statusRibbon) this.dom.statusRibbon.style.display = 'flex';
        this.clearConfetti();
        this.skipTask();
      });
    }
    if (this.dom.btnDockClose) {
      this.dom.btnDockClose.addEventListener('click', () => {
        if (this.dom.victoryCompactDock) this.dom.victoryCompactDock.style.display = 'none';
        if (this.dom.statusRibbon) this.dom.statusRibbon.style.display = 'flex';
        this.clearConfetti();
      });
    }

    // Wire Color Palette
    if (this.dom.colorSwatches) {
      this.dom.colorSwatches.addEventListener('click', (e) => {
        const swatch = e.target.closest('.color-swatch');
        if (!swatch) return;
        this.dom.colorSwatches.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.activeWireColor = swatch.dataset.color;
      });
    }

    // Delete selected component
    if (this.dom.btnDeleteSelected) {
      this.dom.btnDeleteSelected.addEventListener('click', () => {
        if (this.selectedComponent) {
          this.removeComponent(this.selectedComponent.id);
        }
      });
    }

    // Replace selected component
    if (this.dom.btnReplaceSelected) {
      this.dom.btnReplaceSelected.addEventListener('click', () => {
        if (this.selectedComponent) {
          const newType = this.dom.inspReplaceSelect ? this.dom.inspReplaceSelect.value : null;
          if (newType) this.replaceComponent(this.selectedComponent.id, newType);
        }
      });
    }

    // Repair selected burnt component
    if (this.dom.btnRepairSelected) {
      this.dom.btnRepairSelected.addEventListener('click', () => {
        if (this.selectedComponent) {
          this.repairBurntComponent(this.selectedComponent.id);
        }
      });
    }

    // Global Mouse & Touch Handlers on Stage
    const stage = this.dom.stage;

    const handlePointerMove = (e) => {
      // 0a. Two-finger pinch to zoom on touchscreen (Gaming ground only)
      if (this.isPinching && e.touches && e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const curDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = curDist / Math.max(10, this.pinchStartDist);
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.pinchStartZoom * ratio));

        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const stageRect = (this.dom && this.dom.stage) ? this.dom.stage.getBoundingClientRect() : { left: 0, top: 0 };
        const cx = this.pinchCenter.x - stageRect.left;
        const cy = this.pinchCenter.y - stageRect.top;

        const worldX = (cx - this.pinchStartPan.x) / this.pinchStartZoom;
        const worldY = (cy - this.pinchStartPan.y) / this.pinchStartZoom;

        this.stageZoom = newZoom;
        this.stagePanX = (midX - stageRect.left) - worldX * newZoom;
        this.stagePanY = (midY - stageRect.top) - worldY * newZoom;
        this.applyStageTransform();
        return;
      }

      // 0b. Background Pan drag (gaming ground only) — skip if a component/wire drag is active
      if (this.panDrag && !this.wireDrag && !this.compDrag && !this.rotateDrag && !this.resizeDrag && !this.reconnectDrag && !this.probeDrag) {
        const pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
        const dx = pt.clientX - this.panDrag.startX;
        const dy = pt.clientY - this.panDrag.startY;
        if (Math.hypot(dx, dy) > 4) {
          this.panDrag.hasMoved = true;
        }
        this.stagePanX = this.panDrag.initialPanX + dx;
        this.stagePanY = this.panDrag.initialPanY + dy;
        this.applyStageTransform();
        return;
      }

      // Prevent native scroll/zoom during any active drag on touch devices
      if (e.cancelable && e.touches && (this.wireDrag || this.compDrag || this.rotateDrag || this.resizeDrag || this.reconnectDrag || this.probeDrag)) {
        e.preventDefault();
      }

      const coords = this.getEventStageCoords(e);

      // 0a. Rotating a component with mouse
      if (this.rotateDrag) {
        const comp = this.rotateDrag.comp;
        const distMoved = Math.hypot(coords.x - this.rotateDrag.startX, coords.y - this.rotateDrag.startY);
        if (distMoved > 3) {
          this.rotateDrag.hasMoved = true;
        }
        if (this.rotateDrag.hasMoved) {
          const currentRad = Math.atan2(coords.y - this.rotateDrag.cy, coords.x - this.rotateDrag.cx);
          let deltaDeg = ((currentRad - this.rotateDrag.startMouseRad) * 180) / Math.PI;
          let newAngle = (this.rotateDrag.startAngle + deltaDeg) % 360;
          if (newAngle < 0) newAngle += 360;

          if (e.shiftKey) {
            // Snap to 15° increments when Shift is held
            newAngle = Math.round(newAngle / 15) * 15;
          } else {
            // Snap to 1°
            newAngle = Math.round(newAngle);
          }
          newAngle = (newAngle % 360 + 360) % 360;

          comp.rotation = newAngle;
          this.updateComponentVisual(comp);
          this.renderWires();
          this.updateMultimeter();
          this.showTransformFeedback(comp, `Angle: ${newAngle}°`);
          if (this.techSpecsComp && this.techSpecsComp.id === comp.id) {
            this.updateTechnicalSpecificationsModal();
          }
        }
      }

      // 0b. Resizing a component with mouse
      if (this.resizeDrag) {
        const comp = this.resizeDrag.comp;
        const currentDist = Math.max(15, Math.hypot(coords.x - this.resizeDrag.cx, coords.y - this.resizeDrag.cy));
        let ratio = currentDist / this.resizeDrag.startDist;
        let newScale = this.resizeDrag.startScale * ratio;

        if (e.shiftKey) {
          // Snap to 0.25 (25%) increments with Shift
          newScale = Math.round(newScale * 4) / 4;
        } else {
          // Snap to 0.05 (5%) increments
          newScale = Math.round(newScale * 20) / 20;
        }
        // Clamp scale between 0.5 (50%) and 2.5 (250%)
        newScale = Math.min(2.5, Math.max(0.5, newScale));

        comp.scale = newScale;
        this.updateComponentVisual(comp);
        this.renderWires();
        this.updateMultimeter();
        this.showTransformFeedback(comp, `Scale: ${Math.round(newScale * 100)}% (${newScale.toFixed(2)}x)`);
        if (this.techSpecsComp && this.techSpecsComp.id === comp.id) {
          this.updateTechnicalSpecificationsModal();
        }
      }

      // 1. Moving a component
      if (this.compDrag) {
        const comp = this.compDrag.comp;
        const stageRect = stage.getBoundingClientRect();
        const def = window.COMPONENT_DEFINITIONS[comp.type];

        let newX = coords.x - this.compDrag.offsetX;
        let newY = coords.y - this.compDrag.offsetY;

        // Allow free placement anywhere on the vast gaming ground (especially when zoomed out)
        const minPlayX = -5500;
        const maxPlayX = 11500;
        const minPlayY = -4500;
        const maxPlayY = 9500;

        newX = Math.max(minPlayX, Math.min(maxPlayX, newX));
        newY = Math.max(minPlayY, Math.min(maxPlayY, newY));

        comp.x = newX;
        comp.y = newY;
        this.updateComponentDomPos(comp);

        const bubble = document.getElementById('character-speech-bubble');
        if (bubble && this.selectedComponent && this.selectedComponent.id === comp.id) {
          bubble.style.left = `${comp.x + def.width / 2}px`;
          bubble.style.top = `${comp.y}px`;
        }

        this.renderWires();
        this.updateMultimeter();
        this.updateLDRSensorsAndVisuals();

        // Update trash bin highlight
        const _pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
        this.updateTrashHover(_pt.clientX, _pt.clientY);
      }

      // 2. Dragging a wire from a terminal pin or wire junction (Flexible multi-point shape drawing)
      if (this.wireDrag) {
        const distFromStart = Math.hypot(coords.x - this.wireDrag.startX, coords.y - this.wireDrag.startY);
        if (distFromStart > 8) {
          this.wireDrag.hasMoved = true;
        }

        // Record intermediate points as mouse moves for custom flexible shapes
        if (!this.wireDrag.points) this.wireDrag.points = [];
        const lastPt = this.wireDrag.points.length > 0
          ? this.wireDrag.points[this.wireDrag.points.length - 1]
          : { x: this.wireDrag.startX, y: this.wireDrag.startY };
        const dist = Math.hypot(coords.x - lastPt.x, coords.y - lastPt.y);
        if (dist > 20) {
          this.wireDrag.points.push({ x: coords.x, y: coords.y });
        }

        const fromPos = this.getPinAbsolutePos(this.wireDrag.fromComp, this.wireDrag.fromPin);
        const curve = this.generateSmoothPath(fromPos, this.wireDrag.points, coords);
        this.dom.tempWirePath.setAttribute('d', curve);
        this.dom.tempWirePath.style.display = 'block';

        // Check if near a terminal pin (generous 36px snap radius)
        const targetPin = this.findPinNear(coords.x, coords.y, 36, this.wireDrag.fromComp, this.wireDrag.fromPin);
        // Check if near another wire to connect / tap into at any point
        const targetWire = !targetPin ? this.findWireNear(coords.x, coords.y, 25) : null;

        document.querySelectorAll('.terminal-pin').forEach(p => p.classList.remove('snap-target'));
        if (targetPin) {
          const el = document.getElementById(`pin-${targetPin.comp.id}-${targetPin.pin.id}`);
          if (el) el.classList.add('snap-target');
        }

        // Show glowing preview junction dot if snapping to a wire
        let juncPreview = document.getElementById('temp-junction-preview');
        if (targetWire) {
          if (!juncPreview) {
            juncPreview = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            juncPreview.id = 'temp-junction-preview';
            juncPreview.setAttribute('r', '7');
            juncPreview.setAttribute('class', 'wire-junction-preview');
            this.dom.wiresGroup.appendChild(juncPreview);
          }
          juncPreview.setAttribute('cx', targetWire.point.x);
          juncPreview.setAttribute('cy', targetWire.point.y);
          juncPreview.style.display = 'block';
        } else if (juncPreview) {
          juncPreview.style.display = 'none';
        }
      }

      // 3. Reconnecting or Dragging an existing wire endpoint
      if (this.reconnectDrag) {
        const fixedPos = this.reconnectDrag.fixedPos;
        const curve = this.generateSmoothPath(fixedPos, this.reconnectDrag.points || [], coords);
        this.dom.tempWirePath.setAttribute('d', curve);
        this.dom.tempWirePath.style.display = 'block';

        const targetPin = this.findPinNear(coords.x, coords.y, 25);
        const targetWire = !targetPin ? this.findWireNear(coords.x, coords.y, 20, this.reconnectDrag.wire.id) : null;

        document.querySelectorAll('.terminal-pin').forEach(p => p.classList.remove('snap-target'));
        if (targetPin) {
          const el = document.getElementById(`pin-${targetPin.comp.id}-${targetPin.pin.id}`);
          if (el) el.classList.add('snap-target');
        }

        let juncPreview = document.getElementById('temp-junction-preview');
        if (targetWire) {
          if (!juncPreview) {
            juncPreview = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            juncPreview.id = 'temp-junction-preview';
            juncPreview.setAttribute('r', '7');
            juncPreview.setAttribute('class', 'wire-junction-preview');
            this.dom.wiresGroup.appendChild(juncPreview);
          }
          juncPreview.setAttribute('cx', targetWire.point.x);
          juncPreview.setAttribute('cy', targetWire.point.y);
          juncPreview.style.display = 'block';
        } else if (juncPreview) {
          juncPreview.style.display = 'none';
        }
      }

      // 4. Dragging Multimeter Probes
      if (this.probeDrag) {
        const probeName = this.probeDrag.probe;
        const probe = this.probes[probeName];
        probe.x = coords.x - this.probeDrag.offsetX;
        probe.y = coords.y - this.probeDrag.offsetY;

        this.probeDrag.element.style.left = `${probe.x}px`;
        this.probeDrag.element.style.top = `${probe.y}px`;

        const tipX = probe.x + 16;
        const tipY = probe.y + 5;
        const snapped = this.findPinNear(tipX, tipY, 32);
        probe.snappedPin = snapped ? `${snapped.comp.id}:${snapped.pin.id}` : null;

        document.querySelectorAll('.terminal-pin').forEach(p => p.classList.remove('snap-target'));
        if (snapped) {
          const pinEl = document.getElementById(`pin-${snapped.comp.id}-${snapped.pin.id}`);
          if (pinEl) pinEl.classList.add('snap-target');
        }

        this.updateMultimeter();
      }
    };

    const handlePointerUp = (e) => {
      if (this.isPinching && (!e.touches || e.touches.length < 2)) {
        this.isPinching = false;
      }
      if (this.panDrag) {
        this.panDrag = null;
      }
      // 1. Release New Wire Drag
      if (this.wireDrag) {
        const coords = this.getEventStageCoords(e);

        // For touch events, use changedTouches and elementFromPoint for hit detection
        let targetPin = null;
        let hitEl = e.target;
        const isTouchEnd = e.changedTouches && e.changedTouches.length > 0;
        if (isTouchEnd) {
          // touchend: e.target is where touch STARTED, use elementFromPoint for where it ENDED
          const clientX = e.changedTouches[0].clientX;
          const clientY = e.changedTouches[0].clientY;
          hitEl = document.elementFromPoint(clientX, clientY) || e.target;
        } else if (!hitEl || !hitEl.closest) {
          const clientX = e.clientX || 0;
          const clientY = e.clientY || 0;
          if (clientX && clientY) {
            hitEl = document.elementFromPoint(clientX, clientY);
          }
        }
        const pinEl = hitEl?.closest ? hitEl.closest('.terminal-pin') : null;
        if (pinEl && pinEl.dataset.compId && pinEl.dataset.pinId) {
          const cId = pinEl.dataset.compId;
          const pId = pinEl.dataset.pinId;
          if (!(cId === this.wireDrag.fromComp && pId === this.wireDrag.fromPin)) {
            if (cId === 'multimeter_tool') {
              targetPin = {
                comp: { id: 'multimeter_tool', type: 'multimeter', name: 'Digital Multimeter', terminals: [{ id: 'vin' }, { id: 'com' }] },
                pin: { id: pId, polarity: pId === 'vin' ? 'pos' : 'neg' },
                pos: this.getPinAbsolutePos(cId, pId)
              };
            } else {
              const comp = this.components.find(c => c.id === cId);
              const pin = comp?.terminals.find(t => t.id === pId);
              if (comp && pin) {
                targetPin = { comp, pin, pos: this.getPinAbsolutePos(cId, pId) };
              }
            }
          }
        }

        // If not directly over pin element, check snap distance with generous 40px radius
        if (!targetPin) {
          targetPin = this.findPinNear(coords.x, coords.y, 40, this.wireDrag.fromComp, this.wireDrag.fromPin);
        }

        const targetWire = !targetPin ? this.findWireNear(coords.x, coords.y, 28) : null;

        if (targetPin) {
          this.addWire(
            this.wireDrag.fromComp,
            this.wireDrag.fromPin,
            targetPin.comp.id,
            targetPin.pin.id,
            this.activeWireColor,
            this.wireDrag.points
          );
          this.cancelWireDrag();
        } else if (targetWire) {
          // Connect / tap wire directly into target wire at that point!
          this.addWire(
            this.wireDrag.fromComp,
            this.wireDrag.fromPin,
            `wire:${targetWire.wire.id}`,
            'junction',
            this.activeWireColor,
            this.wireDrag.points,
            targetWire.point
          );
          this.cancelWireDrag();
        } else {
          // No destination target under pointer
          // On mobile touch, only cancel if the finger moved significantly (> 28px)
          const isTouch = (e.changedTouches && e.changedTouches.length > 0);
          const movedSignificantly = isTouch ? (this.wireDrag.hasMoved && this.wireDrag.points && this.wireDrag.points.length > 1) : this.wireDrag.hasMoved;
          if (movedSignificantly) {
            // Actively dragged and released in empty space -> cancel wire
            this.cancelWireDrag();
          } else {
            // Clicked / tapped without dragging: keep active in Click-to-Connect mode!
            if (typeof this.showToast === 'function' && isTouch) {
              this.showToast('Tap second pin to connect wire', 'info', 1600);
            }
          }
        }
      }

      // 2. Release Reconnect / Detach Wire Drag
      if (this.reconnectDrag) {
        // For touch: use changedTouches to get correct release position
        if (e.changedTouches && e.changedTouches.length > 0) {
          try {
            const fakeEv = { changedTouches: e.changedTouches, touches: e.changedTouches };
            e = Object.assign({}, e, { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
          } catch (_) { }
        }
        const coords = this.getEventStageCoords(e);
        const targetPin = this.findPinNear(coords.x, coords.y, 36);
        const targetWire = !targetPin ? this.findWireNear(coords.x, coords.y, 28, this.reconnectDrag.wire.id) : null;
        const wire = this.reconnectDrag.wire;

        if (targetPin) {
          // Reconnect to target pin
          if (this.reconnectDrag.endpoint === 'from') {
            wire.fromComp = targetPin.comp.id;
            wire.fromPin = targetPin.pin.id;
            delete wire.fromPoint;
          } else {
            wire.toComp = targetPin.comp.id;
            wire.toPin = targetPin.pin.id;
            delete wire.toPoint;
          }
          window.sounds.playConnect();
        } else if (targetWire) {
          // Reconnect to wire junction
          if (this.reconnectDrag.endpoint === 'from') {
            wire.fromComp = `wire:${targetWire.wire.id}`;
            wire.fromPin = 'junction';
            wire.fromPoint = targetWire.point;
          } else {
            wire.toComp = `wire:${targetWire.wire.id}`;
            wire.toPin = 'junction';
            wire.toPoint = targetWire.point;
          }
          window.sounds.playConnect();
        } else {
          // Dragged into open space -> REMOVE / DISCONNECT WIRE!
          const juncKey = `wire:${wire.id}`;
          this.wires = this.wires.filter(w => w.id !== wire.id && w.fromComp !== juncKey && w.toComp !== juncKey);
          window.sounds.playDisconnect();
        }

        // Save reconnect action into undo history
        if (this.reconnectDrag.startSnapshot) {
          this.history.push(this.reconnectDrag.startSnapshot);
          if (this.history.length > this.maxHistorySteps) this.history.shift();
          this.future = [];
          this.updateUndoRedoButtons();
        }

        this.dom.tempWirePath.style.display = 'none';
        const junc = document.getElementById('temp-junction-preview');
        if (junc) junc.style.display = 'none';
        document.querySelectorAll('.terminal-pin').forEach(p => p.classList.remove('snap-target'));

        this.reconnectDrag = null;
        this.evaluateCircuit();
        this.renderWires();
      }

      if (this.rotateDrag) {
        const comp = this.rotateDrag.comp;
        if (!this.rotateDrag.hasMoved) {
          // If clicked without dragging, step rotate by 90°
          this.rotateComponent(comp.id, 90);
        } else if (comp.rotation !== this.rotateDrag.startAngle) {
          if (this.rotateDrag.startSnapshot) {
            this.history.push(this.rotateDrag.startSnapshot);
            if (this.history.length > this.maxHistorySteps) this.history.shift();
            this.future = [];
            this.updateUndoRedoButtons();
          }
        }
        this.hideTransformFeedback(comp);
        this.rotateDrag = null;
        this.evaluateCircuit();
      }

      if (this.resizeDrag) {
        if (this.resizeDrag.comp.scale !== this.resizeDrag.startScale) {
          if (this.resizeDrag.startSnapshot) {
            this.history.push(this.resizeDrag.startSnapshot);
            if (this.history.length > this.maxHistorySteps) this.history.shift();
            this.future = [];
            this.updateUndoRedoButtons();
          }
        }
        this.hideTransformFeedback(this.resizeDrag.comp);
        this.resizeDrag = null;
        this.evaluateCircuit();
      }

      if (this.compDrag) {
        const comp = this.compDrag.comp;
        const clientX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : (e.clientX !== undefined ? e.clientX : 0);
        const clientY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : (e.clientY !== undefined ? e.clientY : 0);

        if (this.isOverTrashZone(clientX, clientY)) {
          // Trigger delete animation and remove component!
          if (this.dom.trashDropZone) {
            this.dom.trashDropZone.classList.add('trash-shake');
            setTimeout(() => {
              if (this.dom.trashDropZone) this.dom.trashDropZone.classList.remove('trash-shake');
            }, 400);
          }
          this.removeComponent(comp.id, true);
          if (typeof this.showToast === 'function') {
            const def = window.COMPONENT_DEFINITIONS[comp.type];
            this.showToast('Deleted ' + (def ? def.name : 'component'), 'info');
          }
        } else if (this.compDrag.comp.x !== this.compDrag.startX || this.compDrag.comp.y !== this.compDrag.startY) {
          if (this.compDrag.startSnapshot) {
            this.history.push(this.compDrag.startSnapshot);
            if (this.history.length > this.maxHistorySteps) this.history.shift();
            this.future = [];
            this.updateUndoRedoButtons();
          }
        }
        this.compDrag = null;
        this.hideTrashZone();
      }

      if (this.probeDrag) {
        this.probeDrag = null;
        document.querySelectorAll('.terminal-pin').forEach(p => p.classList.remove('snap-target'));
        this.updateChecklist();
        this.checkWinCondition(this.solver.status);
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    // Stage Gaming Ground Zoom, Pinch, and Pan Listeners
    if (stage) {
      // Mouse Wheel: Zoom ONLY the gaming ground
      stage.addEventListener('wheel', (e) => {
        if (e.target.closest('.toolbox-sidebar') || e.target.closest('.inspector-sidebar') || e.target.closest('.modal-card') || e.target.closest('.ohms-calc-window') || e.target.closest('.resistor-modal-card')) {
          return;
        }
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        this.setZoom(this.stageZoom * factor, e.clientX, e.clientY);
      }, { passive: false });

      // Touch Pinch Gesture on Gaming Ground
      stage.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 2) {
          this.isPinching = true;
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          this.pinchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          this.pinchStartZoom = this.stageZoom || 1.0;
          this.pinchCenter = {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
          };
          this.pinchStartPan = { x: this.stagePanX || 0, y: this.stagePanY || 0 };
          if (this.wireDrag) this.cancelWireDrag();
          if (this.compDrag) this.compDrag = null;
          if (this.panDrag) this.panDrag = null;
        }
      }, { passive: true });

      // Stage Background Pan Initiation
      // Only start panning if no active component/wire drag is in progress
      const onStageBgStart = (e) => {
        // Never pan when user is dragging a component, drawing a wire, or reconnecting
        if (this.wireDrag || this.compDrag || this.reconnectDrag || this.probeDrag) return;
        if (e.target.closest('.component-node') || e.target.closest('.terminal-pin') || e.target.closest('.zoom-hud-btn') || e.target.closest('.action-btn') || e.target.closest('.edge-toolbox-toggle') || e.target.closest('.edge-sidebar-toggle') || e.target.closest('.multimeter-unit') || e.target.closest('.multimeter-probe') || e.target.closest('.v-dock-actions')) {
          return;
        }
        if (e.button === 1 || e.button === 0 || (e.touches && e.touches.length === 1)) {
          const pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
          this.panDrag = {
            startX: pt.clientX,
            startY: pt.clientY,
            initialPanX: this.stagePanX || 0,
            initialPanY: this.stagePanY || 0,
            hasMoved: false
          };
        }
      };
      stage.addEventListener('mousedown', onStageBgStart);
      stage.addEventListener('touchstart', onStageBgStart, { passive: true });
    }

    // Clicking stage background or pressing Escape cancels click-to-connect wire drag & hides speech bubble
    if (stage) {
      stage.addEventListener('click', (e) => {
        if (e.target === stage || e.target.id === 'wires-layer' || e.target.tagName === 'svg') {
          if (this.wireDrag) {
            this.cancelWireDrag();
          }
          this.hideCharacterSpeechBubble();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.techSpecsModal && this.dom.techSpecsModal.style.display !== 'none') {
          this.hideTechnicalSpecificationsModal();
        }
        if (this.wireDrag) {
          this.cancelWireDrag();
        }
        this.hideCharacterSpeechBubble();
      } else if (e.key === 'r' || e.key === 'R') {
        const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
        if (!isInput && this.selectedComponent) {
          e.preventDefault();
          this.rotateComponent(this.selectedComponent.id, 90);
        }
      } else if (e.key === '+' || e.key === '=') {
        const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
        if (!isInput && this.selectedComponent) {
          e.preventDefault();
          this.scaleComponent(this.selectedComponent.id, 0.1);
        }
      } else if (e.key === '-' || e.key === '_') {
        const isInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
        if (!isInput && this.selectedComponent) {
          e.preventDefault();
          this.scaleComponent(this.selectedComponent.id, -0.1);
        }
      }
    });

    // Multimeter probe drag setup
    this.setupProbeEvents(this.dom.probeRed, 'red');
    this.setupProbeEvents(this.dom.probeBlack, 'black');

    // Multimeter 6 Function Mode Buttons setup
    this.multimeterMode = 'dcv';
    const mmModeBtns = document.querySelectorAll('.mm-mode-btn');
    mmModeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setMultimeterMode(btn.dataset.mode || 'dcv');
        if (window.sounds) window.sounds.playClick();
      });
    });

    // Multimeter Connectable Wire Terminal Jacks setup
    const mmPinVin = document.getElementById('pin-mm-vin');
    const mmPinCom = document.getElementById('pin-mm-com');
    [mmPinVin, mmPinCom].forEach(pinEl => {
      if (!pinEl) return;
      const onPinStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startWireDrag('multimeter_tool', pinEl.dataset.pinId, e);
      };
      pinEl.addEventListener('mousedown', onPinStart);
      pinEl.addEventListener('touchstart', onPinStart, { passive: false });
    });
  }

  setupProbeEvents(el, color) {
    if (!el) return;
    const onStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const coords = this.getEventStageCoords(e);
      const probe = this.probes[color];
      this.probeDrag = {
        probe: color,
        element: el,
        offsetX: coords.x - probe.x,
        offsetY: coords.y - probe.y
      };
    };
    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: false });
  }

  getEventStageCoords(e) {
    const stageRect = (this.dom && this.dom.stage) ? this.dom.stage.getBoundingClientRect() : { left: 0, top: 0 };
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    const screenX = (clientX !== undefined ? clientX : 0) - stageRect.left;
    const screenY = (clientY !== undefined ? clientY : 0) - stageRect.top;
    const zoom = this.stageZoom || 1.0;
    const panX = this.stagePanX || 0;
    const panY = this.stagePanY || 0;
    return {
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom
    };
  }

  toggleAdvancedSidebar(forceState = null) {
    const shouldOpen = (forceState !== null) ? forceState : !this.advancedSidebarOpen;
    this.advancedSidebarOpen = shouldOpen;

    if (this.dom.inspectorSidebar) {
      this.dom.inspectorSidebar.classList.toggle('collapsed', !shouldOpen);
    }
    if (this.dom.btnAdvancedToggle) {
      this.dom.btnAdvancedToggle.classList.toggle('active', shouldOpen);
      this.dom.btnAdvancedToggle.title = shouldOpen
        ? "Hide Advanced Information (Switch to Pure Game Mode)"
        : "Click to show Advanced Information (Objectives, Inspector & Physics Theory)";
    }
    if (this.dom.btnEdgeAdvancedToggle) {
      this.dom.btnEdgeAdvancedToggle.classList.toggle('hidden', shouldOpen);
    }

    if (window.sounds && this.soundEnabled && typeof window.sounds.playClick === 'function') {
      window.sounds.playClick();
    }

    // Trigger window resize so any canvas/SVG coordinate caches update seamlessly
    window.dispatchEvent(new Event('resize'));
  }

  setMode(mode) {
    this.mode = mode;
    if (this.dom.modeCurriculumBtn) this.dom.modeCurriculumBtn.classList.toggle('active', mode === 'curriculum');
    if (this.dom.modeSandboxBtn) this.dom.modeSandboxBtn.classList.toggle('active', mode === 'sandbox');

    const nav = document.getElementById('level-nav-container');
    const objCard = document.getElementById('objective-card');

    if (mode === 'sandbox') {
      if (nav) nav.style.display = 'none';
      if (objCard) objCard.style.display = 'none';
      if (this.dom.btnSkipTask) this.dom.btnSkipTask.style.display = 'none';
      if (this.dom.victoryCompactDock) this.dom.victoryCompactDock.style.display = 'none';
      if (this.dom.theoryTitle) this.dom.theoryTitle.textContent = 'Free Exploration Mode';
      if (this.dom.theoryContent) this.dom.theoryContent.textContent = 'Drag and drop any components freely! Connect batteries, switches, LEDs, bulbs, motors, and diodes to build whatever electronic marvel you imagine.';
    } else {
      if (nav) nav.style.display = 'flex';
      if (objCard) objCard.style.display = 'block';
      if (this.dom.btnSkipTask) this.dom.btnSkipTask.style.display = 'inline-flex';
      this.loadLevel(this.currentLevelIndex);
    }
  }

  skipTask() {
    const now = Date.now();
    if (this._lastSkipTime && (now - this._lastSkipTime) < 250) {
      return;
    }
    this._lastSkipTime = now;

    // Stop any ongoing speech/talk audio immediately
    if (window.sounds && typeof window.sounds.stopSpeech === 'function') {
      window.sounds.stopSpeech();
    }
    this.hideCharacterSpeechBubble();

    // If not in curriculum mode, switch back to curriculum challenge mode
    if (this.mode !== 'curriculum') {
      this.mode = 'curriculum';
      if (this.dom.modeCurriculumBtn) this.dom.modeCurriculumBtn.classList.add('active');
      if (this.dom.modeSandboxBtn) this.dom.modeSandboxBtn.classList.remove('active');
      const nav = document.getElementById('level-nav-container');
      const objCard = document.getElementById('objective-card');
      if (nav) nav.style.display = 'flex';
      if (objCard) objCard.style.display = 'block';
    }

    if (this.dom.victoryCompactDock) this.dom.victoryCompactDock.style.display = 'none';
    if (this.dom.victoryModal) this.dom.victoryModal.style.display = 'none';

    // Advance to next task (or open Circuit Ideas workshop if on last level)
    const totalLevels = (window.GAME_LEVELS && window.GAME_LEVELS.length) ? window.GAME_LEVELS.length : 20;

    if (this.currentLevelIndex === totalLevels - 1) {
      if (window.sounds && typeof window.sounds.playSuccess === 'function') {
        window.sounds.playSuccess();
      }
      this.launchConfetti();
      this.showToast('🏆 Master Electrician! You have completed all levels! Switch to Free Sandbox to build any circuit.', 'success', 6000);
      return;
    }

    const nextIndex = (this.currentLevelIndex + 1) % totalLevels;

    if (window.sounds && typeof window.sounds.playClick === 'function') {
      try {
        window.sounds.playClick();
      } catch (e) { }
    }

    this.loadLevel(nextIndex);
    if (window.GAME_LEVELS && window.GAME_LEVELS[nextIndex]) {
      this.showTaskAnnouncement(window.GAME_LEVELS[nextIndex]);
    }
  }

  showTaskAnnouncement(level) {
    if (!level) return;
    let toast = document.getElementById('task-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'task-toast';
      toast.className = 'task-announcement-toast';
      this.dom.stage.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="task-toast-icon">🎯</div>
      <div class="task-toast-content">
        <span class="task-toast-title">NEXT TASK: ${level.title.toUpperCase()}</span>
        <span class="task-toast-desc">${level.summary || level.instructions || ''}</span>
      </div>
    `;
    toast.style.display = 'flex';
    toast.style.opacity = '1';

    clearTimeout(this._taskToastTimer);
    this._taskToastTimer = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
      }
    }, 3200);
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    this.levelCompleted = false;
    const level = window.GAME_LEVELS ? window.GAME_LEVELS[index] : null;
    if (!level) return;

    if (this.dom.victoryCompactDock) {
      this.dom.victoryCompactDock.style.display = 'none';
    }
    if (this.dom.statusRibbon) {
      this.dom.statusRibbon.style.display = 'flex';
    }
    if (this.dom.victoryModal) {
      this.dom.victoryModal.style.display = 'none';
    }
    this.clearConfetti();
    // Always keep skip button accessible so the student can skip through any task!
    if (this.dom.btnSkipTask) {
      this.dom.btnSkipTask.style.display = 'inline-flex';
    }
    if (this.dom.btnSkipTaskSidebar) {
      this.dom.btnSkipTaskSidebar.style.display = 'inline-flex';
    }

    // Update Header
    if (this.dom.levelBadge) {
      this.dom.levelBadge.textContent = `Level ${index + 1} of ${window.GAME_LEVELS.length}`;
    }
    if (this.dom.levelTitleDisplay) {
      const cleanTitle = (level.title || '').replace(/^Level\s+\d+:\s*/i, '');
      this.dom.levelTitleDisplay.textContent = cleanTitle || level.title;
      this.dom.levelTitleDisplay.title = level.title;
    }

    // Render Progress Dots
    if (this.dom.levelDots) {
      this.dom.levelDots.innerHTML = '';
      window.GAME_LEVELS.forEach((lvl, idx) => {
        const dot = document.createElement('div');
        dot.className = `level-dot ${idx === index ? 'active' : ''}`;
        dot.title = lvl.title;
        dot.addEventListener('click', () => {
          this.loadLevel(idx);
          this.showTaskAnnouncement(window.GAME_LEVELS[idx]);
        });
        this.dom.levelDots.appendChild(dot);
      });
    }

    // Update Sidebar Objective
    if (this.dom.sidebarLevelTitle) this.dom.sidebarLevelTitle.textContent = level.title;
    if (this.dom.sidebarLevelDesc) this.dom.sidebarLevelDesc.textContent = level.instructions;
    if (this.dom.theoryTitle) this.dom.theoryTitle.textContent = 'Electronics Briefing';
    if (this.dom.theoryContent) this.dom.theoryContent.textContent = level.theory || '';

    // Clear board and populate initial components
    this.clearBoard(true, false);

    if (Array.isArray(level.initialComponents)) {
      level.initialComponents.forEach(spec => {
        if (spec.type === 'multimeter') return; // Menu bar multimeter is used instead of canvas component!
        this.spawnComponent(spec.type, spec.x, spec.y, spec.id, spec.stateProps);
      });
    }

    // Auto-turn on upper menu multimeter if level uses it, else turn off in curriculum mode
    const usesMultimeter = !!(
      level.usesMultimeter ||
      (level.title && level.title.toLowerCase().includes('multimeter')) ||
      (level.instructions && level.instructions.toLowerCase().includes('multimeter')) ||
      (level.summary && level.summary.toLowerCase().includes('multimeter')) ||
      (Array.isArray(level.allowedComponents) && level.allowedComponents.includes('multimeter'))
    );

    if (usesMultimeter) {
      this.toggleMultimeter(true);
      if (level.multimeterMode) {
        this.setMultimeterMode(level.multimeterMode);
      }
    } else if (this.multimeterActive && this.mode === 'curriculum') {
      this.toggleMultimeter(false);
    }

    this.updateChecklist();
    this.evaluateCircuit();

    this.history = [];
    this.future = [];
    this.updateUndoRedoButtons();

    // Select the key load component of the new level and let it introduce itself and its task!
    setTimeout(() => {
      try {
        const targetComp = this.components.find(c => c.type !== 'battery' && c.type !== 'cell' && c.type !== 'cell3v' && c.type !== 'ac_source') || this.components[0];
        if (targetComp) {
          this.selectComponent(targetComp);
        }
      } catch (err) {
        console.warn('Component auto-select error:', err);
      }
    }, 150);
  }

  updateChecklist() {
    if (this.mode !== 'curriculum') return;
    const level = window.GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;

    const list = this.dom.taskChecklist;
    if (!list) return;
    list.innerHTML = '';

    const isWon = level.checkWin(this.solver.status, this.components, this);

    const items = [
      { text: 'Place & position components', done: this.components.length > 0 },
      { text: 'Connect closed circuit loop with wires', done: this.solver.status.isComplete },
      { text: 'Activate target component correctly', done: isWon }
    ];

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = `checklist-item ${item.done ? 'done' : ''}`;
      row.innerHTML = `
        <div class="check-box">${item.done ? '✓' : ''}</div>
        <span>${item.text}</span>
      `;
      list.appendChild(row);
    });
  }

  spawnComponent(type, x = null, y = null, forcedId = null, stateProps = {}) {
    const def = window.COMPONENT_DEFINITIONS[type];
    if (!def) return null;

    if (!forcedId) {
      this.pushHistory();
    }

    const stageRect = (this.dom && this.dom.stage) ? this.dom.stage.getBoundingClientRect() : { width: 800, height: 600 };
    const zoom = this.stageZoom || 1.0;
    const panX = this.stagePanX || 0;
    const panY = this.stagePanY || 0;

    // Place newly spawned component directly in the visible center of the player's view
    const centerWorldX = (stageRect.width / 2 - panX) / zoom;
    const centerWorldY = (stageRect.height / 2 - panY) / zoom;

    const posX = (x !== null) ? x : Math.floor(centerWorldX - (def.width || 100) / 2 + (Math.random() * 80 - 40));
    const posY = (y !== null) ? y : Math.floor(centerWorldY - (def.height || 60) / 2 + (Math.random() * 80 - 40));

    const id = forcedId || `comp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const comp = {
      id,
      type,
      x: posX,
      y: posY,
      voltage: def.voltage || 0,
      terminals: def.terminals.map(t => ({ ...t })),
      state: { ...def.createState(), ...stateProps }
    };

    this.components.push(comp);
    this.renderComponentDom(comp);
    this.evaluateCircuit();
    if (window.innerWidth <= 950) {
      this.setToolboxCollapsed(true);
    }
    return comp;
  }

  renderComponentDom(comp) {
    const def = window.COMPONENT_DEFINITIONS[comp.type];
    if (def && def.terminals) {
      // Sync terminal coordinates and metadata from definition
      comp.terminals = def.terminals.map(t => ({ ...t }));
    }

    comp.rotation = comp.rotation || 0;
    comp.scale = comp.scale !== undefined ? comp.scale : 1.0;
    const node = document.createElement('div');
    node.className = 'component-node';
    node.id = `node-${comp.id}`;
    node.style.width = `${def.width}px`;
    node.style.height = `${def.height}px`;
    node.style.left = `${comp.x}px`;
    node.style.top = `${comp.y}px`;
    node.style.transform = `rotate(${comp.rotation}deg) scale(${comp.scale})`;
    node.style.transformOrigin = 'center center';
    node.style.setProperty('--comp-counter-rot', `${-comp.rotation}deg`);

    // SVG Body & Floating Header with neat distance
    node.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 ${def.width} ${def.height}" class="comp-svg">
        ${window.ComponentRenderer.renderSVG(comp)}
      </svg>
      ${window.ComponentRenderer.renderFloatingHeader(comp)}
    `;

    // Create Terminal Pin Elements
    comp.terminals.forEach(pin => {
      const pinEl = document.createElement('div');
      pinEl.className = 'terminal-pin';
      pinEl.id = `pin-${comp.id}-${pin.id}`;
      pinEl.dataset.compId = comp.id;
      pinEl.dataset.pinId = pin.id;
      pinEl.style.left = `${pin.x}px`;
      pinEl.style.top = `${pin.y}px`;

      // Leg indicator display: strictly ONE clean circle per terminal end with the symbol inside
      if (comp.type === 'npn' || comp.type === 'pnp') {
        const role = pin.id; // 'b', 'c', or 'e'
        const letter = role.toUpperCase();
        const roleName = (role === 'b') ? 'BASE' : (role === 'c' ? 'COLLECTOR' : 'EMITTER');
        const roleClass = (role === 'b') ? 'pin-trans-base' : (role === 'c' ? 'pin-trans-collector' : 'pin-trans-emitter');
        pinEl.dataset.role = role;
        pinEl.title = `${roleName} (${letter}) Terminal`;
        pinEl.innerHTML = `<div class="terminal-pin-inner ${roleClass}"><span class="pin-sign">${letter}</span></div>`;
      } else if (comp.type === 'ac_source') {
        // AC Power Supply: Line (L) and Neutral (N) in single circle
        const isL = (pin.id === 'l');
        const roleClass = isL ? 'pin-ac-live' : 'pin-ac-neutral';
        const sign = isL ? 'L' : 'N';
        pinEl.dataset.polarity = isL ? 'phase' : 'neutral-ac';
        pinEl.title = isL ? 'AC Line / Phase (L) Live Potential' : 'AC Neutral (N) Grounded Return';
        pinEl.innerHTML = `<div class="terminal-pin-inner ${roleClass}"><span class="pin-sign">${sign}</span></div>`;
      } else if (comp.type === 'transformer') {
        // Step-Down Transformer: Pri L/N and Sec L/N in single circle
        const isPri = pin.id.startsWith('pri');
        const isL = (pin.id === 'pri1' || pin.id === 'sec1');
        const roleClass = isL ? 'pin-ac-live' : 'pin-ac-neutral';
        const sign = isL ? 'L' : 'N';
        pinEl.dataset.polarity = isL ? 'phase' : 'neutral-ac';
        pinEl.title = isPri
          ? (isL ? 'Primary Line (L) 230V~ Input' : 'Primary Neutral (N) Return')
          : (isL ? `Secondary Line (L) ${comp.state.secondaryV || 12}V~ Output` : 'Secondary Neutral (N) Return');
        pinEl.innerHTML = `<div class="terminal-pin-inner ${roleClass}"><span class="pin-sign">${sign}</span></div>`;
      } else if (comp.type === 'function_generator') {
        if (pin.id === 'sync') {
          pinEl.dataset.role = 'sync';
          pinEl.title = 'Sync / TTL Out (0-5V Logic Clock Pulse at signal frequency)';
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-fg-sync"><span class="pin-sign">⊓</span></div>`;
        } else if (pin.id === 'out') {
          pinEl.dataset.polarity = 'pos';
          pinEl.title = 'Main Waveform Output (+ / AC Hot)';
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-pos"><span class="pin-sign">+</span></div>`;
        } else {
          pinEl.dataset.polarity = 'neg';
          pinEl.title = 'Common Return / Ground (− / GND)';
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-neg"><span class="pin-sign">−</span></div>`;
        }
      } else if (comp.type === 'multimeter') {
        // Multimeter pins: V/Ω/mA (+) and COM (-) in single circle
        const isVin = pin.id === 'vin';
        const mClass = isVin ? 'pin-pos' : 'pin-neg';
        const labelText = isVin ? '+' : '−';
        pinEl.title = isVin ? 'V / Ω / mA Input (+)' : 'COM Ground Return (−)';
        pinEl.innerHTML = `<div class="terminal-pin-inner ${mClass}"><span class="pin-sign">${labelText}</span></div>`;
      } else if (comp.type === 'diode' || comp.type === 'led' || comp.type === 'capacitor') {
        // Diode, LED, & Electrolytic Capacitor: Anode (+) and Cathode (−) in single circle
        const isAnode = (pin.id === 'anode');
        const sign = isAnode ? '+' : '−';
        const polClass = isAnode ? 'pin-pos' : 'pin-neg';
        pinEl.dataset.polarity = isAnode ? 'pos' : 'neg';
        pinEl.title = isAnode ? 'Anode (+) Terminal' : 'Cathode (−) Terminal';
        pinEl.innerHTML = `<div class="terminal-pin-inner ${polClass}"><span class="pin-sign">${sign}</span></div>`;
      } else if (comp.type === 'potentiometer') {
        const isPin1 = (pin.id === 'pin1');
        const isWiper = (pin.id === 'wiper');
        const num = isPin1 ? '1' : (isWiper ? '2' : '3');
        const termRole = isPin1 ? 'Terminal 1 (Vin Input Supply)' : (isWiper ? 'Terminal 2 (Wiper Vout Divided Output)' : 'Terminal 3 (GND Ground Reference)');
        const polClass = isPin1 ? 'pin-pos' : (isWiper ? 'pin-neutral' : 'pin-neg');
        pinEl.dataset.role = pin.id;
        pinEl.title = termRole;
        pinEl.innerHTML = `<div class="terminal-pin-inner ${polClass}"><span class="pin-sign">${num}</span></div>`;
      } else if (comp.type && comp.type.startsWith('gate_')) {
        if (pin.id === 'in_a') {
          pinEl.dataset.role = 'in_a';
          pinEl.title = 'Input A (Logic Level: 1 HIGH / 0 LOW)';
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-logic-in"><span class="pin-sign">A</span></div>`;
        } else if (pin.id === 'in_b') {
          pinEl.dataset.role = 'in_b';
          pinEl.title = 'Input B (Logic Level: 1 HIGH / 0 LOW)';
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-logic-in"><span class="pin-sign">B</span></div>`;
        } else if (pin.id === 'out') {
          pinEl.dataset.role = 'out';
          pinEl.title = 'Output Y (Logic Level: 1 HIGH / 0 LOW)';
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-logic-out"><span class="pin-sign">Y</span></div>`;
        }
      } else if (comp.type && comp.type.startsWith('ic_')) {
        const pinNum = pin.label || pin.id.replace('pin', '');
        const role = pin.role || pinNum;
        let polClass = 'pin-ic-in';
        if (role === 'VCC') polClass = 'pin-ic-vcc';
        else if (role === 'GND') polClass = 'pin-ic-gnd';
        else if (pin.polarity === 'logic_out') polClass = 'pin-ic-out';
        pinEl.dataset.role = role;
        pinEl.title = pin.name || `Pin ${pinNum} (${role})`;
        pinEl.classList.add('pin-ic-pin');
        pinEl.innerHTML = `<div class="terminal-pin-inner ${polClass}"><span class="pin-sign">${pinNum}</span><span class="pin-sub-role">${role}</span></div>`;
      } else {
        // Passive/non-polarized components (bulb, resistor, switch, twowayswitch, pushbutton) or standard DC (+/-)
        const isNonPolarized = def.nonPolarized || comp.type === 'bulb' || comp.type === 'resistor' || comp.type === 'switch' || comp.type === 'twowayswitch' || comp.type === 'pushbutton';
        if (isNonPolarized || !pin.polarity || pin.polarity === 'neutral') {
          pinEl.dataset.polarity = 'neutral';
          pinEl.title = `${pin.name || 'Terminal'}`;
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-neutral"><span class="pin-sign">•</span></div>`;
        } else if (pin.polarity === 'phase' || pin.polarity === 'neutral-ac') {
          const isL = pin.polarity === 'phase';
          const pClass = isL ? 'pin-ac-live' : 'pin-ac-neutral';
          pinEl.dataset.polarity = pin.polarity;
          pinEl.title = isL ? 'AC Line (L)' : 'AC Neutral (N)';
          pinEl.innerHTML = `<div class="terminal-pin-inner ${pClass}"><span class="pin-sign">${isL ? 'L' : 'N'}</span></div>`;
        } else if (pin.polarity === 'ground') {
          pinEl.dataset.polarity = 'ground';
          pinEl.title = 'Earth Ground (⏚) / Common Return (Chassis Bonded)';
          pinEl.innerHTML = `<div class="terminal-pin-inner pin-ground"><span class="pin-sign">⏚</span></div>`;
        } else {
          pinEl.dataset.polarity = pin.polarity;
          const sign = pin.polarity === 'pos' ? '+' : '−';
          const polClass = (pin.polarity === 'pos') ? 'pin-pos' : 'pin-neg';
          pinEl.title = pin.polarity === 'pos' ? 'Positive (+) Terminal' : 'Negative (−) Terminal';
          pinEl.innerHTML = `<div class="terminal-pin-inner ${polClass}"><span class="pin-sign">${sign}</span></div>`;
        }
      }

      // Terminal Drag Events for Wire Drawing
      const onPinStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Cancel background pan — touch on pin must draw wire, not pan
        if (this.panDrag) this.panDrag = null;
        this.startWireDrag(comp.id, pin.id, e);
      };

      pinEl.addEventListener('mousedown', onPinStart);
      pinEl.addEventListener('touchstart', onPinStart, { passive: false });

      node.appendChild(pinEl);
    });

    // Quick Replace / Repair Floating Button (Symbol-only on top-left corner)
    const quickBtn = document.createElement('button');
    quickBtn.className = 'comp-quick-replace-btn' + (comp.state.burnt ? ' burnt-fix' : '');
    quickBtn.innerHTML = comp.state.burnt ? '🔥' : '🔄';
    quickBtn.title = comp.state.burnt ? 'Replace burnt component' : 'Replace / swap component';
    quickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (comp.state.burnt) {
        this.repairBurntComponent(comp.id);
      } else {
        this.selectComponent(comp);
        this.toggleAdvancedSidebar(true);
        this.dom.inspReplaceSelect.focus();
      }
    });
    quickBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    quickBtn.addEventListener('touchstart', (e) => e.stopPropagation());
    node.appendChild(quickBtn);

    // Remove Component Floating Button with '✕' symbol (on top-right corner)
    const removeBtn = document.createElement('button');
    removeBtn.className = 'comp-remove-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.title = `Remove ${def.name}`;
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.removeComponent(comp.id);
    });
    removeBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    removeBtn.addEventListener('touchstart', (e) => e.stopPropagation());
    node.appendChild(removeBtn);

    // Interactive Mouse Rotation Handle & Button (Bottom-left corner of component)
    const rotateHandle = document.createElement('button');
    rotateHandle.type = 'button';
    rotateHandle.className = 'comp-rotate-handle comp-rotate-btn';
    rotateHandle.title = `Rotate ${def.name}: Drag with mouse to rotate freely (Shift: snap 15°) or click to turn 90° [Shortcut: R]`;
    rotateHandle.innerHTML = '↻';

    const onRotateHandleStart = (e) => {
      if (e.button === 2) return;
      e.preventDefault();
      e.stopPropagation();
      this.selectComponent(comp, false);
      const stageCoords = this.getEventStageCoords(e);
      const curDef = window.COMPONENT_DEFINITIONS[comp.type] || { width: 100, height: 60 };
      const cx = comp.x + curDef.width / 2;
      const cy = comp.y + curDef.height / 2;
      const startMouseRad = Math.atan2(stageCoords.y - cy, stageCoords.x - cx);
      const startAngle = comp.rotation || 0;
      this.rotateDrag = {
        comp,
        cx,
        cy,
        startAngle,
        startMouseRad,
        startX: stageCoords.x,
        startY: stageCoords.y,
        hasMoved: false,
        startSnapshot: this.takeSnapshot()
      };
      this.showTransformFeedback(comp, `Angle: ${Math.round(startAngle)}°`);
    };
    rotateHandle.addEventListener('mousedown', onRotateHandleStart);
    rotateHandle.addEventListener('touchstart', onRotateHandleStart, { passive: false });
    node.appendChild(rotateHandle);

    // Interactive Mouse Resize Handle (Corner drag at bottom-right)
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'comp-resize-handle';
    resizeHandle.title = `Drag with mouse to resize ${def.name} (Hold Shift to snap to 25%)`;
    resizeHandle.innerHTML = '⤡';

    const onResizeHandleStart = (e) => {
      if (e.button === 2) return;
      e.preventDefault();
      e.stopPropagation();
      this.selectComponent(comp, false);
      const stageCoords = this.getEventStageCoords(e);
      const curDef = window.COMPONENT_DEFINITIONS[comp.type] || { width: 100, height: 60 };
      const cx = comp.x + curDef.width / 2;
      const cy = comp.y + curDef.height / 2;
      const startDist = Math.max(15, Math.hypot(stageCoords.x - cx, stageCoords.y - cy));
      const startScale = comp.scale !== undefined ? comp.scale : 1.0;
      this.resizeDrag = {
        comp,
        cx,
        cy,
        startDist,
        startScale,
        startSnapshot: this.takeSnapshot()
      };
      this.showTransformFeedback(comp, `Scale: ${Math.round(startScale * 100)}% (${startScale.toFixed(2)}x)`);
    };
    resizeHandle.addEventListener('mousedown', onResizeHandleStart);
    resizeHandle.addEventListener('touchstart', onResizeHandleStart, { passive: false });
    node.appendChild(resizeHandle);

    // Mouse Wheel Scaling on Component Hover with Ctrl, Alt or Shift
    node.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.altKey || e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const curScale = comp.scale !== undefined ? comp.scale : 1.0;
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        const newScale = Math.min(2.5, Math.max(0.5, Math.round((curScale + delta) * 20) / 20));
        if (newScale !== curScale) {
          comp.scale = newScale;
          this.updateComponentVisual(comp);
          this.renderWires();
          this.showTransformFeedback(comp, `Scale: ${Math.round(newScale * 100)}% (${newScale.toFixed(2)}x)`);
          this.evaluateCircuit();
        }
      }
    }, { passive: false });

    // Live Telemetry Badge (Voltage, Current, Watts)
    const badge = document.createElement('div');
    badge.className = 'comp-telemetry-badge';
    badge.id = `telemetry-${comp.id}`;
    badge.innerHTML = `<span class="badge-v">0.00V</span> · <span class="badge-i">0.0mA</span> · <span class="badge-w">0.0mW</span>`;
    node.appendChild(badge);

    // Resistor: Standard Fixed Resistance Stepper Box (E12/E24 Preferred Values Only)
    if (comp.type === 'resistor') {
      const box = document.createElement('div');
      box.className = 'resistor-input-container';
      const initialR = window.getClosestStandardResistor(comp.state.resistance || 220);
      comp.state.resistance = initialR;
      box.innerHTML = `
        <button type="button" class="resistor-stepper-btn btn-res-down" title="Previous Standard Fixed Resistance (E12/E24 Series)">-</button>
        <input type="text" class="resistor-input" value="${window.formatResistance(initialR)}" title="Standard Preferred Fixed Resistance" readonly style="width: 54px; cursor: pointer;">
        <button type="button" class="resistor-stepper-btn btn-res-up" title="Next Standard Fixed Resistance (E12/E24 Series)">+</button>
      `;
      const inp = box.querySelector('.resistor-input');
      const btnDown = box.querySelector('.btn-res-down');
      const btnUp = box.querySelector('.btn-res-up');

      const applyStandardR = (targetVal) => {
        const std = window.getClosestStandardResistor(targetVal);
        if (comp.state.resistance === std) return;
        this.pushHistory();
        comp.state.resistance = std;
        inp.value = window.formatResistance(std);
        this.updateComponentVisual(comp);
        try {
          if (this.selectedComponent === comp) {
            this.showInspector(comp);
          }
          if (this.ohmsCalcActive && typeof this.updateOhmsCalcWindow === 'function') {
            this.updateOhmsCalcWindow();
          }
        } catch (e) {
          console.warn('Inspector update warning:', e);
        }
        this.evaluateCircuit();
      };

      const handleDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyStandardR(window.getPrevStandardResistor(comp.state.resistance || 220));
      };

      const handleUp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyStandardR(window.getNextStandardResistor(comp.state.resistance || 220));
      };

      [inp, btnDown, btnUp].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      btnDown.addEventListener('click', handleDown);
      btnDown.addEventListener('touchend', handleDown, { passive: false });

      btnUp.addEventListener('click', handleUp);
      btnUp.addEventListener('touchend', handleUp, { passive: false });

      inp.addEventListener('click', handleUp);
      inp.addEventListener('touchend', handleUp, { passive: false });

      node.appendChild(box);
    }

    // Potentiometer: Smooth Continuous Variable Resistor Box
    if (comp.type === 'potentiometer') {
      const box = document.createElement('div');
      box.className = 'resistor-input-container pot-input-container';
      const initialR = comp.state.resistance || 500;
      box.innerHTML = `
        <button type="button" class="resistor-stepper-btn btn-res-down" title="Decrease resistance (-50Ω)">-</button>
        <input type="number" class="resistor-input" min="1" max="100000" step="50" value="${initialR}" title="Type desired resistance in Ohms">
        <button type="button" class="resistor-stepper-btn btn-res-up" title="Increase resistance (+50Ω)">+</button>
        <span class="resistor-unit-label">Ω</span>
      `;
      const inp = box.querySelector('.resistor-input');
      const btnDown = box.querySelector('.btn-res-down');
      const btnUp = box.querySelector('.btn-res-up');

      const applyResistance = (val, recordHistory = true) => {
        const totalR = comp.state.totalResistance || 1000;
        const clamped = Math.max(1, Math.min(totalR, Math.round(val)));
        if (comp.state.resistance === clamped && comp.state.wiperRatio === (clamped / totalR)) return;
        if (recordHistory) this.pushHistory();
        comp.state.resistance = clamped;
        comp.state.wiperRatio = clamped / totalR;
        comp.state.r1 = Math.max(0.5, totalR - clamped);
        comp.state.r2 = Math.max(0.5, clamped);
        inp.value = clamped;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };

      [inp, btnDown, btnUp].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      inp.addEventListener('input', (e) => {
        applyResistance(parseFloat(e.target.value) || 10);
      });

      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        const cur = comp.state.resistance || initialR;
        const step = cur > 100 ? 50 : 10;
        applyResistance(cur - step);
      });

      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        const cur = comp.state.resistance || initialR;
        const step = cur >= 100 ? 50 : 10;
        applyResistance(cur + step);
      });

      node.appendChild(box);

      // Direct Interactive Rotary Dial Turning on Potentiometer D-Shaft Knob
      const shaftEl = node.querySelector('.comp-potentiometer');
      if (shaftEl) {
        let isTurning = false;
        const startTurn = (e) => {
          if (e.button === 2) return;
          if (e.target.closest('.resistor-input-container') || e.target.closest('.terminal-pin') || e.target.closest('.comp-rotate-btn') || e.target.closest('.comp-remove-btn')) return;

          const rect = node.getBoundingClientRect();
          const scaleX = rect.width / 190;
          const scaleY = rect.height / 226;
          const centerX = rect.left + 95 * scaleX;
          const centerY = rect.top + 74 * scaleY;
          const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
          if (dist > 45 * scaleX) return; // Only trigger inside knob radius

          isTurning = true;
          e.preventDefault();
          e.stopPropagation();

          const updateFromPointer = (ev) => {
            const pX = (ev.touches && ev.touches[0]) ? ev.touches[0].clientX : ev.clientX;
            const pY = (ev.touches && ev.touches[0]) ? ev.touches[0].clientY : ev.clientY;
            const dx = pX - centerX;
            const dy = pY - centerY;
            let deg = Math.atan2(dy, dx) * 180 / Math.PI;
            let rot = deg + 90;
            if (rot > 180) rot -= 360;
            if (rot < -180) rot += 360;
            const clampedRot = Math.max(-135, Math.min(135, rot));
            const newRatio = (clampedRot + 135) / 270;
            const totalR = comp.state.totalResistance || 1000;
            applyResistance(Math.round(newRatio * totalR), false);
          };

          const onMove = (ev) => {
            if (!isTurning) return;
            ev.preventDefault();
            updateFromPointer(ev);
          };

          const onEnd = () => {
            if (isTurning) {
              isTurning = false;
              this.pushHistory();
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onEnd);
              window.removeEventListener('touchmove', onMove);
              window.removeEventListener('touchend', onEnd);
            }
          };

          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onEnd);
          window.addEventListener('touchmove', onMove, { passive: false });
          window.addEventListener('touchend', onEnd);
        };

        shaftEl.addEventListener('mousedown', startTurn);
        shaftEl.addEventListener('touchstart', startTurn, { passive: false });
      }
    }

    // Step-Down Transformer Controls (Voltage Box & Stepper buttons)
    if (comp.type === 'transformer') {
      const box = document.createElement('div');
      box.className = 'transformer-input-container';
      const curSec = comp.state.secondaryV || 12;
      box.innerHTML = `
        <button type="button" class="resistor-stepper-btn btn-sec-down" title="Lower secondary voltage (-2V)">-</button>
        <input type="number" class="resistor-input" min="1" max="120" step="2" value="${curSec}" style="width: 42px;" title="Secondary Output Voltage">
        <button type="button" class="resistor-stepper-btn btn-sec-up" title="Higher secondary voltage (+2V)">+</button>
        <span class="resistor-unit-label">V~</span>
      `;
      const inp = box.querySelector('.resistor-input');
      const bDown = box.querySelector('.btn-sec-down');
      const bUp = box.querySelector('.btn-sec-up');

      const applySec = (val) => {
        const v = Math.max(1, Math.min(120, Math.round(val)));
        if (comp.state.secondaryV === v) return;
        this.pushHistory();
        comp.state.secondaryV = v;
        inp.value = v;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };

      [inp, bDown, bUp].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      inp.addEventListener('input', (e) => applySec(parseFloat(e.target.value) || 12));
      bDown.addEventListener('click', (e) => { e.stopPropagation(); applySec((comp.state.secondaryV || 12) - 2); });
      bUp.addEventListener('click', (e) => { e.stopPropagation(); applySec((comp.state.secondaryV || 12) + 2); });
      node.appendChild(box);
    }

    // AC Voltage Supply Controls (Voltage Box & Up/Down Stepper buttons)
    if (comp.type === 'ac_source') {
      const box = document.createElement('div');
      box.className = 'ac-input-container';
      const curV = comp.state.voltage || 230;
      box.innerHTML = `
        <button type="button" class="resistor-stepper-btn btn-ac-down" title="Decrease AC voltage (-10V)">-</button>
        <input type="number" class="resistor-input" min="1" max="500" step="10" value="${curV}" style="width: 48px;" title="Type desired AC voltage">
        <button type="button" class="resistor-stepper-btn btn-ac-up" title="Increase AC voltage (+10V)">+</button>
        <span class="resistor-unit-label">V~</span>
      `;
      const inp = box.querySelector('.resistor-input');
      const bDown = box.querySelector('.btn-ac-down');
      const bUp = box.querySelector('.btn-ac-up');

      const applyAC = (val) => {
        const v = Math.max(1, Math.min(500, Math.round(val)));
        if (comp.state.voltage === v) return;
        this.pushHistory();
        comp.state.voltage = v;
        inp.value = v;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };

      [inp, bDown, bUp].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      inp.addEventListener('input', (e) => applyAC(parseFloat(e.target.value) || 230));
      bDown.addEventListener('click', (e) => { e.stopPropagation(); applyAC((comp.state.voltage || 230) - 10); });
      bUp.addEventListener('click', (e) => { e.stopPropagation(); applyAC((comp.state.voltage || 230) + 10); });
      node.appendChild(box);
    }

    // LDR: Light Dependent Resistor Box with live Ohms & NTC/PTC toggle
    // LDR: Light Dependent Resistor Box with live Ohms & NTC/PTC toggle
    if (comp.type === 'ldr') {
      const box = document.createElement('div');
      box.className = 'ldr-res-badge';
      box.id = `ldr-badge-${comp.id}`;
      const isNeg = (comp.state.coefficient !== 'positive');
      const curLux = (comp.state.ambientLux !== undefined) ? comp.state.ambientLux : (comp.state.lux || 0);
      box.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; width: 100%;">
          <span class="ldr-icon" style="cursor: pointer; user-select: none;" title="Click to cycle illumination: ☀️ Sunlight ➔ 🌤️ Room Light ➔ 🌆 Twilight ➔ 🌑 Darkness">${curLux > 20 ? '☀️' : (curLux > 2 ? '🌤️' : '🌑')}</span>
          <span class="ldr-val" style="font-family: monospace; font-size: 0.74rem; font-weight: 800;">${window.formatResistance(comp.state.resistance || 10000)}</span>
          <button type="button" class="ldr-mode-pill" title="Click to toggle Negative (NTC) / Positive (PTC) coefficient">
            ${isNeg ? 'NTC' : 'PTC'}
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 4px; width: 100%; margin-top: 3px;" class="ldr-slider-container">
          <span style="font-size: 0.62rem;" title="Darkness (0 Lux)">🌑</span>
          <input type="range" class="ldr-canvas-slider" min="0" max="100" step="2" value="${curLux}" title="Drag ambient light / torch illumination" style="flex: 1; height: 4px; accent-color: #f59e0b; cursor: pointer;">
          <span style="font-size: 0.62rem;" title="Bright Sunlight (100 Lux)">☀️</span>
        </div>
      `;

      const cycleLight = (e) => {
        e.stopPropagation();
        const nowLux = (comp.state.ambientLux !== undefined) ? comp.state.ambientLux : (comp.state.lux || 0);
        let nextL = 0;
        if (nowLux < 2) nextL = 25; // Room light (~2.1kΩ)
        else if (nowLux < 15) nextL = 75; // Bright sunlight (~200Ω)
        else if (nowLux < 50) nextL = 100; // Direct torch (~150Ω)
        else nextL = 0; // Complete darkness (~100kΩ)

        comp.state.ambientLux = nextL;
        comp.state.lux = nextL;
        const s = box.querySelector('.ldr-canvas-slider');
        if (s) s.value = nextL;
        if (this.solver) this.solver.updateLDRSensors();
        this.evaluateCircuit();
        this.updateComponentVisual(comp);
      };

      box.querySelector('.ldr-icon').addEventListener('click', cycleLight);

      const slider = box.querySelector('.ldr-canvas-slider');
      slider.addEventListener('input', (e) => {
        e.stopPropagation();
        const newLux = parseFloat(e.target.value);
        comp.state.ambientLux = newLux;
        comp.state.lux = newLux;
        if (this.solver) this.solver.updateLDRSensors();
        this.evaluateCircuit();
        this.updateComponentVisual(comp);
      });

      box.querySelector('.ldr-mode-pill').addEventListener('click', (e) => {
        e.stopPropagation();
        comp.state.coefficient = (comp.state.coefficient === 'positive') ? 'negative' : 'positive';
        if (this.solver) this.solver.updateLDRSensors();
        this.evaluateCircuit();
        this.updateComponentVisual(comp);
      });

      [box, box.querySelector('.ldr-mode-pill'), slider, box.querySelector('.ldr-icon')].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });
      node.appendChild(box);
    }

    // Electrolytic Capacitor Stepper Box (Standard Values & Voltage Rating)
    if (comp.type === 'capacitor') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container';
      box.id = `cap-ctrl-${comp.id}`;
      const curCap = comp.state.capacitance || 1000;
      const curVolt = comp.state.ratedVoltage || 16;
      box.innerHTML = `
        <button type="button" class="cap-stepper-btn btn-cap-down" title="Previous Standard Capacitance (E6/E12 Series)">-</button>
        <button type="button" class="cap-code-pill" title="Click to pick or cycle standard capacitance values">${curCap}µF</button>
        <button type="button" class="cap-stepper-btn btn-cap-up" title="Next Standard Capacitance (E6/E12 Series)">+</button>
        <button type="button" class="cap-volt-btn" title="Click to cycle voltage rating (${curVolt}V)">${curVolt}V</button>
      `;
      const btnDown = box.querySelector('.btn-cap-down');
      const pill = box.querySelector('.cap-code-pill');
      const btnUp = box.querySelector('.btn-cap-up');
      const btnVolt = box.querySelector('.cap-volt-btn');

      const applyCap = (newC) => {
        const std = window.getClosestElectrolytic ? window.getClosestElectrolytic(newC) : Math.round(newC);
        this.pushHistory();
        comp.state.capacitance = std;
        pill.textContent = `${std}µF`;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
      };

      const applyVolt = (targetV) => {
        const nextV = targetV !== undefined ? targetV : (window.getNextElectrolyticVoltage ? window.getNextElectrolyticVoltage(comp.state.ratedVoltage || 16) : 16);
        this.pushHistory();
        comp.state.ratedVoltage = nextV;
        btnVolt.textContent = `${nextV}V`;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
      };

      let activePopover = null;
      const closePopover = () => {
        if (activePopover && activePopover.parentNode) {
          activePopover.parentNode.removeChild(activePopover);
          activePopover = null;
        }
      };

      const toggleCapPicker = () => {
        if (activePopover) {
          closePopover();
          return;
        }
        const pop = document.createElement('div');
        pop.className = 'cap-quick-popover';
        const stdVals = window.STANDARD_ELECTROLYTIC_VALUES || [1, 2.2, 3.3, 4.7, 10, 22, 33, 47, 100, 220, 330, 470, 1000, 2200, 3300, 4700, 6800, 10000];
        const curC = comp.state.capacitance || 1000;
        pop.innerHTML = `
          <div class="cap-popover-title">
            <span>Standard Capacitance</span>
            <span style="font-size: 0.65rem; color: #94a3b8;">E6/E12 (µF)</span>
          </div>
          <div class="cap-popover-grid">
            ${stdVals.map(v => `
              <button type="button" class="cap-popover-val-btn ${v === curC ? 'active' : ''}" data-val="${v}">
                ${v >= 1000 ? (v / 1000) + 'm' : v + 'µ'}
              </button>
            `).join('')}
          </div>
        `;
        [pop, ...pop.querySelectorAll('button')].forEach(el => {
          el.addEventListener('mousedown', (e) => e.stopPropagation());
          el.addEventListener('touchstart', (e) => e.stopPropagation());
        });
        pop.querySelectorAll('.cap-popover-val-btn').forEach(b => {
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            applyCap(parseFloat(b.dataset.val));
            closePopover();
          });
        });
        node.appendChild(pop);
        activePopover = pop;

        const onDocClick = (e) => {
          if (!pop.contains(e.target) && e.target !== pill) {
            closePopover();
            document.removeEventListener('mousedown', onDocClick);
          }
        };
        setTimeout(() => document.addEventListener('mousedown', onDocClick), 10);
      };

      [btnDown, pill, btnUp, btnVolt].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
        const prev = window.getPrevElectrolytic ? window.getPrevElectrolytic(comp.state.capacitance || 1000) : (comp.state.capacitance || 1000);
        applyCap(prev);
      });

      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
        const next = window.getNextElectrolytic ? window.getNextElectrolytic(comp.state.capacitance || 1000) : (comp.state.capacitance || 1000);
        applyCap(next);
      });

      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCapPicker();
      });

      btnVolt.addEventListener('click', (e) => {
        e.stopPropagation();
        closePopover();
        applyVolt();
      });

      node.appendChild(box);
    }

    // Ceramic Capacitor Stepper Box (EIA Standard 3-Digit Codes 101 -> 105)
    if (comp.type === 'ceramic_capacitor') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container ceramic';
      box.id = `cap-ctrl-${comp.id}`;
      const code = comp.state.ceramicCode || '104';
      const nf = comp.state.capacitanceNf || 100;
      const pf = comp.state.capacitancePf || (nf * 1000);
      const capLabel = pf < 1000 ? `${pf}pF` : (nf < 1000 ? `${nf}nF` : `${comp.state.capacitanceUf || (nf / 1000).toFixed(1)}µF`);
      box.innerHTML = `
        <button type="button" class="cap-stepper-btn btn-cer-down" title="Previous Standard Ceramic EIA Code">-</button>
        <button type="button" class="cap-code-pill ceramic" title="Click to cycle to next standard EIA code (120, 220, 101, 102, 103, 104...)">${code} • ${capLabel}</button>
        <button type="button" class="cap-stepper-btn btn-cer-up" title="Next Standard Ceramic EIA Code">+</button>
      `;
      const btnDown = box.querySelector('.btn-cer-down');
      const pill = box.querySelector('.cap-code-pill');
      const btnUp = box.querySelector('.btn-cer-up');

      const applyCeramic = (entry) => {
        if (!entry) return;
        this.pushHistory();
        comp.state.ceramicCode = entry.code;
        comp.state.capacitancePf = entry.pf;
        comp.state.capacitanceNf = entry.nf;
        comp.state.capacitanceUf = entry.uf;
        comp.state.capacitance = entry.uf;
        comp.state.effectiveCapacitanceUf = entry.uf;
        comp.state.esr = entry.esr || 0.010;
        comp.state.eslNh = entry.esl || 0.9;
        comp.state.dielectricClass = entry.dielectricClass;
        const entryLabel = entry.pf < 1000 ? `${entry.pf}pF` : (entry.nf < 1000 ? `${entry.nf}nF` : `${entry.uf}µF`);
        pill.textContent = `${entry.code} • ${entryLabel}`;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
      };

      [btnDown, pill, btnUp].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        const prev = window.getPrevCeramicCapacitor ? window.getPrevCeramicCapacitor(comp.state.ceramicCode || '104') : null;
        applyCeramic(prev);
      });

      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = window.getNextCeramicCapacitor ? window.getNextCeramicCapacitor(comp.state.ceramicCode || '104') : null;
        applyCeramic(next);
      });

      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = window.getNextCeramicCapacitor ? window.getNextCeramicCapacitor(comp.state.ceramicCode || '104') : null;
        applyCeramic(next);
      });

      node.appendChild(box);
    }

    // Inductor Value Stepper Box (Standard E12 Series 10µH to 100mH)
    if (comp.type === 'inductor') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container inductor';
      box.id = `ind-ctrl-${comp.id}`;
      const indMh = comp.state.inductanceMh || (comp.state.inductanceUh ? comp.state.inductanceUh / 1000 : 10);
      const dcr = comp.state.dcr || 0.8;
      box.innerHTML = `
        <button type="button" class="cap-stepper-btn btn-ind-down" title="Previous Standard Inductor Value">-</button>
        <button type="button" class="cap-code-pill inductor" title="Click to cycle to next standard inductance">${window.formatInductance ? window.formatInductance(indMh) : indMh + 'mH'} • ${dcr.toFixed(2)}Ω</button>
        <button type="button" class="cap-stepper-btn btn-ind-up" title="Next Standard Inductor Value">+</button>
      `;
      const btnDown = box.querySelector('.btn-ind-down');
      const pill = box.querySelector('.cap-code-pill');
      const btnUp = box.querySelector('.btn-ind-up');

      const applyInductor = (entry) => {
        if (!entry) return;
        this.pushHistory();
        comp.state.inductanceMh = entry.mh;
        comp.state.inductanceUh = entry.valUh;
        comp.state.dcr = entry.dcr;
        comp.state.isat = entry.isat;
        pill.textContent = `${window.formatInductance ? window.formatInductance(entry.mh) : entry.mh + 'mH'} • ${entry.dcr.toFixed(2)}Ω`;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
      };

      [btnDown, pill, btnUp].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        const prev = window.getPrevInductor ? window.getPrevInductor(comp.state.inductanceMh || 10) : null;
        applyInductor(prev);
      });

      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = window.getNextInductor ? window.getNextInductor(comp.state.inductanceMh || 10) : null;
        applyInductor(next);
      });

      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = window.getNextInductor ? window.getNextInductor(comp.state.inductanceMh || 10) : null;
        applyInductor(next);
      });

      node.appendChild(box);
    }

    // Regulated DC Power Supply On-Canvas Controls (Voltage 0-50V, Current Limit 0-5A, Output ON/OFF)
    if (comp.type === 'power_supply') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container power_supply';
      box.id = `ps-ctrl-${comp.id}`;
      const vVal = comp.state.voltage !== undefined ? comp.state.voltage : 12.0;
      const iVal = comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.50;
      const outOn = comp.state.outputEnabled !== false;
      const mode = comp.state.mode || 'cv';

      const formatLimitText = (amps) => {
        if (amps < 1.0) return `${Math.round(amps * 1000)}mA`;
        return `${amps.toFixed(2)}A`;
      };

      box.innerHTML = `
        <button type="button" class="power-supply-out-btn ${outOn ? 'on' : 'off'}" title="Toggle Output ON / OFF">${outOn ? '⚡ ON' : '⭕ OFF'}</button>
        <span class="ps-mode-badge ${mode}">${mode.toUpperCase()}</span>
        <button type="button" class="cap-stepper-btn btn-ps-v-down" title="Decrease Output Voltage (-1V)">-</button>
        <button type="button" class="cap-code-pill ps-v-pill" title="Click to cycle voltage (1.8V, 3.3V, 5V, 9V, 12V, 24V, 48V)" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">${vVal.toFixed(1)}V</button>
        <button type="button" class="cap-stepper-btn btn-ps-v-up" title="Increase Output Voltage (+1V)">+</button>
        <span style="color: #64748b; font-size: 0.75rem; margin: 0 1px;">|</span>
        <button type="button" class="cap-stepper-btn btn-ps-i-down" title="Decrease Current Limit">-</button>
        <button type="button" class="cap-code-pill ps-i-pill" title="Click to cycle current limit (20mA, 50mA, 100mA, 500mA, 1A, 2.5A, 5A)" style="color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);">${formatLimitText(iVal)}</button>
        <button type="button" class="cap-stepper-btn btn-ps-i-up" title="Increase Current Limit">+</button>
      `;

      const btnOut = box.querySelector('.power-supply-out-btn');
      const btnVDown = box.querySelector('.btn-ps-v-down');
      const pillV = box.querySelector('.ps-v-pill');
      const btnVUp = box.querySelector('.btn-ps-v-up');
      const btnIDown = box.querySelector('.btn-ps-i-down');
      const pillI = box.querySelector('.ps-i-pill');
      const btnIUp = box.querySelector('.btn-ps-i-up');
      const badgeMode = box.querySelector('.ps-mode-badge');

      const applyPS = () => {
        this.pushHistory();
        pillV.textContent = `${(comp.state.voltage !== undefined ? comp.state.voltage : 12).toFixed(1)}V`;
        pillI.textContent = formatLimitText(comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5);
        const on = comp.state.outputEnabled !== false;
        btnOut.className = `power-supply-out-btn ${on ? 'on' : 'off'}`;
        btnOut.textContent = on ? '⚡ ON' : '⭕ OFF';
        const curMode = comp.state.mode || 'cv';
        if (badgeMode) {
          badgeMode.className = `ps-mode-badge ${curMode}`;
          badgeMode.textContent = curMode.toUpperCase();
        }
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
      };

      [btnOut, btnVDown, pillV, btnVUp, btnIDown, pillI, btnIUp].forEach(el => {
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('touchstart', (e) => e.stopPropagation());
      });

      btnOut.addEventListener('click', (e) => {
        e.stopPropagation();
        comp.state.outputEnabled = comp.state.outputEnabled === false ? true : false;
        if (window.sounds && window.sounds.playSwitch) {
          window.sounds.playSwitch(comp.state.outputEnabled);
        }
        applyPS();
      });

      btnVDown.addEventListener('click', (e) => {
        e.stopPropagation();
        comp.state.voltage = Math.max(0, parseFloat(((comp.state.voltage || 12.0) - 1.0).toFixed(1)));
        applyPS();
      });

      btnVUp.addEventListener('click', (e) => {
        e.stopPropagation();
        comp.state.voltage = Math.min(50, parseFloat(((comp.state.voltage || 12.0) + 1.0).toFixed(1)));
        applyPS();
      });

      const vPresets = [1.8, 3.3, 5.0, 9.0, 12.0, 24.0, 48.0];
      pillV.addEventListener('click', (e) => {
        e.stopPropagation();
        const curV = comp.state.voltage || 12.0;
        let nextIdx = vPresets.findIndex(v => v > curV + 0.1);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.voltage = vPresets[nextIdx];
        applyPS();
      });

      btnIDown.addEventListener('click', (e) => {
        e.stopPropagation();
        const curVal = comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5;
        const step = curVal > 1.0 ? 0.25 : (curVal > 0.1 ? 0.05 : 0.01);
        comp.state.currentLimit = Math.max(0.01, parseFloat((curVal - step).toFixed(2)));
        applyPS();
      });

      btnIUp.addEventListener('click', (e) => {
        e.stopPropagation();
        const curVal = comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5;
        const step = curVal >= 1.0 ? 0.25 : (curVal >= 0.1 ? 0.05 : 0.01);
        comp.state.currentLimit = Math.min(5.0, parseFloat((curVal + step).toFixed(2)));
        applyPS();
      });

      const iPresets = [0.02, 0.05, 0.10, 0.50, 1.00, 2.50, 5.00];
      pillI.addEventListener('click', (e) => {
        e.stopPropagation();
        const curI = comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5;
        let nextIdx = iPresets.findIndex(i => i > curI + 0.005);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.currentLimit = iPresets[nextIdx];
        applyPS();
      });

      node.appendChild(box);
    }

    // Protective Glass Fuse On-Canvas Controls (Rating Adjustment 0.1A to 10.0A & Replace Button)
    if (comp.type === 'fuse') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container fuse';
      box.id = `fuse-ctrl-${comp.id}`;

      const renderFuseBoxContent = () => {
        const blown = comp.state.blown || comp.state.burnt;
        const rating = comp.state.rating !== undefined ? comp.state.rating : 2.0;
        if (blown) {
          box.innerHTML = `
            <button type="button" class="fuse-replace-btn btn-fuse-replace" title="Insert new fuse wire">🔄 Replace</button>
            <span class="cap-code-pill fuse blown" title="Fuse wire is blown from overcurrent!">💥 BLOWN</span>
          `;
          const btnRep = box.querySelector('.btn-fuse-replace');
          if (btnRep) {
            btnRep.addEventListener('mousedown', e => e.stopPropagation());
            btnRep.addEventListener('touchstart', e => e.stopPropagation());
            btnRep.addEventListener('click', e => {
              e.stopPropagation();
              this.pushHistory();
              comp.state.blown = false;
              comp.state.burnt = false;
              comp.state.burning = false;
              comp.state.burnReason = '';
              renderFuseBoxContent();
              this.updateComponentVisual(comp);
              this.evaluateCircuit();
              if (this.selectedComponent && this.selectedComponent.id === comp.id) {
                this.showInspector(comp);
              }
            });
          }
        } else {
          box.innerHTML = `
            <button type="button" class="cap-stepper-btn btn-fuse-down" title="Decrease Rating (-0.5A)">-</button>
            <button type="button" class="cap-code-pill fuse pill-fuse-val" title="Click to cycle rating (0.5A, 1A, 2A, 3.15A, 5A, 10A)">${rating.toFixed(1)}A Fuse</button>
            <button type="button" class="cap-stepper-btn btn-fuse-up" title="Increase Rating (+0.5A)">+</button>
          `;
          const btnDown = box.querySelector('.btn-fuse-down');
          const pill = box.querySelector('.pill-fuse-val');
          const btnUp = box.querySelector('.btn-fuse-up');

          const applyFuse = () => {
            this.pushHistory();
            renderFuseBoxContent();
            this.updateComponentVisual(comp);
            this.evaluateCircuit();
            if (this.selectedComponent && this.selectedComponent.id === comp.id) {
              this.showInspector(comp);
            }
          };

          [btnDown, pill, btnUp].forEach(el => {
            el.addEventListener('mousedown', e => e.stopPropagation());
            el.addEventListener('touchstart', e => e.stopPropagation());
          });

          btnDown.addEventListener('click', e => {
            e.stopPropagation();
            const val = Math.max(0.1, parseFloat(((comp.state.rating || comp.state.ratingAmps || 2.0) - 0.5).toFixed(1)));
            comp.state.rating = val;
            comp.state.ratingAmps = val;
            applyFuse();
          });

          btnUp.addEventListener('click', e => {
            e.stopPropagation();
            const val = Math.min(10.0, parseFloat(((comp.state.rating || comp.state.ratingAmps || 2.0) + 0.5).toFixed(1)));
            comp.state.rating = val;
            comp.state.ratingAmps = val;
            applyFuse();
          });

          const stdFuseRatings = [0.5, 1.0, 1.6, 2.0, 3.15, 5.0, 6.3, 10.0];
          pill.addEventListener('click', e => {
            e.stopPropagation();
            const curVal = comp.state.rating || comp.state.ratingAmps || 2.0;
            let nextIdx = stdFuseRatings.findIndex(r => r > curVal + 0.05);
            if (nextIdx === -1) nextIdx = 0;
            const val = stdFuseRatings[nextIdx];
            comp.state.rating = val;
            comp.state.ratingAmps = val;
            applyFuse();
          });
        }
      };

      renderFuseBoxContent();
      node.appendChild(box);
    }

    // Precision Ammeter On-Canvas Controls (AC/DC Selector & Fuse Replacement)
    if (comp.type === 'ammeter') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container ammeter';
      box.id = `ammeter-ctrl-${comp.id}`;

      const renderAmmeterBoxContent = () => {
        const isBlown = comp.state.fuseBlown || comp.state.burnt;
        const mode = (comp.state.mode || 'dc').toLowerCase();
        const isAC = (mode === 'ac');

        box.classList.toggle('ac-active', isAC);

        if (isBlown) {
          box.innerHTML = `
            <button type="button" class="fuse-replace-btn btn-ammeter-fuse-replace" title="Replace 10A internal fast-acting ceramic protection fuse">🔄 Replace 10A Fuse</button>
            <span class="cap-code-pill fuse blown" title="Internal 10A fuse blown from parallel short or overcurrent!">💥 10A FUSE BLOWN</span>
          `;
          const btnRep = box.querySelector('.btn-ammeter-fuse-replace');
          if (btnRep) {
            btnRep.addEventListener('mousedown', e => e.stopPropagation());
            btnRep.addEventListener('touchstart', e => e.stopPropagation());
            btnRep.addEventListener('click', e => {
              e.stopPropagation();
              this.pushHistory();
              comp.state.fuseBlown = false;
              comp.state.blown = false;
              comp.state.burnt = false;
              comp.state.burning = false;
              comp.state.burnReason = '';
              comp.state.reading = comp.state.mode === 'ac' ? '~ 0.000 A' : '0.000 A';
              if (window.sounds && window.sounds.playSwitch) window.sounds.playSwitch(true);
              renderAmmeterBoxContent();
              this.updateComponentVisual(comp);
              this.evaluateCircuit();
              if (this.selectedComponent && this.selectedComponent.id === comp.id) {
                this.showInspector(comp);
              }
              if (typeof this.showToast === 'function') {
                this.showToast('Installed fresh 10A ceramic protection fuse in Ammeter.', 'success');
              }
            });
          }
        } else {
          box.innerHTML = `
            <button type="button" class="cap-code-pill ammeter-mode-toggle-pill ${isAC ? 'mode-ac' : 'mode-dc'}" style="padding: 4px 10px; font-weight: 800; cursor: pointer; border-radius: 12px; background: ${isAC ? '#f59e0b' : '#0284c7'}; color: #ffffff; border: 1px solid ${isAC ? '#fbbf24' : '#38bdf8'}; font-family: var(--font-mono); font-size: 0.72rem;" title="Click to toggle Current Mode (DC ⎓ vs AC ~ True RMS)">
              ${isAC ? '⚡ AC CURRENT (~)' : '🔋 DC CURRENT (⎓)'}
            </button>
          `;
          const pill = box.querySelector('.ammeter-mode-toggle-pill');
          if (pill) {
            pill.addEventListener('mousedown', e => e.stopPropagation());
            pill.addEventListener('touchstart', e => e.stopPropagation());
            pill.addEventListener('click', e => {
              e.stopPropagation();
              this.pushHistory();
              comp.state.mode = (comp.state.mode === 'ac') ? 'dc' : 'ac';
              if (window.sounds && window.sounds.playSwitch) {
                window.sounds.playSwitch(comp.state.mode === 'ac');
              }
              renderAmmeterBoxContent();
              this.updateComponentVisual(comp);
              this.evaluateCircuit();
              if (this.selectedComponent && this.selectedComponent.id === comp.id) {
                this.showInspector(comp);
              }
              if (typeof this.showToast === 'function') {
                this.showToast(`Ammeter switched to ${comp.state.mode === 'ac' ? '⚡ AC Mode (~ RMS)' : '🔋 DC Mode (⎓ Direct)'}`, 'info');
              }
            });
          }
        }
      };

      box.__renderAmmeterBoxContent = renderAmmeterBoxContent;
      renderAmmeterBoxContent();
      node.appendChild(box);
    }

    // Arbitrary Function Generator On-Canvas Controls (Waveform, Freq Stepper, Amp Stepper, Output Toggle)
    if (comp.type === 'function_generator') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container function_generator';
      box.id = `fg-ctrl-${comp.id}`;

      const waveforms = [
        { id: 'sine', label: '∿ SINE' },
        { id: 'square', label: '⊓ SQR' },
        { id: 'triangle', label: '⋀ TRI' },
        { id: 'ramp', label: '⊿ RAMP' },
        { id: 'dc', label: '⎓ DC' }
      ];

      const freqPresets = [1, 10, 50, 100, 440, 1000, 5000, 10000, 50000, 100000];
      const ampPresets = [0.5, 1.0, 2.0, 3.3, 5.0, 10.0, 12.0, 15.0, 20.0];

      const renderFGBoxContent = () => {
        const on = comp.state.outputEnabled !== false;
        const wave = comp.state.waveform || 'sine';
        const waveObj = waveforms.find(w => w.id === wave) || waveforms[0];
        const freq = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
        const amp = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 5.0;

        let freqStr = `${freq}Hz`;
        if (freq >= 1000) freqStr = `${(freq / 1000).toFixed(freq % 1000 === 0 ? 0 : 1)}kHz`;

        const isHiZ = comp.state.outputImpedance === 'highz' || comp.state.outputImpedance === 'high_z';
        const impStr = isHiZ ? 'Hi-Z' : '50Ω';
        const duty = comp.state.dutyCycle !== undefined ? comp.state.dutyCycle : 50;

        box.innerHTML = `
          <button type="button" class="fg-out-btn ${on ? '' : 'off'}" title="Toggle Signal Output ON/OFF">${on ? '⚡ ON' : '⭕ OFF'}</button>
          <button type="button" class="fg-wave-pill" title="Cycle Waveform (Sine, Square, Triangle, Ramp, DC)">${waveObj.label}</button>
          <button type="button" class="cap-stepper-btn btn-fg-f-down" title="Lower Frequency">-</button>
          <button type="button" class="cap-code-pill pill-fg-f" title="Click to cycle common frequencies">${freqStr}</button>
          <button type="button" class="cap-stepper-btn btn-fg-f-up" title="Higher Frequency">+</button>
          <button type="button" class="cap-code-pill pill-fg-v" title="Click to cycle amplitudes">${amp.toFixed(1)}Vpp</button>
          ${wave === 'square' ? `<button type="button" class="cap-code-pill pill-fg-duty" title="Click to cycle square wave duty cycle (20%, 50%, 80%)">${duty}% D</button>` : ''}
          <button type="button" class="cap-code-pill pill-fg-imp" title="Click to toggle output impedance (50Ω vs High-Z)">${impStr}</button>
        `;

        const applyFG = () => {
          this.pushHistory();
          renderFGBoxContent();
          this.updateComponentVisual(comp);
          this.evaluateCircuit();
          if (this.selectedComponent && this.selectedComponent.id === comp.id) {
            this.showInspector(comp);
          }
        };

        const btnOut = box.querySelector('.fg-out-btn');
        const wavePill = box.querySelector('.fg-wave-pill');
        const btnFDown = box.querySelector('.btn-fg-f-down');
        const pillF = box.querySelector('.pill-fg-f');
        const btnFUp = box.querySelector('.btn-fg-f-up');
        const pillV = box.querySelector('.pill-fg-v');
        const pillDuty = box.querySelector('.pill-fg-duty');
        const pillImp = box.querySelector('.pill-fg-imp');

        [btnOut, wavePill, btnFDown, pillF, btnFUp, pillV, pillDuty, pillImp].forEach(el => {
          if (!el) return;
          el.addEventListener('mousedown', e => e.stopPropagation());
          el.addEventListener('touchstart', e => e.stopPropagation());
        });

        btnOut.addEventListener('click', e => {
          e.stopPropagation();
          comp.state.outputEnabled = comp.state.outputEnabled === false ? true : false;
          applyFG();
        });

        wavePill.addEventListener('click', e => {
          e.stopPropagation();
          const curWave = comp.state.waveform || 'sine';
          const curIdx = waveforms.findIndex(w => w.id === curWave);
          const nextIdx = (curIdx + 1) % waveforms.length;
          comp.state.waveform = waveforms[nextIdx].id;
          applyFG();
        });

        btnFDown.addEventListener('click', e => {
          e.stopPropagation();
          let f = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
          if (f > 1000) f = Math.max(1000, f - 1000);
          else if (f > 100) f = Math.max(100, f - 100);
          else if (f > 10) f = Math.max(10, f - 10);
          else f = Math.max(0.1, f - 1);
          comp.state.frequency = Math.round(f * 10) / 10;
          applyFG();
        });

        btnFUp.addEventListener('click', e => {
          e.stopPropagation();
          let f = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
          if (f >= 1000) f = Math.min(100000, f + 1000);
          else if (f >= 100) f = Math.min(1000, f + 100);
          else if (f >= 10) f = Math.min(100, f + 10);
          else f = Math.min(10, f + 1);
          comp.state.frequency = Math.round(f * 10) / 10;
          applyFG();
        });

        pillF.addEventListener('click', e => {
          e.stopPropagation();
          const curF = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
          let nextIdx = freqPresets.findIndex(fp => fp > curF + 0.5);
          if (nextIdx === -1) nextIdx = 0;
          comp.state.frequency = freqPresets[nextIdx];
          applyFG();
        });

        pillV.addEventListener('click', e => {
          e.stopPropagation();
          const curA = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 5.0;
          let nextIdx = ampPresets.findIndex(ap => ap > curA + 0.1);
          if (nextIdx === -1) nextIdx = 0;
          comp.state.amplitudeVpp = ampPresets[nextIdx];
          applyFG();
        });

        if (pillDuty) {
          pillDuty.addEventListener('click', e => {
            e.stopPropagation();
            const curD = comp.state.dutyCycle !== undefined ? comp.state.dutyCycle : 50;
            const dutyPresets = [20, 50, 80];
            let nextIdx = dutyPresets.indexOf(curD) + 1;
            if (nextIdx >= dutyPresets.length || nextIdx < 0) nextIdx = 0;
            comp.state.dutyCycle = dutyPresets[nextIdx];
            applyFG();
          });
        }

        if (pillImp) {
          pillImp.addEventListener('click', e => {
            e.stopPropagation();
            const isHz = comp.state.outputImpedance === 'highz' || comp.state.outputImpedance === 'high_z';
            comp.state.outputImpedance = isHz ? '50ohm' : 'highz';
            applyFG();
          });
        }
      };

      renderFGBoxContent();
      node.appendChild(box);
    }

    // Digital Storage Oscilloscope (DSO) On-Canvas Controls
    if (comp.type === 'oscilloscope') {
      const box = document.createElement('div');
      box.className = 'cap-stepper-container oscilloscope';
      box.id = `dso-ctrl-${comp.id}`;

      const timebasePresets = [0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.5];

      const renderDSOBoxContent = () => {
        const isRun = (comp.state.runStop || 'run') === 'run';
        const isSingle = (comp.state.runStop === 'single');
        const tb = comp.state.timeDiv !== undefined ? comp.state.timeDiv : (comp.state.timebaseSec !== undefined ? comp.state.timebaseSec : 0.001);
        const ch1On = comp.state.ch1Enabled !== false;
        const ch2On = !!comp.state.ch2Enabled;
        const mathMode = comp.state.mathMode || 'off';
        const decodeMode = comp.state.decodeMode || 'off';

        let tbStr = '1.0ms';
        if (tb >= 1.0) tbStr = `${tb.toFixed(1)}s`;
        else if (tb >= 0.001) tbStr = `${(tb * 1000).toFixed(tb % 0.001 === 0 ? 0 : 1)}ms`;
        else tbStr = `${(tb * 1000000).toFixed(0)}µs`;

        box.innerHTML = `
          <button type="button" class="dso-run-btn ${isRun ? '' : 'stop'}" title="Toggle Run / Stop (Freeze Acquisition)">${isRun ? '▶ RUN' : '⏸ STOP'}</button>
          <button type="button" class="dso-single-btn ${isSingle ? 'active' : ''}" style="background: ${isSingle ? '#854d0e' : '#1e293b'}; border: 1px solid ${isSingle ? '#f59e0b' : '#475569'}; color: ${isSingle ? '#fbbf24' : '#94a3b8'}; padding: 4px 7px; border-radius: 4px; font-weight: 800; font-size: 11px; cursor: pointer;" title="Arm Single-Shot Sequence Acquisition">⚡ SINGLE</button>
          <button type="button" class="dso-ch1-btn ${ch1On ? '' : 'off'}" title="Toggle Channel 1 (Yellow Trace)">CH1: ${ch1On ? 'ON' : 'OFF'}</button>
          <button type="button" class="dso-ch2-btn ${ch2On ? '' : 'off'}" title="Toggle Channel 2 (Cyan Trace)">CH2: ${ch2On ? 'ON' : 'OFF'}</button>
          <button type="button" class="dso-xy-btn" style="background: ${comp.state.xyMode ? '#78350f' : '#1e293b'}; border: 1px solid ${comp.state.xyMode ? '#f59e0b' : '#475569'}; color: ${comp.state.xyMode ? '#fde68a' : '#94a3b8'}; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 11px; cursor: pointer;" title="Toggle Lissajous XY Plot">XY: ${comp.state.xyMode ? 'ON' : 'OFF'}</button>
          <button type="button" class="dso-cursor-btn" style="background: ${comp.state.cursorMode && comp.state.cursorMode !== 'off' ? '#7c2d12' : '#1e293b'}; border: 1px solid ${comp.state.cursorMode && comp.state.cursorMode !== 'off' ? '#f97316' : '#475569'}; color: ${comp.state.cursorMode && comp.state.cursorMode !== 'off' ? '#fed7aa' : '#94a3b8'}; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 11px; cursor: pointer;" title="Cycle Cursors (OFF, VOLTAGE, TIME)">CURS: ${(comp.state.cursorMode || 'off').toUpperCase()}</button>
          <button type="button" class="dso-math-btn" style="background: ${mathMode !== 'off' ? '#701a75' : '#1e293b'}; border: 1px solid ${mathMode !== 'off' ? '#e879f9' : '#475569'}; color: ${mathMode !== 'off' ? '#f5d0fe' : '#94a3b8'}; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 11px; cursor: pointer;" title="Cycle Math Trace (OFF, ADD, SUB, FFT)">MATH: ${mathMode.toUpperCase()}</button>
          <button type="button" class="dso-decode-btn" style="background: ${decodeMode !== 'off' ? '#78350f' : '#1e293b'}; border: 1px solid ${decodeMode !== 'off' ? '#f59e0b' : '#475569'}; color: ${decodeMode !== 'off' ? '#fde68a' : '#94a3b8'}; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 11px; cursor: pointer;" title="Cycle Bus Protocol Decode (OFF, UART, I2C, SPI)">BUS: ${decodeMode.toUpperCase()}</button>
          <button type="button" class="cap-stepper-btn btn-dso-tb-down" title="Zoom In Time (Faster Timebase)">-</button>
          <button type="button" class="cap-code-pill pill-dso-tb" title="Click to cycle timebase scale">${tbStr}/div</button>
          <button type="button" class="cap-stepper-btn btn-dso-tb-up" title="Zoom Out Time (Slower Timebase)">+</button>
          <button type="button" class="dso-auto-btn" title="Autoset: Automatically lock frequency and voltage scaling">⚡ AUTO</button>
        `;

        const applyDSO = () => {
          this.pushHistory();
          renderDSOBoxContent();
          this.updateComponentVisual(comp);
          this.evaluateCircuit();
          if (this.selectedComponent && this.selectedComponent.id === comp.id) {
            this.showInspector(comp);
          }
        };

        const btnRun = box.querySelector('.dso-run-btn');
        const btnSingle = box.querySelector('.dso-single-btn');
        const btnCh1 = box.querySelector('.dso-ch1-btn');
        const btnCh2 = box.querySelector('.dso-ch2-btn');
        const btnXy = box.querySelector('.dso-xy-btn');
        const btnCursor = box.querySelector('.dso-cursor-btn');
        const btnMath = box.querySelector('.dso-math-btn');
        const btnBus = box.querySelector('.dso-decode-btn');
        const btnDown = box.querySelector('.btn-dso-tb-down');
        const pillTb = box.querySelector('.pill-dso-tb');
        const btnUp = box.querySelector('.btn-dso-tb-up');
        const btnAuto = box.querySelector('.dso-auto-btn');

        [btnRun, btnSingle, btnCh1, btnCh2, btnXy, btnCursor, btnMath, btnBus, btnDown, pillTb, btnUp, btnAuto].forEach(el => {
          if (!el) return;
          el.addEventListener('mousedown', e => e.stopPropagation());
          el.addEventListener('touchstart', e => e.stopPropagation());
        });

        btnRun.addEventListener('click', e => {
          e.stopPropagation();
          comp.state.runStop = comp.state.runStop === 'stop' ? 'run' : 'stop';
          applyDSO();
        });

        btnSingle.addEventListener('click', e => {
          e.stopPropagation();
          comp.state.runStop = 'single';
          comp.state.singleArmed = true;
          comp.state.singleTriggered = false;
          applyDSO();
        });

        btnCh1.addEventListener('click', e => {
          e.stopPropagation();
          comp.state.ch1Enabled = !comp.state.ch1Enabled;
          applyDSO();
        });

        btnCh2.addEventListener('click', e => {
          e.stopPropagation();
          comp.state.ch2Enabled = !comp.state.ch2Enabled;
          applyDSO();
        });

        if (btnXy) {
          btnXy.addEventListener('click', e => {
            e.stopPropagation();
            comp.state.xyMode = !comp.state.xyMode;
            applyDSO();
          });
        }

        if (btnCursor) {
          btnCursor.addEventListener('click', e => {
            e.stopPropagation();
            const curModes = ['off', 'voltage', 'time'];
            const curMode = comp.state.cursorMode || 'off';
            comp.state.cursorMode = curModes[(curModes.indexOf(curMode) + 1) % curModes.length];
            applyDSO();
          });
        }

        btnMath.addEventListener('click', e => {
          e.stopPropagation();
          const modes = ['off', 'add', 'sub', 'fft'];
          const next = modes[(modes.indexOf(comp.state.mathMode || 'off') + 1) % modes.length];
          comp.state.mathMode = next;
          applyDSO();
        });

        btnBus.addEventListener('click', e => {
          e.stopPropagation();
          const dModes = ['off', 'uart', 'i2c', 'spi'];
          const next = dModes[(dModes.indexOf((comp.state.decodeMode || 'off').toLowerCase()) + 1) % dModes.length];
          comp.state.decodeMode = next;
          applyDSO();
        });

        btnDown.addEventListener('click', e => {
          e.stopPropagation();
          const curTb = comp.state.timeDiv || 0.001;
          const idx = timebasePresets.findIndex(t => t >= curTb - 1e-7);
          const nextIdx = Math.max(0, (idx === -1 ? timebasePresets.length - 1 : idx) - 1);
          comp.state.timeDiv = timebasePresets[nextIdx];
          comp.state.timebaseSec = timebasePresets[nextIdx];
          applyDSO();
        });

        btnUp.addEventListener('click', e => {
          e.stopPropagation();
          const curTb = comp.state.timeDiv || 0.001;
          const idx = timebasePresets.findIndex(t => t >= curTb + 1e-7);
          const nextIdx = idx === -1 ? timebasePresets.length - 1 : Math.min(timebasePresets.length - 1, idx);
          comp.state.timeDiv = timebasePresets[nextIdx];
          comp.state.timebaseSec = timebasePresets[nextIdx];
          applyDSO();
        });

        pillTb.addEventListener('click', e => {
          e.stopPropagation();
          const curTb = comp.state.timeDiv || 0.001;
          let idx = timebasePresets.findIndex(t => t > curTb + 1e-7);
          if (idx === -1) idx = 0;
          comp.state.timeDiv = timebasePresets[idx];
          comp.state.timebaseSec = timebasePresets[idx];
          applyDSO();
        });

        btnAuto.addEventListener('click', e => {
          e.stopPropagation();
          this.autosetOscilloscope(comp);
          applyDSO();
        });
      };

      renderDSOBoxContent();
      node.appendChild(box);
    }

    // Component Drag / Selection / Switch Toggles
    const onNodeStart = (e) => {
      // Right-click is reserved exclusively for component technical specifications (handled by contextmenu)
      if (e.button === 2) return;

      // Precision Ammeter Hardware Mode Switch Button on Dial Face
      if (e.target.closest('.ammeter-mode-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        comp.state.mode = (comp.state.mode === 'ac') ? 'dc' : 'ac';
        if (window.sounds && window.sounds.playSwitch) {
          window.sounds.playSwitch(comp.state.mode === 'ac');
        }
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
        if (typeof this.showToast === 'function') {
          this.showToast(`Ammeter switched to ${comp.state.mode === 'ac' ? '⚡ AC Mode (~ RMS)' : '🔋 DC Mode (⎓ Direct)'}`, 'info');
        }
        return;
      }

      // Precision Regulated DC Power Supply Hardware Button/Knobs on Faceplate
      if (e.target.closest('.ps-output-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        comp.state.outputEnabled = (comp.state.outputEnabled === false);
        if (window.sounds && window.sounds.playSwitch) {
          window.sounds.playSwitch(comp.state.outputEnabled);
        }
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
        if (typeof this.showToast === 'function') {
          this.showToast(`DC Power Supply Output ${comp.state.outputEnabled ? '⚡ ENERGIZED (ON)' : '⭕ DISCONNECTED (OFF)'}`, comp.state.outputEnabled ? 'success' : 'info');
        }
        return;
      }

      if (e.target.closest('.ps-volt-knob')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const vPresets = [1.8, 3.3, 5.0, 9.0, 12.0, 24.0, 48.0];
        const curV = comp.state.voltage !== undefined ? comp.state.voltage : 12.0;
        let nextIdx = vPresets.findIndex(v => v > curV + 0.1);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.voltage = vPresets[nextIdx];
        if (window.sounds && window.sounds.playTone) {
          window.sounds.playTone(300 + nextIdx * 80, 0.06);
        }
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
        if (typeof this.showToast === 'function') {
          this.showToast(`Voltage dialed to ${comp.state.voltage.toFixed(1)}V DC`, 'info');
        }
        return;
      }

      if (e.target.closest('.ps-curr-knob')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const iPresets = [0.02, 0.05, 0.10, 0.50, 1.00, 2.50, 5.00];
        const curI = comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.50;
        let nextIdx = iPresets.findIndex(i => i > curI + 0.005);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.currentLimit = iPresets[nextIdx];
        if (window.sounds && window.sounds.playTone) {
          window.sounds.playTone(250 + nextIdx * 70, 0.06);
        }
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          this.showInspector(comp);
        }
        const iStr = comp.state.currentLimit < 1 ? `${Math.round(comp.state.currentLimit * 1000)}mA` : `${comp.state.currentLimit.toFixed(2)}A`;
        if (typeof this.showToast === 'function') {
          this.showToast(`Current limit clamped to ${iStr}`, 'info');
        }
        return;
      }

      if (e.target.closest('.fg-output-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        comp.state.outputEnabled = comp.state.outputEnabled === false ? true : false;
        if (window.sounds && window.sounds.playSwitch) window.sounds.playSwitch(comp.state.outputEnabled);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`Function Generator Output: ${comp.state.outputEnabled ? 'ON' : 'OFF'}`, 'info');
        }
        return;
      }

      if (e.target.closest('.fg-wave-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const btn = e.target.closest('.fg-wave-btn');
        let targetWave = btn.dataset.wave || 'sine';
        if (targetWave === 'cycle') {
          const cycList = ['noise', 'cardiac', 'dc'];
          const curIdx = cycList.indexOf(comp.state.waveform);
          targetWave = cycList[(curIdx + 1) % cycList.length];
        }
        comp.state.waveform = targetWave;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(440, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`Waveform: ${targetWave.toUpperCase()}`, 'info');
        }
        return;
      }

      if (e.target.closest('.fg-mod-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const modModes = ['none', 'am', 'fm', 'sweep', 'burst'];
        const curMod = comp.state.modulation || 'none';
        const nextMod = modModes[(modModes.indexOf(curMod) + 1) % modModes.length];
        comp.state.modulation = nextMod;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(600, 0.06);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`Modulation: ${nextMod.toUpperCase()}`, 'info');
        }
        return;
      }

      if (e.target.closest('.fg-freq-knob')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const fPresets = [10, 50, 100, 440, 1000, 5000, 10000, 50000, 100000];
        const curF = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
        let nextIdx = fPresets.findIndex(f => f > curF + 0.5);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.frequency = fPresets[nextIdx];
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(300 + nextIdx * 50, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        const fStr = comp.state.frequency >= 1000 ? `${(comp.state.frequency / 1000).toFixed(1)} kHz` : `${comp.state.frequency} Hz`;
        if (typeof this.showToast === 'function') {
          this.showToast(`Frequency: ${fStr}`, 'info');
        }
        return;
      }

      if (e.target.closest('.fg-ampl-readout')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const aPresets = [0.5, 1.0, 2.0, 3.3, 5.0, 10.0, 12.0, 15.0, 20.0];
        const curA = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 10.0;
        let nextIdx = aPresets.findIndex(a => a > curA + 0.1);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.amplitudeVpp = aPresets[nextIdx];
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(350 + nextIdx * 40, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`Amplitude: ${comp.state.amplitudeVpp.toFixed(1)} Vpp`, 'info');
        }
        return;
      }

      if (e.target.closest('.fg-term-badge')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const isHz = comp.state.outputImpedance === 'highz' || comp.state.outputImpedance === 'high_z';
        comp.state.outputImpedance = isHz ? '50ohm' : 'highz';
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(500, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`Output Termination: ${comp.state.outputImpedance === 'highz' ? 'High-Z (Open)' : '50 Ω (Matched)'}`, 'info');
        }
        return;
      }

      // DSO Front-Panel Interactive Click Targets
      if (e.target.closest('.dso-run-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        comp.state.runStop = comp.state.runStop === 'stop' ? 'run' : 'stop';
        if (window.sounds && window.sounds.playSwitch) window.sounds.playSwitch(comp.state.runStop === 'run');
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`DSO: ${comp.state.runStop === 'run' ? 'RUN (Live Acquisition)' : 'STOP (Frozen Memory)'}`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-single-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        comp.state.runStop = 'single';
        comp.state.singleArmed = true;
        comp.state.singleTriggered = false;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(880, 0.08);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast('DSO: SINGLE Sequence Armed (Waiting for trigger)', 'info');
        }
        return;
      }

      if (e.target.closest('.dso-auto-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.autosetOscilloscope(comp);
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast('DSO: AUTOSET Complete', 'info');
        }
        return;
      }

      if (e.target.closest('.dso-ch1-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const cpls = ['dc', 'ac', 'gnd'];
        const nextCpl = cpls[(cpls.indexOf((comp.state.ch1Coupling || 'dc').toLowerCase()) + 1) % cpls.length];
        comp.state.ch1Coupling = nextCpl;
        comp.state.ch1Enabled = true;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(520, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`CH1 Coupling: ${nextCpl.toUpperCase()}`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-ch2-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        if (!comp.state.ch2Enabled) {
          comp.state.ch2Enabled = true;
        } else {
          const cpls = ['dc', 'ac', 'gnd'];
          const curIdx = cpls.indexOf((comp.state.ch2Coupling || 'dc').toLowerCase());
          if (curIdx === cpls.length - 1) {
            comp.state.ch2Enabled = false;
            comp.state.ch2Coupling = 'dc';
          } else {
            comp.state.ch2Coupling = cpls[curIdx + 1];
          }
        }
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(650, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`CH2: ${comp.state.ch2Enabled ? comp.state.ch2Coupling.toUpperCase() : 'OFF'}`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-math-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const modes = ['off', 'add', 'sub', 'fft'];
        const next = modes[(modes.indexOf(comp.state.mathMode || 'off') + 1) % modes.length];
        comp.state.mathMode = next;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(700, 0.06);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          const names = { off: 'OFF', add: 'ADD (CH1 + CH2)', sub: 'SUB (CH1 - CH2 Differential)', fft: 'FFT (Frequency Domain Spectrum)' };
          this.showToast(`DSO MATH: ${names[next] || next}`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-decode-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const dModes = ['off', 'uart', 'i2c', 'spi'];
        const next = dModes[(dModes.indexOf((comp.state.decodeMode || 'off').toLowerCase()) + 1) % dModes.length];
        comp.state.decodeMode = next;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(600, 0.06);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`DSO Bus Decode: ${next.toUpperCase()}`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-xy-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        comp.state.xyMode = !comp.state.xyMode;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(550, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`DSO XY Mode: ${comp.state.xyMode ? 'ON (Lissajous Figure Plot)' : 'OFF (YT Timebase)'}`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-cursor-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const curModes = ['off', 'voltage', 'time'];
        const curMode = comp.state.cursorMode || 'off';
        const nextMode = curModes[(curModes.indexOf(curMode) + 1) % curModes.length];
        comp.state.cursorMode = nextMode;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(480, 0.05);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`DSO Cursors: ${nextMode.toUpperCase()}`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-timebase-knob')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const tbPresets = [0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5];
        const curTb = comp.state.timebaseSec || comp.state.timeDiv || 0.001;
        let nextIdx = tbPresets.findIndex(t => t > curTb + 1e-7);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.timeDiv = tbPresets[nextIdx];
        comp.state.timebaseSec = tbPresets[nextIdx];
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(400 + nextIdx * 30, 0.04);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        const fmt = comp.state.timeDiv >= 1 ? `${comp.state.timeDiv}s` : (comp.state.timeDiv >= 0.001 ? `${comp.state.timeDiv * 1000}ms` : `${comp.state.timeDiv * 1e6}µs`);
        if (typeof this.showToast === 'function') {
          this.showToast(`Timebase: ${fmt}/div`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-vdiv1-knob')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const vPresets = [0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];
        const curV = comp.state.ch1VoltsDiv || comp.state.ch1Scale || 2.0;
        let nextIdx = vPresets.findIndex(v => v > curV + 0.01);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.ch1VoltsDiv = vPresets[nextIdx];
        comp.state.ch1Scale = vPresets[nextIdx];
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(350 + nextIdx * 30, 0.04);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        const vStr = comp.state.ch1VoltsDiv >= 1 ? `${comp.state.ch1VoltsDiv}V` : `${comp.state.ch1VoltsDiv * 1000}mV`;
        if (typeof this.showToast === 'function') {
          this.showToast(`CH1: ${vStr}/div`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-vdiv2-knob')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const vPresets = [0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];
        const curV = comp.state.ch2VoltsDiv || comp.state.ch2Scale || 2.0;
        let nextIdx = vPresets.findIndex(v => v > curV + 0.01);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.ch2VoltsDiv = vPresets[nextIdx];
        comp.state.ch2Scale = vPresets[nextIdx];
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(350 + nextIdx * 30, 0.04);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        const vStr = comp.state.ch2VoltsDiv >= 1 ? `${comp.state.ch2VoltsDiv}V` : `${comp.state.ch2VoltsDiv * 1000}mV`;
        if (typeof this.showToast === 'function') {
          this.showToast(`CH2: ${vStr}/div`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-trig-knob')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        const lvls = [0.0, 1.0, 2.0, 5.0, -1.0, -2.0];
        const curLvl = comp.state.triggerLevel !== undefined ? comp.state.triggerLevel : 0.0;
        let nextIdx = lvls.findIndex(l => l > curLvl + 0.1);
        if (nextIdx === -1) nextIdx = 0;
        comp.state.triggerLevel = lvls[nextIdx];
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(480, 0.04);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(`Trigger Level: ${comp.state.triggerLevel.toFixed(1)}V`, 'info');
        }
        return;
      }

      if (e.target.closest('.dso-cal-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this.pushHistory();
        comp.state.calActive = !comp.state.calActive;
        if (window.sounds && window.sounds.playTone) window.sounds.playTone(1000, 0.08);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (this.selectedComponent && this.selectedComponent.id === comp.id) this.showInspector(comp);
        if (typeof this.showToast === 'function') {
          this.showToast(comp.state.calActive ? 'DSO: Probed Internal 1kHz 3.0Vpp Calibrator' : 'DSO: Disconnected Calibrator', 'info');
        }
        return;
      }

      if (e.target.closest('.terminal-pin') || e.target.closest('.comp-quick-replace-btn') ||
        e.target.closest('.comp-remove-btn') || e.target.closest('.comp-rotate-btn') ||
        e.target.closest('.comp-rotate-handle') || e.target.closest('.comp-resize-handle') ||
        e.target.closest('.resistor-input-container') || e.target.closest('.transformer-input-container') ||
        e.target.closest('.ac-input-container') || e.target.closest('.ldr-res-badge') ||
        e.target.closest('.cap-stepper-container')) return;

      // Cancel any background pan started from same touch event bubbling
      if (this.panDrag) this.panDrag = null;

      const coords = this.getEventStageCoords(e);

      // Digital Logic Gate input toggle buttons on component body
      if (comp.type && comp.type.startsWith('gate_')) {
        const toggleBtn = e.target.closest('.gate-input-toggle');
        if (toggleBtn) {
          e.stopPropagation();
          const p = toggleBtn.dataset.pin;
          this.pushHistory();
          if (p === 'a') {
            comp.state.manualA = comp.state.manualA ? 0 : 1;
          } else if (p === 'b') {
            comp.state.manualB = comp.state.manualB ? 0 : 1;
          }
          if (window.sounds && typeof window.sounds.playSwitch === 'function') {
            window.sounds.playSwitch(true);
          }
          this.updateComponentVisual(comp);
          this.evaluateCircuit();
          return;
        }
      }

      // Digital Logic IC quick interactive PWR toggle
      if (comp.type && comp.type.startsWith('ic_')) {
        const pwrBtn = e.target.closest('.ic-pwr-toggle');
        if (pwrBtn) {
          e.stopPropagation();
          this.pushHistory();
          comp.state.manualPower = !comp.state.manualPower;
          if (window.sounds && typeof window.sounds.playSwitch === 'function') {
            window.sounds.playSwitch(comp.state.manualPower);
          }
          this.updateComponentVisual(comp);
          this.evaluateCircuit();
          return;
        }
      }

      // Single Pole switch toggle
      if (comp.type === 'switch') {
        this.pushHistory();
        comp.state.closed = !comp.state.closed;
        window.sounds.playSwitch(comp.state.closed);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      }

      // Pushbutton switch toggle / press
      if (comp.type === 'pushbutton') {
        this.pushHistory();
        comp.state.pressed = !comp.state.pressed;
        window.sounds.playSwitch(comp.state.pressed);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      }

      // Two-way switch toggle (SPDT: COM <-> L1 or COM <-> L2)
      if (comp.type === 'twowayswitch') {
        this.pushHistory();
        comp.state.position = (comp.state.position === 1 ? 2 : 1);
        window.sounds.playSwitch(true);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      }

      // LDR Photo-Sensor: Click to toggle illumination (Daylight <-> Darkness)
      if (comp.type === 'ldr') {
        const curLux = (comp.state.ambientLux !== undefined) ? comp.state.ambientLux : (comp.state.lux || 0);
        let nextLux = 0;
        if (curLux < 2) nextLux = 35; // Switch to daylight (35 Lux)
        else if (curLux < 15) nextLux = 80; // Switch to direct torch / bright sun (80 Lux)
        else nextLux = 0; // Switch to darkness (0 Lux)

        this.pushHistory();
        comp.state.ambientLux = nextLux;
        comp.state.lux = nextLux;
        if (this.solver) this.solver.updateLDRSensors();
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        if (window.sounds && window.sounds.playSwitch) window.sounds.playSwitch(nextLux > 10);
      }

      this.selectComponent(comp, false);
      this.compDrag = {
        comp,
        startX: comp.x,
        startY: comp.y,
        startSnapshot: this.takeSnapshot(),
        offsetX: coords.x - comp.x,
        offsetY: coords.y - comp.y
      };
      this.showTrashZone();
    };

    node.addEventListener('mousedown', onNodeStart);
    node.addEventListener('touchstart', onNodeStart, { passive: false });

    node.title = `${def.name} (Right-click for Technical Specifications ⚙️)`;

    // Right-click exclusively triggers the component's Technical Specifications Data Sheet
    node.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showTechnicalSpecificationsModal(comp);
    });

    // Mobile / Touchscreen: Long-press (700ms) acts as right-click for specifications
    // Note: drag is tracked separately; if touch moved > 8px the timer is cancelled
    let touchTimer = null;
    node.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        const startX = e.touches[0].clientX;
        const startY = e.touches[0].clientY;
        touchTimer = setTimeout(() => {
          // Only show specs if user hasn't moved (i.e. no drag started)
          if (!this.compDrag || this.compDrag.comp.id !== comp.id) {
            this.showTechnicalSpecificationsModal(comp);
          }
          touchTimer = null;
        }, 700);
      }
    }, { passive: true });

    node.addEventListener('touchmove', () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    }, { passive: true });

    node.addEventListener('touchend', () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    }, { passive: true });

    node.addEventListener('mouseenter', () => {
      this.updateTopbarComponentPill(comp);
    });
    node.addEventListener('mouseleave', () => {
      if (this.selectedComponent) {
        this.updateTopbarComponentPill(this.selectedComponent);
      } else {
        this.updateTopbarComponentPill(null);
      }
    });

    if (this.dom && this.dom.componentsContainer) {
      this.dom.componentsContainer.appendChild(node);
    }
    this.positionComponentOverlays(comp);
  }

  autosetOscilloscope(comp) {
    if (!comp || comp.type !== 'oscilloscope') return;
    if (this.wires && this.wires.length > 0) {
      this.evaluateCircuit();
    }

    const s1 = comp.state.ch1 || comp.state.ch1Signal || {};
    const s2 = comp.state.ch2 || comp.state.ch2Signal || {};

    const f1 = s1.freq || 0;
    const f2 = s2.freq || 0;
    const vpp1 = s1.vpp || 0;
    const vpp2 = s2.vpp || 0;

    const primaryFreq = f1 > 0 ? f1 : (f2 > 0 ? f2 : 1000);
    const period = 1 / Math.max(1, primaryFreq);
    // On a 10-division screen, display ~2 to 3 full waveform cycles:
    const targetSecPerDiv = (period * 2.5) / 10;

    const tbPresets = [0.00001, 0.00002, 0.00005, 0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5];
    let bestTb = tbPresets[0];
    let minDiff = Infinity;
    for (const tb of tbPresets) {
      const diff = Math.abs(Math.log10(tb) - Math.log10(targetSecPerDiv));
      if (diff < minDiff) {
        minDiff = diff;
        bestTb = tb;
      }
    }
    comp.state.timebaseSec = bestTb;
    comp.state.timeDiv = bestTb;

    // Optimal vertical scaling: target ~3 to 5 divisions height on 8-division screen
    const vPresets = [0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];
    const pickVdiv = (vpp) => {
      if (vpp <= 0.01) return 2.0;
      const targetDiv = vpp / 4.0;
      let bestV = vPresets[0];
      let vDiff = Infinity;
      for (const v of vPresets) {
        const diff = Math.abs(v - targetDiv);
        if (diff < vDiff) {
          vDiff = diff;
          bestV = v;
        }
      }
      return bestV;
    };

    comp.state.ch1Scale = pickVdiv(vpp1);
    comp.state.ch1VoltsDiv = comp.state.ch1Scale;
    comp.state.ch2Scale = pickVdiv(vpp2);
    comp.state.ch2VoltsDiv = comp.state.ch2Scale;

    // Default trigger settings
    comp.state.triggerSource = f1 > 0 ? 'ch1' : (f2 > 0 ? 'ch2' : 'ch1');
    comp.state.triggerSlope = 'rising';
    comp.state.triggerEdge = 'rising';
    comp.state.triggerLevel = 0.0;
    comp.state.runStop = 'run';

    if (vpp1 > 0.01) comp.state.ch1Enabled = true;
    if (vpp2 > 0.01) comp.state.ch2Enabled = true;

    this.pushHistory();
    this.updateComponentVisual(comp);
    if (this.wires && this.wires.length > 0) {
      this.evaluateCircuit();
    }
  }

  updateComponentDomPos(comp) {
    const el = document.getElementById(`node-${comp.id}`);
    if (el) {
      el.style.left = `${comp.x}px`;
      el.style.top = `${comp.y}px`;
    }
  }

  positionComponentOverlays(comp) {
    const el = document.getElementById(`node-${comp.id}`);
    if (!el) return;

    const def = window.COMPONENT_DEFINITIONS ? window.COMPONENT_DEFINITIONS[comp.type] : null;
    const w = def ? def.width : (parseFloat(el.style.width) || 100);
    const h = def ? def.height : (parseFloat(el.style.height) || 120);
    const cx = w / 2;
    const cy = h / 2;

    const rot = ((comp.rotation || 0) % 360 + 360) % 360;
    const rad = (rot * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    // Visual bounding box half-extents in screen orientation
    const wHalf = (w * Math.abs(cosR) + h * Math.abs(sinR)) / 2;
    const hHalf = (w * Math.abs(sinR) + h * Math.abs(cosR)) / 2;

    // Helper to convert screen displacement (xs, ys) relative to component visual center to local node coordinates (x, y)
    const toLocal = (xs, ys) => {
      const u = xs * cosR + ys * sinR;
      const v = -xs * sinR + ys * cosR;
      return { x: cx + u, y: cy + v };
    };

    // 1. Floating Header (Schematic Symbol + Component Name)
    // Always positioned directly ABOVE the component in screen space with a generous safe clearance
    const headerEl = document.getElementById(`header-${comp.id}`) || el.querySelector('.comp-floating-header');
    if (headerEl) {
      const isTransistor = comp.type === 'npn' || comp.type === 'pnp';
      const headerH = isTransistor ? 88 : 56;
      const clearanceTop = 22; // safe distance above top edge & terminals
      const ysHeader = -(hHalf + clearanceTop + headerH / 2);
      const locHdr = toLocal(0, ysHeader);

      headerEl.style.left = `${Math.round(locHdr.x)}px`;
      headerEl.style.top = `${Math.round(locHdr.y)}px`;
      headerEl.style.bottom = 'auto';
      headerEl.style.right = 'auto';
      headerEl.style.transformOrigin = 'center center';
      headerEl.style.transform = `translate(-50%, -50%) rotate(${-rot}deg)`;
    }

    // 2. Telemetry Badge (Live V, mA, mW)
    // Always positioned directly BELOW the component in bottom-center with a generous safe clearance
    const telEl = document.getElementById(`telemetry-${comp.id}`) || el.querySelector('.comp-telemetry-badge');
    if (telEl) {
      const telH = 24;
      const clearanceBottom = 38; // safe distance below bottom edge, action buttons & terminals
      const ysTel = +(hHalf + clearanceBottom + telH / 2);
      const locTel = toLocal(0, ysTel);

      telEl.style.left = `${Math.round(locTel.x)}px`;
      telEl.style.top = `${Math.round(locTel.y)}px`;
      telEl.style.bottom = 'auto';
      telEl.style.right = 'auto';
      telEl.style.transformOrigin = 'center center';
      telEl.style.transform = `translate(-50%, -50%) rotate(${-rot}deg)`;
    }

    // 3. Action Buttons & Handles (Quick-Replace, Remove, Rotate, Resize)
    // Distributed cleanly to all four corners without any overlap:
    // Top-Left:     Quick Replace / Repair
    // Top-Right:    Remove Component (✕)
    // Bottom-Left:  Rotate 90° (⟳)
    // Bottom-Right: Resize Drag Handle (⤡)
    const quickBtn = el.querySelector('.comp-quick-replace-btn');
    if (quickBtn) {
      const loc = toLocal(-(wHalf + 8), -(hHalf - 8));
      quickBtn.style.left = `${Math.round(loc.x)}px`;
      quickBtn.style.top = `${Math.round(loc.y)}px`;
      quickBtn.style.bottom = 'auto';
      quickBtn.style.right = 'auto';
      quickBtn.style.transformOrigin = 'center center';
      quickBtn.style.transform = `translate(-50%, -50%) rotate(${-rot}deg)`;
      quickBtn.style.setProperty('--btn-rot', `${-rot}deg`);
    }

    const removeBtn = el.querySelector('.comp-remove-btn');
    if (removeBtn) {
      // Top-Right corner: standard universally across UI for delete/close
      const loc = toLocal(+(wHalf + 8), -(hHalf - 8));
      removeBtn.style.left = `${Math.round(loc.x)}px`;
      removeBtn.style.top = `${Math.round(loc.y)}px`;
      removeBtn.style.bottom = 'auto';
      removeBtn.style.right = 'auto';
      removeBtn.style.transformOrigin = 'center center';
      removeBtn.style.transform = `translate(-50%, -50%) rotate(${-rot}deg)`;
      removeBtn.style.setProperty('--btn-rot', `${-rot}deg`);
    }

    const rotateHandle = el.querySelector('.comp-rotate-handle') || el.querySelector('.comp-rotate-btn');
    if (rotateHandle) {
      // Bottom-Left corner: interactive mouse rotation + 90° quick click
      const loc = toLocal(-(wHalf + 8), +(hHalf + 8));
      rotateHandle.style.left = `${Math.round(loc.x)}px`;
      rotateHandle.style.top = `${Math.round(loc.y)}px`;
      rotateHandle.style.bottom = 'auto';
      rotateHandle.style.right = 'auto';
      rotateHandle.style.transformOrigin = 'center center';
      rotateHandle.style.transform = `translate(-50%, -50%) rotate(${-rot}deg)`;
      rotateHandle.style.setProperty('--btn-rot', `${-rot}deg`);
    }

    const resizeHandle = el.querySelector('.comp-resize-handle');
    if (resizeHandle) {
      // Bottom-Right corner: standard for graphical resize grip
      const loc = toLocal(+(wHalf + 8), +(hHalf + 8));
      resizeHandle.style.left = `${Math.round(loc.x)}px`;
      resizeHandle.style.top = `${Math.round(loc.y)}px`;
      resizeHandle.style.bottom = 'auto';
      resizeHandle.style.right = 'auto';
      resizeHandle.style.transformOrigin = 'center center';
      resizeHandle.style.transform = `translate(-50%, -50%) rotate(${-rot}deg)`;
      resizeHandle.style.setProperty('--btn-rot', `${-rot}deg`);
    }
  }

  updateComponentVisual(comp) {
    const el = document.getElementById(`node-${comp.id}`);
    if (!el) return;
    const def = window.COMPONENT_DEFINITIONS ? window.COMPONENT_DEFINITIONS[comp.type] : null;
    if (def) {
      if (el.style.width !== `${def.width}px`) el.style.width = `${def.width}px`;
      if (el.style.height !== `${def.height}px`) el.style.height = `${def.height}px`;
    }

    const rot = comp.rotation || 0;
    const scale = comp.scale !== undefined ? comp.scale : 1.0;
    el.style.transform = `rotate(${rot}deg) scale(${scale})`;
    el.style.transformOrigin = 'center center';
    el.style.setProperty('--comp-counter-rot', `${-rot}deg`);

    const svgEl = el.querySelector('.comp-svg');
    if (svgEl) {
      if (def && svgEl.getAttribute('viewBox') !== `0 0 ${def.width} ${def.height}`) {
        svgEl.setAttribute('viewBox', `0 0 ${def.width} ${def.height}`);
      }
      svgEl.innerHTML = window.ComponentRenderer.renderSVG(comp);
    }
    const quickBtn = el.querySelector('.comp-quick-replace-btn');
    if (quickBtn) {
      quickBtn.className = 'comp-quick-replace-btn' + (comp.state.burnt ? ' burnt-fix' : '');
      quickBtn.innerHTML = comp.state.burnt ? '🔥' : '🔄';
    }
    if (comp.type === 'ammeter') {
      const amBox = el.querySelector(`#ammeter-ctrl-${comp.id}`);
      if (amBox && typeof amBox.__renderAmmeterBoxContent === 'function') {
        amBox.__renderAmmeterBoxContent();
      }
    }
    const headerNameEl = el.querySelector('.comp-header-name-badge');
    if (headerNameEl) {
      headerNameEl.textContent = window.ComponentRenderer.getComponentDisplayName(comp);
    }
    const headerSymbolBadge = el.querySelector('.comp-header-symbol-badge');
    if (headerSymbolBadge) {
      const isTransistor = comp.type === 'npn' || comp.type === 'pnp';
      if (isTransistor) {
        headerSymbolBadge.classList.add('symbol-badge-transistor');
        if (comp.type === 'pnp') {
          headerSymbolBadge.classList.add('badge-pnp');
        } else {
          headerSymbolBadge.classList.remove('badge-pnp');
        }
      } else {
        headerSymbolBadge.classList.remove('symbol-badge-transistor');
        headerSymbolBadge.classList.remove('badge-pnp');
      }
      const symSvg = headerSymbolBadge.querySelector('svg');
      if (symSvg) {
        symSvg.setAttribute('viewBox', isTransistor ? '0 0 88 56' : '0 0 28 18');
        symSvg.innerHTML = window.ComponentRenderer.getSchematicSymbol(comp.type, comp);
      }
    }

    this.positionComponentOverlays(comp);

    // Sync pin positions from component definition
    let pinsMoved = false;
    if (def && def.terminals && comp.terminals) {
      comp.terminals.forEach(pin => {
        const defPin = def.terminals.find(t => t.id === pin.id);
        if (defPin) {
          if (pin.x !== defPin.x || pin.y !== defPin.y) {
            pin.x = defPin.x;
            pin.y = defPin.y;
            pinsMoved = true;
          }
          const pinEl = document.getElementById(`pin-${comp.id}-${pin.id}`);
          if (pinEl) {
            pinEl.style.left = `${pin.x}px`;
            pinEl.style.top = `${pin.y}px`;
            if (comp.type === 'npn' || comp.type === 'pnp') {
              const role = pin.id;
              const roleName = (role === 'b') ? 'BASE' : (role === 'c' ? 'COLLECTOR' : 'EMITTER');
              const roleClass = (role === 'b') ? 'pin-trans-base' : (role === 'c' ? 'pin-trans-collector' : 'pin-trans-emitter');
              pinEl.dataset.role = role;
              pinEl.title = `${roleName} (${role.toUpperCase()}) Terminal`;
            }
          }
        }
      });
    }
    if (pinsMoved && typeof this.renderWires === 'function') {
      this.renderWires();
    }

    // Update Resistance Input Value for Resistors & Potentiometers
    if (comp.type === 'resistor') {
      const compInp = el.querySelector('.resistor-input');
      if (compInp && document.activeElement !== compInp) {
        compInp.value = window.formatResistance(comp.state.resistance || 220);
      }
    } else if (comp.type === 'potentiometer') {
      const compInp = el.querySelector('.resistor-input');
      if (compInp && document.activeElement !== compInp) {
        compInp.value = comp.state.resistance || 500;
      }
    }

    // Update Transformer secondary voltage input
    if (comp.type === 'transformer') {
      const secInp = el.querySelector('.transformer-input-container .resistor-input');
      if (secInp && document.activeElement !== secInp) {
        secInp.value = comp.state.secondaryV || 12;
      }
    }

    // Update AC Source voltage input
    if (comp.type === 'ac_source') {
      const acInp = el.querySelector('.ac-input-container .resistor-input');
      if (acInp && document.activeElement !== acInp) {
        acInp.value = comp.state.voltage || 230;
      }
    }

    // Update LDR resistance badge
    if (comp.type === 'ldr') {
      const ldrVal = el.querySelector('.ldr-val');
      const ldrIcon = el.querySelector('.ldr-icon');
      const ldrPill = el.querySelector('.ldr-mode-pill');
      if (ldrVal) ldrVal.textContent = window.formatResistance(comp.state.resistance || 10000);
      if (ldrIcon) ldrIcon.textContent = (comp.state.lux || 0) > 8 ? '☀️' : '🌑';
      if (ldrPill) ldrPill.textContent = (comp.state.coefficient === 'positive') ? 'PTC' : 'NTC';
    }

    // Update Electrolytic Capacitor stepper badges
    if (comp.type === 'capacitor') {
      const pill = el.querySelector('.cap-code-pill');
      if (pill) pill.textContent = `${comp.state.capacitance || 1000}µF`;
      const voltBtn = el.querySelector('.cap-volt-btn');
      if (voltBtn) voltBtn.textContent = `${comp.state.ratedVoltage || 16}V`;
    }

    // Update Ceramic Capacitor stepper badges
    if (comp.type === 'ceramic_capacitor') {
      const pill = el.querySelector('.cap-code-pill');
      if (pill) {
        const nf = comp.state.capacitanceNf || 100;
        const pf = comp.state.capacitancePf || (nf * 1000);
        const capLabel = pf < 1000 ? `${pf}pF` : (nf < 1000 ? `${nf}nF` : `${comp.state.capacitanceUf || (nf / 1000).toFixed(1)}µF`);
        pill.textContent = `${comp.state.ceramicCode || '104'} • ${capLabel}`;
      }
    }

    // Update Power Supply stepper badges & button
    if (comp.type === 'power_supply') {
      const vPill = el.querySelector('.ps-v-pill');
      if (vPill) vPill.textContent = `${(comp.state.voltage !== undefined ? comp.state.voltage : 12.0).toFixed(1)}V`;
      const iPill = el.querySelector('.ps-i-pill');
      if (iPill) {
        const lim = (comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5);
        iPill.textContent = lim < 1.0 ? `${Math.round(lim * 1000)}mA` : `${lim.toFixed(2)}A`;
      }
      const btnOut = el.querySelector('.power-supply-out-btn');
      if (btnOut) {
        const on = comp.state.outputEnabled !== false;
        btnOut.className = `power-supply-out-btn ${on ? 'on' : 'off'}`;
        btnOut.textContent = on ? '⚡ ON' : '⭕ OFF';
      }
      const modeBadge = el.querySelector('.ps-mode-badge');
      if (modeBadge) {
        const curMode = comp.state.mode || 'cv';
        modeBadge.className = `ps-mode-badge ${curMode}`;
        modeBadge.textContent = curMode.toUpperCase();
      }
    }

    // Update Fuse stepper badges & button
    if (comp.type === 'fuse') {
      const pill = el.querySelector('.cap-code-pill.fuse');
      const isBlown = comp.state.blown || comp.state.burnt;
      const rating = comp.state.ratingAmps !== undefined ? comp.state.ratingAmps : 2.0;
      if (pill) {
        pill.className = `cap-code-pill fuse ${isBlown ? 'blown' : ''}`;
        pill.textContent = isBlown ? `💥 BLOWN (${rating >= 1 ? rating.toFixed(1) : rating.toFixed(2)}A)` : `🛡️ ${rating >= 1 ? rating.toFixed(1) : rating.toFixed(2)}A FUSE`;
      }
      const replaceBtn = el.querySelector('.fuse-replace-btn');
      if (replaceBtn) {
        replaceBtn.style.display = isBlown ? 'inline-block' : 'none';
      }
    }

    // Update Function Generator stepper badges & buttons
    if (comp.type === 'function_generator') {
      const on = comp.state.outputEnabled !== false;
      const btnOut = el.querySelector('.fg-out-btn');
      if (btnOut) {
        btnOut.className = `fg-out-btn ${on ? '' : 'off'}`;
        btnOut.textContent = on ? '⚡ ON' : '⭕ OFF';
      }
      const wavePill = el.querySelector('.fg-wave-pill');
      if (wavePill) {
        const wave = comp.state.waveform || 'sine';
        const labels = { sine: '∿ SINE', square: '⊓ SQR', triangle: '⋀ TRI', ramp: '⊿ RAMP', dc: '⎓ DC' };
        wavePill.textContent = labels[wave] || '∿ SINE';
      }
      const pillF = el.querySelector('.pill-fg-f');
      if (pillF) {
        const freq = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
        let freqStr = `${freq}Hz`;
        if (freq >= 1000) freqStr = `${(freq / 1000).toFixed(freq % 1000 === 0 ? 0 : 1)}kHz`;
        pillF.textContent = freqStr;
      }
      const pillV = el.querySelector('.pill-fg-v');
      if (pillV) {
        const amp = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 5.0;
        pillV.textContent = `${amp.toFixed(1)}Vpp`;
      }
    }

    // Update Oscilloscope stepper badges & buttons
    if (comp.type === 'oscilloscope') {
      const isStopped = comp.state.runStop === 'stop';
      // HTML Overlay buttons
      const htmlBtnRun = el.querySelector('button.dso-run-btn');
      if (htmlBtnRun) {
        htmlBtnRun.className = `dso-run-btn ${isStopped ? 'stop' : ''}`;
        htmlBtnRun.textContent = isStopped ? '⏸ STOP' : '▶ RUN';
      }
      const htmlBtnCh1 = el.querySelector('button.dso-ch1-btn');
      if (htmlBtnCh1) {
        const ch1On = comp.state.ch1Enabled !== false;
        htmlBtnCh1.className = `dso-ch1-btn ${ch1On ? '' : 'off'}`;
        htmlBtnCh1.textContent = `CH1: ${ch1On ? 'ON' : 'OFF'}`;
      }
      const htmlBtnCh2 = el.querySelector('button.dso-ch2-btn');
      if (htmlBtnCh2) {
        const ch2On = comp.state.ch2Enabled !== false;
        htmlBtnCh2.className = `dso-ch2-btn ${ch2On ? '' : 'off'}`;
        htmlBtnCh2.textContent = `CH2: ${ch2On ? 'ON' : 'OFF'}`;
      }
      const pillTb = el.querySelector('.pill-dso-tb');
      if (pillTb) {
        const tb = comp.state.timebaseSec || 0.001;
        pillTb.textContent = tb >= 1 ? `${tb}s` : (tb >= 0.001 ? `${(tb * 1000).toFixed(tb >= 0.01 ? 0 : 1)}ms` : `${(tb * 1e6).toFixed(0)}µs`);
      }

      // Front-panel SVG buttons
      const svgBtnRun = el.querySelector('g.dso-run-btn');
      if (svgBtnRun) {
        const rect = svgBtnRun.querySelector('rect');
        if (rect) {
          rect.setAttribute('fill', isStopped ? '#7f1d1d' : '#78350f');
          rect.setAttribute('stroke', isStopped ? '#ef4444' : '#f59e0b');
        }
        const txt = svgBtnRun.querySelector('text');
        if (txt) {
          txt.textContent = isStopped ? 'STOP' : 'RUN';
        }
      }
      const svgBtnCh1 = el.querySelector('g.dso-ch1-btn');
      if (svgBtnCh1) {
        const ch1On = comp.state.ch1Enabled !== false;
        const rect = svgBtnCh1.querySelector('rect');
        if (rect) {
          rect.setAttribute('fill', ch1On ? '#713f12' : '#1e293b');
          rect.setAttribute('stroke', ch1On ? '#eab308' : '#475569');
        }
        const txt = svgBtnCh1.querySelector('text');
        if (txt) {
          txt.setAttribute('fill', ch1On ? '#fef08a' : '#94a3b8');
        }
      }
      const svgBtnCh2 = el.querySelector('g.dso-ch2-btn');
      if (svgBtnCh2) {
        const ch2On = comp.state.ch2Enabled !== false;
        const rect = svgBtnCh2.querySelector('rect');
        if (rect) {
          rect.setAttribute('fill', ch2On ? '#0e7490' : '#1e293b');
          rect.setAttribute('stroke', ch2On ? '#06b6d4' : '#475569');
        }
        const txt = svgBtnCh2.querySelector('text');
        if (txt) {
          txt.setAttribute('fill', ch2On ? '#a5f3fc' : '#94a3b8');
        }
      }
    }

    // Update Component Telemetry Badge (V, mA, Watts)
    const badge = el.querySelector(`#telemetry-${comp.id}`);
    if (badge) {
      if (comp.type === 'oscilloscope') {
        const ch1 = comp.state.ch1 || {};
        const ch2 = comp.state.ch2 || {};
        const ch1Vpp = ch1.vpp !== undefined ? ch1.vpp : 0;
        const ch2Vpp = ch2.vpp !== undefined ? ch2.vpp : 0;
        const ch1Freq = ch1.freq !== undefined ? ch1.freq : 0;
        const ch2Freq = ch2.freq !== undefined ? ch2.freq : 0;
        const fmtF = (f) => f >= 1000 ? `${(f / 1000).toFixed(1)}k` : `${Math.round(f)}`;
        const isAcquiring = comp.state.runStop !== 'stop' && (ch1Vpp > 0.01 || ch2Vpp > 0.01);
        badge.classList.toggle('active-power', isAcquiring);
        const ch1Str = ch1Vpp >= 1 ? `${ch1Vpp.toFixed(2)}Vpp` : `${(ch1Vpp * 1000).toFixed(0)}mV`;
        const ch2Str = ch2Vpp >= 1 ? `${ch2Vpp.toFixed(2)}Vpp` : `${(ch2Vpp * 1000).toFixed(0)}mV`;
        badge.innerHTML = `<span style="color:#fde047;font-weight:700;">CH1: ${ch1Str} (${fmtF(ch1Freq)}Hz)</span> · <span style="color:#67e8f9;font-weight:700;">CH2: ${ch2Str} (${fmtF(ch2Freq)}Hz)</span>`;
      } else if (comp.type === 'function_generator') {
        const on = comp.state.outputEnabled !== false;
        const f = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
        let fStr = `${f}Hz`;
        if (f >= 1000) fStr = `${(f / 1000).toFixed(f % 1000 === 0 ? 0 : 1)}kHz`;
        const vpp = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 5.0;
        const vrms = comp.state.actualVoltage || 0;
        const i = comp.state.actualCurrent || 0;
        const iText = (i >= 1) ? `${i.toFixed(2)}A` : `${(i * 1000).toFixed(0)}mA`;
        const waveIcons = { sine: '∿', square: '⊓', triangle: '⋀', ramp: '⊿', dc: '⎓' };
        const icon = waveIcons[comp.state.waveform || 'sine'] || '∿';

        badge.classList.toggle('active-power', on && i > 0);
        if (!on) {
          badge.innerHTML = `<span style="color: #94a3b8;">OUTPUT OFF</span> · <span class="badge-v">${vpp.toFixed(1)}Vpp</span> · <span class="badge-f">${fStr}</span>`;
        } else {
          badge.innerHTML = `<span class="badge-v" style="color: #38bdf8;">${icon} ${vpp.toFixed(1)}Vpp</span> · <span class="badge-v" style="color: #67e8f9;">(${vrms.toFixed(2)}Vrms)</span> · <span class="badge-f" style="color: #a78bfa;">${fStr}</span> · <span class="badge-i">${iText}</span>`;
        }
      } else if (comp.type === 'ac_source') {
        const v = comp.state.voltage || 230;
        const i = comp.state.current || 0;
        const w = comp.state.power || (v * i);
        const isPowered = i > 0;
        badge.classList.toggle('active-power', isPowered);
        const iText = (i >= 1) ? `${i.toFixed(2)}A` : `${(i * 1000).toFixed(0)}mA`;
        const wText = (w >= 1) ? `${w.toFixed(1)}W` : `${(w * 1000).toFixed(0)}mW`;
        badge.innerHTML = `<span class="badge-v">${v.toFixed(0)}V~</span> · <span class="badge-i">${iText}</span> · <span class="badge-w">${wText}</span>`;
      } else if (comp.type === 'transformer') {
        const isPowered = comp.state.powered;
        const priV = comp.state.primaryV || 230;
        const secV = comp.state.secondaryV || 12;
        const secI = comp.state.secondaryCurrent || comp.state.current || 0;
        const secW = comp.state.secondaryPower || comp.state.power || 0;
        const priI = comp.state.primaryCurrent || (isPowered && priV > 0 ? (secW / priV) : 0);
        badge.classList.toggle('active-power', secI > 0 || isPowered);
        const secIText = (secI >= 1) ? `${secI.toFixed(2)}A` : `${(secI * 1000).toFixed(0)}mA`;
        const priIText = `${(priI * 1000).toFixed(0)}mA`;
        badge.innerHTML = `<span class="badge-v">${priV.toFixed(0)}V~</span>➔<span class="badge-v">${secV.toFixed(0)}V~</span> · <span class="badge-i">${secIText}</span> · <span class="badge-w">${secW >= 1 ? secW.toFixed(1) + 'W' : (secW * 1000).toFixed(0) + 'mW'}</span>`;
      } else if (comp.type === 'npn' || comp.type === 'pnp') {
        const isNPN = comp.type === 'npn';
        const reg = comp.state.operatingRegime || (comp.state.conducting ? 'saturation' : 'cutoff');
        const vce = isNPN ? (comp.state.vce !== undefined ? comp.state.vce : comp.state.voltageDrop || 0) : (comp.state.vec !== undefined ? comp.state.vec : comp.state.voltageDrop || 0);
        const ic = comp.state.collectorCurrent || 0;
        const vbe = isNPN ? (comp.state.vbe !== undefined ? comp.state.vbe : 0) : (comp.state.veb !== undefined ? comp.state.veb : 0);
        const ib = comp.state.baseCurrent || 0;
        const ie = comp.state.emitterCurrent !== undefined ? comp.state.emitterCurrent : (ic + ib);
        const beta = comp.state.beta || 100;

        const isPowered = (ic > 0 || ib > 0 || comp.state.conducting);
        badge.classList.toggle('active-power', isPowered);

        const icText = (ic * 1000) >= 1000 ? `${(ic).toFixed(2)}A` : `${(ic * 1000).toFixed(1)}mA`;
        const ibText = (ib * 1000) >= 1 ? `${(ib * 1000).toFixed(1)}mA` : `${(ib * 1e6).toFixed(0)}µA`;
        const ieText = (ie * 1000) >= 1000 ? `${(ie).toFixed(2)}A` : `${(ie * 1000).toFixed(1)}mA`;

        if (reg === 'saturation') {
          const modeColor = isNPN ? '#fbbf24' : '#c084fc';
          badge.innerHTML = `<span style="color:${modeColor};font-weight:900;">● SATURATION</span> · <span class="badge-v">${isNPN ? 'Vce' : 'Vec'}: ${vce.toFixed(2)}V</span> · <span class="badge-i" style="color:#38bdf8;font-weight:700;">Ic: ${icText}</span> · <span style="color:#f59e0b;">Ib: ${ibText}</span> · <span style="color:#f87171;">Ie: ${ieText}</span>`;
        } else if (reg === 'active') {
          badge.innerHTML = `<span style="color:#f59e0b;font-weight:900;">◐ ACTIVE (β=${beta})</span> · <span class="badge-v">${isNPN ? 'Vce' : 'Vec'}: ${vce.toFixed(2)}V</span> · <span class="badge-i" style="color:#38bdf8;font-weight:700;">Ic: ${icText}</span> · <span style="color:#f59e0b;">Ib: ${ibText}</span> · <span style="color:#f87171;">Ie: ${ieText}</span>`;
        } else {
          badge.innerHTML = `<span style="color:#94a3b8;font-weight:700;">○ CUTOFF</span> · <span class="badge-v">${isNPN ? 'Vce' : 'Vec'}: ${vce.toFixed(1)}V</span> · <span class="badge-i">Ic: 0mA</span> · <span style="color:#94a3b8;">${isNPN ? 'Vbe' : 'Veb'}: ${vbe.toFixed(2)}V</span>`;
        }
      } else if (comp.type && comp.type.startsWith('gate_')) {
        const inA = comp.state.inputA ? 1 : 0;
        const inB = comp.state.inputB ? 1 : 0;
        const outY = comp.state.outputLevel ? 1 : 0;
        const isNot = comp.type === 'gate_not';
        const outColor = outY ? '#fbbf24' : '#64748b';
        badge.classList.toggle('active-power', outY === 1);
        const inputsText = isNot ? `A=${inA}` : `A=${inA} B=${inB}`;
        badge.innerHTML = `<span style="color: #38bdf8; font-weight: 800;">${inputsText}</span> → <span style="color: ${outColor}; font-weight: 900;">Y=${outY}</span>`;
      } else if (comp.type && comp.type.startsWith('ic_')) {
        const isBurnt = comp.state.burnt;
        const isPwr = !isBurnt && (comp.state.powered || comp.state.manualPower);
        const vcc = comp.state.vccVoltage || (comp.state.manualPower ? 5.0 : 0.0);
        const curMa = (comp.state.current || 0) * 1000;
        badge.classList.toggle('active-power', isPwr);
        if (isBurnt) {
          badge.innerHTML = `<span style="color:#ef4444;font-weight:900;">💥 BURNT (${comp.state.burnReason || 'OVERVOLTAGE'})</span>`;
        } else if (!isPwr) {
          badge.innerHTML = `<span style="color:#94a3b8;font-weight:700;">STANDBY (Pin 14 Vcc &lt; 2V)</span>`;
        } else {
          const gatesSummary = (comp.state.gates || []).map(g => `${g.id}Y=${g.out}`).join(' ');
          badge.innerHTML = `<span style="color:#fbbf24;font-weight:900;">Vcc: ${vcc.toFixed(1)}V</span> · <span style="color:#38bdf8;font-weight:800;">I: ${curMa.toFixed(1)}mA</span> · <span style="color:#fbbf24;font-family:monospace;font-size:11px;font-weight:700;">${gatesSummary}</span>`;
        }
      } else {
        const v = comp.state.voltageDrop || (comp.type === 'battery' ? (comp.voltage || 9) : 0);
        const i = comp.state.current || 0;
        const ma = i * 1000;
        const w = comp.state.power || (v * i);
        const isPowered = (v > 0.05 && i > 0) || comp.state.powered;
        const rect = comp.state.rectification;

        badge.classList.toggle('active-power', isPowered);
        const vText = v >= 10 ? `${v.toFixed(1)}V` : `${v.toFixed(2)}V`;
        const iText = ma >= 1000 ? `${(ma / 1000).toFixed(2)}A` : `${ma.toFixed(1)}mA`;
        const wText = w >= 1 ? `${w.toFixed(2)}W` : `${(w * 1000).toFixed(1)}mW`;

        let rectBadge = '';
        if (isPowered && rect === 'half_wave') {
          rectBadge = `<span class="badge-rect rect-hw" title="Half-Wave Rectified (Pulsed DC: 180° conduction)">HW RECT</span> · `;
        } else if (isPowered && rect === 'full_wave') {
          rectBadge = `<span class="badge-rect rect-fw" title="Full-Wave Bridge Rectified (Smooth DC: 360° conduction)">FW BRIDGE</span> · `;
        } else if (isPowered && rect === 'ac') {
          rectBadge = `<span class="badge-rect rect-ac" title="Alternating Current (AC)">AC</span> · `;
        }

        badge.innerHTML = `${rectBadge}<span class="badge-v">${vText}</span> · <span class="badge-i">${iText}</span> · <span class="badge-w">${wText}</span>`;
      }
    }

    // Immediate motor fan transform update
    if (comp.type === 'motor') {
      const fan = el.querySelector(`#motor-fan-${comp.id}`);
      if (fan) {
        fan.setAttribute('transform', `rotate(${(comp.state.fanAngle || 0).toFixed(1)})`);
      }
    }

    // On-board Multimeter: Analog Meter Needle Swing & LCD Digits Live Sync
    if (comp.type === 'multimeter') {
      const needle = el.querySelector('.mm-analog-needle');
      const lcdDigits = el.querySelector('.mm-lcd-digits');
      const modeText = el.querySelector('.mm-lcd-mode');
      const v = comp.state.voltageDrop || comp.state.measuredVoltage || 0;
      const cur = (comp.state.current || 0) * 1000;
      const maxRange = 12.0;
      // Analog meter arc sweeps from -45° (0V) to +45° (Full Scale 12V)
      const needleAngle = Math.max(-48, Math.min(48, -45 + (Math.min(v, maxRange) / maxRange) * 90));
      if (needle) {
        needle.setAttribute('transform', `rotate(${needleAngle.toFixed(1)})`);
      }
      if (lcdDigits) {
        lcdDigits.textContent = v > 0.001 ? `${v.toFixed(2)} V` : '0.00 V';
      }
      if (modeText) {
        modeText.textContent = comp.state.powered ? `DCV · ${cur.toFixed(1)}mA` : 'DCV · STANDBY';
      }
    }

    // Solenoid / Electromagnet: Plunger snap & magnetic flux lines
    if (comp.type === 'solenoid') {
      const isEnergized = comp.state.powered && !comp.state.burnt;
      const plunger = el.querySelector('.solenoid-plunger');
      const flipper = el.querySelector('.solenoid-flipper-arm');
      const fluxLines = el.querySelectorAll('.solenoid-flux-line');
      if (plunger) {
        // When energized, steel core plunger pulls inward by 12px
        plunger.setAttribute('transform', isEnergized ? 'translate(0, 12)' : 'translate(0, 0)');
      }
      if (flipper) {
        // Pinball flipper snaps down 35 degrees
        flipper.setAttribute('transform', isEnergized ? 'rotate(35 50 68)' : 'rotate(0 50 68)');
      }
      fluxLines.forEach(line => {
        line.setAttribute('opacity', isEnergized ? '0.85' : '0');
      });
    }

    // Potentiometer: Wiper Voltage Division Tag
    if (comp.type === 'potentiometer') {
      const wiperTag = el.querySelector('.pot-wiper-vtag');
      if (wiperTag) {
        const vWiper = comp.state.wiperVoltage || 0;
        wiperTag.textContent = `${vWiper.toFixed(2)}V`;
      }
    }

    // Component Thermal Badge (Joule Heating: T = 25°C + P * R_th)
    let thermalBadge = el.querySelector('.comp-thermal-badge');
    if (!thermalBadge) {
      thermalBadge = document.createElement('div');
      thermalBadge.className = 'comp-thermal-badge';
      el.appendChild(thermalBadge);
    }
    const temp = comp.state.temperature || 25.0;
    const powerW = comp.state.power || ((comp.state.voltageDrop || 0) * (comp.state.current || 0));
    const pStr = powerW >= 1 ? `${powerW.toFixed(2)}W` : `${(powerW * 1000).toFixed(0)}mW`;
    thermalBadge.className = 'comp-thermal-badge';

    if (comp.type === 'bulb') {
      const vD = comp.state.voltageDrop || 0;
      const isOver = vD > 14.5 || comp.state.burning || comp.state.crying;
      thermalBadge.className = 'comp-thermal-badge ' + (isOver ? 'temp-overheat' : (comp.state.powered ? 'temp-incandescent' : 'temp-cool'));
      el.style.setProperty('--thermal-glow', isOver ? 'rgba(239, 68, 68, 0.9)' : (comp.state.powered ? 'rgba(245, 158, 11, 0.65)' : 'rgba(59, 130, 246, 0.35)'));
      const fTemp = comp.state.filamentTemp || (comp.state.powered ? 2250 : 25);
      const eTemp = comp.state.envelopeTemp || comp.state.temperature || (comp.state.powered ? 68 : 25);
      thermalBadge.innerHTML = comp.state.powered
        ? `<span>💡 ${fTemp.toFixed(0)}°C (Filament)</span><span>·</span><span>Glass: ~${eTemp.toFixed(0)}°C</span><span>·</span><span>P: ${pStr}</span>`
        : `<span>🌡️ 25.0°C</span><span>·</span><span>Cold</span>`;
    } else if (comp.type === 'battery' || comp.type === 'cell') {
      const isOver = comp.state.overheated || comp.state.burning || comp.state.crying;
      thermalBadge.className = 'comp-thermal-badge ' + (isOver ? 'temp-overheat' : (comp.state.powered ? 'temp-warm' : 'temp-cool'));
      el.style.setProperty('--thermal-glow', isOver ? 'rgba(239, 68, 68, 0.9)' : (comp.state.powered ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.35)'));
      const vTerm = comp.state.terminalVoltage !== undefined ? comp.state.terminalVoltage : (comp.state.voltageDrop || 9.0);
      const pInt = comp.state.internalPowerDissipation || 0;
      const pIntStr = pInt >= 1 ? `${pInt.toFixed(2)}W` : `${(pInt * 1000).toFixed(0)}mW`;
      thermalBadge.innerHTML = comp.state.powered
        ? `<span>🔋 V_term: ${vTerm.toFixed(2)}V</span><span>·</span><span>Loss: ${pIntStr}</span>`
        : `<span>🔋 ${(comp.state.openCircuitVoltage || 9.0).toFixed(2)}V (OCV)</span><span>·</span><span>Standby</span>`;
    } else if (comp.type === 'motor') {
      const isOver = comp.state.overheated || comp.state.burning || comp.state.crying;
      thermalBadge.className = 'comp-thermal-badge ' + (isOver ? 'temp-overheat' : (comp.state.powered ? 'temp-warm' : 'temp-cool'));
      el.style.setProperty('--thermal-glow', isOver ? 'rgba(239, 68, 68, 0.9)' : (comp.state.powered ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.35)'));
      const pHeat = comp.state.heatPower || 0;
      const hStr = pHeat >= 1 ? `${pHeat.toFixed(2)}W` : `${(pHeat * 1000).toFixed(0)}mW`;
      thermalBadge.innerHTML = comp.state.powered
        ? `<span>⚙️ ${comp.state.rpm || 0} RPM</span><span>·</span><span>🌡️ ${temp.toFixed(1)}°C</span><span>·</span><span>Loss: ${hStr}</span>`
        : `<span>⚙️ 0 RPM</span><span>·</span><span>🌡️ 25.0°C</span>`;
    } else {
      const isOver = comp.state.overheated || comp.state.burning || comp.state.crying || temp > 125.0;
      if (isOver) {
        thermalBadge.classList.add('temp-overheat');
        el.style.setProperty('--thermal-glow', 'rgba(239, 68, 68, 0.9)');
      } else if (temp > 70.0) {
        thermalBadge.classList.add('temp-hot');
        el.style.setProperty('--thermal-glow', 'rgba(249, 115, 22, 0.7)');
      } else if (temp > 35.0) {
        thermalBadge.classList.add('temp-warm');
        el.style.setProperty('--thermal-glow', 'rgba(245, 158, 11, 0.5)');
      } else {
        thermalBadge.classList.add('temp-cool');
        el.style.setProperty('--thermal-glow', 'rgba(59, 130, 246, 0.35)');
      }
      thermalBadge.innerHTML = `<span>🌡️ ${temp.toFixed(1)}°C</span><span>·</span><span>P: ${pStr}</span>`;
    }
  }

  showCharacterSpeechBubble(comp, text, mood = 'normal', autoSpeak = false) {
    if (!comp) return;
    const profile = window.CHARACTER_PROFILES ? window.CHARACTER_PROFILES[comp.type] : null;
    const def = window.COMPONENT_DEFINITIONS[comp.type];
    if (!profile || !def) return;

    // Remove existing bubble if present
    const oldBubble = document.getElementById('character-speech-bubble');
    if (oldBubble) oldBubble.remove();

    const bubble = document.createElement('div');
    bubble.id = 'character-speech-bubble';
    bubble.className = `character-speech-bubble bubble-${mood}`;

    // Position right above component on stage
    const bubbleX = comp.x + def.width / 2;
    const bubbleY = comp.y;
    bubble.style.left = `${bubbleX}px`;
    bubble.style.top = `${bubbleY}px`;

    const avatar = profile.avatar || '⚡';
    const nick = profile.nick || def.name;

    bubble.innerHTML = `
      <div class="speech-bubble-header">
        <div class="speech-char-title">
          <span class="speech-char-avatar">${avatar}</span>
          <span>${nick}</span>
        </div>
        <div class="speech-actions">
          <button type="button" class="speech-action-btn speech-btn-voice" title="Read line aloud">🗣️ Hear</button>
          <button type="button" class="speech-action-btn speech-btn-close" title="Close speech bubble">✕</button>
        </div>
      </div>
      <div class="speech-bubble-text">${text}</div>
    `;

    // Voice button
    bubble.querySelector('.speech-btn-voice').addEventListener('click', (e) => {
      e.stopPropagation();
      window.sounds.speak(text, profile.voicePitch, profile.voiceRate);
    });

    // Close button
    bubble.querySelector('.speech-btn-close').addEventListener('click', (e) => {
      e.stopPropagation();
      bubble.remove();
      window.sounds.stopSpeech();
    });

    // Stop propagation on bubble clicks
    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this.dom.stage.appendChild(bubble);

    if (autoSpeak) {
      if (mood === 'crying') {
        window.sounds.playCry();
      } else if (mood === 'happy') {
        window.sounds.playHappy();
      } else {
        window.sounds.playTalk(profile.voicePitch);
      }
      window.sounds.speak(text, profile.voicePitch, profile.voiceRate);
    }
  }

  hideCharacterSpeechBubble() {
    const bubble = document.getElementById('character-speech-bubble');
    if (bubble) bubble.remove();
    window.sounds.stopSpeech();
  }

  selectComponent(comp, introduce = false) {
    this.selectedComponent = comp;
    document.querySelectorAll('.component-node').forEach(n => n.classList.remove('selected'));
    const el = document.getElementById(`node-${comp.id}`);
    if (el) el.classList.add('selected');

    this.showInspector(comp);
    this.hideCharacterSpeechBubble();
    this.updateTopbarComponentPill(comp);
  }

  introduceComponent(comp) {
    if (!comp) return;
    this.showTechnicalSpecificationsModal(comp);
  }

  updateInspector(comp) {
    const target = comp || this.selectedComponent;
    if (target && typeof this.showInspector === 'function') {
      this.showInspector(target);
    }
    this.updateTopbarComponentPill(target);
  }

  showInspector(comp) {
    if (!this.dom || !this.dom.inspectorCard) return;
    const card = this.dom.inspectorCard;
    const def = window.COMPONENT_DEFINITIONS[comp.type];
    const profile = window.CHARACTER_PROFILES ? window.CHARACTER_PROFILES[comp.type] : null;
    card.style.display = 'block';

    // Detailed realistic SVG preview in inspector icon
    this.dom.inspIcon.innerHTML = window.ComponentRenderer.renderCatalogThumbnail(comp.type);
    this.dom.inspName.textContent = profile ? profile.name : def.name;
    this.dom.inspType.textContent = profile ? `${def.category.toUpperCase()} · ${profile.title.toUpperCase()}` : def.category.toUpperCase();
    this.dom.inspDesc.textContent = def.description;

    // Populate Technical Specifications Box
    if (this.dom.inspCharStoryBox) {
      this.dom.inspCharStoryBox.style.display = 'block';
      this.dom.inspCharBadge.textContent = `TECH SPECS · ${def.name.toUpperCase()}`;
      this.dom.inspCharSuperpowerText.textContent = profile ? profile.superpower : def.description;
      this.dom.inspCharStoryText.textContent = profile ? (profile.functionAndUsage || profile.importance) : def.description;
      this.dom.inspCharRated.textContent = profile ? profile.ratedPower : `${def.voltage || 0}V`;
      this.dom.inspCharIdeal.textContent = profile ? profile.idealPowerSource : (def.category || 'General Circuit');
      this.dom.inspCharImportance.textContent = profile ? profile.importance : "Ohm's & Kirchhoff's Laws";

      // Bind Full Specs button to open modal
      if (this.dom.btnInspSpeakStory) {
        this.dom.btnInspSpeakStory.onclick = (e) => {
          e.stopPropagation();
          this.showTechnicalSpecificationsModal(comp);
        };
      }
    }

    // Set replace select value to current type
    this.dom.inspReplaceSelect.value = comp.type;

    // Show or hide repair button based on burnt state
    if (comp.state.burnt) {
      this.dom.btnRepairSelected.style.display = 'flex';
    } else {
      this.dom.btnRepairSelected.style.display = 'none';
    }

    const controls = this.dom.inspControls;
    controls.innerHTML = '';

    // 0. Universal Component Orientation (Rotation)
    const rotRow = document.createElement('div');
    rotRow.className = 'control-row component-rotation-row';
    const curRot = (comp.rotation || 0) % 360;
    rotRow.innerHTML = `
      <span>Orientation</span>
      <div style="display: flex; align-items: center; gap: 4px;">
        <button type="button" class="resistor-stepper-btn btn-rot-ccw" style="width: 24px; height: 24px;" title="Rotate -90° (Counter-Clockwise)">⟲</button>
        <span style="font-family: monospace; font-size: 0.8rem; font-weight: 900; color: #38bdf8; min-width: 38px; text-align: center;">${curRot}°</span>
        <button type="button" class="resistor-stepper-btn btn-rot-cw" style="width: 24px; height: 24px;" title="Rotate +90° (Clockwise) [Shortcut: R key]">⟳</button>
        <button type="button" class="resistor-stepper-btn btn-rot-reset" style="width: auto; padding: 0 6px; height: 24px; font-size: 0.7rem; font-weight: bold;" title="Reset to 0°">0°</button>
      </div>
    `;
    rotRow.querySelector('.btn-rot-ccw').onclick = () => this.rotateComponent(comp.id, -90);
    rotRow.querySelector('.btn-rot-cw').onclick = () => this.rotateComponent(comp.id, 90);
    rotRow.querySelector('.btn-rot-reset').onclick = () => this.rotateComponent(comp.id, -curRot);
    controls.appendChild(rotRow);

    // 0b. Universal Component Scale (Size Adjustment)
    const scaleRow = document.createElement('div');
    scaleRow.className = 'control-row component-scale-row';
    const curScale = comp.scale !== undefined ? comp.scale : 1.0;
    scaleRow.innerHTML = `
      <span>Size Scale</span>
      <div style="display: flex; align-items: center; gap: 4px;">
        <button type="button" class="resistor-stepper-btn btn-scale-down" style="width: 24px; height: 24px;" title="Decrease Size (-10%) [Shortcut: -]">-</button>
        <span style="font-family: monospace; font-size: 0.8rem; font-weight: 900; color: #fbbf24; min-width: 38px; text-align: center;">${Math.round(curScale * 100)}%</span>
        <button type="button" class="resistor-stepper-btn btn-scale-up" style="width: 24px; height: 24px;" title="Increase Size (+10%) [Shortcut: +]">+</button>
        <button type="button" class="resistor-stepper-btn btn-scale-reset" style="width: auto; padding: 0 6px; height: 24px; font-size: 0.7rem; font-weight: bold;" title="Reset to 100%">1.0x</button>
      </div>
    `;
    scaleRow.querySelector('.btn-scale-down').onclick = () => this.scaleComponent(comp.id, -0.1);
    scaleRow.querySelector('.btn-scale-up').onclick = () => this.scaleComponent(comp.id, 0.1);
    scaleRow.querySelector('.btn-scale-reset').onclick = () => this.scaleComponent(comp.id, 1.0 - curScale);
    controls.appendChild(scaleRow);

    // 0c. Technical Specifications Button
    const specsBtnRow = document.createElement('div');
    specsBtnRow.className = 'control-row';
    specsBtnRow.style.margin = '4px 0 8px 0';
    specsBtnRow.innerHTML = `
      <button type="button" class="btn-open-specs-sidebar" style="width: 100%; background: rgba(56, 189, 248, 0.12); border: 1.5px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 6px; padding: 6px 10px; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s ease;">
        <span>⚙️ View Technical Specifications</span>
      </button>
    `;
    specsBtnRow.querySelector('.btn-open-specs-sidebar').onclick = () => this.showTechnicalSpecificationsModal(comp);
    controls.appendChild(specsBtnRow);

    // Specific controls per component type
    if (comp.type === 'led') {
      // 1. Color Picker
      const colorRow = document.createElement('div');
      colorRow.className = 'control-row';
      colorRow.innerHTML = `
        <span>LED Color</span>
        <div class="color-picker-mini">
          <div class="color-chip ${comp.state.color === 'red' ? 'active' : ''}" data-c="red" style="background: #ff334b;"></div>
          <div class="color-chip ${comp.state.color === 'green' ? 'active' : ''}" data-c="green" style="background: #00ff88;"></div>
          <div class="color-chip ${comp.state.color === 'blue' ? 'active' : ''}" data-c="blue" style="background: #00b4d8;"></div>
          <div class="color-chip ${comp.state.color === 'yellow' ? 'active' : ''}" data-c="yellow" style="background: #ffcc00;"></div>
          <div class="color-chip ${comp.state.color === 'purple' ? 'active' : ''}" data-c="purple" style="background: #b5179e;"></div>
        </div>
      `;
      colorRow.querySelectorAll('.color-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          comp.state.color = chip.dataset.c;
          this.updateComponentVisual(comp);
          this.showInspector(comp);
        });
      });
      controls.appendChild(colorRow);

      // 2. Blinking Mode Toggle
      const blinkRow = document.createElement('div');
      blinkRow.className = 'control-row';
      blinkRow.innerHTML = `
        <span>Blinking Mode</span>
        <label class="toggle-switch">
          <input type="checkbox" id="insp-toggle-blink" ${comp.state.blinking ? 'checked' : ''}>
          <span class="slider-track"></span>
        </label>
      `;
      blinkRow.querySelector('#insp-toggle-blink').addEventListener('change', (e) => {
        comp.state.blinking = e.target.checked;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      });
      controls.appendChild(blinkRow);
    } else if (comp.type === 'switch') {
      const swRow = document.createElement('div');
      swRow.className = 'control-row';
      swRow.innerHTML = `
        <span>Switch Lever</span>
        <label class="toggle-switch">
          <input type="checkbox" id="insp-toggle-switch" ${comp.state.closed ? 'checked' : ''}>
          <span class="slider-track"></span>
        </label>
      `;
      swRow.querySelector('#insp-toggle-switch').addEventListener('change', (e) => {
        comp.state.closed = e.target.checked;
        window.sounds.playSwitch(comp.state.closed);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      });
      controls.appendChild(swRow);
    } else if (comp.type === 'pushbutton') {
      const pbRow = document.createElement('div');
      pbRow.className = 'control-row';
      pbRow.innerHTML = `
        <span>Pushbutton Plunger</span>
        <button type="button" class="modal-btn ${comp.state.pressed ? 'primary' : 'secondary'}" style="padding: 4px 10px; font-size: 0.75rem;" id="insp-toggle-pb">
          ${comp.state.pressed ? '🔘 Pressed (ON)' : '⚪ Released (OFF)'}
        </button>
      `;
      pbRow.querySelector('#insp-toggle-pb').addEventListener('click', () => {
        this.pushHistory();
        comp.state.pressed = !comp.state.pressed;
        window.sounds.playSwitch(comp.state.pressed);
        this.updateComponentVisual(comp);
        this.showInspector(comp);
        this.evaluateCircuit();
      });
      controls.appendChild(pbRow);
    } else if (comp.type === 'motor') {
      const motRow = document.createElement('div');
      motRow.className = 'control-row';
      const isCW = (comp.state.direction || 'cw') === 'cw';
      const isPowered = comp.state.powered && !comp.state.burnt;
      motRow.innerHTML = `
        <span>Rotation Direction</span>
        <div style="font-size: 0.8rem; font-weight: 800; color: ${isPowered ? (isCW ? '#fbbf24' : '#c084fc') : '#94a3b8'};">
          ${isPowered ? (isCW ? '⟳ Clockwise (Forward)' : '⟲ Counter-Clockwise (Reversed)') : '⏹ Stopped'}
        </div>
      `;
      controls.appendChild(motRow);

      const rpmRow = document.createElement('div');
      rpmRow.className = 'control-row';
      const rpm = isPowered ? (comp.state.rpm || Math.round((comp.state.voltageDrop || 4.5) * 200)) : 0;
      rpmRow.innerHTML = `
        <span>Speed & Polarity</span>
        <div style="font-size: 0.76rem; font-weight: 700; color: #fbbf24;">
          ${rpm} RPM · ${(comp.state.voltageDrop || 0).toFixed(1)}V
        </div>
      `;
      controls.appendChild(rpmRow);
    } else if (comp.type === 'resistor') {
      const resContainer = document.createElement('div');
      resContainer.className = 'resistor-inspector-wrapper';

      const curR = window.getClosestStandardResistor(comp.state.resistance || 220);
      comp.state.resistance = curR;
      const colorInfo = window.getResistorColorDetails(curR);

      // Group options by categories
      let optgroupsHtml = '';
      if (Array.isArray(window.STANDARD_RESISTOR_CATEGORIES)) {
        window.STANDARD_RESISTOR_CATEGORIES.forEach(cat => {
          optgroupsHtml += `<optgroup label="${cat.name}">`;
          cat.values.forEach(v => {
            const sel = (v === curR) ? 'selected' : '';
            const info = window.getResistorColorDetails(v);
            optgroupsHtml += `<option value="${v}" ${sel}>${info.formatted} (${info.codeDashed})</option>`;
          });
          optgroupsHtml += `</optgroup>`;
        });
      }

      resContainer.innerHTML = `
        <div class="control-row">
          <span>Standard Resistance</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button type="button" class="resistor-stepper-btn btn-insp-down" style="width: 24px; height: 24px;" title="Previous Standard Fixed Resistance (E12/E24 Series)">-</button>
            <input type="text" id="insp-input-resistance" class="resistor-input" value="${colorInfo.formatted}" readonly style="width: 72px; text-align: center; font-weight: 900; color: #fbbf24; cursor: pointer;">
            <button type="button" class="resistor-stepper-btn btn-insp-up" style="width: 24px; height: 24px;" title="Next Standard Fixed Resistance (E12/E24 Series)">+</button>
          </div>
        </div>

        <div class="control-row" style="margin-top: 6px;">
          <span>Jump to Standard Value</span>
          <select id="insp-select-resistance" class="replace-dropdown" style="max-width: 170px; font-family: var(--font-mono); font-size: 0.72rem;">
            ${optgroupsHtml}
          </select>
        </div>

        <!-- 4-Band Color Code Live Swatch Card -->
        <div class="resistor-color-code-card" id="insp-res-color-card">
          <div class="resistor-color-code-header">
            <span>🎨 4-Band Color Code</span>
            <span class="resistor-code-summary" id="insp-res-code-summary">${colorInfo.codeString}</span>
          </div>

          <div class="resistor-stripes-display">
            <div class="mini-resistor-graphic" id="insp-mini-resistor">
              <span class="mini-resistor-stripe s1" style="background: ${colorInfo.bands[0]}"></span>
              <span class="mini-resistor-stripe s2" style="background: ${colorInfo.bands[1]}"></span>
              <span class="mini-resistor-stripe s3" style="background: ${colorInfo.bands[2]}"></span>
              <span class="mini-resistor-stripe s4" style="background: ${colorInfo.bands[3]}"></span>
            </div>
            <div class="resistor-stripes-labels" id="insp-stripes-labels">
              <span class="stripe-pill" style="border-color: ${colorInfo.details[0].hex}">
                <i style="background: ${colorInfo.details[0].hex}"></i>${colorInfo.details[0].name} (${colorInfo.details[0].value})
              </span>
              <span class="stripe-pill" style="border-color: ${colorInfo.details[1].hex}">
                <i style="background: ${colorInfo.details[1].hex}"></i>${colorInfo.details[1].name} (${colorInfo.details[1].value})
              </span>
              <span class="stripe-pill" style="border-color: ${colorInfo.details[2].hex}">
                <i style="background: ${colorInfo.details[2].hex}"></i>${colorInfo.details[2].name} (${colorInfo.details[2].value})
              </span>
              <span class="stripe-pill" style="border-color: ${colorInfo.details[3].hex}">
                <i style="background: ${colorInfo.details[3].hex}"></i>Gold (±5%)
              </span>
            </div>
          </div>

          <button type="button" class="btn-open-resistor-guide" id="btn-insp-open-color-chart">
            <span>📖 Standard Values & Color Chart (54 Values)</span>
          </button>
        </div>
      `;

      const inp = resContainer.querySelector('#insp-input-resistance');
      const selInp = resContainer.querySelector('#insp-select-resistance');
      const bDown = resContainer.querySelector('.btn-insp-down');
      const bUp = resContainer.querySelector('.btn-insp-up');
      const btnOpenGuide = resContainer.querySelector('#btn-insp-open-color-chart');
      const summaryText = resContainer.querySelector('#insp-res-code-summary');
      const miniStripes = resContainer.querySelectorAll('.mini-resistor-stripe');
      const stripeLabels = resContainer.querySelector('#insp-stripes-labels');

      const updateCardVisuals = (std) => {
        const info = window.getResistorColorDetails(std);
        inp.value = info.formatted;
        if (selInp) selInp.value = std.toString();
        if (summaryText) summaryText.textContent = info.codeString;
        if (miniStripes && miniStripes.length >= 4) {
          miniStripes[0].style.background = info.bands[0];
          miniStripes[1].style.background = info.bands[1];
          miniStripes[2].style.background = info.bands[2];
          miniStripes[3].style.background = info.bands[3];
        }
        if (stripeLabels) {
          stripeLabels.innerHTML = `
            <span class="stripe-pill" style="border-color: ${info.details[0].hex}">
              <i style="background: ${info.details[0].hex}"></i>${info.details[0].name} (${info.details[0].value})
            </span>
            <span class="stripe-pill" style="border-color: ${info.details[1].hex}">
              <i style="background: ${info.details[1].hex}"></i>${info.details[1].name} (${info.details[1].value})
            </span>
            <span class="stripe-pill" style="border-color: ${info.details[2].hex}">
              <i style="background: ${info.details[2].hex}"></i>${info.details[2].name} (${info.details[2].value})
            </span>
            <span class="stripe-pill" style="border-color: ${info.details[3].hex}">
              <i style="background: ${info.details[3].hex}"></i>Gold (±5%)
            </span>
          `;
        }
      };

      const applyStandardR = (targetVal) => {
        const std = window.getClosestStandardResistor(targetVal);
        if (comp.state.resistance === std) return;
        this.pushHistory();
        comp.state.resistance = std;
        updateCardVisuals(std);

        if (this.dom.inspName) {
          this.dom.inspName.textContent = `Fixed Resistor (${window.formatResistance(std)})`;
        }
        if (this.dom.inspCharStoryText) {
          this.dom.inspCharStoryText.textContent = `"${window.getResistorStory(std)}"`;
        }
        if (this.dom.btnInspSpeakStory) {
          this.dom.btnInspSpeakStory.onclick = (e) => {
            e.stopPropagation();
            window.sounds.speak(window.getResistorStory(std), 1.1, 0.98);
          };
        }
        this.updateComponentVisual(comp);
        if (this.ohmsCalcActive) {
          this.updateOhmsCalcWindow();
        }
        this.evaluateCircuit();
      };

      bDown.addEventListener('click', () => {
        applyStandardR(window.getPrevStandardResistor(comp.state.resistance || 220));
      });
      bUp.addEventListener('click', () => {
        applyStandardR(window.getNextStandardResistor(comp.state.resistance || 220));
      });
      inp.addEventListener('click', () => {
        applyStandardR(window.getNextStandardResistor(comp.state.resistance || 220));
      });
      if (selInp) {
        selInp.addEventListener('change', (e) => {
          applyStandardR(parseFloat(e.target.value) || 220);
        });
      }
      if (btnOpenGuide) {
        btnOpenGuide.addEventListener('click', () => {
          this.openResistorCodesModal(comp.state.resistance || 220);
        });
      }

      controls.appendChild(resContainer);
    } else if (comp.type === 'potentiometer') {
      const resRow = document.createElement('div');
      resRow.className = 'control-row';
      const curR = comp.state.resistance || 500;
      resRow.innerHTML = `
        <span>Resistance</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="resistor-stepper-btn btn-insp-down" style="width: 22px; height: 22px;">-</button>
          <input type="number" id="insp-input-resistance" class="resistor-input" min="1" max="100000" step="50" value="${curR}" style="width: 60px;">
          <button type="button" class="resistor-stepper-btn btn-insp-up" style="width: 22px; height: 22px;">+</button>
          <span style="font-size: 0.75rem; color: #94a3b8; font-weight: bold;">Ω</span>
        </div>
      `;
      const inp = resRow.querySelector('#insp-input-resistance');
      const bDown = resRow.querySelector('.btn-insp-down');
      const bUp = resRow.querySelector('.btn-insp-up');

      const setR = (newVal) => {
        const val = Math.max(1, Math.min(100000, Math.round(newVal)));
        if (comp.state.resistance === val) return;
        this.pushHistory();
        comp.state.resistance = val;
        inp.value = val;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };

      inp.addEventListener('input', (e) => {
        setR(parseFloat(e.target.value) || 10);
      });
      bDown.addEventListener('click', () => {
        const step = (comp.state.resistance || curR) > 100 ? 50 : 10;
        setR((comp.state.resistance || curR) - step);
      });
      bUp.addEventListener('click', () => {
        const step = (comp.state.resistance || curR) >= 100 ? 50 : 10;
        setR((comp.state.resistance || curR) + step);
      });
      controls.appendChild(resRow);
    } else if (comp.type === 'twowayswitch') {
      const swRow = document.createElement('div');
      swRow.className = 'control-row';
      swRow.innerHTML = `
        <span>Current Way</span>
        <button type="button" class="modal-btn secondary" style="padding: 4px 10px; font-size: 0.75rem;" id="insp-toggle-twoway">
          ${(comp.state.position || 1) === 1 ? 'Way 1 (L1)' : 'Way 2 (L2)'}
        </button>
      `;
      swRow.querySelector('#insp-toggle-twoway').addEventListener('click', () => {
        this.pushHistory();
        comp.state.position = (comp.state.position === 1 ? 2 : 1);
        window.sounds.playSwitch(true);
        this.updateComponentVisual(comp);
        this.showInspector(comp);
        this.evaluateCircuit();
      });
      controls.appendChild(swRow);
    } else if (comp.type === 'transformer') {
      // 1. Real-Time Telemetry Dashboard
      const transTelem = document.createElement('div');
      transTelem.className = 'control-row';
      transTelem.style.flexDirection = 'column';
      transTelem.style.alignItems = 'stretch';
      transTelem.style.background = 'rgba(15, 23, 42, 0.6)';
      transTelem.style.padding = '8px 10px';
      transTelem.style.borderRadius = '8px';
      transTelem.style.border = '1px solid rgba(245, 158, 11, 0.25)';
      const priV = comp.state.primaryV || 230;
      const secV = comp.state.secondaryV || 12;
      const secI = comp.state.secondaryCurrent || comp.state.current || 0;
      const secW = comp.state.secondaryPower || comp.state.power || 0;
      const priI = comp.state.primaryCurrent || (comp.state.powered && priV > 0 ? (secW / priV) : 0);
      const priW = comp.state.primaryWatts || secW;
      transTelem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #fbbf24; font-size: 0.78rem;">⚡ TRANSFORMER TELEMETRY</strong>
          <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${secI > 0 ? 'rgba(245, 158, 11, 0.2)' : (comp.state.powered ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.15)')}; color: ${secI > 0 ? '#fbbf24' : (comp.state.powered ? '#38bdf8' : '#94a3b8')};">
            ${secI > 0 ? 'DRIVING LOAD' : (comp.state.powered ? 'PRIMARY ENERGIZED' : 'PRIMARY DISCONNECTED')}
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; background: rgba(2, 6, 23, 0.5); padding: 5px 8px; border-radius: 6px; font-size: 0.76rem;">
            <span style="color: #f59e0b; font-weight: bold;">Primary (L/N):</span>
            <span style="font-family: monospace; font-weight: 800; color: #fef08a;">${priV.toFixed(0)}V~ · ${(priI * 1000).toFixed(1)}mA · ${priW.toFixed(2)}W</span>
          </div>
          <div style="display: flex; justify-content: space-between; background: rgba(2, 6, 23, 0.5); padding: 5px 8px; border-radius: 6px; font-size: 0.76rem;">
            <span style="color: #38bdf8; font-weight: bold;">Secondary (L/N):</span>
            <span style="font-family: monospace; font-weight: 800; color: #7dd3fc;">${secV.toFixed(0)}V~ · ${secI >= 1 ? secI.toFixed(2) + 'A' : (secI * 1000).toFixed(1) + 'mA'} · ${secW.toFixed(2)}W</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8; padding: 2px 4px;">
            <span>Turns Ratio: <strong>${(priV / Math.max(1, secV)).toFixed(1)}:1</strong></span>
            <span>Coupling: <strong>Magnetic (Iron Core)</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #64748b; padding: 0 4px;">
            <span>Terminals: <strong>Pri L/N ➔ Sec L/N</strong></span>
            <span>Mode: <strong>Step-Down AC</strong></span>
          </div>
        </div>
      `;
      controls.appendChild(transTelem);

      // 2. Voltage Adjustment Stepper
      const transRow = document.createElement('div');
      transRow.className = 'control-row';
      const secVal = comp.state.secondaryV || 12;
      transRow.innerHTML = `
        <span>Secondary Voltage</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="resistor-stepper-btn btn-insp-sec-down" style="width: 22px; height: 22px;">-</button>
          <input type="number" id="insp-input-transformer" class="resistor-input" min="1" max="120" step="2" value="${secVal}" style="width: 50px;">
          <button type="button" class="resistor-stepper-btn btn-insp-sec-up" style="width: 22px; height: 22px;">+</button>
          <span style="font-size: 0.75rem; color: #38bdf8; font-weight: bold;">V~</span>
        </div>
      `;
      const inp = transRow.querySelector('#insp-input-transformer');
      const bDown = transRow.querySelector('.btn-insp-sec-down');
      const bUp = transRow.querySelector('.btn-insp-sec-up');

      const setSec = (newVal) => {
        const val = Math.max(1, Math.min(120, Math.round(newVal)));
        if (comp.state.secondaryV === val) return;
        this.pushHistory();
        comp.state.secondaryV = val;
        inp.value = val;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };
      inp.addEventListener('input', (e) => setSec(parseFloat(e.target.value) || 12));
      bDown.addEventListener('click', () => setSec((comp.state.secondaryV || secVal) - 2));
      bUp.addEventListener('click', () => setSec((comp.state.secondaryV || secVal) + 2));
      controls.appendChild(transRow);
    } else if (comp.type === 'ac_source') {
      // 1. Real-Time Telemetry Dashboard
      const acTelem = document.createElement('div');
      acTelem.className = 'control-row';
      acTelem.style.flexDirection = 'column';
      acTelem.style.alignItems = 'stretch';
      acTelem.style.background = 'rgba(15, 23, 42, 0.6)';
      acTelem.style.padding = '8px 10px';
      acTelem.style.borderRadius = '8px';
      acTelem.style.border = '1px solid rgba(56, 189, 248, 0.25)';
      const curI = comp.state.current || 0;
      const acV = comp.state.voltage || 230;
      const curW = comp.state.power || (curI * acV);
      const vPeak = (acV * Math.SQRT2).toFixed(1);
      acTelem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #fbbf24; font-size: 0.78rem;">⚡ REAL-TIME AC TELEMETRY</strong>
          <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${curI > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.15)'}; color: ${curI > 0 ? '#fbbf24' : '#94a3b8'};">
            ${curI > 0 ? 'ACTIVE (CLOSED LOOP)' : 'STANDBY (OPEN CIRCUIT)'}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; margin-bottom: 6px;">
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">RMS VOLTAGE</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #f59e0b;">${acV.toFixed(0)} V~</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">CURRENT (RMS)</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8;">${curI >= 1 ? curI.toFixed(2) + ' A' : (curI * 1000).toFixed(1) + ' mA'}</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">ACTIVE POWER</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #fbbf24;">${curW.toFixed(2)} W</div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #94a3b8; padding: 2px 4px;">
          <span>Peak Voltage: <strong style="color: #fef08a;">${vPeak} Vpk</strong></span>
          <span>Frequency: <strong>50 Hz Sine</strong></span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.70rem; color: #64748b; padding: 0 4px;">
          <span>Output Terminals: <strong style="color: #f59e0b;">Line (L)</strong> & <strong style="color: #38bdf8;">Neutral (N)</strong></span>
          <span>Waveform: <strong>Pure AC</strong></span>
        </div>
      `;
      controls.appendChild(acTelem);

      // 2. Voltage Adjustment Stepper
      const acRow = document.createElement('div');
      acRow.className = 'control-row';
      const curV = comp.state.voltage || 230;
      acRow.innerHTML = `
        <span>AC Voltage</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="resistor-stepper-btn btn-insp-ac-down" style="width: 22px; height: 22px;">-</button>
          <input type="number" id="insp-input-ac" class="resistor-input" min="1" max="500" step="10" value="${curV}" style="width: 55px;">
          <button type="button" class="resistor-stepper-btn btn-insp-ac-up" style="width: 22px; height: 22px;">+</button>
          <span style="font-size: 0.75rem; color: #ef4444; font-weight: bold;">V~</span>
        </div>
      `;
      const inp = acRow.querySelector('#insp-input-ac');
      const bDown = acRow.querySelector('.btn-insp-ac-down');
      const bUp = acRow.querySelector('.btn-insp-ac-up');

      const setAC = (newVal) => {
        const val = Math.max(1, Math.min(500, Math.round(newVal)));
        if (comp.state.voltage === val) return;
        this.pushHistory();
        comp.state.voltage = val;
        inp.value = val;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };
      inp.addEventListener('input', (e) => setAC(parseFloat(e.target.value) || 230));
      bDown.addEventListener('click', () => setAC((comp.state.voltage || curV) - 10));
      bUp.addEventListener('click', () => setAC((comp.state.voltage || curV) + 10));
      controls.appendChild(acRow);
    } else if (comp.type === 'ldr') {
      const isNeg = (comp.state.coefficient !== 'positive');
      const ldrRow = document.createElement('div');
      ldrRow.className = 'control-row';
      ldrRow.style.flexDirection = 'column';
      ldrRow.style.alignItems = 'stretch';
      ldrRow.style.gap = '8px';
      ldrRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #fbbf24;">LDR Photo-Sensor</span>
          <span id="insp-ldr-res" style="font-family: monospace; font-size: 0.82rem; color: #38bdf8;">${window.formatResistance(comp.state.resistance || 10000)}</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 3px;">
          <div>Nearest Light: <strong id="insp-ldr-light" style="color: #fef08a;">${comp.state.nearestLight || 'None'}</strong></div>
          <div>Proximity: <strong id="insp-ldr-dist" style="color: #38bdf8;">${comp.state.nearestDist ? comp.state.nearestDist + ' px' : 'In Darkness'}</strong></div>
          <div>Illumination: <strong id="insp-ldr-lux" style="color: #f59e0b;">${comp.state.lux || 0} Lux</strong></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.75rem;">Coefficient Mode</span>
          <button type="button" class="sidebar-skip-btn btn-ldr-toggle" style="margin: 0; padding: 2px 10px;">
            ${isNeg ? '☀️ Negative (NTC)' : '⚡ Positive (PTC)'}
          </button>
        </div>
      `;
      ldrRow.querySelector('.btn-ldr-toggle').addEventListener('click', () => {
        comp.state.coefficient = (comp.state.coefficient === 'positive') ? 'negative' : 'positive';
        this.evaluateCircuit();
        this.updateComponentVisual(comp);
        this.showInspector(comp);
      });

      // Quick Ambient Light Simulation Slider (Day ➔ Twilight ➔ Complete Darkness)
      const lightSliderRow = document.createElement('div');
      lightSliderRow.style.marginTop = '4px';
      lightSliderRow.innerHTML = `
        <label style="font-size: 0.70rem; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Ambient Lighting</span>
          <span id="insp-lux-label">${(comp.state.lux || 0) > 15 ? '☀️ Bright Daylight' : ((comp.state.lux || 0) > 2 ? '🌤️ Twilight' : '🌑 Complete Darkness')}</span>
        </label>
        <input type="range" class="ldr-lux-slider" min="0" max="100" step="5" value="${comp.state.lux || 0}" style="width: 100%; accent-color: #f59e0b;">
      `;
      lightSliderRow.querySelector('.ldr-lux-slider').oninput = (e) => {
        const lux = parseFloat(e.target.value);
        comp.state.ambientLux = lux;
        comp.state.lux = lux;
        if (this.solver) this.solver.updateLDRSensors();
        this.evaluateCircuit();
        this.updateComponentVisual(comp);
        this.showInspector(comp);
      };
      ldrRow.appendChild(lightSliderRow);
      controls.appendChild(ldrRow);
    } else if (comp.type === 'solenoid') {
      const isEnergized = comp.state.powered && !comp.state.burnt;
      const bField = comp.state.magneticField || (isEnergized ? 0.42 : 0);
      const forceN = comp.state.pullForce || (isEnergized ? 4.8 : 0);
      const solRow = document.createElement('div');
      solRow.className = 'control-row';
      solRow.style.flexDirection = 'column';
      solRow.style.alignItems = 'stretch';
      solRow.style.gap = '8px';
      solRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #f59e0b; font-size: 0.78rem;">🧲 ELECTROMAGNETIC TELEMETRY</strong>
          <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${isEnergized ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.15)'}; color: ${isEnergized ? '#fbbf24' : '#94a3b8'};">
            ${isEnergized ? 'COIL ENERGIZED' : 'IDLE (ZERO CURRENT)'}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; text-align: center;">
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">MAGNETIC FLUX (B = μ·n·I)</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8;">${bField.toFixed(3)} Tesla</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">PLUNGER PULL FORCE</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #f59e0b;">${forceN.toFixed(1)} N</div>
          </div>
        </div>
        <div style="font-size: 0.68rem; color: #94a3b8; line-height: 1.35;">
          Coil: <strong>20 Ω Inductive Copper Wire</strong> · Turns: <strong>500 loops</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.75rem;">Actuator Arm Mode</span>
          <button type="button" class="sidebar-skip-btn btn-solenoid-mode" style="margin: 0; padding: 2px 10px;">
            ${comp.state.flipperMode === 'crane' ? '🏗️ Crane Magnet' : '🕹️ Pinball Flipper'}
          </button>
        </div>
      `;
      solRow.querySelector('.btn-solenoid-mode').onclick = () => {
        comp.state.flipperMode = (comp.state.flipperMode === 'crane') ? 'pinball' : 'crane';
        this.updateComponentVisual(comp);
        this.showInspector(comp);
      };
      controls.appendChild(solRow);
    } else if (comp.type === 'potentiometer') {
      const potRow = document.createElement('div');
      potRow.className = 'control-row';
      potRow.style.flexDirection = 'column';
      potRow.style.alignItems = 'stretch';
      potRow.style.gap = '8px';
      const totR = comp.state.totalResistance || comp.state.resistance || 500;
      const ratio = comp.state.wiperRatio !== undefined ? comp.state.wiperRatio : 0.5;
      const r1 = Math.round((1 - ratio) * totR);
      const r2 = Math.round(ratio * totR);
      const vIn = comp.state.voltageDrop || 9.0;
      const vOut = (vIn * ratio).toFixed(2);
      potRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #f59e0b;">3-Terminal Voltage Divider</span>
          <span style="font-family: monospace; font-size: 0.82rem; color: #38bdf8;">${vOut} V</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 3px;">
          <div>Formula: <strong style="color: #fef08a;">V_out = V_in · [R₂ / (R₁ + R₂)]</strong></div>
          <div style="display: flex; justify-content: space-between;">
            <span>Top Track (R₁): <strong>${r1} Ω</strong></span>
            <span>Bottom Track (R₂): <strong>${r2} Ω</strong></span>
          </div>
        </div>
        <div>
          <label style="font-size: 0.70rem; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>Wiper Position (0% ➔ 100%)</span>
            <span>${Math.round(ratio * 100)}%</span>
          </label>
          <input type="range" class="pot-wiper-slider" min="0" max="1" step="0.02" value="${ratio}" style="width: 100%; accent-color: #f59e0b;">
        </div>
      `;
      const slider = potRow.querySelector('.pot-wiper-slider');
      slider.oninput = (e) => {
        const newRatio = parseFloat(e.target.value);
        comp.state.wiperRatio = newRatio;
        comp.state.resistance = Math.max(1, Math.round(totR * newRatio));
        this.evaluateCircuit();
        this.updateComponentVisual(comp);
        this.showInspector(comp);
      };
      controls.appendChild(potRow);
    } else if (comp.type === 'rectifier') {
      const rectRow = document.createElement('div');
      rectRow.className = 'control-row';
      rectRow.style.flexDirection = 'column';
      rectRow.style.alignItems = 'stretch';
      rectRow.style.gap = '8px';
      const isPowered = comp.state.powered;
      const vIn = comp.state.voltageDrop || 12.0;
      const vDc = (vIn * 0.90).toFixed(2);
      rectRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #fbbf24; font-size: 0.78rem;">BRIDGE RECTIFIER TELEMETRY</strong>
          <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${isPowered ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.15)'}; color: ${isPowered ? '#fbbf24' : '#94a3b8'};">
            ${isPowered ? 'CONDUCTING DC' : 'STANDBY'}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; text-align: center;">
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">AC RMS INPUT</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #f59e0b;">${vIn.toFixed(1)} V~</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">RECTIFIED DC OUTPUT</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #fbbf24;">+${vDc} V</div>
          </div>
        </div>
        <div style="font-size: 0.68rem; color: #94a3b8;">
          Configuration: <strong>4-Diode Graetz Bridge</strong> · Waveform: <strong>Full-Wave 100Hz</strong>
        </div>
      `;
      controls.appendChild(rectRow);
    } else if (comp.type === 'npn' || comp.type === 'pnp') {
      const isNPN = comp.type === 'npn';
      const isConducting = comp.state.conducting;
      const reg = comp.state.operatingRegime || (isConducting ? 'saturation' : 'cutoff');
      const vce = isNPN ? (comp.state.vce !== undefined ? comp.state.vce : comp.state.voltageDrop || 0) : (comp.state.vec !== undefined ? comp.state.vec : comp.state.voltageDrop || 0);
      const ic = comp.state.collectorCurrent || 0;
      const vbe = isNPN ? (comp.state.vbe !== undefined ? comp.state.vbe : 0) : (comp.state.veb !== undefined ? comp.state.veb : 0);
      const ib = comp.state.baseCurrent || 0;
      const ie = comp.state.emitterCurrent !== undefined ? comp.state.emitterCurrent : (ic + ib);
      const beta = comp.state.beta || 100;

      const icText = (ic * 1000) >= 1000 ? `${(ic).toFixed(2)} A` : `${(ic * 1000).toFixed(1)} mA`;
      const ibText = (ib * 1000) >= 1 ? `${(ib * 1000).toFixed(1)} mA` : `${(ib * 1e6).toFixed(0)} µA`;
      const ieText = (ie * 1000) >= 1000 ? `${(ie).toFixed(2)} A` : `${(ie * 1000).toFixed(1)} mA`;

      let regBadgeColor = '#94a3b8';
      let regBadgeBg = 'rgba(148, 163, 184, 0.15)';
      let regBadgeText = '○ CUTOFF (SWITCH OFF)';
      if (reg === 'saturation') {
        regBadgeColor = isNPN ? '#fbbf24' : '#c084fc';
        regBadgeBg = isNPN ? 'rgba(245, 158, 11, 0.2)' : 'rgba(192, 132, 252, 0.2)';
        regBadgeText = '● SATURATION (SWITCH FULLY ON)';
      } else if (reg === 'active') {
        regBadgeColor = '#f59e0b';
        regBadgeBg = 'rgba(245, 158, 11, 0.2)';
        regBadgeText = '◐ ACTIVE REGION (LINEAR AMPLIFIER)';
      }

      const tRow = document.createElement('div');
      tRow.className = 'control-row';
      tRow.style.flexDirection = 'column';
      tRow.style.alignItems = 'stretch';
      tRow.style.gap = '8px';
      tRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: ${isNPN ? '#38bdf8' : '#c084fc'}; font-size: 0.78rem;">
            ${isNPN ? 'NPN · 2N3904 (LOW-SIDE SWITCH)' : 'PNP · 2N3906 (HIGH-SIDE SWITCH)'}
          </strong>
          <span style="font-size: 0.70rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; background: ${regBadgeBg}; color: ${regBadgeColor};">
            ${regBadgeText}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; text-align: center;">
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">COLLECTOR CURRENT (I_C)</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8;">${icText}</div>
            <div style="font-size: 0.62rem; color: #64748b;">${isNPN ? 'V_ce' : 'V_ec'}: ${vce.toFixed(2)} V</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">BASE CURRENT (I_B)</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #f59e0b;">${ibText}</div>
            <div style="font-size: 0.62rem; color: #64748b;">${isNPN ? 'V_be' : 'V_eb'}: ${vbe.toFixed(2)} V (PN Diode)</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; text-align: center;">
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">TOTAL EMITTER (I_E = I_C + I_B)</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #f87171;">${ieText}</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.5); padding: 5px; border-radius: 6px;">
            <div style="font-size: 0.65rem; color: #94a3b8;">CURRENT GAIN (β / h_FE)</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #fbbf24;">${beta}</div>
          </div>
        </div>

        <div style="font-size: 0.70rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 3px; line-height: 1.35;">
          <div>Linear Amplifier: <strong style="color: #fef08a;">I_C = β · I_B</strong> · Emitter Sum: <strong style="color: #f87171;">I_E = I_C + I_B</strong></div>
          <div>Saturation Limit: <strong style="color: #38bdf8;">I_C(sat) ≈ V_CC / R_load</strong> · Drop: <strong style="color: #fbbf24;">V_CE(sat) ≈ 0.20 V</strong></div>
          <div style="color: #94a3b8;">Base Junction: <strong>${isNPN ? 'Forward V_BE ≥ 0.70 V' : 'Forward V_EB ≥ 0.70 V'}</strong> (Silicon PN Diode)</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.75rem;">Manual Force Test</span>
          <button type="button" class="sidebar-skip-btn btn-transistor-test" style="margin: 0; padding: 2px 10px;">
            ${comp.state.forceOn ? '⚡ Force: ON' : 'Auto Base Bias'}
          </button>
        </div>
      `;
      tRow.querySelector('.btn-transistor-test').addEventListener('click', () => {
        comp.state.forceOn = !comp.state.forceOn;
        this.evaluateCircuit();
        this.updateComponentVisual(comp);
        this.showInspector(comp);
      });
      controls.appendChild(tRow);
    } else if (comp.type === 'cell3v') {
      // CR2032 3V Lithium Coin Cell Live Telemetry & Full Engineering Specification Dashboard
      const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS.cell3v) || {};
      const ocv = comp.state.openCircuitVoltage || def.openCircuitVoltage || 3.20;
      const esr = comp.state.internalR || def.internalR || 18.0;
      const curI = comp.state.current || 0;
      const curMa = curI * 1000;
      const vSag = curI * esr;
      const vTerm = comp.state.terminalVoltage !== undefined ? comp.state.terminalVoltage : Math.max(0, ocv - vSag);
      const usefulPower = vTerm * curI;
      const esrHeat = curI * curI * esr;
      const regime = comp.state.drainRegime || (curI > 0.050 ? 'overload' : (curI > 0.003 ? 'pulse' : (curI > 0.00035 ? 'continuous_max' : (curI > 0 ? 'optimal' : 'standby'))));

      let badgeBg = 'rgba(148, 163, 184, 0.15)';
      let badgeColor = '#94a3b8';
      let badgeText = 'STANDBY (OPEN CIRCUIT)';
      if (regime === 'optimal') {
        badgeBg = 'rgba(245, 158, 11, 0.2)';
        badgeColor = '#fbbf24';
        badgeText = 'OPTIMAL DRAIN (≤ 0.3 mA)';
      } else if (regime === 'continuous_max') {
        badgeBg = 'rgba(56, 189, 248, 0.2)';
        badgeColor = '#38bdf8';
        badgeText = 'SAFE CONTINUOUS (≤ 3.0 mA)';
      } else if (regime === 'pulse') {
        badgeBg = 'rgba(245, 158, 11, 0.25)';
        badgeColor = '#fbbf24';
        badgeText = 'PULSE REGIME (≤ 50 mA)';
      } else if (regime === 'overload') {
        badgeBg = 'rgba(239, 68, 68, 0.3)';
        badgeColor = '#ef4444';
        badgeText = '⚠️ OVERLOAD DRAIN (> 50 mA)';
      }

      const crCard = document.createElement('div');
      crCard.className = 'control-row cr2032-inspector-container';
      crCard.style.flexDirection = 'column';
      crCard.style.alignItems = 'stretch';
      crCard.style.gap = '8px';
      crCard.style.background = 'rgba(15, 23, 42, 0.75)';
      crCard.style.padding = '10px';
      crCard.style.borderRadius = '8px';
      crCard.style.border = '1px solid rgba(56, 189, 248, 0.3)';

      crCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #38bdf8; font-size: 0.78rem; display: flex; align-items: center; gap: 4px;">
            <span>🪙</span> CR2032 LIVE TELEMETRY
          </strong>
          <span style="font-size: 0.68rem; padding: 2px 7px; border-radius: 4px; font-weight: 800; background: ${badgeBg}; color: ${badgeColor};">
            ${badgeText}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; text-align: center;">
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 3px; border-radius: 6px;">
            <div style="font-size: 0.60rem; color: #94a3b8;">TERMINAL V</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #38bdf8;">${vTerm.toFixed(2)} V</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 3px; border-radius: 6px;">
            <div style="font-size: 0.60rem; color: #94a3b8;">DRAIN CURRENT</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: ${curMa > 50 ? '#ef4444' : (curMa > 3 ? '#fbbf24' : '#f59e0b')};">${curMa < 1 && curMa > 0 ? (curMa * 1000).toFixed(0) + ' µA' : curMa.toFixed(1) + ' mA'}</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 3px; border-radius: 6px;">
            <div style="font-size: 0.60rem; color: #94a3b8;">ESR SAG</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #f59e0b;">-${vSag.toFixed(2)} V</div>
          </div>
          <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 3px; border-radius: 6px;">
            <div style="font-size: 0.60rem; color: #94a3b8;">INTERNAL ESR</div>
            <div style="font-size: 0.82rem; font-weight: 900; color: #cbd5e1;">${esr.toFixed(0)} Ω</div>
          </div>
        </div>

        <div style="font-size: 0.70rem; color: #cbd5e1; background: rgba(2, 6, 23, 0.45); padding: 6px 8px; border-radius: 5px; border-left: 2px solid ${badgeColor};">
          <div>Estimated Battery Life: <strong style="color: #f8fafc;">${comp.state.runtimeEstimate || '8–10 Years (Shelf Life)'}</strong></div>
          <div style="margin-top: 2px; font-size: 0.65rem; color: #94a3b8;">Joule Dissipation: <span style="color: #f59e0b;">${(esrHeat * 1000).toFixed(1)} mW</span> in cell | <span style="color: #fbbf24;">${(usefulPower * 1000).toFixed(1)} mW</span> to load</div>
        </div>

        <div style="margin-top: 4px;">
          <div style="font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>CR2032 Engineering Specification</span>
            <span style="color: #38bdf8;">IEC 60086-3</span>
          </div>
          <table style="width: 100%; font-size: 0.67rem; border-collapse: collapse; color: #cbd5e1;">
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Chemistry</td><td style="text-align: right; font-weight: 700; color: #f8fafc;">Li/MnO₂ (Lithium / Manganese Dioxide)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Nominal / Open Voltage</td><td style="text-align: right; font-weight: 700; color: #38bdf8;">3.0 V (OCV: 3.1 V – 3.4 V)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Cut-off Voltage</td><td style="text-align: right; font-weight: 700; color: #f87171;">2.0 V (Fully discharged)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Nominal Capacity</td><td style="text-align: right; font-weight: 700; color: #f8fafc;">210 – 240 mAh (Rated @ 15 kΩ)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Dimensions & Weight</td><td style="text-align: right; font-weight: 700; color: #f8fafc;">⌀ 20.0 mm × 3.2 mm · ~3.0 g</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Standard Drain</td><td style="text-align: right; font-weight: 700; color: #fbbf24;">0.2 mA – 0.3 mA (Continuous baseline)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Max Continuous Drain</td><td style="text-align: right; font-weight: 700; color: #38bdf8;">3.0 mA (Higher drains drop capacity)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Max Pulse Current</td><td style="text-align: right; font-weight: 700; color: #fbbf24;">10 mA – 50 mA (&lt; 1 s pulses)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Internal Resistance (ESR)</td><td style="text-align: right; font-weight: 700; color: #f59e0b;">~10 Ω – 30 Ω (Increases as cell ages)</td></tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);"><td style="padding: 2px 0; color: #94a3b8;">Self-Discharge Rate</td><td style="text-align: right; font-weight: 700; color: #fef08a;">&lt; 1% – 2% / year (8–10 yr shelf life)</td></tr>
              <tr><td style="padding: 2px 0; color: #94a3b8;">Operating Temperature</td><td style="text-align: right; font-weight: 700; color: #f8fafc;">-20°C to +60°C</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08);">
          <span style="font-size: 0.72rem; color: #94a3b8;">Open-Circuit Voltage (OCV):</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button type="button" class="resistor-stepper-btn btn-insp-cr-voc-down" style="width: 20px; height: 20px;">-</button>
            <input type="number" id="insp-input-cr-voc" class="resistor-input" min="2.0" max="3.4" step="0.1" value="${ocv.toFixed(1)}" style="width: 48px; font-size: 0.72rem;">
            <button type="button" class="resistor-stepper-btn btn-insp-cr-voc-up" style="width: 20px; height: 20px;">+</button>
            <span style="font-size: 0.72rem; color: #38bdf8; font-weight: bold;">V</span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span style="font-size: 0.72rem; color: #94a3b8;">Internal ESR:</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button type="button" class="resistor-stepper-btn btn-insp-cr-esr-down" style="width: 20px; height: 20px;">-</button>
            <input type="number" id="insp-input-cr-esr" class="resistor-input" min="10" max="30" step="1" value="${Math.round(esr)}" style="width: 48px; font-size: 0.72rem;">
            <button type="button" class="resistor-stepper-btn btn-insp-cr-esr-up" style="width: 20px; height: 20px;">+</button>
            <span style="font-size: 0.72rem; color: #f59e0b; font-weight: bold;">Ω</span>
          </div>
        </div>
      `;

      const inpVoc = crCard.querySelector('#insp-input-cr-voc');
      const bVocDown = crCard.querySelector('.btn-insp-cr-voc-down');
      const bVocUp = crCard.querySelector('.btn-insp-cr-voc-up');
      const setVoc = (newV) => {
        const val = Math.max(2.0, Math.min(3.4, Math.round(newV * 10) / 10));
        this.pushHistory();
        comp.state.openCircuitVoltage = val;
        inpVoc.value = val.toFixed(1);
        this.evaluateCircuit();
        this.showInspector(comp);
      };
      inpVoc.addEventListener('change', (e) => setVoc(parseFloat(e.target.value) || 3.2));
      bVocDown.addEventListener('click', () => setVoc((comp.state.openCircuitVoltage || ocv) - 0.1));
      bVocUp.addEventListener('click', () => setVoc((comp.state.openCircuitVoltage || ocv) + 0.1));

      const inpEsr = crCard.querySelector('#insp-input-cr-esr');
      const bEsrDown = crCard.querySelector('.btn-insp-cr-esr-down');
      const bEsrUp = crCard.querySelector('.btn-insp-cr-esr-up');
      const setEsr = (newR) => {
        const val = Math.max(10, Math.min(30, Math.round(newR)));
        this.pushHistory();
        comp.state.internalR = val;
        comp.internalR = val;
        inpEsr.value = val;
        this.evaluateCircuit();
        this.showInspector(comp);
      };
      inpEsr.addEventListener('change', (e) => setEsr(parseFloat(e.target.value) || 18));
      bEsrDown.addEventListener('click', () => setEsr((comp.state.internalR || esr) - 1));
      bEsrUp.addEventListener('click', () => setEsr((comp.state.internalR || esr) + 1));

      controls.appendChild(crCard);
    } else if (comp.type === 'battery' || comp.type === 'cell') {
      const batRow = document.createElement('div');
      batRow.className = 'control-row';
      const curV = comp.voltage || (comp.type === 'cell3v' ? 3.0 : (comp.type === 'cell' ? 1.5 : 9.0));
      batRow.innerHTML = `
        <span>DC Voltage</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="resistor-stepper-btn btn-insp-bat-down" style="width: 22px; height: 22px;">-</button>
          <input type="number" id="insp-input-bat" class="resistor-input" min="0.5" max="48" step="1.5" value="${curV.toFixed(1)}" style="width: 50px;">
          <button type="button" class="resistor-stepper-btn btn-insp-bat-up" style="width: 22px; height: 22px;">+</button>
          <span style="font-size: 0.75rem; color: #fbbf24; font-weight: bold;">V</span>
        </div>
      `;
      const inp = batRow.querySelector('#insp-input-bat');
      const bDown = batRow.querySelector('.btn-insp-bat-down');
      const bUp = batRow.querySelector('.btn-insp-bat-up');
      const setBatV = (newV) => {
        const v = Math.max(0.5, Math.min(48, Math.round(newV * 10) / 10));
        if (comp.voltage === v) return;
        this.pushHistory();
        comp.voltage = v;
        if (comp.state) comp.state.voltage = v;
        inp.value = v.toFixed(1);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };
      inp.addEventListener('change', (e) => setBatV(parseFloat(e.target.value) || 9));
      bDown.addEventListener('click', () => setBatV((comp.voltage || curV) - 1.5));
      bUp.addEventListener('click', () => setBatV((comp.voltage || curV) + 1.5));
      controls.appendChild(batRow);
    } else if (comp.type === 'bulb') {
      const bulbRow = document.createElement('div');
      bulbRow.className = 'control-row';
      const curR = comp.state.resistance || 50;
      bulbRow.innerHTML = `
        <span>Filament Resistance</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="resistor-stepper-btn btn-insp-bulb-down" style="width: 22px; height: 22px;">-</button>
          <input type="number" id="insp-input-bulb" class="resistor-input" min="5" max="500" step="10" value="${curR}" style="width: 50px;">
          <button type="button" class="resistor-stepper-btn btn-insp-bulb-up" style="width: 22px; height: 22px;">+</button>
          <span style="font-size: 0.75rem; color: #fbbf24; font-weight: bold;">Ω</span>
        </div>
      `;
      const inp = bulbRow.querySelector('#insp-input-bulb');
      const bDown = bulbRow.querySelector('.btn-insp-bulb-down');
      const bUp = bulbRow.querySelector('.btn-insp-bulb-up');
      const setBulbR = (newR) => {
        const r = Math.max(5, Math.min(500, Math.round(newR)));
        if (comp.state.resistance === r) return;
        this.pushHistory();
        comp.state.resistance = r;
        inp.value = r;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
      };
      inp.addEventListener('change', (e) => setBulbR(parseFloat(e.target.value) || 50));
      bDown.addEventListener('click', () => setBulbR((comp.state.resistance || curR) - 10));
      bUp.addEventListener('click', () => setBulbR((comp.state.resistance || curR) + 10));
      controls.appendChild(bulbRow);
    } else if (comp.type === 'buzzer') {
      const buzzRow = document.createElement('div');
      buzzRow.className = 'control-row';
      const curPitch = comp.state.pitch || 600;
      buzzRow.innerHTML = `
        <span>Sound Tone (Pitch)</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="resistor-stepper-btn btn-insp-buzz-down" style="width: 22px; height: 22px;">-</button>
          <input type="number" id="insp-input-buzz" class="resistor-input" min="200" max="2500" step="100" value="${curPitch}" style="width: 55px;">
          <button type="button" class="resistor-stepper-btn btn-insp-buzz-up" style="width: 22px; height: 22px;">+</button>
          <span style="font-size: 0.75rem; color: #38bdf8; font-weight: bold;">Hz</span>
        </div>
      `;
      const inp = buzzRow.querySelector('#insp-input-buzz');
      const bDown = buzzRow.querySelector('.btn-insp-buzz-down');
      const bUp = buzzRow.querySelector('.btn-insp-buzz-up');
      const setBuzz = (newP) => {
        const p = Math.max(200, Math.min(2500, Math.round(newP)));
        this.pushHistory();
        comp.state.pitch = p;
        inp.value = p;
        this.updateComponentVisual(comp);
      };
      inp.addEventListener('change', (e) => setBuzz(parseFloat(e.target.value) || 600));
      bDown.addEventListener('click', () => setBuzz((comp.state.pitch || curPitch) - 100));
      bUp.addEventListener('click', () => setBuzz((comp.state.pitch || curPitch) + 100));
      controls.appendChild(buzzRow);
    } else if (comp.type === 'capacitor') {
      const capRow = document.createElement('div');
      capRow.className = 'control-row';
      const curCap = comp.state.capacitance || 1000;
      const curVolt = comp.state.ratedVoltage || 16;
      const storedV = comp.state.storedVoltage || 0;
      const capFarads = curCap * 1e-6;
      const esr = comp.state.esr || (window.getElectrolyticESR ? window.getElectrolyticESR(curCap, curVolt) : 0.08);
      const eslNh = comp.state.eslNh || 20.0;
      const srfKhz = Math.round(1 / (2 * Math.PI * Math.sqrt((eslNh * 1e-9) * capFarads)) / 1000);
      const energyMJ = (0.5 * capFarads * storedV * storedV * 1000).toFixed(2);
      const chargeMC = (capFarads * storedV * 1000).toFixed(2);
      const stdCaps = window.STANDARD_ELECTROLYTIC_VALUES || [1, 2.2, 3.3, 4.7, 10, 22, 33, 47, 100, 220, 330, 470, 1000, 2200, 3300, 4700, 6800, 10000];
      const stdVolts = window.STANDARD_ELECTROLYTIC_VOLTAGES || [6.3, 10, 16, 25, 35, 50, 63, 100];
      const popularCaps = [1, 10, 47, 100, 220, 470, 1000, 2200, 4700, 10000];

      // Dielectric safety margin:
      const vRatio = storedV / curVolt;
      const safeColor = vRatio > 0.95 ? '#ef4444' : (vRatio > 0.75 ? '#f59e0b' : '#fbbf24');
      const safeText = vRatio > 0.95 ? 'CRITICAL (Near Dielectric Puncture!)' : (vRatio > 0.75 ? 'CAUTION (High Electric Field)' : 'SAFE (Well Within Working Limit)');

      capRow.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 9px; width: 100%;">
          <!-- Header with Dropdown & Steppers -->
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: #38bdf8; font-size: 0.8rem;">Standard Capacitance (E6/E12)</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <button type="button" class="resistor-stepper-btn btn-insp-cap-down" style="width: 24px; height: 24px;" title="Previous standard value">-</button>
              <select id="insp-select-cap" style="background: #0f172a; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 4px; padding: 2px 4px; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 800; cursor: pointer;">
                ${stdCaps.map(val => `
                  <option value="${val}" ${val === curCap ? 'selected' : ''}>
                    ${window.formatCapacitance ? window.formatCapacitance(val) : `${val}µF`}
                  </option>
                `).join('')}
              </select>
              <button type="button" class="resistor-stepper-btn btn-insp-cap-up" style="width: 24px; height: 24px;" title="Next standard value">+</button>
            </div>
          </div>

          <!-- Quick Preferred Standard Value Presets -->
          <div style="display: flex; flex-wrap: wrap; gap: 3px; justify-content: space-between;">
            ${popularCaps.map(val => `
              <button type="button" class="btn-cap-preset" data-val="${val}" style="padding: 3px 5px; font-size: 0.68rem; font-weight: 700; background: ${val === curCap ? '#0284c7' : '#1e293b'}; color: ${val === curCap ? '#ffffff' : '#94a3b8'}; border: 1px solid ${val === curCap ? '#38bdf8' : '#334155'}; border-radius: 4px; cursor: pointer; min-width: 32px;">
                ${val >= 1000 ? (val / 1000) + 'm' : val + 'µ'}
              </button>
            `).join('')}
          </div>

          <!-- Working Voltage Rating Selector (WVDC) -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px;">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Working Voltage (WVDC):</span>
            <div style="display: flex; gap: 3px; flex-wrap: wrap; justify-content: flex-end;">
              ${stdVolts.map(v => `
                <button type="button" class="btn-volt-preset" data-volt="${v}" style="padding: 2px 5px; font-size: 0.65rem; font-weight: 800; background: ${v === curVolt ? '#b45309' : '#0f172a'}; color: ${v === curVolt ? '#ffffff' : '#fbbf24'}; border: 1px solid ${v === curVolt ? '#fbbf24' : '#1e293b'}; border-radius: 4px; cursor: pointer;">
                  ${v}V
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Educational Electrical Engineering Parameters Card -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 6px; padding: 8px 10px; font-size: 0.7rem; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Stored Potential (V):</span>
              <span id="insp-cap-stored-v" style="color: #38bdf8; font-family: var(--font-mono);">${storedV.toFixed(2)}V (${(comp.state.chargePercent || 0).toFixed(0)}%)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Stored Charge (Q = C·V):</span>
              <span id="insp-cap-charge" style="color: #fde68a; font-family: var(--font-mono);">${chargeMC} mC</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Electrostatic Energy (½CV²):</span>
              <span id="insp-cap-energy" style="color: #fbbf24; font-family: var(--font-mono);">${energyMJ} mJ</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">ESR (Equivalent Series R):</span>
              <span id="insp-cap-esr" style="color: #a78bfa; font-family: var(--font-mono);">${esr.toFixed(3)} Ω (Wound Foil)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">ESL & Self-Resonance (SRF):</span>
              <span style="color: #94a3b8; font-family: var(--font-mono);">${eslNh} nH • ~${srfKhz} kHz</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Discharge Time Constant (τ = R·C):</span>
              <span id="insp-cap-tau" style="color: #38bdf8; font-family: var(--font-mono);">${comp.state.dischargeTau ? `${comp.state.dischargeTau.toFixed(2)} s` : '— (Open Circuit)'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; border-top: 1px dashed rgba(56, 189, 248, 0.25); padding-top: 4px; margin-top: 2px;">
              <span style="color: #94a3b8;">Dielectric Safety Margin:</span>
              <span style="color: ${safeColor}; font-weight: 800; font-family: var(--font-mono);">${((storedV / curVolt) * 100).toFixed(0)}% (${safeText})</span>
            </div>
            <div style="font-size: 0.62rem; color: #94a3b8; line-height: 1.35; margin-top: 2px;">
              ⚡ <strong>Bulk Reservoir & Ripple Filter:</strong> Al₂O₃ oxide dielectric with liquid electrolyte. Strictly polarized: Anode (+) & Cathode (− Stripe). Reversing polarity boils electrolyte into hydrogen gas and blows the top vent!
            </div>
          </div>

          <!-- Instant Discharge / Clear Button -->
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 0.68rem; color: #64748b;">RC Discharge: τ = R × C</span>
            <button type="button" class="btn-cap-discharge" style="background: #ef4444; color: #ffffff; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.72rem; font-weight: 800; cursor: pointer;" title="Instantly bleed off stored electrostatic charge">
              ⚡ Clear / Discharge
            </button>
          </div>
        </div>
      `;

      const selCap = capRow.querySelector('#insp-select-cap');
      const bDown = capRow.querySelector('.btn-insp-cap-down');
      const bUp = capRow.querySelector('.btn-insp-cap-up');
      const setCap = (newC) => {
        const c = window.getClosestElectrolytic ? window.getClosestElectrolytic(newC) : Math.max(1, Math.round(newC));
        this.pushHistory();
        comp.state.capacitance = c;
        comp.state.esr = window.getElectrolyticESR ? window.getElectrolyticESR(c, comp.state.ratedVoltage) : 0.08;
        if (selCap) selCap.value = c;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };
      const setVolt = (newV) => {
        this.pushHistory();
        comp.state.ratedVoltage = newV;
        comp.state.esr = window.getElectrolyticESR ? window.getElectrolyticESR(comp.state.capacitance || 1000, newV) : 0.08;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };
      if (selCap) {
        selCap.addEventListener('change', (e) => setCap(parseFloat(e.target.value) || 1000));
      }
      bDown.addEventListener('click', () => {
        const prev = window.getPrevElectrolytic ? window.getPrevElectrolytic(comp.state.capacitance || curCap) : (curCap - 100);
        setCap(prev);
      });
      bUp.addEventListener('click', () => {
        const next = window.getNextElectrolytic ? window.getNextElectrolytic(comp.state.capacitance || curCap) : (curCap + 100);
        setCap(next);
      });
      capRow.querySelectorAll('.btn-cap-preset').forEach(btn => {
        btn.addEventListener('click', () => setCap(parseFloat(btn.dataset.val)));
      });
      capRow.querySelectorAll('.btn-volt-preset').forEach(btn => {
        btn.addEventListener('click', () => setVolt(parseFloat(btn.dataset.volt)));
      });
      const bDischarge = capRow.querySelector('.btn-cap-discharge');
      if (bDischarge) {
        bDischarge.addEventListener('click', () => {
          this.pushHistory();
          comp.state.storedVoltage = 0;
          comp.state.chargePercent = 0;
          comp.state.current = 0;
          this.evaluateCircuit();
          this.updateComponentVisual(comp);
          this.showInspector(comp);
        });
      }
      controls.appendChild(capRow);
    } else if (comp.type === 'ceramic_capacitor') {
      const cerRow = document.createElement('div');
      cerRow.className = 'control-row';
      const curCode = comp.state.ceramicCode || '104';
      const curNf = comp.state.capacitanceNf || 100;
      const curUf = comp.state.capacitanceUf || 0.1;
      const curPf = comp.state.capacitancePf || 100000;
      const storedV = comp.state.storedVoltage || 0;
      const effUf = window.getCeramicEffectiveCapacitance ? window.getCeramicEffectiveCapacitance(curCode, storedV) : curUf;
      const effNf = effUf * 1000;
      const effPf = effUf * 1e6;
      const esr = comp.state.esr || 0.010;
      const eslNh = comp.state.eslNh || 0.9;
      const srfMhz = window.calculateCeramicSRF ? (window.calculateCeramicSRF(effUf * 1e-6, eslNh) / 1e6).toFixed(1) : (1 / (2 * Math.PI * Math.sqrt((eslNh * 1e-9) * (effUf * 1e-6))) / 1e6).toFixed(1);
      const qCoulombs = effUf * 1e-6 * storedV;
      const eJoules = 0.5 * effUf * 1e-6 * storedV * storedV;
      const qStr = window.formatCharge ? window.formatCharge(qCoulombs) : `${(qCoulombs * 1e6).toFixed(2)} µC`;
      const eStr = window.formatEnergy ? window.formatEnergy(eJoules) : `${(eJoules * 1e6).toFixed(2)} µJ`;

      const fOp = 1000;
      const xc = window.calculateCapacitorReactance ? window.calculateCapacitorReactance(effUf * 1e-6, fOp) : (1 / (2 * Math.PI * fOp * Math.max(1e-15, effUf * 1e-6)));
      const xcStr = xc >= 1000000 ? `${(xc / 1e6).toFixed(1)} MΩ` : (xc >= 1000 ? `${(xc / 1000).toFixed(1)} kΩ` : `${xc.toFixed(2)} Ω`);

      const stdCodes = ['120', '220', '470', '101', '102', '103', '223', '473', '104', '224', '474', '105', '106'];

      const roleName = comp.state.circuitRoleName || 'Electrostatic Energy Storage';
      const roleDetail = comp.state.roleDetail || 'Stores electric charge electrostatically (Q = C·V) between stacked planar metal electrodes.';
      let roleIcon = '⚡';
      let roleBorder = '#f59e0b';
      let roleBg = 'rgba(245, 158, 11, 0.12)';
      if (comp.state.circuitRole === 'snubber') {
        roleIcon = '🛡️';
        roleBorder = '#ef4444';
        roleBg = 'rgba(239, 68, 68, 0.15)';
      } else if (comp.state.circuitRole === 'ac_coupling') {
        roleIcon = '〰️';
        roleBorder = '#0ea5e9';
        roleBg = 'rgba(14, 165, 233, 0.15)';
      } else if (comp.state.circuitRole === 'timing') {
        roleIcon = '⏱️';
        roleBorder = '#f59e0b';
        roleBg = 'rgba(16, 185, 129, 0.15)';
      } else if (comp.state.circuitRole === 'decoupling_pair') {
        roleIcon = '⚡';
        roleBorder = '#8b5cf6';
        roleBg = 'rgba(139, 92, 246, 0.15)';
      }

      cerRow.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <!-- Active Circuit Role Badge -->
          <div style="background: ${roleBg}; border: 1px solid ${roleBorder}; border-radius: 6px; padding: 6px 8px; font-size: 0.72rem;">
            <div style="display: flex; align-items: center; gap: 5px; font-weight: 800; color: #f8fafc;">
              <span>${roleIcon}</span>
              <span id="insp-cer-role">${roleName}</span>
            </div>
            <div style="color: #94a3b8; font-size: 0.65rem; margin-top: 2px; line-height: 1.3;">${roleDetail}</div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: #f59e0b;">Standard EIA 3-Digit Code</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <button type="button" class="resistor-stepper-btn btn-insp-cer-down" style="width: 24px; height: 24px;">-</button>
              <span id="insp-label-code" style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 900; color: #fbbf24; background: #1e1005; border: 1px solid #d97706; border-radius: 4px; padding: 1px 8px;">${curCode}</span>
              <button type="button" class="resistor-stepper-btn btn-insp-cer-up" style="width: 24px; height: 24px;">+</button>
            </div>
          </div>

          <!-- Quick EIA Code Selection Buttons -->
          <div style="display: flex; flex-wrap: wrap; gap: 3px; justify-content: space-between;">
            ${stdCodes.map(c => `
              <button type="button" class="btn-cer-preset" data-code="${c}" style="padding: 3px 5px; font-size: 0.68rem; font-family: var(--font-mono); font-weight: 800; background: ${c === curCode ? '#d97706' : '#1e1005'}; color: ${c === curCode ? '#ffffff' : '#fbbf24'}; border: 1px solid ${c === curCode ? '#f59e0b' : '#78350f'}; border-radius: 4px; cursor: pointer; min-width: 30px;">
                ${c}
              </button>
            `).join('')}
          </div>

          <!-- Educational EIA Conversion Table Card -->
          <div style="background: rgba(24, 16, 8, 0.7); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 7px 10px; font-size: 0.7rem; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Nominal / Effective:</span>
              <span id="insp-cer-eff-c" style="color: #fde68a; font-family: var(--font-mono);">${curPf < 1000 ? curPf + ' pF' : (curNf >= 1000 ? curUf + ' µF' : curNf + ' nF')} (${effPf < 1000 ? effPf.toFixed(1) + ' pF' : (effNf >= 1000 ? effUf.toFixed(2) + ' µF' : effNf.toFixed(1) + ' nF')} @ ${storedV.toFixed(1)}V DC)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Dielectric Class:</span>
              <span style="color: #fde68a; font-family: var(--font-mono); font-size: 0.65rem;">${comp.state.dielectricClass || 'Class 2 (X7R)'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Parasitics (ESR & ESL):</span>
              <span style="color: #38bdf8; font-family: var(--font-mono);">ESR ~${(esr * 1000).toFixed(0)}mΩ • ESL ~${eslNh}nH</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Self-Resonant Freq (SRF):</span>
              <span style="color: #fbbf24; font-family: var(--font-mono);">~${srfMhz} MHz (Ultra-High Speed)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Reactance (Xc @ 1kHz):</span>
              <span style="color: #38bdf8; font-family: var(--font-mono);">${xcStr}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed rgba(245, 158, 11, 0.3); padding-top: 4px; margin-top: 2px;">
              <span style="color: #94a3b8;">EIA Math Formula:</span>
              <span style="color: #38bdf8; font-family: var(--font-mono);">${curCode.slice(0, 2)} × 10<sup>${curCode[2]}</sup> pF</span>
            </div>
            <div style="font-size: 0.63rem; color: #fbbf24; font-weight: 600; line-height: 1.35;">
              ✓ <strong>Non-Polarized (Reversible):</strong> Symmetrical leads, safe in either direction. Ideal for high-speed IC bypass, crystal timing & RF snubbing up to 50V!
            </div>
          </div>

          <!-- Live Voltage & Discharge -->
          <div style="background: rgba(15, 23, 42, 0.6); padding: 5px 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.3); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 0.72rem; color: #fbbf24; font-weight: 800;">Voltage: <span id="insp-cer-voltage">${storedV.toFixed(2)}V</span></div>
              <div style="font-size: 0.64rem; color: #94a3b8;">Energy: <span id="insp-cer-energy">${eStr}</span> • Q: <span id="insp-cer-charge">${qStr}</span></div>
            </div>
            <button type="button" class="btn-cer-discharge" style="background: #ef4444; color: #ffffff; border: none; padding: 3px 8px; border-radius: 4px; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
              ⚡ Clear
            </button>
          </div>
        </div>
      `;
      const setCeramic = (entry) => {
        if (!entry) return;
        this.pushHistory();
        comp.state.ceramicCode = entry.code;
        comp.state.capacitancePf = entry.pf;
        comp.state.capacitanceNf = entry.nf;
        comp.state.capacitanceUf = entry.uf;
        comp.state.capacitance = entry.uf;
        comp.state.effectiveCapacitanceUf = entry.uf;
        comp.state.esr = entry.esr || 0.010;
        comp.state.eslNh = entry.esl || 0.9;
        comp.state.dielectricClass = entry.dielectricClass;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };
      cerRow.querySelector('.btn-insp-cer-down').addEventListener('click', () => {
        const prev = window.getPrevCeramicCapacitor ? window.getPrevCeramicCapacitor(comp.state.ceramicCode || curCode) : null;
        setCeramic(prev);
      });
      cerRow.querySelector('.btn-insp-cer-up').addEventListener('click', () => {
        const next = window.getNextCeramicCapacitor ? window.getNextCeramicCapacitor(comp.state.ceramicCode || curCode) : null;
        setCeramic(next);
      });
      cerRow.querySelectorAll('.btn-cer-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const entry = window.getCeramicCapacitor ? window.getCeramicCapacitor(btn.dataset.code) : null;
          setCeramic(entry);
        });
      });
      const bDischarge = cerRow.querySelector('.btn-cer-discharge');
      if (bDischarge) {
        bDischarge.addEventListener('click', () => {
          this.pushHistory();
          comp.state.storedVoltage = 0;
          comp.state.chargePercent = 0;
          comp.state.current = 0;
          this.evaluateCircuit();
          this.updateComponentVisual(comp);
          this.showInspector(comp);
        });
      }
      controls.appendChild(cerRow);
    } else if (comp.type === 'inductor') {
      const indRow = document.createElement('div');
      indRow.className = 'control-row';
      const curMh = comp.state.inductanceMh || (comp.state.inductanceUh ? comp.state.inductanceUh / 1000 : 10);
      const dcr = comp.state.dcr || 0.8;
      const isat = comp.state.isat || 3.5;
      const curA = comp.state.actualCurrent !== undefined ? comp.state.actualCurrent : (comp.state.current || 0);
      const storedE = comp.state.storedEnergy || 0;
      const xl = comp.state.reactanceXl || 0;
      const tau = comp.state.tau || 0;
      const rise5Tau = comp.state.riseTime5Tau || (5 * tau);
      const roleName = comp.state.circuitRoleName || 'Power Choke Inductor';
      const roleDetail = comp.state.roleDetail || 'Passes steady DC while opposing rapid current changes.';
      const isFlybackProtected = comp.state.flybackProtected;
      const kickbackV = comp.state.kickbackVoltage || 0;
      const f0 = comp.state.resonantFreqF0 || 0;
      const stdPresets = [0.1, 1, 10, 100, 1000, 2200, 5000, 10000];

      const tauStr = tau >= 1.0 ? tau.toFixed(2) + ' s' : (tau * 1000).toFixed(1) + ' ms';
      const rise5Str = rise5Tau >= 1.0 ? rise5Tau.toFixed(2) + ' s' : (rise5Tau * 1000).toFixed(1) + ' ms';
      const f0Str = f0 >= 1e6 ? (f0 / 1e6).toFixed(2) + ' MHz' : (f0 >= 1000 ? (f0 / 1000).toFixed(1) + ' kHz' : f0.toFixed(1) + ' Hz');

      indRow.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: #f59e0b;">Standard Inductance Rating</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <button type="button" class="resistor-stepper-btn btn-insp-ind-down" style="width: 24px; height: 24px;">-</button>
              <span id="insp-label-ind" style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 900; color: #fbbf24; background: #1e1005; border: 1px solid #d97706; border-radius: 4px; padding: 1px 8px;">
                ${window.formatInductance ? window.formatInductance(curMh) : curMh + 'mH'}
              </span>
              <button type="button" class="resistor-stepper-btn btn-insp-ind-up" style="width: 24px; height: 24px;">+</button>
            </div>
          </div>
          <!-- Quick Preset Buttons (µH to Henries) -->
          <div style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: space-between;">
            ${stdPresets.map(p => `
              <button type="button" class="btn-ind-preset" data-mh="${p}" style="padding: 3px 6px; font-size: 0.70rem; font-family: var(--font-mono); font-weight: 800; background: ${Math.abs(p - curMh) < 0.05 ? '#d97706' : '#1e1005'}; color: ${Math.abs(p - curMh) < 0.05 ? '#ffffff' : '#fbbf24'}; border: 1px solid ${Math.abs(p - curMh) < 0.05 ? '#f59e0b' : '#78350f'}; border-radius: 4px; cursor: pointer;">
                ${window.formatInductance ? window.formatInductance(p) : p + 'mH'}
              </button>
            `).join('')}
          </div>

          <!-- Active Functional Circuit Role Badge -->
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 6px 9px; font-size: 0.70rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #94a3b8; font-weight: 700;">Functional Role:</span>
              <span style="color: #38bdf8; font-family: var(--font-mono); font-weight: 800;">${roleName}</span>
            </div>
            <div style="color: #cbd5e1; font-size: 0.64rem; line-height: 1.3;">${roleDetail}</div>
          </div>

          <!-- Flyback Clamping Protection Status Card -->
          <div style="background: ${isFlybackProtected ? 'rgba(120, 53, 15, 0.4)' : (kickbackV > 0 ? 'rgba(127, 29, 29, 0.45)' : 'rgba(30, 41, 59, 0.4)')}; border: 1px solid ${isFlybackProtected ? '#f59e0b' : (kickbackV > 0 ? '#ef4444' : '#64748b')}; border-radius: 6px; padding: 6px 9px; font-size: 0.68rem; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: ${isFlybackProtected ? '#fde68a' : (kickbackV > 0 ? '#fca5a5' : '#94a3b8')};">
              ${isFlybackProtected ? '🛡️ Flyback Protected' : (kickbackV > 0 ? '⚠️ Kickback Spike Hazard' : '⚡ Inductive Kickback Potential')}
            </span>
            <span style="font-family: var(--font-mono); font-weight: 800; color: ${isFlybackProtected ? '#fbbf24' : (kickbackV > 0 ? '#f87171' : '#fde68a')};">
              ${isFlybackProtected ? 'Clamped (0.7V)' : (kickbackV > 0 ? `Unprotected (${kickbackV}V)` : 'Requires Diode')}
            </span>
          </div>

          <!-- Inductor Physics & Electrical Specs Card -->
          <div style="background: rgba(24, 16, 8, 0.75); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 7px 10px; font-size: 0.7rem; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Active Current i(t):</span>
              <span id="insp-ind-current" style="color: #fbbf24; font-family: var(--font-mono);">${curA.toFixed(2)} A</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">RL Time Constant (τ = L/R):</span>
              <span id="insp-ind-tau" style="color: #fde68a; font-family: var(--font-mono);">${tauStr} (5τ = ${rise5Str})</span>
            </div>
            ${f0 > 0 ? `
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span style="color: #94a3b8;">Resonant Frequency (f₀):</span>
                <span style="color: #38bdf8; font-family: var(--font-mono);">${f0Str}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Stored Energy (E = ½LI²):</span>
              <span id="insp-ind-energy" style="color: #fbbf24; font-family: var(--font-mono);">${(storedE * 1000).toFixed(2)} mJ</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">DC Winding Resistance (DCR):</span>
              <span style="color: #fde68a; font-family: var(--font-mono);">${dcr.toFixed(2)} Ω</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Saturation Current (I_sat):</span>
              <span style="color: #fde68a; font-family: var(--font-mono);">${isat.toFixed(1)} A</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">AC Reactance (X_L = 2πfL):</span>
              <span style="color: #38bdf8; font-family: var(--font-mono);">${xl.toFixed(1)} Ω</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed rgba(245, 158, 11, 0.3); padding-top: 4px; margin-top: 2px;">
              <span style="color: #94a3b8;">Faraday / Lenz Law:</span>
              <span style="color: #fbbf24; font-family: var(--font-mono);">v_L(t) = -L · (di/dt)</span>
            </div>
            <div style="font-size: 0.63rem; color: #fbbf24; font-weight: 600;">
              ✓ Heavy Enameled Copper Coil • High Permeability Ferrite Core
            </div>
          </div>
        </div>
      `;
      const setInductor = (entry) => {
        if (!entry) return;
        this.pushHistory();
        comp.state.inductanceMh = entry.mh;
        comp.state.inductanceUh = entry.valUh;
        comp.state.dcr = entry.dcr;
        comp.state.isat = entry.isat;
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };
      indRow.querySelector('.btn-insp-ind-down').addEventListener('click', () => {
        const prev = window.getPrevInductor ? window.getPrevInductor(comp.state.inductanceMh || curMh) : null;
        setInductor(prev);
      });
      indRow.querySelector('.btn-insp-ind-up').addEventListener('click', () => {
        const next = window.getNextInductor ? window.getNextInductor(comp.state.inductanceMh || curMh) : null;
        setInductor(next);
      });
      indRow.querySelectorAll('.btn-ind-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const entry = window.getClosestInductor ? window.getClosestInductor(parseFloat(btn.dataset.mh)) : null;
          setInductor(entry);
        });
      });
      controls.appendChild(indRow);
    } else if (comp.type === 'power_supply') {
      const psRow = document.createElement('div');
      psRow.className = 'control-row';
      const curV = comp.state.voltage !== undefined ? comp.state.voltage : 12.0;
      const curI = comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.50;
      const outOn = comp.state.outputEnabled !== false;
      const mode = comp.state.mode || 'cv';
      const actV = comp.state.actualVoltage !== undefined ? comp.state.actualVoltage : curV;
      const actI = comp.state.actualCurrent !== undefined ? comp.state.actualCurrent : (comp.state.current || 0);
      const pWatts = actV * actI;
      const rCross = (curI > 0) ? (curV / curI) : Infinity;
      const rLoad = (actI > 0.0005) ? (actV / actI) : Infinity;

      const vPresets = [1.8, 3.3, 5.0, 9.0, 12.0, 24.0, 48.0];
      const iPresets = [0.02, 0.05, 0.10, 0.50, 1.00, 2.50, 5.00];

      const formatPresetI = (a) => (a < 1 ? `${Math.round(a * 1000)}mA` : `${a.toFixed(1)}A`);

      psRow.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
          <!-- Output Master Switch -->
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 8px 12px;">
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 800; font-size: 0.82rem; color: #f8fafc;">DC Output Terminals</span>
              <span style="font-size: 0.68rem; color: ${outOn ? '#fbbf24' : '#f87171'}; font-weight: 700;">
                ${outOn ? '⚡ Output Energized & Active' : '⭕ Output Disconnected (Standby)'}
              </span>
            </div>
            <button type="button" class="btn-insp-ps-toggle" style="background: ${outOn ? '#78350f' : '#450a0a'}; border: 1.5px solid ${outOn ? '#f59e0b' : '#ef4444'}; color: #ffffff; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 900; padding: 4px 12px; border-radius: 5px; cursor: pointer;">
              ${outOn ? 'OUTPUT ON' : 'OUTPUT OFF'}
            </button>
          </div>

          <!-- Voltage Adjustment (0 to 50V) -->
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 700; color: #38bdf8; font-size: 0.8rem;">Voltage Setting (0.0 to 50.0V DC)</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button type="button" class="btn-insp-v-step-down" style="background: #082f49; border: 1px solid #0284c7; color: #38bdf8; border-radius: 3px; font-weight: 900; font-size: 0.7rem; padding: 1px 6px; cursor: pointer;" title="Step down 0.1V">-0.1V</button>
                <span id="insp-ps-v-display" style="font-family: var(--font-mono); font-size: 1rem; font-weight: 900; color: #38bdf8; background: #082f49; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 8px;">
                  ${curV.toFixed(1)} V
                </span>
                <button type="button" class="btn-insp-v-step-up" style="background: #082f49; border: 1px solid #0284c7; color: #38bdf8; border-radius: 3px; font-weight: 900; font-size: 0.7rem; padding: 1px 6px; cursor: pointer;" title="Step up 0.1V">+0.1V</button>
              </div>
            </div>
            <input type="range" class="insp-ps-v-slider" min="0" max="50" step="0.1" value="${curV}" style="width: 100%; accent-color: #38bdf8; cursor: pointer;">
            <!-- Voltage Preset Chips -->
            <div style="display: flex; gap: 4px; justify-content: space-between;">
              ${vPresets.map(v => `
                <button type="button" class="btn-ps-v-preset" data-v="${v}" style="flex: 1; padding: 3px 2px; font-size: 0.68rem; font-family: var(--font-mono); font-weight: 800; background: ${Math.abs(v - curV) < 0.05 ? '#0284c7' : '#082f49'}; color: #ffffff; border: 1px solid ${Math.abs(v - curV) < 0.05 ? '#38bdf8' : '#0369a1'}; border-radius: 4px; cursor: pointer;">
                  ${v}V
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Current Limit Adjustment (0.01 to 5A) -->
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 700; color: #fbbf24; font-size: 0.8rem;">Current Limit (0.01 to 5.00A)</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button type="button" class="btn-insp-i-step-down" style="background: #78350f; border: 1px solid #f59e0b; color: #fbbf24; border-radius: 3px; font-weight: 900; font-size: 0.7rem; padding: 1px 5px; cursor: pointer;" title="Step down 10mA">-10mA</button>
                <span id="insp-ps-i-display" style="font-family: var(--font-mono); font-size: 1rem; font-weight: 900; color: #fbbf24; background: #78350f; border: 1px solid #f59e0b; border-radius: 4px; padding: 2px 8px;">
                  ${curI < 1.0 ? Math.round(curI * 1000) + ' mA' : curI.toFixed(2) + ' A'}
                </span>
                <button type="button" class="btn-insp-i-step-up" style="background: #78350f; border: 1px solid #f59e0b; color: #fbbf24; border-radius: 3px; font-weight: 900; font-size: 0.7rem; padding: 1px 5px; cursor: pointer;" title="Step up 10mA">+10mA</button>
              </div>
            </div>
            <input type="range" class="insp-ps-i-slider" min="0.01" max="5.0" step="0.01" value="${curI}" style="width: 100%; accent-color: #fbbf24; cursor: pointer;">
            <!-- Current Limit Preset Chips -->
            <div style="display: flex; gap: 4px; justify-content: space-between;">
              ${iPresets.map(i => `
                <button type="button" class="btn-ps-i-preset" data-i="${i}" style="flex: 1; padding: 3px 2px; font-size: 0.68rem; font-family: var(--font-mono); font-weight: 800; background: ${Math.abs(i - curI) < 0.008 ? '#b45309' : '#78350f'}; color: #ffffff; border: 1px solid ${Math.abs(i - curI) < 0.008 ? '#fbbf24' : '#92400e'}; border-radius: 4px; cursor: pointer;">
                  ${formatPresetI(i)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Real-Time Telemetry & Regulation Physics Card -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 8px 10px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800;">
              <span style="color: #94a3b8;">Automatic Regulation Mode:</span>
              <span style="padding: 1px 7px; border-radius: 3px; font-size: 0.7rem; font-family: var(--font-mono); background: ${mode === 'cc' ? '#7f1d1d' : '#78350f'}; color: ${mode === 'cc' ? '#fca5a5' : '#fde68a'}; border: 1px solid ${mode === 'cc' ? '#ef4444' : '#f59e0b'};">
                ${mode === 'cc' ? '⚠️ CC (Constant Current Limited)' : '✓ CV (Constant Voltage)'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Delivered Voltage:</span>
              <span style="color: #38bdf8; font-family: var(--font-mono);">${outOn ? actV.toFixed(2) + ' V' : '0.00 V'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Delivered Current:</span>
              <span style="color: #fbbf24; font-family: var(--font-mono);">${outOn ? (actI >= 1 ? actI.toFixed(3) + ' A' : (actI * 1000).toFixed(1) + ' mA') : '0.000 A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Total Output Power:</span>
              <span style="color: #fbbf24; font-family: var(--font-mono);">${outOn ? pWatts.toFixed(2) + ' Watts' : '0.00 Watts'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">Load Equivalent Impedance:</span>
              <span style="color: #cbd5e1; font-family: var(--font-mono);">${isFinite(rLoad) ? rLoad.toFixed(2) + ' Ω' : 'Open Circuit (∞)'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700;">
              <span style="color: #94a3b8;">CV/CC Crossover Threshold:</span>
              <span style="color: #94a3b8; font-family: var(--font-mono);">${isFinite(rCross) ? rCross.toFixed(1) + ' Ω (V_set / I_limit)' : '—'}</span>
            </div>
            <div style="border-top: 1px dashed rgba(56, 189, 248, 0.25); padding-top: 4px; margin-top: 2px; font-size: 0.65rem; color: #94a3b8;">
              3 Banana Posts: Red (+) Positive, Green (⏚ Earth GND), Black (−) Negative.
            </div>
          </div>
        </div>
      `;

      const btnToggle = psRow.querySelector('.btn-insp-ps-toggle');
      const vSlider = psRow.querySelector('.insp-ps-v-slider');
      const iSlider = psRow.querySelector('.insp-ps-i-slider');
      const btnVStepDown = psRow.querySelector('.btn-insp-v-step-down');
      const btnVStepUp = psRow.querySelector('.btn-insp-v-step-up');
      const btnIStepDown = psRow.querySelector('.btn-insp-i-step-down');
      const btnIStepUp = psRow.querySelector('.btn-insp-i-step-up');

      const applyPSChange = () => {
        this.pushHistory();
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };

      btnToggle.addEventListener('click', () => {
        comp.state.outputEnabled = comp.state.outputEnabled === false ? true : false;
        if (window.sounds && window.sounds.playSwitch) {
          window.sounds.playSwitch(comp.state.outputEnabled);
        }
        applyPSChange();
      });

      btnVStepDown.addEventListener('click', () => {
        comp.state.voltage = Math.max(0, parseFloat(((comp.state.voltage || 12.0) - 0.1).toFixed(1)));
        applyPSChange();
      });

      btnVStepUp.addEventListener('click', () => {
        comp.state.voltage = Math.min(50, parseFloat(((comp.state.voltage || 12.0) + 0.1).toFixed(1)));
        applyPSChange();
      });

      btnIStepDown.addEventListener('click', () => {
        comp.state.currentLimit = Math.max(0.01, parseFloat(((comp.state.currentLimit || 2.50) - 0.01).toFixed(2)));
        applyPSChange();
      });

      btnIStepUp.addEventListener('click', () => {
        comp.state.currentLimit = Math.min(5.0, parseFloat(((comp.state.currentLimit || 2.50) + 0.01).toFixed(2)));
        applyPSChange();
      });

      vSlider.addEventListener('input', (e) => {
        comp.state.voltage = parseFloat(e.target.value);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        const vDisp = psRow.querySelector('#insp-ps-v-display');
        if (vDisp) vDisp.textContent = `${comp.state.voltage.toFixed(1)} V`;
      });
      vSlider.addEventListener('change', () => this.showInspector(comp));

      iSlider.addEventListener('input', (e) => {
        comp.state.currentLimit = parseFloat(e.target.value);
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        const iDisp = psRow.querySelector('#insp-ps-i-display');
        if (iDisp) {
          iDisp.textContent = comp.state.currentLimit < 1.0
            ? `${Math.round(comp.state.currentLimit * 1000)} mA`
            : `${comp.state.currentLimit.toFixed(2)} A`;
        }
      });
      iSlider.addEventListener('change', () => this.showInspector(comp));

      psRow.querySelectorAll('.btn-ps-v-preset').forEach(b => {
        b.addEventListener('click', () => {
          comp.state.voltage = parseFloat(b.dataset.v);
          applyPSChange();
        });
      });

      psRow.querySelectorAll('.btn-ps-i-preset').forEach(b => {
        b.addEventListener('click', () => {
          comp.state.currentLimit = parseFloat(b.dataset.i);
          applyPSChange();
        });
      });

      controls.appendChild(psRow);
    } else if (comp.type === 'ammeter') {
      const amRow = document.createElement('div');
      amRow.className = 'control-row ammeter-inspector-card';
      amRow.style.flexDirection = 'column';
      amRow.style.alignItems = 'stretch';
      amRow.style.gap = '10px';

      const isBlown = comp.state.fuseBlown || comp.state.burnt;
      const mode = (comp.state.mode || 'dc').toLowerCase();
      const isAC = (mode === 'ac');
      const cur = comp.state.measuredCurrent !== undefined ? comp.state.measuredCurrent : (comp.state.current || 0);
      const absCur = Math.abs(cur);
      const isReversed = !isAC && comp.state.reversed;
      const reading = isBlown ? 'FUSE BLOWN' : (comp.state.reading || (absCur >= 1 ? (isAC ? '~ ' : '') + absCur.toFixed(3) + ' A' : (isAC ? '~ ' : '') + (absCur * 1000).toFixed(1) + ' mA'));
      const burdenV = absCur * (comp.state.shuntResistance || 0.01);
      const shuntP = absCur * absCur * (comp.state.shuntResistance || 0.01);

      amRow.innerHTML = `
        <!-- AC / DC Mode Selector Segmented Controls -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Current Measurement Mode:</div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-insp-ammeter-mode-dc" style="flex: 1; padding: 7px 4px; font-size: 0.78rem; font-family: var(--font-mono); font-weight: 800; border-radius: 6px; cursor: pointer; border: 1px solid ${!isAC ? '#38bdf8' : '#334155'}; background: ${!isAC ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#0f172a'}; color: ${!isAC ? '#ffffff' : '#94a3b8'}; transition: all 0.15s ease;">
              🔋 DC Mode (⎓)
            </button>
            <button type="button" class="btn-insp-ammeter-mode-ac" style="flex: 1; padding: 7px 4px; font-size: 0.78rem; font-family: var(--font-mono); font-weight: 800; border-radius: 6px; cursor: pointer; border: 1px solid ${isAC ? '#fbbf24' : '#334155'}; background: ${isAC ? 'linear-gradient(135deg, #d97706, #b45309)' : '#0f172a'}; color: ${isAC ? '#ffffff' : '#94a3b8'}; transition: all 0.15s ease;">
              ⚡ AC Mode (~ RMS)
            </button>
          </div>
        </div>

        <!-- Live Digital LCD Readout Card -->
        <div style="background: #030712; border: 1px solid ${isBlown ? '#ef4444' : (isAC ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.4)')}; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px; box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.68rem; font-weight: 900; padding: 2px 6px; border-radius: 4px; background: ${isAC ? 'rgba(245, 158, 11, 0.2)' : 'rgba(2, 132, 199, 0.2)'}; color: ${isAC ? '#fbbf24' : '#38bdf8'}; font-family: var(--font-mono);">
                ${isAC ? 'AC ~ TRUE RMS' : (isReversed ? 'DC ⎓ REVERSED' : 'DC ⎓ DIRECT')}
              </span>
              ${isReversed ? '<span style="font-size: 0.65rem; color: #f87171; font-weight: 800;">(Neg Terminal In)</span>' : ''}
            </div>
            <span style="font-size: 0.68rem; color: #64748b; font-family: var(--font-mono);">R_shunt = 10 mΩ</span>
          </div>

          <div style="display: flex; justify-content: center; align-items: baseline; padding: 4px 0;">
            <span style="font-family: var(--font-mono); font-size: 1.45rem; font-weight: 900; color: ${isBlown ? '#ef4444' : (isAC ? '#fbbf24' : '#38bdf8')}; letter-spacing: 0.5px;">
              ${reading}
            </span>
          </div>

          ${comp.state.modeWarning ? `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; padding: 5px 8px; font-size: 0.68rem; color: #fca5a5; line-height: 1.3;">
              ⚠️ ${comp.state.modeWarning}
            </div>
          ` : ''}
        </div>

        <!-- Fuse Status / Replacement Banner -->
        ${isBlown ? `
          <div style="background: rgba(220, 38, 38, 0.15); border: 1px solid #ef4444; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 0.76rem; font-weight: 900; color: #fca5a5; display: flex; align-items: center; gap: 6px;">
              <span>💥</span>
              <span>10A FAST-ACTING CERAMIC FUSE BLOWN!</span>
            </div>
            <div style="font-size: 0.68rem; color: #cbd5e1; line-height: 1.35;">
              The ammeter was connected in parallel across the voltage source or current exceeded 10.0A. The internal protective fuse opened the circuit to prevent an explosion.
            </div>
            <button type="button" class="btn-insp-ammeter-fuse-replace" style="width: 100%; padding: 8px; font-size: 0.78rem; font-weight: 800; font-family: var(--font-main); background: linear-gradient(135deg, #f59e0b, #b45309); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              <span>🔄</span>
              <span>REPLACE 10A CERAMIC FUSE</span>
            </button>
          </div>
        ` : `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.6); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.72rem;">
            <span style="color: #94a3b8;">Internal 10A Ceramic Fuse:</span>
            <span style="color: #fbbf24; font-weight: 800; display: flex; align-items: center; gap: 4px;">
              <span>🛡️</span> INTACT (Safe)
            </span>
          </div>
        `}

        <!-- Electrical Characteristics & Burden Physics -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 8px; font-size: 0.7rem; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>Internal Shunt (R_shunt):</span>
            <span style="font-family: var(--font-mono); color: #38bdf8;">0.010 Ω (10 mΩ)</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>Burden Voltage (V = I · R):</span>
            <span style="font-family: var(--font-mono); color: #fbbf24;">${(burdenV * 1000).toFixed(2)} mV</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>Shunt Power Dissipation (P = I²R):</span>
            <span style="font-family: var(--font-mono); color: #fef08a;">${shuntP < 1 ? (shuntP * 1000).toFixed(2) + ' mW' : shuntP.toFixed(3) + ' W'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>Protection Rating:</span>
            <span style="font-family: var(--font-mono); color: #f87171;">10.0 A Fast-Blow Fuse</span>
          </div>
          <div style="border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 5px; font-size: 0.65rem; color: #94a3b8; line-height: 1.35;">
            ⚡ <strong>Circuit Rules</strong>: Connect strictly in <strong>SERIES</strong> with the circuit load. Never bridge directly across (+) and (−) power terminals, or the 10A fuse will blow instantly!
          </div>
        </div>
      `;

      controls.appendChild(amRow);

      const btnDC = amRow.querySelector('.btn-insp-ammeter-mode-dc');
      const btnAC = amRow.querySelector('.btn-insp-ammeter-mode-ac');
      const btnRep = amRow.querySelector('.btn-insp-ammeter-fuse-replace');

      const applyMode = (newMode) => {
        comp.state.mode = newMode;
        this.pushHistory();
        if (window.sounds && window.sounds.playSwitch) window.sounds.playSwitch(newMode === 'ac');
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };

      if (btnDC) btnDC.addEventListener('click', () => applyMode('dc'));
      if (btnAC) btnAC.addEventListener('click', () => applyMode('ac'));
      if (btnRep) {
        btnRep.addEventListener('click', () => {
          this.pushHistory();
          comp.state.fuseBlown = false;
          comp.state.blown = false;
          comp.state.burnt = false;
          comp.state.burning = false;
          comp.state.burnReason = '';
          comp.state.reading = comp.state.mode === 'ac' ? '~ 0.000 A' : '0.000 A';
          if (window.sounds && window.sounds.playSwitch) window.sounds.playSwitch(true);
          this.updateComponentVisual(comp);
          this.evaluateCircuit();
          this.showInspector(comp);
          if (typeof this.showToast === 'function') {
            this.showToast('Installed fresh 10A ceramic protection fuse in Ammeter.', 'success');
          }
        });
      }
    } else if (comp.type === 'voltmeter') {
      const vmRow = document.createElement('div');
      vmRow.className = 'control-row';
      const v = Math.abs(comp.state.measuredVoltage !== undefined ? comp.state.measuredVoltage : (comp.state.voltageDrop || 0));
      vmRow.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: #94a3b8; font-size: 0.75rem;">LIVE VOLTAGE POTENTIAL:</span>
              <span style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 900; color: #fbbf24;">${v.toFixed(2)} V</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #cbd5e1;">
              <span>Input Impedance:</span>
              <span style="font-family: var(--font-mono); color: #f8fafc;">10 MΩ (Ultra-High)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #cbd5e1;">
              <span>Full Scale Range:</span>
              <span style="font-family: var(--font-mono); color: #f8fafc;">0 to 50 V DC</span>
            </div>
            <div style="border-top: 1px dashed rgba(52, 211, 153, 0.25); padding-top: 5px; font-size: 0.67rem; color: #94a3b8;">
              💡 Potential Meter: Connect in <strong>PARALLEL</strong> across any two points to sense voltage difference.
            </div>
          </div>
        </div>
      `;
      controls.appendChild(vmRow);
    } else if (comp.type === 'wattmeter') {
      const wmRow = document.createElement('div');
      wmRow.className = 'control-row';
      const w = Math.abs(comp.state.power || 0);
      const v = Math.abs(comp.state.voltage || 0);
      const i = Math.abs(comp.state.current || 0);
      const wStr = w >= 1 ? w.toFixed(2) + ' W' : (w * 1000).toFixed(1) + ' mW';
      wmRow.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; color: #94a3b8; font-size: 0.75rem;">ACTIVE ELECTRICAL POWER:</span>
              <span style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 900; color: #fbbf24;">${wStr}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #cbd5e1;">
              <span>Sensed Line Potential:</span>
              <span style="font-family: var(--font-mono); color: #38bdf8;">${v.toFixed(1)} V</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #cbd5e1;">
              <span>Through Shunt Current:</span>
              <span style="font-family: var(--font-mono); color: #fbbf24;">${i >= 1 ? i.toFixed(2) + ' A' : (i * 1000).toFixed(0) + ' mA'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: #cbd5e1;">
              <span>Physics Formula:</span>
              <span style="font-family: var(--font-mono); color: #f8fafc;">P = V × I (Joule Heating)</span>
            </div>
            <div style="border-top: 1px dashed rgba(251, 191, 36, 0.25); padding-top: 5px; font-size: 0.67rem; color: #94a3b8;">
              ⚡ 4-Terminal Wattmeter: IN (+/−) connects to power source; OUT (+/−) connects to electrical load.
            </div>
          </div>
        </div>
      `;
      controls.appendChild(wmRow);
    }

    // Fuse Current Trip Rating & Thermal Protection Controls
    if (comp.type === 'fuse') {
      const isBlown = comp.state.blown || comp.state.burnt;
      const curRating = comp.state.ratingAmps !== undefined ? comp.state.ratingAmps : 2.0;
      const actI = comp.state.current || 0;
      const pct = Math.min(100, Math.round((actI / curRating) * 100));
      const presets = [0.5, 1.0, 2.0, 3.15, 5.0, 10.0];

      const fuseRow = document.createElement('div');
      fuseRow.className = 'control-row';
      fuseRow.style.flexDirection = 'column';
      fuseRow.style.alignItems = 'stretch';
      fuseRow.style.gap = '10px';
      fuseRow.style.padding = '12px';
      fuseRow.style.background = 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))';
      fuseRow.style.border = isBlown ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(56, 189, 248, 0.3)';
      fuseRow.style.borderRadius = '8px';
      fuseRow.style.boxShadow = isBlown ? '0 0 15px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.3)';

      fuseRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">${isBlown ? '💥' : '🛡️'}</span>
            <div>
              <div style="font-weight: 800; font-size: 0.85rem; color: #f8fafc; letter-spacing: 0.5px;">CARTRIDGE GLASS FUSE</div>
              <div style="font-size: 0.68rem; color: #94a3b8;">5×20mm Fast-Acting Overcurrent Protection</div>
            </div>
          </div>
          <span style="padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; font-family: var(--font-mono); background: ${isBlown ? '#7f1d1d' : '#78350f'}; color: ${isBlown ? '#fca5a5' : '#fde68a'}; border: 1px solid ${isBlown ? '#ef4444' : '#f59e0b'};">
            ${isBlown ? '💥 BLOWN' : '✓ INTACT'}
          </span>
        </div>

        <!-- Current Trip Rating Slider -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1;">Current Trip Rating (I_trip):</label>
            <span class="insp-fuse-rating-val" style="font-size: 0.85rem; font-weight: 800; font-family: var(--font-mono); color: #38bdf8;">${curRating >= 1 ? curRating.toFixed(1) : curRating.toFixed(2)} A</span>
          </div>
          <input type="range" class="insp-fuse-rating-slider" min="0.1" max="10.0" step="0.1" value="${curRating}" style="width: 100%; accent-color: #38bdf8; cursor: pointer;">
          
          <!-- Standard Preset Buttons -->
          <div style="display: flex; gap: 4px; margin-top: 6px;">
            ${presets.map(p => `
              <button type="button" class="btn-fuse-preset" data-rating="${p}" style="flex: 1; padding: 4px 2px; font-size: 0.68rem; font-family: var(--font-mono); font-weight: 800; background: ${Math.abs(p - curRating) < 0.05 ? '#0284c7' : '#0f172a'}; color: #ffffff; border: 1px solid ${Math.abs(p - curRating) < 0.05 ? '#38bdf8' : '#334155'}; border-radius: 4px; cursor: pointer; transition: all 0.15s ease;">
                ${p}A
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Real-Time Load Meter -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 4px;">
            <span style="color: #94a3b8;">Through Current Load:</span>
            <span style="font-family: var(--font-mono); font-weight: 800; color: ${isBlown ? '#ef4444' : (pct >= 85 ? '#f59e0b' : '#fbbf24')};">
              ${isBlown ? '0.00 A (Circuit Open)' : `${actI >= 1 ? actI.toFixed(2) + ' A' : (actI * 1000).toFixed(0) + ' mA'} (${pct}%)`}
            </span>
          </div>
          <div style="width: 100%; height: 8px; background: rgba(0, 0, 0, 0.4); border-radius: 4px; overflow: hidden; position: relative;">
            <div style="width: ${isBlown ? 0 : pct}%; height: 100%; background: ${pct >= 100 ? '#ef4444' : (pct >= 75 ? '#f59e0b' : '#38bdf8')}; transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Replace / Reset Button -->
        <button type="button" class="btn-insp-fuse-replace" style="width: 100%; padding: 8px; font-size: 0.78rem; font-weight: 800; font-family: var(--font-main); letter-spacing: 0.5px; background: ${isBlown ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #0284c7, #0369a1)'}; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3); transition: transform 0.1s ease;">
          <span>🔄</span>
          <span>${isBlown ? 'REPLACE BLOWN FUSE ELEMENT' : 'INSTALL FRESH FUSE ELEMENT'}</span>
        </button>

        <!-- Specifications & Physics Info Card -->
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 8px; font-size: 0.7rem; display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>Internal Resistance (Cold):</span>
            <span style="font-family: var(--font-mono); color: #fbbf24;">0.02 Ω</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>Rated Interrupting Voltage:</span>
            <span style="font-family: var(--font-mono); color: #fbbf24;">250V AC / DC</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
            <span>Thermal Melting Formula:</span>
            <span style="font-family: var(--font-mono); color: #f8fafc;">I²t &gt; Threshold (Joule Heat)</span>
          </div>
          <div style="border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 4px; font-size: 0.65rem; color: #94a3b8;">
            🛡️ When branch current exceeds ${curRating}A, the internal wire element instantaneously melts, safely isolating the branch.
          </div>
        </div>
      `;

      controls.appendChild(fuseRow);

      const rSlider = fuseRow.querySelector('.insp-fuse-rating-slider');
      const rVal = fuseRow.querySelector('.insp-fuse-rating-val');
      const replaceBtn = fuseRow.querySelector('.btn-insp-fuse-replace');

      const applyFuseRating = (val) => {
        const rounded = Math.round(val * 100) / 100;
        comp.state.ratingAmps = rounded;
        comp.state.rating = rounded;
        this.pushHistory();
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };

      rSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        rVal.textContent = `${val >= 1 ? val.toFixed(1) : val.toFixed(2)} A`;
      });

      rSlider.addEventListener('change', (e) => {
        applyFuseRating(parseFloat(e.target.value));
      });

      fuseRow.querySelectorAll('.btn-fuse-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const rating = parseFloat(btn.dataset.rating);
          applyFuseRating(rating);
        });
      });

      replaceBtn.addEventListener('click', () => {
        comp.state.blown = false;
        comp.state.burnt = false;
        comp.state.burning = false;
        comp.state.burnReason = '';
        if (this.soundManager) this.soundManager.play('click');
        this.pushHistory();
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      });
    }

    // Function Generator Laboratory Signal Source Controls
    if (comp.type === 'function_generator') {
      const fgRow = document.createElement('div');
      fgRow.className = 'control-row fg-inspector-card';
      fgRow.style.flexDirection = 'column';
      fgRow.style.alignItems = 'stretch';
      fgRow.style.gap = '10px';
      fgRow.style.padding = '12px';
      fgRow.style.background = 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))';
      fgRow.style.border = '1px solid rgba(56, 189, 248, 0.35)';
      fgRow.style.borderRadius = '8px';
      fgRow.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';

      const curWave = comp.state.waveform || 'sine';
      const curFreq = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
      const curAmp = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 5.0;
      const curOffset = comp.state.offsetVoltage !== undefined ? comp.state.offsetVoltage : 0.0;
      const curDuty = comp.state.dutyCycle !== undefined ? comp.state.dutyCycle : 50;
      const curMod = comp.state.modulation || 'none';
      const curAmDepth = comp.state.amDepth !== undefined ? Math.round(comp.state.amDepth * 100) : 50;
      const curAmFreq = comp.state.amFreq !== undefined ? comp.state.amFreq : 100;
      const curFmDev = comp.state.fmDev !== undefined ? comp.state.fmDev : 500;
      const curFmFreq = comp.state.fmFreq !== undefined ? comp.state.fmFreq : 50;
      const curSweepTime = comp.state.sweepTime !== undefined ? comp.state.sweepTime : 1.0;
      const curBurstCycles = comp.state.burstCycles !== undefined ? comp.state.burstCycles : 5;
      const curInvert = !!comp.state.invert;
      const curPhase = comp.state.phaseDeg || 0;
      const outZ = comp.state.outputImpedance || '50ohm';
      const outOn = comp.state.outputEnabled !== false;
      const audioOn = !!comp.state.audioEnabled;

      const actV = comp.state.actualVoltage !== undefined ? comp.state.actualVoltage : (curAmp / (2 * Math.SQRT2));
      const actI = comp.state.actualCurrent || 0;
      const actP = comp.state.power || (actV * actI);

      // Period calculation
      const periodSec = curFreq > 0 ? (1 / curFreq) : 0;
      let periodStr = '';
      if (periodSec >= 1) periodStr = `${periodSec.toFixed(2)} s`;
      else if (periodSec >= 0.001) periodStr = `${(periodSec * 1000).toFixed(2)} ms`;
      else periodStr = `${(periodSec * 1000000).toFixed(1)} µs`;

      const waveforms = [
        { id: 'sine', icon: '∿', name: 'Sine' },
        { id: 'square', icon: '⊓', name: 'Square' },
        { id: 'pulse', icon: '∏', name: 'Pulse' },
        { id: 'triangle', icon: '⋀', name: 'Triangle' },
        { id: 'ramp', icon: '⊿', name: 'Ramp Up' },
        { id: 'sawtooth', icon: '⧩', name: 'Saw Down' },
        { id: 'noise', icon: '〰', name: 'Noise' },
        { id: 'cardiac', icon: '🫀', name: 'ECG' },
        { id: 'dc', icon: '⎓', name: 'DC Bias' }
      ];

      const modModes = [
        { id: 'none', label: 'OFF' },
        { id: 'am', label: 'AM' },
        { id: 'fm', label: 'FM' },
        { id: 'sweep', label: 'SWEEP' },
        { id: 'burst', label: 'BURST' }
      ];

      const freqPresets = [
        { label: '1 Hz', val: 1 },
        { label: '10 Hz', val: 10 },
        { label: '50 Hz', val: 50 },
        { label: '100 Hz', val: 100 },
        { label: '440 Hz', val: 440 },
        { label: '1 kHz', val: 1000 },
        { label: '10 kHz', val: 10000 },
        { label: '50 kHz', val: 50000 },
        { label: '100 kHz', val: 100000 }
      ];

      const ampPresets = [0.5, 1.0, 2.0, 3.3, 5.0, 10.0, 12.0, 15.0, 20.0];

      fgRow.innerHTML = `
        <!-- Header & Main Output Toggle -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 8px 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.3rem;">〰️</span>
            <div>
              <div style="font-weight: 800; font-size: 0.85rem; color: #f8fafc; letter-spacing: 0.5px;">ARBITRARY FUNCTION GENERATOR</div>
              <div style="font-size: 0.68rem; color: #94a3b8;">Precision Laboratory Signal Synthesizer (9 Waves • 4 Modulations)</div>
            </div>
          </div>
          <button type="button" class="btn-insp-fg-toggle" style="background: ${outOn ? '#78350f' : '#450a0a'}; border: 1.5px solid ${outOn ? '#f59e0b' : '#ef4444'}; color: #ffffff; font-family: var(--font-mono); font-size: 0.78rem; font-weight: 900; padding: 5px 12px; border-radius: 5px; cursor: pointer; transition: all 0.15s ease;">
            ${outOn ? '⚡ OUTPUT ON' : '⭕ OUTPUT OFF'}
          </button>
        </div>

        <!-- Waveform Selection Buttons (All 9 Standard & Arbitrary Waveforms) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1;">Synthesized Waveform:</label>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; width: 100%;">
            ${waveforms.map(w => `
              <button type="button" class="btn-fg-wave-sel" data-wave="${w.id}" style="padding: 5px 2px; font-size: 0.65rem; font-family: var(--font-mono); font-weight: 800; background: ${curWave === w.id ? '#0284c7' : '#0f172a'}; color: ${curWave === w.id ? '#ffffff' : '#94a3b8'}; border: 1px solid ${curWave === w.id ? '#38bdf8' : '#334155'}; border-radius: 4px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 1px;">
                <span style="font-size: 0.95rem; line-height: 1;">${w.icon}</span>
                <span>${w.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Frequency Adjustment & Decade Presets -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 5px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1;">Signal Frequency (f):</label>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.68rem; color: #94a3b8;">T = ${periodStr}</span>
              <span class="insp-fg-f-display" style="font-size: 0.88rem; font-weight: 900; font-family: var(--font-mono); color: #38bdf8; background: #082f49; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 8px;">
                ${curFreq >= 1000 ? (curFreq / 1000).toFixed(curFreq % 1000 === 0 ? 0 : 2) + ' kHz' : curFreq + ' Hz'}
              </span>
            </div>
          </div>
          <!-- Logarithmic Slider from 0.1 Hz to 100,000 Hz -->
          <input type="range" class="insp-fg-f-slider" min="0" max="5" step="0.01" value="${Math.log10(Math.max(1, curFreq))}" style="width: 100%; accent-color: #38bdf8; cursor: pointer;">
          
          <!-- Decade Quick Presets -->
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px;">
            ${freqPresets.map(fp => `
              <button type="button" class="btn-fg-f-preset" data-freq="${fp.val}" style="flex: 1 1 18%; padding: 3px 2px; font-size: 0.65rem; font-family: var(--font-mono); font-weight: 800; background: ${Math.abs(fp.val - curFreq) < 0.1 ? '#0284c7' : '#0f172a'}; color: ${Math.abs(fp.val - curFreq) < 0.1 ? '#ffffff' : '#cbd5e1'}; border: 1px solid ${Math.abs(fp.val - curFreq) < 0.1 ? '#38bdf8' : '#334155'}; border-radius: 4px; cursor: pointer;">
                ${fp.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Amplitude (Vpp) Adjustment & Presets -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 5px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1;">Amplitude (V_pp & V_rms):</label>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.68rem; color: #67e8f9; font-weight: 700;">RMS: ${actV.toFixed(2)}V</span>
              <span class="insp-fg-amp-display" style="font-size: 0.88rem; font-weight: 900; font-family: var(--font-mono); color: #fbbf24; background: #78350f; border: 1px solid #f59e0b; border-radius: 4px; padding: 2px 8px;">
                ${curAmp.toFixed(1)} Vpp
              </span>
            </div>
          </div>
          <input type="range" class="insp-fg-amp-slider" min="0.1" max="20.0" step="0.1" value="${curAmp}" style="width: 100%; accent-color: #fbbf24; cursor: pointer;">
          
          <div style="display: flex; gap: 4px;">
            ${ampPresets.map(ap => `
              <button type="button" class="btn-fg-amp-preset" data-amp="${ap}" style="flex: 1; padding: 3px 1px; font-size: 0.64rem; font-family: var(--font-mono); font-weight: 800; background: ${Math.abs(ap - curAmp) < 0.05 ? '#b45309' : '#0f172a'}; color: ${Math.abs(ap - curAmp) < 0.05 ? '#ffffff' : '#cbd5e1'}; border: 1px solid ${Math.abs(ap - curAmp) < 0.05 ? '#fbbf24' : '#334155'}; border-radius: 4px; cursor: pointer;">
                ${ap}V
              </button>
            `).join('')}
          </div>
        </div>

        <!-- DC Offset & Pulse/Square Duty Cycle -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <!-- DC Offset -->
          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
              <span style="color: #cbd5e1; font-weight: 700;">DC Offset:</span>
              <span class="insp-fg-offset-display" style="font-family: var(--font-mono); font-weight: 800; color: #fbbf24;">${curOffset >= 0 ? '+' : ''}${curOffset.toFixed(1)}V</span>
            </div>
            <input type="range" class="insp-fg-offset-slider" min="-5.0" max="5.0" step="0.1" value="${curOffset}" style="width: 100%; accent-color: #fbbf24; cursor: pointer;">
          </div>

          <!-- Duty Cycle / Pulse Width -->
          <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
              <span style="color: #cbd5e1; font-weight: 700;">Duty Cycle:</span>
              <span class="insp-fg-duty-display" style="font-family: var(--font-mono); font-weight: 800; color: #a78bfa;">${curDuty}%</span>
            </div>
            <input type="range" class="insp-fg-duty-slider" min="5" max="95" step="1" value="${curDuty}" ${curWave === 'square' || curWave === 'pulse' ? '' : 'disabled style="opacity: 0.4;"'} style="width: 100%; accent-color: #a78bfa; cursor: pointer;">
          </div>
        </div>

        <!-- Lab Modulation Deck (AM, FM, SWEEP, BURST) -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(232, 121, 249, 0.2); display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.74rem; font-weight: 800; color: #e879f9;">🎛️ RF / Lab Modulation:</span>
            <span style="font-size: 0.7rem; font-family: var(--font-mono); font-weight: 800; color: #f5d0fe;">${curMod.toUpperCase()}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            ${modModes.map(m => `
              <button type="button" class="btn-fg-mod-sel" data-mod="${m.id}" style="flex: 1; padding: 4px 2px; font-size: 0.65rem; font-family: var(--font-mono); font-weight: 800; border-radius: 4px; cursor: pointer; border: 1px solid ${curMod === m.id ? '#e879f9' : '#334155'}; background: ${curMod === m.id ? '#701a75' : '#0f172a'}; color: ${curMod === m.id ? '#fff' : '#94a3b8'};">
                ${m.label}
              </button>
            `).join('')}
          </div>

          ${curMod === 'am' ? `
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
              <span style="font-size: 0.68rem; color: #cbd5e1; min-width: 70px;">Depth (${curAmDepth}%):</span>
              <input type="range" class="insp-fg-am-depth" min="10" max="100" step="5" value="${curAmDepth}" style="flex: 1; accent-color: #e879f9; cursor: pointer;">
            </div>
          ` : ''}

          ${curMod === 'fm' ? `
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
              <span style="font-size: 0.68rem; color: #cbd5e1; min-width: 70px;">Dev (${curFmDev}Hz):</span>
              <input type="range" class="insp-fg-fm-dev" min="50" max="2000" step="50" value="${curFmDev}" style="flex: 1; accent-color: #e879f9; cursor: pointer;">
            </div>
          ` : ''}

          ${curMod === 'sweep' ? `
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
              <span style="font-size: 0.68rem; color: #cbd5e1; min-width: 70px;">Time (${curSweepTime.toFixed(1)}s):</span>
              <input type="range" class="insp-fg-sweep-time" min="0.1" max="5.0" step="0.1" value="${curSweepTime}" style="flex: 1; accent-color: #e879f9; cursor: pointer;">
            </div>
          ` : ''}

          ${curMod === 'burst' ? `
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
              <span style="font-size: 0.68rem; color: #cbd5e1; min-width: 70px;">Cycles (${curBurstCycles}):</span>
              <input type="range" class="insp-fg-burst-cyc" min="1" max="20" step="1" value="${curBurstCycles}" style="flex: 1; accent-color: #e879f9; cursor: pointer;">
            </div>
          ` : ''}
        </div>

        <!-- Output Conditioning (Invert Polarity & Phase Offset) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <!-- Invert Polarity Toggle -->
          <button type="button" class="btn-fg-invert-toggle" style="padding: 7px; font-size: 0.72rem; font-family: var(--font-mono); font-weight: 800; background: ${curInvert ? '#831843' : '#0f172a'}; color: ${curInvert ? '#f472b6' : '#94a3b8'}; border: 1px solid ${curInvert ? '#ec4899' : '#334155'}; border-radius: 5px; cursor: pointer;">
            ${curInvert ? '± INVERTED (180°)' : '± NORMAL POLARITY'}
          </button>
          <!-- Phase Offset Slider -->
          <div style="background: rgba(15, 23, 42, 0.6); padding: 4px 8px; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #cbd5e1;">
              <span>Phase:</span>
              <span class="insp-fg-phase-display" style="font-family: var(--font-mono); color: #38bdf8;">${curPhase}°</span>
            </div>
            <input type="range" class="insp-fg-phase-slider" min="0" max="360" step="15" value="${curPhase}" style="width: 100%; accent-color: #38bdf8; cursor: pointer;">
          </div>
        </div>

        <!-- Output Impedance & Audio Monitor Row -->
        <div style="display: flex; gap: 8px; align-items: center;">
          <!-- Impedance Toggle -->
          <button type="button" class="btn-fg-z-toggle" style="flex: 1; padding: 7px; font-size: 0.72rem; font-family: var(--font-mono); font-weight: 800; background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 5px; cursor: pointer;">
            Output Z: ${outZ === '50ohm' ? '50 Ω (Matched)' : 'High-Z (Open)'}
          </button>
          <!-- Audio Tone Monitor Toggle -->
          <button type="button" class="btn-fg-audio-toggle" style="flex: 1; padding: 7px; font-size: 0.72rem; font-family: var(--font-mono); font-weight: 800; background: ${audioOn ? '#78350f' : '#0f172a'}; color: ${audioOn ? '#fbbf24' : '#94a3b8'}; border: 1px solid ${audioOn ? '#f59e0b' : '#334155'}; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>${audioOn ? '🔊 Tone Playing' : '🔈 Audio Muted'}</span>
          </button>
        </div>

        <!-- Telemetry & Physics Info Card -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 8px 10px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-weight: 700;">
            <span style="color: #94a3b8;">Delivered RMS Voltage:</span>
            <span style="color: #38bdf8; font-family: var(--font-mono);">${outOn ? actV.toFixed(2) + ' V_rms' : '0.00 V (Off)'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 700;">
            <span style="color: #94a3b8;">Supplied Circuit Current:</span>
            <span style="color: #fbbf24; font-family: var(--font-mono);">${outOn ? (actI >= 1 ? actI.toFixed(2) + ' A' : (actI * 1000).toFixed(1) + ' mA') : '0.00 mA'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 700;">
            <span style="color: #94a3b8;">Apparent Power (S):</span>
            <span style="color: #fbbf24; font-family: var(--font-mono);">${outOn ? (actP >= 1 ? actP.toFixed(2) + ' W' : (actP * 1000).toFixed(1) + ' mW') : '0.00 mW'}</span>
          </div>
          <div style="border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 4px; font-size: 0.65rem; color: #94a3b8;">
            💡 <strong>Frequency vs Reactance:</strong> Changing frequency <em>f</em> directly alters capacitor reactance X_C = 1 / (2π f C) and inductor reactance X_L = 2π f L across connected branches!
          </div>
        </div>
      `;

      controls.appendChild(fgRow);

      const applyFG = () => {
        this.pushHistory();
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };

      const btnToggle = fgRow.querySelector('.btn-insp-fg-toggle');
      btnToggle.addEventListener('click', () => {
        comp.state.outputEnabled = comp.state.outputEnabled === false ? true : false;
        applyFG();
      });

      fgRow.querySelectorAll('.btn-fg-wave-sel').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.waveform = btn.dataset.wave;
          applyFG();
        });
      });

      fgRow.querySelectorAll('.btn-fg-mod-sel').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.modulation = btn.dataset.mod;
          applyFG();
        });
      });

      const amDepthSlider = fgRow.querySelector('.insp-fg-am-depth');
      if (amDepthSlider) {
        amDepthSlider.addEventListener('change', (e) => {
          comp.state.amDepth = parseInt(e.target.value, 10) / 100;
          applyFG();
        });
      }

      const fmDevSlider = fgRow.querySelector('.insp-fg-fm-dev');
      if (fmDevSlider) {
        fmDevSlider.addEventListener('change', (e) => {
          comp.state.fmDev = parseInt(e.target.value, 10);
          applyFG();
        });
      }

      const sweepTimeSlider = fgRow.querySelector('.insp-fg-sweep-time');
      if (sweepTimeSlider) {
        sweepTimeSlider.addEventListener('change', (e) => {
          comp.state.sweepTime = parseFloat(e.target.value);
          applyFG();
        });
      }

      const burstCycSlider = fgRow.querySelector('.insp-fg-burst-cyc');
      if (burstCycSlider) {
        burstCycSlider.addEventListener('change', (e) => {
          comp.state.burstCycles = parseInt(e.target.value, 10);
          applyFG();
        });
      }

      const btnInvert = fgRow.querySelector('.btn-fg-invert-toggle');
      if (btnInvert) {
        btnInvert.addEventListener('click', () => {
          comp.state.invert = !comp.state.invert;
          applyFG();
        });
      }

      const phaseSlider = fgRow.querySelector('.insp-fg-phase-slider');
      const phaseDisplay = fgRow.querySelector('.insp-fg-phase-display');
      if (phaseSlider) {
        phaseSlider.addEventListener('input', (e) => {
          phaseDisplay.textContent = `${e.target.value}°`;
        });
        phaseSlider.addEventListener('change', (e) => {
          comp.state.phaseDeg = parseInt(e.target.value, 10);
          applyFG();
        });
      }

      const fSlider = fgRow.querySelector('.insp-fg-f-slider');
      const fDisplay = fgRow.querySelector('.insp-fg-f-display');
      fSlider.addEventListener('input', (e) => {
        const exp = parseFloat(e.target.value);
        const freq = Math.round(Math.pow(10, exp) * 10) / 10;
        fDisplay.textContent = freq >= 1000 ? (freq / 1000).toFixed(freq % 1000 === 0 ? 0 : 2) + ' kHz' : freq + ' Hz';
      });
      fSlider.addEventListener('change', (e) => {
        const exp = parseFloat(e.target.value);
        comp.state.frequency = Math.round(Math.pow(10, exp) * 10) / 10;
        applyFG();
      });

      fgRow.querySelectorAll('.btn-fg-f-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.frequency = parseFloat(btn.dataset.freq);
          applyFG();
        });
      });

      const ampSlider = fgRow.querySelector('.insp-fg-amp-slider');
      const ampDisplay = fgRow.querySelector('.insp-fg-amp-display');
      ampSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        ampDisplay.textContent = `${val.toFixed(1)} Vpp`;
      });
      ampSlider.addEventListener('change', (e) => {
        comp.state.amplitudeVpp = parseFloat(e.target.value);
        applyFG();
      });

      fgRow.querySelectorAll('.btn-fg-amp-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.amplitudeVpp = parseFloat(btn.dataset.amp);
          applyFG();
        });
      });

      const offsetSlider = fgRow.querySelector('.insp-fg-offset-slider');
      const offsetDisplay = fgRow.querySelector('.insp-fg-offset-display');
      offsetSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        offsetDisplay.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(1)}V`;
      });
      offsetSlider.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        comp.state.offsetVoltage = val;
        comp.state.dcOffset = val;
        applyFG();
      });

      const dutySlider = fgRow.querySelector('.insp-fg-duty-slider');
      const dutyDisplay = fgRow.querySelector('.insp-fg-duty-display');
      if (dutySlider) {
        dutySlider.addEventListener('input', (e) => {
          dutyDisplay.textContent = `${e.target.value}%`;
        });
        dutySlider.addEventListener('change', (e) => {
          comp.state.dutyCycle = parseInt(e.target.value, 10);
          applyFG();
        });
      }

      const zToggle = fgRow.querySelector('.btn-fg-z-toggle');
      zToggle.addEventListener('click', () => {
        comp.state.outputImpedance = (comp.state.outputImpedance === 'highz') ? '50ohm' : 'highz';
        applyFG();
      });

      const audioToggle = fgRow.querySelector('.btn-fg-audio-toggle');
      audioToggle.addEventListener('click', () => {
        comp.state.audioEnabled = !comp.state.audioEnabled;
        applyFG();
      });
    }

    // Oscilloscope Interactive DSO Benchtop Inspector Panel
    if (comp.type === 'oscilloscope') {
      const dsoRow = document.createElement('div');
      dsoRow.className = 'dso-inspector-card';
      dsoRow.style.display = 'flex';
      dsoRow.style.flexDirection = 'column';
      dsoRow.style.gap = '12px';
      dsoRow.style.marginTop = '10px';
      dsoRow.style.padding = '12px';
      dsoRow.style.background = 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)';
      dsoRow.style.border = '1px solid #0284c7';
      dsoRow.style.borderRadius = '8px';
      dsoRow.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)';

      const isStopped = comp.state.runStop === 'stop';
      const isSingle = comp.state.runStop === 'single';
      const isRunning = comp.state.runStop === 'run';
      const timebase = comp.state.timebaseSec || comp.state.timeDiv || 0.001;
      const fmtTb = (tb) => tb >= 1 ? `${tb.toFixed(1)} s/div` : (tb >= 0.001 ? `${(tb * 1000).toFixed(tb >= 0.01 ? 0 : 1)} ms/div` : `${(tb * 1e6).toFixed(0)} µs/div`);

      const ch1On = comp.state.ch1Enabled !== false;
      const ch1Vdiv = comp.state.ch1Scale || comp.state.ch1VoltsDiv || 2.0;
      const ch1Cpl = comp.state.ch1Coupling || 'dc';
      const ch1Data = comp.state.ch1 || comp.state.ch1Signal || {};

      const ch2On = comp.state.ch2Enabled !== false;
      const ch2Vdiv = comp.state.ch2Scale || comp.state.ch2VoltsDiv || 2.0;
      const ch2Cpl = comp.state.ch2Coupling || 'dc';
      const ch2Data = comp.state.ch2 || comp.state.ch2Signal || {};

      const trigSrc = comp.state.triggerSource || 'ch1';
      const trigSlope = comp.state.triggerSlope || comp.state.triggerEdge || 'rising';
      const trigLvl = comp.state.triggerLevel !== undefined ? comp.state.triggerLevel : 0.0;
      const mathMode = comp.state.mathMode || 'off';
      const decodeMode = (comp.state.decodeMode || 'off').toLowerCase();

      const fmtVdiv = (v) => v >= 1 ? `${v.toFixed(v % 1 === 0 ? 0 : 1)} V/div` : `${(v * 1000).toFixed(0)} mV/div`;
      const fmtFreq = (f) => f ? (f >= 1000 ? `${(f / 1000).toFixed(f % 1000 === 0 ? 0 : 2)} kHz` : `${f.toFixed(1)} Hz`) : '0.0 Hz';
      const fmtPeriod = (f) => {
        if (!f || f <= 0) return '---';
        const t = 1 / f;
        return t >= 1 ? `${t.toFixed(2)} s` : (t >= 0.001 ? `${(t * 1000).toFixed(2)} ms` : `${(t * 1e6).toFixed(1)} µs`);
      };
      const fmtTimeSec = (sec) => {
        if (!sec || sec <= 0) return '---';
        if (sec >= 1.0) return `${sec.toFixed(2)} s`;
        if (sec >= 0.001) return `${(sec * 1000).toFixed(2)} ms`;
        if (sec >= 1e-6) return `${(sec * 1e6).toFixed(2)} µs`;
        return `${(sec * 1e9).toFixed(1)} ns`;
      };

      const tbPresets = [
        { label: '10µs', val: 0.00001 },
        { label: '50µs', val: 0.00005 },
        { label: '100µs', val: 0.0001 },
        { label: '500µs', val: 0.0005 },
        { label: '1ms', val: 0.001 },
        { label: '5ms', val: 0.005 },
        { label: '10ms', val: 0.01 },
        { label: '50ms', val: 0.05 },
        { label: '100ms', val: 0.1 },
        { label: '500ms', val: 0.5 }
      ];

      const vdivPresets = [0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];

      dsoRow.innerHTML = `
        <!-- DSO Master Bar -->
        <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="btn-dso-run" style="padding: 6px 10px; font-size: 0.74rem; font-weight: 800; font-family: var(--font-mono); border-radius: 5px; cursor: pointer; border: 1px solid ${isRunning ? '#f59e0b' : '#334155'}; background: ${isRunning ? '#78350f' : '#0f172a'}; color: ${isRunning ? '#fbbf24' : '#94a3b8'};">
              ▶ RUN
            </button>
            <button type="button" class="btn-dso-stop" style="padding: 6px 10px; font-size: 0.74rem; font-weight: 800; font-family: var(--font-mono); border-radius: 5px; cursor: pointer; border: 1px solid ${isStopped ? '#ef4444' : '#334155'}; background: ${isStopped ? '#450a0a' : '#0f172a'}; color: ${isStopped ? '#fca5a5' : '#94a3b8'};">
              ⏸ STOP
            </button>
            <button type="button" class="btn-dso-single" style="padding: 6px 10px; font-size: 0.74rem; font-weight: 800; font-family: var(--font-mono); border-radius: 5px; cursor: pointer; border: 1px solid ${isSingle ? '#f59e0b' : '#334155'}; background: ${isSingle ? '#78350f' : '#0f172a'}; color: ${isSingle ? '#fde047' : '#94a3b8'};">
              ⚡ SINGLE
            </button>
            <button type="button" class="btn-dso-autoset" style="padding: 6px 10px; font-size: 0.74rem; font-weight: 800; font-family: var(--font-mono); border-radius: 5px; cursor: pointer; border: 1px solid #38bdf8; background: #0369a1; color: #fff; box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);">
              ⚡ AUTOSET
            </button>
          </div>
          <span style="font-size: 0.68rem; font-family: var(--font-mono); color: #94a3b8; text-transform: uppercase;">100MSa/s · Ultra-Phosphor</span>
        </div>

        <!-- Horizontal Timebase Section -->
        <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #38bdf8;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #e2e8f0; display: flex; align-items: center; gap: 6px;">
              <span>↔</span> Horizontal Timebase (Sec/Div)
            </span>
            <span class="dso-tb-display" style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700; color: #38bdf8;">
              ${fmtTb(timebase)}
            </span>
          </div>
          <input type="range" class="insp-dso-tb-slider" min="-5" max="-0.301" step="0.05" value="${Math.log10(timebase)}" style="width: 100%; accent-color: #38bdf8; cursor: pointer;">
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${tbPresets.map(p => `
              <button type="button" class="btn-dso-tb-preset" data-val="${p.val}" style="padding: 2px 6px; font-size: 0.65rem; font-family: var(--font-mono); border-radius: 3px; cursor: pointer; border: 1px solid ${Math.abs(timebase - p.val) < 0.000005 ? '#38bdf8' : '#334155'}; background: ${Math.abs(timebase - p.val) < 0.000005 ? '#0284c7' : '#0f172a'}; color: ${Math.abs(timebase - p.val) < 0.000005 ? '#fff' : '#94a3b8'};">
                ${p.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Vertical Channels Grid (CH1 & CH2) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <!-- Channel 1 Card (Yellow) -->
          <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #facc15;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #facc15;">CH1 (Yellow)</span>
              <button type="button" class="btn-dso-ch1-toggle" style="padding: 2px 6px; font-size: 0.65rem; font-weight: 700; border-radius: 3px; cursor: pointer; border: 1px solid #facc15; background: ${ch1On ? '#713f12' : '#1e293b'}; color: ${ch1On ? '#fef08a' : '#64748b'};">
                ${ch1On ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
              <span style="color: #94a3b8;">Scale:</span>
              <span class="dso-ch1-scale-display" style="font-family: var(--font-mono); font-weight: 700; color: #fef08a;">${fmtVdiv(ch1Vdiv)}</span>
            </div>
            <div style="display: flex; gap: 3px; flex-wrap: wrap;">
              ${vdivPresets.map(v => `
                <button type="button" class="btn-dso-ch1-vdiv" data-val="${v}" style="flex: 1 1 20%; padding: 2px 2px; font-size: 0.6rem; font-family: var(--font-mono); border-radius: 3px; cursor: pointer; border: 1px solid ${Math.abs(ch1Vdiv - v) < 0.001 ? '#facc15' : '#334155'}; background: ${Math.abs(ch1Vdiv - v) < 0.001 ? '#854d0e' : '#0f172a'}; color: ${Math.abs(ch1Vdiv - v) < 0.001 ? '#fff' : '#94a3b8'};">
                  ${v >= 1 ? v + 'V' : (v * 1000) + 'm'}
                </button>
              `).join('')}
            </div>
            <!-- Coupling -->
            <div style="display: flex; gap: 3px; align-items: center; margin-top: 2px;">
              <span style="font-size: 0.62rem; color: #94a3b8; min-width: 25px;">Cpl:</span>
              ${['dc', 'ac', 'gnd'].map(cpl => `
                <button type="button" class="btn-dso-ch1-cpl" data-cpl="${cpl}" style="flex: 1; padding: 2px; font-size: 0.62rem; font-weight: 700; font-family: var(--font-mono); border-radius: 3px; cursor: pointer; border: 1px solid ${ch1Cpl === cpl ? '#facc15' : '#334155'}; background: ${ch1Cpl === cpl ? '#a16207' : '#0f172a'}; color: ${ch1Cpl === cpl ? '#fff' : '#94a3b8'}; text-transform: uppercase;">
                  ${cpl}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Channel 2 Card (Cyan) -->
          <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #06b6d4;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 800; color: #06b6d4;">CH2 (Cyan)</span>
              <button type="button" class="btn-dso-ch2-toggle" style="padding: 2px 6px; font-size: 0.65rem; font-weight: 700; border-radius: 3px; cursor: pointer; border: 1px solid #06b6d4; background: ${ch2On ? '#164e63' : '#1e293b'}; color: ${ch2On ? '#a5f3fc' : '#64748b'};">
                ${ch2On ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
              <span style="color: #94a3b8;">Scale:</span>
              <span class="dso-ch2-scale-display" style="font-family: var(--font-mono); font-weight: 700; color: #a5f3fc;">${fmtVdiv(ch2Vdiv)}</span>
            </div>
            <div style="display: flex; gap: 3px; flex-wrap: wrap;">
              ${vdivPresets.map(v => `
                <button type="button" class="btn-dso-ch2-vdiv" data-val="${v}" style="flex: 1 1 20%; padding: 2px 2px; font-size: 0.6rem; font-family: var(--font-mono); border-radius: 3px; cursor: pointer; border: 1px solid ${Math.abs(ch2Vdiv - v) < 0.001 ? '#06b6d4' : '#334155'}; background: ${Math.abs(ch2Vdiv - v) < 0.001 ? '#0891b2' : '#0f172a'}; color: ${Math.abs(ch2Vdiv - v) < 0.001 ? '#fff' : '#94a3b8'};">
                  ${v >= 1 ? v + 'V' : (v * 1000) + 'm'}
                </button>
              `).join('')}
            </div>
            <!-- Coupling -->
            <div style="display: flex; gap: 3px; align-items: center; margin-top: 2px;">
              <span style="font-size: 0.62rem; color: #94a3b8; min-width: 25px;">Cpl:</span>
              ${['dc', 'ac', 'gnd'].map(cpl => `
                <button type="button" class="btn-dso-ch2-cpl" data-cpl="${cpl}" style="flex: 1; padding: 2px; font-size: 0.62rem; font-weight: 700; font-family: var(--font-mono); border-radius: 3px; cursor: pointer; border: 1px solid ${ch2Cpl === cpl ? '#06b6d4' : '#334155'}; background: ${ch2Cpl === cpl ? '#0e7490' : '#0f172a'}; color: ${ch2Cpl === cpl ? '#fff' : '#94a3b8'}; text-transform: uppercase;">
                  ${cpl}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Trigger Controls -->
        <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px 10px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #ec4899;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.74rem; font-weight: 700; color: #f472b6;">🎯 Edge Trigger System</span>
            <span class="dso-trig-display" style="font-family: var(--font-mono); font-size: 0.72rem; color: #fbcfe8;">
              ${trigSrc.toUpperCase()} · ${trigSlope === 'rising' ? '↗ Rising' : '↘ Falling'} · ${trigLvl >= 0 ? '+' : ''}${trigLvl.toFixed(1)}V
            </span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <!-- Source -->
            <div style="display: flex; gap: 2px; flex: 1;">
              <button type="button" class="btn-dso-trig-src" data-src="ch1" style="flex: 1; padding: 3px; font-size: 0.65rem; font-family: var(--font-mono); font-weight: 700; border-radius: 3px; cursor: pointer; border: 1px solid ${trigSrc === 'ch1' ? '#facc15' : '#334155'}; background: ${trigSrc === 'ch1' ? '#854d0e' : '#0f172a'}; color: ${trigSrc === 'ch1' ? '#fff' : '#94a3b8'};">CH1</button>
              <button type="button" class="btn-dso-trig-src" data-src="ch2" style="flex: 1; padding: 3px; font-size: 0.65rem; font-family: var(--font-mono); font-weight: 700; border-radius: 3px; cursor: pointer; border: 1px solid ${trigSrc === 'ch2' ? '#06b6d4' : '#334155'}; background: ${trigSrc === 'ch2' ? '#0891b2' : '#0f172a'}; color: ${trigSrc === 'ch2' ? '#fff' : '#94a3b8'};">CH2</button>
            </div>
            <!-- Slope -->
            <div style="display: flex; gap: 2px; flex: 1;">
              <button type="button" class="btn-dso-trig-slope" data-slope="rising" style="flex: 1; padding: 3px; font-size: 0.65rem; font-family: var(--font-mono); font-weight: 700; border-radius: 3px; cursor: pointer; border: 1px solid ${trigSlope === 'rising' ? '#ec4899' : '#334155'}; background: ${trigSlope === 'rising' ? '#9d174d' : '#0f172a'}; color: ${trigSlope === 'rising' ? '#fff' : '#94a3b8'};">↗ Rise</button>
              <button type="button" class="btn-dso-trig-slope" data-slope="falling" style="flex: 1; padding: 3px; font-size: 0.65rem; font-family: var(--font-mono); font-weight: 700; border-radius: 3px; cursor: pointer; border: 1px solid ${trigSlope === 'falling' ? '#ec4899' : '#334155'}; background: ${trigSlope === 'falling' ? '#9d174d' : '#0f172a'}; color: ${trigSlope === 'falling' ? '#fff' : '#94a3b8'};">↘ Fall</button>
            </div>
            <!-- Level zero button -->
            <button type="button" class="btn-dso-trig-zero" style="padding: 3px 6px; font-size: 0.65rem; font-family: var(--font-mono); border-radius: 3px; cursor: pointer; border: 1px solid #334155; background: #0f172a; color: #94a3b8;">0V</button>
          </div>
          <!-- Level slider -->
          <input type="range" class="insp-dso-trig-slider" min="-10" max="10" step="0.2" value="${trigLvl}" style="width: 100%; accent-color: #ec4899; cursor: pointer;">
        </div>

        <!-- Math Functions & Bus Protocol Analyzer Deck -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <!-- Math Selector -->
          <div style="display: flex; flex-direction: column; gap: 5px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #c026d3;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #e879f9;">📐 MATH & FFT SPECTRUM</span>
            <div style="display: flex; gap: 3px; flex-wrap: wrap;">
              ${['off', 'add', 'sub', 'fft'].map(m => `
                <button type="button" class="btn-dso-math-mode" data-mode="${m}" style="flex: 1 1 45%; padding: 3px 2px; font-size: 0.62rem; font-family: var(--font-mono); font-weight: 800; border-radius: 3px; cursor: pointer; border: 1px solid ${mathMode === m ? '#e879f9' : '#334155'}; background: ${mathMode === m ? '#701a75' : '#0f172a'}; color: ${mathMode === m ? '#fff' : '#94a3b8'}; text-transform: uppercase;">
                  ${m === 'sub' ? 'CH1-CH2' : (m === 'add' ? 'CH1+CH2' : m)}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Bus Protocol Decode Selector -->
          <div style="display: flex; flex-direction: column; gap: 5px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #f59e0b;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #fbbf24;">📡 PROTOCOL BUS DECODER</span>
            <div style="display: flex; gap: 3px; flex-wrap: wrap;">
              ${['off', 'uart', 'i2c', 'spi'].map(p => `
                <button type="button" class="btn-dso-bus-mode" data-mode="${p}" style="flex: 1 1 45%; padding: 3px 2px; font-size: 0.62rem; font-family: var(--font-mono); font-weight: 800; border-radius: 3px; cursor: pointer; border: 1px solid ${decodeMode === p ? '#f59e0b' : '#334155'}; background: ${decodeMode === p ? '#78350f' : '#0f172a'}; color: ${decodeMode === p ? '#fff' : '#94a3b8'}; text-transform: uppercase;">
                  ${p}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- XY Mode (Lissajous) & Cursor System Controls -->
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 8px;">
          <!-- XY Mode Toggle Button -->
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #f59e0b;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #fbbf24;">🔀 XY (LISSAJOUS)</span>
            <button type="button" class="btn-dso-xy-toggle" style="padding: 6px 4px; font-size: 0.68rem; font-weight: 800; font-family: var(--font-mono); border-radius: 4px; cursor: pointer; border: 1px solid ${comp.state.xyMode ? '#f59e0b' : '#334155'}; background: ${comp.state.xyMode ? '#78350f' : '#0f172a'}; color: ${comp.state.xyMode ? '#fde68a' : '#94a3b8'};">
              ${comp.state.xyMode ? '⚡ XY ACTIVE' : '⭕ TIMEBASE (YT)'}
            </button>
          </div>

          <!-- Cursors Mode & Adjustments -->
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border-left: 3px solid #f97316;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; font-weight: 800; color: #fb923c;">📏 ON-SCREEN CURSORS</span>
              <span style="font-size: 0.68rem; font-family: var(--font-mono); color: #fed7aa;">${(comp.state.cursorMode || 'off').toUpperCase()}</span>
            </div>
            <div style="display: flex; gap: 3px;">
              ${['off', 'voltage', 'time'].map(cm => `
                <button type="button" class="btn-dso-cursor-mode" data-mode="${cm}" style="flex: 1; padding: 3px 2px; font-size: 0.62rem; font-family: var(--font-mono); font-weight: 800; border-radius: 3px; cursor: pointer; border: 1px solid ${(comp.state.cursorMode || 'off') === cm ? '#f97316' : '#334155'}; background: ${(comp.state.cursorMode || 'off') === cm ? '#7c2d12' : '#0f172a'}; color: ${(comp.state.cursorMode || 'off') === cm ? '#fff' : '#94a3b8'}; text-transform: uppercase;">
                  ${cm}
                </button>
              `).join('')}
            </div>
            ${comp.state.cursorMode === 'voltage' ? `
              <div style="display: flex; gap: 4px; align-items: center; margin-top: 2px;">
                <span style="font-size: 0.62rem; color: #38bdf8;">V1:</span>
                <input type="range" class="insp-dso-v1-slider" min="-10" max="10" step="0.2" value="${comp.state.vCursor1 !== undefined ? comp.state.vCursor1 : 2.0}" style="flex: 1; accent-color: #38bdf8; cursor: pointer;">
                <span style="font-size: 0.62rem; color: #38bdf8;">V2:</span>
                <input type="range" class="insp-dso-v2-slider" min="-10" max="10" step="0.2" value="${comp.state.vCursor2 !== undefined ? comp.state.vCursor2 : -2.0}" style="flex: 1; accent-color: #38bdf8; cursor: pointer;">
              </div>
            ` : ''}
            ${comp.state.cursorMode === 'time' ? `
              <div style="display: flex; gap: 4px; align-items: center; margin-top: 2px;">
                <span style="font-size: 0.62rem; color: #f59e0b;">T1:</span>
                <input type="range" class="insp-dso-t1-slider" min="0" max="1" step="0.02" value="${comp.state.tCursor1 !== undefined ? comp.state.tCursor1 : 0.3}" style="flex: 1; accent-color: #f59e0b; cursor: pointer;">
                <span style="font-size: 0.62rem; color: #f59e0b;">T2:</span>
                <input type="range" class="insp-dso-t2-slider" min="0" max="1" step="0.02" value="${comp.state.tCursor2 !== undefined ? comp.state.tCursor2 : 0.7}" style="flex: 1; accent-color: #f59e0b; cursor: pointer;">
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Deep Automated Waveform Measurements Table (14 Parameters) -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; padding: 8px 10px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 6px;">
          <div style="font-weight: 800; color: #38bdf8; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px;">📊 Laboratory Automated Waveform Telemetry (14 Real Parameters)</div>

          <!-- Channel 1 Row -->
          <div style="display: grid; grid-template-columns: 70px 1fr 1fr; gap: 4px; padding: 4px; background: rgba(0,0,0,0.3); border-radius: 4px; font-family: var(--font-mono); font-size: 0.68rem; align-items: center;">
            <span style="color: #fde047; font-weight: 800;">CH1 (${(ch1Data.type || 'none').toUpperCase()}):</span>
            <span style="color: #e2e8f0;">Vpp: <strong style="color: #facc15;">${(ch1Data.vpp || 0).toFixed(2)}V</strong> | Vmax: ${(ch1Data.vmax !== undefined ? ch1Data.vmax : ((ch1Data.vavg || 0) + (ch1Data.vpp || 0) / 2)).toFixed(2)}V | Vmin: ${(ch1Data.vmin !== undefined ? ch1Data.vmin : ((ch1Data.vavg || 0) - (ch1Data.vpp || 0) / 2)).toFixed(2)}V | Vrms: ${(ch1Data.vrms || 0).toFixed(2)}V</span>
            <span style="color: #e2e8f0; text-align: right;">f: <strong style="color: #fde047;">${fmtFreq(ch1Data.freq)}</strong> | T: ${fmtPeriod(ch1Data.freq)} | tr: ${fmtTimeSec(ch1Data.riseTime)}</span>
          </div>

          <!-- Channel 2 Row -->
          <div style="display: grid; grid-template-columns: 70px 1fr 1fr; gap: 4px; padding: 4px; background: rgba(0,0,0,0.3); border-radius: 4px; font-family: var(--font-mono); font-size: 0.68rem; align-items: center;">
            <span style="color: #67e8f9; font-weight: 800;">CH2 (${(ch2Data.type || 'none').toUpperCase()}):</span>
            <span style="color: #e2e8f0;">Vpp: <strong style="color: #06b6d4;">${(ch2Data.vpp || 0).toFixed(2)}V</strong> | Vmax: ${(ch2Data.vmax !== undefined ? ch2Data.vmax : ((ch2Data.vavg || 0) + (ch2Data.vpp || 0) / 2)).toFixed(2)}V | Vmin: ${(ch2Data.vmin !== undefined ? ch2Data.vmin : ((ch2Data.vavg || 0) - (ch2Data.vpp || 0) / 2)).toFixed(2)}V | Vrms: ${(ch2Data.vrms || 0).toFixed(2)}V</span>
            <span style="color: #e2e8f0; text-align: right;">f: <strong style="color: #67e8f9;">${fmtFreq(ch2Data.freq)}</strong> | tf: ${fmtTimeSec(ch1Data.fallTime || ch1Data.riseTime)} | D: ${(ch1Data.duty || 50)}%</span>
          </div>

          <!-- Dual-Channel Phase, Timing & Overshoot Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 4px; background: rgba(0,0,0,0.25); border-radius: 4px; font-family: var(--font-mono); font-size: 0.66rem;">
            <div style="color: #a78bfa;">
              <span>Dual-Ch Phase Shift (Δθ): </span>
              <strong>${(comp.state.phaseDiff || 0).toFixed(1)}°</strong> | Delay (Δt): <strong>${fmtTimeSec(comp.state.timeDelay)}</strong>
            </div>
            <div style="color: #38bdf8; text-align: right;">
              <span>Overshoot: <strong>${ch1Data.overshoot || 0}%</strong> | Rail Ripple: <strong>${((ch1Data.rippleV || ch2Data.rippleV || 0) * 1000).toFixed(1)} mVpp</strong></span>
            </div>
          </div>

          <div style="border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 4px; font-size: 0.65rem; color: #94a3b8; line-height: 1.35;">
            💡 <strong>Laboratory Probing:</strong> 1 MΩ ∥ 15 pF probes prevent loading branch nodes. Set coupling to <strong>AC</strong> to zoom into millivolt ripple; use <strong>XY</strong> mode to plot Lissajous figures; use <strong>CURSORS</strong> for manual verification.
          </div>
        </div>
      `;

      controls.appendChild(dsoRow);

      const applyDSO = () => {
        this.pushHistory();
        this.updateComponentVisual(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      };

      // Run / Stop / Single buttons
      const btnRun = dsoRow.querySelector('.btn-dso-run');
      btnRun.addEventListener('click', () => {
        comp.state.runStop = 'run';
        applyDSO();
      });

      const btnStop = dsoRow.querySelector('.btn-dso-stop');
      btnStop.addEventListener('click', () => {
        comp.state.runStop = 'stop';
        applyDSO();
      });

      const btnSingle = dsoRow.querySelector('.btn-dso-single');
      btnSingle.addEventListener('click', () => {
        comp.state.runStop = 'single';
        comp.state.singleArmed = true;
        comp.state.singleTriggered = false;
        applyDSO();
      });

      // Autoset button
      const btnAutoset = dsoRow.querySelector('.btn-dso-autoset');
      btnAutoset.addEventListener('click', () => {
        this.autosetOscilloscope(comp);
        this.evaluateCircuit();
        this.showInspector(comp);
      });

      // XY Mode Toggle button
      const btnXyToggle = dsoRow.querySelector('.btn-dso-xy-toggle');
      if (btnXyToggle) {
        btnXyToggle.addEventListener('click', () => {
          comp.state.xyMode = !comp.state.xyMode;
          applyDSO();
        });
      }

      // Cursor Mode buttons
      dsoRow.querySelectorAll('.btn-dso-cursor-mode').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.cursorMode = btn.dataset.mode;
          applyDSO();
        });
      });

      // Cursor Sliders
      const v1Slider = dsoRow.querySelector('.insp-dso-v1-slider');
      if (v1Slider) {
        v1Slider.addEventListener('change', (e) => {
          comp.state.vCursor1 = parseFloat(e.target.value);
          applyDSO();
        });
      }

      const v2Slider = dsoRow.querySelector('.insp-dso-v2-slider');
      if (v2Slider) {
        v2Slider.addEventListener('change', (e) => {
          comp.state.vCursor2 = parseFloat(e.target.value);
          applyDSO();
        });
      }

      const t1Slider = dsoRow.querySelector('.insp-dso-t1-slider');
      if (t1Slider) {
        t1Slider.addEventListener('change', (e) => {
          comp.state.tCursor1 = parseFloat(e.target.value);
          applyDSO();
        });
      }

      const t2Slider = dsoRow.querySelector('.insp-dso-t2-slider');
      if (t2Slider) {
        t2Slider.addEventListener('change', (e) => {
          comp.state.tCursor2 = parseFloat(e.target.value);
          applyDSO();
        });
      }

      // Timebase slider & presets
      const tbSlider = dsoRow.querySelector('.insp-dso-tb-slider');
      const tbDisplay = dsoRow.querySelector('.dso-tb-display');
      tbSlider.addEventListener('input', (e) => {
        const val = Math.pow(10, parseFloat(e.target.value));
        tbDisplay.textContent = fmtTb(val);
      });
      tbSlider.addEventListener('change', (e) => {
        const val = Math.pow(10, parseFloat(e.target.value));
        comp.state.timebaseSec = val;
        comp.state.timeDiv = val;
        applyDSO();
      });

      dsoRow.querySelectorAll('.btn-dso-tb-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = parseFloat(btn.dataset.val);
          comp.state.timebaseSec = val;
          comp.state.timeDiv = val;
          applyDSO();
        });
      });

      // Channel 1 controls
      const btnCh1Toggle = dsoRow.querySelector('.btn-dso-ch1-toggle');
      btnCh1Toggle.addEventListener('click', () => {
        comp.state.ch1Enabled = comp.state.ch1Enabled === false ? true : false;
        applyDSO();
      });

      dsoRow.querySelectorAll('.btn-dso-ch1-vdiv').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = parseFloat(btn.dataset.val);
          comp.state.ch1Scale = val;
          comp.state.ch1VoltsDiv = val;
          applyDSO();
        });
      });

      dsoRow.querySelectorAll('.btn-dso-ch1-cpl').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.ch1Coupling = btn.dataset.cpl;
          applyDSO();
        });
      });

      // Channel 2 controls
      const btnCh2Toggle = dsoRow.querySelector('.btn-dso-ch2-toggle');
      btnCh2Toggle.addEventListener('click', () => {
        comp.state.ch2Enabled = comp.state.ch2Enabled === false ? true : false;
        applyDSO();
      });

      dsoRow.querySelectorAll('.btn-dso-ch2-vdiv').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = parseFloat(btn.dataset.val);
          comp.state.ch2Scale = val;
          comp.state.ch2VoltsDiv = val;
          applyDSO();
        });
      });

      dsoRow.querySelectorAll('.btn-dso-ch2-cpl').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.ch2Coupling = btn.dataset.cpl;
          applyDSO();
        });
      });

      // Trigger controls
      dsoRow.querySelectorAll('.btn-dso-trig-src').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.triggerSource = btn.dataset.src;
          applyDSO();
        });
      });

      dsoRow.querySelectorAll('.btn-dso-trig-slope').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.triggerSlope = btn.dataset.slope;
          comp.state.triggerEdge = btn.dataset.slope;
          applyDSO();
        });
      });

      const btnTrigZero = dsoRow.querySelector('.btn-dso-trig-zero');
      btnTrigZero.addEventListener('click', () => {
        comp.state.triggerLevel = 0.0;
        applyDSO();
      });

      const trigSlider = dsoRow.querySelector('.insp-dso-trig-slider');
      const trigDisplay = dsoRow.querySelector('.dso-trig-display');
      trigSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        trigDisplay.textContent = `${(comp.state.triggerSource || 'ch1').toUpperCase()} · ${(comp.state.triggerSlope || 'rising') === 'rising' ? '↗ Rising' : '↘ Falling'} · ${val >= 0 ? '+' : ''}${val.toFixed(1)}V`;
      });
      trigSlider.addEventListener('change', (e) => {
        comp.state.triggerLevel = parseFloat(e.target.value);
        applyDSO();
      });

      // Math mode buttons
      dsoRow.querySelectorAll('.btn-dso-math-mode').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.mathMode = btn.dataset.mode;
          applyDSO();
        });
      });

      // Bus mode buttons
      dsoRow.querySelectorAll('.btn-dso-bus-mode').forEach(btn => {
        btn.addEventListener('click', () => {
          comp.state.decodeMode = btn.dataset.mode;
          applyDSO();
        });
      });
    }

    // Real-Time Rectification & Operating Physics Box for Loads & Control Elements
    if (comp.type !== 'transformer' && comp.type !== 'ac_source' && comp.type !== 'function_generator' && comp.type !== 'power_supply' && comp.type !== 'fuse' && comp.type !== 'oscilloscope') {
      const v = comp.state.voltageDrop || 0;
      const i = comp.state.current || 0;
      const ma = i * 1000;
      const isPowered = comp.state.powered;
      const rect = comp.state.rectification || (isPowered ? 'dc' : 'idle');

      let modeLabel = 'Direct Current (DC)';
      let modeDesc = 'Solid unidirectional current flow from positive to negative.';
      let modeColor = '#fbbf24';

      if (rect === 'half_wave') {
        modeLabel = '⚡ HALF-WAVE RECTIFIED (Pulsed DC)';
        modeDesc = `Conducts for only one half-cycle (180° conduction angle, 50% duty cycle). V_avg = V_pk/π = ${(comp.state.vdcAvg || 0).toFixed(2)}V, V_pk = ${(comp.state.vPeak || 0).toFixed(1)}V, f_ripple = 50Hz.`;
        modeColor = '#fbbf24';
      } else if (rect === 'full_wave') {
        modeLabel = '⚡ FULL-WAVE BRIDGE RECTIFIED (Smooth DC)';
        modeDesc = `Conducts during BOTH half-cycles through 4-diode Graetz bridge (360° conduction). V_avg = 2×V_pk/π = ${(comp.state.vdcAvg || 0).toFixed(2)}V, f_ripple = 100Hz (Double frequency ripple).`;
        modeColor = '#f59e0b';
      } else if (rect === 'ac') {
        modeLabel = '🔄 ALTERNATING CURRENT (AC)';
        modeDesc = `Current alternates bi-directionally every half-cycle (50Hz sine wave). Net DC average is 0.00V.`;
        modeColor = '#38bdf8';
      }

      const telemBox = document.createElement('div');
      telemBox.className = 'control-row';
      telemBox.style.flexDirection = 'column';
      telemBox.style.alignItems = 'stretch';
      telemBox.style.gap = '6px';
      telemBox.style.background = 'rgba(15, 23, 42, 0.7)';
      telemBox.style.padding = '8px';
      telemBox.style.borderRadius = '6px';
      telemBox.style.border = `1px solid ${modeColor}44`;

      telemBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 900; font-size: 0.75rem; color: ${modeColor};">${modeLabel}</span>
          <span style="font-family: monospace; font-size: 0.75rem; color: #ffffff;">${v.toFixed(2)}V · ${(ma >= 1000 ? (ma / 1000).toFixed(2) + 'A' : ma.toFixed(1) + 'mA')}</span>
        </div>
        <div style="font-size: 0.68rem; color: #94a3b8; line-height: 1.35;">${modeDesc}</div>
      `;
      controls.appendChild(telemBox);
    }
    this.updateOhmsCalcWindow();
  }

  replaceComponent(oldCompId, newType) {
    const oldComp = this.components.find(c => c.id === oldCompId);
    if (!oldComp) return;

    this.pushHistory();

    const oldDef = window.COMPONENT_DEFINITIONS[oldComp.type];
    const newDef = window.COMPONENT_DEFINITIONS[newType];
    if (!newDef) return;

    const x = oldComp.x;
    const y = oldComp.y;

    // Collect connected wires to reconnect
    const connectedWires = this.wires.filter(w => w.fromComp === oldCompId || w.toComp === oldCompId);

    // Remove old component
    this.removeComponent(oldCompId, false);

    // Spawn new component at exact same spot
    const newComp = this.spawnComponent(newType, x, y);

    // Reconnect wires to new terminals
    connectedWires.forEach(w => {
      let fromComp = w.fromComp;
      let fromPin = w.fromPin;
      let toComp = w.toComp;
      let toPin = w.toPin;

      if (fromComp === oldCompId) {
        fromComp = newComp.id;
        const oldPinIdx = oldDef.terminals.findIndex(t => t.id === fromPin);
        const newPin = newDef.terminals[Math.min(newDef.terminals.length - 1, Math.max(0, oldPinIdx))];
        fromPin = newPin ? newPin.id : newDef.terminals[0].id;
      }
      if (toComp === oldCompId) {
        toComp = newComp.id;
        const oldPinIdx = oldDef.terminals.findIndex(t => t.id === toPin);
        const newPin = newDef.terminals[Math.min(newDef.terminals.length - 1, Math.max(0, oldPinIdx))];
        toPin = newPin ? newPin.id : newDef.terminals[newDef.terminals.length - 1].id;
      }

      this.addWire(fromComp, fromPin, toComp, toPin, w.color);
    });

    window.sounds.playReplace();
    this.selectComponent(newComp);
    this.evaluateCircuit();
  }

  repairBurntComponent(compId) {
    const comp = this.components.find(c => c.id === compId);
    if (!comp) return;

    this.pushHistory();
    comp.state.burnt = false;
    comp.state.burning = false;
    delete comp.state.candidateBurn;
    comp.state.burnReason = '';
    if (comp.type === 'ammeter') {
      comp.state.fuseBlown = false;
      comp.state.blown = false;
      comp.state.reading = comp.state.mode === 'ac' ? '~ 0.000 A' : '0.000 A';
    }

    window.sounds.playReplace();
    this.updateComponentVisual(comp);
    this.showInspector(comp);
    this.evaluateCircuit();
  }

  rotateComponent(compId, deltaAngle = 90) {
    const comp = this.components.find(c => c.id === compId);
    if (!comp) return;

    this.pushHistory();
    comp.rotation = ((comp.rotation || 0) + deltaAngle + 360) % 360;

    const el = document.getElementById(`node-${comp.id}`);
    if (el) {
      const scale = comp.scale !== undefined ? comp.scale : 1.0;
      el.style.transform = `rotate(${comp.rotation}deg) scale(${scale})`;
      el.style.transformOrigin = 'center center';
      el.style.setProperty('--comp-counter-rot', `${-comp.rotation}deg`);
    }

    this.updateComponentVisual(comp);
    this.renderWires();
    this.updateMultimeter();

    if (this.selectedComponent && this.selectedComponent.id === comp.id) {
      this.showInspector(comp);
    }
    if (this.techSpecsComp && this.techSpecsComp.id === comp.id) {
      this.updateTechnicalSpecificationsModal();
    }

    if (window.sounds && window.sounds.playClick) {
      window.sounds.playClick();
    }
    this.evaluateCircuit();
  }

  scaleComponent(compId, deltaScale = 0.1) {
    const comp = this.components.find(c => c.id === compId);
    if (!comp) return;

    this.pushHistory();
    let curScale = comp.scale !== undefined ? comp.scale : 1.0;
    let newScale = Math.min(2.5, Math.max(0.5, Math.round((curScale + deltaScale) * 20) / 20));
    comp.scale = newScale;

    const el = document.getElementById(`node-${comp.id}`);
    if (el) {
      el.style.transform = `rotate(${comp.rotation || 0}deg) scale(${newScale})`;
      el.style.transformOrigin = 'center center';
      el.style.setProperty('--comp-counter-rot', `${-(comp.rotation || 0)}deg`);
    }

    this.updateComponentVisual(comp);
    this.renderWires();
    this.updateMultimeter();

    if (this.selectedComponent && this.selectedComponent.id === comp.id) {
      this.showInspector(comp);
    }
    if (this.techSpecsComp && this.techSpecsComp.id === comp.id) {
      this.updateTechnicalSpecificationsModal();
    }

    if (window.sounds && window.sounds.playClick) {
      window.sounds.playClick();
    }
    this.evaluateCircuit();
  }

  showTransformFeedback(comp, text) {
    const el = document.getElementById(`node-${comp.id}`);
    if (!el) return;
    let pill = el.querySelector('.comp-transform-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'comp-transform-pill';
      el.appendChild(pill);
    }
    pill.textContent = text;
    pill.style.display = 'block';
    if (pill._hideTimer) {
      clearTimeout(pill._hideTimer);
      pill._hideTimer = null;
    }
  }

  hideTransformFeedback(comp) {
    const el = document.getElementById(`node-${comp.id}`);
    if (!el) return;
    const pill = el.querySelector('.comp-transform-pill');
    if (pill) {
      pill._hideTimer = setTimeout(() => {
        pill.style.display = 'none';
      }, 1000);
    }
  }

  showTechnicalSpecificationsModal(comp) {
    if (!comp) return;
    this.techSpecsComp = comp;
    this.selectComponent(comp, false);

    if (this.dom && this.dom.techSpecsModal) {
      this.dom.techSpecsModal.style.display = 'flex';
    }
    this.updateTechnicalSpecificationsModal();
  }

  hideTechnicalSpecificationsModal() {
    this.techSpecsComp = null;
    if (this.dom && this.dom.techSpecsModal) {
      this.dom.techSpecsModal.style.display = 'none';
    }
  }

  updateTechnicalSpecificationsModal() {
    const comp = this.techSpecsComp;
    if (!comp || !this.dom || !this.dom.techSpecsModal || this.dom.techSpecsModal.style.display === 'none') return;

    const spec = this.getComponentTechnicalSpecs(comp);
    if (!spec) return;

    // Header items
    if (this.dom.techSpecsIcon) this.dom.techSpecsIcon.innerHTML = spec.icon;
    if (this.dom.techSpecsCategoryPill) this.dom.techSpecsCategoryPill.textContent = spec.category;
    if (this.dom.techSpecsIecPill) this.dom.techSpecsIecPill.textContent = spec.iec;
    if (this.dom.techSpecsTitle) this.dom.techSpecsTitle.textContent = spec.name;
    if (this.dom.techSpecsSubtitle) this.dom.techSpecsSubtitle.textContent = spec.description || 'Electrical Engineering Data Sheet & Real-Time Circuit Telemetry';

    // Status Pill
    if (this.dom.techSpecsStatusPill) {
      let statusText = '● NORMAL / ACTIVE';
      let statusClass = 'tech-specs-status-pill';
      if (comp.state.burnt) {
        statusText = '💥 BURNT / BLOWN';
        statusClass += ' burnt';
      } else if (comp.state.burning || comp.state.crying) {
        statusText = '🔥 OVERVOLTAGE HAZARD';
        statusClass += ' burnt';
      } else if (comp.state.overheated) {
        statusText = '⚠️ OVERHEATED';
        statusClass += ' overheated';
      } else if (comp.state.reversed) {
        statusText = '↺ REVERSE BIASED';
        statusClass += ' overheated';
      } else if (!comp.state.powered && (comp.state.voltageDrop === 0 || !comp.state.voltageDrop)) {
        statusText = '○ STANDBY / UNPOWERED';
        statusClass += ' unpowered';
      }
      this.dom.techSpecsStatusPill.className = statusClass;
      this.dom.techSpecsStatusPill.textContent = statusText;
    }

    // Section 1: Ratings Table
    if (this.dom.techSpecsRatingsGrid) {
      let rowsHtml = '';
      spec.ratings.forEach(r => {
        rowsHtml += `
          <tr>
            <td class="label-col"><strong>${r.param}</strong> (${r.symbol})</td>
            <td class="val-col">${r.val}</td>
            <td style="font-size: 0.68rem; color: #64748b; text-align: right;">${r.cond || ''}</td>
          </tr>
        `;
      });
      this.dom.techSpecsRatingsGrid.innerHTML = `
        <table class="tech-specs-table">
          <tbody>${rowsHtml}</tbody>
        </table>
      `;
    }

    // Section 2: Real-Time Circuit Telemetry
    if (this.dom.techSpecsTelemetryGrid) {
      const vDrop = (comp.state.voltageDrop !== undefined) ? comp.state.voltageDrop : (comp.state.vDrop || 0);
      const curA = (comp.state.current !== undefined) ? comp.state.current : ((comp.state.currentMa ? comp.state.currentMa / 1000 : 0));
      const curMa = curA * 1000;
      const powerW = (comp.state.power !== undefined) ? comp.state.power : (comp.state.watts !== undefined ? comp.state.watts : (vDrop * curA));
      const powerMw = powerW * 1000;
      const tempC = (comp.state.temperature !== undefined) ? comp.state.temperature : (comp.state.tempC || 25.0);

      const vStr = vDrop >= 1.0 ? `${vDrop.toFixed(2)} V` : `${(vDrop * 1000).toFixed(1)} mV`;
      const iStr = Math.abs(curA) >= 1.0 ? `${curA.toFixed(3)} A` : `${curMa.toFixed(1)} mA`;
      const pStr = powerW >= 1.0 ? `${powerW.toFixed(2)} W` : `${powerMw.toFixed(1)} mW`;
      const tColor = tempC > 100 ? '#ef4444' : (tempC > 60 ? '#f59e0b' : '#38bdf8');

      let tilesHtml = `
        <div class="tech-telemetry-tile">
          <span class="tech-telemetry-label">VOLTAGE DROP</span>
          <span class="tech-telemetry-val" style="color: #38bdf8;">${vStr}</span>
          <span class="tech-telemetry-sub">Across Terminals</span>
        </div>
        <div class="tech-telemetry-tile">
          <span class="tech-telemetry-label">BRANCH CURRENT</span>
          <span class="tech-telemetry-val" style="color: #fbbf24;">${iStr}</span>
          <span class="tech-telemetry-sub">Conduction Flow</span>
        </div>
        <div class="tech-telemetry-tile">
          <span class="tech-telemetry-label">POWER DISSIPATION</span>
          <span class="tech-telemetry-val" style="color: #fbbf24;">${pStr}</span>
          <span class="tech-telemetry-sub">Joule Thermal Rate</span>
        </div>
        <div class="tech-telemetry-tile">
          <span class="tech-telemetry-label">CORE TEMPERATURE</span>
          <span class="tech-telemetry-val" style="color: ${tColor};">${tempC.toFixed(1)} °C</span>
          <span class="tech-telemetry-sub">Thermal Equilibrium</span>
        </div>
      `;
      this.dom.techSpecsTelemetryGrid.innerHTML = tilesHtml;
    }

    // Section 3: Governing Formulas
    if (this.dom.techSpecsFormulaBox) {
      let formulasHtml = '';
      spec.formulas.forEach(f => {
        formulasHtml += `
          <div style="margin-bottom: 8px;">
            <div class="tech-formula-highlight">${f.highlight}</div>
            <div style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; margin: 2px 0;">${f.name}</div>
            <div class="tech-formula-desc">${f.desc}</div>
          </div>
        `;
      });
      this.dom.techSpecsFormulaBox.innerHTML = formulasHtml;
    }

    // Section 4: Geometry Controls & Terminals Map
    if (this.dom.techSpecsGeometryRow) {
      const rot = (comp.rotation || 0) % 360;
      const scale = comp.scale !== undefined ? comp.scale : 1.0;
      let pinsHtml = '';
      if (comp.terminals) {
        pinsHtml = comp.terminals.map(t => {
          const pos = this.getPinAbsolutePos(comp.id, t.id);
          return `<span style="font-size: 0.65rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${t.label || t.id}: (${pos.x}, ${pos.y})</span>`;
        }).join(' ');
      }

      this.dom.techSpecsGeometryRow.innerHTML = `
        <div class="tech-geo-group">
          <span class="tech-geo-label">ORIENTATION:</span>
          <span class="tech-geo-val" id="spec-geo-rot-val">${rot}°</span>
          <button type="button" class="tech-geo-btn" id="btn-spec-rot-ccw" title="Rotate -90°">↺ -90°</button>
          <button type="button" class="tech-geo-btn" id="btn-spec-rot-cw" title="Rotate +90°">↻ +90°</button>
          <button type="button" class="tech-geo-btn" id="btn-spec-rot-zero" title="Reset Rotation to 0°">0°</button>
          <button type="button" class="tech-geo-btn" id="btn-spec-rot-180" title="Flip 180°">180°</button>
        </div>
        <div class="tech-geo-group">
          <span class="tech-geo-label">SCALE (SIZE):</span>
          <span class="tech-geo-val" id="spec-geo-scale-val">${Math.round(scale * 100)}%</span>
          <button type="button" class="tech-geo-btn" id="btn-spec-scale-down" title="Scale Down (-10%)">-10%</button>
          <button type="button" class="tech-geo-btn" id="btn-spec-scale-up" title="Scale Up (+10%)">+10%</button>
          <button type="button" class="tech-geo-btn" id="btn-spec-scale-reset" title="Reset Scale to 100%">1.0x</button>
          <button type="button" class="tech-geo-btn" id="btn-spec-scale-150" title="Scale to 150%">1.5x</button>
          <button type="button" class="tech-geo-btn" id="btn-spec-scale-200" title="Scale to 200%">2.0x</button>
        </div>
        <div style="width: 100%; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
          <span style="font-size: 0.68rem; font-weight: 700; color: #94a3b8;">TERMINALS / PINS:</span>
          ${pinsHtml}
        </div>
      `;

      // Wire up geometry buttons
      const bCcw = document.getElementById('btn-spec-rot-ccw');
      if (bCcw) bCcw.onclick = () => this.rotateComponent(comp.id, -90);
      const bCw = document.getElementById('btn-spec-rot-cw');
      if (bCw) bCw.onclick = () => this.rotateComponent(comp.id, 90);
      const bZero = document.getElementById('btn-spec-rot-zero');
      if (bZero) bZero.onclick = () => this.rotateComponent(comp.id, -rot);
      const b180 = document.getElementById('btn-spec-rot-180');
      if (b180) b180.onclick = () => this.rotateComponent(comp.id, 180);

      const bDown = document.getElementById('btn-spec-scale-down');
      if (bDown) bDown.onclick = () => this.scaleComponent(comp.id, -0.1);
      const bUp = document.getElementById('btn-spec-scale-up');
      if (bUp) bUp.onclick = () => this.scaleComponent(comp.id, 0.1);
      const bReset = document.getElementById('btn-spec-scale-reset');
      if (bReset) bReset.onclick = () => this.scaleComponent(comp.id, 1.0 - scale);
      const b150 = document.getElementById('btn-spec-scale-150');
      if (b150) b150.onclick = () => this.scaleComponent(comp.id, 1.5 - scale);
      const b200 = document.getElementById('btn-spec-scale-200');
      if (b200) b200.onclick = () => this.scaleComponent(comp.id, 2.0 - scale);
    }
  }

  getComponentTechnicalSpecs(comp) {
    if (!comp) return null;
    const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[comp.type]) || { name: comp.type, width: 100, height: 60 };
    const profile = (window.CHARACTER_PROFILES && window.CHARACTER_PROFILES[comp.type]) || null;

    let spec = {
      name: profile ? profile.name : def.name,
      category: (def.category || 'Passive').toUpperCase(),
      iec: 'IEC 60062 / JEDEC',
      icon: (profile && profile.avatar) || '⚙️',
      description: def.description || (profile ? (profile.functionAndUsage || profile.importance) : ''),
      ratings: [],
      formulas: []
    };

    switch (comp.type) {
      case 'gate_and':
      case 'gate_or':
      case 'gate_not':
      case 'gate_nand':
      case 'gate_nor':
      case 'gate_xor':
      case 'gate_xnor': {
        const isNot = comp.type === 'gate_not';
        let icName = 'AND GATE';
        let boolEq = 'Y = A · B';
        let boolRule = 'Output is HIGH (1) if and only if both Input A and Input B are 1.';
        if (comp.type === 'gate_or') { icName = 'OR GATE'; boolEq = 'Y = A + B'; boolRule = 'Output is HIGH (1) when at least one input is 1.'; }
        else if (comp.type === 'gate_not') { icName = 'NOT GATE'; boolEq = 'Y = Ā'; boolRule = 'Output is inverted state of Input A (0 ➔ 1, 1 ➔ 0).'; }
        else if (comp.type === 'gate_nand') { icName = 'NAND GATE'; boolEq = 'Y = (A · B)̄'; boolRule = 'Output is LOW (0) only when both inputs are 1; otherwise 1.'; }
        else if (comp.type === 'gate_nor') { icName = 'NOR GATE'; boolEq = 'Y = (A + B)̄'; boolRule = 'Output is HIGH (1) only when both inputs are 0; otherwise 0.'; }
        else if (comp.type === 'gate_xor') { icName = 'XOR GATE'; boolEq = 'Y = A ⊕ B'; boolRule = 'Output is HIGH (1) when exactly one input is 1 (inputs differ).'; }
        else if (comp.type === 'gate_xnor') { icName = 'XNOR GATE'; boolEq = 'Y = (A ⊕ B)̄'; boolRule = 'Output is HIGH (1) when inputs are equal (both 0 or both 1).'; }

        spec.name = icName;
        spec.category = 'DIGITAL LOGIC GATE';
        spec.iec = 'IEEE 91-1984 / ANSI';
        spec.icon = '🔣';
        spec.ratings = [
          { param: 'Supply Voltage (Vcc)', symbol: 'V_cc', val: '2.0 V to 6.0 V (Nominal 5.0 V)', cond: 'Operating Range' },
          { param: 'Logic HIGH Output Voltage', symbol: 'V_OH', val: '≥ 4.4 V (Nominal 5.0 V)', cond: 'I_OH = -20 µA, Vcc = 5V' },
          { param: 'Logic LOW Output Voltage', symbol: 'V_OL', val: '≤ 0.1 V (Nominal 0.0 V)', cond: 'I_OL = 20 µA, Vcc = 5V' },
          { param: 'HIGH-Level Input Threshold', symbol: 'V_IH', val: '≥ 1.5 V (Nominal 3.15 V)', cond: 'Detected as Logic 1' },
          { param: 'LOW-Level Input Threshold', symbol: 'V_IL', val: '≤ 0.8 V (Nominal 1.35 V)', cond: 'Detected as Logic 0' },
          { param: 'Maximum Output Current', symbol: 'I_out(max)', val: '±25 mA', cond: 'Direct load drive limit' },
          { param: 'Propagation Delay (Typ)', symbol: 't_pd', val: '9 ns', cond: 'CL = 50pF, Vcc = 5V' }
        ];
        spec.formulas = [
          {
            highlight: boolEq,
            name: "Boolean Algebraic Function",
            desc: boolRule
          },
          {
            highlight: "CMOS Push-Pull Output Stage: P_dyn = C_L · Vcc² · f",
            name: "CMOS Switching Power",
            desc: "Static power dissipation is near zero (< 1 µW). Dynamic power scales with switching frequency and capacitive loading."
          }
        ];
        break;
      }
      case 'ic_7408':
      case 'ic_7432':
      case 'ic_7404':
      case 'ic_7486':
      case 'ic_7400':
      case 'ic_7402':
      case 'ic_74266': {
        const icSpec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[comp.type];
        const code = icSpec ? icSpec.code : comp.type.replace('ic_', '');
        const fName = icSpec ? icSpec.fullName : `SN74HC${code}N`;
        const desc = icSpec ? icSpec.gateDesc : 'Logic IC';
        spec.name = `${fName} (${desc})`;
        spec.category = 'INTEGRATED CIRCUIT (DIP-14)';
        spec.iec = 'JEDEC MS-001 / IEEE 91';
        spec.icon = '🔌';
        spec.ratings = [
          { param: 'Recommended Supply Voltage (Vcc)', symbol: 'V_cc', val: '2.0 V to 6.0 V (Nominal 5.0 V)', cond: 'Operating Range' },
          { param: 'Absolute Maximum Supply Voltage', symbol: 'V_cc(max)', val: '7.0 V', cond: 'Overvoltage burnout above 7.0V!' },
          { param: 'HIGH-Level Output Voltage (V_OH)', symbol: 'V_OH', val: '≥ 4.4 V (Nominal 5.0 V)', cond: 'I_OH = -20 µA, Vcc = 5V' },
          { param: 'LOW-Level Output Voltage (V_OL)', symbol: 'V_OL', val: '≤ 0.1 V (Nominal 0.0 V)', cond: 'I_OL = 20 µA, Vcc = 5V' },
          { param: 'HIGH-Level Input Threshold (V_IH)', symbol: 'V_IH', val: '≥ 3.15 V (Min 1.5 V)', cond: 'Detected as Logic 1' },
          { param: 'LOW-Level Input Threshold (V_IL)', symbol: 'V_IL', val: '≤ 1.35 V (Max 0.8 V)', cond: 'Detected as Logic 0' },
          { param: 'Continuous Output Current per Pin', symbol: 'I_out', val: '±25 mA', cond: 'Direct load drive limit' },
          { param: 'Propagation Delay (t_pd)', symbol: 't_pd', val: '9 ns', cond: 'CL = 50pF, Vcc = 5V' }
        ];
        spec.formulas = [
          {
            highlight: `Package: DIP-14 | Pin 14: VCC (+5V) | Pin 7: GND (0V)`,
            name: "Standard Dual In-Line Pinout",
            desc: "All inputs and outputs are referenced to Pin 7 (GND). Power must be supplied between Pin 14 and Pin 7 within 2V to 6V."
          },
          {
            highlight: `Overvoltage Protection: V_in < 7.0V`,
            name: "CMOS Latch-Up & Overvoltage Rating",
            desc: "Operating above 7.0V or connecting raw 9V batteries causes dielectric breakdown and burns the chip."
          }
        ];
        break;
      }
      case 'resistor': {
        const rVal = comp.state.resistance || 220;
        spec.name = `Fixed Carbon Film Resistor (${window.formatResistance(rVal)})`;
        spec.category = 'PASSIVE RESISTIVE';
        spec.iec = 'IEC 60062 / EIA-RS-279';
        spec.icon = '⚡';
        spec.ratings = [
          { param: 'Nominal Resistance (R)', symbol: 'R_nom', val: window.formatResistance(rVal), cond: 'Standard Preferred E12/E24' },
          { param: 'Rated Power Dissipation', symbol: 'P_max', val: '0.25 W (1/4 W)', cond: '@ 70°C Ambient' },
          { param: 'Max Continuous Voltage', symbol: 'V_max', val: '250 V DC / AC RMS', cond: 'Continuous operation limit' },
          { param: 'Dielectric Withstanding Voltage', symbol: 'V_with', val: '500 V', cond: '1 minute isolation' },
          { param: 'Resistance Tolerance', symbol: 'Tol', val: '±5% (Gold Band)', cond: 'JEDEC 4-band EIA standard' },
          { param: 'Temperature Coefficient (TCR)', symbol: 'α_TCR', val: '±350 ppm/°C', cond: '-55°C to +155°C' }
        ];
        spec.formulas = [
          {
            highlight: 'V = I · R',
            name: "Ohm's Law",
            desc: "The voltage drop across the resistor is directly proportional to the current flowing through it."
          },
          {
            highlight: 'P = V · I = I² · R = V² / R',
            name: "Joule Heating Dissipation Law",
            desc: "Electrical energy converted into thermal dissipation. Must strictly remain below rated 0.25W to prevent thermal destruction."
          }
        ];
        break;
      }
      case 'potentiometer': {
        const rVal = comp.state.resistance || 500;
        const maxR = comp.state.maxResistance || 10000;
        spec.name = `Precision Rotary Potentiometer (${window.formatResistance(maxR)})`;
        spec.category = 'PASSIVE VARIABLE RESISTOR';
        spec.iec = 'IEC 60393-1';
        spec.icon = '🎛️';
        spec.ratings = [
          { param: 'Total Track Resistance', symbol: 'R_total', val: window.formatResistance(maxR), cond: 'Terminal 1 to 3' },
          { param: 'Wiper Variable Setting', symbol: 'R_wiper', val: window.formatResistance(rVal), cond: 'Current shaft position' },
          { param: 'Rated Continuous Power', symbol: 'P_rated', val: '0.50 W (1/2 W)', cond: '@ 40°C Ambient' },
          { param: 'Max Operating Voltage', symbol: 'V_max', val: '200 V DC/AC', cond: 'Across track' },
          { param: 'Resistance Taper', symbol: 'Taper', val: 'Linear (Type B)', cond: 'Constant dR/dθ' }
        ];
        spec.formulas = [
          {
            highlight: 'V_out = V_in · (R_wiper / R_total)',
            name: "Voltage Divider Rule",
            desc: "Allows smooth, linear division of input voltage proportional to knob rotation angle."
          }
        ];
        break;
      }
      case 'led': {
        const color = comp.state.color || 'red';
        const vfMap = { red: '2.0 V', green: '2.2 V', blue: '3.1 V', yellow: '2.1 V', purple: '3.2 V' };
        spec.name = `Light Emitting Diode (${color.toUpperCase()})`;
        spec.category = 'OPTOELECTRONIC SEMICONDUCTOR';
        spec.iec = 'IEC 60747-5 / JEDEC';
        spec.icon = '💡';
        spec.ratings = [
          { param: 'Nominal Forward Voltage (V_F)', symbol: 'V_F', val: vfMap[color] || '2.1 V', cond: '@ I_F = 20 mA' },
          { param: 'Continuous Forward Current', symbol: 'I_F(max)', val: '25 mA', cond: 'Max thermal limit' },
          { param: 'Peak Forward Surge Current', symbol: 'I_F(peak)', val: '50 mA', cond: '10 µs pulse @ 10% duty' },
          { param: 'Peak Reverse Voltage (PIV)', symbol: 'V_R(max)', val: '5.0 V', cond: 'Reverse breakdown hazard' },
          { param: 'Max Power Dissipation', symbol: 'P_D(max)', val: '75 mW', cond: 'Ambient T = 25°C' }
        ];
        spec.formulas = [
          {
            highlight: 'I_F ≈ I_S · exp(q·V_F / (n·k·T))',
            name: "Shockley Diode Characteristic",
            desc: "Current rises exponentially once forward bias crosses threshold (~2V). Without series resistance, catastrophic thermal runaway occurs immediately."
          },
          {
            highlight: 'R_series = (V_supply - V_F) / I_target',
            name: "Ballast Resistor Calculation",
            desc: "Ensures forward current is restricted to a safe operating design value (typically 15-20 mA)."
          }
        ];
        break;
      }
      case 'bulb': {
        spec.name = 'Incandescent Miniature Lamp (Tungsten)';
        spec.category = 'INCANDESCENT THERMAL EMITTER';
        spec.iec = 'IEC 60064';
        spec.icon = '💡';
        spec.ratings = [
          { param: 'Nominal Working Voltage', symbol: 'V_nom', val: '9.0 V', cond: 'Rated operating point' },
          { param: 'Permissible Voltage Range', symbol: 'V_range', val: '6.0 V to 12.0 V', cond: 'Safe operating window' },
          { param: 'Absolute Overvoltage Limit', symbol: 'V_abs_max', val: '14.5 V', cond: 'Filament vaporization threshold' },
          { param: 'Nominal Power Consumption', symbol: 'P_nom', val: '1.80 W', cond: '@ 9.0 V input' },
          { param: 'Hot Operating Resistance', symbol: 'R_hot', val: '~45 Ω to 50 Ω', cond: '@ 2400°C incandescence' },
          { param: 'Cold Rest Resistance', symbol: 'R_cold', val: '~5 Ω', cond: '@ 25°C room temp (high inrush current)' }
        ];
        spec.formulas = [
          {
            highlight: 'P_rad = ε · σ · A · (T⁴ - T₀⁴)',
            name: "Stefan-Boltzmann Radiation Law",
            desc: "Thermal radiation emitted by incandescent tungsten filament scales with fourth power of absolute temperature."
          }
        ];
        break;
      }
      case 'battery': {
        spec.name = '9V Transistor Battery (6LR61 / PP3)';
        spec.category = 'ELECTROCHEMICAL PRIMARY SOURCE';
        spec.iec = 'IEC 60086-2 (6LR61)';
        spec.icon = '🔋';
        spec.ratings = [
          { param: 'Nominal Terminal Voltage', symbol: 'V_nom', val: '9.0 V DC', cond: 'Open-circuit potential' },
          { param: 'Standard Capacity Rating', symbol: 'C_rated', val: '550 mAh', cond: 'To 4.8V cut-off @ 20°C' },
          { param: 'Internal ESR Resistance', symbol: 'R_int', val: '1.5 Ω to 2.5 Ω', cond: 'Internal electrolyte resistance' },
          { param: 'Max Continuous Discharge', symbol: 'I_max', val: '350 mA', cond: 'Continuous load' },
          { param: 'Short-Circuit Pulse Current', symbol: 'I_sc_max', val: '2.5 A', cond: '< 200 ms transient' }
        ];
        spec.formulas = [
          {
            highlight: 'V_terminal = E_emf - I_load · R_int',
            name: "Terminal Output Voltage Law",
            desc: "As current draw increases, internal voltage drop across internal ESR lowers terminal voltage delivered to circuit."
          }
        ];
        break;
      }
      case 'cell': {
        spec.name = '1.5V Alkaline AA Cell (LR6)';
        spec.category = 'ELECTROCHEMICAL PRIMARY CELL';
        spec.iec = 'IEC 60086-2 (LR6)';
        spec.icon = '🔋';
        spec.ratings = [
          { param: 'Nominal Terminal Voltage', symbol: 'V_nom', val: '1.50 V DC', cond: 'Fresh chemical charge' },
          { param: 'Rated Nominal Capacity', symbol: 'C_rated', val: '2800 mAh', cond: 'Discharge to 0.9V @ 25mA' },
          { param: 'Internal ESR Resistance', symbol: 'R_int', val: '0.15 Ω to 0.25 Ω', cond: 'Low internal resistance' },
          { param: 'Max Continuous Current', symbol: 'I_cont', val: '1.0 A', cond: 'Continuous operation' }
        ];
        spec.formulas = [
          {
            highlight: 'V_out = 1.5V - I · 0.15Ω',
            name: "Linear Cell Load Line",
            desc: "Maintains remarkably flat 1.5V output under low to medium current draws."
          }
        ];
        break;
      }
      case 'cell3v': {
        spec.name = '3V Lithium Coin Cell (CR2032)';
        spec.category = 'LITHIUM PRIMARY COIN CELL';
        spec.iec = 'IEC 60086-2 (CR2032)';
        spec.icon = '🪙';
        spec.ratings = [
          { param: 'Nominal Terminal Voltage', symbol: 'V_nom', val: '3.0 V DC', cond: 'Open-circuit' },
          { param: 'Standard Capacity Rating', symbol: 'C_rated', val: '225 mAh', cond: 'Discharge to 2.0V @ 15kΩ' },
          { param: 'Baseline Standard Drain', symbol: 'I_base', val: '0.2 mA to 0.3 mA', cond: 'Optimal microamp regime' },
          { param: 'Max Continuous Drain Limit', symbol: 'I_cont_max', val: '3.0 mA', cond: 'Continuous manufacturer limit' },
          { param: 'Max Short Pulse Drain Limit', symbol: 'I_pulse_max', val: '50 mA', cond: '< 1 sec pulse' },
          { param: 'Internal ESR (Chemistry)', symbol: 'ESR', val: '15 Ω to 30 Ω', cond: 'Li/MnO₂ High impedance' }
        ];
        spec.formulas = [
          {
            highlight: 'V_load = 3.0V - I_load · R_esr',
            name: "High Internal ESR Droop",
            desc: "Designed exclusively for ultra-low power electronics. High internal ESR causes severe voltage sag and destructive heating under heavy loads."
          }
        ];
        break;
      }
      case 'motor': {
        spec.name = 'Permanent Magnet DC Electric Motor';
        spec.category = 'ELECTROMECHANICAL TRANSDUCER';
        spec.iec = 'IEC 60034-1';
        spec.icon = '⚙️';
        spec.ratings = [
          { param: 'Nominal Voltage Rating', symbol: 'V_nom', val: '9.0 V DC', cond: 'Optimal design speed' },
          { param: 'Operating Voltage Range', symbol: 'V_range', val: '4.5 V to 12.0 V', cond: 'Bidirectional operation' },
          { param: 'Absolute Max Voltage Limit', symbol: 'V_max', val: '14.0 V', cond: 'Armature burnout limit' },
          { param: 'No-Load Operating Speed', symbol: 'n_0', val: '8,500 RPM', cond: '@ 9.0 V input' },
          { param: 'Stall Current (Locked Rotor)', symbol: 'I_stall', val: '1.80 A', cond: 'No back-EMF condition' },
          { param: 'Armature Winding Resistance', symbol: 'R_a', val: '4.5 Ω', cond: 'Copper winding resistance' }
        ];
        spec.formulas = [
          {
            highlight: 'V = E_b + I_a · R_a',
            name: "DC Motor Armature Equation",
            desc: "Applied voltage equals generated counter-electromotive force (back-EMF) plus the armature copper drop."
          },
          {
            highlight: 'E_b = k_e · Φ · ω',
            name: "Faraday Back-EMF Generation",
            desc: "As the rotor spins faster, back-EMF rises to oppose supply voltage, automatically choking off current."
          }
        ];
        break;
      }
      case 'diode':
      case 'rectifier': {
        spec.name = comp.type === 'rectifier' ? 'Bridge Rectifier Assembly (1N4007 Array)' : 'Silicon Rectifier Diode (1N4007)';
        spec.category = 'SEMICONDUCTOR RECTIFIER';
        spec.iec = 'JEDEC DO-41 / IEC 60747-2';
        spec.icon = '⚡';
        spec.ratings = [
          { param: 'Peak Repetitive Reverse Voltage', symbol: 'V_RRM', val: '1000 V', cond: 'Max reverse withstand' },
          { param: 'Average Rectified Forward Current', symbol: 'I_F(AV)', val: '1.0 A', cond: 'Continuous conduction' },
          { param: 'Forward Voltage Drop (V_F)', symbol: 'V_F', val: '0.70 V', cond: '@ I_F = 1.0 A, 25°C' },
          { param: 'Max Reverse Leakage Current', symbol: 'I_R', val: '5.0 µA', cond: '@ V_R = 1000 V' },
          { param: 'Non-Repetitive Peak Surge Current', symbol: 'I_FSM', val: '30 A', cond: '8.3 ms half sine wave' }
        ];
        spec.formulas = [
          {
            highlight: 'I = I_S · [exp(q·V_D / (n·k·T)) - 1]',
            name: "Shockley Ideal Diode Equation",
            desc: "Describes the exponential relationship between junction voltage and forward current."
          }
        ];
        break;
      }
      case 'npn':
      case 'pnp': {
        const isNpn = comp.type === 'npn';
        spec.name = isNpn ? 'NPN Silicon Bipolar Transistor (2N2222)' : 'PNP Silicon Bipolar Transistor (2N3906)';
        spec.category = 'DISCRETE BIPOLAR SEMICONDUCTOR';
        spec.iec = 'JEDEC TO-92 / JESD-51';
        spec.icon = '🔀';
        spec.ratings = [
          { param: 'Collector-Emitter Voltage Rating', symbol: 'V_CEO', val: isNpn ? '40 V' : '-40 V', cond: 'Base open circuit' },
          { param: 'Collector-Base Breakdown Voltage', symbol: 'V_CBO', val: isNpn ? '75 V' : '-40 V', cond: 'Emitter open circuit' },
          { param: 'Continuous Collector Current', symbol: 'I_C', val: isNpn ? '600 mA (800mA peak)' : '-200 mA', cond: 'Continuous limit' },
          { param: 'Total Device Dissipation', symbol: 'P_D', val: '625 mW', cond: '@ 25°C Ambient' },
          { param: 'DC Current Gain (h_FE / β)', symbol: 'h_FE', val: '100 to 300', cond: '@ I_C = 150 mA, V_CE = 10V' }
        ];
        spec.formulas = [
          {
            highlight: 'I_C = β · I_B = h_FE · I_B',
            name: "Forward Active Bipolar Gain",
            desc: "A small base current triggers a large proportional collector current in active linear amplification."
          },
          {
            highlight: 'I_E = I_B + I_C',
            name: "Kirchhoff Current Conservation",
            desc: "Total emitter current equals the algebraic sum of base and collector branch currents."
          }
        ];
        break;
      }
      case 'capacitor': {
        const uF = comp.state.capacitance || 1000;
        const vRating = comp.state.ratedVoltage || 16;
        spec.name = `Aluminum Electrolytic Capacitor (${uF} µF / ${vRating}V)`;
        spec.category = 'PASSIVE REACTIVE CAPACITOR';
        spec.iec = 'IEC 60384-4';
        spec.icon = '🔋';
        spec.ratings = [
          { param: 'Nominal Capacitance', symbol: 'C', val: `${uF} µF`, cond: '@ 120 Hz, 20°C' },
          { param: 'Rated Working Voltage (WVDC)', symbol: 'V_rated', val: `${vRating} V DC`, cond: 'Continuous operating limit' },
          { param: 'Surge Voltage Withstand', symbol: 'V_surge', val: `${(vRating * 1.25).toFixed(1)} V`, cond: '< 30 sec surge' },
          { param: 'Reverse Voltage Breakdown Limit', symbol: 'V_rev', val: '0.0 V (Max 1.0V)', cond: 'Severe explosion risk if inverted' },
          { param: 'Dielectric Material Layer', symbol: 'Dielectric', val: 'Aluminum Oxide (Al₂O₃)', cond: 'Ultra-thin electrolytic barrier' }
        ];
        spec.formulas = [
          {
            highlight: 'i(t) = C · (dv / dt)',
            name: "Capacitor Current Law",
            desc: "Current through a capacitor is proportional to the rate of change of voltage across its terminals."
          },
          {
            highlight: 'E = ½ · C · V²',
            name: "Stored Electrostatic Energy",
            desc: "Energy stored in the electric field between conductive plates."
          }
        ];
        break;
      }
      case 'ceramic_capacitor': {
        const nf = comp.state.capacitanceNf || 100;
        const pf = comp.state.capacitancePf || (nf * 1000);
        const code = comp.state.ceramicCode || '104';
        spec.name = `Ceramic Disc Capacitor (Code ${code} • ${nf} nF)`;
        spec.category = 'PASSIVE CERAMIC DIELECTRIC';
        spec.iec = 'IEC 60384-8 / EIA-RS-198';
        spec.icon = '🟠';
        spec.ratings = [
          { param: 'Nominal Capacitance', symbol: 'C', val: `${nf} nF (${pf} pF)`, cond: 'EIA 3-Digit Code: ' + code },
          { param: 'Rated DC Voltage', symbol: 'V_DC', val: '50 V DC', cond: 'Continuous withstand' },
          { param: 'Dielectric Material Class', symbol: 'Class', val: 'Class 2 Ceramic (X7R / Y5V)', cond: 'High dielectric constant' },
          { param: 'Terminal Polarity', symbol: 'Polarity', val: 'Non-Polarized (Bipolar)', cond: 'Safe in both directions' }
        ];
        spec.formulas = [
          {
            highlight: 'C = ε_r · ε₀ · (A / d)',
            name: "Physical Capacitance Formula",
            desc: "Capacitance determined by dielectric permittivity, plate surface area, and ceramic spacing."
          }
        ];
        break;
      }
      case 'inductor': {
        const mh = comp.state.inductanceMh || 10;
        const dcr = comp.state.dcr || 0.8;
        spec.name = `Power Inductor (Ferrite Core • ${mh} mH)`;
        spec.category = 'PASSIVE ELECTROMAGNETIC';
        spec.iec = 'IEC 62024';
        spec.icon = '〰️';
        spec.ratings = [
          { param: 'Nominal Inductance', symbol: 'L', val: `${mh} mH`, cond: '@ 100 kHz, 0.1 V' },
          { param: 'DC Winding Resistance (DCR)', symbol: 'R_DCR', val: `${dcr} Ω`, cond: 'Copper coil loss' },
          { param: 'Core Saturation Current', symbol: 'I_sat', val: '3.5 A', cond: '-20% inductance drop point' },
          { param: 'Thermal Continuous Current', symbol: 'I_rms', val: '2.5 A', cond: 'ΔT = +40°C rise' }
        ];
        spec.formulas = [
          {
            highlight: 'v(t) = L · (di / dt)',
            name: "Faraday-Lenz Law of Induction",
            desc: "Induces an opposing electromotive force (back-EMF) proportional to the rate of change of branch current."
          },
          {
            highlight: 'E = ½ · L · I²',
            name: "Stored Magnetic Field Energy",
            desc: "Energy stored in the concentrated magnetic flux inside the ferrite core."
          }
        ];
        break;
      }
      case 'transformer': {
        const secV = comp.state.secondaryV || 12;
        spec.name = `Mains Step-Down Power Transformer (230V / ${secV}V)`;
        spec.category = 'ELECTROMAGNETIC ISOLATION TRANSFORMER';
        spec.iec = 'IEC 61558-1';
        spec.icon = '⚡';
        spec.ratings = [
          { param: 'Primary Rated AC Voltage', symbol: 'V_prim', val: '230 V AC RMS', cond: '50 Hz / 60 Hz input' },
          { param: 'Secondary Rated AC Voltage', symbol: 'V_sec', val: `${secV} V AC RMS`, cond: 'At rated secondary load' },
          { param: 'Nominal Turns Ratio', symbol: 'N_p : N_s', val: `${(230 / secV).toFixed(1)} : 1`, cond: 'Primary to secondary windings' },
          { param: 'Apparent Power Rating', symbol: 'S_rated', val: '24 VA', cond: 'Core continuous thermal capacity' },
          { param: 'Dielectric Isolation Voltage', symbol: 'V_iso', val: '3,750 V AC', cond: 'Galvanic isolation barrier' }
        ];
        spec.formulas = [
          {
            highlight: 'V_s / V_p = N_s / N_p = I_p / I_s',
            name: "Ideal Transformer Equation",
            desc: "Voltage transforms in direct ratio to winding turns, while current transforms in inverse ratio."
          }
        ];
        break;
      }
      case 'power_supply': {
        const vSet = comp.state.voltage !== undefined ? comp.state.voltage : 12.0;
        const iLim = comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5;
        spec.name = 'Precision Regulated DC Bench Power Supply';
        spec.category = 'LABORATORY POWER SOURCE';
        spec.iec = 'IEC 61010-1 CAT II';
        spec.icon = '⚡';
        spec.ratings = [
          { param: 'Configured Voltage Output', symbol: 'V_set', val: `${vSet.toFixed(1)} V DC`, cond: 'Adjustable 0.0V to 30.0V' },
          { param: 'Configured Current Limit', symbol: 'I_limit', val: `${iLim.toFixed(2)} A`, cond: 'Adjustable 0.05A to 5.0A' },
          { param: 'Operating Control Modes', symbol: 'Modes', val: 'Constant Voltage (CV) & Constant Current (CC)', cond: 'Automatic crossover' },
          { param: 'Ripple and Output Noise', symbol: 'V_ripple', val: '≤ 1.0 mV RMS', cond: '20 Hz to 20 MHz bandwidth' }
        ];
        spec.formulas = [
          {
            highlight: 'V_out = V_set (for I_load ≤ I_limit)',
            name: "Constant Voltage (CV) Regime",
            desc: "Source maintains solid voltage regulation as long as load current stays below current limit."
          },
          {
            highlight: 'I_out = I_limit (for R_load ≤ V_set / I_limit)',
            name: "Constant Current (CC) Compliance",
            desc: "Automatically folds back output voltage to clamp current safely at set limit during overloads."
          }
        ];
        break;
      }
      case 'function_generator': {
        const freq = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
        const amp = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 5.0;
        const wave = comp.state.waveform || 'sine';
        spec.name = 'Laboratory Function / Arbitrary Waveform Generator';
        spec.category = 'SIGNAL GENERATION INSTRUMENT';
        spec.iec = 'IEC 61010-1 / IEEE 488.2';
        spec.icon = '〰️';
        spec.ratings = [
          { param: 'Current Waveform Output', symbol: 'Wave', val: wave.toUpperCase(), cond: 'Sine, Square, Triangle, Ramp, DC' },
          { param: 'Synthesized Frequency', symbol: 'f_out', val: `${freq >= 1000 ? (freq / 1000).toFixed(1) + ' kHz' : freq + ' Hz'}`, cond: 'Range: 1 Hz to 100 kHz' },
          { param: 'Peak-to-Peak Amplitude', symbol: 'V_pp', val: `${amp.toFixed(1)} Vpp`, cond: 'Range: 0.1 Vpp to 20.0 Vpp' },
          { param: 'Output Terminal Impedance', symbol: 'Z_out', val: '50 Ω', cond: 'RF transmission standard' }
        ];
        spec.formulas = [
          {
            highlight: 'v(t) = V_offset + (V_pp / 2) · sin(2π · f · t)',
            name: "Synthesized AC Signal Function",
            desc: "Continuous harmonic oscillation providing repeatable excitation for circuit analysis."
          }
        ];
        break;
      }
      case 'oscilloscope': {
        spec.name = 'Digital Storage Oscilloscope (DSO 2-Channel)';
        spec.category = 'TEST & MEASUREMENT INSTRUMENTATION';
        spec.iec = 'IEC 61010-1 (CAT II 300V)';
        spec.icon = '📊';
        spec.ratings = [
          { param: 'Analog Input Channels', symbol: 'CH', val: '2 Isolated Channels (CH1, CH2)', cond: 'Independent vertical attenuators' },
          { param: 'Analog Bandwidth (-3dB)', symbol: 'BW', val: '100 MHz', cond: 'High-frequency fidelity' },
          { param: 'Vertical Sensitivity Range', symbol: 'V/div', val: '10 mV/div to 10 V/div', cond: '1-2-5 precision steps' },
          { param: 'Horizontal Timebase Range', symbol: 's/div', val: '10 µs/div to 500 ms/div', cond: 'Internal precision crystal' },
          { param: 'Input Impedance / Shunt', symbol: 'Z_in', val: '1 MΩ ± 1% || 15 pF', cond: 'Minimal circuit loading' }
        ];
        spec.formulas = [
          {
            highlight: 'f_s ≥ 2 · f_max',
            name: "Nyquist-Shannon Sampling Theorem",
            desc: "Ensures analog signal waveforms are digitized and reconstructed without aliasing errors."
          }
        ];
        break;
      }
      case 'fuse': {
        const rating = comp.state.ratingAmps !== undefined ? comp.state.ratingAmps : 2.0;
        spec.name = `Miniature Cartridge Fuse (${rating >= 1 ? rating.toFixed(1) : rating.toFixed(2)}A)`;
        spec.category = 'OVERCURRENT CIRCUIT PROTECTION';
        spec.iec = 'IEC 60127-2';
        spec.icon = '🛡️';
        spec.ratings = [
          { param: 'Rated Continuous Current (I_n)', symbol: 'I_n', val: `${rating >= 1 ? rating.toFixed(1) : rating.toFixed(2)} A`, cond: 'Normal continuous conduction' },
          { param: 'Rated Voltage Withstand', symbol: 'V_rated', val: '250 V AC / DC', cond: 'Arc quench capability' },
          { param: 'Interrupting / Breaking Capacity', symbol: 'I_break', val: '35 A @ 250 V AC', cond: 'Short circuit clearing' },
          { param: 'Melting Integral (I²t)', symbol: 'I²t', val: `${(rating * rating * 1.1).toFixed(2)} A²s`, cond: 'Thermal energy to blow' }
        ];
        spec.formulas = [
          {
            highlight: 'I²t = ∫ i²(t) dt',
            name: "Joule Thermal Melting Energy",
            desc: "When thermal energy exceeds the link threshold, the low-melting alloy vaporizes, safely interrupting fault current."
          }
        ];
        break;
      }
      case 'ldr': {
        spec.name = 'Cadmium Sulfide (CdS) Photoresistor / LDR';
        spec.category = 'PHOTOELECTRIC OPTOELECTRONIC';
        spec.iec = 'IEC 60747-5';
        spec.icon = '☀️';
        spec.ratings = [
          { param: 'Dark Resistance (0 Lux)', symbol: 'R_dark', val: '~1.0 MΩ (1000 kΩ)', cond: 'Complete darkness' },
          { param: 'Light Resistance (100 Lux)', symbol: 'R_light', val: '~400 Ω', cond: 'Direct daylight illumination' },
          { param: 'Current Operating Resistance', symbol: 'R_cur', val: window.formatResistance(comp.state.resistance || 10000), cond: `@ ${comp.state.ambientLux || comp.state.lux || 0} Lux` },
          { param: 'Peak Spectral Sensitivity', symbol: 'λ_peak', val: '540 nm (Green-Yellow)', cond: 'Matches human eye curve' }
        ];
        spec.formulas = [
          {
            highlight: 'R = R_dark · (E_lux)^(-γ)',
            name: "Photo-Conductivity Law",
            desc: "Incident photons promote electrons across semiconductor bandgap into conduction band, slashing electrical resistance."
          }
        ];
        break;
      }
      case 'switch':
      case 'twowayswitch':
      case 'pushbutton': {
        spec.name = comp.type === 'twowayswitch' ? 'Single Pole Double Throw Switch (SPDT)' : (comp.type === 'pushbutton' ? 'Momentary Tactile Pushbutton (NO)' : 'Single Pole Single Throw Switch (SPST)');
        spec.category = 'MECHANICAL SWITCHING';
        spec.iec = 'IEC 61058-1';
        spec.icon = '🔘';
        spec.ratings = [
          { param: 'Rated Working Voltage', symbol: 'V_max', val: '250 V AC / 30 V DC', cond: 'Continuous operation' },
          { param: 'Rated Continuous Contact Current', symbol: 'I_max', val: '5.0 A (Resistive load)', cond: 'Contact thermal limit' },
          { param: 'Contact Initial Resistance', symbol: 'R_cont', val: '≤ 20 mΩ (0.02 Ω)', cond: 'Solid silver-plated contacts' }
        ];
        spec.formulas = [
          {
            highlight: 'V_closed = I · R_contact ≈ 0 V',
            name: "Zero Contact Drop Condition",
            desc: "In closed state, ideal switch provides an unobstructed path with negligible milliohm impedance."
          }
        ];
        break;
      }
      case 'buzzer': {
        spec.name = 'Piezoelectric Electronic Audio Transducer';
        spec.category = 'ACOUSTIC ELECTROMECHANICAL';
        spec.iec = 'IEC 60651';
        spec.icon = '🔔';
        spec.ratings = [
          { param: 'Nominal Operating Voltage', symbol: 'V_nom', val: '5.0 V DC (Range 3V - 12V)', cond: 'Optimal acoustic output' },
          { param: 'Resonant Acoustic Frequency', symbol: 'f_res', val: '2,400 Hz ± 300 Hz', cond: 'High-pitch alert tone' },
          { param: 'Sound Pressure Level (SPL)', symbol: 'SPL', val: '≥ 85 dB(A)', cond: '@ 10 cm, 5V DC' }
        ];
        spec.formulas = [
          {
            highlight: 'd = d₃₃ · V_applied',
            name: "Converse Piezoelectric Effect",
            desc: "Applied voltage induces mechanical stress in the piezoceramic disc, flexing a metal diaphragm to generate acoustic pressure waves."
          }
        ];
        break;
      }
      case 'ammeter': {
        spec.name = 'Precision Analog / Digital Bench Ammeter';
        spec.category = 'ELECTRICAL CURRENT METER';
        spec.iec = 'IEC 61010-1 CAT II';
        spec.icon = '🅰️';
        spec.ratings = [
          { param: 'Measurement Current Range', symbol: 'I_range', val: '0.00 A to 10.00 A', cond: 'AC RMS or DC selection' },
          { param: 'Internal Current Shunt', symbol: 'R_shunt', val: '0.010 Ω (10 mΩ)', cond: 'Ultra-low burden resistance' },
          { param: 'Maximum Continuous Current', symbol: 'I_max', val: '10.0 A', cond: 'Internal fast fuse protected' }
        ];
        spec.formulas = [
          {
            highlight: 'V_shunt = I_circuit · R_shunt',
            name: "Precision Shunt Voltage Drop",
            desc: "Measures current in series by sensing microvolt drop across a known low-resistance precision shunt."
          }
        ];
        break;
      }
      case 'voltmeter': {
        spec.name = 'High-Impedance Digital Voltmeter';
        spec.category = 'ELECTRICAL POTENTIAL METER';
        spec.iec = 'IEC 61010-1 CAT II';
        spec.icon = '🅅';
        spec.ratings = [
          { param: 'Voltage Measurement Range', symbol: 'V_range', val: '0.00 V to 1000 V DC/AC', cond: 'Autoranging' },
          { param: 'Input Shunt Impedance', symbol: 'R_in', val: '10 MΩ (Megaohms)', cond: 'Near-zero circuit loading' }
        ];
        spec.formulas = [
          {
            highlight: 'I_meter = V_node / R_in ≈ 0 A',
            name: "High-Z Voltage Sensing",
            desc: "Connected in parallel across any two circuit nodes to measure potential difference without drawing significant current."
          }
        ];
        break;
      }
      default: {
        spec.name = def.name || comp.type.toUpperCase();
        spec.category = (def.category || 'Circuit Element').toUpperCase();
        spec.iec = 'IEC Standard';
        spec.icon = '⚙️';
        spec.ratings = [
          { param: 'Rated Voltage', symbol: 'V_rated', val: `${def.voltage || 12} V`, cond: 'Nominal design value' },
          { param: 'Max Voltage', symbol: 'V_max', val: `${def.maxVoltage || 18} V`, cond: 'Safe operating limit' }
        ];
        spec.formulas = [
          {
            highlight: 'V = I · R',
            name: "Ohm's & Kirchhoff's Laws",
            desc: "Governed by fundamental laws of circuit analysis."
          }
        ];
      }
    }

    return spec;
  }

  removeComponent(compId, recordHistory = true) {
    if (recordHistory) {
      this.pushHistory();
    }
    this.components = this.components.filter(c => c.id !== compId);
    const removedWireIds = new Set(this.wires.filter(w => w.fromComp === compId || w.toComp === compId).map(w => w.id));
    this.wires = this.wires.filter(w =>
      w.fromComp !== compId &&
      w.toComp !== compId &&
      !(typeof w.fromComp === 'string' && w.fromComp.startsWith('wire:') && removedWireIds.has(w.fromComp.slice(5))) &&
      !(typeof w.toComp === 'string' && w.toComp.startsWith('wire:') && removedWireIds.has(w.toComp.slice(5)))
    );

    const el = document.getElementById(`node-${compId}`);
    if (el) el.remove();

    this.selectedComponent = null;
    this.hideCharacterSpeechBubble();
    this.updateTopbarComponentPill(null);
    this.dom.inspectorCard.style.display = 'none';

    window.sounds.playDisconnect();
    this.evaluateCircuit();
    this.renderWires();
  }

  // ─── Trash Drop Zone Helpers ────────────────────────────────────────────────

  /** Show the trash bin while a component is being dragged */
  showTrashZone() {
    if (this.dom.trashDropZone) {
      this.dom.trashDropZone.classList.add('drag-active');
    }
  }

  /** Hide the trash bin after drag ends */
  hideTrashZone() {
    if (this.dom.trashDropZone) {
      this.dom.trashDropZone.classList.remove('drag-active', 'drag-over');
    }
  }

  /** Check if client coordinates are over the trash zone */
  isOverTrashZone(clientX, clientY) {
    if (!this.dom.trashDropZone) return false;
    const rect = this.dom.trashDropZone.getBoundingClientRect();
    const pad = 24;
    const pointerIn = (clientX >= rect.left - pad && clientX <= rect.right + pad &&
                       clientY >= rect.top - pad && clientY <= rect.bottom + pad);
    if (pointerIn) return true;

    if (this.compDrag && this.compDrag.comp) {
      const compEl = document.getElementById('node-' + this.compDrag.comp.id);
      if (compEl) {
        const cRect = compEl.getBoundingClientRect();
        const overlaps = !(cRect.right < rect.left - pad || cRect.left > rect.right + pad ||
                           cRect.bottom < rect.top - pad || cRect.top > rect.bottom + pad);
        if (overlaps) return true;
      }
    }
    return false;
  }

  /** Update trash hover highlight based on current pointer position */
  updateTrashHover(clientX, clientY) {
    if (!this.dom.trashDropZone || !this.compDrag) return;
    if (this.isOverTrashZone(clientX, clientY)) {
      this.dom.trashDropZone.classList.add('drag-over');
    } else {
      this.dom.trashDropZone.classList.remove('drag-over');
    }
  }

  cancelWireDrag() {
    if (this.wireDrag) {
      this.dom.tempWirePath.style.display = 'none';
      const junc = document.getElementById('temp-junction-preview');
      if (junc) junc.style.display = 'none';
      document.querySelectorAll('.terminal-pin').forEach(p => {
        p.classList.remove('active-source');
        p.classList.remove('snap-target');
      });
      this.wireDrag = null;
    }
  }

  // Wires, Flexible Freeform Drawing & Drag-and-Drop / Click-to-Connect
  startWireDrag(compId, pinId, e) {
    // If click-to-connect is already waiting from a first pin:
    if (this.wireDrag) {
      if (this.wireDrag.fromComp === compId && this.wireDrag.fromPin === pinId) {
        this.cancelWireDrag();
        return;
      }
      this.addWire(
        this.wireDrag.fromComp,
        this.wireDrag.fromPin,
        compId,
        pinId,
        this.activeWireColor,
        this.wireDrag.points
      );
      this.cancelWireDrag();
      return;
    }

    const coords = this.getEventStageCoords(e);
    this.wireDrag = {
      fromComp: compId,
      fromPin: pinId,
      startX: coords.x,
      startY: coords.y,
      points: [],
      hasMoved: false
    };

    document.querySelectorAll('.terminal-pin').forEach(p => p.classList.remove('active-source'));
    const pinEl = document.getElementById(`pin-${compId}-${pinId}`);
    if (pinEl) pinEl.classList.add('active-source');
  }

  startReconnectDrag(wire, endpoint, e) {
    const coords = this.getEventStageCoords(e);
    const p1 = this.getPinAbsolutePos(wire.fromComp, wire.fromPin, wire, true);
    const p2 = this.getPinAbsolutePos(wire.toComp, wire.toPin, wire, false);
    const fixedPos = endpoint === 'from' ? p2 : p1;

    this.reconnectDrag = {
      wire,
      endpoint,
      fixedPos,
      startX: coords.x,
      startY: coords.y,
      startSnapshot: this.takeSnapshot(),
      points: wire.points ? [...wire.points] : []
    };

    // Temporarily hide wire path group while dragging endpoint
    const g = document.querySelector(`[data-wire-id="${wire.id}"]`);
    if (g) g.style.opacity = '0.35';

    const curve = this.generateSmoothPath(fixedPos, this.reconnectDrag.points, coords);
    this.dom.tempWirePath.setAttribute('d', curve);
    this.dom.tempWirePath.style.display = 'block';
  }

  getPinAbsolutePos(compId, pinId, wire = null, isFrom = true) {
    if (compId && typeof compId === 'string' && compId.startsWith('wire:')) {
      if (wire) {
        const pt = isFrom ? wire.fromPoint : wire.toPoint;
        if (pt) return { x: pt.x, y: pt.y };
      }
      return { x: 300, y: 200 };
    }

    if (compId === 'multimeter_tool') {
      const pinEl = document.getElementById(`pin-mm-${pinId}`);
      if (pinEl && this.dom.stage) {
        const rect = pinEl.getBoundingClientRect();
        const sRect = this.dom.stage.getBoundingClientRect();
        return {
          x: Math.round(rect.left + rect.width / 2 - sRect.left),
          y: Math.round(rect.top + rect.height / 2 - sRect.top)
        };
      }
      return { x: 700, y: 150 };
    }

    const comp = this.components.find(c => c.id === compId);
    if (!comp) return { x: 0, y: 0 };
    const pin = comp.terminals.find(t => t.id === pinId);
    if (!pin) return { x: comp.x, y: comp.y };

    const def = window.COMPONENT_DEFINITIONS[comp.type] || { width: 100, height: 60 };
    const rot = (comp.rotation || 0) % 360;
    const scale = comp.scale !== undefined ? comp.scale : 1.0;
    const cx = comp.x + def.width / 2;
    const cy = comp.y + def.height / 2;
    const dx = (pin.x - def.width / 2) * scale;
    const dy = (pin.y - def.height / 2) * scale;

    if (rot === 0) {
      return {
        x: Math.round(cx + dx),
        y: Math.round(cy + dy)
      };
    }

    const angleRad = (rot * Math.PI) / 180;
    const rx = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
    const ry = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

    return {
      x: Math.round(cx + rx),
      y: Math.round(cy + ry)
    };
  }

  findPinNear(stageX, stageY, radius = 35, ignoreCompId = null, ignorePinId = null) {
    let closest = null;
    let minDistance = radius;
    for (const comp of this.components) {
      for (const pin of comp.terminals) {
        if (ignoreCompId && comp.id === ignoreCompId && pin.id === ignorePinId) continue;
        const pos = this.getPinAbsolutePos(comp.id, pin.id);
        const dist = Math.hypot(stageX - pos.x, stageY - pos.y);
        if (dist <= minDistance) {
          minDistance = dist;
          closest = { comp, pin, pos, dist };
        }
      }
    }

    // Multimeter Tool Jacks Snap Support
    if (this.multimeterActive) {
      ['vin', 'com'].forEach(pid => {
        if (ignoreCompId === 'multimeter_tool' && ignorePinId === pid) return;
        const pos = this.getPinAbsolutePos('multimeter_tool', pid);
        const dist = Math.hypot(stageX - pos.x, stageY - pos.y);
        if (dist <= minDistance) {
          minDistance = dist;
          closest = {
            comp: { id: 'multimeter_tool', type: 'multimeter', name: 'Digital Multimeter', terminals: [{ id: 'vin' }, { id: 'com' }] },
            pin: { id: pid, polarity: pid === 'vin' ? 'pos' : 'neg' },
            pos,
            dist
          };
        }
      });
    }

    return closest;
  }

  // Find nearest point on existing wire paths to allow connecting / jointing wires at any point!
  findWireNear(stageX, stageY, radius = 22, ignoreWireId = null) {
    let closest = null;
    let minDistance = radius;

    for (const wire of this.wires) {
      if (ignoreWireId && wire.id === ignoreWireId) continue;
      const pathEl = document.getElementById(`svg-path-${wire.id}`);
      if (!pathEl || !pathEl.getTotalLength) continue;

      const totalLen = pathEl.getTotalLength();
      if (totalLen <= 0) continue;

      const steps = Math.max(8, Math.floor(totalLen / 10));
      for (let i = 0; i <= steps; i++) {
        const distLen = (i / steps) * totalLen;
        const pt = pathEl.getPointAtLength(distLen);
        const d = Math.hypot(stageX - pt.x, stageY - pt.y);
        if (d < minDistance) {
          minDistance = d;
          closest = {
            wire,
            point: { x: Math.round(pt.x), y: Math.round(pt.y) },
            dist: d
          };
        }
      }
    }

    return closest;
  }

  addWire(fromComp, fromPin, toComp, toPin, color, points = [], targetPoint = null) {
    // Prevent duplicate wires between same pins
    const exists = this.wires.some(w =>
      (w.fromComp === fromComp && w.fromPin === fromPin && w.toComp === toComp && w.toPin === toPin) ||
      (w.fromComp === toComp && w.fromPin === toPin && w.toComp === fromComp && w.toPin === fromPin)
    );

    if (exists) return;
    if (fromComp === toComp && fromPin === toPin && (typeof fromComp !== 'string' || !fromComp.startsWith('wire:'))) return;

    this.pushHistory();

    const wire = {
      id: `wire_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fromComp,
      fromPin,
      toComp,
      toPin,
      color: color || this.activeWireColor,
      points: points ? [...points] : []
    };

    if (targetPoint) {
      if (toComp && typeof toComp === 'string' && toComp.startsWith('wire:')) {
        wire.toPoint = { x: targetPoint.x, y: targetPoint.y };
      }
      if (fromComp && typeof fromComp === 'string' && fromComp.startsWith('wire:')) {
        wire.fromPoint = { x: targetPoint.x, y: targetPoint.y };
      }
    }

    this.wires.push(wire);
    window.sounds.playConnect();
    this.renderWires();
    this.evaluateCircuit();
  }

  removeWire(wireId) {
    this.pushHistory();
    const juncKey = `wire:${wireId}`;
    this.wires = this.wires.filter(w => w.id !== wireId && w.fromComp !== juncKey && w.toComp !== juncKey);
    window.sounds.playDisconnect();
    this.evaluateCircuit();
    this.renderWires();
  }

  generateBezierPath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const sag = Math.min(60, Math.max(15, dist * 0.18));

    const cx1 = x1 + dx * 0.25;
    const cy1 = y1 + dy * 0.25 + sag;
    const cx2 = x1 + dx * 0.75;
    const cy2 = y1 + dy * 0.75 + sag;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  }

  // Smooth continuous flexible spline through multi-point curves
  generateSmoothPath(p1, points, p2) {
    if (!points || points.length === 0) {
      return this.generateBezierPath(p1.x, p1.y, p2.x, p2.y);
    }

    const all = [p1, ...points, p2];
    let d = `M ${all[0].x} ${all[0].y}`;

    for (let i = 0; i < all.length - 1; i++) {
      const pCurrent = all[i];
      const pNext = all[i + 1];
      const midX = (pCurrent.x + pNext.x) / 2;
      const midY = (pCurrent.y + pNext.y) / 2;
      d += ` Q ${pCurrent.x} ${pCurrent.y}, ${midX} ${midY}`;
    }

    const last = all[all.length - 1];
    d += ` L ${last.x} ${last.y}`;
    return d;
  }

  renderWires() {
    if (!this.dom || !this.dom.wiresGroup) return;
    this.dom.wiresGroup.innerHTML = '';

    for (const wire of this.wires) {
      const p1 = this.getPinAbsolutePos(wire.fromComp, wire.fromPin, wire, true);
      const p2 = this.getPinAbsolutePos(wire.toComp, wire.toPin, wire, false);
      const d = this.generateSmoothPath(p1, wire.points, p2);

      // Glow background path for powered wires
      const isCurrentActive = this.solver.status.wireCurrents.has(wire.id);

      const pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      pathGroup.dataset.wireId = wire.id;
      pathGroup.setAttribute('class', 'wire-group');

      if (isCurrentActive) {
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', d);
        glowPath.setAttribute('stroke', wire.color);
        glowPath.setAttribute('stroke-width', '8');
        glowPath.setAttribute('stroke-opacity', '0.35');
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('filter', 'url(#neon-glow)');
        pathGroup.appendChild(glowPath);
      }

      // Main Wire Path
      const wireData = this.solver.status.wireCurrents ? this.solver.status.wireCurrents.get(wire.id) : null;
      const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      mainPath.setAttribute('d', d);
      mainPath.setAttribute('stroke', wire.color);

      // Wire Current Beam Scaling (Ohm's Law & KCL)
      const curAmp = wireData ? (wireData.current || 0) : 0;
      const strokeW = Math.max(3.2, Math.min(6.5, 3.2 + curAmp * 22));
      mainPath.setAttribute('stroke-width', strokeW.toFixed(1));
      mainPath.setAttribute('fill', 'none');
      mainPath.setAttribute('class', 'wire-path');
      mainPath.id = `svg-path-${wire.id}`;

      if (wireData && wireData.active) {
        if (curAmp >= 0.08) mainPath.classList.add('wire-high-current');
        else if (curAmp >= 0.025) mainPath.classList.add('wire-medium-current');
        else mainPath.classList.add('wire-low-current');
      }

      // Check if wire belongs to short circuit fault path
      if (this.solver && this.solver.status && this.solver.status.shortCircuitWires && this.solver.status.shortCircuitWires.has(wire.id)) {
        mainPath.classList.add('short-circuit-blink');
      }

      // Calculate wire midpoint for delete button handle
      let midX = (p1.x + p2.x) / 2;
      let midY = (p1.y + p2.y) / 2;
      if (wire.points && wire.points.length > 0) {
        const midIdx = Math.floor(wire.points.length / 2);
        midX = wire.points[midIdx].x;
        midY = wire.points[midIdx].y;
      }

      // Invisible wide hit path for effortless clicking on wire
      const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hitPath.setAttribute('d', d);
      hitPath.setAttribute('class', 'wire-hit-path');
      hitPath.setAttribute('title', 'Click with mouse to delete this wire');

      const handleWireDelete = (e) => {
        // While user is drawing or dragging, DO NOT delete wires!
        if (this.wireDrag || this.reconnectDrag || this.compDrag) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.removeWire(wire.id);
      };

      hitPath.addEventListener('click', handleWireDelete);
      hitPath.addEventListener('contextmenu', handleWireDelete);

      mainPath.addEventListener('click', handleWireDelete);
      mainPath.addEventListener('contextmenu', handleWireDelete);

      pathGroup.appendChild(hitPath);
      pathGroup.appendChild(mainPath);

      // Midpoint wire delete button (✕)
      const delBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      delBtn.setAttribute('class', 'wire-delete-btn');
      delBtn.setAttribute('transform', `translate(${midX}, ${midY})`);
      delBtn.setAttribute('title', 'Click to delete this wire connection');
      delBtn.innerHTML = `
        <circle cx="0" cy="0" r="10.5"/>
        <text x="0" y="3.8" text-anchor="middle">✕</text>
      `;
      delBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.removeWire(wire.id);
      });
      pathGroup.appendChild(delBtn);

      // Solder Junction Nodes (displayed whenever wire connects to another wire!)
      if (wire.fromComp && typeof wire.fromComp === 'string' && wire.fromComp.startsWith('wire:')) {
        const junc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        junc.setAttribute('cx', p1.x);
        junc.setAttribute('cy', p1.y);
        junc.setAttribute('r', '5.5');
        junc.setAttribute('class', 'wire-junction-node');
        junc.setAttribute('title', 'Solder Junction Node');
        pathGroup.appendChild(junc);
      }
      if (wire.toComp && typeof wire.toComp === 'string' && wire.toComp.startsWith('wire:')) {
        const junc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        junc.setAttribute('cx', p2.x);
        junc.setAttribute('cy', p2.y);
        junc.setAttribute('r', '5.5');
        junc.setAttribute('class', 'wire-junction-node');
        junc.setAttribute('title', 'Solder Junction Node');
        pathGroup.appendChild(junc);
      }

      // Interactive Wire Endpoint Grab Handles (Click and drag to reconnect or disconnect!)
      const handleFrom = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      handleFrom.setAttribute('cx', p1.x);
      handleFrom.setAttribute('cy', p1.y);
      handleFrom.setAttribute('r', '6');
      handleFrom.setAttribute('class', 'wire-endpoint-handle');
      handleFrom.setAttribute('title', 'Drag to reconnect or drag away to disconnect wire');
      handleFrom.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.startReconnectDrag(wire, 'from', e);
      });
      handleFrom.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.panDrag) this.panDrag = null;
        this.startReconnectDrag(wire, 'from', e);
      }, { passive: false });
      pathGroup.appendChild(handleFrom);

      const handleTo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      handleTo.setAttribute('cx', p2.x);
      handleTo.setAttribute('cy', p2.y);
      handleTo.setAttribute('r', '6');
      handleTo.setAttribute('class', 'wire-endpoint-handle');
      handleTo.setAttribute('title', 'Drag to reconnect or drag away to disconnect wire');
      handleTo.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.startReconnectDrag(wire, 'to', e);
      });
      handleTo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.panDrag) this.panDrag = null;
        this.startReconnectDrag(wire, 'to', e);
      }, { passive: false });
      pathGroup.appendChild(handleTo);

      this.dom.wiresGroup.appendChild(pathGroup);
    }

    // Kirchhoff's Current Law (KCL): Live Solder Junction Badges (I_in = I_1 + I_2)
    if (this.solver.status && this.solver.status.junctionNodes && this.solver.status.junctionNodes.length > 0) {
      for (const junc of this.solver.status.junctionNodes) {
        if (!junc.branches || junc.branches.length < 2 || (junc.totalIn || 0) <= 0.0001) continue;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'wire-kcl-badge');
        g.setAttribute('transform', `translate(${junc.x}, ${junc.y - 20})`);

        const totalInMa = (junc.totalIn * 1000).toFixed(0);
        const branchParts = junc.branches.map(b => (b.current * 1000).toFixed(0) + 'mA').join(' + ');
        const textStr = `KCL: ${totalInMa}mA ➔ ${branchParts}`;

        const textLen = Math.max(120, textStr.length * 6.5 + 16);
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -textLen / 2);
        rect.setAttribute('y', -10);
        rect.setAttribute('width', textLen);
        rect.setAttribute('height', 20);
        rect.setAttribute('class', 'wire-kcl-badge-bg');

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', '0');
        txt.setAttribute('y', '0');
        txt.setAttribute('class', 'wire-kcl-badge-text');
        txt.textContent = textStr;

        g.appendChild(rect);
        g.appendChild(txt);
        this.dom.wiresGroup.appendChild(g);
      }
    }
  }

  evaluateCircuit() {
    this.solver.setElements(this.components, this.wires);
    const status = this.solver.solve();

    // Update Visual State of each component
    for (const comp of this.components) {
      this.updateComponentVisual(comp);
    }

    // Audio Feedback for Motors, Pulsing Buzzer & Sparks
    const activeMotor = this.components.find(c => c.type === 'motor' && c.state.powered && (c.state.rpm || 0) > 0 && !c.state.burnt);
    const motorRpm = activeMotor ? (activeMotor.state.rpm || 0) : 0;
    const motorSpeed = activeMotor ? Math.min(1.0, Math.max(0.01, motorRpm / 12000)) : 0;
    window.sounds.setMotorState(!!activeMotor && motorRpm > 0, motorSpeed);

    const activeBuzzers = this.components.filter(c => c.type === 'buzzer' && c.state.powered && c.state.sounding && !c.state.burnt);
    const maxBuzzerV = activeBuzzers.reduce((max, b) => Math.max(max, b.state.voltageDrop || 0), 0);
    window.sounds.setBuzzerState(activeBuzzers.length > 0, maxBuzzerV);

    // Audio Feedback for Arbitrary Function Generator Tone Synthesis
    const activeFG = this.components.find(c => c.type === 'function_generator' && c.state.outputEnabled !== false && (c.state.audioEnabled || (c.state.actualCurrent && c.state.actualCurrent > 0.0001)));
    if (activeFG && window.sounds && typeof window.sounds.updateFunctionGeneratorTone === 'function') {
      const f = activeFG.state.frequency !== undefined ? activeFG.state.frequency : 1000;
      const wave = activeFG.state.waveform || 'sine';
      const amp = activeFG.state.amplitudeVpp !== undefined ? activeFG.state.amplitudeVpp : 5.0;
      window.sounds.updateFunctionGeneratorTone(f, wave, amp, true);
    } else if (window.sounds && typeof window.sounds.stopFunctionGeneratorTone === 'function') {
      window.sounds.stopFunctionGeneratorTone();
    }

    if (status.isShortCircuit) {
      window.sounds.playSpark();
      // Display short circuit hazard banner in open free place (top center header)
      if (this.dom && this.dom.shortHazardBanner) {
        this.dom.shortHazardBanner.style.display = 'flex';
      }
      // Dramatic vision of short circuit: perimeter warning strobe + electric sparks
      if (this.dom && this.dom.stage) this.dom.stage.classList.add('stage-short-circuit-active');
      this.renderShortCircuitSparks(status);
    } else {
      if (this.dom && this.dom.shortHazardBanner) {
        this.dom.shortHazardBanner.style.display = 'none';
      }
      if (this.dom && this.dom.stage) this.dom.stage.classList.remove('stage-short-circuit-active');
      this.clearShortCircuitSparks();
    }

    // Check for component burn candidates
    const candidate = this.components.find(c => c.state.candidateBurn && !c.state.burning && !c.state.burnt);
    if (candidate) {
      this.triggerComponentBurn(candidate, candidate.state.burnReason);
    }

    // Update Ribbon Status Display
    this.updateStatusRibbon(status);

    // Live update open Technical Specifications Modal telemetry
    if (this.techSpecsComp && this.dom && this.dom.techSpecsModal && this.dom.techSpecsModal.style.display !== 'none') {
      this.updateTechnicalSpecificationsModal();
    }

    // Re-render wire glow
    this.renderWires();

    // Multimeter & Ohm's Law Calculator Update
    this.updateMultimeter();
    this.updateOhmsCalcWindow();

    // Update Topbar Lifted Component Inspector with latest live physics metrics
    this.updateTopbarComponentPill(this.selectedComponent);

    // Checklist & Win Condition Verification
    this.updateChecklist();
    if (!status.circuitFailed) {
      this.checkWinCondition(status);
    }
  }

  triggerComponentBurn(comp, reason) {
    comp.state.burning = true;
    comp.state.crying = true;
    delete comp.state.candidateBurn;

    const nodeEl = document.getElementById(`node-${comp.id}`);
    if (nodeEl) {
      nodeEl.classList.add('is-burning');
      nodeEl.classList.add('character-crying-shake');
    }

    this.updateComponentVisual(comp);

    const profile = window.CHARACTER_PROFILES ? window.CHARACTER_PROFILES[comp.type] : null;
    const def = window.COMPONENT_DEFINITIONS[comp.type];
    const charNick = profile ? profile.nick.toUpperCase() : def.name.toUpperCase();
    const cryText = comp.state.cryDialogue || (profile ? profile.dialogues.cryingWarning : reason);

    // Show crying speech bubble right above the weeping character!
    this.showCharacterSpeechBubble(comp, cryText, 'crying', true);

    // Play panic crying audio
    window.sounds.playCry();

    this.dom.burnToastTitle.textContent = `😭 ${charNick} IS CRYING! OVERVOLTAGE HAZARD!`;
    this.dom.burnToastDesc.textContent = cryText;
    this.dom.burnProgressBar.style.transition = 'none';
    this.dom.burnProgressBar.style.width = '100%';

    this.dom.burnToast.style.display = 'flex';

    setTimeout(() => {
      this.dom.burnProgressBar.style.transition = 'width 2.8s linear';
      this.dom.burnProgressBar.style.width = '0%';
    }, 50);

    // Give children time (~2.9s) to watch the crying tears, burning flames, smoke, and sparks!
    setTimeout(() => {
      comp.state.burning = false;
      comp.state.crying = false;
      comp.state.burnt = true;
      if (nodeEl) {
        nodeEl.classList.remove('is-burning');
        nodeEl.classList.remove('character-crying-shake');
      }
      this.dom.burnToast.style.display = 'none';

      window.sounds.playBurn();

      const deathText = (profile && profile.dialogues.burningDeath) || "PO-P-PING! I have burned to ashes! 💥";
      this.showCharacterSpeechBubble(comp, deathText, 'burnt', true);

      this.updateComponentVisual(comp);
      this.showInspector(comp);
      this.evaluateCircuit();

      // Show Failure Modal explaining why circuit failed
      this.showFailureModal(comp, reason);
    }, 2900);
  }

  showFailureModal(comp, reason, diagnostic = null) {
    let diag = diagnostic || (comp && comp.state && comp.state.faultDiagnostic) || this.solver.status.faultDiagnostic;
    if (!diag) {
      diag = this.solver.diagnoseCircuitFault(this.components, this.wires, (this.mode === 'curriculum') ? window.GAME_LEVELS[this.currentLevelIndex] : null);
    }

    const level = (this.mode === 'curriculum') ? window.GAME_LEVELS[this.currentLevelIndex] : null;

    // Header & Culprit
    if (this.dom.faultIcon) {
      this.dom.faultIcon.textContent = (diag && diag.faultType === 'SHORT_CIRCUIT') ? '⚠️' : '💥';
    }
    if (this.dom.faultCulpritPill) {
      this.dom.faultCulpritPill.textContent = diag ? (diag.culprit || 'CIRCUIT FAULT') : (comp ? (comp.name || comp.type) : 'CIRCUIT FAULT');
    }
    if (this.dom.faultModalTitle) {
      this.dom.faultModalTitle.textContent = diag ? (diag.title || 'CIRCUIT FAILED!') : 'CIRCUIT FAILED!';
    }
    if (this.dom.faultSubtitle) {
      this.dom.faultSubtitle.textContent = diag ? `Fault Type: ${diag.faultType}` : 'Component Breakdown & Electrical Engineering Diagnostic';
    }

    // 1. Identified Fault
    if (this.dom.faultReasonText) {
      this.dom.faultReasonText.textContent = reason || (diag ? diag.whyHappened : 'An electrical breakdown or loop failure was detected.');
    }

    // 2. Why This Happened (Physics & Electron Drift)
    if (this.dom.faultWhyText) {
      this.dom.faultWhyText.textContent = diag ? diag.whyHappened : (reason || 'Excessive electrical energy was dissipated beyond rated thresholds.');
    }

    // 3. Recommended Step-by-Step Remedy
    if (this.dom.faultRemedyText) {
      this.dom.faultRemedyText.textContent = diag ? diag.remedy : 'Inspect your connections, verify component polarities, and ensure appropriate current-limiting resistance is present.';
    }

    // 4. Electrical Principle & Equation
    if (this.dom.faultPrincipleTitle) {
      this.dom.faultPrincipleTitle.textContent = diag ? diag.electricalPrinciple : "Ohm's Law & Kirchhoff's Circuit Laws";
    }
    if (this.dom.faultEquationBadge) {
      this.dom.faultEquationBadge.textContent = diag ? diag.equation : 'I = V / R | P = V × I';
    }



    if (this.dom.btnReplaceFailedComp) {
      this.dom.btnReplaceFailedComp.onclick = () => {
        this.dom.failureModal.style.display = 'none';
        if (comp) {
          this.repairBurntComponent(comp.id);
        } else {
          for (const c of this.components) {
            if (c.state && (c.state.burnt || c.state.burning)) {
              this.repairBurntComponent(c.id);
            }
          }
        }
        this.evaluateCircuit();
      };
    }

    if (this.dom.btnCloseFailureModal) {
      this.dom.btnCloseFailureModal.onclick = () => {
        this.dom.failureModal.style.display = 'none';
      };
    }

    this.dom.failureModal.style.display = 'flex';
  }



  updateStatusRibbon(status) {
    const dot = this.dom.statusDot;
    const headline = this.dom.statusHeadline;
    const detail = this.dom.statusDetail;
    const ribbon = this.dom.statusRibbon;
    const voltage = this.dom.statusVoltage;
    if (!dot || !ribbon) return;

    dot.className = 'status-indicator-dot';
    ribbon.className = 'circuit-status-ribbon';

    const hasBurnt = this.components.some(c => c.state.burnt);

    if (status.isShortCircuit) {
      dot.classList.add('short');
      ribbon.classList.add('danger');
      headline.textContent = '⚠️ Short Circuit Detected!';
      detail.textContent = 'High current loop with no load! Protect components.';
      voltage.textContent = '0.0 V (OVERLOAD)';
    } else if (status.circuitFailed || hasBurnt) {
      dot.classList.add('short');
      ribbon.classList.add('danger');
      headline.textContent = '💥 Circuit Failed!';
      detail.textContent = status.failureReason || 'Component burned out due to overvoltage / overcurrent. Click Replace to repair.';
      voltage.textContent = `${(status.totalVoltage || 9.0).toFixed(1)} V (FAIL)`;
    } else if (status.isComplete) {
      dot.classList.add('closed');
      ribbon.classList.add('good');

      const v = status.totalVoltage || 9.0;
      const dso = this.components.find(c => c.type === 'oscilloscope');
      const fg = this.components.find(c => c.type === 'function_generator');
      const s1 = dso ? (dso.state.ch1 || dso.state.ch1Signal) : null;
      const s2 = dso ? (dso.state.ch2 || dso.state.ch2Signal) : null;
      const actSig = (s1 && s1.type !== 'none') ? s1 : ((s2 && s2.type !== 'none') ? s2 : null);

      if (dso && fg && actSig) {
        const fStr = actSig.freq >= 1000 ? `${(actSig.freq / 1000).toFixed(2)} kHz` : `${(actSig.freq || 0).toFixed(0)} Hz`;
        headline.textContent = `⚡ Instrument Active: ${actSig.type.toUpperCase()} Wave (${fStr}, ${actSig.vpp.toFixed(2)} Vpp)`;
        detail.textContent = `Function Generator signal captured by Digital Storage Oscilloscope (1 MΩ high-Z probe sensing loop).`;
        voltage.textContent = `${(actSig.vrms || v).toFixed(2)} V RMS`;
      } else {
        headline.textContent = '⚡ Closed Circuit — Power Flowing!';
        detail.textContent = `${status.activeComponents.size} components energized. (${v.toFixed(1)}V System)`;
        voltage.textContent = `${v.toFixed(1)} V`;
      }
    } else {
      dot.classList.add('open');
      headline.textContent = 'Open Circuit (Incomplete)';

      // Check if reverse biased diode/led is blocking
      const reversed = this.components.find(c => c.state.reversed);
      if (reversed) {
        detail.textContent = `${reversed.type.toUpperCase()} is reverse biased! Switch terminals to allow flow.`;
      } else {
        detail.textContent = 'Connect positive and negative terminals to form a continuous loop.';
      }
      voltage.textContent = '0.0 V';
    }
  }

  checkWinCondition(status) {
    if (this.mode !== 'curriculum' || this.levelCompleted) return;
    const level = window.GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;

    if (level.checkWin(status, this.components, this)) {
      this.levelCompleted = true;
      setTimeout(() => {
        this.triggerVictory(level);
      }, 500);
    }
  }

  triggerVictory(level) {
    window.sounds.playSuccess();
    this.launchConfetti();

    this.populateCircuitAnalysis(level, true);

    // Center stage celebration: hide standard status ribbon so appreciation dock smoothly takes center stage
    if (this.dom.statusRibbon) {
      this.dom.statusRibbon.style.display = 'none';
    }

    if (this.dom.victoryCompactDock) {
      if (this.dom.vDockLevelName) {
        this.dom.vDockLevelName.textContent = `🌟 WOW! ${level.title} — Solved Successfully!`;
      }
      this.dom.victoryCompactDock.style.display = 'flex';
    }

    // Keep the large table modal hidden so it does not block the stage
    this.dom.victoryModal.style.display = 'none';

    // Mark Dot Completed if present
    if (this.dom.levelDots) {
      const dots = this.dom.levelDots.querySelectorAll('.level-dot');
      if (dots[this.currentLevelIndex]) {
        dots[this.currentLevelIndex].classList.add('completed');
      }
    }
  }

  openCircuitAnalysis(isVictory = false) {
    const level = (this.mode === 'curriculum') ? window.GAME_LEVELS[this.currentLevelIndex] : null;
    this.populateCircuitAnalysis(level, isVictory);
    this.dom.victoryModal.style.display = 'flex';
  }

  populateCircuitAnalysis(level = null, isVictory = false) {
    const status = this.solver.status;

    // Header & Titles
    if (isVictory && level) {
      this.dom.victoryMainTitle.textContent = 'Circuit Connected Correctly! 🎉';
      this.dom.victoryLevelName.textContent = `${level.title} — Task Solved!`;
    } else {
      this.dom.victoryMainTitle.textContent = '📊 Live Working Circuit Analysis';
      this.dom.victoryLevelName.textContent = level ? level.title : 'Free Sandbox Circuit';
    }

    // Appreciation Messages lookup
    const appreciations = {
      1: "🌟 Outstanding Work, Young Engineer! You mastered the fundamental closed circuit loop, lighting the bulb with flawless electron conduction!",
      2: "⚡ Precision Electrical Mastery! You observed semiconductor polarity, correctly steering forward current into the LED without damage!",
      3: "🚨 Excellent Signaling Automation! You activated the beacon, creating a rhythmic visual pulse on the workbench!",
      4: "⚖️ Brilliant Ohm's Law Balancing! You used precise resistance to safely divide voltage and protect delicate components from burnouts!",
      5: "⚙️ Kinetic Powerhouse! You converted electric potential into magnetic mechanical rotation with proper polarity flow!",
      6: "🛡️ Safety Systems Pro! You placed the switch in the master path, successfully isolating power and preventing hazardous surges!",
      7: "📐 Master of Series Circuits! You distributed voltage across multiple loads according to Kirchhoff's Voltage Law!",
      8: "🔀 Parallel Network Specialist! You balanced parallel branches, allowing each device to draw its required current independently!",
      9: "🔔 Audio Frequency Engineer! You activated the acoustic transducer, producing a crisp live audio signal!",
      10: "💡 Multi-Load Architect! You orchestrated a complex array of loads in harmony, creating a resilient electronic system!"
    };

    if (isVictory && level) {
      this.dom.victoryAppreciationText.textContent = appreciations[level.id] ||
        "🌟 Brilliant Circuit Building! Your components are connected in a clean, closed loop with optimal current and voltage distribution.";
    } else if (status.isComplete) {
      this.dom.victoryAppreciationText.textContent =
        "⚡ Excellent work! The circuit is active and conducting smoothly. Review the electrical telemetry (Volts, Amperes, Watts) below for in-depth analysis.";
    } else {
      this.dom.victoryAppreciationText.textContent =
        "ℹ️ The circuit is currently open or unpowered. Connect a power source and loads in a continuous closed loop to inspect active live telemetry.";
    }

    // Total System Electrical Parameters
    const totalV = status.totalVoltage || 0;
    const batteries = this.components.filter(c => c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'ac_source');
    const totalI = (status.isComplete && totalV > 0) ? (batteries[0]?.state.current || 0) : 0;
    const totalP = totalV * totalI;
    const totalR = totalI > 0 ? (totalV / totalI) : 0;

    this.dom.analysisVTotal.textContent = `${totalV.toFixed(2)} V`;
    this.dom.analysisITotal.textContent = totalI >= 1 ? `${totalI.toFixed(2)} A` : `${(totalI * 1000).toFixed(1)} mA`;
    this.dom.analysisPTotal.textContent = totalP >= 1 ? `${totalP.toFixed(2)} W` : `${(totalP * 1000).toFixed(1)} mW`;
    this.dom.analysisRTotal.textContent = totalR >= 1000 ? `${(totalR / 1000).toFixed(2)} kΩ` : `${totalR.toFixed(1)} Ω`;

    // Circuit Topology Classification
    const loads = this.components.filter(c => c.type !== 'battery' && c.type !== 'cell' && c.type !== 'cell3v' && c.type !== 'ac_source' && c.type !== 'switch');
    if (!status.isComplete) {
      this.dom.analysisCircuitType.textContent = 'Incomplete Loop';
      this.dom.analysisCircuitType.style.color = '#ef4444';
    } else if (loads.length <= 1) {
      this.dom.analysisCircuitType.textContent = 'Single-Load Circuit';
      this.dom.analysisCircuitType.style.color = '#38bdf8';
    } else {
      // Check if currents in active loads are identical (Series) or split (Parallel)
      const currents = loads.filter(l => l.state.powered).map(l => (l.state.current || 0).toFixed(3));
      const allSame = currents.length > 1 && currents.every(cur => cur === currents[0]);
      if (allSame) {
        this.dom.analysisCircuitType.textContent = 'Series Circuit (I is constant)';
        this.dom.analysisCircuitType.style.color = '#fbbf24';
      } else {
        this.dom.analysisCircuitType.textContent = 'Parallel Network (V is constant)';
        this.dom.analysisCircuitType.style.color = '#fbbf24';
      }
    }

    // Per-Component Breakdown
    this.dom.analysisComponentsList.innerHTML = '';
    if (this.components.length === 0) {
      this.dom.analysisComponentsList.innerHTML = '<div style="color: #64748b; font-size: 0.8rem; padding: 8px;">No components on workbench.</div>';
    } else {
      this.components.forEach(comp => {
        const def = window.COMPONENT_DEFINITIONS[comp.type];
        const vDrop = comp.state.voltageDrop || 0;
        const current = comp.state.current || 0;
        const power = comp.state.power || (vDrop * current);

        let behaviorText = 'Idle / Unpowered';
        if (comp.state.burnt) {
          behaviorText = '💥 Burnt out (Blown open circuit)';
        } else if (comp.type === 'battery' || comp.type === 'cell' || comp.type === 'cell3v' || comp.type === 'ac_source') {
          behaviorText = `⚡ Power Source delivering ${comp.voltage || (comp.type === 'cell3v' ? 3 : (comp.type === 'cell' ? 1.5 : (comp.state.voltage || 9)))}V potential`;
        } else if (comp.type === 'bulb') {
          behaviorText = comp.state.powered ? `💡 Radiant filament at ${(vDrop).toFixed(1)}V (${Math.round((comp.state.brightness || 1) * 100)}% brightness)` : 'Filament cold';
        } else if (comp.type === 'motor') {
          behaviorText = comp.state.powered ? `⚙️ Rotating ${(comp.state.direction || 'cw').toUpperCase()} at ${comp.state.rpm || 300} RPM` : 'Rotor stopped';
        } else if (comp.type === 'led') {
          behaviorText = comp.state.powered ? `🚨 Emitting ${(comp.state.color || 'colored')} light with safe current limit` : (comp.state.reversed ? '⛔ Reverse-biased (Blocking current)' : 'Unpowered');
        } else if (comp.type === 'buzzer') {
          behaviorText = comp.state.powered ? '🔔 Sounding continuous 880Hz tone' : 'Silent';
        } else if (comp.type === 'resistor' || comp.type === 'potentiometer') {
          behaviorText = comp.state.powered ? `🪚 Dropping ${vDrop.toFixed(2)}V, limiting loop current` : `Passive ${comp.state.resistance || 220}Ω resistance`;
        } else if (comp.type === 'transformer') {
          behaviorText = `🔌 Stepping down AC potential to ${comp.state.secondaryV || 12}V~`;
        } else if (comp.type === 'solenoid') {
          const isEnergized = comp.state.powered && !comp.state.burnt;
          behaviorText = isEnergized ? `🧲 Electromagnet pulling plunger (B = ${(comp.state.magneticField || 0.42).toFixed(3)}T, F = ${(comp.state.pullForce || 4.8).toFixed(1)}N)` : 'De-energized coil';
        } else if (comp.type === 'rectifier') {
          behaviorText = comp.state.powered ? '⚡ Graetz bridge converting AC input into rectified DC output' : 'Bridge rectifier idle';
        } else if (comp.type === 'function_generator') {
          behaviorText = comp.state.outputEnabled !== false ? `〰️ Synthesizing ${(comp.state.waveform || 'sine').toUpperCase()} (${(comp.state.frequency || 1000)}Hz, ${(comp.state.amplitudeVpp || 10)}Vpp)` : 'Signal Output Disabled';
        } else if (comp.type === 'inductor') {
          behaviorText = comp.state.powered ? `🌀 Inductive choke (L = ${(comp.state.inductanceMh || 10)}mH, E = ${((comp.state.storedEnergy || 0) * 1000).toFixed(2)}mJ, DCR = ${(comp.state.dcr || 0.8)}Ω)` : 'Choke idle';
        } else if (comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
          const capUf = comp.type === 'ceramic_capacitor' ? (comp.state.capacitanceUf || 0.1) : (comp.state.capacitance || 1000);
          behaviorText = comp.state.powered ? `🔋 Storing charge: ${(comp.state.storedVoltage || 0).toFixed(2)}V (${(comp.state.chargePercent || 0)}% of rating, C = ${capUf}µF)` : 'Discharged';
        } else if (comp.type === 'ammeter') {
          behaviorText = `📟 In-line current meter: ${comp.state.reading || '0.000 A'} (${(comp.state.mode || 'dc').toUpperCase()} mode, R_shunt = 0.01Ω)`;
        } else if (comp.type === 'power_supply') {
          behaviorText = `⚡ Lab supply: ${(comp.state.actualVoltage || 12.0).toFixed(2)}V, ${(comp.state.actualCurrent || 0).toFixed(2)}A (${(comp.state.mode || 'cv').toUpperCase()} mode)`;
        } else if (comp.type === 'oscilloscope') {
          behaviorText = `📺 DSO: Dual-channel digitizer (${comp.state.xyMode ? 'XY Lissajous' : 'YT timebase'})`;
        } else if (comp.type === 'fuse') {
          behaviorText = comp.state.blown ? '💥 Fuse Blown (Sacrificial wire vaporized)' : `🛡️ Protective fuse (${(comp.state.rating || 2.0).toFixed(1)}A rating)`;
        } else if (comp.type === 'multimeter') {
          behaviorText = `📟 Active meter measuring: ${(comp.state.measuredVoltage || comp.state.voltageDrop || 0).toFixed(2)}V`;
        } else if (comp.type === 'npn' || comp.type === 'pnp') {
          behaviorText = comp.state.conducting ? '🟢 Transistor SATURATION (Conducting amplified Ic = β·Ib)' : '🔴 Transistor CUTOFF (Open switch, Vbe < 0.65V)';
        } else if (comp.type === 'ldr') {
          behaviorText = `☀️ Photoresistor sensing ${(comp.state.lux || 0)} Lux (${window.formatResistance(comp.state.resistance || 10000)})`;
        } else if (comp.type === 'switch') {
          behaviorText = comp.state.closed ? '🟢 Closed contact (Conducting)' : '🔴 Open contact (Isolated)';
        } else if (comp.type === 'twowayswitch') {
          behaviorText = `🔀 Route ${comp.state.position || 1} Active (COM ➔ L${comp.state.position || 1})`;
        } else if (comp.type === 'pushbutton') {
          behaviorText = comp.state.pressed ? '🟢 Plunger Pressed (Conducting)' : '🔴 Plunger Released (Isolated)';
        }

        const row = document.createElement('div');
        row.className = 'analysis-comp-row';
        row.innerHTML = `
          <div class="analysis-comp-info">
            <span style="font-size: 1.1rem;">${def ? def.icon : '⚡'}</span>
            <span class="analysis-comp-name">${def ? def.name : comp.type}</span>
          </div>
          <div class="analysis-comp-telemetry">
            <span class="telemetry-pill pill-v">${vDrop.toFixed(2)}V</span>
            <span class="telemetry-pill pill-i">${current >= 1 ? current.toFixed(2) + 'A' : (current * 1000).toFixed(1) + 'mA'}</span>
            <span class="telemetry-pill pill-w">${power >= 1 ? power.toFixed(2) + 'W' : (power * 1000).toFixed(1) + 'mW'}</span>
            <span class="telemetry-pill pill-temp" style="background: rgba(14,165,233,0.15); border: 1px solid #0284c7; color: #38bdf8;">🌡️ ${(comp.state.temperature || 25.0).toFixed(1)}°C</span>
          </div>
          <div class="analysis-comp-status">${behaviorText}</div>
        `;
        this.dom.analysisComponentsList.appendChild(row);
      });
    }

    // Scientific Principle Theory
    if (level) {
      this.dom.victoryTheory.innerHTML = `<strong>Scientific Principle & Circuit Insight:</strong> ${level.theory}`;
    } else {
      this.dom.victoryTheory.innerHTML = `<strong>Ohm's & Kirchhoff's Insight:</strong> In any closed circuit loop, the sum of voltage drops across loads equals the total source voltage ($\sum V = 0$). Current through series elements remains identical, while power dissipated ($P = V \times I$) is converted into thermal radiation, light, and kinetic movement.`;
    }

    // Next Task Button Configuration
    if (this.mode === 'curriculum') {
      if (this.currentLevelIndex < window.GAME_LEVELS.length - 1) {
        this.dom.nextTaskBtnText.textContent = `Next Task: Level ${this.currentLevelIndex + 2} ➜`;
        this.dom.btnNextLevel.style.display = 'inline-flex';
      } else {
        this.dom.nextTaskBtnText.textContent = '✨ Explore Creative Circuits in Sandbox ➜';
        this.dom.btnNextLevel.style.display = 'inline-flex';
      }
    } else {
      this.dom.nextTaskBtnText.textContent = 'Close Analysis ✕';
      this.dom.btnNextLevel.style.display = 'inline-flex';
    }
  }

  openHint() {
    if (this.mode !== 'curriculum') {
      this.dom.hintModalTitle.textContent = 'Sandbox Tips';
      this.dom.hintModalContent.innerHTML = `
        <p>In Sandbox mode, you can connect any components together!</p>
        <ul>
          <li><strong>LEDs & Diodes</strong> only allow current in one direction (Anode -> Cathode).</li>
          <li><strong>Motors</strong> spin clockwise or counter-clockwise depending on wire polarity.</li>
          <li><strong>Bulbs</strong> glow in either direction.</li>
        </ul>
      `;
    } else {
      const level = window.GAME_LEVELS[this.currentLevelIndex];
      this.dom.hintModalTitle.textContent = `${level.title} - Hint`;
      this.dom.hintModalContent.innerHTML = `
        <p><strong>Guidance:</strong> ${level.hint}</p>
        <p style="margin-top: 10px;"><strong>Objective:</strong> ${level.summary}</p>
      `;
    }
    this.dom.hintModal.style.display = 'flex';
  }

  closeHint() {
    this.dom.hintModal.style.display = 'none';
  }

  // =========================================================================
  // Digital Logic Gate Simulator & Truth Table Lab Modal Controller
  // =========================================================================
  initLogicSimulatorModal() {
    this.logicSim = {
      selectedGate: 'gate_and',
      inputA: 0,
      inputB: 0
    };

    if (this.dom.btnLogicSimToggle) {
      this.dom.btnLogicSimToggle.addEventListener('click', () => this.openLogicSimModal());
    }
    if (this.dom.btnCloseLogicSim) {
      this.dom.btnCloseLogicSim.addEventListener('click', () => this.closeLogicSimModal());
    }
    if (this.dom.btnCloseLogicSimBottom) {
      this.dom.btnCloseLogicSimBottom.addEventListener('click', () => this.closeLogicSimModal());
    }
    if (this.dom.logicSimModal) {
      this.dom.logicSimModal.addEventListener('click', (e) => {
        if (e.target === this.dom.logicSimModal) this.closeLogicSimModal();
      });
    }
    if (this.dom.btnSpawnLogicGate) {
      this.dom.btnSpawnLogicGate.addEventListener('click', () => this.spawnLogicGateFromSim());
    }

    if (this.dom.logicGateTabs) {
      this.dom.logicGateTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.gate-tab-btn');
        if (btn && btn.dataset.gate) {
          this.selectLogicSimGate(btn.dataset.gate);
        }
      });
    }
  }

  openLogicSimModal(gateType = null) {
    if (gateType) {
      this.logicSim.selectedGate = gateType;
    }
    if (this.dom.logicSimModal) {
      this.dom.logicSimModal.style.display = 'flex';
      this.updateLogicSimModalView();
      if (window.sounds && typeof window.sounds.playClick === 'function') {
        window.sounds.playClick();
      }
    }
  }

  closeLogicSimModal() {
    if (this.dom.logicSimModal) {
      this.dom.logicSimModal.style.display = 'none';
    }
  }

  selectLogicSimGate(gateType) {
    this.logicSim.selectedGate = gateType;
    if (this.dom.logicGateTabs) {
      const btns = this.dom.logicGateTabs.querySelectorAll('.gate-tab-btn');
      btns.forEach(b => {
        b.classList.toggle('active', b.dataset.gate === gateType);
      });
    }
    if (window.sounds && typeof window.sounds.playClick === 'function') {
      window.sounds.playClick();
    }
    this.updateLogicSimModalView();
  }

  toggleLogicSimInput(pin) {
    if (pin === 'a') {
      this.logicSim.inputA = this.logicSim.inputA ? 0 : 1;
    } else if (pin === 'b') {
      this.logicSim.inputB = this.logicSim.inputB ? 0 : 1;
    }
    if (window.sounds && typeof window.sounds.playSwitch === 'function') {
      window.sounds.playSwitch(true);
    }
    this.updateLogicSimModalView();
  }

  setLogicSimInputs(a, b) {
    this.logicSim.inputA = a ? 1 : 0;
    this.logicSim.inputB = b ? 1 : 0;
    if (window.sounds && typeof window.sounds.playClick === 'function') {
      window.sounds.playClick();
    }
    this.updateLogicSimModalView();
  }

  computeLogicOutput(gateType, inA, inB) {
    switch (gateType) {
      case 'gate_and': return (inA && inB) ? 1 : 0;
      case 'gate_or': return (inA || inB) ? 1 : 0;
      case 'gate_not': return (!inA) ? 1 : 0;
      case 'gate_nand': return !(inA && inB) ? 1 : 0;
      case 'gate_nor': return !(inA || inB) ? 1 : 0;
      case 'gate_xor': return (inA !== inB) ? 1 : 0;
      case 'gate_xnor': return (inA === inB) ? 1 : 0;
      default: return 0;
    }
  }

  updateLogicSimModalView() {
    const gate = this.logicSim.selectedGate;
    const inA = this.logicSim.inputA;
    const inB = this.logicSim.inputB;
    const isNot = gate === 'gate_not';
    const outY = this.computeLogicOutput(gate, inA, inB);

    let gateName = 'AND';
    let icCode = '74HC08';
    let boolEq = 'Y = A · B';
    let desc = 'Output is at logic 1 when, and only when all its inputs are at logic 1, otherwise the output is at logic 0.';
    let symSvg = '';

    switch (gate) {
      case 'gate_and':
        gateName = 'AND'; icCode = '74HC08'; boolEq = 'Y = A · B';
        desc = 'Output is at logic 1 when, and only when all its inputs are at logic 1, otherwise the output is at logic 0.';
        symSvg = `<path d="M 170 85 L 230 85 A 45 45 0 0 1 230 175 L 170 175 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>`;
        break;
      case 'gate_or':
        gateName = 'OR'; icCode = '74HC32'; boolEq = 'Y = A + B';
        desc = 'Output is at logic 1 when one or more are at logic 1. If all inputs are at logic 0, output is at logic 0.';
        symSvg = `<path d="M 160 85 Q 190 130 160 175 Q 245 175 275 130 Q 245 85 160 85 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>`;
        break;
      case 'gate_not':
        gateName = 'NOT'; icCode = '74HC04'; boolEq = 'Y = Ā';
        desc = 'Output is at logic 0 when its only input is at logic 1, and at logic 1 when its only input is at logic 0. That\'s why it is called an INVERTER.';
        symSvg = `
          <polygon points="150,70 235,130 150,190" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
          <circle cx="248" cy="130" r="11" fill="#1e293b" stroke="#38bdf8" stroke-width="3.5"/>
        `;
        break;
      case 'gate_nand':
        gateName = 'NAND'; icCode = '74HC00'; boolEq = 'Y = (A · B)̄';
        desc = 'Output is at logic 0 when, and only when all its inputs are at logic 1, otherwise the output is at logic 1.';
        symSvg = `
          <path d="M 160 85 L 220 85 A 45 45 0 0 1 220 175 L 160 175 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
          <circle cx="277" cy="130" r="11" fill="#1e293b" stroke="#38bdf8" stroke-width="3.5"/>
        `;
        break;
      case 'gate_nor':
        gateName = 'NOR'; icCode = '74HC02'; boolEq = 'Y = (A + B)̄';
        desc = 'Output is at logic 0 when one or more of its inputs are at logic 1. If all the inputs are at logic 0, the output is at logic 1.';
        symSvg = `
          <path d="M 155 85 Q 185 130 155 175 Q 240 175 270 130 Q 240 85 155 85 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
          <circle cx="282" cy="130" r="11" fill="#1e293b" stroke="#38bdf8" stroke-width="3.5"/>
        `;
        break;
      case 'gate_xor':
        gateName = 'XOR'; icCode = '74HC86'; boolEq = 'Y = A ⊕ B';
        desc = 'Output is at logic 1 when one and only one of its inputs is at logic 1. Otherwise is it logic 0.';
        symSvg = `
          <path d="M 142 85 Q 172 130 142 175" fill="none" stroke="#38bdf8" stroke-width="4"/>
          <path d="M 160 85 Q 190 130 160 175 Q 245 175 275 130 Q 245 85 160 85 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
        `;
        break;
      case 'gate_xnor':
        gateName = 'XNOR'; icCode = '74HC7266'; boolEq = 'Y = (A ⊕ B)̄';
        desc = 'Output is at logic 0 when one and only one of its inputs is at logic 1. Otherwise it is logic 1. Similar to XOR but inverted.';
        symSvg = `
          <path d="M 137 85 Q 167 130 137 175" fill="none" stroke="#38bdf8" stroke-width="4"/>
          <path d="M 155 85 Q 185 130 155 175 Q 240 175 270 130 Q 240 85 155 85 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
          <circle cx="282" cy="130" r="11" fill="#1e293b" stroke="#38bdf8" stroke-width="3.5"/>
        `;
        break;
    }

    if (this.dom.logicSimEq) this.dom.logicSimEq.textContent = boolEq;
    if (this.dom.logicSimDesc) this.dom.logicSimDesc.textContent = desc;

    // 1. Render Interactive Canvas Box
    if (this.dom.logicSimCanvasBox) {
      const outX = (gate === 'gate_not' ? 260 : (gate === 'gate_nand' || gate === 'gate_nor' || gate === 'gate_xnor' ? 294 : 276));
      this.dom.logicSimCanvasBox.innerHTML = `
        <svg viewBox="0 0 460 260" class="logic-sim-svg">
          <defs>
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9"/>
              <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- Background Grid & Frame -->
          <rect x="5" y="5" width="450" height="250" rx="10" fill="#0b1329" stroke="#1e293b" stroke-width="1.8"/>

          ${isNot ? `
            <!-- Input A Line -->
            <line x1="85" y1="130" x2="150" y2="130" stroke="${inA ? '#38bdf8' : '#334155'}" stroke-width="${inA ? 4 : 2.5}"/>
            <!-- Input A Toggle Button -->
            <g class="sim-interactive-btn" data-pin="a" style="cursor: pointer;">
              <rect x="20" y="112" width="65" height="36" rx="6" fill="${inA ? '#0284c7' : '#1e293b'}" stroke="${inA ? '#38bdf8' : '#475569'}" stroke-width="2"/>
              <text x="52.5" y="135" fill="${inA ? '#ffffff' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" text-anchor="middle">A = ${inA}</text>
            </g>
          ` : `
            <!-- Input A Line -->
            <line x1="85" y1="105" x2="165" y2="105" stroke="${inA ? '#38bdf8' : '#334155'}" stroke-width="${inA ? 4 : 2.5}"/>
            <!-- Input B Line -->
            <line x1="85" y1="155" x2="165" y2="155" stroke="${inB ? '#38bdf8' : '#334155'}" stroke-width="${inB ? 4 : 2.5}"/>

            <!-- Input A Toggle Button -->
            <g class="sim-interactive-btn" data-pin="a" style="cursor: pointer;">
              <rect x="20" y="87" width="65" height="36" rx="6" fill="${inA ? '#0284c7' : '#1e293b'}" stroke="${inA ? '#38bdf8' : '#475569'}" stroke-width="2"/>
              <text x="52.5" y="110" fill="${inA ? '#ffffff' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" text-anchor="middle">A = ${inA}</text>
            </g>

            <!-- Input B Toggle Button -->
            <g class="sim-interactive-btn" data-pin="b" style="cursor: pointer;">
              <rect x="20" y="137" width="65" height="36" rx="6" fill="${inB ? '#0284c7' : '#1e293b'}" stroke="${inB ? '#38bdf8' : '#475569'}" stroke-width="2"/>
              <text x="52.5" y="160" fill="${inB ? '#ffffff' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" text-anchor="middle">B = ${inB}</text>
            </g>
          `}

          <!-- Gate Schematic Symbol -->
          ${symSvg}

          <!-- Output Line -->
          <line x1="${outX}" y1="130" x2="360" y2="130" stroke="${outY ? '#fbbf24' : '#334155'}" stroke-width="${outY ? 4 : 2.5}"/>

          <!-- Output Lamp / Indicator -->
          <g transform="translate(380, 130)">
            ${outY ? '<circle cx="0" cy="0" r="32" fill="url(#lampGlow)"/>' : ''}
            <circle cx="0" cy="0" r="18" fill="${outY ? '#f59e0b' : '#1e293b'}" stroke="${outY ? '#fbbf24' : '#475569'}" stroke-width="2.5"/>
            <text x="0" y="6" fill="${outY ? '#ffffff' : '#64748b'}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" text-anchor="middle">${outY}</text>
            <text x="0" y="32" fill="${outY ? '#fbbf24' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="800" text-anchor="middle">Y = ${outY}</text>
          </g>

          <!-- Top Banner Tag -->
          <rect x="145" y="18" width="170" height="24" rx="5" fill="#1e293b" stroke="#354155" stroke-width="1.2"/>
          <text x="230" y="34" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" text-anchor="middle">
            ${gateName} GATE
          </text>
        </svg>
      `;

      // Bind click listeners to interactive SVG switch buttons
      const btnA = this.dom.logicSimCanvasBox.querySelector('.sim-interactive-btn[data-pin="a"]');
      if (btnA) btnA.addEventListener('click', () => this.toggleLogicSimInput('a'));
      const btnB = this.dom.logicSimCanvasBox.querySelector('.sim-interactive-btn[data-pin="b"]');
      if (btnB) btnB.addEventListener('click', () => this.toggleLogicSimInput('b'));
    }

    // 2. Render Real-Time Truth Table with Active Row Highlight
    if (this.dom.logicTruthTable) {
      if (isNot) {
        const rows = [
          { a: 0, out: this.computeLogicOutput(gate, 0, 0) },
          { a: 1, out: this.computeLogicOutput(gate, 1, 0) }
        ];
        let tableHtml = `
          <thead>
            <tr>
              <th>Input A</th>
              <th>Output Y</th>
              <th>Logic Level</th>
            </tr>
          </thead>
          <tbody>
        `;
        rows.forEach(r => {
          const isActive = (r.a === inA);
          const activeClass = isActive ? 'logic-table-row-active' : '';
          const levelText = r.out ? 'HIGH' : 'LOW';
          const badgeClass = r.out ? 'logic-badge-high' : 'logic-badge-low';
          tableHtml += `
            <tr class="${activeClass}" data-a="${r.a}" data-b="0" style="cursor: pointer;" title="Click to test A = ${r.a}">
              <td class="col-center"><strong>${r.a}</strong></td>
              <td class="col-center"><strong style="color: ${r.out ? '#fbbf24' : '#94a3b8'};">${r.out}</strong></td>
              <td class="col-center"><span class="${badgeClass}">${levelText}</span></td>
            </tr>
          `;
        });
        tableHtml += `</tbody>`;
        this.dom.logicTruthTable.innerHTML = tableHtml;
      } else {
        const rows = [
          { a: 0, b: 0, out: this.computeLogicOutput(gate, 0, 0) },
          { a: 0, b: 1, out: this.computeLogicOutput(gate, 0, 1) },
          { a: 1, b: 0, out: this.computeLogicOutput(gate, 1, 0) },
          { a: 1, b: 1, out: this.computeLogicOutput(gate, 1, 1) }
        ];
        let tableHtml = `
          <thead>
            <tr>
              <th>Input A</th>
              <th>Input B</th>
              <th>Output Y</th>
              <th>Logic Level</th>
            </tr>
          </thead>
          <tbody>
        `;
        rows.forEach(r => {
          const isActive = (r.a === inA && r.b === inB);
          const activeClass = isActive ? 'logic-table-row-active' : '';
          const levelText = r.out ? 'HIGH' : 'LOW';
          const badgeClass = r.out ? 'logic-badge-high' : 'logic-badge-low';
          tableHtml += `
            <tr class="${activeClass}" data-a="${r.a}" data-b="${r.b}" style="cursor: pointer;" title="Click to test A = ${r.a}, B = ${r.b}">
              <td class="col-center"><strong>${r.a}</strong></td>
              <td class="col-center"><strong>${r.b}</strong></td>
              <td class="col-center"><strong style="color: ${r.out ? '#fbbf24' : '#94a3b8'};">${r.out}</strong></td>
              <td class="col-center"><span class="${badgeClass}">${levelText}</span></td>
            </tr>
          `;
        });
        tableHtml += `</tbody>`;
        this.dom.logicTruthTable.innerHTML = tableHtml;
      }

      // Add row click handlers to set inputs
      const trs = this.dom.logicTruthTable.querySelectorAll('tbody tr');
      trs.forEach(tr => {
        tr.addEventListener('click', () => {
          const ra = parseInt(tr.dataset.a, 10);
          const rb = parseInt(tr.dataset.b, 10);
          this.setLogicSimInputs(ra, rb);
        });
      });
    }

    // 3. Render 74HC IC Technical Specifications
    if (this.dom.logicIcSpecsBox) {
      this.dom.logicIcSpecsBox.innerHTML = `
        <table class="logic-specs-table">
          <tbody>
            <tr>
              <td class="spec-label">Part Number & IC Family</td>
              <td class="spec-val"><strong>${icCode}</strong> (High-Speed CMOS 74HC Series)</td>
            </tr>
            <tr>
              <td class="spec-label">Operating Supply (Vcc)</td>
              <td class="spec-val">2.0 V to 6.0 V (Nominal: 5.0 V)</td>
            </tr>
            <tr>
              <td class="spec-label">Output HIGH Voltage (V_OH)</td>
              <td class="spec-val" style="color: #fbbf24;">≥ 4.4 V (Nominal 5.0 V @ I_OH = -20µA)</td>
            </tr>
            <tr>
              <td class="spec-label">Output LOW Voltage (V_OL)</td>
              <td class="spec-val">≤ 0.1 V (Nominal 0.0 V @ I_OL = 20µA)</td>
            </tr>
            <tr>
              <td class="spec-label">Input Thresholds (V_IH / V_IL)</td>
              <td class="spec-val">V_IH ≥ 1.5 V (Logic 1) • V_IL ≤ 0.8 V (Logic 0)</td>
            </tr>
            <tr>
              <td class="spec-label">Propagation Delay (t_pd)</td>
              <td class="spec-val">~9 ns (Ultra-low gate latency)</td>
            </tr>
            <tr>
              <td class="spec-label">Output Drive Capability</td>
              <td class="spec-val">±25 mA (Directly powers LEDs & logic inputs)</td>
            </tr>
          </tbody>
        </table>
      `;
    }
  }

  spawnLogicGateFromSim() {
    const gate = this.logicSim.selectedGate;
    this.closeLogicSimModal();
    const comp = this.spawnComponent(gate);
    if (comp) {
      comp.state.manualA = this.logicSim.inputA;
      comp.state.manualB = this.logicSim.inputB;
      this.updateComponentVisual(comp);
      this.evaluateCircuit();
      const def = window.COMPONENT_DEFINITIONS[gate];
      if (typeof this.showToast === 'function') {
        this.showToast(`✨ Placed ${def ? def.name : gate} onto workbench!`, 'success');
      }
    }
  }



  // =========================================================================
  // Theme Controller: Day Mode / Dark Mode
  // =========================================================================
  initTheme() {
    const savedTheme = localStorage.getItem('kidtron_theme') || 'dark';
    this.setTheme(savedTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    if (theme === 'day') {
      document.body.classList.add('day-mode');
      if (this.dom.themeToggleIcon) this.dom.themeToggleIcon.textContent = '\uD83C\uDF19';
      if (this.dom.themeToggleLabel) this.dom.themeToggleLabel.textContent = 'Dark Mode';
      if (this.dom.btnThemeToggle) this.dom.btnThemeToggle.title = 'Switch to Dark Mode';
    } else {
      document.body.classList.remove('day-mode');
      if (this.dom.themeToggleIcon) this.dom.themeToggleIcon.textContent = '\u2600\uFE0F';
      if (this.dom.themeToggleLabel) this.dom.themeToggleLabel.textContent = 'Day Mode';
      if (this.dom.btnThemeToggle) this.dom.btnThemeToggle.title = 'Switch to Day Mode';
    }
    try {
      localStorage.setItem('kidtron_theme', theme);
    } catch (e) { }
  }

  toggleTheme() {
    const nextTheme = (this.currentTheme === 'day') ? 'dark' : 'day';
    this.setTheme(nextTheme);
    if (window.sounds && typeof window.sounds.playClick === 'function') {
      try { window.sounds.playClick(); } catch (e) { }
    }
  }

  // =========================================================================
  // Student View & Topbar Lifted Component Inspector
  // =========================================================================
  initStudentView() {
    let saved = null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const param = urlParams.get('student_view');
      if (param !== null) {
        saved = (param === '1' || param === 'true') ? '1' : '0';
      } else {
        saved = localStorage.getItem('kidtron_student_view');
      }
    } catch (e) { }
    // Default to enabled (true) to reduce complexity for students immediately
    const enabled = (saved === null) ? true : (saved === '1');
    this.setStudentView(enabled);
    this.updateTopbarComponentPill(null);
  }

  setStudentView(enabled) {
    this.isStudentView = !!enabled;
    if (this.isStudentView) {
      document.body.classList.add('student-view-active');
      if (this.dom.btnStudentView) {
        this.dom.btnStudentView.classList.add('active');
        this.dom.btnStudentView.title = 'Info Mode: ON (Component editing handles hidden). Click to toggle.';
      }
      if (this.dom.studentViewIcon) {
        this.dom.studentViewIcon.textContent = 'ℹ️';
      }
      if (this.dom.studentViewLabel) {
        this.dom.studentViewLabel.textContent = 'Info';
      }
    } else {
      document.body.classList.remove('student-view-active');
      if (this.dom.btnStudentView) {
        this.dom.btnStudentView.classList.remove('active');
        this.dom.btnStudentView.title = 'Info Mode: OFF (Component editing handles visible). Click to toggle.';
      }
      if (this.dom.studentViewIcon) {
        this.dom.studentViewIcon.textContent = 'ℹ️';
      }
      if (this.dom.studentViewLabel) {
        this.dom.studentViewLabel.textContent = 'Info';
      }
    }
    try {
      localStorage.setItem('kidtron_student_view', this.isStudentView ? '1' : '0');
    } catch (e) { }
  }

  toggleStudentView(force = null) {
    const nextState = (force !== null) ? force : !this.isStudentView;
    this.setStudentView(nextState);
    if (window.sounds && typeof window.sounds.playClick === 'function') {
      try { window.sounds.playClick(); } catch (e) { }
    }
    this.updateTopbarComponentPill(this.selectedComponent);
    if (typeof this.showToast === 'function') {
      this.showToast(
        this.isStudentView
          ? 'ℹ️ Info Mode: ON — Editing clutter hidden around components.'
          : '🛠️ Info Mode: OFF — Component editing handles visible.',
        'info'
      );
    }
  }

  updateTopbarComponentPill(comp = null) {
    if (!this.dom || !this.dom.topbarCompPill) return;
    const pill = this.dom.topbarCompPill;
    const symBox = this.dom.topbarCompSymBox;
    const nameEl = this.dom.topbarCompName;
    const badgeTypeEl = this.dom.topbarCompBadgeType;
    const metricsEl = this.dom.topbarCompMetrics;

    const target = comp || this.selectedComponent;
    if (!target) {
      pill.classList.remove('has-target');
      if (symBox) {
        symBox.innerHTML = `
          <svg viewBox="0 0 28 18" class="comp-schematic-svg">
            <line x1="2" y1="9" x2="8" y2="9" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>
            <polygon points="8,4 8,14 16,9" fill="#38bdf8"/>
            <line x1="16" y1="4" x2="16" y2="14" stroke="#38bdf8" stroke-width="1.6"/>
            <line x1="16" y1="9" x2="26" y2="9" stroke="#38bdf8" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        `;
      }
      if (nameEl) nameEl.textContent = 'Circuit Inspector';
      if (badgeTypeEl) {
        badgeTypeEl.textContent = this.isStudentView ? 'STUDENT' : 'READY';
      }
      if (metricsEl) metricsEl.textContent = 'Tap or hover any component to inspect';
      return;
    }

    pill.classList.add('has-target');
    const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[target.type]) || { name: target.type };
    const isTransistor = target.type === 'npn' || target.type === 'pnp';
    const symbolSVG = window.ComponentRenderer ? window.ComponentRenderer.getSchematicSymbol(target.type, target) : '';
    const displayName = window.ComponentRenderer ? window.ComponentRenderer.getComponentDisplayName(target) : def.name;

    if (symBox) {
      symBox.innerHTML = `
        <svg viewBox="${isTransistor ? '0 0 88 56' : '0 0 28 18'}" class="comp-schematic-svg">
          ${symbolSVG}
        </svg>
      `;
    }

    if (nameEl) {
      nameEl.textContent = displayName;
    }

    if (badgeTypeEl) {
      badgeTypeEl.textContent = (target.type || 'comp').toUpperCase();
    }

    if (metricsEl) {
      const v = typeof target.state?.voltageDrop === 'number' ? target.state.voltageDrop : 0;
      const i = typeof target.state?.current === 'number' ? target.state.current : 0;
      const p = typeof target.state?.power === 'number' ? target.state.power : (v * i);

      const vText = v >= 10 ? `${v.toFixed(1)}V` : `${v.toFixed(2)}V`;
      const ma = i * 1000;
      const iText = ma >= 1000 ? `${(ma / 1000).toFixed(2)}A` : `${ma.toFixed(1)}mA`;
      const pText = p >= 1 ? `${p.toFixed(2)}W` : `${(p * 1000).toFixed(1)}mW`;

      let paramText = '';
      if (target.type === 'resistor') {
        const rVal = target.state?.resistance || 220;
        paramText = ` · R: ${window.formatResistance ? window.formatResistance(rVal) : rVal + 'Ω'}`;
      } else if (target.type === 'battery' || target.type === 'cell' || target.type === 'cell3v') {
        const vRating = target.state?.voltage || (target.type === 'battery' ? 9 : (target.type === 'cell3v' ? 3 : 1.5));
        paramText = ` · Source: ${vRating}V`;
      } else if (target.type === 'led') {
        const color = (target.state?.color || 'green').toUpperCase();
        const litStatus = target.state?.burnt ? 'BURNT 🔥' : (target.state?.powered ? 'LIT ✨' : 'OFF');
        paramText = ` · ${color} (${litStatus})`;
      } else if (target.type === 'bulb') {
        const litStatus = target.state?.burnt ? 'BURNT 🔥' : (target.state?.powered ? 'LIT 💡' : 'OFF');
        paramText = ` · ${litStatus}`;
      } else if (target.type === 'motor') {
        const rpm = Math.round(target.state?.rpm || 0);
        paramText = ` · ${rpm} RPM`;
      } else if (target.type === 'buzzer') {
        const buzzStatus = target.state?.sounding ? 'BUZZING 🔊' : 'QUIET';
        paramText = ` · ${buzzStatus}`;
      } else if (target.type === 'switch') {
        paramText = target.state?.closed ? ' · CLOSED (ON)' : ' · OPEN (OFF)';
      } else if (target.type === 'capacitor') {
        paramText = ` · C: ${target.state?.capacitance || 100}µF`;
      } else if (target.type === 'potentiometer') {
        paramText = ` · R: ${window.formatResistance ? window.formatResistance(target.state?.resistance || 10000) : '10kΩ'}`;
      }

      metricsEl.innerHTML = `<span class="topbar-v">${vText}</span> · <span class="topbar-i">${iText}</span> · <span class="topbar-p">${pText}</span><span class="topbar-param">${paramText}</span>`;
    }
  }

  // =========================================================================
  // Mobile & Fullscreen Capabilities
  // =========================================================================
  toggleFullscreen(force = null) {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const targetState = (force !== null) ? force : !isFs;

    if (targetState && !isFs) {
      const root = document.documentElement;
      const requestMethod = root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullScreen || root.msRequestFullscreen;
      if (requestMethod) {
        try {
          const p = requestMethod.call(root);
          if (p && typeof p.catch === 'function') p.catch(() => { });
        } catch (e) { }
      }
      // Attempt to lock landscape orientation if supported (mobile Chrome / Android / PWA)
      if (window.screen && screen.orientation && typeof screen.orientation.lock === 'function') {
        try {
          const lockP = screen.orientation.lock('landscape');
          if (lockP && typeof lockP.catch === 'function') lockP.catch(() => { });
        } catch (e) { }
      }
    } else if (!targetState && isFs) {
      const exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exitMethod) {
        try {
          const p = exitMethod.call(document);
          if (p && typeof p.catch === 'function') p.catch(() => { });
        } catch (e) { }
      }
      if (window.screen && screen.orientation && typeof screen.orientation.unlock === 'function') {
        try {
          screen.orientation.unlock();
        } catch (e) { }
      }
    }

    this.updateFullscreenUI();
  }

  updateFullscreenUI() {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (this.dom && this.dom.fullscreenIcon) {
      this.dom.fullscreenIcon.textContent = isFs ? '🗗' : '⛶';
    }
    if (this.dom && this.dom.fullscreenLabel) {
      this.dom.fullscreenLabel.textContent = isFs ? 'Exit Full' : 'Fullscreen';
    }
    if (this.dom && this.dom.btnFullscreenToggle) {
      this.dom.btnFullscreenToggle.classList.toggle('active', isFs);
      this.dom.btnFullscreenToggle.title = isFs ? 'Exit Fullscreen Mode' : 'Toggle Fullscreen Landscape Mode';
    }
  }

  setToolboxCollapsed(collapsed) {
    if (!this.dom || !this.dom.toolboxSidebar) return;
    if (collapsed) {
      this.dom.toolboxSidebar.classList.add('collapsed');
      if (this.dom.btnEdgeToolboxToggle) {
        this.dom.btnEdgeToolboxToggle.classList.remove('open');
      }
    } else {
      this.dom.toolboxSidebar.classList.remove('collapsed');
      if (this.dom.btnEdgeToolboxToggle) {
        this.dom.btnEdgeToolboxToggle.classList.add('open');
      }
    }
  }

  toggleToolboxDrawer(forceCollapsed = null) {
    if (!this.dom || !this.dom.toolboxSidebar) return;
    const isCurrentlyCollapsed = this.dom.toolboxSidebar.classList.contains('collapsed');
    const targetCollapsed = (forceCollapsed !== null) ? forceCollapsed : !isCurrentlyCollapsed;
    this.setToolboxCollapsed(targetCollapsed);

    if (window.sounds && typeof window.sounds.playClick === 'function') {
      try { window.sounds.playClick(); } catch (e) { }
    }
  }

  clampComponentsToStage() {
    if (!this.dom || !this.dom.stage || !this.components || this.components.length === 0) return;
    const minPlayX = -5500;
    const maxPlayX = 11500;
    const minPlayY = -4500;
    const maxPlayY = 9500;
    let movedAny = false;

    this.components.forEach(comp => {
      const compEl = document.getElementById(`node-${comp.id}`) || document.getElementById(comp.id);
      let newX = comp.x;
      let newY = comp.y;

      if (isNaN(newX) || newX < minPlayX) { newX = minPlayX; movedAny = true; }
      if (newX > maxPlayX) { newX = maxPlayX; movedAny = true; }
      if (isNaN(newY) || newY < minPlayY) { newY = minPlayY; movedAny = true; }
      if (newY > maxPlayY) { newY = maxPlayY; movedAny = true; }

      comp.x = newX;
      comp.y = newY;

      if (compEl) {
        compEl.style.left = `${newX}px`;
        compEl.style.top = `${newY}px`;
      }
    });

    if (movedAny) {
      this.renderWires();
    }
  }

  // Gaming Ground Zoom & Pan Methods (Only Circuit Workbench Zooms)
  applyStageTransform() {
    if (this.dom && this.dom.workbenchWorld) {
      this.dom.workbenchWorld.style.transform = `translate(${this.stagePanX || 0}px, ${this.stagePanY || 0}px) scale(${this.stageZoom || 1.0})`;
    }
    if (this.dom && this.dom.btnZoomReset) {
      this.dom.btnZoomReset.textContent = `${Math.round((this.stageZoom || 1.0) * 100)}%`;
    }
  }

  setZoom(newZoom, clientCenterX = null, clientCenterY = null) {
    const clamped = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    if (Math.abs(clamped - (this.stageZoom || 1.0)) < 0.001) return;

    const stageRect = (this.dom && this.dom.stage) ? this.dom.stage.getBoundingClientRect() : { left: 0, top: 0, width: 800, height: 600 };
    const cx = (clientCenterX !== null) ? clientCenterX - stageRect.left : stageRect.width / 2;
    const cy = (clientCenterY !== null) ? clientCenterY - stageRect.top : stageRect.height / 2;

    const worldX = (cx - (this.stagePanX || 0)) / (this.stageZoom || 1.0);
    const worldY = (cy - (this.stagePanY || 0)) / (this.stageZoom || 1.0);

    this.stageZoom = clamped;
    this.stagePanX = cx - worldX * clamped;
    this.stagePanY = cy - worldY * clamped;
    this.applyStageTransform();
  }

  resetZoom() {
    this.stageZoom = 1.0;
    this.stagePanX = 0;
    this.stagePanY = 0;
    this.applyStageTransform();
  }

  zoomToFit() {
    if (!this.dom || !this.dom.stage) return;
    if (!this.components || this.components.length === 0) {
      this.resetZoom();
      return;
    }

    const stageRect = this.dom.stage.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    this.components.forEach(comp => {
      const def = window.COMPONENT_DEFINITIONS[comp.type] || { width: 100, height: 60 };
      const w = def.width * (comp.scale || 1.0);
      const h = def.height * (comp.scale || 1.0);
      if (comp.x < minX) minX = comp.x;
      if (comp.y < minY) minY = comp.y;
      if (comp.x + w > maxX) maxX = comp.x + w;
      if (comp.y + h > maxY) maxY = comp.y + h;
    });

    const contentW = Math.max(100, maxX - minX);
    const contentH = Math.max(100, maxY - minY);
    const pad = 60;

    const availW = Math.max(200, stageRect.width - pad * 2);
    const availH = Math.max(200, stageRect.height - pad * 2);

    const fitZoom = Math.min(1.25, Math.max(this.minZoom, Math.min(availW / contentW, availH / contentH)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.stageZoom = fitZoom;
    this.stagePanX = (stageRect.width / 2) - centerX * fitZoom;
    this.stagePanY = (stageRect.height / 2) - centerY * fitZoom;
    this.applyStageTransform();
  }
  clearBoard(clearComponents = true, recordHistory = true) {
    if (recordHistory && (this.components.length > 0 || this.wires.length > 0)) {
      this.pushHistory();
    }
    this.wires = [];
    if (clearComponents) {
      this.components = [];
      if (this.dom && this.dom.componentsContainer) {
        this.dom.componentsContainer.innerHTML = '';
      }
      this.selectedComponent = null;
      this.hideCharacterSpeechBubble();
      this.updateTopbarComponentPill(null);
      if (this.dom && this.dom.inspectorCard) {
        this.dom.inspectorCard.style.display = 'none';
      }
      this.clearConfetti();
    }
    this.renderWires();
    this.evaluateCircuit();
  }

  // Undo / Redo History System
  updateUndoRedoButtons() {
    if (this.dom && this.dom.btnUndo) {
      this.dom.btnUndo.disabled = this.history.length === 0;
    }
    if (this.dom && this.dom.btnRedo) {
      this.dom.btnRedo.disabled = this.future.length === 0;
    }
  }

  takeSnapshot() {
    return JSON.stringify({
      components: this.components.map(c => ({
        id: c.id,
        type: c.type,
        x: c.x,
        y: c.y,
        rotation: c.rotation || 0,
        scale: c.scale !== undefined ? c.scale : 1.0,
        state: JSON.parse(JSON.stringify(c.state || {}))
      })),
      wires: this.wires.map(w => ({
        id: w.id,
        fromComp: w.fromComp,
        fromPin: w.fromPin,
        toComp: w.toComp,
        toPin: w.toPin,
        color: w.color,
        points: w.points ? JSON.parse(JSON.stringify(w.points)) : [],
        fromPoint: w.fromPoint ? { ...w.fromPoint } : undefined,
        toPoint: w.toPoint ? { ...w.toPoint } : undefined
      }))
    });
  }

  pushHistory() {
    if (this.isRestoringState) return;
    const snap = this.takeSnapshot();
    if (this.history.length > 0 && this.history[this.history.length - 1] === snap) {
      return;
    }
    this.history.push(snap);
    if (this.history.length > this.maxHistorySteps) {
      this.history.shift();
    }
    this.future = [];
    this.updateUndoRedoButtons();
  }

  undo() {
    if (this.history.length === 0) return;
    const currentSnap = this.takeSnapshot();
    const prevSnap = this.history.pop();
    this.future.push(currentSnap);
    this.restoreState(prevSnap);
    this.updateUndoRedoButtons();
    window.sounds.playSwitch(false);
  }

  redo() {
    if (this.future.length === 0) return;
    const currentSnap = this.takeSnapshot();
    const nextSnap = this.future.pop();
    this.history.push(currentSnap);
    this.restoreState(nextSnap);
    this.updateUndoRedoButtons();
    window.sounds.playSwitch(true);
  }

  restoreState(jsonStr) {
    if (!jsonStr) return;
    this.isRestoringState = true;
    try {
      const data = JSON.parse(jsonStr);

      // Clean existing nodes
      this.dom.componentsContainer.innerHTML = '';
      this.selectedComponent = null;
      if (this.dom.inspectorCard) this.dom.inspectorCard.style.display = 'none';

      // Recreate component objects
      this.components = (data.components || []).map(c => {
        const def = window.COMPONENT_DEFINITIONS[c.type];
        return {
          id: c.id,
          type: c.type,
          x: c.x,
          y: c.y,
          rotation: c.rotation || 0,
          scale: c.scale !== undefined ? c.scale : 1.0,
          voltage: def ? (def.voltage || 0) : 0,
          terminals: def ? def.terminals.map(t => ({ ...t })) : [],
          state: { ...(def ? def.createState() : {}), ...(c.state || {}) }
        };
      });

      // Render DOM nodes & visuals
      this.components.forEach(comp => {
        this.renderComponentDom(comp);
        this.updateComponentVisual(comp);
      });

      // Recreate wires
      this.wires = (data.wires || []).map(w => ({
        id: w.id,
        fromComp: w.fromComp,
        fromPin: w.fromPin,
        toComp: w.toComp,
        toPin: w.toPin,
        color: w.color,
        points: w.points ? [...w.points] : [],
        fromPoint: w.fromPoint ? { ...w.fromPoint } : undefined,
        toPoint: w.toPoint ? { ...w.toPoint } : undefined
      }));

      this.renderWires();
      this.evaluateCircuit();
    } catch (err) {
      console.error('Failed restoring circuit state:', err);
    } finally {
      this.isRestoringState = false;
    }
  }

  // Vision of Short Circuit Electric Sparks
  renderShortCircuitSparks(status) {
    let layer = document.getElementById('short-sparks-layer');
    if (!layer) {
      layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      layer.id = 'short-sparks-layer';
      this.dom.wiresLayer.appendChild(layer);
    }
    layer.innerHTML = '';

    const sparkPoints = [];
    if (status.shortCircuitBatteries && status.shortCircuitBatteries.size > 0) {
      status.shortCircuitBatteries.forEach(batId => {
        const comp = this.components.find(c => c.id === batId);
        if (comp) {
          const def = window.COMPONENT_DEFINITIONS[comp.type];
          if (def && def.terminals) {
            def.terminals.forEach(term => {
              const pos = this.getPinAbsolutePos(comp.id, term.id);
              sparkPoints.push(pos);
            });
          }
        }
      });
    }

    if (sparkPoints.length === 0 && this.components.length > 0) {
      const c = this.components[0];
      sparkPoints.push({ x: c.x + 40, y: c.y + 30 });
    }

    sparkPoints.forEach(pt => {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 6 + Math.random() * 16;
        const sx = pt.x + Math.cos(angle) * dist;
        const sy = pt.y + Math.sin(angle) * dist;
        const sz = 6 + Math.random() * 8;

        const spark = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const pts = [
          `${sx},${sy - sz * 1.5}`,
          `${sx + sz * 0.4},${sy - sz * 0.4}`,
          `${sx + sz * 1.5},${sy}`,
          `${sx + sz * 0.4},${sy + sz * 0.4}`,
          `${sx},${sy + sz * 1.5}`,
          `${sx - sz * 0.4},${sy + sz * 0.4}`,
          `${sx - sz * 1.5},${sy}`,
          `${sx - sz * 0.4},${sy - sz * 0.4}`
        ].join(' ');
        spark.setAttribute('points', pts);
        spark.setAttribute('class', 'short-spark-burst');
        layer.appendChild(spark);
      }
    });
  }

  clearShortCircuitSparks() {
    const layer = document.getElementById('short-sparks-layer');
    if (layer) layer.innerHTML = '';
  }

  // Multimeter Tool
  toggleMultimeter(force = null) {
    this.multimeterActive = (force !== null) ? force : !this.multimeterActive;
    if (this.dom.multimeterRig) {
      this.dom.multimeterRig.style.display = this.multimeterActive ? 'block' : 'none';
    }
    if (this.dom.btnMultimeterToggle) {
      this.dom.btnMultimeterToggle.classList.toggle('active', this.multimeterActive);
    }

    if (this.multimeterActive) {
      if (!this.probes.red.x || isNaN(this.probes.red.x)) {
        this.probes.red.x = 280;
        this.probes.red.y = 120;
      }
      if (!this.probes.black.x || isNaN(this.probes.black.x)) {
        this.probes.black.x = 340;
        this.probes.black.y = 120;
      }
      if (this.dom.probeRed) {
        this.dom.probeRed.style.left = `${this.probes.red.x}px`;
        this.dom.probeRed.style.top = `${this.probes.red.y}px`;
      }
      if (this.dom.probeBlack) {
        this.dom.probeBlack.style.left = `${this.probes.black.x}px`;
        this.dom.probeBlack.style.top = `${this.probes.black.y}px`;
      }
      this.updateMultimeter();
      this.renderMultimeterCords();
    } else {
      this.multimeterReading = null;
      if (this.solver && this.solver.status) {
        this.solver.status.multimeterReading = null;
      }
    }
  }

  setMultimeterMode(mode = 'dcv') {
    this.multimeterMode = mode || 'dcv';
    const mmModeBtns = document.querySelectorAll('.mm-mode-btn');
    mmModeBtns.forEach(b => b.classList.toggle('active', (b.dataset.mode || '') === this.multimeterMode));
    const ind = document.getElementById('mm-mode-indicator');
    if (ind) {
      const labels = {
        dcv: 'DC V',
        acv: 'AC V',
        dca: 'DC mA',
        ohm: 'Ω OHM',
        cont: '🔊 CONT',
        diode: '▶| DIODE'
      };
      ind.textContent = labels[this.multimeterMode] || 'DC V';
    }
    this.updateMultimeter();
    this.updateChecklist();
    this.checkWinCondition(this.solver.status);
  }

  renderMultimeterCords() {
    if (!this.multimeterActive) return;
    const redCord = document.getElementById('cord-red-path');
    const blackCord = document.getElementById('cord-black-path');
    if (!redCord || !blackCord) return;

    try {
      const vinPos = this.getPinAbsolutePos('multimeter_tool', 'vin');
      const comPos = this.getPinAbsolutePos('multimeter_tool', 'com');
      const redProbePos = { x: this.probes.red.x + 16, y: this.probes.red.y + 45 };
      const blackProbePos = { x: this.probes.black.x + 16, y: this.probes.black.y + 45 };

      const genCord = (from, to, sag = 60) => {
        const midX = (from.x + to.x) / 2;
        const midY = Math.max(from.y, to.y) + sag;
        return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
      };

      redCord.setAttribute('d', genCord(vinPos, redProbePos, 65));
      blackCord.setAttribute('d', genCord(comPos, blackProbePos, 80));
    } catch (e) {
      // safe fallback if elements not mounted
    }
  }

  updateMultimeter() {
    // 1. Also update any legacy placed Multimeter components on the board if present
    this.components.forEach(comp => {
      if (comp.type === 'multimeter') {
        this.evaluateComponentMultimeter(comp);
      }
    });

    if (!this.multimeterActive) return;

    const mode = this.multimeterMode || 'dcv';

    // Check probe connections first
    let rPin = this.probes.red.snappedPin;
    let bPin = this.probes.black.snappedPin;

    // If probes aren't both connected, check if wires are connected to multimeter_tool jacks
    if (!rPin || !bPin) {
      const vinWire = this.wires.find(w => (w.fromComp === 'multimeter_tool' && w.fromPin === 'vin') || (w.toComp === 'multimeter_tool' && w.toPin === 'vin'));
      const comWire = this.wires.find(w => (w.fromComp === 'multimeter_tool' && w.fromPin === 'com') || (w.toComp === 'multimeter_tool' && w.toPin === 'com'));

      if (vinWire && !rPin) {
        const otherComp = (vinWire.fromComp === 'multimeter_tool' && vinWire.fromPin === 'vin') ? vinWire.toComp : vinWire.fromComp;
        const otherPin = (vinWire.fromComp === 'multimeter_tool' && vinWire.fromPin === 'vin') ? vinWire.toPin : vinWire.fromPin;
        rPin = `${otherComp}:${otherPin}`;
      }
      if (comWire && !bPin) {
        const otherComp = (comWire.fromComp === 'multimeter_tool' && comWire.fromPin === 'com') ? comWire.toComp : comWire.fromComp;
        const otherPin = (comWire.fromComp === 'multimeter_tool' && comWire.fromPin === 'com') ? comWire.toPin : comWire.fromPin;
        bPin = `${otherComp}:${otherPin}`;
      }
    }

    if (!rPin || !bPin) {
      const defaultReads = {
        dcv: '0.00 V',
        acv: '0.00 V~',
        dca: '0.0 mA',
        ohm: 'O.L MΩ',
        cont: 'O.L',
        diode: 'O.L'
      };
      const defVal = defaultReads[mode] || '0.00 V';
      this.dom.mmValueDisplay.textContent = defVal;
      this.dom.mmStatusDisplay.textContent = 'Connect wires to jacks or drag probes to circuit';
      this.multimeterReading = { value: defVal, status: this.dom.mmStatusDisplay.textContent, mode };
      if (this.solver && this.solver.status) {
        this.solver.status.multimeterReading = this.multimeterReading;
      }
      this.renderMultimeterCords();
      return;
    }

    // Evaluate reading between rPin and bPin
    const result = this.calculateMultimeterReading(mode, rPin, bPin);
    result.mode = mode;
    this.multimeterReading = result;
    if (this.solver && this.solver.status) {
      this.solver.status.multimeterReading = result;
    }
    this.dom.mmValueDisplay.textContent = result.value;
    this.dom.mmStatusDisplay.textContent = result.status;
    this.renderMultimeterCords();

    if (mode === 'cont' && result.isBeeping) {
      if (window.sounds && window.sounds.playContinuityBeep) {
        window.sounds.playContinuityBeep(0.18);
      }
    }
  }

  evaluateComponentMultimeter(comp) {
    const vinWire = this.wires.find(w => (w.fromComp === comp.id && w.fromPin === 'vin') || (w.toComp === comp.id && w.toPin === 'vin'));
    const comWire = this.wires.find(w => (w.fromComp === comp.id && w.fromPin === 'com') || (w.toComp === comp.id && w.toPin === 'com'));

    let rPin = null;
    let bPin = null;
    if (vinWire) {
      rPin = (vinWire.fromComp === comp.id && vinWire.fromPin === 'vin') ? `${vinWire.toComp}:${vinWire.toPin}` : `${vinWire.fromComp}:${vinWire.fromPin}`;
    }
    if (comWire) {
      bPin = (comWire.fromComp === comp.id && comWire.fromPin === 'com') ? `${comWire.toComp}:${comWire.toPin}` : `${comWire.fromComp}:${comWire.fromPin}`;
    }

    const mode = comp.state.mode || 'dcv';
    if (!rPin || !bPin) {
      comp.state.displayStr = (mode === 'ohm' || mode === 'cont' || mode === 'diode') ? 'O.L' : (mode === 'dca' ? '0.0 mA' : (mode === 'acv' ? '0.0 V~' : '0.00 V'));
    } else {
      const res = this.calculateMultimeterReading(mode, rPin, bPin);
      comp.state.displayStr = res.value;
      if (mode === 'cont' && res.isBeeping && window.sounds) {
        window.sounds.playContinuityBeep(0.15);
      }
    }
    const svgEl = document.querySelector(`#node-${comp.id} svg`);
    if (svgEl) {
      svgEl.innerHTML = window.ComponentRenderer.renderSVG(comp);
    }
    const headerNameEl = document.querySelector(`#node-${comp.id} .comp-header-name-badge`);
    if (headerNameEl) {
      headerNameEl.textContent = window.ComponentRenderer.getComponentDisplayName(comp);
    }
  }

  calculateMultimeterReading(mode, rPin, bPin) {
    if (rPin === bPin) {
      switch (mode) {
        case 'dcv': return { value: '0.00 V', status: 'Same Pin: 0.00 V Potential Difference' };
        case 'acv': return { value: '0.00 V~', status: 'Same Pin: 0V AC' };
        case 'dca': return { value: '0.0 mA', status: 'Zero Series Shunt Current' };
        case 'ohm': return { value: '0.00 Ω', status: 'Direct Short / Zero Ohms' };
        case 'cont': return { value: '0.0 Ω  BEEP', status: 'Solid Continuity: Direct Short / Same Node', isBeeping: true };
        case 'diode': return { value: '0.00 V SHORT', status: 'Direct Zero-Ohm Connection' };
      }
    }

    const [rCompId, rPinId] = rPin.split(':');
    const [bCompId, bPinId] = bPin.split(':');

    // Helper to extract node potential from circuit solver for probe polarity
    const getPinPotential = (pinKey) => {
      if (!this.solver) return 0;
      try {
        const { find } = this.solver.buildNets();
        const allPosRoots = new Set();
        const allNegRoots = new Set();
        const batteries = this.components.filter(c => c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'ac_source' || c.type === 'power_supply' || c.type === 'function_generator');
        for (const bat of batteries) {
          const pPin = (bat.type === 'ac_source') ? 'l' : (bat.type === 'function_generator' ? 'out' : 'pos');
          const nPin = (bat.type === 'ac_source') ? 'n' : (bat.type === 'function_generator' ? 'gnd' : 'neg');
          allPosRoots.add(find(`${bat.id}:${pPin}`));
          allNegRoots.add(find(`${bat.id}:${nPin}`));
        }
        const totV = this.solver.status.totalVoltage || 9.0;
        return this.solver.getNetTheveninVoltage(find(pinKey), allPosRoots, allNegRoots, totV, find);
      } catch (e) {
        return 0;
      }
    };

    // 1. Measuring directly across a single component
    if (rCompId === bCompId) {
      const comp = this.components.find(c => c.id === rCompId);
      if (!comp) return { value: '0.00 V', status: 'Component not found' };

      // A. Across power source (battery / cell / ac_source / power_supply / function_generator)
      if (comp.type === 'battery' || comp.type === 'cell' || comp.type === 'cell3v' || comp.type === 'ac_source' || comp.type === 'power_supply' || comp.type === 'function_generator') {
        if (comp.type === 'power_supply') {
          const v = comp.state.outputEnabled !== false ? (comp.state.actualVoltage !== undefined ? comp.state.actualVoltage : (comp.state.voltage !== undefined ? comp.state.voltage : 12.0)) : 0;
          let reading = 0;
          if (rPinId === 'pos' && (bPinId === 'neg' || bPinId === 'gnd')) {
            reading = v;
          } else if ((rPinId === 'neg' || rPinId === 'gnd') && bPinId === 'pos') {
            reading = -v;
          } else if (rPinId === 'pos') {
            reading = v;
          } else if (bPinId === 'pos') {
            reading = -v;
          } else {
            reading = 0;
          }
          const isPos = reading >= 0;
          const curMode = (comp.state.mode || 'cv').toUpperCase();
          switch (mode) {
            case 'dcv': return { value: `${isPos ? '+' : '-'}${Math.abs(reading).toFixed(2)} V`, status: `Regulated DC Supply: ${isPos ? 'Normal Polarity (+)' : 'Reversed Polarity (-)'} [${curMode} Mode]` };
            case 'acv': return { value: '0.00 V~', status: 'Regulated Clean DC: 0V AC Ripple' };
            case 'dca': {
              const actI = (comp.state.actualCurrent !== undefined && comp.state.actualCurrent > 0) ? comp.state.actualCurrent : (comp.state.currentLimit || 2.5);
              return { value: `${actI.toFixed(3)} A`, status: comp.state.mode === 'cc' ? 'Constant Current Clamp Limit (CC)' : 'Delivered Output Current' };
            }
            case 'ohm': {
              if ((rPinId === 'gnd' && bPinId === 'neg') || (rPinId === 'neg' && bPinId === 'gnd')) {
                return { value: '0.0 Ω', status: 'Chassis Earth Ground Link (Bonded 0V Reference)' };
              }
              return { value: 'ERR: LIVE', status: 'Live Power Supply Output: De-energize' };
            }
            case 'cont': {
              if ((rPinId === 'gnd' && bPinId === 'neg') || (rPinId === 'neg' && bPinId === 'gnd')) {
                return { value: '0.0 Ω  BEEP', status: 'Continuous Chassis Ground Bond', isBeeping: true };
              }
              return { value: 'ERR: LIVE', status: 'Live Power Supply Output' };
            }
            case 'diode': return { value: 'O.L', status: 'Linear Regulated Output' };
          }
        } else if (comp.type === 'ac_source') {
          const v = comp.state.voltage || 230;
          switch (mode) {
            case 'acv': return { value: `${v.toFixed(1)} V~`, status: `AC RMS Generator Output (${v}V AC)` };
            case 'dcv': return { value: '0.00 V', status: 'AC Source: Switch Multimeter to AC V (~)' };
            case 'dca': return { value: 'OVERLOAD', status: 'DANGER: Overcurrent (>10A Fuse Triggered!)' };
            case 'ohm': return { value: 'ERR: LIVE', status: 'Live AC Voltage: Disconnect power before measuring Ω!' };
            case 'cont': return { value: 'ERR: LIVE', status: 'Live AC Voltage: Disconnect power before continuity test!' };
            case 'diode': return { value: 'O.L', status: 'AC Source: Alternating waveform' };
          }
        } else if (comp.type === 'cell3v') {
          const v = comp.state.terminalVoltage !== undefined ? comp.state.terminalVoltage : (comp.state.actualVoltage || 3.20);
          const reading = (rPinId === 'pos') ? v : -v;
          const isPos = reading >= 0;
          const esr = comp.state.internalR || 18.0;
          const shortI = (comp.state.openCircuitVoltage || 3.20) / esr; // ~178 mA
          switch (mode) {
            case 'dcv': return { value: `${isPos ? '+' : '-'}${Math.abs(reading).toFixed(2)} V`, status: `CR2032 Cell: ${isPos ? 'Normal Polarity (Red on +, Black on -)' : 'Reversed Polarity (Red on -, Black on +)'}` };
            case 'acv': return { value: '0.00 V~', status: 'Pure DC Lithium Coin Cell: Zero AC Component' };
            case 'dca': return { value: `${(shortI * 1000).toFixed(0)} mA`, status: `CR2032 Short-Circuit Current (limited by ${esr.toFixed(0)}Ω ESR: 3.2V / ${esr.toFixed(0)}Ω ≈ ${(shortI * 1000).toFixed(0)}mA)! Warning: Overload >50mA!` };
            case 'ohm': return { value: 'ERR: LIVE', status: 'Live Voltage Detected: De-energize to measure Ω' };
            case 'cont': return { value: 'ERR: LIVE', status: 'Live Voltage Detected: De-energize for continuity' };
            case 'diode': return { value: 'O.L', status: 'Chemical Cell: No semiconductor P-N junction' };
          }
        } else if (comp.type === 'function_generator') {
          const outOn = comp.state.outputEnabled !== false;
          const isSync = (rPinId === 'sync' || bPinId === 'sync');
          const isReversed = (rPinId === 'gnd' || bPinId === 'out' || bPinId === 'sync');
          const wave = comp.state.waveform || 'sine';
          const freq = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
          const vpp = comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 10.0;
          const offset = comp.state.dcOffset !== undefined ? comp.state.dcOffset : (comp.state.offsetVoltage || 0.0);
          const duty = comp.state.dutyCycle !== undefined ? comp.state.dutyCycle : 50;

          if (isSync) {
            // SYNC output: 0 to 5V TTL logic clock pulse
            switch (mode) {
              case 'dcv': {
                const vSyncAvg = outOn ? 2.50 : 0.00;
                return { value: `${isReversed ? '-' : '+'}${vSyncAvg.toFixed(2)} V`, status: `TTL Sync Clock: 0-5V Logic Pulse (${freq} Hz, 50% Duty)` };
              }
              case 'acv': {
                const vSyncRms = outOn ? 3.54 : 0.00;
                return { value: `${vSyncRms.toFixed(2)} V~`, status: `TTL Sync Clock: 0-5V True RMS (${freq} Hz)` };
              }
              case 'dca': return { value: outOn ? '0.025 A' : '0.000 A', status: 'TTL Driver Short-Circuit Protection' };
              case 'ohm': return { value: 'ERR: LIVE', status: 'Active Signal Output: De-energize to measure Ω' };
              case 'cont': return { value: 'ERR: LIVE', status: 'Active Signal Output: De-energize for continuity' };
              case 'diode': return { value: 'O.L', status: 'Digital Logic Output Stage' };
            }
          } else {
            // Main Output (out and gnd)
            let vrms = 0;
            if (outOn) {
              if (wave === 'square') {
                const d = Math.max(0.01, Math.min(0.99, duty / 100));
                const vH = offset + vpp / 2;
                const vL = offset - vpp / 2;
                vrms = Math.sqrt(d * vH * vH + (1 - d) * vL * vL);
              } else if (wave === 'triangle' || wave === 'ramp') {
                vrms = Math.sqrt(Math.pow(vpp / (2 * Math.sqrt(3)), 2) + Math.pow(offset, 2));
              } else if (wave === 'sine') {
                vrms = Math.sqrt(Math.pow(vpp / (2 * Math.SQRT2), 2) + Math.pow(offset, 2));
              } else if (wave === 'dc') {
                vrms = Math.abs(offset);
              }
            }
            switch (mode) {
              case 'acv': return {
                value: `${vrms.toFixed(2)} V~`,
                status: outOn ? `True RMS (${wave.toUpperCase()}, ${freq} Hz, ${vpp.toFixed(1)} Vpp)` : 'Signal Output OFF'
              };
              case 'dcv': {
                const dcv = outOn ? (isReversed ? -offset : offset) : 0;
                return {
                  value: `${dcv >= 0 ? '+' : '-'}${Math.abs(dcv).toFixed(2)} V`,
                  status: outOn ? `DC Offset Voltage (${offset >= 0 ? '+' : ''}${offset.toFixed(2)} V bias)` : 'Signal Output OFF'
                };
              }
              case 'dca': return {
                value: outOn ? '0.200 A' : '0.000 A',
                status: 'Function Generator 50Ω Output Current Limit'
              };
              case 'ohm': {
                if (!outOn) {
                  const isHz = comp.state.outputImpedance === 'highz' || comp.state.outputImpedance === 'high_z';
                  return { value: isHz ? 'O.L' : '50.0 Ω', status: `Internal Output Source Termination (${isHz ? 'High-Z' : '50 Ω'})` };
                }
                return { value: 'ERR: LIVE', status: 'Live Signal Output: De-energize to measure Ω' };
              }
              case 'cont': return { value: 'ERR: LIVE', status: 'Signal Generator Terminals' };
              case 'diode': return { value: 'O.L', status: 'Push-Pull Output Buffer' };
            }
          }
        } else {
          const v = (comp.state.terminalVoltage !== undefined)
            ? comp.state.terminalVoltage
            : (comp.voltage || (comp.type === 'cell' ? 1.5 : 9.0));
          const reading = (rPinId === 'pos') ? v : -v;
          const isPos = reading >= 0;
          const name = comp.name || 'Power Source';
          switch (mode) {
            case 'dcv': return {
              value: `${isPos ? '+' : '-'}${Math.abs(reading).toFixed(2)} V`,
              status: isPos
                ? `${name}: Normal Polarity (Red Probe [+] on POS / Black on NEG: +${Math.abs(reading).toFixed(2)}V)`
                : `${name}: Reversed Polarity (Red Probe [−] on NEG / Black on POS: -${Math.abs(reading).toFixed(2)}V)`
            };
            case 'acv': return { value: '0.00 V~', status: 'Pure DC Source: Zero AC Component' };
            case 'dca': return { value: 'OVERLOAD', status: 'DANGER: Short circuit through Ammeter (>10A Blown Fuse)' };
            case 'ohm': return { value: 'ERR: LIVE', status: 'Live Voltage Detected: De-energize to measure Ω' };
            case 'cont': return { value: 'ERR: LIVE', status: 'Live Voltage Detected: De-energize for continuity' };
            case 'diode': return { value: 'O.L', status: 'Chemical Cell: No semiconductor P-N junction' };
          }
        }
      }

      // B. Across Semiconductor Diode
      if (comp.type === 'diode') {
        const isFwd = (rPinId === 'anode' && bPinId === 'cathode');
        const isRev = (rPinId === 'cathode' && bPinId === 'anode');
        switch (mode) {
          case 'diode':
            if (isFwd) return { value: '0.71 V', status: '1N4007 Silicon Diode: Forward Conduction Barrier Drop ▶|' };
            if (isRev) return { value: 'O.L', status: 'Diode Reverse Biased: Blocking All Current ⛔' };
            return { value: '0.00 V', status: 'Diode: Attach Anode (+) and Cathode (-)' };
          case 'ohm':
            if (isFwd) return { value: '8.00 Ω', status: 'Diode Forward Dynamic Resistance' };
            if (isRev) return { value: 'O.L MΩ', status: 'Diode Reverse Resistance: Infinite / Megaohms' };
            return { value: 'O.L MΩ', status: 'Diode Resistance' };
          case 'cont':
            if (isFwd) return { value: '0.7 Ω  BEEP', status: 'Forward Biased Diode: Conductive Path', isBeeping: true };
            return { value: 'O.L', status: 'Reverse Biased Diode: No Continuity' };
          case 'dcv': {
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = Math.abs(diffV) > 0.01 ? Math.abs(diffV) : (comp.state.voltageDrop || 0);
            const signedV = Math.abs(diffV) > 0.01 ? diffV : (isFwd ? absV : -absV);
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Diode Operating Drop: Normal Polarity (Red Probe [+] on Anode / Black on Cathode: +${Math.abs(signedV).toFixed(2)}V)`
                : `Diode Operating Drop: Reversed Polarity (Red Probe [−] on Cathode / Black on Anode: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': return { value: '0.00 V~', status: 'Rectified DC Path' };
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: 'Loop Current flowing through Diode' };
          }
        }
      }

      // C. Across LED (Light Emitting Diode)
      if (comp.type === 'led') {
        const isFwd = (rPinId === 'anode' && bPinId === 'cathode');
        const isRev = (rPinId === 'cathode' && bPinId === 'anode');
        const ledVMap = { red: 2.10, green: 2.20, blue: 2.80, yellow: 2.10, purple: 2.90 };
        const ledDrop = ledVMap[comp.state.color] || 2.10;
        switch (mode) {
          case 'diode':
            if (isFwd) return { value: `${ledDrop.toFixed(2)} V`, status: `${comp.state.color.toUpperCase()} LED Forward Turn-On Voltage ▶|` };
            if (isRev) return { value: 'O.L', status: 'LED Reverse Biased: Blocked ⛔' };
            return { value: '0.00 V', status: 'LED Test' };
          case 'ohm':
            if (isFwd) return { value: '60.0 Ω', status: 'LED Forward Conduction Resistance' };
            return { value: 'O.L MΩ', status: 'LED Reverse Resistance: Infinite' };
          case 'cont':
            return { value: 'O.L', status: 'LED Threshold (~2.1V) exceeds continuity test voltage' };
          case 'dcv': {
            const rect = comp.state.rectification;
            if (rect === 'half_wave') {
              const vdc = comp.state.vdcAvg || (comp.state.voltageDrop * 0.45);
              const sign = isRev ? -1 : 1;
              const signed = sign * vdc;
              return { value: `${signed >= 0 ? '+' : '-'}${Math.abs(signed).toFixed(2)} V`, status: `Half-Wave Rectified (Pulsed DC: ${signed >= 0 ? '+' : '-'}${Math.abs(signed).toFixed(2)}V)` };
            }
            if (rect === 'full_wave') {
              const vdc = comp.state.vdcAvg || (comp.state.voltageDrop * 0.90);
              const sign = isRev ? -1 : 1;
              const signed = sign * vdc;
              return { value: `${signed >= 0 ? '+' : '-'}${Math.abs(signed).toFixed(2)} V`, status: `Full-Wave Bridge Output (${signed >= 0 ? '+' : '-'}${Math.abs(signed).toFixed(2)}V)` };
            }
            if (rect === 'ac') {
              return { value: '0.00 V', status: 'Symmetric AC: Average DC = 0.00 V (Switch to ACV ~ mode)' };
            }
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = Math.abs(diffV) > 0.01 ? Math.abs(diffV) : (comp.state.voltageDrop || 0);
            const signedV = Math.abs(diffV) > 0.01 ? diffV : (isFwd ? absV : -absV);
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `${comp.state.color.toUpperCase()} LED: Normal Polarity (Red Probe [+] on Anode / Black on Cathode: +${Math.abs(signedV).toFixed(2)}V)`
                : `${comp.state.color.toUpperCase()} LED: Reversed Polarity (Red Probe [−] on Cathode / Black on Anode: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': {
            const rect = comp.state.rectification;
            if (rect === 'half_wave' || rect === 'full_wave') {
              const vrms = comp.state.vrmsEff || comp.state.voltageDrop || 0;
              return { value: `${vrms.toFixed(2)} V~`, status: `${rect === 'half_wave' ? 'Half-Wave' : 'Full-Wave'} Ripple RMS Component` };
            }
            if (rect === 'ac') {
              const vd = comp.state.voltageDrop || 0;
              return { value: `${vd.toFixed(2)} V~`, status: `AC RMS Voltage Drop` };
            }
            return { value: '0.00 V~', status: 'DC LED Component' };
          }
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: 'Operating Current through LED' };
          }
        }
      }

      // D. Across Fixed Resistor
      if (comp.type === 'resistor') {
        const rVal = window.getClosestStandardResistor(comp.state.resistance || 220);
        switch (mode) {
          case 'ohm':
            return { value: window.formatResistance(rVal), status: `Standard Preferred Fixed Resistor (${rVal} Ω)` };
          case 'cont':
            if (rVal <= 15) return { value: `${rVal}.0 Ω  BEEP`, status: 'Low Resistance Path < 15Ω', isBeeping: true };
            return { value: 'O.L', status: `Resistance (${rVal}Ω) exceeds 15Ω continuity limit` };
          case 'dcv': {
            const rect = comp.state.rectification;
            if (rect === 'half_wave') {
              const vdc = comp.state.vdcAvg || (comp.state.voltageDrop * 0.45);
              return { value: `+${vdc.toFixed(2)} V`, status: `Half-Wave Rectified DC (V_avg = V_pk/π = ${vdc.toFixed(2)}V)` };
            }
            if (rect === 'full_wave') {
              const vdc = comp.state.vdcAvg || (comp.state.voltageDrop * 0.90);
              return { value: `+${vdc.toFixed(2)} V`, status: `Full-Wave Bridge Rectified DC (V_avg = 2×V_pk/π = ${vdc.toFixed(2)}V)` };
            }
            if (rect === 'ac') {
              return { value: '0.00 V', status: 'Symmetric AC: Average DC = 0.00 V (Switch to ACV ~ mode)' };
            }
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = (comp.state.voltageDrop !== undefined && comp.state.voltageDrop > 0.01)
              ? comp.state.voltageDrop
              : (Math.abs(diffV) > 0.01 ? Math.abs(diffV) : 0);
            const signedV = Math.abs(diffV) > 0.01 ? (diffV >= 0 ? absV : -absV) : ((rPinId === 'pin1' || rPinId === 'p1' || rPinId === 't1') ? absV : -absV);
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Resistor (${rVal}Ω): Normal Polarity (Red Probe [+] > Black Probe [−]: +${Math.abs(signedV).toFixed(2)}V)`
                : `Resistor (${rVal}Ω): Reversed Polarity (Red Probe [−] < Black Probe [+]: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': {
            const rect = comp.state.rectification;
            if (rect === 'half_wave' || rect === 'full_wave') {
              const vrms = comp.state.vrmsEff || comp.state.voltageDrop || 0;
              return { value: `${vrms.toFixed(2)} V~`, status: `${rect === 'half_wave' ? 'Half-Wave' : 'Full-Wave'} Ripple RMS Component` };
            }
            if (rect === 'ac') {
              const vd = comp.state.voltageDrop || 0;
              return { value: `${vd.toFixed(2)} V~`, status: `AC RMS Voltage Drop` };
            }
            return { value: '0.00 V~', status: 'Pure DC: Zero AC Component' };
          }
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: 'Current through Resistor' };
          }
          case 'diode':
            return { value: 'O.L', status: 'Linear Resistor (No P-N Junction)' };
        }
      }

      // E. Across Variable Resistor (Potentiometer)
      if (comp.type === 'potentiometer') {
        const totalR = comp.state.totalResistance || 1000;
        const ratio = comp.state.wiperRatio !== undefined ? comp.state.wiperRatio : (comp.state.resistance ? comp.state.resistance / totalR : 0.5);
        const r1 = Math.max(1, Math.round((1 - ratio) * totalR));
        const r2 = Math.max(1, Math.round(ratio * totalR));

        const isR1 = (rPinId === 'pin1' && bPinId === 'wiper') || (rPinId === 'wiper' && bPinId === 'pin1');
        const isR2 = (rPinId === 'wiper' && bPinId === 'pin2') || (rPinId === 'pin2' && bPinId === 'wiper');
        const isTrack = (rPinId === 'pin1' && bPinId === 'pin2') || (rPinId === 'pin2' && bPinId === 'pin1');

        const measuredR = isR1 ? r1 : (isTrack ? totalR : r2);
        const pairLabel = isR1
          ? `R1 (Pin 1 to Wiper: ${r1}Ω)`
          : (isTrack
            ? `R_total = R1 + R2 = ${totalR}Ω (End-to-End)`
            : `R2 (Wiper to Pin 3: ${r2}Ω)`);

        switch (mode) {
          case 'ohm':
            return { value: `${measuredR} Ω`, status: `Potentiometer ${pairLabel}` };
          case 'cont':
            if (measuredR <= 15) return { value: `${measuredR} Ω  BEEP`, status: `Low Resistance Continuity across ${pairLabel}`, isBeeping: true };
            return { value: 'O.L', status: `${pairLabel} (${measuredR}Ω) exceeds continuity threshold` };
          case 'dcv': {
            const vTot = comp.state.voltageDrop || 0;
            const vW = (comp.state.wiperVoltage !== undefined) ? comp.state.wiperVoltage : (vTot * ratio);
            let vPair = 0;
            let statusText = '';
            if (isTrack) {
              vPair = (rPinId === 'pin1') ? vTot : -vTot;
              statusText = (vPair >= 0)
                ? `Input Track Voltage Vin: Normal Polarity (Red on Pin 1 [+], Black on Pin 3 [−]: +${Math.abs(vPair).toFixed(2)}V)`
                : `Input Track Voltage Vin: Reversed Polarity (Red on Pin 3 [−], Black on Pin 1 [+]: -${Math.abs(vPair).toFixed(2)}V)`;
            } else if (isR2) {
              vPair = (rPinId === 'wiper') ? vW : -vW;
              statusText = (vPair >= 0)
                ? `Wiper Output (Vout): Normal Polarity (Red on Wiper [+], Black on Pin 3 [GND]: +${Math.abs(vPair).toFixed(2)}V)`
                : `Wiper Output (Vout): Reversed Polarity (Red on Pin 3 [GND], Black on Wiper [+]: -${Math.abs(vPair).toFixed(2)}V)`;
            } else if (isR1) {
              const vr1 = vTot - vW;
              vPair = (rPinId === 'pin1') ? vr1 : -vr1;
              statusText = (vPair >= 0)
                ? `Upper Track Drop (VR1): Normal Polarity (Red on Pin 1 [+], Black on Wiper [−]: +${Math.abs(vPair).toFixed(2)}V)`
                : `Upper Track Drop (VR1): Reversed Polarity (Red on Wiper [−], Black on Pin 1 [+]: -${Math.abs(vPair).toFixed(2)}V)`;
            } else {
              vPair = vW;
              statusText = `Potentiometer Output: ${vPair >= 0 ? '+' : '-'}${Math.abs(vPair).toFixed(2)}V`;
            }
            return { value: `${vPair >= 0 ? '+' : '-'}${Math.abs(vPair).toFixed(2)} V`, status: statusText };
          }
          case 'acv': {
            const vd = comp.state.voltageDrop || 0;
            const vPair = isR1 ? (vd * (1 - ratio)) : (isTrack ? vd : (vd * ratio));
            return { value: `${vPair.toFixed(2)} V~`, status: `AC Potential across ${pairLabel}` };
          }
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: 'Current through Potentiometer Track' };
          }
          case 'diode':
            return { value: 'O.L', status: 'Linear Resistive Track (No P-N Junction)' };
        }
      }

      // F. Across Single Pole Switch
      if (comp.type === 'switch') {
        const isClosed = comp.state.closed;
        switch (mode) {
          case 'ohm':
            return isClosed
              ? { value: '0.10 Ω', status: 'Single Pole Switch CLOSED: 0.1Ω Contact Resistance' }
              : { value: 'O.L MΩ', status: 'Single Pole Switch OPEN: Air Gap Infinite Resistance' };
          case 'cont':
            return isClosed
              ? { value: '0.0 Ω  BEEP', status: 'Switch CLOSED: Full Continuity!', isBeeping: true }
              : { value: 'O.L', status: 'Switch OPEN: Open Circuit (No Continuity)' };
          case 'dcv': {
            if (isClosed) return { value: '0.00 V', status: 'Switch CLOSED: Zero Drop across contacts' };
            const vTot = this.solver.status.totalVoltage || 9.0;
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = Math.abs(diffV) > 0.01 ? Math.abs(diffV) : vTot;
            const signedV = (vR >= vB) ? absV : -absV;
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Switch OPEN: Normal Polarity (Red Probe [+] > Black Probe [−]: +${Math.abs(signedV).toFixed(2)}V)`
                : `Switch OPEN: Reversed Polarity (Red Probe [−] < Black Probe [+]: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': return { value: isClosed ? '0.00 V~' : '230 V~', status: isClosed ? '0V drop' : 'Open AC gap' };
          case 'dca': {
            const ma = (this.solver.status.totalCurrent || 0) * 1000;
            return isClosed
              ? { value: `${ma.toFixed(1)} mA`, status: 'Circuit Loop Current through Switch' }
              : { value: '0.0 mA', status: 'Switch Open: No Current Flow' };
          }
          case 'diode': return isClosed ? { value: '0.00 V SHORT', status: 'Closed Contacts' } : { value: 'O.L', status: 'Open Contacts' };
        }
      }

      // Across Pushbutton Switch
      if (comp.type === 'pushbutton') {
        const isClosed = comp.state.pressed;
        switch (mode) {
          case 'ohm':
            return isClosed
              ? { value: '0.10 Ω', status: 'Pushbutton PRESSED: 0.1Ω Contact Resistance' }
              : { value: 'O.L MΩ', status: 'Pushbutton RELEASED: Air Gap Infinite Resistance' };
          case 'cont':
            return isClosed
              ? { value: '0.0 Ω  BEEP', status: 'Pushbutton PRESSED: Full Continuity!', isBeeping: true }
              : { value: 'O.L', status: 'Pushbutton RELEASED: Open Circuit (No Continuity)' };
          case 'dcv': {
            if (isClosed) return { value: '0.00 V', status: 'Pushbutton PRESSED: Zero Drop across contacts' };
            const vTot = this.solver.status.totalVoltage || 9.0;
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = Math.abs(diffV) > 0.01 ? Math.abs(diffV) : vTot;
            const signedV = (vR >= vB) ? absV : -absV;
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Pushbutton RELEASED: Normal Polarity (Red Probe [+] > Black Probe [−]: +${Math.abs(signedV).toFixed(2)}V)`
                : `Pushbutton RELEASED: Reversed Polarity (Red Probe [−] < Black Probe [+]: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': return { value: isClosed ? '0.00 V~' : '230 V~', status: isClosed ? '0V drop' : 'Open AC gap' };
          case 'dca': {
            const ma = (this.solver.status.totalCurrent || 0) * 1000;
            return isClosed
              ? { value: `${ma.toFixed(1)} mA`, status: 'Circuit Current through Pushbutton' }
              : { value: '0.0 mA', status: 'Pushbutton Released: No Current Flow' };
          }
          case 'diode': return isClosed ? { value: '0.00 V SHORT', status: 'Closed Contacts' } : { value: 'O.L', status: 'Open Contacts' };
        }
      }

      // Across Capacitors (Electrolytic / Ceramic)
      if (comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
        const isAnode = (rPinId === 'anode' && bPinId === 'cathode');
        const capVal = comp.state.capacitance || (comp.type === 'ceramic_capacitor' ? (comp.state.capacitanceNf || 100) : 1000);
        const unit = comp.type === 'ceramic_capacitor' ? 'nF' : 'µF';
        switch (mode) {
          case 'ohm': return { value: 'O.L MΩ', status: `Capacitor (${capVal} ${unit}): Open circuit to steady DC` };
          case 'cont': return { value: 'O.L', status: `Capacitor Dielectric Barrier (No DC Continuity)` };
          case 'dcv': {
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const storedV = comp.state.storedVoltage || comp.state.voltageDrop || 0;
            const absV = Math.abs(diffV) > 0.01 ? Math.abs(diffV) : storedV;
            const signedV = Math.abs(diffV) > 0.01 ? diffV : (isAnode ? absV : -absV);
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Capacitor Voltage: Normal Polarity (Red Probe [+] on Anode / Black on Cathode: +${Math.abs(signedV).toFixed(2)}V)`
                : `Capacitor Voltage: Reversed Polarity (Red Probe [−] on Cathode / Black on Anode: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': {
            const vd = comp.state.voltageDrop || 0;
            return { value: `${vd.toFixed(2)} V~`, status: `AC Voltage across Capacitor` };
          }
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: `Discharge / Ripple Current` };
          }
          case 'diode': return { value: 'O.L', status: 'Dielectric Insulation' };
        }
      }

      // Across Power Choke Inductor
      if (comp.type === 'inductor') {
        const indMh = comp.state.inductanceMh || 10;
        const dcr = comp.state.dcr || 0.8;
        const xl = comp.state.reactanceXl || 0;
        const z = comp.state.impedanceZ || dcr;
        switch (mode) {
          case 'ohm': return { value: `${dcr.toFixed(2)} Ω`, status: `Inductor DC Winding Resistance (DCR = ${dcr.toFixed(2)}Ω, L = ${window.formatInductance ? window.formatInductance(indMh) : indMh + 'mH'})` };
          case 'cont': return { value: `${dcr.toFixed(2)} Ω  BEEP`, status: `Continuous Copper Windings (DCR = ${dcr.toFixed(2)}Ω)`, isBeeping: true };
          case 'dcv': {
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = Math.abs(diffV) > 0.01 ? Math.abs(diffV) : (comp.state.voltageDrop || 0);
            const signedV = (vR >= vB) ? absV : -absV;
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Inductor DCR Drop: Normal Polarity (Red Probe [+] > Black Probe [−]: +${Math.abs(signedV).toFixed(2)}V)`
                : `Inductor DCR Drop: Reversed Polarity (Red Probe [−] < Black Probe [+]: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': {
            const vd = comp.state.voltageDrop || 0;
            return { value: `${vd.toFixed(2)} V~`, status: `AC Reactance Voltage (X_L = ${xl.toFixed(1)}Ω, Z = ${z.toFixed(1)}Ω)` };
          }
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: `Current through Inductor Coil` };
          }
          case 'diode': return { value: '0.00 V SHORT', status: 'Continuous non-polarized copper coil' };
        }
      }

      // G. Across Incandescent Bulb
      if (comp.type === 'bulb') {
        switch (mode) {
          case 'ohm': return { value: '100.0 Ω', status: 'Incandescent Bulb Tungsten Filament (100 Ω)' };
          case 'cont': return { value: 'O.L', status: 'Filament (100Ω) exceeds 15Ω continuity limit' };
          case 'dcv': {
            const rect = comp.state.rectification;
            if (rect === 'half_wave') {
              const vdc = comp.state.vdcAvg || (comp.state.voltageDrop * 0.45);
              return { value: `+${vdc.toFixed(2)} V`, status: `Half-Wave Rectified DC (V_avg = ${vdc.toFixed(2)}V)` };
            }
            if (rect === 'full_wave') {
              const vdc = comp.state.vdcAvg || (comp.state.voltageDrop * 0.90);
              return { value: `+${vdc.toFixed(2)} V`, status: `Full-Wave Bridge Rectified DC (V_avg = ${vdc.toFixed(2)}V)` };
            }
            if (rect === 'ac') {
              return { value: '0.00 V', status: 'Symmetric AC: Average DC = 0.00 V (Switch to ACV ~ mode)' };
            }
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = (comp.state.voltageDrop !== undefined && comp.state.voltageDrop > 0.01)
              ? comp.state.voltageDrop
              : (Math.abs(diffV) > 0.01 ? Math.abs(diffV) : 0);
            const signedV = Math.abs(diffV) > 0.01 ? (diffV >= 0 ? absV : -absV) : ((rPinId === 'pin1' || rPinId === 'p1' || rPinId === 't1') ? absV : -absV);
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Bulb Filament: Normal Polarity (Red Probe [+] > Black Probe [−]: +${Math.abs(signedV).toFixed(2)}V)`
                : `Bulb Filament: Reversed Polarity (Red Probe [−] < Black Probe [+]: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': {
            const rect = comp.state.rectification;
            if (rect === 'half_wave' || rect === 'full_wave') {
              const vrms = comp.state.vrmsEff || comp.state.voltageDrop || 0;
              return { value: `${vrms.toFixed(2)} V~`, status: `${rect === 'half_wave' ? 'Half-Wave' : 'Full-Wave'} AC Component` };
            }
            const vd = comp.state.voltageDrop || 0;
            return { value: `${vd.toFixed(2)} V~`, status: `AC Voltage across Bulb` };
          }
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: 'Current through Bulb' };
          }
          case 'diode': return { value: 'O.L', status: 'Non-polarized Tungsten Filament' };
        }
      }

      // H. Across DC Electric Motor
      if (comp.type === 'motor') {
        switch (mode) {
          case 'ohm': return { value: '50.0 Ω', status: 'DC Motor Copper Windings (50 Ω)' };
          case 'cont': return { value: 'O.L', status: 'Motor Windings (50Ω) exceed 15Ω continuity limit' };
          case 'dcv': {
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = (comp.state.voltageDrop !== undefined && comp.state.voltageDrop > 0.01)
              ? comp.state.voltageDrop
              : (Math.abs(diffV) > 0.01 ? Math.abs(diffV) : 0);
            const signedV = Math.abs(diffV) > 0.01 ? (diffV >= 0 ? absV : -absV) : ((rPinId === 'pin1' || rPinId === 'p1' || rPinId === 't1') ? absV : -absV);
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `DC Motor: Normal Polarity (Red Probe [+] > Black Probe [−]: +${Math.abs(signedV).toFixed(2)}V)`
                : `DC Motor: Reversed Polarity (Red Probe [−] < Black Probe [+]: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': return { value: '0.00 V~', status: 'DC Electric Motor' };
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: 'Motor Armature Current' };
          }
          case 'diode': return { value: 'O.L', status: 'Inductive Armature Coil' };
        }
      }

      // I. Across Buzzer
      if (comp.type === 'buzzer') {
        switch (mode) {
          case 'ohm': return { value: '80.0 Ω', status: 'Piezo Buzzer Transducer (80 Ω)' };
          case 'cont': return { value: 'O.L', status: 'Buzzer (80Ω) exceeds continuity threshold' };
          case 'dcv': {
            const vR = getPinPotential(rPin);
            const vB = getPinPotential(bPin);
            const diffV = vR - vB;
            const absV = (comp.state.voltageDrop !== undefined && comp.state.voltageDrop > 0.01)
              ? comp.state.voltageDrop
              : (Math.abs(diffV) > 0.01 ? Math.abs(diffV) : 0);
            const signedV = Math.abs(diffV) > 0.01 ? (diffV >= 0 ? absV : -absV) : ((rPinId === 'pin1' || rPinId === 'p1' || rPinId === 't1') ? absV : -absV);
            const isPos = signedV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(signedV).toFixed(2)} V`,
              status: isPos
                ? `Piezo Buzzer: Normal Polarity (Red Probe [+] > Black Probe [−]: +${Math.abs(signedV).toFixed(2)}V)`
                : `Piezo Buzzer: Reversed Polarity (Red Probe [−] < Black Probe [+]: -${Math.abs(signedV).toFixed(2)}V)`
            };
          }
          case 'acv': return { value: '0.00 V~', status: 'DC Piezo Buzzer' };
          case 'dca': {
            const ma = (comp.state.current || 0) * 1000;
            return { value: `${ma.toFixed(1)} mA`, status: 'Current through Buzzer' };
          }
          case 'diode': return { value: 'O.L', status: 'Piezo Acoustic Transducer' };
        }
      }

      // J. Across Transformer
      if (comp.type === 'transformer') {
        const isPri = (rPinId === 'pri1' || rPinId === 'pri2');
        if (isPri) {
          switch (mode) {
            case 'ohm': return { value: '5.00 Ω', status: 'Transformer Primary High-Voltage Coil (5 Ω)' };
            case 'cont': return { value: '5.0 Ω  BEEP', status: 'Primary Coil Continuous Path', isBeeping: true };
            case 'acv': return { value: '230 V~', status: 'Primary AC Mains Input' };
            case 'dcv': return { value: '0.00 V', status: 'Transformer operates only on AC' };
            case 'dca': return { value: '0.0 mA', status: 'Primary Idle Current' };
            case 'diode': return { value: '0.00 V SHORT', status: 'Inductive Copper Coil' };
          }
        } else {
          switch (mode) {
            case 'ohm': return { value: '1.20 Ω', status: 'Transformer Secondary Low-Voltage Coil (1.2 Ω)' };
            case 'cont': return { value: '1.2 Ω  BEEP', status: 'Secondary Coil Continuous Path', isBeeping: true };
            case 'acv': return { value: `${(comp.state.secondaryV || 12).toFixed(1)} V~`, status: 'Stepped-Down Secondary AC Output' };
            case 'dcv': return { value: '0.00 V', status: 'AC Secondary' };
            case 'dca': return { value: '0.0 mA', status: 'Secondary Current' };
            case 'diode': return { value: '0.00 V SHORT', status: 'Secondary Copper Coil' };
          }
        }
      }
    }

    // 2. Probing across arbitrary nets
    if (this.solver) {
      const { find } = this.solver.buildNets();
      const rNet = find(rPin);
      const bNet = find(bPin);
      if (rNet === bNet) {
        switch (mode) {
          case 'dcv': return { value: '0.00 V', status: 'Equipotential: Same Electrical Net (0.00 V)' };
          case 'acv': return { value: '0.00 V~', status: 'Equipotential Net: 0V AC' };
          case 'dca': return { value: '0.0 mA', status: 'Same Net: Zero Potential Gradient' };
          case 'ohm': return { value: '0.00 Ω', status: 'Direct Continuity: Same Electrical Node' };
          case 'cont': return { value: '0.0 Ω  BEEP', status: 'Full Continuity: Connected Wire Net', isBeeping: true };
          case 'diode': return { value: '0.00 V SHORT', status: 'Direct Wire Connection' };
        }
      }

      const allPosRoots = new Set();
      const allNegRoots = new Set();
      const batteries = this.components.filter(c => c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'ac_source' || c.type === 'power_supply' || c.type === 'function_generator');
      for (const bat of batteries) {
        const pPin = (bat.type === 'ac_source') ? 'l' : (bat.type === 'function_generator' ? 'out' : 'pos');
        const nPin = (bat.type === 'ac_source') ? 'n' : (bat.type === 'function_generator' ? 'gnd' : 'neg');
        allPosRoots.add(find(`${bat.id}:${pPin}`));
        allNegRoots.add(find(`${bat.id}:${nPin}`));
      }
      const totV = this.solver.status.totalVoltage || 9.0;
      const vR = this.solver.getNetTheveninVoltage(rNet, allPosRoots, allNegRoots, totV, find);
      const vB = this.solver.getNetTheveninVoltage(bNet, allPosRoots, allNegRoots, totV, find);
      const diffV = vR - vB;
      const ma = (this.solver.status.totalCurrent || 0) * 1000;
      const eqR = this.solver.status.equivalentResistance || 0;

      if (this.solver.status.isComplete || Math.abs(diffV) > 0.01) {
        switch (mode) {
          case 'dcv': {
            const isPos = diffV >= 0;
            return {
              value: `${isPos ? '+' : '-'}${Math.abs(diffV).toFixed(2)} V`,
              status: isPos
                ? `Normal Polarity (Red [+] > Black [−]: +${Math.abs(diffV).toFixed(2)}V)`
                : `Reversed Polarity (Red [−] < Black [+]: -${Math.abs(diffV).toFixed(2)}V)`
            };
          }
          case 'acv': return { value: `${Math.abs(diffV).toFixed(2)} V~`, status: 'AC Potential Difference' };
          case 'dca': return { value: `${ma.toFixed(1)} mA`, status: 'Circuit Series Current (mA)' };
          case 'ohm': return { value: `${eqR.toFixed(1)} Ω`, status: 'Equivalent Circuit Resistance' };
          case 'cont': return { value: eqR <= 15 ? '0.0 Ω  BEEP' : 'O.L', status: eqR <= 15 ? 'Continuous Net Path' : 'No Continuity Across Loop', isBeeping: eqR <= 15 };
          case 'diode': return { value: 'O.L', status: 'No Single Diode Detected Across Nets' };
        }
      } else {
        switch (mode) {
          case 'dcv': return { value: '0.00 V', status: 'Open Circuit — No Potential Difference' };
          case 'acv': return { value: '0.00 V~', status: 'Open Circuit — No AC Potential' };
          case 'dca': return { value: '0.0 mA', status: 'Open Loop: Zero Current' };
          case 'ohm': return { value: 'O.L MΩ', status: 'Open Circuit: Infinite Resistance' };
          case 'cont': return { value: 'O.L', status: 'Open Circuit: Discontinuous' };
          case 'diode': return { value: 'O.L', status: 'Open Loop' };
        }
      }
    }
  }

  // Ohm's Law & Power (Watt) Calculator Window
  toggleOhmsCalc(force = null) {
    this.ohmsCalcActive = (force !== null) ? force : !this.ohmsCalcActive;
    if (this.dom.ohmsCalcWindow) {
      this.dom.ohmsCalcWindow.style.display = this.ohmsCalcActive ? 'block' : 'none';
      if (this.ohmsCalcActive) {
        if (window.innerWidth <= 820 || window.innerHeight <= 520) {
          this.dom.ohmsCalcWindow.style.left = '50%';
          this.dom.ohmsCalcWindow.style.top = '50%';
          this.dom.ohmsCalcWindow.style.transform = 'translate(-50%, -50%)';
        } else {
          const rect = this.dom.ohmsCalcWindow.getBoundingClientRect();
          if (rect.right > window.innerWidth || rect.bottom > window.innerHeight || rect.left < 0) {
            this.dom.ohmsCalcWindow.style.left = 'clamp(10px, 18vw, 220px)';
            this.dom.ohmsCalcWindow.style.top = '48px';
            this.dom.ohmsCalcWindow.style.transform = 'none';
          }
        }
      }
    }
    if (this.dom.btnOhmsToggle) {
      this.dom.btnOhmsToggle.classList.toggle('active', this.ohmsCalcActive);
    }
    if (this.ohmsCalcActive) {
      this.updateOhmsCalcWindow();
    }
  }

  updateOhmsCalcWindow() {
    if (!this.ohmsCalcActive || !this.dom.ohmsCalcWindow) return;

    let v = 0;
    let i = 0;
    let r = 0;
    let p = 0;
    let name = 'Total Circuit Loop';

    if (this.selectedComponent) {
      const comp = this.selectedComponent;
      const def = window.COMPONENT_DEFINITIONS[comp.type];
      name = def ? def.name : comp.type;
      if (comp.type === 'ac_source') {
        v = comp.state.voltage || 230;
        i = comp.state.current || 0;
        p = comp.state.power || (v * i);
        r = (i > 0) ? (v / i) : 0;
      } else if (comp.type === 'transformer') {
        v = comp.state.secondaryV || 12;
        i = comp.state.secondaryCurrent || comp.state.current || 0;
        p = comp.state.secondaryPower || comp.state.power || 0;
        r = (i > 0) ? (v / i) : 0;
      } else {
        v = comp.state.voltageDrop || (comp.type === 'battery' ? (comp.voltage || 9) : 0);
        i = comp.state.current || 0;
        r = (comp.type === 'resistor' || comp.type === 'potentiometer') ? (comp.state.resistance || 220) : ((def && def.resistance) || (i > 0 ? (v / i) : 0));
        p = comp.state.power || (v * i);
      }
    } else if (this.solver && this.solver.status) {
      v = this.solver.status.totalVoltage || 0;
      i = this.solver.status.totalCurrent || 0;
      r = this.solver.status.equivalentResistance || 0;
      p = v * i;
    }

    const ma = i * 1000;
    if (this.dom.calcV) this.dom.calcV.textContent = `${v >= 10 ? v.toFixed(1) : v.toFixed(2)} V`;
    if (this.dom.calcI) this.dom.calcI.textContent = `${ma >= 1000 ? (ma / 1000).toFixed(2) + ' A' : ma.toFixed(1) + ' mA'}`;
    if (this.dom.calcR) this.dom.calcR.textContent = `${r >= 1000 ? (r / 1000).toFixed(1) + ' kΩ' : Math.round(r) + ' Ω'}`;
    if (this.dom.calcP) this.dom.calcP.textContent = `${p >= 1 ? p.toFixed(2) + ' W' : (p * 1000).toFixed(1) + ' mW'}`;

    if (this.dom.calcSubOhms) {
      this.dom.calcSubOhms.textContent = `[${name}] ${v.toFixed(2)}V = ${(i * 1000).toFixed(1)}mA × ${Math.round(r)}Ω`;
    }
    if (this.dom.calcSubPower) {
      this.dom.calcSubPower.textContent = `[${name}] ${(p >= 1 ? p.toFixed(2) + 'W' : (p * 1000).toFixed(1) + 'mW')} = ${v.toFixed(2)}V × ${(i * 1000).toFixed(1)}mA`;
    }
  }

  // Draggable Floating Setup & Interactive Gamer Calculator Events
  setupOhmsCalcEvents() {
    const win = this.dom.ohmsCalcWindow;
    if (!win) return;
    const handle = this.dom.ohmsDragHandle || win.querySelector('.ohms-header');

    // 1. Mouse & Touch Dragging for Smooth Floating Repositioning
    if (handle) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;

      const onDragStart = (e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;

        isDragging = true;
        win.classList.add('is-dragging');
        const point = (e.touches && e.touches[0]) ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;

        const rect = win.getBoundingClientRect();
        const stageRect = this.dom.stage.getBoundingClientRect();
        initialLeft = rect.left - stageRect.left;
        initialTop = rect.top - stageRect.top;

        e.preventDefault();
      };

      const onDragMove = (e) => {
        if (!isDragging) return;
        const point = (e.touches && e.touches[0]) ? e.touches[0] : e;
        const dx = point.clientX - startX;
        const dy = point.clientY - startY;

        const stageRect = this.dom.stage.getBoundingClientRect();
        const winW = win.offsetWidth || 350;
        const winH = win.offsetHeight || 380;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Clamp inside stage boundary so window never gets lost off-screen
        newLeft = Math.max(10, Math.min(stageRect.width - winW - 10, newLeft));
        newTop = Math.max(10, Math.min(stageRect.height - winH - 10, newTop));

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
        win.style.right = 'auto';
        win.style.bottom = 'auto';

        e.preventDefault();
      };

      const onDragEnd = () => {
        if (isDragging) {
          isDragging = false;
          win.classList.remove('is-dragging');
        }
      };

      handle.addEventListener('mousedown', onDragStart);
      handle.addEventListener('touchstart', onDragStart, { passive: false });
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchend', onDragEnd);
    }

    // 2. Tab Switching (Live Circuit vs Gamer Manual Calculator)
    if (this.dom.tabOhmsLive && this.dom.tabOhmsGamer) {
      this.dom.tabOhmsLive.addEventListener('click', () => this.switchOhmsTab('live'));
      this.dom.tabOhmsGamer.addEventListener('click', () => this.switchOhmsTab('gamer'));
    }

    // 3. Gamer Manual Calculator Actions
    if (this.dom.btnGamerSolve) {
      this.dom.btnGamerSolve.addEventListener('click', () => this.calculateOhmsLawGamer(true));
    }

    // Live calculation while typing in gamer inputs
    const gamerInputs = [this.dom.gamerCalcV, this.dom.gamerCalcI, this.dom.gamerCalcR];
    gamerInputs.forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          const filled = [
            this.dom.gamerCalcV ? this.dom.gamerCalcV.value.trim() : '',
            this.dom.gamerCalcI ? this.dom.gamerCalcI.value.trim() : '',
            this.dom.gamerCalcR ? this.dom.gamerCalcR.value.trim() : ''
          ].filter(v => v !== '').length;

          if (filled >= 2) {
            this.calculateOhmsLawGamer(false); // live solve quietly
          }
        });
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.calculateOhmsLawGamer(true);
        });
      }
    });

    if (this.dom.gamerUnitI) {
      this.dom.gamerUnitI.addEventListener('change', () => this.calculateOhmsLawGamer(false));
    }
    if (this.dom.gamerUnitR) {
      this.dom.gamerUnitR.addEventListener('change', () => this.calculateOhmsLawGamer(false));
    }

    // Copy live component values into gamer calculator
    if (this.dom.btnGamerLoad) {
      this.dom.btnGamerLoad.addEventListener('click', () => this.loadGamerCalcFromBoard());
    }

    // Clear all gamer inputs
    if (this.dom.btnGamerClear) {
      this.dom.btnGamerClear.addEventListener('click', () => {
        if (this.dom.gamerCalcV) this.dom.gamerCalcV.value = '';
        if (this.dom.gamerCalcI) this.dom.gamerCalcI.value = '';
        if (this.dom.gamerCalcR) this.dom.gamerCalcR.value = '';
        if (this.dom.gamerCalcResult) this.dom.gamerCalcResult.style.display = 'none';
      });
    }

    // Preset Scenario Chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const v = chip.dataset.v;
        const i = chip.dataset.i;
        const r = chip.dataset.r;
        const iu = chip.dataset.iu || 'mA';
        const ru = chip.dataset.ru || 'Ω';

        if (this.dom.gamerCalcV) this.dom.gamerCalcV.value = v || '';
        if (this.dom.gamerCalcI) this.dom.gamerCalcI.value = i || '';
        if (this.dom.gamerCalcR) this.dom.gamerCalcR.value = r || '';
        if (this.dom.gamerUnitI) this.dom.gamerUnitI.value = iu;
        if (this.dom.gamerUnitR) this.dom.gamerUnitR.value = ru;

        this.calculateOhmsLawGamer(true);
      });
    });
  }

  switchOhmsTab(tab) {
    if (this.dom.tabOhmsLive) this.dom.tabOhmsLive.classList.toggle('active', tab === 'live');
    if (this.dom.tabOhmsGamer) this.dom.tabOhmsGamer.classList.toggle('active', tab === 'gamer');
    if (this.dom.tabOhmsResistor) this.dom.tabOhmsResistor.classList.toggle('active', tab === 'resistor');

    if (this.dom.panelOhmsLive) this.dom.panelOhmsLive.style.display = (tab === 'live') ? 'block' : 'none';
    if (this.dom.panelOhmsGamer) this.dom.panelOhmsGamer.style.display = (tab === 'gamer') ? 'block' : 'none';
    if (this.dom.panelOhmsResistor) this.dom.panelOhmsResistor.style.display = (tab === 'resistor') ? 'block' : 'none';

    if (tab === 'live') {
      this.updateOhmsCalcWindow();
    } else if (tab === 'resistor') {
      this.updateOhmsCalculatorResistorTab();
    }
  }

  calculateOhmsLawGamer(playSound = true) {
    const vStr = this.dom.gamerCalcV ? this.dom.gamerCalcV.value.trim() : '';
    const iStr = this.dom.gamerCalcI ? this.dom.gamerCalcI.value.trim() : '';
    const rStr = this.dom.gamerCalcR ? this.dom.gamerCalcR.value.trim() : '';
    const iUnit = this.dom.gamerUnitI ? this.dom.gamerUnitI.value : 'mA';
    const rUnit = this.dom.gamerUnitR ? this.dom.gamerUnitR.value : 'Ω';

    const hasV = vStr !== '' && !isNaN(parseFloat(vStr));
    const hasI = iStr !== '' && !isNaN(parseFloat(iStr));
    const hasR = rStr !== '' && !isNaN(parseFloat(rStr));

    const resBox = this.dom.gamerCalcResult;
    const banner = this.dom.gamerResBanner;
    const steps = this.dom.gamerResSteps;
    const power = this.dom.gamerResPower;

    if (!resBox) return;

    let V = hasV ? parseFloat(vStr) : null;
    let I = hasI ? (parseFloat(iStr) * (iUnit === 'mA' ? 0.001 : 1)) : null;
    let R = hasR ? (parseFloat(rStr) * (rUnit === 'kΩ' ? 1000 : (rUnit === 'MΩ' ? 1000000 : 1))) : null;

    const count = (hasV ? 1 : 0) + (hasI ? 1 : 0) + (hasR ? 1 : 0);

    if (count < 2) {
      resBox.style.display = 'block';
      banner.style.color = '#fbbf24';
      banner.textContent = '⚠️ Enter Any Two Values';
      steps.textContent = 'Please fill any 2 inputs (e.g. Voltage & Resistance) to calculate the 3rd and Power!';
      power.textContent = '';
      return;
    }

    let solvedType = '';
    let solvedVal = 0;
    let stepText = '';
    let powerW = 0;

    // Case 1: V and I provided -> Solve for R
    if (hasV && hasI && (!hasR || (this.dom.gamerCalcR && document.activeElement !== this.dom.gamerCalcR))) {
      if (I === 0) {
        banner.style.color = '#ef4444';
        banner.textContent = 'Division by Zero (Open Circuit)';
        steps.textContent = 'Current I = 0A -> Resistance R is Infinite (Open Circuit ∞ Ω)';
        power.textContent = 'P = 0 W';
        resBox.style.display = 'block';
        return;
      }
      R = V / I;
      powerW = V * I;
      solvedType = 'Resistance (R)';
      solvedVal = R;

      // Update R input with solved value
      if (this.dom.gamerCalcR) {
        if (rUnit === 'kΩ') {
          this.dom.gamerCalcR.value = (R / 1000).toFixed(3);
        } else if (rUnit === 'MΩ') {
          this.dom.gamerCalcR.value = (R / 1000000).toFixed(4);
        } else {
          this.dom.gamerCalcR.value = Number.isInteger(R) ? R : R.toFixed(2);
        }
      }

      stepText = `R = V ÷ I = ${V} V ÷ ${I >= 1 ? I.toFixed(3) + ' A' : (I * 1000).toFixed(2) + ' mA'} = ${window.formatResistance(R)}`;
    }
    // Case 2: V and R provided -> Solve for I
    else if (hasV && hasR) {
      if (R === 0) {
        banner.style.color = '#ef4444';
        banner.textContent = 'Short Circuit! (R = 0 Ω)';
        steps.textContent = 'Zero resistance causes theoretical Infinite Current (I = ∞ A)!';
        power.textContent = 'Extreme Power Hazard!';
        resBox.style.display = 'block';
        return;
      }
      I = V / R;
      powerW = (V * V) / R;
      solvedType = 'Current (I)';
      solvedVal = I;

      if (this.dom.gamerCalcI) {
        if (iUnit === 'A') {
          this.dom.gamerCalcI.value = I.toFixed(4);
        } else {
          this.dom.gamerCalcI.value = (I * 1000).toFixed(2);
        }
      }

      stepText = `I = V ÷ R = ${V} V ÷ ${window.formatResistance(R)} = ${I >= 1 ? I.toFixed(4) + ' A' : (I * 1000).toFixed(2) + ' mA'}`;
    }
    // Case 3: I and R provided -> Solve for V
    else if (hasI && hasR) {
      V = I * R;
      powerW = I * I * R;
      solvedType = 'Voltage (V)';
      solvedVal = V;

      if (this.dom.gamerCalcV) {
        this.dom.gamerCalcV.value = Number.isInteger(V) ? V : V.toFixed(3);
      }
      stepText = `V = I × R = ${I >= 1 ? I.toFixed(3) + ' A' : (I * 1000).toFixed(2) + ' mA'} × ${window.formatResistance(R)} = ${V.toFixed(2)} V`;
    }

    resBox.style.display = 'block';
    banner.style.color = '#fbbf24';

    let formattedSolved = '';
    if (solvedType.startsWith('Resistance')) formattedSolved = window.formatResistance(solvedVal);
    else if (solvedType.startsWith('Current')) formattedSolved = solvedVal >= 1 ? `${solvedVal.toFixed(3)} A` : `${(solvedVal * 1000).toFixed(2)} mA`;
    else formattedSolved = `${solvedVal.toFixed(2)} V`;

    banner.textContent = `✓ Solved ${solvedType}: ${formattedSolved}`;
    steps.textContent = `Formula: ${stepText}`;

    const pFormatted = powerW >= 1 ? `${powerW.toFixed(2)} W` : `${(powerW * 1000).toFixed(2)} mW`;
    power.textContent = `Joule's Power Law: P = V × I = ${pFormatted} (${powerW.toFixed(4)} W)`;

    if (playSound && window.sounds && typeof window.sounds.playClick === 'function') {
      window.sounds.playClick();
    }
  }

  loadGamerCalcFromBoard() {
    let v = 0;
    let i = 0;
    let r = 0;

    if (this.selectedComponent) {
      const comp = this.selectedComponent;
      const def = window.COMPONENT_DEFINITIONS[comp.type] || {};
      v = comp.state.voltageDrop || comp.voltage || 0;
      i = comp.state.current || 0;
      r = comp.state.resistance || def.resistance || (i > 0 ? (v / i) : 220);
    } else if (this.solver && this.solver.status) {
      v = this.solver.status.totalVoltage || 9.0;
      i = this.solver.status.totalCurrent || 0.040;
      r = this.solver.status.equivalentResistance || 225;
    }

    if (this.dom.gamerCalcV) this.dom.gamerCalcV.value = Number.isInteger(v) ? v : v.toFixed(2);
    if (this.dom.gamerCalcI) {
      this.dom.gamerCalcI.value = (i * 1000).toFixed(2);
      if (this.dom.gamerUnitI) this.dom.gamerUnitI.value = 'mA';
    }
    if (this.dom.gamerCalcR) {
      this.dom.gamerCalcR.value = Math.round(r);
      if (this.dom.gamerUnitR) this.dom.gamerUnitR.value = 'Ω';
    }

    this.calculateOhmsLawGamer(true);
  }

  // Current Flow vs Physical Electron Drift Mode Selector
  setFlowMode(mode) {
    if (mode !== 'conventional' && mode !== 'electrons' && mode !== 'off') mode = 'conventional';
    this.flowMode = mode;
    this.showXRay = (mode !== 'off');
    this.updateFlowModeUI();
    if (mode === 'off') {
      document.querySelectorAll('.electron-particle, .current-flow-arrow').forEach(p => p.remove());
    }
  }

  cycleFlowMode() {
    if (this.flowMode === 'conventional') {
      this.setFlowMode('electrons');
      if (typeof this.showToast === 'function') {
        this.showToast('⚛️ Electron Flow (− to +) Active: Real negative electrons (e⁻) drift out of (−), through circuit loads, and return into (+)!', 'info');
      }
    } else if (this.flowMode === 'electrons') {
      this.setFlowMode('off');
      if (typeof this.showToast === 'function') {
        this.showToast('⏸️ Charge Flow Animation Paused', 'info');
      }
    } else {
      this.setFlowMode('conventional');
      if (typeof this.showToast === 'function') {
        this.showToast('⚡ Conventional Current Flow (+ to −) Active: Benjamin Franklin convention (out of + into −) used in schematics and diode symbols.', 'info');
      }
    }
  }

  updateFlowModeUI() {
    if (this.dom.btnXrayToggle) {
      this.dom.btnXrayToggle.classList.toggle('active', this.flowMode !== 'off');
      this.dom.btnXrayToggle.classList.toggle('electron-mode', this.flowMode === 'electrons');

      if (this.flowMode === 'conventional') {
        this.dom.btnXrayToggle.innerHTML = '<span class="icon">⚡</span> <span class="btn-label">Current (+ → −)</span>';
        this.dom.btnXrayToggle.title = 'Conventional Current Flow (Positive to Negative): Follows Benjamin Franklin’s convention used in schematics and engineering.';
      } else if (this.flowMode === 'electrons') {
        this.dom.btnXrayToggle.innerHTML = '<span class="icon">⚛️</span> <span class="btn-label">Electrons (− → +)</span>';
        this.dom.btnXrayToggle.title = 'Physical Electron Flow (Negative to Positive): Real negative electrons (e⁻) drift out of (−) and into (+).';
      } else {
        this.dom.btnXrayToggle.innerHTML = '<span class="icon">⏸️</span> <span class="btn-label">Flow Off</span>';
        this.dom.btnXrayToggle.title = 'Charge Flow Animation Paused: Click to resume flow animation.';
      }
    }

    // Update pill buttons in sidebar / modals
    document.querySelectorAll('.flow-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-flow-mode') === this.flowMode);
    });

    const noteEl = document.getElementById('flow-theory-note');
    if (noteEl) {
      if (this.flowMode === 'conventional') {
        noteEl.innerHTML = '<strong>⚡ Conventional Current:</strong> Assumes positive charges flow from (+) out through the load and into (−). Used on all electronic schematics and semiconductor symbols.';
      } else if (this.flowMode === 'electrons') {
        noteEl.innerHTML = '<strong>⚛️ Real Electron Flow:</strong> Conduction electrons (e⁻) carry negative charge. They are repelled by the negative terminal (−), drift through wires and components, and return into the positive terminal (+).';
      } else {
        noteEl.innerHTML = '<strong>⏸️ Flow Paused:</strong> Charge flow animation is hidden for a clean schematic inspection.';
      }
    }
  }

  // Joule's Law Thermal Vision Camera Mode (P = V * I = I^2 * R)
  toggleThermalMode(force = null) {
    this.isThermalMode = (force !== null) ? force : !this.isThermalMode;

    if (this.dom.stage) {
      this.dom.stage.classList.toggle('thermal-camera-mode', this.isThermalMode);
    }
    if (this.dom.btnThermalToggle) {
      this.dom.btnThermalToggle.classList.toggle('active', this.isThermalMode);
    }

    let legendDock = document.getElementById('thermal-legend-dock');
    if (this.isThermalMode) {
      if (!legendDock && this.dom.stage) {
        legendDock = document.createElement('div');
        legendDock.id = 'thermal-legend-dock';
        legendDock.className = 'thermal-legend-dock';
        legendDock.innerHTML = `
          <div class="thermal-legend-title">
            <span>FLIR IRONBOW THERMAL VISION</span>
            <span style="color: #cbd5e1;">P = I²R · T = 25°C + P×R_th</span>
          </div>
          <div class="thermal-gradient-bar"></div>
          <div class="thermal-scale-labels">
            <span>25°C (Cool)</span>
            <span>45°C (Warm)</span>
            <span>70°C (Hot)</span>
            <span>120°C (Critical)</span>
          </div>
        `;
        this.dom.stage.appendChild(legendDock);
      } else if (legendDock) {
        legendDock.style.display = 'flex';
      }
      if (window.sounds && window.sounds.playClick) window.sounds.playClick();
    } else if (legendDock) {
      legendDock.style.display = 'none';
    }

    for (const comp of this.components) {
      this.updateComponentVisual(comp);
    }
  }

  updateThermalVisuals(dt = 0.016) {
    if (!this.components) return;
    for (const comp of this.components) {
      const el = document.getElementById(`node-${comp.id}`);
      if (!el) continue;

      const thermalBadge = el.querySelector('.comp-thermal-badge');
      if (!thermalBadge) continue;

      const temp = comp.state.temperature || 25.0;
      const powerW = comp.state.power || 0;

      // In thermal mode, ensure badge is active with live telemetry
      if (this.isThermalMode) {
        const pStr = powerW >= 1 ? `${powerW.toFixed(2)}W` : `${(powerW * 1000).toFixed(0)}mW`;
        thermalBadge.innerHTML = `<span>🌡️ ${temp.toFixed(1)}°C</span><span>·</span><span>P: ${pStr}</span>`;
      }
    }
  }

  renderThermalSmoke(dt = 0.016) {
    if (!this.components) return;
    this.smokeTimer = (this.smokeTimer || 0) + dt;
    if (this.smokeTimer < 0.22) return;
    this.smokeTimer = 0;

    for (const comp of this.components) {
      const temp = comp.state.temperature || 25.0;
      const power = comp.state.power || 0;
      const def = window.COMPONENT_DEFINITIONS[comp.type] || { width: 100, height: 60 };
      let shouldSmoke = false;

      // Realistic Electrical Principles for Thermal Overheat Smoke:
      // Smoke occurs ONLY when materials undergo destructive thermal decomposition/melting:
      if (comp.state.burning || comp.state.crying) {
        shouldSmoke = true;
      } else if (comp.type === 'resistor' || comp.type === 'potentiometer') {
        const pRated = def.maxPower || (comp.type === 'potentiometer' ? 2.0 : 1.2);
        shouldSmoke = (power > pRated * 2.0) && (temp > 150);
      } else if (comp.type === 'battery' || comp.type === 'cell') {
        shouldSmoke = comp.state.overheated && (comp.state.current > 2.5);
      } else if (comp.type === 'motor') {
        shouldSmoke = (comp.state.rpm === 0 && comp.state.current > 1.5 && temp > 120) || ((comp.state.voltageDrop || 0) > 14.0);
      } else if (comp.type === 'bulb') {
        shouldSmoke = ((comp.state.voltageDrop || 0) > (def.maxVoltage || 14.5)) || comp.state.burnt;
      } else if (comp.type === 'solenoid' || comp.type === 'inductor') {
        shouldSmoke = (temp > 140) && comp.state.overheated;
      } else if (comp.type === 'diode' || comp.type === 'rectifier') {
        shouldSmoke = ((comp.state.current || 0) > (def.maxCurrent || 1.0) * 2.0);
      }

      if (shouldSmoke) {
        const el = document.getElementById(`node-${comp.id}`);
        if (!el || !this.dom.stage) continue;

        const smoke = document.createElement('div');
        smoke.className = 'thermal-smoke-particle';
        const cx = comp.x + def.width / 2 + (Math.random() - 0.5) * 24;
        const cy = comp.y + 12 + (Math.random() - 0.5) * 10;
        smoke.style.left = `${cx}px`;
        smoke.style.top = `${cy}px`;
        this.dom.stage.appendChild(smoke);

        setTimeout(() => smoke.remove(), 1600);
      }
    }
  }

  // Animation Loop for Electric Motors, Electron Particles, Capacitors & Confetti
  startAnimationLoop() {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const now = currentTime || performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      try {
        // 1. Live Continuous Motor Fan Rotation (smooth 60FPS physics responding directly to polarity)
        this.updateMotorRotations();

        // 2. Real-time AC Polarity Oscillations, LED Blinking, and Rectifier Ripple Visuals
        this.updateACVisuals();

        // 3. Real-time Capacitor Discharging and Energy Dynamics (RC Time Constant)
        this.updateCapacitorsAndVisuals(dt);

        // 3b. Real-time Inductor Transient Ramp, RL Dynamics & Soft-Start (Faraday & Lenz)
        this.updateInductorsAndVisuals(dt);

        // 4. Electron Particles along wires (Strictly in closed circuits with active wire currents)
        if (this.showXRay && this.flowMode !== 'off' && this.solver.status.isComplete && this.solver.status.wireCurrents && this.solver.status.wireCurrents.size > 0) {
          this.renderElectronParticles();
        } else {
          // In open circuit, strictly no current flows: clean up all particles and current arrows
          document.querySelectorAll('.electron-particle, .current-flow-arrow').forEach(p => p.remove());
        }

        // 5. Continuous Real-time LDR Sensor Tracking (updates live as lights move or shine)
        this.updateLDRSensorsAndVisuals();

        // 6. Joule's Heating Thermal Glow & Smoke Billows (P = I^2 * R)
        this.updateThermalVisuals(dt);
        this.renderThermalSmoke(dt);

        this.updateConfetti();
      } catch (loopErr) {
        console.warn('Animation loop step warning:', loopErr);
      }

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateACVisuals() {
    // Advance AC phase (~50Hz simulation rate modulated smoothly at 60FPS)
    this.acPhase = ((this.acPhase || 0) + 0.08) % (2 * Math.PI);
    const sinVal = Math.sin(this.acPhase);

    if (!this.components) return;

    for (const comp of this.components) {
      if (comp.state.burnt) continue;

      if (comp.type === 'led') {
        const el = document.getElementById(`node-${comp.id}`);
        if (!el) continue;

        const isPowered = comp.state.powered && !comp.state.burning && !comp.state.crying;
        const rectType = comp.state.rectification || 'dc';
        const hex = window.ComponentRenderer.getLedHexColor(comp.state.color || 'red');

        const ambientGlow = el.querySelector('.ambient-glow');
        const coreGlow = el.querySelector('.core-glow');
        const dome = el.querySelector('.led-dome-body');

        if (!isPowered) {
          if (ambientGlow) ambientGlow.setAttribute('opacity', '0');
          if (coreGlow) coreGlow.setAttribute('opacity', '0');
          if (dome) {
            dome.setAttribute('fill', '#334155');
            dome.setAttribute('opacity', '0.85');
          }
          continue;
        }

        let instFactor = 1.0;
        if (comp.state.filteredByCapacitor) {
          // With parallel smoothing capacitor, the pulsating rectifier ripple is smoothed into pure steady DC!
          instFactor = 0.94 + 0.06 * Math.abs(sinVal);
        } else if (rectType === 'half_wave') {
          // Half-wave: conducts only during its forward half-cycle!
          // When polarity reverses, the diode is reverse-biased and the LED turns completely OFF!
          const conducting = (comp.state.halfWavePhase === -1) ? (sinVal < -0.05) : (sinVal > 0.05);
          if (conducting) {
            instFactor = Math.pow(Math.abs(sinVal), 0.5);
          } else {
            instFactor = 0; // OFF during reverse polarity
          }
        } else if (rectType === 'full_wave') {
          // Full-wave: conducts during BOTH half-cycles with 2x ripple frequency (smooth DC)!
          instFactor = 0.40 + 0.60 * Math.pow(Math.abs(sinVal), 0.7);
        } else if (rectType === 'ac') {
          // Direct unrectified AC (LED forward on positive half-cycle)
          instFactor = (sinVal > 0.05) ? Math.pow(sinVal, 0.5) : 0;
        }

        const baseBright = comp.state.brightness || 1.0;
        const effBright = baseBright * instFactor;

        if (ambientGlow) {
          ambientGlow.setAttribute('opacity', (effBright * 0.45).toFixed(3));
        }
        if (coreGlow) {
          coreGlow.setAttribute('opacity', (effBright * 0.90).toFixed(3));
        }
        if (dome) {
          if (effBright > 0.05) {
            dome.setAttribute('fill', hex);
            dome.setAttribute('opacity', Math.min(1.0, 0.70 + effBright * 0.30).toFixed(2));
          } else {
            dome.setAttribute('fill', '#334155');
            dome.setAttribute('opacity', '0.85');
          }
        }
      } else if (comp.type === 'bulb') {
        const el = document.getElementById(`node-${comp.id}`);
        if (!el) continue;
        const rectType = comp.state.rectification || 'dc';
        if (rectType === 'half_wave' && comp.state.powered) {
          // Incandescent bulb on half-wave has visible 50Hz filament shimmer
          const ambientGlow = el.querySelector('.comp-bulb circle[filter]');
          if (ambientGlow) {
            const ripple = comp.state.filteredByCapacitor ? 0.96 : (0.72 + 0.28 * Math.max(0, sinVal));
            ambientGlow.setAttribute('opacity', (0.40 * ripple).toFixed(3));
          }
        }
      }
    }
  }

  // Real-time dynamic capacitor discharge and DOM status update
  updateCapacitorsAndVisuals(dt = 0.016) {
    if (!this.components) return;
    let needsSolve = false;

    for (const comp of this.components) {
      if ((comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') && !comp.state.burnt) {
        const i = comp.state.current || 0;
        const storedV = comp.state.storedVoltage || 0;
        const isCeramic = (comp.type === 'ceramic_capacitor');

        const maxV = comp.state.ratedVoltage || comp.state.maxVoltage || (isCeramic ? 50.0 : 16.0);
        let capFarads = 1e-3;
        let esr = 0.08;

        if (isCeramic) {
          const code = comp.state.ceramicCode || '104';
          const nomUf = comp.state.capacitanceUf || (comp.state.capacitanceNf ? comp.state.capacitanceNf / 1000 : 0.1);
          const effUf = window.getCeramicEffectiveCapacitance ? window.getCeramicEffectiveCapacitance(code, storedV) : nomUf;
          comp.state.effectiveCapacitanceUf = effUf;
          capFarads = effUf * 1e-6;
          esr = comp.state.esr || 0.010;
          comp.state.esr = esr;
        } else {
          const capVal = comp.state.capacitance || 1000;
          capFarads = capVal * 1e-6;
          esr = comp.state.esr || (window.getElectrolyticESR ? window.getElectrolyticESR(capVal, maxV) : 0.08);
          comp.state.esr = esr;
        }

        // 1. RC Time Constant Exponential Discharge: V(t) = V0 * exp(-dt / tau) where tau = (R_load + ESR) * C
        if (i > 0.00001 && storedV > 0.01) {
          const rLoad = Math.max(0.2, (storedV / Math.max(0.00001, i)));
          const tau = Math.max(0.000001, (rLoad + esr) * capFarads);
          const decay = Math.exp(-dt / tau);
          comp.state.dischargeTau = tau;
          comp.state.storedVoltage = (storedV * decay < 0.02) ? 0 : (storedV * decay);
          comp.state.chargePercent = Math.min(100, Math.round((comp.state.storedVoltage / maxV) * 100));
          needsSolve = true;
        } else if (storedV > 0.02 && !comp.state.powered) {
          // Open-circuit self-discharge via dielectric insulation leakage (tau ~ 600s to 1200s)
          const tauLeak = isCeramic ? 1200.0 : 600.0;
          const leakDecay = Math.exp(-dt / tauLeak);
          comp.state.storedVoltage = Math.max(0, storedV * leakDecay);
          comp.state.chargePercent = Math.min(100, Math.round((comp.state.storedVoltage / maxV) * 100));
        }

        const curV = comp.state.storedVoltage || 0;
        const qMc = (capFarads * curV * 1000);
        const eMj = (0.5 * capFarads * curV * curV * 1000);
        comp.state.storedChargeMc = qMc;
        comp.state.storedEnergyMj = eMj;

        // Live DOM badge update on the component
        const nodeEl = document.getElementById(`node-${comp.id}`);
        if (nodeEl) {
          const chargeRatio = Math.max(0, Math.min(1.0, curV / maxV));
          if (!isCeramic) {
            const capVal = comp.state.capacitance || 1000;
            const textEl = nodeEl.querySelector('.cap-live-text') || nodeEl.querySelector('.comp-capacitor text:nth-of-type(5)');
            const gaugeEl = nodeEl.querySelector('.cap-gauge-bar') || nodeEl.querySelector('.comp-capacitor rect:nth-of-type(4)');
            const auraEl = nodeEl.querySelector('.cap-storage-aura') || nodeEl.querySelector('.comp-capacitor rect[filter]');
            if (textEl) textEl.textContent = curV > 0.05 ? `${curV.toFixed(1)}V Stored` : `${capVal}µF • ${maxV}V`;
            if (gaugeEl) gaugeEl.setAttribute('width', `${Math.max(4, Math.round(54 * chargeRatio))}`);
            if (auraEl) auraEl.setAttribute('opacity', `${(chargeRatio * 0.45).toFixed(2)}`);
          } else {
            const cerAura = nodeEl.querySelector('.comp-ceramic-cap circle[fill="#f59e0b"]');
            if (cerAura) {
              const isEnergized = (curV > 0.05 || comp.state.powered);
              cerAura.setAttribute('opacity', isEnergized ? '0.35' : '0');
            }
          }
        }

        // Live inspector synchronization if this capacitor is inspected
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          if (!isCeramic) {
            const inspV = document.getElementById('insp-cap-stored-v');
            const inspQ = document.getElementById('insp-cap-charge');
            const inspE = document.getElementById('insp-cap-energy');
            const inspTau = document.getElementById('insp-cap-tau');
            const inspEsr = document.getElementById('insp-cap-esr');
            if (inspV) inspV.textContent = `${curV.toFixed(2)}V (${(comp.state.chargePercent || 0).toFixed(0)}%)`;
            if (inspQ) inspQ.textContent = `${qMc.toFixed(2)} mC`;
            if (inspE) inspE.textContent = `${eMj.toFixed(2)} mJ`;
            if (inspTau) inspTau.textContent = comp.state.dischargeTau ? `${comp.state.dischargeTau.toFixed(2)} s` : '— (Open Circuit)';
            if (inspEsr) inspEsr.textContent = `${esr.toFixed(3)} Ω`;
          } else {
            const inspCerV = document.getElementById('insp-cer-voltage');
            const inspCerQ = document.getElementById('insp-cer-charge');
            const inspCerE = document.getElementById('insp-cer-energy');
            const inspCerEffC = document.getElementById('insp-cer-eff-c');
            const inspCerRole = document.getElementById('insp-cer-role');
            if (inspCerV) inspCerV.textContent = `${curV.toFixed(2)}V`;
            const qCoulombs = capFarads * curV;
            const eJoules = 0.5 * capFarads * curV * curV;
            if (inspCerQ) inspCerQ.textContent = window.formatCharge ? window.formatCharge(qCoulombs) : `${(qMc * 1000).toFixed(2)} µC`;
            if (inspCerE) inspCerE.textContent = window.formatEnergy ? window.formatEnergy(eJoules) : `${(eMj * 1000).toFixed(2)} µJ`;
            if (inspCerEffC) {
              const nomNf = comp.state.capacitanceNf || 100;
              const nomPf = comp.state.capacitancePf || (nomNf * 1000);
              const effNf = (comp.state.effectiveCapacitanceUf || 0.1) * 1000;
              const effPf = effNf * 1000;
              inspCerEffC.textContent = `${nomPf < 1000 ? nomPf + ' pF' : (nomNf >= 1000 ? (nomNf / 1000).toFixed(1) + ' µF' : nomNf + ' nF')} (${effPf < 1000 ? effPf.toFixed(1) + ' pF' : (effNf >= 1000 ? (effNf / 1000).toFixed(2) + ' µF' : effNf.toFixed(1) + ' nF')} @ ${curV.toFixed(1)}V DC)`;
            }
            if (inspCerRole && comp.state.circuitRoleName) {
              inspCerRole.textContent = comp.state.circuitRoleName;
            }
          }
        }
      }
    }

    if (needsSolve && !this.evaluatingCircuit) {
      this.evaluatingCircuit = true;
      try {
        this.solver.solve();
        for (const comp of this.components) {
          if (comp.type === 'led' || comp.type === 'bulb' || comp.type === 'buzzer' || comp.type === 'motor' || comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
            this.updateComponentVisual(comp);
          }
        }
      } catch (err) {
        console.warn('Capacitor discharge solve error:', err);
      } finally {
        this.evaluatingCircuit = false;
      }
    }
  }

  // Real-time dynamic inductor current ramp, RL exponential dynamics, and soft-start visuals
  updateInductorsAndVisuals(dt = 0.016) {
    if (!this.components) return;

    // 1. Decay switch contact spark if any mechanical switch sparked
    for (const comp of this.components) {
      if ((comp.type === 'switch' || comp.type === 'pushbutton') && comp.state.contactSpark) {
        comp.state.sparkTimer = (comp.state.sparkTimer || 1.0) - dt;
        if (comp.state.sparkTimer <= 0) {
          comp.state.contactSpark = false;
          comp.state.sparkTimer = 0;
          this.updateComponentVisual(comp);
        }
      }
    }

    // 2. Exponential current ramp for inductors and coupled series components (Faraday & Lenz)
    for (const comp of this.components) {
      if (comp.type === 'inductor' && !comp.state.burnt) {
        const indMh = comp.state.inductanceMh || (comp.state.inductanceUh ? comp.state.inductanceUh / 1000 : 10);
        const lHenries = indMh * 1e-3;
        const targetI = comp.state.powered ? (comp.state.current || 0) : 0;
        comp.state.targetCurrent = targetI;
        let actI = comp.state.actualCurrent !== undefined ? comp.state.actualCurrent : 0;

        const tau = comp.state.tau || (lHenries / Math.max(0.1, comp.state.dcr || 0.8));

        // Exponential current rise/fall: i(t) = i_prev + (I_target - i_prev) * (1 - exp(-dt / tau))
        if (tau > 0.003) {
          const alpha = 1.0 - Math.exp(-dt / tau);
          actI += (targetI - actI) * alpha;
          if (Math.abs(actI - targetI) < 0.0005) {
            actI = targetI;
          }
        } else {
          actI = targetI;
        }
        comp.state.actualCurrent = actI;

        // Energy stored in magnetic field: E = 1/2 * L * I^2
        const eJoules = 0.5 * lHenries * actI * actI;
        comp.state.storedEnergy = eJoules;
        comp.state.magneticFlux = lHenries * actI;

        // Live DOM update for this inductor
        const nodeEl = document.getElementById(`node-${comp.id}`);
        if (nodeEl) {
          const aura = nodeEl.querySelector('ellipse[fill="#f59e0b"]');
          if (aura) {
            const isat = comp.state.isat || 3.5;
            const intensity = Math.min(1.0, actI / isat);
            aura.setAttribute('opacity', `${(intensity * 0.35).toFixed(2)}`);
          }
          const liveText = nodeEl.querySelector('.comp-inductor g[transform="translate(24, 94)"] text');
          if (liveText && comp.state.powered) {
            liveText.textContent = `I: ${actI.toFixed(2)}A • E: ${(eJoules * 1000).toFixed(1)}mJ • X_L: ${(comp.state.reactanceXl || 0).toFixed(1)}Ω`;
          }
        }

        // 3. Update coupled Incandescent Lamp brightness following inductor current ramp
        // User specification: Turn-on delay: instead of flashing instantly, lamp filament warms dim at first and takes a noticeable fraction of a second (or seconds with large Henries) to reach full brightness.
        if (comp.state.circuitRole === 'lamp_rl') {
          for (const bulb of this.components) {
            if (bulb.type === 'bulb' && !bulb.state.burnt && (bulb.state.seriesInductorId === comp.id || comp.state.powered)) {
              if (comp.state.powered && targetI > 0.001) {
                const ratio = Math.max(0, Math.min(1.0, actI / targetI));
                // Tungsten filament temperature/brightness curve scales superlinearly: B proportional to I^1.4
                const maxB = bulb.state.voltageDrop > 0 ? Math.pow(bulb.state.voltageDrop / 9.0, 1.4) : 1.0;
                bulb.state.brightness = maxB * Math.pow(ratio, 1.4);
                bulb.state.current = actI;
                this.updateComponentVisual(bulb);
              } else if (!comp.state.powered && bulb.state.brightness > 0) {
                bulb.state.brightness = 0;
                bulb.state.current = 0;
                this.updateComponentVisual(bulb);
              }
            }
          }
        }

        // 4. Update coupled DC Motor soft-start following inductor current ramp
        if (comp.state.circuitRole === 'motor_choke') {
          for (const motor of this.components) {
            if (motor.type === 'motor' && !motor.state.burnt && motor.state.seriesInductorId === comp.id) {
              if (comp.state.powered && targetI > 0.001) {
                const ratio = Math.max(0, Math.min(1.0, actI / targetI));
                motor.state.softStartRatio = ratio;
                // Soften stall inrush current and ramp RPM smoothly
                const targetRpm = Math.min(3000, Math.round((comp.state.current || 0) * 4500));
                motor.state.rpm = Math.round(targetRpm * ratio);
              }
            }
          }
        }

        // 5. Inspector real-time sync if inspected
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          const inspCur = document.getElementById('insp-ind-current');
          const inspE = document.getElementById('insp-ind-energy');
          const inspTau = document.getElementById('insp-ind-tau');
          if (inspCur) inspCur.textContent = `${actI.toFixed(2)} A`;
          if (inspE) inspE.textContent = `${(eJoules * 1000).toFixed(2)} mJ`;
          if (inspTau) {
            const tauStr = tau >= 1.0 ? tau.toFixed(2) + ' s' : (tau * 1000).toFixed(1) + ' ms';
            const rise5Str = (5 * tau) >= 1.0 ? (5 * tau).toFixed(2) + ' s' : (5 * tau * 1000).toFixed(1) + ' ms';
            inspTau.textContent = `τ = ${tauStr} (5τ = ${rise5Str})`;
          }
        }
      }
    }
  }

  updateLDRSensorsAndVisuals() {
    if (!this.components) return;
    const hasLdr = this.components.some(c => c.type === 'ldr');
    if (!hasLdr) return;

    const prevResMap = new Map(this.components.filter(c => c.type === 'ldr').map(c => [c.id, c.state.resistance]));
    this.solver.updateLDRSensors();
    const resChanged = this.components.some(c => c.type === 'ldr' && Math.abs((c.state.resistance || 0) - (prevResMap.get(c.id) || 0)) > 20);

    for (const comp of this.components) {
      if (comp.type === 'ldr') {
        const el = document.getElementById(`node-${comp.id}`);
        if (!el) continue;
        const ldrVal = el.querySelector('.ldr-val');
        const ldrIcon = el.querySelector('.ldr-icon');
        const ldrPill = el.querySelector('.ldr-mode-pill');
        if (ldrVal) ldrVal.textContent = window.formatResistance(comp.state.resistance || 10000);
        if (ldrIcon) {
          const lux = comp.state.lux || 0;
          ldrIcon.textContent = lux > 20 ? '☀️' : (lux > 2 ? '🌤️' : '🌑');
          ldrIcon.title = `Illumination: ${lux} Lux | Nearest light: ${comp.state.nearestLight || 'None'}${comp.state.nearestDist ? ` (${comp.state.nearestDist}px)` : ''}`;
        }
        if (ldrPill) {
          ldrPill.textContent = (comp.state.coefficient === 'positive') ? 'PTC' : 'NTC';
        }

        const slider = el.querySelector('.ldr-canvas-slider');
        if (slider && document.activeElement !== slider) {
          slider.value = comp.state.ambientLux !== undefined ? comp.state.ambientLux : (comp.state.lux || 0);
        }

        // If inspector is open for this LDR, keep its live telemetry in sync
        if (this.selectedComponent && this.selectedComponent.id === comp.id) {
          const inspRes = document.getElementById('insp-ldr-res');
          const inspLight = document.getElementById('insp-ldr-light');
          const inspDist = document.getElementById('insp-ldr-dist');
          const inspLux = document.getElementById('insp-ldr-lux');
          if (inspRes) inspRes.textContent = window.formatResistance(comp.state.resistance || 10000);
          if (inspLight) inspLight.textContent = comp.state.nearestLight || 'None';
          if (inspDist) inspDist.textContent = comp.state.nearestDist ? `${comp.state.nearestDist} px` : 'In Darkness';
          if (inspLux) inspLux.textContent = `${comp.state.lux || 0} Lux`;
        }
      }
    }

    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (resChanged && !this.evaluatingCircuit && (this.compDrag || (now - (this._lastLdrCircuitEval || 0) > 250))) {
      this._lastLdrCircuitEval = now;
      this.evaluatingCircuit = true;
      this.evaluateCircuit();
      this.evaluatingCircuit = false;
    }
  }

  updateMotorRotations() {
    if (!this.components) return;
    for (const comp of this.components) {
      if (comp.type === 'motor') {
        const fanEl = document.getElementById(`motor-fan-${comp.id}`);
        if (!fanEl) continue;

        const rpm = (comp.state.powered && !comp.state.burnt) ? (comp.state.rpm || 0) : 0;
        if (rpm > 0) {
          // Physical rotation mapping directly from calculated RPM:
          // 12,000 RPM (direct 9V): ~72°/frame (fast spin, smooth animation without wagon-wheel stroboscopic illusion)
          // 6,000 RPM (mid-resistance): ~38°/frame
          // 3,000 RPM: ~20°/frame
          // 1,000 RPM: ~7°/frame
          // 300 RPM: ~2°/frame
          const targetSpeed = Math.max(1.0, Math.min(76, Math.pow(rpm / 12000, 0.88) * 72));
          // Direction: Clockwise (+1) when positive enters pin1, Counter-Clockwise (-1) when polarity reversed
          const dir = (comp.state.direction === 'ccw') ? -1 : 1;
          const targetVelocity = dir * targetSpeed;

          // Smooth acceleration and dynamic responsiveness
          comp.state.spinVelocity = comp.state.spinVelocity !== undefined
            ? (comp.state.spinVelocity * 0.80 + targetVelocity * 0.20)
            : targetVelocity;

          comp.state.fanAngle = ((comp.state.fanAngle || 0) + comp.state.spinVelocity) % 360;
          fanEl.setAttribute('transform', `rotate(${comp.state.fanAngle.toFixed(1)})`);
        } else if (comp.state.spinVelocity && Math.abs(comp.state.spinVelocity) > 0.05) {
          // Coast to a stop with realistic friction deceleration when power is cut or motor stalled by high resistance
          comp.state.spinVelocity *= 0.88;
          if (Math.abs(comp.state.spinVelocity) < 0.05) {
            comp.state.spinVelocity = 0;
          }
          comp.state.fanAngle = ((comp.state.fanAngle || 0) + comp.state.spinVelocity) % 360;
          fanEl.setAttribute('transform', `rotate(${comp.state.fanAngle.toFixed(1)})`);
        }
      }
    }
  }

  renderElectronParticles() {
    if (!this.showXRay || this.flowMode === 'off') {
      document.querySelectorAll('.electron-particle, .current-flow-arrow').forEach(p => p.remove());
      return;
    }

    const isElectronMode = (this.flowMode === 'electrons');

    for (const wire of this.wires) {
      const wireData = this.solver.status.wireCurrents ? this.solver.status.wireCurrents.get(wire.id) : null;
      if (!wireData || !wireData.active) {
        // Wire carries zero current (open circuit / dead end / open branch): purge any existing particles
        document.querySelectorAll(`[id^="electron-${wire.id}-"], [id^="arrow-${wire.id}-"]`).forEach(el => el.remove());
        continue;
      }

      const pathEl = document.getElementById(`svg-path-${wire.id}`);
      if (!pathEl || !pathEl.getTotalLength) continue;

      const totalLength = pathEl.getTotalLength();
      if (totalLength <= 0) continue;

      // Kirchhoff's Current Law & Charge Density: Particle count scales with current (swarms split at junctions!)
      const wireCurrent = wireData.current || 0;
      const densityScale = Math.min(2.4, Math.max(0.55, Math.sqrt(wireCurrent / 0.025)));
      const numParticles = Math.max(2, Math.floor((totalLength / 40) * densityScale));
      const isAC = !!wireData.isAC;
      const dir = wireData.direction || 1; // 1: from -> to (+ to -), -1: to -> from

      // Real Physics Drift Velocity (v_d = I / (n * A * q)):
      // In physical electronics, drift velocity depends purely on current I and wire cross-section A.
      // It is completely independent of wire length!
      // Advancing particles by a fixed linear arc-distance (stepPx in pixels per frame)
      // guarantees that wires of any length in series (+ve feed, -ve return, inter-component)
      // move at the exact same physical speed (px/sec) across the entire circuit.
      const wireSpeed = Math.max(0.35, Math.min(3.2, wireData.speed || (wireCurrent / 0.025)));
      const stepPx = 1.35 * wireSpeed;
      const deltaT = stepPx / Math.max(1, totalLength);
      let curOffset = this.wireParticleOffsets.get(wire.id) || 0;
      curOffset = (curOffset + deltaT) % 1;
      this.wireParticleOffsets.set(wire.id, curOffset);

      for (let i = 0; i < numParticles; i++) {
        let t;
        let flowAngle;
        let speedFactor = wireSpeed;

        if (isAC) {
          // REAL AC: Current oscillates back-and-forth sinusoidally along the wire!
          const baseT = (i + 0.5) / numParticles;
          const oscAmplitude = Math.min(0.25, 0.65 / numParticles);
          const phaseOffset = i * 0.2;
          const osc = oscAmplitude * Math.sin(this.acPhase + phaseOffset);
          t = Math.max(0.02, Math.min(0.98, baseT + osc));

          // Tangent and instantaneous velocity (derivative of AC harmonic oscillation)
          const instVel = Math.cos(this.acPhase + phaseOffset) * (dir === 1 ? 1 : -1);
          const pt = pathEl.getPointAtLength(t * totalLength);

          const step = 0.015;
          let tA, tB;
          if (t + step <= 1) {
            tA = t;
            tB = t + step;
          } else {
            tA = Math.max(0, t - step);
            tB = t;
          }
          const pA = pathEl.getPointAtLength(tA * totalLength);
          const pB = pathEl.getPointAtLength(tB * totalLength);
          const forwardAngle = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);
          flowAngle = (instVel >= 0) ? forwardAngle : (forwardAngle + 180);
          speedFactor = Math.abs(instVel);

          // Glowing particle dot with AC alternating amber or cyan glow
          let particle = document.getElementById(`electron-${wire.id}-${i}`);
          if (!particle) {
            particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            particle.id = `electron-${wire.id}-${i}`;
            particle.setAttribute('r', '3.6');
            this.dom.wiresGroup.appendChild(particle);
          }
          particle.setAttribute('class', `electron-particle current-particle ac-particle ${isElectronMode ? 'electron-flow-particle' : ''}`);
          particle.setAttribute('cx', pt.x);
          particle.setAttribute('cy', pt.y);

          // Direction Arrow Chevron (pointing in instantaneous AC flow direction: L -> N then N -> L)
          let arrow = document.getElementById(`arrow-${wire.id}-${i}`);
          if (!arrow) {
            arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            arrow.id = `arrow-${wire.id}-${i}`;
            arrow.setAttribute('points', '-4,-3 4,0 -4,3');
            this.dom.wiresGroup.appendChild(arrow);
          }
          arrow.setAttribute('class', `current-flow-arrow ac-arrow ${isElectronMode ? 'electron-flow-arrow' : ''}`);
          arrow.setAttribute('opacity', speedFactor > 0.15 ? '0.95' : '0.2');
          arrow.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${flowAngle}) scale(${Math.max(0.4, speedFactor)})`);
        } else {
          // DIRECT CURRENT (DC):
          // Conventional Current Flow: Positive to Negative (dir === 1: from -> to (+ to -))
          // Real Electron Flow: Negative to Positive (effectiveDir: reversed drift direction)
          const rawT = (curOffset + i / numParticles) % 1;
          const effectiveDir = isElectronMode ? -dir : dir;
          t = (effectiveDir === 1) ? rawT : (1 - rawT);
          const pt = pathEl.getPointAtLength(t * totalLength);

          const step = 0.015;
          let tA, tB;
          if (t + step <= 1) {
            tA = t;
            tB = t + step;
          } else {
            tA = Math.max(0, t - step);
            tB = t;
          }
          const pA = pathEl.getPointAtLength(tA * totalLength);
          const pB = pathEl.getPointAtLength(tB * totalLength);
          const forwardAngle = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);
          flowAngle = (effectiveDir === 1) ? forwardAngle : (forwardAngle + 180);

          let particle = document.getElementById(`electron-${wire.id}-${i}`);
          if (!particle) {
            particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            particle.id = `electron-${wire.id}-${i}`;
            particle.setAttribute('r', isElectronMode ? '3.8' : '3.6');
            this.dom.wiresGroup.appendChild(particle);
          }
          particle.setAttribute('class', `electron-particle current-particle ${isElectronMode ? 'electron-flow-particle' : ''}`);
          particle.setAttribute('cx', pt.x);
          particle.setAttribute('cy', pt.y);

          let arrow = document.getElementById(`arrow-${wire.id}-${i}`);
          if (!arrow) {
            arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            arrow.id = `arrow-${wire.id}-${i}`;
            arrow.setAttribute('points', '-4,-3 4,0 -4,3');
            this.dom.wiresGroup.appendChild(arrow);
          }
          arrow.setAttribute('class', `current-flow-arrow ${isElectronMode ? 'electron-flow-arrow' : ''}`);
          arrow.setAttribute('opacity', '0.95');
          arrow.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${flowAngle})`);
        }
      }
    }
  }

  // Confetti Particle System (Multi-Cannon Celebratory Confetti Shower)
  clearConfetti() {
    this.confettiParticles = [];
    if (this.confettiCtx && this.dom && this.dom.confettiCanvas) {
      this.confettiCtx.clearRect(0, 0, this.dom.confettiCanvas.width, this.dom.confettiCanvas.height);
    }
    this.confettiNeedsClear = false;
  }

  initConfetti() {
    if (!this.dom || !this.dom.confettiCanvas) return;
    this.confettiCtx = this.dom.confettiCanvas.getContext('2d');
    const resize = () => {
      if (!this.dom.confettiCanvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.dom.confettiCanvas.width = Math.round(w * dpr);
      this.dom.confettiCanvas.height = Math.round(h * dpr);
      this.dom.confettiCanvas.style.width = `${w}px`;
      this.dom.confettiCanvas.style.height = `${h}px`;
      this.confettiDpr = dpr;
      if (this.confettiCtx && (!this.confettiParticles || this.confettiParticles.length === 0)) {
        this.confettiCtx.clearRect(0, 0, this.dom.confettiCanvas.width, this.dom.confettiCanvas.height);
      }
    };
    window.addEventListener('resize', resize);
    resize();
  }

  launchConfetti() {
    if (!this.confettiParticles) this.confettiParticles = [];
    // Cap active particles to prevent lag
    if (this.confettiParticles.length > 80) {
      this.confettiParticles = this.confettiParticles.slice(-40);
    }

    const colors = [
      '#38bdf8', '#fbbf24', '#f59e0b', '#f43f5e', '#a855f7',
      '#f97316', '#ec4899', '#06b6d4', '#eab308', '#ea580c'
    ];
    const shapes = ['rect', 'circle', 'strip'];

    const w = window.innerWidth || 1000;
    const h = window.innerHeight || 700;

    // Cannon 1: Left Bottom Cannon (Fires high upward-right across stage)
    const countLeft = 45;
    for (let i = 0; i < countLeft; i++) {
      const angle = (Math.PI / 180) * (55 + Math.random() * 25); // 55° to 80°
      const speed = 18 + Math.random() * 16;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.confettiParticles.push({
        shape,
        x: w * 0.08 + (Math.random() - 0.5) * 60,
        y: h * 0.96 + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        w: shape === 'strip' ? (Math.random() * 4 + 3) : (Math.random() * 7 + 5),
        h: shape === 'strip' ? (Math.random() * 10 + 8) : (Math.random() * 6 + 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 14,
        tiltAngle: Math.random() * Math.PI * 2,
        tiltSpeed: (Math.random() * 0.12 + 0.05),
        alpha: 1.0
      });
    }

    // Cannon 2: Right Bottom Cannon (Fires high upward-left across stage)
    const countRight = 45;
    for (let i = 0; i < countRight; i++) {
      const angle = (Math.PI / 180) * (100 + Math.random() * 25); // 100° to 125°
      const speed = 18 + Math.random() * 16;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.confettiParticles.push({
        shape,
        x: w * 0.92 + (Math.random() - 0.5) * 60,
        y: h * 0.96 + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        w: shape === 'strip' ? (Math.random() * 4 + 3) : (Math.random() * 7 + 5),
        h: shape === 'strip' ? (Math.random() * 10 + 8) : (Math.random() * 6 + 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 14,
        tiltAngle: Math.random() * Math.PI * 2,
        tiltSpeed: (Math.random() * 0.12 + 0.05),
        alpha: 1.0
      });
    }

    // Cannon 3: Full-Width Top Sky Shimmer Rain (No center clump!)
    const countRain = 60;
    for (let i = 0; i < countRain; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.confettiParticles.push({
        shape,
        x: Math.random() * w,
        y: -10 - Math.random() * 120, // Staggered drop from above the viewport
        vx: (Math.random() - 0.5) * 4,
        vy: 1.8 + Math.random() * 3.5,
        w: shape === 'strip' ? (Math.random() * 4 + 3) : (Math.random() * 7 + 5),
        h: shape === 'strip' ? (Math.random() * 12 + 8) : (Math.random() * 6 + 5),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 10,
        tiltAngle: Math.random() * Math.PI * 2,
        tiltSpeed: (Math.random() * 0.14 + 0.06),
        alpha: 1.0
      });
    }
  }

  updateConfetti() {
    const canvas = this.dom ? this.dom.confettiCanvas : null;
    if (!canvas) return;
    const ctx = this.confettiCtx;
    if (!ctx) return;

    if (!this.confettiParticles || this.confettiParticles.length === 0) {
      if (this.confettiNeedsClear) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.confettiNeedsClear = false;
      }
      return;
    }

    this.confettiNeedsClear = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = this.confettiDpr || 1;

    ctx.save();
    ctx.scale(dpr, dpr);

    const h = window.innerHeight || 800;

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx + Math.sin(p.tiltAngle) * 0.7;
      p.y += p.vy;
      p.vy += 0.28; // Smooth natural gravity
      p.vx *= 0.985; // Air resistance
      p.vy *= 0.988;
      p.rotation += p.spin;
      p.tiltAngle += p.tiltSpeed;
      p.alpha -= (p.y > h * 0.75) ? 0.014 : 0.0045;

      if (p.alpha <= 0 || p.y > h + 50) {
        this.confettiParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.scale(1, Math.cos(p.tiltAngle)); // 3D paper tumbling flip
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }

    ctx.restore();

    // If particles array just emptied on this frame, clear canvas immediately
    if (this.confettiParticles.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.confettiNeedsClear = false;
    }
  }

  // ==========================================================================
  // STANDARD RESISTOR VALUES & EIA COLOR CODE GUIDE SYSTEM
  // ==========================================================================

  initResistorCodesModal() {
    const b1 = this.dom.decoderBand1;
    const b2 = this.dom.decoderBand2;
    const b3 = this.dom.decoderBand3;
    if (!b1 || !b2 || !b3) return;

    b1.innerHTML = '';
    b2.innerHTML = '';
    b3.innerHTML = '';

    if (Array.isArray(window.RESISTOR_COLOR_DATA)) {
      window.RESISTOR_COLOR_DATA.forEach(c => {
        // Band 1: 1-9 (Brown to White)
        if (c.digit >= 1) {
          const opt = document.createElement('option');
          opt.value = c.digit;
          opt.textContent = `${c.digit} • ${c.name}`;
          b1.appendChild(opt);
        }
        // Band 2: 0-9 (Black to White)
        const opt2 = document.createElement('option');
        opt2.value = c.digit;
        opt2.textContent = `${c.digit} • ${c.name}`;
        b2.appendChild(opt2);

        // Band 3: Multiplier (0-6 for up to 10M)
        if (c.digit <= 6) {
          const opt3 = document.createElement('option');
          opt3.value = c.digit;
          opt3.textContent = `${c.name} (${c.mult})`;
          b3.appendChild(opt3);
        }
      });
    }

    // Default to 220 Ohm (Red=2, Red=2, Brown=1, Gold)
    b1.value = '2';
    b2.value = '2';
    b3.value = '1';

    const onBandChange = () => {
      const d1 = parseInt(b1.value, 10);
      const d2 = parseInt(b2.value, 10);
      const mult = parseInt(b3.value, 10);
      const ohms = (d1 * 10 + d2) * Math.pow(10, mult);
      this.updateDecoderDisplay(ohms);
    };

    [b1, b2, b3].forEach(sel => sel.addEventListener('change', onBandChange));

    // Render full values grid
    this.renderResistorValuesTable();

    // Setup Category Tabs
    if (this.dom.resistorCatPills) {
      this.dom.resistorCatPills.querySelectorAll('.res-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.dom.resistorCatPills.querySelectorAll('.res-cat-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.filterResistorCards(btn.dataset.cat, this.dom.resistorSearchInput ? this.dom.resistorSearchInput.value : '');
        });
      });
    }

    // Setup Search Input
    if (this.dom.resistorSearchInput) {
      this.dom.resistorSearchInput.addEventListener('input', (e) => {
        const activeCatBtn = this.dom.resistorCatPills ? this.dom.resistorCatPills.querySelector('.res-cat-btn.active') : null;
        const cat = activeCatBtn ? activeCatBtn.dataset.cat : 'all';
        this.filterResistorCards(cat, e.target.value);
      });
    }

    // Modal Close Buttons
    if (this.dom.btnCloseResistorCodes) {
      this.dom.btnCloseResistorCodes.addEventListener('click', () => this.closeResistorCodesModal());
    }
    if (this.dom.btnCloseResistorCodesBottom) {
      this.dom.btnCloseResistorCodesBottom.addEventListener('click', () => this.closeResistorCodesModal());
    }
    if (this.dom.resistorCodesModal) {
      this.dom.resistorCodesModal.addEventListener('click', (e) => {
        if (e.target === this.dom.resistorCodesModal) this.closeResistorCodesModal();
      });
    }

    // Header Toolbar Button
    if (this.dom.btnResistorCodes) {
      this.dom.btnResistorCodes.addEventListener('click', () => this.openResistorCodesModal());
    }

    // Ohm's Law Calculator Tab 3 (Color Codes)
    if (this.dom.tabOhmsResistor) {
      this.dom.tabOhmsResistor.addEventListener('click', () => this.switchOhmsTab('resistor'));
    }
    if (this.dom.btnOhmsOpenFullResistor) {
      this.dom.btnOhmsOpenFullResistor.addEventListener('click', () => this.openResistorCodesModal());
    }

    this.renderOhmsCalculatorResistorChips();
    this.updateDecoderDisplay(220);
  }

  updateDecoderDisplay(ohms) {
    const info = window.getResistorColorDetails(ohms || 220);
    if (this.dom.decoderValText) this.dom.decoderValText.textContent = info.formatted;
    if (this.dom.decoderCodeText) this.dom.decoderCodeText.textContent = `${info.codeString} (±5%)`;
    if (this.dom.decoderTolText) this.dom.decoderTolText.textContent = `Safe Range: ${info.minFormatted} – ${info.maxFormatted}`;

    if (this.dom.decoderBand1) this.dom.decoderBand1.value = info.details[0].value.toString();
    if (this.dom.decoderBand2) this.dom.decoderBand2.value = info.details[1].value.toString();
    if (this.dom.decoderBand3) {
      const str = Math.round(info.ohms).toString();
      let m = str.length - 2;
      if (m < 0) m = 0;
      if (m > 6) m = 6;
      this.dom.decoderBand3.value = m.toString();
    }

    if (this.dom.decoderResistorSvg) {
      this.dom.decoderResistorSvg.innerHTML = `
        <svg viewBox="0 0 200 70" width="200" height="70">
          <line x1="20" y1="35" x2="66" y2="35" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
          <line x1="134" y1="35" x2="180" y2="35" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
          <rect x="66" y="20" width="68" height="30" rx="10" fill="#d4b996" stroke="#a89078" stroke-width="2"/>
          <path d="M 72 23 L 128 23" stroke="#ffffff" stroke-width="2.2" opacity="0.45" stroke-linecap="round"/>
          <rect x="76" y="20" width="4.5" height="30" fill="${info.bands[0]}"/>
          <rect x="86" y="20" width="4.5" height="30" fill="${info.bands[1]}"/>
          <rect x="96" y="20" width="4.5" height="30" fill="${info.bands[2]}"/>
          <rect x="116" y="20" width="5.5" height="30" fill="${info.bands[3]}"/>
          <text x="100" y="14" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" text-anchor="middle">${info.formatted}</text>
        </svg>
      `;
    }
  }

  renderResistorValuesTable() {
    const container = this.dom.resistorValuesContainer;
    if (!container || !Array.isArray(window.STANDARD_RESISTOR_CATEGORIES)) return;
    container.innerHTML = '';

    window.STANDARD_RESISTOR_CATEGORIES.forEach(cat => {
      const block = document.createElement('div');
      block.className = 'res-category-block';
      block.dataset.catId = cat.id;

      block.innerHTML = `
        <div class="res-cat-heading">
          <span class="res-cat-heading-title">⚡ ${cat.name} (${cat.rangeText})</span>
          <span class="res-cat-heading-desc">${cat.description}</span>
        </div>
        <div class="res-cards-grid"></div>
      `;

      const grid = block.querySelector('.res-cards-grid');

      cat.values.forEach(v => {
        const info = window.getResistorColorDetails(v);
        const card = document.createElement('div');
        card.className = 'resistor-item-card';
        card.dataset.val = v;
        card.dataset.cat = cat.id;
        card.dataset.search = `${info.formatted} ${v} ${info.codeString} ${cat.name}`.toLowerCase();

        card.innerHTML = `
          <div class="res-card-top-row">
            <span class="res-card-value">${info.formatted}</span>
            <span class="res-card-raw-ohms">${v.toLocaleString()} Ω</span>
          </div>

          <div class="res-card-graphic-wrapper">
            <div class="mini-resistor-graphic">
              <span class="mini-resistor-stripe s1" style="background: ${info.bands[0]};" title="1st: ${info.details[0].name}"></span>
              <span class="mini-resistor-stripe s2" style="background: ${info.bands[1]};" title="2nd: ${info.details[1].name}"></span>
              <span class="mini-resistor-stripe s3" style="background: ${info.bands[2]};" title="Mult: ${info.details[2].name}"></span>
              <span class="mini-resistor-stripe s4" style="background: ${info.bands[3]};" title="Tol: Gold (±5%)"></span>
            </div>
          </div>

          <div class="res-card-stripes-text" title="${info.codeString}">
            ${info.codeString}
          </div>

          <button type="button" class="res-card-apply-btn" title="Set selected component to ${info.formatted}">
            ⚡ Apply ${info.formatted}
          </button>
        `;

        card.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyResistorValue(v);
        });

        const btnApply = card.querySelector('.res-card-apply-btn');
        if (btnApply) {
          btnApply.addEventListener('click', (e) => {
            e.stopPropagation();
            this.applyResistorValue(v);
          });
        }

        grid.appendChild(card);
      });

      container.appendChild(block);
    });
  }

  filterResistorCards(catId = 'all', query = '') {
    const q = (query || '').toLowerCase().trim();
    const container = this.dom.resistorValuesContainer;
    if (!container) return;

    const blocks = container.querySelectorAll('.res-category-block');
    blocks.forEach(block => {
      const matchCat = (catId === 'all' || block.dataset.catId === catId);
      if (!matchCat) {
        block.style.display = 'none';
        return;
      }

      let hasVisibleCard = false;
      const cards = block.querySelectorAll('.resistor-item-card');
      cards.forEach(card => {
        const text = card.dataset.search || '';
        const matchSearch = (!q || text.includes(q));
        if (matchSearch) {
          card.style.display = 'flex';
          hasVisibleCard = true;
        } else {
          card.style.display = 'none';
        }
      });

      block.style.display = hasVisibleCard ? 'flex' : 'none';
    });
  }

  highlightResistorCard(ohms) {
    const container = this.dom.resistorValuesContainer;
    if (!container) return;
    container.querySelectorAll('.resistor-item-card').forEach(card => {
      const val = parseFloat(card.dataset.val);
      const isMatch = (val === ohms);
      card.classList.toggle('is-active-card', isMatch);
      if (isMatch) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  openResistorCodesModal(highlightOhms = null) {
    if (!this.dom.resistorCodesModal) return;

    let targetR = highlightOhms;
    if (!targetR && this.selectedComponent && this.selectedComponent.type === 'resistor') {
      targetR = this.selectedComponent.state.resistance || 220;
    }
    if (!targetR) {
      targetR = 220;
    }

    targetR = window.getClosestStandardResistor(targetR);
    this.updateDecoderDisplay(targetR);
    this.highlightResistorCard(targetR);

    if (this.dom.resistorModalTargetNotice) {
      if (this.selectedComponent && this.selectedComponent.type === 'resistor') {
        this.dom.resistorModalTargetNotice.innerHTML = `
          🎯 Connected to <strong>Fixed Resistor</strong> on board (${window.formatResistance(this.selectedComponent.state.resistance || 220)}). Click any card below to apply!
        `;
      } else {
        this.dom.resistorModalTargetNotice.innerHTML = `
          💡 Click <strong>"Apply"</strong> on any card to place or update a resistor on your board!
        `;
      }
    }

    this.dom.resistorCodesModal.style.display = 'flex';
    if (window.sounds && typeof window.sounds.playClick === 'function') {
      window.sounds.playClick();
    }
  }

  closeResistorCodesModal() {
    if (this.dom.resistorCodesModal) {
      this.dom.resistorCodesModal.style.display = 'none';
    }
  }

  applyResistorValue(ohms) {
    const std = window.getClosestStandardResistor(ohms);

    if (this.selectedComponent && this.selectedComponent.type === 'resistor') {
      const comp = this.selectedComponent;
      this.pushHistory();
      comp.state.resistance = std;
      this.updateComponentVisual(comp);
      try {
        this.showInspector(comp);
        if (this.ohmsCalcActive && typeof this.updateOhmsCalcWindow === 'function') {
          this.updateOhmsCalcWindow();
        }
      } catch (e) {
        console.warn('Inspector update warning:', e);
      }
      this.evaluateCircuit();
      this.updateDecoderDisplay(std);
      this.highlightResistorCard(std);

      if (window.sounds && typeof window.sounds.playClick === 'function') {
        window.sounds.playClick();
      }
      return;
    }

    // If no resistor selected, find first resistor or spawn one in sandbox
    const existing = this.components.find(c => c.type === 'resistor');
    if (existing) {
      this.selectComponent(existing);
      this.applyResistorValue(std);
    } else if (this.mode === 'sandbox') {
      const newRes = this.spawnComponent('resistor', 360, 240, null, { resistance: std });
      this.selectComponent(newRes);
      this.updateDecoderDisplay(std);
      this.highlightResistorCard(std);
    }
  }

  renderOhmsCalculatorResistorChips() {
    const grid = this.dom.ohmsResChipsGrid;
    if (!grid || !Array.isArray(window.STANDARD_RESISTOR_VALUES)) return;
    grid.innerHTML = '';

    window.STANDARD_RESISTOR_VALUES.forEach(v => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ohms-res-chip';
      btn.dataset.val = v;
      btn.textContent = window.formatResistance(v);
      btn.title = `${window.formatResistance(v)} (${window.getResistorColorDetails(v).codeString})`;

      btn.addEventListener('click', () => {
        this.applyResistorValue(v);
        this.updateOhmsCalculatorResistorTab();
      });

      grid.appendChild(btn);
    });
  }

  updateOhmsCalculatorResistorTab() {
    let curR = 220;
    if (this.selectedComponent && this.selectedComponent.type === 'resistor') {
      curR = window.getClosestStandardResistor(this.selectedComponent.state.resistance || 220);
    }

    const info = window.getResistorColorDetails(curR);
    if (this.dom.ohmsResCurVal) {
      this.dom.ohmsResCurVal.textContent = `${info.formatted} (Fixed Resistor)`;
    }
    if (this.dom.ohmsResCodeDesc) {
      this.dom.ohmsResCodeDesc.textContent = `${info.codeString} (±5%)`;
    }
    if (this.dom.ohmsResStripesDisplay) {
      this.dom.ohmsResStripesDisplay.innerHTML = `
        <div class="mini-resistor-graphic">
          <span class="mini-resistor-stripe s1" style="background: ${info.bands[0]};"></span>
          <span class="mini-resistor-stripe s2" style="background: ${info.bands[1]};"></span>
          <span class="mini-resistor-stripe s3" style="background: ${info.bands[2]};"></span>
          <span class="mini-resistor-stripe s4" style="background: ${info.bands[3]};"></span>
        </div>
      `;
    }

    if (this.dom.ohmsResChipsGrid) {
      this.dom.ohmsResChipsGrid.querySelectorAll('.ohms-res-chip').forEach(chip => {
        const val = parseFloat(chip.dataset.val);
        chip.classList.toggle('active', val === curR);
      });
    }
  }
}

// Expose globally
window.CircuitApp = CircuitApp;
window.App = CircuitApp;

// Instantiate on DOM Loaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new CircuitApp();
  window.app.init();
  window.skipTask = () => window.app && window.app.skipTask();
  if (window.location.hash && window.location.hash.includes('advanced')) {
    window.app.toggleAdvancedSidebar(true);
    if (window.location.hash.includes('led')) {
      window.app.loadLevel(2);
      setTimeout(() => {
        const led = window.app.circuit.components.find(c => c.type === 'led');
        if (led) window.app.showInspector(led);
      }, 100);
    }
  }
});
