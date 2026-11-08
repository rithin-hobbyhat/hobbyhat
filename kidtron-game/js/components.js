// ElectroCraft Component Registry & Visual Character Renderers
// Real electronic component names with interactive self-introductions, safety warnings, and connecting leads!

// Standard E12 / E24 Preferred Fixed Resistance Values (Ohms)
// Categorized by Ohms (Ω), Hundreds of Ohms, Kilohms (kΩ), Tens of Kilohms, Hundreds of Kilohms & Megohms
const STANDARD_RESISTOR_VALUES = [
  // 1. Ohms (Ω) - 12 Standard Values (E12 Decade)
  10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
  // 2. Hundreds of Ohms - 12 Standard Values
  100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
  // 3. Kilohms (kΩ) - 12 Standard Values
  1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200,
  // 4. Tens of Kilohms - 12 Standard Values
  10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000,
  // 5. Hundreds of Kilohms & Megohms - 6 Standard Values
  100000, 220000, 470000, 1000000, 2200000, 10000000
];

const STANDARD_RESISTOR_CATEGORIES = [
  {
    id: 'ohms',
    name: 'Ohms (Ω)',
    rangeText: '10 Ω – 82 Ω',
    description: 'Low-resistance values for heavy current control & sensitive shunt circuits',
    values: [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82]
  },
  {
    id: 'hundreds',
    name: 'Hundreds of Ohms',
    rangeText: '100 Ω – 820 Ω',
    description: 'LED current-limiting resistors (150Ω–470Ω) and transistor base drive',
    values: [100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820]
  },
  {
    id: 'kilohms',
    name: 'Kilohms (kΩ)',
    rangeText: '1.0 kΩ – 8.2 kΩ',
    description: 'BJT amplifier biasing, audio volume dividers, and audio tone networks',
    values: [1000, 1200, 1500, 1800, 2200, 2700, 3300, 3900, 4700, 5600, 6800, 8200]
  },
  {
    id: 'tens_kilohms',
    name: 'Tens of Kilohms',
    rangeText: '10 kΩ – 82 kΩ',
    description: 'Digital pull-up / pull-down resistors, LDR light sensors, and 555 timers',
    values: [10000, 12000, 15000, 18000, 22000, 27000, 33000, 39000, 47000, 56000, 68000, 82000]
  },
  {
    id: 'hundreds_k_megohms',
    name: 'Hundreds of Kilohms & Megohms',
    rangeText: '100 kΩ – 10 MΩ',
    description: 'High-impedance inputs, long RC timing intervals, voltmeter dividers',
    values: [100000, 220000, 470000, 1000000, 2200000, 10000000]
  }
];

function getClosestStandardResistor(val) {
  const target = Math.max(10, Math.round(val || 10));
  let closest = STANDARD_RESISTOR_VALUES[0];
  let minDiff = Math.abs(target - closest);
  for (const sv of STANDARD_RESISTOR_VALUES) {
    const diff = Math.abs(target - sv);
    if (diff < minDiff) {
      minDiff = diff;
      closest = sv;
    }
  }
  return closest;
}

function getNextStandardResistor(curVal) {
  const cur = getClosestStandardResistor(curVal);
  const idx = STANDARD_RESISTOR_VALUES.indexOf(cur);
  if (idx < STANDARD_RESISTOR_VALUES.length - 1) {
    return STANDARD_RESISTOR_VALUES[idx + 1];
  }
  return cur;
}

function getPrevStandardResistor(curVal) {
  const cur = getClosestStandardResistor(curVal);
  const idx = STANDARD_RESISTOR_VALUES.indexOf(cur);
  if (idx > 0) {
    return STANDARD_RESISTOR_VALUES[idx - 1];
  }
  return cur;
}

function formatResistance(ohms) {
  const r = Math.round(ohms || 0);
  if (r >= 1000000) {
    const m = r / 1000000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)} MΩ`;
  }
  if (r >= 1000) {
    const k = r / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)} kΩ`;
  }
  return `${r} Ω`;
}

// Standard EIA 3-Digit Ceramic Disc & MLCC Capacitor Values & Code Table
// Based on international EIA-198 standard (Classes 1 & 2)
// Includes precision Class 1 (C0G/NP0) crystal load caps & Class 2 (X7R/X5R) decoupling caps
const STANDARD_CERAMIC_CAPACITORS = [
  // Class 1 (C0G/NP0) Precision Crystal Load & RF Timing Tanks (10pF to 47pF, ultra-low ESL ~0.6nH, 0% DC drift)
  { code: '100', pf: 10, nf: 0.01, uf: 0.00001, esr: 0.035, esl: 0.6, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '100 • 10pF (RF Tuning)' },
  { code: '120', pf: 12, nf: 0.012, uf: 0.000012, esr: 0.032, esl: 0.6, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '120 • 12pF (Crystal Load)' },
  { code: '150', pf: 15, nf: 0.015, uf: 0.000015, esr: 0.030, esl: 0.6, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '150 • 15pF (Crystal Load)' },
  { code: '180', pf: 18, nf: 0.018, uf: 0.000018, esr: 0.029, esl: 0.6, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '180 • 18pF (Crystal Load)' },
  { code: '220', pf: 22, nf: 0.022, uf: 0.000022, esr: 0.028, esl: 0.6, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '220 • 22pF (Crystal Load Standard)' },
  { code: '330', pf: 33, nf: 0.033, uf: 0.000033, esr: 0.027, esl: 0.7, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '330 • 33pF (Timing Tank)' },
  { code: '470', pf: 47, nf: 0.047, uf: 0.000047, esr: 0.026, esl: 0.7, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '470 • 47pF (RF Snubber)' },

  // Class 1 / Class 2 Intermediate Signal Coupling & Bypass
  { code: '101', pf: 100, nf: 0.1, uf: 0.0001, esr: 0.025, esl: 0.8, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '101 • 100pF (0.1nF)' },
  { code: '102', pf: 1000, nf: 1, uf: 0.001, esr: 0.020, esl: 0.8, dielectricClass: 'Class 1 (C0G/NP0)', ratedVoltage: 50.0, label: '102 • 1nF (0.001µF)' },
  { code: '222', pf: 2200, nf: 2.2, uf: 0.0022, esr: 0.018, esl: 0.8, dielectricClass: 'Class 1/2 (C0G/X7R)', ratedVoltage: 50.0, label: '222 • 2.2nF (0.002µF)' },
  { code: '472', pf: 4700, nf: 4.7, uf: 0.0047, esr: 0.016, esl: 0.8, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '472 • 4.7nF (0.005µF)' },
  { code: '103', pf: 10000, nf: 10, uf: 0.01, esr: 0.015, esl: 0.9, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '103 • 10nF (0.01µF)' },
  { code: '223', pf: 22000, nf: 22, uf: 0.022, esr: 0.014, esl: 0.9, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '223 • 22nF (0.022µF)' },
  { code: '473', pf: 47000, nf: 47, uf: 0.047, esr: 0.012, esl: 0.9, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '473 • 47nF (0.047µF)' },

  // Class 2 (X7R/X5R) High-Frequency IC Decoupling & Bulk Ceramic (0.1µF to 10µF)
  { code: '104', pf: 100000, nf: 100, uf: 0.1, esr: 0.010, esl: 0.9, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '104 • 100nF (0.1µF Decoupling)' },
  { code: '224', pf: 220000, nf: 220, uf: 0.22, esr: 0.009, esl: 0.9, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '224 • 220nF (0.22µF)' },
  { code: '474', pf: 470000, nf: 470, uf: 0.47, esr: 0.008, esl: 1.0, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '474 • 470nF (0.47µF)' },
  { code: '105', pf: 1000000, nf: 1000, uf: 1.0, esr: 0.006, esl: 1.0, dielectricClass: 'Class 2 (X7R)', ratedVoltage: 50.0, label: '105 • 1µF (1000nF)' },
  { code: '225', pf: 2200000, nf: 2200, uf: 2.2, esr: 0.005, esl: 1.1, dielectricClass: 'Class 2 (X5R)', ratedVoltage: 50.0, label: '225 • 2.2µF (2200nF)' },
  { code: '475', pf: 4700000, nf: 4700, uf: 4.7, esr: 0.005, esl: 1.1, dielectricClass: 'Class 2 (X5R)', ratedVoltage: 50.0, label: '475 • 4.7µF (4700nF)' },
  { code: '106', pf: 10000000, nf: 10000, uf: 10.0, esr: 0.004, esl: 1.2, dielectricClass: 'Class 2 (X5R)', ratedVoltage: 50.0, label: '106 • 10µF (10,000nF MLCC)' }
];

// Calculate Theoretical Self-Resonant Frequency (SRF = 1 / (2*pi*sqrt(L*C))) for every entry
function calculateCeramicSRF(capFarads, eslNh = 0.9) {
  const l = Math.max(1e-12, eslNh * 1e-9);
  const c = Math.max(1e-15, capFarads);
  return 1 / (2 * Math.PI * Math.sqrt(l * c));
}

// Attach precomputed SRF (in MHz) to all standard ceramic capacitor entries
for (const item of STANDARD_CERAMIC_CAPACITORS) {
  item.srfMhz = parseFloat((calculateCeramicSRF(item.uf * 1e-6, item.esl) / 1e6).toFixed(1));
}

// Capacitive Reactance: X_C = 1 / (2 * pi * f * C)
function calculateCapacitorReactance(capFarads, freqHz = 1000) {
  const f = Math.max(0.1, freqHz);
  const c = Math.max(1e-15, capFarads);
  return 1 / (2 * Math.PI * f * c);
}

// Full Capacitor AC Impedance: Z = sqrt(ESR² + (Xc - Xl)²)
function calculateCapacitorImpedance(capFarads, esrOhms = 0.01, eslNh = 0.9, freqHz = 1000) {
  const f = Math.max(0.1, freqHz);
  const xc = calculateCapacitorReactance(capFarads, f);
  const xl = 2 * Math.PI * f * Math.max(1e-12, eslNh * 1e-9);
  return Math.sqrt(esrOhms * esrOhms + Math.pow(xc - xl, 2));
}

// RC Cutoff Frequency: f_c = 1 / (2 * pi * R * C)
function calculateRCCutoffFreq(rOhms, capFarads) {
  const r = Math.max(0.1, rOhms);
  const c = Math.max(1e-15, capFarads);
  return 1 / (2 * Math.PI * r * c);
}

// Multi-Scale Charge Formatter: C -> mC -> µC -> nC -> pC
function formatCharge(coulombs) {
  const abs = Math.abs(coulombs);
  if (abs >= 1e-3) return `${(coulombs * 1e3).toFixed(2)} mC`;
  if (abs >= 1e-6) return `${(coulombs * 1e6).toFixed(2)} µC`;
  if (abs >= 1e-9) return `${(coulombs * 1e9).toFixed(2)} nC`;
  return `${(coulombs * 1e12).toFixed(1)} pC`;
}

// Multi-Scale Energy Formatter: J -> mJ -> µJ -> nJ -> pJ
function formatEnergy(joules) {
  const abs = Math.abs(joules);
  if (abs >= 1e-3) return `${(joules * 1e3).toFixed(2)} mJ`;
  if (abs >= 1e-6) return `${(joules * 1e6).toFixed(2)} µJ`;
  if (abs >= 1e-9) return `${(joules * 1e9).toFixed(2)} nJ`;
  return `${(joules * 1e12).toFixed(1)} pJ`;
}

function getCeramicCapacitor(codeOrNf) {
  if (codeOrNf !== undefined && codeOrNf !== null) {
    const str = String(codeOrNf).trim();
    const found = STANDARD_CERAMIC_CAPACITORS.find(c => c.code === str);
    if (found) return found;
  }
  const targetNf = parseFloat(codeOrNf) || 100;
  let closest = STANDARD_CERAMIC_CAPACITORS[0];
  let minDiff = Math.abs(targetNf - closest.nf);
  for (const item of STANDARD_CERAMIC_CAPACITORS) {
    const diff = Math.abs(targetNf - item.nf);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  return closest;
}

function getNextCeramicCapacitor(curCode) {
  const cur = getCeramicCapacitor(curCode);
  const idx = STANDARD_CERAMIC_CAPACITORS.findIndex(c => c.code === cur.code);
  if (idx >= 0 && idx < STANDARD_CERAMIC_CAPACITORS.length - 1) {
    return STANDARD_CERAMIC_CAPACITORS[idx + 1];
  }
  return STANDARD_CERAMIC_CAPACITORS[0];
}

function getPrevCeramicCapacitor(curCode) {
  const cur = getCeramicCapacitor(curCode);
  const idx = STANDARD_CERAMIC_CAPACITORS.findIndex(c => c.code === cur.code);
  if (idx > 0) {
    return STANDARD_CERAMIC_CAPACITORS[idx - 1];
  }
  return STANDARD_CERAMIC_CAPACITORS[STANDARD_CERAMIC_CAPACITORS.length - 1];
}

function formatCeramicCapacitance(codeOrNf) {
  const entry = getCeramicCapacitor(codeOrNf);
  if (!entry) return '100nF';
  if (entry.pf < 1000) return `${entry.pf}pF`;
  if (entry.nf < 1000) return `${entry.nf}nF`;
  return `${entry.uf}µF`;
}

// Class 1 Ceramic (C0G/NP0) has negligible DC bias derating (< 0.1%, linear dielectric)
// Class 2 Ceramic (X7R/X5R) has ferroelectric domain saturation: up to ~35% drop at rated voltage
function getCeramicEffectiveCapacitance(codeOrNf, appliedDcV = 0) {
  const entry = getCeramicCapacitor(codeOrNf);
  const nomUf = entry.uf;
  // All Class 1 (C0G/NP0) have linear dielectric without ferroelectric clamping
  if (entry.dielectricClass && entry.dielectricClass.includes('Class 1') && !entry.dielectricClass.includes('Class 2')) {
    return nomUf;
  }
  const vRat = entry.ratedVoltage || 50.0;
  const ratio = Math.min(1.2, Math.abs(appliedDcV) / vRat);
  // Class 2 ceramics experience ferroelectric domain clamping: up to ~35% drop at rated voltage
  const derate = 1.0 - 0.35 * Math.pow(ratio, 1.8);
  return Math.max(nomUf * 0.4, nomUf * derate);
}

// Standard Preferred Electrolytic Capacitance Series (µF) & Standard Working Voltage Ratings (V)
// Standard E6 / E12 Preferred Values: 1µF to 10,000µF
const STANDARD_ELECTROLYTIC_VALUES = [
  1, 2.2, 3.3, 4.7, 10, 22, 33, 47, 100, 220, 330, 470, 1000, 2200, 3300, 4700, 6800, 10000
];

// Standard Working Voltage Ratings (WVDC in Volts)
const STANDARD_ELECTROLYTIC_VOLTAGES = [6.3, 10, 16, 25, 35, 50, 63, 100];

// Wound Aluminum Foil Electrolytic Equivalent Series Resistance (ESR in Ohms)
// Models real electrolytic ESR curve: inversely proportional to C, scaled by voltage rating
function getElectrolyticESR(capUf, ratedV = 16) {
  const c = Math.max(0.1, parseFloat(capUf) || 1000);
  const v = Math.max(6.3, parseFloat(ratedV) || 16);
  const raw = (80.0 / c) * Math.sqrt(16.0 / v);
  return Math.min(25.0, Math.max(0.015, Math.round(raw * 1000) / 1000));
}

// Wound Aluminum Foil Parasitic Inductance (ESL in nanoHenries)
function getElectrolyticESL(capUf) {
  return 20.0; // Standard radial electrolytic wound can: ~15-25 nH
}

function getClosestElectrolytic(val) {
  const target = Math.max(0.1, parseFloat(val) || 1000);
  let closest = STANDARD_ELECTROLYTIC_VALUES[0];
  let minDiff = Math.abs(target - closest);
  for (const sv of STANDARD_ELECTROLYTIC_VALUES) {
    const diff = Math.abs(target - sv);
    if (diff < minDiff) {
      minDiff = diff;
      closest = sv;
    }
  }
  return closest;
}

function getNextElectrolytic(curVal) {
  const cur = getClosestElectrolytic(curVal);
  const idx = STANDARD_ELECTROLYTIC_VALUES.indexOf(cur);
  if (idx >= 0 && idx < STANDARD_ELECTROLYTIC_VALUES.length - 1) {
    return STANDARD_ELECTROLYTIC_VALUES[idx + 1];
  }
  return STANDARD_ELECTROLYTIC_VALUES[0];
}

function getPrevElectrolytic(curVal) {
  const cur = getClosestElectrolytic(curVal);
  const idx = STANDARD_ELECTROLYTIC_VALUES.indexOf(cur);
  if (idx > 0) {
    return STANDARD_ELECTROLYTIC_VALUES[idx - 1];
  }
  return STANDARD_ELECTROLYTIC_VALUES[STANDARD_ELECTROLYTIC_VALUES.length - 1];
}

function getNextElectrolyticVoltage(curV) {
  const cur = parseFloat(curV) || 16;
  const idx = STANDARD_ELECTROLYTIC_VOLTAGES.indexOf(cur);
  if (idx >= 0 && idx < STANDARD_ELECTROLYTIC_VOLTAGES.length - 1) {
    return STANDARD_ELECTROLYTIC_VOLTAGES[idx + 1];
  }
  return STANDARD_ELECTROLYTIC_VOLTAGES[0];
}

function getPrevElectrolyticVoltage(curV) {
  const cur = parseFloat(curV) || 16;
  const idx = STANDARD_ELECTROLYTIC_VOLTAGES.indexOf(cur);
  if (idx > 0) {
    return STANDARD_ELECTROLYTIC_VOLTAGES[idx - 1];
  }
  return STANDARD_ELECTROLYTIC_VOLTAGES[STANDARD_ELECTROLYTIC_VOLTAGES.length - 1];
}

function formatCapacitance(uf) {
  const val = parseFloat(uf) || 1000;
  if (val >= 1000) {
    const mf = val / 1000;
    return `${val}µF (${Number.isInteger(mf) ? mf : mf.toFixed(1)}mF)`;
  }
  return `${val}µF`;
}

// Standard Preferred Inductor Values (E12 / Power Choke Series from 10µH to 10H)
const STANDARD_INDUCTOR_VALUES = [
  { valUh: 10, mh: 0.01, dcr: 0.05, isat: 5.5, label: '10 µH (0.01 mH)' },
  { valUh: 47, mh: 0.047, dcr: 0.08, isat: 4.5, label: '47 µH (0.05 mH)' },
  { valUh: 100, mh: 0.1, dcr: 0.12, isat: 3.8, label: '100 µH (0.1 mH)' },
  { valUh: 220, mh: 0.22, dcr: 0.22, isat: 3.0, label: '220 µH (0.22 mH)' },
  { valUh: 470, mh: 0.47, dcr: 0.38, isat: 2.5, label: '470 µH (0.47 mH)' },
  { valUh: 1000, mh: 1.0, dcr: 0.65, isat: 2.0, label: '1 mH (1000 µH)' },
  { valUh: 2200, mh: 2.2, dcr: 1.10, isat: 1.6, label: '2.2 mH' },
  { valUh: 4700, mh: 4.7, dcr: 1.80, isat: 1.2, label: '4.7 mH' },
  { valUh: 10000, mh: 10.0, dcr: 3.20, isat: 0.95, label: '10 mH' },
  { valUh: 22000, mh: 22.0, dcr: 5.50, isat: 0.70, label: '22 mH' },
  { valUh: 47000, mh: 47.0, dcr: 8.50, isat: 0.50, label: '47 mH' },
  { valUh: 100000, mh: 100.0, dcr: 12.0, isat: 0.35, label: '100 mH (0.1 H)' },
  { valUh: 220000, mh: 220.0, dcr: 16.0, isat: 0.28, label: '220 mH (0.22 H)' },
  { valUh: 470000, mh: 470.0, dcr: 22.0, isat: 0.22, label: '470 mH (0.47 H)' },
  { valUh: 1000000, mh: 1000.0, dcr: 4.5, isat: 1.5, label: '1 H (1000 mH) Iron Choke' },
  { valUh: 2200000, mh: 2200.0, dcr: 8.0, isat: 1.2, label: '2.2 H Heavy Choke' },
  { valUh: 5000000, mh: 5000.0, dcr: 15.0, isat: 0.9, label: '5 H Industrial Choke' },
  { valUh: 10000000, mh: 10000.0, dcr: 25.0, isat: 0.6, label: '10 H Power Smoothing Filter' }
];

function getClosestInductor(valMhOrUh) {
  const targetMh = parseFloat(valMhOrUh) || 10;
  let closest = STANDARD_INDUCTOR_VALUES[0];
  let minDiff = Math.abs(targetMh - closest.mh);
  for (const item of STANDARD_INDUCTOR_VALUES) {
    const diff = Math.abs(targetMh - item.mh);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  return closest;
}

function getNextInductor(curMh) {
  const cur = getClosestInductor(curMh);
  const idx = STANDARD_INDUCTOR_VALUES.findIndex(c => c.mh === cur.mh);
  if (idx >= 0 && idx < STANDARD_INDUCTOR_VALUES.length - 1) {
    return STANDARD_INDUCTOR_VALUES[idx + 1];
  }
  return STANDARD_INDUCTOR_VALUES[0];
}

function getPrevInductor(curMh) {
  const cur = getClosestInductor(curMh);
  const idx = STANDARD_INDUCTOR_VALUES.findIndex(c => c.mh === cur.mh);
  if (idx > 0) {
    return STANDARD_INDUCTOR_VALUES[idx - 1];
  }
  return STANDARD_INDUCTOR_VALUES[STANDARD_INDUCTOR_VALUES.length - 1];
}

function formatInductance(mh) {
  const v = parseFloat(mh) || 10;
  if (v >= 1000) {
    const h = v / 1000;
    return `${Number.isInteger(h) ? h : h.toFixed(1)} H`;
  }
  if (v < 1.0) {
    return `${Math.round(v * 1000)} µH`;
  }
  return `${Number.isInteger(v) ? v : v.toFixed(1)} mH`;
}

// Fundamental Electrical Engineering Inductor Physics Formulas (Faraday & Lenz)
function calculateRLTimeConstant(lHenries, rOhms) {
  const l = Math.max(1e-9, parseFloat(lHenries) || 0.01);
  const r = Math.max(0.01, parseFloat(rOhms) || 1.0);
  return l / r; // tau in seconds
}

function calculateLCResonance(lHenries, cFarads) {
  const l = Math.max(1e-12, parseFloat(lHenries) || 0.01);
  const c = Math.max(1e-15, parseFloat(cFarads) || 1e-6);
  return 1 / (2 * Math.PI * Math.sqrt(l * c)); // f0 in Hz
}

function calculateInductorEnergy(lHenries, iAmps) {
  const l = Math.max(0, parseFloat(lHenries) || 0);
  const i = Math.max(0, parseFloat(iAmps) || 0);
  return 0.5 * l * i * i; // Stored magnetic energy in Joules (E = 1/2 * L * I^2)
}

function calculateInductorReactance(lHenries, fHz) {
  const l = Math.max(0, parseFloat(lHenries) || 0);
  const f = Math.max(0, parseFloat(fHz) || 0);
  return 2 * Math.PI * f * l; // Reactance X_L in Ohms
}

function calculateInductorKickback(lHenries, iAmps, hasFlybackDiode = false, snubberC = 0) {
  const l = Math.max(1e-6, parseFloat(lHenries) || 0.01);
  const i = Math.max(0, parseFloat(iAmps) || 0);
  if (i < 0.001) return { voltage: 0, clamped: false, safe: true, type: 'none' };
  if (hasFlybackDiode) {
    return { voltage: 0.7, clamped: true, safe: true, type: 'flyback_diode' };
  }
  if (snubberC > 0) {
    const z0 = Math.sqrt(l / Math.max(1e-12, snubberC));
    const clampedV = Math.min(36, Math.max(14, Math.round(i * z0 * 0.08)));
    return { voltage: clampedV, clamped: true, safe: true, type: 'snubber_capacitor' };
  }
  // Unprotected: high voltage inductive kickback spike (-L * di/dt)
  const spikeV = Math.min(450, Math.max(65, Math.round(i * 1800 * Math.sqrt(l / 0.01))));
  return { voltage: spikeV, clamped: false, safe: false, type: 'unprotected_spike' };
}

window.STANDARD_CERAMIC_CAPACITORS = STANDARD_CERAMIC_CAPACITORS;
window.getCeramicCapacitor = getCeramicCapacitor;
window.getNextCeramicCapacitor = getNextCeramicCapacitor;
window.getPrevCeramicCapacitor = getPrevCeramicCapacitor;
window.formatCeramicCapacitance = formatCeramicCapacitance;
window.getCeramicEffectiveCapacitance = getCeramicEffectiveCapacitance;
window.calculateCeramicSRF = calculateCeramicSRF;
window.calculateCapacitorReactance = calculateCapacitorReactance;
window.calculateCapacitorImpedance = calculateCapacitorImpedance;
window.calculateRCCutoffFreq = calculateRCCutoffFreq;
window.formatCharge = formatCharge;
window.formatEnergy = formatEnergy;
window.STANDARD_ELECTROLYTIC_VALUES = STANDARD_ELECTROLYTIC_VALUES;
window.STANDARD_ELECTROLYTIC_VOLTAGES = STANDARD_ELECTROLYTIC_VOLTAGES;
window.getClosestElectrolytic = getClosestElectrolytic;
window.getNextElectrolytic = getNextElectrolytic;
window.getPrevElectrolytic = getPrevElectrolytic;
window.getNextElectrolyticVoltage = getNextElectrolyticVoltage;
window.getPrevElectrolyticVoltage = getPrevElectrolyticVoltage;
window.getElectrolyticESR = getElectrolyticESR;
window.getElectrolyticESL = getElectrolyticESL;
window.formatCapacitance = formatCapacitance;
window.STANDARD_INDUCTOR_VALUES = STANDARD_INDUCTOR_VALUES;
window.getClosestInductor = getClosestInductor;
window.getNextInductor = getNextInductor;
window.getPrevInductor = getPrevInductor;
window.formatInductance = formatInductance;
window.calculateRLTimeConstant = calculateRLTimeConstant;
window.calculateLCResonance = calculateLCResonance;
window.calculateInductorEnergy = calculateInductorEnergy;
window.calculateInductorReactance = calculateInductorReactance;
window.calculateInductorKickback = calculateInductorKickback;

// 4-Band Resistor EIA Color Band Calculator & Definitions
const RESISTOR_COLOR_DATA = [
  { digit: 0, name: 'Black', hex: '#18181b', border: '#3f3f46', mult: '×1', multVal: 1, textDark: false },
  { digit: 1, name: 'Brown', hex: '#854d0e', border: '#a16207', mult: '×10', multVal: 10, textDark: false },
  { digit: 2, name: 'Red', hex: '#dc2626', border: '#ef4444', mult: '×100', multVal: 100, textDark: false },
  { digit: 3, name: 'Orange', hex: '#ea580c', border: '#f97316', mult: '×1k', multVal: 1000, textDark: false },
  { digit: 4, name: 'Yellow', hex: '#eab308', border: '#facc15', mult: '×10k', multVal: 10000, textDark: true },
  { digit: 5, name: 'Green', hex: '#16a34a', border: '#22c55e', mult: '×100k', multVal: 100000, textDark: false },
  { digit: 6, name: 'Blue', hex: '#2563eb', border: '#3b82f6', mult: '×1M', multVal: 1000000, textDark: false },
  { digit: 7, name: 'Violet', hex: '#9333ea', border: '#a855f7', mult: '×10M', multVal: 10000000, textDark: false },
  { digit: 8, name: 'Gray', hex: '#64748b', border: '#94a3b8', mult: '×100M', multVal: 100000000, textDark: false },
  { digit: 9, name: 'White', hex: '#f8fafc', border: '#ffffff', mult: '×1G', multVal: 1000000000, textDark: true }
];

const RESISTOR_TOLERANCE_GOLD = {
  name: 'Gold',
  hex: '#f59e0b',
  border: '#fbbf24',
  tol: '±5%',
  textDark: true
};

const RESISTOR_COLOR_MAP = RESISTOR_COLOR_DATA.map(d => d.hex);

function getResistorColorDetails(ohms) {
  const r = Math.max(1, Math.round(ohms || 220));
  const str = r.toString();
  let d1 = parseInt(str[0], 10);
  let d2 = parseInt(str[1], 10);
  if (isNaN(d1)) d1 = 2;
  if (isNaN(d2)) d2 = (str.length === 1 ? 0 : 2);
  let multiplier = str.length - 2;
  if (multiplier < 0) multiplier = 0;
  if (multiplier > 9) multiplier = 9;

  const band1 = RESISTOR_COLOR_DATA[d1] || RESISTOR_COLOR_DATA[2];
  const band2 = RESISTOR_COLOR_DATA[d2] || RESISTOR_COLOR_DATA[2];
  const band3 = RESISTOR_COLOR_DATA[multiplier] || RESISTOR_COLOR_DATA[1];
  const band4 = RESISTOR_TOLERANCE_GOLD;

  const multText = band3.mult;
  const toleranceVal = 0.05;
  const minR = Math.round(r * (1 - toleranceVal) * 10) / 10;
  const maxR = Math.round(r * (1 + toleranceVal) * 10) / 10;

  return {
    ohms: r,
    formatted: formatResistance(r),
    bands: [band1.hex, band2.hex, band3.hex, band4.hex],
    bandNames: [band1.name, band2.name, band3.name, band4.name],
    details: [
      { band: 1, type: '1st Digit', name: band1.name, value: d1, hex: band1.hex, border: band1.border, textDark: band1.textDark },
      { band: 2, type: '2nd Digit', name: band2.name, value: d2, hex: band2.hex, border: band2.border, textDark: band2.textDark },
      { band: 3, type: 'Multiplier', name: band3.name, value: multText, hex: band3.hex, border: band3.border, textDark: band3.textDark },
      { band: 4, type: 'Tolerance', name: band4.name, value: band4.tol, hex: band4.hex, border: band4.border, textDark: band4.textDark }
    ],
    codeString: `${band1.name} • ${band2.name} • ${band3.name} • ${band4.name}`,
    codeDashed: `${band1.name}-${band2.name}-${band3.name}-${band4.name}`,
    minResistance: minR,
    maxResistance: maxR,
    minFormatted: formatResistance(minR),
    maxFormatted: formatResistance(maxR)
  };
}

function getResistorColorBands(ohms) {
  return getResistorColorDetails(ohms).bands;
}

function getResistorStory(ohms) {
  const info = getResistorColorDetails(ohms || 220);
  return `Hello! I am the Fixed Resistor! Look at my colorful stripes: ${info.codeString}! That color code tells engineers I provide ${info.formatted} of resistance (±5% tolerance). When high-speed electrons rush from the power supply, I gently slow them down according to Ohm's Law (V = I × R) to keep delicate components like LEDs safe!`;
}

window.STANDARD_RESISTOR_VALUES = STANDARD_RESISTOR_VALUES;
window.STANDARD_RESISTOR_CATEGORIES = STANDARD_RESISTOR_CATEGORIES;
window.RESISTOR_COLOR_DATA = RESISTOR_COLOR_DATA;
window.RESISTOR_TOLERANCE_GOLD = RESISTOR_TOLERANCE_GOLD;
window.RESISTOR_COLOR_MAP = RESISTOR_COLOR_MAP;
window.getClosestStandardResistor = getClosestStandardResistor;
window.getNextStandardResistor = getNextStandardResistor;
window.getPrevStandardResistor = getPrevStandardResistor;
window.formatResistance = formatResistance;
window.getResistorColorBands = getResistorColorBands;
window.getResistorColorDetails = getResistorColorDetails;
window.getResistorStory = getResistorStory;

const BATTERY_9V_REAL_SRC = (typeof BATTERY_9V_REAL_IMAGE !== 'undefined') ? BATTERY_9V_REAL_IMAGE : 'assets/battery9v_real_clean.png';

const CHARACTER_PROFILES = {
  bulb: {
    name: 'Incandescent Bulb',
    nick: 'Incandescent Bulb',
    title: 'Filament Lamp',
    avatar: '💡',
    voicePitch: 1.3,
    voiceRate: 1.02,
    superpower: 'Converts electrical energy into bright, warm light and heat through a tungsten filament!',
    functionAndUsage: 'I am the Incandescent Bulb! Electric current enters through one of my lead shoes, flows through my ultra-thin tungsten filament wire, and exits through the other shoe. As electrons push through, electrical resistance causes the tungsten wire to glow with bright golden light! I am non-polarized, meaning current can flow through me in either direction.',
    importance: 'Without light bulbs, our world would be in the dark! Incandescent bulbs teach the core principle of how electrical resistance generates light, used in flashlights, home lamps, automobile headlights, and appliances.',
    ratedPower: 'Rated Operating Range: 6.0V to 12.0V (Nominal: 9.0V) | Max Limit: 14.5V | Resistance: ~45–50 Ω (Hot) | Current: ~0.18–0.20A',
    idealPowerSource: 'A standard 9V Battery (PP3) or 4 to 6 AA Cells in series (6.0V to 9.0V).',
    storyForKids: 'Hello! I am the 9V Incandescent Lamp! Inside my glass dome is a tungsten filament that electric current heats to 2,000°C–2,500°C incandescence when powered by a 9V battery! My glass envelope naturally becomes warm and hot to the touch during normal operation. Connecting me directly to a matching 9V source applies nominal design voltage—I operate safely at my normal design temperature and will not burn out unless extreme overvoltage (>14.5V, such as two series 9V batteries delivering 18V) is applied!',
    dialogues: {
      greeting: "Hello! I am the 9V Incandescent Lamp! Electric current heats my tungsten filament to 2,000°C–2,500°C incandescence to generate warm, bright light.",
      askPower: "Connect me to my rated 9V battery or a 6V–12V power supply to see me shine with nominal incandescence!",
      happy: "Glowing brightly! Operating safely at nominal design voltage! My tungsten filament is glowing at ~2,400°C incandescence and my glass envelope is warm, just as intended!",
      dim: "Yawwn... I only have a tiny trickle of voltage (~1.5V). I am glowing very dim. Could you connect me to my matching 9V battery?",
      cryingWarning: "😭😭 WAAAAAH! OVERVOLTAGE! Over 14.5V applied! Double voltage quadruples heating power (P = V²/R)! Filament is exceeding its 3,422°C melting point! Disconnect before I snap! 💥",
      burningDeath: "AHHHH!! MY FILAMENT SNAPPED FROM SEVERE OVERVOLTAGE!! 18V WAS TOO MUCH!! 🔥💥",
      burntOut: "Sniff... My tungsten filament vaporized from extreme overvoltage. Please click 'Repair / Replace' to give me a new filament! 💔",
      reverseBiased: "I am non-polarized! My tungsten filament glows happily in both current directions!"
    }
  },

  led: {
    name: 'LED (Light Emitting Diode)',
    nick: 'LED',
    title: 'Light Emitting Diode',
    avatar: '🚨',
    voicePitch: 1.5,
    voiceRate: 1.08,
    superpower: 'Emits pure, colorful light with ultra-high energy efficiency!',
    functionAndUsage: 'I am the Light Emitting Diode (LED)! I am a semiconductor diode that releases photons of light when electrons cross my P-N junction. I am polarity-sensitive: current can ONLY enter my longer Anode leg (+) and exit my shorter Cathode leg (-). If connected backward, I block the current and stay off!',
    importance: 'LEDs light up smartphone screens, TV displays, modern car headlamps, and traffic signals. They consume 80% less power than old incandescent bulbs and last for decades.',
    ratedPower: 'Rated: 2.1V to 3.0V | Max Limit: 3.3V | Max Forward Current: 40mA (0.040A)',
    idealPowerSource: 'A 3V Coin Cell directly, OR a 9V Battery paired with a 220Ω Resistor!',
    storyForKids: 'Hello! I am the Light Emitting Diode, or LED! Inside my colored dome is a microscopic crystal chip. When electrons jump across the chip, they release photons of pure light! But I am very delicate: my crystal can only handle 2.1V to 3.0V. If you connect me directly to a 9V battery without a Resistor, 150mA of current will blast through and vaporize my crystal die in a split second!',
    dialogues: {
      greeting: "Hello friend! I am the Light Emitting Diode (LED)! I am an ultra-efficient semiconductor light source.",
      askPower: "I only need 2.1V to 3.0V! If you use a 9V battery, you MUST place a Resistor with me, or I will cry and burn!",
      happy: "✨ Sparkling brightly! Just the right voltage! My semiconductor crystal is singing with pure light!",
      dim: "I need at least 2.0V forward voltage to start conducting light. Please check that my battery is strong enough!",
      cryingWarning: "😭😭 NOOOOO!! EXCESS VOLTAGE WITHOUT A RESISTOR?! My safe limit is 3.3V! Massive current is melting my tiny crystal die! Disconnect me or add a Resistor before I explode!! 💥",
      burningDeath: "PO-P-PING!! MY SEMICONDUCTOR CRYSTAL HAS VAPORIZED!! I AM CHARRED ASH! 💥🔥",
      burntOut: "Sniff... My crystal die has melted open. Please click 'Repair / Replace' to give me a fresh new LED! 💔",
      reverseBiased: "Oops! My legs are backward! Current can only enter my Anode (+) and exit my Cathode (-). Please flip my wires!"
    }
  },

  battery: {
    name: '9V Battery',
    nick: '9V Battery',
    title: 'DC Power Source',
    avatar: '🔋',
    voicePitch: 1.1,
    voiceRate: 1.0,
    superpower: 'Pumps out a steady 9 Volts of Direct Current (DC) electromotive force!',
    functionAndUsage: 'I am the 9V Battery! Inside my case, chemical reactions push electrons out of my negative terminal (-) through the wires and loads of your circuit, and pull them back into my positive terminal (+).',
    importance: 'Batteries are the power source of portable electronics! Without a voltage source, electrons have no push, and all loads like bulbs and motors remain off.',
    ratedPower: 'Output Voltage: 9.0V DC | Internal Resistance: 1.5 Ω | Max Safe Continuous Current: ~0.5A',
    idealPowerSource: 'I am the power source! Pair me with loads like an Incandescent Bulb, DC Motor, or Resistor + LED.',
    storyForKids: 'Hello! I am the 9V Battery! Inside my body are six miniature 1.5V chemical cells linked together in series to create 9 Volts of pushing power! I am always ready to energize your circuits. But remember one critical safety rule: NEVER connect a wire directly from my (+) terminal to my (-) terminal with no load. That is a SHORT CIRCUIT, and it causes electrons to race so fast that my chemicals overheat and boil!',
    dialogues: {
      greeting: "Hello! I am the 9V Battery! I store chemical energy to supply a steady 9 Volts of Direct Current.",
      askPower: "I am the power source! Always connect my terminals through a load like a bulb or motor to do useful work safely!",
      happy: "⚡ Power flowing smoothly! Electrons are doing wonderful work out there in the circuit!",
      dim: "My chemical charge is steady at 9.0 Volts, ready to power your circuits!",
      cryingWarning: "⚠️ DANGER! SHORT CIRCUIT DETECTED! Zero resistance path between my terminals! Massive current is overheating my internal cells! Disconnect the short wire now!! 💥",
      burningDeath: "BATTERY CELLS RUPTURED FROM SHORT CIRCUIT! OVERHEATING EMERGENCY!! 🔥💥",
      burntOut: "My internal cells have boiled and blown out due to a dead short circuit. Please repair me!",
      reverseBiased: "I supply voltage from my positive (+) terminal to my negative (-) terminal!"
    }
  },

  cell: {
    name: '1.5V Cell (AA)',
    nick: '1.5V Cell',
    title: 'AA Chemical Cell',
    avatar: '🔋',
    voicePitch: 1.45,
    voiceRate: 1.08,
    superpower: 'Delivers a safe, friendly 1.5 Volts of Direct Current electricity!',
    functionAndUsage: 'I am the standard 1.5V AA Alkaline Cell! I have a golden nub on my positive terminal (+) and a flat base on my negative terminal (-). Connect multiple cells in series (positive touching negative) to add their voltages together!',
    importance: 'AA cells power TV remote controls, wall clocks, handheld game consoles, flashlights, and toys all over the world.',
    ratedPower: 'Output Voltage: 1.5V DC | Internal Resistance: 0.5 Ω',
    idealPowerSource: 'Self-contained chemical cell. Stack two for 3.0V, three for 4.5V, or four for 6.0V!',
    storyForKids: 'Hi! I am the 1.5V AA Cell! I may be small at 1.5 Volts, but I am super friendly! When you connect two of me head-to-toe in series (positive touching negative), our voltages add together: 1.5V + 1.5V = 3.0V! That is how toys combine multiple batteries to get the voltage they need!',
    dialogues: {
      greeting: "Hi! I am the 1.5V AA Cell! I supply a gentle 1.5 Volts of safe portable electricity.",
      askPower: "I provide 1.5 Volts! Connect multiple cells in series if your load needs 3V, 4.5V, or 6V!",
      happy: "Look at the electrons march! 1.5 Volts on duty! We are powering the circuit together!",
      dim: "I am a gentle 1.5V cell! For larger loads like bulbs, team me up with more cell friends!",
      cryingWarning: "⚠️ SHORT CIRCUIT! Electrons are looping right back between my terminals with no load! I am getting scorching hot! 😭",
      burningDeath: "POP! My chemical seal has ruptured from the short circuit! 🔥",
      burntOut: "My chemical energy has depleted and shorted. Click repair to put in a fresh cell!",
      reverseBiased: "Connect from my (+) positive nub to my (-) flat negative base!"
    }
  },

  cell3v: {
    name: '3V Coin Cell (CR2032)',
    nick: 'CR2032 Coin Cell',
    title: 'Li/MnO₂ Primary Lithium Coin Battery (20×3.2mm, 225mAh)',
    avatar: '🪙',
    voicePitch: 1.35,
    voiceRate: 1.02,
    superpower: 'Packs 3.0V nominal potential and 225mAh capacity with 18Ω ESR into an ultra-slim 20×3.2mm disc!',
    functionAndUsage: 'I am the authentic CR2032 Primary Lithium Coin Cell! Engineered with Lithium / Manganese Dioxide (Li/MnO₂) chemistry, I deliver 3.0V nominal potential (3.2V open circuit) and 225mAh capacity down to a 2.0V cut-off. Standard continuous drain is 0.2–0.3mA (max continuous 3.0mA, max pulse 10–50mA). My internal resistance (ESR ~18Ω) limits current naturally, making me the global standard for RTC clocks, key fobs, and direct LED circuits.',
    importance: 'Standardized by IEC 60086-3, the CR2032 is the most widely deployed coin battery in computer motherboard BIOS clocks, car keyless entry fobs, glucometers, heart-rate sensors, and IoT beacons.',
    ratedPower: 'Nominal Voltage: 3.0V (OCV 3.2V, Cutoff 2.0V) | Capacity: 225 mAh (210–240 mAh) | ESR: ~18 Ω (10–30 Ω) | Max Continuous: 3.0 mA | Max Pulse: 50 mA | Dimensions: Ø20.0 × 3.2 mm | Weight: 3.0 g | Temp: -20°C to +60°C',
    idealPowerSource: 'Self-contained primary Li/MnO₂ coin cell. Connect directly across LEDs or low-power micro-circuits!',
    storyForKids: 'Hello! I am the CR2032 Lithium Coin Cell! My name tells my exact size: 20 millimeters in diameter and 3.2 millimeters thin! Inside my shiny stainless steel case is high-density Li/MnO₂ chemistry delivering 3.0 Volts. Because my internal resistance is about 18 Ohms, I safely limit current for small LEDs without needing a resistor!',
    dialogues: {
      greeting: "Hello! I am the CR2032 3V Lithium Coin Cell! 20mm wide, 3.2mm flat, 225mAh capacity, and 18Ω internal ESR!",
      askPower: "I provide 3.0V nominal (3.2V open circuit). Keep continuous drain under 3.0mA for maximum multi-year lifespan!",
      happy: "Sparkling silver power! 3.0V Li/MnO₂ chemistry is delivering smooth, clean current under 3mA continuous!",
      dim: "My 3.0V Li/MnO₂ chemistry is delivering steady current. Voltage sag across my 18Ω ESR is normal under load!",
      cryingWarning: "⚠️ HIGH DRAIN WARNING! Drawing more than 3.0mA continuous causes significant internal ESR voltage sag and depletes capacity rapidly!",
      burningDeath: "CR2032 OVERLOADED OR SHORT-CIRCUITED! Exceeded 50mA pulse ceiling with rapid internal thermal surge! 🔥💥",
      burntOut: "My 225mAh lithium energy has discharged down to 2.0V cutoff. Click repair to insert a fresh cell!",
      reverseBiased: "Positive (+) is on my outer can and top face, negative (-) on my bottom center face!"
    }
  },

  motor: {
    name: 'DC Electric Motor',
    nick: 'DC Motor',
    title: 'Rotary Motor',
    avatar: '🌀',
    voicePitch: 1.25,
    voiceRate: 1.05,
    superpower: 'Transforms electrical energy into high-speed spinning mechanical rotation!',
    functionAndUsage: 'I am the DC Electric Motor! When electric current passes through my internal copper coils inside magnetic fields, electromagnetic forces push my central shaft to spin rapidly! If you swap my (+) and (-) wire connections, my magnetic fields reverse and I spin backward!',
    importance: 'Electric motors power electric vehicles, drone propellers, computer cooling fans, robot wheels, blender blades, and elevators worldwide.',
    ratedPower: 'Rated Operating Range: 3.0V to 9.0V | Max Limit: 12.0V | Resistance: 50 Ω | Current: ~0.15A',
    idealPowerSource: 'A 9V Battery or 4x AA Cells. Swap the two wires to reverse rotation direction!',
    storyForKids: 'Vrooom! I am the DC Electric Motor! I have fan blades on my shaft and copper wire windings inside my body. When electrons race through my coils, they turn into electromagnets that push against permanent magnets, making my shaft spin at thousands of RPM! If you reverse my wires, I spin counter-clockwise! But please do not give me more than 12 Volts, or my copper coils will cook and catch fire!',
    dialogues: {
      greeting: "Hello! I am the DC Electric Motor! Give me electricity and I will spin my fan blades using electromagnetism.",
      askPower: "I run best on 3V to 9V DC! My maximum safe voltage is 12V. Please do not give me two series 9V batteries (18V) or my windings will burn!",
      happy: "WHEEE! Spin, spin, spin! Look at my propeller go! Electromagnetism in full action!",
      dim: "Puff, puff... only 1.5V? My fan is barely turning. Feed me 6V or 9V for full rotational speed!",
      cryingWarning: "😭😭 HELP ME! TOO MUCH VOLTAGE!! 18 VOLTS?! I AM SPINNING AT 6,000 RPM AND MY COPPER WINDINGS ARE SMOKING! TURN IT OFF BEFORE I DIE!! 💥",
      burningDeath: "COPPER ARMATURE WINDINGS VAPORIZED!! SMOKE EVERYWHERE!! I AM BURNING OUT!! 🔥💥",
      burntOut: "Cough, cough... My copper windings melted into a dead short. Please click 'Repair / Replace' to rewind my motor!",
      reverseBiased: "Look! My polarity was flipped, so I am spinning in the reverse direction! ↺"
    }
  },

  diode: {
    name: 'Semiconductor Diode',
    nick: 'Diode',
    title: 'One-Way Gate',
    avatar: '🛑',
    voicePitch: 1.15,
    voiceRate: 1.02,
    superpower: 'Enforces strict one-way traffic: current can enter Anode (+), but NEVER return from Cathode (-)!',
    functionAndUsage: 'I am the Semiconductor Diode! I act like a one-way electrical check-valve. When connected in forward bias (Anode to positive, Cathode to negative), electrons pass through freely with only a 0.7V drop. If connected backward, my internal P-N barrier blocks all reverse current!',
    importance: 'Diodes protect delicate electronic circuits if a battery is accidentally inserted backward, and convert alternating current (AC) into direct current (DC) through rectification.',
    ratedPower: 'Forward Voltage Drop: ~0.7V | Resistance: 8 Ω | Max Forward Current: 0.8A',
    idealPowerSource: 'Must ALWAYS be connected in series with a load (like a bulb or motor)! Never directly across a battery!',
    storyForKids: 'Halt! I am the Semiconductor Diode! Notice the shiny silver stripe around my Cathode belt? That is my one-way sign! Electrons can enter my Anode (+) and flow out my Cathode (-). But if any electron tries to sneak in backwards, my barrier slams shut! Just remember: always connect a load with me. If you put me directly across a battery with no load, infinite current will rush through and melt my silicon junction in a fireball!',
    dialogues: {
      greeting: "Hello! I am the Semiconductor Diode! I allow electric current to pass only from Anode (+) to Cathode (-), and block all reverse current.",
      askPower: "I must be wired in series with a load like a bulb or motor! Never connect me straight across a battery without a load!",
      happy: "⚡ Forward bias established! Current is flowing safely through the one-way channel!",
      dim: "Standing guard. Ready to conduct forward current!",
      cryingWarning: "😭😭 NOOO! DIRECT SHORT CIRCUIT! Current is over 1.0 Amp with no load resistance! My silicon junction is boiling! DISCONNECT BEFORE I BLOW!! 💥",
      burningDeath: "SILICON JUNCTION MELTED AND DESTROYED BY SHORT CURRENT!! 🔥💥",
      burntOut: "My silicon gate has suffered thermal breakdown. Please click repair to replace me!",
      reverseBiased: "⛔ REVERSE BIASED! Cathode is facing positive! I am blocking all current like a solid wall! Flip my wires to proceed!"
    }
  },

  switch: {
    name: 'Single Pole Switch',
    nick: 'Single Pole Switch',
    title: 'Single Pole Switch (SPST)',
    avatar: '⚡',
    voicePitch: 1.3,
    voiceRate: 1.08,
    superpower: 'Opens and closes the circuit loop with an ultra-satisfying mechanical click!',
    functionAndUsage: 'I am the Single Pole Switch (SPST)! When my lever is open (OFF), an air gap breaks the conductive loop. When my lever is closed (ON), copper contacts touch, completing the conductive path!',
    importance: 'Single Pole Switches give humans control over when electricity flows, allowing devices to be turned on and off safely without unplugging wires.',
    ratedPower: 'Zero resistance when closed (0.1 Ω) | Infinite resistance when open.',
    idealPowerSource: 'Can be placed anywhere along any circuit loop between power and load.',
    storyForKids: 'Click-clack! I am the Single Pole Switch! Think of me as the drawbridge operator of the circuit! When my lever is open (OFF), the bridge is UP so electrons stop. When you click my lever closed (ON), the bridge lowers and electrons race across to light up bulbs and spin motors!',
    dialogues: {
      greeting: "Hello! I am the Single Pole Switch! Click my lever to open or close the electric loop and control the circuit!",
      askPower: "Place me anywhere in series between your battery and load so you can turn things on and off safely!",
      happy: "CLACK! Switch is CLOSED! Contacts are touching! Electrons are flowing freely across my copper contacts!",
      dim: "Click! Switch is OPEN! The air gap stops all electrons in their tracks! Safe and sound!",
      cryingWarning: "Whoa there! Check the circuit! If there is a short circuit, extreme current flows through my contacts!",
      burningDeath: "Sparks flew from an extreme overload! 🔥",
      burntOut: "My copper switch contacts have charred. Click repair to polish my switch!",
      reverseBiased: "I conduct in both directions when closed! Electricity flows freely either way!"
    }
  },

  twowayswitch: {
    name: 'Two-Way Switch (SPDT)',
    nick: 'Two-Way Switch',
    title: 'SPDT Switch',
    avatar: '🔀',
    voicePitch: 1.35,
    voiceRate: 1.05,
    superpower: 'Steers electric current between two different destinations with a single flick of a lever!',
    functionAndUsage: 'I am the Single Pole Double Throw (SPDT) Two-Way Switch! Current enters my Common (COM) terminal, and my moving blade can be flicked to connect either to Way 1 (L1) or to Way 2 (L2). Use me to toggle between two lights or control a stair light from two places!',
    importance: 'Two-way switches are used in household staircase lighting, car high/low beam selectors, and multi-mode electronic controllers.',
    ratedPower: 'Switching capacity for DC and AC circuits | 0.1 Ω contact resistance.',
    idealPowerSource: 'Connect COM to positive, L1 to one load, and L2 to another load!',
    storyForKids: 'Hello! I am the Two-Way Switch! Think of me like a railroad track switcher! When my lever points to Track L1, the electron train rolls down Route 1. Flip my lever to Track L2, and the train switches tracks to light up a different bulb instead! Two circuits controlled by one smart switch!',
    dialogues: {
      greeting: "Hello! I am the Two-Way Switch (SPDT)! With a flip of my lever, I steer current between Way 1 (L1) and Way 2 (L2)!",
      askPower: "Wire my COM terminal to your power source, and connect L1 and L2 to two different fun loads!",
      happy: "Path switched! Electrons are speeding down the chosen route with zero hesitation!",
      dim: "Toggled and ready! Which path would you like the current to travel next?",
      cryingWarning: "Extreme current surge detected across the switch contacts! 😭",
      burningDeath: "Switch contacts fused from overcurrent! 🔥",
      burntOut: "My moving blade contact has worn out. Please repair me!",
      reverseBiased: "I route current in both directions through whichever track is active!"
    }
  },

  pushbutton: {
    name: 'Pushbutton Switch',
    nick: 'Pushbutton',
    title: 'Pushbutton Switch (Normally Open)',
    avatar: '🔘',
    voicePitch: 1.32,
    voiceRate: 1.1,
    superpower: 'Completes the circuit with a spring-loaded tactile press!',
    functionAndUsage: 'I am the Pushbutton Switch! When pressed down, my spring-loaded copper disc bridges the internal contacts to let electrons flow. When released, my spring pops up, isolating the contacts!',
    importance: 'Pushbuttons are the foundation of keyboards, doorbells, game controllers, and emergency stop triggers worldwide.',
    ratedPower: '0.1 Ω contact resistance when pressed | Infinite resistance when released.',
    idealPowerSource: 'Place in series with a doorbell buzzer, horn, or momentary LED trigger!',
    storyForKids: 'Boing! Click! I am the Pushbutton Switch! Press me down and WHOOSH—the electrical bridge connects and the circuit comes alive! Release me, and my spring pops right back up to take a rest!',
    dialogues: {
      greeting: "Hello! I am the Pushbutton Switch! Click me to press down and complete the circuit!",
      askPower: "Wire me in series with a buzzer or lamp for instant push-to-activate fun!",
      happy: "CLICK! Button pressed down! Contacts bridging! Full current flow active!",
      dim: "Pop! Button released! Spring returns up, opening the gap!",
      cryingWarning: "Extreme current! Watch out for short circuits! 😭",
      burningDeath: "My internal spring and contacts melted from overcurrent! 🔥",
      burntOut: "My contacts are charred. Click to fix my button!",
      reverseBiased: "I conduct symmetrically in either direction when pressed!"
    }
  },

  resistor: {
    name: 'Fixed Resistor (220Ω)',
    nick: 'Fixed Resistor',
    title: 'Current Limiter',
    avatar: '🥋',
    voicePitch: 1.1,
    voiceRate: 0.98,
    superpower: 'Slows down rowdy electron streams to protect delicate components from frying!',
    functionAndUsage: 'I am the Fixed Resistor! Using Ohm’s Law (V = I × R), my carbon ceramic body creates electrical resistance that drops voltage and reduces current. I wear colorful stripes on my body that tell engineers my exact resistance value in Ohms (Ω)!',
    importance: 'Without resistors, sensitive components like LEDs, microchips, and sensors would instantly explode from excess current!',
    ratedPower: 'Resistance: 220 Ω (Adjustable) | Max Power Dissipation: 1.2 Watts (P = V × I)',
    idealPowerSource: 'Place me in series right before an LED when using a 9V battery!',
    storyForKids: 'Hello! I am the Fixed Resistor! Look at my colorful stripes: Red, Red, Brown, Gold! That color code means I provide 220 Ohms of resistance. When high-speed electrons from a 9V battery try to rush toward a fragile LED, I step into the path and gently slow them down, ensuring only a safe 20mA trickle gets through. I am the bodyguard that keeps everyone safe!',
    dialogues: {
      greeting: "Hello! I am the Fixed Resistor! My job is to protect delicate components by creating electrical resistance and slowing down rushing electrons according to Ohm's Law (V = I × R)!",
      askPower: "Pair me in series with high voltage sources (like 9V) to protect small loads like LEDs from blowing up!",
      happy: "220 Ohms of balanced harmony. Current is limited to a peaceful, safe flow.",
      dim: "Holding the line. Current is securely controlled through my carbon ceramic core.",
      cryingWarning: "😭😭 OUCH! OVERPOWER! Power dissipated exceeds my 1.2 Watt rating! My ceramic body is scorching hot! Remove the high voltage before I catch fire! 💥",
      burningDeath: "CARBON FILM INCINERATED BY EXCESS WATTS!! BURNT CRUST!! 🔥💥",
      burntOut: "My resistive carbon track has burned into an open circuit. Please click repair to restore me!",
      reverseBiased: "I am completely non-polarized! Electrons can pass in either direction with the exact same resistance."
    }
  },

  potentiometer: {
    name: 'Variable Resistor (Potentiometer)',
    nick: 'Potentiometer',
    title: 'Variable Resistor',
    avatar: '🎛️',
    voicePitch: 1.2,
    voiceRate: 1.05,
    superpower: 'Lets you smoothly tune resistance from 10Ω up to 2,000Ω by twisting a rotary knob!',
    functionAndUsage: 'I am the Variable Resistor, also called a Potentiometer! Inside me is a curved resistive track. As you rotate my knob, a conductive wiper slides along the track. Shorter track length means low resistance (loads run bright/fast); longer track length means high resistance (loads dim/slow down)!',
    importance: 'Potentiometers are used for audio volume knobs, light dimmer switches, fan speed controllers, and gaming joystick sensors.',
    ratedPower: 'Adjustable Range: 10 Ω to 2,000 Ω | Max Power: 2.0 Watts',
    idealPowerSource: 'Wire in series with bulbs, motors, or buzzers to smoothly control their intensity!',
    storyForKids: 'Hello! I am the Variable Resistor, or Potentiometer! Turn my dial! When you turn me down to low resistance, electrons rush through and bulbs glow super bright! When you turn me up to high resistance, electrons get slowed down and motors purr quietly. I put the volume of the circuit right at your fingertips!',
    dialogues: {
      greeting: "Hello! I am the Variable Resistor (Potentiometer)! Turn my rotary dial to smoothly adjust resistance from 10Ω to 2,000Ω to dim lights or adjust motor speed!",
      askPower: "Hook me up in series with a bulb or motor, then slide my resistance up and down to see them dim and slow!",
      happy: "Smooth tuning! Resistance dialed just right! Optimal energy distribution across the load!",
      dim: "Dial turned to high resistance! Current is gently restricted like a quiet whisper.",
      cryingWarning: "😭😭 WATCH OUT! Resistance set too low under high voltage! Power dissipation is melting my wiper contact! Turn up the resistance! 💥",
      burningDeath: "RESISTIVE WIPER TRACK BURNT BY HIGH CURRENT!! 🔥",
      burntOut: "My conductive wiper track has charred. Please repair me to spin the dial again!",
      reverseBiased: "Smooth resistance works identically in both current directions!"
    }
  },

  buzzer: {
    name: 'Electronic Buzzer',
    nick: 'Electronic Buzzer',
    title: 'Acoustic Sounder',
    avatar: '🔊',
    voicePitch: 1.5,
    voiceRate: 1.12,
    superpower: 'Vibrates a piezoelectric crystal 950 times per second to create audible alarm sounds!',
    functionAndUsage: 'I am the Electronic Buzzer! I convert electrical voltage into audible acoustic sound waves. Inside my round shell is a thin ceramic piezoelectric disc. When voltage pushes on the disc, it flexes back and forth rapidly, vibrating the air to make sound!',
    importance: 'Buzzers alert people in smoke detectors, microwave timers, alarm clocks, doorbell chimes, and game sound effects.',
    ratedPower: 'Rated: 5.0V to 9.0V | Max Limit: 12.0V | Resistance: 80 Ω',
    idealPowerSource: 'A 9V Battery or series AA cells. Connect me to a Single Pole Switch for an alarm system!',
    storyForKids: 'Beep-beep-boop! I am the Electronic Buzzer! Inside my shell is a wafer-thin disc made of piezoelectric crystal. When electrons arrive, the disc flexes and vibrates 950 times in a single second—pushing the air to create musical sound waves that your ears can hear! Just make sure not to give me over 12 Volts, or my sound crystal will crack and lose its voice!',
    dialogues: {
      greeting: "Hello! I am the Electronic Buzzer! When voltage tickles my piezoelectric crystal disc, I vibrate 950 times a second to make loud, cheerful alarm sounds!",
      askPower: "I sing loud and clear on 5V to 9V DC! Max limit is 12V. Do not connect two series 9V batteries to me!",
      happy: "♪ BEEP-BEEP-BEEP! ♪ Hear that crystal ring?! Sound waves vibrating through the air! Musical electronics!",
      dim: "Quiet and ready. Waiting to beep the instant current arrives!",
      cryingWarning: "😭😭 BEEP-BZZT-AHHH! TOO MUCH VOLTAGE!! 18 VOLTS IS CRACKING MY SOUND CRYSTAL!! TURN IT DOWN BEFORE I BLOW!! 💥",
      burningDeath: "CRYSTAL SOUND COIL BURNT OUT!! SILENCE!! 🔥💥",
      burntOut: "My piezoelectric acoustic disc has cracked. Please click repair to restore my voice!",
      reverseBiased: "Connect positive to my red wire terminal and negative to my blue wire terminal for max sound!"
    }
  },

  transformer: {
    name: 'Step-Down Transformer',
    nick: 'Step-Down Transformer',
    title: 'Step-Down Transformer',
    avatar: '⚡',
    voicePitch: 0.95,
    voiceRate: 0.95,
    superpower: 'Steps dangerous high AC voltages (230V) down into safe low voltages (12V) using magnetic fields!',
    functionAndUsage: 'I am the Step-Down Transformer! I have two copper wire coils wrapped around a laminated iron core. When alternating current (AC) enters my Primary Coil (many turns), it creates an oscillating magnetic field in the iron. That changing magnetic field induces a safe, low-voltage AC in my Secondary Coil (fewer turns)!',
    importance: 'Transformers make modern electricity possible! They step voltages up to travel efficiently across power lines, then step them down so you can safely plug in devices at home.',
    ratedPower: 'Primary: 230V AC | Secondary: 12V AC | Voltage Ratio: ~19:1',
    idealPowerSource: 'Connect Primary to an AC Voltage Supply. Connect Secondary to safe low-voltage loads!',
    storyForKids: 'Greetings! I am the Step-Down Transformer. Electricity from power plants travels at hundreds of volts—far too strong for small circuits! I have two sets of copper coils. I take the high 230V AC voltage in my primary coil, transfer the energy through invisible magnetic waves in my iron core, and supply a gentle 12V out of my secondary coil for your circuits to enjoy safely!',
    dialogues: {
      greeting: "Hello! I am the Step-Down Transformer! I use magnetic fields between two coils to safely step high 230V AC mains down into safe 12V AC for your circuits!",
      askPower: "Feed my Primary coil with AC voltage, and tap safe stepped-down voltage from my Secondary coil!",
      happy: "⚡ Magnetic flux humming smoothly! 230V in, 12V out! Perfect electromagnetic transformation!",
      dim: "Laminated iron core ready. Awaiting alternating current waves.",
      cryingWarning: "😭😭 OVERLOAD! Secondary short circuit is drawing massive current through my primary coil! Core is overheating! 💥",
      burningDeath: "COPPER COILS OVERHEATED AND MELTED INSULATION!! 🔥",
      burntOut: "My magnet wire insulation has melted into a short. Please click repair to rewind me!",
      reverseBiased: "I work exclusively with Alternating Current (AC) because changing magnetic flux is required!"
    }
  },

  ac_source: {
    name: 'AC Voltage Supply',
    nick: 'AC Voltage Supply',
    title: 'AC Voltage Generator',
    avatar: '🌊',
    voicePitch: 1.05,
    voiceRate: 1.0,
    superpower: 'Swings voltage back and forth like ocean waves 50 times every single second (50 Hz)!',
    functionAndUsage: 'I am the Alternating Current (AC) Voltage Supply! Unlike batteries which push Direct Current (DC) in one fixed direction, my voltage and current alternate smoothly between Line (L) and Neutral (N) in a continuous sine wave, 50 times per second (50 Hz).',
    importance: 'AC power runs every wall socket in homes, schools, and cities worldwide because AC can travel hundreds of miles over transmission grids with minimal energy loss.',
    ratedPower: 'Adjustable: 12V to 230V AC | Frequency: 50 Hz Sine Wave | Line (L) & Neutral (N)',
    idealPowerSource: 'I am the AC power supply! Connect me to a Step-Down Transformer to explore real-world power engineering.',
    storyForKids: 'Zap-hum! I am the AC Voltage Supply! Batteries only push electrons in one direction, but I make electrons dance back and forth between Line (L) and Neutral (N)! I push them forward, then pull them backward, repeating 50 times every second in smooth sine waves! Pair me with the Step-Down Transformer to explore real-world electricity!',
    dialogues: {
      greeting: "Hello! I am the AC Voltage Supply! Unlike DC batteries, my voltage swings back and forth between Line (L) and Neutral (N) in smooth sine waves 50 times per second (50 Hz)!",
      askPower: "I am the AC generator! Click my voltage buttons or type your desired AC voltage, and feed me through the Transformer!",
      happy: "🌊 50 Hz sine waves flowing rhythmically between Line (L) and Neutral (N)! Pure alternating electromagnetic harmony!",
      dim: "Generator oscillating at 50 cycles per second. Ready for AC circuit experiments!",
      cryingWarning: "⚠️ DIRECT AC SHORT CIRCUIT! Zero impedance loop detected across Line (L) and Neutral (N)! Breaker trip imminent! 😭",
      burningDeath: "AC POWER GENERATOR OVERHEATED FROM SHORT CIRCUIT ACROSS LINE AND NEUTRAL!! 🔥💥",
      burntOut: "Generator overload breaker triggered. Please click repair to reset me!",
      reverseBiased: "AC naturally alternates current continuously between Line (L) and Neutral (N) 50 times a second!"
    }
  },

  multimeter: {
    name: 'Digital Multimeter',
    nick: 'Multimeter',
    title: 'Diagnostic Master',
    avatar: '📟',
    voicePitch: 1.1,
    voiceRate: 1.0,
    superpower: 'Measures DC voltage, AC voltage, current, resistance, continuity with beeper, and diode drop!',
    functionAndUsage: 'I am the master electronic diagnostic tool! Connect wires to my V/Ω/mA (+) and COM (-) terminals to diagnose voltage drops, check loop current, test resistors, check continuity with an audible beep, or test diodes.',
    importance: 'The multimeter is the most vital instrument in electrical engineering for testing, troubleshooting, and verifying circuit behavior.',
    ratedPower: 'Multi-range diagnostic meter: 0-1000V DC/AC, 0-10A DCA, 0-10MΩ, Continuity beeper (<15Ω).',
    idealPowerSource: 'Powered by internal battery. Connect in parallel to measure voltage, or in series to measure current!',
    storyForKids: 'Beep beep! I am the Digital Multimeter, the circuit detective! With my two terminal probes (Red + and Black -), I can detect how many volts of push are in a wire, how many milliamps are racing by, check if a wire is safely connected with my happy beeper, and measure resistance!',
    dialogues: {
      greeting: "Hello! I am the Digital Multimeter! Connect wires to my terminals or use probes to inspect any circuit!",
      askPower: "Connect my Red (+) and Black (-) terminals across a component to measure voltage, or in series for current!",
      happy: "BEEP! Solid continuity and perfect circuit readings detected!",
      dim: "Zero potential detected — this loop is open or de-energized.",
      cryingWarning: "Warning: Never connect DCA current mode in parallel across a battery — that creates a short circuit!",
      burningDeath: "High energy surge damaged the meter internal fuse! 🔥",
      burntOut: "Blown fuse! Click repair to replace the multimeter fuse.",
      reverseBiased: "Negative voltage detected! Red probe is at a lower potential than COM."
    }
  },

  npn: {
    name: 'NPN Transistor',
    nick: 'NPN Transistor',
    title: 'Electronic Switch & Amplifier',
    avatar: '⚡',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'A tiny trickle of current at my Base pin opens a huge floodgate of current between Collector and Emitter!',
    functionAndUsage: 'I am the NPN Bipolar Junction Transistor! I have three vertical pins: Base, Collector, and Emitter. When a tiny voltage enters my Base, I switch ON and allow strong current to flow from Collector down to Emitter!',
    importance: 'Transistors are the foundation of all modern electronics! Computer microprocessors contain billions of miniature transistors switching on and off billions of times per second.',
    ratedPower: 'Max Collector Current: 200mA | Max Voltage: 40V | Threshold: V_BE >= 0.65V',
    idealPowerSource: 'Connect load to Collector (+), Emitter to ground (-), and trigger Base with a small signal through a resistor!',
    storyForKids: 'Hello! I am the NPN Transistor! Think of me as an electric valve or super-fast electronic switch. When you tickle my Base pin with a tiny bit of electricity, I open my floodgates and let current flow from my Collector down to my Emitter! Without me, computers, video games, and smartphones could never exist!',
    dialogues: {
      greeting: "Hello! I am the NPN Transistor! Feed a tiny current into my Base to switch on powerful circuit loads!",
      askPower: "Connect a load like a bulb or motor to my Collector, ground to my Emitter, and give my Base a small current through a resistor!",
      happy: "⚡ BASE TRIGGERED! Collector-Emitter channel wide open! Full current flowing to the load!",
      dim: "Base current is zero. I am in cutoff mode — switch is OFF.",
      cryingWarning: "⚠️ EXCESSIVE BASE CURRENT! You forgot a current-limiting Base resistor! My silicon junction is overheating! 😭",
      burningDeath: "SILICON JUNCTION MELTED FROM OVERCURRENT!! 🔥💥",
      burntOut: "My internal semiconductor die melted. Please click repair to replace me!",
      reverseBiased: "Base voltage must be higher than Emitter voltage for NPN conduction!"
    }
  },

  pnp: {
    name: 'PNP Transistor',
    nick: 'PNP Transistor',
    title: 'Active-Low Electronic Switch',
    avatar: '🔄',
    voicePitch: 1.1,
    voiceRate: 1.05,
    superpower: 'Switches ON when my Base is pulled LOW to ground, letting current rush from Emitter to Collector!',
    functionAndUsage: 'I am the PNP Transistor! Unlike my NPN brother, I am an active-LOW switch: when my Base is pulled down to a lower potential than my Emitter, I open up and conduct power from my Emitter down through to my Collector!',
    importance: 'PNP transistors are used in high-side power switches, push-pull audio amplifiers, and complementary logic paired with NPN transistors.',
    ratedPower: 'Max Current: 200mA | Max Voltage: 40V | Base Turn-on Threshold: V_E - V_B >= 0.65V',
    idealPowerSource: 'Connect Emitter to positive power supply, Collector to your load, and pull Base to ground through a resistor!',
    storyForKids: 'Hello! I am the PNP Transistor, the upside-down twin of NPN! While NPN turns ON when you give his base positive electricity, I turn ON when my Base is connected to negative (ground)! We work as a team in audio speakers and motor controllers!',
    dialogues: {
      greeting: "Hello! I am the PNP Transistor! Pull my Base down to ground to turn on the power from my Emitter to Collector!",
      askPower: "Connect Emitter to positive voltage, and pull Base low to turn on your load!",
      happy: "🔄 BASE PULLED LOW! Conducting power from Emitter to Collector smoothly!",
      dim: "Base is high. Channel is closed (cutoff mode).",
      cryingWarning: "⚠️ EXCESSIVE REVERSE CURRENT! Base junction is overheating! 😭",
      burningDeath: "PNP DIE VAPORIZED BY OVERHEATING!! 🔥💥",
      burntOut: "My silicon die is fried. Click repair to put in a fresh PNP transistor!",
      reverseBiased: "Emitter voltage must be higher than Base voltage for PNP conduction!"
    }
  },

  ldr: {
    name: 'LDR (Light Dependent Resistor)',
    nick: 'LDR Sensor',
    title: 'Optical Light Sensor',
    avatar: '☀️',
    voicePitch: 1.35,
    voiceRate: 1.08,
    superpower: 'Changes electrical resistance instantly when light photons strike my cadmium sulfide face!',
    functionAndUsage: 'I am the LDR (Light Dependent Resistor), also known as a Photoresistor! My resistance changes based on light! Under bright light from a bulb or flashlight, photons knock electrons free, dropping my resistance down to a few hundred ohms! In pitch dark, my resistance shoots up to 100,000 ohms (100kΩ)!',
    importance: 'LDRs automatically turn on streetlights at night, adjust smartphone screen brightness, detect sunlight in solar trackers, and trigger alarm lasers!',
    ratedPower: 'Dark Resistance: ~100 kΩ | Bright Light Resistance: ~150 Ω | Max Voltage: 100V | Max Power: 0.1W',
    idealPowerSource: 'Place me in series with a 9V Battery and LED or NPN transistor Base to build an automatic light/dark detector!',
    storyForKids: 'Hello! I am the LDR, the Light Dependent Resistor! I have a wavy snake pattern on my face made of light-sensitive crystal! When a glowing bulb or light comes close to me, photons hit my surface and make it super easy for electricity to flow (my resistance drops way down)! If you move the light away into darkness, I resist current strongly. Watch the little resistance box on my body change in real time as light changes!',
    dialogues: {
      greeting: "Hello! I am the LDR (Photoresistor)! Bring a glowing bulb near me and watch my resistance drop in real time!",
      askPower: "Wire me in series with a bulb or into a transistor Base, then move a glowing light source closer or farther!",
      happy: "☀️ Bright light detected! Photons are showering my surface! Resistance dropped down to low ohms!",
      dim: "🌑 Darkness detected! Resistance is high at 100,000Ω! Current cannot pass easily.",
      cryingWarning: "⚠️ DIRECT HIGH VOLTAGE OVERHEAT! Power dissipation is burning my photo-sensitive film! 😭",
      burningDeath: "CADMIUM SULFIDE FILM CRACKED AND BURNT! 🔥💥",
      burntOut: "My light-sensitive serpentine track has burned. Please click repair to restore my sight!",
      reverseBiased: "Light dependent resistance works identically in both current directions!"
    }
  },

  capacitor: {
    name: 'Electrolytic Capacitor',
    nick: 'Electrolytic Cap',
    title: 'Electrolytic Storage Capacitor (Al₂O₃ Dielectric & Polarized Casing)',
    avatar: '🔋',
    voicePitch: 1.25,
    voiceRate: 1.05,
    superpower: 'Stores massive electrical charge in an electrostatic field, powers loads during outages, and smooths out AC ripple into steady DC!',
    functionAndUsage: 'I am the Electrolytic Storage Capacitor! Engineered with two conductive aluminum foil plates separated by paper soaked in a liquid/gel electrolyte. An extremely thin aluminum oxide (Al₂O₃) dielectric is formed electrochemically on my anode foil, yielding exceptionally high capacitance (1µF to 10,000µF+) in a compact volume.\n\n• Polarity: I am strictly polarized! Connecting me in reverse dissolves my insulating oxide layer, generating pressurized hydrogen gas and blowing my top safety vent!\n• Impedance: Wound foil construction introduces moderate Equivalent Series Resistance (ESR ~0.02Ω to 8Ω) and ESL (~20nH). Above a few hundred kHz, parasitic inductance causes impedance to rise, making me ineffective against sharp RF noise.\n• Roles: Bulk smoothing after AC diode bridge rectifiers, transient energy reservoir preventing rail droop during sudden current loads, and audio AC coupling down to 20Hz.',
    importance: 'Capacitors are in virtually every electronic device on Earth! They filter power supplies, keep computer memory active during brief power glitches, tune radio frequencies, and store burst energy for camera flashes and audio amplifiers.',
    ratedPower: 'Standard Capacitance: 1µF – 10,000µF (E6/E12 Series) | WVDC: 6.3V, 10V, 16V, 25V, 35V, 50V, 63V, 100V | ESR: 0.02Ω – 8Ω | ESL: ~20nH | Polarity: Strictly Polarized (+ Anode, − Cathode)',
    idealPowerSource: 'A 1.5V to 100V DC power source, or downstream of a Rectifier Diode to smooth AC ripples. Never reverse polarity or exceed working voltage!',
    storyForKids: 'Hello! I am the Electrolytic Capacitor! Think of me as a rechargeable electrical water tank! When you connect a battery to me, I soak up electrical charge until I am full of voltage. Then, if you disconnect the battery and connect me to an LED or light bulb, I will squeeze out my stored electricity and keep the LED glowing until my energy runs out! But remember my safety rules: I have polarity (+ and −). If you connect me backwards or give me more than my rated voltage (or plug me into 230V AC!), my safety vent will burst open with a loud POP and smoke! 💥',
    dialogues: {
      greeting: "Hello! I am the Electrolytic Storage Capacitor! I store massive DC charge in an electrostatic field and release it smoothly to power circuits and filter AC ripples.",
      askPower: "Connect me across a DC power source up to my rated voltage to charge my plates! Or put me across an LED to see me power it when the battery is removed!",
      happy: "⚡ Fully charged and energized! Holding stored voltage ready to discharge into loads or smooth out power ripples!",
      dim: "Charging up... Electrons are gathering on my plates as my stored voltage rises!",
      cryingWarning: "😭😭 POP! SZZZZT! THE VOLTAGE EXCEEDS MY SAFE LIMIT!! My aluminum casing is swelling and my safety vent is tearing open! Disconnect the high voltage before I explode into foil and paper! 💥",
      burningDeath: "POW!! MY DIELECTRIC LAYER PUNCTURED! MY SAFETY VENT BURST OPEN WITH SMOKE!! 💥🔥",
      burntOut: "Sniff... My dielectric oxide layer broke down from excessive voltage. Please click 'Repair / Replace' to install a fresh capacitor! 💔",
      reverseBiased: "⚠️ REVERSE POLARITY HAZARD! Current is entering my negative stripe cathode lead! Flip my wires before my oxide layer dissolves!"
    }
  },

  ceramic_capacitor: {
    name: 'Ceramic Capacitor',
    nick: 'Ceramic Disc / MLCC',
    title: 'Ceramic Disc / MLCC Capacitor (EIA Standard Codes: 101 to 106)',
    avatar: '🟡',
    voicePitch: 1.45,
    voiceRate: 1.15,
    superpower: 'Lightning-fast high-frequency response! Decouples noise, bypasses unwanted AC chatter, couples audio signals, and is completely non-polarized!',
    functionAndUsage: 'I am the Ceramic Disc / MLCC Capacitor! Built using interleaved metal electrode layers separated by high-dielectric ceramic material (Class 1 C0G/NP0 for precision timing, Class 2 X5R/X7R for compact high capacitance).\n\n• Polarity: Completely non-polarized! You can connect my symmetrical leads in either direction and handle bidirectional AC signals without degradation.\n• Impedance: Stacked planar structure yields ultra-low ESR (~0.01Ω) and ESL (~0.9nH), maintaining capacitive behavior well into hundreds of megahertz before self-resonance.\n• Roles: High-frequency IC power pin decoupling/bypassing (typically 0.1µF / 100nF), snubbers & RF noise suppression, timing and resonant tanks with inductors.\n• DC Bias Derating: Under high DC voltage, Class 2 ceramics experience moderate effective capacitance drop (ferroelectric domain saturation).',
    importance: 'Ceramic capacitors are the single most numerous electronic components manufactured on Earth—trillions are made each year! Every smartphone, computer, and circuit board has hundreds of ceramic capacitors filtering high-frequency noise and stabilizing chip voltages.',
    ratedPower: 'Standard 50V DC Rating (25V/50V/100V) | Non-Polarized | EIA Codes: 101 (100pF) to 106 (10µF) | ESR: ~0.015Ω | ESL: ~0.9nH | Self-Resonance: >15 MHz',
    idealPowerSource: 'Low-voltage DC or AC signals up to 50V. Non-polarized: works identically in both orientations!',
    storyForKids: 'Hi there! I am the Ceramic Disc Capacitor! See that orange disc? That is high-tech ceramic! I am super fast—much faster than big electrolytic cans. When electricity rushes in, I react in nanoseconds! People love using me for radio tuning, audio filters, and cleaning up noisy electrical static. Best of all: I am NON-POLARIZED! You do not have to worry about positive or negative leads with me—flip me around any way you like!',
    dialogues: {
      greeting: "Hello! I'm the Ceramic Capacitor! Look for my 3-digit code stamped on my face: 104 means 100nF (0.1µF), 103 means 10nF!",
      askPower: "Connect my two leads into the circuit! I am non-polarized, so any direction works perfectly!",
      happy: "⚡ High-frequency signal passing clean and noise-free! My ceramic dielectric is filtering out all the jitter!",
      dim: "Ready for action! Non-polarized, so connect my two leads however you like!",
      cryingWarning: "⚠️ VOLTAGE APPROACHING 50V! Keep me below 50V DC to protect my ceramic crystal barrier!",
      burningDeath: "CRACK!! HIGH VOLTAGE PUNCTURED MY CERAMIC DISC! 💥",
      burntOut: "My ceramic disc cracked from excessive voltage. Click 'Repair / Replace' to pop in a fresh 104 ceramic cap!",
      reverseBiased: "I am completely non-polarized! Current flows smoothly in both directions through my ceramic disc!"
    }
  },

  solenoid: {
    name: 'Solenoid / Electromagnet',
    nick: 'Solenoid',
    title: 'Electromagnetic Actuator (B = μ·n·I) & Pinball Flipper',
    avatar: '🧲',
    voicePitch: 1.0,
    voiceRate: 1.0,
    superpower: 'Transforms electric current into magnetic flux (B = μ·n·I) to pull pinball flippers and activate heavy crane electromagnets!',
    functionAndUsage: 'I am the Solenoid and Electromagnet! When electric current flows through my tightly wound copper wire coil, Ampere\'s Law creates an intense magnetic field B = μ·n·I inside my cylindrical core. This magnetic field exerts mechanical pull force F proportional to current squared (I²). In pinball games, I snap the flipper arm down; in automated cranes, I lift metallic scrap!',
    importance: 'Solenoids and electromagnets power car starter motors, washing machine water valves, door buzzers, MRI scanners, and industrial robotic pick-and-place grippers.',
    ratedPower: 'Coil Resistance: 20Ω • 500 Turns • Max Voltage: 18V DC • Rated Current: 0.45A - 0.9A',
    idealPowerSource: 'A 9V to 12V DC power source. Reversing polarity still pulls the ferromagnetic plunger inward!',
    storyForKids: 'Hello! I am the Solenoid! Have you ever seen a pinball flipper snap up and launch a ball? CLACK! That was me! When electricity rushes through my copper wire coil, I become a powerful magnet in a millisecond. When you turn off the power, my spring pulls me right back to resting position!',
    dialogues: {
      greeting: "Hello! I am the Solenoid! Send current through my coil to generate magnetic field B = μ·n·I and pull the flipper arm!",
      askPower: "Connect a 9V Battery to my two coil leads! Watch my plunger pull in with mechanical force!",
      happy: "⚡ Magnetic field activated! Plunger pulled in tight and pinball flipper snapped!",
      dim: "Standing by with spring relaxed. Send current to magnetize my iron core!",
      cryingWarning: "😭😭 WAAAAH! VOLTAGE ABOVE 18V! My copper windings are overheating from high current! Shut off the power!",
      burningDeath: "SIZZLE!! EXCESSIVE JOULE HEAT (P = I²R) BURNED MY COIL WINDINGS! 💥🔥",
      burntOut: "My copper wire coil melted from excessive current. Click 'Repair / Replace' to install a fresh solenoid! 💔",
      reverseBiased: "Electromagnets pull iron in either polarity! Current flows smoothly through my coil."
    }
  },

  rectifier: {
    name: 'Bridge Rectifier Module',
    nick: 'Graetz Bridge',
    title: 'Full-Wave Graetz Bridge Rectifier Module',
    avatar: '💎',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'Directs both positive and negative AC alternating half-cycles into unidirectional pulsating DC electricity!',
    functionAndUsage: 'I am the Bridge Rectifier Module! Inside my compact 4-pin package are four semiconductor diodes arranged in a closed Graetz diamond ring. During the positive half-cycle, diodes D1 and D2 conduct; during the negative half-cycle, diodes D3 and D4 conduct. The result is continuous full-wave DC voltage across my (+) and (-) output pins!',
    importance: 'Virtually every plugged-in electronic appliance (phone chargers, laptops, TVs) starts with a bridge rectifier to convert AC wall mains into DC electricity.',
    ratedPower: 'Forward Voltage Drop: 1.4V (2x 0.7V diodes) • Max AC Voltage: 50V RMS • Max Current: 1.5A',
    idealPowerSource: 'AC Voltage from a Step-Down Transformer (e.g. 12V AC). Connect AC input across ~1 and ~2; connect DC load across (+) and (-)!',
    storyForKids: 'Hi! I am the Bridge Rectifier! Alternating Current (AC) shakes back and forth 50 times every second. But delicate electronics like LEDs and phones need Direct Current (DC) flowing in one single direction. My four one-way diode gates direct every wave of electricity into the positive terminal!',
    dialogues: {
      greeting: "Hello! I am the Bridge Rectifier! Connect AC to my ~ pins, and get smooth DC power from my (+) and (-) pins!",
      askPower: "Feed AC power from the Transformer into my AC pins, then connect a Bulb or LED to my DC terminals!",
      happy: "⚡ Full-Wave Bridge Rectification active! Both AC half-cycles steered in the same direction!",
      dim: "Ready to rectify! Connect AC inputs on the left, DC loads on the right.",
      cryingWarning: "⚠️ Current approaching 1.5A maximum rating! Limit output load resistance to prevent thermal overload!",
      burningDeath: "POW!! DIRECT SHORT ACROSS DC OUTPUT MELTED THE INTERNAL SILICON DIODES! 💥",
      burntOut: "My internal diodes were destroyed by excessive current. Click 'Repair / Replace' to replace the rectifier module!",
      reverseBiased: "I am a full bridge! Alternating current is welcomed on my AC input terminals."
    }
  },

  inductor: {
    name: 'Power Choke Inductor',
    nick: 'Indy the Inductor',
    title: 'Toroidal/Rod Power Choke (Faraday & Lenz)',
    avatar: '🌀',
    voicePitch: 0.95,
    voiceRate: 1.0,
    superpower: 'Opposes sudden current changes and stores electrical energy in a magnetic field (E = ½·L·I²)!',
    functionAndUsage: 'I am the Inductor (Choke Coil)! Wound with enameled heavy copper magnet wire around a high-permeability cylindrical ferrite rod core, my inductance L produces back-electromotive force (v = -L·di/dt) according to Faraday and Lenz\'s laws. In DC circuits, I let steady current flow freely with minimal DC winding resistance (R_DCR) while storing magnetic energy. In AC circuits, I act as an inductive choke with reactance X_L = 2πfL, blocking high-frequency AC noise and ripple!',
    importance: 'Inductors are fundamental passive components alongside resistors and capacitors, crucial in power supplies, buck/boost converters, radio tuners (LC tanks), and EMI noise filter chokes.',
    formula: 'v_L = L · (di/dt)  •  E_mag = ½ · L · I²  •  X_L = 2π · f · L',
    ratedPower: 'Rated Safe DC Current: 3.5A (Saturation Limit I_sat) • Max Working Voltage: 50V • DCR: 0.05Ω to 25Ω',
    idealPowerSource: 'Any DC source (paired with a load/resistor) or AC supply to demonstrate inductive reactance and low-pass filtering!',
    storyForKids: 'Spin, swirl, and store! I am Indy the Inductor! Think of me like a heavy electrical flywheel. When electrons start flowing, I resist them at first by winding up my invisible magnetic field! Once running, I keep them cruising smoothly. If someone suddenly turns off the power, WHOOSH! My collapsing magnetic field kicks out an inductive spark to keep electrons moving!',
    dialogues: {
      greeting: "Hello! I am Indy the Inductor! Connect my copper leads to smooth current and store magnetic energy (E = ½·L·I²)!",
      happy: "🌀 Magnetic field spinning smoothly! Steady current cruising through my copper coil with low DC resistance!",
      crying: "😭😭 SIZZLE! Current is exceeding my core saturation rating! My enamel insulation is overheating! Reduce current!",
      burntOut: "My copper wire coil melted from excessive current beyond my saturation rating. Click 'Repair / Replace' to install a fresh inductor! 💔",
      acChoke: "⚡ High-frequency AC blocked! Inductive reactance X_L = 2π·f·L is filtering out alternating ripple!"
    }
  },

  ammeter: {
    name: 'Precision Ammeter',
    nick: 'Ampere',
    title: 'Series Current Meter (0.01Ω Shunt)',
    avatar: '🅰️',
    voicePitch: 1.05,
    voiceRate: 1.0,
    superpower: 'Measures electric charge rate (electrons per second) flowing through the circuit branch in Amperes!',
    functionAndUsage: 'I am the Ammeter! I must always be connected in SERIES with the circuit path. My ultra-low internal shunt resistance (0.01Ω) allows current to pass virtually undisturbed while measuring total electron flow in Amperes or Milliamperes.',
    importance: 'Ammeters are essential for monitoring current draw, preventing component overload, and testing circuit loads.',
    formula: 'I = Q / t  •  P_shunt = I² · R_shunt',
    ratedPower: 'Max Rated Current: 10A • Internal Shunt: 0.01Ω • Max Voltage: 50V',
    idealPowerSource: 'Connect in series with any load powered by a DC or AC source!',
    storyForKids: 'Count the electron parade! I am Ampere the Ammeter! Connect me right IN-LINE with the wire so all the electrons pass through me. I display exactly how many Amps are zooming through!',
    dialogues: {
      greeting: "Hello! I am Ampere the Ammeter! Connect me in SERIES to measure circuit current!",
      happy: "⚡ Current flowing smoothly! Measuring electron stream accurately!",
      crying: "😭😭 DANGER! OVER 10 AMPS! Shunt is overheating! Reduce current before my fuse blows! 💥",
      burntOut: "My 10A internal protection fuse blew from massive overcurrent! Click 'Repair' to replace the fuse!"
    }
  },

  voltmeter: {
    name: 'Precision Voltmeter',
    nick: 'Volta',
    title: 'Parallel Voltage Potential Meter (10MΩ)',
    avatar: '🆅',
    voicePitch: 1.1,
    voiceRate: 1.0,
    superpower: 'Measures electrical potential difference (pressure) between any two points without disturbing current flow!',
    functionAndUsage: 'I am the Voltmeter! I must always be connected in PARALLEL across a component or power supply. With my massive 10 Megohm (10MΩ) internal resistance, I draw virtually zero current while precisely measuring the voltage drop or potential difference in Volts.',
    importance: 'Voltmeters diagnose battery health, confirm power rail levels, and verify Kirchhoff\'s Voltage Law (KVL) across series and parallel networks.',
    formula: 'V = W / Q  •  V_drop = V_pos - V_neg',
    ratedPower: 'Measurement Range: 0 to 50V DC • Internal Impedance: 10 MΩ',
    idealPowerSource: 'Connect in parallel across any component, battery, or circuit branch!',
    storyForKids: 'Feel the electrical push! I am Volta the Voltmeter! Connect my (+) and (-) probes across any part of your circuit to see the voltage push!',
    dialogues: {
      greeting: "Hello! I am Volta the Voltmeter! Connect me in PARALLEL across any part to measure voltage!",
      happy: "⚡ Voltage detected! Reading electrical potential difference cleanly with 10MΩ high impedance!",
      crying: "😭😭 OVERVOLTAGE! Potential difference exceeds 50V safe limit! Disconnect high voltage!",
      burntOut: "My internal sense circuit was damaged by excessive voltage. Click 'Repair' to restore me!"
    }
  },

  wattmeter: {
    name: 'Digital Wattmeter',
    nick: 'Watt',
    title: 'Digital Active Power Analyzer (P = V × I)',
    avatar: '⚡',
    voicePitch: 1.0,
    voiceRate: 1.0,
    superpower: 'Calculates active electrical power consumption P = V × I in Watts and Kilowatts!',
    functionAndUsage: 'I am the Wattmeter! I monitor both voltage across the load and current flowing through the load simultaneously, multiplying them in real-time to compute true electrical power consumption: P = V · I in Watts (W) and energy in Joules.',
    importance: 'Watts tell you how fast energy is being consumed or converted into light, heat, or mechanical motion. Essential for energy efficiency and load rating.',
    formula: 'P = V · I = I² · R = V² / R',
    ratedPower: 'Max Power: 250W • Max Voltage: 50V • Max Current: 10A',
    idealPowerSource: 'Wire between any power source and load to analyze true power consumption!',
    storyForKids: 'Power power everywhere! I am Watt the Wattmeter! When volts push and amps flow, work is being done! I tell you exactly how many Watts of energy your light bulbs, motors, and circuits are using!',
    dialogues: {
      greeting: "Hello! I am Watt the Wattmeter! Connect my IN terminals to power and OUT terminals to load to measure Watts!",
      happy: "⚡ Real-time power calculated: P = V × I! Displaying active Watts cleanly!",
      crying: "😭😭 OVERPOWER! Over 250W load detected! Excessive heat is building up! Reduce load!",
      burntOut: "Wattmeter internal shunt melted from extreme wattage. Click 'Repair' to restore!"
    }
  },

  power_supply: {
    name: 'Regulated DC Power Supply',
    nick: 'Reggie',
    title: '0–50V DC, 0–5A Precision Lab Bench Supply',
    avatar: '🎛️',
    voicePitch: 0.92,
    voiceRate: 1.0,
    superpower: 'Provides ultra-clean adjustable DC voltage from 0 to 50 Volts with precision 0 to 5 Amp current limiting and CC/CV regulation!',
    functionAndUsage: 'I am the Precision Regulated DC Power Supply! A core instrument in every electronics lab. Dial in any output voltage from 0.0V to 50.0V DC and set a safe current limit from 0.00A to 5.00A. In Constant Voltage (CV) mode, I hold the voltage steady. If a circuit attempts to pull more than the limit, I automatically switch to Constant Current (CC) mode, throttling voltage down to protect your components!',
    importance: 'The heartbeat of any electronics workbench. Safely powers breadboard circuits, prototypes, motors, and microcontrollers with overcurrent protection.',
    formula: 'V_out = V_set (CV mode)  •  I_out = I_limit (CC mode)  •  P = V · I',
    ratedPower: 'Adjustable Voltage: 0.0V to 50.0V DC • Adjustable Current Limit: 0.00A to 5.00A (250W max)',
    idealPowerSource: 'Mains-powered benchtop instrument with floating (+) and (-) DC outputs and Earth GND binding post!',
    storyForKids: 'I am Reggie the Regulated Power Supply! With me, YOU are the master of electricity! Adjust my Voltage and Current Limit to power any circuit safely!',
    dialogues: {
      greeting: "Hello! I am the Regulated DC Power Supply! Adjust my Voltage (0-50V) and Current Limit (0-5A) to power your creations!",
      happy: "⚡ Regulated DC Power Supply active in CV (Constant Voltage) mode! Delivering clean, ripple-free DC power!",
      crying: "⚠️ CC (Constant Current) mode activated! Load is attempting to exceed current limit! Output voltage throttled!",
      burntOut: "Internal thermal breaker tripped from severe overload. Click 'Repair' to reset the power supply!"
    }
  },
  fuse: {
    name: 'Protective Glass Fuse',
    nick: 'Felix',
    title: 'Sacrificial Overcurrent Circuit Guardian',
    avatar: '🛡️',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'Sacrificial Current Sentinel! Intentionally melts its delicate internal wire in milliseconds whenever branch current exceeds its safety rating, instantly opening the circuit to protect expensive components from burning!',
    functionAndUsage: 'I am a protective fast-acting glass cartridge fuse! Always connect me in SERIES with the power path or load. Adjust my current rating (0.1A to 10.0A) to match your safe limit. If current exceeds that threshold, I blow immediately and break the path!',
    importance: 'Fuses are indispensable safety components in electronics, automotive wiring, power supplies, and home electrical panels to prevent catastrophic short circuits and electrical fires.',
    formula: 'Joule Melting Integral: Q = ∫ I² dt  •  Blows when I_branch > I_rating',
    ratedPower: '0.1A to 10.0A Adjustable Current Rating (250V AC/DC Rated)',
    idealPowerSource: 'In series with any DC or AC circuit power rail up to 250V',
    storyForKids: 'I am Felix the Fuse! Think of me as the superhero bodyguard of your circuit. When the electrons get too wild and rush in like a tidal wave, my tiny wire bravely melts to stop them before any other component gets hurt!',
    dialogues: {
      greeting: "Hello! I am Felix the Fuse! Set my current limit and I will guard your circuit from overcurrent hazards!",
      happy: "🛡️ Fuse wire is intact and conducting safely within rated limits!",
      crying: "⚠️ Branch current is approaching my safety limit! Danger of blowing!",
      burntOut: "💥 POP! Fuse wire melted from overcurrent! Circuit is safely disconnected! Replace the fuse wire to reset!"
    }
  },
  function_generator: {
    name: 'Function Generator',
    nick: 'Frank the Function Generator',
    title: 'Benchtop Precision Signal & Arbitrary Waveform Synthesizer',
    avatar: '〰️',
    voicePitch: 1.05,
    voiceRate: 1.0,
    superpower: 'Synthesizes clean Sine, Square, Triangle, and Ramp waveforms from 0.1 Hz to 100 kHz with adjustable Vpp amplitude and DC offset!',
    functionAndUsage: 'I am a benchtop laboratory Function / Signal Generator! I generate periodic alternating voltage waveforms to test filters, amplifiers, speakers, capacitors, and frequency response.',
    importance: 'Function generators are fundamental in electronics labs worldwide for designing audio gear, tuning radio receivers, analyzing filter bandwidth, and stressing digital clock circuits.',
    formula: 'Sine: V(t) = V_offset + (V_pp/2)·sin(2πft)  •  Reactance: Xc = 1/(2πfC), Xl = 2πfL',
    ratedPower: '0.1 Hz to 100 kHz | 0.1 Vpp to 20 Vpp (50Ω / High-Z Output)',
    idealPowerSource: 'Laboratory Signal Source. Connect Main Out to your circuit and GND to circuit ground.',
    storyForKids: 'Hello! I am the Function Generator! Think of me as a musical maestro that can whistle any shape of electrical wave you desire! I can produce gentle rolling ocean waves (Sine), sharp castle battlements (Square), pointy mountain peaks (Triangle), or climbing stairs (Ramp)! You can dial my speed from super-slow flashes to high-pitch whistling tones!',
    dialogues: {
      greeting: "Hello engineer! I am your benchtop Function Generator. Choose a waveform, dial the frequency and amplitude, and let's make some waves!",
      happy: "〰️ Synthesizing clean waveform output! Electrons are oscillating back and forth at exact frequency!",
      crying: "⚠️ Output overload! Current limit exceeded on 50Ω termination! Check load impedance!",
      burntOut: "Short-circuit overload damaged output driver! Click Repair to reset output stage."
    }
  },
  oscilloscope: {
    name: 'Digital Storage Oscilloscope',
    nick: 'Ozzy the Oscilloscope',
    nickname: 'Ozzy the Oscilloscope',
    title: 'Precision Dual-Channel Digital Storage Oscilloscope (DSO)',
    avatar: '📈',
    voicePitch: 1.12,
    voiceRate: 1.0,
    superpower: 'Captures and visualizes invisible voltage waveforms in real time! Analyzes frequency, peak-to-peak voltage, and harmonic ripples across two isolated channels!',
    functionAndUsage: 'I am a benchtop Digital Storage Oscilloscope! I graph voltage on the vertical (Y) axis against time on the horizontal (X) axis. Connect my CH1 or CH2 probe to any circuit node and GND to circuit reference to see the live waveform!',
    importance: 'Oscilloscopes are the ultimate diagnostic tool in electrical engineering. They let you debug digital clock pulses, inspect AC rectification ripple, measure audio waveforms, and verify circuit stability.',
    formula: 'Timebase: T_screen = 10 · Time/Div  •  V_pp = V_max - V_min  •  f = 1 / T_period',
    ratedPower: 'Dual Channel (CH1 Yellow / CH2 Cyan) | 10 µs/div to 500 ms/div | 50 mV to 10 V/div | 1 MΩ Input Impedance',
    idealPowerSource: 'High-Impedance Measurement Instrument. Connect CH1 probe to signal and GND alligator clip to circuit ground.',
    storyForKids: 'Hello! I am Ozzy the Oscilloscope! Think of me as a super-fast slow-motion movie camera for electricity! When electricity rushes back and forth thousands of times a second, human eyes and regular meters can only see a blur. But I freeze time and paint gorgeous glowing fluorescent waves right on my screen!',
    educationalStory: 'Hello! I am Ozzy the Oscilloscope! Think of me as a super-fast slow-motion movie camera for electricity! When electricity rushes back and forth thousands of times a second, human eyes and regular meters can only see a blur. But I freeze time and paint gorgeous glowing fluorescent waves right on my screen!',
    dialogues: {
      greeting: "Hello engineer! Ozzy the DSO online and calibrated. Connect CH1 or CH2 to your circuit and let's watch some electrons dance!",
      happy: "📈 Trigger locked! Crystal-clear waveform captured with crisp edges and zero jitter!",
      crying: "⚠️ Input voltage exceeds maximum rating! Increase Volts/Div scale or check probe ground!",
      burntOut: "Excessive input voltage damaged frontend ADC! Click Repair to recalibrate."
    }
  },
  gate_and: {
    name: 'AND GATE',
    nick: 'AND GATE',
    title: 'AND Gate',
    avatar: '🔣',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'Outputs Logic HIGH (5.0V) ONLY when BOTH Input A AND Input B are simultaneously HIGH (1)!',
    functionAndUsage: 'I am the AND Gate. In digital computing, I implement logical conjunction (Y = A · B). My output stays at 0V until both input pins reach logic high (≥ 1.5V).',
    importance: 'The fundamental building block of digital computers, binary adders, address decoders, and conditional control circuits.',
    formula: 'Boolean: Y = A · B (Both inputs must be 1 for output to be 1)',
    ratedPower: 'CMOS Series | Vcc: 2V - 6V (Nominal 5.0V) | Output: ±25mA | Propagation Delay: 9ns',
    idealPowerSource: 'Logic Input: 0V (LOW) to 5.0V (HIGH). Direct output drives LEDs, logic ICs, and transistors.',
    dialogues: {
      greeting: "Hello engineer! I am the AND Gate. I only fire HIGH when all my inputs agree on 1!",
      happy: "🔣 Both inputs HIGH! Output saturated at Logic 1 (+5.0V)!",
      crying: "⚠️ Input voltage exceeds Vcc rating! Keep inputs within 0V to 5.0V.",
      burntOut: "Internal input electrostatic protection damaged! Click Repair to replace."
    }
  },
  gate_or: {
    name: 'OR GATE',
    nick: 'OR GATE',
    title: 'OR Gate',
    avatar: '🔣',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'Outputs Logic HIGH (5.0V) whenever AT LEAST ONE input (A OR B) is HIGH (1)!',
    functionAndUsage: 'I am the OR Gate. I implement logical disjunction (Y = A + B). If either input A, input B, or both are HIGH (1), my output drives +5.0V!',
    importance: 'Used in alert systems, interlocks, multiplexers, and logic branching where any triggered sensor must activate a response.',
    formula: 'Boolean: Y = A + B (Output is 1 if A is 1 OR B is 1)',
    ratedPower: 'CMOS Series | Vcc: 2V - 6V (Nominal 5.0V) | Output: ±25mA | Propagation Delay: 9ns',
    idealPowerSource: 'Logic Input: 0V (LOW) to 5.0V (HIGH). Direct output drives LEDs, logic ICs, and transistors.',
    dialogues: {
      greeting: "Greetings! I am the OR Gate. Give me a 1 on any input and I will activate!",
      happy: "🔣 Input active! Output driven HIGH (+5.0V)!",
      crying: "⚠️ Overvoltage on input pin! Limit to 5.0V.",
      burntOut: "Gate blown by ESD spike! Click Repair to swap."
    }
  },
  gate_not: {
    name: 'NOT GATE',
    nick: 'NOT GATE',
    title: 'NOT Gate',
    avatar: '🔣',
    voicePitch: 1.25,
    voiceRate: 1.05,
    superpower: 'Reverses logic states instantly! High becomes Low, and Low becomes High (Y = Ā)!',
    functionAndUsage: 'I am the Inverter NOT Gate. When my input is LOW (0V), I drive output HIGH (+5.0V). When my input is HIGH (+5.0V), I pull output to LOW (0V)!',
    importance: 'Essential for creating active-low resets, clock oscillators, wave shapers, and complementary signal pairs in digital systems.',
    formula: 'Boolean: Y = Ā (Logical Negation / Bitwise Inversion)',
    ratedPower: 'CMOS Series | Vcc: 2V - 6V (Nominal 5.0V) | Output: ±25mA | Propagation Delay: 8ns',
    idealPowerSource: 'Single digital input pin. Drives up to 25mA direct load.',
    dialogues: {
      greeting: "Hello! I am the NOT Gate. Whatever you give me, I output the exact opposite!",
      happy: "🔣 Input negated! Output inverted cleanly!",
      crying: "⚠️ Input voltage out of range!",
      burntOut: "Inverter FET stage shorted! Click Repair to replace."
    }
  },
  gate_nand: {
    name: 'NAND GATE',
    nick: 'NAND GATE',
    title: 'NAND Gate',
    avatar: '🔣',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'Universal Logic Gate! Outputs LOW (0) ONLY when BOTH inputs are HIGH (1); otherwise stays HIGH (1)!',
    functionAndUsage: 'I am the NAND Gate (Not-AND). In computer engineering, NAND is a "Universal Gate" because ANY Boolean logic circuit (including full CPUs and memory) can be constructed entirely from NAND gates!',
    importance: 'The foundation of flash storage (NAND Flash SSDs) and universal digital ASIC circuits.',
    formula: 'Boolean: Y = (A · B)̄ (Negated AND)',
    ratedPower: 'CMOS Series | Vcc: 2V - 6V (Nominal 5.0V) | Output: ±25mA | Propagation Delay: 9ns',
    idealPowerSource: 'Logic Input: 0V (LOW) to 5.0V (HIGH). Direct output drives LEDs, logic ICs, and transistors.',
    dialogues: {
      greeting: "Hello! I am the Universal NAND Gate. With enough of me, you can build an entire computer!",
      happy: "🔣 NAND truth evaluated accurately!",
      crying: "⚠️ Overvoltage warning on NAND input!",
      burntOut: "Gate silicon breakdown! Click Repair to renew."
    }
  },
  gate_nor: {
    name: 'NOR GATE',
    nick: 'NOR GATE',
    title: 'NOR Gate',
    avatar: '🔣',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'Universal Gate! Outputs HIGH (1) ONLY when BOTH inputs are LOW (0); any 1 pulls output to 0V!',
    functionAndUsage: 'I am the NOR Gate (Not-OR). Like NAND, NOR is a Universal Gate capable of realizing all fundamental logic operations. I output +5.0V only when all inputs are 0.',
    importance: 'Used to build SR flip-flops, NOR flash ROM memory, and zero-detection logic in microcontrollers.',
    formula: 'Boolean: Y = (A + B)̄ (Negated OR)',
    ratedPower: 'CMOS Series | Vcc: 2V - 6V (Nominal 5.0V) | Output: ±25mA | Propagation Delay: 9ns',
    idealPowerSource: 'Logic Input: 0V (LOW) to 5.0V (HIGH). Direct output drives LEDs, logic ICs, and transistors.',
    dialogues: {
      greeting: "Greetings! I am the NOR Gate. If everything is quiet (0 and 0), I deliver +5V!",
      happy: "🔣 All inputs low, NOR output HIGH!",
      crying: "⚠️ Input voltage exceeded maximum rating!",
      burntOut: "NOR output stage failed! Click Repair to restore."
    }
  },
  gate_xor: {
    name: 'XOR GATE',
    nick: 'XOR GATE',
    title: 'XOR Gate',
    avatar: '🔣',
    voicePitch: 1.18,
    voiceRate: 1.05,
    superpower: 'Outputs HIGH (1) when inputs are DIFFERENT (odd parity)! Crucial for binary adders and arithmetic units!',
    functionAndUsage: 'I am the XOR Gate (Exclusive-OR). I output HIGH (+5.0V) if and only if ONE of my inputs is 1. If both inputs are 0 or both inputs are 1, my output drops to 0V.',
    importance: 'The mathematical heart of binary half-adders, full-adders, ALU math units, and cryptographic checksum algorithms.',
    formula: 'Boolean: Y = A ⊕ B = (A · B̄) + (Ā · B)',
    ratedPower: 'CMOS Series | Vcc: 2V - 6V (Nominal 5.0V) | Output: ±25mA | Propagation Delay: 11ns',
    idealPowerSource: 'Logic Input: 0V (LOW) to 5.0V (HIGH). Direct output drives LEDs, logic ICs, and transistors.',
    dialogues: {
      greeting: "Hello engineer! I am the XOR Gate, master of binary math and odd-parity detection!",
      happy: "🔣 Inputs differ! Parity satisfied: Output is 1!",
      crying: "⚠️ Input voltage excessive!",
      burntOut: "XOR matrix damaged! Click Repair to replace."
    }
  },
  gate_xnor: {
    name: 'XNOR GATE',
    nick: 'XNOR GATE',
    title: 'XNOR Gate',
    avatar: '🔣',
    voicePitch: 1.18,
    voiceRate: 1.05,
    superpower: 'Outputs HIGH (1) when BOTH inputs are EQUAL (both 0 or both 1)! The core building block of digital equality comparators!',
    functionAndUsage: 'I am the XNOR Gate (Equivalence Gate). I output HIGH (+5.0V) when my inputs match each other (A = B). If the inputs differ, my output is 0V.',
    importance: 'Crucial for digital comparators (A == B testing), error detection, and even-parity generators in telecommunications.',
    formula: 'Boolean: Y = (A ⊕ B)̄ = (A · B) + (Ā · B̄)',
    ratedPower: 'CMOS Series | Vcc: 2V - 6V (Nominal 5.0V) | Output: ±25mA | Propagation Delay: 11ns',
    idealPowerSource: 'Logic Input: 0V (LOW) to 5.0V (HIGH). Direct output drives LEDs, logic ICs, and transistors.',
    dialogues: {
      greeting: "Hello! I am the XNOR Gate. When inputs match, I produce a triumphant 1!",
      happy: "🔣 Inputs match! Equality verified: Output is 1!",
      crying: "⚠️ Input pin overvoltage!",
      burntOut: "XNOR gate circuit blown! Click Repair to replace."
    }
  },
  ic_7408: {
    name: 'IC 7408 (QUAD AND)',
    nick: '7408 IC',
    title: '7408 Quad 2-Input AND Gate IC',
    avatar: '🔌',
    voicePitch: 1.1,
    voiceRate: 1.05,
    superpower: 'DIP-14 Integrated Circuit housing 4 independent 2-Input AND Gates! Recommended operating voltage: 5.0V.',
    functionAndUsage: 'I am the 7408 Integrated Circuit (SN74HC08N). I pack four independent AND gates into a single 14-pin dual inline package (DIP-14). Power me with 5V on Pin 14 (VCC) and connect Pin 7 to GND!',
    importance: 'The industry-standard quad AND gate chip used in digital computers, microcontrollers, and logic control systems.',
    formula: 'Pin 14: VCC (+5V), Pin 7: GND. Four Gates: 1Y=1A·1B, 2Y=2A·2B, 3Y=3A·3B, 4Y=4A·4B',
    ratedPower: 'DIP-14 | Vcc: 2V - 6V (Nominal 5.0V, Max 7.0V) | Output: ±25mA per pin | t_pd: 9ns',
    idealPowerSource: 'Power Supply: Recommended 5.0V to Pin 14 (VCC) and Ground to Pin 7 (GND).',
    dialogues: {
      greeting: "Hello engineer! I am the 7408 Quad AND Gate IC. Connect Pin 14 to +5V and Pin 7 to ground to bring my 4 gates to life!",
      happy: "🔌 IC 7408 fully energized at 5.0V! All 4 AND gates ready for digital computation.",
      crying: "⚠️ Overvoltage! Voltage on Pin 14 exceeded 7.0V rating!",
      burntOut: "Silicon junction destroyed by excessive voltage! Keep Vcc at recommended 5.0V."
    }
  },
  ic_7432: {
    name: 'IC 7432 (QUAD OR)',
    nick: '7432 IC',
    title: '7432 Quad 2-Input OR Gate IC',
    avatar: '🔌',
    voicePitch: 1.1,
    voiceRate: 1.05,
    superpower: 'DIP-14 Integrated Circuit housing 4 independent 2-Input OR Gates! Recommended operating voltage: 5.0V.',
    functionAndUsage: 'I am the 7432 Integrated Circuit (SN74HC32N). I contain four independent OR gates in a 14-pin DIP package. Pin 14 is VCC (+5V) and Pin 7 is Ground.',
    importance: 'The classic quadruple OR gate chip used in interrupt controllers, alert systems, and sensor fusion circuits.',
    formula: 'Pin 14: VCC (+5V), Pin 7: GND. Four Gates: 1Y=1A+1B, 2Y=2A+2B, 3Y=3A+3B, 4Y=4A+4B',
    ratedPower: 'DIP-14 | Vcc: 2V - 6V (Nominal 5.0V, Max 7.0V) | Output: ±25mA per pin | t_pd: 9ns',
    idealPowerSource: 'Power Supply: Recommended 5.0V to Pin 14 (VCC) and Ground to Pin 7 (GND).',
    dialogues: {
      greeting: "Greetings! I am the 7432 Quad OR Gate IC. Power Pin 14 with 5V and Pin 7 with GND to activate all 4 OR gates!",
      happy: "🔌 IC 7432 powered at 5V! OR logic gates active and conducting.",
      crying: "⚠️ Overvoltage on Pin 14! Maintain supply near 5.0V.",
      burntOut: "IC destroyed by overvoltage spike! Replace and limit voltage to 5.0V."
    }
  },
  ic_7404: {
    name: 'IC 7404 (HEX NOT)',
    nick: '7404 IC',
    title: '7404 Hex Inverter IC (6 NOT Gates)',
    avatar: '🔌',
    voicePitch: 1.2,
    voiceRate: 1.05,
    superpower: 'DIP-14 Integrated Circuit housing 6 independent NOT Inverter Gates! Recommended operating voltage: 5.0V.',
    functionAndUsage: 'I am the 7404 Integrated Circuit (SN74HC04N). I contain six separate inverters in one compact 14-pin DIP chip. Pin 14 is VCC (+5V) and Pin 7 is Ground.',
    importance: 'One of the most widely used chips in history, used for clock oscillators, wave shaping, bus drivers, and active-low resets.',
    formula: 'Pin 14: VCC (+5V), Pin 7: GND. Six Inverters: 1Y=1Ā, 2Y=2Ā, 3Y=3Ā, 4Y=4Ā, 5Y=5Ā, 6Y=6Ā',
    ratedPower: 'DIP-14 | Vcc: 2V - 6V (Nominal 5.0V, Max 7.0V) | Output: ±25mA per pin | t_pd: 8ns',
    idealPowerSource: 'Power Supply: Recommended 5.0V to Pin 14 (VCC) and Ground to Pin 7 (GND).',
    dialogues: {
      greeting: "Hello! I am the 7404 Hex Inverter IC. Six powerful inverters ready to invert your digital signals!",
      happy: "🔌 IC 7404 powered! All 6 inverters operating at recommended 5.0V.",
      crying: "⚠️ Excessive supply voltage on Pin 14!",
      burntOut: "Inverter transistors fried by overvoltage! Use recommended 5V supply."
    }
  },
  ic_7486: {
    name: 'IC 7486 (QUAD XOR)',
    nick: '7486 IC',
    title: '7486 Quad 2-Input XOR Gate IC',
    avatar: '🔌',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'DIP-14 Integrated Circuit housing 4 independent 2-Input XOR Gates! Recommended operating voltage: 5.0V.',
    functionAndUsage: 'I am the 7486 Integrated Circuit (SN74HC86N). I house four XOR gates inside a 14-pin DIP package for binary arithmetic and parity checking. Pin 14 is VCC (+5V) and Pin 7 is Ground.',
    importance: 'The workhorse of binary adders, subtractors, digital comparators, and cryptographic parity generators.',
    formula: 'Pin 14: VCC (+5V), Pin 7: GND. Four Gates: Y = A ⊕ B',
    ratedPower: 'DIP-14 | Vcc: 2V - 6V (Nominal 5.0V, Max 7.0V) | Output: ±25mA per pin | t_pd: 11ns',
    idealPowerSource: 'Power Supply: Recommended 5.0V to Pin 14 (VCC) and Ground to Pin 7 (GND).',
    dialogues: {
      greeting: "Hello engineer! I am the 7486 Quad XOR Gate IC, ready to calculate binary addition!",
      happy: "🔌 IC 7486 online at 5.0V! Parity and arithmetic gates active.",
      crying: "⚠️ Overvoltage on supply rail!",
      burntOut: "XOR silicon matrix shorted! Keep Vcc at recommended 5.0V."
    }
  },
  ic_7400: {
    name: 'IC 7400 (QUAD NAND)',
    nick: '7400 IC',
    title: '7400 Quad 2-Input NAND Gate IC',
    avatar: '🔌',
    voicePitch: 1.1,
    voiceRate: 1.05,
    superpower: 'The legendary Quad 2-Input Universal NAND Gate IC! Recommended operating voltage: 5.0V.',
    functionAndUsage: 'I am the iconic 7400 Integrated Circuit (SN74HC00N). The genesis of the entire 7400 logic series! Four universal NAND gates in a DIP-14 package. Pin 14 is VCC (+5V) and Pin 7 is Ground.',
    importance: 'The historic cornerstone of modern digital computing. Any Boolean logic network or CPU can be synthesized entirely from 7400 NAND chips.',
    formula: 'Pin 14: VCC (+5V), Pin 7: GND. Four Gates: Y = (A · B)̄',
    ratedPower: 'DIP-14 | Vcc: 2V - 6V (Nominal 5.0V, Max 7.0V) | Output: ±25mA per pin | t_pd: 9ns',
    idealPowerSource: 'Power Supply: Recommended 5.0V to Pin 14 (VCC) and Ground to Pin 7 (GND).',
    dialogues: {
      greeting: "Welcome! I am the iconic 7400 Quad NAND Gate IC, the chip that built the computer revolution!",
      happy: "🔌 IC 7400 powered at 5.0V! Universal logic ready for assembly.",
      crying: "⚠️ Overvoltage on Pin 14! Maximum rating is 7.0V.",
      burntOut: "7400 chip blown! Replace and supply recommended 5.0V."
    }
  },
  ic_7402: {
    name: 'IC 7402 (QUAD NOR)',
    nick: '7402 IC',
    title: '7402 Quad 2-Input NOR Gate IC',
    avatar: '🔌',
    voicePitch: 1.1,
    voiceRate: 1.05,
    superpower: 'Universal Quad 2-Input NOR Gate IC! Recommended operating voltage: 5.0V.',
    functionAndUsage: 'I am the 7402 Integrated Circuit (SN74HC02N). I contain four universal NOR gates in a DIP-14 package. Note my special pinout: Outputs are Pin 1, 4, 10, 13! Pin 14 is VCC (+5V) and Pin 7 is Ground.',
    importance: 'Universal logic chip used in SR latches, flip-flops, memory cells, and zero-detectors.',
    formula: 'Pin 14: VCC (+5V), Pin 7: GND. Four Gates: 1Y=(1A+1B)̄, 2Y=(2A+2B)̄, 3Y=(3A+3B)̄, 4Y=(4A+4B)̄',
    ratedPower: 'DIP-14 | Vcc: 2V - 6V (Nominal 5.0V, Max 7.0V) | Output: ±25mA per pin | t_pd: 9ns',
    idealPowerSource: 'Power Supply: Recommended 5.0V to Pin 14 (VCC) and Ground to Pin 7 (GND).',
    dialogues: {
      greeting: "Greetings! I am the 7402 Quad NOR Gate IC. Note my unique output pins on 1, 4, 10, 13!",
      happy: "🔌 IC 7402 active! All 4 NOR gates running at recommended 5.0V.",
      crying: "⚠️ Overvoltage on Pin 14!",
      burntOut: "NOR gates destroyed by overvoltage! Use 5.0V."
    }
  },
  ic_74266: {
    name: 'IC 74266 (QUAD XNOR)',
    nick: '74266 IC',
    title: '74266 Quad 2-Input XNOR Gate IC',
    avatar: '🔌',
    voicePitch: 1.15,
    voiceRate: 1.05,
    superpower: 'DIP-14 Integrated Circuit housing 4 independent 2-Input XNOR Gates! Recommended operating voltage: 5.0V.',
    functionAndUsage: 'I am the 74266 Integrated Circuit (SN74HC7266N). I contain four XNOR equivalence gates in a DIP-14 package for high-speed digital matching. Pin 14 is VCC (+5V) and Pin 7 is Ground.',
    importance: 'The digital comparator chip used in address matching, equality comparators, and error-checking hardware.',
    formula: 'Pin 14: VCC (+5V), Pin 7: GND. Four Gates: Y = (A ⊕ B)̄',
    ratedPower: 'DIP-14 | Vcc: 2V - 6V (Nominal 5.0V, Max 7.0V) | Output: ±25mA per pin | t_pd: 11ns',
    idealPowerSource: 'Power Supply: Recommended 5.0V to Pin 14 (VCC) and Ground to Pin 7 (GND).',
    dialogues: {
      greeting: "Hello engineer! I am the 74266 Quad XNOR Gate IC, master of digital equivalence!",
      happy: "🔌 IC 74266 operational at 5.0V! Equivalence comparators ready.",
      crying: "⚠️ Supply voltage out of tolerance!",
      burntOut: "IC destroyed by overvoltage! Keep Vcc at 5.0V."
    }
  }
};

// =========================================================================
// Digital Logic Integrated Circuit (DIP-14) Specifications & Pinout Tables
// =========================================================================
const IC_LOGIC_SPECS = {
  ic_7408: {
    code: '7408',
    fullName: 'SN74HC08N',
    gateType: 'AND',
    gateDesc: 'Quad 2-Input AND Gate',
    numGates: 4,
    gatePins: [
      { id: 1, inA: 'pin1', inB: 'pin2', out: 'pin3' },
      { id: 2, inA: 'pin4', inB: 'pin5', out: 'pin6' },
      { id: 3, inA: 'pin9', inB: 'pin10', out: 'pin8' },
      { id: 4, inA: 'pin12', inB: 'pin13', out: 'pin11' }
    ],
    evaluate: (a, b) => (a && b) ? 1 : 0
  },
  ic_7432: {
    code: '7432',
    fullName: 'SN74HC32N',
    gateType: 'OR',
    gateDesc: 'Quad 2-Input OR Gate',
    numGates: 4,
    gatePins: [
      { id: 1, inA: 'pin1', inB: 'pin2', out: 'pin3' },
      { id: 2, inA: 'pin4', inB: 'pin5', out: 'pin6' },
      { id: 3, inA: 'pin9', inB: 'pin10', out: 'pin8' },
      { id: 4, inA: 'pin12', inB: 'pin13', out: 'pin11' }
    ],
    evaluate: (a, b) => (a || b) ? 1 : 0
  },
  ic_7404: {
    code: '7404',
    fullName: 'SN74HC04N',
    gateType: 'NOT',
    gateDesc: 'Hex Inverter (6 NOT Gates)',
    numGates: 6,
    gatePins: [
      { id: 1, inA: 'pin1', out: 'pin2' },
      { id: 2, inA: 'pin3', out: 'pin4' },
      { id: 3, inA: 'pin5', out: 'pin6' },
      { id: 4, inA: 'pin9', out: 'pin8' },
      { id: 5, inA: 'pin11', out: 'pin10' },
      { id: 6, inA: 'pin13', out: 'pin12' }
    ],
    evaluate: (a) => (!a) ? 1 : 0
  },
  ic_7486: {
    code: '7486',
    fullName: 'SN74HC86N',
    gateType: 'XOR',
    gateDesc: 'Quad 2-Input XOR Gate',
    numGates: 4,
    gatePins: [
      { id: 1, inA: 'pin1', inB: 'pin2', out: 'pin3' },
      { id: 2, inA: 'pin4', inB: 'pin5', out: 'pin6' },
      { id: 3, inA: 'pin9', inB: 'pin10', out: 'pin8' },
      { id: 4, inA: 'pin12', inB: 'pin13', out: 'pin11' }
    ],
    evaluate: (a, b) => (a !== b) ? 1 : 0
  },
  ic_7400: {
    code: '7400',
    fullName: 'SN74HC00N',
    gateType: 'NAND',
    gateDesc: 'Quad 2-Input NAND Gate',
    numGates: 4,
    gatePins: [
      { id: 1, inA: 'pin1', inB: 'pin2', out: 'pin3' },
      { id: 2, inA: 'pin4', inB: 'pin5', out: 'pin6' },
      { id: 3, inA: 'pin9', inB: 'pin10', out: 'pin8' },
      { id: 4, inA: 'pin12', inB: 'pin13', out: 'pin11' }
    ],
    evaluate: (a, b) => !(a && b) ? 1 : 0
  },
  ic_7402: {
    code: '7402',
    fullName: 'SN74HC02N',
    gateType: 'NOR',
    gateDesc: 'Quad 2-Input NOR Gate',
    numGates: 4,
    gatePins: [
      { id: 1, inA: 'pin2', inB: 'pin3', out: 'pin1' },
      { id: 2, inA: 'pin5', inB: 'pin6', out: 'pin4' },
      { id: 3, inA: 'pin8', inB: 'pin9', out: 'pin10' },
      { id: 4, inA: 'pin11', inB: 'pin12', out: 'pin13' }
    ],
    evaluate: (a, b) => !(a || b) ? 1 : 0
  },
  ic_74266: {
    code: '74266',
    fullName: 'SN74HC7266N',
    gateType: 'XNOR',
    gateDesc: 'Quad 2-Input XNOR Gate',
    numGates: 4,
    gatePins: [
      { id: 1, inA: 'pin1', inB: 'pin2', out: 'pin3' },
      { id: 2, inA: 'pin4', inB: 'pin5', out: 'pin6' },
      { id: 3, inA: 'pin9', inB: 'pin10', out: 'pin8' },
      { id: 4, inA: 'pin12', inB: 'pin13', out: 'pin11' }
    ],
    evaluate: (a, b) => (a === b) ? 1 : 0
  }
};
window.IC_LOGIC_SPECS = IC_LOGIC_SPECS;

function createQuadICTerminals(gateLabel) {
  return [
    { id: 'pin1', label: '1', role: '1A', name: 'Pin 1 (Gate 1 Input A)', x: 10, y: 42, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin2', label: '2', role: '1B', name: 'Pin 2 (Gate 1 Input B)', x: 10, y: 82, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin3', label: '3', role: '1Y', name: 'Pin 3 (Gate 1 Output Y)', x: 10, y: 122, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin4', label: '4', role: '2A', name: 'Pin 4 (Gate 2 Input A)', x: 10, y: 162, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin5', label: '5', role: '2B', name: 'Pin 5 (Gate 2 Input B)', x: 10, y: 202, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin6', label: '6', role: '2Y', name: 'Pin 6 (Gate 2 Output Y)', x: 10, y: 242, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin7', label: '7', role: 'GND', name: 'Pin 7 (Ground GND - 0V)', x: 10, y: 282, polarity: 'neg', color: '#334155' },
    { id: 'pin8', label: '8', role: '3Y', name: 'Pin 8 (Gate 3 Output Y)', x: 170, y: 282, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin9', label: '9', role: '3A', name: 'Pin 9 (Gate 3 Input A)', x: 170, y: 242, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin10', label: '10', role: '3B', name: 'Pin 10 (Gate 3 Input B)', x: 170, y: 202, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin11', label: '11', role: '4Y', name: 'Pin 11 (Gate 4 Output Y)', x: 170, y: 162, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin12', label: '12', role: '4A', name: 'Pin 12 (Gate 4 Input A)', x: 170, y: 122, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin13', label: '13', role: '4B', name: 'Pin 13 (Gate 4 Input B)', x: 170, y: 82, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin14', label: '14', role: 'VCC', name: 'Pin 14 (VCC Supply Voltage: Recommended 5.0V)', x: 170, y: 42, polarity: 'pos', color: '#ef4444' }
  ];
}

function create7402Terminals() {
  return [
    { id: 'pin1', label: '1', role: '1Y', name: 'Pin 1 (Gate 1 Output Y)', x: 10, y: 42, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin2', label: '2', role: '1A', name: 'Pin 2 (Gate 1 Input A)', x: 10, y: 82, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin3', label: '3', role: '1B', name: 'Pin 3 (Gate 1 Input B)', x: 10, y: 122, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin4', label: '4', role: '2Y', name: 'Pin 4 (Gate 2 Output Y)', x: 10, y: 162, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin5', label: '5', role: '2A', name: 'Pin 5 (Gate 2 Input A)', x: 10, y: 202, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin6', label: '6', role: '2B', name: 'Pin 6 (Gate 2 Input B)', x: 10, y: 242, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin7', label: '7', role: 'GND', name: 'Pin 7 (Ground GND - 0V)', x: 10, y: 282, polarity: 'neg', color: '#334155' },
    { id: 'pin8', label: '8', role: '3A', name: 'Pin 8 (Gate 3 Input A)', x: 170, y: 282, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin9', label: '9', role: '3B', name: 'Pin 9 (Gate 3 Input B)', x: 170, y: 242, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin10', label: '10', role: '3Y', name: 'Pin 10 (Gate 3 Output Y)', x: 170, y: 202, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin11', label: '11', role: '4A', name: 'Pin 11 (Gate 4 Input A)', x: 170, y: 162, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin12', label: '12', role: '4B', name: 'Pin 12 (Gate 4 Input B)', x: 170, y: 122, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin13', label: '13', role: '4Y', name: 'Pin 13 (Gate 4 Output Y)', x: 170, y: 82, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin14', label: '14', role: 'VCC', name: 'Pin 14 (VCC Supply Voltage: Recommended 5.0V)', x: 170, y: 42, polarity: 'pos', color: '#ef4444' }
  ];
}

function create7404Terminals() {
  return [
    { id: 'pin1', label: '1', role: '1A', name: 'Pin 1 (Inverter 1 Input A)', x: 10, y: 42, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin2', label: '2', role: '1Y', name: 'Pin 2 (Inverter 1 Output Y)', x: 10, y: 82, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin3', label: '3', role: '2A', name: 'Pin 3 (Inverter 2 Input A)', x: 10, y: 122, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin4', label: '4', role: '2Y', name: 'Pin 4 (Inverter 2 Output Y)', x: 10, y: 162, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin5', label: '5', role: '3A', name: 'Pin 5 (Inverter 3 Input A)', x: 10, y: 202, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin6', label: '6', role: '3Y', name: 'Pin 6 (Inverter 3 Output Y)', x: 10, y: 242, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin7', label: '7', role: 'GND', name: 'Pin 7 (Ground GND - 0V)', x: 10, y: 282, polarity: 'neg', color: '#334155' },
    { id: 'pin8', label: '8', role: '4Y', name: 'Pin 8 (Inverter 4 Output Y)', x: 170, y: 282, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin9', label: '9', role: '4A', name: 'Pin 9 (Inverter 4 Input A)', x: 170, y: 242, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin10', label: '10', role: '5Y', name: 'Pin 10 (Inverter 5 Output Y)', x: 170, y: 202, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin11', label: '11', role: '5A', name: 'Pin 11 (Inverter 5 Input A)', x: 170, y: 162, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin12', label: '12', role: '6Y', name: 'Pin 12 (Inverter 6 Output Y)', x: 170, y: 122, polarity: 'logic_out', color: '#f59e0b' },
    { id: 'pin13', label: '13', role: '6A', name: 'Pin 13 (Inverter 6 Input A)', x: 170, y: 82, polarity: 'logic_in', color: '#38bdf8' },
    { id: 'pin14', label: '14', role: 'VCC', name: 'Pin 14 (VCC Supply Voltage: Recommended 5.0V)', x: 170, y: 42, polarity: 'pos', color: '#ef4444' }
  ];
}

// Generous 1.30x size scale for all components and pin coordinates in the play area
const COMPONENT_DEFINITIONS = {
  battery: {
    name: '9V Battery',
    category: 'power',
    width: 120,
    height: 210,
    voltage: 9.0,
    internalR: 1.5,
    description: 'Direct Current (DC) power source providing 9 Volts of electrical potential.',
    terminals: [
      { id: 'neg', label: '- (Neg)', x: 32, y: 14, polarity: 'neg', color: '#32ade6' },
      { id: 'pos', label: '+ (Pos)', x: 88, y: 14, polarity: 'pos', color: '#ff3b30' }
    ],
    createState: () => ({
      powered: false,
      overheated: false,
      burning: false,
      burnt: false,
      crying: false,
      voltage: 9.0,
      burnReason: ''
    })
  },
  cell: {
    name: '1.5V Cell (AA)',
    category: 'power',
    width: 76,
    height: 210,
    voltage: 1.5,
    internalR: 0.5,
    description: 'Standard 1.5V chemical cell. Connect cells in series (+ to -) to add voltages!',
    terminals: [
      { id: 'pos', label: '+ (Pos)', x: 38, y: 12, polarity: 'pos', color: '#ff3b30' },
      { id: 'neg', label: '- (Neg)', x: 38, y: 198, polarity: 'neg', color: '#32ade6' }
    ],
    createState: () => ({
      powered: false,
      overheated: false,
      burning: false,
      burnt: false,
      crying: false,
      voltage: 1.5,
      burnReason: ''
    })
  },
  cell3v: {
    name: '3V Coin Cell (CR2032)',
    category: 'power',
    width: 144,
    height: 110,
    voltage: 3.0,
    nominalVoltage: 3.0,
    openCircuitVoltage: 3.2,
    cutoffVoltage: 2.0,
    nominalCapacity: 225, // 210 - 240 mAh
    chemistry: 'Li/MnO2',
    chemistryName: 'Lithium / Manganese Dioxide (Primary / Non-Rechargeable)',
    diameterMm: 20.0,
    heightMm: 3.2,
    weightG: 3.0,
    internalR: 18.0, // 10 - 30 ohms internal ESR
    standardDrainCurrent: 0.00025, // 0.2 - 0.3 mA baseline
    maxContinuousDrain: 0.003, // 3.0 mA max continuous
    maxPulseCurrent: 0.050, // 10 - 50 mA pulse
    selfDischargeRate: '1% - 2% / year',
    operatingTemp: '-20°C to +60°C',
    description: 'CR2032 3V Lithium Coin Cell (Li/MnO₂, 225mAh, 20×3.2mm, ESR ~18Ω). Standard drain 0.2–0.3mA, max continuous 3mA, max pulse 50mA.',
    terminals: [
      { id: 'neg', label: '- (Neg)', x: 20, y: 55, polarity: 'neg', color: '#32ade6' },
      { id: 'pos', label: '+ (Pos)', x: 124, y: 55, polarity: 'pos', color: '#ff3b30' }
    ],
    createState: () => ({
      powered: false,
      overheated: false,
      burning: false,
      burnt: false,
      crying: false,
      voltage: 3.0,
      nominalVoltage: 3.0,
      openCircuitVoltage: 3.2,
      cutoffVoltage: 2.0,
      actualVoltage: 3.2,
      voltageDrop: 3.2,
      voltageSag: 0,
      current: 0,
      currentMa: 0,
      internalR: 18.0,
      nominalCapacity: 225,
      drainRegime: 'standby',
      drainRegimeText: 'STANDBY (Open Circuit, 0 mA)',
      runtimeEstimate: '8–10 Years (Shelf Life, <2%/yr self-discharge)',
      burnReason: ''
    })
  },
  led: {
    name: 'LED (Light Emitting Diode)',
    category: 'load',
    width: 160,
    height: 130,
    resistance: 60,
    nominalVoltage: 2.1,
    maxVoltage: 3.3,
    maxCurrent: 0.040,
    description: 'Polarity sensitive! Rated for 2.1V-3.0V. If connected to 9V without a resistor, it burns!',
    terminals: [
      { id: 'anode', label: 'Anode (+)', x: 35, y: 110, polarity: 'pos', color: '#ff453a' },
      { id: 'cathode', label: 'Cathode (-)', x: 125, y: 110, polarity: 'neg', color: '#38bdf8' }
    ],
    createState: () => ({
      powered: false,
      reversed: false,
      blocked: false,
      burning: false,
      burnt: false,
      crying: false,
      color: 'red',
      blinking: false,
      brightness: 0,
      voltageDrop: 0,
      current: 0,
      burnReason: ''
    })
  },
  bulb: {
    name: '9V Incandescent Lamp (E10)',
    category: 'load',
    width: 160,
    height: 140,
    resistance: 45,
    nominalVoltage: 9.0,
    maxVoltage: 14.5,
    maxCurrent: 0.35,
    nonPolarized: true,
    description: 'Non-polarized 9V E10 miniature incandescent lamp with coiled tungsten filament. Rated for 6.0V-12.0V AC/DC. Direct 230V mains burns the filament!',
    terminals: [
      { id: 'pin1', label: 'Terminal A', x: 28, y: 122, polarity: null, color: '#f59e0b' },
      { id: 'pin2', label: 'Terminal B', x: 132, y: 122, polarity: null, color: '#f59e0b' }
    ],
    createState: () => ({
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      brightness: 0,
      voltageDrop: 0,
      current: 0,
      burnReason: ''
    })
  },
  motor: {
    name: '3V DC Electric Motor (130)',
    category: 'load',
    width: 170,
    height: 160,
    resistance: 40,
    nominalVoltage: 3.0,
    maxVoltage: 12.0,
    maxCurrent: 0.45,
    description: '3V DC miniature toy motor (Type 130) with red propeller fan. Reversing polarity reverses rotation direction. Overvoltage (>12V) burns windings!',
    terminals: [
      { id: 'pin1', label: '+', x: 30, y: 135, polarity: 'pos', color: '#ff9f0a' },
      { id: 'pin2', label: '-', x: 140, y: 135, polarity: 'neg', color: '#38bdf8' }
    ],
    createState: () => ({
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      direction: 'cw',
      fanAngle: 0,
      rpm: 0,
      voltageDrop: 0,
      current: 0,
      burnReason: ''
    })
  },
  diode: {
    name: 'Diode',
    category: 'control',
    width: 160,
    height: 70,
    resistance: 8,
    maxCurrent: 1.0,
    description: 'Semiconductor Rectifier Diode (DO-41). One-way electrical valve conducting from Anode (+) to Cathode (-). Silver band marks the Cathode.',
    terminals: [
      { id: 'anode', label: '+', x: 18, y: 35, polarity: 'pos', color: '#ff375f' },
      { id: 'cathode', label: '-', x: 142, y: 35, polarity: 'neg', color: '#38bdf8' }
    ],
    createState: () => ({
      powered: false,
      reversed: false,
      blocked: false,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      burnReason: ''
    })
  },
  switch: {
    name: 'Single Pole Switch',
    category: 'control',
    width: 160,
    height: 90,
    resistance: 0.1,
    nonPolarized: true,
    description: 'Single Pole Single Throw (SPST) knife switch. Click the lever to open or close the circuit path.',
    terminals: [
      { id: 'pin1', label: 'Terminal 1', x: 22, y: 45, polarity: null, color: '#f59e0b' },
      { id: 'pin2', label: 'Terminal 2', x: 138, y: 45, polarity: null, color: '#f59e0b' }
    ],
    createState: () => ({
      closed: false,
      contactSpark: false,
      burning: false,
      burnt: false,
      crying: false
    })
  },
  twowayswitch: {
    name: 'Two-Way Switch (SPDT)',
    category: 'control',
    width: 170,
    height: 110,
    resistance: 0.1,
    nonPolarized: true,
    description: 'Single Pole Double Throw (SPDT) knife switch. Flip the lever to steer current between Route L1 and Route L2!',
    terminals: [
      { id: 'com', label: 'COM', x: 24, y: 55, polarity: null, color: '#ff9f0a' },
      { id: 'l1', label: 'L1', x: 142, y: 28, polarity: null, color: '#38bdf8' },
      { id: 'l2', label: 'L2', x: 142, y: 82, polarity: null, color: '#38bdf8' }
    ],
    createState: () => ({
      position: 1,
      burning: false,
      burnt: false,
      crying: false
    })
  },
  pushbutton: {
    name: 'Pushbutton Switch',
    category: 'control',
    width: 150,
    height: 140,
    resistance: 0.1,
    nonPolarized: true,
    description: 'Normally Open (NO) Pushbutton Switch (Sectional Cutaway View). Spring-loaded plunger bridges internal contacts when pressed.',
    terminals: [
      { id: 'pin1', label: 'Terminal 1', x: 48, y: 126, polarity: null, color: '#f59e0b' },
      { id: 'pin2', label: 'Terminal 2', x: 102, y: 126, polarity: null, color: '#f59e0b' }
    ],
    createState: () => ({
      pressed: false,
      burning: false,
      burnt: false,
      crying: false
    })
  },
  resistor: {
    name: 'Fixed Resistor',
    category: 'passive',
    width: 200,
    height: 90,
    resistance: 220,
    maxPower: 1.2,
    nonPolarized: true,
    description: 'Limits current to protect delicate components and controls voltage distribution.',
    terminals: [
      { id: 'pin1', label: 'Lead 1', x: 20, y: 38, polarity: null, color: '#f59e0b' },
      { id: 'pin2', label: 'Lead 2', x: 180, y: 38, polarity: null, color: '#f59e0b' }
    ],
    createState: () => ({
      resistance: 220,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0,
      burnReason: ''
    })
  },
  potentiometer: {
    name: 'Variable Resistor (Potentiometer)',
    category: 'passive',
    width: 190,
    height: 226,
    resistance: 500,
    maxPower: 2.0,
    nonPolarized: true,
    description: 'Adjustable voltage divider & rheostat! Pin 1 (+V) and Pin 3 (GND) span total track resistance, while the center Wiper Pin 2 (tap) outputs divided voltage Vout = Vin · (R2 / (R1 + R2))!',
    terminals: [
      { id: 'pin1', label: 'Terminal 1 (Vin)', x: 45, y: 174, polarity: null, color: '#f59e0b' },
      { id: 'wiper', label: 'Terminal 2 (Wiper/Vout)', x: 95, y: 174, polarity: null, color: '#f59e0b' },
      { id: 'pin2', label: 'Terminal 3 (GND)', x: 145, y: 174, polarity: null, color: '#38bdf8' }
    ],
    createState: () => ({
      resistance: 500,
      totalResistance: 1000,
      wiperRatio: 0.5,
      r1: 500,
      r2: 500,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      wiperVoltage: 0,
      current: 0,
      power: 0,
      burnReason: ''
    })
  },
  buzzer: {
    name: 'Electronic Buzzer',
    category: 'load',
    width: 160,
    height: 160,
    resistance: 80,
    maxVoltage: 12.0,
    description: 'Acoustic alarm sounder. Stacking excessive series batteries cracks the piezoelectric ceramic acoustic disc.',
    terminals: [
      { id: 'pin1', label: '+ (Red)', x: 98, y: 146, polarity: 'pos', color: '#ff375f' },
      { id: 'pin2', label: '- (Black)', x: 62, y: 146, polarity: 'neg', color: '#38bdf8' }
    ],
    createState: () => ({
      powered: false,
      sounding: false,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0,
      burnReason: ''
    })
  },
  transformer: {
    name: 'Step-Down Transformer',
    category: 'control',
    width: 205,
    height: 165,
    resistance: 5.0,
    description: '3D EI-Lamination step-down power transformer. Steps 230V AC mains down to safe 12V AC via electromagnetic induction.',
    terminals: [
      { id: 'pri1', label: 'Pri Line (230V~ White)', x: 20, y: 50, polarity: 'phase', color: '#f8fafc' },
      { id: 'pri2', label: 'Pri Neutral (White)', x: 20, y: 115, polarity: 'neutral', color: '#94a3b8' },
      { id: 'sec1', label: 'Sec Line (12V~ Black)', x: 185, y: 65, polarity: 'phase', color: '#f59e0b' },
      { id: 'sec2', label: 'Sec Neutral (Black)', x: 185, y: 130, polarity: 'neutral', color: '#38bdf8' }
    ],
    createState: () => ({
      powered: false,
      primaryV: 230,
      secondaryV: 12,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0,
      burnReason: ''
    })
  },
  ac_source: {
    name: 'AC Voltage Supply',
    category: 'power',
    width: 182,
    height: 117,
    voltage: 230.0,
    frequency: 50,
    description: 'Alternating Current (AC) mains/generator supply with Line (L) and Neutral (N). Click stepper or type desired AC voltage!',
    terminals: [
      { id: 'l', label: 'Line (L)', x: 163, y: 33, polarity: 'phase', color: '#b45309' },
      { id: 'n', label: 'Neutral (N)', x: 163, y: 85, polarity: 'neutral', color: '#0284c7' }
    ],
    createState: () => ({
      voltage: 230.0,
      frequency: 50,
      powered: false,
      overheated: false,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },
  multimeter: {
    name: 'Digital Multimeter',
    category: 'control',
    width: 175,
    height: 145,
    resistance: 10000000,
    description: 'Precision diagnostic meter with DCV, ACV, DCA, Resistance (Ω), Continuity Beeper, and Diode test.',
    terminals: [
      { id: 'vin', label: 'V/Ω/mA', x: 45, y: 125, polarity: 'pos', color: '#ef4444' },
      { id: 'com', label: 'COM', x: 130, y: 125, polarity: 'neg', color: '#38bdf8' }
    ],
    createState: () => ({
      mode: 'dcv',
      reading: 0,
      displayStr: '0.00 V',
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0
    })
  },

  npn: {
    name: 'NPN Transistor',
    category: 'semiconductor',
    width: 250,
    height: 185,
    resistance: 5,
    maxVoltage: 40,
    maxCurrent: 0.200,
    description: 'Current-controlled switch. A small current at Base triggers full flow from Collector to Emitter!',
    terminals: [
      { id: 'c', label: 'Collector', x: 65, y: 155, polarity: 'c', color: '#38bdf8' },
      { id: 'b', label: 'Base', x: 125, y: 155, polarity: 'b', color: '#f59e0b' },
      { id: 'e', label: 'Emitter', x: 185, y: 155, polarity: 'e', color: '#ef4444' }
    ],
    createState: () => ({
      conducting: false,
      baseCurrent: 0,
      collectorCurrent: 0,
      vbe: 0,
      vce: 0,
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  pnp: {
    name: 'PNP Transistor',
    category: 'semiconductor',
    width: 250,
    height: 185,
    resistance: 5,
    maxVoltage: 40,
    maxCurrent: 0.200,
    description: 'Active-LOW switch. Pulling Base LOW triggers conduction from Emitter to Collector!',
    terminals: [
      { id: 'e', label: 'Emitter', x: 65, y: 155, polarity: 'e', color: '#ef4444' },
      { id: 'b', label: 'Base', x: 125, y: 155, polarity: 'b', color: '#f59e0b' },
      { id: 'c', label: 'Collector', x: 185, y: 155, polarity: 'c', color: '#38bdf8' }
    ],
    createState: () => ({
      conducting: false,
      baseCurrent: 0,
      collectorCurrent: 0,
      veb: 0,
      vec: 0,
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  ldr: {
    name: 'LDR (Photoresistor)',
    category: 'sensor',
    width: 160,
    height: 135,
    resistance: 10000,
    description: 'Cadmium Sulfide (CdS) Light Dependent Resistor. Resistance drops under bright light and rises in darkness. Negative or positive coefficient!',
    terminals: [
      { id: 'pin1', label: 'Pin 1', x: 16, y: 56, color: '#f59e0b' },
      { id: 'pin2', label: 'Pin 2', x: 144, y: 56, color: '#38bdf8' }
    ],
    createState: () => ({
      resistance: 10000,
      ambientLight: 0,
      coefficient: 'negative',
      lux: 0,
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  capacitor: {
    name: 'Electrolytic Capacitor',
    category: 'passive',
    width: 160,
    height: 142,
    voltage: 16.0,
    maxVoltage: 16.0,
    capacitance: 1000,
    description: '3D Upright Radial Electrolytic Storage Capacitor with standard E6/E12 values (1µF - 10,000µF) and voltage ratings (6.3V - 100V). Stamped top safety relief vent, negative cathode chevron stripe, and dual downward radial leads.',
    terminals: [
      { id: 'anode', label: '+ (Anode)', x: 58, y: 134, polarity: 'pos', color: '#ff453a' },
      { id: 'cathode', label: '− (Cathode)', x: 102, y: 120, polarity: 'neg', color: '#32ade6' }
    ],
    createState: () => ({
      powered: false,
      overheated: false,
      burning: false,
      burnt: false,
      crying: false,
      reversed: false,
      voltageDrop: 0,
      storedVoltage: 0,
      ratedVoltage: 16.0,
      maxVoltage: 16.0,
      capacitance: 1000,
      esr: 0.08,
      eslNh: 20.0,
      chargePercent: 0,
      storedChargeMc: 0,
      storedEnergyMj: 0,
      dischargeTau: 0,
      current: 0,
      power: 0,
      burnReason: ''
    })
  },

  ceramic_capacitor: {
    name: 'Ceramic Capacitor',
    category: 'passive',
    width: 160,
    height: 140,
    voltage: 50.0,
    maxVoltage: 50.0,
    nonPolarized: true,
    description: 'Real Dipped Ceramic Disc & MLCC Capacitor with EIA 3-digit codes (101 to 106). Non-polarized, ideal for high-frequency noise decoupling, signal coupling, and RF filtering!',
    terminals: [
      { id: 't1', label: 'Lead 1', x: 58, y: 132, polarity: 'neutral', color: '#94a3b8' },
      { id: 't2', label: 'Lead 2', x: 102, y: 132, polarity: 'neutral', color: '#94a3b8' }
    ],
    createState: () => ({
      powered: false,
      overheated: false,
      burning: false,
      burnt: false,
      crying: false,
      reversed: false,
      voltageDrop: 0,
      storedVoltage: 0,
      ratedVoltage: 50.0,
      maxVoltage: 50.0,
      ceramicCode: '104',
      capacitancePf: 100000,
      capacitanceNf: 100,
      capacitanceUf: 0.1,
      capacitance: 0.1, // in µF for circuit solver
      effectiveCapacitanceUf: 0.1,
      esr: 0.010,
      eslNh: 0.9,
      dielectricClass: 'Class 2 (X7R)',
      chargePercent: 0,
      storedChargeMc: 0,
      storedEnergyMj: 0,
      dischargeTau: 0,
      current: 0,
      power: 0,
      burnReason: ''
    })
  },

  solenoid: {
    name: 'Solenoid Actuator / Valve',
    category: 'electromagnetism',
    width: 210,
    height: 135,
    resistance: 20,
    nominalVoltage: 9.0,
    maxVoltage: 18.0,
    maxCurrent: 1.0,
    nonPolarized: true,
    description: 'Real Open-Frame Linear Solenoid Actuator / Valve with blue coil, stainless steel plunger, and helical return compression spring. Current generates intense magnetic flux B = μ·n·I pulling the plunger inward!',
    terminals: [
      { id: 'pin1', label: 'Coil (+) Red Wire', x: 186, y: 28, polarity: null, color: '#ef4444' },
      { id: 'pin2', label: 'Coil (−) Black Wire', x: 186, y: 104, polarity: null, color: '#38bdf8' }
    ],
    createState: () => ({
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      mode: 'pinball', // 'pinball' or 'crane'
      current: 0,
      voltageDrop: 0,
      power: 0,
      turns: 500,
      magneticFieldB: 0, // in Tesla / Gauss
      pullForce: 0, // in Newtons
      armPosition: 0, // 0 = resting, 1 = fully pulled down
      burnReason: ''
    })
  },

  rectifier: {
    name: 'Bridge Rectifier (UMB6F)',
    category: 'semiconductor',
    width: 160,
    height: 160,
    resistance: 16,
    maxVoltage: 50.0,
    maxCurrent: 1.5,
    description: 'Miniature Full-Wave Bridge Rectifier IC (UMB6F / MB6S). 4 internal Graetz diodes convert AC alternating cycles into unidirectional full-wave pulsating DC!',
    terminals: [
      { id: 'dc_neg', label: 'DC Output (−)', x: 50, y: 16, polarity: 'neg', color: '#38bdf8' },
      { id: 'dc_pos', label: 'DC Output (+)', x: 110, y: 16, polarity: 'pos', color: '#ef4444' },
      { id: 'ac1', label: 'AC Input ~1', x: 50, y: 144, polarity: 'phase', color: '#f59e0b' },
      { id: 'ac2', label: 'AC Input ~2', x: 110, y: 144, polarity: 'neutral', color: '#0284c7' }
    ],
    createState: () => ({
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0,
      burnReason: ''
    })
  },

  inductor: {
    name: 'Power Inductor (Choke)',
    category: 'passive',
    width: 160,
    height: 140,
    resistance: 0.8,
    maxVoltage: 50.0,
    maxCurrent: 3.5,
    description: 'High-current radial power choke inductor with cylindrical ferrite core and enameled copper magnet wire coil. Stores energy in magnetic field B with inductive reactance X_L = 2πfL.',
    terminals: [
      { id: 'pin1', label: 'Lead 1 (Start)', x: 45, y: 124, polarity: 'passive', color: '#f59e0b' },
      { id: 'pin2', label: 'Lead 2 (Finish)', x: 115, y: 124, polarity: 'passive', color: '#0284c7' }
    ],
    createState: () => ({
      inductanceMh: 10,
      inductanceUh: 10000,
      dcr: 0.8,
      isat: 3.5,
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      actualCurrent: 0,
      targetCurrent: 0,
      power: 0,
      storedEnergy: 0,
      magneticFlux: 0,
      reactanceXl: 0,
      impedanceZ: 0.8,
      tau: 0,
      riseTime5Tau: 0,
      circuitRole: 'general_choke',
      circuitRoleName: 'Power Choke Inductor',
      roleDetail: 'Dynamic current limiter and magnetic energy storage (E = ½LI²).',
      flybackProtected: false,
      flybackType: '',
      kickbackVoltage: 0,
      kickbackClamped: false,
      previousCurrent: 0,
      burnReason: ''
    })
  },

  ammeter: {
    name: 'Precision Ammeter (AC/DC)',
    category: 'instrument',
    width: 140,
    height: 130,
    resistance: 0.01,
    maxVoltage: 50.0,
    maxCurrent: 10.0,
    description: 'Precision in-line current meter with AC/DC current selector button. Connect in SERIES to measure electron flow. Ultra-low 0.01Ω internal shunt with 10A fast-blow protection fuse.',
    terminals: [
      { id: 'pin_pos', label: 'Positive (+) In', x: 40, y: 116, polarity: 'pos', color: '#ef4444' },
      { id: 'pin_neg', label: 'Negative (−) Out', x: 100, y: 116, polarity: 'neg', color: '#1e293b' }
    ],
    createState: () => ({
      mode: 'dc', // 'dc' or 'ac'
      current: 0,
      measuredCurrent: 0,
      reading: '0.000 A',
      voltageDrop: 0,
      power: 0,
      powered: false,
      reversed: false,
      isAcInput: false,
      modeWarning: '',
      fuseBlown: false,
      fuseRating: 10.0,
      shuntResistance: 0.01,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  voltmeter: {
    name: 'Voltmeter (Voltage)',
    category: 'instrument',
    width: 140,
    height: 130,
    resistance: 10000000,
    maxVoltage: 50.0,
    maxCurrent: 0.001,
    description: 'Precision voltage potential meter. Connect in PARALLEL. Displays electrical potential difference across two points.',
    terminals: [
      { id: 'pin_pos', label: 'Positive (+) Sense', x: 40, y: 116, polarity: 'pos', color: '#ef4444' },
      { id: 'pin_neg', label: 'Negative (−) Sense', x: 100, y: 116, polarity: 'neg', color: '#1e293b' }
    ],
    createState: () => ({
      measuredVoltage: 0,
      voltageDrop: 0,
      current: 0,
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  wattmeter: {
    name: 'Wattmeter (Power)',
    category: 'instrument',
    width: 160,
    height: 140,
    resistance: 0.01,
    maxVoltage: 50.0,
    maxCurrent: 10.0,
    description: 'Digital Active Power Meter. Measures instantaneous voltage and current to calculate electrical power consumption P = V × I in Watts.',
    terminals: [
      { id: 'in_pos', label: 'Source In (+)', x: 30, y: 40, polarity: 'pos', color: '#ef4444' },
      { id: 'in_neg', label: 'Source In (−)', x: 30, y: 110, polarity: 'neg', color: '#1e293b' },
      { id: 'out_pos', label: 'Load Out (+)', x: 130, y: 40, polarity: 'pos', color: '#ef4444' },
      { id: 'out_neg', label: 'Load Out (−)', x: 130, y: 110, polarity: 'neg', color: '#1e293b' }
    ],
    createState: () => ({
      power: 0,
      voltage: 0,
      current: 0,
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  power_supply: {
    name: 'Regulated DC Power Supply',
    category: 'power',
    width: 170,
    height: 180,
    voltage: 12.0,
    internalR: 0.02,
    maxVoltage: 50.0,
    maxCurrent: 5.0,
    description: 'Precision Benchtop Regulated DC Power Supply (0 to 50V DC, 0 to 5A). Adjustable voltage and current limit with Constant Voltage (CV) and Constant Current (CC) automatic regulation.',
    terminals: [
      { id: 'pos', label: 'Output (+)', x: 40, y: 160, polarity: 'pos', color: '#ef4444' },
      { id: 'gnd', label: 'Earth GND', x: 85, y: 160, polarity: 'ground', color: '#f59e0b' },
      { id: 'neg', label: 'Output (−)', x: 130, y: 160, polarity: 'neg', color: '#1e293b' }
    ],
    createState: () => ({
      voltage: 12.0,
      currentLimit: 2.50,
      actualCurrent: 0,
      actualVoltage: 12.0,
      mode: 'cv',
      outputEnabled: true,
      power: 0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  fuse: {
    name: 'Protective Glass Fuse',
    category: 'protection',
    width: 140,
    height: 70,
    resistance: 0.02,
    maxVoltage: 250.0,
    maxCurrent: 10.0,
    description: 'Precision fast-acting glass cartridge fuse (5×20mm). Adjustable current trip rating (0.1A to 10.0A). Sacrificially melts to interrupt fault currents and protect sensitive components.',
    terminals: [
      { id: 'pin1', label: 'Lead 1 (Ferrule)', x: 18, y: 35, polarity: 'passive', color: '#94a3b8' },
      { id: 'pin2', label: 'Lead 2 (Ferrule)', x: 122, y: 35, polarity: 'passive', color: '#94a3b8' }
    ],
    createState: () => ({
      rating: 2.0,
      current: 0,
      voltageDrop: 0,
      blown: false,
      powered: false,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },

  function_generator: {
    name: 'Function Generator',
    category: 'power',
    width: 210,
    height: 165,
    voltage: 3.54,
    frequency: 1000.0,
    internalR: 50.0,
    maxVoltage: 20.0,
    maxCurrent: 0.5,
    description: 'Benchtop Precision Function & Arbitrary Waveform Generator (0.1 Hz to 100 kHz, 0.1 to 20 Vpp). Generates Sine, Square, Triangle, Ramp, and DC signals with adjustable frequency, amplitude, offset, and duty cycle.',
    terminals: [
      { id: 'sync', label: 'Sync / TTL Out', x: 45, y: 148, polarity: 'pos', color: '#38bdf8' },
      { id: 'out', label: 'Main Out (+)', x: 120, y: 148, polarity: 'pos', color: '#ef4444' },
      { id: 'gnd', label: 'Ground Return (−)', x: 175, y: 148, polarity: 'neg', color: '#1e293b' }
    ],
    createState: () => ({
      waveform: 'sine', // 'sine' | 'square' | 'pulse' | 'triangle' | 'ramp' | 'sawtooth' | 'noise' | 'cardiac' | 'dc'
      frequency: 1000.0,
      amplitudeVpp: 10.0,
      dcOffset: 0.0,
      dutyCycle: 50,
      pulseWidthUs: 500.0,
      outputImpedance: '50ohm',
      outputEnabled: true,
      modulation: 'none', // 'none' | 'am' | 'fm' | 'sweep' | 'burst'
      amDepth: 50, // 10% to 100%
      amFreq: 50.0, // Hz
      fmDev: 200.0, // Hz
      fmFreq: 10.0, // Hz
      sweepStart: 100.0, // Hz
      sweepStop: 10000.0, // Hz
      sweepTime: 1.0, // seconds
      burstCycles: 3,
      invert: false,
      phaseDeg: 0,
      voltage: 3.535,
      actualVoltage: 3.535,
      actualCurrent: 0,
      power: 0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },
  oscilloscope: {
    name: 'Digital Storage Oscilloscope',
    category: 'instrument',
    width: 440,
    height: 300,
    internalR: 1000000.0,
    maxVoltage: 100.0,
    description: 'Precision Benchtop Dual-Channel Digital Storage Oscilloscope (DSO). Features large widescreen 8×10 graticule color LCD, 10 µs to 500 ms/div timebase, independent CH1/CH2 Volts/div scaling, AC/DC coupling, edge triggering, run/stop freeze, single-shot acquisition, protocol decoding (UART/I2C/SPI/CAN), FFT spectrum analysis, and on-screen automated telemetry.',
    terminals: [
      { id: 'ch1', label: 'CH1 In (+)', x: 70, y: 268, polarity: 'pos', color: '#eab308' },
      { id: 'ch2', label: 'CH2 In (+)', x: 165, y: 268, polarity: 'pos', color: '#06b6d4' },
      { id: 'gnd', label: 'GND Ref (−)', x: 260, y: 268, polarity: 'neg', color: '#1e293b' }
    ],
    createState: () => ({
      runStop: 'run', // 'run' | 'stop' | 'single'
      timeDiv: 0.001,
      timebaseSec: 0.001,
      ch1Enabled: true,
      ch1VoltsDiv: 2.0,
      ch1Scale: 2.0,
      ch1Coupling: 'dc', // 'dc' | 'ac' | 'gnd'
      ch1Offset: 0.0,
      ch2Enabled: false,
      ch2VoltsDiv: 2.0,
      ch2Scale: 2.0,
      ch2Coupling: 'dc', // 'dc' | 'ac' | 'gnd'
      ch2Offset: 0.0,
      triggerSource: 'ch1', // 'ch1' | 'ch2'
      triggerEdge: 'rising', // 'rising' | 'falling'
      triggerSlope: 'rising',
      triggerLevel: 0.0,
      triggerMode: 'auto', // 'auto' | 'normal' | 'single'
      mathMode: 'off', // 'off' | 'add' | 'sub' | 'fft'
      decodeMode: 'off', // 'off' | 'uart' | 'i2c' | 'spi' | 'can'
      xyMode: false,
      cursorMode: 'off', // 'off' | 'voltage' | 'time'
      vCursor1: 2.0,
      vCursor2: -2.0,
      tCursor1: 0.0002,
      tCursor2: 0.0008,
      singleArmed: false,
      singleTriggered: false,
      phaseDiff: 0.0,
      timeDelay: 0.0,
      ch1Signal: { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 },
      ch2Signal: { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0, duty: 50, riseTime: 0, fallTime: 0, overshoot: 0, rippleV: 0 },
      decodedPackets: [],
      calActive: false,
      voltage: 0,
      voltageDrop: 0,
      current: 0,
      power: 0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: ''
    })
  },
  gate_and: {
    name: 'AND GATE',
    category: 'logic',
    width: 150,
    height: 100,
    voltage: 5.0,
    internalR: 120.0,
    description: 'AND Gate. Output Y = 1 only when both Input A and Input B are 1.',
    terminals: [
      { id: 'in_a', label: 'A', x: 12, y: 30, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'in_b', label: 'B', x: 12, y: 70, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'out', label: 'Y', x: 138, y: 50, polarity: 'logic_out', color: '#f59e0b' }
    ],
    createState: () => ({
      manualA: 0,
      manualB: 0,
      inputA: 0,
      inputB: 0,
      outputLevel: 0,
      outputVoltage: 0.0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0
    })
  },
  gate_or: {
    name: 'OR GATE',
    category: 'logic',
    width: 150,
    height: 100,
    voltage: 5.0,
    internalR: 120.0,
    description: 'OR Gate. Output Y = 1 when either Input A or Input B is 1.',
    terminals: [
      { id: 'in_a', label: 'A', x: 12, y: 30, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'in_b', label: 'B', x: 12, y: 70, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'out', label: 'Y', x: 138, y: 50, polarity: 'logic_out', color: '#f59e0b' }
    ],
    createState: () => ({
      manualA: 0,
      manualB: 0,
      inputA: 0,
      inputB: 0,
      outputLevel: 0,
      outputVoltage: 0.0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0
    })
  },
  gate_not: {
    name: 'NOT GATE',
    category: 'logic',
    width: 140,
    height: 80,
    voltage: 5.0,
    internalR: 120.0,
    description: 'NOT Gate (Inverter). Output Y is the inverted opposite of Input A.',
    terminals: [
      { id: 'in_a', label: 'A', x: 12, y: 40, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'out', label: 'Y', x: 128, y: 40, polarity: 'logic_out', color: '#f59e0b' }
    ],
    createState: () => ({
      manualA: 0,
      inputA: 0,
      outputLevel: 1,
      outputVoltage: 5.0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0
    })
  },
  gate_nand: {
    name: 'NAND GATE',
    category: 'logic',
    width: 150,
    height: 100,
    voltage: 5.0,
    internalR: 120.0,
    description: 'NAND Gate. Output Y = 0 only when both Input A and Input B are 1.',
    terminals: [
      { id: 'in_a', label: 'A', x: 12, y: 30, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'in_b', label: 'B', x: 12, y: 70, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'out', label: 'Y', x: 138, y: 50, polarity: 'logic_out', color: '#f59e0b' }
    ],
    createState: () => ({
      manualA: 0,
      manualB: 0,
      inputA: 0,
      inputB: 0,
      outputLevel: 1,
      outputVoltage: 5.0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0
    })
  },
  gate_nor: {
    name: 'NOR GATE',
    category: 'logic',
    width: 150,
    height: 100,
    voltage: 5.0,
    internalR: 120.0,
    description: 'NOR Gate. Output Y = 1 only when both Input A and Input B are 0.',
    terminals: [
      { id: 'in_a', label: 'A', x: 12, y: 30, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'in_b', label: 'B', x: 12, y: 70, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'out', label: 'Y', x: 138, y: 50, polarity: 'logic_out', color: '#f59e0b' }
    ],
    createState: () => ({
      manualA: 0,
      manualB: 0,
      inputA: 0,
      inputB: 0,
      outputLevel: 1,
      outputVoltage: 5.0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0
    })
  },
  gate_xor: {
    name: 'XOR GATE',
    category: 'logic',
    width: 150,
    height: 100,
    voltage: 5.0,
    internalR: 120.0,
    description: 'XOR Gate. Output Y = 1 when inputs differ (one is 1, the other is 0).',
    terminals: [
      { id: 'in_a', label: 'A', x: 12, y: 30, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'in_b', label: 'B', x: 12, y: 70, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'out', label: 'Y', x: 138, y: 50, polarity: 'logic_out', color: '#f59e0b' }
    ],
    createState: () => ({
      manualA: 0,
      manualB: 0,
      inputA: 0,
      inputB: 0,
      outputLevel: 0,
      outputVoltage: 0.0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0
    })
  },
  gate_xnor: {
    name: 'XNOR GATE',
    category: 'logic',
    width: 150,
    height: 100,
    voltage: 5.0,
    internalR: 120.0,
    description: 'XNOR Gate. Output Y = 1 when inputs are equal (both 0 or both 1).',
    terminals: [
      { id: 'in_a', label: 'A', x: 12, y: 30, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'in_b', label: 'B', x: 12, y: 70, polarity: 'logic_in', color: '#38bdf8' },
      { id: 'out', label: 'Y', x: 138, y: 50, polarity: 'logic_out', color: '#f59e0b' }
    ],
    createState: () => ({
      manualA: 0,
      manualB: 0,
      inputA: 0,
      inputB: 0,
      outputLevel: 1,
      outputVoltage: 5.0,
      powered: true,
      burning: false,
      burnt: false,
      crying: false,
      voltageDrop: 0,
      current: 0,
      power: 0
    })
  },
  ic_7408: {
    name: 'IC 7408 (QUAD AND)',
    category: 'logic',
    width: 180,
    height: 330,
    voltage: 5.0,
    internalR: 50.0,
    description: '7408 Quadruple 2-Input Positive-AND Gates (DIP-14). Recommended operating voltage: 5.0V (2.0V - 6.0V, Max 7.0V).',
    terminals: createQuadICTerminals('AND'),
    createState: () => ({
      powered: false,
      manualPower: false,
      vccVoltage: 0.0,
      voltageDrop: 0.0,
      current: 0.0,
      power: 0.0,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: '',
      gates: [
        { id: 1, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 2, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 3, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 4, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 }
      ]
    })
  },
  ic_7432: {
    name: 'IC 7432 (QUAD OR)',
    category: 'logic',
    width: 180,
    height: 330,
    voltage: 5.0,
    internalR: 50.0,
    description: '7432 Quadruple 2-Input Positive-OR Gates (DIP-14). Recommended operating voltage: 5.0V (2.0V - 6.0V, Max 7.0V).',
    terminals: createQuadICTerminals('OR'),
    createState: () => ({
      powered: false,
      manualPower: false,
      vccVoltage: 0.0,
      voltageDrop: 0.0,
      current: 0.0,
      power: 0.0,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: '',
      gates: [
        { id: 1, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 2, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 3, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 4, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 }
      ]
    })
  },
  ic_7404: {
    name: 'IC 7404 (HEX NOT)',
    category: 'logic',
    width: 180,
    height: 330,
    voltage: 5.0,
    internalR: 50.0,
    description: '7404 Hex Inverter / NOT Gates (DIP-14). Recommended operating voltage: 5.0V (2.0V - 6.0V, Max 7.0V).',
    terminals: create7404Terminals(),
    createState: () => ({
      powered: false,
      manualPower: false,
      vccVoltage: 0.0,
      voltageDrop: 0.0,
      current: 0.0,
      power: 0.0,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: '',
      gates: [
        { id: 1, inA: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0 },
        { id: 2, inA: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0 },
        { id: 3, inA: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0 },
        { id: 4, inA: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0 },
        { id: 5, inA: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0 },
        { id: 6, inA: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0 }
      ]
    })
  },
  ic_7486: {
    name: 'IC 7486 (QUAD XOR)',
    category: 'logic',
    width: 180,
    height: 330,
    voltage: 5.0,
    internalR: 50.0,
    description: '7486 Quadruple 2-Input Exclusive-OR Gates (DIP-14). Recommended operating voltage: 5.0V (2.0V - 6.0V, Max 7.0V).',
    terminals: createQuadICTerminals('XOR'),
    createState: () => ({
      powered: false,
      manualPower: false,
      vccVoltage: 0.0,
      voltageDrop: 0.0,
      current: 0.0,
      power: 0.0,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: '',
      gates: [
        { id: 1, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 2, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 3, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 4, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 }
      ]
    })
  },
  ic_7400: {
    name: 'IC 7400 (QUAD NAND)',
    category: 'logic',
    width: 180,
    height: 330,
    voltage: 5.0,
    internalR: 50.0,
    description: '7400 Quadruple 2-Input Positive-NAND Gates (DIP-14). Recommended operating voltage: 5.0V (2.0V - 6.0V, Max 7.0V).',
    terminals: createQuadICTerminals('NAND'),
    createState: () => ({
      powered: false,
      manualPower: false,
      vccVoltage: 0.0,
      voltageDrop: 0.0,
      current: 0.0,
      power: 0.0,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: '',
      gates: [
        { id: 1, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 2, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 3, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 4, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 }
      ]
    })
  },
  ic_7402: {
    name: 'IC 7402 (QUAD NOR)',
    category: 'logic',
    width: 180,
    height: 330,
    voltage: 5.0,
    internalR: 50.0,
    description: '7402 Quadruple 2-Input Positive-NOR Gates (DIP-14). Recommended operating voltage: 5.0V (2.0V - 6.0V, Max 7.0V).',
    terminals: create7402Terminals(),
    createState: () => ({
      powered: false,
      manualPower: false,
      vccVoltage: 0.0,
      voltageDrop: 0.0,
      current: 0.0,
      power: 0.0,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: '',
      gates: [
        { id: 1, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 2, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 3, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 4, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 }
      ]
    })
  },
  ic_74266: {
    name: 'IC 74266 (QUAD XNOR)',
    category: 'logic',
    width: 180,
    height: 330,
    voltage: 5.0,
    internalR: 50.0,
    description: '74266 Quadruple 2-Input Exclusive-NOR Gates (DIP-14). Recommended operating voltage: 5.0V (2.0V - 6.0V, Max 7.0V).',
    terminals: createQuadICTerminals('XNOR'),
    createState: () => ({
      powered: false,
      manualPower: false,
      vccVoltage: 0.0,
      voltageDrop: 0.0,
      current: 0.0,
      power: 0.0,
      burning: false,
      burnt: false,
      crying: false,
      burnReason: '',
      gates: [
        { id: 1, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 2, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 3, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 },
        { id: 4, inA: 0, inB: 0, out: 0, outV: 0.0, current: 0.0, manualA: 0, manualB: 0 }
      ]
    })
  }
};

class ComponentRenderer {
  static getLedHexColor(colorName) {
    const map = {
      red: '#ff334b',
      green: '#00ff88',
      blue: '#00b4d8',
      yellow: '#ffcc00',
      purple: '#b5179e',
      white: '#f8fafc',
      orange: '#ff8800'
    };
    return map[colorName] || '#ff334b';
  }

  // Common cute expressive cartoon face renderer
  static renderCharacterFace(cx, cy, state, options = {}) {
    const isBurnt = state.burnt;
    const isCrying = state.crying || state.burning;
    const isPowered = state.powered && !isBurnt && !isCrying;
    const isReversed = state.reversed;

    const eyeSpacing = options.eyeSpacing || 14;
    const eyeY = cy + (options.eyeOffsetY || 0);
    const mouthY = cy + (options.mouthOffsetY || 9);
    const eyeR = options.eyeR || 4.5;
    const blushY = cy + (options.blushOffsetY || 5);
    const blushR = options.blushR || 5;

    let eyesSvg = '';
    let mouthSvg = '';
    let tearsSvg = '';

    if (isBurnt) {
      eyesSvg = `
        <g stroke="#f87171" stroke-width="2.2" stroke-linecap="round">
          <line x1="${cx - eyeSpacing - 3.5}" y1="${eyeY - 3.5}" x2="${cx - eyeSpacing + 3.5}" y2="${eyeY + 3.5}"/>
          <line x1="${cx - eyeSpacing + 3.5}" y1="${eyeY - 3.5}" x2="${cx - eyeSpacing - 3.5}" y2="${eyeY + 3.5}"/>
          <line x1="${cx + eyeSpacing - 3.5}" y1="${eyeY - 3.5}" x2="${cx + eyeSpacing + 3.5}" y2="${eyeY + 3.5}"/>
          <line x1="${cx + eyeSpacing + 3.5}" y1="${eyeY - 3.5}" x2="${cx + eyeSpacing - 3.5}" y2="${eyeY + 3.5}"/>
        </g>
      `;
      mouthSvg = `
        <path d="M ${cx - 5.5} ${mouthY + 3} Q ${cx} ${mouthY - 1.5}, ${cx + 5.5} ${mouthY + 3}" 
              stroke="#cbd5e1" stroke-width="2" fill="none" stroke-linecap="round"/>
        <text x="${cx}" y="${eyeY - 10}" font-size="11" text-anchor="middle">💔</text>
      `;
    } else if (isCrying) {
      eyesSvg = `
        <ellipse cx="${cx - eyeSpacing}" cy="${eyeY}" rx="${eyeR + 1.2}" ry="${eyeR + 1.8}" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
        <ellipse cx="${cx + eyeSpacing}" cy="${eyeY}" rx="${eyeR + 1.2}" ry="${eyeR + 1.8}" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
        <circle cx="${cx - eyeSpacing - 1}" cy="${eyeY + 1}" r="2.2" fill="#38bdf8"/>
        <circle cx="${cx + eyeSpacing + 1}" cy="${eyeY + 1}" r="2.2" fill="#38bdf8"/>
        <path d="M ${cx - eyeSpacing - 6} ${eyeY - 6} Q ${cx - eyeSpacing} ${eyeY - 9}, ${cx - eyeSpacing + 5} ${eyeY - 5}" stroke="#ef4444" stroke-width="1.8" fill="none"/>
        <path d="M ${cx + eyeSpacing + 6} ${eyeY - 6} Q ${cx + eyeSpacing} ${eyeY - 9}, ${cx + eyeSpacing - 5} ${eyeY - 5}" stroke="#ef4444" stroke-width="1.8" fill="none"/>
      `;
      tearsSvg = `
        <g class="character-streaming-tears">
          <path d="M ${cx - eyeSpacing - 2} ${eyeY + 4} C ${cx - eyeSpacing - 12} ${eyeY + 10}, ${cx - eyeSpacing - 6} ${eyeY + 22}, ${cx - eyeSpacing - 14} ${eyeY + 32}" 
                stroke="#38bdf8" stroke-width="3.5" fill="none" stroke-linecap="round" class="tear-stream-anim"/>
          <circle cx="${cx - eyeSpacing - 14}" cy="${eyeY + 33}" r="4" fill="#0284c7" class="tear-drop-bounce"/>
          <circle cx="${cx - eyeSpacing - 7}" cy="${eyeY + 18}" r="2.8" fill="#7dd3fc"/>
          
          <path d="M ${cx + eyeSpacing + 2} ${eyeY + 4} C ${cx + eyeSpacing + 12} ${eyeY + 10}, ${cx + eyeSpacing + 6} ${eyeY + 22}, ${cx + eyeSpacing + 14} ${eyeY + 32}" 
                stroke="#38bdf8" stroke-width="3.5" fill="none" stroke-linecap="round" class="tear-stream-anim"/>
          <circle cx="${cx + eyeSpacing + 14}" cy="${eyeY + 33}" r="4" fill="#0284c7" class="tear-drop-bounce"/>
          <circle cx="${cx + eyeSpacing + 7}" cy="${eyeY + 18}" r="2.8" fill="#7dd3fc"/>

          <path d="M ${cx + 1} ${eyeY - 14} Q ${cx + 4} ${eyeY - 9}, ${cx + 1} ${eyeY - 6} Q ${cx - 2} ${eyeY - 9}, ${cx + 1} ${eyeY - 14} Z" fill="#67e8f9" opacity="0.95"/>
        </g>
      `;
      mouthSvg = `
        <ellipse cx="${cx}" cy="${mouthY + 2}" rx="6.5" ry="7.5" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
        <path d="M ${cx - 4} ${mouthY + 4} Q ${cx} ${mouthY + 9}, ${cx + 4} ${mouthY + 4}" fill="#f87171"/>
      `;
    } else if (isReversed) {
      eyesSvg = `
        <path d="M ${cx - eyeSpacing} ${eyeY - 3} A 3 3 0 0 1 ${cx - eyeSpacing + 3} ${eyeY} A 2 2 0 0 1 ${cx - eyeSpacing} ${eyeY + 2} A 1 1 0 0 1 ${cx - eyeSpacing - 1} ${eyeY}" 
              stroke="#fbbf24" stroke-width="1.8" fill="none"/>
        <path d="M ${cx + eyeSpacing} ${eyeY - 3} A 3 3 0 0 1 ${cx + eyeSpacing + 3} ${eyeY} A 2 2 0 0 1 ${cx + eyeSpacing} ${eyeY + 2} A 1 1 0 0 1 ${cx + eyeSpacing - 1} ${eyeY}" 
              stroke="#fbbf24" stroke-width="1.8" fill="none"/>
      `;
      mouthSvg = `
        <path d="M ${cx - 5} ${mouthY} Q ${cx - 2} ${mouthY + 3.5}, ${cx} ${mouthY} T ${cx + 5} ${mouthY}" 
              stroke="#f59e0b" stroke-width="2" fill="none" stroke-linecap="round"/>
      `;
    } else if (isPowered) {
      eyesSvg = `
        <path d="M ${cx - eyeSpacing - 4.5} ${eyeY + 1} Q ${cx - eyeSpacing} ${eyeY - 4.5}, ${cx - eyeSpacing + 4.5} ${eyeY + 1}" 
              stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M ${cx + eyeSpacing - 4.5} ${eyeY + 1} Q ${cx + eyeSpacing} ${eyeY - 4.5}, ${cx + eyeSpacing + 4.5} ${eyeY + 1}" 
              stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <text x="${cx - eyeSpacing - 6}" y="${eyeY - 6}" fill="#fde047" font-size="8.5" font-weight="900">★</text>
        <text x="${cx + eyeSpacing + 6}" y="${eyeY - 6}" fill="#fde047" font-size="8.5" font-weight="900">★</text>
      `;
      mouthSvg = `
        <path d="M ${cx - 6.5} ${mouthY - 1} Q ${cx} ${mouthY + 9}, ${cx + 6.5} ${mouthY - 1} Z" fill="#b91c1c" stroke="#ffffff" stroke-width="1.4"/>
        <path d="M ${cx - 4} ${mouthY + 3} Q ${cx} ${mouthY + 8}, ${cx + 4} ${mouthY + 3} Z" fill="#fb7185"/>
      `;
    } else {
      eyesSvg = `
        <circle cx="${cx - eyeSpacing}" cy="${eyeY}" r="${eyeR}" fill="#0f172a" stroke="#ffffff" stroke-width="1.4"/>
        <circle cx="${cx - eyeSpacing - 1.2}" cy="${eyeY - 1.2}" r="${eyeR * 0.42}" fill="#ffffff"/>
        <circle cx="${cx - eyeSpacing + 1.4}" cy="${eyeY + 1.4}" r="${eyeR * 0.22}" fill="#ffffff"/>

        <circle cx="${cx + eyeSpacing}" cy="${eyeY}" r="${eyeR}" fill="#0f172a" stroke="#ffffff" stroke-width="1.4"/>
        <circle cx="${cx + eyeSpacing - 1.2}" cy="${eyeY - 1.2}" r="${eyeR * 0.42}" fill="#ffffff"/>
        <circle cx="${cx + eyeSpacing + 1.4}" cy="${eyeY + 1.4}" r="${eyeR * 0.22}" fill="#ffffff"/>

        <path d="M ${cx - eyeSpacing - 4.5} ${eyeY - eyeR - 2} Q ${cx - eyeSpacing} ${eyeY - eyeR - 4.5}, ${cx - eyeSpacing + 4.5} ${eyeY - eyeR - 2}" stroke="#94a3b8" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M ${cx + eyeSpacing - 4.5} ${eyeY - eyeR - 2} Q ${cx + eyeSpacing} ${eyeY - eyeR - 4.5}, ${cx + eyeSpacing + 4.5} ${eyeY - eyeR - 2}" stroke="#94a3b8" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      `;
      mouthSvg = `
        <path d="M ${cx - 4.5} ${mouthY} Q ${cx} ${mouthY + 4.5}, ${cx + 4.5} ${mouthY}" 
              stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
      `;
    }

    const blushSvg = `
      <circle cx="${cx - eyeSpacing - 4}" cy="${blushY}" r="${blushR}" fill="#f43f5e" opacity="${isPowered ? '0.65' : '0.4'}"/>
      <circle cx="${cx + eyeSpacing + 4}" cy="${blushY}" r="${blushR}" fill="#f43f5e" opacity="${isPowered ? '0.65' : '0.4'}"/>
    `;

    return `
      <g class="character-face">
        ${blushSvg}
        ${eyesSvg}
        ${mouthSvg}
        ${tearsSvg}
      </g>
    `;
  }

  static renderBurningOverlay(width, height) {
    const cx = (width / 1.30) / 2;
    const cy = (height / 1.30) / 2;
    return `
      <g class="burning-fire-fx">
        <circle cx="${cx}" cy="${cy}" r="${Math.min(width, height) * 0.38}" fill="#ff4500" opacity="0.65" filter="blur(8px)" class="fire-pulse"/>
        <circle cx="${cx}" cy="${cy}" r="${Math.min(width, height) * 0.25}" fill="#ffcc00" opacity="0.85" class="fire-core"/>
        
        <path d="M ${cx - 15} ${cy + 10} Q ${cx - 20} ${cy - 20}, ${cx - 8} ${cy - 35} Q ${cx} ${cy - 10}, ${cx + 8} ${cy - 30} Q ${cx + 18} ${cy - 15}, ${cx + 15} ${cy + 10} Z" fill="#ff3b30" class="flame-tongue-1"/>
        <path d="M ${cx - 8} ${cy + 10} Q ${cx - 12} ${cy - 15}, ${cx} ${cy - 30} Q ${cx + 12} ${cy - 15}, ${cx + 8} ${cy + 10} Z" fill="#fbbf24" class="flame-tongue-2"/>

        <circle cx="${cx - 10}" cy="${cy - 30}" r="10" fill="#475569" opacity="0.75" class="smoke-puff puff-1"/>
        <circle cx="${cx + 8}" cy="${cy - 42}" r="13" fill="#334155" opacity="0.65" class="smoke-puff puff-2"/>
        <circle cx="${cx - 4}" cy="${cy - 52}" r="16" fill="#1e293b" opacity="0.55" class="smoke-puff puff-3"/>

        <rect x="${cx - 62}" y="${cy * 2 - 18}" width="124" height="20" rx="4" fill="#ef4444" opacity="0.95"/>
        <text x="${cx}" y="${cy * 2 - 5}" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">🔥 OVERHEATING & CRYING!</text>
      </g>
    `;
  }

  static renderBurntOverlay(width, height) {
    const cx = (width / 1.30) / 2;
    const cy = (height / 1.30) / 2;
    return `
      <g class="burnt-charred-fx">
        <rect x="5" y="5" width="${(width / 1.30) - 10}" height="${(height / 1.30) - 10}" rx="8" fill="#09090b" opacity="0.84"/>
        <path d="M ${cx - 25} ${cy - 15} L ${cx - 5} ${cy + 5} L ${cx + 15} ${cy - 10} L ${cx + 28} ${cy + 12}" stroke="#ef4444" stroke-width="2.5" fill="none" opacity="0.85"/>
        
        <rect x="${cx - 56}" y="${cy - 15}" width="112" height="28" rx="6" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
        <text x="${cx}" y="${cy + 4}" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="11" font-weight="900" text-anchor="middle">💥 BROKEN / BURNT</text>
      </g>
    `;
  }

  // Render SVG with 1.30x scale and prominent text sizes in the play area
  static renderSVG(comp) {
    const def = COMPONENT_DEFINITIONS[comp.type];
    if (!def) return '';

    let content = '';
    const state = comp.state;
    const isBurning = state.burning;
    const isBurnt = state.burnt;
    const isCrying = state.crying;

    switch (comp.type) {
      // 1. REALISTIC 9V E10 MINIATURE INCANDESCENT LAMP (MES Screw-Base with Coiled Tungsten)
      case 'bulb': {
        const isBurnt = state.burnt;
        const isBurning = state.burning;
        const isCrying = state.crying || isBurning;
        const isPowered = state.powered && !isBurnt && !isBurning;
        const vDrop = state.voltageDrop || 0;
        const rawB = state.brightness !== undefined ? state.brightness : (vDrop > 0 ? Math.pow(vDrop / 9.0, 0.55) : 0);
        const isLit = isPowered && rawB >= 0.015 && (vDrop >= 0.30 || rawB >= 0.015);
        const bulbBrightness = isLit ? Math.min(2.2, rawB) : 0;
        const glowRadius = Math.round(10 + bulbBrightness * 38);
        const coreRadius = Math.round(5 + bulbBrightness * 24);
        const bulbHaloOpacity = Math.min(0.88, Math.pow(bulbBrightness, 0.85) * 0.82);
        const flareSpikesOpacity = bulbBrightness < 0.25 ? 0 : Math.min(0.92, (bulbBrightness - 0.25) * 1.25);
        const globeFillOpacity = Math.min(0.95, Math.max(0.08, Math.pow(bulbBrightness, 0.70) * 0.88));
        const filamentColor = !isLit ? '#94a3b8' : 
          (bulbBrightness < 0.12 ? '#dc2626' : 
          (bulbBrightness < 0.35 ? '#ea580c' : 
          (bulbBrightness < 0.75 ? '#f59e0b' : '#ffffff')));
        const filamentGlowColor = !isLit ? 'transparent' : 
          (bulbBrightness < 0.12 ? 'rgba(220, 38, 38, 0.5)' : 
          (bulbBrightness < 0.35 ? '#c2410c' : 
          (bulbBrightness < 0.75 ? '#f59e0b' : '#fef08a')));

        content = `
          <g class="comp-bulb comp-real-bulb ${isPowered ? 'powered' : ''} ${isCrying ? 'danger-pulse character-crying-shake' : ''}">
            <defs>
              <!-- Chrome Screw Base Metallic Shading -->
              <linearGradient id="bulb-screw-metal-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="15%" stop-color="#cbd5e1"/>
                <stop offset="35%" stop-color="#ffffff"/>
                <stop offset="60%" stop-color="#e2e8f0"/>
                <stop offset="85%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#334155"/>
              </linearGradient>

              <!-- Solder Nub Metallic Gradient -->
              <linearGradient id="bulb-solder-nub-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#cbd5e1"/>
                <stop offset="40%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>

              <!-- Lead Wire Gradient -->
              <linearGradient id="bulb-lead-metal-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#94a3b8"/>
                <stop offset="40%" stop-color="#f8fafc"/>
                <stop offset="80%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#64748b"/>
              </linearGradient>

              <!-- Clear Glass Globe Shading (Unpowered) -->
              <radialGradient id="bulb-glass-depth-${comp.id}" cx="42%" cy="32%" r="68%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.32)"/>
                <stop offset="45%" stop-color="rgba(255,255,255,0.03)"/>
                <stop offset="85%" stop-color="rgba(148,163,184,0.14)"/>
                <stop offset="100%" stop-color="rgba(71,85,105,0.32)"/>
              </radialGradient>

              <linearGradient id="bulb-glass-spec-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
                <stop offset="15%" stop-color="rgba(255,255,255,0.1)"/>
                <stop offset="85%" stop-color="rgba(255,255,255,0.08)"/>
                <stop offset="100%" stop-color="rgba(255,255,255,0.38)"/>
              </linearGradient>

              ${isPowered ? `
                <!-- Incandescent Golden Radial Emission Fill -->
                <radialGradient id="bulb-glow-rad-${comp.id}" cx="50%" cy="34%" r="60%">
                  <stop offset="0%" stop-color="${bulbBrightness < 0.35 ? '#ea580c' : '#ffffff'}" stop-opacity="1"/>
                  <stop offset="20%" stop-color="${bulbBrightness < 0.35 ? '#ea580c' : '#fef08a'}" stop-opacity="0.95"/>
                  <stop offset="50%" stop-color="${bulbBrightness < 0.20 ? '#dc2626' : '#fbbf24'}" stop-opacity="0.85"/>
                  <stop offset="85%" stop-color="#ea580c" stop-opacity="${Math.min(0.8, bulbBrightness * 0.6).toFixed(2)}"/>
                  <stop offset="100%" stop-color="#c2410c" stop-opacity="${Math.min(0.5, bulbBrightness * 0.3).toFixed(2)}"/>
                </radialGradient>
              ` : ''}
            </defs>

            ${isLit && bulbHaloOpacity > 0 ? `
              <!-- Ambient Warm Golden Bloom Halo Behind Bulb -->
              <circle cx="80" cy="36" r="${glowRadius}" fill="#f59e0b" opacity="${bulbHaloOpacity * 0.45}" filter="blur(16px)" class="bulb-ambient-halo"/>
              <circle cx="80" cy="36" r="${coreRadius}" fill="#fbbf24" opacity="${bulbHaloOpacity * 0.75}" filter="blur(7px)" class="bulb-ambient-halo"/>
            ` : ''}

            ${isLit && flareSpikesOpacity > 0 ? `
              <!-- Radiant Incandescent Light Rays / Flare Spikes -->
              <g stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" opacity="${flareSpikesOpacity}">
                <line x1="80" y1="10" x2="80" y2="3"/>
                <line x1="56" y1="20" x2="49" y2="13"/>
                <line x1="104" y1="20" x2="111" y2="13"/>
                <line x1="46" y1="36" x2="37" y2="36"/>
                <line x1="114" y1="36" x2="123" y2="36"/>
              </g>
            ` : ''}

            <!-- 1. External Socket Terminal Contact Arms -->
            <!-- Left Terminal Arm from Screw Shell to (28, 122) -->
            <path d="M 68 84 C 54 86, 38 98, 28 122" fill="none" stroke="url(#bulb-lead-metal-${comp.id})" stroke-width="4.2" stroke-linecap="round"/>
            <path d="M 68 83 C 54 85, 38 97, 27 122" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>

            <!-- Right Terminal Arm from Bottom Solder Nub to (132, 122) -->
            <path d="M 80 110 C 92 110, 114 104, 132 122" fill="none" stroke="url(#bulb-lead-metal-${comp.id})" stroke-width="4.2" stroke-linecap="round"/>
            <path d="M 80 109 C 92 109, 114 103, 133 122" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>

            <!-- Solder Terminal Eyelets -->
            <circle cx="28" cy="122" r="8" fill="url(#bulb-lead-metal-${comp.id})" stroke="#475569" stroke-width="1.2"/>
            <circle cx="132" cy="122" r="8" fill="url(#bulb-lead-metal-${comp.id})" stroke="#475569" stroke-width="1.2"/>
            <text x="28" y="125" fill="#f59e0b" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">A</text>
            <text x="132" y="125" fill="#f59e0b" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">B</text>

            <!-- 2. Glass Bulb Bed Shadow -->
            <circle cx="80" cy="40" r="28" fill="#090d16" opacity="0.25"/>

            <!-- 3. INTERNAL GLASS STEM & TUNGSTEN FILAMENT -->
            <!-- Glass Mount Pillar / Flare Pinch -->
            <path d="M 74 66 L 76 52 L 84 52 L 86 66 Z" fill="rgba(255,255,255,0.32)" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
            <ellipse cx="80" cy="52" rx="4.5" ry="1.5" fill="#cbd5e1" opacity="0.75"/>

            <!-- Two Nickel Lead-in Support Wires -->
            <!-- Left Support Wire -->
            <path d="M 76 52 L 74 36 Q 74 34, 76 34" fill="none" 
                  stroke="${isPowered ? '#fef08a' : '#cbd5e1'}" 
                  stroke-width="1.5" stroke-linecap="round"/>
            <!-- Right Support Wire -->
            <path d="M 84 52 L 86 36 Q 86 34, 84 34" fill="none" 
                  stroke="${isPowered ? '#fef08a' : '#cbd5e1'}" 
                  stroke-width="1.5" stroke-linecap="round"/>

            <!-- Coiled Tungsten Filament Bridge -->
            ${!isBurnt ? `
              ${isLit ? `
                <!-- Incandescent Golden Core Flare -->
                <path d="M 76 34 Q 77 32, 78 34 Q 79 36, 80 34 Q 81 32, 82 34 Q 83 36, 84 34" 
                      fill="none" stroke="${filamentGlowColor}" stroke-width="4.2" stroke-linecap="round" />
                <!-- Pure White-Hot Center -->
                <path d="M 76 34 Q 77 32, 78 34 Q 79 36, 80 34 Q 81 32, 82 34 Q 83 36, 84 34" 
                      fill="none" stroke="${filamentColor}" stroke-width="2" stroke-linecap="round"/>
              ` : `
                <!-- Cold Coiled Tungsten Wire -->
                <path d="M 76 34 Q 77 32, 78 34 Q 79 36, 80 34 Q 81 32, 82 34 Q 83 36, 84 34" 
                      fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
              `}
            ` : `
              <!-- Melted / Snapped Filament Gap in Burnt State -->
              <path d="M 76 34 Q 77 32, 78.5 33" fill="none" stroke="#71717a" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="78.5" cy="33" r="1.3" fill="#3f3f46"/>
              <path d="M 84 34 Q 83 32, 81.5 33" fill="none" stroke="#71717a" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="81.5" cy="33" r="1.3" fill="#3f3f46"/>
            `}

            <!-- 4. GLASS GLOBE ENVELOPE (Spherical with Tapered Neck) -->
            ${isLit && globeFillOpacity > 0.02 ? `
              <!-- Clear Glass Shell Base -->
              <path d="M 68 66 C 66 60, 52 54, 52 40 A 28 28 0 1 1 108 40 C 108 54, 94 60, 92 66 Z" 
                    fill="url(#bulb-glass-depth-${comp.id})" stroke="rgba(255,255,255,0.45)" stroke-width="1.2"/>
              <!-- Glowing Warm Amber/Golden Globe Fill -->
              <path d="M 68 66 C 66 60, 52 54, 52 40 A 28 28 0 1 1 108 40 C 108 54, 94 60, 92 66 Z" 
                    fill="url(#bulb-glow-rad-${comp.id})" stroke="#fde047" stroke-width="1.2" opacity="${globeFillOpacity}"/>
            ` : (isBurnt ? `
              <!-- Darkened Glass Globe with Soot/Tungsten Deposition -->
              <path d="M 68 66 C 66 60, 52 54, 52 40 A 28 28 0 1 1 108 40 C 108 54, 94 60, 92 66 Z" 
                    fill="rgba(15, 23, 42, 0.85)" stroke="#71717a" stroke-width="1.2"/>
              <!-- Vaporized Tungsten Soot Stain -->
              <circle cx="80" cy="26" r="14" fill="#09090b" opacity="0.75" filter="blur(4px)"/>
            ` : `
              <!-- Clear Water-Clear Transparent Glass Globe -->
              <path d="M 68 66 C 66 60, 52 54, 52 40 A 28 28 0 1 1 108 40 C 108 54, 94 60, 92 66 Z" 
                    fill="url(#bulb-glass-depth-${comp.id})" stroke="rgba(255,255,255,0.45)" stroke-width="1.2"/>
              <path d="M 68 66 C 66 60, 52 54, 52 40 A 28 28 0 1 1 108 40 C 108 54, 94 60, 92 66 Z" 
                    fill="url(#bulb-glass-spec-${comp.id})"/>
            `)}

            <!-- 5. 3D Specular Glass Glare Highlights -->
            <!-- Top Left Round Highlight Arc -->
            <path d="M 60 32 A 22 22 0 0 1 76 16" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="${isPowered ? '0.88' : '0.75'}" class="bulb-specular-arc"/>
            <path d="M 63 30 A 18 18 0 0 1 75 18" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="${isPowered ? '0.6' : '0.45'}" class="bulb-specular-arc"/>
            <!-- Right Edge Rim Specular Highlight -->
            <path d="M 104 32 A 25 25 0 0 1 96 56" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" class="bulb-specular-arc"/>
            <!-- Globe Apex Highlight Dot -->
            <ellipse cx="80" cy="14" rx="4" ry="1.5" fill="#ffffff" opacity="${isPowered ? '0.85' : '0.6'}" class="bulb-specular-arc"/>

            <!-- 6. E10 MINIATURE EDISON SCREW BASE (Chrome with Sculpted Helical Threads) -->
            <!-- Top Collar Ring -->
            <rect x="67" y="66" width="26" height="7" rx="1" fill="url(#bulb-screw-metal-${comp.id})" stroke="#334155" stroke-width="0.8"/>
            <line x1="68" y1="67" x2="92" y2="67" stroke="#ffffff" stroke-width="0.8" opacity="0.85"/>
            <!-- Engraved "9V E10" Text on collar -->
            <text x="80" y="71.5" fill="#1e293b" font-family="'Outfit', sans-serif" font-size="5" font-weight="900" text-anchor="middle" letter-spacing="0.5px">9V E10</text>

            <!-- Helical Screw Threads (E10) -->
            <!-- Thread 1 -->
            <path d="M 67 73 Q 80 75, 93 73 L 93.5 79 Q 80 81, 66.5 79 Z" fill="url(#bulb-screw-metal-${comp.id})" stroke="#334155" stroke-width="0.6"/>
            <path d="M 68 74 Q 80 76, 92 74" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.8"/>

            <!-- Thread 2 -->
            <path d="M 67 79 Q 80 81, 93 79 L 93.5 85 Q 80 87, 66.5 85 Z" fill="url(#bulb-screw-metal-${comp.id})" stroke="#334155" stroke-width="0.6"/>
            <path d="M 68 80 Q 80 82, 92 80" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.8"/>

            <!-- Thread 3 -->
            <path d="M 67 85 Q 80 87, 93 85 L 92.5 91 Q 80 93, 67.5 91 Z" fill="url(#bulb-screw-metal-${comp.id})" stroke="#334155" stroke-width="0.6"/>
            <path d="M 68 86 Q 80 88, 92 86" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.8"/>

            <!-- Base Bottom Flange -->
            <path d="M 68 91 Q 80 93, 92 91 L 90.5 95 Q 80 97, 69.5 95 Z" fill="url(#bulb-screw-metal-${comp.id})" stroke="#334155" stroke-width="0.6"/>

            <!-- 7. Black Vitrite Insulator & Solder Tip -->
            <!-- Black Vitrite Collar -->
            <path d="M 70 95 L 90 95 L 87 103 L 73 103 Z" fill="#090d16" stroke="#020617" stroke-width="0.8"/>
            <ellipse cx="80" cy="98" rx="6" ry="1.5" fill="#1e293b" opacity="0.8"/>

            <!-- Metal Solder Tip Contact Nub -->
            <path d="M 74 103 L 86 103 L 83 108 L 77 108 Z" fill="url(#bulb-solder-nub-${comp.id})" stroke="#334155" stroke-width="0.6"/>
            <ellipse cx="80" cy="108" rx="3" ry="1.2" fill="#cbd5e1"/>

            <!-- 8. Interactive State Notifications -->
            ${isCrying && !isBurnt ? `
              <!-- Overvoltage Warning Badge -->
              <rect x="20" y="0" width="120" height="22" rx="5" fill="#7f1d1d" stroke="#fca5a5" stroke-width="1.6" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"/>
              <text x="80" y="15" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">🔥 OVERVOLTAGE CRYING!</text>
            ` : ''}

            ${isBurnt ? `
              <!-- Burnt Out Notification Badge -->
              <rect x="24" y="0" width="112" height="22" rx="5" fill="#18181b" stroke="#ef4444" stroke-width="1.6" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"/>
              <text x="80" y="15" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">💥 BURNT FILAMENT!</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 2. REALISTIC 5mm CLEAR EPOXY LED (Light Emitting Diode with Anvil, Whisker & Die)
      case 'led': {
        const isBurnt = state.burnt;
        const isBurning = state.burning;
        const isCrying = state.crying || isBurning;
        const isPowered = state.powered && !isBurnt && !isBurning;
        const color = state.color || 'red';
        const isBlinking = isPowered && state.blinking;
        const isReversed = state.reversed;
        const vDrop = state.voltageDrop || 0;
        const rawLedB = (state.brightness !== undefined) ? state.brightness : (state.current !== undefined ? state.current / 0.020 : (vDrop > 0 ? vDrop / 2.5 : 1.0));
        const isLedLit = isPowered && rawLedB >= 0.015;
        const ledBrightness = isLedLit ? Math.min(2.2, rawLedB) : 0;

        const colorPalettes = {
          red: { hex: '#ff334b', glow: '#ef4444', core: '#ffffff', dark: '#991b1b', light: '#fca5a5' },
          green: { hex: '#10b981', glow: '#059669', core: '#ffffff', dark: '#064e3b', light: '#6ee7b7' },
          blue: { hex: '#0ea5e9', glow: '#0284c7', core: '#ffffff', dark: '#0c4a6e', light: '#7dd3fc' },
          yellow: { hex: '#facc15', glow: '#eab308', core: '#ffffff', dark: '#713f12', light: '#fef08a' },
          purple: { hex: '#c084fc', glow: '#a855f7', core: '#ffffff', dark: '#581c87', light: '#f3e8ff' },
          white: { hex: '#f8fafc', glow: '#cbd5e1', core: '#ffffff', dark: '#334155', light: '#ffffff' },
          orange: { hex: '#f97316', glow: '#ea580c', core: '#ffffff', dark: '#7c2d12', light: '#fed7aa' }
        };
        const cp = colorPalettes[color] || colorPalettes.red;

        const ambientRadius = Math.round(10 + ledBrightness * 35);
        const coreRadius = Math.round(5 + ledBrightness * 20);
        const ledHaloOpacity = Math.min(0.88, Math.pow(ledBrightness, 0.85) * 0.82);
        const ledBeamOpacity = ledBrightness < 0.18 ? 0 : Math.min(0.90, (ledBrightness - 0.18) * 1.15);
        const ledDomeOpacity = Math.min(0.95, Math.max(0.12, Math.pow(ledBrightness, 0.68) * 0.88));
        const dieCoreR = Math.max(0.8, Math.min(5.5, 0.8 + ledBrightness * 2.3));

        content = `
          <g class="comp-led comp-real-led ${isPowered ? 'powered' : ''} ${isBlinking ? 'blink-anim' : ''} ${isCrying ? 'danger-pulse character-crying-shake' : ''}">
            <defs>
              <!-- Metallic Lead Tinned Silver Gradient -->
              <linearGradient id="led-lead-metal-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#94a3b8"/>
                <stop offset="35%" stop-color="#f8fafc"/>
                <stop offset="70%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#64748b"/>
              </linearGradient>

              <!-- Metallic Anvil & Post Shading -->
              <linearGradient id="led-anvil-metal-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f8fafc"/>
                <stop offset="35%" stop-color="#cbd5e1"/>
                <stop offset="70%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>

              <!-- Clear Epoxy Glass Shading (Unpowered) -->
              <linearGradient id="led-glass-grad-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.42)"/>
                <stop offset="15%" stop-color="rgba(255,255,255,0.12)"/>
                <stop offset="50%" stop-color="rgba(255,255,255,0.04)"/>
                <stop offset="85%" stop-color="rgba(255,255,255,0.12)"/>
                <stop offset="100%" stop-color="rgba(255,255,255,0.38)"/>
              </linearGradient>

              <radialGradient id="led-depth-rad-${comp.id}" cx="46%" cy="36%" r="64%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
                <stop offset="60%" stop-color="rgba(255,255,255,0.02)"/>
                <stop offset="90%" stop-color="rgba(148,163,184,0.16)"/>
                <stop offset="100%" stop-color="rgba(71,85,105,0.32)"/>
              </radialGradient>

              ${isPowered ? `
                <!-- Photonic Emission Radial Fill -->
                <radialGradient id="led-glow-rad-${comp.id}" cx="51%" cy="42%" r="56%">
                  <stop offset="0%" stop-color="${cp.core}" stop-opacity="${Math.min(1.0, 0.5 + ledBrightness * 0.5).toFixed(2)}"/>
                  <stop offset="25%" stop-color="${cp.light}" stop-opacity="${Math.min(0.95, 0.35 + ledBrightness * 0.6).toFixed(2)}"/>
                  <stop offset="55%" stop-color="${cp.hex}" stop-opacity="${Math.min(0.90, 0.25 + ledBrightness * 0.65).toFixed(2)}"/>
                  <stop offset="85%" stop-color="${cp.dark}" stop-opacity="${Math.min(0.92, 0.20 + ledBrightness * 0.72).toFixed(2)}"/>
                  <stop offset="100%" stop-color="${cp.dark}" stop-opacity="${Math.min(0.98, 0.20 + ledBrightness * 0.78).toFixed(2)}"/>
                </radialGradient>

                <!-- Upward Directed Photonic Light Beam Cone -->
                <linearGradient id="led-beam-cone-${comp.id}" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stop-color="${cp.core}" stop-opacity="${Math.min(0.9, 0.3 + ledBrightness * 0.6).toFixed(2)}"/>
                  <stop offset="35%" stop-color="${cp.hex}" stop-opacity="${Math.min(0.7, 0.2 + ledBrightness * 0.5).toFixed(2)}"/>
                  <stop offset="100%" stop-color="${cp.hex}" stop-opacity="0.05"/>
                </linearGradient>
              ` : ''}
            </defs>

            ${isLedLit && ledHaloOpacity > 0 ? `
              <!-- Ambient Bloom Aura Behind Component -->
              <circle cx="80" cy="40" r="${ambientRadius}" fill="${cp.glow}" opacity="${ledHaloOpacity * 0.45}" filter="blur(14px)" class="led-ambient-halo"/>
              <circle cx="80" cy="40" r="${coreRadius}" fill="${cp.hex}" opacity="${ledHaloOpacity * 0.75}" filter="blur(6px)" class="led-ambient-halo"/>
            ` : ''}

            <!-- 1. External Solder Leads (Tinned Silver with Standoff Crimp Notches) -->
            <!-- Left Lead (Anode +) connecting to (35, 110) -->
            <path d="M 70.5 68 L 70.5 76 C 70.5 96, 35 92, 35 110" fill="none" stroke="url(#led-lead-metal-${comp.id})" stroke-width="4.2" stroke-linecap="round"/>
            <path d="M 69.5 68 L 69.5 76 C 69.5 95, 34 91, 34 110" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/>
            <!-- Standoff Crimp Bump Left -->
            <path d="M 68.2 77 L 72.8 77 L 73.6 80.5 L 67.4 80.5 Z" fill="url(#led-lead-metal-${comp.id})" stroke="#475569" stroke-width="0.5"/>

            <!-- Right Lead (Cathode -) connecting to (125, 110) -->
            <path d="M 89.5 68 L 89.5 76 C 89.5 96, 125 92, 125 110" fill="none" stroke="url(#led-lead-metal-${comp.id})" stroke-width="4.2" stroke-linecap="round"/>
            <path d="M 88.5 68 L 88.5 76 C 88.5 95, 124 91, 124 110" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/>
            <!-- Standoff Crimp Bump Right -->
            <path d="M 87.2 77 L 91.8 77 L 92.6 80.5 L 86.4 80.5 Z" fill="url(#led-lead-metal-${comp.id})" stroke="#475569" stroke-width="0.5"/>

            <!-- Lead Terminal Eyelets -->
            <circle cx="35" cy="110" r="8" fill="url(#led-lead-metal-${comp.id})" stroke="#475569" stroke-width="1.2"/>
            <circle cx="125" cy="110" r="8" fill="url(#led-lead-metal-${comp.id})" stroke="#475569" stroke-width="1.2"/>

            <!-- Lead Polarity Markings & Identification -->
            <text x="51" y="80" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="10" font-weight="900" text-anchor="middle">+</text>
            <text x="109" y="80" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="12" font-weight="900" text-anchor="middle">−</text>
            <text x="80" y="81" fill="#64748b" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.5px">5mm LED</text>

            <!-- 2. Glass Dome Background Bed Shadow -->
            <path d="M 56 36 A 24 24 0 0 1 104 36 L 104 62 L 105.5 62 L 105.5 70 L 52 70 L 52 62 L 56 62 Z" fill="#090d16" opacity="0.32"/>

            <!-- 3. INTERNAL LEADFRAME (Seen through Clear Epoxy Dome) -->
            <!-- Left Post: Anode (+) Leadframe Post -->
            <path d="M 69.2 70 L 69.2 44 L 72.8 44 L 72.8 70 Z" fill="url(#led-anvil-metal-${comp.id})" stroke="#475569" stroke-width="0.5"/>
            <polygon points="69.2,44 72.8,44 72.8,39.5 71,38.5 69.2,39.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.5"/>

            <!-- Right Post: Cathode (-) Anvil Reflector Cup -->
            <!-- Classic 5mm LED Anvil Silhouette from photo -->
            <path d="M 87.2 70 L 87.2 52 L 83 46 L 75.8 46 L 75.8 39 L 78 39 L 80.2 43 L 83.2 43 L 85.5 39 L 94 39 L 94 48 L 91 52 L 91 70 Z" 
                  fill="url(#led-anvil-metal-${comp.id})" stroke="#475569" stroke-width="0.6"/>
            <!-- Polished Reflector Cavity Bevel Surface -->
            <polygon points="78,39 80.2,43 83.2,43 85.5,39 84.2,39 82.5,42.2 81,42.2 79.5,39" fill="#f8fafc" opacity="0.85"/>

            <!-- Semiconductor Die (Light Emitting Silicon Crystal) -->
            <rect x="80.4" y="41.2" width="2.5" height="1.6" rx="0.3" 
                  fill="${isBurnt ? '#09090b' : '#334155'}" 
                  stroke="${isBurnt ? '#18181b' : '#1e293b'}" stroke-width="0.3"/>
            ${!isBurnt ? `<circle cx="81.7" cy="42" r="0.4" fill="#fbbf24"/>` : ''}

            <!-- Gold Whisker Wire Bond (Arched between Anode Post and Cathode Die) -->
            ${!isBurnt ? `
              <path d="M 71 38.5 C 71 30, 81.7 30, 81.7 41.2" fill="none" stroke="#f59e0b" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M 71.4 38 C 71.4 31, 81.3 31, 81.3 41" fill="none" stroke="#fef08a" stroke-width="0.5" stroke-linecap="round" opacity="0.85"/>
            ` : `
              <!-- Severed / Vaporized Bond Wire in Burnt State -->
              <path d="M 71 38.5 Q 71.5 34, 73.5 33" fill="none" stroke="#78350f" stroke-width="1.3" stroke-linecap="round"/>
              <circle cx="73.5" cy="33" r="1.3" fill="#451a03"/>
              <path d="M 81.7 41.2 Q 81 37.5, 79 36" fill="none" stroke="#78350f" stroke-width="1.3" stroke-linecap="round"/>
              <circle cx="79" cy="36" r="1.3" fill="#451a03"/>
            `}

            <!-- 4. CLEAR OR ILLUMINATED EPOXY DOME SHELL -->
            ${isLedLit && ledDomeOpacity > 0.02 ? `
              <!-- Clear Epoxy Base Layer -->
              <path d="M 56 36 A 24 24 0 0 1 104 36 L 104 62 L 105.5 62 L 105.5 70 L 52 70 L 52 62 L 56 62 Z" 
                    fill="url(#led-depth-rad-${comp.id})" stroke="rgba(255,255,255,0.42)" stroke-width="1.2"/>
              <!-- Glowing Colored Epoxy Fill -->
              <path d="M 56 36 A 24 24 0 0 1 104 36 L 104 62 L 105.5 62 L 105.5 70 L 52 70 L 52 62 L 56 62 Z" 
                    fill="url(#led-glow-rad-${comp.id})" opacity="${ledDomeOpacity}" 
                    stroke="${cp.light}" stroke-width="1.2" class="led-chroma-glow"/>

              ${ledBeamOpacity > 0 ? `
              <!-- Upward Photonic Emission Cone from Reflector Cup -->
              <polygon points="81.7,42 62,19 98,19" fill="url(#led-beam-cone-${comp.id})" opacity="${ledBeamOpacity}" class="led-chroma-glow"/>
              ` : ''}

              <!-- Intense White-Hot Die Core Emission -->
              <circle cx="81.7" cy="42" r="${dieCoreR}" fill="#ffffff" class="led-die-core" opacity="${Math.min(1.0, 0.4 + ledBrightness * 0.6)}"/>
            ` : (isBurnt ? `
              <!-- Burnt / Charred Epoxy Lens -->
              <path d="M 56 36 A 24 24 0 0 1 104 36 L 104 62 L 105.5 62 L 105.5 70 L 52 70 L 52 62 L 56 62 Z" 
                    fill="#18181b" opacity="0.92" stroke="#ef4444" stroke-width="1.2"/>
              <!-- Thermal Stress Fracture Cracks in Epoxy -->
              <path d="M 74 24 L 81 31 L 77 36 L 85 43" fill="none" stroke="#f87171" stroke-width="1.2" opacity="0.8"/>
              <path d="M 81 31 L 87 28" fill="none" stroke="#f87171" stroke-width="0.8" opacity="0.7"/>
            ` : `
              <!-- Clear Water-Clear Transparent Epoxy (Off State, Exactly like Photo) -->
              <path d="M 56 36 A 24 24 0 0 1 104 36 L 104 62 L 105.5 62 L 105.5 70 L 52 70 L 52 62 L 56 62 Z" 
                    fill="url(#led-depth-rad-${comp.id})" stroke="rgba(255,255,255,0.42)" stroke-width="1.2"/>
              <path d="M 56 36 A 24 24 0 0 1 104 36 L 104 62 L 105.5 62 L 105.5 70 L 52 70 L 52 62 L 56 62 Z" 
                    fill="url(#led-glass-grad-${comp.id})"/>
            `)}

            <!-- 5. Flange Rim Collar Highlights (Cathode Flat on Right Side at x=104..105.5) -->
            <line x1="52" y1="62" x2="105.5" y2="62" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
            <line x1="52" y1="70" x2="105.5" y2="70" stroke="rgba(255,255,255,0.55)" stroke-width="1.2"/>

            <!-- 6. 3D Specular Glass Highlights (Top Layer for Authentic Glass Tangibility) -->
            <!-- Top Left Curvature Arc Highlight -->
            <path d="M 63 32 A 19 19 0 0 1 78 16" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" opacity="${isPowered ? '0.9' : '0.78'}" class="led-specular-arc"/>
            <!-- Secondary Inner Glare Arc -->
            <path d="M 66 30 A 15 15 0 0 1 76 18" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="${isPowered ? '0.7' : '0.5'}" class="led-specular-arc"/>
            <!-- Left Cylindrical Specular Reflection Streak -->
            <line x1="58" y1="36" x2="58" y2="60" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="${isPowered ? '0.65' : '0.5'}" class="led-specular-arc"/>
            <!-- Right Rim Subtle Glare -->
            <line x1="102" y1="36" x2="102" y2="60" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" class="led-specular-arc"/>
            <!-- Dome Apex Highlight Dot -->
            <ellipse cx="80" cy="14.5" rx="3.5" ry="1.2" fill="#ffffff" opacity="${isPowered ? '0.85' : '0.6'}" class="led-specular-arc"/>

            <!-- 7. Interactive State Notifications -->
            ${isReversed && !isBurnt ? `
              <!-- Reversed Polarity Warning Badge -->
              <rect x="12" y="0" width="136" height="22" rx="5" fill="#0f172a" stroke="#ef4444" stroke-width="1.6" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"/>
              <text x="80" y="15" fill="#ef4444" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">⚠ REVERSED: ANODE IS (+)</text>
            ` : ''}

            ${isCrying && !isBurnt ? `
              <!-- Overvoltage Warning Badge -->
              <rect x="22" y="0" width="116" height="22" rx="5" fill="#7f1d1d" stroke="#fca5a5" stroke-width="1.6" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"/>
              <text x="80" y="15" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">🔥 OVERVOLTAGE CRYING!</text>
            ` : ''}

            ${isBurnt ? `
              <!-- Burnt Out Notification Badge -->
              <rect x="28" y="0" width="104" height="22" rx="5" fill="#18181b" stroke="#ef4444" stroke-width="1.6" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"/>
              <text x="80" y="15" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="10" font-weight="900" text-anchor="middle">💥 BURNT OUT!</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 3. 9V ALKALINE BATTERY (Pristine High-Detail Engineering Component Look)
      case 'battery': {
        const isHot = state.overheated || isBurning || isCrying;
        content = `
          <g class="comp-battery comp-real-battery ${isHot ? 'danger-pulse character-crying-shake' : ''}">
            <defs>
              <!-- 3D Cylindrical Shading for Battery Body -->
              <linearGradient id="bat9v-body-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#cbd5e1" />
                <stop offset="8%" stop-color="#f1f5f9" />
                <stop offset="25%" stop-color="#ffffff" />
                <stop offset="70%" stop-color="#f8fafc" />
                <stop offset="92%" stop-color="#e2e8f0" />
                <stop offset="100%" stop-color="#94a3b8" />
              </linearGradient>

              <!-- Safety Orange Collar Gradient -->
              <linearGradient id="bat9v-orange-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ea580c" />
                <stop offset="12%" stop-color="#ff7a1a" />
                <stop offset="45%" stop-color="#ff6600" />
                <stop offset="85%" stop-color="#f97316" />
                <stop offset="100%" stop-color="#c2410c" />
              </linearGradient>

              <!-- Dark Beveled Top Plate Gradient -->
              <linearGradient id="bat9v-topplate-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#475569" />
                <stop offset="25%" stop-color="#1e293b" />
                <stop offset="100%" stop-color="#090d16" />
              </linearGradient>

              <!-- Metallic Chrome / Nickel Terminal Gradient -->
              <linearGradient id="bat9v-chrome-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="35%" stop-color="#e2e8f0" />
                <stop offset="55%" stop-color="#94a3b8" />
                <stop offset="75%" stop-color="#cbd5e1" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>

              <!-- Radial Chrome Highlight -->
              <radialGradient id="bat9v-radchrome-${comp.id}" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="50%" stop-color="#cbd5e1" />
                <stop offset="80%" stop-color="#64748b" />
                <stop offset="100%" stop-color="#1e293b" />
              </radialGradient>

              <!-- Bottom Metal Crimp Rim -->
              <linearGradient id="bat9v-crimp-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#64748b" />
                <stop offset="25%" stop-color="#cbd5e1" />
                <stop offset="60%" stop-color="#94a3b8" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>
            </defs>

            <!-- Ambient Physical Drop Shadow -->
            <rect x="4" y="16" width="112" height="190" rx="10" fill="#000000" opacity="0.45" filter="blur(6px)"/>

            <!-- Main Battery Shell / Body Container -->
            <rect x="4" y="24" width="112" height="182" rx="10" fill="url(#bat9v-body-${comp.id})" stroke="#94a3b8" stroke-width="0.8"/>

            <!-- 1. Dark Beveled Top Plate (y=12 to y=28) -->
            <rect x="6" y="12" width="108" height="18" rx="5" fill="url(#bat9v-topplate-${comp.id})" stroke="#334155" stroke-width="1.2"/>
            <!-- Recessed snap terminal indent cups on top plate -->
            <ellipse cx="32" cy="18" rx="15" ry="5.5" fill="#090d16" opacity="0.8"/>
            <ellipse cx="88" cy="18" rx="15" ry="5.5" fill="#090d16" opacity="0.8"/>

            <!-- 2. Realistic 3D Top Snap Terminals (Swapped Polarity) -->
            <!-- Left Terminal Snap: Hexagonal/Octagonal Male Stud (NEGATIVE '-' at 32, 14) -->
            <g class="battery-terminal-snap neg-snap" transform="translate(32, 14)">
              <!-- Base dark gasket -->
              <ellipse cx="0" cy="5" rx="14" ry="4.5" fill="#090d16" opacity="0.75"/>
              <!-- Faceted octagonal metal stud -->
              <polygon points="-12,0 -8.5,-6.5 8.5,-6.5 12,0 8.5,6.5 -8.5,6.5" fill="url(#bat9v-chrome-${comp.id})" stroke="#334155" stroke-width="1.2"/>
              <!-- Beveled top face with chrome luster -->
              <polygon points="-9,0 -6,-4.8 6,-4.8 9,0 6,4.8 -6,4.8" fill="url(#bat9v-radchrome-${comp.id})" stroke="#ffffff" stroke-width="0.8"/>
              <!-- Center hollow rivet indent -->
              <circle cx="0" cy="0" r="3.2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
              <circle cx="-1" cy="-1" r="1.1" fill="#ffffff" opacity="0.8"/>
              <!-- Polarity guide ring -->
              <circle cx="0" cy="0" r="14" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.7"/>
            </g>

            <!-- Right Terminal Snap: Circular Concentric Cup (POSITIVE '+' at 88, 14) -->
            <g class="battery-terminal-snap pos-snap" transform="translate(88, 14)">
              <!-- Base dark gasket -->
              <ellipse cx="0" cy="5" rx="13" ry="4.5" fill="#090d16" opacity="0.75"/>
              <!-- Outer cylindrical metal socket ring -->
              <ellipse cx="0" cy="0" rx="12" ry="7" fill="url(#bat9v-chrome-${comp.id})" stroke="#334155" stroke-width="1.2"/>
              <!-- Interior beveled rim -->
              <ellipse cx="0" cy="0" rx="9" ry="5.2" fill="#334155" stroke="#cbd5e1" stroke-width="1"/>
              <!-- Deep central socket cavity -->
              <ellipse cx="0" cy="0" rx="6.5" ry="3.8" fill="#090d16" stroke="#020617" stroke-width="1.2"/>
              <!-- Specular rim highlight -->
              <path d="M -8 -2 A 8 4 0 0 1 8 -2" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.9"/>
              <!-- Polarity guide ring -->
              <circle cx="0" cy="0" r="14" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.7"/>
            </g>

            <!-- 3. Orange Top Collar (y=26 to y=68) -->
            <path d="M 4 36 L 4 68 L 116 68 L 116 36 Q 116 26, 106 26 L 14 26 Q 4 26, 4 36 Z" fill="url(#bat9v-orange-${comp.id})"/>
            <!-- Top specular rim line on collar -->
            <line x1="14" y1="27" x2="106" y2="27" stroke="rgba(255,255,255,0.45)" stroke-width="1.2"/>
            <!-- Dividing seam line between collar and body -->
            <line x1="4" y1="68" x2="116" y2="68" stroke="#cbd5e1" stroke-width="1"/>

            <!-- Terminal Polarity Badges on Orange Collar -->
            <text x="32" y="34" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="11" font-weight="900" text-anchor="middle" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">-</text>
            <text x="88" y="34" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="11" font-weight="900" text-anchor="middle" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">+</text>

            <!-- 9V Bold Typography -->
            <text x="18" y="55" fill="#09090b" font-family="'Outfit', sans-serif" font-size="22" font-weight="900" letter-spacing="-0.5px">9V</text>

            <!-- ALKALINE Engineering Typography -->
            <text x="56" y="52" fill="#09090b" font-family="'Outfit', sans-serif" font-size="10.5" font-weight="800" letter-spacing="1px">ALKALINE</text>

            <!-- 4. White Main Body (y=68 to y=204) -->
            <path d="M 4 68 L 116 68 L 116 196 Q 116 206, 106 206 L 14 206 Q 4 206, 4 196 L 4 68 Z" fill="url(#bat9v-body-${comp.id})"/>

            <!-- Bottom Metallic Crimp Rim -->
            <path d="M 6 202 L 114 202 L 114 205 Q 114 207, 106 207 L 14 207 Q 6 207, 6 205 Z" fill="url(#bat9v-crimp-${comp.id})"/>
            <line x1="8" y1="202" x2="112" y2="202" stroke="#94a3b8" stroke-width="0.8"/>

            <!-- 5. Crisp Vector HobbyHat Logo (Bunny in Top Hat) -->
            <g class="hobbyhat-vector-logo" transform="translate(60, 134)">
              <!-- Lower 'H' Base Structure -->
              <!-- Left Column of H -->
              <path d="M -23 40 L -10 40 L -10 12 L -23 12 Z" fill="#09090b"/>
              <!-- Right Column of H -->
              <path d="M 10 40 L 23 40 L 23 12 L 10 12 Z" fill="#09090b"/>
              <!-- Center Arch connecting the columns -->
              <path d="M -10 40 Q 0 21, 10 40 L 10 12 L -10 12 Z" fill="#09090b"/>

              <!-- Wide Curved Hat Brim -->
              <ellipse cx="0" cy="11" rx="31" ry="7.5" fill="#09090b"/>
              <!-- Hat Brim White Specular Arc -->
              <path d="M -22 14.5 Q 0 19, 22 14.5" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none"/>

              <!-- Hat Crown Body above Brim -->
              <path d="M -23 11 Q -25 -10, -22 -22 L 22 -22 Q 25 -10, 23 11 Z" fill="#09090b"/>

              <!-- Two White Rabbit Ears emerging from inside the Hat -->
              <!-- Left Bunny Ear -->
              <path d="M -11 -22 C -18 -15, -18 7, -11 7 C -6 7, -4 -15, -11 -22 Z" fill="#ffffff"/>
              <!-- Right Bunny Ear -->
              <path d="M 11 -22 C 4 -15, 6 7, 11 7 C 16 7, 18 -15, 11 -22 Z" fill="#ffffff"/>

              <!-- Crown Top Edge Line -->
              <path d="M -22 -22 Q 0 -26, 22 -22" stroke="#09090b" stroke-width="2.5" fill="none"/>
            </g>

            <!-- 'hobbyhat' Text below Logo -->
            <text x="60" y="188" fill="#09090b" font-family="'Outfit', sans-serif" font-size="16.5" font-weight="900" text-anchor="middle" letter-spacing="-0.5px">hobbyhat</text>

            <!-- 6. Specular Cylindrical 3D Light Glints -->
            <!-- Left High-Gloss Specular Line -->
            <line x1="8" y1="28" x2="8" y2="202" stroke="rgba(255,255,255,0.6)" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Right Ambient Shadow Bevel -->
            <line x1="114" y1="28" x2="114" y2="202" stroke="rgba(0,0,0,0.18)" stroke-width="1.8" stroke-linecap="round"/>

            <!-- 7. Interactive Safety Overlays (Short-Circuit & Burnt) -->
            ${isHot ? `
              <!-- Overheating / Short-Circuit Danger Aura -->
              <rect x="2" y="10" width="116" height="200" rx="12" fill="none" stroke="#ef4444" stroke-width="3.5" />
              <g transform="translate(60, 105)">
                <rect x="-52" y="-14" width="104" height="28" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
                <text x="0" y="4" fill="#fee2e2" font-family="'Outfit', sans-serif" font-size="10" font-weight="900" text-anchor="middle">⚠️ OVERHEAT!</text>
              </g>
            ` : ''}

            ${isBurnt ? `
              <!-- Charred / Burnt Out Chemical Seal Rupture Overlay -->
              <rect x="2" y="10" width="116" height="200" rx="12" fill="#09090b" opacity="0.9"/>
              <g transform="translate(60, 105)">
                <rect x="-52" y="-14" width="104" height="28" rx="6" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
                <text x="0" y="4" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="10" font-weight="900" text-anchor="middle">💥 CELLS BLOWN</text>
              </g>
            ` : ''}
          </g>
        `;
        break;
      }

      // 4. 1.5V CELL (AA) (Realistic Authentic Component Look)
      case 'cell': {
        const isHot = state.overheated || isBurning || isCrying;
        content = `
          <g class="comp-cell comp-real-cell ${isHot ? 'danger-pulse character-crying-shake' : ''}">
            <defs>
              <!-- 3D Cylindrical Shading for AA Cell Body -->
              <linearGradient id="cell-body-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#cbd5e1" />
                <stop offset="10%" stop-color="#f1f5f9" />
                <stop offset="28%" stop-color="#ffffff" />
                <stop offset="70%" stop-color="#f8fafc" />
                <stop offset="92%" stop-color="#e2e8f0" />
                <stop offset="100%" stop-color="#94a3b8" />
              </linearGradient>

              <!-- Safety Orange Collar Gradient -->
              <linearGradient id="cell-orange-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ea580c" />
                <stop offset="14%" stop-color="#ff7a1a" />
                <stop offset="48%" stop-color="#ff6600" />
                <stop offset="85%" stop-color="#f97316" />
                <stop offset="100%" stop-color="#c2410c" />
              </linearGradient>

              <!-- Chrome Metal Terminal Gradient -->
              <linearGradient id="cell-chrome-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="35%" stop-color="#e2e8f0" />
                <stop offset="55%" stop-color="#94a3b8" />
                <stop offset="75%" stop-color="#cbd5e1" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>

              <!-- Radial Specular Chrome Highlight for Top Nub -->
              <radialGradient id="cell-radchrome-${comp.id}" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="45%" stop-color="#e2e8f0" />
                <stop offset="80%" stop-color="#64748b" />
                <stop offset="100%" stop-color="#1e293b" />
              </radialGradient>
            </defs>

            <!-- Ambient Physical Drop Shadow -->
            <rect x="6" y="16" width="64" height="190" rx="14" fill="#000000" opacity="0.45" filter="blur(6px)"/>

            <!-- Main Cylindrical AA Casing -->
            <rect x="6" y="18" width="64" height="186" rx="14" fill="url(#cell-body-${comp.id})" stroke="#94a3b8" stroke-width="0.8"/>

            <!-- 1. Metallic Top Shoulder Bevel (Positive Terminal Platform) -->
            <ellipse cx="38" cy="18" rx="28" ry="6" fill="url(#cell-chrome-${comp.id})" stroke="#475569" stroke-width="0.8"/>

            <!-- 2. Raised Cylindrical Positive Metal Button Nub (+ at 38, 12) -->
            <rect x="27" y="6" width="22" height="11" rx="4" fill="url(#cell-chrome-${comp.id})" stroke="#334155" stroke-width="1"/>
            <ellipse cx="38" cy="7" rx="9" ry="3" fill="url(#cell-radchrome-${comp.id})" stroke="#ffffff" stroke-width="0.8"/>

            <!-- Positive Terminal Guide Indicator Ring -->
            <circle cx="38" cy="12" r="12" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.75"/>

            <!-- 3. Safety Orange Top Collar (y=18 to y=66) -->
            <path d="M 6 32 L 6 66 L 70 66 L 70 32 Q 70 18, 54 18 L 22 18 Q 6 18, 6 32 Z" fill="url(#cell-orange-${comp.id})"/>
            <!-- Top rim highlight on collar -->
            <path d="M 12 20 Q 38 17, 64 20" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" fill="none"/>
            <!-- Dividing seam line between orange collar and white body -->
            <line x1="6" y1="66" x2="70" y2="66" stroke="#cbd5e1" stroke-width="1"/>

            <!-- Polarity Badge on Orange Collar (+ Polarity for positive top) -->
            <circle cx="15" cy="42" r="6" fill="none" stroke="#09090b" stroke-width="1.2"/>
            <text x="15" y="45.5" fill="#09090b" font-family="'Outfit', sans-serif" font-size="10" font-weight="900" text-anchor="middle">+</text>

            <!-- 1.5V and AA Typography on Orange Collar -->
            <text x="38" y="38" fill="#09090b" font-family="'Outfit', sans-serif" font-size="13" font-weight="900" text-anchor="middle">1.5V</text>
            <text x="38" y="55" fill="#09090b" font-family="'Outfit', sans-serif" font-size="15" font-weight="900" text-anchor="middle" letter-spacing="0.5px">AA</text>

            <!-- 4. White Cylindrical Lower Body (y=66 to y=200) -->
            <path d="M 6 66 L 70 66 L 70 190 Q 70 200, 56 200 L 20 200 Q 6 200, 6 190 Z" fill="url(#cell-body-${comp.id})"/>

            <!-- 5. Crisp Vector HobbyHat Logo (Bunny in Top Hat) -->
            <g class="hobbyhat-cell-logo" transform="translate(38, 96) scale(0.68)">
              <!-- Lower 'H' Base Legs -->
              <path d="M -23 40 L -10 40 L -10 12 L -23 12 Z" fill="#09090b"/>
              <path d="M 10 40 L 23 40 L 23 12 L 10 12 Z" fill="#09090b"/>
              <path d="M -10 40 Q 0 21, 10 40 L 10 12 L -10 12 Z" fill="#09090b"/>

              <!-- Curved Hat Brim -->
              <ellipse cx="0" cy="11" rx="31" ry="7.5" fill="#09090b"/>
              <!-- Specular Brim Highlight Arc -->
              <path d="M -22 14.5 Q 0 19, 22 14.5" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none"/>

              <!-- Top Hat Crown above Brim -->
              <path d="M -23 11 Q -25 -10, -22 -22 L 22 -22 Q 25 -10, 23 11 Z" fill="#09090b"/>

              <!-- Two White Rabbit Ears emerging from inside the Hat -->
              <path d="M -11 -22 C -18 -15, -18 7, -11 7 C -6 7, -4 -15, -11 -22 Z" fill="#ffffff"/>
              <path d="M 11 -22 C 4 -15, 6 7, 11 7 C 16 7, 18 -15, 11 -22 Z" fill="#ffffff"/>

              <!-- Hat Crown Top Arch -->
              <path d="M -22 -22 Q 0 -26, 22 -22" stroke="#09090b" stroke-width="2.5" fill="none"/>
            </g>

            <!-- Mini Tilted Top Hat Graphic on Brand Name -->
            <g transform="translate(25, 126) rotate(-16)">
              <ellipse cx="0" cy="4" rx="4.5" ry="1.4" fill="#09090b"/>
              <rect x="-3" y="-1" width="6" height="5" fill="#09090b"/>
            </g>

            <!-- 6. Vertical 'hobbyhat' Typography (Exactly from Reference Image) -->
            <g transform="translate(38, 126)">
              <text x="0" y="8" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">h</text>
              <text x="0" y="17" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">o</text>
              <text x="0" y="26" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">b</text>
              <text x="0" y="35" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">b</text>
              <text x="0" y="44" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">y</text>
              <text x="0" y="53" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">h</text>
              <text x="0" y="62" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">a</text>
              <text x="0" y="71" fill="#09090b" font-family="'Outfit', sans-serif" font-size="11.5" font-weight="900" text-anchor="middle">t</text>
            </g>

            <!-- 7. Metallic Flat Negative Base Terminal (- at 38, 198) -->
            <ellipse cx="38" cy="198" rx="28" ry="6.5" fill="url(#cell-chrome-${comp.id})" stroke="#475569" stroke-width="1"/>
            <ellipse cx="38" cy="198" rx="18" ry="4" fill="#334155" opacity="0.4"/>
            <!-- Negative Terminal Guide Indicator Ring -->
            <circle cx="38" cy="198" r="12" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.75"/>

            <!-- 8. Specular Cylindrical 3D Highlights -->
            <!-- Left High-Gloss Specular Line -->
            <line x1="10" y1="20" x2="10" y2="198" stroke="rgba(255,255,255,0.6)" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Right Ambient Shadow Bevel -->
            <line x1="66" y1="20" x2="66" y2="198" stroke="rgba(0,0,0,0.18)" stroke-width="1.8" stroke-linecap="round"/>

            <!-- 9. Interactive Safety Overlays (Short-Circuit & Burnt) -->
            ${isHot ? `
              <!-- Overheating / Short-Circuit Danger Aura -->
              <rect x="3" y="10" width="70" height="198" rx="14" fill="none" stroke="#ef4444" stroke-width="3.5" />
              <g transform="translate(38, 105)">
                <rect x="-35" y="-14" width="70" height="28" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
                <text x="0" y="4" fill="#fee2e2" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">⚠️ HOT!</text>
              </g>
            ` : ''}

            ${isBurnt ? `
              <!-- Charred / Burnt Out Chemical Seal Rupture Overlay -->
              <rect x="3" y="10" width="70" height="198" rx="14" fill="#09090b" opacity="0.9"/>
              <g transform="translate(38, 105)">
                <rect x="-35" y="-14" width="70" height="28" rx="6" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
                <text x="0" y="4" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">💥 BURNT</text>
              </g>
            ` : ''}
          </g>
        `;
        break;
      }

      // 5. 3V COIN CELL (CR2032) (Realistic Authentic Component Look)
      case 'cell3v': {
        const isHot = state.overheated || isBurning || isCrying;
        content = `
          <g class="comp-cell3v comp-real-coin ${isHot ? 'danger-pulse character-crying-shake' : ''}">
            <defs>
              <!-- Metallic Chrome Outer Bevel Gradient -->
              <linearGradient id="coin-outer-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="25%" stop-color="#f1f5f9" />
                <stop offset="50%" stop-color="#cbd5e1" />
                <stop offset="75%" stop-color="#64748b" />
                <stop offset="100%" stop-color="#334155" />
              </linearGradient>

              <!-- Radial Brushed Stainless Steel Face Gradient -->
              <radialGradient id="coin-face-${comp.id}" cx="38%" cy="32%" r="68%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="25%" stop-color="#f8fafc" />
                <stop offset="60%" stop-color="#e2e8f0" />
                <stop offset="85%" stop-color="#cbd5e1" />
                <stop offset="100%" stop-color="#94a3b8" />
              </radialGradient>

              <!-- Metallic Solder Lead Gradient -->
              <linearGradient id="coin-lead-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#cbd5e1" />
                <stop offset="50%" stop-color="#94a3b8" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>
            </defs>

            <!-- Ambient Physical Drop Shadow -->
            <circle cx="72" cy="58" r="43" fill="#000000" opacity="0.45" filter="blur(6px)"/>

            <!-- 1. Connecting Solder Leads & Terminal Eyelets -->
            <!-- Negative Lead (Left to 20, 55) -->
            <path d="M 50 55 L 20 55" stroke="url(#coin-lead-${comp.id})" stroke-width="5" stroke-linecap="round"/>
            <circle cx="20" cy="55" r="7" fill="url(#coin-outer-${comp.id})" stroke="#475569" stroke-width="1.2"/>
            <circle cx="20" cy="55" r="3" fill="#0f172a"/>
            <!-- Negative Guide Indicator Ring -->
            <circle cx="20" cy="55" r="12" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.75"/>
            <text x="20" y="41" fill="#38bdf8" font-family="'Outfit', sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">-</text>

            <!-- Positive Lead (Right to 124, 55) -->
            <path d="M 94 55 L 124 55" stroke="url(#coin-lead-${comp.id})" stroke-width="5" stroke-linecap="round"/>
            <circle cx="124" cy="55" r="7" fill="url(#coin-outer-${comp.id})" stroke="#475569" stroke-width="1.2"/>
            <circle cx="124" cy="55" r="3" fill="#0f172a"/>
            <!-- Positive Guide Indicator Ring -->
            <circle cx="124" cy="55" r="12" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.75"/>
            <text x="124" y="41" fill="#ef4444" font-family="'Outfit', sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">+</text>

            <!-- 2. Outer Beveled Stepped Ring (Positive Can Rim) -->
            <circle cx="72" cy="55" r="43" fill="url(#coin-outer-${comp.id})" stroke="#475569" stroke-width="1.2"/>
            <circle cx="72" cy="55" r="40.5" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.2"/>
            <circle cx="72" cy="55" r="38.5" fill="none" stroke="#334155" stroke-width="1.2" opacity="0.7"/>

            <!-- 3. Main Brushed Stainless Steel Positive Face -->
            <circle cx="72" cy="55" r="37" fill="url(#coin-face-${comp.id})" stroke="#cbd5e1" stroke-width="0.8"/>

            <!-- Circular Machined Machining Specular Arc -->
            <ellipse cx="72" cy="55" rx="33" ry="12" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.4" transform="rotate(-35 72 55)"/>

            <!-- 4. Embossed / Laser-Etched Text Markings -->
            <!-- Prominent Positive '+' Polarity Stamp -->
            <text x="72" y="32" fill="#1e293b" font-family="'Outfit', sans-serif" font-size="16" font-weight="900" text-anchor="middle" filter="drop-shadow(0 0.8px 0 rgba(255,255,255,0.9))">+</text>

            <!-- Model Stamp: CR2032 -->
            <text x="72" y="46" fill="#0f172a" font-family="'Outfit', sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="1.2px" filter="drop-shadow(0 0.8px 0 rgba(255,255,255,0.9))">CR2032</text>

            <!-- Rating Stamp: 3V LITHIUM -->
            <text x="72" y="58" fill="#1e293b" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="800" text-anchor="middle" letter-spacing="0.8px" filter="drop-shadow(0 0.8px 0 rgba(255,255,255,0.9))">3V · Li/MnO₂</text>

            <!-- Capacity & Size: 225mAh · 20×3.2mm -->
            <text x="72" y="68" fill="#334155" font-family="'Outfit', sans-serif" font-size="6.5" font-weight="800" text-anchor="middle" letter-spacing="0.5px" filter="drop-shadow(0 0.8px 0 rgba(255,255,255,0.9))">225mAh · 20×3.2mm</text>

            <!-- Stamped Bunny in Top Hat Brand Emblem -->
            <g class="coin-hobbyhat-stamp" transform="translate(72, 80) scale(0.32)">
              <path d="M -23 40 L -10 40 L -10 12 L -23 12 Z" fill="#334155"/>
              <path d="M 10 40 L 23 40 L 23 12 L 10 12 Z" fill="#334155"/>
              <path d="M -10 40 Q 0 21, 10 40 L 10 12 L -10 12 Z" fill="#334155"/>
              <ellipse cx="0" cy="11" rx="31" ry="7.5" fill="#334155"/>
              <path d="M -23 11 Q -25 -10, -22 -22 L 22 -22 Q 25 -10, 23 11 Z" fill="#334155"/>
              <path d="M -11 -22 C -18 -15, -18 7, -11 7 C -6 7, -4 -15, -11 -22 Z" fill="#cbd5e1"/>
              <path d="M 11 -22 C 4 -15, 6 7, 11 7 C 16 7, 18 -15, 11 -22 Z" fill="#cbd5e1"/>
            </g>

            <!-- 5. Interactive Safety Overlays (Short-Circuit & Burnt) -->
            ${isHot ? `
              <!-- Overheating / Short-Circuit Danger Aura -->
              <circle cx="72" cy="55" r="46" fill="none" stroke="#ef4444" stroke-width="3.5" />
              <g transform="translate(72, 55)">
                <rect x="-35" y="-12" width="70" height="24" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.8"/>
                <text x="0" y="4" fill="#fee2e2" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">⚠️ HOT!</text>
              </g>
            ` : ''}

            ${isBurnt ? `
              <!-- Charred / Depleted Rupture Overlay -->
              <circle cx="72" cy="55" r="43" fill="#09090b" opacity="0.9"/>
              <g transform="translate(72, 55)">
                <rect x="-38" y="-14" width="76" height="28" rx="6" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
                <text x="0" y="4" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">💥 DEPLETED</text>
              </g>
            ` : ''}
          </g>
        `;
        break;
      }

      // 6. DC ELECTRIC MOTOR
      // 6. REALISTIC 3V DC ELECTRIC MOTOR (Type 130 Hobby Motor with Red Propeller Fan)
      case 'motor': {
        const isBurnt = state.burnt;
        const isBurning = state.burning;
        const isCrying = state.crying || isBurning;
        const isPowered = state.powered && !isBurnt && !isBurning;
        const dir = state.direction || 'cw';
        const isCCW = dir === 'ccw';
        const vDrop = state.voltageDrop ? state.voltageDrop.toFixed(1) : '0.0';
        const rpm = isPowered ? (state.rpm || Math.round((state.voltageDrop || 3.0) * 1400)) : 0;
        const fanAngle = state.fanAngle || 0;

        content = `
          <g class="comp-motor comp-real-motor ${isPowered ? 'powered' : ''} ${isCrying ? 'danger-pulse character-crying-shake' : ''}">
            <defs>
              <!-- 130 Galvanized Steel Casing Gradient -->
              <linearGradient id="motor-steel-can-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="10%" stop-color="#94a3b8"/>
                <stop offset="25%" stop-color="#cbd5e1"/>
                <stop offset="45%" stop-color="#f8fafc"/>
                <stop offset="70%" stop-color="#cbd5e1"/>
                <stop offset="90%" stop-color="#64748b"/>
                <stop offset="100%" stop-color="#334155"/>
              </linearGradient>

              <!-- Brass Front Bearing Boss Gradient -->
              <linearGradient id="motor-brass-boss-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fef08a"/>
                <stop offset="35%" stop-color="#d97706"/>
                <stop offset="70%" stop-color="#b45309"/>
                <stop offset="100%" stop-color="#78350f"/>
              </linearGradient>

              <!-- Molded Red Plastic Propeller Fan Gradient -->
              <linearGradient id="motor-fan-red-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff4d4d"/>
                <stop offset="30%" stop-color="#ef4444"/>
                <stop offset="70%" stop-color="#dc2626"/>
                <stop offset="100%" stop-color="#991b1b"/>
              </linearGradient>

              <!-- Stainless Steel Drive Shaft Gradient -->
              <linearGradient id="motor-shaft-metal-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="35%" stop-color="#ffffff"/>
                <stop offset="70%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>

              <!-- Brass Solder Terminal Lug Gradient -->
              <linearGradient id="motor-lug-metal-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#d97706"/>
                <stop offset="40%" stop-color="#fde047"/>
                <stop offset="80%" stop-color="#b45309"/>
                <stop offset="100%" stop-color="#78350f"/>
              </linearGradient>
            </defs>

            <!-- 1. External Rear Solder Terminals connecting to (30, 135) and (140, 135) -->
            <!-- Left Terminal Lead (+) to (30, 135) -->
            <path d="M 60 126 L 60 135 L 30 135" fill="none" stroke="url(#motor-lug-metal-${comp.id})" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 60 125 L 60 134 L 30 134" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

            <!-- Right Terminal Lead (-) to (140, 135) -->
            <path d="M 110 126 L 110 135 L 140 135" fill="none" stroke="url(#motor-lug-metal-${comp.id})" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 110 125 L 110 134 L 140 134" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>

            <!-- Terminal Eyelets -->
            <circle cx="30" cy="135" r="8" fill="#1e293b" stroke="#ff9f0a" stroke-width="2"/>
            <text x="30" y="138.5" fill="#ff9f0a" font-family="'Outfit', sans-serif" font-size="11" font-weight="900" text-anchor="middle">+</text>

            <circle cx="140" cy="135" r="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            <text x="140" y="138" fill="#38bdf8" font-family="'Outfit', sans-serif" font-size="12" font-weight="900" text-anchor="middle">−</text>

            <!-- Motor Can Body Drop Shadow -->
            <rect x="46" y="58" width="78" height="70" rx="14" fill="#090d16" opacity="0.38" filter="blur(6px)"/>

            <!-- 2. Black Plastic Rear End-Cap -->
            <rect x="52" y="116" width="66" height="12" rx="4" fill="#18181b" stroke="#090d16" stroke-width="1"/>
            <!-- Solder Lug Terminals emerging from rear end-cap -->
            <rect x="58" y="122" width="6" height="6" rx="1" fill="url(#motor-lug-metal-${comp.id})"/>
            <rect x="106" y="122" width="6" height="6" rx="1" fill="url(#motor-lug-metal-${comp.id})"/>

            <!-- 3. Type 130 Galvanized Steel Motor Can Body -->
            <path d="
              M 54 54 
              L 116 54 
              A 12 12 0 0 1 122 66 
              L 122 106 
              A 12 12 0 0 1 116 118 
              L 54 118 
              A 12 12 0 0 1 48 106 
              L 48 66 
              A 12 12 0 0 1 54 54 
              Z
            " fill="url(#motor-steel-can-${comp.id})" stroke="${isBurnt ? '#ef4444' : '#334155'}" stroke-width="1.4"/>

            <!-- Brushed Metal Highlights on Steel Can -->
            <line x1="72" y1="55" x2="72" y2="117" stroke="#ffffff" stroke-width="2.2" opacity="0.45"/>
            <line x1="96" y1="55" x2="96" y2="117" stroke="#ffffff" stroke-width="1.2" opacity="0.3"/>

            <!-- Stamped Cooling & Assembly Slots on Can sides -->
            <rect x="49" y="80" width="3" height="10" rx="1" fill="${isBurnt ? '#450a0a' : '#1e293b'}"/>
            <rect x="118" y="80" width="3" height="10" rx="1" fill="${isBurnt ? '#450a0a' : '#1e293b'}"/>

            <!-- Top Front Edge Bevel Contour -->
            <path d="M 54 54 Q 85 58, 116 54" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.7"/>

            <!-- Two Front Face Mounting Screw Holes -->
            <circle cx="65" cy="70" r="3.2" fill="#090d16" stroke="#475569" stroke-width="0.8"/>
            <circle cx="64" cy="69" r="1" fill="#ffffff" opacity="0.5"/>
            <circle cx="105" cy="70" r="3.2" fill="#090d16" stroke="#475569" stroke-width="0.8"/>
            <circle cx="104" cy="69" r="1" fill="#ffffff" opacity="0.5"/>

            <!-- Raised Brass Bearing Boss (Collar Bushing) -->
            <circle cx="85" cy="70" r="10" fill="url(#motor-brass-boss-${comp.id})" stroke="#78350f" stroke-width="1"/>
            <circle cx="85" cy="70" r="7.5" fill="#d97706" stroke="#fef08a" stroke-width="0.8"/>
            <circle cx="85" cy="70" r="4.5" fill="#451a03"/>
            <path d="M 78 67 A 8 8 0 0 1 89 64" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.75"/>

            <!-- Stainless Steel Drive Shaft -->
            <rect x="82.5" y="38" width="5" height="32" rx="1.5" fill="url(#motor-shaft-metal-${comp.id})" stroke="#475569" stroke-width="0.8"/>
            <line x1="84.5" y1="38" x2="84.5" y2="70" stroke="#ffffff" stroke-width="1" opacity="0.8"/>

            <!-- 130 Motor Technical Specification Stamped Labels -->
            <text x="85" y="96" fill="${isBurnt ? '#ef4444' : '#1e293b'}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="900" text-anchor="middle" letter-spacing="0.5px">3V DC 130</text>
            <text x="85" y="105" fill="${isBurnt ? '#fca5a5' : '#475569'}" font-family="'Outfit', sans-serif" font-size="6" font-weight="800" text-anchor="middle">HOBBY MOTOR</text>

            <!-- 4. REAL RED PROPELLER FAN (Rotates dynamically around 85, 40) -->
            <g transform="translate(85, 40)">
              <g id="motor-fan-${comp.id}" class="motor-fan-rotor" transform="rotate(${fanAngle})">
                <!-- Blade 1 (Left / Downward Airfoil Sweep) -->
                <path d="
                  M -5 -3 
                  C -18 -8, -38 -8, -45 -1 
                  C -48 4, -42 10, -28 11 
                  C -16 11, -7 6, 0 4 
                  Z
                " fill="${isBurnt ? '#450a0a' : `url(#motor-fan-red-${comp.id})`}" stroke="${isBurnt ? '#7f1d1d' : '#991b1b'}" stroke-width="1.2"/>
                <path d="M -6 0 C -18 -4, -34 -4, -42 0" fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-linecap="round" opacity="${isBurnt ? '0.3' : '0.8'}"/>

                <!-- Blade 2 (Right / Upward Airfoil Sweep) -->
                <path d="
                  M 5 3 
                  C 18 8, 38 8, 45 1 
                  C 48 -4, 42 -10, 28 -11 
                  C 16 -11, 7 -6, 0 -4 
                  Z
                " fill="${isBurnt ? '#450a0a' : `url(#motor-fan-red-${comp.id})`}" stroke="${isBurnt ? '#7f1d1d' : '#991b1b'}" stroke-width="1.2"/>
                <path d="M 6 0 C 18 4, 34 4, 42 0" fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-linecap="round" opacity="${isBurnt ? '0.3' : '0.8'}"/>

                <!-- Central Propeller Spinner Hub & Nose Dome -->
                <circle cx="0" cy="0" r="9.5" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1"/>
                <circle cx="0" cy="0" r="7.5" fill="${isBurnt ? '#7f1d1d' : `url(#motor-fan-red-${comp.id})`}" stroke="#fca5a5" stroke-width="0.8"/>
                <ellipse cx="-2" cy="-2.5" rx="3" ry="1.8" fill="#ffffff" opacity="${isBurnt ? '0.3' : '0.85'}"/>
              </g>
            </g>

            <!-- 5. Real-time Rotation & Status Telemetry Banner -->
            ${isPowered ? (isCCW ? `
              <rect x="15" y="108" width="140" height="17" rx="4" fill="rgba(88, 28, 135, 0.95)" stroke="#c084fc" stroke-width="1.4"/>
              <text x="85" y="120" fill="#f0abfc" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="middle">⟲ CCW: ${vDrop}V | ${rpm} RPM</text>
            ` : `
              <rect x="15" y="108" width="140" height="17" rx="4" fill="rgba(185, 28, 28, 0.95)" stroke="#f87171" stroke-width="1.4"/>
              <text x="85" y="120" fill="#fee2e2" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="middle">⟳ CW: ${vDrop}V | ${rpm} RPM</text>
            `) : `
              <rect x="36" y="108" width="98" height="16" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#475569" stroke-width="1.2"/>
              <text x="85" y="120" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="9" font-weight="800" text-anchor="middle">3V MOTOR (IDLE)</text>
            `}

            <!-- 6. Notifications for Burnt & Overheated States -->
            ${isCrying && !isBurnt ? `
              <rect x="18" y="0" width="134" height="22" rx="5" fill="#7f1d1d" stroke="#fca5a5" stroke-width="1.6" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"/>
              <text x="85" y="15" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">🔥 OVERVOLTAGE OVERHEAT!</text>
            ` : ''}

            ${isBurnt ? `
              <rect x="22" y="0" width="126" height="22" rx="5" fill="#18181b" stroke="#ef4444" stroke-width="1.6" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.7))"/>
              <text x="85" y="15" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">💥 BURNT / SEIZED COIL!</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 7. REAL SILICON RECTIFIER DIODE (DO-41 PACKAGE)
      case 'diode': {
        const isPowered = state.powered && !isBurnt && !isBurning;
        const isBlocked = state.blocked || state.reversed;

        // Dynamic pin coordinates so lead wire strictly terminates at the terminal marks with ZERO overhang
        const anodeTerm = comp.terminals?.find(t => t.id === 'anode' || t.polarity === 'pos') || { x: 18, y: 35 };
        const cathodeTerm = comp.terminals?.find(t => t.id === 'cathode' || t.polarity === 'neg') || { x: 142, y: 35 };
        const xAnode = anodeTerm.x;
        const xCathode = cathodeTerm.x;
        const yWire = anodeTerm.y || 35;

        content = `
          <g class="comp-diode comp-real-diode ${isPowered ? 'conducting' : ''} ${isBlocked ? 'blocked' : ''}">
            <defs>
              <!-- DO-41 Black Molded Epoxy Body Gradient -->
              <linearGradient id="diode-body-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2d2d32"/>
                <stop offset="16%" stop-color="#4f4f58"/>
                <stop offset="32%" stop-color="#38383e"/>
                <stop offset="65%" stop-color="#141416"/>
                <stop offset="90%" stop-color="#09090b"/>
                <stop offset="100%" stop-color="#1c1c20"/>
              </linearGradient>

              <!-- Cathode Silver Band Gradient -->
              <linearGradient id="diode-band-silver-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#94a3b8"/>
                <stop offset="18%" stop-color="#ffffff"/>
                <stop offset="42%" stop-color="#cbd5e1"/>
                <stop offset="75%" stop-color="#64748b"/>
                <stop offset="100%" stop-color="#334155"/>
              </linearGradient>

              <!-- Tinned Copper Axial Lead Wire Gradient -->
              <linearGradient id="diode-lead-tinned-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="25%" stop-color="#f8fafc"/>
                <stop offset="55%" stop-color="#cbd5e1"/>
                <stop offset="85%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadows for 3D realism -->
            <rect x="53" y="25" width="54" height="24" rx="5" fill="#000000" opacity="0.4" filter="blur(4px)"/>
            <line x1="${xAnode}" y1="${yWire + 2}" x2="54" y2="${yWire + 2}" stroke="#000000" stroke-width="4" opacity="0.25" filter="blur(2px)"/>
            <line x1="106" y1="${yWire + 2}" x2="${xCathode}" y2="${yWire + 2}" stroke="#000000" stroke-width="4" opacity="0.25" filter="blur(2px)"/>

            <!-- 2. Axial Tinned Copper Wire Leads: strictly terminating at pin centers (xAnode and xCathode) with ZERO outer overhang -->
            <!-- Left lead (Anode) -->
            <line x1="${xAnode}" y1="${yWire}" x2="54" y2="${yWire}" stroke="url(#diode-lead-tinned-${comp.id})" stroke-width="4" stroke-linecap="butt"/>
            <line x1="${xAnode}" y1="${yWire - 1.2}" x2="54" y2="${yWire - 1.2}" stroke="#ffffff" stroke-width="1.0" stroke-linecap="butt" opacity="0.8"/>

            <!-- Right lead (Cathode) -->
            <line x1="106" y1="${yWire}" x2="${xCathode}" y2="${yWire}" stroke="url(#diode-lead-tinned-${comp.id})" stroke-width="4" stroke-linecap="butt"/>
            <line x1="106" y1="${yWire - 1.2}" x2="${xCathode}" y2="${yWire - 1.2}" stroke="#ffffff" stroke-width="1.0" stroke-linecap="butt" opacity="0.8"/>

            <!-- 3. DO-41 Molded Epoxy Cylinder Body (Centered in box at x=80, y=35, size 52x24) -->
            <rect x="54" y="23" width="52" height="24" rx="4" fill="url(#diode-body-${comp.id})" stroke="${isBurnt ? '#ef4444' : '#1e1e24'}" stroke-width="1.2"/>

            <!-- Epoxy End Collars / Wire Entry Seals -->
            <rect x="52.5" y="31.5" width="2.5" height="7" rx="1" fill="#18181b" stroke="#333338" stroke-width="0.6"/>
            <rect x="105" y="31.5" width="2.5" height="7" rx="1" fill="#18181b" stroke="#333338" stroke-width="0.6"/>

            <!-- Cylindrical Surface Bevel & Specular Highlight Lines -->
            <line x1="58" y1="25.5" x2="102" y2="25.5" stroke="#ffffff" stroke-width="1.2" opacity="0.45"/>
            <line x1="58" y1="27" x2="102" y2="27" stroke="#ffffff" stroke-width="0.7" opacity="0.2"/>
            <!-- Longitudinal Mold Parting Seam -->
            <line x1="54" y1="35" x2="106" y2="35" stroke="#09090b" stroke-width="0.6" opacity="0.4"/>

            <!-- 4. Cathode Silver Band (Marks Negative / Cathode Terminal End) -->
            <rect x="96" y="23" width="8" height="24" rx="1" fill="url(#diode-band-silver-${comp.id})" stroke="${isBurnt ? '#450a0a' : '#475569'}" stroke-width="0.8"/>
            <line x1="97.5" y1="25.5" x2="102.5" y2="25.5" stroke="#ffffff" stroke-width="1.1" opacity="0.85"/>

            <!-- 5. Forward Direction Indicator (Clean symbol, no model number) -->
            <text x="76" y="38" fill="${isBurnt ? '#ef4444' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="900" text-anchor="middle" opacity="0.65">▶|</text>

            <!-- 6. Burnt / Blown Visuals if Damaged -->
            ${isBurnt ? `
              <path d="M 74 23 L 76 33 L 73 37 L 77 47" fill="none" stroke="#ef4444" stroke-width="1.5"/>
              <circle cx="75" cy="35" r="4.5" fill="#450a0a" opacity="0.85"/>
              <rect x="22" y="3" width="116" height="16" rx="3" fill="#18181b" stroke="#ef4444" stroke-width="1.4"/>
              <text x="80" y="14" fill="#fca5a5" font-family="'Outfit', sans-serif" font-size="8" font-weight="900" text-anchor="middle">💥 SILICON BURNT!</text>
            ` : ''}

            <!-- 7. Real-time Conduction Telemetry Banner (Centered horizontally at x=80) -->
            ${isPowered ? `
              <rect x="32" y="52" width="96" height="15" rx="3.5" fill="rgba(69, 26, 3, 0.95)" stroke="#f59e0b" stroke-width="1.2"/>
              <text x="80" y="63" fill="#fde68a" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="900" text-anchor="middle">⚡ FORWARD (0.7V)</text>
            ` : (isBlocked ? `
              <rect x="32" y="52" width="96" height="15" rx="3.5" fill="rgba(127, 29, 29, 0.95)" stroke="#ef4444" stroke-width="1.2"/>
              <text x="80" y="63" fill="#fca5a5" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="900" text-anchor="middle">⛔ REVERSED (BLOCKS)</text>
            ` : `
              <rect x="42" y="52" width="76" height="15" rx="3.5" fill="rgba(15, 23, 42, 0.85)" stroke="#475569" stroke-width="1"/>
              <text x="80" y="63" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="800" text-anchor="middle">DIODE (IDLE)</text>
            `)}
          </g>
        `;
        break;
      }

      // 8. REAL SINGLE POLE KNIFE SWITCH (SPST) - Standard Lab Alignment
      case 'switch': {
        const isClosed = state.closed && !isBurnt;
        const pin1Term = comp.terminals?.find(t => t.id === 'pin1') || { x: 22, y: 45 };
        const pin2Term = comp.terminals?.find(t => t.id === 'pin2') || { x: 138, y: 45 };
        const x1 = pin1Term.x;
        const x2 = pin2Term.x;
        const yCenter = pin1Term.y || 45;

        content = `
          <g class="comp-switch comp-real-switch ${isClosed ? 'switch-closed' : 'switch-open'}" style="cursor: pointer;">
            <defs>
              <!-- Solid Brass Metallic Gradient -->
              <linearGradient id="switch-brass-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ca8a04"/>
                <stop offset="20%" stop-color="#fef08a"/>
                <stop offset="45%" stop-color="#eab308"/>
                <stop offset="75%" stop-color="#a16207"/>
                <stop offset="100%" stop-color="#713f12"/>
              </linearGradient>

              <!-- Phenolic Slate Base Gradient -->
              <linearGradient id="switch-base-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#27272a"/>
                <stop offset="40%" stop-color="#18181b"/>
                <stop offset="100%" stop-color="#09090b"/>
              </linearGradient>

              <!-- Crimson Bakelite Insulated Handle -->
              <linearGradient id="switch-handle-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#dc2626"/>
                <stop offset="25%" stop-color="#f87171"/>
                <stop offset="60%" stop-color="#991b1b"/>
                <stop offset="100%" stop-color="#450a0a"/>
              </linearGradient>
            </defs>

            <!-- 1. Heavy-Duty Slate Phenolic Base Block (Centered at x=80, y=45) -->
            <rect x="14" y="14" width="132" height="62" rx="6" fill="url(#switch-base-${comp.id})" stroke="#3f3f46" stroke-width="1.4"/>
            <!-- Inner Chamfer Bevel Rim -->
            <rect x="17" y="17" width="126" height="56" rx="4" fill="none" stroke="#52525b" stroke-width="0.8" opacity="0.6"/>

            <!-- 4 Corner Brass Counter-Sunk Mounting Screws -->
            <circle cx="20" cy="20" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>
            <line x1="18.5" y1="20" x2="21.5" y2="20" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="140" cy="20" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>
            <line x1="138.5" y1="20" x2="141.5" y2="20" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="20" cy="70" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>
            <line x1="18.5" y1="70" x2="21.5" y2="70" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="140" cy="70" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>
            <line x1="138.5" y1="70" x2="141.5" y2="70" stroke="#713f12" stroke-width="0.7"/>

            <!-- 2. Solid Brass Conductive Busbars (connecting terminal posts to contacts along yCenter) -->
            <!-- Left busbar (Terminal 1 x1 to hinge post at 48) -->
            <rect x="${x1}" y="${yCenter - 3}" width="${48 - x1}" height="6" rx="1.2" fill="url(#switch-brass-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <!-- Right busbar (contact jaw at 108 to Terminal 2 x2) -->
            <rect x="108" y="${yCenter - 3}" width="${x2 - 108}" height="6" rx="1.2" fill="url(#switch-brass-${comp.id})" stroke="#78350f" stroke-width="0.8"/>

            <!-- 3. Terminal Binding Posts with Knurled Brass Thumb Nuts (Strictly aligned with connection pins) -->
            <!-- Terminal 1 Binding Post at (x1, yCenter) -->
            <polygon points="${x1 - 5.5},${yCenter} ${x1 - 2.75},${yCenter - 4.8} ${x1 + 2.75},${yCenter - 4.8} ${x1 + 5.5},${yCenter} ${x1 + 2.75},${yCenter + 4.8} ${x1 - 2.75},${yCenter + 4.8}" fill="#a16207" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="${x1}" cy="${yCenter}" r="5.2" fill="url(#switch-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
            <circle cx="${x1}" cy="${yCenter}" r="2" fill="#713f12"/>

            <!-- Terminal 2 Binding Post at (x2, yCenter) -->
            <polygon points="${x2 - 5.5},${yCenter} ${x2 - 2.75},${yCenter - 4.8} ${x2 + 2.75},${yCenter - 4.8} ${x2 + 5.5},${yCenter} ${x2 + 2.75},${yCenter + 4.8} ${x2 - 2.75},${yCenter + 4.8}" fill="#a16207" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="${x2}" cy="${yCenter}" r="5.2" fill="url(#switch-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
            <circle cx="${x2}" cy="${yCenter}" r="2" fill="#713f12"/>

            <!-- 4. Left Solid Brass Pivot Hinge Stanchion (Pivots at 48, yCenter) -->
            <rect x="44" y="${yCenter - 8}" width="8" height="16" rx="2" fill="url(#switch-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
            <circle cx="48" cy="${yCenter}" r="2.8" fill="#fef08a" stroke="#713f12" stroke-width="0.8"/>

            <!-- 5. Right Dual Spring-Tempered Brass Contact Jaws (at x=108, yCenter) -->
            <path d="M 105 ${yCenter - 10} C 105 ${yCenter - 4}, 111 ${yCenter - 4}, 111 ${yCenter - 10}" fill="none" stroke="url(#switch-brass-${comp.id})" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M 105 ${yCenter + 10} C 105 ${yCenter + 4}, 111 ${yCenter + 4}, 111 ${yCenter + 10}" fill="none" stroke="url(#switch-brass-${comp.id})" stroke-width="2.6" stroke-linecap="round"/>
            <rect x="106" y="${yCenter - 7}" width="5" height="14" rx="1" fill="#713f12" opacity="0.35"/>

            <!-- 6. Moving Heavy Brass Knife Blade & Upward-Angled Insulated Handle (Pivots at 48, yCenter) -->
            <g transform="translate(48, ${yCenter}) rotate(${isClosed ? '0' : '-35'})" style="transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);">
              <!-- Cast shadow of blade -->
              <rect x="0" y="-1.5" width="62" height="5" rx="1.5" fill="#000000" opacity="0.4" filter="blur(2px)"/>
              
              <!-- Solid Brass Knife Blade (Horizontal in jaw when closed) -->
              <rect x="0" y="-3" width="62" height="6" rx="1.2" fill="url(#switch-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
              <!-- Blade Top Specular Sheen -->
              <line x1="2" y1="-1.2" x2="60" y2="-1.2" stroke="#ffffff" stroke-width="0.9" opacity="0.75" stroke-linecap="round"/>

              <!-- Ferrule Brass Collar connecting insulated handle -->
              <rect x="58" y="-4.5" width="4" height="9" rx="1" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>

              <!-- Ergonomic Insulated Crimson Bakelite Grip Handle (Angled upward by 26 deg so Terminal 2 is never obstructed) -->
              <g transform="translate(62, 0) rotate(-26)">
                <path d="M 0 -4 C 7 -6, 18 -5.5, 23 -3.5 C 25 0, 25 0, 23 3.5 C 18 5.5, 7 6, 0 4 Z" fill="url(#switch-handle-${comp.id})" stroke="#3b0764" stroke-width="0.8"/>
                <!-- Grip Specular Highlight -->
                <line x1="3" y1="-1.5" x2="19" y2="-1.5" stroke="#ffffff" stroke-width="1.0" opacity="0.5" stroke-linecap="round"/>
              </g>
            </g>

            <!-- 7. Electrical Contact Sparkle Glow when Closed or Inductive Opening Arc Spark -->
            ${isClosed ? `
              <circle cx="108" cy="${yCenter}" r="7" fill="#fbbf24" opacity="0.3" filter="blur(2px)"/>
              <line x1="104" y1="${yCenter - 4}" x2="112" y2="${yCenter + 4}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
              <line x1="112" y1="${yCenter - 4}" x2="104" y2="${yCenter + 4}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
            ` : (state.contactSpark ? `
              <!-- High-voltage inductive contact break arc plasma discharge -->
              <circle cx="108" cy="${yCenter}" r="16" fill="#38bdf8" opacity="0.85" filter="blur(4px)"/>
              <path d="M 102 ${yCenter - 8} L 109 ${yCenter - 2} L 105 ${yCenter + 2} L 114 ${yCenter + 9}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M 104 ${yCenter - 6} L 111 ${yCenter - 1} L 107 ${yCenter + 3} L 112 ${yCenter + 7}" stroke="#a5f3fc" stroke-width="1.4" stroke-linecap="round"/>
              <text x="108" y="${yCenter - 12}" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="6.8" font-weight="900" text-anchor="middle">⚡ ARC SPARK!</text>
            ` : '')}

            <!-- 8. Burnt Visuals if Overloaded -->
            ${isBurnt ? `
              <circle cx="108" cy="${yCenter}" r="8" fill="#450a0a" opacity="0.85"/>
              <text x="80" y="32" fill="#ef4444" font-family="'Outfit', sans-serif" font-size="8" font-weight="900" text-anchor="middle">💥 CONTACTS FUSED!</text>
            ` : ''}

            <!-- 9. Stamped Status Nameplate (Centered at x=80, y=60) -->
            <rect x="46" y="58" width="68" height="13" rx="2.5" fill="${isClosed ? 'rgba(69, 26, 3, 0.9)' : 'rgba(30, 41, 59, 0.9)'}" stroke="${isClosed ? '#f59e0b' : '#475569'}" stroke-width="0.9"/>
            <text x="80" y="67.5" fill="${isClosed ? '#fde68a' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="900" text-anchor="middle">
              ${isClosed ? '● CLOSED (ON)' : '○ OPEN (OFF)'}
            </text>
          </g>
        `;
        break;
      }

      // 9. REAL TWO-WAY KNIFE SWITCH (SPDT) - Standard Alignment & Neat Placement
      case 'twowayswitch': {
        const pos = state.position || 1;
        const comTerm = comp.terminals?.find(t => t.id === 'com') || { x: 24, y: 55 };
        const l1Term = comp.terminals?.find(t => t.id === 'l1') || { x: 142, y: 28 };
        const l2Term = comp.terminals?.find(t => t.id === 'l2') || { x: 142, y: 82 };

        const bladeRot = (pos === 1) ? -25 : 25;

        content = `
          <g class="comp-twowayswitch comp-real-twowayswitch" style="cursor: pointer;">
            <defs>
              <!-- Brass Metallic Gradient -->
              <linearGradient id="twoway-brass-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ca8a04"/>
                <stop offset="20%" stop-color="#fef08a"/>
                <stop offset="45%" stop-color="#eab308"/>
                <stop offset="75%" stop-color="#a16207"/>
                <stop offset="100%" stop-color="#713f12"/>
              </linearGradient>

              <!-- Phenolic Slate Base Gradient -->
              <linearGradient id="twoway-base-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#27272a"/>
                <stop offset="40%" stop-color="#18181b"/>
                <stop offset="100%" stop-color="#09090b"/>
              </linearGradient>

              <!-- Crimson Bakelite Handle -->
              <linearGradient id="twoway-handle-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#dc2626"/>
                <stop offset="25%" stop-color="#f87171"/>
                <stop offset="60%" stop-color="#991b1b"/>
                <stop offset="100%" stop-color="#450a0a"/>
              </linearGradient>
            </defs>

            <!-- 1. Heavy-Duty Slate Phenolic Base Block (Centered at x=85, y=55) -->
            <rect x="12" y="8" width="146" height="94" rx="6" fill="url(#twoway-base-${comp.id})" stroke="#3f3f46" stroke-width="1.4"/>
            <!-- Inner Chamfer Bevel -->
            <rect x="15" y="11" width="140" height="88" rx="4" fill="none" stroke="#52525b" stroke-width="0.8" opacity="0.6"/>

            <!-- 4 Corner Mounting Screws -->
            <circle cx="18" cy="14" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>
            <circle cx="152" cy="14" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>
            <circle cx="18" cy="96" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>
            <circle cx="152" cy="96" r="2.2" fill="#ca8a04" stroke="#713f12" stroke-width="0.6"/>

            <!-- 2. Solid Brass Conductive Busbars -->
            <!-- COM busbar (from comTerm.x to pivot hinge at 48) -->
            <rect x="${comTerm.x}" y="${comTerm.y - 3}" width="${48 - comTerm.x}" height="6" rx="1.2" fill="url(#twoway-brass-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <!-- L1 busbar (from upper jaw at 106 to l1Term.x at 142) -->
            <rect x="106" y="${l1Term.y - 3}" width="${l1Term.x - 106}" height="6" rx="1.2" fill="url(#twoway-brass-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <!-- L2 busbar (from lower jaw at 106 to l2Term.x at 142) -->
            <rect x="106" y="${l2Term.y - 3}" width="${l2Term.x - 106}" height="6" rx="1.2" fill="url(#twoway-brass-${comp.id})" stroke="#78350f" stroke-width="0.8"/>

            <!-- 3. Stamped Terminal Identification Badges on Base (Surgically Placed & Zero Overlap) -->
            <!-- COM Badge (Protected pocket above COM busbar at x=36, y=28) -->
            <rect x="27" y="23.5" width="18" height="9" rx="2" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(245, 158, 11, 0.6)" stroke-width="0.8"/>
            <text x="36" y="30.2" font-size="6.2" font-weight="900" fill="#fbbf24" font-family="'JetBrains Mono', monospace" text-anchor="middle">COM</text>

            <!-- L1 Badge (Above L1 busbar at x=118, y=15.5, safe from pin and jaw) -->
            <rect x="109" y="11" width="18" height="9" rx="2" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(56, 189, 248, 0.6)" stroke-width="0.8"/>
            <text x="118" y="17.7" font-size="6.2" font-weight="900" fill="#38bdf8" font-family="'JetBrains Mono', monospace" text-anchor="middle">L1</text>

            <!-- L2 Badge (Below L2 busbar at x=118, y=94, aligned on baseline with route nameplate) -->
            <rect x="109" y="89.5" width="18" height="9" rx="2" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(56, 189, 248, 0.6)" stroke-width="0.8"/>
            <text x="118" y="96.2" font-size="6.2" font-weight="900" fill="#38bdf8" font-family="'JetBrains Mono', monospace" text-anchor="middle">L2</text>

            <!-- 4. Knurled Brass Binding Posts (Strictly centered at terminal pin coordinates) -->
            <!-- COM Post at (comTerm.x, comTerm.y) -->
            <polygon points="${comTerm.x - 5.5},${comTerm.y} ${comTerm.x - 2.75},${comTerm.y - 4.8} ${comTerm.x + 2.75},${comTerm.y - 4.8} ${comTerm.x + 5.5},${comTerm.y} ${comTerm.x + 2.75},${comTerm.y + 4.8} ${comTerm.x - 2.75},${comTerm.y + 4.8}" fill="#a16207" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="${comTerm.x}" cy="${comTerm.y}" r="5.2" fill="url(#twoway-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
            <circle cx="${comTerm.x}" cy="${comTerm.y}" r="2" fill="#713f12"/>

            <!-- L1 Post at (l1Term.x, l1Term.y) -->
            <polygon points="${l1Term.x - 5.5},${l1Term.y} ${l1Term.x - 2.75},${l1Term.y - 4.8} ${l1Term.x + 2.75},${l1Term.y - 4.8} ${l1Term.x + 5.5},${l1Term.y} ${l1Term.x + 2.75},${l1Term.y + 4.8} ${l1Term.x - 2.75},${l1Term.y + 4.8}" fill="#a16207" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="${l1Term.x}" cy="${l1Term.y}" r="5.2" fill="url(#twoway-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
            <circle cx="${l1Term.x}" cy="${l1Term.y}" r="2" fill="#713f12"/>

            <!-- L2 Post at (l2Term.x, l2Term.y) -->
            <polygon points="${l2Term.x - 5.5},${l2Term.y} ${l2Term.x - 2.75},${l2Term.y - 4.8} ${l2Term.x + 2.75},${l2Term.y - 4.8} ${l2Term.x + 5.5},${l2Term.y} ${l2Term.x + 2.75},${l2Term.y + 4.8} ${l2Term.x - 2.75},${l2Term.y + 4.8}" fill="#a16207" stroke="#713f12" stroke-width="0.7"/>
            <circle cx="${l2Term.x}" cy="${l2Term.y}" r="5.2" fill="url(#twoway-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
            <circle cx="${l2Term.x}" cy="${l2Term.y}" r="2" fill="#713f12"/>

            <!-- 5. Left Center Pivot Hinge Stanchion at (48, 55) -->
            <rect x="44" y="47" width="8" height="16" rx="2" fill="url(#twoway-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
            <circle cx="48" cy="55" r="2.8" fill="#fef08a" stroke="#713f12" stroke-width="0.8"/>

            <!-- 6. Upper & Lower Dual Spring Contact Jaws (at x=106) -->
            <!-- Upper Jaw (L1 at 106, 28) -->
            <path d="M 103 19 C 103 24, 109 24, 109 19" fill="none" stroke="url(#twoway-brass-${comp.id})" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M 103 37 C 103 32, 109 32, 109 37" fill="none" stroke="url(#twoway-brass-${comp.id})" stroke-width="2.6" stroke-linecap="round"/>
            <rect x="104" y="21" width="5" height="14" rx="1" fill="#713f12" opacity="0.35"/>

            <!-- Lower Jaw (L2 at 106, 82) -->
            <path d="M 103 73 C 103 78, 109 78, 109 73" fill="none" stroke="url(#twoway-brass-${comp.id})" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M 103 91 C 103 86, 109 86, 109 91" fill="none" stroke="url(#twoway-brass-${comp.id})" stroke-width="2.6" stroke-linecap="round"/>
            <rect x="104" y="75" width="5" height="14" rx="1" fill="#713f12" opacity="0.35"/>

            <!-- 7. Moving Heavy Brass Blade with Insulated Crimson Grip (Pivots at 48, 55, stops cleanly with 15px clearance before posts) -->
            <g transform="translate(48, 55) rotate(${bladeRot})" style="transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);">
              <!-- Cast shadow of blade -->
              <rect x="0" y="-1.5" width="58" height="5" rx="1.5" fill="#000000" opacity="0.4" filter="blur(2px)"/>
              
              <!-- Solid Brass Knife Blade (Enters jaws at 106) -->
              <rect x="0" y="-3" width="58" height="6" rx="1.2" fill="url(#twoway-brass-${comp.id})" stroke="#713f12" stroke-width="0.8"/>
              <!-- Blade Specular Sheen -->
              <line x1="2" y1="-1.2" x2="56" y2="-1.2" stroke="#ffffff" stroke-width="0.9" opacity="0.75" stroke-linecap="round"/>

              <!-- Ferrule Collar -->
              <rect x="56" y="-4.5" width="4" height="9" rx="1" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>

              <!-- Insulated Crimson Handle Grip (Stops cleanly at distance 75, giving 15px margin to posts) -->
              <path d="M 60 -3.8 C 66 -5.5, 72 -5, 75 -3 C 77 0, 77 0, 75 3 C 72 5, 66 5.5, 60 3.8 Z" fill="url(#twoway-handle-${comp.id})" stroke="#3b0764" stroke-width="0.8"/>
              <line x1="62" y1="-1.2" x2="73" y2="-1.2" stroke="#ffffff" stroke-width="0.9" opacity="0.55" stroke-linecap="round"/>
            </g>

            <!-- 8. Active Route Glow Sparkle -->
            <circle cx="106" cy="${pos === 1 ? l1Term.y : l2Term.y}" r="6.5" fill="#38bdf8" opacity="0.4" filter="blur(2px)"/>
            <line x1="102" y1="${(pos === 1 ? l1Term.y : l2Term.y) - 4}" x2="110" y2="${(pos === 1 ? l1Term.y : l2Term.y) + 4}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="110" y1="${(pos === 1 ? l1Term.y : l2Term.y) - 4}" x2="102" y2="${(pos === 1 ? l1Term.y : l2Term.y) + 4}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>

            <!-- 9. Stamped Route Indicator Nameplate (Centered neatly at x=70, y=94, leveled on baseline with L2 badge, >70px clear of delete button) -->
            <rect x="36" y="89.5" width="68" height="9" rx="2" fill="rgba(15, 23, 42, 0.94)" stroke="#0284c7" stroke-width="0.8"/>
            <text x="70" y="96.2" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="900" text-anchor="middle">
              ${pos === 1 ? 'ROUTE 1 (COM ➔ L1)' : 'ROUTE 2 (COM ➔ L2)'}
            </text>
          </g>
        `;
        break;
      }

      // 9B. REAL SECTIONAL SIDE-VIEW PUSHBUTTON SWITCH (SPRING-LOADED MOMENTARY NO)
      case 'pushbutton': {
        const isPressed = state.pressed && !isBurnt;
        const pin1Term = comp.terminals?.find(t => t.id === 'pin1') || { x: 48, y: 126 };
        const pin2Term = comp.terminals?.find(t => t.id === 'pin2') || { x: 102, y: 126 };
        const p1x = pin1Term.x;
        const p1y = pin1Term.y;
        const p2x = pin2Term.x;
        const p2y = pin2Term.y;
        const travelY = isPressed ? 12 : 0;

        // Helical Spring Geometry (Extended: 24px span, Compressed: 12px span)
        const springTopY = 28 + travelY;
        const springBottomY = 52;
        const springH = springBottomY - springTopY;
        const numTurns = 5;
        const turnH = springH / numTurns;

        let springBackCoils = '';
        let springFrontCoils = '';
        for (let i = 0; i < numTurns; i++) {
          const yStart = springTopY + i * turnH;
          const yEnd = springTopY + (i + 1) * turnH;
          const yMid = (yStart + yEnd) / 2;
          // Back half of helical turn (behind plunger stem)
          springBackCoils += `<path d="M 63 ${yStart + turnH * 0.35} Q 75 ${yStart - turnH * 0.25} 87 ${yMid}" fill="none" stroke="url(#pb-spring-back-${comp.id})" stroke-width="3.2" stroke-linecap="round"/>`;
          // Front half of helical turn (in front of plunger stem)
          springFrontCoils += `
            <path d="M 87 ${yMid} Q 75 ${yEnd + turnH * 0.25} 63 ${yEnd + turnH * 0.35}" fill="none" stroke="url(#pb-spring-front-${comp.id})" stroke-width="3.4" stroke-linecap="round"/>
            <path d="M 85 ${yMid + 0.3} Q 75 ${yEnd + turnH * 0.2} 65 ${yEnd + turnH * 0.3}" fill="none" stroke="#fef08a" stroke-width="0.8" opacity="0.8" stroke-linecap="round"/>
          `;
        }

        content = `
          <g class="comp-pushbutton comp-real-pushbutton ${isPressed ? 'pb-pressed' : 'pb-released'}" style="cursor: pointer;">
            <defs>
              <!-- 3D Safety Red Domed Cap Gradient -->
              <radialGradient id="pb-dome-${comp.id}" cx="42%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#fca5a5"/>
                <stop offset="25%" stop-color="#ef4444"/>
                <stop offset="65%" stop-color="#dc2626"/>
                <stop offset="90%" stop-color="#991b1b"/>
                <stop offset="100%" stop-color="#450a0a"/>
              </radialGradient>

              <!-- Brushed Chrome / Aluminum Collar Gradient -->
              <linearGradient id="pb-collar-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="22%" stop-color="#e2e8f0"/>
                <stop offset="50%" stop-color="#cbd5e1"/>
                <stop offset="78%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>

              <!-- Polished Brass Plunger Shaft Gradient -->
              <linearGradient id="pb-stem-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ca8a04"/>
                <stop offset="35%" stop-color="#fef08a"/>
                <stop offset="65%" stop-color="#eab308"/>
                <stop offset="100%" stop-color="#854d0e"/>
              </linearGradient>

              <!-- Spring Coils: Front (Bright metallic bronze) -->
              <linearGradient id="pb-spring-front-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fed7aa"/>
                <stop offset="30%" stop-color="#d97706"/>
                <stop offset="70%" stop-color="#b45309"/>
                <stop offset="100%" stop-color="#451a03"/>
              </linearGradient>

              <!-- Spring Coils: Back (Shadow bronze) -->
              <linearGradient id="pb-spring-back-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#92400e"/>
                <stop offset="50%" stop-color="#78350f"/>
                <stop offset="100%" stop-color="#2d1305"/>
              </linearGradient>

              <!-- Golden Contact Pads (3D Brass Disc) -->
              <linearGradient id="pb-contact-gold-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fffbeb"/>
                <stop offset="25%" stop-color="#fde047"/>
                <stop offset="65%" stop-color="#eab308"/>
                <stop offset="90%" stop-color="#ca8a04"/>
                <stop offset="100%" stop-color="#78350f"/>
              </linearGradient>

              <!-- Sectional Blue Housing Body -->
              <linearGradient id="pb-housing-blue-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="25%" stop-color="#2563eb"/>
                <stop offset="70%" stop-color="#1d4ed8"/>
                <stop offset="100%" stop-color="#172554"/>
              </linearGradient>

              <!-- Cutaway Internal Cavity Gradient -->
              <linearGradient id="pb-chamber-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#091329"/>
                <stop offset="50%" stop-color="#0f1d38"/>
                <stop offset="100%" stop-color="#162c52"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadows -->
            <rect x="30" y="50" width="90" height="64" rx="6" fill="#000000" opacity="0.38" filter="blur(4px)"/>

            <!-- 2. Sectional Blue Housing (Enclosure) -->
            <!-- Outer Blue Molded Casing -->
            <rect x="33" y="52" width="84" height="60" rx="4" fill="url(#pb-housing-blue-${comp.id})" stroke="#1e3a8a" stroke-width="1.6"/>
            <!-- Beveled Wall Lip (Sectional Cut Surface) -->
            <rect x="35.5" y="54.5" width="79" height="55" rx="3" fill="#1e40af" stroke="#60a5fa" stroke-width="0.8" opacity="0.6"/>

            <!-- 3. Cutaway Internal Chamber Cavity -->
            <rect x="38" y="57" width="74" height="50" rx="2.5" fill="url(#pb-chamber-${comp.id})" stroke="#0f172a" stroke-width="1.2"/>
            <rect x="39" y="58" width="72" height="5" fill="#000000" opacity="0.45" filter="blur(1px)"/>

            <!-- 4. Top Bushing Collar (Plunger Entry Guide) -->
            <rect x="64" y="48" width="22" height="5" rx="1.5" fill="url(#pb-collar-${comp.id})" stroke="#334155" stroke-width="0.8"/>
            <rect x="68" y="51" width="14" height="3" fill="#0f172a"/>

            <!-- 5. Fixed Stationary Contacts & Leads (Inside Housing) -->
            <!-- Insulating Pedestal Mounts -->
            <rect x="44" y="96" width="8" height="17" rx="1" fill="#1e293b" stroke="#334155" stroke-width="0.6"/>
            <rect x="98" y="96" width="8" height="17" rx="1" fill="#1e293b" stroke="#334155" stroke-width="0.6"/>

            <!-- Fixed Golden Stationary Contact Discs -->
            <!-- Left Stationary Contact Pad -->
            <rect x="41" y="90" width="14" height="7.5" rx="3" fill="url(#pb-contact-gold-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <line x1="43" y1="92" x2="53" y2="92" stroke="#ffffff" stroke-width="0.8" opacity="0.85" stroke-linecap="round"/>
            <!-- Right Stationary Contact Pad -->
            <rect x="95" y="90" width="14" height="7.5" rx="3" fill="url(#pb-contact-gold-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <line x1="97" y1="92" x2="107" y2="92" stroke="#ffffff" stroke-width="0.8" opacity="0.85" stroke-linecap="round"/>

            <!-- Terminal Lead Wires (Cleanly routing from stationary contacts straight to terminal pins) -->
            <line x1="${p1x}" y1="97" x2="${p1x}" y2="${p1y}" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
            <line x1="${p1x}" y1="97" x2="${p1x}" y2="${p1y}" stroke="#475569" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="${p1x - 0.5}" y1="97" x2="${p1x - 0.5}" y2="${p1y}" stroke="#cbd5e1" stroke-width="0.7" opacity="0.8"/>

            <line x1="${p2x}" y1="97" x2="${p2x}" y2="${p2y}" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
            <line x1="${p2x}" y1="97" x2="${p2x}" y2="${p2y}" stroke="#475569" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="${p2x - 0.5}" y1="97" x2="${p2x - 0.5}" y2="${p2y}" stroke="#cbd5e1" stroke-width="0.7" opacity="0.8"/>

            <!-- Terminal Solder Eyelet Pads (Integrated with the connection leads - NO DUPLICATION) -->
            <circle cx="${p1x}" cy="${p1y}" r="5.5" fill="#1e293b" stroke="#64748b" stroke-width="1.2"/>
            <circle cx="${p1x}" cy="${p1y}" r="2.8" fill="#0f172a"/>
            <circle cx="${p2x}" cy="${p2y}" r="5.5" fill="#1e293b" stroke="#64748b" stroke-width="1.2"/>
            <circle cx="${p2x}" cy="${p2y}" r="2.8" fill="#0f172a"/>

            <!-- 6. Downward Motion Indicator Arrow (Centered in Chamber, between leads) -->
            ${!isPressed ? `
              <g class="pb-motion-arrow">
                <line x1="75" y1="72" x2="75" y2="92" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/>
                <polygon points="71,90 79,90 75,96" fill="#dc2626"/>
                <circle cx="75" cy="72" r="1.4" fill="#fca5a5"/>
              </g>
            ` : `
              <!-- Active Continuity Glow & Sparks across Contact Pads -->
              <g class="pb-contact-spark">
                <ellipse cx="48" cy="90" rx="9" ry="3.5" fill="#fbbf24" opacity="0.55" />
                <circle cx="48" cy="90" r="2.2" fill="#ffffff"/>
                <ellipse cx="102" cy="90" rx="9" ry="3.5" fill="#fbbf24" opacity="0.55" />
                <circle cx="102" cy="90" r="2.2" fill="#ffffff"/>
                <line x1="48" y1="90" x2="102" y2="90" stroke="#fde68a" stroke-width="1.6" stroke-dasharray="3 2" opacity="0.85"/>
              </g>
            `}

            <!-- 7. Plunger Shaft (Upper Spring Portion & Lower Bridge) -->
            <!-- Spring Back Coils (Behind Plunger Shaft) -->
            ${springBackCoils}

            <!-- Solid Golden Plunger Shaft -->
            <rect x="70.5" y="${28 + travelY}" width="9" height="44" rx="1.5" fill="url(#pb-stem-${comp.id})" stroke="#78350f" stroke-width="0.7"/>
            <line x1="73.5" y1="${28 + travelY}" x2="73.5" y2="${70 + travelY}" stroke="#ffffff" stroke-width="0.9" opacity="0.75" stroke-linecap="round"/>

            <!-- Spring Front Coils (Wrapping around Plunger Shaft) -->
            ${springFrontCoils}

            <!-- 8. Movable Conductive Contact Bridge (Crossbar + Discs) -->
            <!-- Horizontal Brass Bridging Bar -->
            <rect x="44" y="${70 + travelY}" width="62" height="4.5" rx="1.5" fill="url(#pb-stem-${comp.id})" stroke="#78350f" stroke-width="0.7"/>
            <line x1="46" y1="${71.5 + travelY}" x2="104" y2="${71.5 + travelY}" stroke="#ffffff" stroke-width="0.8" opacity="0.75" stroke-linecap="round"/>

            <!-- Movable Golden Contact Discs -->
            <!-- Left Movable Pad -->
            <rect x="41" y="${72 + travelY}" width="14" height="7.5" rx="3" fill="url(#pb-contact-gold-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <line x1="43" y1="${74 + travelY}" x2="53" y2="${74 + travelY}" stroke="#ffffff" stroke-width="0.8" opacity="0.85" stroke-linecap="round"/>
            <!-- Right Movable Pad -->
            <rect x="95" y="${72 + travelY}" width="14" height="7.5" rx="3" fill="url(#pb-contact-gold-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <line x1="97" y1="${74 + travelY}" x2="107" y2="${74 + travelY}" stroke="#ffffff" stroke-width="0.8" opacity="0.85" stroke-linecap="round"/>

            <!-- 9. Actuator Head (Brushed Collar + 3D Red Button Cap) -->
            <!-- Grey / Brushed Chrome Collar -->
            <rect x="47" y="${20 + travelY}" width="56" height="9" rx="3" fill="url(#pb-collar-${comp.id})" stroke="#334155" stroke-width="1"/>
            <rect x="49" y="${21.5 + travelY}" width="52" height="1.8" fill="#ffffff" opacity="0.75" rx="0.5"/>
            <rect x="49" y="${27 + travelY}" width="52" height="1.5" fill="#1e293b" opacity="0.35" rx="0.5"/>

            <!-- 3D Domed Red Pushbutton Cap -->
            <path d="M 52 ${21 + travelY} C 52 ${8 + travelY}, 98 ${8 + travelY}, 98 ${21 + travelY} Z" fill="url(#pb-dome-${comp.id})" stroke="#7f1d1d" stroke-width="1.2"/>
            <!-- Top Specular Highlight Arc -->
            <path d="M 59 ${14 + travelY} Q 75 ${10 + travelY} 91 ${14 + travelY}" fill="none" stroke="#ffffff" stroke-width="1.3" opacity="0.65" stroke-linecap="round"/>

            <!-- 10. Neat Centered Status Pill (Cleanly nestled between leads without collision) -->
            <rect x="58" y="99" width="34" height="7.5" rx="2" fill="${isPressed ? 'rgba(69, 26, 3, 0.95)' : 'rgba(15, 23, 42, 0.9)'}" stroke="${isPressed ? '#f59e0b' : '#3b82f6'}" stroke-width="0.7"/>
            <text x="75" y="104.5" fill="${isPressed ? '#fde68a' : '#93c5fd'}" font-family="'JetBrains Mono', monospace" font-size="5.2" font-weight="900" text-anchor="middle">
              ${isPressed ? '● CLOSED' : '○ OPEN'}
            </text>

            <!-- 11. Burnt / Blown Visuals if Damaged -->
            ${isBurnt ? `
              <rect x="38" y="57" width="74" height="50" rx="2.5" fill="#18181b" opacity="0.85"/>
              <text x="75" y="86" fill="#ef4444" font-family="'Outfit', sans-serif" font-size="7" font-weight="900" text-anchor="middle">💥 CONTACTS FUSED!</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 10. FIXED RESISTOR
      case 'resistor': {
        const vDrop = state.voltageDrop ? state.voltageDrop.toFixed(1) : '0.0';
        const resVal = getClosestStandardResistor(state.resistance || 220);
        const colorInfo = getResistorColorDetails(resVal);
        const bands = colorInfo.bands;
        content = `
          <g class="comp-resistor ${isBurnt ? 'resistor-burnt' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <title>Fixed Resistor (${colorInfo.formatted} • ${colorInfo.codeString})</title>

            <!-- Left Metal Lead Wire (Leg 1, fully visible from x=20 to x=66) -->
            <line x1="20" y1="38" x2="66" y2="38" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="20" y1="37" x2="66" y2="37" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Right Metal Lead Wire (Leg 2, fully visible from x=134 to x=180) -->
            <line x1="134" y1="38" x2="180" y2="38" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="134" y1="37" x2="180" y2="37" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Resistor Ceramic Axial Body (Classic contoured cylinder) -->
            <rect x="66" y="23" width="68" height="30" rx="10" 
                  fill="${isBurnt ? '#1c1917' : '#d4b996'}" 
                  stroke="${isBurnt ? '#ef4444' : '#a89078'}" stroke-width="2"/>

            <!-- Top Cylindrical Sheen Highlight -->
            <path d="M 72 26 L 128 26" stroke="#ffffff" stroke-width="2.2" opacity="${isBurnt ? '0.05' : '0.45'}" stroke-linecap="round"/>

            <!-- Standard EIA 4-Band Color Code Stripes -->
            <!-- 1st Digit -->
            <rect x="76" y="23" width="4.5" height="30" fill="${isBurnt ? '#292524' : bands[0]}">
              <title>Band 1 (1st Digit): ${colorInfo.details[0].name} (${colorInfo.details[0].value})</title>
            </rect>
            <!-- 2nd Digit -->
            <rect x="86" y="23" width="4.5" height="30" fill="${isBurnt ? '#292524' : bands[1]}">
              <title>Band 2 (2nd Digit): ${colorInfo.details[1].name} (${colorInfo.details[1].value})</title>
            </rect>
            <!-- Multiplier -->
            <rect x="96" y="23" width="4.5" height="30" fill="${isBurnt ? '#292524' : bands[2]}">
              <title>Band 3 (Multiplier): ${colorInfo.details[2].name} (${colorInfo.details[2].value})</title>
            </rect>
            <!-- Tolerance (Gold 5%) -->
            <rect x="116" y="23" width="5.5" height="30" fill="${isBurnt ? '#292524' : bands[3]}">
              <title>Band 4 (Tolerance): Gold (±5%)</title>
            </rect>

            <!-- Standard Resistance Label above body -->
            <text x="100" y="17" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="900" text-anchor="middle">
              ${formatResistance(resVal)}
            </text>
          </g>
        `;
        break;
      }

      // 11. VARIABLE RESISTOR (POTENTIOMETER - Authentic Metal & Phenolic B22K Rotary Potentiometer)
      case 'potentiometer': {
        const vDrop = state.voltageDrop ? state.voltageDrop.toFixed(1) : '0.0';
        const resVal = state.resistance || 500;
        const totalR = state.totalResistance || 1000;
        const ratio = state.wiperRatio !== undefined ? state.wiperRatio : (resVal / totalR);
        const r1 = Math.max(0, Math.round((1 - ratio) * totalR));
        const r2 = Math.max(0, Math.round(ratio * totalR));
        const isPowered = state.powered && (state.voltageDrop > 0.05 || state.wiperVoltage > 0.05);
        const wiperV = state.wiperVoltage !== undefined ? state.wiperVoltage : (state.voltageDrop ? state.voltageDrop * ratio : 0);

        // Shaft rotation angle: -135° to +135° (270° standard rotary angle)
        const shaftAngle = -135 + Math.min(1.0, Math.max(0.0, ratio)) * 270;

        // Visual states
        const phenolicFill = isBurnt ? '#1c1917' : '#9a3412';
        const phenolicStroke = isBurnt ? '#ef4444' : '#431407';
        const metalPlateFill = isBurnt ? '#334155' : 'url(#real-pot-metal)';
        const shaftFill = isBurnt ? '#1e293b' : 'url(#real-pot-shaft)';
        const clawFill = isBurnt ? '#713f12' : 'url(#real-pot-brass)';

        content = `
          <g class="comp-potentiometer comp-character ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <linearGradient id="real-pot-phenolic" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#b45309"/>
                <stop offset="15%" stop-color="#9a3412"/>
                <stop offset="70%" stop-color="#7c2d12"/>
                <stop offset="100%" stop-color="#451a03"/>
              </linearGradient>
              <linearGradient id="real-pot-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f8fafc"/>
                <stop offset="25%" stop-color="#e2e8f0"/>
                <stop offset="50%" stop-color="#cbd5e1"/>
                <stop offset="75%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#cbd5e1"/>
              </linearGradient>
              <linearGradient id="real-pot-brass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fef08a"/>
                <stop offset="35%" stop-color="#eab308"/>
                <stop offset="75%" stop-color="#ca8a04"/>
                <stop offset="100%" stop-color="#854d0e"/>
              </linearGradient>
              <linearGradient id="real-pot-shaft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="30%" stop-color="#e2e8f0"/>
                <stop offset="70%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#94a3b8"/>
              </linearGradient>
              <linearGradient id="real-pot-bushing" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#e2e8f0"/>
                <stop offset="50%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>
            </defs>

            <!-- Background Ambient Glow when powered -->
            ${!isBurnt && state.powered ? `
              <circle cx="95" cy="74" r="56" fill="#f59e0b" opacity="0.12" filter="blur(6px)"/>
            ` : ''}

            <!-- 1. Reddish-Brown Phenolic Resin Baseboard with Top Arch & Bottom Apron -->
            <path d="M 48 74 A 47 47 0 0 1 142 74 L 157 98 L 157 144 L 33 144 L 33 98 Z" 
                  fill="${isBurnt ? '#1c1917' : 'url(#real-pot-phenolic)'}" 
                  stroke="${phenolicStroke}" 
                  stroke-width="2" 
                  stroke-linejoin="round"/>
            <!-- Side grip notches -->
            <rect x="30" y="88" width="4" height="10" fill="#0f172a" opacity="0.4"/>
            <rect x="156" y="88" width="4" height="10" fill="#0f172a" opacity="0.4"/>

            <!-- 2. Authentic White Silkscreen Marking on Top Arch: B22K -->
            <text x="95" y="44" fill="#f8fafc" font-family="'JetBrains Mono', 'Segoe UI', system-ui, sans-serif" 
                  font-size="12.5" font-weight="900" letter-spacing="1.2px" text-anchor="middle">
              B22K
            </text>

            <!-- 3. Stamped Zinc Galvanized Metal Faceplate (Octagonal Stamped Plate) -->
            <path d="M 58 46 L 132 46 L 146 58 L 146 90 L 134 102 L 56 102 L 44 90 L 44 58 Z" 
                  fill="${metalPlateFill}" 
                  stroke="#334155" 
                  stroke-width="1.6" 
                  stroke-linejoin="round"/>
            <!-- Stamped inner concentric bezel emboss -->
            <circle cx="95" cy="74" r="33" fill="none" stroke="#94a3b8" stroke-width="1.2" opacity="0.6"/>
            <circle cx="95" cy="74" r="29" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.7"/>
            <!-- Radial witness stamp ridges -->
            <line x1="95" y1="46" x2="95" y2="52" stroke="#64748b" stroke-width="0.9"/>
            <line x1="95" y1="96" x2="95" y2="102" stroke="#64748b" stroke-width="0.9"/>
            <line x1="44" y1="74" x2="50" y2="74" stroke="#64748b" stroke-width="0.9"/>
            <line x1="140" y1="74" x2="146" y2="74" stroke="#64748b" stroke-width="0.9"/>

            <!-- 4. Four Golden/Brass Crimp Claws (Bent over from behind) -->
            <!-- Top-Left Claw -->
            <polygon points="50,47 57,44 61,52 54,55" fill="${clawFill}" stroke="#854d0e" stroke-width="0.9"/>
            <line x1="53" y1="48" x2="57" y2="52" stroke="#713f12" stroke-width="1.2"/>
            <!-- Top-Right Claw -->
            <polygon points="140,47 133,44 129,52 136,55" fill="${clawFill}" stroke="#854d0e" stroke-width="0.9"/>
            <line x1="137" y1="48" x2="133" y2="52" stroke="#713f12" stroke-width="1.2"/>
            <!-- Bottom-Left Claw -->
            <polygon points="44,87 52,87 54,97 46,97" fill="${clawFill}" stroke="#854d0e" stroke-width="0.9"/>
            <line x1="48" y1="90" x2="51" y2="94" stroke="#713f12" stroke-width="1.2"/>
            <!-- Bottom-Right Claw -->
            <polygon points="146,87 138,87 136,97 144,97" fill="${clawFill}" stroke="#854d0e" stroke-width="0.9"/>
            <line x1="142" y1="90" x2="139" y2="94" stroke="#713f12" stroke-width="1.2"/>

            <!-- 5. Threaded Bushing Collar with Top & Bottom Flats -->
            <rect x="73" y="53" width="44" height="42" rx="10" 
                  fill="${isBurnt ? '#1e293b' : 'url(#real-pot-bushing)'}" stroke="#475569" stroke-width="1.4"/>
            <!-- Bushing inner dark circular well -->
            <circle cx="95" cy="74" r="18.5" fill="#475569" stroke="#1e293b" stroke-width="1.2"/>

            <!-- 6. Rotating Metal D-Shaft (Cylindrical with D-Flat cut) -->
            <g class="pot-shaft-knob" transform="translate(95, 74) rotate(${shaftAngle})" style="cursor: grab; transition: transform 0.08s ease-out;">
              <!-- D-Shaft profile: Circle with flat chord cut at y = -7.5 -->
              <path d="M -13 -7.5 L 13 -7.5 A 15 15 0 1 1 -13 -7.5 Z" 
                    fill="${shaftFill}" 
                    stroke="#334155" 
                    stroke-width="1.5"/>
              <!-- D-Flat Machined Bevel Highlight -->
              <line x1="-12" y1="-7.5" x2="12" y2="-7.5" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
              <!-- Subtle Lathe Tooling Ring -->
              <circle cx="0" cy="0" r="11" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.35"/>
              <!-- Central Center-Drill Conical Dimple -->
              <circle cx="0" cy="0" r="4.2" fill="#64748b" stroke="#334155" stroke-width="1"/>
              <circle cx="0" cy="0" r="2.2" fill="#1e293b"/>
              <circle cx="-0.8" cy="-0.8" r="0.9" fill="#e2e8f0"/>
            </g>

            <!-- Live Resistance & Output Telemetry Overlay Badge -->
            <rect x="52" y="103" width="86" height="11.5" rx="2.5" fill="#0f172a" opacity="0.92" stroke="#334155" stroke-width="0.6"/>
            <text x="95" y="111.5" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="800" text-anchor="middle">
              ${isPowered ? `Vout: ${wiperV.toFixed(2)}V (${Math.round(ratio * 100)}%)` : `R1:${r1}Ω · R2:${r2}Ω`}
            </text>

            <!-- 7. Bottom Phenolic Terminal Board with 3 Hollow Eyelet Rivets & Solder Pins -->
            <!-- 3 Hollow Star-Crimped Eyelets at y = 125 -->
            ${[45, 95, 145].map(ex => `
              <!-- Stamped terminal mounting strap under eyelet -->
              <rect x="${ex - 4.5}" y="125" width="9" height="18" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>

              <!-- Outer rolled star-crimp flange -->
              <circle cx="${ex}" cy="125" r="9" fill="#cbd5e1" stroke="#475569" stroke-width="1.2"/>
              <!-- Star crimp petal indentations -->
              <line x1="${ex - 8}" y1="125" x2="${ex - 5}" y2="125" stroke="#334155" stroke-width="1"/>
              <line x1="${ex + 5}" y1="125" x2="${ex + 8}" y2="125" stroke="#334155" stroke-width="1"/>
              <line x1="${ex - 4}" y1="118.5" x2="${ex - 2.5}" y2="121" stroke="#334155" stroke-width="1"/>
              <line x1="${ex + 2.5}" y1="129" x2="${ex + 4}" y2="131.5" stroke="#334155" stroke-width="1"/>
              <line x1="${ex + 4}" y1="118.5" x2="${ex + 2.5}" y2="121" stroke="#334155" stroke-width="1"/>
              <line x1="${ex - 2.5}" y1="129" x2="${ex - 4}" y2="131.5" stroke="#334155" stroke-width="1"/>
              <!-- Inner rolled silver eyelet rim -->
              <circle cx="${ex}" cy="125" r="5.6" fill="#e2e8f0" stroke="#334155" stroke-width="1"/>
              <!-- Hollow center hole -->
              <circle cx="${ex}" cy="125" r="3.2" fill="#0f172a"/>
              <!-- Specular rim highlight -->
              <path d="M ${ex - 4} 122 A 5 5 0 0 1 ${ex + 2} 121" stroke="#ffffff" stroke-width="0.9" fill="none"/>
            `).join('')}

            <!-- 8. Three Stamped Solder Lug Terminal Pins extending to y = 174 -->
            ${[45, 95, 145].map(px => `
              <!-- Board edge cutout slot -->
              <rect x="${px - 6}" y="141" width="12" height="4" fill="#0f172a" opacity="0.35"/>
              <!-- Stamped metal lead pin with horizontal ears and tapered solder shank -->
              <polygon points="${px - 6.5},141 ${px + 6.5},141 ${px + 6.5},146 ${px + 3},147 ${px + 3},171 ${px},174 ${px - 3},171 ${px - 3},147 ${px - 6.5},146" 
                       fill="#cbd5e1" stroke="#334155" stroke-width="1.2"/>
              <!-- Central embossed stiffener bead highlight -->
              <line x1="${px}" y1="144" x2="${px}" y2="170" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round"/>
              <line x1="${px + 0.8}" y1="144" x2="${px + 0.8}" y2="170" stroke="#475569" stroke-width="0.7" stroke-linecap="round"/>
            `).join('')}

            <!-- 9. Crisp Terminal Identification Badges below terminals with safe and neat distance -->
            <!-- Terminal 1 Badge (below Pin 1 at x=45) -->
            <g class="pot-term-badge" transform="translate(45, 195)">
              <rect x="-21" y="0" width="42" height="25" rx="5" fill="#0f172a" stroke="#f59e0b" stroke-width="1.3" opacity="0.95"/>
              <text x="0" y="11" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="middle">1·Vin</text>
              <text x="0" y="20.5" fill="#94a3b8" font-family="'Segoe UI', system-ui, sans-serif" font-size="6.5" font-weight="700" text-anchor="middle" letter-spacing="0.4px">INPUT</text>
            </g>

            <!-- Terminal 2 Badge (below Wiper Pin at x=95) -->
            <g class="pot-term-badge" transform="translate(95, 195)">
              <rect x="-21" y="0" width="42" height="25" rx="5" fill="#0f172a" stroke="#f59e0b" stroke-width="1.3" opacity="0.95"/>
              <text x="0" y="11" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="middle">2·Vout</text>
              <text x="0" y="20.5" fill="#94a3b8" font-family="'Segoe UI', system-ui, sans-serif" font-size="6.5" font-weight="700" text-anchor="middle" letter-spacing="0.4px">WIPER</text>
            </g>

            <!-- Terminal 3 Badge (below Pin 2 at x=145) -->
            <g class="pot-term-badge" transform="translate(145, 195)">
              <rect x="-21" y="0" width="42" height="25" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="1.3" opacity="0.95"/>
              <text x="0" y="11" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="middle">3·GND</text>
              <text x="0" y="20.5" fill="#94a3b8" font-family="'Segoe UI', system-ui, sans-serif" font-size="6.5" font-weight="700" text-anchor="middle" letter-spacing="0.4px">GROUND</text>
            </g>

            <!-- Burnt Smoke / Sparks if damaged -->
            ${isBurnt ? `
              <circle cx="95" cy="74" r="25" fill="#ef4444" opacity="0.25" filter="blur(6px)"/>
              <text x="95" y="60" fill="#ef4444" font-size="18" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 12. ELECTRONIC BUZZER (Realistic Piezo Sounder with Mounting Ears & Wire Leads)
      case 'buzzer': {
        const isSounding = state.sounding && !isBurnt && !isBurning;
        const vDrop = state.voltageDrop || 0;
        const freq = state.frequency || Math.min(2200, Math.max(260, Math.round(320 + (vDrop / 9.0) * 780)));
        const soundVol = state.soundVolume !== undefined ? state.soundVolume : Math.min(1.0, Math.max(0, (vDrop - 0.50) / 8.50));
        const waveStroke1 = Math.max(0.6, soundVol * 2.5);
        const waveStroke2 = Math.max(0.5, soundVol * 2.0);
        const waveOpacity = Math.min(0.92, 0.20 + soundVol * 0.70);
        content = `
          <g class="comp-buzzer comp-character ${isSounding ? 'sounding' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <!-- Background Acoustic Glow when sounding -->
            ${isSounding ? `
              <circle cx="80" cy="60" r="${Math.round(30 + soundVol * 28)}" fill="#38bdf8" opacity="${(soundVol * 0.18).toFixed(2)}" filter="blur(6px)"/>
              <circle cx="80" cy="60" r="30" fill="none" stroke="#38bdf8" stroke-width="${waveStroke1.toFixed(1)}" opacity="${waveOpacity.toFixed(2)}" class="sound-wave wave-1"/>
              <circle cx="80" cy="60" r="44" fill="none" stroke="#38bdf8" stroke-width="${waveStroke2.toFixed(1)}" opacity="${(waveOpacity * 0.8).toFixed(2)}" class="sound-wave wave-2"/>
              <text x="80" y="8" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" text-anchor="middle">🔊 ${freq} Hz | ${Math.round(soundVol * 100)}% VOL</text>
            ` : ''}

            <!-- 1. Left Mounting Ear Flange & Screw Hole -->
            <path d="M 38 46 C 24 46 8 52 8 60 C 8 68 24 74 38 74 Z" 
                  fill="${isBurnt ? '#09090b' : '#121215'}" 
                  stroke="${isBurnt ? '#ef4444' : '#27272a'}" 
                  stroke-width="1.8"/>
            <!-- Left screw hole with interior opening -->
            <circle cx="18" cy="60" r="5" fill="#0f172a" stroke="#3f3f46" stroke-width="1.2"/>
            <circle cx="18" cy="60" r="3.8" fill="#f8fafc"/>

            <!-- 2. Right Mounting Ear Flange & Screw Hole -->
            <path d="M 122 46 C 136 46 152 52 152 60 C 152 68 136 74 122 74 Z" 
                  fill="${isBurnt ? '#09090b' : '#121215'}" 
                  stroke="${isBurnt ? '#ef4444' : '#27272a'}" 
                  stroke-width="1.8"/>
            <!-- Right screw hole with interior opening -->
            <circle cx="142" cy="60" r="5" fill="#0f172a" stroke="#3f3f46" stroke-width="1.2"/>
            <circle cx="142" cy="60" r="3.8" fill="#f8fafc"/>

            <!-- 3. Cylindrical Plastic Resonator Body -->
            <circle cx="80" cy="60" r="46" 
                    fill="${isBurnt ? '#09090b' : '#121215'}" 
                    stroke="${isBurnt ? '#ef4444' : '#27272a'}" 
                    stroke-width="2.2"/>
            
            <!-- Concentric Acoustic Resonator Grooves / Ridges -->
            <circle cx="80" cy="60" r="39" fill="none" stroke="#27272a" stroke-width="1.5"/>
            <circle cx="80" cy="60" r="32" fill="none" stroke="#27272a" stroke-width="1.5"/>
            <circle cx="80" cy="60" r="25" fill="none" stroke="#27272a" stroke-width="1.5"/>
            <circle cx="80" cy="60" r="18" fill="none" stroke="#27272a" stroke-width="1.5"/>
            <circle cx="80" cy="60" r="12" fill="none" stroke="#27272a" stroke-width="1.5"/>

            <!-- Subtle Specular Highlights on Grooves -->
            <path d="M 52 32 A 39 39 0 0 1 76 21" fill="none" stroke="#3f3f46" stroke-width="1" opacity="0.6"/>
            <path d="M 57 37 A 32 32 0 0 1 76 28" fill="none" stroke="#3f3f46" stroke-width="1" opacity="0.6"/>
            <path d="M 62 42 A 25 25 0 0 1 76 35" fill="none" stroke="#3f3f46" stroke-width="1" opacity="0.6"/>

            <!-- Outer Rim Highlights matching real photo -->
            <path d="M 44 40 A 46 46 0 0 1 72 15" fill="none" stroke="#52525b" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M 124 62 A 46 46 0 0 1 112 94" fill="none" stroke="#27272a" stroke-width="2.2" stroke-linecap="round"/>

            <!-- 4. Center Sound Chamber Port & Piezoelectric Diaphragm -->
            <circle cx="80" cy="60" r="8" fill="#cbd5e1" stroke="#1f2937" stroke-width="1.6"/>
            <circle cx="80" cy="60" r="5.5" fill="#e2e8f0"/>

            <!-- 5. Wire Exit Collar at bottom -->
            <rect x="52" y="103" width="56" height="6" rx="2.5" fill="#18181b" stroke="#27272a" stroke-width="1"/>

            <!-- 6. Left Wire: Black Lead (Negative / GND) extending to (62, 146) -->
            <!-- Black PVC Insulation -->
            <rect x="59" y="106" width="6" height="30" rx="1.5" fill="#09090b" stroke="#27272a" stroke-width="0.8"/>
            <line x1="61" y1="106" x2="61" y2="136" stroke="#27272a" stroke-width="1"/>
            <!-- Stripped Tinned Lead Tip -->
            <rect x="60" y="136" width="4" height="12" rx="1.8" fill="#b45309" stroke="#78350f" stroke-width="0.8"/>
            <line x1="62" y1="137" x2="62" y2="147" stroke="#cbd5e1" stroke-width="1.3" stroke-linecap="round"/>

            <!-- 7. Right Wire: Red Lead (Positive / +V) extending to (98, 146) -->
            <!-- Red PVC Insulation -->
            <rect x="95" y="106" width="6" height="30" rx="1.5" fill="#dc2626" stroke="#991b1b" stroke-width="0.8"/>
            <line x1="97" y1="106" x2="97" y2="136" stroke="#f87171" stroke-width="1"/>
            <!-- Stripped Tinned Lead Tip -->
            <rect x="96" y="136" width="4" height="12" rx="1.8" fill="#b45309" stroke="#78350f" stroke-width="0.8"/>
            <line x1="98" y1="137" x2="98" y2="147" stroke="#cbd5e1" stroke-width="1.3" stroke-linecap="round"/>

            <!-- Polarity Labels directly on buzzer body -->
            <text x="62" y="101" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" text-anchor="middle">-</text>
            <text x="98" y="101" fill="#ef4444" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" text-anchor="middle">+</text>

            <!-- Burnt / Cracked Piezo Disc -->
            ${isBurnt ? `
              <!-- Cracked fracture lines across center sound hole -->
              <path d="M 75 55 L 79 59 L 77 63 L 83 61 L 85 65" stroke="#ef4444" stroke-width="2" fill="none"/>
              <circle cx="80" cy="60" r="46" fill="#18181b" opacity="0.65"/>
              <text x="80" y="65" font-size="18" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 13. STEP-DOWN TRANSFORMER (Photorealistic 3D Isometric EI-Laminated Power Transformer)
      case 'transformer': {
        const isPowered = state.powered && !isBurnt && !isBurning;
        const priV = state.primaryV || 230;
        const secV = state.secondaryV || 12;
        const secI = state.secondaryCurrent || state.current || 0;
        const secW = state.secondaryPower || state.power || 0;
        const priI = state.primaryCurrent || (isPowered && priV > 0 ? (secW / priV) : 0);
        const priW = state.primaryWatts || secW;
        const isDrivingLoad = secI > 0;
        const secIStr = secI >= 1 ? `${secI.toFixed(2)}A` : `${(secI * 1000).toFixed(0)}mA`;
        const priIStr = `${(priI * 1000).toFixed(1)}mA`;
        const wattStr = secW >= 1 ? `${secW.toFixed(1)}W` : (isPowered ? '0.0W' : '--');

        content = `
          <g class="comp-transformer comp-character ${isPowered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <linearGradient id="trans-zinc-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f8fafc"/>
                <stop offset="30%" stop-color="#e2e8f0"/>
                <stop offset="70%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#94a3b8"/>
              </linearGradient>
              <linearGradient id="trans-zinc-side" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#94a3b8"/>
                <stop offset="40%" stop-color="#786e61"/>
                <stop offset="80%" stop-color="#64748b"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>
              <linearGradient id="trans-core-lam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="50%" stop-color="#334155"/>
                <stop offset="100%" stop-color="#1e293b"/>
              </linearGradient>
              <linearGradient id="trans-kraft-coil" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#d97706"/>
                <stop offset="35%" stop-color="#c2410c"/>
                <stop offset="75%" stop-color="#9a3412"/>
                <stop offset="100%" stop-color="#7c2d12"/>
              </linearGradient>
            </defs>

            <!-- Background Electromagnetic Induction Aura when powered -->
            ${isPowered ? `
              <ellipse cx="102" cy="74" rx="64" ry="46" fill="#38bdf8" opacity="0.12" filter="blur(8px)"/>
              <ellipse cx="102" cy="74" rx="48" ry="34" fill="#f59e0b" opacity="0.08" filter="blur(6px)"/>
            ` : ''}

            <!-- 1. Rear Mounting Flange (Back Foot on opposite side) -->
            <polygon points="144,88 158,82 166,93 152,99" 
                     fill="#786e61" stroke="#334155" stroke-width="1"/>
            <ellipse cx="157" cy="89" rx="3.5" ry="1.8" transform="rotate(-24, 157, 89)" fill="#090d16"/>

            <!-- 2. Left Vertical Face of Zinc Steel Frame -->
            <polygon points="56,38 78,20 78,102 56,120" 
                     fill="${isBurnt ? '#18181b' : 'url(#trans-zinc-side)'}" 
                     stroke="${isBurnt ? '#ef4444' : '#334155'}" 
                     stroke-width="1.5"/>

            <!-- 3. Bottom Left Mounting Flange (Front Foot) with Screw Slot -->
            <polygon points="56,120 34,130 44,144 66,134" 
                     fill="${isBurnt ? '#18181b' : '#a89f91'}" 
                     stroke="${isBurnt ? '#ef4444' : '#475569'}" 
                     stroke-width="1.2"/>
            <ellipse cx="48" cy="134" rx="4.5" ry="2.2" transform="rotate(-24, 48, 134)" fill="#090d16" stroke="#334155" stroke-width="0.8"/>

            <!-- 4. Laminated Silicon Steel Core (EI Core Stack inside Frame) -->
            <polygon points="56,38 134,63 134,107 56,120" 
                     fill="url(#trans-core-lam)" 
                     stroke="#1e293b" 
                     stroke-width="1.2"/>
            <!-- Stacked horizontal silicon steel lamination lines -->
            ${[46, 54, 62, 70, 78, 86, 94, 102, 110].map(y => `
              <line x1="56" y1="${y}" x2="134" y2="${y + 25}" stroke="#1e293b" stroke-width="1.2"/>
              <line x1="56" y1="${y + 0.6}" x2="134" y2="${y + 25.6}" stroke="#64748b" stroke-width="0.6" opacity="0.7"/>
            `).join('')}

            <!-- 5. Top Face of Zinc Steel Frame -->
            <polygon points="56,38 78,20 156,45 134,63" 
                     fill="${isBurnt ? '#27272a' : 'url(#trans-zinc-top)'}" 
                     stroke="${isBurnt ? '#ef4444' : '#475569'}" 
                     stroke-width="1.5"/>
            <!-- Top specular edge highlight -->
            <line x1="56" y1="38" x2="134" y2="63" stroke="#ffffff" stroke-width="1.6" opacity="0.8"/>
            <line x1="78" y1="20" x2="56" y2="38" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>

            <!-- Front Beveled Shroud Rim (Right vertical flange holding core) -->
            <polygon points="134,63 146,73 146,118 134,107" 
                     fill="#8c7d6b" stroke="#334155" stroke-width="1"/>
            <polygon points="56,120 134,107 132,114 54,127" 
                     fill="#64748b" stroke="#334155" stroke-width="1"/>

            <!-- 6. Central Core Window Aperture -->
            <polygon points="76,55 124,70 124,106 76,92" fill="#090d16"/>

            <!-- 7. White Plastic Bobbin with Crenellated Comb Teeth -->
            <!-- Upper Bobbin Flange -->
            <polygon points="74,54 126,70 124,79 72,63" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
            <!-- 6 Comb Crenellations (Wire Guide Slots) -->
            <polygon points="75,56 83,59 81,65 73,62" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.7"/>
            <polygon points="84,60 92,63 90,69 82,66" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.7"/>
            <polygon points="93,63 101,66 99,72 91,69" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.7"/>
            <polygon points="102,66 110,69 108,75 100,72" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.7"/>
            <polygon points="111,69 119,72 117,78 109,75" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.7"/>
            <polygon points="120,72 126,74 124,80 118,78" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.7"/>
            <!-- Copper magnet wire glints under comb slots -->
            <circle cx="88" cy="64" r="1.5" fill="#f59e0b"/>
            <circle cx="106" cy="70" r="1.5" fill="#f59e0b"/>

            <!-- 8. Kraft-Paper Wrapped Copper Coil Cylinder -->
            <path d="M 74,63 C 92,71 112,78 124,79 L 122,110 C 108,109 88,103 74,95 Z" 
                  fill="${isBurnt ? '#1c1917' : 'url(#trans-kraft-coil)'}" 
                  stroke="${isBurnt ? '#ef4444' : '#78350f'}" 
                  stroke-width="1.4"/>
            <!-- Curved cylindrical specular highlight -->
            <path d="M 88,68 C 98,73 108,77 114,78 L 112,108 C 104,107 94,103 88,98 Z" 
                  fill="#fbbf24" opacity="0.18"/>
            <!-- Kraft paper tape seam line -->
            <path d="M 98,72 L 96,104" stroke="#78350f" stroke-width="0.8" opacity="0.45"/>

            <!-- Lower Bobbin Flange -->
            <polygon points="76,100 124,111 122,118 74,107" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>

            <!-- 9. Primary Wire Leads (White / 230V~ AC Mains) on Left -->
            <!-- Upper White Wire (pri1, Line L) to (20, 50) -->
            <path d="M 82 28 C 50 18 32 35 20 50" stroke="#090d16" stroke-width="7" fill="none" opacity="0.3"/>
            <path d="M 82 28 C 50 18 32 35 20 50" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M 82 28 C 50 18 32 35 20 50" stroke="#cbd5e1" stroke-width="1.6" fill="none"/>
            <!-- Stripped copper tip -->
            <line x1="22" y1="48" x2="17" y2="52" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
            <line x1="21" y1="49" x2="18" y2="51" stroke="#fef08a" stroke-width="1.2"/>

            <!-- Lower White Wire (pri2, Neutral N) to (20, 115) -->
            <path d="M 74 62 C 48 68 32 92 20 115" stroke="#090d16" stroke-width="7" fill="none" opacity="0.3"/>
            <path d="M 74 62 C 48 68 32 92 20 115" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M 74 62 C 48 68 32 92 20 115" stroke="#cbd5e1" stroke-width="1.6" fill="none"/>
            <!-- Stripped copper tip -->
            <line x1="22" y1="113" x2="17" y2="117" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
            <line x1="21" y1="114" x2="18" y2="116" stroke="#fef08a" stroke-width="1.2"/>

            <!-- 10. Secondary Wire Leads (Black / 12V~ AC Safe Output) on Right -->
            <!-- Upper Black Wire (sec1, Line L) emerging from right comb slot to (185, 65) -->
            <path d="M 115 73 C 135 70 162 55 185 65" stroke="#09090b" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M 115 73 C 135 70 162 55 185 65" stroke="#27272a" stroke-width="1.6" fill="none"/>
            <!-- Stripped copper tip -->
            <line x1="182" y1="64" x2="187" y2="66" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
            <line x1="183" y1="64.5" x2="186" y2="65.5" stroke="#fef08a" stroke-width="1.2"/>

            <!-- Lower Black Wire (sec2, Neutral N) emerging from center comb slot, swooping in front of coil to (185, 130) -->
            <path d="M 96 68 C 114 86 148 112 185 130" stroke="#09090b" stroke-width="5.5" fill="none" stroke-linecap="round"/>
            <path d="M 96 68 C 114 86 148 112 185 130" stroke="#27272a" stroke-width="1.8" fill="none"/>
            <!-- Stripped copper tip -->
            <line x1="182" y1="129" x2="187" y2="131" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
            <line x1="183" y1="129.5" x2="186" y2="130.5" stroke="#fef08a" stroke-width="1.2"/>

            <!-- 11. Voltage Ratings & Telemetry Readouts -->
            <!-- Primary Side Labels (Left) -->
            <text x="20" y="38" fill="#f8fafc" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900">PRI: 230V~</text>
            <text x="20" y="132" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700">Mains AC</text>

            <!-- Secondary Side Labels (Right) -->
            <text x="185" y="52" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="end">SEC: 12V~</text>
            <text x="185" y="146" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" text-anchor="end">${secIStr}</text>

            <!-- Center Real-Time Power Telemetry Badge (Mounted on top steel frame) -->
            <rect x="80" y="24" width="46" height="15" rx="3" fill="#020617" opacity="0.88" 
                  stroke="${isDrivingLoad ? '#f59e0b' : '#475569'}" stroke-width="1"/>
            <text x="103" y="34.5" fill="${isDrivingLoad ? '#fbbf24' : '#94a3b8'}" 
                  font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="900" text-anchor="middle">
              ${wattStr}
            </text>

            <!-- Burnt Smoke / Sparks if damaged -->
            ${isBurnt ? `
              <polygon points="56,38 78,20 156,45 134,63" fill="#ef4444" opacity="0.25" filter="blur(6px)"/>
              <text x="103" y="65" font-size="20" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 14. AC VOLTAGE SUPPLY
      case 'ac_source': {
        const isHot = state.overheated || isBurning || isCrying;
        const acV = state.voltage || 230;
        const curA = state.current || 0;
        const pWatts = state.power || (curA * acV);
        const isSupplying = curA > 0;
        const curStr = curA >= 1 ? `${curA.toFixed(2)}A` : `${(curA * 1000).toFixed(0)}mA`;
        const wattStr = pWatts >= 1 ? `${pWatts.toFixed(1)}W` : `${(pWatts * 1000).toFixed(0)}mW`;
        content = `
          <g class="comp-ac-source comp-character ${isHot ? 'danger-pulse character-crying-shake' : ''}">
            <rect x="18" y="12" width="130" height="92" rx="10" fill="${isBurnt ? '#09090b' : '#0f172a'}" stroke="${isHot ? '#ef4444' : (isSupplying ? '#38bdf8' : '#0284c7')}" stroke-width="3"/>
            
            <!-- Real-Time Benchtop Digital LCD Meter Screen -->
            <rect x="28" y="18" width="80" height="56" rx="5" fill="#020617" stroke="${isSupplying ? '#0ea5e9' : '#1e293b'}" stroke-width="1.8"/>
            <rect x="30" y="20" width="76" height="20" rx="3" fill="rgba(2, 132, 199, 0.15)"/>
            
            <!-- Live Voltage Display (RMS) -->
            <text x="68" y="34" fill="#f59e0b" font-family="'Outfit', sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="0.4">${acV}V~ RMS</text>
            
            <!-- Sine Wave Animation or Indicator -->
            <path d="M 34 50 Q 40 43, 46 50 T 58 50 T 70 50" fill="none" stroke="${isSupplying ? '#38bdf8' : '#475569'}" stroke-width="2.2"/>

            <!-- Real-time Current & Watts on LCD -->
            <text x="84" y="48" fill="${isSupplying ? '#38bdf8' : '#64748b'}" font-family="monospace" font-size="9.5" font-weight="bold" text-anchor="middle">${curStr}</text>
            <text x="68" y="66" fill="${isSupplying ? '#fbbf24' : '#64748b'}" font-family="monospace" font-size="10.5" font-weight="bold" text-anchor="middle">${wattStr}</text>

            <!-- Status Indicator LED -->
            <circle cx="26" cy="20" r="4" fill="${isSupplying ? '#f59e0b' : '#0284c7'}" stroke="#ffffff" stroke-width="1"/>
            ${isSupplying ? '<circle cx="26" cy="20" r="6.5" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.6"/>' : ''}

            <!-- AC Terminals: Line (L) at (163, 33) and Neutral (N) at (163, 85) -->
            <line x1="148" y1="33" x2="163" y2="33" stroke="#b45309" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="163" cy="33" r="6.5" fill="#b45309" stroke="#78350f" stroke-width="1.2"/>
            <circle cx="163" cy="33" r="2.8" fill="#451a03"/>
            <text x="142" y="36" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="end">L</text>

            <line x1="148" y1="85" x2="163" y2="85" stroke="#0284c7" stroke-width="6.5" stroke-linecap="round"/>
            <circle cx="163" cy="85" r="6.5" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
            <circle cx="163" cy="85" r="2.8" fill="#082f49"/>
            <text x="142" y="88" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="900" text-anchor="end">N</text>
          </g>
        `;
        break;
      }

      // 15. DIGITAL MULTIMETER (Hybrid Analog Needle + Digital LCD)
      case 'multimeter': {
        const mode = state.mode || 'dcv';
        const displayStr = state.displayStr || '0.00 V';
        const modeLabels = {
          dcv: 'DC V',
          acv: 'AC V',
          dca: 'DC mA',
          ohm: 'Ω OHM',
          cont: '🔊 CONT',
          diode: '▶| DIODE'
        };
        const activeLabel = modeLabels[mode] || 'DC V';

        // Calculate dynamic analog meter needle angle (-42° to +42°)
        let numVal = 0;
        const match = (displayStr || '').match(/([0-9.]+)/);
        if (match) numVal = parseFloat(match[1]);
        let maxScale = 10.0;
        if (mode === 'acv') maxScale = 250.0;
        else if (mode === 'dca') maxScale = 200.0;
        else if (mode === 'ohm') maxScale = 1000.0;
        else if (numVal > 15) maxScale = 30.0;
        const normRatio = Math.max(0, Math.min(1.0, numVal / maxScale));
        const needleAngle = -42 + (normRatio * 84);

        content = `
          <g class="comp-multimeter comp-character ${isBurnt ? 'burnt' : ''}">
            <!-- Rugged Yellow/Charcoal Fluke-Style Body -->
            <rect x="12" y="10" width="151" height="124" rx="10" fill="${isBurnt ? '#09090b' : '#d97706'}" stroke="${isBurnt ? '#ef4444' : '#78350f'}" stroke-width="3"/>
            <rect x="18" y="15" width="139" height="55" rx="5" fill="#0f172a" stroke="#1e293b"/>

            <!-- High-Contrast LCD Screen with Analog Meter Scale -->
            <rect x="22" y="19" width="131" height="47" rx="4" fill="#84cc16" stroke="#3f6212" stroke-width="1.5"/>

            <!-- Analog Scale Arc and Calibration Ticks -->
            <path d="M 44 37 Q 87 23, 131 37" stroke="#166534" stroke-width="1.5" fill="none"/>
            <line x1="44" y1="37" x2="47" y2="33" stroke="#166534" stroke-width="1.2"/>
            <line x1="65" y1="31" x2="66" y2="27" stroke="#166534" stroke-width="1.2"/>
            <line x1="87" y1="28" x2="87" y2="24" stroke="#166534" stroke-width="1.2"/>
            <line x1="109" y1="31" x2="108" y2="27" stroke="#166534" stroke-width="1.2"/>
            <line x1="131" y1="37" x2="128" y2="33" stroke="#166534" stroke-width="1.2"/>

            <!-- Animated Red Analog Needle -->
            <g transform="translate(87, 57) rotate(${needleAngle.toFixed(1)})">
              <line x1="0" y1="0" x2="0" y2="-27" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
              <circle cx="0" cy="0" r="2.8" fill="#0f172a" stroke="#dc2626" stroke-width="1"/>
            </g>

            <!-- Mode Label & Digital Auto Tag -->
            <text x="28" y="31" fill="#14532d" font-family="'Outfit', monospace" font-size="9" font-weight="900">${activeLabel}</text>
            <text x="147" y="31" fill="#166534" font-family="'Outfit', monospace" font-size="8" font-weight="700" text-anchor="end">AUTO</text>

            <!-- Big Digital LCD Digits -->
            <text x="147" y="60" fill="#052e16" font-family="'Courier New', monospace" font-size="19" font-weight="900" text-anchor="end">${displayStr}</text>

            <!-- Mode Selector Push Button Matrix -->
            <rect x="22" y="75" width="131" height="18" rx="4" fill="#0f172a" stroke="#334155"/>
            <g font-family="sans-serif" font-size="7" font-weight="900" text-anchor="middle">
              <text x="34" y="87" fill="${mode === 'dcv' ? '#fbbf24' : '#94a3b8'}">DCV</text>
              <text x="56" y="87" fill="${mode === 'acv' ? '#fbbf24' : '#94a3b8'}">ACV</text>
              <text x="78" y="87" fill="${mode === 'dca' ? '#fbbf24' : '#94a3b8'}">mA</text>
              <text x="100" y="87" fill="${mode === 'ohm' ? '#fbbf24' : '#94a3b8'}">Ω</text>
              <text x="121" y="87" fill="${mode === 'cont' ? '#fbbf24' : '#94a3b8'}">🔊</text>
              <text x="142" y="87" fill="${mode === 'diode' ? '#fbbf24' : '#94a3b8'}">▶|</text>
            </g>

            <!-- Connecting Lead Jacks: V/Ω/mA at (45, 125), COM at (130, 125) -->
            <text x="45" y="110" fill="#fca5a5" font-size="7.5" font-weight="900" text-anchor="middle">V·Ω·mA</text>
            <circle cx="45" cy="125" r="8" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.8"/>
            <circle cx="45" cy="125" r="3.8" fill="#0f172a"/>

            <text x="130" y="110" fill="#bae6fd" font-size="7.5" font-weight="900" text-anchor="middle">COM</text>
            <circle cx="130" cy="125" r="8" fill="#1e293b" stroke="#0f172a" stroke-width="1.8"/>
            <circle cx="130" cy="125" r="3.8" fill="#0f172a"/>
          </g>
        `;
        break;
      }

      // 16. NPN TRANSISTOR
      case 'npn': {
        const isConducting = state.conducting && !isBurnt && !isBurning;
        const casingFill = isBurnt ? '#09090b' : (isConducting ? '#0f172a' : '#18181b');
        const casingStroke = isBurnt ? '#ef4444' : (isConducting ? '#f59e0b' : '#38bdf8');
        content = `
          <g class="comp-npn ${isConducting ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <!-- Three Long, Continuous, Fully Visible Vertical Metal Legs extending to the bottom end at y=155 -->
            <!-- Leg 1: COLLECTOR on Left (from y=56 down to bottom end at y=155) -->
            <line x1="65" y1="56" x2="65" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="64" y1="56" x2="64" y2="155" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Leg 2: BASE in Center (from y=56 down to bottom end at y=155) -->
            <line x1="125" y1="56" x2="125" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="124" y1="56" x2="124" y2="155" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Leg 3: EMITTER on Right (Third Leg, from y=56 down to bottom end at y=155) -->
            <line x1="185" y1="56" x2="185" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="184" y1="56" x2="184" y2="155" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Real TO-92 Transistor Package Body (Curved Top, Flat Bottom Face) -->
            <path d="M 55 18 C 55 6, 195 6, 195 18 L 195 56 C 195 60, 55 60, 55 56 Z" 
                  fill="${casingFill}" stroke="${casingStroke}" stroke-width="2.6"/>
            <!-- Flat front bevel / metallic sheen -->
            <rect x="65" y="16" width="120" height="4" rx="2" fill="#ffffff" opacity="${isBurnt ? '0.04' : '0.15'}"/>
            
            <!-- Model & Transistor Type (Bold, prominent, clean) -->
            <text x="125" y="38" fill="${isConducting ? '#fbbf24' : '#38bdf8'}" font-family="'Outfit', sans-serif" font-size="16" font-weight="900" letter-spacing="2.5" text-anchor="middle">NPN · 2N3904</text>
            <text x="125" y="50" fill="${state.operatingRegime === 'saturation' ? '#f59e0b' : (state.operatingRegime === 'active' ? '#f59e0b' : '#64748b')}" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="800" letter-spacing="1" text-anchor="middle">${state.operatingRegime === 'saturation' ? '● SATURATION (ON)' : (state.operatingRegime === 'active' ? '◐ ACTIVE REGION' : '○ CUTOFF (OFF)')}</text>

            <!-- Leg alignment markers at top entrance (C, B, E) -->
            <circle cx="65" cy="54" r="3" fill="#38bdf8"/>
            <circle cx="125" cy="54" r="3" fill="#f59e0b"/>
            <circle cx="185" cy="54" r="3" fill="#ef4444"/>
          </g>
        `;
        break;
      }

      // 17. PNP TRANSISTOR
      case 'pnp': {
        const isConducting = state.conducting && !isBurnt && !isBurning;
        const casingFill = isBurnt ? '#09090b' : (isConducting ? '#0f172a' : '#18181b');
        const casingStroke = isBurnt ? '#ef4444' : (isConducting ? '#c084fc' : '#a855f7');
        content = `
          <g class="comp-pnp ${isConducting ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <!-- Three Long, Continuous, Fully Visible Vertical Metal Legs extending to the bottom end at y=155 -->
            <!-- Leg 1: EMITTER on Left (from y=56 down to bottom end at y=155) -->
            <line x1="65" y1="56" x2="65" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="64" y1="56" x2="64" y2="155" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Leg 2: BASE in Center (from y=56 down to bottom end at y=155) -->
            <line x1="125" y1="56" x2="125" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="124" y1="56" x2="124" y2="155" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Leg 3: COLLECTOR on Right (Third Leg, from y=56 down to bottom end at y=155) -->
            <line x1="185" y1="56" x2="185" y2="155" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
            <line x1="184" y1="56" x2="184" y2="155" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>

            <!-- Real TO-92 Transistor Package Body (Curved Top, Flat Bottom Face) -->
            <path d="M 55 18 C 55 6, 195 6, 195 18 L 195 56 C 195 60, 55 60, 55 56 Z" 
                  fill="${casingFill}" stroke="${casingStroke}" stroke-width="2.6"/>
            <!-- Flat front bevel / metallic sheen -->
            <rect x="65" y="16" width="120" height="4" rx="2" fill="#ffffff" opacity="${isBurnt ? '0.04' : '0.15'}"/>
            
            <!-- Model & Transistor Type (Bold, prominent, clean) -->
            <text x="125" y="38" fill="${isConducting ? '#f0abfc' : '#c084fc'}" font-family="'Outfit', sans-serif" font-size="16" font-weight="900" letter-spacing="2.5" text-anchor="middle">PNP · 2N3906</text>
            <text x="125" y="50" fill="${state.operatingRegime === 'saturation' ? '#c084fc' : (state.operatingRegime === 'active' ? '#f59e0b' : '#64748b')}" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="800" letter-spacing="1" text-anchor="middle">${state.operatingRegime === 'saturation' ? '● SATURATION (ON)' : (state.operatingRegime === 'active' ? '◐ ACTIVE REGION' : '○ CUTOFF (OFF)')}</text>

            <!-- Leg alignment markers at top entrance (E, B, C) -->
            <circle cx="65" cy="54" r="3" fill="#ef4444"/>
            <circle cx="125" cy="54" r="3" fill="#f59e0b"/>
            <circle cx="185" cy="54" r="3" fill="#38bdf8"/>
          </g>
        `;
        break;
      }

      // 18. LDR (CADMIUM SULFIDE CdS PHOTORESISTOR - 3D REALISTIC)
      case 'ldr': {
        const lux = state.lux || 0;
        const ohms = state.resistance || 10000;
        const isBright = lux > 8;

        content = `
          <g class="comp-ldr comp-character ${state.powered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <!-- 3D Bezel Cylindrical Shading -->
              <radialGradient id="ldr-bezel-grad-${comp.id}" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stop-color="${isBurnt ? '#18181b' : '#27272a'}"/>
                <stop offset="45%" stop-color="${isBurnt ? '#09090b' : '#18181b'}"/>
                <stop offset="100%" stop-color="#050507"/>
              </radialGradient>

              <!-- Warm Buff/Cream Ceramic Substrate Disc -->
              <linearGradient id="ldr-ceramic-grad-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${isBurnt ? '#1c1917' : (isBright ? '#fef9c3' : '#fef3c7')}"/>
                <stop offset="25%" stop-color="${isBurnt ? '#18181b' : (isBright ? '#fef08a' : '#fde68a')}"/>
                <stop offset="65%" stop-color="${isBurnt ? '#0c0a09' : (isBright ? '#fde047' : '#f5d074')}"/>
                <stop offset="100%" stop-color="${isBurnt ? '#09090b' : (isBright ? '#eab308' : '#eab338')}"/>
              </linearGradient>

              <!-- Cadmium Sulfide (CdS) Photoconductive Serpentine Paste -->
              <linearGradient id="ldr-track-grad-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="${isBurnt ? '#292524' : (isBright ? '#f59e0b' : '#ea580c')}"/>
                <stop offset="50%" stop-color="${isBurnt ? '#1c1917' : (isBright ? '#fde047' : '#f97316')}"/>
                <stop offset="100%" stop-color="${isBurnt ? '#0c0a09' : (isBright ? '#f59e0b' : '#c2410c')}"/>
              </linearGradient>

              <!-- Metallic Solder Electrode Rivets -->
              <radialGradient id="ldr-solder-grad-${comp.id}" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="30%" stop-color="#cbd5e1"/>
                <stop offset="70%" stop-color="#64748b"/>
                <stop offset="100%" stop-color="#334155"/>
              </radialGradient>

              <!-- Convex Epoxy Clear Lens Reflection -->
              <linearGradient id="ldr-glare-${comp.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
                <stop offset="50%" stop-color="rgba(255,255,255,0.15)"/>
                <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadow underneath sensor cell -->
            <ellipse cx="80" cy="100" rx="42" ry="8" fill="rgba(0,0,0,0.38)" filter="blur(4px)"/>

            <!-- 2. Terminal Leads (Tinned Silver Copper Wires) -->
            <!-- Left Lead: extends from solder rivet (46, 56) to pin1 (16, 56) -->
            <line x1="46" y1="56" x2="16" y2="56" stroke="#475569" stroke-width="4.2" stroke-linecap="round"/>
            <line x1="46" y1="56" x2="16" y2="56" stroke="#cbd5e1" stroke-width="2.6" stroke-linecap="round"/>
            <line x1="46" y1="55.2" x2="16" y2="55.2" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round"/>

            <!-- Right Lead: extends from solder rivet (114, 56) to pin2 (144, 56) -->
            <line x1="114" y1="56" x2="144" y2="56" stroke="#475569" stroke-width="4.2" stroke-linecap="round"/>
            <line x1="114" y1="56" x2="144" y2="56" stroke="#cbd5e1" stroke-width="2.6" stroke-linecap="round"/>
            <line x1="114" y1="55.2" x2="144" y2="55.2" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round"/>

            <!-- 3. Outer Black Cylindrical Housing / Encapsulation Bezel -->
            <circle cx="80" cy="56" r="43" fill="url(#ldr-bezel-grad-${comp.id})" stroke="${isBurnt ? '#ef4444' : '#27272a'}" stroke-width="1.6"/>
            <!-- Beveled Rim Highlight Arc (Upper Left 3D light) -->
            <path d="M 48 38 A 42 42 0 0 1 112 38" fill="none" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Recessed Inner Wall Lip -->
            <circle cx="80" cy="56" r="39.5" fill="#09090b" stroke="#000000" stroke-width="1.2"/>
            <!-- Substrate Bed Base Layer -->
            <circle cx="80" cy="56" r="38" fill="${isBurnt ? '#18181b' : '#d97706'}" opacity="0.4"/>

            <!-- 4. Ceramic Substrate Disc with Authentic Flattened Top and Bottom Chords -->
            <path d="M 58.4 26 L 101.6 26 A 37 37 0 0 1 101.6 86 L 58.4 86 A 37 37 0 0 1 58.4 26 Z" 
                  fill="url(#ldr-ceramic-grad-${comp.id})" stroke="${isBurnt ? '#292524' : '#d97706'}" stroke-width="0.6"/>
            <path d="M 58.4 26 L 101.6 26 A 37 37 0 0 1 101.6 86 L 58.4 86 A 37 37 0 0 1 58.4 26 Z" 
                  fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>

            <!-- Photonic Energetic Glow when Illuminated -->
            ${isBright ? `
              <circle cx="80" cy="56" r="37" fill="#fbbf24" opacity="0.22" filter="blur(6px)"/>
            ` : ''}

            <!-- 5. Cadmium Sulfide (CdS) Serpentine Wave Track (8 Horizontal Passes & Hairpin Loops) -->
            <!-- 3D Embossed Under-Shadow for raised thick-film paste texture -->
            <path d="M 62 82 L 98 82 A 3.5 3.5 0 0 0 98 75 L 55 75 A 3.5 3.5 0 0 1 55 68 L 105 68 A 3.5 3.5 0 0 0 105 61 L 58 61 A 5 5 0 0 1 58 51 L 105 51 A 3.5 3.5 0 0 0 105 44 L 55 44 A 3.5 3.5 0 0 1 55 37 L 98 37 A 3.5 3.5 0 0 0 98 30 L 62 30" 
                  fill="none" stroke="${isBurnt ? '#09090b' : (isBright ? '#b45309' : '#9a3412')}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Main Vibrant Cadmium Orange Serpentine Track -->
            <path d="M 62 82 L 98 82 A 3.5 3.5 0 0 0 98 75 L 55 75 A 3.5 3.5 0 0 1 55 68 L 105 68 A 3.5 3.5 0 0 0 105 61 L 58 61 A 5 5 0 0 1 58 51 L 105 51 A 3.5 3.5 0 0 0 105 44 L 55 44 A 3.5 3.5 0 0 1 55 37 L 98 37 A 3.5 3.5 0 0 0 98 30 L 62 30" 
                  fill="none" stroke="url(#ldr-track-grad-${comp.id})" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"
                 />
            
            <!-- Top Specular Highlight Spine along Track -->
            <path d="M 62 82 L 98 82 A 3.5 3.5 0 0 0 98 75 L 55 75 A 3.5 3.5 0 0 1 55 68 L 105 68 A 3.5 3.5 0 0 0 105 61 L 58 61 A 5 5 0 0 1 58 51 L 105 51 A 3.5 3.5 0 0 0 105 44 L 55 44 A 3.5 3.5 0 0 1 55 37 L 98 37 A 3.5 3.5 0 0 0 98 30 L 62 30" 
                  fill="none" stroke="${isBright ? '#ffffff' : 'rgba(255, 237, 213, 0.45)'}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- 6. Metallic Solder Contact Rivets / Electrodes (at 9 o'clock and 3 o'clock) -->
            <!-- Left Solder Rivet Pad -->
            <circle cx="46" cy="56" r="5.2" fill="#78350f" opacity="0.45"/>
            <circle cx="46" cy="56" r="4.2" fill="url(#ldr-solder-grad-${comp.id})" stroke="#334155" stroke-width="0.7"/>
            <circle cx="46" cy="56" r="1.6" fill="#1e293b" opacity="0.55"/>
            <circle cx="45" cy="55" r="0.9" fill="#ffffff" opacity="0.9"/>
            <!-- Electrode Feeder Trace into Serpentine Grid -->
            <path d="M 49 56 Q 53 58 58 61" fill="none" stroke="${isBurnt ? '#1c1917' : '#c2410c'}" stroke-width="2.8" stroke-linecap="round"/>

            <!-- Right Solder Rivet Pad -->
            <circle cx="114" cy="56" r="5.2" fill="#78350f" opacity="0.45"/>
            <circle cx="114" cy="56" r="4.2" fill="url(#ldr-solder-grad-${comp.id})" stroke="#334155" stroke-width="0.7"/>
            <circle cx="114" cy="56" r="1.6" fill="#1e293b" opacity="0.55"/>
            <circle cx="113" cy="55" r="0.9" fill="#ffffff" opacity="0.9"/>
            <!-- Electrode Feeder Trace into Serpentine Grid -->
            <path d="M 111 56 Q 108 53 105 51" fill="none" stroke="${isBurnt ? '#1c1917' : '#c2410c'}" stroke-width="2.8" stroke-linecap="round"/>

            <!-- 7. Clear Protective Epoxy Resin Dome / Glass Gloss Reflections -->
            <path d="M 54 40 A 35 35 0 0 1 106 40" fill="none" stroke="rgba(255, 255, 255, 0.42)" stroke-width="2.4" stroke-linecap="round"/>
            <ellipse cx="68" cy="46" rx="18" ry="9" fill="url(#ldr-glare-${comp.id})" transform="rotate(-20 68 46)"/>
            <path d="M 60 76 A 38 38 0 0 0 100 76" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" stroke-linecap="round"/>

            <!-- 8. Incoming Light Photons (visible when illuminated by nearby light source!) -->
            ${isBright ? `
              <g stroke="#f59e0b" stroke-width="2" opacity="0.95" stroke-linecap="round">
                <!-- Optical Ray 1 -->
                <line x1="56" y1="8" x2="68" y2="24"/>
                <polygon points="68,24 62,20 66,17" fill="#f59e0b"/>
                <!-- Optical Ray 2 (Central Beam) -->
                <line x1="80" y1="4" x2="80" y2="20"/>
                <polygon points="80,20 76,16 84,16" fill="#f59e0b"/>
                <!-- Optical Ray 3 -->
                <line x1="104" y1="8" x2="92" y2="24"/>
                <polygon points="92,24 94,17 98,20" fill="#f59e0b"/>
              </g>
            ` : ''}

            <!-- 9. Burnt & Overheated Failure Effects -->
            ${isBurnt ? `
              <!-- Cracked fracture lines across glass epoxy dome -->
              <path d="M 64 38 L 74 52 L 70 60 L 86 56 L 96 68" stroke="#ef4444" stroke-width="2" fill="none"/>
              <path d="M 74 52 L 84 46" stroke="#ef4444" stroke-width="1.4" fill="none"/>
              <circle cx="80" cy="56" r="32" fill="rgba(0,0,0,0.65)" filter="blur(4px)"/>
              <text x="80" y="62" font-size="20" text-anchor="middle">💥</text>
            ` : ''}

            <!-- 10. Character Expressive Crying Shake (Subtle, non-intrusive) -->
            ${isCrying && !isBurnt ? `
              <circle cx="72" cy="52" r="3" fill="#38bdf8"/>
              <circle cx="88" cy="52" r="3" fill="#38bdf8"/>
              <path d="M 72 56 Q 72 63 69 66 Q 66 69 72 69 Q 78 69 75 66 Z" fill="#38bdf8" opacity="0.85"/>
              <path d="M 88 56 Q 88 63 85 66 Q 82 69 88 69 Q 94 69 91 66 Z" fill="#38bdf8" opacity="0.85"/>
            ` : ''}
          </g>
        `;
        break;
      }

      // 19. ELECTROLYTIC CAPACITOR (REAL 3D UPRIGHT RADIAL ALUMINUM MODEL)
      case 'capacitor': {
        const storedV = state.storedVoltage || 0;
        const capVal = state.capacitance || 1000;
        const vRat = state.ratedVoltage || 16;
        const maxV = state.maxVoltage || vRat;
        const chargeRatio = Math.max(0, Math.min(1.0, storedV / maxV));
        const isCharged = storedV > 0.15;
        const glowOpacity = isCharged ? Math.min(0.85, 0.25 + chargeRatio * 0.6) : 0;
        const isDischarging = (state.current || 0) > 0.0001;

        content = `
          <g class="comp-capacitor comp-real-capacitor ${isCharged ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <!-- 3D Cylindrical Black Sleeve Metallic Sheen Gradient -->
              <linearGradient id="elec3d-body-grad-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="${isBurnt ? '#18181b' : '#09090b'}"/>
                <stop offset="10%" stop-color="${isBurnt ? '#27272a' : '#1e293b'}"/>
                <stop offset="22%" stop-color="${isBurnt ? '#18181b' : '#0f172a'}"/>
                <stop offset="35%" stop-color="${isBurnt ? '#3f3f46' : '#334155'}"/>
                <stop offset="46%" stop-color="${isBurnt ? '#18181b' : '#18181b'}"/>
                <stop offset="70%" stop-color="${isBurnt ? '#09090b' : '#0f172a'}"/>
                <stop offset="100%" stop-color="#020617"/>
              </linearGradient>

              <!-- Top Aluminum Safety Relief Vent Disc Gradient -->
              <radialGradient id="elec3d-vent-disc-${comp.id}" cx="45%" cy="38%" r="62%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="25%" stop-color="#f1f5f9"/>
                <stop offset="60%" stop-color="#cbd5e1"/>
                <stop offset="85%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#64748b"/>
              </radialGradient>

              <!-- Negative Cathode Silver Stripe Gradient -->
              <linearGradient id="elec3d-stripe-silver-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#94a3b8"/>
                <stop offset="18%" stop-color="#ffffff"/>
                <stop offset="52%" stop-color="#e2e8f0"/>
                <stop offset="82%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#64748b"/>
              </linearGradient>

              <!-- Tinned Copper Radial Wire Lead Cylindrical Gradient -->
              <linearGradient id="elec3d-lead-grad-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="30%" stop-color="#ffffff"/>
                <stop offset="68%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadow for 3D Elevation -->
            <ellipse cx="80" cy="98" rx="36" ry="6.5" fill="#000000" opacity="0.45" filter="blur(4px)"/>

            <!-- 2. Electrostatic Energy Aura when Charged -->
            ${isCharged ? `
              <rect class="cap-storage-aura" x="42" y="10" width="76" height="88" rx="16" fill="#00f0ff" opacity="${glowOpacity * 0.4}" filter="blur(10px)"/>
            ` : ''}

            <!-- 3. Dual Radial Wire Leads (Emerging from bottom rubber bung and extending straight down) -->
            <!-- Left Lead (Anode +) connecting straight down to (58, 134) [Physically Longer Lead] -->
            <rect x="56.2" y="90" width="3.6" height="44" rx="1.8" fill="url(#elec3d-lead-grad-${comp.id})"/>
            <line x1="57.2" y1="90" x2="57.2" y2="134" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>
            <circle cx="58" cy="134" r="8" fill="url(#elec3d-lead-grad-${comp.id})" stroke="#ef4444" stroke-width="1.3"/>
            <text x="58" y="137.2" fill="#ef4444" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">+</text>

            <!-- Right Lead (Cathode −) connecting straight down to (102, 120) [Physically Shorter Lead under Silver Stripe] -->
            <rect x="100.2" y="90" width="3.6" height="30" rx="1.8" fill="url(#elec3d-lead-grad-${comp.id})"/>
            <line x1="101.2" y1="90" x2="101.2" y2="120" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>
            <circle cx="102" cy="120" r="8" fill="url(#elec3d-lead-grad-${comp.id})" stroke="#0ea5e9" stroke-width="1.3"/>
            <text x="102" y="123.2" fill="#0ea5e9" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">−</text>

            <!-- 4. Molded Bottom Rubber Bung Seal with Wire Entry Grommets -->
            <ellipse cx="80" cy="90" rx="27" ry="7.5" fill="#18181b" stroke="#09090b" stroke-width="1"/>
            <ellipse cx="58" cy="90" rx="3.5" ry="1.8" fill="#09090b"/>
            <ellipse cx="102" cy="90" rx="3.5" ry="1.8" fill="#09090b"/>

            <!-- 5. Main 3D Cylindrical Canister Body with Deep Black PVC Sleeve -->
            <path d="M 49 16 L 49 86 A 31 8.5 0 0 0 111 86 L 111 16 Z" 
                  fill="url(#elec3d-body-grad-${comp.id})" 
                  stroke="${isBurnt ? '#ef4444' : (isCharged ? '#38bdf8' : '#334155')}" 
                  stroke-width="1.4"/>

            <!-- Sleek Cylindrical Specular Sheen Running Vertically -->
            <line x1="63" y1="20" x2="63" y2="85" stroke="#ffffff" stroke-width="1.6" opacity="0.32" stroke-linecap="round"/>
            <line x1="64.5" y1="20" x2="64.5" y2="85" stroke="rgba(255,255,255,0.14)" stroke-width="2.8" stroke-linecap="round"/>

            <!-- 6. Circumferential Waist Crimp Groove (Recessed Swaged Indentation near bottom) -->
            <path d="M 49 78 A 31 7.2 0 0 0 111 78" fill="none" stroke="#050507" stroke-width="2.4"/>
            <path d="M 49 79.8 A 31 7.2 0 0 0 111 79.8" fill="none" stroke="rgba(255,255,255,0.42)" stroke-width="1.2"/>
            <!-- Silhouette Waist Pinch Notches -->
            <circle cx="49" cy="78" r="1.5" fill="#050507"/>
            <circle cx="111" cy="78" r="1.5" fill="#050507"/>

            <!-- 7. Wide Negative Cathode Silver Stripe (Right side with chevrons and negative bar) -->
            <path d="M 76 14 L 76 88 A 31 8.5 0 0 0 106 87 L 106 14 Z" fill="url(#elec3d-stripe-silver-${comp.id})"/>

            <!-- Markings inside Silver Stripe (Top Chevron ▼, Center Minus Bar ― & Dot •, Bottom Chevron ▼) -->
            <!-- Top Dark Chevron Arrow ▼ -->
            <path d="M 78 27 L 91 38 L 104 27 L 104 33 L 91 44 L 78 33 Z" fill="#090d16"/>
            <!-- Center Negative Minus Bar ― and Polarity Dot • -->
            <rect x="88.5" y="47" width="5" height="15" rx="2" fill="#090d16"/>
            <circle cx="91" cy="67" r="2.4" fill="#090d16"/>
            <!-- Bottom Dark Chevron Arrow ▼ -->
            <path d="M 78 71 L 91 82 L 104 71 L 104 77 L 91 88 L 78 77 Z" fill="#090d16"/>

            <!-- 8. Vertical Printed Markings on Left Sleeve (Top-to-Bottom Downward Text) -->
            <!-- Line 1: Capacitance & Working Voltage (e.g. 470µF 25V) -->
            <text x="56" y="27" transform="rotate(90, 56, 27)" 
                  font-family="'Outfit', -apple-system, sans-serif" font-weight="900" font-size="7.6" fill="#ffffff" letter-spacing="0.4">
              ${capVal >= 1000 ? `${capVal}µF` : `${capVal}µF`} ${vRat}V
            </text>

            <!-- Line 2: Industrial Operating Temperature Range (e.g. -40+105°C) -->
            <text x="67" y="28" transform="rotate(90, 67, 28)" 
                  font-family="'Outfit', -apple-system, sans-serif" font-weight="800" font-size="6.8" fill="#e2e8f0" letter-spacing="0.3">
              -40+105°C
            </text>

            <!-- 9. Embossed Aluminum Top Face & Stamped Safety Relief Vent (+) -->
            <!-- Outer Black Sleeve Rolled Bevel Lip -->
            <ellipse cx="80" cy="16" rx="31" ry="8.5" fill="#18181b" stroke="#09090b" stroke-width="1.2"/>
            <!-- Top Silver Stripe Wrap-Over onto Bevel -->
            <path d="M 76 10 C 85 9, 98 10, 106 12 C 103 14, 85 15, 76 14 Z" fill="url(#elec3d-stripe-silver-${comp.id})"/>
            <!-- Aluminum Metallic Vent Disc Surface -->
            <ellipse cx="80" cy="16" rx="27" ry="7.2" fill="url(#elec3d-vent-disc-${comp.id})" stroke="#64748b" stroke-width="0.8"/>
            <!-- Top Specular Rim Highlight -->
            <path d="M 54 16 A 26 7 0 0 1 106 16" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.85"/>

            <!-- Embossed Safety Relief Cross Vent (+ Stamped into aluminum top to vent pressure safely) -->
            <g opacity="0.9">
              <!-- Horizontal vent score line -->
              <line x1="57" y1="16" x2="103" y2="16" stroke="#334155" stroke-width="1.6" stroke-linecap="round"/>
              <line x1="57" y1="16.7" x2="103" y2="16.7" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.85"/>
              <!-- Vertical vent score line -->
              <line x1="80" y1="10" x2="80" y2="22" stroke="#334155" stroke-width="1.6" stroke-linecap="round"/>
              <line x1="80.6" y1="10" x2="80.6" y2="22" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.85"/>
              <!-- Diagonal relief score facets -->
              <line x1="65" y1="12.5" x2="95" y2="19.5" stroke="#475569" stroke-width="1.1" stroke-linecap="round"/>
              <line x1="65" y1="19.5" x2="95" y2="12.5" stroke="#475569" stroke-width="1.1" stroke-linecap="round"/>
              <circle cx="80" cy="16" r="3.2" fill="none" stroke="#64748b" stroke-width="0.6"/>
            </g>

            <!-- 10. Real-Time Electrostatic Stored Charge / Status Micro-Gauge -->
            <rect class="cap-live-badge" x="52" y="93" width="56" height="11" rx="3" fill="rgba(6, 11, 22, 0.94)" stroke="rgba(56, 189, 248, 0.55)" stroke-width="0.8"/>
            ${isCharged ? `
              <rect class="cap-gauge-bar" x="53" y="94" width="${Math.max(4, Math.round(54 * chargeRatio))}" height="9" rx="2" fill="#0284c7" opacity="0.65"/>
            ` : ''}
            <text class="cap-live-text" x="80" y="101.5" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="6.8" font-weight="900" text-anchor="middle">
              ${storedV > 0.05 ? `${storedV.toFixed(1)}V Stored` : `${capVal}µF • ${vRat}V`}
            </text>

            <!-- 11. Active Discharging Energy Sparks when Energizing Loads -->
            ${isDischarging ? `
              <g stroke="#facc15" stroke-width="1.5" opacity="0.95">
                <line x1="53" y1="108" x2="50" y2="114"/>
                <line x1="63" y1="108" x2="66" y2="114"/>
                <circle cx="58" cy="112" r="1.8" fill="#facc15"/>
                <line x1="97" y1="102" x2="94" y2="108"/>
                <line x1="107" y1="102" x2="110" y2="108"/>
                <circle cx="102" cy="106" r="1.8" fill="#facc15"/>
              </g>
            ` : ''}

            <!-- 12. Safety Relief Vent Rupture when Overvoltaged or Reverse Biased -->
            ${isBurnt ? `
              <ellipse cx="80" cy="16" rx="16" ry="6.5" fill="#dc2626" opacity="0.85"/>
              <path d="M 68 16 L 80 11 L 92 16 L 80 21 Z" stroke="#fef08a" stroke-width="2" fill="none"/>
              <ellipse cx="80" cy="16" rx="18" ry="7.5" fill="#000000" opacity="0.55" filter="blur(3px)"/>
              <text x="80" y="20" font-size="14" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 20. CERAMIC DISC CAPACITOR (REAL DIPPED DISC MODEL WITH STAMPED EIA CODE)
      case 'ceramic_capacitor': {
        const code = state.ceramicCode || '104';
        const nf = state.capacitanceNf || (code === '104' ? 100 : 10);
        const pf = state.capacitancePf || (nf * 1000);
        const capLabel = pf < 1000 ? `${pf}pF` : (nf < 1000 ? `${nf}nF` : `${(nf / 1000).toFixed(1)}µF`);
        const storedV = state.storedVoltage || 0;
        const isCharged = storedV > 0.1 || state.powered;
        const isACActive = (state.current || 0) > 0.0001;

        content = `
          <g class="comp-ceramic-cap comp-real-ceramic-cap ${isCharged ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <!-- Authentic Warm Amber-Ochre Ceramic Resin Lacquer Radial Shading -->
              <radialGradient id="ceramic-resin-${comp.id}" cx="40%" cy="34%" r="68%">
                <stop offset="0%" stop-color="${isBurnt ? '#52525b' : '#f7c978'}"/>
                <stop offset="22%" stop-color="${isBurnt ? '#3f3f46' : '#ebb358'}"/>
                <stop offset="58%" stop-color="${isBurnt ? '#27272a' : '#d28f2c'}"/>
                <stop offset="85%" stop-color="${isBurnt ? '#18181b' : '#b27118'}"/>
                <stop offset="100%" stop-color="${isBurnt ? '#09090b' : '#854b08'}"/>
              </radialGradient>

              <!-- Tinned Copper Radial Wire Lead Cylindrical Gradient -->
              <linearGradient id="ceramic-lead-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="28%" stop-color="#ffffff"/>
                <stop offset="65%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadow -->
            <ellipse cx="80" cy="88" rx="35" ry="7" fill="#000000" opacity="0.4" filter="blur(5px)"/>

            <!-- 2. High-Frequency Electrostatic / Decoupling Shimmer Glow -->
            ${isCharged ? `
              <circle cx="80" cy="46" r="38" fill="#f59e0b" opacity="0.25" filter="blur(10px)"/>
            ` : ''}

            <!-- 3. Parallel Tinned Copper Wire Leads (Strictly straight down from dipped shoulders) -->
            <!-- Left Lead (t1) connecting straight down to (58, 132) -->
            <rect x="56.2" y="76" width="3.6" height="56" rx="1.8" fill="url(#ceramic-lead-${comp.id})"/>
            <line x1="57.2" y1="76" x2="57.2" y2="132" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>
            <circle cx="58" cy="132" r="7.5" fill="url(#ceramic-lead-${comp.id})" stroke="#94a3b8" stroke-width="1.2"/>
            <text x="58" y="135.2" fill="#64748b" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">•</text>

            <!-- Right Lead (t2) connecting straight down to (102, 132) -->
            <rect x="100.2" y="76" width="3.6" height="56" rx="1.8" fill="url(#ceramic-lead-${comp.id})"/>
            <line x1="101.2" y1="76" x2="101.2" y2="132" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>
            <circle cx="102" cy="132" r="7.5" fill="url(#ceramic-lead-${comp.id})" stroke="#94a3b8" stroke-width="1.2"/>
            <text x="102" y="135.2" fill="#64748b" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">•</text>

            <!-- 4. Dipped Ceramic Disc Body (Authentic lacquer teardrop dipped contour with bottom lead feet) -->
            <path d="M 57 80 
                     C 47 72, 47 58, 47 46 
                     C 47 27, 62 13, 80 13 
                     C 98 13, 113 27, 113 46 
                     C 113 58, 113 72, 103 80 
                     C 101 82.5, 98 82.5, 97 80 
                     C 94 75, 88 71, 80 71 
                     C 72 71, 66 75, 63 80 
                     C 62 82.5, 59 82.5, 57 80 Z" 
                  fill="url(#ceramic-resin-${comp.id})" 
                  stroke="${isBurnt ? '#ef4444' : '#7c4305'}" 
                  stroke-width="1.2"/>

            <!-- 5. Ceramic Lacquer Glossy Specular Highlights -->
            <path d="M 53 40 C 56 22, 72 17, 92 17 C 103 17, 107 23, 107 28" 
                  fill="none" stroke="rgba(255,255,255,0.48)" stroke-width="2" stroke-linecap="round"/>
            <ellipse cx="59.5" cy="79" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.28)"/>
            <ellipse cx="100.5" cy="79" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.28)"/>

            <!-- 6. Stamped EIA 3-Digit Code (e.g. 103, 104, 220) with Authentic Underline Bar & Value -->
            <g font-family="'Outfit', -apple-system, sans-serif" font-weight="800" text-anchor="middle">
              <text x="80" y="46" font-size="15" fill="${isBurnt ? '#71717a' : '#1c1917'}" letter-spacing="1.2">${code}</text>
              <line x1="66" y1="50.5" x2="94" y2="50.5" stroke="${isBurnt ? '#71717a' : '#1c1917'}" stroke-width="1.6" stroke-linecap="round"/>
              <text x="80" y="60.5" font-size="7.5" font-weight="700" fill="${isBurnt ? '#71717a' : '#451a03'}" opacity="0.9">${capLabel}</text>
            </g>

            <!-- 7. High-Frequency Decoupling / RF Bypass Signal Sparks -->
            ${isACActive ? `
              <g stroke="#fde047" stroke-width="1.4" opacity="0.95">
                <line x1="52" y1="102" x2="48" y2="108"/>
                <line x1="64" y1="102" x2="68" y2="108"/>
                <circle cx="58" cy="105" r="1.5" fill="#fde047"/>
                <line x1="96" y1="102" x2="92" y2="108"/>
                <line x1="108" y1="102" x2="112" y2="108"/>
                <circle cx="102" cy="105" r="1.5" fill="#fde047"/>
              </g>
            ` : ''}

            <!-- 8. Burnt Ceramic Fracture Crack -->
            ${isBurnt ? `
              <path d="M 80 13 L 75 30 L 86 46 L 78 64 L 80 71" stroke="#ef4444" stroke-width="2.2" fill="none" stroke-linecap="round"/>
              <circle cx="80" cy="46" r="12" fill="#000000" opacity="0.5" filter="blur(3px)"/>
              <text x="80" y="50" font-size="14" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 21. REAL OPEN-FRAME LINEAR SOLENOID ACTUATOR & VALVE (JF-0530B / ZYE1-0530 TYPE)
      case 'solenoid': {
        const isPowered = state.powered && !isBurnt && !isBurning;
        const current = state.current || 0;
        const bField = state.magneticFieldB || (current * 12.57); // in mT
        const bFieldStr = current > 0.01 ? `${(bField * 10).toFixed(0)} Gauss` : '0 G';
        const pullForceN = current > 0.01 ? (current * 5.2).toFixed(1) : '0.0';
        const stroke = isPowered ? 16 : 0; // Inward plunger pull stroke (16px)

        // Helical return compression spring between retaining washer and front bracket
        const springStart = 44 + stroke;
        const springEnd = 74;
        const coils = 5;
        const coilPitch = (springEnd - springStart) / coils;
        let springFront = '';
        let springBack = '';
        for (let i = 0; i < coils; i++) {
          const cx1 = springStart + i * coilPitch;
          const cx2 = cx1 + coilPitch;
          // Back arc behind the plunger shaft
          springBack += `<path d="M ${cx1} 61.5 C ${cx1 + coilPitch * 0.3} 55, ${cx2 - coilPitch * 0.3} 55, ${cx2} 61.5" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round"/>`;
          // Front arc crossing over the plunger shaft
          springFront += `
            <path d="M ${cx1} 61.5 C ${cx1 + coilPitch * 0.2} 75, ${cx2 - coilPitch * 0.2} 75, ${cx2} 74.5" fill="none" stroke="#94a3b8" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M ${cx1 + 0.5} 61.5 C ${cx1 + coilPitch * 0.2} 74, ${cx2 - coilPitch * 0.2} 74, ${cx2 - 0.5} 73.5" fill="none" stroke="#ffffff" stroke-width="1.0" opacity="0.85" stroke-linecap="round"/>
          `;
        }

        content = `
          <g class="comp-solenoid comp-real-solenoid ${isPowered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <!-- Stainless Steel Plunger Armature Metallic Gradient -->
              <linearGradient id="sol-steel-rod-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#475569"/>
                <stop offset="18%" stop-color="#cbd5e1"/>
                <stop offset="40%" stop-color="#ffffff"/>
                <stop offset="70%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#334155"/>
              </linearGradient>

              <!-- Zinc-Plated Steel Open-Frame C-Channel Chassis Gradient -->
              <linearGradient id="sol-frame-metal-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#cbd5e1"/>
                <stop offset="12%" stop-color="#f8fafc"/>
                <stop offset="40%" stop-color="#e2e8f0"/>
                <stop offset="75%" stop-color="#94a3b8"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>

              <!-- Glossy Cobalt/Royal Blue Insulating PVC Tape for Coil Bobbin -->
              <linearGradient id="sol-blue-tape-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${isBurnt ? '#0f172a' : '#1e3a8a'}"/>
                <stop offset="18%" stop-color="${isBurnt ? '#18181b' : '#1d4ed8'}"/>
                <stop offset="35%" stop-color="${isBurnt ? '#27272a' : '#3b82f6'}"/>
                <stop offset="55%" stop-color="${isBurnt ? '#18181b' : '#2563eb'}"/>
                <stop offset="82%" stop-color="${isBurnt ? '#09090b' : '#1d4ed8'}"/>
                <stop offset="100%" stop-color="${isBurnt ? '#020617' : '#172554'}"/>
              </linearGradient>

              <!-- Rear Brass Core Stop Pin Metallic Gradient -->
              <linearGradient id="sol-brass-stop-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#92400e"/>
                <stop offset="22%" stop-color="#f59e0b"/>
                <stop offset="48%" stop-color="#fef08a"/>
                <stop offset="78%" stop-color="#d97706"/>
                <stop offset="100%" stop-color="#78350f"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadow -->
            <rect x="70" y="44" width="100" height="60" rx="8" fill="#000000" opacity="0.38" filter="blur(5px)"/>
            <rect x="18" y="64" width="60" height="12" rx="4" fill="#000000" opacity="0.3" filter="blur(3px)"/>

            <!-- 2. Electromagnetic Flux Field (Pulsating when energized) -->
            ${isPowered ? `
              <g fill="none" stroke="#38bdf8" stroke-dasharray="5,3" opacity="0.85">
                <rect x="74" y="38" width="92" height="60" rx="10" stroke-width="1.8"/>
                <rect x="68" y="32" width="104" height="72" rx="14" stroke-width="1.2" opacity="0.5"/>
              </g>
              <ellipse cx="120" cy="68" rx="55" ry="32" fill="#00f0ff" opacity="0.16" filter="blur(8px)"/>
            ` : ''}

            <!-- 3. Rear Core Brass Stop & Rubber Damper (Right side of frame) -->
            <!-- Black Rubber Damper Ring -->
            <rect x="164" y="59.5" width="4.5" height="17" rx="2" fill="#18181b" stroke="#09090b" stroke-width="0.8"/>
            <!-- Machined Brass Core Stop Pin -->
            <rect x="168.5" y="61" width="14" height="14" rx="1.5" fill="url(#sol-brass-stop-${comp.id})" stroke="#78350f" stroke-width="0.8"/>
            <line x1="169" y1="64.5" x2="182" y2="64.5" stroke="#ffffff" stroke-width="1.2" opacity="0.75"/>
            <line x1="181.5" y1="62" x2="181.5" y2="74" stroke="#78350f" stroke-width="1"/>

            <!-- 4. Helical Spring: Back Coil Arcs (Behind Plunger Shaft) -->
            <g>${springBack}</g>

            <!-- 5. Stainless Steel Plunger Armature (Moves right into coil when powered) -->
            <g id="sol-plunger-group-${comp.id}">
              <!-- Plunger Shaft extending through front bracket into coil -->
              <rect x="${16 + stroke}" y="61.5" width="${108 - stroke}" height="13" rx="2" 
                    fill="url(#sol-steel-rod-${comp.id})" stroke="#475569" stroke-width="0.8"/>
              <!-- Specular Reflection Highlight Streak down plunger rod -->
              <line x1="${16 + stroke}" y1="65" x2="120" y2="65" stroke="#ffffff" stroke-width="1.4" opacity="0.8"/>

              <!-- Plunger Outer Tip (Notched end-groove matching photo) -->
              <rect x="${16 + stroke}" y="62" width="3" height="12" fill="#334155"/>
              <line x1="${18 + stroke}" y1="61.5" x2="${18 + stroke}" y2="74.5" stroke="#1e293b" stroke-width="1.2"/>

              <!-- Retaining Collar / Washer (Fixed to plunger shaft) -->
              <rect x="${41 + stroke}" y="56" width="3.2" height="24" rx="1" fill="#1e293b" stroke="#0f172a" stroke-width="0.8"/>
              <line x1="${42 + stroke}" y1="57" x2="${42 + stroke}" y2="79" stroke="#94a3b8" stroke-width="0.8" opacity="0.75"/>
            </g>

            <!-- 6. Helical Return Compression Spring: Front Coil Arcs (Wrapping in front of plunger shaft) -->
            <g>${springFront}</g>

            <!-- 7. Internal Solenoid Coil Wrapped in Glossy Cobalt/Royal Blue PVC Tape -->
            <!-- Internal Bobbin & Blue Tape -->
            <rect x="79" y="44" width="81" height="48" rx="4" 
                  fill="url(#sol-blue-tape-${comp.id})" 
                  stroke="${isBurnt ? '#ef4444' : '#1e3a8a'}" 
                  stroke-width="1.2"/>

            <!-- Glossy Cylindrical Specular Highlight across blue tape -->
            <line x1="81" y1="51.5" x2="158" y2="51.5" stroke="#ffffff" stroke-width="2.4" opacity="0.32" stroke-linecap="round"/>
            <line x1="81" y1="49.5" x2="158" y2="49.5" stroke="#60a5fa" stroke-width="1.2" opacity="0.65" stroke-linecap="round"/>

            <!-- Authentic PVC Tape Wrapping Wrinkle / Seam Contours -->
            <path d="M 122 44 Q 126 68, 124 92" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.4"/>
            <path d="M 92 81 Q 116 85, 156 82" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="1.6"/>
            <circle cx="138" cy="72" r="2.5" fill="rgba(255,255,255,0.15)"/>

            <!-- 8. Open-Frame Zinc-Plated Metal C-Channel Chassis (Frame surrounding coil) -->
            <!-- Top Horizontal Plate with Rounded Rear Corner -->
            <path d="M 74 36 L 158 36 Q 164 36, 164 42 L 164 44 L 74 44 Z" 
                  fill="url(#sol-frame-metal-${comp.id})" stroke="#64748b" stroke-width="1"/>
            <line x1="75" y1="37.5" x2="162" y2="37.5" stroke="#ffffff" stroke-width="1.2" opacity="0.85"/>

            <!-- Countersunk Mounting Holes on Top Face -->
            <ellipse cx="100" cy="40" rx="3.8" ry="1.9" fill="#475569" stroke="#334155" stroke-width="0.8"/>
            <circle cx="100" cy="40" r="1.4" fill="#0f172a"/>
            <ellipse cx="145" cy="40" rx="3.8" ry="1.9" fill="#475569" stroke="#334155" stroke-width="0.8"/>
            <circle cx="145" cy="40" r="1.4" fill="#0f172a"/>

            <!-- Bottom Horizontal Plate with Rounded Rear Corner -->
            <path d="M 74 92 L 164 92 L 164 94 Q 164 100, 158 100 L 74 100 Z" 
                  fill="url(#sol-frame-metal-${comp.id})" stroke="#64748b" stroke-width="1"/>
            <line x1="75" y1="99" x2="162" y2="99" stroke="#334155" stroke-width="1"/>

            <!-- Left Front Bracket Plate with Plunger Hole Collar -->
            <path d="M 74 36 L 79 36 L 79 99 L 74 99 Z" 
                  fill="url(#sol-frame-metal-${comp.id})" stroke="#64748b" stroke-width="1"/>
            <line x1="78.5" y1="37" x2="78.5" y2="99" stroke="#ffffff" stroke-width="1" opacity="0.75"/>
            <!-- Front Plunger Guide Bushing Ring -->
            <rect x="73" y="60" width="5.5" height="16" rx="1.5" fill="#334155" stroke="#1e293b" stroke-width="0.8"/>

            <!-- Right Rear Bracket Plate -->
            <path d="M 159 44 L 164 44 L 164 92 L 159 92 Z" 
                  fill="url(#sol-frame-metal-${comp.id})" stroke="#64748b" stroke-width="1"/>

            <!-- 9. Flexible Silicone Insulated Lead Wires (Red + and Black − emerging from rear) -->
            <!-- Red Wire (+ / Coil Lead A) exiting upper right of coil to (186, 28) -->
            <path d="M 158 42 C 168 36, 175 29, 186 28" fill="none" stroke="#ef4444" stroke-width="3.8" stroke-linecap="round"/>
            <path d="M 158 41.2 C 168 35.2, 175 28.2, 186 27.2" fill="none" stroke="#fca5a5" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
            <!-- Red Terminal Pad at (186, 28) -->
            <circle cx="186" cy="28" r="8" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
            <text x="186" y="31.2" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">+</text>

            <!-- Black Wire (− / Coil Lead B) exiting rear and curving to (186, 104) -->
            <path d="M 158 46 C 172 48, 174 88, 186 104" fill="none" stroke="#18181b" stroke-width="3.8" stroke-linecap="round"/>
            <path d="M 158 45.2 C 172 47.2, 174 87.2, 186 103.2" fill="none" stroke="#475569" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
            <!-- Black/Blue Terminal Pad at (186, 104) -->
            <circle cx="186" cy="104" r="8" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
            <text x="186" y="107.2" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">−</text>

            <!-- 10. Real-Time Electromagnetic Status & Physics Readout -->
            <rect x="68" y="108" width="102" height="14" rx="3" fill="#090d16" stroke="rgba(56, 189, 248, 0.55)" stroke-width="0.8"/>
            <text x="119" y="118" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="6.8" font-weight="900" text-anchor="middle">
              ${isPowered ? `B = μ·n·I • ${bFieldStr} | ${pullForceN}N [ENGAGED]` : 'B = μ·n·I (Off • Spring Relaxed)'}
            </text>

            <!-- 11. Burnt Overheat Blast State -->
            ${isBurnt ? `
              <rect x="79" y="44" width="81" height="48" rx="4" fill="#000000" opacity="0.7" filter="blur(3px)"/>
              <text x="120" y="73" font-size="20" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 22. REAL MINIATURE SMD BRIDGE RECTIFIER (ASEMI UMB6F / MB6S TYPE)
      case 'rectifier': {
        const isPowered = state.powered && !isBurnt && !isBurning;
        const curA = state.current || 0;
        const vDrop = state.voltageDrop || (isPowered ? 1.4 : 0);
        const isConducting = isPowered && curA > 0.001;

        content = `
          <g class="comp-rectifier comp-real-rectifier ${isPowered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <!-- Molded Matte Black Epoxy IC Package Surface Gradient -->
              <linearGradient id="rect-epoxy-body-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${isBurnt ? '#09090b' : '#1f242d'}"/>
                <stop offset="20%" stop-color="${isBurnt ? '#18181b' : '#151922'}"/>
                <stop offset="60%" stop-color="${isBurnt ? '#09090b' : '#0e1117'}"/>
                <stop offset="100%" stop-color="${isBurnt ? '#020617' : '#090c10'}"/>
              </linearGradient>

              <!-- Beveled Chamfer Skirt Gradient (Front-facing lower slope) -->
              <linearGradient id="rect-bevel-skirt-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${isBurnt ? '#18181b' : '#2d3340'}"/>
                <stop offset="40%" stop-color="${isBurnt ? '#0f172a' : '#1c222c'}"/>
                <stop offset="100%" stop-color="${isBurnt ? '#050507' : '#0a0d12'}"/>
              </linearGradient>

              <!-- Left/Right Side Bevel Gradients -->
              <linearGradient id="rect-side-bevel-l-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#080a0e"/>
                <stop offset="100%" stop-color="#1c222c"/>
              </linearGradient>
              <linearGradient id="rect-side-bevel-r-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#1c222c"/>
                <stop offset="100%" stop-color="#080a0e"/>
              </linearGradient>

              <!-- Tinned Silver Solder Lead Metallic Gradient -->
              <linearGradient id="rect-lead-silver-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#94a3b8"/>
                <stop offset="30%" stop-color="#f8fafc"/>
                <stop offset="65%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#64748b"/>
              </linearGradient>

              <!-- Champagne-Gold Laser Etching Shading -->
              <linearGradient id="rect-gold-laser-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fef08a"/>
                <stop offset="50%" stop-color="#d4af37"/>
                <stop offset="100%" stop-color="#b48822"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadow -->
            <rect x="33" y="24" width="94" height="106" rx="10" fill="#000000" opacity="0.45" filter="blur(5px)"/>

            <!-- 2. Full-Wave Rectification Electromagnetic Aura when Active -->
            ${isPowered ? `
              <rect x="30" y="22" width="100" height="110" rx="14" fill="#fbbf24" opacity="0.18" filter="blur(8px)"/>
            ` : ''}

            <!-- 3. Four Tinned Copper Solder Leadframe Pins (Matching UMB6F package) -->
            <!-- Top-Left Pin (DC Negative −) connecting to (50, 16) -->
            <rect x="44" y="16" width="12" height="20" rx="2" fill="url(#rect-lead-silver-${comp.id})"/>
            <line x1="48" y1="16" x2="48" y2="34" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
            <circle cx="50" cy="16" r="7.5" fill="url(#rect-lead-silver-${comp.id})" stroke="#0284c7" stroke-width="1.4"/>
            <text x="50" y="19.2" fill="#0284c7" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">−</text>

            <!-- Top-Right Pin (DC Positive +) connecting to (110, 16) -->
            <rect x="104" y="16" width="12" height="20" rx="2" fill="url(#rect-lead-silver-${comp.id})"/>
            <line x1="108" y1="16" x2="108" y2="34" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
            <circle cx="110" cy="16" r="7.5" fill="url(#rect-lead-silver-${comp.id})" stroke="#ef4444" stroke-width="1.4"/>
            <text x="110" y="19.2" fill="#ef4444" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">+</text>

            <!-- Bottom-Left Pin (AC Input ~1) connecting to (50, 144) -->
            <rect x="44" y="118" width="12" height="26" rx="2" fill="url(#rect-lead-silver-${comp.id})"/>
            <line x1="48" y1="120" x2="48" y2="144" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
            <circle cx="50" cy="144" r="7.5" fill="url(#rect-lead-silver-${comp.id})" stroke="#f59e0b" stroke-width="1.4"/>
            <text x="50" y="147.2" fill="#f59e0b" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">~</text>

            <!-- Bottom-Right Pin (AC Input ~2) connecting to (110, 144) -->
            <rect x="104" y="118" width="12" height="26" rx="2" fill="url(#rect-lead-silver-${comp.id})"/>
            <line x1="108" y1="120" x2="108" y2="144" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
            <circle cx="110" cy="144" r="7.5" fill="url(#rect-lead-silver-${comp.id})" stroke="#0284c7" stroke-width="1.4"/>
            <text x="110" y="147.2" fill="#0284c7" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">~</text>

            <!-- 4. 3D Beveled Molded Epoxy Package Shell -->
            <!-- Left Chamfer Bevel -->
            <polygon points="35,32 38,36 38,110 35,118" fill="url(#rect-side-bevel-l-${comp.id})"/>
            <!-- Right Chamfer Bevel -->
            <polygon points="125,32 122,36 122,110 125,118" fill="url(#rect-side-bevel-r-${comp.id})"/>
            <!-- Top Chamfer Edge -->
            <polygon points="35,32 125,32 122,36 38,36" fill="#2d3340"/>
            <!-- Bottom Sloped Chamfer Skirt (Visible perspective bevel) -->
            <polygon points="38,110 122,110 125,122 35,122" fill="url(#rect-bevel-skirt-${comp.id})" stroke="#050507" stroke-width="0.8"/>
            <!-- Highlight Ridge along bottom chamfer fold -->
            <line x1="38" y1="110" x2="122" y2="110" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

            <!-- Main Flat Top Package Face (Matte Black Molded Epoxy) -->
            <rect x="38" y="36" width="84" height="74" rx="4" 
                  fill="url(#rect-epoxy-body-${comp.id})" 
                  stroke="${isBurnt ? '#ef4444' : (isPowered ? '#f59e0b' : '#272d38')}" 
                  stroke-width="1.4"/>

            <!-- Pin 1 Chamfer Notch Indicator (Top-Left Corner Notch on IC package) -->
            <path d="M 39 42 L 44 37" stroke="#475569" stroke-width="1.2"/>

            <!-- 5. Authentic Champagne-Gold Laser Markings (Matching reference image) -->
            <!-- Top Row: Polarity Indicators: Left '―' and Right '+' -->
            <!-- Negative Minus Bar '―' above left pin -->
            <rect x="52" y="47.5" width="13" height="2.8" rx="1.2" fill="url(#rect-gold-laser-${comp.id})"/>
            <!-- Positive Plus Sign '+' above right pin -->
            <path d="M 104 49 L 114 49 M 109 44 L 109 54" 
                  stroke="url(#rect-gold-laser-${comp.id})" stroke-width="2.6" stroke-linecap="square"/>

            <!-- Middle Row: Brand 'ASEMI' (Italicized Serif / Slab Font in gold) -->
            <text x="80" y="74" 
                  font-family="'Times New Roman', 'Outfit', serif" 
                  font-style="italic" 
                  font-size="16" 
                  font-weight="900" 
                  fill="url(#rect-gold-laser-${comp.id})" 
                  text-anchor="middle" 
                  letter-spacing="1.8">ASEMI</text>

            <!-- Bottom Row: Model 'UMB6F' (Clean bold uppercase in gold) -->
            <text x="80" y="96" 
                  font-family="'Outfit', -apple-system, sans-serif" 
                  font-size="13" 
                  font-weight="800" 
                  fill="url(#rect-gold-laser-${comp.id})" 
                  text-anchor="middle" 
                  letter-spacing="2.8">UMB6F</text>

            <!-- 6. Active Conduction Sparks / Full-Wave Rectification Flow -->
            ${isConducting ? `
              <g stroke="#fbbf24" stroke-width="1.4" opacity="0.95">
                <line x1="46" y1="126" x2="43" y2="132"/>
                <line x1="114" y1="126" x2="117" y2="132"/>
                <circle cx="50" cy="130" r="1.5" fill="#fbbf24"/>
                <circle cx="110" cy="130" r="1.5" fill="#fbbf24"/>
                <circle cx="110" cy="26" r="1.5" fill="#ef4444"/>
                <circle cx="50" cy="26" r="1.5" fill="#38bdf8"/>
              </g>
            ` : ''}

            <!-- 7. Real-Time Full-Wave DC Status Telemetry Bar -->
            <rect x="36" y="128" width="88" height="12" rx="3" fill="#05070a" stroke="rgba(245, 158, 11, 0.45)" stroke-width="0.8"/>
            <text x="80" y="136.8" fill="${isPowered ? '#fbbf24' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">
              ${isPowered ? `FULL-WAVE DC • V_drop ~${vDrop.toFixed(1)}V` : 'AC ➜ FULL-WAVE DC (Idle)'}
            </text>

            <!-- 8. Burnt Rupture / Scorched State -->
            ${isBurnt ? `
              <rect x="38" y="36" width="84" height="74" rx="4" fill="#000000" opacity="0.75" filter="blur(3px)"/>
              <path d="M 50 42 L 68 70 L 92 65 L 112 100" stroke="#ef4444" stroke-width="2" fill="none"/>
              <text x="80" y="78" font-size="20" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 23. REAL POWER CHOKE INDUCTOR (CYLINDRICAL FERRITE ROD & ENAMELED COPPER COIL)
      case 'inductor': {
        const isPowered = state.powered && !isBurnt && !isBurning;
        const curA = state.current || 0;
        const indMh = state.inductanceMh || (state.inductanceUh ? state.inductanceUh / 1000 : 10);
        const dcr = state.dcr || 0.8;
        const xl = state.reactanceXl || 0;
        const energyJ = state.storedEnergy || 0;
        const isConducting = isPowered && curA > 0.001;

        // Overlapping 9-turn helical coil layout positions
        const turns = [
          { x: 38 },
          { x: 48 },
          { x: 58 },
          { x: 68 },
          { x: 78 },
          { x: 88 },
          { x: 98 },
          { x: 108 },
          { x: 118 }
        ];

        content = `
          <g class="comp-inductor comp-real-inductor ${isPowered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <defs>
              <!-- Enameled Copper Wire Metallic Gradients -->
              <linearGradient id="ind-copper-body-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${isBurnt ? '#18181b' : '#f59e0b'}"/>
                <stop offset="25%" stop-color="${isBurnt ? '#27272a' : '#ea580c'}"/>
                <stop offset="60%" stop-color="${isBurnt ? '#09090b' : '#b45309'}"/>
                <stop offset="100%" stop-color="${isBurnt ? '#020202' : '#78350f'}"/>
              </linearGradient>

              <!-- Bright Specular Highlight along wire crown -->
              <linearGradient id="ind-copper-gloss-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.95"/>
                <stop offset="40%" stop-color="#fef08a" stop-opacity="0.80"/>
                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.10"/>
              </linearGradient>

              <!-- Cylindrical Ferrite Core Rod Gradient -->
              <linearGradient id="ind-ferrite-body-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#3f3f46"/>
                <stop offset="30%" stop-color="#27272a"/>
                <stop offset="70%" stop-color="#18181b"/>
                <stop offset="100%" stop-color="#09090b"/>
              </linearGradient>

              <!-- Ferrite End-Cap Face Radial Gradient -->
              <radialGradient id="ind-ferrite-face-${comp.id}" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#52525b"/>
                <stop offset="45%" stop-color="#27272a"/>
                <stop offset="100%" stop-color="#09090b"/>
              </radialGradient>

              <!-- Tinned Silver Solder Lead Metallic Gradient -->
              <linearGradient id="ind-lead-silver-${comp.id}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#64748b"/>
                <stop offset="25%" stop-color="#f8fafc"/>
                <stop offset="65%" stop-color="#cbd5e1"/>
                <stop offset="100%" stop-color="#475569"/>
              </linearGradient>
            </defs>

            <!-- 1. Ambient Drop Shadow on Circuit Canvas -->
            <ellipse cx="80" cy="118" rx="58" ry="12" fill="#000000" opacity="0.48" filter="blur(6px)"/>

            <!-- 2. Active Electromagnetic B-Field Aura & Animated Flux Rings -->
            ${isConducting ? `
              <ellipse cx="78" cy="56" rx="66" ry="34" fill="#fbbf24" opacity="0.12" filter="blur(9px)"/>
              <!-- Toroidal Outer Flux Line -->
              <path class="inductor-flux-line" d="M 22 56 C 22 18, 136 18, 136 56 C 136 94, 22 94, 22 56 Z" fill="none" stroke="#fbbf24" stroke-width="1.4" opacity="0.80"/>
              <!-- Inner Flux Line -->
              <path class="inductor-flux-line" d="M 30 56 C 30 28, 128 28, 128 56 C 128 84, 30 84, 30 56 Z" fill="none" stroke="#38bdf8" stroke-width="1.1" opacity="0.65"/>
            ` : ''}

            <!-- 3. Lead 2 (Right Lead) Back Extension: sweeps from top-back of turn 9 downwards -->
            <path d="M 119 36 C 128 42, 126 76, 120 96 L 115 120" 
                  stroke="url(#ind-lead-silver-${comp.id})" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            <path d="M 119 36 C 128 42, 126 76, 120 96 L 115 120" 
                  stroke="#ffffff" stroke-width="1.4" opacity="0.8" fill="none"/>

            <!-- 4. Cylindrical Ferrite Rod Core Body (underneath turns) -->
            <rect x="34" y="39" width="88" height="34" rx="4" fill="url(#ind-ferrite-body-${comp.id})" stroke="#09090b" stroke-width="0.8"/>
            <!-- Right Core End Cap -->
            <ellipse cx="123" cy="56" rx="5" ry="15" fill="#18181b" stroke="#09090b" stroke-width="0.8"/>

            <!-- 5. Left Stepped Ferrite Boss & Flanged Shoulder (Authentic to reference image) -->
            <!-- Flanged collar ring -->
            <rect x="29" y="37" width="10" height="38" rx="3" fill="#18181e" stroke="#09090b" stroke-width="0.8"/>
            <ellipse cx="38" cy="56" rx="3" ry="18" fill="#27272a"/>
            <!-- Protruding stepped cylindrical boss -->
            <rect x="20" y="42" width="12" height="28" rx="2" fill="url(#ind-ferrite-body-${comp.id})"/>
            <!-- Flat circular ferrite end-face with beveled rim -->
            <ellipse cx="22" cy="56" rx="6.8" ry="13.8" fill="url(#ind-ferrite-face-${comp.id})" stroke="#27272a" stroke-width="1.2"/>
            <!-- Rim specular highlight -->
            <path d="M 22 43.5 C 24.5 43.5, 27 48, 27 56 C 27 64, 24.5 68.5, 22 68.5" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1"/>

            <!-- 6. Helical Coil: 9 Overlapping Turns of Thick Enameled Copper Wire -->
            ${turns.map((t, idx) => `
              <g class="inductor-turn" id="turn-${idx}-${comp.id}">
                <!-- Seam Shadow between turns -->
                <line x1="${t.x + 9}" y1="26" x2="${t.x + 8}" y2="86" stroke="#2a0d02" stroke-width="1.8" opacity="0.9"/>
                
                <!-- Front 3D Enameled Copper Turn Body -->
                <path d="M ${t.x} 26 
                         C ${t.x + 6} 23.5, ${t.x + 12} 24, ${t.x + 14} 28 
                         L ${t.x + 12} 84 
                         C ${t.x + 10} 88.5, ${t.x + 4} 88.5, ${t.x - 2} 84 
                         Z" 
                      fill="url(#ind-copper-body-${comp.id})" 
                      stroke="${isBurnt ? '#09090b' : '#451a03'}" 
                      stroke-width="0.9"/>
                
                <!-- Top-crest wire roundness specular highlight -->
                <path d="M ${t.x + 2} 28 Q ${t.x + 7} 56, ${t.x + 3} 82" 
                      stroke="url(#ind-copper-gloss-${comp.id})" 
                      stroke-width="2.4" 
                      stroke-linecap="round" 
                      fill="none"/>

                <!-- Front reflective glossy enamel sheen glints -->
                <ellipse cx="${t.x + 7}" cy="30" rx="3.6" ry="2.2" fill="#fffbeb" opacity="0.75"/>
                <ellipse cx="${t.x + 5}" cy="78" rx="2.8" ry="1.8" fill="#fed7aa" opacity="0.45"/>
              </g>
            `).join('')}

            <!-- 7. Lead 1 (Left Lead): curves forward and down from bottom of turn 1 -->
            <path d="M 40 76 C 39 88, 41 106, 45 120" 
                  stroke="url(#ind-lead-silver-${comp.id})" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            <path d="M 40 76 C 39 88, 41 106, 45 120" 
                  stroke="#ffffff" stroke-width="1.4" opacity="0.8" fill="none"/>

            <!-- 8. Realistic Cut Wire Tips at (45, 124) and (115, 124) -->
            <!-- Left Tip (pin1) at (45, 124) -->
            <ellipse cx="45" cy="123" rx="4.8" ry="3.2" fill="url(#ind-lead-silver-${comp.id})" stroke="#64748b" stroke-width="0.8"/>
            <ellipse cx="45" cy="123" rx="2.8" ry="1.8" fill="#ea580c"/>
            <circle cx="45" cy="124" r="7.5" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.85"/>
            <text x="45" y="127" fill="#f59e0b" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">1</text>

            <!-- Right Tip (pin2) at (115, 124) -->
            <ellipse cx="115" cy="123" rx="4.8" ry="3.2" fill="url(#ind-lead-silver-${comp.id})" stroke="#64748b" stroke-width="0.8"/>
            <ellipse cx="115" cy="123" rx="2.8" ry="1.8" fill="#ea580c"/>
            <circle cx="115" cy="124" r="7.5" fill="none" stroke="#0284c7" stroke-width="1.5" opacity="0.85"/>
            <text x="115" y="127" fill="#0284c7" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">2</text>

            <!-- 9. Schematic Symbol & Electrical Specifications Placard (Matching "with symbol" request) -->
            <g class="inductor-symbol-badge" transform="translate(42, 6)">
              <rect x="0" y="0" width="76" height="18" rx="4" fill="rgba(15, 23, 42, 0.94)" stroke="rgba(245, 158, 11, 0.65)" stroke-width="1"/>
              <!-- Schematic 4-loop inductor symbol with ferrite core double lines -->
              <g transform="translate(6, 4)">
                <!-- Ferrite Core Lines -->
                <line x1="2" y1="2" x2="24" y2="2" stroke="#94a3b8" stroke-width="1.0"/>
                <line x1="2" y1="3.5" x2="24" y2="3.5" stroke="#94a3b8" stroke-width="1.0"/>
                <!-- 4 Induction Coils -->
                <path d="M 2 8 A 2.6 3 0 0 1 7.5 8 A 2.6 3 0 0 1 13 8 A 2.6 3 0 0 1 18.5 8 A 2.6 3 0 0 1 24 8" 
                      fill="none" stroke="#fbbf24" stroke-width="1.4" stroke-linecap="round"/>
              </g>
              <!-- L Value Label -->
              <text x="50" y="12.5" fill="#fde68a" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">
                ${formatInductance(indMh)}
              </text>
            </g>

            <!-- 10. Live Physics Telemetry Status Bar -->
            <g transform="translate(24, 94)">
              <rect x="0" y="0" width="112" height="13" rx="3.5" fill="rgba(10, 15, 25, 0.92)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="0.8"/>
              <text x="56" y="9.2" fill="${isPowered ? '#fbbf24' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="6.8" font-weight="800" text-anchor="middle">
                ${isPowered ? `I: ${curA.toFixed(2)}A • E: ${(energyJ * 1000).toFixed(1)}mJ • X_L: ${xl.toFixed(1)}Ω` : `DCR: ${dcr.toFixed(2)}Ω • I_sat: ${(state.isat || 3.5).toFixed(1)}A`}
              </text>
            </g>

            <!-- 10b. Flyback Diode Protection / Kickback Spike Badge -->
            ${state.flybackProtected ? `
              <g transform="translate(24, 79)">
                <rect x="0" y="0" width="112" height="12" rx="3" fill="rgba(69, 26, 3, 0.92)" stroke="#f59e0b" stroke-width="0.8"/>
                <text x="56" y="8.8" fill="#fde68a" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="900" text-anchor="middle">
                  🛡️ FLYBACK PROTECTED (${state.flybackType === 'diode' ? '0.7V CLAMP' : 'SNUBBED'})
                </text>
              </g>
            ` : (state.kickbackVoltage > 0 ? `
              <g transform="translate(24, 79)">
                <rect x="0" y="0" width="112" height="12" rx="3" fill="rgba(127, 29, 29, 0.92)" stroke="#ef4444" stroke-width="0.8"/>
                <text x="56" y="8.8" fill="#fecaca" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="900" text-anchor="middle">
                  ⚡ KICKBACK SPIKE: ${state.kickbackVoltage}V
                </text>
              </g>
            ` : '')}

            <!-- 11. Burnt Rupture & Charred Coils -->
            ${isBurnt ? `
              <rect x="20" y="24" width="120" height="74" rx="6" fill="#000000" opacity="0.85" filter="blur(4px)"/>
              <path d="M 40 40 L 70 65 L 100 50 L 130 75" stroke="#ef4444" stroke-width="2" fill="none"/>
              <text x="80" y="66" font-size="22" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 24. PRECISION AMMETER (CURRENT MEASUREMENT WITH AC/DC SELECTOR)
      case 'ammeter': {
        const isBurnt = state.burnt || state.fuseBlown;
        const isBurning = state.burning;
        const isCrying = state.crying || isBurning;
        const isPowered = state.powered && !isBurnt && !isBurning;
        const mode = (state.mode || 'dc').toLowerCase();
        const isACMode = mode === 'ac';
        const curA = Math.abs(state.measuredCurrent !== undefined ? state.measuredCurrent : (state.current || 0));
        const readingStr = state.reading || (curA >= 1 ? (isACMode ? '~ ' : '') + curA.toFixed(3) + ' A' : (isACMode ? '~ ' : '') + (curA * 1000).toFixed(1) + ' mA');

        // Needle deflection: -45° at 0A up to +45° at 5A
        // In reverse DC, needle pegs slightly below zero (-48°)
        let needleAngle = -45;
        if (isPowered && !isBurnt) {
          if (!isACMode && state.reversed) {
            needleAngle = -48; // Reverse polarity peg
          } else {
            needleAngle = -45 + Math.min(90, Math.max(0, (curA / 5.0) * 90));
          }
        }

        content = `
          <g class="comp-ammeter ${isPowered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <!-- Drop Shadow -->
            <rect x="18" y="16" width="104" height="100" rx="8" fill="#000000" opacity="0.4" filter="blur(5px)"/>
            <!-- Meter Outer Body Case -->
            <rect x="15" y="12" width="110" height="106" rx="8" fill="#18181b" stroke="${isACMode ? '#f59e0b' : '#0284c7'}" stroke-width="1.6"/>
            <!-- Dial Well Inner Window -->
            <rect x="20" y="16" width="100" height="88" rx="6" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
            
            <!-- Top Title Bar -->
            <text x="70" y="25" fill="${isACMode ? '#f59e0b' : '#38bdf8'}" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="900" text-anchor="middle" letter-spacing="1">
              ${isACMode ? '⚡ AC AMMETER (~ RMS)' : '🔋 DC AMMETER (⎓ DIRECT)'}
            </text>

            <!-- Analog Scale Arc and Calibrated Ticks -->
            <path d="M 34 52 A 38 38 0 0 1 106 52" fill="none" stroke="#334155" stroke-width="3"/>
            <path d="M 34 52 A 38 38 0 0 1 106 52" fill="none" stroke="${isACMode ? '#f59e0b' : '#38bdf8'}" stroke-width="1.5" stroke-dasharray="2, 5"/>
            <text x="34" y="60" fill="#64748b" font-size="6" font-weight="800">0</text>
            <text x="50" y="47" fill="#64748b" font-size="5.5" font-weight="800">1A</text>
            <text x="70" y="41" fill="#64748b" font-size="6" font-weight="800">2.5A</text>
            <text x="90" y="47" fill="#64748b" font-size="5.5" font-weight="800">4A</text>
            <text x="106" y="60" fill="#64748b" font-size="6" font-weight="800">5A</text>
            
            <!-- Analog Needle & Pivot Hub -->
            <line x1="70" y1="54" x2="70" y2="28" stroke="#ef4444" stroke-width="2" stroke-linecap="round" transform="rotate(${needleAngle}, 70, 54)"/>
            <circle cx="70" cy="54" r="3.8" fill="#334155" stroke="#94a3b8" stroke-width="1"/>

            <!-- Digital LCD Display Window -->
            <rect x="24" y="63" width="92" height="21" rx="3.5" fill="#030712" stroke="#374151" stroke-width="1"/>
            <text x="29" y="71" fill="${isACMode ? '#fbbf24' : '#38bdf8'}" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="900">
              ${isACMode ? 'AC ~' : (state.reversed ? 'DC ⎓ REV' : 'DC ⎓')}
            </text>
            <text x="70" y="79" fill="${isBurnt ? '#ef4444' : (isACMode ? '#fbbf24' : '#38bdf8')}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="0.5">
              ${isBurnt ? 'FUSE BLOWN' : readingStr}
            </text>

            <!-- Interactive AC / DC Mode Selector Button on Meter Panel -->
            <g class="ammeter-mode-btn" style="cursor: pointer;" transform="translate(36, 88)">
              <rect x="0" y="0" width="68" height="13" rx="3" fill="#0f172a" stroke="${isACMode ? '#f59e0b' : '#0284c7'}" stroke-width="1.1"/>
              <!-- Left DC Half -->
              <rect x="1" y="1" width="33" height="11" rx="2" fill="${!isACMode ? '#0284c7' : 'transparent'}"/>
              <text x="17.5" y="9" fill="${!isACMode ? '#ffffff' : '#64748b'}" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">DC ⎓</text>
              <!-- Right AC Half -->
              <rect x="34" y="1" width="33" height="11" rx="2" fill="${isACMode ? '#f59e0b' : 'transparent'}"/>
              <text x="50.5" y="9" fill="${isACMode ? '#ffffff' : '#64748b'}" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">AC ~</text>
            </g>

            <!-- Terminal Binding Posts (Altered Y and Styling) -->
            <!-- Positive (+) In Red Post at (40, 116) -->
            <circle cx="40" cy="116" r="8" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.2"/>
            <circle cx="40" cy="116" r="4.5" fill="#f87171"/>
            <text x="40" y="119" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">+</text>

            <!-- Negative (−) Out Black Post at (100, 116) -->
            <circle cx="100" cy="116" r="8" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
            <circle cx="100" cy="116" r="4.5" fill="#334155"/>
            <text x="100" y="119" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">−</text>

            <!-- Blown Fuse / Overcurrent Char Overlay -->
            ${isBurnt ? `
              <rect x="15" y="12" width="110" height="106" rx="8" fill="#000000" opacity="0.88" filter="blur(2px)"/>
              <rect x="20" y="42" width="100" height="42" rx="4" fill="rgba(127, 29, 29, 0.95)" stroke="#ef4444" stroke-width="1.2"/>
              <text x="70" y="58" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="8.8" font-weight="900" text-anchor="middle">💥 10A FUSE BLOWN!</text>
              <text x="70" y="70" fill="#fecaca" font-family="'Outfit', sans-serif" font-size="6.5" font-weight="700" text-anchor="middle">PARALLEL SHORT HAZARD</text>
              <text x="70" y="78" fill="#fde68a" font-family="'Outfit', sans-serif" font-size="5.8" font-weight="800" text-anchor="middle">CLICK REPAIR TO REPLACE FUSE</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 25. PRECISION VOLTMETER (VOLTAGE MEASUREMENT)
      case 'voltmeter': {
        const isPowered = state.powered && !isBurnt && !isBurning;
        const voltV = Math.abs(state.measuredVoltage !== undefined ? state.measuredVoltage : (state.voltageDrop || 0));
        const readingStr = voltV.toFixed(2) + ' V';
        const needleAngle = -45 + Math.min(90, (voltV / 50.0) * 90);

        content = `
          <g class="comp-voltmeter ${isPowered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <rect x="18" y="16" width="104" height="100" rx="8" fill="#000000" opacity="0.4" filter="blur(5px)"/>
            <rect x="15" y="12" width="110" height="106" rx="8" fill="#18181b" stroke="#374151" stroke-width="1.6"/>
            <rect x="20" y="16" width="100" height="88" rx="6" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
            
            <text x="70" y="27" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="8" font-weight="900" text-anchor="middle" letter-spacing="1">DC VOLTMETER</text>

            <path d="M 34 56 A 38 38 0 0 1 106 56" fill="none" stroke="#334155" stroke-width="3"/>
            <path d="M 34 56 A 38 38 0 0 1 106 56" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="2, 5"/>
            <text x="34" y="64" fill="#64748b" font-size="6" font-weight="800">0</text>
            <text x="68" y="44" fill="#64748b" font-size="6" font-weight="800">25V</text>
            <text x="102" y="64" fill="#64748b" font-size="6" font-weight="800">50V</text>
            
            <line x1="70" y1="58" x2="70" y2="30" stroke="#ef4444" stroke-width="2" stroke-linecap="round" transform="rotate(${needleAngle}, 70, 58)"/>
            <circle cx="70" cy="58" r="4" fill="#334155" stroke="#94a3b8" stroke-width="1"/>

            <rect x="28" y="70" width="84" height="24" rx="4" fill="#030712" stroke="#374151" stroke-width="1"/>
            <text x="70" y="87" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">${readingStr}</text>

            <circle cx="40" cy="116" r="8" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.2"/>
            <circle cx="40" cy="116" r="4.5" fill="#f87171"/>
            <text x="40" y="119" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">+</text>

            <circle cx="100" cy="116" r="8" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
            <circle cx="100" cy="116" r="4.5" fill="#334155"/>
            <text x="100" y="119" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="9" font-weight="900" text-anchor="middle">−</text>

            ${isBurnt ? `
              <rect x="15" y="12" width="110" height="106" rx="8" fill="#000000" opacity="0.8" filter="blur(3px)"/>
              <text x="70" y="66" font-size="20" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 26. DIGITAL WATTMETER (ACTIVE POWER MEASUREMENT)
      case 'wattmeter': {
        const isPowered = state.powered && !isBurnt && !isBurning;
        const w = Math.abs(state.power || 0);
        const v = Math.abs(state.voltage || 0);
        const i = Math.abs(state.current || 0);
        const wStr = w >= 1 ? w.toFixed(2) + ' W' : (w * 1000).toFixed(1) + ' mW';
        const vStr = v.toFixed(1) + 'V';
        const iStr = i >= 1 ? i.toFixed(2) + 'A' : (i * 1000).toFixed(0) + 'mA';

        content = `
          <g class="comp-wattmeter ${isPowered ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <rect x="22" y="18" width="116" height="110" rx="8" fill="#000000" opacity="0.4" filter="blur(5px)"/>
            <rect x="18" y="14" width="124" height="116" rx="8" fill="#18181b" stroke="#374151" stroke-width="1.6"/>
            <rect x="42" y="22" width="76" height="80" rx="5" fill="#030712" stroke="#334155" stroke-width="1"/>
            
            <text x="80" y="34" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="900" text-anchor="middle" letter-spacing="1">POWER (WATTS)</text>
            <text x="80" y="56" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" text-anchor="middle">${wStr}</text>
            
            <line x1="48" y1="65" x2="112" y2="65" stroke="#1f2937" stroke-width="1"/>
            <text x="80" y="78" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="800" text-anchor="middle">VOLTS: ${vStr}</text>
            <text x="80" y="92" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="800" text-anchor="middle">AMPS: ${iStr}</text>

            <text x="30" y="28" fill="#64748b" font-size="6.5" font-weight="800" text-anchor="middle">IN</text>
            <circle cx="30" cy="40" r="7.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.2"/>
            <text x="30" y="43" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">+</text>

            <circle cx="30" cy="110" r="7.5" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
            <text x="30" y="113" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">−</text>

            <text x="130" y="28" fill="#64748b" font-size="6.5" font-weight="800" text-anchor="middle">OUT</text>
            <circle cx="130" cy="40" r="7.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.2"/>
            <text x="130" y="43" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">+</text>

            <circle cx="130" cy="110" r="7.5" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
            <text x="130" y="113" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">−</text>

            ${isBurnt ? `
              <rect x="18" y="14" width="124" height="116" rx="8" fill="#000000" opacity="0.8" filter="blur(3px)"/>
              <text x="80" y="70" font-size="20" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 27. PRECISION REGULATED DC POWER SUPPLY (0-50V DC, 0-5A)
      case 'power_supply': {
        const outOn = state.outputEnabled !== false && !isBurnt && !isBurning;
        const vSet = state.voltage !== undefined ? state.voltage : 12.0;
        const iLimit = state.currentLimit !== undefined ? state.currentLimit : 2.50;
        const curI = state.actualCurrent !== undefined ? state.actualCurrent : (state.current || 0);
        const mode = state.mode || ((outOn && curI >= (iLimit - 0.001) && iLimit > 0) ? 'cc' : 'cv');
        const actV = state.actualVoltage !== undefined ? state.actualVoltage : (mode === 'cc' ? 0 : vSet);
        const vDisp = outOn ? actV.toFixed(2) : '0.00';
        const iDisp = outOn ? curI.toFixed(3) : '0.000';

        // Calculate knob pointer angles (-135 deg to +135 deg)
        const vAngleRad = ((Math.min(50, Math.max(0, vSet)) / 50.0) * 270.0 - 135.0) * (Math.PI / 180.0);
        const vKnobX = (44 + 8.5 * Math.cos(vAngleRad)).toFixed(1);
        const vKnobY = (116 + 8.5 * Math.sin(vAngleRad)).toFixed(1);

        const iAngleRad = ((Math.min(5.0, Math.max(0.01, iLimit)) / 5.0) * 270.0 - 135.0) * (Math.PI / 180.0);
        const iKnobX = (85 + 8.5 * Math.cos(iAngleRad)).toFixed(1);
        const iKnobY = (116 + 8.5 * Math.sin(iAngleRad)).toFixed(1);

        content = `
          <g class="comp-power-supply ${outOn ? 'powered' : ''} ${isCrying ? 'character-crying-shake' : ''}">
            <rect x="18" y="16" width="138" height="152" rx="8" fill="#000000" opacity="0.45" filter="blur(6px)"/>
            <rect x="14" y="12" width="142" height="156" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
            
            <line x1="18" y1="36" x2="18" y2="120" stroke="#0f172a" stroke-width="2"/>
            <line x1="152" y1="36" x2="152" y2="120" stroke="#0f172a" stroke-width="2"/>

            <text x="85" y="26" fill="#cbd5e1" font-family="'Outfit', sans-serif" font-size="8.2" font-weight="900" text-anchor="middle" letter-spacing="1">DC POWER SUPPLY</text>

            <!-- Voltage Display -->
            <rect x="25" y="32" width="92" height="26" rx="4" fill="#030712" stroke="#374151" stroke-width="1"/>
            <text x="71" y="50" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" text-anchor="middle">${vDisp} V</text>
            <circle cx="130" cy="45" r="3.5" fill="${outOn && mode === 'cv' ? '#fbbf24' : '#064e3b'}" stroke="#16a34a" stroke-width="0.8" ${outOn && mode === 'cv' ? '' : ''}/>
            <text x="143" y="47.5" fill="${outOn && mode === 'cv' ? '#fbbf24' : '#64748b'}" font-size="7" font-weight="900">CV</text>

            <!-- Current Display -->
            <rect x="25" y="64" width="92" height="26" rx="4" fill="#030712" stroke="#374151" stroke-width="1"/>
            <text x="71" y="82" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="900" text-anchor="middle">${iDisp} A</text>
            <circle cx="130" cy="77" r="3.5" fill="${outOn && mode === 'cc' ? '#ef4444' : '#450a0a'}" stroke="#dc2626" stroke-width="0.8" ${outOn && mode === 'cc' ? '' : ''}/>
            <text x="143" y="79.5" fill="${outOn && mode === 'cc' ? '#f87171' : '#64748b'}" font-size="7" font-weight="900">CC</text>

            <!-- Control Knobs -->
            <g class="ps-volt-knob" style="cursor: pointer;" title="Voltage Knob: Click to cycle standard voltages (1.8V, 3.3V, 5V, 9V, 12V, 24V, 48V)">
              <circle cx="44" cy="116" r="13" fill="#334155" stroke="#64748b" stroke-width="1.2"/>
              <circle cx="44" cy="116" r="10" fill="#1e293b"/>
              <line x1="44" y1="116" x2="${vKnobX}" y2="${vKnobY}" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round"/>
              <text x="44" y="137" fill="#94a3b8" font-size="6.5" font-weight="800" text-anchor="middle">VOLT</text>
            </g>

            <g class="ps-curr-knob" style="cursor: pointer;" title="Current Limit Knob: Click to cycle standard current limits (20mA, 50mA, 100mA, 500mA, 1A, 2.5A, 5A)">
              <circle cx="85" cy="116" r="13" fill="#334155" stroke="#64748b" stroke-width="1.2"/>
              <circle cx="85" cy="116" r="10" fill="#1e293b"/>
              <line x1="85" y1="116" x2="${iKnobX}" y2="${iKnobY}" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round"/>
              <text x="85" y="137" fill="#94a3b8" font-size="6.5" font-weight="800" text-anchor="middle">CURRENT</text>
            </g>

            <!-- Output ON/OFF button -->
            <g class="ps-output-btn" style="cursor: pointer;" title="Master Output Switch: Click to Energize / De-energize Terminals">
              <rect x="115" y="106" width="34" height="20" rx="4" fill="${outOn ? '#78350f' : '#450a0a'}" stroke="${outOn ? '#f59e0b' : '#ef4444'}" stroke-width="1.4"/>
              <circle cx="122" cy="116" r="2.5" fill="${outOn ? '#fbbf24' : '#ef4444'}"/>
              <text x="135" y="119" fill="#ffffff" font-size="7" font-weight="900" text-anchor="middle">${outOn ? 'ON' : 'OFF'}</text>
            </g>

            <!-- 3 Banana Binding Posts at bottom: Red (+) at (40, 160), Green (GND) at (85, 160), Black (-) at (130, 160) -->
            <circle cx="40" cy="160" r="8" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.2"/>
            <circle cx="40" cy="160" r="4.5" fill="#f87171"/>
            <text x="40" y="163" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">+</text>

            <circle cx="85" cy="160" r="8" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>
            <circle cx="85" cy="160" r="4.5" fill="#fbbf24"/>
            <text x="85" y="163" fill="#ffffff" font-size="7" font-weight="900" text-anchor="middle">⏚</text>

            <circle cx="130" cy="160" r="8" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
            <circle cx="130" cy="160" r="4.5" fill="#334155"/>
            <text x="130" y="163" fill="#ffffff" font-size="9" font-weight="900" text-anchor="middle">−</text>

            ${isBurnt ? `
              <rect x="14" y="12" width="142" height="156" rx="8" fill="#000000" opacity="0.8" filter="blur(3px)"/>
              <text x="85" y="90" font-size="24" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 28. PROTECTIVE GLASS CARTRIDGE FUSE (ADJUSTABLE RATING)
      case 'fuse': {
        const isBlown = state.blown || isBurnt || isBurning;
        const rating = state.ratingAmps !== undefined ? state.ratingAmps : (state.rating !== undefined ? state.rating : 2.0);
        const curA = Math.abs(state.current || 0);
        const curRatio = Math.min(1.0, curA / Math.max(0.1, rating));
        const isWarm = !isBlown && curRatio > 0.8;
        const wireColor = isWarm ? '#f59e0b' : '#94a3b8';
        const wireGlow = isWarm ? '' : '';

        content = `
          <g class="comp-fuse ${isBlown ? 'blown' : (state.powered ? 'powered' : '')}">
            <!-- Drop Shadow for glass body and end caps -->
            <rect x="22" y="21" width="96" height="30" rx="6" fill="#000000" opacity="0.35" filter="blur(4px)"/>

            <!-- Transparent Glass Tube Body -->
            <rect x="34" y="19" width="72" height="32" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1.2"/>
            <rect x="35" y="20" width="70" height="30" rx="3.5" fill="rgba(186, 230, 253, 0.12)"/>
            
            <!-- Interior Chamber Glow & Fuse Wire Element -->
            ${!isBlown ? `
              <!-- Intact Solder Anchors at Caps -->
              <circle cx="36" cy="35" r="3.2" fill="#cbd5e1"/>
              <circle cx="104" cy="35" r="3.2" fill="#cbd5e1"/>
              
              <!-- Delicate Fuse Filament Wire with natural mechanical curve -->
              <path d="M 36 35 Q 52 30, 70 35 T 104 35" fill="none" stroke="${wireColor}" stroke-width="${Math.max(1.2, Math.min(2.8, 0.8 + rating * 0.25))}" stroke-linecap="round"/>
              ${isWarm ? `
                <!-- Overheating thermal glow pulse -->
                <path d="M 36 35 Q 52 30, 70 35 T 104 35" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" opacity="0.5" filter="blur(2px)"/>
              ` : ''}
            ` : `
              <!-- Blown Fuse: Melted wire beads with gap in middle -->
              <path d="M 36 35 Q 44 32, 50 28" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="50" cy="28" r="2.8" fill="#1e293b" stroke="#78350f" stroke-width="0.8"/>
              
              <path d="M 104 35 Q 96 38, 90 42" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="90" cy="42" r="2.8" fill="#1e293b" stroke="#78350f" stroke-width="0.8"/>
              
              <!-- Vaporized metallic soot / smoke smudge on glass tube -->
              <ellipse cx="70" cy="35" rx="20" ry="12" fill="#000000" opacity="0.75" filter="blur(4px)"/>
              <ellipse cx="70" cy="35" rx="12" ry="7" fill="#451a03" opacity="0.5" filter="blur(2px)"/>
              <text x="70" y="38" font-size="12" text-anchor="middle">💥</text>
            `}

            <!-- Top Specular Glass Reflection Sheen -->
            <rect x="36" y="21" width="68" height="5" rx="2" fill="#ffffff" opacity="0.45"/>
            <line x1="38" y1="23.5" x2="102" y2="23.5" stroke="#ffffff" stroke-width="1" opacity="0.8" stroke-linecap="round"/>
            <rect x="38" y="44" width="64" height="3" rx="1.5" fill="#38bdf8" opacity="0.15"/>

            <!-- Left Nickel Ferrule / Contact Cap -->
            <rect x="18" y="16" width="20" height="38" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1.2"/>
            <rect x="20" y="18" width="16" height="34" rx="2" fill="#94a3b8"/>
            <line x1="24" y1="18" x2="24" y2="52" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
            <line x1="32" y1="18" x2="32" y2="52" stroke="#334155" stroke-width="1" opacity="0.5"/>
            <text x="28" y="38" fill="#1e293b" font-family="'Outfit', sans-serif" font-size="6" font-weight="900" text-anchor="middle" transform="rotate(-90 28 38)">250V</text>

            <!-- Right Nickel Ferrule / Contact Cap with Rating Stamp -->
            <rect x="102" y="16" width="20" height="38" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="1.2"/>
            <rect x="104" y="18" width="16" height="34" rx="2" fill="#94a3b8"/>
            <line x1="108" y1="18" x2="108" y2="52" stroke="#ffffff" stroke-width="1.2" opacity="0.7"/>
            <line x1="116" y1="18" x2="116" y2="52" stroke="#334155" stroke-width="1" opacity="0.5"/>
            <text x="112" y="38" fill="#1e293b" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="middle" transform="rotate(90 112 38)">F${rating.toFixed(1)}A</text>

            <!-- Terminal connection dots -->
            <circle cx="18" cy="35" r="5" fill="#64748b" stroke="#334155" stroke-width="1"/>
            <circle cx="18" cy="35" r="2.5" fill="#f8fafc"/>
            <circle cx="122" cy="35" r="5" fill="#64748b" stroke="#334155" stroke-width="1"/>
            <circle cx="122" cy="35" r="2.5" fill="#f8fafc"/>

            <!-- Center Specification Label Stamp -->
            <text x="70" y="46" fill="${isBlown ? '#ef4444' : '#64748b'}" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle" letter-spacing="0.5">
              ${isBlown ? 'BLOWN' : `${rating.toFixed(1)}A FAST`}
            </text>
          </g>
        `;
        break;
      }

      // 29. BENCHTOP PRECISION FUNCTION & ARBITRARY WAVEFORM GENERATOR
      case 'function_generator': {
        const outOn = state.outputEnabled !== false;
        const wave = state.waveform || 'sine';
        const freq = state.frequency !== undefined ? state.frequency : 1000.0;
        const vpp = state.amplitudeVpp !== undefined ? state.amplitudeVpp : 10.0;
        const offset = state.dcOffset !== undefined ? state.dcOffset : (state.offsetVoltage || 0.0);
        const duty = state.dutyCycle !== undefined ? state.dutyCycle : 50;
        const isPowered = state.powered !== false && !isBurnt && !isBurning;
        const isWarm = isPowered && outOn;
        const isHiZ = state.outputImpedance === 'high_z' || state.outputImpedance === 'highz';
        const impStr = isHiZ ? 'Hi-Z' : '50 Ω';

        let freqDisp = `${freq.toFixed(0)} Hz`;
        if (freq >= 1000) {
          freqDisp = `${(freq / 1000).toFixed(1)} kHz`;
        }
        const vppDisp = `${vpp.toFixed(1)} Vpp`;

        let wavePath = '';
        let waveColor = '#38bdf8';
        if (state.modulation && state.modulation !== 'none') {
          const mod = state.modulation;
          waveColor = '#c084fc';
          if (mod === 'am') {
            wavePath = `<path d="M 32 60 Q 40 48, 48 54 Q 56 60, 64 60 Q 72 60, 80 54 Q 88 48, 96 60 Q 104 72, 112 66 Q 120 60, 128 60" fill="none" stroke="${outOn ? '#c084fc' : '#64748b'}" stroke-width="2.2" stroke-linecap="round"/>`;
            wavePath += `<text x="80" y="47" fill="#c084fc" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="800" text-anchor="middle">AM ${state.amDepth || 50}%</text>`;
          } else if (mod === 'fm') {
            wavePath = `<path d="M 32 60 C 38 48, 42 48, 46 60 C 50 72, 54 72, 58 60 C 64 48, 70 48, 76 60 C 84 72, 92 72, 100 60 C 112 48, 120 72, 128 60" fill="none" stroke="${outOn ? '#c084fc' : '#64748b'}" stroke-width="2" stroke-linecap="round"/>`;
            wavePath += `<text x="80" y="47" fill="#c084fc" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="800" text-anchor="middle">FM DEV ±${state.fmDev || 200}Hz</text>`;
          } else if (mod === 'sweep') {
            wavePath = `<path d="M 32 60 Q 42 45, 52 60 Q 60 75, 68 60 Q 74 48, 80 60 Q 85 72, 90 60 Q 94 50, 98 60 Q 102 70, 106 60 Q 110 52, 114 60 Q 118 68, 122 60 L 128 60" fill="none" stroke="${outOn ? '#c084fc' : '#64748b'}" stroke-width="1.8" stroke-linecap="round"/>`;
            wavePath += `<text x="80" y="47" fill="#c084fc" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="800" text-anchor="middle">SWEEP ${state.sweepStart || 100}-${state.sweepStop || 10000}Hz</text>`;
          } else if (mod === 'burst') {
            wavePath = `<path d="M 32 60 C 38 48, 42 48, 46 60 C 50 72, 54 72, 58 60 C 62 48, 66 48, 70 60 L 128 60" fill="none" stroke="${outOn ? '#c084fc' : '#64748b'}" stroke-width="2" stroke-linecap="round"/>`;
            wavePath += `<text x="80" y="47" fill="#c084fc" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="800" text-anchor="middle">BURST ${state.burstCycles || 3}-CYC</text>`;
          }
        } else if (wave === 'sine') {
          waveColor = '#38bdf8';
          wavePath = `<path d="M 32 60 C 44 44, 52 44, 64 60 C 76 76, 84 76, 96 60 C 108 44, 116 44, 128 60" fill="none" stroke="${outOn ? '#38bdf8' : '#64748b'}" stroke-width="2.2" stroke-linecap="round"/>`;
        } else if (wave === 'square' || wave === 'pulse') {
          waveColor = '#fbbf24';
          const dutyRatio = Math.max(0.05, Math.min(0.95, duty / 100));
          const cycleW = 48;
          const wHi = Math.max(3, Math.min(45, cycleW * dutyRatio));
          const x0 = 32;
          const x1 = x0 + wHi;
          const x2 = x0 + cycleW;
          const x3 = x2 + wHi;
          const x4 = x2 + cycleW;
          wavePath = `<path d="M ${x0} 68 L ${x0} 52 L ${x1.toFixed(1)} 52 L ${x1.toFixed(1)} 68 L ${x2.toFixed(1)} 68 L ${x2.toFixed(1)} 52 L ${x3.toFixed(1)} 52 L ${x3.toFixed(1)} 68 L ${x4} 68" fill="none" stroke="${outOn ? '#fbbf24' : '#64748b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
          if (duty !== 50 || wave === 'pulse') {
            wavePath += `<text x="80" y="47" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="800" text-anchor="middle">${wave === 'pulse' ? 'PULSE' : 'DUTY'} ${duty}%</text>`;
          }
        } else if (wave === 'triangle') {
          waveColor = '#fbbf24';
          wavePath = `<path d="M 32 68 L 48 52 L 64 68 L 80 52 L 96 68 L 112 52 L 128 68" fill="none" stroke="${outOn ? '#fbbf24' : '#64748b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
        } else if (wave === 'ramp') {
          waveColor = '#f472b6';
          wavePath = `<path d="M 32 68 L 56 52 L 56 68 L 80 52 L 80 68 L 104 52 L 104 68 L 128 52" fill="none" stroke="${outOn ? '#f472b6' : '#64748b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
        } else if (wave === 'sawtooth') {
          waveColor = '#f472b6';
          wavePath = `<path d="M 32 52 L 56 68 L 56 52 L 80 68 L 80 52 L 104 68 L 104 52 L 128 68" fill="none" stroke="${outOn ? '#f472b6' : '#64748b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
        } else if (wave === 'noise') {
          waveColor = '#ec4899';
          wavePath = `<path d="M 32 60 L 36 54 L 40 65 L 44 51 L 48 68 L 52 56 L 56 62 L 60 50 L 64 67 L 68 53 L 72 63 L 76 57 L 80 69 L 84 52 L 88 64 L 92 58 L 96 66 L 100 53 L 104 64 L 108 51 L 112 67 L 116 55 L 120 62 L 124 54 L 128 60" fill="none" stroke="${outOn ? '#ec4899' : '#64748b'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
        } else if (wave === 'cardiac' || wave === 'ecg') {
          waveColor = '#ef4444';
          wavePath = `<path d="M 32 60 L 44 60 Q 48 56, 52 60 L 58 60 L 61 63 L 64 45 L 68 70 L 71 60 L 76 60 Q 82 54, 88 60 L 100 60 L 106 63 L 109 45 L 113 70 L 116 60 L 128 60" fill="none" stroke="${outOn ? '#ef4444' : '#64748b'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
        } else {
          // dc
          waveColor = '#a78bfa';
          const yPos = Math.max(45, Math.min(75, 60 - offset * 1.5));
          wavePath = `<line x1="32" y1="${yPos}" x2="128" y2="${yPos}" stroke="${outOn ? '#a78bfa' : '#64748b'}" stroke-width="2.5" stroke-linecap="round"/>`;
          wavePath += `<text x="80" y="48" fill="#a78bfa" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="800" text-anchor="middle">${offset >= 0 ? '+' : ''}${offset.toFixed(1)}V DC</text>`;
        }

        const knobAngle = ((Math.log10(Math.max(1, freq)) / 5) * 270 - 135) * (Math.PI / 180);
        const knobX = (162 + Math.cos(knobAngle) * 9).toFixed(1);
        const knobY = (52 + Math.sin(knobAngle) * 9).toFixed(1);

        content = `
          <g class="comp-function-generator ${isWarm ? 'powered' : ''}">
            <defs>
              <pattern id="fg-grid-${comp.id}" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(56, 189, 248, 0.12)" stroke-width="0.5"/>
              </pattern>
              <linearGradient id="fg-chassis-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#334155"/>
                <stop offset="25%" stop-color="#1e293b"/>
                <stop offset="85%" stop-color="#0f172a"/>
                <stop offset="100%" stop-color="#020617"/>
              </linearGradient>
              <radialGradient id="fg-knob-${comp.id}" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#94a3b8"/>
                <stop offset="60%" stop-color="#334155"/>
                <stop offset="100%" stop-color="#0f172a"/>
              </radialGradient>
            </defs>

            <!-- Drop shadow -->
            <rect x="8" y="10" width="194" height="148" rx="8" fill="#000000" opacity="0.4" filter="blur(5px)"/>

            <!-- Main Chassis -->
            <rect x="8" y="8" width="194" height="146" rx="8" fill="url(#fg-chassis-${comp.id})" stroke="#475569" stroke-width="1.4"/>

            <!-- Top Handle Bar -->
            <rect x="65" y="4" width="80" height="5" rx="2.5" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
            <rect x="75" y="4.5" width="60" height="2" fill="#475569"/>

            <!-- Rubber Side Bumpers -->
            <path d="M 8 16 Q 8 8, 16 8 L 22 8 L 22 154 L 16 154 Q 8 154, 8 146 Z" fill="#090d16" stroke="#334155" stroke-width="0.8"/>
            <path d="M 188 8 L 194 8 Q 202 8, 202 16 L 202 146 Q 202 154, 194 154 L 188 154 Z" fill="#090d16" stroke="#334155" stroke-width="0.8"/>

            <!-- Instrument Header Banner -->
            <rect x="26" y="13" width="158" height="13" rx="2" fill="rgba(15, 23, 42, 0.6)"/>
            <text x="32" y="22.5" fill="#38bdf8" font-family="'Outfit', sans-serif" font-size="7.5" font-weight="900" letter-spacing="0.5">SIG-GEN 2000</text>
            <text x="180" y="22.5" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="800" text-anchor="end">100kHz AWG</text>

            <!-- Digital Color Backlit LCD Screen -->
            <rect x="26" y="29" width="108" height="68" rx="4" fill="#030712" stroke="#38bdf8" stroke-width="1.2"/>
            <rect x="27" y="30" width="106" height="66" rx="3" fill="url(#fg-grid-${comp.id})"/>

            <!-- Screen Header Tags -->
            <rect x="29" y="32" width="58" height="10" rx="2" fill="#0c4a6e" stroke="#0284c7" stroke-width="0.6"/>
            <text x="58" y="39.5" fill="${waveColor}" font-family="'JetBrains Mono', monospace" font-size="5.2" font-weight="900" text-anchor="middle">${wave.toUpperCase()}${state.modulation && state.modulation !== 'none' ? `·${state.modulation.toUpperCase()}` : ''}</text>

            <rect x="94" y="32" width="37" height="10" rx="2" fill="${outOn ? '#78350f' : '#450a0a'}" stroke="${outOn ? '#f59e0b' : '#ef4444'}" stroke-width="0.6"/>
            <text x="112.5" y="39.5" fill="${outOn ? '#fbbf24' : '#f87171'}" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="middle">${outOn ? '● OUT ON' : '○ OFF'}</text>

            <!-- Waveform Graph Plot Area -->
            ${wavePath}

            <!-- Frequency & Amplitude Readouts on Screen -->
            <rect x="29" y="78" width="50" height="16" rx="2" fill="#0f172a" stroke="#1e293b" stroke-width="0.6"/>
            <text x="32" y="85" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="4.8" font-weight="800">FREQ</text>
            <text x="76" y="90" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="900" text-anchor="end">${freqDisp}</text>

            <g class="fg-ampl-readout" style="cursor: pointer;" title="Amplitude: Click to cycle presets (0.5V to 20Vpp)">
              <rect x="82" y="78" width="49" height="16" rx="2" fill="#0f172a" stroke="#1e293b" stroke-width="0.6"/>
              <text x="85" y="85" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="4.8" font-weight="800">AMPL</text>
              <text x="128" y="90" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="900" text-anchor="end">${vppDisp}</text>
            </g>

            <!-- Rotary Adjustment Knob -->
            <g class="fg-freq-knob" style="cursor: pointer;" title="Frequency Knob: Click to cycle decade frequencies (10Hz, 50Hz, 100Hz, 440Hz, 1kHz, 5kHz, 10kHz, 50kHz, 100kHz)">
              <circle cx="162" cy="52" r="16" fill="url(#fg-knob-${comp.id})" stroke="#64748b" stroke-width="1.2"/>
              <circle cx="162" cy="52" r="12" fill="#1e293b"/>
              <circle cx="162" cy="52" r="2.5" fill="#38bdf8"/>
              <line x1="162" y1="52" x2="${knobX}" y2="${knobY}" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
              <text x="162" y="74" fill="#94a3b8" font-size="5.5" font-weight="800" text-anchor="middle">FREQ</text>
            </g>

            <!-- Output ON/OFF illuminated button -->
            <g class="fg-output-btn" style="cursor: pointer;" title="Output Power Switch: Click to energize / de-energize signal output">
              <rect x="144" y="78" width="36" height="16" rx="3" fill="${outOn ? '#78350f' : '#450a0a'}" stroke="${outOn ? '#fbbf24' : '#ef4444'}" stroke-width="1.2"/>
              <text x="162" y="89" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">${outOn ? '⚡ ON' : 'OUTPUT'}</text>
            </g>

            <!-- Bottom Groove -->
            <line x1="22" y1="103" x2="188" y2="103" stroke="#334155" stroke-width="1"/>

            <!-- Waveform Selector Quick Keys -->
            <g class="fg-wave-buttons" transform="translate(26, 108)">
              <g class="fg-wave-btn" data-wave="sine" style="cursor: pointer;" title="Select Sine Wave">
                <rect x="0" y="0" width="16" height="13" rx="2" fill="${wave === 'sine' ? '#0284c7' : '#1e293b'}" stroke="${wave === 'sine' ? '#38bdf8' : '#475569'}" stroke-width="0.8"/>
                <text x="8" y="9.5" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">∿</text>
              </g>

              <g class="fg-wave-btn" data-wave="square" style="cursor: pointer;" title="Select Square / Pulse Wave">
                <rect x="19" y="0" width="16" height="13" rx="2" fill="${(wave === 'square' || wave === 'pulse') ? '#0284c7' : '#1e293b'}" stroke="${(wave === 'square' || wave === 'pulse') ? '#38bdf8' : '#475569'}" stroke-width="0.8"/>
                <text x="27" y="9.5" fill="#ffffff" font-size="7" font-weight="900" text-anchor="middle">⊓</text>
              </g>

              <g class="fg-wave-btn" data-wave="triangle" style="cursor: pointer;" title="Select Triangle Wave">
                <rect x="38" y="0" width="16" height="13" rx="2" fill="${wave === 'triangle' ? '#0284c7' : '#1e293b'}" stroke="${wave === 'triangle' ? '#38bdf8' : '#475569'}" stroke-width="0.8"/>
                <text x="46" y="9.5" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">⋀</text>
              </g>

              <g class="fg-wave-btn" data-wave="ramp" style="cursor: pointer;" title="Select Sawtooth / Ramp Wave">
                <rect x="57" y="0" width="16" height="13" rx="2" fill="${(wave === 'ramp' || wave === 'sawtooth') ? '#0284c7' : '#1e293b'}" stroke="${(wave === 'ramp' || wave === 'sawtooth') ? '#38bdf8' : '#475569'}" stroke-width="0.8"/>
                <text x="65" y="9.5" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">⊿</text>
              </g>

              <g class="fg-wave-btn" data-wave="cycle" style="cursor: pointer;" title="More Waves: Noise, Cardiac ECG, DC">
                <rect x="76" y="0" width="16" height="13" rx="2" fill="${['noise', 'cardiac', 'dc'].includes(wave) ? '#0284c7' : '#1e293b'}" stroke="${['noise', 'cardiac', 'dc'].includes(wave) ? '#38bdf8' : '#475569'}" stroke-width="0.8"/>
                <text x="84" y="9.5" fill="#ffffff" font-size="7" font-weight="900" text-anchor="middle">🫀</text>
              </g>

              <!-- Modulation Mode Quick Toggle Button -->
              <g class="fg-mod-btn" style="cursor: pointer;" title="Modulation: Cycle OFF -> AM -> FM -> SWEEP -> BURST">
                <rect x="95" y="0" width="30" height="13" rx="2" fill="${state.modulation && state.modulation !== 'none' ? '#701a75' : '#1e293b'}" stroke="${state.modulation && state.modulation !== 'none' ? '#e879f9' : '#475569'}" stroke-width="0.8"/>
                <text x="110" y="9.5" fill="${state.modulation && state.modulation !== 'none' ? '#f5d0fe' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="5.2" font-weight="900" text-anchor="middle">${state.modulation && state.modulation !== 'none' ? state.modulation.toUpperCase() : 'MOD'}</text>
              </g>
            </g>

            <!-- Output Impedance Badge (50Ω / Hi-Z) -->
            <g class="fg-term-badge" style="cursor: pointer;" title="Output Impedance: Click to toggle 50Ω (Matched) / Hi-Z (Open/High-Impedance)">
              <rect x="154" y="108" width="28" height="13" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.6"/>
              <text x="168" y="117.5" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="800" text-anchor="middle">${impStr}</text>
            </g>

            <!-- 1. SYNC TTL Output at (45, 148) -->
            <circle cx="45" cy="148" r="9" fill="#0f172a" stroke="#0284c7" stroke-width="1.2"/>
            <circle cx="45" cy="148" r="6" fill="#334155"/>
            <circle cx="45" cy="148" r="2.5" fill="#38bdf8"/>
            <text x="45" y="135" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="900" text-anchor="middle">SYNC</text>

            <!-- 2. MAIN 50Ω OUT (+) at (120, 148) -->
            <circle cx="120" cy="148" r="10" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.4"/>
            <circle cx="120" cy="148" r="6.5" fill="#ef4444"/>
            <circle cx="120" cy="148" r="3" fill="#ffffff"/>
            <text x="120" y="135" fill="#ef4444" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="middle">OUT (+)</text>

            <!-- 3. GROUND RETURN (-) at (175, 148) -->
            <circle cx="175" cy="148" r="10" fill="#0f172a" stroke="#475569" stroke-width="1.4"/>
            <circle cx="175" cy="148" r="6.5" fill="#1e293b"/>
            <circle cx="175" cy="148" r="3" fill="#cbd5e1"/>
            <text x="175" y="135" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="middle">GND (−)</text>

            ${isBurnt ? `
              <rect x="12" y="12" width="186" height="140" rx="8" fill="#000000" opacity="0.8" filter="blur(3px)"/>
              <text x="105" y="85" font-size="24" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }

      // 30. BENCHTOP DUAL-CHANNEL DIGITAL STORAGE OSCILLOSCOPE (DSO) - LARGE BENCHTOP WIDESCREEN
      case 'oscilloscope': {
        const isRun = (state.runStop || 'run') === 'run';
        const tb = state.timebaseSec !== undefined ? state.timebaseSec : (state.timeDiv !== undefined ? state.timeDiv : 0.001); // default 1ms/div
        const ch1On = state.ch1Enabled !== false;
        const ch2On = state.ch2Enabled === true || (state.ch2Enabled !== false && state.ch2Enabled !== undefined);
        const ch1Vdiv = state.ch1Scale || state.ch1VoltsDiv || 2.0;
        const ch2Vdiv = state.ch2Scale || state.ch2VoltsDiv || 2.0;
        const ch1Cpl = (state.ch1Coupling || 'dc').toUpperCase();
        const ch2Cpl = (state.ch2Coupling || 'dc').toUpperCase();
        const trigSrc = (state.triggerSource || 'ch1').toUpperCase();
        const trigLvl = state.triggerLevel !== undefined ? state.triggerLevel : 0.0;
        const trigEdge = state.triggerEdge || state.triggerSlope || 'rising';
        const mathMode = state.mathMode || 'off';
        const decodeMode = (state.decodeMode || 'off').toLowerCase();

        const s1 = state.ch1 || state.ch1Signal || { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0 };
        const s2 = state.ch2 || state.ch2Signal || { type: 'none', freq: 0, vpp: 0, vrms: 0, vavg: 0 };

        // Timebase string formatting
        let tbStr = '1.00ms';
        if (tb >= 1.0) tbStr = `${tb.toFixed(1)}s`;
        else if (tb >= 0.001) tbStr = `${(tb * 1000).toFixed(tb % 0.001 === 0 ? 0 : 2)}ms`;
        else tbStr = `${(tb * 1000000).toFixed(0)}µs`;

        const fmtTimeVal = (sec) => {
          if (!sec || sec <= 0) return '0ns';
          if (sec >= 1.0) return `${sec.toFixed(2)}s`;
          if (sec >= 0.001) return `${(sec * 1000).toFixed(1)}ms`;
          if (sec >= 1e-6) return `${(sec * 1e6).toFixed(1)}µs`;
          return `${(sec * 1e9).toFixed(0)}ns`;
        };

        const scrX = 20, scrY = 34, scrW = 300, scrH = 204;
        const midX = 170, midY = 136;

        const generateTrace = (sig, vDiv, coupling, yMid, color, cls, phaseOffsetRad = 0) => {
          if (coupling === 'GND' || !sig || sig.type === 'none' || (sig.vpp === 0 && Math.abs(sig.vavg || 0) < 0.02)) {
            return `<path class="${cls || ''}" d="M ${scrX + 2} ${yMid} L ${scrX + scrW - 2} ${yMid}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
          }

          const waveType = sig.type || 'sine';
          const f = Math.max(0.1, sig.freq || 1000);
          const vpp = sig.vpp || 5.0;
          const vdc = coupling === 'AC' ? 0 : (sig.vavg || 0);

          const tScreen = Math.max(1e-7, 10 * tb);
          let nCycles = f * tScreen;
          nCycles = Math.max(0.5, Math.min(8.0, nCycles));

          const pxPerVolt = 25.5 / Math.max(0.01, vDiv);
          const ampPx = Math.min(68, Math.max(2, (vpp / 2) * pxPerVolt));
          const offsetPx = Math.max(-55, Math.min(55, vdc * pxPerVolt));

          const baseY = yMid - offsetPx;
          const stepPx = 1.5;
          const totalPoints = Math.floor(scrW / stepPx);
          let pts = [];

          for (let i = 0; i <= totalPoints; i++) {
            const curX = scrX + i * stepPx;
            const progress = i / totalPoints;
            let phase = progress * nCycles * 2 * Math.PI + phaseOffsetRad;
            if (sig.phaseDeg) phase += (sig.phaseDeg * Math.PI / 180);

            let waveNorm = 0;
            if (waveType === 'sine') {
              waveNorm = Math.sin(phase);
            } else if (waveType === 'square' || waveType === 'pulse') {
              const duty = Math.max(0.02, Math.min(0.98, (sig.duty || (waveType === 'pulse' ? 20 : 50)) / 100));
              const frac = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
              const edgeW = 0.018;
              if (frac < edgeW) {
                waveNorm = -1 + 2 * (frac / edgeW);
              } else if (frac < duty - edgeW) {
                waveNorm = 1;
              } else if (frac < duty + edgeW) {
                waveNorm = 1 - 2 * ((frac - (duty - edgeW)) / (2 * edgeW));
              } else if (frac < 1 - edgeW) {
                waveNorm = -1;
              } else {
                waveNorm = -1 + 2 * ((frac - (1 - edgeW)) / edgeW);
              }
            } else if (waveType === 'triangle') {
              const frac = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
              waveNorm = frac < 0.5 ? (frac * 4 - 1) : (3 - frac * 4);
            } else if (waveType === 'ramp') {
              const frac = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
              waveNorm = frac * 2 - 1;
            } else if (waveType === 'sawtooth') {
              const frac = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
              waveNorm = (1 - frac) * 2 - 1;
            } else if (waveType === 'noise') {
              const seed = Math.sin(phase * 12.9898 + i * 78.233) * 43758.5453;
              waveNorm = (seed - Math.floor(seed)) * 2 - 1;
            } else if (waveType === 'cardiac') {
              const frac = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
              if (frac >= 0.12 && frac < 0.22) {
                waveNorm = 0.25 * Math.sin(Math.PI * (frac - 0.12) / 0.10);
              } else if (frac >= 0.28 && frac < 0.32) {
                waveNorm = -0.22 * Math.sin(Math.PI * (frac - 0.28) / 0.04);
              } else if (frac >= 0.32 && frac < 0.38) {
                waveNorm = 1.0 * Math.sin(Math.PI * (frac - 0.32) / 0.06);
              } else if (frac >= 0.38 && frac < 0.44) {
                waveNorm = -0.38 * Math.sin(Math.PI * (frac - 0.38) / 0.06);
              } else if (frac >= 0.52 && frac < 0.72) {
                waveNorm = 0.32 * Math.sin(Math.PI * (frac - 0.52) / 0.20);
              } else {
                waveNorm = 0.0;
              }
            } else if (waveType === 'full_wave') {
              waveNorm = Math.abs(Math.sin(phase)) * 2 - 1;
            } else if (waveType === 'half_wave') {
              const s = Math.sin(phase);
              waveNorm = (s > 0 ? s : 0) * 2 - 1;
            } else if (waveType === 'spike') {
              const tDecay = Math.max(0, (progress - 0.15) * 6);
              const env = Math.exp(-tDecay * 3.5);
              waveNorm = progress < 0.15 ? 0 : (env * Math.cos((progress - 0.15) * 45));
            } else if (waveType === 'dc_ripple') {
              waveNorm = Math.sin(phase) * (sig.rippleV ? (sig.rippleV / Math.max(0.01, vpp)) : 0.25);
            } else {
              waveNorm = 0;
            }

            // Real lab modulation synthesis
            if (sig.modulation === 'am') {
              const m = sig.amDepth !== undefined ? sig.amDepth : 0.6;
              const fMod = sig.amFreq || 100;
              const amEnv = 1.0 + m * Math.sin(2 * Math.PI * fMod * progress * tScreen);
              waveNorm = waveNorm * amEnv;
            } else if (sig.modulation === 'fm') {
              const fmDev = sig.fmDev || 500;
              const fMod = sig.fmFreq || 50;
              const fmPhase = phase + (fmDev / Math.max(1, fMod)) * Math.sin(2 * Math.PI * fMod * progress * tScreen);
              waveNorm = Math.sin(fmPhase);
            } else if (sig.modulation === 'sweep') {
              const chirpFactor = 0.2 + 2.0 * progress;
              waveNorm = Math.sin(phase * chirpFactor);
            } else if (sig.modulation === 'burst') {
              const bCycles = sig.burstCycles || 4;
              const burstFrac = (progress * nCycles) % (bCycles * 2.2);
              if (burstFrac >= bCycles) waveNorm = 0;
            }

            if (sig.invert) {
              waveNorm = -waveNorm;
            }

            const curY = Math.max(scrY + 2, Math.min(scrY + scrH - 2, baseY - waveNorm * ampPx));
            pts.push(`${curX.toFixed(1)} ${curY.toFixed(1)}`);
          }

          return `<path class="${cls || ''}" d="M ${pts.join(' L ')}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
        };

        const generateXyTrace = (sig1, sig2, vDiv1, vDiv2) => {
          if (!sig1 || !sig2 || sig1.type === 'none' || sig2.type === 'none' || sig1.vpp === 0 || sig2.vpp === 0) {
            return `<circle cx="${midX}" cy="${midY}" r="3" fill="#fbbf24" />`;
          }
          const f1 = sig1.freq || 1000;
          const f2 = sig2.freq || 1000;
          const vpp1 = sig1.vpp || 5.0;
          const vpp2 = sig2.vpp || 5.0;
          const vdc1 = sig1.vavg || 0;
          const vdc2 = sig2.vavg || 0;
          const pxPerV1 = 30.0 / Math.max(0.01, vDiv1);
          const pxPerV2 = 25.5 / Math.max(0.01, vDiv2);

          const phaseShift = ((state.phaseDiff || 0) * Math.PI) / 180;
          const totalPts = 240;
          const fMin = Math.min(f1, f2);
          const tTotal = 2.0 / Math.max(1, fMin);
          const pts = [];

          for (let i = 0; i <= totalPts; i++) {
            const t = (i / totalPts) * tTotal;
            const phi1 = 2 * Math.PI * f1 * t;
            const phi2 = 2 * Math.PI * f2 * t + phaseShift;

            let w1 = Math.sin(phi1);
            if (sig1.type === 'triangle') {
              const fr = ((phi1 / (2 * Math.PI)) % 1 + 1) % 1;
              w1 = fr < 0.5 ? fr * 4 - 1 : 3 - fr * 4;
            }
            let w2 = Math.sin(phi2);
            if (sig2.type === 'triangle') {
              const fr = ((phi2 / (2 * Math.PI)) % 1 + 1) % 1;
              w2 = fr < 0.5 ? fr * 4 - 1 : 3 - fr * 4;
            }

            const v1 = vdc1 + w1 * (vpp1 / 2);
            const v2 = vdc2 + w2 * (vpp2 / 2);

            const curX = Math.max(scrX + 4, Math.min(scrX + scrW - 4, midX + v1 * pxPerV1));
            const curY = Math.max(scrY + 4, Math.min(scrY + scrH - 4, midY - v2 * pxPerV2));
            pts.push(`${curX.toFixed(1)} ${curY.toFixed(1)}`);
          }

          return `
            <g class="dso-xy-trace">
              <path d="M ${pts.join(' L ')}" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              <text x="${scrX + 8}" y="${scrY + 20}" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="900">XY MODE (LISSAJOUS): CH1(X) vs CH2(Y) [Δθ=${(state.phaseDiff || 0).toFixed(0)}°]</text>
            </g>
          `;
        };

        const generateFftTrace = (sig, f0) => {
          if (!sig || sig.type === 'none' || !f0 || f0 <= 0) {
            return `<path class="dso-math-fft-trace" d="M ${scrX + 4} ${scrY + scrH - 12} L ${scrX + scrW - 4} ${scrY + scrH - 12}" fill="none" stroke="#c026d3" stroke-width="1.8" stroke-dasharray="3 3"/>`;
          }
          const maxF = Math.max(1000, f0 * 5.5);
          const fToX = (f) => scrX + 16 + (f / maxF) * (scrW - 32);
          const dbToY = (db) => {
            const clamped = Math.max(-80, Math.min(10, db));
            return scrY + 22 + ((10 - clamped) / 90) * (scrH - 52);
          };

          const harmonics = [];
          const wave = sig.type || 'sine';
          if (sig.modulation === 'am') {
            const m = sig.amDepth !== undefined ? sig.amDepth : 0.6;
            const fMod = sig.amFreq || 100;
            const vCarrier = (sig.vpp / 2) / Math.SQRT2;
            const vSb = (m / 2) * vCarrier;
            harmonics.push({ f: f0, db: 20 * Math.log10(Math.max(0.01, vCarrier)) });
            if (f0 - fMod > 0) harmonics.push({ f: f0 - fMod, db: 20 * Math.log10(Math.max(0.01, vSb)) });
            harmonics.push({ f: f0 + fMod, db: 20 * Math.log10(Math.max(0.01, vSb)) });
          } else if (wave === 'sine') {
            harmonics.push({ f: f0, db: 20 * Math.log10(Math.max(0.01, sig.vrms || 1.0)) });
          } else if (wave === 'square' || wave === 'pulse') {
            const vFund = (sig.vpp / 2) * (4 / Math.PI) / Math.SQRT2;
            harmonics.push({ f: f0, db: 20 * Math.log10(Math.max(0.01, vFund)) });
            harmonics.push({ f: 3 * f0, db: 20 * Math.log10(Math.max(0.01, vFund / 3)) });
            harmonics.push({ f: 5 * f0, db: 20 * Math.log10(Math.max(0.01, vFund / 5)) });
          } else if (wave === 'triangle') {
            const vFund = (sig.vpp / 2) * (8 / (Math.PI * Math.PI)) / Math.SQRT2;
            harmonics.push({ f: f0, db: 20 * Math.log10(Math.max(0.01, vFund)) });
            harmonics.push({ f: 3 * f0, db: 20 * Math.log10(Math.max(0.01, vFund / 9)) });
          } else if (wave === 'ramp' || wave === 'sawtooth') {
            const vFund = (sig.vpp / 2) / (Math.PI * Math.SQRT2);
            harmonics.push({ f: f0, db: 20 * Math.log10(Math.max(0.01, vFund)) });
            harmonics.push({ f: 2 * f0, db: 20 * Math.log10(Math.max(0.01, vFund / 2)) });
            harmonics.push({ f: 3 * f0, db: 20 * Math.log10(Math.max(0.01, vFund / 3)) });
            harmonics.push({ f: 4 * f0, db: 20 * Math.log10(Math.max(0.01, vFund / 4)) });
          } else if (wave === 'full_wave') {
            harmonics.push({ f: f0, db: 20 * Math.log10(Math.max(0.01, sig.vrms || 1.0)) });
            harmonics.push({ f: 2 * f0, db: 20 * Math.log10(Math.max(0.01, (sig.vrms || 1.0) / 2)) });
          } else {
            harmonics.push({ f: f0, db: 20 * Math.log10(Math.max(0.01, sig.vrms || 1.0)) });
          }

          let barsSvg = '';
          harmonics.forEach(h => {
            const hx = fToX(h.f);
            if (hx <= scrX + scrW - 6) {
              const hy = dbToY(h.db);
              const baseY = scrY + scrH - 12;
              const fLabel = h.f >= 1000 ? `${(h.f / 1000).toFixed(1)}k` : `${Math.round(h.f)}`;
              barsSvg += `
                <line x1="${hx.toFixed(1)}" y1="${baseY}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#e879f9" stroke-width="4.5" stroke-linecap="round"/>
                <circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="3" fill="#ffffff"/>
                <text x="${hx.toFixed(1)}" y="${(hy - 5).toFixed(1)}" fill="#f5d0fe" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">${fLabel}Hz (${h.db.toFixed(0)}dB)</text>
              `;
            }
          });

          return `
            <g class="dso-math-fft-trace">
              <line x1="${scrX + 4}" y1="${scrY + scrH - 12}" x2="${scrX + scrW - 4}" y2="${scrY + scrH - 12}" stroke="#701a75" stroke-width="1.2"/>
              <text x="${scrX + 8}" y="${scrY + 22}" fill="#e879f9" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="900">FFT SPECTRUM ANALYZER (dBV vs Hz)</text>
              ${barsSvg}
            </g>
          `;
        };

        const generateDecodeRibbon = () => {
          if (decodeMode === 'off') return '';
          const ribY = 158;
          let packets = state.decodedPackets || [];
          if (packets.length === 0) {
            if (decodeMode === 'uart') {
              packets = [
                { hex: '0x55', label: "'U'", byte: '0x55', ascii: 'U' },
                { hex: '0x41', label: "'A'", byte: '0x41', ascii: 'A' },
                { hex: '0x52', label: "'R'", byte: '0x52', ascii: 'R' },
                { hex: '0x54', label: "'T'", byte: '0x54', ascii: 'T' },
                { hex: '0x21', label: "'!'", byte: '0x21', ascii: '!' }
              ];
            } else if (decodeMode === 'i2c') {
              packets = [
                { hex: 'START', label: 'START' },
                { hex: '0x3C+W', label: 'ADDR' },
                { hex: 'ACK', label: 'ACK' },
                { hex: '0x00', label: 'REG' },
                { hex: 'ACK', label: 'ACK' },
                { hex: '0xAF', label: 'DATA' },
                { hex: 'STOP', label: 'STOP' }
              ];
            } else if (decodeMode === 'spi') {
              packets = [
                { hex: 'MOSI:0xAA', label: 'MOSI' },
                { hex: 'MOSI:0x55', label: 'MOSI' },
                { hex: 'MISO:0xFF', label: 'MISO' },
                { hex: 'MISO:0x00', label: 'MISO' }
              ];
            } else if (decodeMode === 'can') {
              packets = [
                { hex: 'SOF', label: 'SOF' },
                { hex: 'ID:0x123', label: 'ID' },
                { hex: 'DLC:4', label: 'DLC' },
                { hex: 'DATA:AF', label: 'DATA' },
                { hex: 'CRC:OK', label: 'CRC' }
              ];
            }
          }

          let pktSvg = '';
          const pW = 38;
          const pH = 15;
          packets.slice(0, 6).forEach((p, idx) => {
            const px = scrX + 6 + idx * (pW + 4);
            if (px + pW <= scrX + scrW - 6) {
              pktSvg += `
                <g transform="translate(${px}, ${ribY + 5})">
                  <rect x="0" y="0" width="${pW}" height="${pH}" rx="3" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
                  <text x="${pW / 2}" y="10.5" fill="#fde68a" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">${p.hex || p.byte || p.val || ''}</text>
                </g>
              `;
            }
          });

          return `
            <g class="dso-bus-ribbon">
              <rect x="${scrX + 4}" y="${ribY}" width="${scrW - 8}" height="24" rx="4" fill="rgba(69, 26, 3, 0.7)" stroke="#f59e0b" stroke-width="1"/>
              <text x="${scrX + 8}" y="${ribY - 3}" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900">BUS DECODE [${decodeMode.toUpperCase()}]:</text>
              ${pktSvg}
            </g>
          `;
        };

        const ch2PhaseRad = ((state.phaseDiff || 0) * Math.PI) / 180;
        const ch1Path = ch1On ? generateTrace(s1, ch1Vdiv, ch1Cpl, midY, '#facc15', 'dso-ch1-trace') : '';
        const ch2Path = ch2On ? generateTrace(s2, ch2Vdiv, ch2Cpl, midY + 6, '#22d3ee', 'dso-ch2-trace', ch2PhaseRad) : '';

        let mathPath = '';
        if (mathMode === 'fft') {
          const primarySig = (trigSrc === 'CH2' && ch2On) ? s2 : s1;
          mathPath = generateFftTrace(primarySig, primarySig.freq || 1000);
        } else if (mathMode === 'add' && ch1On && ch2On) {
          const sMath = {
            type: s1.type,
            freq: s1.freq,
            vpp: (s1.vpp + s2.vpp) / 2,
            vavg: (s1.vavg + s2.vavg) / 2
          };
          mathPath = generateTrace(sMath, ch1Vdiv, 'DC', midY, '#c026d3', 'dso-math-trace');
        } else if (mathMode === 'sub' && ch1On && ch2On) {
          const sMath = {
            type: s1.type,
            freq: s1.freq,
            vpp: Math.abs(s1.vpp - s2.vpp) || s1.vpp,
            vavg: (s1.vavg - s2.vavg)
          };
          mathPath = generateTrace(sMath, ch1Vdiv, 'DC', midY, '#c026d3', 'dso-math-trace');
        }

        const trigY = Math.max(scrY + 6, Math.min(scrY + scrH - 6, midY - (trigLvl / (trigSrc === 'CH2' ? ch2Vdiv : ch1Vdiv)) * 25.5));

        const actFreq = (trigSrc === 'CH2' ? (s2.freq || 0) : (s1.freq || 0));
        let fCounter = 'f = 0.00Hz';
        if (actFreq >= 1000) fCounter = `f = ${(actFreq / 1000).toFixed(2)}kHz`;
        else if (actFreq > 0) fCounter = `f = ${actFreq.toFixed(1)}Hz`;

        let acqText = '▶ RUN';
        let acqBg = '#78350f';
        let acqBorder = '#f59e0b';
        let acqColor = '#fbbf24';
        if (state.runStop === 'stop') {
          acqText = '⏸ STOP';
          acqBg = '#450a0a';
          acqBorder = '#ef4444';
          acqColor = '#fca5a5';
        } else if (state.runStop === 'single') {
          if (state.singleTriggered) {
            acqText = '⚡ TRIG\'D';
            acqBg = '#083344';
            acqBorder = '#06b6d4';
            acqColor = '#67e8f9';
          } else {
            acqText = '⏳ ARMED';
            acqBg = '#451a03';
            acqBorder = '#f59e0b';
            acqColor = '#fbbf24';
          }
        }

        const generateCursorOverlay = () => {
          const mode = state.cursorMode || 'off';
          if (mode === 'off') return '';
          if (mode === 'voltage') {
            const v1 = state.vCursor1 !== undefined ? state.vCursor1 : 2.0;
            const v2 = state.vCursor2 !== undefined ? state.vCursor2 : -2.0;
            const y1 = Math.max(scrY + 2, Math.min(scrY + scrH - 2, midY - (v1 / ch1Vdiv) * 25.5));
            const y2 = Math.max(scrY + 2, Math.min(scrY + scrH - 2, midY - (v2 / ch1Vdiv) * 25.5));
            const dv = Math.abs(v1 - v2);
            return `
              <g class="dso-voltage-cursors">
                <line x1="${scrX}" y1="${y1.toFixed(1)}" x2="${scrX + scrW}" y2="${y1.toFixed(1)}" stroke="#38bdf8" stroke-dasharray="4 3" stroke-width="1.2"/>
                <line x1="${scrX}" y1="${y2.toFixed(1)}" x2="${scrX + scrW}" y2="${y2.toFixed(1)}" stroke="#38bdf8" stroke-dasharray="4 3" stroke-width="1.2"/>
                <rect x="${scrX + 160}" y="${scrY + 4}" width="130" height="13" rx="2" fill="rgba(8, 47, 73, 0.9)" stroke="#0284c7" stroke-width="0.8"/>
                <text x="${scrX + 225}" y="${scrY + 13}" fill="#e0f2fe" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="middle">V1:${v1.toFixed(2)}V  V2:${v2.toFixed(2)}V  ΔV:${dv.toFixed(2)}V</text>
              </g>
            `;
          } else if (mode === 'time') {
            const frac1 = state.tCursor1 !== undefined ? state.tCursor1 : 0.3;
            const frac2 = state.tCursor2 !== undefined ? state.tCursor2 : 0.7;
            const x1 = scrX + frac1 * scrW;
            const x2 = scrX + frac2 * scrW;
            const tScreen = 10 * tb;
            const t1 = frac1 * tScreen;
            const t2 = frac2 * tScreen;
            const dt = Math.abs(t2 - t1);
            const invDt = dt > 0 ? (1 / dt) : 0;
            const invDtStr = invDt >= 1000 ? `${(invDt / 1000).toFixed(1)}kHz` : `${invDt.toFixed(0)}Hz`;
            return `
              <g class="dso-time-cursors">
                <line x1="${x1.toFixed(1)}" y1="${scrY}" x2="${x1.toFixed(1)}" y2="${scrY + scrH}" stroke="#f59e0b" stroke-dasharray="4 3" stroke-width="1.2"/>
                <line x1="${x2.toFixed(1)}" y1="${scrY}" x2="${x2.toFixed(1)}" y2="${scrY + scrH}" stroke="#f59e0b" stroke-dasharray="4 3" stroke-width="1.2"/>
                <rect x="${scrX + 130}" y="${scrY + 4}" width="160" height="13" rx="2" fill="rgba(69, 26, 3, 0.9)" stroke="#d97706" stroke-width="0.8"/>
                <text x="${scrX + 210}" y="${scrY + 13}" fill="#fef3c7" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="900" text-anchor="middle">T1:${fmtTimeVal(t1)} T2:${fmtTimeVal(t2)} ΔT:${fmtTimeVal(dt)} 1/ΔT:${invDtStr}</text>
              </g>
            `;
          }
          return '';
        };

        // Dynamic highlight line for Row 3 of the monitor HUD Dock
        let hudRow3 = `⚡ SYSTEM: BW 50MHz • 1MΩ 15pF • AC/DC Coupled • Math: ${mathMode.toUpperCase()} • Bus: ${decodeMode.toUpperCase()}`;
        if (state.xyMode) {
          hudRow3 = `⚡ LISSAJOUS XY PLOT: Deflection X=CH1 (${ch1Vdiv.toFixed(1)}V/div) • Y=CH2 (${ch2Vdiv.toFixed(1)}V/div) • Δθ=${(state.phaseDiff || 0).toFixed(1)}°`;
        } else if (state.cursorMode === 'voltage') {
          hudRow3 = `⚡ VOLTAGE CURSORS: V1=${(state.vCursor1 !== undefined ? state.vCursor1 : 2).toFixed(2)}V | V2=${(state.vCursor2 !== undefined ? state.vCursor2 : -2).toFixed(2)}V | ΔV=${Math.abs((state.vCursor1 !== undefined ? state.vCursor1 : 2) - (state.vCursor2 !== undefined ? state.vCursor2 : -2)).toFixed(2)}V`;
        } else if (state.cursorMode === 'time') {
          const dtVal = Math.abs((state.tCursor2 !== undefined ? state.tCursor2 : 0.7) - (state.tCursor1 !== undefined ? state.tCursor1 : 0.3)) * 10 * tb;
          hudRow3 = `⚡ TIME CURSORS: ΔT=${fmtTimeVal(dtVal)} | 1/ΔT=${dtVal > 0 ? (dtVal >= 0.001 ? (1 / dtVal).toFixed(0) + 'Hz' : ((1 / dtVal) / 1000).toFixed(1) + 'kHz') : '---'}`;
        } else if (s1.type === 'spike' || (s1.vpp > 40 && s1.overshoot)) {
          hudRow3 = `⚡ INDUCTIVE KICKBACK: Vpeak=${s1.vpp.toFixed(0)}V | tr=${fmtTimeVal(s1.riseTime)} | Overshoot=${s1.overshoot || 40}% | Ring=25kHz`;
        } else if (ch1Cpl === 'AC' && s1.rippleV) {
          hudRow3 = `⚡ SMPS RAIL RIPPLE: Vrip=${(s1.rippleV * 1000).toFixed(0)}mVpp @ ${(s1.rippleFreq || 50000) / 1000}kHz | Vdc=${(s1.vavg || 0).toFixed(2)}V`;
        } else if (state.phaseDiff && Math.abs(state.phaseDiff) > 0.1) {
          hudRow3 = `⚡ DUAL-CH TIMING: Phase Δθ = ${state.phaseDiff.toFixed(1)}° | Propagation Delay Δt = ${fmtTimeVal(state.timeDelay)}`;
        } else if (s1.riseTime && s1.riseTime > 0) {
          hudRow3 = `⚡ CLOCK / TIMING: Period T = ${fmtTimeVal(s1.freq > 0 ? 1 / s1.freq : 0)} | Rise tr = ${fmtTimeVal(s1.riseTime)} | Duty = ${(s1.duty || 50)}%`;
        }

        const isXy = state.xyMode === true;
        const mainTraces = isXy ? generateXyTrace(s1, s2, ch1Vdiv, ch2Vdiv) : `${ch1Path}${ch2Path}`;

        content = `
          <g class="comp-oscilloscope">
            <defs>
              <linearGradient id="dso-chassis-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#334155"/>
                <stop offset="5%" stop-color="#1e293b"/>
                <stop offset="95%" stop-color="#0f172a"/>
                <stop offset="100%" stop-color="#020617"/>
              </linearGradient>
              <linearGradient id="dso-deck-${comp.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#1e293b"/>
                <stop offset="50%" stop-color="#0f172a"/>
                <stop offset="100%" stop-color="#020617"/>
              </linearGradient>
            </defs>

            <!-- Drop shadow -->
            <rect x="8" y="12" width="424" height="284" rx="12" fill="#000000" opacity="0.45" filter="blur(6px)"/>

            <!-- Main Chassis -->
            <rect x="8" y="8" width="424" height="284" rx="12" fill="url(#dso-chassis-${comp.id})" stroke="#475569" stroke-width="1.8"/>

            <!-- Molded Top Carry Handle -->
            <rect x="145" y="3" width="150" height="7" rx="3.5" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
            <rect x="160" y="4" width="120" height="3" fill="#475569" rx="1.5"/>

            <!-- Shock-Absorbing Rubber Side Bumpers with Grip Ridges -->
            <path d="M 8 20 Q 8 8, 20 8 L 24 8 L 24 292 L 20 292 Q 8 292, 8 280 Z" fill="#090d16" stroke="#334155" stroke-width="1"/>
            <line x1="12" y1="50" x2="20" y2="50" stroke="#334155" stroke-width="1.2"/>
            <line x1="12" y1="100" x2="20" y2="100" stroke="#334155" stroke-width="1.2"/>
            <line x1="12" y1="150" x2="20" y2="150" stroke="#334155" stroke-width="1.2"/>
            <line x1="12" y1="200" x2="20" y2="200" stroke="#334155" stroke-width="1.2"/>
            <line x1="12" y1="250" x2="20" y2="250" stroke="#334155" stroke-width="1.2"/>

            <path d="M 416 8 L 420 8 Q 432 8, 432 20 L 432 280 Q 432 292, 420 292 L 416 292 Z" fill="#090d16" stroke="#334155" stroke-width="1"/>
            <line x1="420" y1="50" x2="428" y2="50" stroke="#334155" stroke-width="1.2"/>
            <line x1="420" y1="100" x2="428" y2="100" stroke="#334155" stroke-width="1.2"/>
            <line x1="420" y1="150" x2="428" y2="150" stroke="#334155" stroke-width="1.2"/>
            <line x1="420" y1="200" x2="428" y2="200" stroke="#334155" stroke-width="1.2"/>
            <line x1="420" y1="250" x2="428" y2="250" stroke="#334155" stroke-width="1.2"/>

            <!-- Front Panel Header Banner -->
            <rect x="24" y="13" width="392" height="15" rx="3" fill="rgba(15, 23, 42, 0.75)"/>
            <text x="28" y="24" fill="#38bdf8" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="900" letter-spacing="0.5">DSO-4000X ULTRA-PHOSPHOR</text>
            <text x="195" y="24" fill="#eab308" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="900">2-CH 100MS/s 12-BIT BENCHTOP DSO</text>
            <text x="410" y="24" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="800" text-anchor="end">LAB SERIES</text>

            <!-- 8.5-inch Widescreen Color LCD Monitor Bezel & Glass -->
            <rect x="18" y="32" width="304" height="208" rx="7" fill="#090d16" stroke="#334155" stroke-width="1.2"/>
            <rect class="dso-screen" x="20" y="34" width="300" height="204" rx="5" fill="#020617" stroke="#0284c7" stroke-width="1.5"/>

            <!-- 8x10 Precision Graticule Division Grid Lines -->
            <g class="dso-graticule">
              ${Array.from({ length: 9 }).map((_, i) => {
          const x = 20 + (i + 1) * 30.0;
          return `<line x1="${x.toFixed(1)}" y1="34" x2="${x.toFixed(1)}" y2="238" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="2 3"/>`;
        }).join('')}
              ${Array.from({ length: 7 }).map((_, i) => {
          const y = 34 + (i + 1) * 25.5;
          return `<line x1="20" y1="${y.toFixed(1)}" x2="320" y2="${y.toFixed(1)}" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="2 3"/>`;
        }).join('')}
            </g>

            <!-- Center Axes with Sub-division Tick Marks (5 subdivisions per division) -->
            <line x1="170" y1="34" x2="170" y2="238" stroke="#334155" stroke-width="1.2"/>
            <line x1="20" y1="136" x2="320" y2="136" stroke="#334155" stroke-width="1.2"/>
            ${Array.from({ length: 49 }).map((_, i) => {
          const x = 20 + (i + 1) * 6.0;
          if ((i + 1) % 5 === 0) return '';
          return `<line x1="${x.toFixed(1)}" y1="134" x2="${x.toFixed(1)}" y2="138" stroke="#475569" stroke-width="0.8"/>`;
        }).join('')}
            ${Array.from({ length: 39 }).map((_, i) => {
          const y = 34 + (i + 1) * 5.1;
          if ((i + 1) % 5 === 0) return '';
          return `<line x1="168" y1="${y.toFixed(1)}" x2="172" y2="${y.toFixed(1)}" stroke="#475569" stroke-width="0.8"/>`;
        }).join('')}

            <!-- Trigger Level Line (Horizontal Dashed Line across Monitor) -->
            <line x1="20" y1="${trigY.toFixed(1)}" x2="320" y2="${trigY.toFixed(1)}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 3" opacity="0.8"/>
            <!-- Trigger Arrow Marker 'T ▸' on Right Edge of Monitor -->
            <polygon points="320,${trigY.toFixed(1)} 313,${(trigY - 5).toFixed(1)} 313,${(trigY + 5).toFixed(1)}" fill="#f59e0b"/>
            <text x="316" y="${(trigY + 1.8).toFixed(1)}" fill="#000000" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="900" text-anchor="middle">T</text>

            <!-- Ground Baseline Reference Flags on Left Edge (1▸ for CH1, 2▸ for CH2) -->
            <polygon points="20,136 27,131 27,141" fill="#facc15"/>
            <text x="24.5" y="137.5" fill="#000000" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="900" text-anchor="middle">1</text>
            <polygon points="20,144 27,139 27,149" fill="#22d3ee"/>
            <text x="24.5" y="145.5" fill="#000000" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="900" text-anchor="middle">2</text>

            <!-- Monitor Top Status Ribbon Bar -->
            <rect x="23" y="36.5" width="40" height="11.5" rx="2" fill="${acqBg}" stroke="${acqBorder}" stroke-width="0.8"/>
            <text x="43" y="44.8" fill="${acqColor}" font-family="'JetBrains Mono', monospace" font-size="6.8" font-weight="900" text-anchor="middle">${acqText}</text>

            <rect x="67" y="36.5" width="56" height="11.5" rx="2" fill="rgba(15, 23, 42, 0.9)" stroke="#334155" stroke-width="0.8"/>
            <text x="95" y="44.8" fill="#e2e8f0" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="800" text-anchor="middle">⏱ M: ${tbStr}</text>

            <rect x="127" y="36.5" width="70" height="11.5" rx="2" fill="rgba(15, 23, 42, 0.9)" stroke="#334155" stroke-width="0.8"/>
            <text x="162" y="44.8" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="800" text-anchor="middle">T: ${trigSrc} ${trigEdge === 'rising' ? '↗' : '↘'} ${trigLvl.toFixed(1)}V</text>

            <rect x="201" y="36.5" width="54" height="11.5" rx="2" fill="rgba(15, 23, 42, 0.9)" stroke="#334155" stroke-width="0.8"/>
            <text x="228" y="44.8" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="800" text-anchor="middle">100MS/s 12M</text>

            <rect x="259" y="36.5" width="58" height="11.5" rx="2" fill="rgba(15, 23, 42, 0.9)" stroke="#334155" stroke-width="0.8"/>
            <text x="288" y="44.8" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">${fCounter}</text>

            <!-- Live Phosphor Waveform Traces -->
            ${mainTraces}
            ${mathPath}
            ${generateDecodeRibbon()}
            ${generateCursorOverlay()}

            <!-- On-Monitor Live Measurement HUD Dock (Across Bottom of Screen) -->
            <rect x="22" y="182" width="296" height="52" rx="4" fill="rgba(2, 6, 23, 0.94)" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1"/>
            
            <!-- Row 1: Channel 1 Telemetry (7 Real Lab Parameters) -->
            <g transform="translate(26, 185)">
              <rect x="0" y="2" width="46" height="10" rx="2" fill="#422006" stroke="#ca8a04" stroke-width="0.8"/>
              <text x="23" y="9.2" fill="#fde047" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="900" text-anchor="middle">1: ${ch1Vdiv.toFixed(1)}V (${ch1Cpl})</text>
              
              <text x="49" y="9.2" fill="#fde047" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="800">Vpp:${(s1.vpp || 0).toFixed(2)}V</text>
              <text x="96" y="9.2" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="700">Vmax:${(s1.vmax !== undefined ? s1.vmax : ((s1.vavg || 0) + (s1.vpp || 0) / 2)).toFixed(2)}V</text>
              <text x="146" y="9.2" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="700">Vmin:${(s1.vmin !== undefined ? s1.vmin : ((s1.vavg || 0) - (s1.vpp || 0) / 2)).toFixed(2)}V</text>
              <text x="194" y="9.2" fill="#e2e8f0" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="700">Vrms:${(s1.vrms || 0).toFixed(2)}V</text>
              <text x="244" y="9.2" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="900">f:${s1.freq >= 1000 ? (s1.freq / 1000).toFixed(2) + 'k' : (s1.freq || 0).toFixed(0)}Hz</text>
            </g>

            <!-- Row 2: Channel 2 Telemetry & Real Timing (7 Real Lab Parameters) -->
            <g transform="translate(26, 199)">
              <rect x="0" y="2" width="46" height="10" rx="2" fill="#082f49" stroke="#0891b2" stroke-width="0.8"/>
              <text x="23" y="9.2" fill="#67e8f9" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="900" text-anchor="middle">2: ${ch2On ? `${ch2Vdiv.toFixed(1)}V (${ch2Cpl})` : 'OFF'}</text>

              <text x="49" y="9.2" fill="#67e8f9" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="800">Vpp:${(s2.vpp || 0).toFixed(2)}V</text>
              <text x="96" y="9.2" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="700">T:${fmtTimeVal(s1.freq > 0 ? 1 / s1.freq : 0)}</text>
              <text x="146" y="9.2" fill="#fef08a" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="700">Duty:${(s1.duty || 50)}%</text>
              <text x="194" y="9.2" fill="#a78bfa" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="700">tr:${fmtTimeVal(s1.riseTime || 3.5e-9)}</text>
              <text x="244" y="9.2" fill="#f472b6" font-family="'JetBrains Mono', monospace" font-size="5.7" font-weight="800">tf:${fmtTimeVal(s1.fallTime || s1.riseTime || 3.5e-9)}</text>
            </g>

            <!-- Row 3: Dynamic Engineering Telemetry & Status -->
            <g transform="translate(26, 215)">
              <rect x="0" y="0" width="288" height="13" rx="2" fill="rgba(15, 23, 42, 0.7)" stroke="#334155" stroke-width="0.6"/>
              <text x="144" y="9" fill="#c084fc" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="800" text-anchor="middle">${hudRow3}</text>
            </g>

            <!-- Right-Hand Front Panel Control Area -->
            <rect x="326" y="32" width="102" height="208" rx="6" fill="rgba(15, 23, 42, 0.7)" stroke="#334155" stroke-width="1"/>

            <!-- Row 1: Master Keys (RUN/STOP, SINGLE, AUTO) -->
            <g class="dso-run-btn" style="cursor: pointer;" title="Toggle Run / Stop (Acquisition Freeze)">
              <rect x="330" y="36" width="31" height="16" rx="2.5" fill="${state.runStop === 'run' ? '#78350f' : '#7f1d1d'}" stroke="${state.runStop === 'run' ? '#f59e0b' : '#ef4444'}" stroke-width="1.2"/>
              <text x="345.5" y="46.8" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="900" text-anchor="middle">${state.runStop === 'run' ? 'RUN' : 'STOP'}</text>
            </g>

            <g class="dso-single-btn" style="cursor: pointer;" title="Single-Shot Sequence Trigger Capture">
              <rect x="364" y="36" width="33" height="16" rx="2.5" fill="${state.runStop === 'single' ? '#854d0e' : '#1e293b'}" stroke="${state.runStop === 'single' ? '#f59e0b' : '#475569'}" stroke-width="1.2"/>
              <text x="380.5" y="46.8" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="900" text-anchor="middle">SINGLE</text>
            </g>

            <g class="dso-auto-btn" style="cursor: pointer;" title="Autoset: Automatically lock timebase, scale & trigger">
              <rect x="400" y="36" width="24" height="16" rx="2.5" fill="#78350f" stroke="#f59e0b" stroke-width="1.2"/>
              <text x="412" y="46.8" fill="#fef08a" font-family="'JetBrains Mono', monospace" font-size="6.2" font-weight="900" text-anchor="middle">AUTO</text>
            </g>

            <!-- Row 2: Channel & Math Keys (CH1, CH2, MATH, BUS) -->
            <g class="dso-ch1-btn" style="cursor: pointer;" title="CH1 Key: Cycle DC -> AC -> GND">
              <rect x="330" y="55" width="22" height="14" rx="2" fill="#713f12" stroke="#eab308" stroke-width="1"/>
              <text x="341" y="64.8" fill="#fef08a" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="900" text-anchor="middle">CH1</text>
            </g>

            <g class="dso-ch2-btn" style="cursor: pointer;" title="CH2 Key: Toggle / Cycle DC -> AC -> GND">
              <rect x="355" y="55" width="22" height="14" rx="2" fill="#0e7490" stroke="#06b6d4" stroke-width="1"/>
              <text x="366" y="64.8" fill="#cffafe" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="900" text-anchor="middle">CH2</text>
            </g>

            <g class="dso-math-btn" style="cursor: pointer;" title="MATH Key: Cycle OFF -> ADD -> SUB -> FFT">
              <rect x="380" y="55" width="24" height="14" rx="2" fill="${mathMode !== 'off' ? '#86198f' : '#4a044e'}" stroke="#c026d3" stroke-width="1"/>
              <text x="392" y="64.8" fill="#f5d0fe" font-family="'JetBrains Mono', monospace" font-size="5.4" font-weight="900" text-anchor="middle">${mathMode === 'fft' ? 'FFT' : 'MATH'}</text>
            </g>

            <g class="dso-decode-btn" style="cursor: pointer;" title="BUS Key: Cycle OFF -> UART -> I2C -> SPI">
              <rect x="407" y="55" width="18" height="14" rx="2" fill="${decodeMode !== 'off' ? '#78350f' : '#1e293b'}" stroke="${decodeMode !== 'off' ? '#f59e0b' : '#475569'}" stroke-width="1"/>
              <text x="416" y="64.8" fill="#fde68a" font-family="'JetBrains Mono', monospace" font-size="5.4" font-weight="900" text-anchor="middle">BUS</text>
            </g>

            <!-- Row 3: Advanced Keys (XY Mode, Cursors, Measurements) -->
            <g class="dso-xy-btn" style="cursor: pointer;" title="Toggle XY Mode (Lissajous figure plot: CH1 on X-axis vs CH2 on Y-axis)">
              <rect x="330" y="72" width="22" height="14" rx="2" fill="${state.xyMode ? '#78350f' : '#1e293b'}" stroke="${state.xyMode ? '#f59e0b' : '#475569'}" stroke-width="1"/>
              <text x="341" y="81.8" fill="${state.xyMode ? '#fde68a' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="900" text-anchor="middle">XY</text>
            </g>

            <g class="dso-cursor-btn" style="cursor: pointer;" title="Cursors: Cycle OFF -> VOLTAGE -> TIME">
              <rect x="355" y="72" width="34" height="14" rx="2" fill="${state.cursorMode && state.cursorMode !== 'off' ? '#431407' : '#1e293b'}" stroke="${state.cursorMode && state.cursorMode !== 'off' ? '#f97316' : '#475569'}" stroke-width="1"/>
              <text x="372" y="81.8" fill="${state.cursorMode && state.cursorMode !== 'off' ? '#fdba74' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="5.4" font-weight="900" text-anchor="middle">${state.cursorMode === 'voltage' ? 'V-CUR' : (state.cursorMode === 'time' ? 'T-CUR' : 'CURS')}</text>
            </g>

            <g class="dso-ref-btn" style="cursor: pointer;" title="Automated Measurement Telemetry Active">
              <rect x="392" y="72" width="33" height="14" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
              <text x="408.5" y="81.8" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="5.4" font-weight="900" text-anchor="middle">MEAS</text>
            </g>

            <!-- Horizontal TIME / DIV Rotary Knob -->
            <g class="dso-timebase-knob" style="cursor: pointer;" title="Time/Div Knob: Click to cycle timebase scale">
              <circle cx="377" cy="112" r="13" fill="#334155" stroke="#64748b" stroke-width="1.4"/>
              <circle cx="377" cy="112" r="10" fill="#1e293b"/>
              <line x1="377" y1="112" x2="384" y2="106" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              <text x="377" y="131" fill="#94a3b8" font-family="'Outfit', sans-serif" font-size="6.2" font-weight="800" text-anchor="middle">TIME / DIV</text>
              <text x="377" y="138" fill="#e2e8f0" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="middle">${tbStr}</text>
            </g>

            <!-- Vertical V / DIV 1 Knob (CH1) -->
            <g class="dso-vdiv1-knob" style="cursor: pointer;" title="V/DIV 1 Knob: Click to cycle CH1 scale">
              <circle cx="352" cy="162" r="11" fill="#422006" stroke="#ca8a04" stroke-width="1.3"/>
              <circle cx="352" cy="162" r="8.5" fill="#1e293b"/>
              <line x1="352" y1="162" x2="357" y2="157" stroke="#facc15" stroke-width="1.6" stroke-linecap="round"/>
              <text x="352" y="179" fill="#facc15" font-family="'Outfit', sans-serif" font-size="5.8" font-weight="800" text-anchor="middle">V/DIV 1</text>
              <text x="352" y="186" fill="#fde047" font-family="'JetBrains Mono', monospace" font-size="5.6" font-weight="900" text-anchor="middle">${ch1Vdiv >= 1 ? ch1Vdiv + 'V' : (ch1Vdiv * 1000) + 'mV'}</text>
            </g>

            <!-- Vertical V / DIV 2 Knob (CH2) -->
            <g class="dso-vdiv2-knob" style="cursor: pointer;" title="V/DIV 2 Knob: Click to cycle CH2 scale">
              <circle cx="403" cy="162" r="11" fill="#082f49" stroke="#0891b2" stroke-width="1.3"/>
              <circle cx="403" cy="162" r="8.5" fill="#1e293b"/>
              <line x1="403" y1="162" x2="408" y2="157" stroke="#22d3ee" stroke-width="1.6" stroke-linecap="round"/>
              <text x="403" y="179" fill="#22d3ee" font-family="'Outfit', sans-serif" font-size="5.8" font-weight="800" text-anchor="middle">V/DIV 2</text>
              <text x="403" y="186" fill="#67e8f9" font-family="'JetBrains Mono', monospace" font-size="5.6" font-weight="900" text-anchor="middle">${ch2Vdiv >= 1 ? ch2Vdiv + 'V' : (ch2Vdiv * 1000) + 'mV'}</text>
            </g>

            <!-- Trigger Level Knob -->
            <g class="dso-trig-knob" style="cursor: pointer;" title="Trigger Level Knob: Click to cycle trigger voltage">
              <circle cx="377" cy="208" r="10" fill="#334155" stroke="#64748b" stroke-width="1.2"/>
              <circle cx="377" cy="208" r="7.5" fill="#0f172a"/>
              <line x1="377" y1="208" x2="381" y2="204" stroke="#f59e0b" stroke-width="1.5"/>
              <text x="377" y="224" fill="#fbbf24" font-family="'Outfit', sans-serif" font-size="5.6" font-weight="800" text-anchor="middle">TRIG LEVEL</text>
              <text x="377" y="231" fill="#fde68a" font-family="'JetBrains Mono', monospace" font-size="5.6" font-weight="900" text-anchor="middle">${trigLvl.toFixed(1)}V</text>
            </g>

            <!-- Lower Deck Connector Section (Brushed Steel Finish) -->
            <rect x="20" y="244" width="408" height="42" rx="4" fill="url(#dso-deck-${comp.id})" stroke="#475569" stroke-width="1.2"/>

            <!-- 1. CH1 Input BNC Terminal at (70, 268) -->
            <circle cx="70" cy="268" r="11" fill="#422006" stroke="#ca8a04" stroke-width="1.8"/>
            <circle cx="70" cy="268" r="7.5" fill="#713f12"/>
            <circle cx="70" cy="268" r="3.5" fill="#fde047"/>
            <text x="70" y="253" fill="#fde047" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="900" text-anchor="middle">CH 1 (X)</text>
            <text x="70" y="284" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">1MΩ 15pF ≤ 100Vpk</text>

            <!-- 2. CH2 Input BNC Terminal at (165, 268) -->
            <circle cx="165" cy="268" r="11" fill="#082f49" stroke="#0891b2" stroke-width="1.8"/>
            <circle cx="165" cy="268" r="7.5" fill="#0e7490"/>
            <circle cx="165" cy="268" r="3.5" fill="#67e8f9"/>
            <text x="165" y="253" fill="#67e8f9" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="900" text-anchor="middle">CH 2 (Y)</text>
            <text x="165" y="284" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">1MΩ 15pF ≤ 100Vpk</text>

            <!-- 3. GND Reference Terminal at (260, 268) -->
            <circle cx="260" cy="268" r="11" fill="#0f172a" stroke="#475569" stroke-width="1.8"/>
            <circle cx="260" cy="268" r="7.5" fill="#1e293b"/>
            <circle cx="260" cy="268" r="3.5" fill="#cbd5e1"/>
            <text x="260" y="253" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="900" text-anchor="middle">GND (⏚)</text>
            <text x="260" y="284" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5.5" text-anchor="middle">CHASSIS GROUND</text>

            <!-- 4. Probe Calibrator Reference Terminal Loop at (345, 268) -->
            <g class="dso-cal-btn" style="cursor: pointer;" title="Probe Calibrator: 1kHz 3.0Vpp Square Reference Loop">
              <circle cx="345" cy="268" r="6" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
              <path d="M 342 268 C 342 263, 348 263, 348 268" stroke="#f59e0b" stroke-width="1.8" fill="none"/>
              <text x="345" y="256" fill="#e2e8f0" font-family="'JetBrains Mono', monospace" font-size="5.8" font-weight="900" text-anchor="middle">CAL 1kHz</text>
              <text x="345" y="281" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="5.2" text-anchor="middle">3.0Vpp</text>
            </g>

            <!-- 5. Main Power Switch & LED at (405, 268) -->
            <rect x="395" y="260" width="20" height="16" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
            <circle cx="405" cy="268" r="3.5" fill="#fbbf24" />
            <text x="405" y="255" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="900" text-anchor="middle">POWER</text>

            ${isBurnt ? `
              <rect x="12" y="12" width="416" height="276" rx="8" fill="#000000" opacity="0.85" filter="blur(3px)"/>
              <text x="220" y="160" font-size="48" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }
      case 'gate_and':
      case 'gate_or':
      case 'gate_not':
      case 'gate_nand':
      case 'gate_nor':
      case 'gate_xor':
      case 'gate_xnor': {
        const isNot = comp.type === 'gate_not';
        const inA = state.inputA ? 1 : 0;
        const inB = state.inputB ? 1 : 0;
        const outY = state.outputLevel ? 1 : 0;
        const w = isNot ? 140 : 150;
        const h = isNot ? 80 : 100;

        let symPath = '';
        let hasBubble = false;

        switch (comp.type) {
          case 'gate_and':
            symPath = `<path d="M 58 32 L 76 32 A 18 18 0 0 1 76 68 L 58 68 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>`;
            break;
          case 'gate_or':
            symPath = `<path d="M 56 32 Q 66 50 56 68 Q 82 68 92 50 Q 82 32 56 32 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>`;
            break;
          case 'gate_not':
            hasBubble = true;
            symPath = `
              <polygon points="52,24 80,40 52,56" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>
              <circle cx="84" cy="40" r="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            `;
            break;
          case 'gate_nand':
            hasBubble = true;
            symPath = `
              <path d="M 56 32 L 74 32 A 18 18 0 0 1 74 68 L 56 68 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>
              <circle cx="95" cy="50" r="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            `;
            break;
          case 'gate_nor':
            hasBubble = true;
            symPath = `
              <path d="M 54 32 Q 64 50 54 68 Q 80 68 90 50 Q 80 32 54 32 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>
              <circle cx="96" cy="50" r="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            `;
            break;
          case 'gate_xor':
            symPath = `
              <path d="M 50 32 Q 60 50 50 68" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
              <path d="M 56 32 Q 66 50 56 68 Q 82 68 92 50 Q 82 32 56 32 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>
            `;
            break;
          case 'gate_xnor':
            hasBubble = true;
            symPath = `
              <path d="M 48 32 Q 58 50 48 68" fill="none" stroke="#38bdf8" stroke-width="2.4"/>
              <path d="M 54 32 Q 64 50 54 68 Q 80 68 90 50 Q 80 32 54 32 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.4"/>
              <circle cx="96" cy="50" r="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
            `;
            break;
        }

        content = `
          <g class="comp-logic-gate gate-${comp.type}">
            <!-- Transparent Drag Hit Area (No background box) -->
            <rect x="0" y="0" width="${w}" height="${h}" fill="none" pointer-events="all"/>

            ${isNot ? `
              <!-- Input A Lead & Interactive Toggle -->
              <g class="gate-input-toggle" data-pin="a" style="cursor: pointer;" title="Toggle Input A">
                <line x1="12" y1="40" x2="52" y2="40" stroke="${inA ? '#38bdf8' : '#475569'}" stroke-width="${inA ? 3.5 : 2.2}"/>
                <circle cx="28" cy="40" r="3.5" fill="${inA ? '#38bdf8' : '#1e293b'}" stroke="${inA ? '#bae6fd' : '#475569'}" stroke-width="1.2"/>
                <text x="28" y="27" fill="${inA ? '#38bdf8' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" text-anchor="middle">A</text>
              </g>

              <!-- Central IEEE Symbol -->
              ${symPath}

              <!-- Output Y Lead & Indicator -->
              <line x1="88" y1="40" x2="128" y2="40" stroke="${outY ? '#fbbf24' : '#475569'}" stroke-width="${outY ? 3.8 : 2.2}"/>
              <circle cx="110" cy="40" r="4.5" fill="${outY ? '#f59e0b' : '#1e293b'}" stroke="${outY ? '#fbbf24' : '#475569'}" stroke-width="1.5"/>
              <text x="110" y="27" fill="${outY ? '#fbbf24' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" text-anchor="middle">Y</text>
            ` : `
              <!-- Input A Lead & Interactive Toggle -->
              <g class="gate-input-toggle" data-pin="a" style="cursor: pointer;" title="Toggle Input A">
                <line x1="12" y1="30" x2="55" y2="38" stroke="${inA ? '#38bdf8' : '#475569'}" stroke-width="${inA ? 3.5 : 2.2}"/>
                <circle cx="30" cy="32" r="3.5" fill="${inA ? '#38bdf8' : '#1e293b'}" stroke="${inA ? '#bae6fd' : '#475569'}" stroke-width="1.2"/>
                <text x="30" y="21" fill="${inA ? '#38bdf8' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" text-anchor="middle">A</text>
              </g>

              <!-- Input B Lead & Interactive Toggle -->
              <g class="gate-input-toggle" data-pin="b" style="cursor: pointer;" title="Toggle Input B">
                <line x1="12" y1="70" x2="55" y2="62" stroke="${inB ? '#38bdf8' : '#475569'}" stroke-width="${inB ? 3.5 : 2.2}"/>
                <circle cx="30" cy="68" r="3.5" fill="${inB ? '#38bdf8' : '#1e293b'}" stroke="${inB ? '#bae6fd' : '#475569'}" stroke-width="1.2"/>
                <text x="30" y="86" fill="${inB ? '#38bdf8' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" text-anchor="middle">B</text>
              </g>

              <!-- Central IEEE Symbol -->
              ${symPath}

              <!-- Output Y Lead & Indicator -->
              <line x1="${hasBubble ? 100 : 92}" y1="50" x2="138" y2="50" stroke="${outY ? '#fbbf24' : '#475569'}" stroke-width="${outY ? 3.8 : 2.2}"/>
              <circle cx="118" cy="50" r="5" fill="${outY ? '#f59e0b' : '#1e293b'}" stroke="${outY ? '#fbbf24' : '#475569'}" stroke-width="1.5"/>
              <text x="118" y="36" fill="${outY ? '#fbbf24' : '#94a3b8'}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="900" text-anchor="middle">Y</text>
            `}

            ${isBurnt ? `
              <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="6" fill="#000000" opacity="0.85" filter="blur(2px)"/>
              <text x="${w / 2}" y="${h / 2 + 8}" font-size="28" text-anchor="middle">💥</text>
            ` : ''}
          </g>
        `;
        break;
      }
      case 'ic_7408':
      case 'ic_7432':
      case 'ic_7404':
      case 'ic_7486':
      case 'ic_7400':
      case 'ic_7402':
      case 'ic_74266': {
        content = ComponentRenderer.renderDIP14(comp);
        break;
      }
    }

    // All components are rendered directly at 1:1 bounds matching def.terminals exactly
    const needsScale130 = false;
    let scaledContent = content;

    // Determine custom name if applicable
    let customName = null;
    if (comp.type === 'resistor') {
      const ohms = getClosestStandardResistor(comp.state.resistance || 220);
      customName = `FIXED RESISTOR (${formatResistance(ohms)})`;
    } else if (comp.type === 'switch') {
      customName = `SINGLE POLE SWITCH ${comp.state.closed ? '(ON)' : '(OFF)'}`;
    } else if (comp.type === 'multimeter') {
      const m = (comp.state.mode || 'dcv').toUpperCase();
      customName = `DIGITAL MULTIMETER [${m}]`;
    } else if (comp.type === 'npn') {
      customName = `NPN TRANSISTOR ${comp.state.conducting ? '(ON)' : '(OFF)'}`;
    } else if (comp.type === 'pnp') {
      customName = `PNP TRANSISTOR ${comp.state.conducting ? '(ON)' : '(OFF)'}`;
    } else if (comp.type === 'ldr') {
      const rStr = formatResistance(comp.state.resistance || 10000);
      const coeff = (comp.state.coefficient === 'positive') ? 'PTC' : 'NTC';
      customName = `LDR SENSOR (${rStr} · ${coeff})`;
    } else if (comp.type === 'capacitor') {
      const v = comp.state.storedVoltage || 0;
      const c = comp.state.capacitance || 1000;
      const vRat = comp.state.ratedVoltage || 16;
      customName = `${vRat}V ${c}µF CAPACITOR (${v.toFixed(1)}V)`;
    } else if (comp.type === 'ceramic_capacitor') {
      const code = comp.state.ceramicCode || '104';
      const nf = comp.state.capacitanceNf || 100;
      const pf = comp.state.capacitancePf || (nf * 1000);
      const capStr = pf < 1000 ? `${pf}pF` : (nf < 1000 ? `${nf}nF` : `${comp.state.capacitanceUf || 0.1}µF`);
      customName = `CERAMIC CAP [${code}] (${capStr})`;
    } else if (comp.type === 'solenoid') {
      const b = (comp.state.magneticFieldB || 0).toFixed(1);
      customName = `SOLENOID ACTUATOR (${comp.state.mode === 'pinball' ? 'PINBALL' : 'CRANE'})`;
    } else if (comp.type === 'rectifier') {
      customName = `BRIDGE RECTIFIER (FULL-WAVE)`;
    } else if (comp.type === 'inductor') {
      const mh = comp.state.inductanceMh || (comp.state.inductanceUh ? comp.state.inductanceUh / 1000 : 10);
      customName = `POWER INDUCTOR (${formatInductance(mh)})`;
    } else if (comp.type === 'ammeter') {
      const cur = Math.abs(comp.state.current || 0);
      const curStr = cur >= 1 ? `${cur.toFixed(2)}A` : `${(cur * 1000).toFixed(1)}mA`;
      customName = `DC AMMETER (${curStr})`;
    } else if (comp.type === 'voltmeter') {
      const v = Math.abs(comp.state.measuredVoltage || comp.state.voltageDrop || 0);
      customName = `DC VOLTMETER (${v.toFixed(2)}V)`;
    } else if (comp.type === 'wattmeter') {
      const p = Math.abs(comp.state.power || 0);
      const pStr = p >= 1 ? `${p.toFixed(2)}W` : `${(p * 1000).toFixed(1)}mW`;
      customName = `WATTMETER (${pStr})`;
    } else if (comp.type === 'power_supply') {
      const vSet = (comp.state.voltage !== undefined ? comp.state.voltage : 12).toFixed(1);
      const iLim = (comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5).toFixed(2);
      const mode = (comp.state.mode || 'cv').toUpperCase();
      const onOff = comp.state.outputEnabled !== false ? 'ON' : 'OFF';
      customName = `DC POWER SUPPLY [${vSet}V / ${iLim}A] (${mode} • ${onOff})`;
    } else if (comp.type === 'fuse') {
      const r = (comp.state.rating !== undefined ? comp.state.rating : 2.0).toFixed(1);
      const isBlown = comp.state.blown || comp.state.burnt;
      customName = `GLASS FUSE (${r}A • ${isBlown ? 'BLOWN 💥' : 'INTACT'})`;
    } else if (comp.type === 'function_generator') {
      const f = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
      const fStr = f >= 1000 ? `${(f / 1000).toFixed(1)}kHz` : `${f.toFixed(0)}Hz`;
      const vpp = (comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 10).toFixed(1);
      const w = (comp.state.waveform || 'sine').toUpperCase();
      const onOff = comp.state.outputEnabled !== false ? 'ON' : 'OFF';
      customName = `SIG-GEN [${w} ${fStr} ${vpp}Vpp] (${onOff})`;
    } else if (comp.type === 'oscilloscope') {
      const rs = (comp.state.runStop || 'run').toUpperCase();
      const tb = comp.state.timeDiv || 0.001;
      const tbStr = tb >= 0.001 ? `${(tb * 1000).toFixed(tb % 0.001 === 0 ? 0 : 1)}ms` : `${(tb * 1000000).toFixed(0)}µs`;
      const f = comp.state.ch1Signal ? (comp.state.ch1Signal.freq || 0) : 0;
      const fStr = f >= 1000 ? `${(f / 1000).toFixed(1)}kHz` : `${f.toFixed(0)}Hz`;
      const ch1v = (comp.state.ch1VoltsDiv || 2.0).toFixed(1);
      customName = `DSO [${rs}] (${tbStr}/div • CH1 ${ch1v}V • ${f > 0 ? fStr : '0Hz'})`;
    } else if (comp.type && comp.type.startsWith('gate_')) {
      const gName = comp.type.replace('gate_', '').toUpperCase();
      customName = `${gName} GATE`;
    } else if (comp.type && comp.type.startsWith('ic_')) {
      const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[comp.type];
      customName = spec ? `IC ${spec.code} (${spec.gateDesc})` : comp.name;
    }

    // Overlays for Burning & Burnt states
    if (isBurning) {
      scaledContent += ComponentRenderer.renderBurningOverlay(def.width, def.height);
    } else if (isBurnt) {
      scaledContent += ComponentRenderer.renderBurntOverlay(def.width, def.height);
    }

    return scaledContent;
  }

  static getComponentDisplayName(comp) {
    const def = COMPONENT_DEFINITIONS[comp.type];
    let displayName = def ? def.name : comp.type;
    if (comp.type === 'resistor') {
      const ohms = getClosestStandardResistor(comp.state.resistance || 220);
      displayName = `FIXED RESISTOR (${formatResistance(ohms)})`;
    } else if (comp.type === 'switch') {
      displayName = `SINGLE POLE SWITCH ${comp.state.closed ? '(ON)' : '(OFF)'}`;
    } else if (comp.type === 'twowayswitch') {
      displayName = `TWO-WAY SWITCH (L${comp.state.position || 1})`;
    } else if (comp.type === 'potentiometer') {
      displayName = `POTENTIOMETER (${comp.state.resistance || 500}Ω)`;
    } else if (comp.type === 'multimeter') {
      const m = (comp.state.mode || 'dcv').toUpperCase();
      displayName = `DIGITAL MULTIMETER [${m}]`;
    } else if (comp.type === 'npn') {
      displayName = `NPN TRANSISTOR ${comp.state.conducting ? '(ON)' : '(OFF)'}`;
    } else if (comp.type === 'pnp') {
      displayName = `PNP TRANSISTOR ${comp.state.conducting ? '(ON)' : '(OFF)'}`;
    } else if (comp.type === 'ldr') {
      const rStr = formatResistance(comp.state.resistance || 10000);
      const coeff = (comp.state.coefficient === 'positive') ? 'PTC' : 'NTC';
      displayName = `LDR SENSOR (${rStr} · ${coeff})`;
    } else if (comp.type === 'capacitor') {
      const v = comp.state.storedVoltage || 0;
      const c = comp.state.capacitance || 1000;
      const vRat = comp.state.ratedVoltage || 16;
      displayName = `${vRat}V ${c}µF CAPACITOR (${v.toFixed(1)}V)`;
    } else if (comp.type === 'ceramic_capacitor') {
      const code = comp.state.ceramicCode || '104';
      const nf = comp.state.capacitanceNf || 100;
      const pf = comp.state.capacitancePf || (nf * 1000);
      const capStr = pf < 1000 ? `${pf}pF` : (nf < 1000 ? `${nf}nF` : `${comp.state.capacitanceUf || 0.1}µF`);
      displayName = `CERAMIC CAP [${code}] (${capStr})`;
    } else if (comp.type === 'solenoid') {
      displayName = `SOLENOID ACTUATOR (${comp.state.mode === 'pinball' ? 'PINBALL' : 'CRANE'})`;
    } else if (comp.type === 'rectifier') {
      displayName = `BRIDGE RECTIFIER (FULL-WAVE)`;
    } else if (comp.type === 'inductor') {
      const mh = comp.state.inductanceMh || (comp.state.inductanceUh ? comp.state.inductanceUh / 1000 : 10);
      displayName = `POWER INDUCTOR (${formatInductance(mh)})`;
    } else if (comp.type === 'ammeter') {
      const cur = Math.abs(comp.state.current || 0);
      const curStr = cur >= 1 ? `${cur.toFixed(2)}A` : `${(cur * 1000).toFixed(1)}mA`;
      displayName = `PRECISION AMMETER (${curStr})`;
    } else if (comp.type === 'voltmeter') {
      const v = Math.abs(comp.state.measuredVoltage || comp.state.voltageDrop || 0);
      displayName = `PRECISION VOLTMETER (${v.toFixed(2)}V)`;
    } else if (comp.type === 'wattmeter') {
      const p = Math.abs(comp.state.power || 0);
      const pStr = p >= 1 ? `${p.toFixed(2)}W` : `${(p * 1000).toFixed(1)}mW`;
      displayName = `WATTMETER (${pStr})`;
    } else if (comp.type === 'power_supply') {
      const vSet = (comp.state.voltage !== undefined ? comp.state.voltage : 12).toFixed(1);
      const iLim = (comp.state.currentLimit !== undefined ? comp.state.currentLimit : 2.5).toFixed(2);
      const mode = (comp.state.mode || 'cv').toUpperCase();
      const onOff = comp.state.outputEnabled !== false ? 'ON' : 'OFF';
      displayName = `DC POWER SUPPLY [${vSet}V / ${iLim}A] (${mode} • ${onOff})`;
    } else if (comp.type === 'fuse') {
      const r = (comp.state.rating !== undefined ? comp.state.rating : 2.0).toFixed(1);
      const isBlown = comp.state.blown || comp.state.burnt;
      displayName = `GLASS FUSE (${r}A • ${isBlown ? 'BLOWN 💥' : 'INTACT'})`;
    } else if (comp.type === 'function_generator') {
      const f = comp.state.frequency !== undefined ? comp.state.frequency : 1000;
      const fStr = f >= 1000 ? `${(f / 1000).toFixed(1)}kHz` : `${f.toFixed(0)}Hz`;
      const vpp = (comp.state.amplitudeVpp !== undefined ? comp.state.amplitudeVpp : 10).toFixed(1);
      const w = (comp.state.waveform || 'sine').toUpperCase();
      const onOff = comp.state.outputEnabled !== false ? 'ON' : 'OFF';
      displayName = `SIG-GEN [${w} ${fStr} ${vpp}Vpp] (${onOff})`;
    } else if (comp.type === 'oscilloscope') {
      const rs = (comp.state.runStop || 'run').toUpperCase();
      const tb = comp.state.timeDiv || 0.001;
      const tbStr = tb >= 0.001 ? `${(tb * 1000).toFixed(tb % 0.001 === 0 ? 0 : 1)}ms` : `${(tb * 1000000).toFixed(0)}µs`;
      const f = comp.state.ch1Signal ? (comp.state.ch1Signal.freq || 0) : 0;
      const fStr = f >= 1000 ? `${(f / 1000).toFixed(1)}kHz` : `${f.toFixed(0)}Hz`;
      const ch1v = (comp.state.ch1VoltsDiv || 2.0).toFixed(1);
      displayName = `DSO [${rs}] (${tbStr}/div • CH1 ${ch1v}V • ${f > 0 ? fStr : '0Hz'})`;
    } else if (comp.type === 'buzzer') {
      if (comp.state.sounding && comp.state.voltageDrop > 0) {
        const freq = Math.min(2400, Math.max(280, Math.round(380 + (comp.state.voltageDrop / 9.0) * 700)));
        displayName = `BUZZER (${comp.state.voltageDrop.toFixed(1)}V • ${freq}Hz)`;
      } else {
        displayName = 'ELECTRONIC BUZZER';
      }
    } else if (comp.type === 'ac_source') {
      const v = comp.state.voltage || 230;
      const i = comp.state.current || 0;
      const w = comp.state.power || 0;
      const iStr = i >= 1 ? `${i.toFixed(2)}A` : `${(i * 1000).toFixed(0)}mA`;
      const wStr = w >= 1 ? `${w.toFixed(1)}W` : `${(w * 1000).toFixed(0)}mW`;
      displayName = `AC SUPPLY (${v}V~ • ${iStr} • ${wStr})`;
    } else if (comp.type === 'transformer') {
      const priV = comp.state.primaryV || 230;
      const secV = comp.state.secondaryV || 12;
      const w = comp.state.secondaryPower || comp.state.power || 0;
      const wStr = w >= 1 ? `${w.toFixed(1)}W` : `${(w * 1000).toFixed(0)}mW`;
      displayName = `TRANSFORMER (${priV}V➔${secV}V • ${wStr})`;
    } else if (comp.type === 'battery' || comp.type === 'cell' || comp.type === 'cell3v') {
      const v = comp.voltage || (comp.type === 'cell3v' ? 3.0 : (comp.type === 'cell' ? 1.5 : 9.0));
      displayName = `${comp.type === 'battery' ? '9V BATTERY' : 'DRY CELL'} (${v.toFixed(1)}V)`;
    } else if (comp.type === 'npn') {
      const reg = comp.state ? (comp.state.operatingRegime || (comp.state.conducting ? 'saturation' : 'cutoff')) : 'cutoff';
      const tag = reg === 'saturation' ? 'SATURATION · ON' : (reg === 'active' ? 'ACTIVE REGION' : 'CUTOFF · OFF');
      displayName = `NPN TRANSISTOR (${tag})`;
    } else if (comp.type === 'pnp') {
      const reg = comp.state ? (comp.state.operatingRegime || (comp.state.conducting ? 'saturation' : 'cutoff')) : 'cutoff';
      const tag = reg === 'saturation' ? 'SATURATION · ON' : (reg === 'active' ? 'ACTIVE REGION' : 'CUTOFF · OFF');
      displayName = `PNP TRANSISTOR (${tag})`;
    } else if (comp.type && comp.type.startsWith('gate_')) {
      const gName = comp.type.replace('gate_', '').toUpperCase();
      return `${gName} GATE`;
    } else if (comp.type && comp.type.startsWith('ic_')) {
      const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[comp.type];
      return spec ? `IC ${spec.code} (${spec.gateDesc.toUpperCase()})` : comp.name;
    }
    return displayName.replace(/[💡🚨🔋🪙⚙️⚡🥋🎛️🔊🌊📟]/g, '').trim().toUpperCase();
  }

  static renderDIP14(comp) {
    const state = comp.state || {};
    const type = comp.type;
    const spec = (window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[type]) || {
      code: '7408',
      fullName: 'SN74HC08N',
      gateType: 'AND',
      gateDesc: 'Quad 2-Input AND Gate',
      numGates: 4,
      gatePins: []
    };

    const isBurnt = state.burnt || false;
    const isBurning = state.burning || false;
    const isPowered = !isBurnt && (state.powered || state.manualPower);
    const vccVolt = isBurnt ? 0.0 : (state.vccVoltage || (state.manualPower ? 5.0 : 0.0));
    const totalCurrent = state.current || 0.0;
    const gates = state.gates || [];

    // Helper to get gate state
    const getGate = (id) => gates.find(g => g.id === id) || { inA: 0, inB: 0, out: 0, outV: 0, current: 0 };

    // Helper for downward-pointing logic gate symbol
    const renderGateSymbol = (cx, cy, gType, isActive, gateId) => {
      const strokeCol = isActive ? '#f59e0b' : '#475569';
      const fillCol = isActive ? '#78350f' : '#1e293b';
      const glowFilter = isActive ? '' : '';

      switch (gType) {
        case 'AND':
          return `<g data-gate="${gateId}">
            <path d="M ${cx - 10} ${cy - 11} L ${cx + 10} ${cy - 11} L ${cx + 10} ${cy} A 10 11 0 0 1 ${cx - 10} ${cy} Z" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>
          </g>`;
        case 'OR':
          return `<g data-gate="${gateId}">
            <path d="M ${cx - 10} ${cy - 11} Q ${cx} ${cy - 5} ${cx + 10} ${cy - 11} Q ${cx + 10} ${cy + 3} ${cx} ${cy + 13} Q ${cx - 10} ${cy + 3} ${cx - 10} ${cy - 11} Z" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>
          </g>`;
        case 'NOT':
          return `<g data-gate="${gateId}">
            <polygon points="${cx - 9},${cy - 10} ${cx + 9},${cy - 10} ${cx},${cy + 5}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>
            <circle cx="${cx}" cy="${cy + 9}" r="2.5" fill="${fillCol}" stroke="${strokeCol}" stroke-width="1.6"/>
          </g>`;
        case 'NAND':
          return `<g data-gate="${gateId}">
            <path d="M ${cx - 10} ${cy - 11} L ${cx + 10} ${cy - 11} L ${cx + 10} ${cy} A 10 10 0 0 1 ${cx - 10} ${cy} Z" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>
            <circle cx="${cx}" cy="${cy + 13}" r="2.5" fill="${fillCol}" stroke="${strokeCol}" stroke-width="1.6"/>
          </g>`;
        case 'NOR':
          return `<g data-gate="${gateId}">
            <path d="M ${cx - 10} ${cy - 11} Q ${cx} ${cy - 5} ${cx + 10} ${cy - 11} Q ${cx + 10} ${cy + 3} ${cx} ${cy + 12} Q ${cx - 10} ${cy + 3} ${cx - 10} ${cy - 11} Z" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>
            <circle cx="${cx}" cy="${cy + 15}" r="2.5" fill="${fillCol}" stroke="${strokeCol}" stroke-width="1.6"/>
          </g>`;
        case 'XOR':
          return `<g data-gate="${gateId}">
            <path d="M ${cx - 10} ${cy - 15} Q ${cx} ${cy - 9} ${cx + 10} ${cy - 15}" fill="none" stroke="${strokeCol}" stroke-width="1.8"/>
            <path d="M ${cx - 10} ${cy - 11} Q ${cx} ${cy - 5} ${cx + 10} ${cy - 11} Q ${cx + 10} ${cy + 3} ${cx} ${cy + 13} Q ${cx - 10} ${cy + 3} ${cx - 10} ${cy - 11} Z" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>
          </g>`;
        case 'XNOR':
          return `<g data-gate="${gateId}">
            <path d="M ${cx - 10} ${cy - 15} Q ${cx} ${cy - 9} ${cx + 10} ${cy - 15}" fill="none" stroke="${strokeCol}" stroke-width="1.8"/>
            <path d="M ${cx - 10} ${cy - 11} Q ${cx} ${cy - 5} ${cx + 10} ${cy - 11} Q ${cx + 10} ${cy + 3} ${cx} ${cy + 12} Q ${cx - 10} ${cy + 3} ${cx - 10} ${cy - 11} Z" fill="${fillCol}" stroke="${strokeCol}" stroke-width="2"/>
            <circle cx="${cx}" cy="${cy + 15}" r="2.5" fill="${fillCol}" stroke="${strokeCol}" stroke-width="1.6"/>
          </g>`;
        default:
          return '';
      }
    };

    // Helper to render conductive internal trace with optional animated current flow
    const renderTrace = (d, isHigh, isOutput, carriesCurrent) => {
      const strokeCol = isHigh ? (isOutput ? '#f59e0b' : '#38bdf8') : '#334155';
      const strokeW = isHigh ? 2.5 : 1.8;
      const glow = '';
      let animOverlay = '';
      if (isHigh && carriesCurrent) {
        animOverlay = `<path d="${d}" fill="none" stroke="${isOutput ? '#fde68a' : '#7dd3fc'}" stroke-width="2" stroke-dasharray="4 4" class="ic-trace-anim"/>`;
      }
      return `<path d="${d}" fill="none" stroke="${strokeCol}" stroke-width="${strokeW}"/>${animOverlay}`;
    };

    // 14 Metallic Pins (pins 1 to 7 on left, pins 14 to 8 on right)
    const pinYs = [42, 82, 122, 162, 202, 242, 282];
    let pinsSVG = '';
    for (let i = 0; i < 7; i++) {
      const pinNum = i + 1;
      const y = pinYs[i];
      // Left pin
      pinsSVG += `
        <rect x="4" y="${y - 6}" width="20" height="12" rx="2" fill="#334155" stroke="#475569" stroke-width="1"/>
        <line x1="8" y1="${y}" x2="24" y2="${y}" stroke="#64748b" stroke-width="1.5"/>
        <text x="14" y="${y + 3.5}" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="900" text-anchor="middle">${pinNum}</text>
      `;
      // Right pin
      const rightPinNum = 14 - i;
      pinsSVG += `
        <rect x="156" y="${y - 6}" width="20" height="12" rx="2" fill="#334155" stroke="#475569" stroke-width="1"/>
        <line x1="156" y1="${y}" x2="172" y2="${y}" stroke="#64748b" stroke-width="1.5"/>
        <text x="166" y="${y + 3.5}" fill="#cbd5e1" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="900" text-anchor="middle">${rightPinNum}</text>
      `;
    }

    // Power Bus lines
    const vccPowered = isPowered && vccVolt >= 2.0;
    const vccTrace = renderTrace("M 156 42 L 90 42 L 90 26", vccPowered, false, vccPowered);
    const gndTrace = renderTrace("M 24 282 L 90 282 L 90 298", isPowered, false, isPowered);

    // Dynamic Gates & Internal Traces based on topology
    let internalGatesSVG = '';

    if (type === 'ic_7404') {
      // Hex Inverter (6 Gates)
      const g1 = getGate(1);
      const g2 = getGate(2);
      const g3 = getGate(3);
      const g6 = getGate(6);
      const g5 = getGate(5);
      const g4 = getGate(4);

      // Gate 1: Pin 1 -> Pin 2
      const g1Act = isPowered && g1.out === 1;
      internalGatesSVG += renderTrace("M 24 42 L 62 42 L 62 52", g1.inA === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(62, 62, 'NOT', g1Act, 1);
      internalGatesSVG += renderTrace("M 62 71 L 62 82 L 24 82", g1Act, true, g1Act && (g1.current > 0 || isPowered));

      // Gate 2: Pin 3 -> Pin 4
      const g2Act = isPowered && g2.out === 1;
      internalGatesSVG += renderTrace("M 24 122 L 62 122 L 62 132", g2.inA === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(62, 142, 'NOT', g2Act, 2);
      internalGatesSVG += renderTrace("M 62 151 L 62 162 L 24 162", g2Act, true, g2Act && (g2.current > 0 || isPowered));

      // Gate 3: Pin 5 -> Pin 6
      const g3Act = isPowered && g3.out === 1;
      internalGatesSVG += renderTrace("M 24 202 L 62 202 L 62 212", g3.inA === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(62, 222, 'NOT', g3Act, 3);
      internalGatesSVG += renderTrace("M 62 231 L 62 242 L 24 242", g3Act, true, g3Act && (g3.current > 0 || isPowered));

      // Gate 6: Pin 13 -> Pin 12
      const g6Act = isPowered && g6.out === 1;
      internalGatesSVG += renderTrace("M 156 82 L 118 82 L 118 92", g6.inA === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(118, 102, 'NOT', g6Act, 6);
      internalGatesSVG += renderTrace("M 118 111 L 118 122 L 156 122", g6Act, true, g6Act && (g6.current > 0 || isPowered));

      // Gate 5: Pin 11 -> Pin 10
      const g5Act = isPowered && g5.out === 1;
      internalGatesSVG += renderTrace("M 156 162 L 118 162 L 118 172", g5.inA === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(118, 182, 'NOT', g5Act, 5);
      internalGatesSVG += renderTrace("M 118 191 L 118 202 L 156 202", g5Act, true, g5Act && (g5.current > 0 || isPowered));

      // Gate 4: Pin 9 -> Pin 8
      const g4Act = isPowered && g4.out === 1;
      internalGatesSVG += renderTrace("M 156 242 L 118 242 L 118 252", g4.inA === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(118, 262, 'NOT', g4Act, 4);
      internalGatesSVG += renderTrace("M 118 271 L 118 282 L 156 282", g4Act, true, g4Act && (g4.current > 0 || isPowered));

    } else if (type === 'ic_7402') {
      // Quad NOR (reversed pinout: outputs on 1, 4, 10, 13)
      const g1 = getGate(1);
      const g2 = getGate(2);
      const g4 = getGate(4);
      const g3 = getGate(3);

      // Gate 1: Inputs 2 & 3 -> Output 1
      const g1Act = isPowered && g1.out === 1;
      internalGatesSVG += renderTrace("M 24 82 L 57 82 L 57 69", g1.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 24 122 L 67 122 L 67 69", g1.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(62, 80, 'NOR', g1Act, 1);
      internalGatesSVG += renderTrace("M 62 95 L 62 42 L 24 42", g1Act, true, g1Act && (g1.current > 0 || isPowered));

      // Gate 2: Inputs 5 & 6 -> Output 4
      const g2Act = isPowered && g2.out === 1;
      internalGatesSVG += renderTrace("M 24 202 L 57 202 L 57 189", g2.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 24 242 L 67 242 L 67 189", g2.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(62, 200, 'NOR', g2Act, 2);
      internalGatesSVG += renderTrace("M 62 215 L 62 162 L 24 162", g2Act, true, g2Act && (g2.current > 0 || isPowered));

      // Gate 4: Inputs 11 & 12 -> Output 13
      const g4Act = isPowered && g4.out === 1;
      internalGatesSVG += renderTrace("M 156 162 L 113 162 L 113 109", g4.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 156 122 L 123 122 L 123 109", g4.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(118, 120, 'NOR', g4Act, 4);
      internalGatesSVG += renderTrace("M 118 135 L 118 82 L 156 82", g4Act, true, g4Act && (g4.current > 0 || isPowered));

      // Gate 3: Inputs 8 & 9 -> Output 10
      const g3Act = isPowered && g3.out === 1;
      internalGatesSVG += renderTrace("M 156 282 L 113 282 L 113 229", g3.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 156 242 L 123 242 L 123 229", g3.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(118, 240, 'NOR', g3Act, 3);
      internalGatesSVG += renderTrace("M 118 255 L 118 202 L 156 202", g3Act, true, g3Act && (g3.current > 0 || isPowered));

    } else {
      // Quad Gates (7408 AND, 7432 OR, 7400 NAND, 7486 XOR, 74266 XNOR)
      const gType = spec.gateType || 'AND';
      const hasBubble = gType === 'NAND' || gType === 'XNOR';
      const g1 = getGate(1);
      const g2 = getGate(2);
      const g4 = getGate(4);
      const g3 = getGate(3);

      // Gate 1: Pin 1 (1A) & Pin 2 (1B) -> Pin 3 (1Y)
      const g1Act = isPowered && g1.out === 1;
      internalGatesSVG += renderTrace("M 24 42 L 67 42 L 67 94", g1.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 24 82 L 57 82 L 57 94", g1.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(62, 105, gType, g1Act, 1);
      const g1NoseY = hasBubble ? 118 : 116;
      internalGatesSVG += renderTrace(`M 62 ${g1NoseY} L 62 122 L 24 122`, g1Act, true, g1Act && (g1.current > 0 || isPowered));

      // Gate 2: Pin 4 (2A) & Pin 5 (2B) -> Pin 6 (2Y)
      const g2Act = isPowered && g2.out === 1;
      internalGatesSVG += renderTrace("M 24 162 L 67 162 L 67 214", g2.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 24 202 L 57 202 L 57 214", g2.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(62, 225, gType, g2Act, 2);
      const g2NoseY = hasBubble ? 238 : 236;
      internalGatesSVG += renderTrace(`M 62 ${g2NoseY} L 62 242 L 24 242`, g2Act, true, g2Act && (g2.current > 0 || isPowered));

      // Gate 4: Pin 12 (4A) & Pin 13 (4B) -> Pin 11 (4Y)
      const g4Act = isPowered && g4.out === 1;
      internalGatesSVG += renderTrace("M 156 122 L 123 122 L 123 134", g4.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 156 82 L 113 82 L 113 134", g4.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(118, 145, gType, g4Act, 4);
      const g4NoseY = hasBubble ? 158 : 156;
      internalGatesSVG += renderTrace(`M 118 ${g4NoseY} L 118 162 L 156 162`, g4Act, true, g4Act && (g4.current > 0 || isPowered));

      // Gate 3: Pin 9 (3A) & Pin 10 (3B) -> Pin 8 (3Y)
      const g3Act = isPowered && g3.out === 1;
      internalGatesSVG += renderTrace("M 156 242 L 123 242 L 123 254", g3.inA === 1, false, isPowered);
      internalGatesSVG += renderTrace("M 156 202 L 113 202 L 113 254", g3.inB === 1, false, isPowered);
      internalGatesSVG += renderGateSymbol(118, 265, gType, g3Act, 3);
      const g3NoseY = hasBubble ? 278 : 276;
      internalGatesSVG += renderTrace(`M 118 ${g3NoseY} L 118 282 L 156 282`, g3Act, true, g3Act && (g3.current > 0 || isPowered));
    }

    // Power Indicator LED & Status Tag
    const pwrColor = isBurnt ? '#ef4444' : (vccPowered ? '#f59e0b' : '#64748b');
    const pwrGlow = vccPowered ? '' : (isBurnt ? '' : '');
    const pwrText = isBurnt ? 'BURN' : (vccPowered ? `${vccVolt.toFixed(1)}V` : 'OFF');

    return `
      <g class="comp-dip14" data-type="${type}">
        <!-- Metallic Lead Frame Pins -->
        ${pinsSVG}

        <!-- Dark Ceramic / Epoxy Package Body -->
        <rect x="24" y="16" width="132" height="298" rx="8" fill="#090d16" stroke="#334155" stroke-width="2.5"/>
        <rect x="28" y="20" width="124" height="290" rx="6" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Top Notch & Pin 1 Orientation Dot -->
        <path d="M 80 16 A 10 10 0 0 0 100 16 Z" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
        <circle cx="40" cy="30" r="4" fill="#1e293b" stroke="#475569" stroke-width="1.2"/>
        <circle cx="40" cy="30" r="1.8" fill="#090d16"/>

        <!-- Power Supply & Ground Internal Rails -->
        ${vccTrace}
        ${gndTrace}
        <text x="146" y="38" fill="#ef4444" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="end">VCC</text>
        <text x="34" y="280" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900">GND</text>

        <!-- Power Indicator LED & Toggle Button -->
        <g class="ic-pwr-toggle" style="cursor: pointer;" title="IC Power Status (Recommended 5.0V). Click to test!">
          <circle cx="132" cy="27" r="4.5" fill="${pwrColor}" stroke="#1e293b" stroke-width="1"/>
          <text x="132" y="21" fill="${pwrColor}" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="900" text-anchor="middle">PWR</text>
          <text x="132" y="37" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5" font-weight="700" text-anchor="middle">${pwrText}</text>
        </g>

        <!-- Center Laser Marking -->
        <g opacity="0.85">
          <text x="90" y="174" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="900" text-anchor="middle" letter-spacing="1.2">${spec.fullName || spec.code}</text>
          <text x="90" y="185" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="700" text-anchor="middle">${spec.gateDesc.toUpperCase()}</text>
          <text x="90" y="194" fill="#475569" font-family="'JetBrains Mono', monospace" font-size="4.8" text-anchor="middle">5.0V NOMINAL (2V-6V)</text>
        </g>

        <!-- Downward Logic Gates & Internal Traces -->
        ${internalGatesSVG}

        <!-- Overvoltage Burnout Scorched Damage & Smoke Overlay -->
        ${isBurnt ? `
          <rect x="26" y="18" width="128" height="294" rx="7" fill="#000000" opacity="0.88" filter="blur(2px)"/>
          <circle cx="90" cy="165" r="45" fill="#7f1d1d" opacity="0.45" filter="blur(10px)"/>
          <text x="90" y="155" font-size="34" text-anchor="middle">💥</text>
          <text x="90" y="180" fill="#f87171" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" text-anchor="middle">OVERVOLTAGE</text>
          <text x="90" y="193" fill="#fca5a5" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="700" text-anchor="middle">&gt; 7.0V EXCEEDED</text>
        ` : ''}
      </g>
    `;
  }

  static renderFloatingHeader(comp) {
    const isTransistor = comp.type === 'npn' || comp.type === 'pnp';
    const isLogicGate = (comp.type && comp.type.startsWith('gate_')) || (comp.type && comp.type.startsWith('ic_'));
    const symbolSVG = ComponentRenderer.getSchematicSymbol(comp.type, comp);
    const displayName = ComponentRenderer.getComponentDisplayName(comp);
    const pnpClass = comp.type === 'pnp' ? 'badge-pnp' : '';

    if (isLogicGate) {
      return `
        <div class="comp-floating-header" id="header-${comp.id}">
          <div class="comp-header-name-badge">
            ${displayName}
          </div>
        </div>
      `;
    }

    return `
      <div class="comp-floating-header" id="header-${comp.id}">
        <!-- 1. Schematic Symbol (Upper-most, ABOVE Component Name) -->
        <div class="comp-header-symbol-badge ${isTransistor ? 'symbol-badge-transistor ' + pnpClass : ''}" title="Schematic Symbol: ${comp.type.toUpperCase()}">
          <svg viewBox="${isTransistor ? '0 0 88 56' : '0 0 28 18'}" class="comp-schematic-svg">
            ${symbolSVG}
          </svg>
        </div>
        <!-- 2. Component Name (Directly below Schematic Symbol) with neat distance -->
        <div class="comp-header-name-badge">
          ${displayName}
        </div>
      </div>
    `;
  }

  static renderComponentTopHeader(type, width, compNameOverride = null) {
    const symbolSVG = ComponentRenderer.getSchematicSymbol(type);
    let displayName = compNameOverride;
    if (!displayName) {
      const def = COMPONENT_DEFINITIONS[type];
      displayName = def ? def.name : type;
    }
    // Clean up name for top header (remove emoji icons and keep bold & clear)
    displayName = displayName.replace(/[💡🚨🔋🪙⚙️⚡🥋🎛️🔊🌊📟]/g, '').trim().toUpperCase();

    const cx = Math.round(width / 2);
    const boxW = Math.min(width - 12, Math.max(105, displayName.length * 6.8 + 22));
    const boxX = Math.round(cx - boxW / 2);

    return `
      <g class="comp-upper-header" pointer-events="none">
        <!-- 1. Schematic Symbol (Upper most, ABOVE Component Name) -->
        <g class="comp-top-symbol" transform="translate(${cx - 15}, 3)">
          <rect x="-3" y="-1" width="36" height="18" rx="4" fill="rgba(15, 23, 42, 0.94)" stroke="rgba(255, 255, 255, 0.7)" stroke-width="1.2"/>
          <g transform="translate(1, 0)">
            ${symbolSVG}
          </g>
        </g>
        <!-- 2. Component Name (Directly below Schematic Symbol) -->
        <g class="comp-top-name" transform="translate(0, 23)">
          <rect x="${boxX}" y="0" width="${boxW}" height="15" rx="3.5" fill="rgba(15, 23, 42, 0.94)" stroke="rgba(251, 191, 36, 0.6)" stroke-width="1"/>
          <text x="${cx}" y="11" fill="#fbbf24" font-family="'Outfit', sans-serif" font-size="9.5" font-weight="900" text-anchor="middle" letter-spacing="0.4">
            ${displayName}
          </text>
        </g>
      </g>
    `;
  }

  static getSchematicSymbol(type, comp = null) {
    switch (type) {
      case 'battery':
        return `<g stroke="#ffffff" stroke-width="1.6"><line x1="2" y1="9" x2="8" y2="9"/><line x1="8" y1="4" x2="8" y2="14"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="16" y1="4" x2="16" y2="14"/><line x1="20" y1="6" x2="20" y2="12"/><line x1="20" y1="9" x2="26" y2="9"/></g>`;
      case 'cell':
      case 'cell3v':
        return `<g stroke="#ffffff" stroke-width="1.6"><line x1="2" y1="9" x2="10" y2="9"/><line x1="10" y1="3" x2="10" y2="15"/><line x1="16" y1="6" x2="16" y2="12"/><line x1="16" y1="9" x2="26" y2="9"/></g>`;
      case 'led':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><line x1="2" y1="9" x2="8" y2="9"/><polygon points="8,4 8,14 16,9" fill="#ffffff"/><line x1="16" y1="4" x2="16" y2="14"/><line x1="16" y1="9" x2="24" y2="9"/><line x1="13" y1="4" x2="17" y2="1" stroke-width="1.3"/><line x1="16" y1="5" x2="20" y2="2" stroke-width="1.3"/></g>`;
      case 'bulb':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><circle cx="13" cy="9" r="6"/><line x1="2" y1="9" x2="7" y2="9"/><line x1="19" y1="9" x2="24" y2="9"/><line x1="9" y1="5" x2="17" y2="13"/><line x1="9" y1="13" x2="17" y2="5"/></g>`;
      case 'motor':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><circle cx="13" cy="9" r="6"/><line x1="2" y1="9" x2="7" y2="9"/><line x1="19" y1="9" x2="24" y2="9"/><text x="13" y="12" font-size="8" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">M</text></g>`;
      case 'diode':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><line x1="2" y1="9" x2="9" y2="9"/><polygon points="9,4 9,14 17,9" fill="#ffffff"/><line x1="17" y1="4" x2="17" y2="14"/><line x1="17" y1="9" x2="24" y2="9"/></g>`;
      case 'switch':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><circle cx="7" cy="11" r="2" fill="#ffffff"/><circle cx="19" cy="11" r="2" fill="#ffffff"/><line x1="2" y1="11" x2="5" y2="11"/><line x1="21" y1="11" x2="24" y2="11"/><line x1="7" y1="10" x2="18" y2="4"/></g>`;
      case 'twowayswitch':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><circle cx="6" cy="9" r="2" fill="#ffffff"/><circle cx="20" cy="5" r="2" fill="#ffffff"/><circle cx="20" cy="13" r="2" fill="#ffffff"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="22" y1="5" x2="24" y2="5"/><line x1="22" y1="13" x2="24" y2="13"/><line x1="7" y1="9" x2="18" y2="5"/></g>`;
      case 'pushbutton':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><circle cx="7" cy="12" r="2" fill="#ffffff"/><circle cx="19" cy="12" r="2" fill="#ffffff"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="21" y1="12" x2="24" y2="12"/><line x1="7" y1="7" x2="19" y2="7"/><line x1="13" y1="2" x2="13" y2="7"/></g>`;
      case 'resistor':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><polyline points="2,9 6,9 8,5 11,13 14,5 17,13 19,9 24,9"/></g>`;
      case 'potentiometer':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><polyline points="2,11 5,11 7,8 10,14 13,8 16,14 18,11 22,11"/><line x1="12" y1="3" x2="12" y2="7"/><polygon points="10,5 14,5 12,8" fill="#ffffff"/></g>`;
      case 'buzzer':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><path d="M 9 5 C 9 5, 17 5, 17 12 L 9 12 Z"/><line x1="13" y1="12" x2="13" y2="15"/><line x1="5" y1="15" x2="21" y2="15"/></g>`;
      case 'transformer':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><path d="M 5 3 C 10 3, 10 9, 5 9 C 10 9, 10 15, 5 15"/><path d="M 21 3 C 16 3, 16 9, 21 9 C 16 9, 16 15, 21 15"/><line x1="12" y1="2" x2="12" y2="16" stroke="#ffffff" stroke-width="1.3"/><line x1="14" y1="2" x2="14" y2="16" stroke="#ffffff" stroke-width="1.3"/></g>`;
      case 'ac_source':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none"><circle cx="13" cy="9" r="6"/><line x1="2" y1="9" x2="7" y2="9"/><line x1="19" y1="9" x2="24" y2="9"/><path d="M 10 9 Q 11.5 6, 13 9 T 16 9" stroke="#ffffff"/></g>`;
      case 'multimeter':
        return `<g stroke="#ffffff" stroke-width="1.5" fill="none"><rect x="3" y="1" width="22" height="16" rx="2.5"/><text x="14" y="12" font-size="7.5" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">VΩ</text></g>`;
      case 'npn': {
        const isConducting = comp && comp.state && comp.state.conducting;
        const regime = (comp && comp.state && comp.state.operatingRegime) || (isConducting ? 'saturation' : 'cutoff');
        const isSat = isConducting && regime === 'saturation';
        const isActive = isConducting && regime === 'active';

        const strokeCollector = isSat ? '#fbbf24' : (isActive ? '#f59e0b' : '#38bdf8');
        const strokeEmitter = isSat ? '#fbbf24' : (isActive ? '#f59e0b' : '#ef4444');
        const strokeArrow = isSat ? '#fbbf24' : (isActive ? '#f59e0b' : '#ef4444');
        const strokeBar = '#ffffff';
        const strokeBase = '#f59e0b';
        const watermarkText = isSat ? 'NPN ON' : (isActive ? 'NPN ACT' : 'NPN');
        const watermarkColor = isSat ? '#fbbf24' : (isActive ? '#f59e0b' : 'rgba(255, 255, 255, 0.28)');
        const glowStroke = isSat ? 'rgba(245, 158, 11, 0.5)' : (isActive ? 'rgba(245, 158, 11, 0.5)' : 'rgba(56, 189, 248, 0.3)');
        return `
          <g class="schematic-npn" fill="none">
            <!-- Glass Schematic Envelope Circle -->
            <circle cx="44" cy="28" r="18" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(255, 255, 255, 0.85)" stroke-width="2"/>
            <circle cx="44" cy="28" r="18" fill="none" stroke="${glowStroke}" stroke-width="3" opacity="0.8"/>
            
            <!-- Type Watermark in open space -->
            <text x="49" y="31" fill="${watermarkColor}" font-size="8" font-family="'Outfit', sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">${watermarkText}</text>

            <!-- Base Lead & Terminal Tag (B) outside circle -->
            <line x1="2" y1="28" x2="36" y2="28" stroke="${strokeBase}" stroke-width="2.6" stroke-linecap="round"/>
            <circle cx="3" cy="28" r="2.5" fill="${strokeBase}"/>
            <g transform="translate(7, 12)">
              <rect x="0" y="0" width="13" height="12" rx="3.5" fill="#f59e0b"/>
              <text x="6.5" y="9.5" font-size="9" font-family="'Outfit', sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">B</text>
            </g>

            <!-- Base Vertical Conduction Bar -->
            <line x1="36" y1="16" x2="36" y2="40" stroke="${strokeBar}" stroke-width="4.5" stroke-linecap="round"/>

            <!-- Collector Lead & Terminal Tag (C) outside circle -->
            <path d="M 36 21 L 52 13 L 85 13" stroke="${strokeCollector}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="85" cy="13" r="2.5" fill="${strokeCollector}"/>
            <g transform="translate(68, 3)">
              <rect x="0" y="0" width="13" height="12" rx="3.5" fill="#38bdf8"/>
              <text x="6.5" y="9.5" font-size="9" font-family="'Outfit', sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">C</text>
            </g>

            <!-- Emitter Lead & Terminal Tag (E) outside circle with Sharp Outward Arrowhead -->
            <path d="M 36 35 L 52 43 L 85 43" stroke="${strokeEmitter}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="85" cy="43" r="2.5" fill="${strokeEmitter}"/>
            <!-- Precision Outward Arrowhead -->
            <g transform="translate(47, 40.5) rotate(26.6)">
              <polygon points="0,0 -8.5,-4.5 -6,0 -8.5,4.5" fill="${strokeArrow}"/>
            </g>
            <g transform="translate(68, 41)">
              <rect x="0" y="0" width="13" height="12" rx="3.5" fill="#ef4444"/>
              <text x="6.5" y="9.5" font-size="9" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">E</text>
            </g>
          </g>
        `;
      }
      case 'pnp': {
        const isConducting = comp && comp.state && comp.state.conducting;
        const regime = (comp && comp.state && comp.state.operatingRegime) || (isConducting ? 'saturation' : 'cutoff');
        const isSat = isConducting && regime === 'saturation';
        const isActive = isConducting && regime === 'active';

        const strokeEmitter = isSat ? '#c084fc' : (isActive ? '#f59e0b' : '#ef4444');
        const strokeCollector = isSat ? '#c084fc' : (isActive ? '#f59e0b' : '#38bdf8');
        const strokeArrow = isSat ? '#c084fc' : (isActive ? '#f59e0b' : '#ef4444');
        const strokeBar = '#ffffff';
        const strokeBase = '#f59e0b';
        const watermarkText = isSat ? 'PNP ON' : (isActive ? 'PNP ACT' : 'PNP');
        const watermarkColor = isSat ? '#c084fc' : (isActive ? '#f59e0b' : 'rgba(255, 255, 255, 0.28)');
        const glowStroke = isSat ? 'rgba(192, 132, 252, 0.5)' : (isActive ? 'rgba(245, 158, 11, 0.5)' : 'rgba(168, 85, 247, 0.3)');
        return `
          <g class="schematic-pnp" fill="none">
            <!-- Glass Schematic Envelope Circle -->
            <circle cx="44" cy="28" r="18" fill="rgba(15, 23, 42, 0.92)" stroke="rgba(255, 255, 255, 0.85)" stroke-width="2"/>
            <circle cx="44" cy="28" r="18" fill="none" stroke="${glowStroke}" stroke-width="3" opacity="0.8"/>
            
            <!-- Type Watermark in open space -->
            <text x="49" y="31" fill="${watermarkColor}" font-size="8" font-family="'Outfit', sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">${watermarkText}</text>

            <!-- Base Lead & Terminal Tag (B) outside circle -->
            <line x1="2" y1="28" x2="36" y2="28" stroke="${strokeBase}" stroke-width="2.6" stroke-linecap="round"/>
            <circle cx="3" cy="28" r="2.5" fill="${strokeBase}"/>
            <g transform="translate(7, 12)">
              <rect x="0" y="0" width="13" height="12" rx="3.5" fill="#f59e0b"/>
              <text x="6.5" y="9.5" font-size="9" font-family="'Outfit', sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">B</text>
            </g>

            <!-- Base Vertical Conduction Bar -->
            <line x1="36" y1="16" x2="36" y2="40" stroke="${strokeBar}" stroke-width="4.5" stroke-linecap="round"/>

            <!-- Emitter Lead (Top) & Terminal Tag (E) outside circle with Sharp Inward Arrowhead -->
            <path d="M 36 21 L 52 13 L 85 13" stroke="${strokeEmitter}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="85" cy="13" r="2.5" fill="${strokeEmitter}"/>
            <!-- Precision Inward Arrowhead pointing toward Base Bar (36, 21) -->
            <g transform="translate(41, 18.5) rotate(153.4)">
              <polygon points="0,0 -8.5,-4.5 -6,0 -8.5,4.5" fill="${strokeArrow}"/>
            </g>
            <g transform="translate(68, 3)">
              <rect x="0" y="0" width="13" height="12" rx="3.5" fill="#ef4444"/>
              <text x="6.5" y="9.5" font-size="9" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">E</text>
            </g>

            <!-- Collector Lead (Bottom) & Terminal Tag (C) outside circle -->
            <path d="M 36 35 L 52 43 L 85 43" stroke="${strokeCollector}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="85" cy="43" r="2.5" fill="${strokeCollector}"/>
            <g transform="translate(68, 41)">
              <rect x="0" y="0" width="13" height="12" rx="3.5" fill="#38bdf8"/>
              <text x="6.5" y="9.5" font-size="9" font-family="'Outfit', sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">C</text>
            </g>
          </g>
        `;
      }
      case 'ldr':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><circle cx="14" cy="9" r="8"/><polyline points="4,9 7,9 9,6 11,12 13,6 15,12 17,9 20,9"/><line x1="8" y1="1" x2="12" y2="5" stroke="#ffffff"/><polygon points="12,5 10,4 11,2" fill="#ffffff"/><line x1="12" y1="1" x2="16" y2="5" stroke="#ffffff"/><polygon points="16,5 14,4 15,2" fill="#ffffff"/></g>`;
      case 'capacitor':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none">
          <line x1="2" y1="9" x2="11" y2="9"/>
          <line x1="11" y1="3" x2="11" y2="15"/>
          <path d="M 16 3 C 14 6, 14 12, 16 15"/>
          <line x1="15" y1="9" x2="24" y2="9"/>
          <line x1="6" y1="4" x2="6" y2="8" stroke-width="1.2"/>
          <line x1="4" y1="6" x2="8" y2="6" stroke-width="1.2"/>
        </g>`;
      case 'ceramic_capacitor':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none">
          <line x1="2" y1="9" x2="11" y2="9"/>
          <line x1="11" y1="3" x2="11" y2="15"/>
          <line x1="15" y1="3" x2="15" y2="15"/>
          <line x1="15" y1="9" x2="24" y2="9"/>
        </g>`;
      case 'inductor':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none">
          <line x1="2" y1="12" x2="5" y2="12"/>
          <path d="M 5 12 A 2.5 3 0 0 1 10 12 A 2.5 3 0 0 1 15 12 A 2.5 3 0 0 1 20 12 A 2.5 3 0 0 1 25 12"/>
          <line x1="25" y1="12" x2="28" y2="12"/>
          <line x1="5" y1="6" x2="25" y2="6" stroke="#ffffff" stroke-width="1.1"/>
          <line x1="5" y1="4" x2="25" y2="4" stroke="#ffffff" stroke-width="1.1"/>
        </g>`;
      case 'ammeter':
        return `<g stroke="#ffffff" stroke-width="1.5" fill="none">
          <circle cx="14" cy="9" r="6.5" stroke="#ffffff" stroke-width="1.6"/>
          <line x1="2" y1="9" x2="7.5" y2="9"/>
          <line x1="20.5" y1="9" x2="26" y2="9"/>
          <text x="14" y="12" font-size="8" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle" stroke="none">A</text>
        </g>`;
      case 'voltmeter':
        return `<g stroke="#ffffff" stroke-width="1.5" fill="none">
          <circle cx="14" cy="9" r="6.5" stroke="#ffffff" stroke-width="1.6"/>
          <line x1="2" y1="9" x2="7.5" y2="9"/>
          <line x1="20.5" y1="9" x2="26" y2="9"/>
          <text x="14" y="12" font-size="8" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle" stroke="none">V</text>
        </g>`;
      case 'wattmeter':
        return `<g stroke="#ffffff" stroke-width="1.5" fill="none">
          <circle cx="14" cy="9" r="6.5" stroke="#ffffff" stroke-width="1.6"/>
          <line x1="2" y1="9" x2="7.5" y2="9"/>
          <line x1="20.5" y1="9" x2="26" y2="9"/>
          <text x="14" y="12" font-size="7.5" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle" stroke="none">W</text>
        </g>`;
      case 'power_supply':
        return `<g stroke="#ffffff" stroke-width="1.5" fill="none">
          <circle cx="14" cy="9" r="6.5" stroke="#ffffff" stroke-width="1.6"/>
          <line x1="2" y1="9" x2="7.5" y2="9"/>
          <line x1="20.5" y1="9" x2="26" y2="9"/>
          <line x1="7" y1="15" x2="21" y2="3" stroke="#38bdf8" stroke-width="1.4"/>
          <polygon points="21,3 17,4 19,7" fill="#38bdf8" stroke="none"/>
          <text x="11" y="8" font-size="5" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" stroke="none">+</text>
          <text x="17" y="12.5" font-size="6" font-family="'Outfit', sans-serif" font-weight="900" fill="#ffffff" stroke="none">−</text>
        </g>`;
      case 'fuse':
        return `<g stroke="#ffffff" stroke-width="1.6" fill="none">
          <line x1="2" y1="9" x2="6" y2="9"/>
          <rect x="6" y="5" width="16" height="8" rx="1.5" stroke="#ffffff" stroke-width="1.6"/>
          <line x1="6" y1="9" x2="22" y2="9" stroke="#ffffff" stroke-width="1.2"/>
          <line x1="22" y1="9" x2="26" y2="9"/>
        </g>`;
      case 'function_generator':
        return `<g stroke="#ffffff" stroke-width="1.5" fill="none">
          <circle cx="14" cy="9" r="6.5" stroke="#ffffff" stroke-width="1.6"/>
          <line x1="2" y1="9" x2="7.5" y2="9"/>
          <line x1="20.5" y1="9" x2="26" y2="9"/>
          <path d="M 10 9 C 11.5 6, 12.5 6, 14 9 C 15.5 12, 16.5 12, 18 9" stroke="#38bdf8" stroke-width="1.4" stroke-linecap="round"/>
        </g>`;
      case 'oscilloscope':
        return `<g stroke="#ffffff" stroke-width="1.3" fill="none">
          <rect x="2" y="2" width="24" height="14" rx="2"/>
          <circle cx="10" cy="9" r="5" stroke="#38bdf8" stroke-dasharray="1 1"/>
          <path d="M 6 9 Q 8 6, 10 9 T 14 9" stroke="#facc15" stroke-width="1.4"/>
          <line x1="18" y1="5" x2="22" y2="5" stroke="#facc15"/>
          <line x1="18" y1="9" x2="22" y2="9" stroke="#22d3ee"/>
          <line x1="18" y1="13" x2="22" y2="13" stroke="#94a3b8"/>
        </g>`;
      case 'gate_and':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><line x1="2" y1="6" x2="8" y2="6"/><line x1="2" y1="12" x2="8" y2="12"/><path d="M 8 3 L 14 3 A 6 6 0 0 1 14 15 L 8 15 Z" fill="#38bdf8" fill-opacity="0.3"/><line x1="20" y1="9" x2="26" y2="9"/></g>`;
      case 'gate_or':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><line x1="2" y1="6" x2="9" y2="6"/><line x1="2" y1="12" x2="9" y2="12"/><path d="M 7 3 Q 11 9 7 15 Q 16 15 20 9 Q 16 3 7 3 Z" fill="#38bdf8" fill-opacity="0.3"/><line x1="20" y1="9" x2="26" y2="9"/></g>`;
      case 'gate_not':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><line x1="2" y1="9" x2="8" y2="9"/><polygon points="8,4 18,9 8,14" fill="#38bdf8" fill-opacity="0.3"/><circle cx="20" cy="9" r="1.8" fill="#0f172a"/><line x1="22" y1="9" x2="26" y2="9"/></g>`;
      case 'gate_nand':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><line x1="2" y1="6" x2="8" y2="6"/><line x1="2" y1="12" x2="8" y2="12"/><path d="M 8 3 L 13 3 A 6 6 0 0 1 13 15 L 8 15 Z" fill="#38bdf8" fill-opacity="0.3"/><circle cx="20.5" cy="9" r="1.8" fill="#0f172a"/><line x1="22.5" y1="9" x2="26" y2="9"/></g>`;
      case 'gate_nor':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><line x1="2" y1="6" x2="9" y2="6"/><line x1="2" y1="12" x2="9" y2="12"/><path d="M 7 3 Q 11 9 7 15 Q 15 15 19 9 Q 15 3 7 3 Z" fill="#38bdf8" fill-opacity="0.3"/><circle cx="21" cy="9" r="1.8" fill="#0f172a"/><line x1="23" y1="9" x2="26" y2="9"/></g>`;
      case 'gate_xor':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><line x1="2" y1="6" x2="7" y2="6"/><line x1="2" y1="12" x2="7" y2="12"/><path d="M 5 3 Q 9 9 5 15"/><path d="M 8 3 Q 12 9 8 15 Q 17 15 21 9 Q 17 3 8 3 Z" fill="#38bdf8" fill-opacity="0.3"/><line x1="21" y1="9" x2="26" y2="9"/></g>`;
      case 'gate_xnor':
        return `<g stroke="#ffffff" stroke-width="1.4" fill="none"><line x1="2" y1="6" x2="6" y2="6"/><line x1="2" y1="12" x2="6" y2="12"/><path d="M 4 3 Q 8 9 4 15"/><path d="M 7 3 Q 11 9 7 15 Q 15 15 19 9 Q 15 3 7 3 Z" fill="#38bdf8" fill-opacity="0.3"/><circle cx="21" cy="9" r="1.8" fill="#0f172a"/><line x1="23" y1="9" x2="26" y2="9"/></g>`;
      case 'ic_7408':
      case 'ic_7432':
      case 'ic_7404':
      case 'ic_7486':
      case 'ic_7400':
      case 'ic_7402':
      case 'ic_74266': {
        const code = type.replace('ic_', '');
        return `<g stroke="#38bdf8" stroke-width="1.2" fill="none">
          <rect x="5" y="2" width="18" height="14" rx="2" fill="#1e293b"/>
          <path d="M 12 2 A 2 2 0 0 0 16 2" fill="none" stroke="#38bdf8"/>
          <text x="14" y="11" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="4.8" font-weight="900" text-anchor="middle">${code}</text>
          <line x1="2" y1="5" x2="5" y2="5"/><line x1="2" y1="9" x2="5" y2="9"/><line x1="2" y1="13" x2="5" y2="13"/>
          <line x1="23" y1="5" x2="26" y2="5"/><line x1="23" y1="9" x2="26" y2="9"/><line x1="23" y1="13" x2="26" y2="13"/>
        </g>`;
      }
      default:
        return `<circle cx="13" cy="9" r="5" stroke="#ffffff" fill="none"/>`;
    }
  }

  static renderCatalogThumbnail(type) {
    const prof = CHARACTER_PROFILES[type];
    const avatar = prof ? prof.avatar : '⚡';

    switch (type) {
      case 'bulb':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-bulb-screw" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#475569"/>
              <stop offset="35%" stop-color="#cbd5e1"/>
              <stop offset="100%" stop-color="#334155"/>
            </linearGradient>
            <radialGradient id="thumb-bulb-glass" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0.08)"/>
            </radialGradient>
          </defs>
          <!-- Glass globe -->
          <circle cx="25" cy="15" r="11" fill="url(#thumb-bulb-glass)" stroke="rgba(255,255,255,0.55)" stroke-width="0.8"/>
          <!-- Support wires and coiled filament -->
          <line x1="23" y1="21" x2="23" y2="14" stroke="#94a3b8" stroke-width="0.8"/>
          <line x1="27" y1="21" x2="27" y2="14" stroke="#94a3b8" stroke-width="0.8"/>
          <path d="M 23 14 Q 25 12, 27 14" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round"/>
          <circle cx="25" cy="13.5" r="1.5" fill="#fef08a" opacity="0.9"/>
          <!-- E10 Screw Base -->
          <rect x="21" y="24" width="8" height="3" fill="url(#thumb-bulb-screw)" stroke="#334155" stroke-width="0.5"/>
          <path d="M 21 27 Q 25 28.5, 29 27 L 29 31 Q 25 32.5, 21 31 Z" fill="url(#thumb-bulb-screw)" stroke="#334155" stroke-width="0.5"/>
          <path d="M 21 31 Q 25 32.5, 29 31 L 28 34 Q 25 35, 22 34 Z" fill="url(#thumb-bulb-screw)" stroke="#334155" stroke-width="0.5"/>
          <!-- Vitrite & Solder nub -->
          <polygon points="22,34 28,34 26.5,37 23.5,37" fill="#090d16"/>
          <ellipse cx="25" cy="38" rx="1.5" ry="0.8" fill="#cbd5e1"/>
          <!-- Specular glare arc -->
          <path d="M 18 12 A 8 8 0 0 1 23 6" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round"/>
        </svg>`;
      case 'led':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-lead-led" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#94a3b8"/>
              <stop offset="50%" stop-color="#f8fafc"/>
              <stop offset="100%" stop-color="#64748b"/>
            </linearGradient>
            <linearGradient id="thumb-dome-led" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
              <stop offset="50%" stop-color="rgba(255,255,255,0.08)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0.35)"/>
            </linearGradient>
          </defs>
          <!-- External metallic leads -->
          <line x1="22" y1="26" x2="15" y2="38" stroke="url(#thumb-lead-led)" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="28" y1="26" x2="35" y2="38" stroke="url(#thumb-lead-led)" stroke-width="1.8" stroke-linecap="round"/>
          <!-- Internal anvil and post -->
          <line x1="22" y1="26" x2="22" y2="17" stroke="#cbd5e1" stroke-width="1.2"/>
          <polygon points="27,26 27,20 29.5,16 26,16 24.5,19 28,20 28,26" fill="#cbd5e1"/>
          <!-- Gold whisker wire -->
          <path d="M 22 17 Q 24.5 13.5, 27 17.5" fill="none" stroke="#f59e0b" stroke-width="0.8"/>
          <!-- Clear dome shell -->
          <path d="M 18 15 A 7 7 0 0 1 32 15 L 32 24 L 33 24 L 33 26 L 17 26 L 17 24 L 18 24 Z" fill="url(#thumb-dome-led)" stroke="rgba(255,255,255,0.55)" stroke-width="1"/>
          <!-- Glass glare arc -->
          <path d="M 20 14 A 5 5 0 0 1 25 10" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>
          <!-- Red photonic core emission -->
          <circle cx="27" cy="18" r="2.8" fill="#ff334b" opacity="0.85"/>
          <circle cx="27" cy="18" r="1.1" fill="#ffffff"/>
        </svg>`;
      case 'battery':
        return `<svg viewBox="0 0 50 50" class="catalog-thumb-svg">
          <rect x="12" y="8" width="26" height="38" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
          <!-- Orange top collar -->
          <path d="M 12 14 L 12 20 L 38 20 L 38 14 Q 38 10, 34 10 L 16 10 Q 12 10, 12 14 Z" fill="#ea580c"/>
          <!-- Top plate -->
          <rect x="14" y="6" width="22" height="4" rx="1.5" fill="#1e293b"/>
          <!-- Left stud (-) and Right cup (+) -->
          <polygon points="18,3 16,5 20,5" fill="#cbd5e1" stroke="#334155" stroke-width="0.8"/>
          <circle cx="32" cy="4" r="2.2" fill="#cbd5e1" stroke="#334155" stroke-width="0.8"/>
          <!-- 9V text -->
          <text x="19" y="18" font-size="5" font-weight="900" fill="#09090b" font-family="'Outfit', sans-serif">9V</text>
          <!-- Bunny logo silhouette -->
          <path d="M 23 27 L 27 27 L 27 33 L 23 33 Z" fill="#09090b"/>
          <ellipse cx="25" cy="27" rx="5" ry="1.5" fill="#09090b"/>
        </svg>`;
      case 'cell':
        return `<svg viewBox="0 0 50 50" class="catalog-thumb-svg">
          <rect x="17" y="10" width="16" height="34" rx="3.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
          <!-- Orange top collar -->
          <path d="M 17 14 L 17 20 L 33 20 L 33 14 Q 33 10, 30 10 L 20 10 Q 17 10, 17 14 Z" fill="#ea580c"/>
          <!-- Top metallic positive button nub -->
          <rect x="22" y="6.5" width="6" height="4" rx="1.5" fill="#cbd5e1" stroke="#334155" stroke-width="0.6"/>
          <!-- Bottom flat negative base -->
          <line x1="18" y1="44" x2="32" y2="44" stroke="#94a3b8" stroke-width="1.2"/>
          <!-- 1.5V text -->
          <text x="25" y="18" font-size="4" font-weight="900" fill="#09090b" font-family="'Outfit', sans-serif" text-anchor="middle">1.5V</text>
          <!-- Bunny emblem -->
          <path d="M 23 26 L 27 26 L 27 30 L 23 30 Z" fill="#09090b"/>
          <ellipse cx="25" cy="26" rx="3.5" ry="1" fill="#09090b"/>
        </svg>`;
      case 'cell3v':
        return `<svg viewBox="0 0 50 50" class="catalog-thumb-svg">
          <!-- Outer circular steel bevel -->
          <circle cx="25" cy="25" r="18" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
          <!-- Inner positive face -->
          <circle cx="25" cy="25" r="15" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
          <!-- Engravings -->
          <text x="25" y="19" font-size="6" font-weight="900" fill="#1e293b" text-anchor="middle" font-family="'Outfit', sans-serif">+</text>
          <text x="25" y="27" font-size="4.5" font-weight="900" fill="#0f172a" text-anchor="middle" font-family="'Outfit', sans-serif" letter-spacing="0.5px">CR2032</text>
          <text x="25" y="33" font-size="3.5" font-weight="800" fill="#475569" text-anchor="middle" font-family="'Outfit', sans-serif">3V</text>
          <!-- Side leads -->
          <line x1="3" y1="25" x2="8" y2="25" stroke="#38bdf8" stroke-width="2"/>
          <line x1="42" y1="25" x2="47" y2="25" stroke="#ef4444" stroke-width="2"/>
        </svg>`;
      case 'motor':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-motor-can" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#475569"/>
              <stop offset="50%" stop-color="#cbd5e1"/>
              <stop offset="100%" stop-color="#334155"/>
            </linearGradient>
            <linearGradient id="thumb-fan-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ff4d4d"/>
              <stop offset="50%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#991b1b"/>
            </linearGradient>
          </defs>
          <!-- 130 Steel motor can -->
          <rect x="16" y="17" width="18" height="17" rx="3.5" fill="url(#thumb-motor-can)" stroke="#334155" stroke-width="0.8"/>
          <!-- Rear end-cap and terminals -->
          <rect x="18" y="34" width="14" height="2.5" rx="1" fill="#18181b"/>
          <line x1="19" y1="36.5" x2="19" y2="39" stroke="#ff9f0a" stroke-width="1.5"/>
 
... [truncated for diff preview]
          <line x1="31" y1="36.5" x2="31" y2="39" stroke="#38bdf8" stroke-width="1.5"/>
          <!-- Brass collar and shaft -->
          <circle cx="25" cy="22" r="2.8" fill="#d97706"/>
          <line x1="25" y1="11" x2="25" y2="22" stroke="#cbd5e1" stroke-width="1.5"/>
          <!-- Red 2-blade propeller fan -->
          <path d="M 23 10 C 18 7, 9 8, 5 11 C 9 13, 18 12, 23 12 Z" fill="url(#thumb-fan-red)"/>
          <path d="M 27 12 C 32 15, 41 14, 45 11 C 41 9, 32 10, 27 10 Z" fill="url(#thumb-fan-red)"/>
          <circle cx="25" cy="11" r="2.6" fill="#b91c1c"/>
          <circle cx="25" cy="11" r="1.8" fill="url(#thumb-fan-red)"/>
        </svg>`;
      case 'diode':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-diode-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3f3f46"/>
              <stop offset="25%" stop-color="#52525b"/>
              <stop offset="60%" stop-color="#18181b"/>
              <stop offset="100%" stop-color="#09090b"/>
            </linearGradient>
            <linearGradient id="thumb-diode-band" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#cbd5e1"/>
              <stop offset="30%" stop-color="#ffffff"/>
              <stop offset="70%" stop-color="#94a3b8"/>
              <stop offset="100%" stop-color="#475569"/>
            </linearGradient>
          </defs>
          <!-- Axial leads -->
          <line x1="5" y1="20" x2="45" y2="20" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="19.3" x2="45" y2="19.3" stroke="#ffffff" stroke-width="0.7" opacity="0.8"/>
          <!-- DO-41 Black Cylindrical Body without number -->
          <rect x="15" y="14" width="20" height="12" rx="2.5" fill="url(#thumb-diode-body)" stroke="#18181b" stroke-width="0.8"/>
          <line x1="17" y1="15.5" x2="33" y2="15.5" stroke="#ffffff" stroke-width="0.8" opacity="0.4"/>
          <!-- Cathode Silver Band -->
          <rect x="29" y="14" width="4" height="12" rx="0.5" fill="url(#thumb-diode-band)" stroke="#475569" stroke-width="0.5"/>
          <!-- Forward symbol -->
          <text x="21" y="22.5" font-size="5" font-weight="900" fill="#94a3b8" font-family="'JetBrains Mono', monospace" text-anchor="middle">▶|</text>
        </svg>`;
      case 'switch':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-sw-brass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#ca8a04"/>
              <stop offset="100%" stop-color="#713f12"/>
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="38" height="20" rx="3" fill="#18181b" stroke="#3f3f46" stroke-width="0.8"/>
          <circle cx="11" cy="20" r="2.5" fill="url(#thumb-sw-brass)"/>
          <circle cx="39" cy="20" r="2.5" fill="url(#thumb-sw-brass)"/>
          <rect x="11" y="19" width="8" height="2" fill="url(#thumb-sw-brass)"/>
          <rect x="31" y="19" width="8" height="2" fill="url(#thumb-sw-brass)"/>
          <rect x="18" y="17" width="3" height="6" rx="0.5" fill="url(#thumb-sw-brass)"/>
          <rect x="30" y="17" width="2" height="6" rx="0.5" fill="url(#thumb-sw-brass)"/>
          <g transform="translate(19, 20) rotate(-28)">
            <rect x="0" y="-1" width="16" height="2" rx="0.5" fill="url(#thumb-sw-brass)"/>
            <rect x="15" y="-1.8" width="5" height="3.6" rx="1" fill="#dc2626"/>
          </g>
        </svg>`;
      case 'twowayswitch':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-twoway-brass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="50%" stop-color="#ca8a04"/>
              <stop offset="100%" stop-color="#713f12"/>
            </linearGradient>
          </defs>
          <rect x="6" y="8" width="38" height="24" rx="3" fill="#18181b" stroke="#3f3f46" stroke-width="0.8"/>
          <circle cx="11" cy="20" r="2.2" fill="url(#thumb-twoway-brass)"/>
          <circle cx="39" cy="14" r="2.2" fill="url(#thumb-twoway-brass)"/>
          <circle cx="39" cy="26" r="2.2" fill="url(#thumb-twoway-brass)"/>
          <rect x="11" y="19" width="7" height="2" fill="url(#thumb-twoway-brass)"/>
          <rect x="33" y="13" width="6" height="2" fill="url(#thumb-twoway-brass)"/>
          <rect x="33" y="25" width="6" height="2" fill="url(#thumb-twoway-brass)"/>
          <g transform="translate(18, 20) rotate(-16)">
            <rect x="0" y="-1" width="18" height="2" rx="0.5" fill="url(#thumb-twoway-brass)"/>
            <rect x="17" y="-1.8" width="5" height="3.6" rx="1" fill="#dc2626"/>
          </g>
        </svg>`;
      case 'pushbutton':
        return `<svg viewBox="0 0 50 50" class="catalog-thumb-svg">
          <defs>
            <radialGradient id="thumb-pb-dome" cx="42%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#fca5a5"/>
              <stop offset="45%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#7f1d1d"/>
            </radialGradient>
            <linearGradient id="thumb-pb-blue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="40%" stop-color="#2563eb"/>
              <stop offset="100%" stop-color="#172554"/>
            </linearGradient>
          </defs>
          <!-- Red Button Dome & Chrome Collar -->
          <path d="M 17 9 C 17 3, 33 3, 33 9 Z" fill="url(#thumb-pb-dome)" stroke="#991b1b" stroke-width="0.5"/>
          <rect x="15" y="8.8" width="20" height="3" rx="0.8" fill="#cbd5e1" stroke="#475569" stroke-width="0.4"/>
          <!-- Golden Plunger Stem & Spring Coils -->
          <rect x="23.8" y="11.5" width="2.4" height="10" fill="#ca8a04"/>
          <path d="M 19 13 Q 25 11 31 14 M 19 15.5 Q 25 13.5 31 16.5 M 19 18 Q 25 16 31 19" stroke="#b45309" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <!-- Sectional Blue Housing Casing -->
          <rect x="11" y="20" width="28" height="20" rx="1.5" fill="url(#thumb-pb-blue)" stroke="#1d4ed8" stroke-width="0.6"/>
          <!-- Inner Chamber Cutout -->
          <rect x="13" y="22" width="24" height="16" rx="1" fill="#091329"/>
          <!-- Movable Golden Bridge -->
          <rect x="15" y="26" width="20" height="1.8" rx="0.5" fill="#eab308"/>
          <circle cx="16.5" cy="27" r="1.2" fill="#fde047"/>
          <circle cx="33.5" cy="27" r="1.2" fill="#fde047"/>
          <!-- Stationary Golden Contacts -->
          <circle cx="16.5" cy="32" r="1.2" fill="#fde047" stroke="#78350f" stroke-width="0.3"/>
          <circle cx="33.5" cy="32" r="1.2" fill="#fde047" stroke="#78350f" stroke-width="0.3"/>
          <!-- Red Motion Arrow -->
          <line x1="25" y1="28" x2="25" y2="33" stroke="#ef4444" stroke-width="0.8"/>
          <polygon points="23.5,32 26.5,32 25,34.5" fill="#ef4444"/>
          <!-- Terminal Leads & Solder Pads -->
          <line x1="16.5" y1="33" x2="16.5" y2="44" stroke="#334155" stroke-width="1.2"/>
          <line x1="33.5" y1="33" x2="33.5" y2="44" stroke="#334155" stroke-width="1.2"/>
          <circle cx="16.5" cy="44" r="2.2" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
          <circle cx="33.5" cy="44" r="2.2" fill="#1e293b" stroke="#64748b" stroke-width="0.8"/>
        </svg>`;
      case 'buzzer':
        return `<svg viewBox="0 0 50 44" class="catalog-thumb-svg">
          <!-- Mounting Ears -->
          <ellipse cx="9" cy="20" rx="5" ry="3.5" fill="#18181b" stroke="#27272a" stroke-width="0.6"/>
          <circle cx="9" cy="20" r="1.6" fill="#f8fafc"/>
          <ellipse cx="41" cy="20" rx="5" ry="3.5" fill="#18181b" stroke="#27272a" stroke-width="0.6"/>
          <circle cx="41" cy="20" r="1.6" fill="#f8fafc"/>
          <!-- Circular Body & Stepped Acoustic Grooves -->
          <circle cx="25" cy="20" r="14" fill="#121215" stroke="#27272a" stroke-width="0.8"/>
          <circle cx="25" cy="20" r="11.5" fill="none" stroke="#27272a" stroke-width="0.8"/>
          <circle cx="25" cy="20" r="8.5" fill="none" stroke="#27272a" stroke-width="0.8"/>
          <circle cx="25" cy="20" r="5.5" fill="none" stroke="#27272a" stroke-width="0.8"/>
          <!-- Center Piezo Port -->
          <circle cx="25" cy="20" r="2.8" fill="#cbd5e1" stroke="#1f2937" stroke-width="0.5"/>
          <!-- Left Black Wire & Right Red Wire -->
          <line x1="21" y1="33" x2="21" y2="41" stroke="#09090b" stroke-width="2"/>
          <line x1="21" y1="41" x2="21" y2="43.5" stroke="#b45309" stroke-width="1.2"/>
          <line x1="29" y1="33" x2="29" y2="41" stroke="#dc2626" stroke-width="2"/>
          <line x1="29" y1="41" x2="29" y2="43.5" stroke="#b45309" stroke-width="1.2"/>
        </svg>`;
      case 'potentiometer':
        return `<svg viewBox="0 0 50 46" class="catalog-thumb-svg">
          <!-- Phenolic Board with Top Arch & Bottom Apron -->
          <path d="M 15 22 A 10 10 0 0 1 35 22 L 39 34 L 11 34 Z" fill="#9a3412" stroke="#431407" stroke-width="0.8"/>
          <!-- White B22K Stencil -->
          <text x="25" y="15" fill="#f8fafc" font-size="5.5" font-weight="900" text-anchor="middle">B22K</text>
          <!-- Metal Stamped Plate -->
          <rect x="13.5" y="16" width="23" height="15" rx="2.5" fill="#cbd5e1" stroke="#334155" stroke-width="0.8"/>
          <!-- 4 Golden Crimp Claws -->
          <rect x="13" y="17" width="2" height="2.5" fill="#eab308"/>
          <rect x="35" y="17" width="2" height="2.5" fill="#eab308"/>
          <rect x="13" y="27" width="2" height="2.5" fill="#eab308"/>
          <rect x="35" y="27" width="2" height="2.5" fill="#eab308"/>
          <!-- Bushing & D-Shaft -->
          <circle cx="25" cy="23.5" r="5.5" fill="#94a3b8" stroke="#475569" stroke-width="0.6"/>
          <path d="M 21.5 21 L 28.5 21 A 4 4 0 1 1 21.5 21 Z" fill="#e2e8f0" stroke="#334155" stroke-width="0.6"/>
          <circle cx="25" cy="23.5" r="1.2" fill="#334155"/>
          <!-- 3 Hollow Eyelets -->
          <circle cx="17" cy="31" r="2.2" fill="#cbd5e1" stroke="#334155" stroke-width="0.5"/>
          <circle cx="17" cy="31" r="0.9" fill="#0f172a"/>
          <circle cx="25" cy="31" r="2.2" fill="#cbd5e1" stroke="#334155" stroke-width="0.5"/>
          <circle cx="25" cy="31" r="0.9" fill="#0f172a"/>
          <circle cx="33" cy="31" r="2.2" fill="#cbd5e1" stroke="#334155" stroke-width="0.5"/>
          <circle cx="33" cy="31" r="0.9" fill="#0f172a"/>
          <!-- 3 Solder Pins -->
          <line x1="17" y1="34" x2="17" y2="43" stroke="#cbd5e1" stroke-width="1.6"/>
          <line x1="25" y1="34" x2="25" y2="43" stroke="#cbd5e1" stroke-width="1.6"/>
          <line x1="33" y1="34" x2="33" y2="43" stroke="#cbd5e1" stroke-width="1.6"/>
        </svg>`;
      case 'transformer':
        return `<svg viewBox="0 0 50 44" class="catalog-thumb-svg">
          <!-- Top metallic face -->
          <polygon points="14,12 20,7 40,14 34,19" fill="#cbd5e1" stroke="#475569" stroke-width="0.6"/>
          <!-- Left side face -->
          <polygon points="14,12 20,7 20,30 14,35" fill="#64748b" stroke="#334155" stroke-width="0.6"/>
          <!-- Bottom mounting foot -->
          <polygon points="14,35 8,38 11,41 17,38" fill="#94a3b8"/>
          <!-- Core face & Laminations -->
          <polygon points="14,12 34,19 34,35 14,35" fill="#334155"/>
          <!-- White Bobbin -->
          <polygon points="19,16 31,20 30,23 18,19" fill="#f8fafc"/>
          <!-- Kraft paper coil -->
          <path d="M 19 19 C 24 21 29 23 31 23 L 30 31 C 26 31 21 29 18 27 Z" fill="#b45309"/>
          <!-- White primary wires -->
          <path d="M 20 10 C 14 7 8 12 4 16" stroke="#ffffff" stroke-width="1.8" fill="none"/>
          <path d="M 18 20 C 12 22 8 28 4 32" stroke="#ffffff" stroke-width="1.8" fill="none"/>
          <!-- Black secondary wires -->
          <path d="M 30 22 C 36 21 42 17 47 20" stroke="#09090b" stroke-width="1.8" fill="none"/>
          <path d="M 26 21 C 31 26 39 31 47 34" stroke="#09090b" stroke-width="1.8" fill="none"/>
        </svg>`;
      case 'resistor':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <line x1="4" y1="20" x2="14" y2="20" stroke="#94a3b8" stroke-width="2"/>
          <line x1="36" y1="20" x2="46" y2="20" stroke="#94a3b8" stroke-width="2"/>
          <rect x="14" y="13" width="22" height="14" rx="4" fill="#e2d9c8" stroke="#a8a29e"/>
          <rect x="18" y="13" width="2" height="14" fill="#dc2626"/>
          <rect x="23" y="13" width="2" height="14" fill="#dc2626"/>
          <rect x="28" y="13" width="2" height="14" fill="#92400e"/>
        </svg>`;
      case 'npn':
      case 'pnp':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <path d="M 12 10 C 12 4, 38 4, 38 10 L 38 22 C 38 24, 12 24, 12 22 Z" fill="#18181b" stroke="${type === 'npn' ? '#fbbf24' : '#c084fc'}" stroke-width="1.4"/>
          <text x="25" y="16" font-size="6.5" font-weight="900" fill="${type === 'npn' ? '#fbbf24' : '#c084fc'}" text-anchor="middle">${type.toUpperCase()}</text>
          <!-- 3 Vertical Legs -->
          <line x1="16" y1="22" x2="16" y2="36" stroke="${type === 'npn' ? '#fbbf24' : '#ef4444'}" stroke-width="2"/>
          <line x1="25" y1="22" x2="25" y2="36" stroke="#f59e0b" stroke-width="2"/>
          <line x1="34" y1="22" x2="34" y2="36" stroke="${type === 'npn' ? '#ef4444' : '#38bdf8'}" stroke-width="2"/>
        </svg>`;
      case 'ldr':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <radialGradient id="ldr-thumb-bezel" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#27272a"/>
              <stop offset="60%" stop-color="#18181b"/>
              <stop offset="100%" stop-color="#09090b"/>
            </radialGradient>
          </defs>
          <!-- Silver Leads -->
          <line x1="5" y1="20" x2="13" y2="20" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
          <line x1="37" y1="20" x2="45" y2="20" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
          <!-- Outer Black Bezel -->
          <circle cx="25" cy="20" r="13" fill="url(#ldr-thumb-bezel)" stroke="#3f3f46" stroke-width="1"/>
          <!-- Ceramic Substrate Disc with Cut Chords -->
          <path d="M 18 10 L 32 10 A 11 11 0 0 1 32 30 L 18 30 A 11 11 0 0 1 18 10 Z" fill="#fef3c7" stroke="#d97706" stroke-width="0.5"/>
          <!-- Serpentine CdS Wave Track -->
          <path d="M 19 26 L 31 26 A 1 1 0 0 0 31 24 L 18 24 A 1 1 0 0 1 18 22 L 32 22 A 1 1 0 0 0 32 20 L 18 20 A 1 1 0 0 1 18 18 L 32 18 A 1 1 0 0 0 32 16 L 19 16 A 1 1 0 0 1 19 14 L 30 14" fill="none" stroke="#ea580c" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Solder Rivets -->
          <circle cx="15.5" cy="20" r="1.3" fill="#cbd5e1" stroke="#475569" stroke-width="0.5"/>
          <circle cx="34.5" cy="20" r="1.3" fill="#cbd5e1" stroke="#475569" stroke-width="0.5"/>
          <!-- Glass Reflection Arc -->
          <path d="M 17 15 A 10 10 0 0 1 33 15" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round"/>
        </svg>`;
      case 'capacitor':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-elec-can" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#09090b"/>
              <stop offset="25%" stop-color="#334155"/>
              <stop offset="45%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
            <linearGradient id="thumb-elec-stripe" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#cbd5e1"/>
              <stop offset="40%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#94a3b8"/>
            </linearGradient>
            <radialGradient id="thumb-elec-top" cx="45%" cy="38%" r="60%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="60%" stop-color="#cbd5e1"/>
              <stop offset="100%" stop-color="#64748b"/>
            </radialGradient>
          </defs>
          <!-- Dual Downward Radial Wire Leads -->
          <!-- Left Anode (+) Longer Lead -->
          <line x1="19" y1="28" x2="19" y2="39" stroke="#cbd5e1" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="19" cy="38.5" r="1.5" fill="#ef4444"/>
          <!-- Right Cathode (−) Shorter Lead -->
          <line x1="31" y1="28" x2="31" y2="34" stroke="#cbd5e1" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="31" cy="34" r="1.5" fill="#0ea5e9"/>
          <!-- Bottom Bung -->
          <ellipse cx="25" cy="28" rx="9" ry="2.5" fill="#18181b"/>
          <!-- Canister Sleeve -->
          <path d="M 15 8 L 15 27 A 10 3 0 0 0 35 27 L 35 8 Z" fill="url(#thumb-elec-can)" stroke="#1e293b" stroke-width="0.8"/>
          <!-- Circumferential Crimp Waist -->
          <path d="M 15 24 A 10 2.5 0 0 0 35 24" fill="none" stroke="#050507" stroke-width="1.2"/>
          <!-- Cathode Negative Stripe with Chevron & Minus -->
          <path d="M 26 7 L 26 28 A 10 3 0 0 0 34 27.5 L 34 7 Z" fill="url(#thumb-elec-stripe)"/>
          <path d="M 27 12 L 30 15 L 33 12" fill="none" stroke="#090d16" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="30" y1="18" x2="30" y2="22" stroke="#090d16" stroke-width="1.6" stroke-linecap="round"/>
          <!-- Embossed Top Aluminum Disc & Vent Cross -->
          <ellipse cx="25" cy="8" rx="10" ry="3" fill="url(#thumb-elec-top)" stroke="#64748b" stroke-width="0.6"/>
          <line x1="18" y1="8" x2="32" y2="8" stroke="#334155" stroke-width="0.9"/>
          <line x1="25" y1="5.5" x2="25" y2="10.5" stroke="#334155" stroke-width="0.9"/>
        </svg>`;
      case 'ceramic_capacitor':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <radialGradient id="thumb-ceramic-resin" cx="40%" cy="34%" r="68%">
              <stop offset="0%" stop-color="#f7c978"/>
              <stop offset="35%" stop-color="#ebb358"/>
              <stop offset="75%" stop-color="#d28f2c"/>
              <stop offset="100%" stop-color="#854b08"/>
            </radialGradient>
          </defs>
          <!-- Parallel Downward Radial Wire Leads -->
          <line x1="19" y1="23" x2="19" y2="38" stroke="#cbd5e1" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="31" y1="23" x2="31" y2="38" stroke="#cbd5e1" stroke-width="2.2" stroke-linecap="round"/>
          <!-- Dipped Ceramic Disc Body -->
          <path d="M 18 24 
                   C 14 21, 14 17, 14 13 
                   C 14 7, 19 3, 25 3 
                   C 31 3, 36 7, 36 13 
                   C 36 17, 36 21, 32 24 
                   C 31.5 25, 30.5 25, 30 24 
                   C 29 22.5, 27 21, 25 21 
                   C 23 21, 21 22.5, 20 24 
                   C 19.5 25, 18.5 25, 18 24 Z" 
                fill="url(#thumb-ceramic-resin)" stroke="#7c4305" stroke-width="0.8"/>
          <!-- Specular Upper Rim Highlight -->
          <path d="M 16 11 C 17 6, 22 4.5, 28 4.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round"/>
          <!-- Stamped 103 with Underline -->
          <text x="25" y="14" font-family="'Outfit', sans-serif" font-size="6.5" font-weight="900" fill="#1c1917" text-anchor="middle">103</text>
          <line x1="20" y1="16" x2="30" y2="16" stroke="#1c1917" stroke-width="0.9" stroke-linecap="round"/>
        </svg>`;
      case 'solenoid':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <!-- Plunger rod and spring -->
          <line x1="4" y1="20" x2="18" y2="20" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
          <line x1="4" y1="19.2" x2="18" y2="19.2" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>
          <!-- Retaining washer -->
          <line x1="10" y1="16" x2="10" y2="24" stroke="#1e293b" stroke-width="1.6"/>
          <!-- Helical spring -->
          <path d="M 11 17 L 13 23 L 15 17 L 17 23 L 18 17" fill="none" stroke="#94a3b8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Metal C-Frame -->
          <path d="M 18 12 L 40 12 Q 43 12, 43 15 L 43 25 Q 43 28, 40 28 L 18 28 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
          <!-- Blue coil -->
          <rect x="20" y="14" width="21" height="12" rx="2" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="0.8"/>
          <line x1="21" y1="17" x2="40" y2="17" stroke="#ffffff" stroke-width="1" opacity="0.6" stroke-linecap="round"/>
          <!-- Brass stop pin & damper -->
          <rect x="43" y="18.5" width="4" height="3" fill="#d97706" stroke="#92400e" stroke-width="0.5"/>
          <!-- Red & black wires -->
          <path d="M 40 14 Q 45 10, 48 8" fill="none" stroke="#ef4444" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M 40 16 Q 46 16, 48 24" fill="none" stroke="#0f172a" stroke-width="1.4" stroke-linecap="round"/>
        </svg>`;
      case 'rectifier':
        return `<svg viewBox="0 0 50 50" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-rect-body" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#27272a"/>
              <stop offset="35%" stop-color="#18181b"/>
              <stop offset="100%" stop-color="#09090b"/>
            </linearGradient>
            <linearGradient id="thumb-rect-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3f3f46"/>
              <stop offset="40%" stop-color="#27272a"/>
              <stop offset="100%" stop-color="#09090b"/>
            </linearGradient>
            <linearGradient id="thumb-rect-silver" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#94a3b8"/>
              <stop offset="40%" stop-color="#f8fafc"/>
              <stop offset="100%" stop-color="#64748b"/>
            </linearGradient>
          </defs>
          <!-- 4 Tinned Solder Leads -->
          <rect x="15" y="4" width="4" height="7" rx="0.8" fill="url(#thumb-rect-silver)"/>
          <rect x="31" y="4" width="4" height="7" rx="0.8" fill="url(#thumb-rect-silver)"/>
          <rect x="15" y="39" width="4" height="7" rx="0.8" fill="url(#thumb-rect-silver)"/>
          <rect x="31" y="39" width="4" height="7" rx="0.8" fill="url(#thumb-rect-silver)"/>
          <!-- Main Chip Chamfer Skirt Outer Base -->
          <polygon points="10,12 40,12 42,39 8,39" fill="url(#thumb-rect-bevel)" stroke="#09090b" stroke-width="0.6"/>
          <!-- Flat Square Top Face -->
          <rect x="11.5" y="10" width="27" height="25" rx="1.5" fill="url(#thumb-rect-body)" stroke="#3f3f46" stroke-width="0.5"/>
          <!-- Champagne Gold Laser Markings -->
          <text x="17.5" y="16.5" font-family="'Outfit', sans-serif" font-size="5" font-weight="900" fill="#fef08a" text-anchor="middle">―</text>
          <text x="32.5" y="16.5" font-family="'Outfit', sans-serif" font-size="5" font-weight="900" fill="#fef08a" text-anchor="middle">+</text>
          <text x="25" y="24" font-family="'Times New Roman', serif" font-size="6.5" font-style="italic" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">ASEMI</text>
          <text x="25" y="31.5" font-family="'Outfit', 'Arial Black', sans-serif" font-size="4.8" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="0.4">UMB6F</text>
        </svg>`;
      case 'inductor':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <defs>
            <linearGradient id="thumb-ind-copper" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b"/>
              <stop offset="35%" stop-color="#ea580c"/>
              <stop offset="80%" stop-color="#b45309"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
            <linearGradient id="thumb-ind-ferrite" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3f3f46"/>
              <stop offset="50%" stop-color="#18181b"/>
              <stop offset="100%" stop-color="#09090b"/>
            </linearGradient>
            <linearGradient id="thumb-ind-lead" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#94a3b8"/>
              <stop offset="50%" stop-color="#f8fafc"/>
              <stop offset="100%" stop-color="#64748b"/>
            </linearGradient>
          </defs>
          <!-- Radial leads -->
          <line x1="16" y1="23" x2="16" y2="38" stroke="url(#thumb-ind-lead)" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="36" y1="23" x2="36" y2="38" stroke="url(#thumb-ind-lead)" stroke-width="2.2" stroke-linecap="round"/>
          <!-- Ferrite Core Boss -->
          <ellipse cx="11" cy="19" rx="2.5" ry="5.5" fill="url(#thumb-ind-ferrite)" stroke="#09090b" stroke-width="0.5"/>
          <rect x="12" y="14" width="28" height="10" rx="1" fill="#121318"/>
          <!-- Helical Turns -->
          <ellipse cx="16" cy="19" rx="2.5" ry="7.5" fill="url(#thumb-ind-copper)" stroke="#451a03" stroke-width="0.5"/>
          <ellipse cx="21" cy="19" rx="2.5" ry="7.5" fill="url(#thumb-ind-copper)" stroke="#451a03" stroke-width="0.5"/>
          <ellipse cx="26" cy="19" rx="2.5" ry="7.5" fill="url(#thumb-ind-copper)" stroke="#451a03" stroke-width="0.5"/>
          <ellipse cx="31" cy="19" rx="2.5" ry="7.5" fill="url(#thumb-ind-copper)" stroke="#451a03" stroke-width="0.5"/>
          <ellipse cx="36" cy="19" rx="2.5" ry="7.5" fill="url(#thumb-ind-copper)" stroke="#451a03" stroke-width="0.5"/>
          <!-- Copper highlight sheen -->
          <line x1="14" y1="13.5" x2="38" y2="13.5" stroke="#fef08a" stroke-width="1" opacity="0.8" stroke-linecap="round"/>
        </svg>`;
      case 'ammeter':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <rect x="5" y="4" width="40" height="32" rx="3" fill="#1e293b" stroke="#334155" stroke-width="1"/>
          <!-- Scale window -->
          <rect x="8" y="7" width="34" height="20" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
          <path d="M 12 21 A 16 16 0 0 1 38 21" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="1.5,1.5"/>
          <line x1="25" y1="24" x2="32" y2="12" stroke="#dc2626" stroke-width="1" stroke-linecap="round"/>
          <circle cx="25" cy="24" r="2" fill="#0f172a"/>
          <text x="25" y="16" font-family="'Outfit', sans-serif" font-size="6" font-weight="900" fill="#0284c7" text-anchor="middle">A</text>
          <!-- Binding posts -->
          <circle cx="16" cy="31" r="2.2" fill="#ef4444" stroke="#991b1b" stroke-width="0.6"/>
          <circle cx="34" cy="31" r="2.2" fill="#0f172a" stroke="#334155" stroke-width="0.6"/>
        </svg>`;
      case 'voltmeter':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <rect x="5" y="4" width="40" height="32" rx="3" fill="#1e293b" stroke="#334155" stroke-width="1"/>
          <!-- Scale window -->
          <rect x="8" y="7" width="34" height="20" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
          <path d="M 12 21 A 16 16 0 0 1 38 21" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="1.5,1.5"/>
          <line x1="25" y1="24" x2="30" y2="13" stroke="#dc2626" stroke-width="1" stroke-linecap="round"/>
          <circle cx="25" cy="24" r="2" fill="#0f172a"/>
          <text x="25" y="16" font-family="'Outfit', sans-serif" font-size="6" font-weight="900" fill="#d97706" text-anchor="middle">V</text>
          <!-- Binding posts -->
          <circle cx="16" cy="31" r="2.2" fill="#ef4444" stroke="#991b1b" stroke-width="0.6"/>
          <circle cx="34" cy="31" r="2.2" fill="#0f172a" stroke="#334155" stroke-width="0.6"/>
        </svg>`;
      case 'wattmeter':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <rect x="5" y="4" width="40" height="32" rx="3" fill="#0f172a" stroke="#334155" stroke-width="1"/>
          <rect x="9" y="8" width="32" height="15" rx="2" fill="#020617" stroke="#1e293b" stroke-width="0.8"/>
          <text x="22" y="19" font-family="'Courier New', monospace" font-size="7.5" font-weight="900" fill="#38bdf8" text-anchor="middle">0.0</text>
          <text x="35" y="19" font-family="'Outfit', sans-serif" font-size="5" font-weight="900" fill="#f59e0b" text-anchor="middle">W</text>
          <!-- 4 miniature posts -->
          <circle cx="11" cy="29" r="1.8" fill="#ef4444"/>
          <circle cx="19" cy="29" r="1.8" fill="#0f172a" stroke="#475569" stroke-width="0.5"/>
          <circle cx="31" cy="29" r="1.8" fill="#ef4444"/>
          <circle cx="39" cy="29" r="1.8" fill="#0f172a" stroke="#475569" stroke-width="0.5"/>
        </svg>`;
      case 'power_supply':
        return `<svg viewBox="0 0 50 42" class="catalog-thumb-svg">
          <rect x="4" y="2" width="42" height="38" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          <!-- Dual LED readouts -->
          <rect x="8" y="5" width="16" height="11" rx="1.5" fill="#020617"/>
          <text x="16" y="13" font-family="'Courier New', monospace" font-size="6" font-weight="900" fill="#ef4444" text-anchor="middle">12.0</text>
          <rect x="26" y="5" width="16" height="11" rx="1.5" fill="#020617"/>
          <text x="34" y="13" font-family="'Courier New', monospace" font-size="6" font-weight="900" fill="#fbbf24" text-anchor="middle">2.5A</text>
          <!-- Knobs -->
          <circle cx="14" cy="22" r="3.2" fill="#334155" stroke="#64748b" stroke-width="0.8"/>
          <circle cx="26" cy="22" r="3.2" fill="#334155" stroke="#64748b" stroke-width="0.8"/>
          <rect x="33" y="19" width="8" height="6" rx="1" fill="#16a34a"/>
          <!-- 3 Binding posts: Red, Green, Black -->
          <circle cx="12" cy="33" r="2.5" fill="#ef4444" stroke="#991b1b" stroke-width="0.5"/>
          <circle cx="25" cy="33" r="2.5" fill="#fbbf24" stroke="#b45309" stroke-width="0.5"/>
          <circle cx="38" cy="33" r="2.5" fill="#0f172a" stroke="#334155" stroke-width="0.5"/>
        </svg>`;
      case 'fuse':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <!-- Glass Body -->
          <rect x="14" y="14" width="22" height="12" rx="2" fill="#0f172a" stroke="#475569" stroke-width="0.8"/>
          <rect x="14" y="14" width="22" height="12" rx="2" fill="rgba(186, 230, 253, 0.22)"/>
          <line x1="16" y1="16" x2="34" y2="16" stroke="#ffffff" stroke-width="0.8" opacity="0.7"/>
          <!-- Internal Filament Wire -->
          <path d="M 14 20 Q 20 18, 25 20 T 36 20" fill="none" stroke="#fbbf24" stroke-width="1.2"/>
          <!-- End Caps (Ferrules) -->
          <rect x="8" y="13" width="7" height="14" rx="1.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.8"/>
          <rect x="35" y="13" width="7" height="14" rx="1.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.8"/>
          <!-- Leads -->
          <line x1="3" y1="20" x2="8" y2="20" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="42" y1="20" x2="47" y2="20" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`;
      case 'function_generator':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <rect x="4" y="5" width="42" height="32" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          <!-- LCD Screen -->
          <rect x="7" y="8" width="24" height="16" rx="1.5" fill="#020617" stroke="#38bdf8" stroke-width="0.8"/>
          <!-- Waveform on thumb screen -->
          <path d="M 9 16 C 12 11, 14 11, 16 16 C 18 21, 20 21, 23 16 C 25 11, 27 11, 29 16" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round"/>
          <text x="19" y="22" font-family="'Courier New', monospace" font-size="3.5" font-weight="900" fill="#38bdf8" text-anchor="middle">1kHz</text>
          <!-- Knob -->
          <circle cx="38" cy="14" r="4.5" fill="#334155" stroke="#64748b" stroke-width="0.8"/>
          <circle cx="38" cy="14" r="3.2" fill="#1e293b"/>
          <line x1="38" y1="14" x2="40.5" y2="12" stroke="#38bdf8" stroke-width="1"/>
          <!-- Out button -->
          <rect x="33" y="21" width="10" height="4" rx="1" fill="#16a34a"/>
          <!-- BNC Jacks -->
          <circle cx="14" cy="30" r="2.2" fill="#38bdf8"/>
          <circle cx="26" cy="30" r="2.5" fill="#ef4444" stroke="#991b1b" stroke-width="0.6"/>
          <circle cx="38" cy="30" r="2.5" fill="#0f172a" stroke="#475569" stroke-width="0.6"/>
        </svg>`;
      case 'oscilloscope':
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <rect x="3" y="4" width="44" height="32" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          <!-- LCD Screen with Grid -->
          <rect x="6" y="7" width="26" height="18" rx="1.5" fill="#020617" stroke="#38bdf8" stroke-width="0.8"/>
          <line x1="19" y1="7" x2="19" y2="25" stroke="#1e293b" stroke-width="0.5" stroke-dasharray="1 1"/>
          <line x1="6" y1="16" x2="32" y2="16" stroke="#1e293b" stroke-width="0.5" stroke-dasharray="1 1"/>
          <!-- Dual Waveform traces -->
          <path d="M 7 16 Q 10 10, 13 16 T 19 16 T 25 16 T 31 16" fill="none" stroke="#facc15" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M 7 19 Q 13 19, 13 13 L 19 13 L 19 19 L 25 19 L 25 13 L 31 13" fill="none" stroke="#22d3ee" stroke-width="1" opacity="0.85"/>
          <!-- Knobs -->
          <circle cx="39" cy="11" r="3.5" fill="#334155" stroke="#64748b" stroke-width="0.8"/>
          <circle cx="36" cy="20" r="2.5" fill="#ca8a04"/>
          <circle cx="43" cy="20" r="2.5" fill="#0891b2"/>
          <!-- BNC Ports -->
          <circle cx="12" cy="30" r="2.2" fill="#ca8a04" stroke="#eab308" stroke-width="0.5"/>
          <circle cx="23" cy="30" r="2.2" fill="#0891b2" stroke="#06b6d4" stroke-width="0.5"/>
          <circle cx="34" cy="30" r="2.2" fill="#0f172a" stroke="#475569" stroke-width="0.5"/>
        </svg>`;
      case 'gate_and':
      case 'gate_or':
      case 'gate_not':
      case 'gate_nand':
      case 'gate_nor':
      case 'gate_xor':
      case 'gate_xnor': {
        const isNot = type === 'gate_not';
        const label = type.replace('gate_', '').toUpperCase();
        let symPath = '';
        if (type === 'gate_and') symPath = '<path d="M 17 14 L 26 14 A 6 6 0 0 1 26 26 L 17 26 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>';
        else if (type === 'gate_or') symPath = '<path d="M 16 14 Q 21 20 16 26 Q 26 26 31 20 Q 26 14 16 14 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>';
        else if (type === 'gate_not') symPath = '<polygon points="17,14 28,20 17,26" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><circle cx="31" cy="20" r="2.2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>';
        else if (type === 'gate_nand') symPath = '<path d="M 16 14 L 24 14 A 6 6 0 0 1 24 26 L 16 26 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><circle cx="32" cy="20" r="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>';
        else if (type === 'gate_nor') symPath = '<path d="M 15 14 Q 20 20 15 26 Q 25 26 30 20 Q 25 14 15 14 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><circle cx="33" cy="20" r="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>';
        else if (type === 'gate_xor') symPath = '<path d="M 13 14 Q 18 20 13 26" fill="none" stroke="#38bdf8" stroke-width="1.5"/><path d="M 16 14 Q 21 20 16 26 Q 26 26 31 20 Q 26 14 16 14 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>';
        else if (type === 'gate_xnor') symPath = '<path d="M 12 14 Q 17 20 12 26" fill="none" stroke="#38bdf8" stroke-width="1.5"/><path d="M 15 14 Q 20 20 15 26 Q 25 26 30 20 Q 25 14 15 14 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/><circle cx="33" cy="20" r="2" fill="#1e293b" stroke="#38bdf8" stroke-width="1.2"/>';

        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <text x="25" y="10" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="900" text-anchor="middle">${label}</text>
          ${isNot ? '<line x1="8" y1="20" x2="17" y2="20" stroke="#38bdf8" stroke-width="1.4"/>' : '<line x1="8" y1="17" x2="16" y2="17" stroke="#38bdf8" stroke-width="1.4"/><line x1="8" y1="23" x2="16" y2="23" stroke="#38bdf8" stroke-width="1.4"/>'}
          ${symPath}
          <line x1="33" y1="20" x2="42" y2="20" stroke="#f59e0b" stroke-width="1.6"/>
          <circle cx="42" cy="20" r="1.8" fill="#fbbf24"/>
        </svg>`;
      }
      case 'ic_7408':
      case 'ic_7432':
      case 'ic_7404':
      case 'ic_7486':
      case 'ic_7400':
      case 'ic_7402':
      case 'ic_74266': {
        const spec = window.IC_LOGIC_SPECS && window.IC_LOGIC_SPECS[type];
        const code = spec ? spec.code : type.replace('ic_', '');
        const gType = spec ? spec.gateType : 'IC';
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <rect x="12" y="5" width="26" height="30" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1.2"/>
          <path d="M 22 5 A 3 3 0 0 0 28 5" fill="none" stroke="#64748b" stroke-width="1"/>
          <circle cx="16" cy="9" r="1.2" fill="#64748b"/>
          <text x="25" y="18" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="6" font-weight="900" text-anchor="middle">${code}</text>
          <text x="25" y="27" fill="#fbbf24" font-family="'JetBrains Mono', monospace" font-size="4.5" font-weight="800" text-anchor="middle">${gType}</text>
          <line x1="7" y1="10" x2="12" y2="10" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="7" y1="15" x2="12" y2="15" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="7" y1="20" x2="12" y2="20" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="7" y1="25" x2="12" y2="25" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="7" y1="30" x2="12" y2="30" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="38" y1="10" x2="43" y2="10" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="38" y1="15" x2="43" y2="15" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="38" y1="20" x2="43" y2="20" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="38" y1="25" x2="43" y2="25" stroke="#94a3b8" stroke-width="1.2"/>
          <line x1="38" y1="30" x2="43" y2="30" stroke="#94a3b8" stroke-width="1.2"/>
        </svg>`;
      }
      default:
        return `<svg viewBox="0 0 50 40" class="catalog-thumb-svg">
          <rect x="10" y="8" width="30" height="24" rx="5" fill="#1e293b" stroke="#fbbf24" stroke-width="1.4"/>
          <text x="25" y="24" font-size="12" text-anchor="middle">${avatar}</text>
        </svg>`;
    }
  }
}

window.CHARACTER_PROFILES = CHARACTER_PROFILES;
window.COMPONENT_DEFINITIONS = COMPONENT_DEFINITIONS;
window.ComponentRenderer = ComponentRenderer;
