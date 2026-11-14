// Curriculum Levels for Student Circuit Learning
// 28 rich, engaging engineering missions covering all electronic components in KidtronLab!
// Each mission contains full diagnostic reference solutions, schematics, and auto-wiring blueprints.

const GAME_LEVELS = [
  {
    id: 1,
    title: 'Level 1: The First Spark (Incandescent Bulb)',
    category: 'Basics',
    badge: 'Beginner',
    summary: 'Help the Incandescent Bulb light up its golden filament by creating a complete electric loop with the 9V Battery!',
    instructions: 'The Incandescent Bulb is waiting for power! Connect wires from the 9V Battery (+) terminal to one of the Bulb’s lead terminals, and from the Bulb’s other lead back to the 9V Battery (-) terminal.',
    hint: 'Drag from the 9V Battery red (+) terminal to Lead A of the Bulb, then drag from Lead B back to the 9V Battery blue (-) terminal.',
    theory: 'An electric circuit must form a complete unbroken loop (closed circuit) for electrons to flow from the power source through the Incandescent Bulb’s tungsten filament and back.',
    allowedComponents: ['battery', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 120, y: 180, id: 'bat1' },
      { type: 'bulb', x: 440, y: 170, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'Battery 9V (+) ➔ Bulb Terminal A ➔ Bulb Terminal B ➔ Battery 9V (-)',
      circuitType: 'Simple Series Closed Loop',
      explanation: 'Connect the 9V Battery (+) terminal to Bulb Terminal A, and Bulb Terminal B back to the 9V Battery (-) terminal. Electrons circulate in an unbroken loop, heating the tungsten filament to emit golden light.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'bulb1', toPin: 'pin1', label: 'Positive Feed (+9V)' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Ground Return (0V)' }
      ]
    },
    checkWin: (status, components) => {
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 2,
    title: 'Level 2: LED Operation Using a 9V Battery',
    category: 'Resistance & Protection',
    badge: 'Core Concept',
    summary: 'Discover how resistance protects delicate components. When resistance is too low, excessive current burns the LED. Adjust the resistor to a safe value to make the LED operate properly!',
    instructions: 'Connect the 9V Battery, Resistor, and LED in a series circuit loop. The low 10 Ω resistor allows excessive current to burn out the LED! Adjust the resistor to a safe resistance value (≥ 220 Ω) using the [+] button to protect the LED and complete the level.',
    hint: 'A 9V battery pushes dangerous current through an LED without enough resistance! Wire the loop, observe the burnout from low resistance, and then click [+] on the resistor until it reaches at least 220 Ω to protect the LED.',
    theory: "Ohm's Law states that Current I = (V_supply - V_led) / R. With a 9V battery and an LED (V_drop ≈ 2.1V), a 10 Ω resistor allows (9V - 2.1V) / 10Ω ≈ 690mA — over 17 times the LED's 40mA safe limit! Increasing the resistance to 220 Ω or 330 Ω limits the current to a safe 20–30mA.",
    allowedComponents: ['battery', 'resistor', 'led'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'resistor', x: 340, y: 190, id: 'res1', stateProps: { resistance: 10 } },
      { type: 'led', x: 580, y: 170, id: 'led1', stateProps: { color: 'green' } }
    ],
    tasks: [
      {
        text: 'Connect 9V Battery, Resistor, and LED in a closed circuit loop',
        check: (status, components) => {
          const bat = components.find(c => c.type === 'battery');
          const res = components.find(c => c.type === 'resistor');
          const led = components.find(c => c.type === 'led');
          return !!bat && !!res && !!led && (status.isComplete || (res.state && res.state.powered) || (led.state && (led.state.powered || led.state.burnt || led.state.burning)));
        }
      },
      {
        text: 'Select a safe resistance value (≥ 220 Ω) to protect the LED',
        check: (status, components) => {
          const res = components.find(c => c.type === 'resistor');
          return !!res && (res.state.resistance || 0) >= 180;
        }
      },
      {
        text: 'Make the LED work safely without burning',
        check: (status, components) => {
          const led = components.find(c => c.type === 'led');
          const res = components.find(c => c.type === 'resistor');
          return !!led && led.state.powered && !led.state.burnt && !!res && (res.state.resistance || 0) >= 180 && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Resistor (≥ 220 Ω) ➔ LED Anode (+) ➔ LED Cathode (-) ➔ Battery (-)',
      circuitType: 'Current-Limited Diode Series Loop',
      explanation: 'Place the Resistor in series between Battery (+) and LED Anode (+). With a low resistance (10 Ω), excessive current destroys the LED die. Increasing resistance to 220 Ω restricts current to a safe 25mA, allowing the LED to shine safely.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery (+) to Resistor Pin 1' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor Pin 2 to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
      const res = components.find(c => c.type === 'resistor' && (c.state.resistance || 0) >= 180);
      return !!led && !!res && !status.circuitFailed;
    }
  },

  {
    id: 3,
    title: 'Level 3: 1.5V AA Cells SERIES CONNECTION',
    category: 'Cell Stacking',
    badge: 'Series Voltage',
    summary: 'Connect two 1.5V AA cells in series to understand how voltages add together (1.5V + 1.5V = 3.0V) to power an LED!',
    instructions: 'Connect the two 1.5V cells in series: wire Cell 1 (+) to Cell 2 (-). Then connect the remaining terminals across the LED (Anode to +, Cathode to -). Notice how voltages add up: 1.5V + 1.5V = 3.0V!',
    hint: 'A single 1.5V cell does not have enough voltage to turn on an LED (~2.1V minimum). Connecting two 1.5V cells in series (+ to -) creates 3.0V, perfectly powering the LED!',
    theory: 'When electrical cells are connected in series (positive terminal to negative terminal), their voltages add together: V_total = V1 + V2 = 1.5V + 1.5V = 3.0V. Because an LED needs around 2.1V to 3.0V to turn on, a single 1.5V cell cannot light it, but two in series light it beautifully without burning!',
    allowedComponents: ['cell', 'led'],
    initialComponents: [
      { type: 'cell', x: 100, y: 70, id: 'cell1' },
      { type: 'cell', x: 100, y: 290, id: 'cell2' },
      { type: 'led', x: 480, y: 180, id: 'led1', stateProps: { color: 'green' } }
    ],
    tasks: [
      {
        text: 'Connect the two 1.5V cells in series (positive to negative)',
        check: (status, components) => {
          const cells = components.filter(c => c.type === 'cell');
          return cells.length >= 2 && (status.totalVoltage >= 2.8 || (status.chains && status.chains.some(ch => ch.totalVoltage >= 2.8)));
        }
      },
      {
        text: 'Connect the combined 3.0V output across the LED (Anode to +, Cathode to -)',
        check: (status, components) => {
          const led = components.find(c => c.type === 'led');
          return !!led && (led.state.powered || status.isComplete);
        }
      },
      {
        text: 'Make the LED work using the two series cells (1.5V + 1.5V = 3.0V)',
        check: (status, components) => {
          const cells = components.filter(c => c.type === 'cell');
          const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
          return cells.length >= 2 && !!led && status.totalVoltage >= 2.8 && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Cell 1 (-) ➔ Cell 2 (+) | Cell 1 (+) ➔ LED Anode (+) ➔ LED Cathode (-) ➔ Cell 2 (-)',
      circuitType: 'Series Voltage Stacking (V_tot = V1 + V2 = 3.0V)',
      explanation: 'Stack the two AA cells in series by connecting Cell 1 negative (-) to Cell 2 positive (+). Then take the combined 3.0V output: wire Cell 1 positive (+) to the LED Anode (+) and LED Cathode (-) back to Cell 2 negative (-).',
      connections: [
        { fromComp: 'cell1', fromPin: 'neg', toComp: 'cell2', toPin: 'pos', label: 'Series Interconnect (+ to -)' },
        { fromComp: 'cell1', fromPin: 'pos', toComp: 'led1', toPin: 'anode', label: 'Combined 3.0V to LED Anode' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'cell2', toPin: 'neg', label: 'LED Cathode to Stack Return' }
      ]
    },
    checkWin: (status, components) => {
      const cells = components.filter(c => c.type === 'cell');
      const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
      return cells.length >= 2 && !!led && status.totalVoltage >= 2.8 && !status.circuitFailed;
    }
  },

  {
    id: 4,
    title: 'Level 4: LED Operation Using a CR2032 Battery',
    category: 'Coin Cells',
    badge: 'Direct Match',
    summary: 'Discover how a 3V CR2032 coin-cell battery powers an LED directly without requiring a resistor!',
    instructions: 'Connect the CR2032 3V Coin Cell (+) outer rim terminal directly to the LED Anode (+), and the Coin Cell (-) center terminal to the LED Cathode (-). The LED will glow cheerfully without needing any separate resistor!',
    hint: 'Drag wire from Coin Cell (+) to LED Anode (+), then from LED Cathode (-) back to Coin Cell (-). No resistor required for 3.0V!',
    theory: 'Unlike a 9V battery which requires a resistor to avoid vaporizing an LED, a CR2032 3V Lithium Coin Cell naturally outputs 3.0 Volts. Because standard LEDs operate at 2.1V–3.3V, a 3V coin cell can power an LED directly — which is why key fobs, small flashlights, and light-up toys use CR2032 cells!',
    allowedComponents: ['cell3v', 'led'],
    initialComponents: [
      { type: 'cell3v', x: 140, y: 180, id: 'coin1' },
      { type: 'led', x: 460, y: 170, id: 'led1', stateProps: { color: 'blue' } }
    ],
    tasks: [
      {
        text: 'Connect CR2032 (3V) positive (+) terminal to LED Anode (+)',
        check: (status, components, app) => {
          const coin = components.find(c => c.type === 'cell3v');
          const led = components.find(c => c.type === 'led');
          if (!coin || !led) return false;
          if (app && app.wires) {
            return app.wires.some(w =>
              (w.fromComp === coin.id && w.fromPin === 'pos' && w.toComp === led.id && w.toPin === 'anode') ||
              (w.fromComp === led.id && w.fromPin === 'anode' && w.toComp === coin.id && w.toPin === 'pos')
            );
          }
          return led.state && led.state.powered;
        }
      },
      {
        text: 'Connect LED Cathode (-) terminal to CR2032 negative (-) terminal',
        check: (status, components, app) => {
          const coin = components.find(c => c.type === 'cell3v');
          const led = components.find(c => c.type === 'led');
          if (!coin || !led) return false;
          if (app && app.wires) {
            return app.wires.some(w =>
              (w.fromComp === led.id && w.fromPin === 'cathode' && w.toComp === coin.id && w.toPin === 'neg') ||
              (w.fromComp === coin.id && w.fromPin === 'neg' && w.toComp === led.id && w.toPin === 'cathode')
            );
          }
          return led.state && led.state.powered;
        }
      },
      {
        text: 'Make the LED work using the CR2032 coin-cell battery',
        check: (status, components) => {
          const coin = components.find(c => c.type === 'cell3v');
          const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
          return !!coin && !!led && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Coin Cell (+) ➔ LED Anode (+) ➔ LED Cathode (-) ➔ Coin Cell (-)',
      circuitType: 'Low-Voltage Direct Match',
      explanation: 'Connect Coin Cell (+) directly to LED Anode (+), and LED Cathode (-) to Coin Cell (-). Because the lithium cell voltage (3.0V) falls safely within the LED forward operating range (2.1V–3.3V), no external current-limiting resistor is required.',
      connections: [
        { fromComp: 'coin1', fromPin: 'pos', toComp: 'led1', toPin: 'anode', label: '3V Positive to LED Anode' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'coin1', toPin: 'neg', label: 'LED Cathode to 3V Ground' }
      ]
    },
    checkWin: (status, components) => {
      const coin = components.find(c => c.type === 'cell3v');
      const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
      return !!coin && !!led && !status.circuitFailed;
    }
  },

  {
    id: 5,
    title: 'Level 5: DC Motor Operation Using a 9V Battery',
    category: 'Controls & Motors',
    badge: 'Switch Control',
    summary: 'Make a 3V DC Motor operate using a 9V Battery, and control its rotation using a Single-Pole Switch!',
    instructions: 'Insert the Single Pole Switch into the loop between the 9V Battery and 3V DC Motor. Click its lever to the CLOSED position to unleash current and spin the propeller!',
    hint: 'Run a wire from Battery (+) through the Switch, then to Motor (+). Return Motor (-) to Battery (-). Click the switch lever to turn it ON!',
    theory: 'A DC Motor transforms electrical energy into mechanical rotation using electromagnetism. When the Single-Pole Switch is open, the circuit has an infinite air gap and no current flows. Closing the switch completes the path, allowing 9V to energize the motor windings and spin the propeller rapidly!',
    allowedComponents: ['battery', 'switch', 'motor'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'switch', x: 340, y: 180, id: 'sw1' },
      { type: 'motor', x: 580, y: 160, id: 'motor1' }
    ],
    tasks: [
      {
        text: 'Wire 9V Battery, Switch, and 3V DC Motor into a loop',
        check: (status, components) => {
          const bat = components.find(c => c.type === 'battery');
          const sw = components.find(c => c.type === 'switch');
          const motor = components.find(c => c.type === 'motor');
          return !!bat && !!sw && !!motor && (status.isComplete || (motor.state && motor.state.powered));
        }
      },
      {
        text: 'Close the Single-Pole Switch (ON position)',
        check: (status, components) => {
          const sw = components.find(c => c.type === 'switch');
          return !!sw && !!sw.state.closed;
        }
      },
      {
        text: 'Make the 3V DC Motor spin using the switched 9V battery',
        check: (status, components) => {
          const sw = components.find(c => c.type === 'switch');
          const motor = components.find(c => c.type === 'motor' && c.state.powered && !c.state.burnt);
          return !!sw && sw.state.closed && !!motor && (motor.state.rpm || 0) > 0 && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Switch Terminal 1 ➔ Switch Terminal 2 ➔ Motor (+) ➔ Motor (-) ➔ Battery (-)',
      circuitType: 'Switched Series Motor Loop',
      explanation: 'Route current from Battery (+) through Switch Terminal 1 to Terminal 2, into Motor (+), and return Motor (-) back to Battery (-). Closing the switch lever completes the circuit loop and spins the propeller.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Terminal 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'motor1', toPin: 'pin1', label: 'Switched Feed to Motor (+)' },
        { fromComp: 'motor1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Motor (-) Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sw = components.find(c => c.type === 'switch');
      const motor = components.find(c => c.type === 'motor' && c.state.powered && !c.state.burnt);
      return !!sw && sw.state.closed && !!motor && (motor.state.rpm || 0) > 0 && !status.circuitFailed;
    }
  },

  {
    id: 6,
    title: 'Level 6: Diode Polarity & LED Protection (Reversibility Challenge)',
    category: 'Semiconductors',
    badge: 'One-Way Gate',
    summary: 'Connect an LED through a Diode and Resistor using a 9V Battery and Single-Pole Switch. Identify the reversed diode and orient it correctly to make the LED glow!',
    instructions: '1. Connect the 9V Battery, Single-Pole Switch, Diode, Resistor, and LED in a series circuit loop.\n2. Notice the Diode is provided in reverse orientation (blocking current flow)!\n3. Rotate the Diode to forward bias (Anode towards positive, silver band Cathode towards LED/negative) and close the switch to make the LED shine!',
    hint: 'Current can ONLY flow through a diode from Anode (+) to Cathode (-). If the diode is backwards, it creates an impenetrable barrier! Rotate the Diode so its silver ring faces the negative return.',
    theory: 'Semiconductor Diodes act like one-way check valves for electricity. When forward-biased (Anode positive relative to Cathode), electrons flow easily with only a ~0.7V drop. In reverse bias, the internal P-N depletion barrier expands, completely halting current. The series resistor drops the remaining voltage to protect the LED die.',
    allowedComponents: ['battery', 'switch', 'diode', 'resistor', 'led'],
    initialComponents: [
      { type: 'battery', x: 80, y: 190, id: 'bat1' },
      { type: 'switch', x: 260, y: 190, id: 'sw1' },
      { type: 'diode', x: 440, y: 190, id: 'diode1', rotation: 180 },
      { type: 'resistor', x: 620, y: 190, id: 'res1', stateProps: { resistance: 220 } },
      { type: 'led', x: 800, y: 170, id: 'led1', stateProps: { color: 'green' } }
    ],
    tasks: [
      {
        text: 'Wire 9V Battery, Switch, Diode, Resistor, and LED into a loop',
        check: (status, components) => {
          const bat = components.find(c => c.type === 'battery');
          const sw = components.find(c => c.type === 'switch');
          const diode = components.find(c => c.type === 'diode');
          const res = components.find(c => c.type === 'resistor');
          const led = components.find(c => c.type === 'led');
          return !!bat && !!sw && !!diode && !!res && !!led && (status.isComplete || (led.state && (led.state.powered || led.state.blocked)) || (diode.state && (diode.state.powered || diode.state.blocked)));
        }
      },
      {
        text: 'Orient the Diode in forward bias (Anode to positive, Cathode to negative)',
        check: (status, components) => {
          const diode = components.find(c => c.type === 'diode');
          return !!diode && !diode.state.blocked && ((diode.rotation || 0) % 360 === 0 || (diode.state && diode.state.powered));
        }
      },
      {
        text: 'Close the switch and make the LED illuminate safely',
        check: (status, components) => {
          const sw = components.find(c => c.type === 'switch');
          const diode = components.find(c => c.type === 'diode');
          const led = components.find(c => c.type === 'led');
          return !!sw && sw.state.closed && !!diode && !diode.state.blocked && !!led && led.state.powered && !led.state.burnt && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Switch ➔ Diode Anode (+) ➔ Diode Cathode (-) ➔ Resistor ➔ LED Anode (+) ➔ LED Cathode (-) ➔ Battery (-)',
      circuitType: 'Switched Diode-Protected LED Loop',
      explanation: 'Route current from Battery (+) through the Switch into Diode Anode (+). The diode conducts in forward bias out through Cathode (-), passes through the 220 Ω Resistor to absorb excess voltage, and powers the LED Anode (+). Closing the switch lights the LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Pin 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'diode1', toPin: 'anode', label: 'Switched Feed to Diode Anode (+)' },
        { fromComp: 'diode1', fromPin: 'cathode', toComp: 'res1', toPin: 'pin1', label: 'Diode Cathode (-) to Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sw = components.find(c => c.type === 'switch');
      const diode = components.find(c => c.type === 'diode');
      const led = components.find(c => c.type === 'led');
      return !!sw && sw.state.closed && !!diode && !diode.state.blocked && !!led && led.state.powered && !led.state.burnt && !status.circuitFailed;
    }
  },

  {
    id: 7,
    title: 'Level 7: Staircase Wiring (Two-Way Switches)',
    category: 'Switching Logic',
    badge: 'Staircase Wiring',
    summary: 'Build a classic household staircase wiring circuit with two two-way (SPDT) switches so the incandescent lamp can be toggled ON and OFF from either switch location!',
    instructions: '1. Connect 9V Battery (+) to the Common (COM) terminal of Switch 1.\n2. Connect the two travelers: Switch 1 L1 to Switch 2 L1, and Switch 1 L2 to Switch 2 L2.\n3. Connect Switch 2 Common (COM) to the Incandescent Lamp, and return the lamp to Battery (-).\n4. Test flipping either switch: the lamp can be turned ON or OFF from both the top and bottom of the stairs!',
    hint: 'Connect Battery (+) -> Switch 1 COM. Connect the traveler lines: Sw1 L1 -> Sw2 L1, and Sw1 L2 -> Sw2 L2. Connect Sw2 COM -> Bulb pin1, and Bulb pin2 -> Battery (-).',
    theory: 'Staircase wiring uses two Single Pole Double Throw (SPDT) switches connected by two traveler wires (L1 and L2). When both switch levers connect to the same traveler line (both L1 or both L2), the circuit loop is completed and the lamp shines. Flicking either switch diverts current to the alternate open traveler, immediately toggling the lamp state from either location!',
    allowedComponents: ['battery', 'twowayswitch', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'twowayswitch', x: 280, y: 120, id: 'sw1' },
      { type: 'twowayswitch', x: 500, y: 120, id: 'sw2' },
      { type: 'bulb', x: 720, y: 220, id: 'bulb1' }
    ],
    tasks: [
      {
        text: 'Connect Battery (+) to Switch 1 COM and traveler wires (L1 to L1, L2 to L2)',
        check: (status, components, app) => {
          if (!app || !app.wires) return false;
          const hasTrav1 = app.wires.some(w => (w.fromComp === 'sw1' && w.fromPin === 'l1' && w.toComp === 'sw2' && w.toPin === 'l1') || (w.fromComp === 'sw2' && w.fromPin === 'l1' && w.toComp === 'sw1' && w.toPin === 'l1'));
          const hasTrav2 = app.wires.some(w => (w.fromComp === 'sw1' && w.fromPin === 'l2' && w.toComp === 'sw2' && w.toPin === 'l2') || (w.fromComp === 'sw2' && w.fromPin === 'l2' && w.toComp === 'sw1' && w.toPin === 'l2'));
          return hasTrav1 || hasTrav2;
        }
      },
      {
        text: 'Connect Switch 2 COM to the Lamp and return Lamp to Battery (-)',
        check: (status, components, app) => {
          if (!app || !app.wires) return false;
          return app.wires.some(w => (w.fromComp === 'sw2' && w.fromPin === 'com' && w.toComp === 'bulb1') || (w.toComp === 'sw2' && w.toPin === 'com' && w.fromComp === 'bulb1'));
        }
      },
      {
        text: 'Make the lamp glow and verify two-way switching control',
        check: (status, components) => {
          const bulb = components.find(c => c.type === 'bulb');
          const sws = components.filter(c => c.type === 'twowayswitch');
          return sws.length >= 2 && !!bulb && bulb.state.powered && !bulb.state.burnt && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Switch 1 COM | Sw1 L1 ➔ Sw2 L1 | Sw1 L2 ➔ Sw2 L2 | Sw2 COM ➔ Bulb ➔ Battery (-)',
      circuitType: 'Two-Way Staircase Switching Loop',
      explanation: 'Feed Battery (+) into Switch 1 COM. Bridge the two switches using traveler lines L1-to-L1 and L2-to-L2. Route Switch 2 COM into Bulb Pin 1, and return Bulb Pin 2 to Battery (-). Now flicking either switch toggles the light.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'com', label: 'Battery (+) to Switch 1 COM' },
        { fromComp: 'sw1', fromPin: 'l1', toComp: 'sw2', toPin: 'l1', label: 'Traveler Line 1 (L1 to L1)' },
        { fromComp: 'sw1', fromPin: 'l2', toComp: 'sw2', toPin: 'l2', label: 'Traveler Line 2 (L2 to L2)' },
        { fromComp: 'sw2', fromPin: 'com', toComp: 'bulb1', toPin: 'pin1', label: 'Switch 2 COM to Bulb Pin 1' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Pin 2 to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sws = components.filter(c => c.type === 'twowayswitch');
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return sws.length >= 2 && !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 8,
    title: 'Level 8: Lamp Brightness Control (Variable Resistor)',
    category: 'Variable Resistance',
    badge: 'Dimmer Control',
    summary: 'Control the brightness of an Incandescent Lamp by adjusting a Variable Resistor (Potentiometer) wired in rheostat mode!',
    instructions: '1. Connect the 9V Battery, Variable Resistor (Potentiometer), and Incandescent Lamp in a series loop.\n2. Connect Battery (+) to Potentiometer Terminal 1 (pin1), and center Wiper to the Lamp.\n3. Return the lamp to Battery (-).\n4. Adjust the variable resistor slider/stepper to smoothly control the lamp from dim glow to maximum brilliance!',
    hint: 'Use rheostat mode: wire Battery (+) to Potentiometer pin1, center Wiper to Bulb, and Bulb back to Battery (-). Then adjust the slider to vary resistance!',
    theory: 'According to Ohm’s Law (I = V / R_total), increasing the circuit resistance throttles electron flow. Less current reduces electrical power dissipated in the tungsten filament (P = I² × R_filament), smoothly dimming its golden glow.',
    allowedComponents: ['battery', 'potentiometer', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 100, y: 190, id: 'bat1' },
      { type: 'potentiometer', x: 360, y: 190, id: 'pot1' },
      { type: 'bulb', x: 620, y: 170, id: 'bulb1' }
    ],
    tasks: [
      {
        text: 'Wire 9V Battery, Variable Resistor (pin1 to wiper), and Lamp in series',
        check: (status, components) => {
          const pot = components.find(c => c.type === 'potentiometer');
          const bulb = components.find(c => c.type === 'bulb');
          return !!pot && !!bulb && (status.isComplete || pot.state.powered || bulb.state.powered);
        }
      },
      {
        text: 'Adjust the Variable Resistor to change resistance and observe brightness variations',
        check: (status, components) => {
          const pot = components.find(c => c.type === 'potentiometer');
          return !!pot && pot.state.powered;
        }
      },
      {
        text: 'Make the Incandescent Lamp operate smoothly under variable resistance control',
        check: (status, components) => {
          const pot = components.find(c => c.type === 'potentiometer');
          const bulb = components.find(c => c.type === 'bulb');
          return !!pot && pot.state.powered && !!bulb && bulb.state.powered && !bulb.state.burnt && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Potentiometer Terminal 1 ➔ Wiper ➔ Bulb Pin 1 ➔ Bulb Pin 2 ➔ Battery (-)',
      circuitType: 'Variable Rheostat Dimmer Circuit',
      explanation: 'Connect Battery (+) to Potentiometer Terminal 1 (pin1), and the center Wiper to Bulb Terminal 1, and Bulb Terminal 2 back to Battery (-). Rotating the potentiometer alters the series resistance, throttling current to smoothly dim the lamp.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pot1', toPin: 'pin1', label: 'Battery (+) to Potentiometer Terminal 1' },
        { fromComp: 'pot1', fromPin: 'wiper', toComp: 'bulb1', toPin: 'pin1', label: 'Rheostat Wiper Output to Bulb Pin 1' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Pin 2 Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const pot = components.find(c => c.type === 'potentiometer' && c.state.powered);
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return !!pot && !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 9,
    title: 'Level 9: Buzzer Circuit Using a Push-Button Switch',
    category: 'Momentary Control',
    badge: 'Doorbell Trigger',
    summary: 'Build a momentary alert circuit that sounds the Electronic Buzzer when the push-button switch is pressed, and stops instantly when released!',
    instructions: '1. Connect the 9V Battery, Push-Button Switch, and Electronic Buzzer in series.\n2. Press and hold the Push-Button switch to sound the 880Hz alarm tone!\n3. Release the push-button to observe the circuit immediately open and silence the buzzer.',
    hint: 'Battery (+) -> Push-button Pin 1 -> Push-button Pin 2 -> Buzzer (+) (pin1) -> Buzzer (-) (pin2) -> Battery (-). Click or hold the button to ring the buzzer!',
    theory: 'Push-button switches are spring-loaded momentary contacts (Normally Open / NO). Pressing the plunger compresses an internal spring to bridge two conductive contacts. Releasing your finger allows the spring to snap the contacts apart, instantly breaking the conductive loop.',
    allowedComponents: ['battery', 'pushbutton', 'buzzer'],
    initialComponents: [
      { type: 'battery', x: 100, y: 190, id: 'bat1' },
      { type: 'pushbutton', x: 360, y: 190, id: 'pb1' },
      { type: 'buzzer', x: 620, y: 180, id: 'buzzer1' }
    ],
    tasks: [
      {
        text: 'Wire 9V Battery, Push-Button Switch, and Buzzer in a series loop',
        check: (status, components) => {
          const pb = components.find(c => c.type === 'pushbutton');
          const bz = components.find(c => c.type === 'buzzer');
          return !!pb && !!bz && (status.isComplete || (bz.state && (bz.state.powered || bz.state.sounding)));
        }
      },
      {
        text: 'Press down the Push-Button switch to activate the buzzer',
        check: (status, components) => {
          const pb = components.find(c => c.type === 'pushbutton');
          return !!pb && pb.state.pressed;
        }
      },
      {
        text: 'Release the push-button to stop the buzzer (momentary operation)',
        check: (status, components) => {
          const bz = components.find(c => c.type === 'buzzer');
          return !!bz && (bz.state.sounding || bz.state.powered || status.isComplete);
        }
      }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Push-Button Pin 1 ➔ Push-Button Pin 2 ➔ Buzzer (+) ➔ Buzzer (-) ➔ Battery (-)',
      circuitType: 'Momentary Push-Button Alarm Loop',
      explanation: 'Connect Battery (+) to Push-Button Pin 1, Push-Button Pin 2 to Buzzer (+) (pin1), and Buzzer (-) (pin2) to Battery (-). Pressing the button closes the spring contacts and sounds the buzzer.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pb1', toPin: 'pin1', label: 'Battery (+) to Push-Button Pin 1' },
        { fromComp: 'pb1', fromPin: 'pin2', toComp: 'buzzer1', toPin: 'pin1', label: 'Switched Feed to Buzzer (+)' },
        { fromComp: 'buzzer1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Buzzer (-) Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const pb = components.find(c => c.type === 'pushbutton');
      const bz = components.find(c => c.type === 'buzzer' && (c.state.powered || c.state.sounding) && !c.state.burnt);
      return !!pb && pb.state.pressed && !!bz && !status.circuitFailed;
    }
  },

  {
    id: 10,
    title: 'Level 10: Rectifier Circuit and LED Operation',
    category: 'Power Conversion',
    badge: 'AC to DC Power Supply',
    summary: 'Build an AC-to-DC power supply! Step down 230V AC mains to 12V AC with a transformer, rectify it to DC, filter it with a capacitor, and power an LED safely through a resistor.',
    instructions: '1. Connect the AC Voltage Supply (L/N) to the Transformer Primary (pri1/pri2).\n2. Connect the Transformer Secondary (sec1/sec2) to the Bridge Rectifier AC inputs (ac1/ac2) or Diode.\n3. Connect Rectifier DC (+) through a 470 Ω Resistor to LED Anode (+), and Rectifier DC (-) to LED Cathode (-).\n4. Connect the Filter Capacitor across the DC rails (Anode to +, Cathode to -) to smooth ripple voltage and power the LED!',
    hint: 'AC Source -> Transformer Primary (230V -> 12V AC). Transformer Secondary -> Rectifier (ac1, ac2). Rectifier DC (+) -> Resistor -> LED Anode (+). Rectifier DC (-) -> LED Cathode (-). Add Capacitor across DC (+) and (-) to filter the DC!',
    theory: 'Mains power uses Alternating Current (AC) because it transmits over long distances efficiently. But electronic semiconductors like LEDs require Direct Current (DC). The Transformer steps down high AC voltage; the Rectifier converts bipolar AC sine waves into unidirectional pulsating DC; and the Reservoir Capacitor charges up to bridge the voltage valleys, delivering smooth, steady DC power.',
    allowedComponents: ['ac_source', 'transformer', 'rectifier', 'diode', 'capacitor', 'resistor', 'led'],
    initialComponents: [
      { type: 'ac_source', x: 60, y: 200, id: 'ac1' },
      { type: 'transformer', x: 260, y: 200, id: 'trans1' },
      { type: 'rectifier', x: 470, y: 200, id: 'rect1' },
      { type: 'capacitor', x: 640, y: 310, id: 'cap1', stateProps: { capacitance: 1000, ratedVoltage: 25 } },
      { type: 'resistor', x: 650, y: 150, id: 'res1', stateProps: { resistance: 470 } },
      { type: 'led', x: 820, y: 150, id: 'led1', stateProps: { color: 'green' } }
    ],
    tasks: [
      {
        text: 'Connect AC Source to Transformer Primary (230V AC to 12V AC step-down)',
        check: (status, components) => {
          const trans = components.find(c => c.type === 'transformer');
          return !!trans && trans.state.powered;
        }
      },
      {
        text: 'Connect Transformer Secondary to the Rectifier to convert AC to DC',
        check: (status, components) => {
          const rect = components.find(c => c.type === 'rectifier');
          const diode = components.find(c => c.type === 'diode');
          return (!!rect && rect.state.powered) || (!!diode && diode.state.powered);
        }
      },
      {
        text: 'Connect Filter Capacitor and Current-Limiting Resistor to power the LED safely with smooth DC',
        check: (status, components) => {
          const led = components.find(c => c.type === 'led');
          return !!led && led.state.powered && !led.state.burnt && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'AC Source ➔ Transformer (Pri) | Transformer (Sec) ➔ Rectifier (AC) | Rectifier (DC) ➔ Capacitor & (Resistor + LED)',
      circuitType: 'Full-Wave Rectified & Filtered Linear DC Supply',
      explanation: 'Connect AC Source (L/N) to Transformer Primary (pri1/pri2). Connect Transformer Secondary (sec1/sec2) to Rectifier AC inputs (ac1/ac2). Connect Rectifier DC (+) to Capacitor Anode and through the 470 Ω Resistor to LED Anode (+). Connect Rectifier DC (-) to Capacitor Cathode and LED Cathode (-).',
      connections: [
        { fromComp: 'ac1', fromPin: 'l', toComp: 'trans1', toPin: 'pri1', label: 'AC Line to Transformer Pri Line' },
        { fromComp: 'ac1', fromPin: 'n', toComp: 'trans1', toPin: 'pri2', label: 'AC Neutral to Transformer Pri Neutral' },
        { fromComp: 'trans1', fromPin: 'sec1', toComp: 'rect1', toPin: 'ac1', label: '12V AC Sec 1 to Rectifier AC 1' },
        { fromComp: 'trans1', fromPin: 'sec2', toComp: 'rect1', toPin: 'ac2', label: '12V AC Sec 2 to Rectifier AC 2' },
        { fromComp: 'rect1', fromPin: 'dc_pos', toComp: 'cap1', toPin: 'anode', label: 'Rectified DC (+) to Filter Capacitor (+)' },
        { fromComp: 'rect1', fromPin: 'dc_pos', toComp: 'res1', toPin: 'pin1', label: 'Rectified DC (+) to 470 Ω Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Current-Limited DC to LED Anode (+)' },
        { fromComp: 'rect1', fromPin: 'dc_neg', toComp: 'cap1', toPin: 'cathode', label: 'Rectified DC (-) to Filter Capacitor (-)' },
        { fromComp: 'rect1', fromPin: 'dc_neg', toComp: 'led1', toPin: 'cathode', label: 'Rectified DC (-) to LED Cathode (-)' }
      ]
    },
    checkWin: (status, components) => {
      const trans = components.find(c => c.type === 'transformer' && c.state.powered);
      const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
      return !!trans && !!led && !status.circuitFailed;
    }
  },

  {
    id: 11,
    title: 'Level 11: NPN Transistor-Based Relay Control',
    category: 'Automation & Relays',
    badge: 'NPN Driver',
    summary: 'Use an NPN transistor as a low-side electronic switch to energize a 5V relay and safely control a high-power solenoid valve!',
    instructions: '1. Connect NPN Transistor Emitter (e) to Battery (-).\n2. Connect Relay Coil 2 to NPN Collector (c) and Relay Coil 1 to Battery (+).\n3. Connect the Flyback Diode across the Relay Coil (Cathode to +, Anode to Collector) to suppress inductive voltage spikes.\n4. Wire the 1kΩ Resistor and Pushbutton from Battery (+) to NPN Base (b).\n5. Connect Relay COM to Battery (+), Relay NO (Normally Open) to Solenoid Valve Pin 1, and Solenoid Pin 2 to Battery (-).\n6. Press the Pushbutton to turn ON the NPN transistor, energizing the relay and opening the solenoid valve!',
    hint: 'Control Loop: Battery (+) -> Pushbutton -> 1kΩ Resistor -> Base (b). Emitter (e) -> Battery (-). Relay Coil: Battery (+) -> Coil 1, Coil 2 -> Collector (c). Load Loop: Battery (+) -> Relay COM, Relay NO -> Solenoid Pin 1, Solenoid Pin 2 -> Battery (-).',
    theory: 'Transistors operate as electronic valves: injecting a modest base current pushes the NPN transistor into SATURATION, pulling the collector down to near-ground (V_ce ≈ 0.2V). This energizes the relay electromagnet, pulling the internal armature blade from NC to NO with a crisp snap! The isolated contacts switch the heavy-current solenoid valve without any electrical stress on the control button or transistor. The parallel flyback diode safely absorbs coil back-EMF when de-energizing.',
    allowedComponents: ['battery', 'npn', 'relay', 'solenoid', 'diode', 'resistor', 'pushbutton'],
    initialComponents: [
      { type: 'battery', x: 60, y: 190, id: 'bat1' },
      { type: 'pushbutton', x: 200, y: 70, id: 'pb1' },
      { type: 'resistor', x: 340, y: 70, id: 'res1', stateProps: { resistance: 1000 } },
      { type: 'npn', x: 470, y: 170, id: 'npn1' },
      { type: 'relay', x: 600, y: 90, id: 'relay1' },
      { type: 'diode', x: 600, y: 240, id: 'diode1' },
      { type: 'solenoid', x: 790, y: 140, id: 'sol1' }
    ],
    tasks: [
      {
        text: 'Connect NPN Emitter to Battery (-) and Collector to Relay Coil 2',
        check: (status, components) => {
          const npn = components.find(c => c.type === 'npn');
          const relay = components.find(c => c.type === 'relay');
          return !!npn && !!relay && (relay.state.coilVoltage > 0 || npn.state.emitterCurrent > 0 || npn.state.conducting || status.isComplete);
        }
      },
      {
        text: 'Connect Flyback Diode across Relay Coil and wire Pushbutton + 1kΩ Resistor to NPN Base',
        check: (status, components) => {
          const npn = components.find(c => c.type === 'npn');
          const pb = components.find(c => c.type === 'pushbutton');
          return !!npn && (npn.state.baseCurrent > 0 || (pb && pb.state.pressed && npn.state.conducting));
        }
      },
      {
        text: 'Connect Relay COM to Battery (+) and Relay NO to Solenoid Valve',
        check: (status, components) => {
          const sol = components.find(c => c.type === 'solenoid');
          const relay = components.find(c => c.type === 'relay');
          return !!sol && !!relay && (sol.state.powered || relay.state.energized);
        }
      },
      {
        text: 'Press Pushbutton to energize the Relay and activate the Solenoid Valve',
        check: (status, components) => {
          const sol = components.find(c => c.type === 'solenoid');
          const relay = components.find(c => c.type === 'relay');
          const npn = components.find(c => c.type === 'npn');
          return !!sol && sol.state.powered && !sol.state.burnt && !!relay && relay.state.energized && !relay.state.burnt && !!npn && npn.state.conducting && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Control: Bat (+) ➔ PB ➔ 1kΩ ➔ NPN Base (b) | Emitter (e) ➔ Bat (-) | Coil: Bat (+) ➔ Coil 1, Coil 2 ➔ NPN Collector (c) | Load: Bat (+) ➔ Relay COM, Relay NO ➔ Solenoid ➔ Bat (-)',
      circuitType: 'NPN Low-Side Saturated Relay Driver',
      explanation: 'Wire the control drive: Battery (+) through Pushbutton and 1kΩ Resistor into NPN Base (b), and NPN Emitter (e) to Battery (-). Wire the coil load: Battery (+) to Relay Coil 1, Coil 2 to NPN Collector (c), with Flyback Diode across the coil (Cathode to +, Anode to c). Wire the load circuit: Battery (+) to Relay COM, Relay NO to Solenoid Valve Pin 1, and Solenoid Pin 2 back to Battery (-). Pressing the pushbutton turns ON the NPN transistor, pulling the coil LOW to energize the relay and actuate the solenoid valve!',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pb1', toPin: 'pin1', label: 'Battery (+) to Pushbutton Pin 1' },
        { fromComp: 'pb1', fromPin: 'pin2', toComp: 'res1', toPin: 'pin1', label: 'Pushbutton Pin 2 to 1kΩ Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: '1kΩ Resistor to NPN Base (b)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'NPN Emitter (e) to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'relay1', toPin: 'coil1', label: 'Battery (+) to Relay Coil 1' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'npn1', toPin: 'c', label: 'Relay Coil 2 to NPN Collector (c)' },
        { fromComp: 'relay1', fromPin: 'coil1', toComp: 'diode1', toPin: 'cathode', label: 'Relay Coil 1 (+) to Diode Cathode' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'diode1', toPin: 'anode', label: 'Relay Coil 2 (-) to Diode Anode' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'relay1', toPin: 'com', label: 'Battery (+) to Relay COM' },
        { fromComp: 'relay1', fromPin: 'no', toComp: 'sol1', toPin: 'pin1', label: 'Relay NO to Solenoid Pin 1' },
        { fromComp: 'sol1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Solenoid Pin 2 to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sol = components.find(c => c.type === 'solenoid');
      const relay = components.find(c => c.type === 'relay');
      const npn = components.find(c => c.type === 'npn');
      return !!sol && sol.state.powered && !sol.state.burnt && !!relay && relay.state.energized && !relay.state.burnt && !!npn && npn.state.conducting && !status.circuitFailed;
    }
  },

  {
    id: 12,
    title: 'Level 12: PNP Transistor-Based Relay Control',
    category: 'Automation & Relays',
    badge: 'PNP High-Side',
    summary: 'Configure a PNP transistor as an active-LOW high-side switch to energize an electromechanical relay and control a solenoid valve!',
    instructions: '1. Connect PNP Transistor Emitter (e) to Battery (+).\n2. Connect PNP Collector (c) to Relay Coil 1, and connect Relay Coil 2 to Battery (-).\n3. Connect the Flyback Diode across the Relay Coil (Cathode to Collector/Coil 1, Anode to Battery (-)/Coil 2).\n4. Connect the 1kΩ Resistor from PNP Base (b) through the Pushbutton to Battery (-) (Ground).\n5. Connect Relay COM to Battery (+), Relay NO to Solenoid Valve Pin 1, and Solenoid Pin 2 to Battery (-).\n6. Press the Pushbutton to pull Base LOW (active-LOW trigger), turning ON the PNP transistor and energizing the relay to open the solenoid valve!',
    hint: 'High-Side Drive: Battery (+) -> PNP Emitter (e). Collector (c) -> Relay Coil 1. Relay Coil 2 -> Battery (-). Active-LOW Base: PNP Base (b) -> 1kΩ Resistor -> Pushbutton -> Battery (-). Relay Contacts: Battery (+) -> Relay COM, Relay NO -> Solenoid Pin 1, Solenoid Pin 2 -> Battery (-).',
    theory: 'PNP transistors conduct when their base is pulled negative relative to the emitter by at least 0.7V (V_eb >= 0.7V). Because the emitter sits at the positive voltage rail (+9V), pulling the base LOW to ground through a resistor injects base current, turning the PNP fully ON (high-side saturation, V_ec ≈ 0.2V). Current rushes from Emitter to Collector into the relay coil, snapping COM into NO and powering the solenoid valve!',
    allowedComponents: ['battery', 'pnp', 'relay', 'solenoid', 'diode', 'resistor', 'pushbutton'],
    initialComponents: [
      { type: 'battery', x: 60, y: 190, id: 'bat1' },
      { type: 'pushbutton', x: 200, y: 310, id: 'pb1' },
      { type: 'resistor', x: 340, y: 310, id: 'res1', stateProps: { resistance: 1000 } },
      { type: 'pnp', x: 470, y: 170, id: 'pnp1' },
      { type: 'relay', x: 600, y: 90, id: 'relay1' },
      { type: 'diode', x: 600, y: 240, id: 'diode1' },
      { type: 'solenoid', x: 790, y: 140, id: 'sol1' }
    ],
    tasks: [
      {
        text: 'Connect PNP Emitter to Battery (+) and Collector to Relay Coil 1 (High-Side Switch)',
        check: (status, components) => {
          const pnp = components.find(c => c.type === 'pnp');
          const relay = components.find(c => c.type === 'relay');
          return !!pnp && !!relay && (relay.state.coilVoltage > 0 || pnp.state.conducting || status.isComplete);
        }
      },
      {
        text: 'Wire 1kΩ Resistor and Pushbutton between PNP Base and Battery (-) (Active-LOW Drive)',
        check: (status, components) => {
          const pnp = components.find(c => c.type === 'pnp');
          const pb = components.find(c => c.type === 'pushbutton');
          return !!pnp && (pnp.state.baseCurrent > 0 || (pb && pb.state.pressed && pnp.state.conducting));
        }
      },
      {
        text: 'Connect Relay COM to Battery (+) and NO to Solenoid Valve',
        check: (status, components) => {
          const sol = components.find(c => c.type === 'solenoid');
          const relay = components.find(c => c.type === 'relay');
          return !!sol && !!relay && (sol.state.powered || relay.state.energized);
        }
      },
      {
        text: 'Press Pushbutton to pull Base LOW, energize the Relay, and activate the Solenoid Valve',
        check: (status, components) => {
          const sol = components.find(c => c.type === 'solenoid');
          const relay = components.find(c => c.type === 'relay');
          const pnp = components.find(c => c.type === 'pnp');
          return !!sol && sol.state.powered && !sol.state.burnt && !!relay && relay.state.energized && !relay.state.burnt && !!pnp && pnp.state.conducting && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'High-Side: Bat (+) ➔ PNP Emitter (e), Collector (c) ➔ Relay Coil 1 ➔ Coil 2 ➔ Bat (-) | Active-LOW Base: PNP Base (b) ➔ 1kΩ ➔ PB ➔ Bat (-) | Load: Bat (+) ➔ COM, NO ➔ Solenoid ➔ Bat (-)',
      circuitType: 'PNP High-Side Active-LOW Relay Driver',
      explanation: 'Wire PNP Emitter (e) to Battery (+) and Collector (c) to Relay Coil 1, with Coil 2 returning to Battery (-). Wire the Flyback Diode across Coil 1 (Cathode) and Coil 2 (Anode). Connect PNP Base (b) through a 1kΩ Resistor and Pushbutton to Battery (-). Wire Relay COM to Battery (+), NO to Solenoid Pin 1, and Solenoid Pin 2 to Battery (-). Pressing the pushbutton pulls the PNP Base LOW, turning ON the transistor to energize the relay and actuate the solenoid valve!',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pnp1', toPin: 'e', label: 'Battery (+) to PNP Emitter (e)' },
        { fromComp: 'pnp1', fromPin: 'c', toComp: 'relay1', toPin: 'coil1', label: 'PNP Collector (c) to Relay Coil 1' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'bat1', toPin: 'neg', label: 'Relay Coil 2 to Battery (-)' },
        { fromComp: 'relay1', fromPin: 'coil1', toComp: 'diode1', toPin: 'cathode', label: 'Relay Coil 1 (+) to Diode Cathode' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'diode1', toPin: 'anode', label: 'Relay Coil 2 (-) to Diode Anode' },
        { fromComp: 'pnp1', fromPin: 'b', toComp: 'res1', toPin: 'pin1', label: 'PNP Base (b) to 1kΩ Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'pb1', toPin: 'pin1', label: '1kΩ Resistor to Pushbutton Pin 1' },
        { fromComp: 'pb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Pushbutton Pin 2 to Battery (-) (Ground)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'relay1', toPin: 'com', label: 'Battery (+) to Relay COM' },
        { fromComp: 'relay1', fromPin: 'no', toComp: 'sol1', toPin: 'pin1', label: 'Relay NO to Solenoid Pin 1' },
        { fromComp: 'sol1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Solenoid Pin 2 to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sol = components.find(c => c.type === 'solenoid');
      const relay = components.find(c => c.type === 'relay');
      const pnp = components.find(c => c.type === 'pnp');
      return !!sol && sol.state.powered && !sol.state.burnt && !!relay && relay.state.energized && !relay.state.burnt && !!pnp && pnp.state.conducting && !status.circuitFailed;
    }
  },

  {
    id: 13,
    title: 'Level 13: DC Motor Forward and Reverse Control Using Two 2-Way Switches',
    category: 'Motor Control',
    badge: 'H-Bridge',
    summary: 'Use two SPDT (2-way) switches to control the rotational direction of a DC motor with crossover wiring!',
    instructions: '1. Connect Motor Pin 1 to Switch 1 COM, and Motor Pin 2 to Switch 2 COM.\n2. Connect Switch 1 L1 and Switch 2 L1 together to Battery (+).\n3. Connect Switch 1 L2 and Switch 2 L2 together to Battery (-).\n4. Operate Switch 1 and Switch 2 to demonstrate both Forward (Clockwise) and Reverse (Counter-Clockwise) rotation!',
    hint: 'H-Bridge Crossover: Battery (+) -> Switch 1 (L1) & Switch 2 (L1). Battery (-) -> Switch 1 (L2) & Switch 2 (L2). Switch 1 (COM) -> Motor Pin 1. Switch 2 (COM) -> Motor Pin 2. When one switch is at L1 (+) and the other at L2 (-), the motor spins! Flipping either switch reverses polarity and direction!',
    theory: 'An H-bridge controls motor direction by reversing terminal polarity. When current enters Motor Pin 1 and exits Pin 2, Lorentz forces spin the rotor Clockwise (CW). When current enters Pin 2 and exits Pin 1, the magnetic torque inverts, spinning the rotor Counter-Clockwise (CCW). When both switches are in the same throw position (both L1 or both L2), potential difference across the motor is 0V and the motor comes to a safe electrical stop.',
    allowedComponents: ['battery', 'motor', 'twowayswitch'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'twowayswitch', x: 290, y: 120, id: 'sw1' },
      { type: 'twowayswitch', x: 530, y: 120, id: 'sw2' },
      { type: 'motor', x: 410, y: 310, id: 'motor1' }
    ],
    tasks: [
      {
        text: 'Wire both SPDT switches to Battery rails (+/-) and connect COMs to Motor terminals',
        check: (status, components) => {
          const sw1 = components.find(c => c.id === 'sw1');
          const sw2 = components.find(c => c.id === 'sw2');
          const motor = components.find(c => c.type === 'motor');
          return !!sw1 && !!sw2 && !!motor && (motor.state.powered || status.isComplete);
        }
      },
      {
        text: 'Operate switches to demonstrate Forward rotation (Clockwise)',
        check: (status, components) => {
          const motor = components.find(c => c.type === 'motor');
          if (motor && motor.state.powered && motor.state.direction === 'cw') {
            if (!motor._testedDir) motor._testedDir = {};
            motor._testedDir.cw = true;
          }
          return !!(motor && motor._testedDir && motor._testedDir.cw);
        }
      },
      {
        text: 'Operate switches to demonstrate Reverse rotation (Counter-Clockwise)',
        check: (status, components) => {
          const motor = components.find(c => c.type === 'motor');
          if (motor && motor.state.powered && motor.state.direction === 'ccw') {
            if (!motor._testedDir) motor._testedDir = {};
            motor._testedDir.ccw = true;
          }
          return !!(motor && motor._testedDir && motor._testedDir.ccw);
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ SW1 L1 & SW2 L1 | Bat (-) ➔ SW1 L2 & SW2 L2 | SW1 COM ➔ Motor Pin 1 | SW2 COM ➔ Motor Pin 2',
      circuitType: 'Dual SPDT Crossover Motor H-Bridge',
      explanation: 'Wire Battery (+) to the L1 terminals of both switches, and Battery (-) to the L2 terminals of both switches. Connect Switch 1 COM to Motor Pin 1 and Switch 2 COM to Motor Pin 2. Toggling the switches swaps terminal polarity between (+/-) for Clockwise and (-/+) for Counter-Clockwise rotation.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'l1', label: 'Battery (+) to Switch 1 L1' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw2', toPin: 'l1', label: 'Battery (+) to Switch 2 L1' },
        { fromComp: 'bat1', fromPin: 'neg', toComp: 'sw1', toPin: 'l2', label: 'Battery (-) to Switch 1 L2' },
        { fromComp: 'bat1', fromPin: 'neg', toComp: 'sw2', toPin: 'l2', label: 'Battery (-) to Switch 2 L2' },
        { fromComp: 'sw1', fromPin: 'com', toComp: 'motor1', toPin: 'pin1', label: 'Switch 1 COM to Motor Pin 1' },
        { fromComp: 'sw2', fromPin: 'com', toComp: 'motor1', toPin: 'pin2', label: 'Switch 2 COM to Motor Pin 2' }
      ]
    },
    checkWin: (status, components) => {
      const motor = components.find(c => c.type === 'motor');
      if (motor && motor.state.powered && (motor.state.rpm || 0) > 0) {
        if (!motor._testedDir) motor._testedDir = {};
        if (motor.state.direction === 'cw') motor._testedDir.cw = true;
        if (motor.state.direction === 'ccw') motor._testedDir.ccw = true;
      }
      return !!motor && !motor.state.burnt && !!motor._testedDir && motor._testedDir.cw && motor._testedDir.ccw && !status.circuitFailed;
    }
  },

  {
    id: 14,
    title: 'Level 14: DC Motor Forward and Reverse Control Using Two Relays',
    category: 'Industrial Control',
    badge: 'Relay H-Bridge',
    summary: 'Build an electromechanical DC motor direction-control H-bridge using two SPDT relays and push buttons with fail-safe dynamic braking!',
    instructions: '1. Connect Relay 1 COM to Motor Pin 1, and Relay 2 COM to Motor Pin 2.\n2. Connect both Relay 1 NC and Relay 2 NC to Battery (-).\n3. Connect both Relay 1 NO and Relay 2 NO to Battery (+).\n4. Wire Forward Pushbutton from Battery (+) to Relay 1 Coil 1 (Coil 2 to Battery -) with Flyback Diode across coil.\n5. Wire Reverse Pushbutton from Battery (+) to Relay 2 Coil 1 (Coil 2 to Battery -) with Flyback Diode across coil.\n6. Press the Forward button to spin Clockwise (CW), then press the Reverse button to spin Counter-Clockwise (CCW)!',
    hint: 'Relay H-Bridge: Relay 1 COM -> Motor Pin 1, Relay 2 COM -> Motor Pin 2. Both NC -> Battery (-). Both NO -> Battery (+). Forward Control: Battery (+) -> Forward PB -> Relay 1 Coil 1, Coil 2 -> Battery (-). Reverse Control: Battery (+) -> Reverse PB -> Relay 2 Coil 1, Coil 2 -> Battery (-). When neither button is pressed, both motor terminals connect to Ground (0V braking). When both buttons are pressed, both connect to +9V (0V differential, safe from short circuit!).',
    theory: 'This dual-relay H-bridge is the gold standard for high-power DC motor direction control in robotics, electric vehicles, and industrial machinery. By tying both NC contacts to Ground and both NO contacts to +VCC, the circuit features intrinsic electrical interlocking: resting state puts 0V across the motor; energizing Relay 1 applies forward voltage (+/-); energizing Relay 2 applies reverse voltage (-/+); and energizing both simultaneously applies +VCC to both terminals (0V differential) without ever shorting the power supply!',
    allowedComponents: ['battery', 'motor', 'relay', 'pushbutton', 'diode'],
    initialComponents: [
      { type: 'battery', x: 60, y: 220, id: 'bat1' },
      { type: 'pushbutton', x: 230, y: 60, id: 'pb_fwd' },
      { type: 'pushbutton', x: 550, y: 60, id: 'pb_rev' },
      { type: 'relay', x: 230, y: 190, id: 'relay1' },
      { type: 'relay', x: 550, y: 190, id: 'relay2' },
      { type: 'diode', x: 90, y: 350, id: 'diode1' },
      { type: 'diode', x: 690, y: 350, id: 'diode2' },
      { type: 'motor', x: 390, y: 330, id: 'motor1' }
    ],
    tasks: [
      {
        text: 'Connect Relay COM pins to Motor, both NC contacts to Battery (-), and both NO to Battery (+)',
        check: (status, components) => {
          const r1 = components.find(c => c.id === 'relay1');
          const r2 = components.find(c => c.id === 'relay2');
          const motor = components.find(c => c.type === 'motor');
          return !!r1 && !!r2 && !!motor && (motor.state.powered || r1.state.energized || r2.state.energized || status.isComplete);
        }
      },
      {
        text: 'Wire Forward button to Relay 1 Coil and Reverse button to Relay 2 Coil with Flyback Diodes',
        check: (status, components) => {
          const r1 = components.find(c => c.id === 'relay1');
          const r2 = components.find(c => c.id === 'relay2');
          return !!r1 && !!r2 && (r1.state.coilVoltage > 0 || r2.state.coilVoltage > 0 || r1.state.energized || r2.state.energized);
        }
      },
      {
        text: 'Press Forward Pushbutton to run the Motor Forward (Clockwise)',
        check: (status, components) => {
          const motor = components.find(c => c.type === 'motor');
          if (motor && motor.state.powered && motor.state.direction === 'cw') {
            if (!motor._testedRelayDir) motor._testedRelayDir = {};
            motor._testedRelayDir.cw = true;
          }
          return !!(motor && motor._testedRelayDir && motor._testedRelayDir.cw);
        }
      },
      {
        text: 'Press Reverse Pushbutton to run the Motor in Reverse (Counter-Clockwise)',
        check: (status, components) => {
          const motor = components.find(c => c.type === 'motor');
          if (motor && motor.state.powered && motor.state.direction === 'ccw') {
            if (!motor._testedRelayDir) motor._testedRelayDir = {};
            motor._testedRelayDir.ccw = true;
          }
          return !!(motor && motor._testedRelayDir && motor._testedRelayDir.ccw);
        }
      }
    ],
    referenceSolution: {
      summary: 'Load: Relay 1 COM ➔ Motor 1, Relay 2 COM ➔ Motor 2 | Both NC ➔ Bat (-) | Both NO ➔ Bat (+) | Fwd PB ➔ Relay 1 Coil | Rev PB ➔ Relay 2 Coil',
      circuitType: 'Dual Relay Electromechanical H-Bridge',
      explanation: 'Connect Relay 1 COM to Motor Pin 1 and Relay 2 COM to Motor Pin 2. Connect both NC contacts to Battery (-) and both NO contacts to Battery (+). Wire Forward Pushbutton between Battery (+) and Relay 1 Coil (Coil 2 to Battery -), and Reverse Pushbutton between Battery (+) and Relay 2 Coil (Coil 2 to Battery -). Flyback diodes in parallel with each coil absorb inductive kickback. Pressing Forward drives CW; pressing Reverse drives CCW!',
      connections: [
        { fromComp: 'relay1', fromPin: 'com', toComp: 'motor1', toPin: 'pin1', label: 'Relay 1 COM to Motor Pin 1' },
        { fromComp: 'relay2', fromPin: 'com', toComp: 'motor1', toPin: 'pin2', label: 'Relay 2 COM to Motor Pin 2' },
        { fromComp: 'bat1', fromPin: 'neg', toComp: 'relay1', toPin: 'nc', label: 'Battery (-) to Relay 1 NC' },
        { fromComp: 'bat1', fromPin: 'neg', toComp: 'relay2', toPin: 'nc', label: 'Battery (-) to Relay 2 NC' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'relay1', toPin: 'no', label: 'Battery (+) to Relay 1 NO' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'relay2', toPin: 'no', label: 'Battery (+) to Relay 2 NO' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pb_fwd', toPin: 'pin1', label: 'Battery (+) to Forward PB' },
        { fromComp: 'pb_fwd', fromPin: 'pin2', toComp: 'relay1', toPin: 'coil1', label: 'Forward PB to Relay 1 Coil 1' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'bat1', toPin: 'neg', label: 'Relay 1 Coil 2 to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pb_rev', toPin: 'pin1', label: 'Battery (+) to Reverse PB' },
        { fromComp: 'pb_rev', fromPin: 'pin2', toComp: 'relay2', toPin: 'coil1', label: 'Reverse PB to Relay 2 Coil 1' },
        { fromComp: 'relay2', fromPin: 'coil2', toComp: 'bat1', toPin: 'neg', label: 'Relay 2 Coil 2 to Battery (-)' },
        { fromComp: 'relay1', fromPin: 'coil1', toComp: 'diode1', toPin: 'cathode', label: 'Relay 1 Coil 1 to Diode 1 Cathode' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'diode1', toPin: 'anode', label: 'Relay 1 Coil 2 to Diode 1 Anode' },
        { fromComp: 'relay2', fromPin: 'coil1', toComp: 'diode2', toPin: 'cathode', label: 'Relay 2 Coil 1 to Diode 2 Cathode' },
        { fromComp: 'relay2', fromPin: 'coil2', toComp: 'diode2', toPin: 'anode', label: 'Relay 2 Coil 2 to Diode 2 Anode' }
      ]
    },
    checkWin: (status, components) => {
      const motor = components.find(c => c.type === 'motor');
      if (motor && motor.state.powered && (motor.state.rpm || 0) > 0) {
        if (!motor._testedRelayDir) motor._testedRelayDir = {};
        if (motor.state.direction === 'cw') motor._testedRelayDir.cw = true;
        if (motor.state.direction === 'ccw') motor._testedRelayDir.ccw = true;
      }
      return !!motor && !motor.state.burnt && !!motor._testedRelayDir && motor._testedRelayDir.cw && motor._testedRelayDir.ccw && !status.circuitFailed;
    }
  },

  {
    id: 15,
    title: 'Level 15: LDR-Based Automatic LED Control',
    category: 'Sensors & Automation',
    badge: 'Smart Sensor',
    summary: 'Design an intelligent light-sensing circuit using an LDR, NPN transistor, and voltage divider that automatically illuminates the LED when darkness falls!',
    instructions: '1. Wire the Lamp Circuit: Connect Battery (+) through Switch to Incandescent Bulb, and Bulb back to Battery (-). Position the bulb near the LDR to illuminate it.\n2. Wire the LED Load: Connect Battery (+) through the 470Ω Resistor into LED Anode (+). Connect LED Cathode (-) to NPN Collector (c), and NPN Emitter (e) to Battery (-).\n3. Wire the Light Sensor Divider: Connect the 10kΩ Resistor from Battery (+) to NPN Base (b). Connect the LDR from NPN Base (b) to Battery (-).\n4. Observe smart automation: When the lamp is ON, the LDR drops resistance, pulling Base LOW and keeping the LED OFF. Turn the lamp switch OFF to plunge the LDR into darkness—watch the LED turn ON automatically!',
    hint: 'Lamp Circuit: Bat (+) -> Switch -> Bulb -> Bat (-). LED Circuit: Bat (+) -> 470Ω Resistor -> LED Anode -> LED Cathode -> NPN Collector (c). Emitter (e) -> Bat (-). Base Divider: Bat (+) -> 10kΩ Resistor -> NPN Base (b) -> LDR -> Bat (-). Toggle the lamp switch to switch light and darkness!',
    theory: 'The 10kΩ resistor and LDR form an optical voltage divider: V_base = V_bat × R_ldr / (R_fixed + R_ldr). In light, photon energy frees charge carriers in the CdS sensor, dropping R_ldr below 500Ω. V_base falls below 0.65V, holding the NPN transistor in CUTOFF (LED OFF). In darkness, bound electrons recombine, skyrocketing R_ldr to 100,000Ω. Base voltage rises above 0.7V, driving the transistor into SATURATION (I_c = β × I_b) and illuminating the LED automatically!',
    allowedComponents: ['battery', 'switch', 'bulb', 'resistor', 'ldr', 'npn', 'led'],
    initialComponents: [
      { type: 'battery', x: 50, y: 220, id: 'bat1' },
      { type: 'switch', x: 180, y: 70, id: 'sw_lamp' },
      { type: 'bulb', x: 320, y: 60, id: 'bulb1' },
      { type: 'resistor', x: 190, y: 230, id: 'res_bias', stateProps: { resistance: 10000 } },
      { type: 'ldr', x: 320, y: 230, id: 'ldr1' },
      { type: 'npn', x: 470, y: 230, id: 'npn1' },
      { type: 'resistor', x: 610, y: 150, id: 'res_led', stateProps: { resistance: 470 } },
      { type: 'led', x: 740, y: 210, id: 'led1', stateProps: { color: 'green' } }
    ],
    tasks: [
      {
        text: 'Build the lamp circuit with the switch and incandescent bulb to illuminate the LDR',
        check: (status, components) => {
          const sw = components.find(c => c.id === 'sw_lamp');
          const bulb = components.find(c => c.id === 'bulb1');
          return !!bulb && (bulb.state.powered || (sw && sw.state.closed) || status.isComplete);
        }
      },
      {
        text: 'Connect the LED load circuit through the 470Ω resistor and NPN Collector-Emitter',
        check: (status, components) => {
          const led = components.find(c => c.type === 'led');
          const npn = components.find(c => c.type === 'npn');
          return !!led && !!npn && (led.state.powered || npn.state.collectorCurrent > 0 || npn.state.conducting || status.isComplete);
        }
      },
      {
        text: 'Wire 10kΩ resistor and LDR to form the light-sensing base voltage divider',
        check: (status, components) => {
          const ldr = components.find(c => c.type === 'ldr');
          const npn = components.find(c => c.type === 'npn');
          return !!ldr && !!npn && (npn.state.baseCurrent > 0 || npn.state.conducting);
        }
      },
      {
        text: 'Observe automatic LED operation: LED lights in darkness when the lamp is turned OFF',
        check: (status, components) => {
          const led = components.find(c => c.type === 'led');
          const npn = components.find(c => c.type === 'npn');
          const ldr = components.find(c => c.type === 'ldr');
          return !!led && led.state.powered && !led.state.burnt && !!npn && npn.state.conducting && !!ldr && !status.circuitFailed;
        }
      }
    ],
    referenceSolution: {
      summary: 'Lamp: Bat (+) ➔ Switch ➔ Bulb ➔ Bat (-) | Sensor Divider: Bat (+) ➔ 10kΩ ➔ Base (b) ➔ LDR ➔ Bat (-) | LED Load: Bat (+) ➔ 470Ω ➔ LED ➔ NPN (c) | Emitter (e) ➔ Bat (-)',
      circuitType: 'Optical Automatic Darkness Sensor Switch',
      explanation: 'Wire the lamp circuit: Battery (+) through Switch to Incandescent Bulb and back to Battery (-). Wire the LED load: Battery (+) through 470Ω Resistor into LED Anode, LED Cathode to NPN Collector (c), and Emitter (e) to Battery (-). Form the base divider: Battery (+) to 10kΩ Resistor, Resistor to NPN Base (b), and Base (b) through LDR to Battery (-). When the lamp switch is open (darkness), the LDR high resistance biases the transistor ON to illuminate the LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw_lamp', toPin: 'pin1', label: 'Battery (+) to Lamp Switch' },
        { fromComp: 'sw_lamp', fromPin: 'pin2', toComp: 'bulb1', toPin: 'pin1', label: 'Switch to Incandescent Bulb' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Return to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res_led', toPin: 'pin1', label: 'Battery (+) to 470Ω Resistor' },
        { fromComp: 'res_led', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: '470Ω Resistor to LED Anode' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'npn1', toPin: 'c', label: 'LED Cathode to NPN Collector (c)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'NPN Emitter (e) to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res_bias', toPin: 'pin1', label: 'Battery (+) to 10kΩ Bias Resistor' },
        { fromComp: 'res_bias', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: '10kΩ Resistor to NPN Base (b)' },
        { fromComp: 'npn1', fromPin: 'b', toComp: 'ldr1', toPin: 'pin1', label: 'NPN Base (b) to LDR Pin 1' },
        { fromComp: 'ldr1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'LDR Pin 2 to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.type === 'led');
      const npn = components.find(c => c.type === 'npn');
      const ldr = components.find(c => c.type === 'ldr');
      return !!led && led.state.powered && !led.state.burnt && !!npn && npn.state.conducting && !!ldr && !status.circuitFailed;
    }
  },

  {
    id: 16,
    title: 'Level 16: Automatic Street Light (LDR + Transistor + Relay)',
    category: 'Automation',
    badge: 'Master',
    summary: 'Build an automated street lighting system using an LDR light sensor, NPN transistor driver, electromagnetic relay, and incandescent street lamp!',
    instructions: 'Construct an automatic street lighting circuit! Connect a 10kΩ Resistor from Battery (+) to NPN Base (b), and the LDR from NPN Base (b) to Battery (-). Connect the Relay Coil between Battery (+) and NPN Collector (c), with the NPN Emitter (e) connected to Battery (-). Wire a Flyback Diode across the relay coil (Cathode to +, Anode to Collector). Connect the Street Lamp from Battery (+) to Relay COM, and Relay NO to Bulb Terminal A, returning Bulb Terminal B to Battery (-). When dark, the sensor triggers the relay and turns ON the street lamp!',
    hint: 'Base divider: Battery (+) -> 10kΩ Resistor -> NPN Base (b); LDR connects between NPN Base (b) and Battery (-). Relay driver: Battery (+) -> Relay Coil 1; Relay Coil 2 -> NPN Collector (c); NPN Emitter (e) -> Battery (-). Diode: Cathode (-) -> Battery (+), Anode (+) -> NPN Collector (c). Load: Battery (+) -> Relay COM; Relay NO -> Bulb Pin 1; Bulb Pin 2 -> Battery (-). Darken the LDR to test!',
    theory: 'In daylight, light photons shower the LDR surface, keeping its resistance low (~300Ω) and pulling the NPN Base voltage below 0.6V (OFF). At dusk or in darkness, LDR resistance skyrockets to 100,000Ω, lifting the Base voltage above 0.7V. Base current turns the transistor ON, pulling the relay coil to Ground, energizing the electromagnet, closing the COM-to-NO contacts, and illuminating the street light!',
    allowedComponents: ['battery', 'resistor', 'ldr', 'npn', 'relay', 'diode', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'resistor', x: 250, y: 90, id: 'res1', stateProps: { resistance: 10000 } },
      { type: 'ldr', x: 250, y: 280, id: 'ldr1' },
      { type: 'npn', x: 420, y: 220, id: 'npn1' },
      { type: 'diode', x: 570, y: 80, id: 'diode1' },
      { type: 'relay', x: 570, y: 220, id: 'relay1' },
      { type: 'bulb', x: 750, y: 220, id: 'bulb1' }
    ],
    tasks: [
      {
        id: 'driver_circuit',
        desc: 'Build the LDR light-sensor divider and NPN transistor relay driver',
        done: (c, s) => {
          const npn = c.find(comp => comp.type === 'npn');
          const relay = c.find(comp => comp.type === 'relay');
          const ldr = c.find(comp => comp.type === 'ldr');
          return !!npn && !!relay && !!ldr && (relay.state.coilVoltage > 2.0 || npn.state.conducting || relay.state.energized);
        }
      },
      {
        id: 'street_light_load',
        desc: 'Wire the Incandescent Street Lamp through Relay COM and NO contacts',
        done: (c, s) => {
          const relay = c.find(comp => comp.type === 'relay');
          const bulb = c.find(comp => comp.type === 'bulb');
          return !!relay && !!bulb && bulb.state.powered && !bulb.state.burnt;
        }
      },
      {
        id: 'automatic_operation',
        desc: 'Activate street light in dark conditions (Relay energized, lamp illuminated)',
        done: (c, s) => {
          const relay = c.find(comp => comp.type === 'relay');
          const bulb = c.find(comp => comp.type === 'bulb');
          const npn = c.find(comp => comp.type === 'npn');
          return !!relay && relay.state.energized && !!bulb && bulb.state.powered && !bulb.state.burnt && !!npn && npn.state.conducting;
        }
      }
    ],
    referenceSolution: {
      summary: 'Base: Bat (+) ➔ 10kΩ ➔ NPN Base (b) & LDR ➔ Bat (-) | Coil: Bat (+) ➔ Relay Coil 1 & Coil 2 ➔ NPN Collector (c) ➔ Emitter (e) ➔ Bat (-) | Load: Bat (+) ➔ Relay COM & NO ➔ Bulb ➔ Bat (-)',
      circuitType: 'Automatic Dusk-to-Dawn Light Sensor & Relay Driver',
      explanation: 'The 10kΩ resistor and LDR form a potential divider at the NPN transistor base. In darkness, LDR resistance is high (~100kΩ), providing sufficient forward bias to switch ON the transistor. This energizes the relay coil, switching COM to NO and lighting the street lamp.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery (+) to 10kΩ Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Resistor to NPN Base (b)' },
        { fromComp: 'npn1', fromPin: 'b', toComp: 'ldr1', toPin: 'pin1', label: 'NPN Base (b) to LDR Pin 1' },
        { fromComp: 'ldr1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'LDR Pin 2 to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'relay1', toPin: 'coil1', label: 'Battery (+) to Relay Coil 1' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'npn1', toPin: 'c', label: 'Relay Coil 2 to NPN Collector (c)' },
        { fromComp: 'relay1', fromPin: 'coil1', toComp: 'diode1', toPin: 'cathode', label: 'Relay Coil 1 (+) to Diode Cathode' },
        { fromComp: 'relay1', fromPin: 'coil2', toComp: 'diode1', toPin: 'anode', label: 'Relay Coil 2 (-) to Diode Anode' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'NPN Emitter (e) to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'relay1', toPin: 'com', label: 'Battery (+) to Relay COM' },
        { fromComp: 'relay1', fromPin: 'no', toComp: 'bulb1', toPin: 'pin1', label: 'Relay NO to Bulb Terminal A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Terminal B to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const relay = components.find(c => c.type === 'relay');
      const bulb = components.find(c => c.type === 'bulb');
      const npn = components.find(c => c.type === 'npn');
      return !!relay && relay.state.energized && !!bulb && bulb.state.powered && !bulb.state.burnt && !!npn && npn.state.conducting && !status.circuitFailed;
    }
  },

  {
    id: 17,
    title: 'Level 17: Working Principle of a Capacitor (RC Energy Storage)',
    category: 'Energy Storage',
    badge: 'Essential',
    summary: 'Discover how capacitors store electrical energy! Build an RC circuit with a 9V battery, switch, 1000µF electrolytic capacitor, resistor, and LED.',
    instructions: 'Connect the 9V Battery (+) to the Single-Pole Switch. Connect the other switch terminal to both the Capacitor Anode (+) and the Current-Limiting Resistor. Connect the Resistor to the LED Anode (+). Finally, return both the Capacitor Cathode (-) and LED Cathode (-) to the Battery (-). Close the switch to charge the capacitor and illuminate the LED, then open the switch to see the capacitor discharge its stored energy!',
    hint: 'Battery (+) -> Switch Pin 1. Switch Pin 2 -> Capacitor Anode (+) AND Resistor Pin 1. Resistor Pin 2 -> LED Anode (+). Connect Capacitor Cathode (-) and LED Cathode (-) back to Battery (-). Turn ON to charge, then turn OFF to observe energy discharge!',
    theory: 'A capacitor consists of two conductive plates separated by a dielectric insulator. When connected to a voltage source, electrons accumulate on the negative plate while leaving the positive plate, storing energy in an electrostatic field: E = ½ · C · V². When the switch is opened, the stored charge sustains current flow through the resistor into the LED, demonstrating how capacitors serve as energy reservoirs and backup power buffers.',
    allowedComponents: ['battery', 'switch', 'capacitor', 'resistor', 'led'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'switch', x: 260, y: 120, id: 'sw1' },
      { type: 'capacitor', x: 450, y: 120, id: 'cap1', stateProps: { capacitance: 1000, ratedVoltage: 16 } },
      { type: 'resistor', x: 450, y: 260, id: 'res1', stateProps: { resistance: 470 } },
      { type: 'led', x: 650, y: 260, id: 'led1', stateProps: { color: 'green' } }
    ],
    tasks: [
      {
        id: 'rc_wiring',
        desc: 'Wire the Switch, Capacitor, Resistor, and LED to the 9V Battery',
        done: (c, s) => {
          const cap = c.find(comp => comp.type === 'capacitor');
          const led = c.find(comp => comp.type === 'led');
          const sw = c.find(comp => comp.type === 'switch');
          return !!cap && !!led && !!sw && ((cap.state.storedVoltage || 0) > 1.0 || led.state.powered);
        }
      },
      {
        id: 'charge_capacitor',
        desc: 'Close the switch to charge the capacitor and power the LED',
        done: (c, s) => {
          const cap = c.find(comp => comp.type === 'capacitor');
          const led = c.find(comp => comp.type === 'led');
          const sw = c.find(comp => comp.type === 'switch');
          return !!sw && sw.state.closed && !!cap && (cap.state.storedVoltage || 0) > 4.0 && !!led && led.state.powered && !led.state.burnt;
        }
      },
      {
        id: 'discharge_energy',
        desc: 'Capacitor stored voltage demonstrates energy storage principle (Stored V > 4V)',
        done: (c, s) => {
          const cap = c.find(comp => comp.type === 'capacitor');
          const led = c.find(comp => comp.type === 'led');
          return !!cap && (cap.state.storedVoltage || 0) >= 4.0 && !!led && !led.state.burnt;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switch ➔ Cap (+) & Resistor ➔ LED (+) | Cap (-) & LED (-) ➔ Bat (-)',
      circuitType: 'Parallel RC Charging and Energy Buffer Circuit',
      explanation: 'Battery (+) feeds through the SPST switch into the capacitor anode and the 470Ω current-limiting resistor. The resistor powers the LED. Both capacitor cathode and LED cathode return to ground. Closing the switch charges the capacitor to 9V and lights the LED. Opening the switch leaves the capacitor discharging stored charge through the LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Pin 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'cap1', toPin: 'anode', label: 'Switch Pin 2 to Capacitor Anode (+)' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'res1', toPin: 'pin1', label: 'Switch Pin 2 to Resistor Pin 1' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor Pin 2 to LED Anode (+)' },
        { fromComp: 'cap1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'Capacitor Cathode (-) to Battery (-)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const cap = components.find(c => c.type === 'capacitor');
      const led = components.find(c => c.type === 'led');
      return !!cap && (cap.state.storedVoltage || 0) > 4.0 && !cap.state.burnt &&
             !!led && !led.state.burnt &&
             !status.circuitFailed;
    }
  },

  {
    id: 18,
    title: 'Level 18: Circuit Diagnostics: Voltmeter & Ammeter',
    category: 'Instrumentation',
    badge: 'Diagnostic',
    summary: 'Measure electric current and potential difference in a live circuit! Insert the Ammeter in SERIES and attach the Voltmeter in PARALLEL across the incandescent lamp.',
    instructions: 'You have an existing circuit with a 9V Battery and an Incandescent Lamp. Break the circuit loop to insert the Ammeter in SERIES (Battery (+) to Ammeter (+) and Ammeter (-) to Lamp Terminal A). Then connect the Voltmeter in PARALLEL across the lamp (Voltmeter (+) to Terminal A and Voltmeter (-) to Terminal B). Observe the current (Amps) and voltage (Volts) simultaneously!',
    hint: 'Ammeter in series: Battery (+) -> Ammeter Pin Pos (+) -> Ammeter Pin Neg (-) -> Bulb Pin 1. Voltmeter in parallel across load: Voltmeter Pin Pos (+) -> Bulb Pin 1, Voltmeter Pin Neg (-) -> Bulb Pin 2. Bulb Pin 2 returns to Battery (-).',
    theory: 'An Ammeter has extremely low internal resistance (~0.01Ω) and must always be connected in SERIES so that all branch current passes through it without dropping voltage. A Voltmeter has ultra-high internal resistance (10,000,000Ω) and must always be connected in PARALLEL across a load to measure the potential difference without siphoning significant current.',
    allowedComponents: ['battery', 'bulb', 'ammeter', 'voltmeter'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'ammeter', x: 340, y: 120, id: 'ammeter1' },
      { type: 'bulb', x: 620, y: 220, id: 'bulb1' },
      { type: 'voltmeter', x: 620, y: 390, id: 'voltmeter1' }
    ],
    tasks: [
      {
        id: 'series_ammeter',
        desc: 'Connect the Ammeter in SERIES between Battery (+) and Bulb Terminal A',
        done: (c, s) => {
          const ammeter = c.find(comp => comp.type === 'ammeter');
          return !!ammeter && (ammeter.state.measuredCurrent || ammeter.state.current || 0) > 0.05 && !ammeter.state.burnt;
        }
      },
      {
        id: 'parallel_voltmeter',
        desc: 'Connect the Voltmeter in PARALLEL across the Incandescent Lamp terminals (both + and − terminals)',
        done: (c, s, app) => {
          const vm = c.find(comp => comp.type === 'voltmeter');
          if (!vm) return false;
          const wires = (app && app.wires) || [];
          const hasPosWire = wires.some(w => (w.fromComp === vm.id && w.fromPin === 'pin_pos') || (w.toComp === vm.id && w.toPin === 'pin_pos'));
          const hasNegWire = wires.some(w => (w.fromComp === vm.id && w.fromPin === 'pin_neg') || (w.toComp === vm.id && w.toPin === 'pin_neg'));
          return hasPosWire && hasNegWire && !!vm.state.powered && (vm.state.measuredVoltage || 0) > 4.0 && !vm.state.burnt;
        }
      },
      {
        id: 'measure_operating_point',
        desc: 'Verify the lamp is glowing brightly while measuring both Current and Voltage simultaneously',
        done: (c, s, app) => {
          const bulb = c.find(comp => comp.type === 'bulb');
          const ammeter = c.find(comp => comp.type === 'ammeter');
          const vm = c.find(comp => comp.type === 'voltmeter');
          const wires = (app && app.wires) || [];
          const hasPosWire = wires.some(w => (w.fromComp === 'voltmeter1' && w.fromPin === 'pin_pos') || (w.toComp === 'voltmeter1' && w.toPin === 'pin_pos'));
          const hasNegWire = wires.some(w => (w.fromComp === 'voltmeter1' && w.fromPin === 'pin_neg') || (w.toComp === 'voltmeter1' && w.toPin === 'pin_neg'));
          return !!bulb && bulb.state.powered && !bulb.state.burnt &&
                 !!ammeter && (ammeter.state.measuredCurrent || 0) > 0.05 && !ammeter.state.burnt &&
                 !!vm && hasPosWire && hasNegWire && !!vm.state.powered && (vm.state.measuredVoltage || 0) > 4.0 && !vm.state.burnt;
        }
      }
    ],
    referenceSolution: {
      summary: 'Series Ammeter: Bat (+) ➔ Ammeter (+) ➔ Ammeter (-) ➔ Bulb A ➔ Bat (-) | Parallel Voltmeter: Voltmeter (+) ➔ Bulb A, Voltmeter (-) ➔ Bulb B',
      circuitType: 'Simultaneous Series Current and Parallel Voltage Measurement',
      explanation: 'The ammeter is wired in series to measure the ~0.20A flowing through the circuit. The voltmeter is wired in parallel across the incandescent lamp to measure the ~8.9V drop across its tungsten filament.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'ammeter1', toPin: 'pin_pos', label: 'Battery (+) to Ammeter (+)' },
        { fromComp: 'ammeter1', fromPin: 'pin_neg', toComp: 'bulb1', toPin: 'pin1', label: 'Ammeter (-) to Bulb Terminal A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Terminal B to Battery (-)' },
        { fromComp: 'voltmeter1', fromPin: 'pin_pos', toComp: 'bulb1', toPin: 'pin1', label: 'Voltmeter (+) to Bulb Terminal A' },
        { fromComp: 'voltmeter1', fromPin: 'pin_neg', toComp: 'bulb1', toPin: 'pin2', label: 'Bulb Terminal B to Voltmeter (-)' }
      ]
    },
    checkWin: (status, components, app) => {
      const bulb = components.find(c => c.type === 'bulb');
      const ammeter = components.find(c => c.type === 'ammeter');
      const vm = components.find(c => c.type === 'voltmeter');
      const wires = (app && app.wires) || [];
      const hasPosWire = wires.some(w => (w.fromComp === 'voltmeter1' && w.fromPin === 'pin_pos') || (w.toComp === 'voltmeter1' && w.toPin === 'pin_pos'));
      const hasNegWire = wires.some(w => (w.fromComp === 'voltmeter1' && w.fromPin === 'pin_neg') || (w.toComp === 'voltmeter1' && w.toPin === 'pin_neg'));
      return !!bulb && bulb.state.powered && !bulb.state.burnt &&
             !!ammeter && (ammeter.state.measuredCurrent || 0) > 0.05 && !ammeter.state.burnt &&
             !!vm && hasPosWire && hasNegWire && !!vm.state.powered && (vm.state.measuredVoltage || 0) > 4.0 && !vm.state.burnt &&
             !status.circuitFailed;
    }
  },

  {
    id: 19,
    title: 'Level 19: Power Measurement: Digital Wattmeter (P = V × I)',
    category: 'Instrumentation',
    badge: 'Master',
    summary: 'Measure active electrical power consumption! Connect a 4-terminal Digital Wattmeter between the 9V battery and the incandescent lamp to calculate Watts in real time.',
    instructions: 'Connect the Digital Wattmeter between the 9V Battery and the Incandescent Lamp. Wire Battery (+) to Source In (+) and Battery (-) to Source In (-). Then wire Load Out (+) to Lamp Terminal A, and Load Out (-) to Lamp Terminal B. Observe real-time power: P = V × I in Watts!',
    hint: 'Source side: Battery (+) -> Wattmeter in_pos, Battery (-) -> Wattmeter in_neg. Load side: Wattmeter out_pos -> Bulb Pin 1, Wattmeter out_neg -> Bulb Pin 2. The digital readout will display active Watts!',
    theory: 'Electric power is the rate at which electrical energy is converted into another form (such as light and heat). A Wattmeter combines a voltmeter sense mechanism and an ammeter current shunt, multiplying instantaneous voltage and current: P = V · I. A 9V battery powering a lamp at 0.20A consumes approximately 1.8 Watts.',
    allowedComponents: ['battery', 'bulb', 'wattmeter'],
    initialComponents: [
      { type: 'battery', x: 100, y: 220, id: 'bat1' },
      { type: 'wattmeter', x: 380, y: 200, id: 'wattmeter1' },
      { type: 'bulb', x: 660, y: 220, id: 'bulb1' }
    ],
    tasks: [
      {
        id: 'connect_source',
        desc: 'Connect Battery (+) to Source In (+) and Battery (-) to Source In (-)',
        done: (c, s) => {
          const wm = c.find(comp => comp.type === 'wattmeter');
          return !!wm && (wm.state.voltage || 0) > 5.0 && !wm.state.burnt;
        }
      },
      {
        id: 'connect_load',
        desc: 'Connect Load Out (+) and Load Out (-) across the Incandescent Lamp',
        done: (c, s) => {
          const bulb = c.find(comp => comp.type === 'bulb');
          return !!bulb && bulb.state.powered && !bulb.state.burnt;
        }
      },
      {
        id: 'measure_power',
        desc: 'Verify the Wattmeter is actively computing load power consumption (Power > 0.5W)',
        done: (c, s) => {
          const wm = c.find(comp => comp.type === 'wattmeter');
          const bulb = c.find(comp => comp.type === 'bulb');
          return !!wm && (wm.state.power || 0) > 0.5 && !wm.state.burnt && !!bulb && bulb.state.powered;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+/-) ➔ Wattmeter Source IN (+/-) | Wattmeter Load OUT (+/-) ➔ Bulb (A/B)',
      circuitType: 'Four-Terminal Real-Time Active Power Analyzer',
      explanation: 'The 4-terminal wattmeter monitors both the line voltage across the source inputs and the load current passing through its low-resistance shunt to the load outputs, calculating P = V × I (~1.8 Watts).',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'wattmeter1', toPin: 'in_pos', label: 'Battery (+) to Wattmeter Source In (+)' },
        { fromComp: 'bat1', fromPin: 'neg', toComp: 'wattmeter1', toPin: 'in_neg', label: 'Battery (-) to Wattmeter Source In (-)' },
        { fromComp: 'wattmeter1', fromPin: 'out_pos', toComp: 'bulb1', toPin: 'pin1', label: 'Wattmeter Load Out (+) to Bulb Terminal A' },
        { fromComp: 'wattmeter1', fromPin: 'out_neg', toComp: 'bulb1', toPin: 'pin2', label: 'Wattmeter Load Out (-) to Bulb Terminal B' }
      ]
    },
    checkWin: (status, components) => {
      const wm = components.find(c => c.type === 'wattmeter');
      const bulb = components.find(c => c.type === 'bulb');
      return !!wm && (wm.state.power || 0) > 0.5 && !wm.state.burnt &&
             !!bulb && bulb.state.powered && !bulb.state.burnt &&
             !status.circuitFailed;
    }
  },

  {
    id: 20,
    title: 'Level 20: Two-Key Switch Security Door (AND Gate)',
    category: 'Digital Logic',
    badge: 'Security',
    summary: 'Build a secure dual-lock door! The security solenoid valve opens only when BOTH key switches are turned ON.',
    instructions: 'Connect Battery (+) to Switch 1 Pin 1 and Switch 2 Pin 1. Connect Switch 1 Pin 2 to AND Gate Input A, and Switch 2 Pin 2 to AND Gate Input B. Connect the AND Gate Output (Y) to Solenoid Pin 1, and return Solenoid Pin 2 to Battery (-). Turn ON both switches to open the security door!',
    hint: 'Bat (+) -> Switch 1 Pin 1; Switch 1 Pin 2 -> Gate in_a. Bat (+) -> Switch 2 Pin 1; Switch 2 Pin 2 -> Gate in_b. Gate out -> Solenoid Pin 1; Solenoid Pin 2 -> Bat (-).',
    theory: 'An AND gate implements logical conjunction (Y = A · B). In electronic security systems, dual-key mechanisms require two separate authorized operators to close their respective switches simultaneously before the actuator can receive power.',
    allowedComponents: ['battery', 'switch', 'gate_and', 'solenoid'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'switch', x: 280, y: 110, id: 'sw1' },
      { type: 'switch', x: 280, y: 310, id: 'sw2' },
      { type: 'gate_and', x: 500, y: 210, id: 'gate1' },
      { type: 'solenoid', x: 740, y: 210, id: 'sol1' }
    ],
    tasks: [
      {
        id: 'wire_inputs',
        desc: 'Connect both switches between Battery (+) and AND Gate inputs A & B',
        done: (c, s) => {
          const sw1 = c.find(comp => comp.id === 'sw1');
          const sw2 = c.find(comp => comp.id === 'sw2');
          const gate = c.find(comp => comp.id === 'gate1');
          return !!sw1 && !!sw2 && !!gate && (gate.state.inputA === 1 || gate.state.inputB === 1 || sw1.state.closed || sw2.state.closed);
        }
      },
      {
        id: 'wire_solenoid',
        desc: 'Connect AND Gate Output to the Solenoid Valve and return to Battery (-)',
        done: (c, s) => {
          const sol = c.find(comp => comp.id === 'sol1');
          return !!sol && (sol.state.powered || sol.state.armPosition > 0 || (s && s.activeComponents && s.activeComponents.has('sol1')));
        }
      },
      {
        id: 'dual_key_activation',
        desc: 'Turn ON both switches to open the security door (Solenoid energized)!',
        done: (c, s) => {
          const sw1 = c.find(comp => comp.id === 'sw1');
          const sw2 = c.find(comp => comp.id === 'sw2');
          const gate = c.find(comp => comp.id === 'gate1');
          const sol = c.find(comp => comp.id === 'sol1');
          return !!sw1 && sw1.state.closed && !!sw2 && sw2.state.closed && !!gate && gate.state.outputLevel === 1 && !!sol && sol.state.powered && !sol.state.burnt;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switch 1 & 2 ➔ AND Gate (in_a / in_b) | Gate Output ➔ Solenoid Valve ➔ Bat (-)',
      circuitType: 'Digital Dual-Key Interlock Control',
      explanation: 'Battery (+) connects to Switch 1 and Switch 2. Closing both switches delivers Logic HIGH (1) to both Input A and Input B of the AND Gate. The AND gate output drives +5V into the solenoid actuator, retracting the locking pin and unlocking the security door.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_a', label: 'Switch 1 to AND Input A' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw2', toPin: 'pin1', label: 'Battery (+) to Switch 2' },
        { fromComp: 'sw2', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_b', label: 'Switch 2 to AND Input B' },
        { fromComp: 'gate1', fromPin: 'out', toComp: 'sol1', toPin: 'pin1', label: 'AND Gate Output to Solenoid (+)' },
        { fromComp: 'sol1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Solenoid Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sw1 = components.find(c => c.id === 'sw1');
      const sw2 = components.find(c => c.id === 'sw2');
      const gate = components.find(c => c.id === 'gate1');
      const sol = components.find(c => c.id === 'sol1');
      return !!sw1 && sw1.state.closed && !!sw2 && sw2.state.closed &&
             !!gate && gate.state.outputLevel === 1 &&
             !!sol && sol.state.powered && !sol.state.burnt &&
             !status.circuitFailed;
    }
  },

  {
    id: 21,
    title: 'Level 21: Emergency Alarm Circuit (OR Gate)',
    category: 'Digital Logic',
    badge: 'Emergency',
    summary: 'Build an emergency alert circuit! The warning buzzer and red LED activate when EITHER push button is pressed.',
    instructions: 'Connect Battery (+) to Push Button 1 Pin 1 and Push Button 2 Pin 1. Connect Push Button 1 Pin 2 to OR Gate Input A, and Push Button 2 Pin 2 to OR Gate Input B. Connect the OR Gate Output to the Buzzer (+) and Red LED Anode (+). Return the Buzzer (-) and LED Cathode (-) to Battery (-). Press either button to sound the alarm!',
    hint: 'Bat (+) -> Button 1 Pin 1; Button 1 Pin 2 -> Gate in_a. Bat (+) -> Button 2 Pin 1; Button 2 Pin 2 -> Gate in_b. Gate out -> Buzzer Pin 1 & LED Anode (+). Buzzer Pin 2 & LED Cathode (-) -> Bat (-).',
    theory: 'An OR gate implements logical disjunction (Y = A + B). Emergency exit systems use OR logic so that an alarm can be sounded from any evacuation station or push button along a corridor.',
    allowedComponents: ['battery', 'pushbutton', 'gate_or', 'buzzer', 'led'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'pushbutton', x: 280, y: 110, id: 'btn1' },
      { type: 'pushbutton', x: 280, y: 310, id: 'btn2' },
      { type: 'gate_or', x: 500, y: 210, id: 'gate1' },
      { type: 'buzzer', x: 740, y: 130, id: 'buzzer1' },
      { type: 'led', x: 740, y: 290, id: 'led1', stateProps: { color: 'red' } }
    ],
    tasks: [
      {
        id: 'wire_inputs',
        desc: 'Connect both push buttons between Battery (+) and OR Gate inputs A & B',
        done: (c, s) => {
          const gate = c.find(comp => comp.id === 'gate1');
          return !!gate && (gate.state.inputA === 1 || gate.state.inputB === 1 || gate.state.outputLevel === 1);
        }
      },
      {
        id: 'wire_alarm',
        desc: 'Connect the OR Gate Output to the Buzzer and Red LED indicator',
        done: (c, s) => {
          const bz = c.find(comp => comp.id === 'buzzer1');
          const led = c.find(comp => comp.id === 'led1');
          return !!bz && !!led && (bz.state.powered || led.state.powered);
        }
      },
      {
        id: 'trigger_alarm',
        desc: 'Press either emergency push button to activate the warning alert!',
        done: (c, s) => {
          const gate = c.find(comp => comp.id === 'gate1');
          const bz = c.find(comp => comp.id === 'buzzer1');
          const led = c.find(comp => comp.id === 'led1');
          return !!gate && gate.state.outputLevel === 1 && !!bz && bz.state.powered && !bz.state.burnt && !!led && led.state.powered && !led.state.burnt;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Buttons 1 & 2 ➔ OR Gate ➔ Buzzer & Red LED ➔ Bat (-)',
      circuitType: 'Multi-Station Emergency Evacuation Alarm',
      explanation: 'Pressing either Button 1 or Button 2 delivers Logic HIGH (1) to the OR Gate. The OR gate outputs +5V, sounding the buzzer and flashing the red emergency LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Button 1' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_a', label: 'Button 1 to OR Input A' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn2', toPin: 'pin1', label: 'Battery (+) to Button 2' },
        { fromComp: 'btn2', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_b', label: 'Button 2 to OR Input B' },
        { fromComp: 'gate1', fromPin: 'out', toComp: 'buzzer1', toPin: 'pin1', label: 'OR Output to Buzzer (+)' },
        { fromComp: 'gate1', fromPin: 'out', toComp: 'led1', toPin: 'anode', label: 'OR Output to Red LED Anode' },
        { fromComp: 'buzzer1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Buzzer Return to Battery (-)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const gate = components.find(c => c.id === 'gate1');
      const bz = components.find(c => c.id === 'buzzer1');
      const led = components.find(c => c.id === 'led1');
      const btn1 = components.find(c => c.id === 'btn1');
      const btn2 = components.find(c => c.id === 'btn2');
      return !!gate && gate.state.outputLevel === 1 &&
             !!bz && bz.state.powered && !bz.state.burnt &&
             !!led && led.state.powered && !led.state.burnt &&
             (btn1.state.pressed || btn2.state.pressed) &&
             !status.circuitFailed;
    }
  },

  {
    id: 22,
    title: 'Level 22: Automatic Street Light (NOT Gate Inverter)',
    category: 'Digital Logic',
    badge: 'Automation',
    summary: 'Create an automatic dusk-to-dawn street light using a NOT gate logic inverter! Darkness produces a LOW sensor signal, which the inverter flips to HIGH (+5V) to light the lamp or LED.',
    instructions: 'Connect Battery (+) to LDR Pin 1, and LDR Pin 2 to NOT Gate Input A. Connect the NOT Gate Output to either the Incandescent Lamp or the protective Resistor + LED, and return the other end to Battery (-). In darkness, the NOT gate turns ON the street light automatically!',
    hint: 'Bat (+) -> LDR Pin 1 -> LDR Pin 2 -> NOT Gate in_a. Gate out -> Lamp Pin 1 (or Resistor -> LED). Return to Bat (-). Toggle the LDR light/dark slider to watch the street light switch!',
    theory: 'A NOT gate (inverter) outputs the logical complement of its input (Y = ¬A). When light is bright, low LDR resistance pulls the input HIGH (1), and the inverter outputs LOW (0V). When darkness falls, the high LDR resistance lets the input drop LOW (0), causing the NOT gate to output HIGH (+5V) to illuminate the street lamp or LED!',
    allowedComponents: ['battery', 'ldr', 'gate_not', 'bulb', 'led', 'resistor'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'ldr', x: 260, y: 220, id: 'ldr1' },
      { type: 'gate_not', x: 460, y: 220, id: 'gate1' },
      { type: 'bulb', x: 680, y: 140, id: 'bulb1' },
      { type: 'resistor', x: 680, y: 300, id: 'res1', stateProps: { resistance: 330 } },
      { type: 'led', x: 840, y: 300, id: 'led1', stateProps: { color: 'green' } }
    ],
    tasks: [
      {
        id: 'connect_sensor',
        desc: 'Wire Battery (+) through the LDR photoresistor into the NOT Gate input',
        done: (c, s) => {
          const ldr = c.find(comp => comp.id === 'ldr1');
          const gate = c.find(comp => comp.id === 'gate1');
          return !!ldr && !!gate && (gate.state.inputA !== undefined);
        }
      },
      {
        id: 'connect_lamp',
        desc: 'Wire NOT Gate Output across the Street Light (Bulb or Resistor + LED) to Battery (-)',
        done: (c, s) => {
          const bulb = c.find(comp => comp.type === 'bulb');
          const led = c.find(comp => comp.type === 'led');
          const bulbOn = !!bulb && (bulb.state.powered || (s && s.activeComponents && s.activeComponents.has(bulb.id)));
          const ledOn = !!led && (led.state.powered || (s && s.activeComponents && s.activeComponents.has(led.id)));
          return bulbOn || ledOn;
        }
      },
      {
        id: 'automatic_night_lighting',
        desc: 'Verify the street light illuminates in darkness (NOT gate output HIGH)',
        done: (c, s) => {
          const gate = c.find(comp => comp.type === 'gate_not');
          const bulb = c.find(comp => comp.type === 'bulb');
          const led = c.find(comp => comp.type === 'led');
          const bulbOn = !!bulb && bulb.state.powered && !bulb.state.burnt;
          const ledOn = !!led && led.state.powered && !led.state.burnt;
          return !!gate && gate.state.outputLevel === 1 && (bulbOn || ledOn);
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ LDR ➔ NOT Gate Input | Gate Output ➔ Street Light (Bulb or Resistor+LED) ➔ Bat (-)',
      circuitType: 'Optical Logic Inverter Dusk Sensor',
      explanation: 'In darkness, the LDR has high resistance, dropping input A below 0.8V (Logic 0). The NOT gate inverts this 0 into a +5.0V Logic 1 output, turning ON the street light (bulb or LED).',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'ldr1', toPin: 'pin1', label: 'Battery (+) to LDR Pin 1' },
        { fromComp: 'ldr1', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_a', label: 'LDR to NOT Gate Input A' },
        { fromComp: 'gate1', fromPin: 'out', toComp: 'bulb1', toPin: 'pin1', label: 'NOT Gate Output to Bulb' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const gate = components.find(c => c.type === 'gate_not');
      const bulb = components.find(c => c.type === 'bulb');
      const led = components.find(c => c.type === 'led');
      const lightOn = (!!bulb && bulb.state.powered && !bulb.state.burnt) ||
                      (!!led && led.state.powered && !led.state.burnt);
      return !!gate && gate.state.outputLevel === 1 &&
             lightOn &&
             !status.circuitFailed;
    }
  },

  {
    id: 23,
    title: 'Level 23: Secret Disarm Alarm (NAND Gate)',
    category: 'Digital Logic',
    badge: 'Espionage',
    summary: 'Construct a secret disarm system! The alarm sounds continuously until BOTH security switches are turned ON to silence it.',
    instructions: 'Connect Battery (+) to Switch 1 Pin 1 and Switch 2 Pin 1. Connect Switch 1 Pin 2 to NAND Gate Input A, and Switch 2 Pin 2 to NAND Gate Input B. Connect the NAND Gate Output to the Buzzer (+) and LED Anode (+). Return the Buzzer (-) and LED Cathode (-) to Battery (-). Notice the alarm sounds in all states except when BOTH switches are ON!',
    hint: 'Bat (+) -> Switch 1 Pin 1; Switch 1 Pin 2 -> Gate in_a. Bat (+) -> Switch 2 Pin 1; Switch 2 Pin 2 -> Gate in_b. Gate out -> Buzzer (+) & LED (+). Buzzer (-) & LED (-) -> Bat (-). Turn ON both switches to silence!',
    theory: 'A NAND gate (Negated AND) outputs LOW (0) ONLY when both inputs are simultaneously HIGH (1): Y = ¬(A · B). In fail-safe alarm systems, any unauthorized state or severed line leaves the alarm active until the correct authorized dual-switch code is applied.',
    allowedComponents: ['battery', 'switch', 'gate_nand', 'buzzer', 'led'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'switch', x: 280, y: 110, id: 'sw1' },
      { type: 'switch', x: 280, y: 310, id: 'sw2' },
      { type: 'gate_nand', x: 500, y: 210, id: 'gate1' },
      { type: 'buzzer', x: 740, y: 130, id: 'buzzer1' },
      { type: 'led', x: 740, y: 290, id: 'led1', stateProps: { color: 'red' } }
    ],
    tasks: [
      {
        id: 'wire_switches',
        desc: 'Wire both switches from Battery (+) to NAND Gate inputs A & B',
        done: (c, s) => {
          const sw1 = c.find(comp => comp.id === 'sw1');
          const sw2 = c.find(comp => comp.id === 'sw2');
          return !!sw1 && !!sw2 && (sw1.state.closed || sw2.state.closed || c.some(comp => comp.type === 'gate_nand'));
        }
      },
      {
        id: 'wire_alert',
        desc: 'Wire NAND Gate Output to Buzzer and Red LED indicator',
        done: (c, s) => {
          const bz = c.find(comp => comp.id === 'buzzer1');
          const led = c.find(comp => comp.id === 'led1');
          const gate = c.find(comp => comp.id === 'gate1');
          return !!bz && !!led && (bz.state.powered || led.state.powered || (gate && gate.state.outputLevel === 0));
        }
      },
      {
        id: 'disarm_code',
        desc: 'Close both switches to verify the secret alarm silences (Output goes LOW)',
        done: (c, s) => {
          const sw1 = c.find(comp => comp.id === 'sw1');
          const sw2 = c.find(comp => comp.id === 'sw2');
          const gate = c.find(comp => comp.id === 'gate1');
          return !!sw1 && sw1.state.closed && !!sw2 && sw2.state.closed && !!gate && gate.state.outputLevel === 0;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switches ➔ NAND Gate ➔ Buzzer & LED ➔ Bat (-) | Turn ON both switches to disarm!',
      circuitType: 'Fail-Safe Dual-Key Disarm Circuit',
      explanation: 'Under NAND logic, any input of 0 maintains a HIGH (+5V) alarm output. Only when BOTH switches are turned ON (Inputs = 1, 1) does the NAND gate drop its output to 0V, silencing the buzzer and turning off the LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_a', label: 'Switch 1 to NAND Input A' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw2', toPin: 'pin1', label: 'Battery (+) to Switch 2' },
        { fromComp: 'sw2', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_b', label: 'Switch 2 to NAND Input B' },
        { fromComp: 'gate1', fromPin: 'out', toComp: 'buzzer1', toPin: 'pin1', label: 'NAND Output to Buzzer (+)' },
        { fromComp: 'gate1', fromPin: 'out', toComp: 'led1', toPin: 'anode', label: 'NAND Output to LED Anode' },
        { fromComp: 'buzzer1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Buzzer Return to Battery (-)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sw1 = components.find(c => c.id === 'sw1');
      const sw2 = components.find(c => c.id === 'sw2');
      const gate = components.find(c => c.id === 'gate1');
      const bz = components.find(c => c.id === 'buzzer1');
      const led = components.find(c => c.id === 'led1');
      return !!sw1 && !!sw2 && !!gate && !!bz && !!led &&
             (sw1.state.closed && sw2.state.closed ? gate.state.outputLevel === 0 : gate.state.outputLevel === 1) &&
             !status.circuitFailed;
    }
  },

  {
    id: 24,
    title: 'Level 24: Silent Zone Monitor (NOR Gate)',
    category: 'Digital Logic',
    badge: 'Silent Zone',
    summary: 'Create a zero-activity indicator! The output turns ON only when both input switches are in the OFF position.',
    instructions: 'Connect Battery (+) to Switch 1 Pin 1 and Switch 2 Pin 1. Connect Switch 1 Pin 2 to NOR Gate Input A, and Switch 2 Pin 2 to NOR Gate Input B. Connect NOR Gate Output to Buzzer Pin 1, and return Buzzer Pin 2 to Battery (-). The buzzer activates only when both switches are OFF!',
    hint: 'Bat (+) -> Switch 1 -> Gate in_a. Bat (+) -> Switch 2 -> Gate in_b. Gate out -> Buzzer Pin 1; Buzzer Pin 2 -> Bat (-). Leave both switches OFF to activate output!',
    theory: 'A NOR gate (Negated OR) outputs HIGH (1) ONLY when all inputs are 0: Y = ¬(A + B). It is widely used for zero-activity detection, quiescence monitoring, and constructing SR latch memory cells.',
    allowedComponents: ['battery', 'switch', 'gate_nor', 'buzzer'],
    initialComponents: [
      { type: 'battery', x: 100, y: 220, id: 'bat1' },
      { type: 'switch', x: 320, y: 120, id: 'sw1' },
      { type: 'switch', x: 320, y: 320, id: 'sw2' },
      { type: 'gate_nor', x: 540, y: 220, id: 'gate1' },
      { type: 'buzzer', x: 760, y: 220, id: 'buzzer1' }
    ],
    tasks: [
      {
        id: 'connect_inputs',
        desc: 'Connect both switches from Battery (+) to NOR Gate inputs A & B',
        done: (c, s) => {
          const sw1 = c.find(comp => comp.id === 'sw1');
          const sw2 = c.find(comp => comp.id === 'sw2');
          return !!sw1 && !!sw2 && c.some(comp => comp.type === 'gate_nor');
        }
      },
      {
        id: 'connect_output',
        desc: 'Connect NOR Gate Output to the Buzzer and return to Battery (-)',
        done: (c, s) => {
          const bz = c.find(comp => comp.id === 'buzzer1');
          return !!bz && (bz.state.powered || (s && s.activeComponents && s.activeComponents.has('buzzer1')));
        }
      },
      {
        id: 'verify_nor_logic',
        desc: 'Confirm buzzer sounds when both switches are OFF (0, 0), and silences when either is turned ON',
        done: (c, s) => {
          const sw1 = c.find(comp => comp.id === 'sw1');
          const sw2 = c.find(comp => comp.id === 'sw2');
          const gate = c.find(comp => comp.id === 'gate1');
          const bz = c.find(comp => comp.id === 'buzzer1');
          return !!sw1 && !sw1.state.closed && !!sw2 && !sw2.state.closed && !!gate && gate.state.outputLevel === 1 && !!bz && bz.state.powered && !bz.state.burnt;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switches ➔ NOR Gate ➔ Buzzer ➔ Bat (-) | Output active only when both switches are OFF',
      circuitType: 'Quiescence & Zero-Activity Detector',
      explanation: 'When both switches are OFF, inputs A and B are 0. The NOR gate evaluates ¬(0 + 0) = 1, driving +5V into the buzzer. Turning ON either switch inputs a 1, driving output to 0V and silencing the buzzer.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_a', label: 'Switch 1 to NOR Input A' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw2', toPin: 'pin1', label: 'Battery (+) to Switch 2' },
        { fromComp: 'sw2', fromPin: 'pin2', toComp: 'gate1', toPin: 'in_b', label: 'Switch 2 to NOR Input B' },
        { fromComp: 'gate1', fromPin: 'out', toComp: 'buzzer1', toPin: 'pin1', label: 'NOR Output to Buzzer (+)' },
        { fromComp: 'buzzer1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Buzzer Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sw1 = components.find(c => c.id === 'sw1');
      const sw2 = components.find(c => c.id === 'sw2');
      const gate = components.find(c => c.id === 'gate1');
      const bz = components.find(c => c.id === 'buzzer1');
      return !!sw1 && !sw1.state.closed && !!sw2 && !sw2.state.closed &&
             !!gate && gate.state.outputLevel === 1 &&
             !!bz && bz.state.powered && !bz.state.burnt &&
             !status.circuitFailed;
    }
  },

  {
    id: 25,
    title: 'Level 25: Mission 1 – AND Gate: Two-Key Security Lock (Discrete NPN)',
    category: 'Transistor Logic',
    badge: 'RTL Engineer',
    summary: 'Build a digital AND gate from raw silicon components! Connect two BC547 NPN transistors in series so the LED lights only when BOTH push buttons are pressed.',
    instructions: 'Form a series transistor channel: Battery (+) to 330Ω Resistor to LED Anode (+). Connect LED Cathode (-) to Transistor 1 Collector (c). Connect Transistor 1 Emitter (e) to Transistor 2 Collector (c), and Transistor 2 Emitter (e) to Battery (-). Wire Push Button 1 through a 1kΩ Resistor to Transistor 1 Base (b), and Push Button 2 through a 1kΩ Resistor to Transistor 2 Base (b). Press BOTH buttons to open the treasure lock!',
    hint: 'Load: Bat (+) -> 330Ω -> LED (+) -> Q1 Collector (c) -> Q1 Emitter (e) -> Q2 Collector (c) -> Q2 Emitter (e) -> Bat (-). Input 1: Bat (+) -> Button 1 -> 1kΩ -> Q1 Base (b). Input 2: Bat (+) -> Button 2 -> 1kΩ -> Q2 Base (b).',
    theory: 'Inside integrated circuits, logic gates are constructed from interconnected transistors. When two NPN transistors are connected in series, both must be turned ON by forward base current to complete the conductive channel to Ground. If either transistor is OFF, the path is broken.',
    allowedComponents: ['battery', 'npn', 'resistor', 'led', 'pushbutton'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'resistor', x: 250, y: 70, id: 'r_load', stateProps: { resistance: 330 } },
      { type: 'led', x: 420, y: 70, id: 'led1', stateProps: { color: 'green' } },
      { type: 'pushbutton', x: 250, y: 190, id: 'btn1' },
      { type: 'resistor', x: 400, y: 190, id: 'r_b1', stateProps: { resistance: 1000 } },
      { type: 'npn', x: 570, y: 150, id: 'npn1' },
      { type: 'pushbutton', x: 250, y: 330, id: 'btn2' },
      { type: 'resistor', x: 400, y: 330, id: 'r_b2', stateProps: { resistance: 1000 } },
      { type: 'npn', x: 570, y: 290, id: 'npn2' }
    ],
    tasks: [
      {
        id: 'series_channel',
        desc: 'Connect the 330Ω resistor, LED, and two NPN transistors in series to Battery (-)',
        done: (c, s) => {
          const npn1 = c.find(comp => comp.id === 'npn1');
          const npn2 = c.find(comp => comp.id === 'npn2');
          const led = c.find(comp => comp.id === 'led1');
          return !!npn1 && !!npn2 && !!led && (led.state.powered || npn1.state.conducting || npn2.state.conducting);
        }
      },
      {
        id: 'base_triggers',
        desc: 'Wire Push Button 1 and Button 2 through 1kΩ resistors to the transistor bases',
        done: (c, s) => {
          const btn1 = c.find(comp => comp.id === 'btn1');
          const btn2 = c.find(comp => comp.id === 'btn2');
          return !!btn1 && !!btn2 && (btn1.state.pressed || btn2.state.pressed || (c.some(comp => comp.id === 'npn1' && comp.state.conducting)));
        }
      },
      {
        id: 'dual_key_glow',
        desc: 'Press both push buttons simultaneously to conduct current and illuminate the LED!',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          const npn1 = c.find(comp => comp.id === 'npn1');
          const npn2 = c.find(comp => comp.id === 'npn2');
          return !!led && led.state.powered && !led.state.burnt && !!npn1 && npn1.state.conducting && !!npn2 && npn2.state.conducting;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ 330Ω ➔ LED (+) ➔ Q1 (c/e) ➔ Q2 (c/e) ➔ Bat (-) | Buttons ➔ 1kΩ ➔ Bases',
      circuitType: 'Discrete Transistor RTL Series AND Gate',
      explanation: 'Transistors Q1 and Q2 form a series channel in the LED cathode circuit. Pressing both buttons injects base current through the 1kΩ resistors, saturating both transistors and illuminating the LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'r_load', toPin: 'pin1', label: 'Battery (+) to 330Ω Resistor' },
        { fromComp: 'r_load', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'npn1', toPin: 'c', label: 'LED Cathode to Q1 Collector' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'npn2', toPin: 'c', label: 'Q1 Emitter to Q2 Collector' },
        { fromComp: 'npn2', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'Q2 Emitter to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Button 1' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'r_b1', toPin: 'pin1', label: 'Button 1 to 1kΩ Resistor' },
        { fromComp: 'r_b1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Resistor to Q1 Base' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn2', toPin: 'pin1', label: 'Battery (+) to Button 2' },
        { fromComp: 'btn2', fromPin: 'pin2', toComp: 'r_b2', toPin: 'pin1', label: 'Button 2 to 1kΩ Resistor' },
        { fromComp: 'r_b2', fromPin: 'pin2', toComp: 'npn2', toPin: 'b', label: 'Resistor to Q2 Base' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.id === 'led1');
      const npn1 = components.find(c => c.id === 'npn1');
      const npn2 = components.find(c => c.id === 'npn2');
      const btn1 = components.find(c => c.id === 'btn1');
      const btn2 = components.find(c => c.id === 'btn2');
      return !!led && led.state.powered && !led.state.burnt &&
             !!npn1 && npn1.state.conducting &&
             !!npn2 && npn2.state.conducting &&
             btn1.state.pressed && btn2.state.pressed &&
             !status.circuitFailed;
    }
  },

  {
    id: 26,
    title: 'Level 26: Mission 2 – OR Gate: Emergency Exit (Discrete NPN)',
    category: 'Transistor Logic',
    badge: 'RTL Engineer',
    summary: 'Construct a discrete OR gate using two NPN transistors! Connect their collectors and emitters in parallel so EITHER push button activates the emergency light.',
    instructions: 'Connect Battery (+) through the 330Ω Resistor into the LED Anode (+). Connect LED Cathode (-) to BOTH Transistor 1 Collector (c) and Transistor 2 Collector (c). Connect BOTH Emitters (e) back to Battery (-). Wire Push Button 1 through a 1kΩ Resistor to Q1 Base, and Push Button 2 through a 1kΩ Resistor to Q2 Base. Press either button to turn ON the emergency light!',
    hint: 'Load: Bat (+) -> 330Ω -> LED (+). LED (-) branches to Q1 Collector (c) AND Q2 Collector (c). Q1 Emitter (e) and Q2 Emitter (e) return to Bat (-). Button 1 -> 1kΩ -> Q1 Base; Button 2 -> 1kΩ -> Q2 Base.',
    theory: 'Connecting transistors in parallel creates an OR function. If either transistor receives forward base current, its collector-emitter channel conducts, providing a path for current to flow from the supply through the LED to Ground.',
    allowedComponents: ['battery', 'npn', 'resistor', 'led', 'pushbutton'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'resistor', x: 250, y: 70, id: 'r_load', stateProps: { resistance: 330 } },
      { type: 'led', x: 440, y: 70, id: 'led1', stateProps: { color: 'red' } },
      { type: 'pushbutton', x: 250, y: 190, id: 'btn1' },
      { type: 'resistor', x: 400, y: 190, id: 'r_b1', stateProps: { resistance: 1000 } },
      { type: 'npn', x: 570, y: 150, id: 'npn1' },
      { type: 'pushbutton', x: 250, y: 330, id: 'btn2' },
      { type: 'resistor', x: 400, y: 330, id: 'r_b2', stateProps: { resistance: 1000 } },
      { type: 'npn', x: 570, y: 290, id: 'npn2' }
    ],
    tasks: [
      {
        id: 'parallel_channel',
        desc: 'Wire the 330Ω resistor and LED to both transistor collectors in parallel',
        done: (c, s) => {
          const npn1 = c.find(comp => comp.id === 'npn1');
          const npn2 = c.find(comp => comp.id === 'npn2');
          return !!npn1 && !!npn2 && (npn1.state.conducting || npn2.state.conducting || c.some(comp => comp.id === 'led1' && comp.state.powered));
        }
      },
      {
        id: 'base_controls',
        desc: 'Connect both push buttons through 1kΩ resistors to the respective transistor bases',
        done: (c, s) => {
          const btn1 = c.find(comp => comp.id === 'btn1');
          const btn2 = c.find(comp => comp.id === 'btn2');
          return !!btn1 && !!btn2 && (btn1.state.pressed || btn2.state.pressed);
        }
      },
      {
        id: 'emergency_trigger',
        desc: 'Press either button to conduct current and illuminate the emergency light!',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          const npn1 = c.find(comp => comp.id === 'npn1');
          const npn2 = c.find(comp => comp.id === 'npn2');
          return !!led && led.state.powered && !led.state.burnt && (npn1.state.conducting || npn2.state.conducting);
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ 330Ω ➔ LED (+) ➔ Q1 (c) & Q2 (c) | Emitters ➔ Bat (-) | Buttons ➔ 1kΩ ➔ Bases',
      circuitType: 'Discrete Transistor RTL Parallel OR Gate',
      explanation: 'Transistors Q1 and Q2 are placed in parallel across the LED cathode. Triggering either button forward biases that transistor, pulling the LED cathode to ground and lighting the emergency exit LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'r_load', toPin: 'pin1', label: 'Battery (+) to 330Ω Resistor' },
        { fromComp: 'r_load', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'npn1', toPin: 'c', label: 'LED Cathode to Q1 Collector' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'npn2', toPin: 'c', label: 'LED Cathode to Q2 Collector' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'Q1 Emitter to Battery (-)' },
        { fromComp: 'npn2', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'Q2 Emitter to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Button 1' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'r_b1', toPin: 'pin1', label: 'Button 1 to 1kΩ Resistor' },
        { fromComp: 'r_b1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Resistor to Q1 Base' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn2', toPin: 'pin1', label: 'Battery (+) to Button 2' },
        { fromComp: 'btn2', fromPin: 'pin2', toComp: 'r_b2', toPin: 'pin1', label: 'Button 2 to 1kΩ Resistor' },
        { fromComp: 'r_b2', fromPin: 'pin2', toComp: 'npn2', toPin: 'b', label: 'Resistor to Q2 Base' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.id === 'led1');
      const npn1 = components.find(c => c.id === 'npn1');
      const npn2 = components.find(c => c.id === 'npn2');
      const btn1 = components.find(c => c.id === 'btn1');
      const btn2 = components.find(c => c.id === 'btn2');
      return !!led && led.state.powered && !led.state.burnt &&
             (npn1.state.conducting || npn2.state.conducting) &&
             (btn1.state.pressed || btn2.state.pressed) &&
             !status.circuitFailed;
    }
  },

  {
    id: 27,
    title: 'Level 27: Mission 3 – NOT Gate: Automatic Night Lamp',
    category: 'Transistor Logic',
    badge: 'NOT Gate',
    summary: 'Story: The lamp should glow when the control switch is OFF and turn OFF when the switch is ON. Task: Build a NOT gate using one NPN transistor.',
    story: 'The lamp should glow when the control switch is OFF and turn OFF when the switch is ON.',
    taskDesc: 'Build a NOT gate using one NPN transistor.',
    challenge: 'Make the LED behave opposite to the input switch.',
    instructions: 'Story: The lamp should glow when the control switch is OFF and turn OFF when the switch is ON.\nTask: Build a NOT gate using one NPN transistor (BC547).\n\nComponents Provided:\n• BC547 NPN Transistor – 1\n• 10kΩ Resistor – 1\n• 1kΩ Resistor – 1\n• LED – 1\n• 330Ω Resistor – 1\n• Push Button – 1\n• 9V Battery – 1\n\nChallenge: Make the LED behave opposite to the input switch (glows when released, turns OFF when pressed).',
    hint: 'Pull-up & Lamp: Battery (+) ➔ 1kΩ Resistor ➔ Transistor Collector (c) AND 330Ω Resistor + LED Anode. Return LED Cathode (-) and Transistor Emitter (e) to Battery (-).\nControl Input: Wire Push Button from Battery (+) through the 10kΩ Resistor into Transistor Base (b).',
    theory: 'In an RTL (Resistor-Transistor Logic) Inverter (NOT Gate), the output is taken from the collector. When the switch is OFF, no base current flows, the transistor is in CUTOFF, and current flows from the 1kΩ pull-up through the 330Ω resistor and LED to ground (Output HIGH). When the switch is ON, the transistor turns ON and SATURATES, pulling the collector down to ~0.2V, which shunts current away and turns the LED OFF (Output LOW)!',
    allowedComponents: ['battery', 'npn', 'resistor', 'led', 'pushbutton'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'resistor', x: 260, y: 80, id: 'r_pull', stateProps: { resistance: 1000 } },
      { type: 'resistor', x: 440, y: 80, id: 'r_lim', stateProps: { resistance: 330 } },
      { type: 'led', x: 620, y: 80, id: 'led1', stateProps: { color: 'yellow' } },
      { type: 'pushbutton', x: 260, y: 260, id: 'btn1' },
      { type: 'resistor', x: 440, y: 260, id: 'r_base', stateProps: { resistance: 10000 } },
      { type: 'npn', x: 620, y: 220, id: 'npn1' }
    ],
    tasks: [
      {
        id: 'pullup_and_lamp',
        desc: 'Connect 1kΩ pull-up, 330Ω resistor, and LED so the lamp glows when the switch is OFF',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          return !!led && (led.state.powered || (s && s.activeComponents && s.activeComponents.has('led1')) || led.state._wasLit);
        }
      },
      {
        id: 'inverter_control',
        desc: 'Wire Push Button through 10kΩ resistor to BC547 Base (b), Collector (c) to pull-up junction, Emitter (e) to Ground',
        done: (c, s) => {
          const npn = c.find(comp => comp.id === 'npn1');
          return !!npn && (npn.state.conducting || (npn.state.vbe !== undefined && Math.abs(npn.state.vbe) > 0.05));
        }
      },
      {
        id: 'inverted_logic',
        desc: 'Challenge: Verify the LED behaves opposite to the input switch (ON when released, OFF when pressed)!',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          const btn = c.find(comp => comp.id === 'btn1');
          if (!led || !btn || led.state.burnt) return false;
          if (led.state.powered) led.state._wasLit = true;
          return btn.state.pressed ? !led.state.powered : led.state.powered;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ 1kΩ Pull-Up ➔ Collector & 330Ω + LED Branch | Button ➔ 10kΩ ➔ Base | Emitter ➔ Ground',
      circuitType: 'Resistor-Transistor Logic (RTL) Inverter (NOT Gate)',
      explanation: 'When the push button is open, the BC547 transistor is in cutoff, and current from the 1kΩ pull-up resistor flows through the 330Ω resistor and LED to illuminate it. Pressing the button forward-biases the transistor into saturation, pulling the collector down to Ground (~0.2V), which turns the LED OFF.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'r_pull', toPin: 'pin1', label: 'Battery (+) to 1kΩ Pull-Up' },
        { fromComp: 'r_pull', fromPin: 'pin2', toComp: 'npn1', toPin: 'c', label: 'Pull-Up to Q1 Collector' },
        { fromComp: 'npn1', fromPin: 'c', toComp: 'r_lim', toPin: 'pin1', label: 'Q1 Collector to 330Ω Resistor' },
        { fromComp: 'r_lim', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode to Battery (-)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'Q1 Emitter to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Push Button' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'r_base', toPin: 'pin1', label: 'Button to 10kΩ Base Resistor' },
        { fromComp: 'r_base', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Resistor to Q1 Base' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.id === 'led1');
      const btn = components.find(c => c.id === 'btn1');
      return !!led && !led.state.burnt &&
             (btn.state.pressed ? !led.state.powered : led.state.powered) &&
             !status.circuitFailed;
    }
  },

  {
    id: 28,
    title: 'Level 28: Mission 4 – NAND Gate: Safety Alarm',
    category: 'Transistor Logic',
    badge: 'NAND Gate',
    summary: 'Story: A safety alarm should turn OFF only when both safety switches are activated. Task: Build a NAND gate using two NPN transistors.',
    story: 'A safety alarm should turn OFF only when both safety switches are activated.',
    taskDesc: 'Build a NAND gate using two NPN transistors.',
    challenge: 'Make the LED turn OFF only when both switches are ON.',
    instructions: 'Story: A safety alarm should turn OFF only when both safety switches are activated.\nTask: Build a NAND gate using two NPN transistors (BC547).\n\nComponents Provided:\n• BC547 NPN Transistors – 2\n• 1kΩ Resistors – 2\n• 10kΩ Resistors – 2\n• LED – 1\n• 330Ω Resistor – 1\n• Push Buttons – 2\n• 9V Battery – 1\n\nChallenge: Make the LED turn OFF only when both switches are ON.',
    hint: 'Pull-up & Alarm: Battery (+) ➔ 1kΩ Pull-Up Resistor ➔ Q1 Collector (c) AND 330Ω Resistor + LED Anode. Return LED Cathode to Battery (-).\nSeries Sink: Connect Q1 Emitter (e) to Q2 Collector (c), and Q2 Emitter (e) to Battery (-).\nInputs: Battery (+) ➔ Button 1 ➔ 10kΩ ➔ Q1 Base (b); Battery (+) ➔ Button 2 ➔ 10kΩ ➔ Q2 Base (b).',
    theory: 'In a discrete RTL NAND gate, two NPN transistors are placed in series between the output node and Ground. If either switch is open, the ground path is broken, allowing the 1kΩ pull-up to power the LED (Alarm ON). Only when BOTH switches are pressed do both transistors conduct simultaneously, creating an unbroken path to Ground that pulls the output low and turns the LED OFF!',
    allowedComponents: ['battery', 'npn', 'resistor', 'led', 'pushbutton'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'resistor', x: 240, y: 60, id: 'r_pull', stateProps: { resistance: 1000 } },
      { type: 'resistor', x: 410, y: 60, id: 'r_lim', stateProps: { resistance: 330 } },
      { type: 'led', x: 580, y: 60, id: 'led1', stateProps: { color: 'red' } },
      { type: 'resistor', x: 740, y: 60, id: 'r_pull2', stateProps: { resistance: 1000 } },
      { type: 'pushbutton', x: 240, y: 190, id: 'btn1' },
      { type: 'resistor', x: 390, y: 190, id: 'r_b1', stateProps: { resistance: 10000 } },
      { type: 'npn', x: 560, y: 190, id: 'npn1' },
      { type: 'pushbutton', x: 240, y: 320, id: 'btn2' },
      { type: 'resistor', x: 390, y: 320, id: 'r_b2', stateProps: { resistance: 10000 } },
      { type: 'npn', x: 560, y: 320, id: 'npn2' }
    ],
    tasks: [
      {
        id: 'pullup_and_alarm',
        desc: 'Connect 1kΩ pull-up resistor and 330Ω + LED so the alarm powers ON in normal state',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          return !!led && (led.state.powered || (s && s.activeComponents && s.activeComponents.has('led1')) || led.state._wasLit);
        }
      },
      {
        id: 'series_pulldown',
        desc: 'Connect Transistor 1 and Transistor 2 in series (Q1 Emitter ➔ Q2 Collector) to Ground',
        done: (c, s) => {
          const npn1 = c.find(comp => comp.id === 'npn1');
          const npn2 = c.find(comp => comp.id === 'npn2');
          return !!npn1 && !!npn2 && (npn1.state.conducting || npn2.state.conducting || (npn1.state.vbe !== undefined && npn2.state.vbe !== undefined));
        }
      },
      {
        id: 'nand_safety_truth',
        desc: 'Challenge: Verify the alarm turns OFF only when both safety switches are ON!',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          const btn1 = c.find(comp => comp.id === 'btn1');
          const btn2 = c.find(comp => comp.id === 'btn2');
          if (!led || !btn1 || !btn2 || led.state.burnt) return false;
          if (led.state.powered) led.state._wasLit = true;
          return (btn1.state.pressed && btn2.state.pressed) ? !led.state.powered : led.state.powered;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ 1kΩ Pull-Up ➔ LED (+) | Q1 Emitter ➔ Q2 Collector in Series to Ground | Buttons ➔ 10kΩ ➔ Bases',
      circuitType: 'Discrete Transistor RTL Series NAND Gate',
      explanation: 'With Q1 and Q2 in series to ground, the pull-down path is open unless both buttons are pressed. Thus, the LED stays illuminated until both buttons conduct simultaneously, sinking the pull-up current to Ground and turning the LED OFF.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'r_pull', toPin: 'pin1', label: 'Battery (+) to 1kΩ Pull-Up' },
        { fromComp: 'r_pull', fromPin: 'pin2', toComp: 'npn1', toPin: 'c', label: 'Pull-Up to Q1 Collector' },
        { fromComp: 'npn1', fromPin: 'c', toComp: 'r_lim', toPin: 'pin1', label: 'Q1 Collector to 330Ω Resistor' },
        { fromComp: 'r_lim', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode to Battery (-)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'npn2', toPin: 'c', label: 'Q1 Emitter to Q2 Collector' },
        { fromComp: 'npn2', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'Q2 Emitter to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Button 1' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'r_b1', toPin: 'pin1', label: 'Button 1 to 10kΩ Resistor' },
        { fromComp: 'r_b1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Resistor to Q1 Base' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn2', toPin: 'pin1', label: 'Battery (+) to Button 2' },
        { fromComp: 'btn2', fromPin: 'pin2', toComp: 'r_b2', toPin: 'pin1', label: 'Button 2 to 10kΩ Resistor' },
        { fromComp: 'r_b2', fromPin: 'pin2', toComp: 'npn2', toPin: 'b', label: 'Resistor to Q2 Base' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.id === 'led1');
      const btn1 = components.find(c => c.id === 'btn1');
      const btn2 = components.find(c => c.id === 'btn2');
      return !!led && !led.state.burnt &&
             (btn1.state.pressed && btn2.state.pressed ? !led.state.powered : led.state.powered) &&
             !status.circuitFailed;
    }
  },

  {
    id: 29,
    title: 'Level 29: Mission 5 – NOR Gate: Silent Security Room',
    category: 'Transistor Logic',
    badge: 'NOR Gate',
    summary: 'Story: A secret room indicator should turn ON only when both sensors are inactive. Task: Build a NOR gate using two NPN transistors.',
    story: 'A secret room indicator should turn ON only when both sensors are inactive.',
    taskDesc: 'Build a NOR gate using two NPN transistors.',
    challenge: 'Make the output turn ON only when both input switches are OFF.',
    instructions: 'Story: A secret room indicator should turn ON only when both sensors are inactive.\nTask: Build a NOR gate using two NPN transistors (BC547).\n\nComponents Provided:\n• BC547 NPN Transistors – 2\n• 1kΩ Resistors – 2\n• 10kΩ Resistors – 2\n• LED – 1\n• 330Ω Resistor – 1\n• Push Buttons – 2\n• 9V Battery – 1\n\nChallenge: Make the LED turn ON only when both switches are OFF (and turn OFF if either switch is pressed).',
    hint: 'Pull-up & Indicator: Battery (+) ➔ 1kΩ Pull-Up Resistor ➔ BOTH Q1 and Q2 Collectors (c) in parallel AND 330Ω Resistor + LED Anode. Return LED Cathode to Ground (-).\nParallel Sinks: Connect both Q1 Emitter (e) and Q2 Emitter (e) to Battery (-).\nInputs: Battery (+) ➔ Button 1 ➔ 10kΩ ➔ Q1 Base (b); Battery (+) ➔ Button 2 ➔ 10kΩ ➔ Q2 Base (b).',
    theory: 'In a discrete RTL NOR gate, two NPN transistors are placed in parallel under a shared pull-up resistor. If either switch is activated, that transistor turns ON and shunts the pull-up current directly to Ground (~0.2V), extinguishing the LED. The indicator glows ONLY when both sensors are quiet/inactive (OFF)!',
    allowedComponents: ['battery', 'npn', 'resistor', 'led', 'pushbutton'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'resistor', x: 240, y: 60, id: 'r_pull', stateProps: { resistance: 1000 } },
      { type: 'resistor', x: 410, y: 60, id: 'r_lim', stateProps: { resistance: 330 } },
      { type: 'led', x: 580, y: 60, id: 'led1', stateProps: { color: 'blue' } },
      { type: 'resistor', x: 740, y: 60, id: 'r_pull2', stateProps: { resistance: 1000 } },
      { type: 'pushbutton', x: 240, y: 190, id: 'btn1' },
      { type: 'resistor', x: 390, y: 190, id: 'r_b1', stateProps: { resistance: 10000 } },
      { type: 'npn', x: 560, y: 190, id: 'npn1' },
      { type: 'pushbutton', x: 240, y: 320, id: 'btn2' },
      { type: 'resistor', x: 390, y: 320, id: 'r_b2', stateProps: { resistance: 10000 } },
      { type: 'npn', x: 560, y: 320, id: 'npn2' }
    ],
    tasks: [
      {
        id: 'pullup_and_indicator',
        desc: 'Connect 1kΩ pull-up resistor and 330Ω + LED so the indicator glows when both switches are OFF',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          return !!led && (led.state.powered || (s && s.activeComponents && s.activeComponents.has('led1')) || led.state._wasLit);
        }
      },
      {
        id: 'parallel_pulldown',
        desc: 'Connect both transistor collectors in parallel to the pull-up junction and emitters to Ground',
        done: (c, s) => {
          const npn1 = c.find(comp => comp.id === 'npn1');
          const npn2 = c.find(comp => comp.id === 'npn2');
          return !!npn1 && !!npn2 && (npn1.state.conducting || npn2.state.conducting || (npn1.state.vbe !== undefined && npn2.state.vbe !== undefined));
        }
      },
      {
        id: 'nor_quiet_condition',
        desc: 'Challenge: Verify the LED turns ON only when both switches are OFF (and OFF if either is pressed)!',
        done: (c, s) => {
          const led = c.find(comp => comp.id === 'led1');
          const btn1 = c.find(comp => comp.id === 'btn1');
          const btn2 = c.find(comp => comp.id === 'btn2');
          if (!led || !btn1 || !btn2 || led.state.burnt) return false;
          if (led.state.powered) led.state._wasLit = true;
          return (!btn1.state.pressed && !btn2.state.pressed) ? led.state.powered : !led.state.powered;
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ 1kΩ Pull-Up ➔ LED (+) | Q1 & Q2 in Parallel to Ground | Buttons ➔ 10kΩ ➔ Bases',
      circuitType: 'Discrete Transistor RTL Parallel NOR Gate',
      explanation: 'When both push buttons are released, both transistors are in cutoff, allowing pull-up current to illuminate the LED. Pressing either button turns ON that transistor, pulling the collector to Ground and turning the LED OFF.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'r_pull', toPin: 'pin1', label: 'Battery (+) to 1kΩ Pull-Up' },
        { fromComp: 'r_pull', fromPin: 'pin2', toComp: 'npn1', toPin: 'c', label: 'Pull-Up to Q1 Collector' },
        { fromComp: 'r_pull', fromPin: 'pin2', toComp: 'npn2', toPin: 'c', label: 'Pull-Up to Q2 Collector' },
        { fromComp: 'npn1', fromPin: 'c', toComp: 'r_lim', toPin: 'pin1', label: 'Collector Node to 330Ω Resistor' },
        { fromComp: 'r_lim', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode to Battery (-)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'Q1 Emitter to Battery (-)' },
        { fromComp: 'npn2', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'Q2 Emitter to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Button 1' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'r_b1', toPin: 'pin1', label: 'Button 1 to 10kΩ Resistor' },
        { fromComp: 'r_b1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Resistor to Q1 Base' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn2', toPin: 'pin1', label: 'Battery (+) to Button 2' },
        { fromComp: 'btn2', fromPin: 'pin2', toComp: 'r_b2', toPin: 'pin1', label: 'Button 2 to 10kΩ Resistor' },
        { fromComp: 'r_b2', fromPin: 'pin2', toComp: 'npn2', toPin: 'b', label: 'Resistor to Q2 Base' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.id === 'led1');
      const btn1 = components.find(c => c.id === 'btn1');
      const btn2 = components.find(c => c.id === 'btn2');
      return !!led && !led.state.burnt &&
             ((!btn1.state.pressed && !btn2.state.pressed) ? led.state.powered : !led.state.powered) &&
             !status.circuitFailed;
    }
  },

  {
    id: 30,
    title: 'Level 30: Emergency Vehicle Controller (OR Gate + NOT Gate)',
    category: 'Combined Logic',
    badge: 'Logic Designer',
    summary: 'Combine an OR gate and a NOT gate to build an emergency standby vehicle light! The light glows only when neither emergency switch is active.',
    instructions: 'Connect Battery (+) to Push Button 1 and Push Button 2. Connect Button 1 to OR Gate Input A, and Button 2 to OR Gate Input B. Connect the OR Gate Output to the NOT Gate Input. Connect the NOT Gate Output to the LED Anode (+), and return LED Cathode (-) to Battery (-). The standby light shines when neither switch is pressed!',
    hint: 'Bat (+) -> Button 1 -> OR in_a; Bat (+) -> Button 2 -> OR in_b. OR out -> NOT in_a. NOT out -> LED Anode (+); LED Cathode (-) -> Bat (-).',
    theory: 'Chaining an OR gate into a NOT gate realizes the compound NOR function: Y = ¬(A + B). In vehicle safety systems, a standby beacon remains illuminated to confirm readiness, but extinguishes or hands off to sirens the moment any emergency input is activated.',
    allowedComponents: ['battery', 'pushbutton', 'gate_or', 'gate_not', 'led'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'pushbutton', x: 240, y: 120, id: 'btn1' },
      { type: 'pushbutton', x: 240, y: 320, id: 'btn2' },
      { type: 'gate_or', x: 440, y: 220, id: 'gate_or1' },
      { type: 'gate_not', x: 620, y: 220, id: 'gate_not1' },
      { type: 'led', x: 790, y: 220, id: 'led1', stateProps: { color: 'yellow' } }
    ],
    tasks: [
      {
        id: 'connect_or_inputs',
        desc: 'Connect both buttons to OR Gate inputs A & B',
        done: (c, s) => {
          const orGate = c.find(comp => comp.id === 'gate_or1');
          return !!orGate && (orGate.state.inputA !== undefined);
        }
      },
      {
        id: 'chain_not_inverter',
        desc: 'Chain the OR Gate Output into the NOT Gate Input',
        done: (c, s) => {
          const notGate = c.find(comp => comp.id === 'gate_not1');
          return !!notGate && (notGate.state.inputA !== undefined);
        }
      },
      {
        id: 'drive_standby_led',
        desc: 'Connect NOT Gate Output across the LED to Battery (-) and verify NOR truth behavior!',
        done: (c, s) => {
          const notGate = c.find(comp => comp.id === 'gate_not1');
          const led = c.find(comp => comp.id === 'led1');
          const btn1 = c.find(comp => comp.id === 'btn1');
          const btn2 = c.find(comp => comp.id === 'btn2');
          return !!notGate && !!led && !led.state.burnt && ((!btn1.state.pressed && !btn2.state.pressed) ? (notGate.state.outputLevel === 1 && led.state.powered) : (!led.state.powered));
        }
      }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Buttons ➔ OR Gate ➔ NOT Gate ➔ LED ➔ Bat (-)',
      circuitType: 'Cascaded Combinational Logic (OR + NOT = NOR)',
      explanation: 'Push buttons feed into the OR Gate. When both are released (0, 0), the OR gate outputs 0. The NOT gate inverts this 0 into a +5.0V Logic 1, illuminating the vehicle standby LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Button 1' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'gate_or1', toPin: 'in_a', label: 'Button 1 to OR Input A' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn2', toPin: 'pin1', label: 'Battery (+) to Button 2' },
        { fromComp: 'btn2', fromPin: 'pin2', toComp: 'gate_or1', toPin: 'in_b', label: 'Button 2 to OR Input B' },
        { fromComp: 'gate_or1', fromPin: 'out', toComp: 'gate_not1', toPin: 'in_a', label: 'OR Output to NOT Input A' },
        { fromComp: 'gate_not1', fromPin: 'out', toComp: 'led1', toPin: 'anode', label: 'NOT Output to LED Anode' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const notGate = components.find(c => c.id === 'gate_not1');
      const led = components.find(c => c.id === 'led1');
      const btn1 = components.find(c => c.id === 'btn1');
      const btn2 = components.find(c => c.id === 'btn2');
      return !!notGate && !!led && !led.state.burnt &&
             ((!btn1.state.pressed && !btn2.state.pressed) ? (notGate.state.outputLevel === 1 && led.state.powered) : (!led.state.powered)) &&
             !status.circuitFailed;
    }
  },

  {
    id: 31,
    title: 'Level 31: Automatic Water Pump (OR Gate + AND Gate)',
    category: 'Combined Logic',
    badge: 'System Architect',
    summary: 'Design an automated water pumping controller! The pump starts when either low-level sensor detects water shortage, but ONLY if the main safety switch is ON.',
    instructions: 'Connect Battery (+) to Sensor 1 (Button 1), Sensor 2 (Button 2), and the Safety Switch. Wire Sensor 1 to OR Gate Input A, and Sensor 2 to OR Gate Input B. Connect the OR Gate Output to AND Gate Input A. Wire the Safety Switch to AND Gate Input B. Finally, connect the AND Gate Output to the DC Motor (Water Pump) and return Motor (-) to Battery (-). Test with the safety switch ON and either sensor triggered!',
    hint: 'Sensors: Bat (+) -> Button 1 -> OR in_a; Bat (+) -> Button 2 -> OR in_b. Gate chain: OR out -> AND in_a. Safety: Bat (+) -> Switch -> AND in_b. Load: AND out -> Motor (+); Motor (-) -> Bat (-).',
    theory: 'Compound Boolean logic: Pump = (Sensor 1 + Sensor 2) · Safety Switch. In municipal and industrial automation, primary activation conditions (either low-water sensor triggering) must pass through master safety interlocks before high-power machinery is allowed to run.',
    allowedComponents: ['battery', 'pushbutton', 'switch', 'gate_or', 'gate_and', 'motor'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'pushbutton', x: 230, y: 100, id: 'btn1' },
      { type: 'pushbutton', x: 230, y: 220, id: 'btn2' },
      { type: 'switch', x: 230, y: 350, id: 'sw_safe' },
      { type: 'gate_or', x: 440, y: 160, id: 'gate_or1' },
      { type: 'gate_and', x: 620, y: 240, id: 'gate_and1' },
      { type: 'motor', x: 800, y: 240, id: 'motor1' }
    ],
    tasks: [
      {
        id: 'connect_level_sensors',
        desc: 'Wire both level sensor buttons to OR Gate inputs A & B',
        done: (c, s) => {
          const orGate = c.find(comp => comp.id === 'gate_or1');
          return !!orGate && (orGate.state.inputA === 1 || orGate.state.inputB === 1);
        }
      },
      {
        id: 'combine_with_safety',
        desc: 'Chain OR Gate Output to AND Gate Input A, and Safety Switch to AND Gate Input B',
        done: (c, s) => {
          const andGate = c.find(comp => comp.id === 'gate_and1');
          return !!andGate && (andGate.state.inputA !== undefined);
        }
      },
      {
        id: 'operate_water_pump',
        desc: 'Turn Safety Switch ON and press either sensor button to start the water pump motor!',
        done: (c, s) => {
          const andGate = c.find(comp => comp.id === 'gate_and1');
          const motor = c.find(comp => comp.id === 'motor1');
          const sw = c.find(comp => comp.id === 'sw_safe');
          const btn1 = c.find(comp => comp.id === 'btn1');
          const btn2 = c.find(comp => comp.id === 'btn2');
          return !!andGate && andGate.state.outputLevel === 1 && !!motor && motor.state.powered && !motor.state.burnt && !!sw && sw.state.closed && (btn1.state.pressed || btn2.state.pressed);
        }
      }
    ],
    referenceSolution: {
      summary: 'Sensors ➔ OR Gate ➔ AND Gate (Input A) | Safety Switch ➔ AND Gate (Input B) ➔ Water Pump Motor',
      circuitType: 'Interlocked Compound Pumping Logic',
      explanation: 'Triggering either sensor button causes the OR gate to output 1. If the safety switch is closed (1), the AND gate satisfies (1 · 1 = 1) and delivers +5V to the DC water pump motor.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn1', toPin: 'pin1', label: 'Battery (+) to Sensor 1' },
        { fromComp: 'btn1', fromPin: 'pin2', toComp: 'gate_or1', toPin: 'in_a', label: 'Sensor 1 to OR Input A' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'btn2', toPin: 'pin1', label: 'Battery (+) to Sensor 2' },
        { fromComp: 'btn2', fromPin: 'pin2', toComp: 'gate_or1', toPin: 'in_b', label: 'Sensor 2 to OR Input B' },
        { fromComp: 'gate_or1', fromPin: 'out', toComp: 'gate_and1', toPin: 'in_a', label: 'OR Output to AND Input A' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw_safe', toPin: 'pin1', label: 'Battery (+) to Safety Switch' },
        { fromComp: 'sw_safe', fromPin: 'pin2', toComp: 'gate_and1', toPin: 'in_b', label: 'Safety Switch to AND Input B' },
        { fromComp: 'gate_and1', fromPin: 'out', toComp: 'motor1', toPin: 'pin1', label: 'AND Output to Motor (+)' },
        { fromComp: 'motor1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Motor (-) Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const andGate = components.find(c => c.id === 'gate_and1');
      const motor = components.find(c => c.id === 'motor1');
      const sw = components.find(c => c.id === 'sw_safe');
      const btn1 = components.find(c => c.id === 'btn1');
      const btn2 = components.find(c => c.id === 'btn2');
      return !!andGate && andGate.state.outputLevel === 1 &&
             !!motor && motor.state.powered && !motor.state.burnt &&
             !!sw && sw.state.closed &&
             (btn1.state.pressed || btn2.state.pressed) &&
             !status.circuitFailed;
    }
  }
];

window.GAME_LEVELS = GAME_LEVELS;
