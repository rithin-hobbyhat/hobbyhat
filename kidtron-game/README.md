# ⚡ KidtronLab: Circuit Lab & Electronic Components Game

An interactive, laboratory-grade circuit simulator and learning game designed for students to master electrical circuits, series & parallel connections, Ohm's law, component ratings, and electrical safety.

---

## 🚀 How to Launch the Game
Open `index.html` in your favorite web browser (Google Chrome, Microsoft Edge, or Mozilla Firefox):
- Simply double-click [index.html](file:///c:/Users/Windows%2010%20Pro/Desktop/circui%20game/index.html), or
- Right click `index.html` -> **Open with** -> **Google Chrome** / **Microsoft Edge**.

---

## 🔬 Core Components & New Features

### 1. ➰ Flexible Freeform Wire Drawing & Shape Routing
- Wires can now be drawn flexibly to **any custom shape or curve** simply by mouse click and movement.
- The wire dynamically records intermediate waypoints as you move your mouse, enabling you to route cleanly around other components, create zig-zags, or draw custom curves.

### 2. 🪢 Connect & Joint Wires into Other Wires at Any Point
- You can now connect and tap wires directly into another wire at **any point along its length**!
- When dragging a wire near an existing wire, a green preview junction snap dot appears. Releasing the mouse attaches the wire and renders a solid **solder junction node (`●`)**.
- Enables multi-tap power rails, parallel branches, and breadboard-style connections.

### 3. 🔄 Change Connection or Remove Wires by Clicking & Dragging
- Every wire features circular **draggable grab handles** at both ends.
- **To Reconnect:** Click and drag any wire endpoint away from its pin/junction and drop it onto a new pin or another wire to instantly rewire.
- **To Disconnect & Remove:** Drag a wire endpoint into empty open space and let go—the wire is immediately removed with an audible disconnect sound.

### 4. ⚡ Conventional Current Flow Direction: Strictly from (+) to (-)
- Animated charge flow now travels **strictly from the positive $(+)$ potential to the negative $(-)$ potential** according to conventional current flow.
- Each active wire features **directional current arrow chevrons (`▶`)** pointing along the wire towards the negative ground.

### 5. 🔋 New Components Added
1. **3V Lithium Coin Cell (CR2032):**
   - 3.0V direct power source with realistic brushed metal coin casing and stamped polarity.
2. **Two-Way Switch (SPDT):**
   - 3-terminal switch with Common (`COM`), Way 1 (`L1`), and Way 2 (`L2`).
   - Click the lever to toggle the connection between L1 and L2 for staircase or dual-circuit switching.
3. **Step-Down Transformer:**
   - Electromagnetic AC transformer with laminated steel core, primary red copper coil (230V AC), and secondary golden copper coil (12V AC).
   - Features an interactive numeric box to set secondary output voltage (e.g. 12V, 24V, 6V) with up and down stepper buttons.
4. **AC Voltage Supply:**
   - Alternating Current mains/signal generator with live oscillating sine wave display.
   - Includes a voltage input box to type any AC voltage (e.g. 230V, 120V, 12V) and **Up (`+`) and Down (`-`) buttons** to step voltage.

### 6. 🎨 Detailed Component Images in Toolbox (No Emojis!)
- The component toolbox now features **high-detail realistic miniature SVG illustrations** for all 13 components instead of text emoji placeholders.
- Children see authentic batteries, incandescent bulbs, wound transformer coils, coin cells, and switches right in the catalog.

### 7. 🏷️ Small Electronic Component Schematic Symbols on All Components
- Every component displays its official **IEEE / IEC electrical schematic symbol** in a small semi-transparent badge in the corner.
- Schematic symbols are also displayed next to each component name in the toolbox so students learn both the real physical appearance and the schematic circuit diagram representation!

### 8. 📊 Live Component Telemetry (Voltage, Current & Watts)
- Live badges indicate working Voltage ($V$), Current ($I$ in $\text{mA}$ or $A$), and dissipated Power ($W$).

### 9. 🎛️ Variable Resistors (Potentiometer) & Up/Down Steppers
- Both standard resistors and potentiometers feature a direct input box and **`+` / `-` stepper buttons** to adjust resistance in real time.
- Modulating resistance dynamically dims or brightens lamps and speeds up or slows down DC motors.

### 10. 📐 Live Ohm's Law & Watt Calculator Window
- Real-time calculations of $V = I \times R$ and $P = V \times I$ with dynamic substitutions.

### 11. 🔔 Continuous Piezo Buzzer & Non-Polarized Incandescent Lamp
- **Continuous Buzzer Sound**: When powered in a completed circuit loop, the acoustic buzzer produces a **steady, continuous solid beep tone** (~960 Hz) without pulsing or stuttering.
- **Non-Polarized Incandescent Lamp**: Incandescent bulbs **have no polarity**—their tungsten filament conducts and radiates bright illumination regardless of which way current flows. The lamp's legs feature neutral amber terminal pins (`•`) with no `+` / `-` markings.
- **Conventional Current (+ to -)**: Current carriers strictly follow the path from the positive source terminal through the loads to the negative source terminal.

### 12. ⚠️ Dramatic Short Circuit Vision & Free Space Hazard Banner
- **Free Space Banner**: Short circuit warning text is kept **completely off component bodies** and displayed cleanly in an open, non-obstructive hazard strobe banner docked at the top center of the workbench.
- **Vision of Short Circuit**:
  - **Perimeter Alarm Glow**: The entire workbench perimeter strobes in intense red warning light (`stage-short-circuit-active`).
  - **Rapid Wire Strobing**: Shorted wire paths strobe violently in red/white.
  - **Crackling Electric Sparks**: Jagged starburst electric sparks burst dynamically at the shorted power terminals.
  - **Audio Spark Crackle**: Realistic electric discharge buzzing audio plays continuously during the hazard.

### 13. ↩️ Undo & ↪️ Redo Full Circuit History
- **Toolbar Buttons**: Dedicated `↩️ Undo` and `↪️ Redo` buttons that automatically enable/disable based on stack availability.
- **Keyboard Shortcuts**: Standard `Ctrl+Z` (Undo) and `Ctrl+Y` / `Ctrl+Shift+Z` (Redo) supported across the workbench.
- **Deep State Tracking**: Full rollback and rollforward support for:
  - Spawning or deleting components
  - Moving components across the workbench
  - Drawing new flexible wires or wire junctions
  - Reconnecting or detaching wire endpoints
  - Swapping / replacing components
  - Toggling switches or adjusting resistor, transformer, and AC voltage values
  - Resetting or clearing the canvas

### 14. 📊 Circuit Working Analysis & Appreciation Dashboard
- **Automatic Post-Connection Analysis**: As soon as a closed working circuit is successfully established and the objective is completed:
  - **Appreciation Banner**: Personalized praise celebrates the gamer's electrical engineering achievement with encouraging badges (e.g., *Polarity Mastery*, *Safe Current Division*, *Kinetic Powerhouse*).
  - **Macro Electrical Telemetry Grid**:
    - **Supply Voltage ($V_{total}$)**: Total source potential in Volts.
    - **Loop Current ($I_{total}$)**: Total electron flow rate in $\text{mA}$ or $\text{A}$.
    - **Power Dissipation ($P_{total}$)**: Energy consumed ($P = V \times I$) in $\text{mW}$ or $\text{W}$.
    - **Equivalent Resistance ($R_{eq}$)**: Calculated circuit impedance ($R = \frac{V}{I}$) in $\Omega$.
  - **Circuit Topology Classification**: Identifies whether the circuit is a *Single-Load Loop*, *Series Circuit ($I$ constant, $V$ divides)*, or *Parallel Network ($V$ constant, $I$ divides)*.
  - **Component-by-Component Working Breakdown**: Lists each active component with its operating voltage drop, flowing current, power consumed, and real physical working state (filament radiant percentage, motor RPM & direction, LED forward conduction, buzzer tone, resistor voltage drop).
  - **Physics & Ohm's Law Explanation**: Explains why the circuit works according to Ohm's Law and Kirchhoff's Laws.
  - **Option to Next Task**: High-visibility `➡️ Next Task: Level X ➜` button seamlessly transitions the gamer into the next challenge, or into free Sandbox Mode upon completing curriculum tasks.
  - **Inspect Workbench Option**: `🔬 Inspect Workbench` allows students to dismiss the modal to examine glowing filaments, spinning rotors, and animated currents in real time.
- **On-Demand Toolbar Button**: A dedicated `📊 Analysis` button in the header toolbar allows gamers to review live working circuit metrics at any time during free play or experimentation!

---

Enjoy learning electronics and mastering circuit building!


