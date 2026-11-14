// Circuit Simulation Engine: Series & Parallel Voltage Analysis, Ratings & Failure Engine

class CircuitSolver {
  constructor(components = [], wires = []) {
    this.setElements(components, wires);
    this.status = {
      isComplete: false,
      isShortCircuit: false,
      circuitFailed: false,
      activeComponents: new Set(),
      failedComponents: [],
      failureReason: '',
      warnings: [],
      totalVoltage: 0,
      wireCurrents: new Map() // wireId -> { active, speed }
    };
  }

  setElements(components, wires) {
    this.components = components || [];
    this.wires = wires || [];
    for (const comp of this.components) {
      if (!comp.terminals && typeof window !== 'undefined' && window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[comp.type]) {
        comp.terminals = window.COMPONENT_DEFINITIONS[comp.type].terminals;
      }
    }
  }

  // Find all disjoint electrical nets (connected groups of pins)
  buildNets() {
    const parent = new Map();

    const find = (p) => {
      if (!parent.has(p)) parent.set(p, p);
      if (parent.get(p) !== p) {
        parent.set(p, find(parent.get(p)));
      }
      return parent.get(p);
    };

    const union = (p1, p2) => {
      const root1 = find(p1);
      const root2 = find(p2);
      if (root1 !== root2) {
        parent.set(root1, root2);
      }
    };

    // Union pins connected by wires (including wire-to-wire junctions!)
    for (const wire of this.wires) {
      const p1 = (wire.fromComp && typeof wire.fromComp === 'string' && wire.fromComp.startsWith('wire:'))
        ? wire.fromComp
        : `${wire.fromComp}:${wire.fromPin}`;
      const p2 = (wire.toComp && typeof wire.toComp === 'string' && wire.toComp.startsWith('wire:'))
        ? wire.toComp
        : `${wire.toComp}:${wire.toPin}`;
      union(p1, p2);
      if (wire.id) {
        union(`wire:${wire.id}`, p1);
      }
    }

    // Union internal connections for closed switches and two-way switches (unless burnt)
    for (const comp of this.components) {
      if (comp.type === 'switch' && comp.state.closed && !comp.state.burnt) {
        union(`${comp.id}:pin1`, `${comp.id}:pin2`);
      }
      if (comp.type === 'pushbutton' && comp.state.pressed && !comp.state.burnt) {
        union(`${comp.id}:pin1`, `${comp.id}:pin2`);
      }
      if (comp.type === 'twowayswitch' && !comp.state.burnt) {
        const throwPin = (comp.state.position === 2) ? 'l2' : 'l1';
        union(`${comp.id}:com`, `${comp.id}:${throwPin}`);
      }
      if (comp.type === 'relay' && !comp.state.burnt) {
        const contactPin = comp.state.energized ? 'no' : 'nc';
        union(`${comp.id}:com`, `${comp.id}:${contactPin}`);
      }
      if (comp.type === 'multimeter' && comp.state.mode === 'dca' && !comp.state.burnt) {
        union(`${comp.id}:vin`, `${comp.id}:com`);
      }
      if (comp.type === 'wattmeter' && !comp.state.burnt) {
        union(`${comp.id}:in_neg`, `${comp.id}:out_neg`);
      }
      if (comp.type === 'power_supply' && !comp.state.burnt) {
        union(`${comp.id}:neg`, `${comp.id}:gnd`);
      }
      // Transistors are semiconductor active devices solved via PN junction and channel physics in analyzeCircuitBranches
    }

    const nets = new Map();
    for (const comp of this.components) {
      const terms = comp.terminals || (typeof window !== 'undefined' && window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[comp.type] && window.COMPONENT_DEFINITIONS[comp.type].terminals) || [];
      for (const pin of terms) {
        const pinId = `${comp.id}:${pin.id}`;
        const root = find(pinId);
        if (!nets.has(root)) nets.set(root, new Set());
        nets.get(root).add(pinId);
      }
    }

    return { find, nets };
  }

