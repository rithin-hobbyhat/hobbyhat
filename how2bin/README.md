# how2bin 🌱♻️☣️🗑️
**A Kid-Friendly Browser Educational Game on Waste Sorting, Biomedical Sharps Safety & the 5S Method**

Target Audience: Children ages 7–14  
Platforms: Desktop & Mobile Web Browsers (Mouse, Touch, and Tap-to-Place friendly)  
Theme: High-contrast Dark Mode with realistic physical waste bins and pure graphics.

---

## 🌟 Highlights & Educational Objectives
`how2bin` teaches children real-world municipal waste standards, clinical sharps safety, and the Japanese 5S workplace/home methodology (*Sort, Set in Order, Shine, Standardize, Sustain*).

### 🗑️ The 4 Standard Real-World Waste Bins
Calibrated to the 4-bin municipal and safety standard:
1. **🌱 Green Bin (Wet / Biodegradable Waste)**:
   - **Emblem**: Solid White Leaf
   - **Contents**: Food scraps, fruit & vegetable peels, cooked food leftovers, garden trimmings, tea leaves, and coffee grounds.
   - **Rule**: Keep free of plastics and wrappers; rich natural compost creation!
2. **♻️ Blue Bin (Dry / Recyclable Waste)**:
   - **Emblem**: Solid White 3-Arrow Mobius Recycling Loop
   - **Contents**: Clean paper, cardboard shipping boxes, plastic packaging & bottles, glass jars, and metal cans/clean foils.
   - **Rule**: Must be empty, clean, and dry! Practice **Rinse**, **Crush**, and **Flatten**.
3. **☣️ Red Bin (Sanitary Waste)**:
   - **Emblem**: Solid White Biohazard Emblem
   - **Contents**: Used baby diapers, sanitary napkins, adhesive band-aids, runny-nose tissues, and soiled bandages/gauze.
   - **Rule**: Always wrap securely in paper before disposal; handled with safety tongs or gloves for high-temperature incineration.
4. **🗑️ Black Bin (Special Care / Domestic Hazardous Waste)**:
   - **Emblem**: Solid White Trash Can with Fluted Slats
   - **Contents**: Dead batteries, light bulbs, fluorescent tube lights, expired medicines, paint cans, frayed charger cables, and small e-waste.
   - **Rule**: Toxic chemical and fire risk! Tape battery terminals, keep chemical lids sealed, and cushion fragile mercury glass.

---

## 🎮 Playable Tasks & Game Modes

### Task 1: Bin Match & Prep Rush
- Items arrive on the sorting counter with clean floating info.
- Drag pure physical waste items directly into the matching Green, Blue, Red, or Black bins without card boxes or barriers.
- Instant 1-sentence educational feedback explains *why* an item belongs in a specific bin and allows immediate retries.
- Auto-prep and virtual safety tongs ensure smooth, unblocked gameplay for kids.

### Task 2: Sharps & Medicine Safety Mission
- Setting: School Clinic / First Aid Station.
- Children handle used insulin syringes, blood glucose lancets, expired antibiotics, and biohazard dressings.
- **Critical Child Safety**: Tapping or dragging sharps barehanded triggers an urgent safety alarm modal reminding kids: *"Never touch needles or unknown pills barehanded! Always equip Safety Tongs or ask an adult."*
- Safely locked into puncture-proof yellow containers and safe pharmacy take-back boxes.

### Task 3: Contamination Detective
- A municipal collection bin arrives contaminated with mixed, hazard, or non-recyclable items.
- Children identify and extract contaminants (*e.g., greasy pizza box in dry paper, loose battery in recycling truck, plastic bag in compost*).
- Restores the batch purity to 100% and prevents recycling plant fires or soil pollution.

### Task 4: 5S Practice Section
Interactive mini-games covering each of the 5S steps:
1. **Seiri (Sort):** Evaluate mixed workstation items into "Keep & Use" vs "Red Tag & Discard".
2. **Seiton (Set in Order):** Arrange the 4 station bins (Green, Blue, Red, Black) and tools into labeled shadow outlines.
3. **Seiso (Shine):** Interactive sponge tool to scrub and clean away spills, dirt, and stains.
4. **Seiketsu (Standardize):** Match international hazard pictograms (Leaf, Mobius, Biohazard, Special Trash) to the containers.
5. **Shitsuke (Sustain):** 5-point safety audit checklist to cultivate daily safety habits.

### 🌍 Eco-Town & Badges Showcase
- As children score points and earn stars, their town evolves from a **Rookie Sorting Depot (Lv.1)** to a **Green Garden Village (Lv.2)**, **Thriving Eco-Town (Lv.3)**, and **Spotless Zero-Waste Metropolis (Lv.4)**!
- Unlockable badges: *Sharps Hero, Compost Champion, Contamination Buster, 5S Grandmaster, Repair Wizard, and Eco Legend*.

---

## 🚀 How to Run the Game

### Option 1: Direct in Browser (No Server Needed)
Simply double-click `index.html` or open it directly in Google Chrome, Microsoft Edge, Safari, or Firefox:
```bash
# Windows
start index.html
```

### Option 2: Local HTTP Server (Python)
Run Python's built-in HTTP server from the project directory:
```bash
py -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📁 Project Architecture
```
how2bin/
├── index.html                   # Semantic HTML5 app with live HUD, Modals & Navigation
├── css/
│   └── style.css                # Dark theme (#000000), borderless natural bins, single-window layout
├── js/
│   ├── audio.js                 # Web Audio API sound synthesizer (100% offline, zero audio files needed)
│   ├── state.js                 # GameState, score multiplier, safety shield, persistence
│   ├── dragDrop.js              # Unified touch & pointer drag + tap-to-place fallback
│   ├── ecoTown.js               # Visual town evolution & badge showcase
│   ├── utils.js                 # Shared toast alerts, safety modal, sparkles
│   ├── main.js                  # App router, tabs controller
│   ├── data/
│   │   ├── bins.js              # 4 realistic SVG bins (Green Leaf, Blue Mobius, Red Biohazard, Black Trash)
│   │   ├── items.js             # 30 waste items mapped to Green, Blue, Red, and Black with hints & feedback
│   │   └── five_s.js            # 5S stages and shadow board data matching the 4 bins
│   └── modes/
│       ├── prepRush.js          # Task 1: Prep & Bin Matching
│       ├── sharpsMission.js     # Task 2: Sharps & Medicine Safety
│       ├── contamination.js     # Task 3: Contamination Detective
│       └── fiveS.js             # Task 4: 5S Interactive Stages
└── README.md
```
