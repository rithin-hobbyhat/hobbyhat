/**
 * 5S Method Data and Scenarios for how2bin
 * Japanese 5S Philosophy adapted for kids:
 * 1. Seiri (Sort): Separate necessary from unnecessary items.
 * 2. Seiton (Set in Order): A place for everything, everything in its place.
 * 3. Seiso (Shine): Clean, scrub, and inspect equipment.
 * 4. Seiketsu (Standardize): Create visual standards, colors, and rules.
 * 5. Shitsuke (Sustain): Practice daily habits, self-discipline, and audits.
 */

const FIVE_S_STAGES = [
  {
    id: 'seiri',
    number: 1,
    japanese: 'Seiri (整理)',
    english: 'Sort',
    subtitle: 'Keep What We Need, Red-Tag What We Don’t',
    badge: '🏷️ Red-Tag Master',
    motto: 'Separate what is needed from what is clutter or hazardous!',
    instructions: 'Examine each item on the workstation. Place useful tools onto the Workshop Shelf (Keep & Use) and dispose of damaged, moldy, or hazardous clutter into the Trashbin (Discard).',
    items: [
      { id: 'item_tongs', name: 'Safety Tongs', icon: '🗜️', isNeeded: true, reason: 'Essential tool for safely handling needles and glass without cuts!' },
      { id: 'item_expired_chem', name: 'Cracked Leaking Chemical Bottle', icon: '🧪', isNeeded: false, reason: 'Hazardous risk! Red-tag and safely send to chemical hazmat disposal.' },
      { id: 'item_magnifier', name: 'Inspection Magnifying Glass', icon: '🔍', isNeeded: true, reason: 'Useful for spotting tiny recycling plastic resin codes and contamination.' },
      { id: 'item_dead_battery_crust', name: 'Corroded Leaking Battery', icon: '🔋', isNeeded: false, reason: 'Dangerous acid crust! Red-tag and separate into e-waste battery box.' },
      { id: 'item_clean_gloves', name: 'Nitrile Safety Gloves', icon: '🧤', isNeeded: true, reason: 'Protects hands from grime and biological splashes.' },
      { id: 'item_crushed_carton', name: 'Moldy Wet Juice Box', icon: '🧃', isNeeded: false, reason: 'Moldy clutter attracts bugs and rots work areas; dispose in proper bin!' },
      { id: 'item_label_tape', name: 'Color Identification Labels', icon: '🏷️', isNeeded: true, reason: 'Needed to standardize and mark bins clearly.' },
      { id: 'item_broken_ruler', name: 'Snapped Jagged Plastic Shard', icon: '📐', isNeeded: false, reason: 'Sharp jagged junk causes cuts; discard into residual bin.' }
    ]
  },
  {
    id: 'seiton',
    number: 2,
    japanese: 'Seiton (整頓)',
    english: 'Set in Order',
    subtitle: 'A Place for Everything and Everything in Its Place',
    badge: '📐 Station Architect',
    motto: 'Organize items so anyone can find, use, and return them instantly!',
    instructions: 'Drag each color-coded station bin and safety tool into its marked outline position on the shadow board.',
    slots: [
      { id: 'slot_green', label: 'Green Wet Waste Bin (Leaf)', expectedId: 'bin_green_item', icon: '🍃', color: '#3ea133' },
      { id: 'slot_blue', label: 'Blue Dry Recyclables (Recycle)', expectedId: 'bin_blue_item', icon: '♻️', color: '#1f7ecf' },
      { id: 'slot_red', label: 'Red Sanitary Bin (Biohazard)', expectedId: 'bin_red_item', icon: '☣️', color: '#d03426' },
      { id: 'slot_black', label: 'Black Special / Hazmat Bin (Trash)', expectedId: 'bin_black_item', icon: '🗑️', color: '#34373a' },
      { id: 'slot_tools', label: 'Safety Tongs & Tool Rack', expectedId: 'tool_rack_item', icon: '🧰', color: '#00695c' }
    ],
    draggableItems: [
      { id: 'bin_green_item', name: 'Green Wet Waste Bin', icon: '🍃', color: '#3ea133' },
      { id: 'bin_blue_item', name: 'Blue Dry Recyclables Bin', icon: '♻️', color: '#1f7ecf' },
      { id: 'bin_red_item', name: 'Red Sanitary Bin', icon: '☣️', color: '#d03426' },
      { id: 'bin_black_item', name: 'Black Special Care Bin', icon: '🗑️', color: '#34373a' },
      { id: 'tool_rack_item', name: 'Safety Tongs Tool Rack', icon: '🧰', color: '#00695c' }
    ]
  },
  {
    id: 'seiso',
    number: 3,
    japanese: 'Seiso (清掃)',
    english: 'Shine & Inspect',
    subtitle: 'Clean to Inspect, Inspect to Prevent Hazards',
    badge: '✨ Sparkle Champion',
    motto: 'Cleaning is not just tidying—it reveals leaks, cracks, and safety hazards!',
    instructions: 'Use the cleaning sponge and spray to wipe away all 5 sticky stains, grime spots, and spills on the sorting counter.',
    stains: [
      { id: 'stain_1', name: 'Sticky Juice Spill', icon: '🧃', x: 20, y: 30, size: 60, scrubbed: 0, required: 4 },
      { id: 'stain_2', name: 'Dusty Dirt Smudge', icon: '💨', x: 70, y: 25, size: 55, scrubbed: 0, required: 4 },
      { id: 'stain_3', name: 'Greasy Oil Ring', icon: '🛢️', x: 45, y: 60, size: 65, scrubbed: 0, required: 4 },
      { id: 'stain_4', name: 'Coffee Drip Spot', icon: '☕', x: 80, y: 70, size: 50, scrubbed: 0, required: 4 },
      { id: 'stain_5', name: 'Fallen Paper Scraps', icon: '📄', x: 25, y: 75, size: 50, scrubbed: 0, required: 4 }
    ]
  },
  {
    id: 'seiketsu',
    number: 4,
    japanese: 'Seiketsu (清潔)',
    english: 'Standardize',
    subtitle: 'Visual Standards and Color Rules Everyone Understands',
    badge: '🏷️ Standardization Officer',
    motto: 'Clear colors, signs, and labels make safety second nature!',
    instructions: 'Match each official visual hazard and recycling symbol to the correct waste standard.',
    matches: [
      {
        id: 'std_green_leaf',
        symbol: '🍃',
        symbolName: 'White Leaf Emblem',
        targetLabel: 'Green Bin (Wet / Biodegradable Waste)',
        explanation: 'The leaf emblem identifies kitchen food scraps, vegetable peels, coffee grounds, and garden trimmings for natural composting.'
      },
      {
        id: 'std_blue_mobius',
        symbol: '♻️',
        symbolName: 'White 3-Arrow Mobius Loop',
        targetLabel: 'Blue Bin (Dry Recyclables: Paper, Plastic, Glass, Metal)',
        explanation: 'The chasing arrows represent circular recyclables: clean paper, flattened boxes, plastic bottles, cans, and glass jars.'
      },
      {
        id: 'std_red_biohazard',
        symbol: '☣️',
        symbolName: 'White Biohazard Emblem',
        targetLabel: 'Red Bin (Sanitary Waste: Diapers, Napkins, Bandages)',
        explanation: 'The biohazard symbol marks personal hygiene and sanitary waste for safe high-temperature incineration.'
      },
      {
        id: 'std_black_hazard',
        symbol: '🗑️',
        symbolName: 'White Special Waste Emblem',
        targetLabel: 'Black Bin (Special Care / Hazardous: Bulbs, Meds, E-Waste)',
        explanation: 'The special waste emblem marks batteries, fluorescent tube lights, expired medicines, paint cans, and small e-waste.'
      }
    ]
  },
  {
    id: 'shitsuke',
    number: 5,
    japanese: 'Shitsuke (躾)',
    english: 'Sustain',
    subtitle: 'Daily Habits, Self-Discipline, and Safety Audits',
    badge: '🏅 5S Eco-Master Auditor',
    motto: 'Do safety right every single day, even when nobody is watching!',
    instructions: 'Conduct the daily 5S eco-audit by answering whether each workplace condition passes or fails health and safety standards.',
    auditQuestions: [
      {
        id: 'audit_1',
        title: 'Sharps Bin Placement',
        question: 'Is the yellow puncture-proof sharps box kept locked, labeled, and out of reach of toddlers and pets?',
        options: [
          { text: 'YES - Safe, elevated, locked position', correct: true, feedback: 'Correct! Never leave sharps containers on the floor where toddlers or pets could tip them.' },
          { text: 'NO - Keep it on the playroom rug for quick access', correct: false, feedback: 'Hazardous! Sharps must be stored safely away from children and pets.' }
        ]
      },
      {
        id: 'audit_2',
        title: 'Battery Terminal Insulation',
        question: 'Are all stored lithium and 9V battery terminals taped with non-conductive electrical tape?',
        options: [
          { text: 'YES - Both terminals are taped to prevent sparks', correct: true, feedback: 'Spot on! Taping terminals stops loose metal from short-circuiting batteries and igniting fires.' },
          { text: 'NO - Leave terminals bare touching metal keys', correct: false, feedback: 'Fire risk! Loose keys touching bare battery poles can spark fires in seconds.' }
        ]
      },
      {
        id: 'audit_3',
        title: 'Compost Bin Lids & Odor Control',
        question: 'Is the kitchen organic compost caddy fitted with a tight-fitting lid or charcoal filter?',
        options: [
          { text: 'YES - Fitted with a tight lid to keep fruit flies out', correct: true, feedback: 'Great job! Tight lids and aerated filters keep fruit flies and bad smells away.' },
          { text: 'NO - Leave wide open next to bedroom window', correct: false, feedback: 'Unsanitary! Open food scraps attract fruit flies, mice, and bacteria.' }
        ]
      },
      {
        id: 'audit_4',
        title: 'Chemical Container Inspection',
        question: 'Are all paint cans and drain cleaners sitting on a secondary spill containment tray?',
        options: [
          { text: 'YES - Spill tray catches any accidental leaks', correct: true, feedback: 'Excellent 5S practice! Secondary containment trays prevent toxic chemicals from reaching groundwater.' },
          { text: 'NO - Balance loosely on top of a wobbly chair', correct: false, feedback: 'Severe hazard! Falling chemical containers can spill corrosive acids.' }
        ]
      },
      {
        id: 'audit_5',
        title: '5S Daily Routine Check',
        question: 'At the end of every school day or workshop, do team members do a 5-minute cleanup & reset?',
        options: [
          { text: 'YES - 5-minute daily sweep keeps standards high', correct: true, feedback: 'Pure Shitsuke! Daily 5-minute routines make organization effortless and continuous.' },
          { text: 'NO - Wait until the end of the year to clean everything', correct: false, feedback: 'Waiting months leads to massive clutter, forgotten hazards, and pest infestations.' }
        ]
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FIVE_S_STAGES };
}