  // Check if a net is connected to positive power source (directly or through passive resistors/LDR/potentiometer)
  isNetConnectedToPositive(targetNet, posRoots, find, excludeCompId = null) {
    const isRoot = (n) => (posRoots instanceof Set ? posRoots.has(n) : posRoots.includes(n));
    if (isRoot(targetNet)) return true;

    const visited = new Set([targetNet]);
    const queue = [targetNet];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (isRoot(cur)) return true;

      for (const comp of this.components) {
        if (comp.id === excludeCompId || comp.state.burnt) continue;
        if (comp.type === 'potentiometer') {
          const p1 = find(`${comp.id}:pin1`);
          const pw = find(`${comp.id}:wiper`);
          const p2 = find(`${comp.id}:pin2`);
          const checkAdd = (fromPin, toPin) => {
            if (fromPin === cur && !visited.has(toPin)) {
              visited.add(toPin);
              queue.push(toPin);
            }
          };
          checkAdd(p1, pw); checkAdd(pw, p1);
          checkAdd(pw, p2); checkAdd(p2, pw);
          checkAdd(p1, p2); checkAdd(p2, p1);
        } else if (comp.type === 'resistor' || comp.type === 'ldr' || comp.type === 'ammeter' || comp.type === 'fuse') {
          const pinA = find(`${comp.id}:${comp.terminals[0].id}`);
          const pinB = find(`${comp.id}:${comp.terminals[1].id}`);
          if (pinA === cur && !visited.has(pinB)) {
            visited.add(pinB);
            queue.push(pinB);
          } else if (pinB === cur && !visited.has(pinA)) {
            visited.add(pinA);
            queue.push(pinA);
          }
        }
      }
    }
    return false;
  }

  // Check if a net is connected to negative power source (directly or through passive resistors/LDR/potentiometer)
  isNetConnectedToNegative(targetNet, negRoots, find, excludeCompId = null) {
    const isRoot = (n) => (negRoots instanceof Set ? negRoots.has(n) : negRoots.includes(n));
    if (isRoot(targetNet)) return true;

    const visited = new Set([targetNet]);
    const queue = [targetNet];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (isRoot(cur)) return true;

      for (const comp of this.components) {
        if (comp.id === excludeCompId || comp.state.burnt) continue;
        if (comp.type === 'potentiometer') {
          const p1 = find(`${comp.id}:pin1`);
          const pw = find(`${comp.id}:wiper`);
          const p2 = find(`${comp.id}:pin2`);
          const checkAdd = (fromPin, toPin) => {
            if (fromPin === cur && !visited.has(toPin)) {
              visited.add(toPin);
              queue.push(toPin);
            }
          };
          checkAdd(p1, pw); checkAdd(pw, p1);
          checkAdd(pw, p2); checkAdd(p2, pw);
          checkAdd(p1, p2); checkAdd(p2, p1);
        } else if (comp.type === 'resistor' || comp.type === 'ldr' || comp.type === 'ammeter' || comp.type === 'fuse') {
          const pinA = find(`${comp.id}:${comp.terminals[0].id}`);
          const pinB = find(`${comp.id}:${comp.terminals[1].id}`);
          if (pinA === cur && !visited.has(pinB)) {
            visited.add(pinB);
            queue.push(pinB);
          } else if (pinB === cur && !visited.has(pinA)) {
            visited.add(pinA);
            queue.push(pinA);
          }
        }
      }
    }
    return false;
  }

  // Calculate Thevenin voltage and equivalent resistance at targetNet from power sources through passive networks & semiconductors
  getNetThevenin(targetNet, posRoots, negRoots, totalVoltage, find) {
    const isPos = (n) => (posRoots instanceof Set ? posRoots.has(n) : posRoots.includes(n));
    const isNeg = (n) => (negRoots instanceof Set ? negRoots.has(n) : negRoots.includes(n));

    if (isPos(targetNet)) return { vTh: totalVoltage, rTh: 0.05, isDirectPos: true, isDirectNeg: false };
    if (isNeg(targetNet)) return { vTh: 0, rTh: 0.05, isDirectPos: false, isDirectNeg: true };

    let gPos = 0;
    let gNeg = 0;

    for (const comp of this.components) {
      if (comp.state.burnt) continue;
      if (comp.type === 'potentiometer') {
        const net1 = find(`${comp.id}:pin1`);
        const netW = find(`${comp.id}:wiper`);
        const net2 = find(`${comp.id}:pin2`);
        const totalR = comp.state.totalResistance || 1000;
        const ratio = comp.state.wiperRatio !== undefined ? comp.state.wiperRatio : (comp.state.resistance !== undefined ? comp.state.resistance / totalR : 0.5);
        const r1 = Math.max(0.5, (1 - ratio) * totalR);
        const r2 = Math.max(0.5, ratio * totalR);

        const addBranch = (fromNet, toNet, rVal) => {
          if (fromNet === targetNet) {
            const g = 1.0 / rVal;
            if (isPos(toNet)) {
              gPos += g;
            } else if (isNeg(toNet)) {
              gNeg += g;
            } else if (this.isNetConnectedToPositive(toNet, posRoots, find, comp.id)) {
              gPos += g;
            } else if (this.isNetConnectedToNegative(toNet, negRoots, find, comp.id)) {
              gNeg += g;
            }
          }
        };

        // Pin 1 to Wiper (R1)
        addBranch(netW, net1, r1);
        addBranch(net1, netW, r1);
        // Wiper to Pin 2 (R2)
        addBranch(netW, net2, r2);
        addBranch(net2, netW, r2);
        // Pin 1 to Pin 2 (R_total)
        addBranch(net1, net2, totalR);
        addBranch(net2, net1, totalR);
      } else if (comp.type === 'resistor' || comp.type === 'ldr' || comp.type === 'ammeter' || comp.type === 'fuse') {
        const pinA = find(`${comp.id}:${comp.terminals[0].id}`);
        const pinB = find(`${comp.id}:${comp.terminals[1].id}`);
        const r = (comp.type === 'ammeter' || comp.type === 'fuse') ? 0.01 : Math.max(0.01, comp.state.resistance !== undefined ? comp.state.resistance : 100);
        const g = 1.0 / r;

        if (pinA === targetNet) {
          if (isPos(pinB)) gPos += g;
          else if (isNeg(pinB)) gNeg += g;
          else if (this.isNetConnectedToPositive(pinB, posRoots, find, comp.id)) gPos += g;
          else if (this.isNetConnectedToNegative(pinB, negRoots, find, comp.id)) gNeg += g;
        } else if (pinB === targetNet) {
          if (isPos(pinA)) gPos += g;
          else if (isNeg(pinA)) gNeg += g;
          else if (this.isNetConnectedToPositive(pinA, posRoots, find, comp.id)) gPos += g;
          else if (this.isNetConnectedToNegative(pinA, negRoots, find, comp.id)) gNeg += g;
        }
      } else if (comp.type && comp.type.startsWith('gate_')) {
        // Logic gate inputs feature high-impedance internal pull-downs (~8kΩ) to Ground (logic LOW default)
        for (const term of (comp.terminals || [])) {
          if (term.polarity === 'logic_in') {
            const netIn = find(`${comp.id}:${term.id}`);
            if (netIn === targetNet) {
              gNeg += 1.0 / 8000.0;
            }
          }
        }
      }
    }

    if (gPos > 0 && gNeg > 0) {
      const rTh = 1.0 / (gPos + gNeg);
      const vTh = totalVoltage * (gPos / (gPos + gNeg));
      return { vTh, rTh, isDirectPos: false, isDirectNeg: false };
    }
    if (gPos > 0) {
      return { vTh: totalVoltage, rTh: 1.0 / gPos, isDirectPos: false, isDirectNeg: false };
    }
    if (gNeg > 0) {
      return { vTh: 0, rTh: 1.0 / gNeg, isDirectPos: false, isDirectNeg: false };
    }

    // Check if targetNet is a transistor node that is established by conduction state
    for (const comp of this.components) {
      if (comp.state.burnt) continue;
      if (comp.type === 'npn') {
        const netC = find(`${comp.id}:c`);
        const netB = find(`${comp.id}:b`);
        const netE = find(`${comp.id}:e`);
        const vE = isNeg(netE) ? 0 : (isPos(netE) ? totalVoltage : 0);

        if (targetNet === netC) {
          if (comp.state.conducting) {
            const vce = (comp.state.operatingRegime === 'saturation') ? 0.20 : (comp.state.vce || 0.20);
            return { vTh: vE + vce, rTh: 0.1, isDirectPos: false, isDirectNeg: false };
          }
        } else if (targetNet === netB) {
          if (comp.state.conducting) {
            return { vTh: vE + 0.70, rTh: 5.0, isDirectPos: false, isDirectNeg: false };
          }
        }
      } else if (comp.type === 'pnp') {
        const netE = find(`${comp.id}:e`);
        const netB = find(`${comp.id}:b`);
        const netC = find(`${comp.id}:c`);
        const vE = isPos(netE) ? totalVoltage : (isNeg(netE) ? 0 : totalVoltage);

        if (targetNet === netC) {
          if (comp.state.conducting) {
            const vec = (comp.state.operatingRegime === 'saturation') ? 0.20 : (comp.state.vec || 0.20);
            return { vTh: Math.max(0, vE - vec), rTh: 0.1, isDirectPos: false, isDirectNeg: false };
          }
        } else if (targetNet === netB) {
          if (comp.state.conducting) {
            return { vTh: Math.max(0, vE - 0.70), rTh: 5.0, isDirectPos: false, isDirectNeg: false };
          }
        }
      } else if (comp.type && comp.type.startsWith('gate_')) {
        const netOut = find(`${comp.id}:out`);
        if (targetNet === netOut) {
          const v = comp.state.outputLevel ? 5.0 : 0.0;
          return { vTh: v, rTh: 120.0, isDirectPos: comp.state.outputLevel === 1, isDirectNeg: comp.state.outputLevel === 0 };
        }
      } else if (comp.type && comp.type.startsWith('ic_') && !comp.state.burnt && comp.state.gates) {
        const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[comp.type];
        if (spec && spec.gatePins) {
          for (let i = 0; i < spec.gatePins.length; i++) {
            const gp = spec.gatePins[i];
            const netOut = find(`${comp.id}:${gp.out}`);
            if (targetNet === netOut) {
              const gState = comp.state.gates.find(g => g.id === gp.id);
              const isHigh = comp.state.powered && gState && gState.out === 1;
              const v = isHigh ? (comp.state.vccVoltage || 5.0) : 0.0;
              return { vTh: v, rTh: 50.0, isDirectPos: isHigh, isDirectNeg: !isHigh };
            }
          }
        }
      }
    }

    return { vTh: 0, rTh: 1e9, isDirectPos: false, isDirectNeg: false };
  }

  getNetTheveninVoltage(targetNet, posRoots, negRoots, totalVoltage, find) {
    return this.getNetThevenin(targetNet, posRoots, negRoots, totalVoltage, find).vTh;
  }

  evaluateTransistorBias(find, allPosRoots, allNegRoots, sysVolt) {
    let transistorFlipped = false;
    for (const comp of this.components) {
      if (comp.state.burnt) continue;
      if (comp.type === 'npn') {
        const bRoot = find(`${comp.id}:b`);
        const eRoot = find(`${comp.id}:e`);
        const wasConducting = comp.state.conducting;

        const thB = this.getNetThevenin(bRoot, allPosRoots, allNegRoots, sysVolt, find);
        const thE = this.getNetThevenin(eRoot, allPosRoots, allNegRoots, sysVolt, find);

        const vb = thB.vTh;
        const ve = (allNegRoots.has(eRoot) || this.isNetConnectedToNegative(eRoot, allNegRoots, find)) ? 0 : thE.vTh;
        const vbeDrive = vb - ve;

        comp.state.beta = comp.state.beta || 100; // Standard 2N3904 current gain β (h_FE)
        comp.state.vbe = Math.max(0, Math.min(0.70, vbeDrive));

        // Silicon NPN Base-Emitter acts as internal PN junction diode requiring ~0.7V forward bias to conduct
        const isForwardBiased = ((vbeDrive >= 0.70 && bRoot !== eRoot) || comp.state.forceOn);

        if (isForwardBiased) {
          // A base resistor (R_B) is always required to prevent excessive base current from damaging the junction
          if (thB.isDirectPos && thB.rTh < 15 && vbeDrive > 1.2) {
            comp.state.burnt = true;
            comp.state.burning = true;
            comp.state.burnReason = 'Base-Emitter Junction Burnout! Silicon BJT base was connected directly to voltage source without a current-limiting base resistor (R_B). Direct forward bias destroyed the PN junction!';
            comp.state.conducting = false;
            comp.state.baseCurrent = 0;
            comp.state.collectorCurrent = 0;
            comp.state.emitterCurrent = 0;
            comp.state.operatingRegime = 'cutoff';
            this.status.failedComponents.push(comp.id);
            this.status.circuitFailed = true;
            this.status.failureReason = comp.state.burnReason;
          } else {
            const rTh = Math.max(10, thB.rTh);
            // Base current through forward-biased PN diode: I_B = (V_th - 0.70V) / R_th
            const ib = Math.max(0.00001, (vbeDrive - 0.70) / rTh);
            comp.state.theveninIb = ib;
            comp.state.baseCurrent = ib;
            comp.state.vbe = 0.70;
            comp.state.conducting = true;
            if (!comp.state.operatingRegime || comp.state.operatingRegime === 'cutoff') {
              comp.state.operatingRegime = 'saturation';
            }
          }
        } else {
          comp.state.conducting = false;
          comp.state.baseCurrent = 0;
          comp.state.collectorCurrent = 0;
          comp.state.emitterCurrent = 0;
          comp.state.operatingRegime = 'cutoff';
          comp.state.vce = sysVolt;
          comp.state.voltageDrop = sysVolt;
        }

        if (comp.state.conducting !== wasConducting) transistorFlipped = true;
      } else if (comp.type === 'pnp') {
        const eRoot = find(`${comp.id}:e`);
        const bRoot = find(`${comp.id}:b`);
        const wasConducting = comp.state.conducting;

        const thE = this.getNetThevenin(eRoot, allPosRoots, allNegRoots, sysVolt, find);
        const thB = this.getNetThevenin(bRoot, allPosRoots, allNegRoots, sysVolt, find);

        const ve = (allPosRoots.has(eRoot) || this.isNetConnectedToPositive(eRoot, allPosRoots, find)) ? sysVolt : thE.vTh;
        const vb = thB.vTh;
        const vebDrive = ve - vb;

        comp.state.beta = comp.state.beta || 100; // Standard 2N3906 current gain β (h_FE)
        comp.state.veb = Math.max(0, Math.min(0.70, vebDrive));

        // Silicon PNP Base-Emitter conducts when Base is pulled negative relative to Emitter by >= 0.7V
        const isForwardBiased = ((vebDrive >= 0.70 && bRoot !== eRoot) || comp.state.forceOn);

        if (isForwardBiased) {
          // Check for direct ground connection without base resistor
          if (thB.isDirectNeg && thB.rTh < 15 && vebDrive > 1.2) {
            comp.state.burnt = true;
            comp.state.burning = true;
            comp.state.burnReason = 'Base-Emitter Junction Burnout! PNP base was connected directly to ground without a current-limiting base resistor (R_B). Direct forward bias destroyed the PN junction!';
            comp.state.conducting = false;
            comp.state.baseCurrent = 0;
            comp.state.collectorCurrent = 0;
            comp.state.emitterCurrent = 0;
            comp.state.operatingRegime = 'cutoff';
            this.status.failedComponents.push(comp.id);
            this.status.circuitFailed = true;
            this.status.failureReason = comp.state.burnReason;
          } else {
            const rTh = Math.max(10, thB.rTh);
            const ib = Math.max(0.00001, (vebDrive - 0.70) / rTh);
            comp.state.theveninIb = ib;
            comp.state.baseCurrent = ib;
            comp.state.veb = 0.70;
            comp.state.conducting = true;
            if (!comp.state.operatingRegime || comp.state.operatingRegime === 'cutoff') {
              comp.state.operatingRegime = 'saturation';
            }
          }
        } else {
          comp.state.conducting = false;
          comp.state.baseCurrent = 0;
          comp.state.collectorCurrent = 0;
          comp.state.emitterCurrent = 0;
          comp.state.operatingRegime = 'cutoff';
          comp.state.vec = sysVolt;
          comp.state.voltageDrop = sysVolt;
        }

        if (comp.state.conducting !== wasConducting) transistorFlipped = true;
      }
    }
    return transistorFlipped;
  }

  // Update resistance of all LDR sensors based on proximity and brightness of nearest glowing light source
  updateLDRSensors() {
    const ldrs = this.components.filter(c => (c.type === 'ldr' || c.type === 'photoresistor') && !c.state.burnt);
    if (ldrs.length === 0) return;

    // Find all active glowing lights on canvas
    const lights = [];
    const isStreetLightLevel = typeof window !== 'undefined' && window.app && (
      (window.app.currentLevel && (window.app.currentLevel.id === 16 || window.app.currentLevel.id === 22)) ||
      (window.app.currentLevelIndex === 15 || window.app.currentLevelIndex === 21) ||
      (window.GAME_LEVELS && window.GAME_LEVELS[window.app.currentLevelIndex] && (window.GAME_LEVELS[window.app.currentLevelIndex].id === 16 || window.GAME_LEVELS[window.app.currentLevelIndex].id === 22))
    );
    for (const comp of this.components) {
      if (comp.state && comp.state.burnt) continue;
      // In automatic street light systems, the street lamp is shielded / hooded from its own ambient twilight sensor
      if (isStreetLightLevel && (comp.type === 'bulb' || comp.type === 'led')) continue;
      if (comp.type === 'bulb' && comp.state.powered && (comp.state.brightness || 0) > 0.05) {
        const pwr = comp.state.brightness;
        lights.push({ id: comp.id, name: 'Incandescent Bulb', x: (comp.x || 0) + 78, y: (comp.y || 0) + 71, power: pwr });
      } else if (comp.type === 'led' && comp.state.powered && (comp.state.brightness || 0) > 0.05) {
        const pwr = comp.state.brightness * 0.85;
        lights.push({ id: comp.id, name: 'LED', x: (comp.x || 0) + 85, y: (comp.y || 0) + 62, power: pwr });
      }
    }

    for (const ldr of ldrs) {
      if (ldr.state.manualResistance !== undefined) {
        ldr.state.resistance = ldr.state.manualResistance;
        continue;
      }
      let opticalLux = 0;
      let nearestName = 'None';
      let nearestDist = 9999;
      const ldrCx = ldr.x + 77;
      const ldrCy = ldr.y + 62;

      for (const lt of lights) {
        const dx = lt.x - ldrCx;
        const dy = lt.y - ldrCy;
        const dist = Math.hypot(dx, dy);

        // Effective distance accounting for component body radii (~75px)
        const effDist = Math.max(25, dist - 75);
        // Inverse square law: illuminance is directly proportional to brightness (power) and inversely proportional to distance squared
        const lux = (lt.power * 500000) / (effDist * effDist);
        if (lux > opticalLux) {
          opticalLux = lux;
          nearestName = lt.name;
          nearestDist = Math.round(dist);
        }
      }

      // Base ambient illumination (controlled by user sunlight/torch slider or click toggle)
      const ambient = (ldr.state.ambientLux !== undefined) ? ldr.state.ambientLux : (ldr.state.manualLux !== undefined ? ldr.state.manualLux : 0);
      const totalLux = ambient + opticalLux;

      ldr.state.lux = Math.round(totalLux * 10) / 10;
      ldr.state.opticalLux = Math.round(opticalLux * 10) / 10;
      ldr.state.ambientLux = ambient;
      ldr.state.nearestLight = nearestName;
      ldr.state.nearestDist = nearestDist < 9999 ? nearestDist : null;

      const isNegative = (ldr.state.coefficient !== 'positive'); // Default: Negative Coefficient (NTC)
      if (isNegative) {
        // Real-world CdS photoresistor (GL5528) response curve:
        // Darkness (0 Lux): 100,000 Ω (100 kΩ)
        // Twilight (5 Lux): ~8,000 Ω
        // Room light (25 Lux): ~1,150 Ω
        // Direct sunlight / torch (100 Lux): ~200 Ω
        ldr.state.resistance = Math.round(Math.max(100, 100000 / (1 + 10 * Math.pow(Math.max(0, totalLux) / 4.5, 1.25))));
      } else {
        // Positive coefficient (PTC):
        ldr.state.resistance = Math.round(Math.min(100000, 150 + 18 * Math.pow(Math.max(0, totalLux) / 10, 0.85) * 50));
      }
    }
  }

  solve() {
    this.status = {
      isComplete: false,
      isShortCircuit: false,
      circuitFailed: false,
      activeComponents: new Set(),
      failedComponents: [],
      shortCircuitWires: new Set(),
      shortCircuitBatteries: new Set(),
      failureReason: '',
      warnings: [],
      totalVoltage: 0,
      wireCurrents: new Map()
    };
    this.allValidBranches = [];

    // Reset components transient electrical state (preserve burnt state!)
    for (const comp of this.components) {
      if (comp.type === 'inductor') {
        comp.state.previousCurrent = comp.state.current || 0;
        comp.state.previouslyPowered = comp.state.powered || false;
      }
      comp.state.powered = false;
      comp.state.chargingFromSupply = false;
      comp.state.voltageDrop = 0;
      comp.state.current = 0;
      comp.state.power = 0;
      comp.state.reversed = false;
      comp.state.blocked = false;
      comp.state.rectification = 'dc';
      comp.state.halfWavePhase = 0;
      comp.state.filteredByCapacitor = false;
      comp.state.peakVoltage = 0;
      comp.state.vPeak = 0;
      comp.state.vdcAvg = 0;
      comp.state.vrmsEff = 0;
      comp.state.heatPower = 0;

      if (comp.type === 'buzzer') {
        comp.state.sounding = false;
      }
      if (comp.type === 'relay') {
        comp.state.coilVoltage = 0;
        comp.state.coilCurrent = 0;
        comp.state.energized = false;
      }
      if (comp.type === 'motor') {
        comp.state.rpm = 0;
      }
      if (comp.type === 'bulb' || comp.type === 'led') {
        comp.state.brightness = 0;
      }
      if (comp.type === 'potentiometer') {
        comp.state.wiperVoltage = 0;
      }
      if (comp.type === 'voltmeter') {
        comp.state.measuredVoltage = 0;
      }
      if (comp.type && comp.type.startsWith('gate_')) {
        comp.state.inputA = 0;
        comp.state.inputB = 0;
        comp.state.outputLevel = 0;
        comp.state.outputVoltage = 0.0;
        comp.state.current = 0;
      }
      if (comp.type && comp.type.startsWith('ic_')) {
        comp.state.powered = false;
        comp.state.current = 0;
        comp.state.power = 0;
        if (comp.state.gates) {
          for (const g of comp.state.gates) {
            g.inA = 0;
            if (g.inB !== undefined) g.inB = 0;
            g.out = 0;
            g.outV = 0.0;
            g.current = 0.0;
          }
        }
      }
      if (comp.type === 'npn' || comp.type === 'pnp' || comp.type === 'mosfet') {
        comp.state.conducting = false;
        comp.state.collectorCurrent = 0;
        comp.state.baseCurrent = 0;
        comp.state.emitterCurrent = 0;
        comp.state.drainCurrent = 0;
        comp.state.operatingRegime = 'cutoff';
        comp.state.vce = 0;
        comp.state.vbe = 0;
        comp.state.vec = 0;
        comp.state.veb = 0;
        comp.state.vgs = 0;
        comp.state.vds = 0;
      }
      if (comp.type === 'transformer') {
        comp.state.primaryCurrent = 0;
        comp.state.primaryWatts = 0;
        comp.state.secondaryCurrent = 0;
        comp.state.secondaryPower = 0;
      }
      if (comp.type === 'function_generator' || comp.type === 'power_supply') {
        comp.state.actualCurrent = 0;
      }
      if (comp.type === 'battery' || comp.type === 'cell' || comp.type === 'cell3v') {
        comp.state.internalPowerDissipation = 0;
      }
      if (comp.type === 'fuse' && comp.state.blown) {
        comp.state.burnt = true;
      }
      if (comp.type === 'ammeter') {
        if (comp.state.fuseBlown) {
          comp.state.burnt = true;
          comp.state.reading = 'FUSE BLOWN';
          comp.state.measuredCurrent = 0;
        } else {
          comp.state.mode = comp.state.mode || 'dc';
          comp.state.shuntResistance = comp.state.shuntResistance || 0.01;
          comp.state.fuseRating = comp.state.fuseRating || 10.0;
          comp.state.measuredCurrent = 0;
          comp.state.reading = comp.state.mode === 'ac' ? '~ 0.000 A' : '0.000 A';
          comp.state.reversed = false;
          comp.state.isAcInput = false;
          comp.state.modeWarning = '';
        }
      }
      if (!comp.state.burning) {
        comp.state.crying = false;
      }
    }

    // Initialize baseline ambient LDR resistances before branch solving
    this.updateLDRSensors();

    const batteries = this.components.filter(c =>
      c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'ac_source' || c.type === 'power_supply' || c.type === 'function_generator'
    );
    for (const bat of batteries) {
      bat.state.powered = false;
      if (bat.type === 'ac_source') {
        bat.state.voltageDrop = bat.state.voltage || 230.0;
      } else if (bat.type === 'function_generator') {
        const vppSet = bat.state.amplitudeVpp !== undefined ? bat.state.amplitudeVpp : 10.0;
        const offsetSet = bat.state.dcOffset !== undefined ? bat.state.dcOffset : (bat.state.offsetVoltage || 0);
        bat.state.dcOffset = offsetSet;
        bat.state.offsetVoltage = offsetSet;
        const is50 = (bat.state.outputImpedance !== 'highz' && bat.state.outputImpedance !== 'high_z');
        const vpp = is50 ? (2 * vppSet) : vppSet;
        const offset = is50 ? (2 * offsetSet) : offsetSet;
        const wave = bat.state.waveform || 'sine';
        const duty = bat.state.dutyCycle !== undefined ? bat.state.dutyCycle : 50;
        let vrms = 3.54;
        if (wave === 'dc') {
          vrms = Math.abs(offset);
        } else if (wave === 'sine') {
          vrms = Math.sqrt(Math.pow(vpp / (2 * Math.SQRT2), 2) + Math.pow(offset, 2));
        } else if (wave === 'square' || wave === 'pulse') {
          const d = Math.max(0.01, Math.min(0.99, duty / 100));
          const vH = offset + vpp / 2;
          const vL = offset - vpp / 2;
          vrms = Math.sqrt(d * vH * vH + (1 - d) * vL * vL);
        } else if (wave === 'triangle' || wave === 'ramp' || wave === 'sawtooth') {
          vrms = Math.sqrt(Math.pow(vpp / (2 * Math.sqrt(3)), 2) + Math.pow(offset, 2));
        } else if (wave === 'noise') {
          vrms = Math.sqrt(Math.pow(vpp / 6.0, 2) + Math.pow(offset, 2));
        } else if (wave === 'cardiac') {
          vrms = Math.sqrt(Math.pow(vpp * 0.22, 2) + Math.pow(offset, 2));
        } else {
          vrms = Math.sqrt(Math.pow(vpp / (2 * Math.sqrt(3)), 2) + Math.pow(offset, 2));
        }

        const mod = bat.state.modulation || 'none';
        if (mod === 'am') {
          const m = bat.state.amDepth !== undefined ? bat.state.amDepth : 0.5;
          vrms = vrms * Math.sqrt(1 + (m * m) / 2);
        } else if (mod === 'burst') {
          const bCycles = bat.state.burstCycles || 5;
          const repCycles = Math.max(bCycles + 1, 10);
          vrms = vrms * Math.sqrt(bCycles / repCycles);
        }
        bat.state.voltage = (bat.state.outputEnabled !== false) ? Math.max(0.01, vrms) : 0;
        bat.state.actualVoltage = bat.state.voltage;
        bat.state.voltageDrop = bat.state.voltage;
      } else if (bat.type === 'cell3v') {
        const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS.cell3v) || {};
        const ocv = bat.state.openCircuitVoltage || (def && def.openCircuitVoltage) || 3.20;
        bat.state.voltageDrop = ocv;
        bat.state.actualVoltage = ocv;
        bat.state.terminalVoltage = ocv;
        bat.state.voltageSag = 0;
        bat.state.drainRegime = 'standby';
        bat.state.drainRegimeText = 'STANDBY (Open Circuit, 0 mA)';
        bat.state.runtimeEstimate = '8–10 Years (Shelf Life, <2%/yr self-discharge)';
        bat.state.overheated = false;
      } else if (bat.type === 'cell') {
        bat.state.voltageDrop = 1.5;
      } else if (bat.type === 'power_supply') {
        const outOn = bat.state.outputEnabled !== false;
        bat.state.voltageDrop = outOn ? (bat.state.voltage !== undefined ? bat.state.voltage : 12.0) : 0;
        if (!outOn) {
          bat.state.actualVoltage = 0.0;
          bat.state.actualCurrent = 0.0;
          bat.state.power = 0.0;
          bat.state.mode = 'cv';
          bat.state.powered = false;
        } else {
          bat.state.actualVoltage = (bat.state.voltage !== undefined ? bat.state.voltage : 12.0);
          bat.state.actualCurrent = 0.0;
          bat.state.power = 0.0;
          bat.state.mode = 'cv';
          bat.state.powered = true;
        }
      } else {
        const bDef = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[bat.type]) || {};
        bat.state.voltageDrop = (bat.state && bat.state.voltage !== undefined) ? bat.state.voltage : (bat.voltage || bDef.voltage || 9.0);
      }
      bat.state.current = 0;
      bat.state.power = 0;
    }

    const capacitors = this.components.filter(c => c.type === 'capacitor' || c.type === 'ceramic_capacitor');
    for (const cap of capacitors) {
      cap.state.powered = false;
      cap.state.voltageDrop = 0;
      cap.state.current = 0;
      cap.state.power = 0;
      cap.state.reversed = false;
    }

    // Check if there are active batteries OR charged capacitors with stored energy to discharge
    const hasChargedCapacitors = capacitors.some(c => !c.state.burnt && (c.state.storedVoltage || 0) > 0.1);
    const hasInstruments = this.components.some(c => c.type === 'oscilloscope' || c.type === 'multimeter' || c.type === 'voltmeter');
    const hasLogicGates = this.components.some(c => c.type && (c.type.startsWith('gate_') || c.type.startsWith('ic_')) && !c.state.burnt);
    if (batteries.length === 0 && !hasChargedCapacitors && !hasInstruments) {
      const { find } = this.buildNets();
      if (hasLogicGates) {
        this.evaluateLogicGates(find, new Set(), new Set(), 5.0);
        this.calculateWireCurrents([], find);
        this.updateLDRSensors();
        return this.status;
      }
      this.evaluateCapacitorRoles([], find);
      this.evaluateInductorRoles([], find);
      this.evaluateInductorTransients([], find);
      this.updateLDRSensors();
      return this.status;
    }

    // Two-pass net builder to check Transistor Base bias
    let { find } = this.buildNets();
    let transistorFlipped = false;

    // Collect all positive and negative roots across all batteries
    const allPosRoots = new Set();
    const allNegRoots = new Set();
    const updateRoots = () => {
      allPosRoots.clear();
      allNegRoots.clear();
      for (const bat of batteries) {
        const posPin = (bat.type === 'ac_source') ? 'l' : (bat.type === 'function_generator' ? 'out' : 'pos');
        const negPin = (bat.type === 'ac_source') ? 'n' : (bat.type === 'function_generator' ? 'gnd' : 'neg');
        allPosRoots.add(find(`${bat.id}:${posPin}`));
        allNegRoots.add(find(`${bat.id}:${negPin}`));
        if (bat.type === 'function_generator') {
          allPosRoots.add(find(`${bat.id}:sync`));
        }
      }
    };
    updateRoots();

    const sysVolt = batteries.reduce((sum, b) => sum + (b.state.voltage || b.voltage || 9.0), 0) || 9.0;

    let tPass = 0;
    while (tPass < 4) {
      tPass++;
      const tf = this.evaluateTransistorBias(find, allPosRoots, allNegRoots, sysVolt);
      if (!tf) break;
      find = this.buildNets().find;
      updateRoots();
    }

    // Check for short circuit on any source
    for (const bat of batteries) {
      const posPin = (bat.type === 'ac_source') ? 'l' : (bat.type === 'function_generator' ? 'out' : 'pos');
      const negPin = (bat.type === 'ac_source') ? 'n' : (bat.type === 'function_generator' ? 'gnd' : 'neg');
      const posRoot = find(`${bat.id}:${posPin}`);
      const negRoot = find(`${bat.id}:${negPin}`);

      if (posRoot === negRoot) {
        if (bat.type === 'power_supply') {
          bat.state.mode = 'cc';
          bat.state.actualVoltage = 0.0;
          const iLim = (bat.state.currentLimit !== undefined ? bat.state.currentLimit : 2.50);
          bat.state.actualCurrent = (bat.state.outputEnabled !== false) ? iLim : 0;
          bat.state.current = bat.state.actualCurrent;
          bat.state.voltageDrop = 0.0;
          bat.state.power = 0;
          bat.state.powered = bat.state.outputEnabled !== false;
          continue;
        }
        if (bat.type === 'function_generator') {
          bat.state.actualVoltage = 0.0;
          bat.state.actualCurrent = (bat.state.outputEnabled !== false) ? 0.20 : 0;
          bat.state.power = 0;
          bat.state.powered = bat.state.outputEnabled !== false;
          continue;
        }
        this.status.isShortCircuit = true;
        this.status.circuitFailed = true;
        this.status.shortCircuitBatteries.add(bat.id);
        const isAC = (bat.type === 'ac_source');
        this.status.failureReason = isAC
          ? 'Short Circuit! Direct zero-impedance connection between Line (L) and Neutral (N). Extreme hazard: AC generator / breaker overload!'
          : 'Short Circuit! Direct zero-resistance connection between (+) and (-). Extreme hazard: wires and power source are overheating!';
        bat.state.overheated = true;

        if (bat.type === 'cell3v') {
          const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS.cell3v) || {};
          const ocv = bat.state.openCircuitVoltage || def.openCircuitVoltage || 3.20;
          const esr = bat.internalR !== undefined ? bat.internalR : (def.internalR || 18.0);
          const iShort = ocv / esr; // ~0.178 A (178 mA) limited by 18Ω ESR
          bat.state.current = iShort;
          bat.state.currentMa = iShort * 1000;
          bat.state.actualVoltage = 0.0;
          bat.state.terminalVoltage = 0.0;
          bat.state.voltageSag = ocv;
          bat.state.drainRegime = 'overload';
          bat.state.drainRegimeText = `⚠️ SEVERE OVERLOAD (${(iShort * 1000).toFixed(0)} mA > 50 mA pulse limit!)`;
          bat.state.runtimeEstimate = 'Depleted in minutes / thermal risk';
          bat.state.internalPowerDissipation = iShort * iShort * esr;
          bat.state.power = 0;
        }

        this.status.faultDiagnostic = {
          faultType: 'SHORT_CIRCUIT',
          title: isAC ? '⚠️ AC Dead Short Circuit (Zero-Impedance L-to-N Fault)' : '⚠️ DC Dead Short Circuit (Zero-Resistance Direct Fault)',
          culprit: isAC ? 'AC Generator / Direct Line-to-Neutral Wire' : `${bat.type === 'battery9v' ? '9V Battery' : 'Power Source'} & Shorted Wire`,
          whyHappened: isAC
            ? 'A conductive path directly bridges AC Line (L) and Neutral (N) with zero load impedance (Z ≈ 0 Ω). Without load impedance to restrict flow, an explosive current surge heats wires to red-hot temperatures, tripping circuit breakers and risking electrical fires!'
            : "A conductive wire directly connected the positive (+) and negative (-) terminals of the power source with zero load resistance (R ≈ 0 Ω). According to Ohm's Law (I = V / R), as resistance approaches zero, current surges towards infinity (I → ∞)! Massive uncontrolled electron flow releases tremendous Joule heating (P = I²R) inside the battery and wires, risking battery swelling, chemical rupture, and melted wire insulation!",
          remedy: 'Remove the direct shorting wire connecting (+) to (-). Always wire an electrical load (such as a Resistor, Bulb, or Motor) in series between the positive and negative terminals to provide resistance and limit current to safe levels.',
          electricalPrinciple: "Ohm's Law (I = V / R) & Joule's Heating Law (P = I²R)",
          equation: "I = V_source / R_wire ➔ (9.0V / 0.05Ω ≈ 180 Amperes! Overload!)"
        };

        // Collect all wires on this shorted net
        for (const wire of this.wires) {
          const p1 = (wire.fromComp && typeof wire.fromComp === 'string' && wire.fromComp.startsWith('wire:')) ? wire.fromComp : `${wire.fromComp}:${wire.fromPin}`;
          const fromRoot = find(p1);
          if (fromRoot === posRoot) {
            this.status.shortCircuitWires.add(wire.id);
          }
        }
        this.updateLDRSensors();
        return this.status;
      }
      bat.state.overheated = false;
    }

    // Partition batteries into independent chains/sources (supporting multiple concurrent circuits!)
    const batteryChains = this.findAllBatteryChains(batteries, find);

    // Evaluate DC charging or reverse-polarity breakdown for capacitors connected to battery chains
    for (const chain of batteryChains) {
      if (chain.primaryPosRoot && chain.primaryNegRoot) {
        for (const cap of capacitors) {
          if (cap.state.burnt) continue;
          const isCeramic = (cap.type === 'ceramic_capacitor');
          const p1Net = isCeramic ? find(`${cap.id}:t1`) : find(`${cap.id}:anode`);
          const p2Net = isCeramic ? find(`${cap.id}:t2`) : find(`${cap.id}:cathode`);

          // Direct terminal short check (instant discharge)
          if (p1Net === p2Net && (cap.state.storedVoltage || 0) > 0.05) {
            cap.state.storedVoltage = 0;
            cap.state.chargePercent = 0;
            continue;
          }

          const p1Pos = (p1Net === chain.primaryPosRoot) || this.isNetConnectedToPositive(p1Net, new Set([chain.primaryPosRoot]), find);
          const p2Neg = (p2Net === chain.primaryNegRoot) || this.isNetConnectedToNegative(p2Net, new Set([chain.primaryNegRoot]), find);
          const p1Neg = (p1Net === chain.primaryNegRoot) || this.isNetConnectedToNegative(p1Net, new Set([chain.primaryNegRoot]), find);
          const p2Pos = (p2Net === chain.primaryPosRoot) || this.isNetConnectedToPositive(p2Net, new Set([chain.primaryPosRoot]), find);

          const maxV = cap.state.ratedVoltage || cap.state.maxVoltage || (isCeramic ? 50.0 : 16.0);

          // Calculate node-to-node voltage difference applied across capacitor terminals
          const v1 = this.getNetTheveninVoltage(p1Net, new Set([chain.primaryPosRoot]), new Set([chain.primaryNegRoot]), chain.totalVoltage, find);
          const v2 = this.getNetTheveninVoltage(p2Net, new Set([chain.primaryPosRoot]), new Set([chain.primaryNegRoot]), chain.totalVoltage, find);
          const appliedV = (v1 - v2);
          const absV = Math.abs(appliedV) > 0.02 ? Math.abs(appliedV) : chain.totalVoltage;

          if (isCeramic) {
            // Ceramic is completely NON-POLARIZED! Charges in either orientation without reverse polarity damage
            if (((p1Pos && p2Neg) || (p1Neg && p2Pos)) && p1Net !== p2Net) {
              cap.state.chargePolarity = (appliedV < -0.05 || (p1Neg && p2Pos)) ? 't2_pos' : 't1_pos';
              cap.state.powered = true;
              cap.state.chargingFromSupply = true;
              cap.state.voltageDrop = absV;
              cap.state.storedVoltage = Math.min(maxV, absV);
              cap.state.chargePercent = Math.min(100, Math.round((cap.state.storedVoltage / maxV) * 100));
              this.status.activeComponents.add(cap.id);

              const def = window.COMPONENT_DEFINITIONS['ceramic_capacitor'] || {};
              this.evaluateComponentSafety(cap, def, absV, 0.1, 10, chain.totalVoltage, chain.batteries);
            }
          } else {
            // Electrolytic is POLARIZED!
            if (p1Pos && p2Neg && p1Net !== p2Net) {
              // Charging correctly from power source! Anode (+) to positive, Cathode (−) to ground
              cap.state.powered = true;
              cap.state.chargingFromSupply = true;
              cap.state.voltageDrop = absV;
              cap.state.storedVoltage = Math.min(maxV, absV);
              cap.state.chargePercent = Math.min(100, Math.round((cap.state.storedVoltage / maxV) * 100));
              this.status.activeComponents.add(cap.id);

              const def = window.COMPONENT_DEFINITIONS['capacitor'] || {};
              this.evaluateComponentSafety(cap, def, absV, 0.5, 10, chain.totalVoltage, chain.batteries);
            } else if (p1Neg && p2Pos && p1Net !== p2Net) {
              // Reverse polarity breakdown! Destroys aluminum oxide dielectric & produces hydrogen gas
              cap.state.powered = true;
              cap.state.chargingFromSupply = true;
              cap.state.reversed = true;
              cap.state.voltageDrop = absV;
              const def = window.COMPONENT_DEFINITIONS['capacitor'] || {};
              this.evaluateComponentSafety(cap, def, absV, 1.0, 10, chain.totalVoltage, chain.batteries);
            }
          }
        }
      }
    }

    // Charged capacitors NOT currently connected to active batteries act as temporary DC power sources!
    const dischargingCapacitors = capacitors.filter(c =>
      !c.state.burnt && !c.state.powered && (c.state.storedVoltage || 0) > 0.05
    );
    const capChains = this.findAllBatteryChains(dischargingCapacitors, find);
    let chains = [...batteryChains, ...capChains];

    this.status.totalVoltage = chains.reduce((sum, ch) => sum + ch.totalVoltage, 0);

    if (chains.length === 0 && !hasInstruments) {
      if (hasLogicGates) {
        this.evaluateLogicGates(find, allPosRoots, allNegRoots, 5.0);
        this.calculateWireCurrents([], find);
        this.updateLDRSensors();
        return this.status;
      }
      this.evaluateCapacitorRoles([], find);
      this.evaluateInductorRoles([], find);
      this.evaluateInductorTransients([], find);
      this.updateLDRSensors();
      return this.status;
    }

    // Pass 1: Trace and solve circuit paths for ALL independent battery chains on the canvas
    for (const chain of chains) {
      if (chain.primaryPosRoot && chain.primaryNegRoot && chain.primaryPosRoot !== chain.primaryNegRoot && (chain.totalVoltage > 0 || (chain.batteries && chain.batteries.some(b => b.type === 'power_supply')))) {
        this.analyzeCircuitBranches(chain.primaryPosRoot, chain.primaryNegRoot, chain.totalVoltage, find, chain.batteries);
      }
    }

    // Convergence for Electromechanical Relays (Coil excitation flips COM-NO / COM-NC contacts)
    const hasRelays = this.components.some(c => c.type === 'relay' && !c.state.burnt);
    if (hasRelays) {
      let relayPasses = 0;
      while (relayPasses < 4) {
        let relayChanged = false;
        for (const r of this.components) {
          if (r.type === 'relay' && !r.state.burnt) {
            const isEnergized = ((r.state.coilVoltage || 0) >= 3.50 && (r.state.coilCurrent || 0) >= 0.025);
            const expectedPin = isEnergized ? 'no' : 'nc';
            const comNet = find(`${r.id}:com`);
            const targetNet = find(`${r.id}:${expectedPin}`);
            if (!!r.state.energized !== isEnergized || comNet !== targetNet) {
              r.state.energized = isEnergized;
              relayChanged = true;
            }
          }
        }
        if (!relayChanged) break;
        relayPasses++;
        const newNetBuild = this.buildNets();
        find = newNetBuild.find;
        updateRoots();
        this.evaluateTransistorBias(find, allPosRoots, allNegRoots, sysVolt);
        const newBatChains = this.findAllBatteryChains(batteries, find);
        const newCapChains = this.findAllBatteryChains(dischargingCapacitors, find);
        chains = [...newBatChains, ...newCapChains];
        this.allValidBranches = [];
        this.status.activeComponents = new Set();

        // Reset non-battery load states so disconnected contacts do NOT retain stale power!
        for (const comp of this.components) {
          if (comp.state.burnt) continue;
          const isBatterySource = (comp.type === 'battery' || comp.type === 'cell' || comp.type === 'cell3v' || comp.type === 'ac_source' || comp.type === 'power_supply' || comp.type === 'function_generator');
          if (!isBatterySource) {
            comp.state.powered = false;
            comp.state.voltageDrop = 0;
            comp.state.current = 0;
            comp.state.power = 0;
            comp.state.reversed = false;
            comp.state.blocked = false;
            comp.state.peakVoltage = 0;
            comp.state.vPeak = 0;
            comp.state.vdcAvg = 0;
            comp.state.vrmsEff = 0;
            comp.state.heatPower = 0;
            if (comp.type === 'buzzer') comp.state.sounding = false;
            if (comp.type === 'motor') comp.state.rpm = 0;
            if (comp.type === 'bulb' || comp.type === 'led') comp.state.brightness = 0;
            if (comp.type === 'potentiometer') comp.state.wiperVoltage = 0;
            if (comp.type === 'voltmeter') comp.state.measuredVoltage = 0;
            if (comp.type === 'relay') {
              comp.state.coilVoltage = 0;
              comp.state.coilCurrent = 0;
            }
          }
        }

        for (const chain of chains) {
          if (chain.primaryPosRoot && chain.primaryNegRoot && chain.primaryPosRoot !== chain.primaryNegRoot && (chain.totalVoltage > 0 || (chain.batteries && chain.batteries.some(b => b.type === 'power_supply')))) {
            this.analyzeCircuitBranches(chain.primaryPosRoot, chain.primaryNegRoot, chain.totalVoltage, find, chain.batteries);
          }
        }
      }
    }

    // Step-Down Transformer: Check if Primary is connected across an AC power source chain
    const transformers = this.components.filter(c => c.type === 'transformer' && !c.state.burnt);
    for (const trans of transformers) {
      trans.state.primaryV = trans.state.primaryV || 230.0;
      trans.state.secondaryV = trans.state.secondaryV || 12.0;
      trans.state.voltageDrop = trans.state.secondaryV;
      trans.state.primaryCurrent = 0;
      trans.state.primaryWatts = 0;
      trans.state.secondaryCurrent = 0;
      trans.state.secondaryPower = 0;
      trans.state.current = 0;
      trans.state.power = 0;

      const pri1Net = find(`${trans.id}:pri1`);
      const pri2Net = find(`${trans.id}:pri2`);
      const poweringChain = chains.find(ch =>
        (pri1Net === ch.primaryPosRoot && pri2Net === ch.primaryNegRoot) ||
        (pri1Net === ch.primaryNegRoot && pri2Net === ch.primaryPosRoot)
      );
      if (poweringChain) {
        const isACPower = poweringChain.batteries && poweringChain.batteries.some(b => b.type === 'ac_source');
        if (!isACPower) {
          // Transformers work exclusively on AC: DC yields zero changing magnetic flux (dΦ/dt = 0)
          trans.state.powered = false;
          trans.state.burnReason = 'DC applied to Transformer! Transformers require Alternating Current (AC). Direct Current produces zero rate of magnetic flux change (dΦ/dt = 0), yielding 0V secondary output!';
          continue;
        }

        trans.state.powered = true;
        trans.state.primaryV = poweringChain.totalVoltage;
        const secV = trans.state.secondaryV || 12.0;
        this.status.activeComponents.add(trans.id);

        const sec1Net = find(`${trans.id}:sec1`);
        const sec2Net = find(`${trans.id}:sec2`);
        if (sec1Net && sec2Net && sec1Net !== sec2Net) {
          this.analyzeCircuitBranches(sec1Net, sec2Net, secV, find, [trans]);
        }

        // Real-Time Transformer Telemetry
        trans.state.secondaryVoltage = secV;
        trans.state.secondaryCurrent = trans.state.current || 0;
        trans.state.secondaryPower = secV * trans.state.secondaryCurrent;
        trans.state.power = trans.state.secondaryPower;
        trans.state.voltageDrop = secV;

        // Conservation of energy: Primary power reflects secondary power
        trans.state.primaryWatts = trans.state.secondaryPower;
        trans.state.primaryCurrent = (trans.state.primaryV > 0) ? (trans.state.primaryWatts / trans.state.primaryV) : 0;

        // Feed back primary load into the AC power supply
        if (poweringChain.batteries) {
          for (const bat of poweringChain.batteries) {
            bat.state.powered = true;
            bat.state.voltageDrop = poweringChain.totalVoltage;
            bat.state.current = (bat.state.current || 0) + trans.state.primaryCurrent;
            bat.state.power = bat.state.voltageDrop * bat.state.current;
          }
        }
      } else {
        trans.state.powered = false;
      }
    }

    // Step-Down Transformer Secondaries & Rectifiers act as active power sources for wire current propagation
    for (const trans of transformers) {
      if (trans.state.powered) {
        const sec1Net = find(`${trans.id}:sec1`);
        const sec2Net = find(`${trans.id}:sec2`);
        if (sec1Net && sec2Net && sec1Net !== sec2Net) {
          chains.push({
            primaryPosRoot: sec1Net,
            primaryNegRoot: sec2Net,
            totalVoltage: trans.state.secondaryV || 12.0,
            batteries: [trans]
          });
        }
      }
    }
    const activeRectifiers = this.components.filter(c => c.type === 'rectifier' && c.state.powered && !c.state.burnt);
    for (const rect of activeRectifiers) {
      const pNet = find(`${rect.id}:dc_pos`);
      const nNet = find(`${rect.id}:dc_neg`);
      if (pNet && nNet && pNet !== nNet) {
        chains.push({
          primaryPosRoot: pNet,
          primaryNegRoot: nNet,
          totalVoltage: rect.state.voltageDrop || 10.6,
          batteries: [rect]
        });
      }
    }

    // Pass 2: Two-pass convergence for Optical Coupling (e.g. Incandescent Bulb in Circuit 1 shining on LDR in Circuit 2)
    const hasLDR = this.components.some(c => c.type === 'ldr');
    if (hasLDR) {
      const prevResMap = new Map(this.components.filter(c => c.type === 'ldr').map(c => [c.id, c.state.resistance]));
      this.updateLDRSensors();
      const changed = this.components.some(c => c.type === 'ldr' && Math.abs((c.state.resistance !== undefined ? c.state.resistance : 0) - (prevResMap.get(c.id) || 0)) > 20);
      if (changed) {
        // Clear branches before re-running Pass 2 so branches are not duplicated!
        this.allValidBranches = [];
        this.status.activeComponents = new Set();
        // Re-evaluate transistor base bias with the new converged LDR resistance!
        updateRoots();
        const tf = this.evaluateTransistorBias(find, allPosRoots, allNegRoots, sysVolt);
        if (tf) {
          find = this.buildNets().find;
          updateRoots();
        }
        // Keep chains synchronized with current net topology
        const newBatChains = this.findAllBatteryChains(batteries, find);
        const newCapChains = this.findAllBatteryChains(dischargingCapacitors, find);
        chains = [...newBatChains, ...newCapChains];
        // Re-run branches for all chains once with the updated LDR resistances
        for (const chain of chains) {
          if (chain.primaryPosRoot && chain.primaryNegRoot && (chain.totalVoltage > 0 || (chain.batteries && chain.batteries.some(b => b.type === 'power_supply')))) {
            this.analyzeCircuitBranches(chain.primaryPosRoot, chain.primaryNegRoot, chain.totalVoltage, find, chain.batteries);
          }
        }
        // Final sync of LDR resistance based on the converged bulb brightness
        this.updateLDRSensors();
      }
    }

    // Helper to verify a component terminal is physically connected by at least one active wire
    const isPinWired = (compId, pinId) => {
      if (!this.wires) return false;
      return this.wires.some(w => !(w.state && w.state.burnt) && (
        (w.fromComp === compId && w.fromPin === pinId) ||
        (w.toComp === compId && w.toPin === pinId)
      ));
    };

    // Update all Voltmeters and Wattmeters across canvas based on node thevenin voltages
    updateRoots();
    for (const comp of this.components) {
      if (comp.state.burnt) continue;
      if (comp.type === 'voltmeter') {
        const hasWireP = isPinWired(comp.id, 'pin_pos');
        const hasWireN = isPinWired(comp.id, 'pin_neg');
        const netP = find(`${comp.id}:pin_pos`);
        const netN = find(`${comp.id}:pin_neg`);
        // Voltmeter strictly requires BOTH probe terminals (+ and -) to be physically wired to two distinct non-floating nodes
        if (hasWireP && hasWireN && netP && netN && netP !== netN) {
          const thP = this.getNetThevenin(netP, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          const thN = this.getNetThevenin(netN, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          // Both probe terminals must be connected to non-floating conductive nodes in an electrical circuit
          if (thP.rTh < 1e8 && thN.rTh < 1e8) {
            let diff = 0;
            const loadComp = this.components.find(c => {
              if (c.id === comp.id || c.state.burnt || !c.terminals || c.terminals.length < 2) return false;
              const t1 = find(`${c.id}:${c.terminals[0].id}`);
              const t2 = find(`${c.id}:${c.terminals[1].id}`);
              return (t1 === netP && t2 === netN) || (t1 === netN && t2 === netP);
            });
            if (loadComp && loadComp.state && (loadComp.state.voltageDrop !== undefined || loadComp.state.measuredVoltage !== undefined)) {
              diff = loadComp.state.voltageDrop || loadComp.state.measuredVoltage || 0;
            }
            if (diff <= 0.01) {
              diff = Math.abs(thP.vTh - thN.vTh);
            }
            comp.state.measuredVoltage = diff;
            comp.state.voltageDrop = diff;
            comp.state.powered = diff > 0.01;
            if (comp.state.powered) this.status.activeComponents.add(comp.id);
          } else {
            comp.state.measuredVoltage = 0;
            comp.state.voltageDrop = 0;
            comp.state.powered = false;
          }
        } else {
          comp.state.measuredVoltage = 0;
          comp.state.voltageDrop = 0;
          comp.state.powered = false;
        }
      } else if (comp.type === 'wattmeter') {
        const hasWireP = isPinWired(comp.id, 'in_pos');
        const hasWireN = isPinWired(comp.id, 'in_neg');
        const netInP = find(`${comp.id}:in_pos`);
        const netInN = find(`${comp.id}:in_neg`);
        if (hasWireP && hasWireN && netInP && netInN && netInP !== netInN) {
          const thP = this.getNetThevenin(netInP, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          const thN = this.getNetThevenin(netInN, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          if (thP.rTh < 1e8 && thN.rTh < 1e8) {
            const diff = Math.abs(thP.vTh - thN.vTh);
            comp.state.voltage = diff;
            comp.state.power = diff * (comp.state.current || 0);
            comp.state.powered = comp.state.power > 0 || diff > 0.01;
            if (comp.state.powered) this.status.activeComponents.add(comp.id);
          } else {
            comp.state.voltage = 0;
            comp.state.power = 0;
            comp.state.powered = false;
          }
        } else {
          comp.state.voltage = 0;
          comp.state.power = 0;
          comp.state.powered = false;
        }
      } else if (comp.type === 'multimeter') {
        const vinPin = comp.terminals && comp.terminals.some(t => t.id === 'v_ohm') ? 'v_ohm' : 'vin';
        const hasWireVin = isPinWired(comp.id, 'vin') || isPinWired(comp.id, 'v_ohm');
        const hasWireCom = isPinWired(comp.id, 'com');
        const netVin = find(`${comp.id}:${vinPin}`);
        const netCom = find(`${comp.id}:com`);
        if (hasWireVin && hasWireCom && netVin && netCom && netVin !== netCom) {
          const thP = this.getNetThevenin(netVin, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          const thN = this.getNetThevenin(netCom, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          if (thP.rTh < 1e8 && thN.rTh < 1e8) {
            const diff = Math.abs(thP.vTh - thN.vTh);
            comp.state.measuredVoltage = diff;
            comp.state.voltageDrop = diff;
            comp.state.powered = true;
            this.status.activeComponents.add(comp.id);
          } else {
            comp.state.measuredVoltage = 0;
            comp.state.voltageDrop = 0;
            comp.state.powered = false;
          }
        } else {
          comp.state.measuredVoltage = 0;
          comp.state.voltageDrop = 0;
          comp.state.powered = false;
        }
      } else if (comp.type === 'oscilloscope') {
        const netCH1 = find(`${comp.id}:ch1`);
        const netCH2 = find(`${comp.id}:ch2`);
        const netGND = find(`${comp.id}:gnd`);

        const probeChannel = (probeNet, gndNet) => {
          if (comp.state.calActive) {
            return {
              type: 'square',
              freq: 1000.0,
              vpp: 3.0,
              vrms: 2.1213,
              vavg: 1.5,
              duty: 50,
              riseTime: 1e-8,
              fallTime: 1e-8,
              overshoot: 0
            };
          }

          if (!probeNet || !gndNet || probeNet === gndNet) {
            return { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
          }

          // 1. Connection to a Function Generator (Direct or via circuit components: Resistor, Cap, Diode, Inductor)
          const findConnectedFG = (startNet, groundNet) => {
            const queue = [{
              net: startNet,
              rSeries: 0,
              hasCap: false,
              capF: 0,
              hasDiode: false,
              diodeForward: true,
              hasInductor: false,
              inductanceH: 0,
              depth: 0
            }];
            const visited = new Set([startNet]);

            while (queue.length > 0) {
              const curr = queue.shift();

              for (const fg of this.components) {
                if (fg.type !== 'function_generator' || fg.state.burnt) continue;
                const fgOut = find(`${fg.id}:out`);
                const fgSync = find(`${fg.id}:sync`);
                const fgGnd = find(`${fg.id}:gnd`);

                // Check if ground reference connects to FG GND
                const gndMatch = (fgGnd === groundNet) || this.isNetConnectedToNegative(fgGnd, new Set([groundNet]), find);
                if (gndMatch) {
                  if (curr.net === fgOut) {
                    return { fg, pin: 'out', state: curr };
                  }
                  if (curr.net === fgSync) {
                    return { fg, pin: 'sync', state: curr };
                  }
                }
              }

              if (curr.depth >= 6) continue;

              for (const c of this.components) {
                if (c.state.burnt || c.type === 'oscilloscope' || c.type === 'switch' || c.type === 'pushbutton') continue;
                if (!c.terminals || c.terminals.length < 2) continue;

                let pA = c.terminals[0].id;
                let pB = c.terminals[1].id;
                if (c.type === 'potentiometer') {
                  pA = 'wiper'; pB = 'pin1';
                }

                const netA = find(`${c.id}:${pA}`);
                const netB = find(`${c.id}:${pB}`);

                const tryStep = (fromNet, toNet, fromPin, toPin) => {
                  if (fromNet === curr.net && toNet !== curr.net && !visited.has(toNet) && toNet !== groundNet) {
                    visited.add(toNet);

                    let nextR = curr.rSeries;
                    let nextCap = curr.hasCap;
                    let nextCapF = curr.capF;
                    let nextDiode = curr.hasDiode;
                    let nextDiodeFwd = curr.diodeForward;
                    let nextInd = curr.hasInductor;
                    let nextIndH = curr.inductanceH;

                    if (c.type === 'resistor') {
                      nextR += (c.state.resistance !== undefined ? c.state.resistance : 1000);
                    } else if (c.type === 'potentiometer') {
                      nextR += (c.state.resistance !== undefined ? c.state.resistance : 500);
                    } else if (c.type === 'capacitor' || c.type === 'ceramic_capacitor') {
                      nextCap = true;
                      nextCapF = (c.state.capacitanceUf ? c.state.capacitanceUf * 1e-6 : (c.state.capacitanceNf ? c.state.capacitanceNf * 1e-9 : 0.1e-6));
                    } else if (c.type === 'diode' || c.type === 'led') {
                      nextDiode = true;
                      // Tracing backward from probe to source: if fromPin is cathode and toPin is anode, current flows anode -> cathode (forward!)
                      nextDiodeFwd = (fromPin === 'cathode' && toPin === 'anode');
                    } else if (c.type === 'inductor') {
                      nextInd = true;
                      nextIndH += (c.state.inductanceMh || 10) * 1e-3;
                      nextR += (c.state.dcr || 0.8);
                    }

                    queue.push({
                      net: toNet,
                      rSeries: nextR,
                      hasCap: nextCap,
                      capF: nextCapF,
                      hasDiode: nextDiode,
                      diodeForward: nextDiodeFwd,
                      hasInductor: nextInd,
                      inductanceH: nextIndH,
                      depth: curr.depth + 1
                    });
                  }
                };

                tryStep(netA, netB, pA, pB);
                tryStep(netB, netA, pB, pA);
                if (c.type === 'potentiometer') {
                  const net2 = find(`${c.id}:pin2`);
                  tryStep(netA, net2, 'wiper', 'pin2');
                  tryStep(net2, netA, 'pin2', 'wiper');
                }
              }
            }
            return null;
          };

          const fgConn = findConnectedFG(probeNet, gndNet);
          if (fgConn) {
            const { fg, pin, state: traceState } = fgConn;
            if (fg.state.outputEnabled === false) {
              return { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
            }

            const f = fg.state.frequency !== undefined ? fg.state.frequency : 1000.0;

            if (pin === 'sync') {
              if (traceState.hasDiode && !traceState.diodeForward) {
                return { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
              }
              return {
                type: 'square',
                freq: f,
                vpp: 5.0,
                vrms: 3.5355,
                vavg: 2.5,
                duty: 50,
                riseTime: 3.5e-9,
                fallTime: 3.5e-9,
                overshoot: 2.5
              };
            }

            // Pin is Main OUT
            let wave = fg.state.waveform || 'sine';
            let rawVpp = fg.state.amplitudeVpp !== undefined ? fg.state.amplitudeVpp : 10.0;
            let rawOffset = fg.state.dcOffset !== undefined ? fg.state.dcOffset : (fg.state.offsetVoltage || 0.0);
            let duty = fg.state.dutyCycle !== undefined ? fg.state.dutyCycle : 50;
            const modulation = fg.state.modulation || 'none';
            const amDepth = fg.state.amDepth !== undefined ? fg.state.amDepth : 0.5;
            const amFreq = fg.state.amFreq !== undefined ? fg.state.amFreq : 100;
            const fmDev = fg.state.fmDev !== undefined ? fg.state.fmDev : 500;
            const fmFreq = fg.state.fmFreq !== undefined ? fg.state.fmFreq : 50;
            const sweepStart = fg.state.sweepStart !== undefined ? fg.state.sweepStart : 100;
            const sweepStop = fg.state.sweepStop !== undefined ? fg.state.sweepStop : 10000;
            const sweepTime = fg.state.sweepTime !== undefined ? fg.state.sweepTime : 1.0;
            const burstCycles = fg.state.burstCycles !== undefined ? fg.state.burstCycles : 5;
            const invert = !!fg.state.invert;
            const phaseDeg = fg.state.phaseDeg || 0;

            // 1. Resistor voltage divider attenuation with 1 MΩ DSO probe input impedance
            const rIn = 1000000.0;
            const attenR = rIn / (rIn + traceState.rSeries);
            let vpp = rawVpp * attenR;
            let offset = rawOffset * attenR;

            // 2. Series capacitor: blocks DC offset, passes AC
            if (traceState.hasCap) {
              offset = 0.0;
              const capF = Math.max(1e-12, traceState.capF || 100e-9);
              const xc = 1.0 / (2 * Math.PI * Math.max(0.1, f) * capF);
              const attenC = rIn / Math.sqrt(rIn * rIn + xc * xc);
              vpp = vpp * attenC;
            }

            // 3. Series diode: half-wave rectification
            if (traceState.hasDiode) {
              if (!traceState.diodeForward) {
                return { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
              }
              const vPkIn = offset + (vpp / 2);
              const vPkOut = Math.max(0, vPkIn - 0.70);
              vpp = vPkOut;
              offset = vPkOut / Math.PI;
              wave = 'half_wave';
            }

            let vrms = 3.54;
            if (wave === 'square' || wave === 'pulse') {
              const d = Math.max(0.01, Math.min(0.99, duty / 100));
              const vH = offset + vpp / 2;
              const vL = offset - vpp / 2;
              vrms = Math.sqrt(d * vH * vH + (1 - d) * vL * vL);
            } else if (wave === 'triangle' || wave === 'ramp' || wave === 'sawtooth') {
              vrms = Math.sqrt(Math.pow(vpp / (2 * Math.sqrt(3)), 2) + Math.pow(offset, 2));
            } else if (wave === 'sine') {
              vrms = Math.sqrt(Math.pow(vpp / (2 * Math.SQRT2), 2) + Math.pow(offset, 2));
            } else if (wave === 'noise') {
              vrms = Math.sqrt(Math.pow(vpp / 6.0, 2) + Math.pow(offset, 2));
            } else if (wave === 'cardiac') {
              vrms = Math.sqrt(Math.pow(vpp * 0.22, 2) + Math.pow(offset, 2));
            } else if (wave === 'half_wave') {
              vrms = vpp / 2;
            } else if (wave === 'dc') {
              vrms = Math.abs(offset);
            }

            if (modulation === 'am') {
              vrms = vrms * Math.sqrt(1 + (amDepth * amDepth) / 2);
            } else if (modulation === 'burst') {
              const repCycles = Math.max(burstCycles + 1, 10);
              vrms = vrms * Math.sqrt(burstCycles / repCycles);
            }

            let tr = (wave === 'square' || wave === 'pulse') ? 3.5e-9 : (wave === 'sine' ? 0.35 / Math.max(1, f) : 0.5 / Math.max(1, f));
            let tf = tr;
            if (wave === 'ramp') {
              tr = 0.99 / Math.max(1, f);
              tf = 3.5e-9;
            } else if (wave === 'sawtooth') {
              tr = 3.5e-9;
              tf = 0.99 / Math.max(1, f);
            }

            const period = f > 0 ? (1 / f) : 0;
            const vmax = offset + vpp / 2;
            const vmin = offset - vpp / 2;
            const posWidth = period * (duty / 100);

            return {
              type: wave,
              freq: f,
              period,
              vpp: wave === 'dc' ? 0 : vpp,
              vmax,
              vmin,
              vamp: wave === 'dc' ? 0 : vpp,
              vrms,
              vavg: offset,
              duty,
              posWidth,
              riseTime: tr,
              fallTime: tf,
              overshoot: (wave === 'square' || wave === 'pulse') ? 3.0 : (wave === 'ramp' || wave === 'sawtooth' ? 0.5 : 0),
              modulation,
              amDepth,
              amFreq,
              fmDev,
              fmFreq,
              sweepStart,
              sweepStop,
              sweepTime,
              burstCycles,
              invert,
              phaseDeg
            };
          }

          // 2. Direct connection across an AC Voltage Source
          const ac = this.components.find(c => c.type === 'ac_source' && !c.state.burnt);
          if (ac) {
            const acL = find(`${ac.id}:l`);
            const acN = find(`${ac.id}:n`);
            if ((probeNet === acL && gndNet === acN) || (probeNet === acN && gndNet === acL)) {
              const vrms = ac.state.voltage || 230.0;
              const vpp = vrms * 2 * Math.SQRT2;
              return {
                type: 'sine',
                freq: 50.0,
                vpp,
                vrms,
                vavg: 0.0,
                duty: 50,
                riseTime: 0.35 / 50.0,
                fallTime: 0.35 / 50.0
              };
            }
          }

          // 3. Direct connection across Transformer Secondary
          const trans = this.components.find(c => c.type === 'transformer' && !c.state.burnt && c.state.powered);
          if (trans) {
            const sec1 = find(`${trans.id}:sec1`);
            const sec2 = find(`${trans.id}:sec2`);
            if ((probeNet === sec1 && gndNet === sec2) || (probeNet === sec2 && gndNet === sec1)) {
              const secV = trans.state.secondaryV || 12.0;
              return {
                type: 'sine',
                freq: 50.0,
                vpp: secV * 2 * Math.SQRT2,
                vrms: secV,
                vavg: 0.0,
                duty: 50,
                riseTime: 0.35 / 50.0,
                fallTime: 0.35 / 50.0
              };
            }
          }

          // 4. Direct connection across Full-Wave Bridge Rectifier Output
          const rect = this.components.find(c => c.type === 'rectifier' && !c.state.burnt && c.state.powered);
          if (rect) {
            const dcP = find(`${rect.id}:dc_pos`);
            const dcN = find(`${rect.id}:dc_neg`);
            if ((probeNet === dcP && gndNet === dcN) || (probeNet === dcN && gndNet === dcP)) {
              const vDrop = rect.state.voltageDrop || 12.0;
              // Check if a smoothing filter capacitor is in parallel
              const filterCap = this.components.find(c => {
                if (c.type !== 'capacitor' && c.type !== 'ceramic_capacitor') return false;
                const p1 = find(`${c.id}:${c.terminals[0].id}`);
                const p2 = find(`${c.id}:${c.terminals[1].id}`);
                return (p1 === dcP && p2 === dcN) || (p1 === dcN && p2 === dcP);
              });

              if (filterCap) {
                // Smoothed DC rail with ripple
                const cFarads = (filterCap.state.capacitanceUf || 1000) * 1e-6;
                const iLoad = rect.state.current || 0.1;
                const vRipple = Math.min(vDrop, Math.max(0.01, iLoad / (2 * 50 * cFarads)));
                const vPeak = vDrop * 1.414;
                const vDc = vPeak - vRipple / 2;
                return {
                  type: 'dc_ripple',
                  freq: 100.0,
                  vpp: vRipple,
                  vrms: Math.sqrt(vDc * vDc + (vRipple * vRipple) / 12),
                  vavg: vDc,
                  duty: 50,
                  rippleV: vRipple,
                  rippleFreq: 100.0,
                  riseTime: 0.002,
                  fallTime: 0.008
                };
              }

              return {
                type: 'full_wave',
                freq: 100.0,
                vpp: vDrop,
                vrms: vDrop / Math.SQRT2,
                vavg: (2 * vDrop) / Math.PI,
                duty: 50,
                riseTime: 0.0025,
                fallTime: 0.0025
              };
            }
          }

          // 5. Direct connection across Variable Power Supply (SMPS Rail Ripple)
          const ps = this.components.find(c => c.type === 'power_supply' && !c.state.burnt && c.state.powered);
          if (ps) {
            const psPos = find(`${ps.id}:pos`);
            const psNeg = find(`${ps.id}:neg`);
            if ((probeNet === psPos && gndNet === psNeg) || (probeNet === psNeg && gndNet === psPos)) {
              const vDc = ps.state.voltage !== undefined ? ps.state.voltage : (ps.state.actualVoltage || 12.0);
              // Switch-mode power supply 50kHz switching ripple (approx 24mVpp)
              const vRipple = 0.024;
              const fRipple = 50000;
              return {
                type: 'dc_ripple',
                freq: fRipple,
                vpp: vRipple,
                vrms: Math.sqrt(vDc * vDc + (vRipple * vRipple) / 12),
                vavg: vDc,
                duty: 50,
                rippleV: vRipple,
                rippleFreq: fRipple,
                riseTime: 2e-8,
                fallTime: 2e-8
              };
            }
          }

          // 6. Connection across any circuit branch component
          const targetComp = this.components.find(c => {
            if (c.id === comp.id || c.state.burnt || !c.terminals || c.terminals.length < 2) return false;
            const p1 = find(`${c.id}:${c.terminals[0].id}`);
            const p2 = find(`${c.id}:${c.terminals[1].id}`);
            return (p1 === probeNet && p2 === gndNet) || (p1 === gndNet && p2 === probeNet);
          });

          if (targetComp) {
            // Check for Inductive Kickback Transient Spike
            if (targetComp.type === 'inductor' && (targetComp.state.kickbackVoltage > 0 || targetComp.state.transientSpikeV > 0)) {
              const spikeV = targetComp.state.kickbackVoltage || targetComp.state.transientSpikeV || 65.0;
              return {
                type: 'spike',
                freq: 25000,
                vpp: spikeV,
                vrms: spikeV * 0.35,
                vavg: 0.0,
                duty: 50,
                riseTime: 2e-7,
                fallTime: 2e-5,
                overshoot: 40
              };
            }

            if (targetComp.state.voltageDrop > 0.01) {
              const vDrop = targetComp.state.voltageDrop;
              const rectState = targetComp.state.rectification;
              const isACBranch = rectState === 'ac' || (chains.length > 0 && chains.some(ch => ch.batteries && ch.batteries.some(b => b.type === 'ac_source' || b.type === 'function_generator')));

              if (rectState === 'full_wave') {
                return { type: 'full_wave', freq: 100.0, vpp: vDrop * 1.4, vrms: vDrop, vavg: vDrop * 0.9, duty: 50, riseTime: 0.0025, fallTime: 0.0025 };
              } else if (rectState === 'half_wave') {
                return { type: 'half_wave', freq: 50.0, vpp: vDrop * 2.8, vrms: vDrop, vavg: vDrop * 0.45, duty: 50, riseTime: 0.005, fallTime: 0.005 };
              } else if (isACBranch) {
                const activeSource = this.components.find(c => (c.type === 'function_generator' || c.type === 'ac_source') && !c.state.burnt);
                const f = activeSource ? (activeSource.state.frequency || 1000.0) : 50.0;
                const wave = activeSource && activeSource.type === 'function_generator' ? (activeSource.state.waveform || 'sine') : 'sine';
                const duty = activeSource && activeSource.type === 'function_generator' ? (activeSource.state.dutyCycle || 50) : 50;
                let vpp = targetComp.state.peakVoltage ? (targetComp.state.peakVoltage * 2) : 0;
                if (!vpp) {
                  if (wave === 'sine') vpp = vDrop * 2 * Math.SQRT2;
                  else if (wave === 'square') vpp = vDrop * 2;
                  else if (wave === 'triangle' || wave === 'ramp') vpp = vDrop * 2 * Math.sqrt(3);
                  else vpp = vDrop;
                }

                // Calculate branch phase shift & rise time
                let phaseDeg = 0;
                let tr = wave === 'square' ? 3.5e-9 : 0.35 / Math.max(1, f);
                let tf = tr;

                if (targetComp.type === 'capacitor' || targetComp.type === 'ceramic_capacitor') {
                  const capVal = targetComp.state.capacitanceUf ? (targetComp.state.capacitanceUf * 1e-6) : (targetComp.state.capacitanceNf ? targetComp.state.capacitanceNf * 1e-9 : (targetComp.state.capacitancePf ? targetComp.state.capacitancePf * 1e-12 : 100e-6));
                  const rSeries = 1000.0; // Typical branch resistance
                  const fc = 1.0 / (2 * Math.PI * rSeries * Math.max(1e-12, capVal));
                  phaseDeg = -Math.atan(Math.max(1, f) / Math.max(1, fc)) * (180 / Math.PI);
                  tr = 2.197 * rSeries * capVal;
                  tf = tr;
                } else if (targetComp.type === 'inductor') {
                  const lVal = (targetComp.state.inductanceMh || 10) * 1e-3;
                  const rSeries = 100.0;
                  phaseDeg = 90 - Math.atan((2 * Math.PI * f * lVal) / rSeries) * (180 / Math.PI);
                }

                return {
                  type: wave,
                  freq: f,
                  vpp,
                  vrms: vDrop,
                  vavg: targetComp.state.dcOffset || 0.0,
                  duty,
                  phaseDeg,
                  riseTime: tr,
                  fallTime: tf,
                  overshoot: 0
                };
              } else {
                return { type: 'dc', freq: 0, vpp: 0, vrms: vDrop, vavg: vDrop, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0 };
              }
            }
          }

          // 7. Generic node-to-node Thevenin DC voltage measurement
          const vP = this.getNetTheveninVoltage(probeNet, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          const vN = this.getNetTheveninVoltage(gndNet, allPosRoots, allNegRoots, this.status.totalVoltage || 9.0, find);
          const diff = Math.abs(vP - vN);
          if (diff > 0.05) {
            return { type: 'dc', freq: 0, vpp: 0, vrms: diff, vavg: diff, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0 };
          }

          return { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
        };

        const normalizeSignal = (s) => {
          if (!s || s.type === 'none') {
            return {
              type: 'none', freq: 0, period: 0, vpp: 0, vmax: 0, vmin: 0, vamp: 0,
              vrms: 0, vavg: 0, duty: 50, posWidth: 0, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0
            };
          }
          const f = s.freq || 0;
          const period = f > 0 ? (1 / f) : 0;
          const duty = s.duty !== undefined ? s.duty : 50;
          const vpp = s.vpp !== undefined ? s.vpp : 0;
          const vavg = s.vavg !== undefined ? s.vavg : 0;
          const vmax = s.vmax !== undefined ? s.vmax : (vavg + vpp / 2);
          const vmin = s.vmin !== undefined ? s.vmin : (vavg - vpp / 2);
          const vamp = s.vamp !== undefined ? s.vamp : vpp;
          const posWidth = s.posWidth !== undefined ? s.posWidth : (period * (duty / 100));
          const tr = s.riseTime !== undefined ? s.riseTime : (f > 0 ? 0.35 / f : 0);
          const tf = s.fallTime !== undefined ? s.fallTime : tr;
          const ov = s.overshoot !== undefined ? s.overshoot : 0;
          return {
            ...s,
            freq: f,
            period,
            duty,
            vpp,
            vavg,
            vmax,
            vmin,
            vamp,
            posWidth,
            riseTime: tr,
            fallTime: tf,
            overshoot: ov
          };
        };

        let s1 = normalizeSignal(probeChannel(netCH1, netGND));
        let s2 = normalizeSignal(probeChannel(netCH2, netGND));

        // Apply CH1 coupling
        const cpl1 = (comp.state.ch1Coupling || 'dc').toLowerCase();
        if (cpl1 === 'gnd') {
          s1 = { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
        } else if (cpl1 === 'ac') {
          if (s1.type === 'dc_ripple') {
            s1 = { ...s1, type: 'sine', vavg: 0.0, vpp: s1.rippleV || 0.024, vrms: (s1.rippleV || 0.024) / (2 * Math.SQRT2) };
          } else if (s1.type === 'dc') {
            s1 = { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
          } else {
            s1 = { ...s1, vavg: 0.0 };
          }
        }
        s1 = normalizeSignal(s1);

        // Apply CH2 coupling
        const cpl2 = (comp.state.ch2Coupling || 'dc').toLowerCase();
        if (cpl2 === 'gnd') {
          s2 = { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
        } else if (cpl2 === 'ac') {
          if (s2.type === 'dc_ripple') {
            s2 = { ...s2, type: 'sine', vavg: 0.0, vpp: s2.rippleV || 0.024, vrms: (s2.rippleV || 0.024) / (2 * Math.SQRT2) };
          } else if (s2.type === 'dc') {
            s2 = { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 };
          } else {
            s2 = { ...s2, vavg: 0.0 };
          }
        }
        s2 = normalizeSignal(s2);

        // Dual-Channel Phase Difference & Propagation Delay
        if (s1 && s2 && s1.freq > 0 && s2.freq > 0) {
          const phi1 = s1.phaseDeg || 0;
          const phi2 = s2.phaseDeg || 0;
          const dPhi = phi2 - phi1;
          comp.state.phaseDiff = dPhi;
          comp.state.timeDelay = (dPhi / 360.0) / Math.max(1, s1.freq);
        } else {
          comp.state.phaseDiff = 0.0;
          comp.state.timeDelay = 0.0;
        }

        // Acquisition mode: RUN vs STOP vs SINGLE
        if (comp.state.runStop === 'single') {
          const trigSig = (comp.state.triggerSource === 'ch2') ? s2 : s1;
          const vMin = (trigSig.vavg || 0) - (trigSig.vpp / 2);
          const vMax = (trigSig.vavg || 0) + (trigSig.vpp / 2);
          const tLvl = comp.state.triggerLevel !== undefined ? comp.state.triggerLevel : 0.0;
          const isTriggered = (trigSig.vpp > 0.02 && tLvl >= vMin - 0.1 && tLvl <= vMax + 0.1) || trigSig.type === 'spike';

          if (isTriggered) {
            comp.state.frozenCH1 = { ...s1 };
            comp.state.frozenCH2 = { ...s2 };
            comp.state.singleTriggered = true;
            comp.state.singleArmed = false;
            comp.state.runStop = 'stop';
          } else {
            comp.state.singleArmed = true;
            comp.state.singleTriggered = false;
          }
        }

        if (comp.state.runStop === 'stop') {
          if (comp.state.frozenCH1) s1 = comp.state.frozenCH1;
          if (comp.state.frozenCH2) s2 = comp.state.frozenCH2;
        } else {
          comp.state.frozenCH1 = { ...s1 };
          comp.state.frozenCH2 = { ...s2 };
        }

        comp.state.ch1 = s1;
        comp.state.ch2 = s2;
        comp.state.ch1Signal = s1;
        comp.state.ch2Signal = s2;

        // Protocol bus decoding simulation packets
        const decMode = (comp.state.decodeMode || 'off').toLowerCase();
        if (decMode === 'uart') {
          comp.state.decodedPackets = [
            { hex: '0x55', label: "'U'", byte: '0x55', ascii: 'U', bits: '01010101', status: 'OK' },
            { hex: '0x41', label: "'A'", byte: '0x41', ascii: 'A', bits: '01000001', status: 'OK' },
            { hex: '0x52', label: "'R'", byte: '0x52', ascii: 'R', bits: '01010010', status: 'OK' },
            { hex: '0x54', label: "'T'", byte: '0x54', ascii: 'T', bits: '01010100', status: 'OK' },
            { hex: '0x21', label: "'!'", byte: '0x21', ascii: '!', bits: '00100001', status: 'OK' }
          ];
        } else if (decMode === 'i2c') {
          comp.state.decodedPackets = [
            { hex: 'S', label: 'START' },
            { hex: '0x3C', label: 'ADDR [0x3C+W]' },
            { hex: 'ACK', label: 'ACK' },
            { hex: '0x00', label: 'REG [0x00]' },
            { hex: 'ACK', label: 'ACK' },
            { hex: '0xAF', label: 'DATA [0xAF]' },
            { hex: 'ACK', label: 'ACK' },
            { hex: 'P', label: 'STOP' }
          ];
        } else if (decMode === 'spi') {
          comp.state.decodedPackets = [
            { hex: '0xAA', label: 'MOSI:0xAA' },
            { hex: '0x55', label: 'MOSI:0x55' },
            { hex: '0xFF', label: 'MISO:0xFF' },
            { hex: '0x00', label: 'MISO:0x00' }
          ];
        } else if (decMode === 'can') {
          comp.state.decodedPackets = [
            { hex: 'SOF', label: 'SOF' },
            { hex: '0x123', label: 'ID:0x123' },
            { hex: '0x04', label: 'DLC:4' },
            { hex: '0xAF', label: 'DATA:AF 01 20 FF' },
            { hex: 'CRC', label: 'CRC:OK' }
          ];
        } else {
          comp.state.decodedPackets = [];
        }

        comp.state.powered = true;
        this.status.activeComponents.add(comp.id);
      }
    }

    // If an oscilloscope has detected an active signal on CH1 or CH2 from an instrument, ensure circuit completion
    const hasActiveOscilloscope = this.components.some(c =>
      c.type === 'oscilloscope' && (
        (c.state.ch1 && c.state.ch1.type !== 'none') ||
        (c.state.ch2 && c.state.ch2.type !== 'none')
      )
    );
    if (hasActiveOscilloscope && !this.status.isShortCircuit) {
      this.status.isComplete = true;
      for (const fg of this.components) {
        if (fg.type === 'function_generator' && !fg.state.burnt) {
          fg.state.powered = (fg.state.outputEnabled !== false);
        }
      }
    }

    // Evaluate functional circuit roles for capacitors (Decoupling, Snubber, AC Coupling, Crystal Tank)
    this.evaluateCapacitorRoles(chains, find);

    // Evaluate functional circuit roles and transient dynamics for inductors
    this.evaluateInductorRoles(chains, find);
    this.evaluateInductorTransients(chains, find);

    // Evaluate Digital Logic Gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)
    this.evaluateLogicGates(find, allPosRoots, allNegRoots, this.status.totalVoltage);

    // Strict physical contact enforcement: components without electrical continuity CANNOT operate!
    for (const comp of this.components) {
      if (comp.state.burnt) continue;
      const isPowerSource = (comp.type === 'battery' || comp.type === 'cell' || comp.type === 'cell3v' || comp.type === 'ac_source' || comp.type === 'power_supply' || comp.type === 'function_generator' || comp.type === 'transformer' || ((comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') && (comp.state.current > 0 || (comp.state.storedVoltage || 0) > 0.05)));
      if (isPowerSource) continue;

      if (!this.status.activeComponents.has(comp.id)) {
        comp.state.powered = false;
        comp.state.current = 0;
        comp.state.voltageDrop = 0;
        comp.state.power = 0;
        if (comp.type === 'bulb' || comp.type === 'led') comp.state.brightness = 0;
        if (comp.type === 'motor') comp.state.rpm = 0;
        if (comp.type === 'buzzer') comp.state.sounding = false;
        if (comp.type === 'relay') {
          comp.state.coilVoltage = 0;
          comp.state.coilCurrent = 0;
          comp.state.energized = false;
        }
        if (comp.type === 'voltmeter') {
          comp.state.measuredVoltage = 0;
        }
      }
    }

    // Determine wire currents and direction (+ to -) for animated particles across all circuits
    this.calculateWireCurrents(chains, find);

    return this.status;
  }

  // Digital Logic Gate Truth Table Solver & Real-World IC Physics
  evaluateLogicGates(find, allPosRoots = new Set(), allNegRoots = new Set(), totalVoltage = 5.0) {
    const logicGates = this.components.filter(c => c.type && c.type.startsWith('gate_') && !c.state.burnt);
    const logicICs = this.components.filter(c => c.type && c.type.startsWith('ic_') && !c.state.burnt);
    if (logicGates.length === 0 && logicICs.length === 0) return;

    if (!find) {
      const built = this.buildNets();
      find = built.find;
    }

    // Helper to evaluate logic level (1 or 0) of any network pin
    const evaluateNetLevel = (netName, manualFallback = 0) => {
      if (!netName || !find) return manualFallback ? 1 : 0;

      // Driver gate (individual gate_*)
      const driverGate = logicGates.find(g => find(`${g.id}:out`) === netName);
      if (driverGate) return driverGate.state.outputLevel ? 1 : 0;

      // Driver IC output pin
      for (const ic of logicICs) {
        if (!ic.state.powered || ic.state.burnt || !ic.state.gates) continue;
        const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[ic.type];
        if (spec && spec.gatePins) {
          for (const gp of spec.gatePins) {
            if (find(`${ic.id}:${gp.out}`) === netName) {
              const gObj = ic.state.gates.find(g => g.id === gp.id);
              return (gObj && gObj.out) ? 1 : 0;
            }
          }
        }
      }

      // Explicit Pos / Neg root
      if (allPosRoots && allPosRoots.has(netName)) return 1;
      if (allNegRoots && allNegRoots.has(netName)) return 0;

      // Measured or Thevenin voltage
      const vNet = (typeof this.getNetTheveninVoltage === 'function')
        ? this.getNetTheveninVoltage(netName, allPosRoots, allNegRoots, totalVoltage || 5.0, find)
        : 0;
      if (vNet >= 1.5) return 1;
      if (vNet > 0 && vNet <= 0.8) return 0;

      // Check battery positive connection
      for (const c of this.components) {
        if (c.state.burnt) continue;
        if (c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'power_supply') {
          if (find(`${c.id}:pos`) === netName) return 1;
        }
      }

      return manualFallback ? 1 : 0;
    };

    // 0. Power and operating voltage check for ICs
    for (const ic of logicICs) {
      if (ic.state.burnt) {
        ic.state.powered = false;
        ic.state.vccVoltage = 0.0;
        continue;
      }

      const hasWireVcc = this.wires.some(w => (w.fromComp === ic.id && w.fromPin === 'pin14') || (w.toComp === ic.id && w.toPin === 'pin14'));
      const hasWireGnd = this.wires.some(w => (w.fromComp === ic.id && w.fromPin === 'pin7') || (w.toComp === ic.id && w.toPin === 'pin7'));

      let vSupply = 0.0;
      let isConnectedToPower = false;

      if (hasWireVcc && hasWireGnd && find) {
        const netVcc = find(`${ic.id}:pin14`);
        const netGnd = find(`${ic.id}:pin7`);

        const v14 = (typeof this.getNetTheveninVoltage === 'function')
          ? this.getNetTheveninVoltage(netVcc, allPosRoots, allNegRoots, totalVoltage || 5.0, find)
          : 0;
        const v7 = (typeof this.getNetTheveninVoltage === 'function')
          ? this.getNetTheveninVoltage(netGnd, allPosRoots, allNegRoots, totalVoltage || 5.0, find)
          : 0;
        vSupply = v14 - v7;

        let batVolt = 0;
        for (const c of this.components) {
          if (c.state.burnt) continue;
          if (c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'power_supply') {
            const pNet = find(`${c.id}:pos`);
            const nNet = find(`${c.id}:neg`);
            if (pNet === netVcc && nNet === netGnd) {
              const vComp = (c.type === 'power_supply') ? (c.state.voltage || 5.0) : (c.voltage || (c.type === 'battery' ? 9.0 : 1.5));
              batVolt = Math.max(batVolt, vComp);
            }
          }
        }
        if (batVolt > 0) vSupply = batVolt;
        isConnectedToPower = true;
      } else if (hasWireVcc && find) {
        const netVcc = find(`${ic.id}:pin14`);
        const v14 = (typeof this.getNetTheveninVoltage === 'function')
          ? this.getNetTheveninVoltage(netVcc, allPosRoots, allNegRoots, totalVoltage || 5.0, find)
          : 0;
        vSupply = v14;
        isConnectedToPower = true;
      }

      if (!isConnectedToPower && ic.state.manualPower) {
        vSupply = 5.0;
      }

      // Real IC 74HC Recommended Operating Voltage & Overvoltage Burnout
      // Recommended: 2.0V to 6.0V (Nominal 5.0V). Max: 7.0V.
      if (vSupply > 7.2) {
        ic.state.burning = true;
        ic.state.burnt = true;
        ic.state.burnReason = `Overvoltage (${vSupply.toFixed(1)}V exceeds 7.0V max rating)`;
        ic.state.powered = false;
        ic.state.vccVoltage = vSupply;
        if (window.sounds && typeof window.sounds.playOverheatSizzle === 'function') {
          window.sounds.playOverheatSizzle();
        }
      } else if (vSupply < -0.8 && isConnectedToPower) {
        ic.state.burning = true;
        ic.state.burnt = true;
        ic.state.burnReason = 'Reverse polarity on Vcc/GND';
        ic.state.powered = false;
        ic.state.vccVoltage = 0.0;
      } else if (vSupply >= 2.0) {
        ic.state.powered = true;
        ic.state.vccVoltage = vSupply;
        this.status.activeComponents.add(ic.id);
      } else {
        ic.state.powered = false;
        ic.state.vccVoltage = Math.max(0, vSupply);
      }
    }

    // 1. Multi-pass relaxation loop for chained combinational logic gates
    const maxIterations = 10;
    let changed = true;
    let iter = 0;

    while (changed && iter < maxIterations) {
      changed = false;
      iter++;

      // Evaluate individual logic gates
      for (const gate of logicGates) {
        const hasWireA = this.wires.some(w => (w.fromComp === gate.id && w.fromPin === 'in_a') || (w.toComp === gate.id && w.toPin === 'in_a'));
        const netA = hasWireA ? find(`${gate.id}:in_a`) : null;
        const levelA = evaluateNetLevel(netA, gate.state.manualA);

        let levelB = 0;
        if (gate.type !== 'gate_not') {
          const hasWireB = this.wires.some(w => (w.fromComp === gate.id && w.fromPin === 'in_b') || (w.toComp === gate.id && w.toPin === 'in_b'));
          const netB = hasWireB ? find(`${gate.id}:in_b`) : null;
          levelB = evaluateNetLevel(netB, gate.state.manualB);
        }

        let outLevel = 0;
        switch (gate.type) {
          case 'gate_and': outLevel = (levelA && levelB) ? 1 : 0; break;
          case 'gate_or': outLevel = (levelA || levelB) ? 1 : 0; break;
          case 'gate_not': outLevel = (!levelA) ? 1 : 0; break;
          case 'gate_nand': outLevel = !(levelA && levelB) ? 1 : 0; break;
          case 'gate_nor': outLevel = !(levelA || levelB) ? 1 : 0; break;
          case 'gate_xor': outLevel = (levelA !== levelB) ? 1 : 0; break;
          case 'gate_xnor': outLevel = (levelA === levelB) ? 1 : 0; break;
        }

        if (gate.state.inputA !== levelA || gate.state.inputB !== levelB || gate.state.outputLevel !== outLevel) {
          changed = true;
        }

        gate.state.inputA = levelA;
        gate.state.inputB = levelB;
        gate.state.outputLevel = outLevel;
        gate.state.outputVoltage = outLevel ? 5.0 : 0.0;
        gate.state.powered = true;
        this.status.activeComponents.add(gate.id);
      }

      // Evaluate IC internal gates
      for (const ic of logicICs) {
        if (!ic.state.powered || ic.state.burnt || !ic.state.gates) continue;
        const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[ic.type];
        if (!spec || !spec.gatePins) continue;

        for (const gp of spec.gatePins) {
          const gObj = ic.state.gates.find(g => g.id === gp.id);
          if (!gObj) continue;

          // Input A
          const hasWireA = this.wires.some(w => (w.fromComp === ic.id && w.fromPin === gp.inA) || (w.toComp === ic.id && w.toPin === gp.inA));
          const netA = hasWireA ? find(`${ic.id}:${gp.inA}`) : null;
          const levelA = evaluateNetLevel(netA, gObj.manualA);

          // Input B (if gate has inB)
          let levelB = 0;
          if (gp.inB) {
            const hasWireB = this.wires.some(w => (w.fromComp === ic.id && w.fromPin === gp.inB) || (w.toComp === ic.id && w.toPin === gp.inB));
            const netB = hasWireB ? find(`${ic.id}:${gp.inB}`) : null;
            levelB = evaluateNetLevel(netB, gObj.manualB);
          }

          const outVal = spec.evaluate(levelA, levelB);

          if (gObj.inA !== levelA || gObj.inB !== levelB || gObj.out !== outVal) {
            changed = true;
          }

          gObj.inA = levelA;
          if (gp.inB) gObj.inB = levelB;
          gObj.out = outVal;
          gObj.outV = outVal ? Math.min(5.0, ic.state.vccVoltage || 5.0) : 0.0;
        }
      }
    }

    // 2. Drive loads connected to logic gate outputs when Output Y is HIGH (5.0V)
    for (const gate of logicGates) {
      if (gate.state.outputLevel === 1 && find) {
        const outNet = find(`${gate.id}:out`);
        const hasGnd = gate.terminals && gate.terminals.some(t => t.id === 'gnd');
        const gndNet = hasGnd ? find(`${gate.id}:gnd`) : null;
        const targetNegNets = new Set();
        if (gndNet && gndNet !== outNet) targetNegNets.add(gndNet);
        if (allNegRoots) {
          for (const nr of allNegRoots) {
            if (nr !== outNet) targetNegNets.add(nr);
          }
        }
        for (const c of this.components) {
          if (c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'power_supply') {
            const nNet = find(`${c.id}:neg`);
            if (nNet && nNet !== outNet) targetNegNets.add(nNet);
            if (c.type === 'power_supply') {
              const gNet = find(`${c.id}:gnd`);
              if (gNet && gNet !== outNet) targetNegNets.add(gNet);
            }
          }
        }

        let totalGateLoadCurrent = 0;
        for (const negNet of targetNegNets) {
          const dummyGateSource = {
            id: gate.id,
            type: 'power_supply',
            voltage: 5.0,
            internalR: 120.0,
            state: { powered: true, outputEnabled: true, voltage: 5.0, actualVoltage: 5.0 }
          };
          this.analyzeCircuitBranches(outNet, negNet, 5.0, find, [dummyGateSource]);
          totalGateLoadCurrent += (dummyGateSource.state.current || dummyGateSource.state.actualCurrent || 0);
        }
        gate.state.current = totalGateLoadCurrent;
        gate.state.power = 5.0 * totalGateLoadCurrent;
      } else {
        gate.state.current = 0;
        gate.state.power = 0;
      }
    }

    // 3. Drive loads connected to IC gate output pins when HIGH
    for (const ic of logicICs) {
      if (!ic.state.powered || ic.state.burnt || !ic.state.gates) {
        ic.state.current = 0;
        ic.state.power = 0;
        continue;
      }

      const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[ic.type];
      if (!spec || !spec.gatePins) continue;

      let totalIcCurrent = 0;
      const netGnd = find ? find(`${ic.id}:pin7`) : null;

      for (const gp of spec.gatePins) {
        const gObj = ic.state.gates.find(g => g.id === gp.id);
        if (!gObj) continue;

        if (gObj.out === 1 && find) {
          const outNet = find(`${ic.id}:${gp.out}`);
          const targetNegNets = new Set();
          if (netGnd && netGnd !== outNet) targetNegNets.add(netGnd);
          if (allNegRoots) {
            for (const nr of allNegRoots) {
              if (nr !== outNet) targetNegNets.add(nr);
            }
          }
          for (const c of this.components) {
            if (c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'power_supply') {
              const nNet = find(`${c.id}:neg`);
              if (nNet && nNet !== outNet) targetNegNets.add(nNet);
            }
          }

          let gateLoadCurrent = 0;
          for (const negNet of targetNegNets) {
            const dummyGateSource = {
              id: `${ic.id}_gate${gp.id}`,
              type: 'power_supply',
              voltage: Math.min(5.0, ic.state.vccVoltage || 5.0),
              internalR: 50.0,
              state: { powered: true, outputEnabled: true, voltage: 5.0, actualVoltage: 5.0 }
            };
            this.analyzeCircuitBranches(outNet, negNet, 5.0, find, [dummyGateSource]);
            gateLoadCurrent += (dummyGateSource.state.current || dummyGateSource.state.actualCurrent || 0);
          }
          gObj.current = gateLoadCurrent;
          totalIcCurrent += gateLoadCurrent;
        } else {
          gObj.current = 0;
        }
      }

      const quiescentCurrent = ic.state.powered ? 0.002 : 0;
      ic.state.current = totalIcCurrent + quiescentCurrent;
      ic.state.power = (ic.state.vccVoltage || 5.0) * ic.state.current;
    }
  }

  // Detect and partition batteries into all independent groups/chains (series packs and separate circuits)
  findAllBatteryChains(batteries, find) {
    const getPosPin = (b) => (b.type === 'ac_source' ? 'l' : (b.type === 'function_generator' ? 'out' : (b.type === 'ceramic_capacitor' ? (b.state.chargePolarity === 't2_pos' ? 't2' : 't1') : (b.type === 'capacitor' ? 'anode' : 'pos'))));
    const getNegPin = (b) => (b.type === 'ac_source' ? 'n' : (b.type === 'function_generator' ? 'gnd' : (b.type === 'ceramic_capacitor' ? (b.state.chargePolarity === 't2_pos' ? 't1' : 't2') : (b.type === 'capacitor' ? 'cathode' : 'neg'))));
    const getVolt = (b) => {
      if (b.type === 'ac_source') return (b.state.voltage || 230.0);
      if (b.type === 'function_generator') {
        if (b.state.outputEnabled === false) return 0;
        const vppSet = b.state.amplitudeVpp !== undefined ? b.state.amplitudeVpp : 10.0;
        const offsetSet = b.state.dcOffset !== undefined ? b.state.dcOffset : (b.state.offsetVoltage || 0);
        const is50 = (b.state.outputImpedance !== 'highz' && b.state.outputImpedance !== 'high_z');
        const vpp = is50 ? (2 * vppSet) : vppSet;
        const offset = is50 ? (2 * offsetSet) : offsetSet;
        const wave = b.state.waveform || 'sine';
        const duty = b.state.dutyCycle !== undefined ? b.state.dutyCycle : 50;
        let vrms = 3.54;
        if (wave === 'dc') {
          vrms = Math.abs(offset);
        } else if (wave === 'sine') {
          vrms = Math.sqrt(Math.pow(vpp / (2 * Math.SQRT2), 2) + Math.pow(offset, 2));
        } else if (wave === 'square' || wave === 'pulse') {
          const d = Math.max(0.01, Math.min(0.99, duty / 100));
          const vH = offset + vpp / 2;
          const vL = offset - vpp / 2;
          vrms = Math.sqrt(d * vH * vH + (1 - d) * vL * vL);
        } else if (wave === 'triangle' || wave === 'ramp' || wave === 'sawtooth') {
          vrms = Math.sqrt(Math.pow(vpp / (2 * Math.sqrt(3)), 2) + Math.pow(offset, 2));
        } else if (wave === 'noise') {
          vrms = Math.sqrt(Math.pow(vpp / 6.0, 2) + Math.pow(offset, 2));
        } else if (wave === 'cardiac') {
          vrms = Math.sqrt(Math.pow(vpp * 0.22, 2) + Math.pow(offset, 2));
        } else {
          vrms = Math.sqrt(Math.pow(vpp / (2 * Math.sqrt(3)), 2) + Math.pow(offset, 2));
        }

        const mod = b.state.modulation || 'none';
        if (mod === 'am') {
          const m = b.state.amDepth !== undefined ? b.state.amDepth : 0.5;
          vrms = vrms * Math.sqrt(1 + (m * m) / 2);
        } else if (mod === 'burst') {
          const bCycles = b.state.burstCycles || 5;
          const repCycles = Math.max(bCycles + 1, 10);
          vrms = vrms * Math.sqrt(bCycles / repCycles);
        }
        b.state.voltage = Math.max(0.01, vrms);
        b.state.actualVoltage = b.state.voltage;
        return b.state.voltage;
      }
      if (b.type === 'cell3v') {
        const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS.cell3v) || {};
        return b.state.openCircuitVoltage || (def && def.openCircuitVoltage) || 3.20;
      }
      if (b.type === 'cell') return 1.5;
      if (b.type === 'power_supply') {
        if (b.state.outputEnabled === false) return 0.0;
        return Math.max(0.001, (b.state.voltage !== undefined ? b.state.voltage : 12.0));
      }
      if (b.type === 'capacitor' || b.type === 'ceramic_capacitor') return (b.state.storedVoltage || 0);
      const bDef = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[b.type]) || {};
      const bVolt = (b.state && b.state.voltage !== undefined) ? b.state.voltage : (b.voltage || bDef.voltage || (b.type === 'battery' ? 9.0 : 1.5));
      return Math.max(0, bVolt);
    };

    const batInfos = [];
    for (const b of batteries) {
      if (b.type === 'function_generator') {
        const outNet = find(`${b.id}:out`);
        const syncNet = find(`${b.id}:sync`);
        const gndNet = find(`${b.id}:gnd`);
        batInfos.push({
          bat: b,
          id: `${b.id}:out`,
          posNet: outNet,
          negNet: gndNet,
          volt: getVolt(b),
          sourcePin: 'out'
        });
        const hasSyncWire = this.wires && this.wires.some(w =>
          !(w.state && w.state.burnt) && (
            (w.fromComp === b.id && w.fromPin === 'sync') ||
            (w.toComp === b.id && w.toPin === 'sync')
          )
        );
        if (hasSyncWire) {
          batInfos.push({
            bat: b,
            id: `${b.id}:sync`,
            posNet: syncNet,
            negNet: gndNet,
            volt: (b.state.outputEnabled !== false) ? 3.5355 : 0,
            sourcePin: 'sync'
          });
        }
      } else {
        batInfos.push({
          bat: b,
          id: b.id,
          posNet: find(`${b.id}:${getPosPin(b)}`),
          negNet: find(`${b.id}:${getNegPin(b)}`),
          volt: getVolt(b),
          sourcePin: getPosPin(b)
        });
      }
    }

    // Group batteries that are directly connected terminal-to-terminal (e.g. series battery pack)
    const visited = new Set();
    const chains = [];

    for (let i = 0; i < batInfos.length; i++) {
      if (visited.has(batInfos[i].id)) continue;

      const group = [];
      const queue = [batInfos[i]];
      visited.add(batInfos[i].id);

      while (queue.length > 0) {
        const cur = queue.shift();
        group.push(cur);

        for (const other of batInfos) {
          if (visited.has(other.id)) continue;
          // Check if other's terminal touches cur's terminal in series or parallel
          const isDirectlyConnected =
            (other.negNet === cur.posNet || other.posNet === cur.negNet) ||
            (other.posNet === cur.posNet && other.negNet === cur.negNet);
          if (isDirectlyConnected) {
            visited.add(other.id);
            queue.push(other);
          }
        }
      }

      if (group.length === 1) {
        chains.push({
          primaryPosRoot: group[0].posNet,
          primaryNegRoot: group[0].negNet,
          totalVoltage: group[0].volt,
          batteries: [group[0].bat],
          endBat: group[0].bat,
          startBat: group[0].bat,
          sourcePin: group[0].sourcePin
        });
      } else {
        const isParallel = group.every(b => b.posNet === group[0].posNet && b.negNet === group[0].negNet);
        if (isParallel) {
          chains.push({
            primaryPosRoot: group[0].posNet,
            primaryNegRoot: group[0].negNet,
            totalVoltage: group[0].volt,
            batteries: group.map(g => g.bat),
            endBat: group[0].bat,
            startBat: group[0].bat,
            sourcePin: group[0].sourcePin
          });
        } else {
          // Find start of series chain: battery whose negNet is not connected to any other battery's posNet in this group
          let startInfo = group.find(b => !group.some(other => other.id !== b.id && other.posNet === b.negNet));
          if (!startInfo) startInfo = group[0];

          let curInfo = startInfo;
          const chainVisited = new Set([curInfo.id]);
          let totalVoltage = curInfo.volt;
          let endInfo = curInfo;

          while (curInfo) {
            const nextInfo = group.find(other => !chainVisited.has(other.id) && other.negNet === curInfo.posNet);
            if (nextInfo) {
              chainVisited.add(nextInfo.id);
              totalVoltage += nextInfo.volt;
              curInfo = nextInfo;
              endInfo = curInfo;
            } else {
              break;
            }
          }

          chains.push({
            primaryPosRoot: endInfo.posNet,
            primaryNegRoot: startInfo.negNet,
            totalVoltage: totalVoltage,
            batteries: group.map(g => g.bat),
            endBat: endInfo.bat,
            startBat: startInfo.bat,
            sourcePin: endInfo.sourcePin
          });
        }
      }
    }

    return chains;
  }

  // Detect series and parallel batteries/sources to calculate total system voltage (legacy helper)
  resolveBatteryChains(batteries, find) {
    const chains = this.findAllBatteryChains(batteries, find);
    if (chains.length === 0) return { primaryPosRoot: null, primaryNegRoot: null, totalVoltage: 0 };
    return chains[0];
  }

  // Evaluate functional circuit roles for capacitors (Decoupling, Snubber, AC Coupling, Crystal Tank)
  evaluateCapacitorRoles(chains, find) {
    const capacitors = this.components.filter(c => c.type === 'ceramic_capacitor' || c.type === 'capacitor');
    if (capacitors.length === 0) return;

    for (const cap of capacitors) {
      if (cap.state.burnt) continue;
      const isCeramic = (cap.type === 'ceramic_capacitor');
      const p1Net = isCeramic ? find(`${cap.id}:t1`) : find(`${cap.id}:anode`);
      const p2Net = isCeramic ? find(`${cap.id}:t2`) : find(`${cap.id}:cathode`);

      if (!p1Net || !p2Net || p1Net === p2Net) {
        cap.state.circuitRole = 'disconnected';
        cap.state.circuitRoleName = 'Open Circuit / Unconnected';
        cap.state.roleDetail = 'Capacitor leads are not connected to a complete circuit loop.';
        continue;
      }

      // 1. Check Inductive Snubber & Flyback Clamp (Ceramic or Fast Capacitor across inductive coil)
      let snubberMatch = null;
      for (const ind of this.components) {
        if ((ind.type === 'solenoid' || ind.type === 'inductor' || ind.type === 'motor') && !ind.state.burnt) {
          const tA = ind.terminals && ind.terminals[0] ? find(`${ind.id}:${ind.terminals[0].id}`) : null;
          const tB = ind.terminals && ind.terminals[1] ? find(`${ind.id}:${ind.terminals[1].id}`) : null;
          if (tA && tB && ((tA === p1Net && tB === p2Net) || (tA === p2Net && tB === p1Net))) {
            snubberMatch = ind;
            break;
          }
        }
      }

      if (snubberMatch) {
        cap.state.circuitRole = 'snubber';
        cap.state.circuitRoleName = 'Inductive Snubber & Flyback Clamp';
        cap.state.snubberActive = true;
        cap.state.protectedLoadId = snubberMatch.id;
        snubberMatch.state.snubberProtected = true;

        const indL = snubberMatch.type === 'solenoid' ? 0.05 : (snubberMatch.type === 'motor' ? 0.02 : ((snubberMatch.state.inductanceMh || 10) * 1e-3));
        const cVal = isCeramic ? ((cap.state.capacitanceUf || 0.1) * 1e-6) : ((cap.state.capacitance || 1000) * 1e-6);
        const iCoil = snubberMatch.state.current || 0.2;
        // Snubber LC resonance dampens coil back-EMF below 50V dielectric limit (typically ~18V-36V)
        const rawZ0 = Math.sqrt(indL / Math.max(1e-12, cVal));
        const clampedV = Math.min(36, Math.max(14, Math.round(iCoil * rawZ0 * 0.08)));
        cap.state.clampedSpikeVoltage = clampedV;
        cap.state.roleDetail = `Absorbs turn-off back-EMF spike (clamped to ~${clampedV}V). Suppresses switch contact arcing & high-frequency EMI ringing.`;
        continue;
      }

      // 2. Check AC Coupling & High-Pass Filtering
      // Connected in series in an AC signal path (from AC Source or Function Generator to a load)
      const isSeriesAC = chains.some(ch => {
        if (ch.totalVoltage <= 0) return false;
        const isACChain = ch.batteries && ch.batteries.some(b => b.type === 'ac_source' || b.type === 'function_generator');
        if (!isACChain) return false;
        const p1TowardsPos = (p1Net === ch.primaryPosRoot) || this.isNetConnectedToPositive(p1Net, new Set([ch.primaryPosRoot]), find);
        const p2TowardsNeg = (p2Net === ch.primaryNegRoot) || this.isNetConnectedToNegative(p2Net, new Set([ch.primaryNegRoot]), find);
        const p2TowardsPos = (p2Net === ch.primaryPosRoot) || this.isNetConnectedToPositive(p2Net, new Set([ch.primaryPosRoot]), find);
        const p1TowardsNeg = (p1Net === ch.primaryNegRoot) || this.isNetConnectedToNegative(p1Net, new Set([ch.primaryNegRoot]), find);
        return (p1TowardsPos && p2TowardsNeg) || (p2TowardsPos && p1TowardsNeg);
      });

      if (isSeriesAC) {
        cap.state.circuitRole = 'ac_coupling';
        cap.state.circuitRoleName = 'AC Signal Coupling / High-Pass Filter';
        const cVal = isCeramic ? ((cap.state.capacitanceUf || 0.1) * 1e-6) : ((cap.state.capacitance || 1000) * 1e-6);
        const rLoad = 100;
        const fc = 1 / (2 * Math.PI * rLoad * Math.max(1e-15, cVal));
        cap.state.cutoffFreqFc = fc;
        cap.state.roleDetail = `Blocks DC bias offset (IDC ≈ 0) while passing AC signals. High-pass cutoff fc = ${fc >= 1000 ? (fc / 1000).toFixed(1) + ' kHz' : fc.toFixed(1) + ' Hz'}.`;
        continue;
      }

      // 3. Check High-Frequency Decoupling / Rail Bypass & Complementary Pair
      const isAcrossRails = chains.some(ch => {
        if (ch.totalVoltage <= 0) return false;
        const p1Pos = (p1Net === ch.primaryPosRoot) || this.isNetConnectedToPositive(p1Net, new Set([ch.primaryPosRoot]), find);
        const p2Neg = (p2Net === ch.primaryNegRoot) || this.isNetConnectedToNegative(p2Net, new Set([ch.primaryNegRoot]), find);
        const p2Pos = (p2Net === ch.primaryPosRoot) || this.isNetConnectedToPositive(p2Net, new Set([ch.primaryPosRoot]), find);
        const p1Neg = (p1Net === ch.primaryNegRoot) || this.isNetConnectedToNegative(p1Net, new Set([ch.primaryNegRoot]), find);
        return (p1Pos && p2Neg) || (p2Pos && p1Neg);
      });

      if (isAcrossRails) {
        if (isCeramic) {
          const hasBulkEl = this.components.some(c => c.type === 'capacitor' && !c.state.burnt && (
            ((find(`${c.id}:anode`) === p1Net && find(`${c.id}:cathode`) === p2Net) ||
              (find(`${c.id}:anode`) === p2Net && find(`${c.id}:cathode`) === p1Net))
          ));
          if (hasBulkEl) {
            cap.state.circuitRole = 'decoupling_pair';
            cap.state.circuitRoleName = 'Complementary Decoupling Pair (MLCC + Bulk)';
            cap.state.roleDetail = 'Pairs with bulk electrolytic: ceramic MLCC supplies ultra-fast di/dt transients (<10ns), electrolytic supplies bulk sustained current.';
          } else {
            cap.state.circuitRole = 'decoupling';
            cap.state.circuitRoleName = 'High-Frequency Decoupling / Rail Bypass';
            cap.state.roleDetail = 'Placed across DC supply rails to shunt high-frequency switching noise to ground with ultra-low ESL (~0.9nH).';
          }
          cap.state.decouplingEffective = true;
        } else {
          const hasCeramic = this.components.some(c => c.type === 'ceramic_capacitor' && !c.state.burnt && (
            ((find(`${c.id}:t1`) === p1Net && find(`${c.id}:t2`) === p2Net) ||
              (find(`${c.id}:t1`) === p2Net && find(`${c.id}:t2`) === p1Net))
          ));
          if (hasCeramic) {
            cap.state.circuitRole = 'bulk_reservoir';
            cap.state.circuitRoleName = 'Bulk Energy Reservoir (Complementary Pair)';
            cap.state.roleDetail = 'Provides sustained microsecond energy storage while paired MLCC absorbs fast picosecond edge transients.';
          } else {
            cap.state.circuitRole = 'bulk_reservoir';
            cap.state.circuitRoleName = 'Bulk DC Energy Reservoir';
            cap.state.roleDetail = 'Stores large bulk charge (Q = C·V) to bridge power rail droop and sustain DC load voltage.';
          }
        }
        continue;
      }

      // 4. Crystal Oscillator Load / RF Timing Tank (Class 1 C0G Low-pF)
      if (isCeramic && (cap.state.capacitancePf || 100000) <= 47) {
        cap.state.circuitRole = 'timing';
        cap.state.circuitRoleName = 'Crystal Tank / Precision Timing (Class 1 C0G)';
        cap.state.roleDetail = 'Precision Class 1 C0G linear dielectric with 0% DC bias derating and near-zero drift. Standard microcontroller crystal clock load capacitance.';
        continue;
      }

      // 5. Default: Electrostatic Energy Storage
      cap.state.circuitRole = isCeramic ? 'reservoir' : 'bulk_reservoir';
      cap.state.circuitRoleName = isCeramic ? 'Electrostatic Energy Storage' : 'Electrolytic Bulk Reservoir';
      cap.state.roleDetail = isCeramic
        ? 'Stores electric charge electrostatically (Q = C·V) between stacked planar metal electrodes.'
        : 'Stores bulk charge electrostatically on electrochemical aluminum oxide dielectric.';
    }
  }

  // Evaluate functional circuit roles for inductors (Lamp Soft-Start, LED Kickback Hazard, Motor Choke, LC Tank/Filter, RL)
  evaluateInductorRoles(chains, find) {
    const inductors = this.components.filter(c => c.type === 'inductor');
    if (inductors.length === 0) return;

    for (const ind of inductors) {
      if (ind.state.burnt) continue;
      const p1Net = find(`${ind.id}:pin1`);
      const p2Net = find(`${ind.id}:pin2`);

      if (!p1Net || !p2Net || p1Net === p2Net) {
        ind.state.circuitRole = 'disconnected';
        ind.state.circuitRoleName = 'Open Circuit / Unconnected';
        ind.state.roleDetail = 'Inductor leads are not connected to a complete circuit loop.';
        continue;
      }

      const lMh = ind.state.inductanceMh || (ind.state.inductanceUh ? ind.state.inductanceUh / 1000 : 10);
      const lHenries = lMh * 1e-3;
      const dcr = ind.state.dcr || 0.8;

      // 1. Check Flyback Protection (Reverse-Parallel Diode or Snubber Capacitor across inductor)
      let flybackDiode = null;
      let snubberCap = null;
      for (const comp of this.components) {
        if (comp.state.burnt) continue;
        if (comp.type === 'diode') {
          const aNet = find(`${comp.id}:anode`);
          const cNet = find(`${comp.id}:cathode`);
          if (aNet && cNet && ((aNet === p1Net && cNet === p2Net) || (aNet === p2Net && cNet === p1Net))) {
            flybackDiode = comp;
          }
        } else if (comp.type === 'ceramic_capacitor' || comp.type === 'capacitor') {
          const t1 = find(`${comp.id}:${comp.type === 'ceramic_capacitor' ? 't1' : 'anode'}`);
          const t2 = find(`${comp.id}:${comp.type === 'ceramic_capacitor' ? 't2' : 'cathode'}`);
          if (t1 && t2 && ((t1 === p1Net && t2 === p2Net) || (t1 === p2Net && t2 === p1Net))) {
            snubberCap = comp;
          }
        }
      }

      if (flybackDiode) {
        ind.state.flybackProtected = true;
        ind.state.flybackType = 'diode';
        ind.state.protectingDiodeId = flybackDiode.id;
        flybackDiode.state.circuitRole = 'flyback';
        flybackDiode.state.circuitRoleName = 'Flyback Protection Diode';
        flybackDiode.state.roleDetail = 'Reverse-parallel clamping diode: clamps inductive turn-off spike to ~0.7V and safely circulates magnetic collapse energy.';
      } else if (snubberCap) {
        ind.state.flybackProtected = true;
        ind.state.flybackType = 'snubber';
        ind.state.protectingCapId = snubberCap.id;
      } else {
        ind.state.flybackProtected = false;
        ind.state.flybackType = '';
      }

      // 2. Check LC Resonant Tank (Inductor in parallel loop with capacitor)
      let resonantCap = null;
      for (const comp of this.components) {
        if (comp.state.burnt) continue;
        if (comp.type === 'ceramic_capacitor' || comp.type === 'capacitor') {
          const t1 = find(`${comp.id}:${comp.type === 'ceramic_capacitor' ? 't1' : 'anode'}`);
          const t2 = find(`${comp.id}:${comp.type === 'ceramic_capacitor' ? 't2' : 'cathode'}`);
          if (t1 && t2 && ((t1 === p1Net && t2 === p2Net) || (t1 === p2Net && t2 === p1Net))) {
            resonantCap = comp;
            break;
          }
        }
      }

      if (resonantCap) {
        const cVal = resonantCap.type === 'ceramic_capacitor' ? ((resonantCap.state.capacitanceUf || 0.1) * 1e-6) : ((resonantCap.state.capacitance || 1000) * 1e-6);
        const f0 = 1 / (2 * Math.PI * Math.sqrt(lHenries * cVal));
        ind.state.resonantFreqF0 = f0;
        const f0Str = f0 >= 1e6 ? (f0 / 1e6).toFixed(2) + ' MHz' : (f0 >= 1000 ? (f0 / 1000).toFixed(1) + ' kHz' : f0.toFixed(1) + ' Hz');

        // Check if there is an active DC load or switch circuit where capacitor acts purely as snubber
        const hasDCLoad = this.components.some(c => (c.type === 'solenoid' || c.type === 'motor') && c.id !== ind.id);
        if (!hasDCLoad) {
          ind.state.circuitRole = 'lc_tank';
          ind.state.circuitRoleName = 'LC Resonant Tank (Energy Sloshing)';
          ind.state.roleDetail = `Energy sloshes between inductor magnetic field (½LI²) and capacitor electric field (½CV²). Natural resonance f₀ = ${f0Str}.`;
          continue;
        }
      }

      // 3. Find chain branch containing this inductor to determine series partners and RL time constant
      let branchInfo = null;
      for (const branch of this.allValidBranches || []) {
        const hasInd = branch.some(step => (step.comp && step.comp.id === ind.id) || (step.edge && step.edge.comp && step.edge.comp.id === ind.id));
        if (hasInd) {
          branchInfo = branch;
          break;
        }
      }

      let branchR = dcr;
      let seriesBulb = null;
      let seriesLed = null;
      let seriesMotor = null;
      let seriesResistor = null;
      let seriesCapacitor = null;

      if (branchInfo) {
        for (const step of branchInfo) {
          const c = step.comp || (step.edge && step.edge.comp);
          if (!c || c.id === ind.id) continue;
          if (c.type === 'bulb') {
            seriesBulb = c;
            branchR += (c.state.resistance !== undefined ? c.state.resistance : 45.0);
          } else if (c.type === 'led') {
            seriesLed = c;
            branchR += (c.state.resistance !== undefined ? c.state.resistance : 15.0);
          } else if (c.type === 'motor') {
            seriesMotor = c;
            branchR += (c.state.resistance !== undefined ? c.state.resistance : 8.0);
          } else if (c.type === 'resistor' || c.type === 'potentiometer') {
            seriesResistor = c;
            branchR += (c.state.resistance !== undefined ? c.state.resistance : 220.0);
          } else if (c.type === 'ceramic_capacitor' || c.type === 'capacitor') {
            seriesCapacitor = c;
          } else {
            const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[c.type]) || {};
            branchR += (c.state.resistance !== undefined ? c.state.resistance : (def.resistance !== undefined ? def.resistance : 1.0));
          }
        }
      } else {
        // Look up by shared nets among active components
        for (const c of this.components) {
          if (c.id === ind.id || c.state.burnt) continue;
          const cT1 = c.terminals && c.terminals[0] ? find(`${c.id}:${c.terminals[0].id}`) : null;
          const cT2 = c.terminals && c.terminals[1] ? find(`${c.id}:${c.terminals[1].id}`) : null;
          if (cT1 === p1Net || cT1 === p2Net || cT2 === p1Net || cT2 === p2Net) {
            if (c.type === 'bulb') seriesBulb = c;
            else if (c.type === 'led') seriesLed = c;
            else if (c.type === 'motor') seriesMotor = c;
            else if (c.type === 'resistor') seriesResistor = c;
            else if (c.type === 'ceramic_capacitor' || c.type === 'capacitor') seriesCapacitor = c;
          }
        }
        if (ind.state.current > 0.001) {
          branchR = Math.max(dcr, 9.0 / ind.state.current);
        } else {
          branchR = 10.0 + dcr;
        }
      }

      const tau = lHenries / Math.max(0.1, branchR);
      const rise5Tau = 5 * tau;
      ind.state.tau = tau;
      ind.state.riseTime5Tau = rise5Tau;
      ind.state.branchResistance = branchR;

      const tauStr = tau >= 1.0 ? tau.toFixed(2) + ' s' : (tau * 1000).toFixed(1) + ' ms';
      const rise5Str = rise5Tau >= 1.0 ? rise5Tau.toFixed(2) + ' s' : (rise5Tau * 1000).toFixed(1) + ' ms';

      // 4. LC Low-Pass Power Filter (Series inductor with shunt capacitor to ground/negative)
      let shuntFilterCap = null;
      for (const comp of this.components) {
        if (comp.state.burnt || comp.id === ind.id) continue;
        if (comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
          const t1 = find(`${comp.id}:${comp.type === 'ceramic_capacitor' ? 't1' : 'anode'}`);
          const t2 = find(`${comp.id}:${comp.type === 'ceramic_capacitor' ? 't2' : 'cathode'}`);
          const isT1OnInd = (t1 === p1Net || t1 === p2Net);
          const isT2OnInd = (t2 === p1Net || t2 === p2Net);
          if (isT1OnInd && !isT2OnInd && t2) {
            shuntFilterCap = comp;
            break;
          } else if (isT2OnInd && !isT1OnInd && t1) {
            shuntFilterCap = comp;
            break;
          }
        }
      }

      if ((seriesCapacitor || shuntFilterCap) && !resonantCap) {
        ind.state.circuitRole = 'lc_filter';
        ind.state.circuitRoleName = 'LC Low-Pass Power Filter';
        ind.state.roleDetail = 'Series inductor opposes AC ripple (X_L = 2πfL) while capacitor bypasses residual ripple to ground, delivering flat DC.';
        continue;
      }

      // 5. Incandescent Lamp RL Circuit
      if (seriesBulb) {
        ind.state.circuitRole = 'lamp_rl';
        ind.state.circuitRoleName = 'Incandescent Lamp Soft-Start Delay (RL)';
        ind.state.roleDetail = `Opposes instant current change (v_L = -L·di/dt). Current ramps exponentially with τ = L/R (${tauStr}). Lamp starts dim and warms to full brightness over 5τ (${rise5Str}).`;
        seriesBulb.state.seriesInductorId = ind.id;
        seriesBulb.state.softStartTau = tau;
        continue;
      }

      // 6. LED Series RL Circuit
      if (seriesLed) {
        ind.state.circuitRole = 'led_rl';
        ind.state.circuitRoleName = 'LED Series RL Circuit (Kickback Hazard)';
        ind.state.roleDetail = `Smooths LED turn-on. CRITICAL: Collapsing magnetic field at turn-off generates >50V kickback spike! Requires reverse-parallel flyback diode to prevent puncturing LED junction (VR = 5V).`;
        seriesLed.state.seriesInductorId = ind.id;
        continue;
      }

      // 7. DC Motor Series Choke
      if (seriesMotor) {
        ind.state.circuitRole = 'motor_choke';
        ind.state.circuitRoleName = 'DC Motor Series Choke & Inrush Limiter';
        ind.state.roleDetail = `Soft-starts motor stall inrush current, dampens commutator brush ripple, and chokes radio frequency (EMI) interference.`;
        seriesMotor.state.seriesInductorId = ind.id;
        continue;
      }

      // 8. Series Resistor RL Circuit
      if (seriesResistor) {
        ind.state.circuitRole = 'rl_circuit';
        ind.state.circuitRoleName = 'Fundamental RL Transient Circuit';
        ind.state.roleDetail = `Governed by time constant τ = L/R (${tauStr}). Current reaches 63.2% at 1τ and 99.3% at 5τ (${rise5Str}). Stored energy E = ½LI² dissipates as heat.`;
        continue;
      }

      // 9. General Inductor Choke
      ind.state.circuitRole = 'general_choke';
      ind.state.circuitRoleName = 'Power Choke Inductor';
      ind.state.roleDetail = 'Passes steady DC with minimal winding resistance (DCR) while choking AC ripple and noise.';
    }
  }

  // Evaluate inductive kickback, switch contact arcing, and reverse breakdown protection on turn-off
  evaluateInductorTransients(chains, find) {
    const inductors = this.components.filter(c => c.type === 'inductor');
    for (const ind of inductors) {
      if (ind.state.burnt) continue;
      const iPrev = ind.state.previousCurrent || 0;
      const iCur = ind.state.current || 0;
      const lMh = ind.state.inductanceMh || (ind.state.inductanceUh ? ind.state.inductanceUh / 1000 : 10);
      const lHenries = lMh * 1e-3;

      // Detect turn-off / disconnection transition from an energized state
      if (iPrev > 0.005 && iCur < 0.001) {
        const storedEnergy = 0.5 * lHenries * iPrev * iPrev;
        ind.state.storedEnergy = storedEnergy;

        if (ind.state.flybackProtected) {
          // Protected by flyback diode or snubber!
          const clampV = ind.state.flybackType === 'diode' ? 0.7 : 24.0;
          ind.state.kickbackVoltage = clampV;
          ind.state.kickbackClamped = true;
        } else {
          // Unprotected collapsing magnetic field (di/dt -> -inf)
          // Generates high voltage reverse spike (easily > 50V to 100V+)
          const spikeV = Math.min(450, Math.max(65, Math.round(iPrev * 1800 * Math.sqrt(lHenries / 0.01))));
          ind.state.kickbackVoltage = spikeV;
          ind.state.kickbackClamped = false;

          // 1. Check if a mechanical switch was opened in the broken circuit
          for (const sw of this.components) {
            if ((sw.type === 'switch' || sw.type === 'pushbutton') && !sw.state.burnt) {
              if (sw.type === 'switch' && !sw.state.closed) {
                sw.state.contactSpark = true;
                sw.state.sparkTimer = 1.0;
              }
            }
          }

          // 2. Check if an LED was in the circuit loop: V_spike > 50V >> V_R = 5V
          for (const led of this.components) {
            if (led.type === 'led' && !led.state.burnt) {
              // Destroy LED due to reverse inductive kickback puncture
              led.state.burnt = true;
              led.state.burning = false;
              led.state.powered = false;
              led.state.brightness = 0;
              led.state.current = 0;
              led.state.burnReason = `Inductive Kickback Puncture! Collapsing magnetic field generated a massive ${spikeV}V reverse spike exceeding LED maximum reverse breakdown voltage (VR = 5.0V)! Without a flyback diode across the inductor, the semiconductor die was permanently destroyed!`;
              led.state.diagnostic = {
                faultType: 'INDUCTIVE_KICKBACK_LED_PUNCTURE',
                title: '💥 LED Semiconductor Die Punctured by Inductive Kickback Spike',
                culprit: 'Power Choke Inductor & LED',
                whyHappened: `When current was interrupted, the inductor's magnetic field collapsed rapidly (di/dt -> -∞), generating a reverse inductive spike of ${spikeV}V (v_L = -L · di/dt). Standard LEDs have a maximum reverse breakdown voltage (V_R) of only 5.0V. The reverse high voltage punched through the P-N junction depletion region and vaporized the die!`,
                remedy: 'Install a 1N4007 Flyback Diode connected in reverse-parallel across the inductor (Cathode to (+) rail, Anode to (-)). The diode will forward-bias during collapse, safely clamping the spike to ~0.7V and absorbing the magnetic collapse energy.',
                electricalPrinciple: 'Faraday-Lenz Law of Induction & Diode Reverse Breakdown (V_spike >> V_R = 5V)',
                equation: 'v_L = -L · (di/dt) > 50V >> V_R(LED) = 5.0V'
              };
              this.status.failedComponents.push(led.id);
              this.status.circuitFailed = true;
              this.status.failureReason = led.state.burnReason;
              this.status.faultDiagnostic = led.state.diagnostic;
            }
          }
        }
      } else if (iCur > 0.001) {
        ind.state.kickbackVoltage = 0;
        ind.state.kickbackClamped = false;
      }
    }
  }

  analyzeCircuitBranches(posRoot, negRoot, totalVoltage, find, chainBatteries = []) {
    const isAC = chainBatteries.some(b => b.type === 'ac_source' || b.type === 'transformer' || (b.type === 'function_generator' && b.state.waveform !== 'dc'));
    // Non-battery components form candidate edges
    const edges = [];
    const sourceTypes = new Set(['battery', 'cell', 'cell3v', 'ac_source', 'power_supply', 'function_generator', 'gate_and', 'gate_or', 'gate_not', 'gate_nand', 'gate_nor', 'gate_xor', 'gate_xnor']);
    for (const comp of this.components) {
      if (sourceTypes.has(comp.type)) continue;
      if (comp.type === 'switch' || comp.type === 'pushbutton' || comp.type === 'twowayswitch') continue; // Handled in net union
      if (comp.type === 'multimeter' || comp.type === 'voltmeter') continue; // High impedance sensing devices
      if (comp.state.burnt) continue; // Burnt components are blown open circuits!

      if (comp.type === 'oscilloscope') {
        const netGND = find(`${comp.id}:gnd`);
        const netCH1 = find(`${comp.id}:ch1`);
        const netCH2 = find(`${comp.id}:ch2`);
        const rIn = comp.state.internalR || 1000000.0;
        if (netCH1 && netGND && netCH1 !== netGND) {
          edges.push({ comp, subId: 'ch1', netA: netCH1, netB: netGND, pinA: 'ch1', pinB: 'gnd', resistance: rIn });
        }
        if (netCH2 && netGND && netCH2 !== netGND) {
          edges.push({ comp, subId: 'ch2', netA: netCH2, netB: netGND, pinA: 'ch2', pinB: 'gnd', resistance: rIn });
        }
        continue;
      }

      if (comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
        // In DC, capacitor blocks steady-state current (infinite DC resistance).
        // In AC, capacitor conducts Alternating Current via capacitive reactance Xc = 1 / (2*pi*f*C)!
        if (isAC && comp.terminals && comp.terminals.length === 2) {
          const pinA = comp.terminals[0].id;
          const pinB = comp.terminals[1].id;
          const netA = find(`${comp.id}:${pinA}`);
          const netB = find(`${comp.id}:${pinB}`);
          if (netA !== netB) {
            edges.push({ comp, netA, netB, pinA, pinB });
          }
        }
        continue;
      }

      if (comp.type === 'transformer') {
        const pinA = 'pri1';
        const pinB = 'pri2';
        const netA = find(`${comp.id}:${pinA}`);
        const netB = find(`${comp.id}:${pinB}`);
        if (netA !== netB) {
          edges.push({ comp, netA, netB, pinA, pinB });
        }
      } else if (comp.type === 'potentiometer') {
        const net1 = find(`${comp.id}:pin1`);
        const netW = find(`${comp.id}:wiper`);
        const net2 = find(`${comp.id}:pin2`);
        const totalR = comp.state.totalResistance || 1000;
        const ratio = comp.state.wiperRatio !== undefined ? comp.state.wiperRatio : (comp.state.resistance !== undefined ? comp.state.resistance / totalR : 0.5);
        const r1 = Math.max(0.5, Math.round((1 - ratio) * totalR));
        const r2 = Math.max(0.5, Math.round(ratio * totalR));

        comp.state.r1 = r1;
        comp.state.r2 = r2;
        comp.state.totalResistance = totalR;

        // Check which pins have external wires connected
        const hasPin1Wire = this.wires.some(w => (w.fromComp === comp.id && w.fromPin === 'pin1') || (w.toComp === comp.id && w.toPin === 'pin1'));
        const hasWiperWire = this.wires.some(w => (w.fromComp === comp.id && w.fromPin === 'wiper') || (w.toComp === comp.id && w.toPin === 'wiper'));
        const hasPin2Wire = this.wires.some(w => (w.fromComp === comp.id && w.fromPin === 'pin2') || (w.toComp === comp.id && w.toPin === 'pin2'));

        if (hasWiperWire) {
          // Wiper connected: 3-terminal Voltage Divider or Rheostat with Wiper
          if (net1 !== netW && (hasPin1Wire || !hasPin2Wire)) {
            edges.push({ comp, subId: 'r1', netA: net1, netB: netW, pinA: 'pin1', pinB: 'wiper', resistance: r1 });
          }
          if (netW !== net2 && (hasPin2Wire || !hasPin1Wire)) {
            edges.push({ comp, subId: 'r2', netA: netW, netB: net2, pinA: 'wiper', pinB: 'pin2', resistance: r2 });
          }
        } else {
          // 2-terminal Fixed Track mode between Pin 1 and Pin 2 (R = R_total = R1 + R2)
          if (net1 !== net2) {
            edges.push({ comp, subId: 'track', netA: net1, netB: net2, pinA: 'pin1', pinB: 'pin2', resistance: totalR });
          }
        }
      } else if (comp.type === 'rectifier') {
        const netAC1 = find(`${comp.id}:ac1`);
        const netAC2 = find(`${comp.id}:ac2`);
        const netDCP = find(`${comp.id}:dc_pos`);
        const netDCN = find(`${comp.id}:dc_neg`);

        // Phase 1 forward edges: ac1 -> dc_pos, and dc_neg -> ac2
        if (netAC1 !== netDCP) edges.push({ comp, subId: 'd1', netA: netAC1, netB: netDCP, pinA: 'ac1', pinB: 'dc_pos', isDiode: true, vBarrier: 0.7 });
        if (netDCN !== netAC2) edges.push({ comp, subId: 'd2', netA: netDCN, netB: netAC2, pinA: 'dc_neg', pinB: 'ac2', isDiode: true, vBarrier: 0.7 });

        // Phase 2 forward edges: ac2 -> dc_pos, and dc_neg -> ac1
        if (netAC2 !== netDCP) edges.push({ comp, subId: 'd3', netA: netAC2, netB: netDCP, pinA: 'ac2', pinB: 'dc_pos', isDiode: true, vBarrier: 0.7 });
        if (netDCN !== netAC1) edges.push({ comp, subId: 'd4', netA: netDCN, netB: netAC1, pinA: 'dc_neg', pinB: 'ac1', isDiode: true, vBarrier: 0.7 });
      } else if (comp.type === 'wattmeter') {
        const netInP = find(`${comp.id}:in_pos`);
        const netOutP = find(`${comp.id}:out_pos`);
        if (netInP !== netOutP) {
          edges.push({ comp, subId: 'shunt', netA: netInP, netB: netOutP, pinA: 'in_pos', pinB: 'out_pos', resistance: 0.01 });
        }
      } else if (comp.type === 'npn' && comp.state.conducting && !comp.state.burnt) {
        const netC = find(`${comp.id}:c`);
        const netE = find(`${comp.id}:e`);
        const netB = find(`${comp.id}:b`);

        // 1. Collector-to-Emitter Conduction Channel Edge (Low-side switch path)
        if (netC !== netE) {
          edges.push({
            comp,
            subId: 'ce',
            netA: netC,
            netB: netE,
            pinA: 'c',
            pinB: 'e',
            isTransistorChannel: true,
            isDiode: true, // One-way forward conduction: from C into E only!
            vBarrier: 0.20, // Minimum saturation drop V_CE(sat)
            resistance: 0.1
          });
        }
        // 2. Base-to-Emitter Internal Forward-Biased PN Junction Diode Edge
        if (netB !== netE) {
          edges.push({
            comp,
            subId: 'be',
            netA: netB,
            netB: netE,
            pinA: 'b',
            pinB: 'e',
            isTransistorBase: true,
            isDiode: true, // One-way forward conduction: from B into E only!
            vBarrier: 0.70, // Base-emitter PN junction forward barrier V_BE
            resistance: 5.0
          });
        }
      } else if (comp.type === 'pnp' && comp.state.conducting && !comp.state.burnt) {
        const netE = find(`${comp.id}:e`);
        const netC = find(`${comp.id}:c`);
        const netB = find(`${comp.id}:b`);

        // 1. Emitter-to-Collector Conduction Channel Edge (High-side switch path)
        if (netE !== netC) {
          edges.push({
            comp,
            subId: 'ec',
            netA: netE,
            netB: netC,
            pinA: 'e',
            pinB: 'c',
            isTransistorChannel: true,
            isDiode: true, // One-way forward conduction: from E into C only!
            vBarrier: 0.20, // Minimum saturation drop V_EC(sat)
            resistance: 0.1
          });
        }
        // 2. Emitter-to-Base Internal Forward-Biased PN Junction Diode Edge
        if (netE !== netB) {
          edges.push({
            comp,
            subId: 'eb',
            netA: netE,
            netB: netB,
            pinA: 'e',
            pinB: 'b',
            isTransistorBase: true,
            isDiode: true, // One-way forward conduction: from E into B only!
            vBarrier: 0.70, // Emitter-base PN junction forward barrier V_EB
            resistance: 5.0
          });
        }
      } else if (comp.type === 'relay' && !comp.state.burnt) {
        const netC1 = find(`${comp.id}:coil1`);
        const netC2 = find(`${comp.id}:coil2`);
        if (netC1 && netC2 && netC1 !== netC2) {
          edges.push({
            comp,
            subId: 'coil',
            netA: netC1,
            netB: netC2,
            pinA: 'coil1',
            pinB: 'coil2',
            resistance: comp.state.resistance || 70
          });
        }
      } else if (comp.terminals.length === 2) {
        const pinA = comp.terminals[0].id;
        const pinB = comp.terminals[1].id;
        const netA = find(`${comp.id}:${pinA}`);
        const netB = find(`${comp.id}:${pinB}`);

        if (netA !== netB) {
          edges.push({ comp, netA, netB, pinA, pinB });
        }
      }
    }

    // DFS pathfinder helper that strictly respects semiconductor P-N junction polarity:
    // Diodes and LEDs ONLY conduct when current flows forward: from Anode to Cathode!
    const findBranches = (startNet, targetNet) => {
      const branches = [];
      const dfs = (currentNet, destNet, visitedEdges, currentPath) => {
        if (currentNet === destNet) {
          branches.push([...currentPath]);
          return;
        }

        for (const edge of edges) {
          const edgeKey = edge.subId ? `${edge.comp.id}:${edge.subId}` : edge.comp.id;
          if (visitedEdges.has(edgeKey)) continue;

          let fromPin, toPin, nextNet;

          if (edge.netA === currentNet) {
            fromPin = edge.pinA;
            toPin = edge.pinB;
            nextNet = edge.netB;
          } else if (edge.netB === currentNet) {
            fromPin = edge.pinB;
            toPin = edge.pinA;
            nextNet = edge.netA;
          } else {
            continue;
          }

          // A simple conduction path from (+) to (-) must not cycle back into the positive source rail
          if (nextNet === startNet) continue;

          // Semiconductor Diode & LED One-Way Check:
          // In real physics, current can ONLY flow through a diode/LED in the forward direction: Anode -> Cathode!
          if (edge.comp.type === 'led' || edge.comp.type === 'diode') {
            if (fromPin !== 'anode' || toPin !== 'cathode') {
              continue; // Reverse biased: blocks conduction completely!
            }
          }
          if (edge.isDiode) {
            if (fromPin !== edge.pinA || toPin !== edge.pinB) {
              continue; // Rectifier internal diode reverse block
            }
          }

          visitedEdges.add(edgeKey);
          currentPath.push({ edge, fromPin, toPin, nextNet });

          dfs(nextNet, destNet, visitedEdges, currentPath);

          currentPath.pop();
          visitedEdges.delete(edgeKey);
        }
      };

      dfs(startNet, targetNet, new Set(), []);
      return branches;
    };

    // In AC: evaluate Phase 1 (L > N) and Phase 2 (N > L)
    // In DC: evaluate Phase 1 (pos > neg)
    const branchesP1 = findBranches(posRoot, negRoot);
    const branchesP2 = isAC ? findBranches(negRoot, posRoot) : [];

    const allBranches = isAC ? [...branchesP1, ...branchesP2] : branchesP1;

    if (allBranches.length === 0) {
      if (!isAC) {
        // Check if diode/LED was reverse biased in DC to show educational notice
        for (const comp of this.components) {
          if ((comp.type === 'led' || comp.type === 'diode') && !comp.state.burnt) {
            const aNet = find(`${comp.id}:anode`);
            const cNet = find(`${comp.id}:cathode`);
            if (aNet === negRoot && cNet === posRoot) {
              comp.state.reversed = true;
              comp.state.blocked = true;
            }
          }
        }
      }
      return;
    }

    this.status.isComplete = true;
    if (!this.allValidBranches) this.allValidBranches = [];
    this.allValidBranches.push(...allBranches);
    this.lastValidBranches = this.allValidBranches;

    // Track component conduction across Phase 1 and Phase 2
    const p1CompMap = new Map();
    for (const b of branchesP1) {
      for (const step of b) p1CompMap.set(step.edge.comp.id, step);
    }
    const p2CompMap = new Map();
    for (const b of branchesP2) {
      for (const step of b) p2CompMap.set(step.edge.comp.id, step);
    }

    // Classify Operating Regime (DC, AC, Half-Wave Rectified, or Full-Wave Bridge Rectified)
    for (const comp of this.components) {
      if (comp.state.burnt) continue;
      const inP1 = p1CompMap.has(comp.id);
      const inP2 = p2CompMap.has(comp.id);

      if (!inP1 && !inP2) continue;

      if (!isAC) {
        comp.state.rectification = 'dc';
        comp.state.reversed = false;
        comp.state.blocked = false;
      } else {
        if (inP1 && !inP2) {
          // Conducts during positive half-cycle only (e.g. single diode, or LED forward on L->N)
          comp.state.rectification = 'half_wave';
          comp.state.halfWavePhase = 1;
          comp.state.reversed = false;
          comp.state.blocked = false;
        } else if (!inP1 && inP2) {
          // Conducts during negative half-cycle only (e.g. LED forward on N->L)
          comp.state.rectification = 'half_wave';
          comp.state.halfWavePhase = -1;
          comp.state.reversed = false;
          comp.state.blocked = false;
        } else {
          // Conducts in BOTH Phase 1 and Phase 2!
          const s1 = p1CompMap.get(comp.id);
          const s2 = p2CompMap.get(comp.id);
          if (s1.fromPin === s2.fromPin && s1.toPin === s2.toPin) {
            // CURRENT FLOWS IN THE EXACT SAME PIN DIRECTION IN BOTH HALF-CYCLES!
            // Real-life physics hallmark of a FULL-WAVE BRIDGE RECTIFIER (Graetz Bridge)!
            comp.state.rectification = 'full_wave';
          } else {
            // Current alternates direction through the component: Pure AC
            comp.state.rectification = 'ac';
          }
          comp.state.reversed = false;
          comp.state.blocked = false;
        }
      }

      // Check if this load is in parallel with a smoothing capacitor across the rectified output
      comp.state.filteredByCapacitor = false;
      if (comp.terminals && comp.terminals.length >= 2) {
        const net1 = find(`${comp.id}:${comp.terminals[0].id}`);
        const net2 = find(`${comp.id}:${comp.terminals[1].id}`);
        for (const cap of this.components) {
          if ((cap.type === 'capacitor' || cap.type === 'ceramic_capacitor') && !cap.state.burnt) {
            const isCeramic = (cap.type === 'ceramic_capacitor');
            const anNet = isCeramic ? find(`${cap.id}:t1`) : find(`${cap.id}:anode`);
            const catNet = isCeramic ? find(`${cap.id}:t2`) : find(`${cap.id}:cathode`);
            if ((anNet === net1 && catNet === net2) || (anNet === net2 && catNet === net1)) {
              if (comp.state.rectification === 'half_wave' || comp.state.rectification === 'full_wave') {
                const capUf = isCeramic ? (cap.state.capacitanceUf || 0.1) : (cap.state.capacitance || 1000);
                // Real physical distinction between Electrolytic bulk smoothing and Ceramic high-frequency bypass:
                // Rectifier ripple smoothing at 50Hz/100Hz requires bulk capacitance (typically >= 100µF, ideal >= 470µF).
                // Ceramic capacitors (typically <= 1µF) have negligible charge storage over 10ms-20ms mains cycles and cannot bridge low-frequency ripple!
                if (!isCeramic && capUf >= 100) {
                  comp.state.filteredByCapacitor = true;
                  cap.state.filteredRipple = true;
                } else {
                  comp.state.filteredByCapacitor = false;
                  cap.state.filteredRipple = false;
                  cap.state.filterNotice = isCeramic
                    ? `Ceramic capacitor (${cap.state.capacitanceNf || 100}nF) has negligible impedance at RF/MHz, but cannot smooth low-frequency 100Hz ripple (requires bulk Electrolytic ≥ 470µF)!`
                    : `Electrolytic capacitance (${capUf}µF) is too small to bridge 100Hz ripple gaps (≥470µF recommended for smooth DC).`;
                }
                cap.state.powered = true;
                this.status.activeComponents.add(cap.id);
              }
            }
          }
        }
      }
    }

    // Calculate Series & Parallel Voltage and Current Distributions with Semiconductor Physics
    const primaryBranches = branchesP1.length > 0 ? branchesP1 : branchesP2;

    const ps = chainBatteries.find(b => b.type === 'power_supply');
    if (ps) {
      if (ps.state.outputEnabled === false) {
        ps.state.actualVoltage = 0.0;
        ps.state.actualCurrent = 0.0;
        ps.state.current = 0.0;
        ps.state.voltageDrop = 0.0;
        ps.state.power = 0.0;
        ps.state.mode = 'cv';
        ps.state.powered = false;
        for (const branch of primaryBranches) {
          for (const step of branch) {
            const comp = step.edge.comp;
            comp.state.powered = false;
            comp.state.voltageDrop = 0;
            comp.state.current = 0;
            comp.state.power = 0;
            if (comp.type === 'led') comp.state.brightness = 0;
            if (comp.type === 'bulb') comp.state.brightness = 0;
            if (comp.type === 'motor') comp.state.rpm = 0;
            if (comp.type === 'ammeter') {
              comp.state.measuredCurrent = 0;
              comp.state.reading = (comp.state.mode === 'ac' ? '~ ' : '') + '0.000 A';
            }
          }
        }
        return;
      }
    }

    // Pre-calculate branch physical properties (semiconductor threshold, linear resistance, RF/AC impedance)
    const branchProps = primaryBranches.map(branch => {
      let vBarrierTotal = 0;
      let sumR = 0;
      let sumXL = 0;
      let sumXC = 0;

      // Calculate total series internal ESR of powering sources (e.g. CR2032 ESR ~18Ω, Power Supply ~0.02Ω)
      let totalBatteryESR = 0;
      for (const bat of chainBatteries) {
        if (bat.type === 'function_generator') continue; // Dynamically handled below via outputImpedance (50Ω vs Hi-Z)
        const bDef = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[bat.type]) || {};
        const esr = bat.internalR !== undefined ? bat.internalR : (bDef.internalR || (bat.type === 'cell3v' ? 18.0 : (bat.type === 'power_supply' ? 0.02 : (bat.type === 'battery' ? 1.2 : (bat.type === 'cell' ? 0.20 : 0)))));
        totalBatteryESR += esr;
      }
      sumR += totalBatteryESR;

      // Extract dynamic operating frequency and termination from signal source
      let branchFreq = 50.0;
      const fgSource = chainBatteries.find(b => b.type === 'function_generator');
      if (fgSource && fgSource.state.frequency) {
        branchFreq = Math.max(0.1, fgSource.state.frequency);
        const rTerm = (fgSource.state.outputImpedance === 'highz' || fgSource.state.outputImpedance === 'high_z') ? 0.1 : 50.0;
        sumR += rTerm;
      } else {
        const acSource = chainBatteries.find(b => b.type === 'ac_source');
        if (acSource && acSource.state.frequency) branchFreq = acSource.state.frequency;
      }

      for (const step of branch) {
        const comp = step.edge.comp;
        const def = window.COMPONENT_DEFINITIONS[comp.type] || {};

        if (comp.type === 'led') {
          // Physical semiconductor bandgap forward threshold (Planck-Einstein relation: E_g = hc/λ = q·V_F)
          const ledCol = comp.state.color || 'red';
          const vBands = { red: 1.85, orange: 2.00, yellow: 2.10, green: 2.20, blue: 3.10, purple: 3.10, white: 3.15 };
          const vF = comp.state.forwardVoltage || vBands[ledCol] || 2.05;
          vBarrierTotal += vF;
          sumR += 35;
        } else if (comp.type === 'diode') {
          vBarrierTotal += 0.70; // 0.70V silicon barrier
          sumR += 8;
        } else if (step.edge.isTransistorChannel) {
          vBarrierTotal += (step.edge.vBarrier !== undefined ? step.edge.vBarrier : 0.20);
          sumR += (step.edge.resistance !== undefined ? step.edge.resistance : 0.1);
        } else if (step.edge.isTransistorBase) {
          vBarrierTotal += (step.edge.vBarrier !== undefined ? step.edge.vBarrier : 0.70);
          sumR += (step.edge.resistance !== undefined ? step.edge.resistance : 5.0);
        } else if (comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
          const isCeramic = (comp.type === 'ceramic_capacitor');
          const capUf = comp.state.capacitance || (isCeramic ? (comp.state.capacitanceUf || 0.1) : 1000);
          const capFarads = capUf * 1e-6;
          const esr = comp.state.esr || (isCeramic ? 0.010 : (window.getElectrolyticESR ? window.getElectrolyticESR(capUf, comp.state.ratedVoltage) : 0.08));
          const eslNh = comp.state.eslNh || (isCeramic ? 0.9 : 20.0);
          const eslHenries = eslNh * 1e-9;

          if (!isAC) {
            // Steady-state DC Conduction Behavior:
            // Capacitor dielectric blocks direct current completely (I_DC ≈ 0, R_insulation >= 10MΩ)
            const rIns = 1e7;
            comp.state.reactanceXc = Infinity;
            comp.state.reactanceXl = 0;
            comp.state.impedanceZ = rIns;
            comp.state.esr = esr;
            comp.state.dcBlocked = true;
            sumR += rIns;
          } else {
            // AC / High-Frequency Conduction Behavior:
            // X_C = 1 / (2*pi*f*C), Z = sqrt(ESR² + (Xc - Xl)²)
            const f = Math.max(0.1, branchFreq || 50);
            const xc = 1.0 / (2 * Math.PI * f * Math.max(1e-15, capFarads));
            const xl = 2 * Math.PI * f * eslHenries;
            const z = Math.sqrt(esr * esr + Math.pow(xc - xl, 2));

            comp.state.reactanceXc = xc;
            comp.state.reactanceXl = xl;
            comp.state.impedanceZ = z;
            comp.state.esr = esr;
            comp.state.dcBlocked = false;
            sumR += esr;
            sumXC += Math.max(0, xc - xl);
          }

          // Precompute theoretical Self-Resonant Frequency (SRF = 1 / (2*pi*sqrt(ESL*C)))
          comp.state.srfHz = 1 / (2 * Math.PI * Math.sqrt(eslHenries * Math.max(1e-15, capFarads)));
          comp.state.srfMhz = comp.state.srfHz / 1e6;
        } else if (comp.type === 'inductor') {
          // Real Electrical Inductor (Faraday & Lenz):
          // In DC: reacts as small DC winding resistance (R_DCR: typically 0.05Ω to 3.2Ω)
          // In AC: inductive reactance X_L = 2*pi*f*L, impedance Z = sqrt(R_DCR^2 + X_L^2)
          const f = isAC ? branchFreq : 0.0;
          const indMh = comp.state.inductanceMh || (comp.state.inductanceUh ? comp.state.inductanceUh / 1000 : 10);
          const indHenries = indMh * 1e-3;
          const xl = 2 * Math.PI * f * indHenries;
          const dcr = comp.state.dcr || def.resistance || 0.8;
          const zInd = Math.sqrt(dcr * dcr + xl * xl);
          comp.state.reactanceXl = xl;
          comp.state.impedanceZ = zInd;
          sumR += dcr;
          sumXL += xl;
        } else if (comp.type === 'transformer') {
          const secV = comp.state.secondaryV || 12.0;
          const priV = comp.state.primaryV || 230.0;
          const ratio = priV / Math.max(1, secV);
          const secI = comp.state.secondaryCurrent || comp.state.current || 0;
          if (secI > 0) {
            const secR = secV / secI;
            sumR += Math.max(10, Math.round(ratio * ratio * secR));
          } else {
            sumR += 46000;
          }
        } else if (comp.type === 'oscilloscope') {
          sumR += (step.edge.resistance !== undefined ? step.edge.resistance : (comp.state.internalR !== undefined ? comp.state.internalR : 1000000.0));
        } else {
          let r = 50;
          if (step.edge.resistance !== undefined) {
            r = step.edge.resistance;
          } else if (comp.state.resistance !== undefined) {
            r = comp.state.resistance;
          } else if (def.resistance !== undefined) {
            r = def.resistance;
          } else if (comp.type === 'ammeter') {
            r = 0.01;
          }
          sumR += r;
        }
      }

      // True AC Phasor Impedance Magnitude: Z = sqrt(sumR² + (sumXL - sumXC)²)
      const xNet = sumXL - sumXC;
      const zMag = Math.sqrt(sumR * sumR + xNet * xNet);
      let totalLinearR = isAC ? zMag : sumR;

      // Bench power supplies can safely supply dead shorts or 0.01Ω shunts down to milliohms
      const minR = ps ? 0.01 : 0.5;
      totalLinearR = Math.max(minR, totalLinearR);

      // Check transistor active region limit
      const transChannelStep = branch.find(s => s.edge.isTransistorChannel);
      let icMax = undefined;
      if (transChannelStep) {
        const tComp = transChannelStep.edge.comp;
        const ib = tComp.state.baseCurrent || 0;
        const beta = tComp.state.beta || 100;
        icMax = beta * ib;
      }

      return {
        branch,
        vBarrierTotal,
        totalLinearR,
        transChannelStep,
        icMax
      };
    });

    // Automatic Constant Voltage (CV) vs Constant Current (CC) Cross-Over Regulation
    let vRegulated = totalVoltage;
    if (ps) {
      const vSet = (ps.state.voltage !== undefined ? ps.state.voltage : 12.0);
      const iLim = (ps.state.currentLimit !== undefined ? ps.state.currentLimit : 2.50);

      const calcBranchI = (bp, v) => {
        if (v <= bp.vBarrierTotal) return 0;
        let i = (v - bp.vBarrierTotal) / bp.totalLinearR;
        if (bp.icMax !== undefined) i = Math.min(i, bp.icMax);
        return i;
      };

      const calcTotalI = (v) => {
        let sum = 0;
        for (const bp of branchProps) sum += calcBranchI(bp, v);
        return sum;
      };

      const prospectiveTotalI = calcTotalI(vSet);

      if (prospectiveTotalI > iLim && iLim > 0) {
        // Constant Current (CC) Mode: dynamic feedback voltage foldback
        ps.state.mode = 'cc';
        let lowV = 0.0;
        let highV = vSet;
        for (let iter = 0; iter < 24; iter++) {
          const midV = (lowV + highV) / 2;
          if (calcTotalI(midV) < iLim) {
            lowV = midV;
          } else {
            highV = midV;
          }
        }
        vRegulated = (lowV + highV) / 2;
        ps.state.actualVoltage = vRegulated;
        ps.state.actualCurrent = iLim;
        ps.state.current = iLim;
        ps.state.voltageDrop = vRegulated;
        ps.state.power = vRegulated * iLim;
        ps.state.powered = true;
      } else {
        // Constant Voltage (CV) Mode
        ps.state.mode = 'cv';
        vRegulated = vSet;
        ps.state.actualVoltage = vSet;
        ps.state.actualCurrent = prospectiveTotalI;
        ps.state.current = prospectiveTotalI;
        ps.state.voltageDrop = vSet;
        ps.state.power = vSet * prospectiveTotalI;
        ps.state.powered = true;
      }
    }

    for (const bp of branchProps) {
      const branch = bp.branch;
      const vBarrierTotal = bp.vBarrierTotal;
      const totalLinearR = bp.totalLinearR;

      const effectiveBranchV = ps ? vRegulated : totalVoltage;

      // In AC: totalVoltage is V_rms, Peak is V_peak = V_rms * 1.4142
      const vPeak = isAC ? (effectiveBranchV * 1.4142) : effectiveBranchV;

      if (vPeak <= vBarrierTotal) {
        for (const step of branch) {
          const comp = step.edge.comp;
          comp.state.powered = false;
          comp.state.voltageDrop = 0;
          comp.state.current = 0;
          comp.state.power = 0;
          if (comp.type === 'led') comp.state.brightness = 0;
        }
        continue;
      }

      // Check if this passive/load branch is shunted by a parallel conducting transistor path to Ground (RTL Logic)
      const transChannelStep = bp.transChannelStep;
      if (!transChannelStep) {
        let isShunted = false;
        let shuntCutoffIndex = -1;

        for (let i = 0; i < branch.length - 1; i++) {
          const intermediateNet = branch[i].nextNet;
          if (intermediateNet === negRoot) continue;

          for (const t of this.components) {
            if (t.state.burnt || !t.state.conducting) continue;
            if (t.type === 'npn') {
              const cNet = find(`${t.id}:c`);
              const eNet = find(`${t.id}:e`);
              if (cNet === intermediateNet) {
                let reachesNeg = (eNet === negRoot);
                let vClamp = (t.state.operatingRegime === 'saturation' ? 0.20 : (t.state.vce || 0.20));

                if (!reachesNeg) {
                  // Check series pull-down transistor chain (e.g. discrete NAND logic)
                  const t2 = this.components.find(o => o.id !== t.id && o.type === 'npn' && o.state.conducting && !o.state.burnt && find(`${o.id}:c`) === eNet && find(`${o.id}:e`) === negRoot);
                  if (t2) {
                    reachesNeg = true;
                    vClamp += (t2.state.operatingRegime === 'saturation' ? 0.20 : (t2.state.vce || 0.20));
                  }
                }

                if (reachesNeg) {
                  // Calculate barrier voltage of downstream load sub-branch from intermediateNet to Ground
                  let downstreamBarrier = 0;
                  for (let j = i + 1; j < branch.length; j++) {
                    const cComp = branch[j].edge.comp;
                    if (cComp.type === 'led') {
                      const col = cComp.state.color || 'red';
                      const vBands = { red: 1.85, orange: 2.00, yellow: 2.10, green: 2.20, blue: 3.10, purple: 3.10, white: 3.15 };
                      downstreamBarrier += (cComp.state.forwardVoltage || vBands[col] || 2.05);
                    } else if (cComp.type === 'diode') {
                      downstreamBarrier += 0.70;
                    }
                  }

                  if (downstreamBarrier > vClamp) {
                    isShunted = true;
                    shuntCutoffIndex = i + 1;
                    break;
                  }
                }
              }
            }
          }
          if (isShunted) break;
        }

        if (isShunted && shuntCutoffIndex >= 0) {
          // Clamped by active transistor: zero out downstream load components
          for (let k = shuntCutoffIndex; k < branch.length; k++) {
            const comp = branch[k].edge.comp;
            comp.state.powered = false;
            comp.state.voltageDrop = 0;
            comp.state.current = 0;
            comp.state.power = 0;
            if (comp.type === 'led') comp.state.brightness = 0;
          }
          continue;
        }
      }

      // Peak branch current: I_pk = (V_pk - V_barrier) / R_linear
      let iPeak = (vPeak - vBarrierTotal) / totalLinearR;

      // Check if this branch contains a transistor collector-emitter channel
      let transVceActive = 0.20;

      if (transChannelStep) {
        const tComp = transChannelStep.edge.comp;
        const ib = tComp.state.baseCurrent || 0;
        const beta = tComp.state.beta || 100;
        const icMax = beta * ib;
        const icSat = iPeak;

        if (icMax >= icSat) {
          // Saturation region: Base current is high enough that collector current reaches the external circuit load limit (I_C(sat) ≈ V_CC / R_load)
          // The voltage across collector and emitter drops to minimum V_CE(sat) ≈ 0.2V
          tComp.state.operatingRegime = 'saturation';
          tComp.state.conducting = true;
          tComp.state.collectorCurrent = icSat;
          tComp.state.voltageDrop = 0.20;
          if (tComp.type === 'npn') tComp.state.vce = 0.20;
          else tComp.state.vec = 0.20;
        } else {
          // Active Region (Linear Amplifier): I_C = β * I_B
          // Base-emitter forward biased, small variations in I_B produce amplified swings in I_C
          tComp.state.operatingRegime = 'active';
          tComp.state.conducting = true;
          tComp.state.collectorCurrent = icMax;
          iPeak = icMax; // Throttle branch current to I_C = β * I_B!

          // Deduct external loads voltage from total voltage to find V_CE
          let externalLoadsVDrop = 0;
          for (const s of branch) {
            if (s.edge.isTransistorChannel) continue;
            if (s.edge.comp.type === 'led') {
              const ledCol = s.edge.comp.state.color || 'red';
              const vBands = { red: 1.85, orange: 2.00, yellow: 2.10, green: 2.20, blue: 3.10, purple: 3.10, white: 3.15 };
              const vF = s.edge.comp.state.forwardVoltage || vBands[ledCol] || 2.05;
              externalLoadsVDrop += (vF + icMax * 35);
            }
            else if (s.edge.comp.type === 'diode') externalLoadsVDrop += (0.70 + icMax * 8);
            else {
              const loadR = s.edge.resistance !== undefined ? s.edge.resistance : (s.edge.comp.state.resistance !== undefined ? s.edge.comp.state.resistance : 50);
              externalLoadsVDrop += icMax * loadR;
            }
          }
          transVceActive = Math.max(0.20, vPeak - externalLoadsVDrop);
          tComp.state.voltageDrop = transVceActive;
          if (tComp.type === 'npn') tComp.state.vce = transVceActive;
          else tComp.state.vec = transVceActive;
        }
        tComp.state.current = tComp.state.collectorCurrent;
        tComp.state.emitterCurrent = tComp.state.collectorCurrent + (tComp.state.baseCurrent || 0);
        tComp.state.power = tComp.state.voltageDrop * tComp.state.collectorCurrent + 0.70 * (tComp.state.baseCurrent || 0);
        tComp.state.powered = true;
        this.status.activeComponents.add(tComp.id);
      }

      // Check if this branch is the transistor Base-Emitter driving branch
      const transBaseStep = branch.find(s => s.edge.isTransistorBase);
      if (transBaseStep) {
        const tComp = transBaseStep.edge.comp;
        const finalIb = (tComp.state.theveninIb !== undefined) ? tComp.state.theveninIb : iPeak;
        tComp.state.baseCurrent = finalIb;
        if (tComp.type === 'npn') tComp.state.vbe = 0.70;
        else tComp.state.veb = 0.70;
        tComp.state.emitterCurrent = (tComp.state.collectorCurrent || 0) + finalIb;
        tComp.state.powered = true;
        this.status.activeComponents.add(tComp.id);
      }

      for (const step of branch) {
        const comp = step.edge.comp;
        const def = window.COMPONENT_DEFINITIONS[comp.type] || {};
        const rect = comp.state.rectification || (isAC ? 'ac' : 'dc');

        // Effective RMS current and Average DC voltage
        let effCurrent = iPeak;
        let vdcAvg = 0;
        let vPeakComp = 0;

        if (comp.state.filteredByCapacitor) {
          // With capacitor filter: continuous DC conduction with minimal ripple!
          effCurrent = 0.92 * iPeak;
          comp.state.rippleFreq = 0;
        } else if (rect === 'half_wave') {
          // Half-wave: conducts for 180° (50% duty cycle)
          effCurrent = 0.5 * iPeak;
          comp.state.rippleFreq = 50;
        } else if (rect === 'full_wave') {
          // Full-wave: conducts for 360° (both half cycles, 2x ripple frequency)
          effCurrent = 0.7071 * iPeak;
          comp.state.rippleFreq = 100;
        } else if (rect === 'ac') {
          const fg = chainBatteries.find(b => b.type === 'function_generator');
          const wave = fg ? (fg.state.waveform || 'sine') : 'sine';
          if (wave === 'square') {
            effCurrent = iPeak;
          } else if (wave === 'triangle' || wave === 'ramp') {
            effCurrent = iPeak / Math.sqrt(3);
          } else if (wave === 'dc') {
            effCurrent = iPeak;
          } else {
            effCurrent = 0.7071 * iPeak;
          }
          comp.state.rippleFreq = (fg && fg.state.frequency) ? fg.state.frequency : 50;
        } else {
          // DC
          effCurrent = iPeak;
          comp.state.rippleFreq = 0;
        }

        let vDrop = 0;
        if (step.edge.isTransistorChannel) {
          vDrop = comp.state.voltageDrop || 0.20;
          vPeakComp = vDrop;
        } else if (step.edge.isTransistorBase) {
          vDrop = 0.70;
          vPeakComp = 0.70;
        } else if (comp.type === 'led') {
          const ledCol = comp.state.color || 'red';
          const vBands = { red: 1.85, orange: 2.00, yellow: 2.10, green: 2.20, blue: 3.10, purple: 3.10, white: 3.15 };
          const vF = comp.state.forwardVoltage || vBands[ledCol] || 2.05;
          vDrop = Math.min(effectiveBranchV, vF + effCurrent * 35);
          vPeakComp = Math.min(vPeak, vF + iPeak * 35);
        } else if (comp.type === 'diode') {
          vDrop = Math.min(effectiveBranchV, 0.70 + effCurrent * 8);
          vPeakComp = Math.min(vPeak, 0.70 + iPeak * 8);
        } else if (comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
          if (!isAC) {
            vDrop = effectiveBranchV;
            vPeakComp = effectiveBranchV;
          } else {
            const zc = comp.state.impedanceZ || (1.0 / (2 * Math.PI * (branchFreq || 50) * Math.max(1e-15, (comp.state.capacitance || 1000) * 1e-6)));
            vDrop = effCurrent * zc;
            vPeakComp = iPeak * zc;
          }
          comp.state.voltageDrop = vDrop;
          comp.state.peakVoltage = vPeakComp;
          comp.state.current = effCurrent;
          comp.state.power = effCurrent * effCurrent * (comp.state.esr || 0.01);
        } else if (comp.type === 'inductor') {
          const z = comp.state.impedanceZ || comp.state.dcr || def.resistance || 0.8;
          vDrop = effCurrent * z;
          vPeakComp = iPeak * z;
          comp.state.voltageDrop = vDrop;
          comp.state.peakVoltage = vPeakComp;
          const indHenries = (comp.state.inductanceMh || 10) * 1e-3;
          comp.state.storedEnergy = 0.5 * indHenries * (effCurrent * effCurrent);
          comp.state.magneticFlux = indHenries * effCurrent;
        } else {
          let r = 50;
          if (step.edge.resistance !== undefined) {
            r = step.edge.resistance;
          } else if (comp.state.resistance !== undefined) {
            r = comp.state.resistance;
          } else if (def.resistance !== undefined) {
            r = def.resistance;
          } else if (comp.type === 'ammeter') {
            r = 0.01;
          }
          vDrop = effCurrent * r;
          vPeakComp = iPeak * r;
          comp.state.voltageDrop = vDrop;
          comp.state.peakVoltage = vPeakComp;
        }

        // Calculate average DC voltage (measured by DC voltmeter in real life)
        if (comp.state.filteredByCapacitor) {
          const capComp = this.components.find(c => c.type === 'capacitor' && !c.state.burnt);
          const cUf = (capComp && capComp.state.capacitance) || 1000;
          const fRipple = (rect === 'full_wave') ? 100 : 50;
          const cFarads = cUf * 1e-6;
          const vRipple = Math.min(vPeakComp * 0.85, (effCurrent || 0.05) / (fRipple * cFarads));
          comp.state.vRipple = vRipple;
          comp.state.ripplePercent = Math.min(100, (vRipple / Math.max(0.1, vPeakComp)) * 100);
          vdcAvg = Math.max(0, vPeakComp - (vRipple / 2)); // Filter capacitor maintains DC voltage near peak minus half-ripple!
        } else if (rect === 'half_wave') {
          vdcAvg = vPeakComp / Math.PI; // V_dc = V_pk / π ≈ 0.318 * V_pk
        } else if (rect === 'full_wave') {
          vdcAvg = (2 * vPeakComp) / Math.PI; // V_dc = 2 * V_pk / π ≈ 0.636 * V_pk
        } else if (rect === 'dc') {
          vdcAvg = vDrop;
        } else {
          vdcAvg = 0; // Pure AC has zero DC average
        }

        // Update parallel capacitor's stored voltage in both DC and rectified AC circuits
        const net1 = find(`${comp.id}:${comp.terminals[0].id}`);
        const net2 = find(`${comp.id}:${comp.terminals[1].id}`);
        for (const cap of this.components) {
          if (cap.state.burnt) continue;
          // If this capacitor is currently acting as the discharging power source for this circuit, do not recharge it!
          if (chainBatteries && chainBatteries.some(b => b.id === cap.id)) continue;
          if (cap.type === 'capacitor') {
            const anNet = find(`${cap.id}:anode`);
            const catNet = find(`${cap.id}:cathode`);
            if (anNet === net1 && catNet === net2) {
              const appliedV = comp.state.filteredByCapacitor ? vPeakComp : vDrop;
              const maxV = cap.state.ratedVoltage || cap.state.maxVoltage || 16.0;
              cap.state.powered = true;
              cap.state.voltageDrop = appliedV;
              cap.state.storedVoltage = Math.min(maxV, appliedV);
              cap.state.chargePercent = Math.min(100, Math.round((cap.state.storedVoltage / maxV) * 100));
              this.status.activeComponents.add(cap.id);
            } else if (anNet === net2 && catNet === net1 && !isAC) {
              // Reverse polarity in DC!
              cap.state.powered = true;
              cap.state.reversed = true;
              cap.state.voltageDrop = vDrop;
              const def = window.COMPONENT_DEFINITIONS['capacitor'] || {};
              this.evaluateComponentSafety(cap, def, vDrop, 1.0, 10, effectiveBranchV, chainBatteries);
            }
          } else if (cap.type === 'ceramic_capacitor') {
            const t1Net = find(`${cap.id}:t1`);
            const t2Net = find(`${cap.id}:t2`);
            if ((t1Net === net1 && t2Net === net2) || (t1Net === net2 && t2Net === net1)) {
              const appliedV = comp.state.filteredByCapacitor ? vPeakComp : vDrop;
              const maxV = cap.state.ratedVoltage || cap.state.maxVoltage || 50.0;
              cap.state.powered = true;
              cap.state.voltageDrop = appliedV;
              cap.state.storedVoltage = Math.min(maxV, appliedV);
              cap.state.chargePercent = Math.min(100, Math.round((cap.state.storedVoltage / maxV) * 100));
              this.status.activeComponents.add(cap.id);
            }
          }
        }

        const isLedConducting = (comp.type === 'led') ? (effCurrent >= 0.0004) : true;

        if (isLedConducting) {
          comp.state.powered = true;
          if (step.edge.isTransistorBase) {
            // Transistor base branch: only records base current and V_be/V_eb,
            // preserving collector-emitter voltageDrop (V_ce/V_ec) and collector current!
            if (comp.type === 'npn') comp.state.vbe = 0.70;
            else comp.state.veb = 0.70;
            const finalIb = (comp.state.theveninIb !== undefined) ? comp.state.theveninIb : effCurrent;
            comp.state.baseCurrent = finalIb;
            comp.state.emitterCurrent = (comp.state.collectorCurrent || 0) + finalIb;
            this.status.activeComponents.add(comp.id);
          } else {
            comp.state.voltageDrop = vDrop;
            comp.state.vPeak = vPeakComp;
            comp.state.vdcAvg = vdcAvg;
            comp.state.vrmsEff = vDrop;
            comp.state.current = effCurrent;
            comp.state.power = vDrop * effCurrent;
            this.status.activeComponents.add(comp.id);
          }

          if (comp.type === 'motor') {
            comp.state.direction = (step.fromPin === 'pin1') ? 'cw' : 'ccw';
            // DC Motor: static commutator brush friction requires minimum ~0.55V to start turning
            if (vDrop < 0.55 || effCurrent < 0.012) {
              comp.state.rpm = 0;
            } else {
              // Back-EMF & electromagnetic torque dynamic RPM model:
              // Direct 9V gives ~14,800 RPM (increased slightly).
              // DC motor speed dynamically responds to external circuit series resistance:
              const totalBranchR = bp.totalLinearR || 40;
              const motorR = comp.state.resistance || 40;
              const rSeries = Math.max(0, totalBranchR - motorR);
              const rDamping = motorR / (motorR + rSeries * 0.40);
              const rawRpm = (vDrop - 0.35) * 1750 * Math.pow(rDamping, 0.25);
              comp.state.rpm = Math.min(24000, Math.max(0, Math.round(rawRpm)));
            }
          } else if (comp.type === 'relay') {
            comp.state.coilVoltage = Math.max(comp.state.coilVoltage || 0, vDrop);
            comp.state.coilCurrent = Math.max(comp.state.coilCurrent || 0, effCurrent);
            comp.state.power = comp.state.coilVoltage * comp.state.coilCurrent;
            // 5V Relay pick-up threshold: pull-in voltage >= 3.5V and excitation current >= 25mA
            if (comp.state.coilVoltage >= 3.50 && comp.state.coilCurrent >= 0.025) {
              comp.state.energized = true;
            } else {
              comp.state.energized = false;
            }
            // Over-voltage burnout protection (rated 5V coil, safe on 5V-9V DC supply, burnt if > 12.0V sustained overvoltage)
            if (vDrop > 12.0 && !comp.state.burnt) {
              comp.state.burnt = true;
              comp.state.burning = true;
              comp.state.energized = false;
              comp.state.burnReason = `Relay Coil Burnout! Sustained coil voltage (${vDrop.toFixed(1)}V) exceeded 5V maximum rating. Electromagnet winding insulation overheated and melted!`;
              this.status.failedComponents.push(comp.id);
              this.status.circuitFailed = true;
              if (window.sounds && window.sounds.playExplosion) window.sounds.playExplosion();
            }
          } else if (comp.type === 'bulb') {
            // Incandescent Tungsten Filament Physics:
            // Stefan-Boltzmann / Joule Power: P = V · I (Nominal for 9V E10 miniature lamp: 9.0V × 0.20A = 1.80W)
            const pwr = vDrop * effCurrent;
            if (vDrop < 0.35 || pwr < 0.001) {
              comp.state.brightness = 0;
              comp.state.filamentTemp = 25;
              comp.state.envelopeTemp = 25;
              comp.state.temperature = 25;
            } else {
              const pwrRatio = pwr / 1.75;
              // Human eye perceived lightness curve (Stevens' power law / CIE L*): L ∝ (P/P0)^0.55
              // Enables visible dimming across all standard resistor values (10Ω up to 1000Ω)
              const baseB = Math.min(2.2, Math.pow(Math.max(0, pwrRatio), 0.55));
              comp.state.brightness = (rect === 'half_wave') ? (baseB * 0.70) : baseB;
              const filTemp = Math.min(2800, Math.round(25 + 2475 * Math.pow(Math.min(1.5, Math.max(0, pwrRatio)), 0.25)));
              const envTemp = Math.min(85, Math.round(25 + pwr * 28));
              comp.state.filamentTemp = filTemp;
              comp.state.envelopeTemp = envTemp;
              comp.state.temperature = envTemp;
            }
          } else if (comp.type === 'led') {
            // LED: emits light above microscopic forward threshold (~0.1mA = 0.0001A)
            // Nominal forward current: 20mA = 0.020A
            if (effCurrent < 0.0001) {
              comp.state.brightness = 0;
            } else {
              const normI = effCurrent / 0.020;
              // Luminous intensity scaling with human eye perception:
              const baseBright = Math.min(2.2, Math.max(0.015, Math.pow(normI, 0.70)));
              comp.state.brightness = baseBright;
            }
          } else if (comp.type === 'buzzer') {
            // Piezoelectric Buzzer: diaphragm begins oscillating above ~0.70V
            comp.state.sounding = (vDrop >= 0.70 && effCurrent >= 0.005);
            comp.state.soundVolume = Math.min(1.0, Math.max(0, (vDrop - 0.50) / 8.50));
            comp.state.frequency = Math.min(2200, Math.max(260, Math.round(320 + (vDrop / 9.0) * 780)));
          } else if (comp.type === 'solenoid') {
            // Electromagnetism: B = μ·n·I (Ampere's law in solenoid)
            comp.state.magneticFieldB = effCurrent * 12.57; // in mT
            comp.state.pullForce = Math.min(45, Math.pow(effCurrent, 2) * 32); // in Newtons
            comp.state.armPosition = effCurrent > 0.02 ? 1.0 : 0.0;
          } else if (comp.type === 'potentiometer') {
            const totalR = comp.state.totalResistance || 1000;
            const ratio = comp.state.wiperRatio !== undefined ? comp.state.wiperRatio : (comp.state.resistance !== undefined ? comp.state.resistance / totalR : 0.5);
            const r1 = Math.max(0.5, Math.round((1 - ratio) * totalR));
            const r2 = Math.max(0.5, Math.round(ratio * totalR));
            comp.state.r1 = r1;
            comp.state.r2 = r2;
            comp.state.totalResistance = totalR;

            const net1 = find(`${comp.id}:pin1`);
            const netW = find(`${comp.id}:wiper`);
            const net2 = find(`${comp.id}:pin2`);
            const v1 = this.getNetTheveninVoltage(net1, new Set([posRoot]), new Set([negRoot]), totalVoltage, find);
            const v2 = this.getNetTheveninVoltage(net2, new Set([posRoot]), new Set([negRoot]), totalVoltage, find);
            const vW = this.getNetTheveninVoltage(netW, new Set([posRoot]), new Set([negRoot]), totalVoltage, find);

            // Output voltage Vout = Vin · (R2 / (R1 + R2))
            const vTrack = Math.abs(v1 - v2);
            if (vTrack > 0.01) {
              comp.state.wiperVoltage = Math.min(vTrack, Math.max(0, vW - Math.min(v1, v2)));
              comp.state.voltageDrop = vTrack;
            } else {
              comp.state.wiperVoltage = vW;
              comp.state.voltageDrop = Math.max(vDrop, Math.abs(v1 - vW) || Math.abs(vW - v2));
            }
          } else if (comp.type === 'wattmeter') {
            const netInP = find(`${comp.id}:in_pos`);
            const netInN = find(`${comp.id}:in_neg`);
            const vInP = this.getNetTheveninVoltage(netInP, new Set([posRoot]), new Set([negRoot]), totalVoltage, find);
            const vInN = this.getNetTheveninVoltage(netInN, new Set([posRoot]), new Set([negRoot]), totalVoltage, find);
            const lineV = Math.abs(vInP - vInN) || totalVoltage;
            comp.state.voltage = lineV;
            comp.state.current = effCurrent;
            comp.state.power = lineV * effCurrent;
          } else if (comp.type === 'ammeter') {
            const isACMode = (comp.state.mode === 'ac');
            const isSignalAC = (isAC || rect === 'ac');
            comp.state.isAcInput = isSignalAC;

            // Check if this ammeter is connected directly across power rails with no series load in its branch
            const otherLoadsInBranch = branch.filter(s => {
              const c = s.edge.comp;
              return c && c.id !== comp.id && c.type !== 'switch' && c.type !== 'pushbutton' && c.type !== 'twowayswitch' && c.type !== 'fuse';
            });
            comp.state.isDirectParallel = (otherLoadsInBranch.length === 0);

            // Determine direction of current flow through terminals
            // pin_pos is positive terminal (red), pin_neg is negative terminal (black)
            // In conventional flow, current enters pin_pos and exits pin_neg (+ polarity).
            // If current enters pin_neg and exits pin_pos, it's reversed (- polarity).
            const isReversed = (step.fromPin === 'pin_neg' || step.toPin === 'pin_pos');
            comp.state.reversed = !isSignalAC && isReversed;

            // Shunt resistance burden voltage & power
            const rShunt = comp.state.shuntResistance || 0.01;
            const vBurden = effCurrent * rShunt;
            const pShunt = effCurrent * effCurrent * rShunt;
            comp.state.voltageDrop = vBurden;
            comp.state.burdenVoltage = vBurden;
            comp.state.power = pShunt;
            comp.state.current = effCurrent;

            if (isACMode) {
              if (isSignalAC) {
                // True RMS AC measurement
                comp.state.measuredCurrent = effCurrent;
                comp.state.reading = '~ ' + (effCurrent >= 1 ? effCurrent.toFixed(3) + ' A' : (effCurrent * 1000).toFixed(1) + ' mA');
                comp.state.modeWarning = '';
              } else {
                // AC mode exposed to pure DC: internal capacitive coupling blocks DC bias!
                comp.state.measuredCurrent = 0;
                comp.state.reading = '~ 0.000 A';
                comp.state.modeWarning = 'AC Mode on DC Signal (Internal capacitive coupling blocks steady DC). Switch to DC Mode (⎓)!';
              }
            } else {
              // DC Mode
              if (isSignalAC) {
                // DC meter movement / dual-slope converter averages sinusoidal current to 0 over cycle!
                comp.state.measuredCurrent = 0;
                comp.state.reading = '0.000 A';
                comp.state.modeWarning = 'DC Mode on AC Signal (Time-average sinusoidal current = 0.00A). Switch to AC Mode (~) to measure RMS!';
              } else {
                // DC current measurement with polarity indication
                const signedCurrent = comp.state.reversed ? -effCurrent : effCurrent;
                comp.state.measuredCurrent = signedCurrent;
                const absI = effCurrent;
                const prefix = comp.state.reversed ? '-' : '';
                comp.state.reading = prefix + (absI >= 1 ? absI.toFixed(3) + ' A' : (absI * 1000).toFixed(1) + ' mA');
                comp.state.modeWarning = comp.state.reversed ? 'Reverse Polarity: Current entering Negative (−) post. Reading is negative!' : '';
              }
            }
          } else if (comp.type === 'voltmeter') {
            const hasWireP = isPinWired(comp.id, 'pin_pos');
            const hasWireN = isPinWired(comp.id, 'pin_neg');
            comp.state.measuredVoltage = (hasWireP && hasWireN) ? vDrop : 0;
            comp.state.powered = (hasWireP && hasWireN && vDrop > 0.01);
          } else if (comp.type === 'fuse') {
            comp.state.current = effCurrent;
            comp.state.voltageDrop = vDrop;
            const rating = comp.state.ratingAmps !== undefined ? comp.state.ratingAmps : (comp.state.rating !== undefined ? comp.state.rating : 2.0);
            if (effCurrent > rating && !comp.state.blown && !comp.state.burnt) {
              comp.state.blown = true;
              comp.state.burnt = true;
              comp.state.burning = true;
              const curStr = effCurrent >= 1 ? effCurrent.toFixed(2) + 'A' : (effCurrent * 1000).toFixed(0) + 'mA';
              comp.state.burnReason = `Protective Fuse Blown! Current (${curStr}) exceeded safety rating (${rating.toFixed(1)}A). Circuit opened to protect components!`;
              comp.state.crying = true;
              if (window.sounds && window.sounds.playExplosion) {
                window.sounds.playExplosion();
              }
            }
          }

          // Joule's Law: P = V * I & Real Component Heat Dissipation Physics
          const powerW = vDrop * effCurrent;
          comp.state.power = powerW;
          comp.state.jouleHeatRate = powerW;

          if (comp.type === 'motor') {
            // DC Motor Physics:
            // Total electrical power = V * I.
            // Electromechanical conversion produces shaft rotation: P_mech = E_back * I.
            // ONLY the internal armature winding resistance (copper loss) generates heat: P_heat = I^2 * R_armature.
            const rArmature = 2.5; // internal winding resistance (ohms)
            const pHeat = effCurrent * effCurrent * rArmature;
            comp.state.heatPower = pHeat;
            comp.state.jouleHeatRate = pHeat;
            // Free running motor: barely warms above ambient (~26°C - 35°C).
            // Stalled motor (0 RPM): E_back collapses to 0, massive current surge heats copper windings (>120°C).
            const isStalled = (comp.state.rpm === 0 && effCurrent > 0.8);
            comp.state.temperature = 25.0 + Math.min(150, isStalled ? (powerW * 15.0) : (pHeat * 25.0));
            comp.state.overheated = (vDrop > (def.maxVoltage || 12.0)) || isStalled;
          } else if (comp.type === 'bulb') {
            // Incandescent Tungsten Filament:
            // Filament incandescence (2,000°C–2,500°C) is normal blackbody emission.
            // Glass envelope warms up to ~45°C–75°C.
            // Bulb NEVER overheats under normal operating voltage!
            comp.state.overheated = (vDrop > (def.maxVoltage || 14.5));
          } else if (comp.type === 'led') {
            // LED: microscopic semiconductor die.
            // Normal forward current (15–20mA): dissipates ~40mW, stays cool (28°C–32°C).
            const pDie = vDrop * effCurrent;
            comp.state.temperature = 25.0 + Math.min(150, pDie * 120.0);
            comp.state.overheated = (effCurrent > (def.maxCurrent || 0.035)) || (vDrop > (def.maxVoltage || 3.3));
          } else if (comp.type === 'resistor') {
            // Fixed Resistor: P = I^2 * R = V^2 / R.
            // Thermal rise deltaT = P * R_th (R_th ~ 65°C/W).
            const pRated = def.maxPower || 1.2;
            comp.state.temperature = 25.0 + Math.min(220, powerW * 65.0);
            // Overheated only if power exceeds safe rating by >20%
            comp.state.overheated = (powerW > pRated * 1.2);
          } else if (comp.type === 'potentiometer') {
            const pRated = def.maxPower || 2.0;
            comp.state.temperature = 25.0 + Math.min(200, powerW * 40.0);
            comp.state.overheated = (powerW > pRated * 1.2);
          } else if (comp.type === 'diode') {
            comp.state.temperature = 25.0 + Math.min(150, powerW * 45.0);
            comp.state.overheated = (effCurrent > (def.maxCurrent || 1.0));
          } else if (comp.type === 'rectifier') {
            comp.state.temperature = 25.0 + Math.min(150, powerW * 40.0);
            comp.state.overheated = (effCurrent > (def.maxCurrent || 1.5));
          } else if (comp.type === 'inductor') {
            // Inductor DC heat is strictly copper DCR loss: P = I^2 * R_DCR
            const dcr = comp.state.dcr || 0.8;
            const pDcr = effCurrent * effCurrent * dcr;
            comp.state.heatPower = pDcr;
            comp.state.temperature = 25.0 + Math.min(140, pDcr * 35.0);
            comp.state.overheated = (effCurrent > (comp.state.isat || def.maxCurrent || 3.5));
          } else if (comp.type === 'solenoid') {
            const pCoil = effCurrent * effCurrent * 20.0;
            comp.state.heatPower = pCoil;
            comp.state.temperature = 25.0 + Math.min(160, pCoil * 18.0);
            comp.state.overheated = (vDrop > (def.maxVoltage || 18.0)) || (effCurrent > (def.maxCurrent || 1.0));
          } else if (comp.type === 'ammeter') {
            const pShunt = effCurrent * effCurrent * (comp.state.shuntResistance || 0.01);
            comp.state.heatPower = pShunt;
            comp.state.temperature = 25.0 + Math.min(120, pShunt * 15.0);
            comp.state.overheated = comp.state.fuseBlown || (effCurrent > (comp.state.fuseRating || 10.0)) || comp.state.isDirectParallel;
          } else if (comp.type === 'buzzer') {
            comp.state.temperature = 25.0 + Math.min(40, powerW * 20.0);
            comp.state.overheated = (vDrop > (def.maxVoltage || 12.0));
          } else {
            const thermalR = def.thermalR || 35.0;
            comp.state.temperature = 25.0 + Math.min(120, powerW * thermalR);
            comp.state.overheated = (def.maxPower && powerW > def.maxPower * 1.2) || (def.maxVoltage && vDrop > def.maxVoltage);
          }

          // Evaluate safety
          this.evaluateComponentSafety(comp, def, vDrop, effCurrent, totalLinearR, effectiveBranchV, chainBatteries);
        } else {
          comp.state.powered = false;
          comp.state.brightness = 0;
          comp.state.voltageDrop = 0;
          comp.state.current = 0;
        }
      }
    }

    // Set battery telemetry for the batteries powering this chain
    let totalBatteryESR = 0;
    for (const bat of chainBatteries) {
      const bDef = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[bat.type]) || {};
      const esr = bat.internalR !== undefined ? bat.internalR : (bDef.internalR || (bat.type === 'cell3v' ? 18.0 : 0));
      totalBatteryESR += esr;
    }

    let chainTotalCurrent = 0;
    if (ps) {
      chainTotalCurrent = ps.state.actualCurrent || 0;
    } else {
      for (const branch of primaryBranches) {
        let vB = 0;
        let rL = totalBatteryESR;
        for (const step of branch) {
          const comp = step.edge.comp;
          const def = window.COMPONENT_DEFINITIONS[comp.type] || {};
          if (comp.type === 'led') {
            const ledCol = comp.state.color || 'red';
            const vBands = { red: 1.85, orange: 2.00, yellow: 2.10, green: 2.20, blue: 3.10, purple: 3.10, white: 3.15 };
            vB += (comp.state.forwardVoltage || vBands[ledCol] || 2.05);
            rL += 35;
          } else if (comp.type === 'diode') {
            vB += 0.70;
            rL += 8;
          } else {
            rL += (step.edge.resistance !== undefined ? step.edge.resistance : (comp.state.resistance !== undefined ? comp.state.resistance : (def.resistance !== undefined ? def.resistance : 50)));
          }
        }
        if (totalVoltage > vB) {
          chainTotalCurrent += (totalVoltage - vB) / Math.max(0.5, rL);
        }
      }
    }

    const isParallelCapChain = chainBatteries.length > 1 && chainBatteries.every(b => b.type === 'capacitor' || b.type === 'ceramic_capacitor');
    let totalCapFarads = 0;
    if (isParallelCapChain) {
      const getCapF = (b) => (b.type === 'ceramic_capacitor' ? (b.state.capacitanceUf || 0.1) * 1e-6 : (b.state.capacitance || 1000) * 1e-6);
      totalCapFarads = chainBatteries.reduce((sum, b) => sum + getCapF(b), 0);
    }

    for (const bat of chainBatteries) {
      bat.state.powered = true;
      this.status.activeComponents.add(bat.id);
      let myCurrent = chainTotalCurrent;
      if (isParallelCapChain && totalCapFarads > 0) {
        const getCapF = (b) => (b.type === 'ceramic_capacitor' ? (b.state.capacitanceUf || 0.1) * 1e-6 : (b.state.capacitance || 1000) * 1e-6);
        myCurrent = chainTotalCurrent * (getCapF(bat) / totalCapFarads);
      }
      bat.state.current = myCurrent;

      if (bat.type === 'battery' || bat.type === 'cell') {
        const bDef = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS[bat.type]) || {};
        const esr = bat.internalR !== undefined ? bat.internalR : (bDef.internalR || (bat.type === 'battery' ? 1.5 : 0.5));
        const ocv = (bat.state && bat.state.voltage !== undefined) ? bat.state.voltage : (bat.voltage || bDef.voltage || (bat.type === 'battery' ? 9.0 : 1.5));
        const iDrain = chainTotalCurrent;
        const vSag = iDrain * esr;
        const vTerm = Math.max(0, ocv - vSag);

        bat.state.openCircuitVoltage = ocv;
        bat.state.terminalVoltage = vTerm;
        bat.state.actualVoltage = vTerm;
        bat.state.voltageSag = vSag;
        bat.state.voltageDrop = vTerm;
        bat.state.internalR = esr;
        bat.state.internalPowerDissipation = iDrain * iDrain * esr;
        bat.state.power = vTerm * iDrain;
        bat.state.temperature = 25.0 + Math.min(65, bat.state.internalPowerDissipation * 6.0);
        // Chemical cells only overheat under severe overload or dead short circuit (drain > 2.0A or internal heat > 6W)
        bat.state.overheated = (iDrain > 2.0 || bat.state.internalPowerDissipation > 6.0);
      } else {
        bat.state.voltageDrop = totalVoltage;
        bat.state.power = totalVoltage * chainTotalCurrent;
      }

      if (bat.type === 'cell3v') {
        const def = (window.COMPONENT_DEFINITIONS && window.COMPONENT_DEFINITIONS.cell3v) || {};
        const ocv = bat.state.openCircuitVoltage || def.openCircuitVoltage || 3.20;
        const esr = bat.internalR !== undefined ? bat.internalR : (def.internalR || 18.0);
        const iDrain = chainTotalCurrent;
        const vSag = iDrain * esr;
        const vTerm = Math.max(0, ocv - vSag);

        bat.state.nominalVoltage = 3.0;
        bat.state.openCircuitVoltage = ocv;
        bat.state.actualVoltage = vTerm;
        bat.state.terminalVoltage = vTerm;
        bat.state.voltageSag = vSag;
        bat.state.voltageDrop = vTerm;
        bat.state.current = iDrain;
        bat.state.currentMa = iDrain * 1000;
        bat.state.internalR = esr;
        bat.state.internalPowerDissipation = iDrain * iDrain * esr;
        bat.state.power = vTerm * iDrain;

        // Strictly evaluate operating parameters per CR2032 specification:
        // 1. Standby / Open Circuit: 0 mA
        // 2. Standard Baseline: 0.2 - 0.3 mA (ideal continuous drain)
        // 3. Max Continuous Drain: <= 3.0 mA
        // 4. Max Pulse Current: 10 - 50 mA (brief pulses < 1s)
        // 5. Overload / Severe Drain: > 50 mA
        if (iDrain <= 0.000001) {
          bat.state.drainRegime = 'standby';
          bat.state.drainRegimeText = 'STANDBY (Open Circuit: 0 mA)';
          bat.state.runtimeEstimate = '8–10 Years (Shelf Life, <2%/yr self-discharge)';
          bat.state.overheated = false;
        } else if (iDrain <= 0.00035) { // 0.2 - 0.3 mA baseline
          bat.state.drainRegime = 'optimal';
          bat.state.drainRegimeText = `OPTIMAL BASELINE (${(iDrain * 1000).toFixed(2)} mA ≤ 0.3 mA)`;
          const hrs = Math.round(225 / (iDrain * 1000));
          bat.state.runtimeEstimate = `${hrs.toLocaleString()} Hours (~${(hrs / 24).toFixed(0)} Days @ 225mAh)`;
          bat.state.overheated = false;
        } else if (iDrain <= 0.003) { // Max Continuous Drain: 3.0 mA
          bat.state.drainRegime = 'continuous_max';
          bat.state.drainRegimeText = `MAX CONTINUOUS DRAIN (${(iDrain * 1000).toFixed(2)} mA ≤ 3.0 mA)`;
          const hrs = Math.round(200 / (iDrain * 1000));
          bat.state.runtimeEstimate = `${hrs.toLocaleString()} Hours (~${(hrs / 24).toFixed(1)} Days)`;
          bat.state.overheated = false;
        } else if (iDrain <= 0.050) { // Max Pulse: 10 - 50 mA (< 1 s)
          bat.state.drainRegime = 'pulse';
          bat.state.drainRegimeText = `HIGH PULSE REGIME (${(iDrain * 1000).toFixed(1)} mA > 3 mA continuous limit, pulse rated to 50 mA)`;
          const hrs = Math.max(1, Math.round(80 / (iDrain * 1000)));
          bat.state.runtimeEstimate = `~${hrs} Hours (Continuous high drain severely degrades usable capacity)`;
          bat.state.overheated = false;
        } else { // Overload / Short Circuit: > 50 mA
          bat.state.drainRegime = 'overload';
          bat.state.drainRegimeText = `⚠️ SEVERE OVERLOAD (${(iDrain * 1000).toFixed(0)} mA > 50 mA pulse limit!)`;
          bat.state.runtimeEstimate = 'Depleted in minutes / thermal risk';
          bat.state.overheated = true;
          bat.state.burnReason = `CR2032 Coin Cell overloaded with ${(iDrain * 1000).toFixed(0)}mA drain (Max rated continuous: 3.0mA, Max pulse: 50mA). Internal ESR of ${esr.toFixed(1)}Ω dissipated ${(iDrain * iDrain * esr).toFixed(2)}W of Joule heat!`;
        }
      } else if (bat.type === 'power_supply') {
        const outOn = bat.state.outputEnabled !== false;
        if (!outOn) {
          bat.state.actualVoltage = 0.0;
          bat.state.actualCurrent = 0.0;
          bat.state.current = 0.0;
          bat.state.voltageDrop = 0.0;
          bat.state.power = 0.0;
          bat.state.mode = 'cv';
          bat.state.powered = false;
        } else {
          bat.state.current = bat.state.actualCurrent !== undefined ? bat.state.actualCurrent : chainTotalCurrent;
          bat.state.voltageDrop = bat.state.actualVoltage !== undefined ? bat.state.actualVoltage : (bat.state.voltage || 12.0);
          bat.state.power = (bat.state.actualVoltage || 0) * (bat.state.actualCurrent || 0);
          bat.state.powered = true;
        }
      } else if (bat.type === 'function_generator') {
        const outOn = bat.state.outputEnabled !== false;
        bat.state.actualCurrent = outOn ? chainTotalCurrent : 0;
        bat.state.actualVoltage = outOn ? totalVoltage : 0;
        bat.state.power = outOn ? (totalVoltage * chainTotalCurrent) : 0;
        bat.state.powered = outOn && chainTotalCurrent > 0;
      }
    }
  }

  evaluateComponentSafety(comp, def, vDrop, current, totalBranchR, totalVoltage, chainBatteries = []) {
    if (comp.state.burnt || comp.state.burning) return;

    let failed = false;
    let reason = '';
    let diagnostic = null;

    // 1. LED Overvoltage / Direct 9V without Resistor
    if (comp.type === 'led') {
      if (vDrop > def.maxVoltage || (current > def.maxCurrent && totalVoltage > (def.maxVoltage || 3.3))) {
        failed = true;
        reason = `LED Destroyed by Overvoltage! ${vDrop.toFixed(1)}V applied (Max rated: ${def.maxVoltage}V, 40mA). Without a current-limiting Resistor (e.g. 220Ω), excessive current of ${(current * 1000).toFixed(0)}mA melted the semiconductor die!`;
        diagnostic = {
          faultType: 'OVERVOLTAGE_BURNOUT',
          title: '💥 LED Semiconductor Die Melted (Direct 9V Overvoltage)',
          culprit: 'LED (Light Emitting Diode)',
          whyHappened: `The 9V battery attempted to force 9.0 Volts directly across the LED. An LED has a fixed forward turn-on voltage (~2.1V) and very low dynamic internal resistance once conducting (Rd ≈ 15 Ω). Without a series resistor to absorb excess voltage, a destructive current surge of ${(current * 1000).toFixed(0)}mA rushed through the microscopic crystal die, releasing ${(vDrop * current).toFixed(2)} Watts of intense Joule heat and vaporizing the internal gold bond wires!`,
          remedy: 'Insert a Current-Limiting Fixed Resistor (e.g. 220Ω, 330Ω, or 470Ω) in series between Battery (+) and LED Anode (+). By Kirchhoff’s Voltage Law (∑ V = 0), the resistor drops the excess 6.9V, restricting current to a safe 15–20mA.',
          electricalPrinciple: "Kirchhoff's Voltage Law (∑ V = 0) & Ohm's Law (R = (V_supply - V_led) / I_target)",
          equation: 'R_limit = (V_supply - V_led) / I_target = (9.0V - 2.1V) / 0.02A = 345 Ω'
        };
      }
    }

    // 2. Bulb Filament Blown (e.g. two 9V batteries in series delivering 18V!)
    else if (comp.type === 'bulb') {
      if (vDrop > def.maxVoltage) {
        failed = true;
        reason = `Bulb Filament Blown! ${vDrop.toFixed(1)}V applied (Max rated: ${def.maxVoltage}V). Two batteries in series doubled the voltage, vaporizing the tungsten filament!`;
        diagnostic = {
          faultType: 'OVERVOLTAGE_BURNOUT',
          title: '💥 Incandescent Bulb Filament Vaporized by Overvoltage',
          culprit: 'Incandescent Bulb',
          whyHappened: `Applied voltage of ${vDrop.toFixed(1)}V exceeded the bulb's safe maximum rating of ${def.maxVoltage}V (likely two 9V batteries wired in series delivering 18V). High potential doubled the filament current, causing excessive Joule heating (P = V² / R) that heated the tungsten beyond its 3422°C melting point, vaporizing the filament wire instantly!`,
          remedy: 'Reduce supply voltage to 9V, or wire the batteries in parallel (+ to +, − to −) instead of series (+ to −) so that the voltage remains at safe 9.0V.',
          electricalPrinciple: "Joule's First Law of Electric Heating (P = V² / R) & Kirchhoff's Voltage Law",
          equation: 'P = V² / R (Doubling Voltage Quadruples Power!)'
        };
      }
    }

    // 3. Motor Overvoltage Burnout
    else if (comp.type === 'motor') {
      if (vDrop > def.maxVoltage) {
        failed = true;
        reason = `Motor Burnout! ${vDrop.toFixed(1)}V applied (Max rated: ${def.maxVoltage}V). High voltage caused extreme rotational speed and overheated the copper armature windings!`;
        diagnostic = {
          faultType: 'OVERVOLTAGE_BURNOUT',
          title: '💥 DC Motor Armature Burnout',
          culprit: 'DC Electric Motor',
          whyHappened: `Applied voltage of ${vDrop.toFixed(1)}V exceeded the motor's maximum continuous rating of ${def.maxVoltage}V. Extreme current rushed through the copper armature coils, causing intense Joule heating that melted the protective enamel wire insulation and shorted out the rotor windings.`,
          remedy: 'Reduce the voltage to 9V–12V, or connect a Potentiometer or Power Resistor in series with the motor to drop excess voltage and safely control RPM.',
          electricalPrinciple: "Ohm's Law & Motor Counter-Electromotive Force (Back-EMF)",
          equation: 'I_armature = (V_applied - V_backEMF) / R_armature'
        };
      }
    }

    // 4. Diode Short Burn (Direct connection with no load)
    else if (comp.type === 'diode') {
      if (current > def.maxCurrent) {
        failed = true;
        reason = `Diode Blown! ${current.toFixed(2)}A of current flowed directly across the diode with no load resistance, melting the silicon junction!`;
        diagnostic = {
          faultType: 'OVERCURRENT_BURNOUT',
          title: '💥 Diode Silicon Junction Thermal Meltdown',
          culprit: 'Semiconductor Diode',
          whyHappened: `The diode was wired directly across the power supply rails without any load resistance. In forward bias, a silicon diode only drops ~0.7V with negligible dynamic resistance. Connecting it directly created a near-zero resistance path, unleashing an unregulated current surge of ${current.toFixed(2)}A that destroyed the P-N junction crystal die!`,
          remedy: 'Never wire a diode directly across (+) and (-) power terminals without a load. Always put a load (such as a Bulb, Motor, or Resistor) in series with the diode.',
          electricalPrinciple: "Shockley Diode Equation & Forward Thermal Runaway",
          equation: 'I = I_s · (e^(V_d / n·V_t) - 1) ➔ Unbounded Current without Load'
        };
      }
    }

    // 5. Resistor Overpower
    else if (comp.type === 'resistor') {
      const power = vDrop * current;
      if (def.maxPower && power > def.maxPower) {
        failed = true;
        reason = `Resistor Burned! Power dissipated was ${power.toFixed(2)}W (Max rating: ${def.maxPower}W). Excessive voltage caused extreme overheating!`;
        diagnostic = {
          faultType: 'OVERPOWER_BURNOUT',
          title: '💥 Resistor Thermal Destruction (Power Exceeded)',
          culprit: 'Fixed Resistor',
          whyHappened: `Power dissipated in the resistor reached ${power.toFixed(2)} Watts, far exceeding its safe thermal rating of ${def.maxPower || 1.2} Watts. By Joule's Law (P = V × I = I²R), the ceramic substrate overheated past 200°C, scorching the carbon film.`,
          remedy: 'Use a higher resistance value (e.g. increase to 220Ω or 470Ω) to throttle current, or replace with a higher wattage power resistor.',
          electricalPrinciple: "Joule's Law of Power Dissipation (P = V × I = I²R = V² / R)",
          equation: 'P = V² / R  (Power Must Stay Below Rated Max Watts)'
        };
      }
    }

    // 6. Buzzer Overvoltage Burnout (Max rated 12.0V)
    else if (comp.type === 'buzzer') {
      if (def.maxVoltage && vDrop > def.maxVoltage) {
        failed = true;
        reason = `Buzzer Crystal Cracked by Overvoltage! ${vDrop.toFixed(1)}V applied (Max rated: ${def.maxVoltage}V). Excessive voltage overstressed and cracked the piezoelectric ceramic acoustic disc!`;
        diagnostic = {
          faultType: 'OVERVOLTAGE_BURNOUT',
          title: '💥 Piezoelectric Ceramic Disc Cracked',
          culprit: 'Electronic Buzzer',
          whyHappened: `Applied voltage of ${vDrop.toFixed(1)}V exceeded the buzzer's 12.0V maximum rating. Excessive electric field strength produced extreme mechanical strain across the piezoelectric lead zirconate titanate (PZT) ceramic crystal, physically fracturing the acoustic disc!`,
          remedy: 'Limit operating voltage to 9V–12V. Insert a series resistor if connecting to higher voltage supplies.',
          electricalPrinciple: "Piezoelectric Effect & Mechanical Stress Breakdown",
          equation: 'Strain S = d × Electric Field E (Excess Field Fractures Crystal)'
        };
      }
    }

    // 7. Capacitor Overvoltage & Reverse Polarity Breakdown
    else if (comp.type === 'capacitor') {
      const isReversed = comp.state.reversed;
      const maxV = comp.state.ratedVoltage || comp.state.maxVoltage || def.maxVoltage || 16.0;
      if (isReversed && vDrop > 0.8) {
        failed = true;
        reason = `Capacitor Blown by Reverse Polarity! Electrolytic capacitors are polarized. Applying reverse voltage of ${vDrop.toFixed(1)}V broke down the internal aluminum oxide dielectric, creating explosive gas! Always connect Anode (+) to positive and Cathode (−) to negative!`;
        diagnostic = {
          faultType: 'REVERSE_POLARITY_BREAKDOWN',
          title: '💥 Electrolytic Capacitor Reverse-Polarity Destruction',
          culprit: 'Electrolytic Capacitor',
          whyHappened: `Electrolytic capacitors have a microscopic insulating aluminum oxide layer formed solely under forward electrostatic polarity. Connecting in reverse conducts high current through the conductive liquid electrolyte, producing pressurized hydrogen gas and destroying the dielectric barrier!`,
          remedy: 'Connect Anode (+) lead strictly to the positive (+) voltage rail, and Cathode (−) marked by the outer stripe to ground/negative (-).',
          electricalPrinciple: "Dielectric Electrochemistry & Unidirectional Polarization",
          equation: 'V_anode > V_cathode (Strictly Forward Polarity)'
        };
      } else if (vDrop > maxV) {
        failed = true;
        reason = `Capacitor Dielectric Breakdown! Applied voltage of ${vDrop.toFixed(1)}V exceeded the safe rated maximum of ${maxV}V, puncturing the electrostatic dielectric layer!`;
        diagnostic = {
          faultType: 'DIELECTRIC_BREAKDOWN',
          title: '💥 Capacitor Dielectric Puncture by Overvoltage',
          culprit: 'Electrolytic Capacitor',
          whyHappened: `Applied voltage of ${vDrop.toFixed(1)}V exceeded the rated dielectric breakdown rating of ${maxV}V. The intense electric field physically punctured the nanometer-thin oxide insulator, creating a conductive short-circuit arc!`,
          remedy: 'Use a capacitor with a higher voltage rating (e.g. 25V, 35V, 50V, or 100V) or step down the circuit voltage.',
          electricalPrinciple: "Dielectric Strength Limit (E = V / d)",
          equation: 'E_applied > E_breakdown (Arcing Through Insulator)'
        };
      }
    }

    // 8. Ceramic Capacitor Overvoltage Breakdown (50V standard limit)
    else if (comp.type === 'ceramic_capacitor') {
      const maxV = comp.state.ratedVoltage || comp.state.maxVoltage || def.maxVoltage || 50.0;
      if (vDrop > maxV * 1.05) {
        failed = true;
        reason = `Ceramic Capacitor Dielectric Puncture! Applied voltage of ${vDrop.toFixed(1)}V exceeded the 50V maximum dielectric limit, fracturing the ceramic disc!`;
        diagnostic = {
          faultType: 'CERAMIC_DIELECTRIC_PUNCTURE',
          title: '💥 Ceramic Disc Dielectric Puncture by Overvoltage',
          culprit: 'Ceramic Capacitor',
          whyHappened: `Applied potential of ${vDrop.toFixed(1)}V exceeded the dielectric withstand rating (50V max). High electric field caused instantaneous avalanche puncture across the ceramic layers, cracking the ceramic lacquer! Note: Ceramic capacitors are non-polarized (symmetrical leads), but cannot withstand excessive voltage above rating.`,
          remedy: 'Keep applied circuit voltage below 50V DC/AC, or use higher-rated capacitors.',
          electricalPrinciple: 'Ceramic Dielectric Avalanche Puncture',
          equation: `V_applied (${vDrop.toFixed(1)}V) > 50V Rating`
        };
      }
    }

    // 8. Solenoid Overvoltage & Coil Burnout
    else if (comp.type === 'solenoid') {
      if (vDrop > def.maxVoltage || current > def.maxCurrent) {
        failed = true;
        reason = `Solenoid Overheated! ${vDrop.toFixed(1)}V applied (Max rated: ${def.maxVoltage}V, 1.0A). Excessive Joule heating (P = I²R = ${(vDrop * current).toFixed(1)}W) melted the enamel wire insulation!`;
        diagnostic = {
          faultType: 'COIL_OVERHEAT',
          title: '💥 Solenoid Coil Enamel Meltdown',
          culprit: 'Solenoid (Electromagnet)',
          whyHappened: `Continuous high voltage across the 20Ω copper coil generated excessive Joule heat (P = I²R = ${(vDrop * current).toFixed(1)}W), boiling the insulating enamel coating and shorting adjacent coil turns.`,
          remedy: 'Limit coil voltage to 9V–12V, or pulse the solenoid using a momentary switch or relay rather than continuous excitation.',
          electricalPrinciple: "Joule's Heating Law (P = I²R) & Thermal Breakdown",
          equation: 'P = I² × R_coil (Thermal Insulation Class Exceeded)'
        };
      }
    }

    // 9. Rectifier Diode Overcurrent
    else if (comp.type === 'rectifier') {
      if (current > def.maxCurrent) {
        failed = true;
        reason = `Bridge Rectifier Burnout! Current of ${current.toFixed(2)}A exceeded the safe 1.5A maximum rating, destroying internal silicon diodes!`;
        diagnostic = {
          faultType: 'OVERCURRENT_BURNOUT',
          title: '💥 Full-Wave Bridge Rectifier Overcurrent Meltdown',
          culprit: 'Full-Wave Bridge Rectifier',
          whyHappened: `Load current of ${current.toFixed(2)}A exceeded the 1.5A maximum forward rating of the 4 internal Graetz bridge silicon diodes, causing thermal runaway in the P-N junctions.`,
          remedy: 'Ensure the connected DC load has sufficient resistance (R ≥ 10Ω) or add a series ballast resistor to limit total DC output current below 1.5A.',
          electricalPrinciple: "Graetz Bridge Forward Current Limits & Thermal Runaway",
          equation: 'I_dc_load ≤ I_diode_rated'
        };
      }
    }

    // 10. Inductor Saturation & Coil Meltdown
    else if (comp.type === 'inductor') {
      const isat = comp.state.isat || def.maxCurrent || 3.5;
      if (current > isat) {
        failed = true;
        const dcrVal = comp.state.dcr || 0.8;
        reason = `Inductor Overcurrent! Current of ${current.toFixed(2)}A exceeded the safe ${isat.toFixed(1)}A saturation rating! Excessive Joule heating (P = I²R = ${(current * current * dcrVal).toFixed(1)}W) melted the enameled copper insulation!`;
        diagnostic = {
          faultType: 'INDUCTOR_SATURATION_BURNOUT',
          title: '💥 Inductor Coil Meltdown & Core Saturation',
          culprit: 'Power Choke Inductor',
          whyHappened: `Operating current (${current.toFixed(2)}A) exceeded the core magnetic saturation rating (${isat.toFixed(1)}A). The core saturated, inductance collapsed, and massive Joule heating melted the enameled copper wire.`,
          remedy: 'Add a series resistor or load to restrict current flow below saturation rating, or select a higher-current inductor.',
          electricalPrinciple: "Magnetic Core Saturation (B_sat) & Joule Melting (P = I²R_DCR)",
          equation: 'I_load ≤ I_sat, P_loss = I² × R_DCR'
        };
      }
    }

    // 11. Precision Ammeter 10A Ceramic Fuse Blowout & Parallel Short Hazard
    else if (comp.type === 'ammeter') {
      const fuseLimit = comp.state.fuseRating || def.maxCurrent || 10.0;
      const isPoweredByPS = chainBatteries && chainBatteries.some(b => b.type === 'power_supply');
      // Parallel dead-short across source: ammeter wired with no series load, or branch resistance < 0.15 ohm,
      // or current exceeds the 10.0A fast-acting ceramic protection fuse rating!
      // In CC mode on a regulated laboratory power supply, current is safely clamped below the 10A fuse limit.
      const isParallelShort = !isPoweredByPS && (comp.state.isDirectParallel || (totalBranchR < 0.15 && totalVoltage >= 1.0));
      if (current > fuseLimit || isParallelShort) {
        failed = true;
        comp.state.fuseBlown = true;
        comp.state.blown = true;
        comp.state.burnt = true;
        comp.state.burning = true;
        comp.state.current = 0;
        comp.state.measuredCurrent = 0;
        comp.state.reading = 'FUSE BLOWN';
        reason = `Ammeter 10A Ceramic Fuse Blown! Current of ${current.toFixed(1)}A ${isParallelShort ? '(direct parallel connection across voltage source)' : 'exceeded maximum 10.0A rating'}. The internal fast-acting fuse vaporized to protect the instrument! Connect ammeters strictly in SERIES with a load.`;
        diagnostic = {
          faultType: 'AMMETER_FUSE_BLOWN',
          title: '💥 Ammeter 10A Ceramic Fuse Vaporized (Parallel Short Overload)',
          culprit: 'Precision Ammeter',
          whyHappened: isParallelShort
            ? `The ammeter was connected directly in parallel across the voltage supply (${totalVoltage.toFixed(1)}V) with no series load. Because an ammeter has an ultra-low internal shunt resistance (R_shunt = 0.01 Ω), Ohm's Law (I = V / R) attempted to draw a catastrophic current of ${(totalVoltage / 0.01).toFixed(0)}A! The internal 10A ceramic fuse instantly vaporized to prevent an electrical explosion!`
            : `Circuit current of ${current.toFixed(2)}A exceeded the ammeter's 10.0A continuous fuse rating. The high-energy sand-filled ceramic fuse melted to protect the sensitive internal current shunt from burning out.`,
          remedy: 'Never connect an ammeter in parallel across power rails! Always insert the ammeter in SERIES with a circuit load (such as a Resistor, Bulb, or Motor). Click "Replace Fuse" in the Inspector or Repair component to insert a new 10A fuse.',
          electricalPrinciple: "Series Current Sensing vs Parallel Short-Circuit Fault & Instrument Fuse Protection",
          equation: `I = V_source / R_shunt = ${totalVoltage.toFixed(1)}V / 0.01Ω = ${(totalVoltage / 0.01).toFixed(0)}A >> 10A Fuse Rating`
        };
      }
    }

    if (failed) {
      comp.state.candidateBurn = true;
      comp.state.crying = true;
      comp.state.burnReason = reason;
      comp.state.faultDiagnostic = diagnostic;
      this.status.faultDiagnostic = diagnostic;

      let cryDialogue = '';
      if (comp.type === 'bulb') {
        cryDialogue = `😭😭 WAAAAAH! ${vDrop.toFixed(1)}V IS WAY TOO HIGH! My safe rated limit is 10.5V! My tungsten filament is boiling into liquid and about to snap! Please disconnect the extra battery before I burn and die! 💥`;
      } else if (comp.type === 'led') {
        cryDialogue = `😭😭 NOOOOO! ${vDrop.toFixed(1)}V WITHOUT A RESISTOR?! My rated limit is 3.3V! Massive ${(current * 1000).toFixed(0)}mA current is melting my tiny crystal die! Save me Ohmie the Resistor! Disconnect me now!! 💥`;
      } else if (comp.type === 'motor') {
        cryDialogue = `😭😭 HELP! ${vDrop.toFixed(1)}V?! My rated limit is 12V! I'm spinning out of control and my copper windings are smoking! Shut off the power before my motor dies! 💥`;
      } else if (comp.type === 'buzzer') {
        cryDialogue = `😭😭 BEEP-BZZT-AHHH! ${vDrop.toFixed(1)}V IS CRACKING MY SOUND CRYSTAL!! My max safe limit is 12V! Turn off the power before my sound coil blows!! 💥`;
      } else if (comp.type === 'diode') {
        cryDialogue = `😭😭 AHHH! Direct short circuit of ${current.toFixed(2)}A with no load?! My silicon junction is boiling! Disconnect me before I explode into ash!! 💥`;
      } else if (comp.type === 'resistor') {
        cryDialogue = `😭😭 OUCH!! Power is ${(vDrop * current).toFixed(1)}W, exceeding my ${def.maxPower || 1.2}W limit! My ceramic body is scorching hot! Remove the high voltage before I catch fire!! 💥`;
      } else if (comp.type === 'solenoid') {
        cryDialogue = `😭😭 WAAAAH! ${vDrop.toFixed(1)}V IS MELTING MY COIL! Massive ${(current * 1000).toFixed(0)}mA current is burning my enamel insulation (P = I²R)! Shut off power before I catch fire! 💥`;
      } else if (comp.type === 'rectifier') {
        cryDialogue = `😭😭 SIZZLE! ${current.toFixed(2)}A IS BLOWING MY INTERNAL DIODES! My silicon bridge is smoking hot! Disconnect me! 💥`;
      } else if (comp.type === 'inductor') {
        cryDialogue = `😭😭 SIZZLE! ${current.toFixed(2)}A IS MELTING MY COPPER COIL! My ferrite core is saturated and my enamel insulation is smoking! Disconnect me before my turns short together! 💥`;
      } else if (comp.type === 'ammeter') {
        cryDialogue = `💥 DANGER! ${(current || 10).toFixed(1)}A IS VAPORIZING MY 10A INTERNAL CERAMIC FUSE! Never connect an ammeter in parallel across power! Connect me in SERIES with a load! 😭`;
      } else if (comp.type === 'capacitor') {
        const vLimit = comp.state.ratedVoltage || 16;
        if (comp.state.reversed) {
          cryDialogue = `😭😭 POP! SIZZLE! MY POLARITY IS BACKWARDS! You connected my Cathode (−) to positive! Electrolytic capacitors boil and explode when reversed! Disconnect the power quickly!! 💥`;
        } else {
          cryDialogue = `😭😭 POP! WAAAAH! ${vDrop.toFixed(1)}V IS ABOVE MY ${vLimit}V LIMIT! My internal aluminum foil dielectric is puncturing! Disconnect the high voltage before I burst! 💥`;
        }
      } else {
        cryDialogue = `😭😭 AHHH! Overvoltage detected (${vDrop.toFixed(1)}V)! I cannot survive this much electricity! Help me before I burn! 💥`;
      }
      comp.state.cryDialogue = cryDialogue;

      this.status.failedComponents.push({ comp, reason });
      this.status.circuitFailed = true;
      if (!this.status.failureReason) {
        this.status.failureReason = reason;
      }
    }
  }

  calculateWireCurrents(chains, find) {
    this.status.wireCurrents = new Map();

    // Electrical Principle: Current ONLY flows through closed loops with non-zero potential difference.
    // In an open circuit (incomplete loop, open switch, or disconnected branch), current is strictly 0.
    if (!this.status.isComplete) return;

    const getNodeKey = (compOrWire, pin) => {
      if (compOrWire && typeof compOrWire === 'string' && compOrWire.startsWith('wire:')) return compOrWire;
      return `${compOrWire}:${pin}`;
    };

    // Build the conduction network of all active, closed conductors
    // Nodes are terminal keys: e.g. "comp_1:pos", "comp_2:pin1", or "wire:wire_123"
    const adj = new Map();
    const edgesList = [];

    const addEdge = (u, v, data) => {
      if (!adj.has(u)) adj.set(u, []);
      if (!adj.has(v)) adj.set(v, []);
      const edgeObj = { id: edgesList.length, u, v, data, active: true };
      edgesList.push(edgeObj);
      adj.get(u).push(edgeObj);
      adj.get(v).push(edgeObj);
      return edgeObj;
    };

    // 1. Add all wire edges
    for (const wire of this.wires) {
      const u = getNodeKey(wire.fromComp, wire.fromPin);
      const v = getNodeKey(wire.toComp, wire.toPin);
      addEdge(u, v, { type: 'wire', wire });

      // If another wire taps into this wire (junction), bridge the junction node to endpoints
      const junctionKey = `wire:${wire.id}`;
      if (this.wires.some(w => w.fromComp === junctionKey || w.toComp === junctionKey)) {
        addEdge(u, junctionKey, { type: 'wire_junction', wire });
        addEdge(junctionKey, v, { type: 'wire_junction', wire });
      }
    }

    // 2. Add internal conduction through switches (ONLY if closed and not burnt!)
    for (const comp of this.components) {
      if (comp.state.burnt) continue; // Blown components are open circuits!

      if (comp.type === 'switch' && comp.state.closed) {
        addEdge(`${comp.id}:pin1`, `${comp.id}:pin2`, { type: 'switch', comp });
      }

      if (comp.type === 'pushbutton' && comp.state.pressed) {
        addEdge(`${comp.id}:pin1`, `${comp.id}:pin2`, { type: 'pushbutton', comp });
      }

      if (comp.type === 'twowayswitch') {
        const throwPin = (comp.state.position === 2) ? 'l2' : 'l1';
        addEdge(`${comp.id}:com`, `${comp.id}:${throwPin}`, { type: 'twowayswitch', comp });
      }

      if (comp.type === 'relay') {
        const contactPin = comp.state.energized ? 'no' : 'nc';
        addEdge(`${comp.id}:com`, `${comp.id}:${contactPin}`, { type: 'switch', comp });
      }

      if (comp.type === 'npn' && comp.state.conducting) {
        addEdge(`${comp.id}:c`, `${comp.id}:e`, { type: 'transistor', comp, current: comp.state.collectorCurrent || 0.01 });
        if (comp.state.baseCurrent > 0) {
          addEdge(`${comp.id}:b`, `${comp.id}:e`, { type: 'transistor_base', comp, current: comp.state.baseCurrent });
        }
      }
      if (comp.type === 'pnp' && comp.state.conducting) {
        addEdge(`${comp.id}:e`, `${comp.id}:c`, { type: 'transistor', comp, current: comp.state.collectorCurrent || 0.01 });
        if (comp.state.baseCurrent > 0) {
          addEdge(`${comp.id}:e`, `${comp.id}:b`, { type: 'transistor_base', comp, current: comp.state.baseCurrent });
        }
      }

      if (comp.type === 'multimeter' && comp.state.mode === 'dca') {
        addEdge(`${comp.id}:vin`, `${comp.id}:com`, { type: 'ammeter', comp });
      }

      // 3. Add active load conduction ONLY for passive components currently carrying current in valid branches!
      // NOTE: Power sources (battery, cell, ac_source, power_supply, function_generator) provide EMF and are circuit sources, NOT passive loads.
      // They must not have their (+) and (-) terminals internally bridged as loads in the external loop graph.
      const isPowerSource = (comp.type === 'battery' || comp.type === 'cell' || comp.type === 'cell3v' || comp.type === 'ac_source' || comp.type === 'power_supply' || comp.type === 'function_generator' || (comp.type && comp.type.startsWith('gate_')));
      if (isPowerSource) continue;

      if (comp.type === 'transformer') {
        if (comp.state.powered && (comp.state.secondaryCurrent > 0 || comp.state.primaryCurrent > 0 || comp.state.current > 0)) {
          // Transformer primary coil is a load on the AC input side
          addEdge(`${comp.id}:pri1`, `${comp.id}:pri2`, { type: 'load', comp, current: comp.state.primaryCurrent || 0.01 });
        }
      } else if (comp.type === 'relay') {
        if (comp.state.powered && (comp.state.coilCurrent > 0 || comp.state.current > 0)) {
          addEdge(`${comp.id}:coil1`, `${comp.id}:coil2`, { type: 'load', comp, current: comp.state.coilCurrent || comp.state.current || 0.07 });
        }
      } else if (comp.type === 'rectifier') {
        if (comp.state.powered) {
          const iRect = comp.state.current || 0.02;
          // AC load side
          addEdge(`${comp.id}:ac1`, `${comp.id}:ac2`, { type: 'load', comp, current: iRect });
          // Diode forward paths from AC to DC+
          addEdge(`${comp.id}:ac1`, `${comp.id}:dc_pos`, { type: 'diode', comp, current: iRect });
          addEdge(`${comp.id}:ac2`, `${comp.id}:dc_pos`, { type: 'diode', comp, current: iRect });
          // Diode return paths from DC- to AC
          addEdge(`${comp.id}:dc_neg`, `${comp.id}:ac1`, { type: 'diode', comp, current: iRect });
          addEdge(`${comp.id}:dc_neg`, `${comp.id}:ac2`, { type: 'diode', comp, current: iRect });
        }
      } else if (comp.type === 'capacitor' || comp.type === 'ceramic_capacitor') {
        if (comp.state.powered || (comp.state.storedVoltage || 0) > 0.05) {
          const p1 = (comp.type === 'ceramic_capacitor') ? `${comp.id}:t1` : `${comp.id}:anode`;
          const p2 = (comp.type === 'ceramic_capacitor') ? `${comp.id}:t2` : `${comp.id}:cathode`;
          addEdge(p1, p2, { type: 'load', comp, current: comp.state.current || 0.005 });
        }
      } else if (comp.state.powered && comp.state.current > 0) {
        if (comp.terminals.length === 2) {
          addEdge(`${comp.id}:${comp.terminals[0].id}`, `${comp.id}:${comp.terminals[1].id}`, { type: 'load', comp, current: comp.state.current });
        } else if (comp.type === 'potentiometer') {
          // Bridge the active connected pins of the potentiometer
          const connectedPins = new Set();
          for (const w of this.wires) {
            if (w.fromComp === comp.id) connectedPins.add(w.fromPin);
            if (w.toComp === comp.id) connectedPins.add(w.toPin);
          }
          if (connectedPins.has('pin1') && connectedPins.has('wiper')) {
            addEdge(`${comp.id}:pin1`, `${comp.id}:wiper`, { type: 'load', comp, current: comp.state.current });
          }
          if (connectedPins.has('wiper') && connectedPins.has('pin2')) {
            addEdge(`${comp.id}:wiper`, `${comp.id}:pin2`, { type: 'load', comp, current: comp.state.current });
          }
          if (connectedPins.has('pin1') && connectedPins.has('pin2') && !connectedPins.has('wiper')) {
            addEdge(`${comp.id}:pin1`, `${comp.id}:pin2`, { type: 'load', comp, current: comp.state.current });
          }
        } else if (comp.type === 'wattmeter') {
          addEdge(`${comp.id}:in_pos`, `${comp.id}:out_pos`, { type: 'instrument', comp, current: comp.state.current });
          addEdge(`${comp.id}:in_neg`, `${comp.id}:out_neg`, { type: 'instrument', comp, current: comp.state.current });
        } else if (comp.type === 'oscilloscope') {
          if (comp.state.powered) {
            const s1 = comp.state.ch1 || comp.state.ch1Signal;
            const s2 = comp.state.ch2 || comp.state.ch2Signal;
            if (s1 && s1.type !== 'none') {
              const iCh1 = (s1.vrms || 1.0) / 1000000.0;
              addEdge(`${comp.id}:ch1`, `${comp.id}:gnd`, { type: 'instrument', comp, current: Math.max(0.00001, iCh1) });
            }
            if (s2 && s2.type !== 'none') {
              const iCh2 = (s2.vrms || 1.0) / 1000000.0;
              addEdge(`${comp.id}:ch2`, `${comp.id}:gnd`, { type: 'instrument', comp, current: Math.max(0.00001, iCh2) });
            }
          }
        }
      }
    }

    // Helper to get positive terminal pin of any power source
    const getSourcePosPin = (comp) => {
      if (!comp) return 'pos';
      if (comp.type === 'ac_source') return 'l';
      if (comp.type === 'function_generator') return 'out';
      if (comp.type === 'capacitor') return 'anode';
      if (comp.type === 'ceramic_capacitor') return (comp.state.chargePolarity === 't2_pos' ? 't2' : 't1');
      return 'pos';
    };

    // Helper to get negative terminal pin of any power source
    const getSourceNegPin = (comp) => {
      if (!comp) return 'neg';
      if (comp.type === 'ac_source') return 'n';
      if (comp.type === 'function_generator') return 'gnd';
      if (comp.type === 'capacitor') return 'cathode';
      if (comp.type === 'ceramic_capacitor') return (comp.state.chargePolarity === 't2_pos' ? 't1' : 't2');
      return 'neg';
    };

    // Identify all power source positive/line and negative/neutral terminal pins across active chains
    const sourcePosPins = new Set();
    const sourceNegPins = new Set();
    const acTerminalPins = new Set();
    for (const chain of chains) {
      if (chain.totalVoltage <= 0) continue;
      const posBat = chain.endBat || (chain.batteries && chain.batteries[0]);
      const negBat = chain.startBat || (chain.batteries && chain.batteries[chain.batteries.length - 1]);
      const isChainAC = chain.batteries && chain.batteries.some(b => b.type === 'ac_source' || (b.type === 'function_generator' && b.state && b.state.waveform !== 'dc'));
      if (chain.sourcePin === 'sync') {
        const key = `${posBat.id}:sync`;
        sourcePosPins.add(key);
        if (isChainAC) acTerminalPins.add(key);
      } else if (posBat) {
        const posPin = getSourcePosPin(posBat);
        const key = `${posBat.id}:${posPin}`;
        sourcePosPins.add(key);
        if (isChainAC) acTerminalPins.add(key);
      }
      if (negBat) {
        const negPin = getSourceNegPin(negBat);
        const key = `${negBat.id}:${negPin}`;
        sourceNegPins.add(key);
        if (negBat.type === 'power_supply') {
          sourceNegPins.add(`${negBat.id}:gnd`);
        }
        if (isChainAC) acTerminalPins.add(key);
      }

      // In all battery chains (including series packs), chemical EMF lifts charges internally from (-) to (+).
      // All batteries in the chain conduct internally from negPin to posPin.
      if (chain.batteries && chain.batteries.length > 0) {
        for (const bat of chain.batteries) {
          const pPin = getSourcePosPin(bat);
          const nPin = getSourceNegPin(bat);
          addEdge(`${bat.id}:${nPin}`, `${bat.id}:${pPin}`, {
            type: 'bat_internal',
            comp: bat,
            fromNode: `${bat.id}:${nPin}`,
            toNode: `${bat.id}:${pPin}`
          });
          if (bat.type === 'power_supply') {
            addEdge(`${bat.id}:gnd`, `${bat.id}:${pPin}`, {
              type: 'bat_internal',
              comp: bat,
              fromNode: `${bat.id}:gnd`,
              toNode: `${bat.id}:${pPin}`
            });
            addEdge(`${bat.id}:gnd`, `${bat.id}:neg`, {
              type: 'chassis_bond',
              comp: bat
            });
          }
          if (bat.type === 'function_generator') {
            sourcePosPins.add(`${bat.id}:sync`);
            addEdge(`${bat.id}:gnd`, `${bat.id}:sync`, {
              type: 'bat_internal',
              comp: bat,
              fromNode: `${bat.id}:gnd`,
              toNode: `${bat.id}:sync`
            });
          }
        }
      }
    }

    // Transformer secondary sources (Step-Down AC)
    const transformers = this.components.filter(c => c.type === 'transformer' && c.state.powered && !c.state.burnt);
    for (const trans of transformers) {
      const s1 = `${trans.id}:sec1`;
      const s2 = `${trans.id}:sec2`;
      sourcePosPins.add(s1);
      sourceNegPins.add(s2);
      acTerminalPins.add(s1);
      acTerminalPins.add(s2);
      // Secondary internal winding conduction:
      addEdge(s2, s1, {
        type: 'bat_internal',
        comp: trans,
        fromNode: s2,
        toNode: s1
      });
      addEdge(s1, s2, {
        type: 'bat_internal',
        comp: trans,
        fromNode: s1,
        toNode: s2
      });
    }

    // Bridge Rectifiers: DC output rails act as DC power source terminals for downstream DC loads
    const rectifiers = this.components.filter(c => c.type === 'rectifier' && c.state.powered && !c.state.burnt);
    for (const rect of rectifiers) {
      const p = `${rect.id}:dc_pos`;
      const n = `${rect.id}:dc_neg`;
      sourcePosPins.add(p);
      sourceNegPins.add(n);
      addEdge(n, p, {
        type: 'bat_internal',
        comp: rect,
        fromNode: n,
        toNode: p
      });
    }

    // Logic Gate output sources (5.0V Logic HIGH)
    const logicGates = this.components.filter(c => c.type && c.type.startsWith('gate_') && !c.state.burnt);
    for (const gate of logicGates) {
      if (gate.state.outputLevel === 1) {
        sourcePosPins.add(`${gate.id}:out`);
      }
      const hasGnd = gate.terminals && gate.terminals.some(t => t.id === 'gnd');
      if (hasGnd) {
        sourceNegPins.add(`${gate.id}:gnd`);
        if (gate.state.outputLevel === 1 && (gate.state.current || 0) > 0) {
          addEdge(`${gate.id}:gnd`, `${gate.id}:out`, {
            type: 'bat_internal',
            comp: gate,
            fromNode: `${gate.id}:gnd`,
            toNode: `${gate.id}:out`
          });
        }
      }
    }

    // Digital Logic IC (DIP-14) output sources & internal conduction
    const logicICs = this.components.filter(c => c.type && c.type.startsWith('ic_') && !c.state.burnt);
    for (const ic of logicICs) {
      if (!ic.state.powered || !ic.state.gates) continue;
      const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[ic.type];
      if (!spec || !spec.gatePins) continue;

      // Pin 7 is Ground return
      sourceNegPins.add(`${ic.id}:pin7`);

      // Power rail internal conduction from Pin 7 (GND) to Pin 14 (VCC)
      addEdge(`${ic.id}:pin7`, `${ic.id}:pin14`, {
        type: 'bat_internal',
        comp: ic,
        fromNode: `${ic.id}:pin7`,
        toNode: `${ic.id}:pin14`
      });

      for (const gp of spec.gatePins) {
        const gObj = ic.state.gates.find(g => g.id === gp.id);
        if (gObj && gObj.out === 1) {
          sourcePosPins.add(`${ic.id}:${gp.out}`);
          // Internal conduction: from VCC Pin 14 through gate to output pin
          addEdge(`${ic.id}:pin14`, `${ic.id}:${gp.out}`, {
            type: 'bat_internal',
            comp: ic,
            fromNode: `${ic.id}:pin14`,
            toNode: `${ic.id}:${gp.out}`
          });
          // Also return edge to GND Pin 7
          addEdge(`${ic.id}:pin7`, `${ic.id}:${gp.out}`, {
            type: 'bat_internal',
            comp: ic,
            fromNode: `${ic.id}:pin7`,
            toNode: `${ic.id}:${gp.out}`
          });
        }
      }
    }

    if (sourcePosPins.size === 0 || sourceNegPins.size === 0) return;

    // 4. KCL Dead-End Elimination: Iteratively prune nodes with degree <= 1 (except active source pins)
    // Any wire that ends in a dead-end, an open switch, or an unconnected pin carries ZERO current.
    const degrees = new Map();
    for (const [node, edgeList] of adj.entries()) {
      degrees.set(node, edgeList.length);
    }

    const pruneQueue = [];
    for (const [node, deg] of degrees.entries()) {
      if (!sourcePosPins.has(node) && !sourceNegPins.has(node) && deg <= 1) {
        pruneQueue.push(node);
      }
    }

    while (pruneQueue.length > 0) {
      const node = pruneQueue.shift();
      const edgeList = adj.get(node) || [];
      for (const edge of edgeList) {
        if (!edge.active) continue;
        edge.active = false;
        const otherNode = (edge.u === node) ? edge.v : edge.u;
        const newDeg = (degrees.get(otherNode) || 1) - 1;
        degrees.set(otherNode, newDeg);
        if (!sourcePosPins.has(otherNode) && !sourceNegPins.has(otherNode) && newDeg <= 1) {
          pruneQueue.push(otherNode);
        }
      }
    }

    // 5. Reachability Check: Ensure surviving edges actually connect from (+) to (-)
    const activeAdj = new Map();
    for (const edge of edgesList) {
      if (!edge.active) continue;
      if (!activeAdj.has(edge.u)) activeAdj.set(edge.u, []);
      if (!activeAdj.has(edge.v)) activeAdj.set(edge.v, []);
      activeAdj.get(edge.u).push({ to: edge.v, edge });
      activeAdj.get(edge.v).push({ to: edge.u, edge });
    }

    // BFS from source (+) pins along conventional current flow direction
    const distFromPos = new Map();
    const bfsQueue = [];
    for (const posPin of sourcePosPins) {
      if (activeAdj.has(posPin)) {
        distFromPos.set(posPin, 0);
        bfsQueue.push(posPin);
      }
    }

    while (bfsQueue.length > 0) {
      const curr = bfsQueue.shift();
      const d = distFromPos.get(curr);
      const neighbors = activeAdj.get(curr) || [];
      for (const { to, edge } of neighbors) {
        if (!edge.active) continue;
        // Directional EMF constraint: battery internal edges only conduct from (-) to (+) along conventional current flow!
        // A battery NEVER conducts backward from (+) to (-).
        if (edge.data && edge.data.type === 'bat_internal' && edge.data.fromNode !== curr) {
          continue;
        }
        if (!distFromPos.has(to)) {
          distFromPos.set(to, d + 1);
          bfsQueue.push(to);
        }
      }
    }

    // BFS from source (-) pins tracing backwards against conventional current flow
    const distToNeg = new Map();
    const negBfsQueue = [];
    for (const negPin of sourceNegPins) {
      if (activeAdj.has(negPin)) {
        distToNeg.set(negPin, 0);
        negBfsQueue.push(negPin);
      }
    }

    while (negBfsQueue.length > 0) {
      const curr = negBfsQueue.shift();
      const d = distToNeg.get(curr);
      const neighbors = activeAdj.get(curr) || [];
      for (const { to, edge } of neighbors) {
        if (!edge.active) continue;
        // Reverse trace constraint: tracing backward against current flow must go from (+) to (-) across batteries
        if (edge.data && edge.data.type === 'bat_internal' && edge.data.toNode !== curr) {
          continue;
        }
        if (!distToNeg.has(to)) {
          distToNeg.set(to, d + 1);
          negBfsQueue.push(to);
        }
      }
    }

    // BFS to identify all nodes in an active AC circuit loop
    const acReachable = new Set();
    const acBfsQueue = Array.from(acTerminalPins);
    for (const p of acBfsQueue) acReachable.add(p);
    while (acBfsQueue.length > 0) {
      const curr = acBfsQueue.shift();
      const neighbors = activeAdj.get(curr) || [];
      for (const { to, edge } of neighbors) {
        if (!edge.active) continue;
        // Rectifiers convert AC into DC: do not propagate AC status past the diode bridge to DC rails
        if (edge.data && edge.data.comp && edge.data.comp.type === 'rectifier' && (to.includes('dc_pos') || to.includes('dc_neg'))) {
          continue;
        }
        if (!acReachable.has(to)) {
          acReachable.add(to);
          acBfsQueue.push(to);
        }
      }
    }

    // 6. Accumulate branch load currents through wires along closed loop paths (Kirchhoff's Current Law: I_in = I_out)
    const wireFlowMap = new Map();
    const wireDirectedFlow = new Map(); // wireId -> net signed current (+: wireFrom to wireTo, -: wireTo to wireFrom)
    const activeLoads = this.components.filter(c => c.state && c.state.powered && c.state.current > 0);

    const recordWireFlow = (flowFrom, flowTo, edge, currentVal) => {
      if (!edge.data || (edge.data.type !== 'wire' && edge.data.type !== 'wire_junction')) return;
      const wire = edge.data.wire;
      const wId = wire.id;
      wireFlowMap.set(wId, (wireFlowMap.get(wId) || 0) + currentVal);

      const wireFrom = getNodeKey(wire.fromComp, wire.fromPin);
      const wireTo = getNodeKey(wire.toComp, wire.toPin);
      let isForward = true;
      if (flowFrom === wireFrom || flowTo === wireTo) {
        isForward = true;
      } else if (flowFrom === wireTo || flowTo === wireFrom) {
        isForward = false;
      }
      const signedVal = isForward ? currentVal : -currentVal;
      wireDirectedFlow.set(wId, (wireDirectedFlow.get(wId) || 0) + signedVal);
    };

    for (const load of activeLoads) {
      const loadI = load.state.current;
      if (loadI <= 0) continue;

      let termPos = null;
      let termNeg = null;

      if (load.type === 'transformer') {
        termPos = `${load.id}:pri1`;
        termNeg = `${load.id}:pri2`;
      } else if (load.type === 'rectifier') {
        termPos = `${load.id}:ac1`;
        termNeg = `${load.id}:ac2`;
      } else if (load.terminals && load.terminals.length >= 2) {
        // Find valid connected terminals for this component in the active conduction loop
        const connectedPins = load.terminals
          .map(t => `${load.id}:${t.id}`)
          .filter(p => distFromPos.has(p) && distToNeg.has(p));

        if (connectedPins.length >= 2) {
          // Terminal closest to (+) power source is where conventional current enters
          termPos = connectedPins.reduce((best, p) =>
            ((distFromPos.get(p) ?? 9999) < (distFromPos.get(best) ?? 9999)) ? p : best
          );
          // Terminal closest to (-) power source is where conventional current exits
          termNeg = connectedPins.reduce((best, p) =>
            ((distToNeg.get(p) ?? 9999) < (distToNeg.get(best) ?? 9999)) ? p : best
          );
        } else {
          const pin1 = `${load.id}:${load.terminals[0].id}`;
          const pin2 = `${load.id}:${load.terminals[1].id}`;
          const d1 = distFromPos.get(pin1) !== undefined ? distFromPos.get(pin1) : 9999;
          const d2 = distFromPos.get(pin2) !== undefined ? distFromPos.get(pin2) : 9999;
          termPos = d1 <= d2 ? pin1 : pin2;
          termNeg = d1 <= d2 ? pin2 : pin1;
        }
      }

      if (!termPos || !termNeg || termPos === termNeg) continue;

      // Trace upstream from load (+) terminal to source (+) terminal
      const visitedUp = new Set([termPos]);
      let currUp = termPos;
      while (currUp && !sourcePosPins.has(currUp)) {
        const neighbors = activeAdj.get(currUp) || [];
        const curD = distFromPos.get(currUp) || 0;
        let nextNode = null;
        for (const { to, edge } of neighbors) {
          if (!edge.active) continue;
          const toD = distFromPos.get(to);
          if (toD !== undefined && toD < curD && !visitedUp.has(to)) {
            // Conventional current flows from nextNode (nearer source +) to currUp (nearer load +)
            recordWireFlow(to, currUp, edge, loadI);
            visitedUp.add(to);
            nextNode = to;
            break;
          }
        }
        currUp = nextNode;
      }

      // Trace downstream from load (-) terminal to source (-) terminal
      const visitedDown = new Set([termNeg]);
      let currDown = termNeg;
      while (currDown && !sourceNegPins.has(currDown)) {
        const neighbors = activeAdj.get(currDown) || [];
        const curD = distToNeg.get(currDown) || 0;
        let nextNode = null;
        for (const { to, edge } of neighbors) {
          if (!edge.active) continue;
          const toD = distToNeg.get(to);
          if (toD !== undefined && toD < curD && !visitedDown.has(to)) {
            // Conventional current flows from currDown (nearer load -) to nextNode (nearer source -)
            recordWireFlow(currDown, to, edge, loadI);
            visitedDown.add(to);
            nextNode = to;
            break;
          }
        }
        currDown = nextNode;
      }
    }

    // 7. Populate exact wire currents, KCL junction nodes, and Ohm's law drift velocities
    this.status.junctionNodes = new Map();

    for (const edge of edgesList) {
      if (!edge.active || !edge.data || edge.data.type !== 'wire') continue;

      const u = edge.u;
      const v = edge.v;

      // Both endpoints of the wire must be connected to the closed circuit loop
      const uValid = distFromPos.has(u) && distToNeg.has(u);
      const vValid = distFromPos.has(v) && distToNeg.has(v);

      if (!uValid || !vValid) continue;

      const wire = edge.data.wire;

      // Determine conventional current flow direction strictly from (+) to (-) or (L) to (N)
      const du = distFromPos.get(u) || 0;
      const dv = distFromPos.get(v) || 0;
      const nDu = distToNeg.get(u) || 0;
      const nDv = distToNeg.get(v) || 0;

      let direction = 1;
      const wireFromNode = getNodeKey(wire.fromComp, wire.fromPin);

      // Primary source of truth: directed flow accumulated from active loads along closed loops
      if (wireDirectedFlow.has(wire.id) && Math.abs(wireDirectedFlow.get(wire.id)) > 1e-6) {
        direction = (wireDirectedFlow.get(wire.id) > 0) ? 1 : -1;
      } else {
        // Fallback for wires without direct active load trace (e.g. bypass, unpowered branch, or short circuit)
        // If wire is on negative return side (closer to negative source than positive), prioritize distToNeg
        if (nDu !== nDv && (nDu <= du || nDv <= dv)) {
          direction = (nDu > nDv) ? ((wireFromNode === u) ? 1 : -1) : ((wireFromNode === v) ? 1 : -1);
        } else if (du < dv) {
          direction = (wireFromNode === u) ? 1 : -1;
        } else if (dv < du) {
          direction = (wireFromNode === v) ? 1 : -1;
        } else if (nDu > nDv) {
          direction = (wireFromNode === u) ? 1 : -1;
        } else if (nDv > nDu) {
          direction = (wireFromNode === v) ? 1 : -1;
        } else {
          direction = 1;
        }
      }

      const isWireAC = acReachable.has(u) && acReachable.has(v);

      // Exact current through this wire segment following KCL flow accumulation
      let currentA = wireFlowMap.get(wire.id);
      if (currentA === undefined || currentA <= 0) {
        currentA = (this.status.totalCurrent && this.status.totalCurrent > 0)
          ? this.status.totalCurrent
          : Math.max(0.005, (this.status.totalVoltage || 9.0) / 120);
      }

      // Ohm's Law: Drift velocity v ∝ I
      const speedFactor = Math.min(3.5, Math.max(0.25, Math.pow(currentA / 0.04, 0.6)));

      this.status.wireCurrents.set(wire.id, {
        active: true,
        current: currentA,
        currentMA: currentA * 1000,
        speed: speedFactor,
        direction: direction,
        isAC: isWireAC
      });

      // Register flow at endpoints for Kirchhoff's Current Law junction validation (I_in = I_out)
      const fromNode = (direction === 1) ? getNodeKey(wire.fromComp, wire.fromPin) : getNodeKey(wire.toComp, wire.toPin);
      const toNode = (direction === 1) ? getNodeKey(wire.toComp, wire.toPin) : getNodeKey(wire.fromComp, wire.fromPin);

      if (!this.status.junctionNodes.has(toNode)) this.status.junctionNodes.set(toNode, { inCurrents: [], outCurrents: [] });
      if (!this.status.junctionNodes.has(fromNode)) this.status.junctionNodes.set(fromNode, { inCurrents: [], outCurrents: [] });

      this.status.junctionNodes.get(toNode).inCurrents.push({ wireId: wire.id, current: currentA });
      this.status.junctionNodes.get(fromNode).outCurrents.push({ wireId: wire.id, current: currentA });
    }

    // Macro Metrics
    this.status.totalCurrent = chains.reduce((sum, ch) => sum + (ch.batteries && ch.batteries[0] ? (ch.batteries[0].state.current || 0) : 0), 0);
    this.status.totalPower = this.components.reduce((sum, c) => sum + (c.state.power || 0), 0);
    this.status.equivalentResistance = (this.status.totalCurrent > 0) ? (this.status.totalVoltage / this.status.totalCurrent) : 0;
  }

  diagnoseCircuitFault(components = this.components, wires = this.wires, currentLevel = null) {
    // 1. If an explicit fault diagnostic was computed during safety checks or short circuit
    if (this.status.faultDiagnostic) {
      return this.status.faultDiagnostic;
    }

    // 2. Check for any burnt component
    const burntComp = components.find(c => c.state && (c.state.burnt || c.state.burning));
    if (burntComp && burntComp.state.faultDiagnostic) {
      return burntComp.state.faultDiagnostic;
    }

    // 3. Check for Short Circuit
    if (this.status.isShortCircuit) {
      const bat = components.find(c => c.type === 'battery' || c.type === 'cell' || c.type === 'cell3v' || c.type === 'ac_source');
      const isAC = bat && bat.type === 'ac_source';
      return {
        faultType: 'SHORT_CIRCUIT',
        title: isAC ? '⚠️ AC Dead Short Circuit (Zero-Impedance L-to-N Fault)' : '⚠️ DC Dead Short Circuit (Zero-Resistance Direct Fault)',
        culprit: isAC ? 'AC Generator / Direct Line-to-Neutral Wire' : `${bat ? (bat.name || bat.type) : 'Power Source'} & Shorted Wire`,
        whyHappened: isAC
          ? 'A conductive path directly bridges AC Line (L) and Neutral (N) with zero load impedance (Z ≈ 0 Ω). Without impedance to restrict current, a dangerous surge occurs, risking equipment destruction and tripped breakers.'
          : "A conductive wire directly connected the positive (+) and negative (-) terminals of the power source with zero load resistance (R ≈ 0 Ω). According to Ohm's Law (I = V / R), as resistance approaches zero, current surges towards infinity (I → ∞)! Massive uncontrolled electron flow releases tremendous Joule heating (P = I²R) inside the battery and wires, causing rapid overheating and chemical damage.",
        remedy: 'Remove the direct shorting wire connecting (+) to (-). Always wire an electrical load (such as a Resistor, Bulb, or Motor) in series between the positive and negative terminals to limit electric current to safe levels.',
        electricalPrinciple: "Ohm's Law (I = V / R) & Joule's Heating Law (P = I²R)",
        equation: "I = V_supply / R_wire ➔ (9.0V / 0.05Ω ≈ 180A Dead Short Overload!)"
      };
    }

    // 4. Check for Reverse Polarity (Excluding Ammeters which legitimately measure bidirectional current)
    const reversed = components.find(c => c.state && c.state.reversed && c.type !== 'ammeter');
    if (reversed) {
      const isCap = reversed.type === 'capacitor';
      return {
        faultType: 'REVERSE_POLARITY',
        title: isCap ? '⚠️ Electrolytic Capacitor Reverse Polarity' : `⚠️ Reverse-Biased ${reversed.name || reversed.type.toUpperCase()}`,
        culprit: reversed.name || reversed.type,
        whyHappened: isCap
          ? 'Electrolytic capacitors are polarized. The positive (+) power was wired to the Cathode (-) terminal, and Ground was wired to the Anode (+) terminal. This breaks down the internal dielectric barrier.'
          : `The ${reversed.name || reversed.type} was connected with reverse polarity (positive potential applied to Cathode (-) and negative potential to Anode (+)). In reverse bias, the P-N semiconductor depletion zone widens exponentially, blocking electron flow through the entire circuit like a closed gate!`,
        remedy: 'Reverse the wire connections so that the Anode (+) terminal connects towards the positive supply rail, and the Cathode (-) terminal connects towards Ground / negative return.',
        electricalPrinciple: "P-N Junction Unidirectional Conduction & Depletion Layer Dynamics",
        equation: "I_diode ≈ 0 A (Reverse Bias: V_anode < V_cathode)"
      };
    }

    // 5. Check for Open Switch
    const openSwitch = components.find(c => (c.type === 'switch' && !c.state.closed) || (c.type === 'pushbutton' && !c.state.pressed) || (c.type === 'twowayswitch' && c.state.position === undefined));
    if (openSwitch) {
      const switchTitle = openSwitch.type === 'pushbutton' ? 'Pushbutton Switch' : (openSwitch.type === 'twowayswitch' ? 'Two-Way Switch' : 'Single Pole Switch');
      return {
        faultType: 'OPEN_SWITCH',
        title: `⚠️ Open Switch Contact (${switchTitle} Not Activated)`,
        culprit: openSwitch.name || switchTitle,
        whyHappened: 'The switch is currently in the OPEN (OFF) state. The mechanical contacts are physically separated by air, creating an infinite electrical resistance (R_air ≈ ∞ Ω). Without a physical metal bridge, electrons cannot cross the gap.',
        remedy: 'Click on the switch handle or toggle lever to switch it to the CLOSED (ON) position. This physically brings the copper contacts together to complete the conductive loop.',
        electricalPrinciple: "Kirchhoff's Closed Loop Law & Mechanical Contact Continuity",
        equation: "I = V / R_gap = V / ∞ = 0.00 Amperes"
      };
    }

    // 6. Check for Open Circuit / Incomplete Loop
    if (!this.status.isComplete) {
      return {
        faultType: 'OPEN_CIRCUIT',
        title: '⚠️ Open Circuit (Incomplete Loop / Disconnected Terminal)',
        culprit: 'Missing Wire or Unconnected Terminal',
        whyHappened: 'Electric current requires an unbroken, continuous closed loop from the power source positive (+) terminal, passing through the components, and returning back to the negative (-) terminal. Right now, there is an open gap or floating pin, so no potential gradient can push electrons.',
        remedy: 'Inspect the disconnected terminal pins. Click "Show Ghost Wires on Board" or use the Reference Circuit diagram below to connect the missing wires between the power source and components.',
        electricalPrinciple: "Conservation of Electric Charge & Kirchhoff's Current Law (∑ I = 0)",
        equation: "Loop Current I = 0 A (Discontinuous Conductor Path)"
      };
    }

    return null;
  }
}

window.CircuitSolver = CircuitSolver;
