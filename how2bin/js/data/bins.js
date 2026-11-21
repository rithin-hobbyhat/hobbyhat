/**
 * Bin Definitions and Exact SVG Models matching the user's uploaded 4-bin standard:
 * 1. Green Bin (Wet / Biodegradable Waste) -> Leaf Symbol
 * 2. Blue Bin (Dry / Recyclable Waste) -> 3-Arrow Recycle Symbol
 * 3. Red Bin (Sanitary Waste) -> Biohazard Symbol
 * 4. Black Bin (Special Care / Hazardous Waste) -> Special Trash / Hazmat Symbol
 */

function getRealisticBinSvg(binId) {
  // Common 3D wheelie bin geometry matching the uploaded reference image
  // Width: 180, Height: 240
  const defs = `
    <defs>
      <filter id="binShad" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
      <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#181a1b"/>
        <stop offset="50%" stop-color="#323639"/>
        <stop offset="100%" stop-color="#0f1112"/>
      </linearGradient>

      <!-- GREEN GRADIENTS -->
      <linearGradient id="greenBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#328e29"/>
        <stop offset="30%" stop-color="#49ab3e"/>
        <stop offset="70%" stop-color="#3ea133"/>
        <stop offset="100%" stop-color="#287520"/>
      </linearGradient>
      <linearGradient id="greenLid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#55ba49"/>
        <stop offset="60%" stop-color="#3ea133"/>
        <stop offset="100%" stop-color="#2c7c24"/>
      </linearGradient>

      <!-- BLUE GRADIENTS -->
      <linearGradient id="blueBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#156cb6"/>
        <stop offset="30%" stop-color="#2a86d6"/>
        <stop offset="70%" stop-color="#1f7ecf"/>
        <stop offset="100%" stop-color="#105794"/>
      </linearGradient>
      <linearGradient id="blueLid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#3c97e4"/>
        <stop offset="60%" stop-color="#1f7ecf"/>
        <stop offset="100%" stop-color="#135b9b"/>
      </linearGradient>

      <!-- RED GRADIENTS -->
      <linearGradient id="redBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b82a1d"/>
        <stop offset="30%" stop-color="#db3d2f"/>
        <stop offset="70%" stop-color="#d03426"/>
        <stop offset="100%" stop-color="#991f15"/>
      </linearGradient>
      <linearGradient id="redLid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e84b3d"/>
        <stop offset="60%" stop-color="#d03426"/>
        <stop offset="100%" stop-color="#a42217"/>
      </linearGradient>

      <!-- BLACK / DARK GREY GRADIENTS -->
      <linearGradient id="blackBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2b2d30"/>
        <stop offset="30%" stop-color="#3d4044"/>
        <stop offset="70%" stop-color="#34373a"/>
        <stop offset="100%" stop-color="#202224"/>
      </linearGradient>
      <linearGradient id="blackLid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#494c50"/>
        <stop offset="60%" stop-color="#34373a"/>
        <stop offset="100%" stop-color="#232527"/>
      </linearGradient>

      <!-- YELLOW GRADIENTS (Indian Biomedical Waste: Soiled / Anatomical / Meds) -->
      <linearGradient id="yellowBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b45309"/>
        <stop offset="30%" stop-color="#fbbf24"/>
        <stop offset="70%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
      <linearGradient id="yellowLid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fde047"/>
        <stop offset="60%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>

      <!-- TRANSLUCENT WHITE GRADIENTS (Indian Biomedical Waste: Puncture-Proof Metallic Sharps) -->
      <linearGradient id="whiteBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#cbd5e1"/>
        <stop offset="30%" stop-color="#f8fafc"/>
        <stop offset="70%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <linearGradient id="whiteLid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#e2e8f0"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
    </defs>
  `;

  let bodyFill = 'url(#greenBody)';
  let lidFill = 'url(#greenLid)';
  let emblemSvg = '';

  if (binId === 'green') {
    bodyFill = 'url(#greenBody)';
    lidFill = 'url(#greenLid)';
    // White Leaf Emblem (crisp, bold, centered - exact match to uploaded image)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.25)">
        <!-- White Leaf Body -->
        <path d="M -16,18 C -16,18 -17,2 -7,-10 C 3,-22 18,-26 23,-27 C 23,-27 19,-12 9,0 C -1,12 -16,18 -16,18 Z" fill="#ffffff"/>
        <!-- Stem -->
        <path d="M -16,18 C -19,22 -22,27 -24,31" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none"/>
        <!-- Clean Leaf Vein Cutout -->
        <path d="M -13,15 C -5,7 6,-2 17,-18" stroke="#28731f" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      </g>
    `;
  } else if (binId === 'blue') {
    bodyFill = 'url(#blueBody)';
    lidFill = 'url(#blueLid)';
    // White Mobius Chasing Arrows Recycling Emblem (bold, crisp, perfectly centered)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.25)" fill="#ffffff">
        <path d="M -6,-24 L 9,-24 C 15,-24 20,-20 23,-14 L 17,-12 C 15,-16 12,-19 8,-19 L -2,-19 L -2,-13 L -15,-22 L -2,-31 L -2,-24 Z"/>
        <path d="M -6,-24 L 9,-24 C 15,-24 20,-20 23,-14 L 17,-12 C 15,-16 12,-19 8,-19 L -2,-19 L -2,-13 L -15,-22 L -2,-31 L -2,-24 Z" transform="rotate(120)"/>
        <path d="M -6,-24 L 9,-24 C 15,-24 20,-20 23,-14 L 17,-12 C 15,-16 12,-19 8,-19 L -2,-19 L -2,-13 L -15,-22 L -2,-31 L -2,-24 Z" transform="rotate(240)"/>
      </g>
    `;
  } else if (binId === 'red') {
    bodyFill = 'url(#redBody)';
    lidFill = 'url(#redLid)';
    // White Biohazard Emblem (bold, crisp, 3-crescent ring - exact match to uploaded image)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.05)">
        <circle cx="0" cy="0" r="23" fill="none" stroke="#ffffff" stroke-width="4.5"/>
        <g fill="#ffffff">
          <g transform="rotate(0)">
            <path d="M -16,-28 A 20,20 0 0,1 16,-28 A 14,14 0 0,0 7,-16 A 9,9 0 0,1 -7,-16 A 14,14 0 0,0 -16,-28 Z"/>
            <path d="M -4,-13 C -2,-8 0,-6 0,-6 C 0,-6 2,-8 4,-13 A 8,8 0 0,0 -4,-13 Z"/>
          </g>
          <g transform="rotate(120)">
            <path d="M -16,-28 A 20,20 0 0,1 16,-28 A 14,14 0 0,0 7,-16 A 9,9 0 0,1 -7,-16 A 14,14 0 0,0 -16,-28 Z"/>
            <path d="M -4,-13 C -2,-8 0,-6 0,-6 C 0,-6 2,-8 4,-13 A 8,8 0 0,0 -4,-13 Z"/>
          </g>
          <g transform="rotate(240)">
            <path d="M -16,-28 A 20,20 0 0,1 16,-28 A 14,14 0 0,0 7,-16 A 9,9 0 0,1 -7,-16 A 14,14 0 0,0 -16,-28 Z"/>
            <path d="M -4,-13 C -2,-8 0,-6 0,-6 C 0,-6 2,-8 4,-13 A 8,8 0 0,0 -4,-13 Z"/>
          </g>
          <circle cx="0" cy="0" r="5" fill="#cc3022"/>
          <circle cx="0" cy="0" r="2.2" fill="#ffffff"/>
        </g>
        <line x1="0" y1="0" x2="0" y2="-27" stroke="#cc3022" stroke-width="4.5"/>
        <line x1="0" y1="0" x2="23.4" y2="13.5" stroke="#cc3022" stroke-width="4.5"/>
        <line x1="0" y1="0" x2="-23.4" y2="13.5" stroke="#cc3022" stroke-width="4.5"/>
        <circle cx="0" cy="0" r="5.8" fill="#cc3022"/>
      </g>
    `;
  } else if (binId === 'black') {
    bodyFill = 'url(#blackBody)';
    lidFill = 'url(#blackLid)';
    // White Trash Can / Hazardous Bin Emblem (bold, crisp - exact match to uploaded image)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.2)">
        <!-- Lid Handle -->
        <rect x="-8" y="-26" width="16" height="4.5" rx="2.2" fill="#ffffff"/>
        <!-- Lid Rim -->
        <rect x="-20" y="-21.5" width="40" height="6.5" rx="3" fill="#ffffff"/>
        <!-- Body Container -->
        <path d="M -17,-13 L -13.5,23 C -13.5,25.5 -11,27.5 -8.5,27.5 L 8.5,27.5 C 11,27.5 13.5,25.5 13.5,23 L 17,-13 Z" fill="#ffffff"/>
        <!-- Vertical Fluting Slats cutouts -->
        <rect x="-10.5" y="-7" width="3.8" height="29" rx="1.9" fill="#33363a"/>
        <rect x="-1.9" y="-7" width="3.8" height="29" rx="1.9" fill="#33363a"/>
        <rect x="6.7" y="-7" width="3.8" height="29" rx="1.9" fill="#33363a"/>
      </g>
    `;
  } else if (binId === 'bmw_yellow' || binId === 'yellow') {
    bodyFill = 'url(#yellowBody)';
    lidFill = 'url(#yellowLid)';
    // Indian Biomedical Waste: Yellow (Biohazard + Medical Cross for Anatomical / Soiled / Expired Meds)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.08)">
        <!-- Biohazard 3-ring in crisp white with dark biohazard red center -->
        <circle cx="0" cy="0" r="23" fill="none" stroke="#ffffff" stroke-width="4.2"/>
        <g fill="#ffffff">
          <g transform="rotate(0)">
            <path d="M -16,-28 A 20,20 0 0,1 16,-28 A 14,14 0 0,0 7,-16 A 9,9 0 0,1 -7,-16 A 14,14 0 0,0 -16,-28 Z"/>
            <path d="M -4,-13 C -2,-8 0,-6 0,-6 C 0,-6 2,-8 4,-13 A 8,8 0 0,0 -4,-13 Z"/>
          </g>
          <g transform="rotate(120)">
            <path d="M -16,-28 A 20,20 0 0,1 16,-28 A 14,14 0 0,0 7,-16 A 9,9 0 0,1 -7,-16 A 14,14 0 0,0 -16,-28 Z"/>
            <path d="M -4,-13 C -2,-8 0,-6 0,-6 C 0,-6 2,-8 4,-13 A 8,8 0 0,0 -4,-13 Z"/>
          </g>
          <g transform="rotate(240)">
            <path d="M -16,-28 A 20,20 0 0,1 16,-28 A 14,14 0 0,0 7,-16 A 9,9 0 0,1 -7,-16 A 14,14 0 0,0 -16,-28 Z"/>
            <path d="M -4,-13 C -2,-8 0,-6 0,-6 C 0,-6 2,-8 4,-13 A 8,8 0 0,0 -4,-13 Z"/>
          </g>
          <circle cx="0" cy="0" r="5.5" fill="#d97706"/>
          <circle cx="0" cy="0" r="2.5" fill="#ffffff"/>
        </g>
        <line x1="0" y1="0" x2="0" y2="-27" stroke="#d97706" stroke-width="4.2"/>
        <line x1="0" y1="0" x2="23.4" y2="13.5" stroke="#d97706" stroke-width="4.2"/>
        <line x1="0" y1="0" x2="-23.4" y2="13.5" stroke="#d97706" stroke-width="4.2"/>
      </g>
    `;
  } else if (binId === 'bmw_red') {
    bodyFill = 'url(#redBody)';
    lidFill = 'url(#redLid)';
    // Indian Biomedical Waste: Red (Contaminated Recyclable Plastics - IV sets, gloves, tubes, syringe barrels)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.15)" fill="#ffffff">
        <!-- 3-Arrow Plastics Recycle loop around plastic flask / syringe emblem -->
        <path d="M -6,-24 L 9,-24 C 15,-24 20,-20 23,-14 L 17,-12 C 15,-16 12,-19 8,-19 L -2,-19 L -2,-13 L -15,-22 L -2,-31 L -2,-24 Z"/>
        <path d="M -6,-24 L 9,-24 C 15,-24 20,-20 23,-14 L 17,-12 C 15,-16 12,-19 8,-19 L -2,-19 L -2,-13 L -15,-22 L -2,-31 L -2,-24 Z" transform="rotate(120)"/>
        <path d="M -6,-24 L 9,-24 C 15,-24 20,-20 23,-14 L 17,-12 C 15,-16 12,-19 8,-19 L -2,-19 L -2,-13 L -15,-22 L -2,-31 L -2,-24 Z" transform="rotate(240)"/>
        <!-- Plastic bottle / infusion bottle center icon -->
        <rect x="-5" y="-12" width="10" height="24" rx="3" fill="#ffffff"/>
        <rect x="-3" y="-16" width="6" height="4" rx="1" fill="#ffffff"/>
        <rect x="-2" y="-5" width="4" height="12" rx="1" fill="#b82a1d"/>
      </g>
    `;
  } else if (binId === 'bmw_white' || binId === 'white') {
    bodyFill = 'url(#whiteBody)';
    lidFill = 'url(#whiteLid)';
    // Indian Biomedical Waste: White Translucent (Puncture-Proof Metallic Sharps: Needles, Scalpels, Blades)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.18)">
        <!-- Hazard Triangle in Biohazard Red -->
        <polygon points="0,-27 25,19 -25,19" fill="#fee2e2" stroke="#dc2626" stroke-width="3.5" stroke-linejoin="round"/>
        <!-- Crossed Surgical Scalpel Blade & Injection Needle in Dark Navy/Charcoal -->
        <!-- Scalpel Blade -->
        <path d="M -11,11 L 12,-14 C 14,-16 17,-16 18,-14 C 19,-12 18,-9 16,-7 L -6,14 Z" fill="#0f172a"/>
        <!-- Hypodermic Needle -->
        <line x1="11" y1="12" x2="-11" y2="-13" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="-12" cy="-14" r="2.2" fill="#dc2626"/>
        <text x="0" y="16" font-family="'Fredoka', 'Quicksand', sans-serif" font-size="7.5" font-weight="900" fill="#dc2626" text-anchor="middle">SHARPS</text>
      </g>
    `;
  } else if (binId === 'bmw_blue') {
    bodyFill = 'url(#blueBody)';
    lidFill = 'url(#blueLid)';
    // Indian Biomedical Waste: Blue (Glassware - Vials, Ampoules, Slides & Metallic Body Implants)
    emblemSvg = `
      <g transform="translate(90, 126) scale(1.18)" fill="#ffffff">
        <!-- Glass Ampoule on Left -->
        <path d="M -18,-20 L -14,-20 L -14,-10 L -10,-5 L -10,21 C -10,23 -12,25 -14,25 L -18,25 C -20,25 -22,23 -22,21 L -22,-5 L -18,-10 Z"/>
        <circle cx="-16" cy="10" r="3" fill="#156cb6"/>
        <!-- Glass Medicine Vial on Right -->
        <rect x="0" y="-16" width="16" height="4" rx="1.5"/>
        <rect x="2" y="-12" width="12" height="3"/>
        <rect x="-2" y="-9" width="20" height="32" rx="4"/>
        <rect x="2" y="2" width="12" height="16" rx="2" fill="#156cb6"/>
        <!-- Metallic Bone Screw / Implant thread lines below -->
        <line x1="4" y1="6" x2="12" y2="6" stroke="#ffffff" stroke-width="2"/>
        <line x1="4" y1="11" x2="12" y2="11" stroke="#ffffff" stroke-width="2"/>
      </g>
    `;
  }

  return `
    <svg class="real-bin-svg" viewBox="0 0 180 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      ${defs}

      <!-- Wheels (Black rubber wheels with center hub) -->
      <g id="wheels">
        <circle cx="28" cy="216" r="16" fill="url(#wheelGrad)"/>
        <circle cx="28" cy="216" r="7" fill="#181a1b"/>
        <circle cx="28" cy="216" r="3" fill="#64748b"/>
        <circle cx="152" cy="216" r="16" fill="url(#wheelGrad)"/>
        <circle cx="152" cy="216" r="7" fill="#181a1b"/>
        <circle cx="152" cy="216" r="3" fill="#64748b"/>
        <rect x="28" y="213" width="124" height="6" fill="#181a1b" rx="2"/>
      </g>

      <!-- Bin Tapered Body (Smooth, molded contours matching image) -->
      <polygon points="32,48 148,48 138,212 42,212" fill="${bodyFill}" filter="url(#binShad)"/>

      <!-- Central subtle 3D highlight column -->
      <polygon points="76,48 104,48 98,212 82,212" fill="#ffffff" opacity="0.08"/>

      <!-- Upper Collar Rim -->
      <rect x="24" y="38" width="132" height="12" rx="4" fill="${lidFill}" filter="url(#binShad)"/>

      <!-- Center White Emblem -->
      ${emblemSvg}

      <!-- Stepped Tiered Domed Lid that lifts upward when placing waste -->
      <g class="real-bin-lid">
        <path d="
          M 22,38
          L 28,26
          Q 32,20 40,20
          L 140,20
          Q 148,20 152,26
          L 158,38
          Z
        " fill="${lidFill}" filter="url(#binShad)"/>

        <!-- Lid Handle Recess / Top Tier -->
        <path d="
          M 48,20
          L 54,12
          Q 58,8 66,8
          L 114,8
          Q 122,8 126,12
          L 132,20
          Z
        " fill="${lidFill}" opacity="0.9"/>
        <rect x="74" y="8" width="32" height="4" rx="2" fill="#ffffff" opacity="0.18"/>
        <!-- Top grip handle bar -->
        <rect x="70" y="5" width="40" height="5" rx="2.5" fill="${lidFill}" stroke="#ffffff" stroke-width="0.8" opacity="0.9"/>
      </g>
    </svg>
  `;
}

/**
 * 4-Bin Standard Data Specifications:
 * 1. Green: Wet / Biodegradable Waste
 * 2. Blue: Dry / Recyclable Waste
 * 3. Red: Sanitary Waste
 * 4. Black: Hazardous / Domestic Special Care Waste
 */
const BINS_DATA = {
  green: {
    id: 'green',
    name: 'Green Bin (Wet Waste)',
    shortName: 'Wet Waste',
    color: '#3ea133',
    accentColor: '#86efac',
    icon: '🌱',
    symbol: '🍃',
    banner: 'Biodegradable Waste',
    description: 'Food scraps, fruit & vegetable peels, tea leaves, coffee grounds, and garden leaves.',
    safetyRule: 'Keep clean of plastics, glass, wrappers, and chemicals. Ideal for rich soil composting!',
    prepNote: 'Remove stickers and packaging before composting.',
    targetCategory: 'green',
    sound: 'organic_drop'
  },
  blue: {
    id: 'blue',
    name: 'Blue Bin (Dry Waste)',
    shortName: 'Dry Waste',
    color: '#1f7ecf',
    accentColor: '#93c5fd',
    icon: '♻️',
    symbol: '📦',
    banner: 'Recyclables (Paper, Plastic, Metal, Glass)',
    description: 'Clean paper, cardboard, plastic bottles, drink cans, and glass jars.',
    safetyRule: 'Must be empty, clean, and dry! Rinse sticky containers and crush cans flat.',
    prepNote: 'Rinse bottles and flatten cardboard to save space.',
    targetCategory: 'blue',
    sound: 'recycle_drop'
  },
  red: {
    id: 'red',
    name: 'Red Bin (Sanitary Waste)',
    shortName: 'Sanitary Waste',
    color: '#d03426',
    accentColor: '#fca5a5',
    icon: '☣️',
    symbol: '🩹',
    banner: 'Diapers, Napkins & Soiled Dressings',
    description: 'Used diapers, sanitary napkins, soiled bandages, tissues, and cotton swabs.',
    safetyRule: 'Always wrap sanitary items in paper; never mix with food compost or dry recyclables.',
    prepNote: 'Use tongs or gloves; wrap securely before disposal.',
    targetCategory: 'red',
    requiresTongs: true,
    sound: 'sharps_drop'
  },
  black: {
    id: 'black',
    name: 'Black Bin (Special / Hazmat)',
    shortName: 'Special Waste',
    color: '#34373a',
    accentColor: '#cbd5e1',
    icon: '⚠️',
    symbol: '🔋',
    banner: 'Hazardous, Bulbs, Meds & E-Waste',
    description: 'Dead batteries, light bulbs, tube lights, expired medicines, paint cans, and small e-waste.',
    safetyRule: 'Toxic chemical & fire risk! Keep separate from household waste. Tape battery terminals!',
    prepNote: 'Tape battery ends and ensure chemical lids are tightly sealed.',
    targetCategory: 'black',
    requiresTongs: true,
    sound: 'hazmat_drop'
  }
};

/**
 * Indian Biomedical Waste Color Standard (Task 2):
 * 1. Yellow: Anatomical, Soiled (cotton/dressings), Lab cultures, Chemical, Expired meds
 * 2. Red: Recyclable contaminated plastics (IV tubing, catheters, gloves, needle-free syringes)
 * 3. White (Translucent): Puncture-proof container for metallic sharps (needles, scalpels, blades)
 * 4. Blue: Glassware (vials, ampoules, glass slides) and metallic body implants
 */
const BIOMEDICAL_BINS_DATA = {
  bmw_yellow: {
    id: 'bmw_yellow',
    name: 'Yellow: Soiled & Anatomical',
    shortName: 'Yellow Bin',
    subName: 'Soiled & Expired Meds',
    color: '#d97706',
    accentColor: '#fde047',
    icon: '☣️',
    symbol: '🩸',
    banner: 'Anatomical, Soiled & Expired Medicines',
    description: 'Human anatomical waste, blood-soaked cotton, gauze, dressings, microbiological lab cultures, chemical waste, and expired/discarded medicines.',
    safetyRule: 'Autoclaved or incinerated safely. Never mix with general trash or plastic recycling!',
    targetCategory: 'bmw_yellow',
    sound: 'sharps_drop'
  },
  bmw_red: {
    id: 'bmw_red',
    name: 'Red: Contaminated Plastics',
    shortName: 'Red Bin',
    subName: 'Contaminated Plastics',
    color: '#dc2626',
    accentColor: '#fca5a5',
    icon: '🧴',
    symbol: '💉',
    banner: 'Recyclable Contaminated Plastics',
    description: 'Recyclable contaminated plastics: IV sets, tubing, catheters, syringes without needles, used gloves, specimen containers.',
    safetyRule: 'Sterilized and autoclaved for plastics recycling. Absolutely NO metallic needles allowed!',
    targetCategory: 'bmw_red',
    sound: 'recycle_drop'
  },
  bmw_white: {
    id: 'bmw_white',
    name: 'White: Metallic Sharps',
    shortName: 'White Bin',
    subName: 'Metallic Sharps',
    color: '#e2e8f0',
    accentColor: '#ffffff',
    icon: '🗡️',
    symbol: '🪡',
    banner: 'Puncture-Proof Metallic Sharps',
    description: 'Puncture-proof translucent container for metallic sharps: needles, syringes with fixed needles, scalpels, surgical blades, and lancets.',
    safetyRule: 'Severe puncture hazard! Never handle barehanded. Must be sealed in puncture-proof box.',
    requiresTongs: true,
    targetCategory: 'bmw_white',
    sound: 'sharps_drop'
  },
  bmw_blue: {
    id: 'bmw_blue',
    name: 'Blue: Glassware & Implants',
    shortName: 'Blue Bin',
    subName: 'Glassware & Implants',
    color: '#2563eb',
    accentColor: '#93c5fd',
    icon: '🧪',
    symbol: '🫙',
    banner: 'Glassware & Metallic Implants',
    description: 'Glassware (vials, ampoules, broken or unbroken glass slides) and metallic body implants.',
    safetyRule: 'Disinfected with sodium hypochlorite / autoclaved. Puncture-resistant cardboard/box.',
    targetCategory: 'bmw_blue',
    sound: 'recycle_drop'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BINS_DATA, BIOMEDICAL_BINS_DATA, getRealisticBinSvg };
}
