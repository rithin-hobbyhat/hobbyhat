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
    title: 'Level 2: Polarity Matters (LED & Resistor)',
    category: 'Polarity',
    badge: 'Intermediate',
    summary: 'Discover why the LED (Light Emitting Diode) needs a Current Limiting Resistor to protect it from overvoltage and burning!',
    instructions: 'Connect the 9V Battery and Resistor to the LED. Remember: Current in the LED must enter its Anode (+) lead and exit its Cathode (-) lead!',
    hint: 'Connect Battery (+) to the Resistor, then to the LED Anode (+). Connect the LED Cathode (-) back to Battery (-). If the LED is crying with excess voltage or reversed, check your connections!',
    theory: 'LED stands for Light Emitting Diode. Unlike incandescent bulbs which conduct in either direction, an LED is a delicate semiconductor: current can only pass through in forward bias, and a Resistor limits current to prevent thermal destruction.',
    allowedComponents: ['battery', 'led', 'resistor'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'resistor', x: 340, y: 190, id: 'res1' },
      { type: 'led', x: 580, y: 170, id: 'led1', stateProps: { color: 'green' } }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Resistor ➔ LED Anode (+) ➔ LED Cathode (-) ➔ Battery (-)',
      circuitType: 'Current-Limited Diode Series Loop',
      explanation: 'Place the 220Ω Resistor in series between the Battery (+) and the LED Anode (+). By Kirchhoff’s Voltage Law (KVL), the resistor absorbs the excess 6.9V, restricting current to a safe 20mA and protecting the LED from burning.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery to Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
      const res = components.find(c => c.type === 'resistor' && c.state.powered);
      return !!led && !!res && !status.circuitFailed;
    }
  },

  {
    id: 3,
    title: 'Level 3: Direct Coin Match (3V Coin Cell & LED)',
    category: 'Coin Cells',
    badge: 'Beginner',
    summary: 'Power the LED directly from a CR2032 3V Coin Cell without burning it! Discover why 3.0V lithium power matches an LED directly.',
    instructions: 'Connect the 3V Coin Cell (+) outer rim terminal directly to the LED Anode (+), and the Coin Cell (-) center terminal to the LED Cathode (-). The LED will glow cheerfully without needing any separate resistor!',
    hint: 'Drag wire from Coin Cell (+) to LED Anode (+), then from LED Cathode (-) back to Coin Cell (-). No resistor required for 3.0V!',
    theory: 'A 9V battery outputs 9 Volts—far above the LED safe limit of 3.3V, which destroys the semiconductor die without a resistor. But a Lithium CR2032 Coin Cell outputs precisely 3.0 Volts: an ideal direct match for LEDs in key fobs and watches!',
    allowedComponents: ['cell3v', 'led'],
    initialComponents: [
      { type: 'cell3v', x: 140, y: 180, id: 'coin1' },
      { type: 'led', x: 460, y: 170, id: 'led1', stateProps: { color: 'blue' } }
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
    id: 4,
    title: 'Level 4: Battery Stacking: Series AA Cells (1.5V + 1.5V = 3V)',
    category: 'Cell Stacking',
    badge: 'Intermediate',
    summary: 'Stack two 1.5V AA Cells in series (positive to negative) to combine their voltages and power an LED!',
    instructions: 'Connect the positive (+) terminal of Cell 1 to the negative (-) terminal of Cell 2. Then connect the remaining terminals across the LED (Anode to +, Cathode to -). Notice how 1.5V + 1.5V = 3.0V!',
    hint: 'Connect Cell 1 (+) to Cell 2 (-). Then connect Cell 2 (+) to LED Anode (+), and LED Cathode (-) back to Cell 1 (-).',
    theory: 'When chemical cells are wired in series (+ touching -), their individual voltages add together (V_total = V1 + V2). Two 1.5V AA cells deliver 3.0 Volts, supplying enough forward potential to energize the LED crystal without an extra resistor!',
    allowedComponents: ['cell', 'led'],
    initialComponents: [
      { type: 'cell', x: 100, y: 60, id: 'cell1' },
      { type: 'cell', x: 100, y: 290, id: 'cell2' },
      { type: 'led', x: 480, y: 180, id: 'led1', stateProps: { color: 'green' } }
    ],
    referenceSolution: {
      summary: 'Cell 1 (-) ➔ Cell 2 (+) | Cell 1 (+) ➔ LED Anode (+) ➔ LED Cathode (-) ➔ Cell 2 (-)',
      circuitType: 'Series Voltage Stacking (V_tot = V1 + V2)',
      explanation: 'Stack the two AA cells in series by connecting Cell 1 negative (-) to Cell 2 positive (+). Then take the combined 3.0V output: wire Cell 1 positive (+) to the LED Anode (+) and LED Cathode (-) back to Cell 2 negative (-).',
      connections: [
        { fromComp: 'cell1', fromPin: 'neg', toComp: 'cell2', toPin: 'pos', label: 'Series Interconnect (1.5V + 1.5V)' },
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
    id: 5,
    title: 'Level 5: Master Power Switch (SPST Controls)',
    category: 'Controls',
    badge: 'Beginner',
    summary: 'Add a Single Pole Switch to open and close power to the DC Electric Motor with a satisfying click!',
    instructions: 'Insert the Single Pole Switch into the loop between the 9V Battery and Motor. Click its lever to the CLOSED position to unleash current and spin the propeller!',
    hint: 'Run a wire from Battery (+) through the Switch, then to Motor (+). Return Motor (-) to Battery (-). Click the switch lever to turn it ON!',
    theory: 'Single Pole Single Throw (SPST) switches create or break the conductive path. An open switch creates an air gap with infinite resistance, halting current. Lowering the contact completes the loop with zero resistance.',
    allowedComponents: ['battery', 'switch', 'motor'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'switch', x: 340, y: 180, id: 'sw1' },
      { type: 'motor', x: 580, y: 160, id: 'motor1' }
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
      return !!sw && sw.state.closed && !!motor && !status.circuitFailed;
    }
  },

  {
    id: 6,
    title: 'Level 6: Sound the Alarm! (Electronic Buzzer)',
    category: 'Acoustics',
    badge: 'Fun',
    summary: 'Wire the Electronic Buzzer into an alarm circuit and listen to its 880Hz acoustic tone ring out!',
    instructions: 'Connect the 9V Battery and Single Pole Switch to the Electronic Buzzer. Close the switch to energize the piezoelectric sound disc and trigger the alarm!',
    hint: 'Battery (+) -> Switch Pin 1 -> Switch Pin 2 -> Buzzer Pin 1 (+) -> Buzzer Pin 2 (-) -> Battery (-). Click switch to close it!',
    theory: 'Electronic Buzzers contain a piezoelectric ceramic wafer that flexes and relaxes hundreds of times per second when voltage is applied. This rapid vibration pushes surrounding air to generate loud, audible sound waves!',
    allowedComponents: ['battery', 'switch', 'buzzer'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'switch', x: 340, y: 180, id: 'sw1' },
      { type: 'buzzer', x: 560, y: 170, id: 'buzzer1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Switch Pin 1 ➔ Switch Pin 2 ➔ Buzzer (+) ➔ Buzzer (-) ➔ Battery (-)',
      circuitType: 'Switched Acoustic Alarm Circuit',
      explanation: 'Connect Battery (+) to Switch Pin 1, Switch Pin 2 to Buzzer (+) (pin1), and Buzzer (-) (pin2) back to Battery (-). Closing the switch applies 9V across the piezo disc to sound the alarm.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Pin 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'buzzer1', toPin: 'pin1', label: 'Switched Power to Buzzer (+)' },
        { fromComp: 'buzzer1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Buzzer (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const bz = components.find(c => c.type === 'buzzer' && (c.state.powered || c.state.sounding) && !c.state.burnt);
      const sw = components.find(c => c.type === 'switch');
      return !!bz && (!sw || sw.state.closed) && !status.circuitFailed;
    }
  },

  {
    id: 7,
    title: 'Level 7: The Light Dimmer (Potentiometer & Bulb)',
    category: 'Dimming',
    badge: 'Interactive',
    summary: 'Wire a Variable Resistor (Potentiometer) in series with the Incandescent Bulb to smoothly dim and brighten its light!',
    instructions: 'Connect the 9V Battery, Potentiometer, and Incandescent Bulb in series. Click the Potentiometer to adjust its resistance up and down to see the bulb dim and glow bright!',
    hint: 'Battery (+) -> Potentiometer Terminal 1 (pin1) -> Potentiometer Wiper (wiper) -> Bulb Terminal A -> Bulb Terminal B -> Battery (-). (Rheostat mode uses one outer terminal and the center wiper to vary resistance!)',
    theory: 'According to Ohm’s Law (I = V / R_total), increasing resistance restricts electron flow. Less current means less electrical power (P = I² × R) delivered to the bulb filament, smoothly dimming its light.',
    allowedComponents: ['battery', 'potentiometer', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'potentiometer', x: 340, y: 190, id: 'pot1' },
      { type: 'bulb', x: 580, y: 170, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Potentiometer Terminal 1 ➔ Wiper ➔ Bulb A ➔ Bulb B ➔ Battery (-)',
      circuitType: 'Variable Rheostat Dimmer Circuit',
      explanation: 'Connect Battery (+) to Potentiometer Terminal 1, and the center Wiper to Bulb Terminal A, and Bulb Terminal B back to Battery (-). Rotating the potentiometer alters the series length and resistance, throttling current to smoothly dim the lamp.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pot1', toPin: 'pin1', label: 'Battery (+) to Potentiometer Terminal 1' },
        { fromComp: 'pot1', fromPin: 'wiper', toComp: 'bulb1', toPin: 'pin1', label: 'Rheostat Wiper Output to Bulb A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb B Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const pot = components.find(c => c.type === 'potentiometer' && c.state.powered);
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return !!pot && !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 8,
    title: 'Level 8: Motor Speed Control (Potentiometer & DC Motor)',
    category: 'Speed Control',
    badge: 'Mechanics',
    summary: 'Regulate the rotational speed (RPM) of the DC Motor by controlling branch current with the Potentiometer!',
    instructions: 'Connect the Potentiometer in series between the 9V Battery and the DC Motor. Adjust the resistance to throttle the motor fan blades from a gentle breeze to maximum RPM!',
    hint: 'Battery (+) -> Potentiometer Terminal 1 (pin1) -> Potentiometer Wiper (wiper) -> Motor (+) -> Motor (-) -> Battery (-). Watch the motor RPM gauge change as you adjust resistance!',
    theory: 'Electric motor speed is proportional to the voltage applied across its copper armature coils. By adding a variable resistance in series via rheostat mode (Terminal 1 to Wiper), you create a dynamic voltage divider that throttles motor speed.',
    allowedComponents: ['battery', 'potentiometer', 'motor'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'potentiometer', x: 340, y: 190, id: 'pot1' },
      { type: 'motor', x: 580, y: 160, id: 'motor1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Potentiometer Terminal 1 ➔ Wiper ➔ Motor (+) ➔ Motor (-) ➔ Battery (-)',
      circuitType: 'Rheostat Motor Speed Governor',
      explanation: 'Connect Battery (+) to Potentiometer Terminal 1, Potentiometer Wiper to Motor (+) (pin1), and Motor (-) (pin2) to Battery (-). The potentiometer drops a portion of the supply voltage, regulating motor RPM.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pot1', toPin: 'pin1', label: 'Battery (+) to Potentiometer Terminal 1' },
        { fromComp: 'pot1', fromPin: 'wiper', toComp: 'motor1', toPin: 'pin1', label: 'Rheostat Wiper Feed to Motor (+)' },
        { fromComp: 'motor1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Motor (-) Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const pot = components.find(c => c.type === 'potentiometer' && c.state.powered);
      const motor = components.find(c => c.type === 'motor' && c.state.powered && !c.state.burnt);
      return !!pot && !!motor && !status.circuitFailed;
    }
  },

  {
    id: 9,
    title: 'Level 9: Track Switcher: Two-Way SPDT Switch',
    category: 'Routing',
    badge: 'Advanced',
    summary: 'Flick the Two-Way Switch (SPDT) to steer current between Route 1 (Green LED) and Route 2 (Red LED)!',
    instructions: 'Connect Battery (+) through a Resistor to the Two-Way Switch Common (COM) pin. Connect Way 1 (L1) to the Green LED, and Way 2 (L2) to the Red LED. Return both LED Cathodes to Battery (-).',
    hint: 'Battery (+) -> Resistor -> Switch COM. Switch L1 -> Green LED Anode (+). Switch L2 -> Red LED Anode (+). Both LED Cathodes (-) -> Battery (-). Click switch lever to toggle paths!',
    theory: 'Single Pole Double Throw (SPDT) switches direct electrical current between two alternate destinations. When the lever connects COM to L1, Route 1 conducts; flicking the lever switches conduction to Route 2.',
    allowedComponents: ['battery', 'resistor', 'twowayswitch', 'led'],
    initialComponents: [
      { type: 'battery', x: 70, y: 200, id: 'bat1' },
      { type: 'resistor', x: 260, y: 210, id: 'res1' },
      { type: 'twowayswitch', x: 470, y: 190, id: 'sw2' },
      { type: 'led', x: 680, y: 100, id: 'ledG', stateProps: { color: 'green' } },
      { type: 'led', x: 680, y: 290, id: 'ledR', stateProps: { color: 'red' } }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Resistor ➔ Switch COM | L1 ➔ Green LED (+) | L2 ➔ Red LED (+) | Both Cathodes ➔ Battery (-)',
      circuitType: 'SPDT Dual-Route Selector',
      explanation: 'Route Battery (+) through the Resistor into Switch COM. Connect Throw L1 to Green LED Anode (+), Throw L2 to Red LED Anode (+), and wire both LED Cathodes (-) to Battery (-). Flicking the switch alternates illumination.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery (+) to Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'sw2', toPin: 'com', label: 'Resistor to Switch COM' },
        { fromComp: 'sw2', fromPin: 'l1', toComp: 'ledG', toPin: 'anode', label: 'Route L1 to Green LED Anode' },
        { fromComp: 'sw2', fromPin: 'l2', toComp: 'ledR', toPin: 'anode', label: 'Route L2 to Red LED Anode' },
        { fromComp: 'ledG', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'Green LED Cathode to Ground' },
        { fromComp: 'ledR', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'Red LED Cathode to Ground' }
      ]
    },
    checkWin: (status, components) => {
      const sw = components.find(c => c.type === 'twowayswitch');
      const anyLed = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
      return !!sw && !!anyLed && !status.circuitFailed;
    }
  },

  {
    id: 10,
    title: 'Level 10: Signaling Beacon (Blinking LED Mode)',
    category: 'Signals',
    badge: 'Fun',
    summary: 'Build a signaling beacon where the LED blinks rhythmically like an airport tower!',
    instructions: 'Connect the 9V Battery, Resistor, and LED in a closed circuit. Then click the LED and toggle the "Blinking Mode" switch in its inspector panel to make it flash!',
    hint: 'Battery (+) -> Resistor -> LED Anode (+) -> LED Cathode (-) -> Battery (-). Once powered, click the LED and switch on "Blinking Mode" in the right sidebar!',
    theory: 'Blinking lights are fundamental visual signals in electronics—used in lighthouse beacons, automotive hazard flashers, aircraft wingtips, and digital clock pulse generators.',
    allowedComponents: ['battery', 'resistor', 'led'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'resistor', x: 330, y: 190, id: 'res1' },
      { type: 'led', x: 560, y: 170, id: 'led1', stateProps: { color: 'yellow', blinking: true } }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Resistor ➔ Blinking LED Anode (+) ➔ LED Cathode (-) ➔ Battery (-)',
      circuitType: 'Pulsed Visual Beacon Circuit',
      explanation: 'Connect Battery (+) to Resistor Pin 1, Resistor Pin 2 to LED Anode (+), and LED Cathode (-) to Battery (-). The series resistor protects the blinking LED while it pulses rhythmically.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery (+) to Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const led = components.find(c => c.type === 'led' && c.state.powered && c.state.blinking && !c.state.burnt);
      return !!led && !status.circuitFailed;
    }
  },

  {
    id: 11,
    title: 'Level 11: Semiconductor Diode (One-Way Gate)',
    category: 'Semiconductors',
    badge: 'Essential',
    summary: 'Learn how a Semiconductor Diode allows current to flow forward and blocks any reverse traffic.',
    instructions: 'Place the Diode in series between the 9V Battery and Incandescent Bulb. Orient the Diode so its silver stripe cathode faces the negative return path.',
    hint: 'Battery (+) -> Diode Anode (+) -> Diode Cathode (-) -> Bulb Terminal A -> Bulb Terminal B -> Battery (-).',
    theory: 'Diodes are one-way check valves for electricity. A diode lets current pass easily in forward bias (Anode positive relative to Cathode) while blocking reverse current like a solid wall.',
    allowedComponents: ['battery', 'diode', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 100, y: 180, id: 'bat1' },
      { type: 'diode', x: 320, y: 190, id: 'diode1' },
      { type: 'bulb', x: 540, y: 170, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Diode Anode (+) ➔ Diode Cathode (-) ➔ Bulb A ➔ Bulb B ➔ Battery (-)',
      circuitType: 'Unidirectional Diode Forward Bias',
      explanation: 'Connect Battery (+) to Diode Anode (+). Connect Diode Cathode (-) to Bulb Terminal A, and Bulb Terminal B back to Battery (-). In forward bias, the diode conducts easily, illuminating the bulb while blocking any accidental reverse flow.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'diode1', toPin: 'anode', label: 'Battery (+) to Diode Anode (+)' },
        { fromComp: 'diode1', fromPin: 'cathode', toComp: 'bulb1', toPin: 'pin1', label: 'Diode Cathode (-) to Bulb A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb B Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      const diode = components.find(c => c.type === 'diode' && c.state.powered && !c.state.burnt);
      return !!bulb && !!diode && !status.circuitFailed;
    }
  },

  {
    id: 12,
    title: 'Level 12: Reverse Polarity Protection Circuit',
    category: 'Protection',
    badge: 'Master',
    summary: 'Design a protection circuit with a Diode to safeguard the DC Electric Motor!',
    instructions: 'Build a circuit with the 9V Battery, Diode, Single Pole Switch, and Motor. Ensure the Diode allows forward current so the motor spins safely!',
    hint: 'Battery (+) -> Diode Anode (+) -> Diode Cathode (-) -> Switch -> Motor (+) -> Motor (-) -> Battery (-).',
    theory: 'Engineers always place protection diodes in electronic consumer devices so accidentally inserting batteries backward will never fry sensitive motors or microcontrollers.',
    allowedComponents: ['battery', 'diode', 'motor', 'switch'],
    initialComponents: [
      { type: 'battery', x: 80, y: 190, id: 'bat1' },
      { type: 'diode', x: 270, y: 190, id: 'diode1' },
      { type: 'switch', x: 460, y: 190, id: 'sw1' },
      { type: 'motor', x: 650, y: 170, id: 'motor1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Diode Anode (+) ➔ Diode Cathode (-) ➔ Switch ➔ Motor (+) ➔ Motor (-) ➔ Battery (-)',
      circuitType: 'Series Diode Protection Loop',
      explanation: 'Connect Battery (+) to Diode Anode (+). Connect Diode Cathode (-) to Switch Pin 1, Switch Pin 2 to Motor (+), and Motor (-) back to Battery (-). The diode prevents negative voltage damage if the supply is inverted.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'diode1', toPin: 'anode', label: 'Battery (+) to Diode Anode' },
        { fromComp: 'diode1', fromPin: 'cathode', toComp: 'sw1', toPin: 'pin1', label: 'Diode Cathode to Switch' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'motor1', toPin: 'pin1', label: 'Switch to Motor (+)' },
        { fromComp: 'motor1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Motor (-) Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const motor = components.find(c => c.type === 'motor' && c.state.powered && !c.state.burnt);
      const diode = components.find(c => c.type === 'diode' && c.state.powered && !c.state.burnt);
      const sw = components.find(c => c.type === 'switch');
      return !!motor && !!diode && !!sw && sw.state.closed && !status.circuitFailed;
    }
  },

  {
    id: 13,
    title: 'Level 13: Precision Diagnostics: Digital Multimeter (Voltage Test)',
    category: 'Diagnostics',
    badge: 'Essential',
    usesMultimeter: true,
    multimeterMode: 'dcv',
    summary: 'Use the master electronic diagnostic tool—the Digital Multimeter—to measure DC voltage across a circuit!',
    instructions: 'Complete a circuit with the 9V Battery and Bulb. The top menu Digital Multimeter is active: connect its V/Ω/mA (+) and COM (-) leads or drag the Red (+) & Black (-) probes across the Battery or Bulb to measure DC voltage! Watch the LCD display read ~9.00 V!',
    hint: 'Wire Battery (+) to Bulb Terminal A, and Bulb Terminal B to Battery (-). Then wire the Multimeter jacks (or drag the Red probe to Battery + and Black probe to Battery -) to read ~8.7V – 9.0V on the LCD!',
    theory: 'A voltmeter has very high internal resistance (10 MΩ) and must always be connected in PARALLEL across the power source or component. It measures electrical potential difference without disturbing current flow.',
    allowedComponents: ['battery', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 120, y: 220, id: 'bat1' },
      { type: 'bulb', x: 440, y: 220, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'Bulb: Battery (+) ➔ Bulb A, Bulb B ➔ Battery (-) | Multimeter in Parallel: V/Ω/mA ➔ Battery (+), COM ➔ Battery (-)',
      circuitType: 'Parallel Diagnostic Voltmeter Test',
      explanation: 'First complete the load circuit: Battery (+) to Bulb Terminal A, and Bulb Terminal B to Battery (-). Then connect the top menu Multimeter in parallel: wire V/Ω/mA (or drag Red probe) to Battery (+) and COM (or Black probe) to Battery (-).',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'bulb1', toPin: 'pin1', label: 'Battery (+) to Bulb Terminal A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Terminal B to Battery (-)' },
        { fromComp: 'multimeter_tool', fromPin: 'vin', toComp: 'bat1', toPin: 'pos', label: 'Multimeter V/Ω/mA (+) in Parallel' },
        { fromComp: 'multimeter_tool', fromPin: 'com', toComp: 'bat1', toPin: 'neg', label: 'Multimeter COM (-) in Parallel' }
      ]
    },
    checkWin: (status, components, app) => {
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      const mm = components.find(c => c.type === 'multimeter');
      const mmCompReading = mm ? (mm.state.displayStr || '') : '';
      const mmToolReading = (app && app.multimeterReading) ? app.multimeterReading.value : (status.multimeterReading ? status.multimeterReading.value : '');
      const display = mmToolReading || mmCompReading || '';
      const hasReading = display.includes('V') && !display.startsWith('0.00') && !display.startsWith('+0.00') && !display.startsWith('-0.00') && !display.includes('O.L');
      return hasReading && !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 14,
    title: 'Level 14: Continuity Detective: Multimeter Continuity Beeper',
    category: 'Continuity',
    badge: 'Diagnostic',
    usesMultimeter: true,
    multimeterMode: 'cont',
    summary: 'Test for unbroken conductive paths and verify switches using the Multimeter’s audible Continuity Beeper!',
    instructions: 'The top menu Digital Multimeter is active in Continuity mode (CONT). Connect its leads or drag the Red and Black probes across the Single Pole Switch. Close the switch to hear the continuity beeper ring!',
    hint: 'Wire Multimeter V/Ω/mA to Switch Pin 1, and Multimeter COM to Switch Pin 2 (or drag the red and black probes to Pin 1 and Pin 2). Click the switch handle to CLOSED to make the meter beep with 0.0 Ω solid continuity!',
    theory: 'Continuity mode sends a tiny test current through a circuit. If resistance is near zero (<15Ω), an audible buzzer sounds. Technicians use this to check cables and switches without having to look at the meter display!',
    allowedComponents: ['switch'],
    initialComponents: [
      { type: 'switch', x: 440, y: 220, id: 'sw1' }
    ],
    referenceSolution: {
      summary: 'Multimeter V/Ω/mA ➔ Switch Pin 1 | Multimeter COM ➔ Switch Pin 2 (Close switch to test)',
      circuitType: 'Low-Resistance Continuity Test',
      explanation: 'Connect Multimeter V/Ω/mA to Switch Pin 1, and Multimeter COM to Switch Pin 2 (or attach probes). When the switch lever is closed, contact resistance drops to near zero, triggering the audible continuity beeper.',
      connections: [
        { fromComp: 'multimeter_tool', fromPin: 'vin', toComp: 'sw1', toPin: 'pin1', label: 'Multimeter V/Ω/mA to Switch Pin 1' },
        { fromComp: 'multimeter_tool', fromPin: 'com', toComp: 'sw1', toPin: 'pin2', label: 'Multimeter COM to Switch Pin 2' }
      ]
    },
    checkWin: (status, components, app) => {
      const sw = components.find(c => c.type === 'switch');
      if (!sw) return false;
      const mm = components.find(c => c.type === 'multimeter');
      const mmCompReading = mm ? (mm.state.displayStr || '') : '';
      const mmToolReading = (app && app.multimeterReading) ? app.multimeterReading.value : (status.multimeterReading ? status.multimeterReading.value : '');
      const display = mmToolReading || mmCompReading || '';
      return (display.includes('BEEP') || display.includes('0.0')) && sw.state.closed;
    }
  },

  {
    id: 15,
    title: 'Level 15: Electronic Valve: NPN Transistor Switch',
    category: 'Transistors',
    badge: 'Advanced',
    summary: 'A tiny trickle of current at the NPN Base pin opens a floodgate of current between Collector and Emitter to light the bulb!',
    instructions: 'Connect Battery (+) to Bulb Terminal A. Connect Bulb Terminal B to Transistor Collector (c). Connect Transistor Emitter (e) to Battery (-). Then wire Battery (+) through a 220Ω Resistor into the Transistor Base (b) pin to switch it ON!',
    hint: 'Load loop: Battery (+) -> Bulb -> NPN Collector (c) -> NPN Emitter (e) -> Battery (-). Base trigger: Battery (+) -> Resistor -> NPN Base (b).',
    theory: 'Bipolar Junction Transistors (BJTs) are current-controlled electronic valves. A small current injected into the Base unleashes a much larger current through the Collector-Emitter channel, enabling computers to compute with electrical logic!',
    allowedComponents: ['battery', 'bulb', 'resistor', 'npn'],
    initialComponents: [
      { type: 'battery', x: 70, y: 200, id: 'bat1' },
      { type: 'bulb', x: 300, y: 100, id: 'bulb1' },
      { type: 'resistor', x: 300, y: 290, id: 'res1' },
      { type: 'npn', x: 570, y: 170, id: 'npn1' }
    ],
    referenceSolution: {
      summary: 'Load: Battery (+) ➔ Bulb ➔ NPN Collector (c) | Emitter (e) ➔ Battery (-) | Base Trigger: Battery (+) ➔ Resistor ➔ NPN Base (b)',
      circuitType: 'NPN Common-Emitter Saturated Switch',
      explanation: 'Form the collector load loop: Battery (+) to Bulb Terminal A, Bulb Terminal B to NPN Collector (c), and NPN Emitter (e) to Battery (-). Then wire the base drive: Battery (+) through Resistor to NPN Base (b). Base current forces the transistor into saturation.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'bulb1', toPin: 'pin1', label: 'Battery (+) to Bulb Terminal A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'npn1', toPin: 'c', label: 'Bulb B to NPN Collector (c)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'NPN Emitter (e) to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery (+) to Base Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Resistor to NPN Base (b)' }
      ]
    },
    checkWin: (status, components) => {
      const npn = components.find(c => c.type === 'npn');
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return !!npn && (npn.state.conducting || !!bulb) && !status.circuitFailed;
    }
  },

  {
    id: 16,
    title: 'Level 16: Optical Light Sensor: LDR (Photoresistor)',
    category: 'Sensors',
    badge: 'Interactive',
    summary: 'Wire the Light Dependent Resistor (LDR) in series with a glowing bulb. Watch its resistance drop in real time as light strikes its face!',
    instructions: 'Wire the 9V Battery and LDR in series with the Incandescent Bulb. Notice the LDR reading its resistance in real time as the glowing bulb illuminates its sensor surface!',
    hint: 'Battery (+) -> LDR Pin 1 -> LDR Pin 2 -> Bulb Terminal A -> Bulb Terminal B -> Battery (-). Drag the bulb closer or further to observe real-time photon resistance changes!',
    theory: 'Photoresistors contain cadmium sulfide (CdS). When photons of light hit the material, bound electrons are knocked free into conduction, dropping resistance from 100,000Ω down to ~150Ω!',
    allowedComponents: ['battery', 'ldr', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 100, y: 190, id: 'bat1' },
      { type: 'ldr', x: 340, y: 190, id: 'ldr1' },
      { type: 'bulb', x: 580, y: 170, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ LDR Pin 1 ➔ LDR Pin 2 ➔ Bulb Terminal A ➔ Bulb Terminal B ➔ Battery (-)',
      circuitType: 'Optical Photoconductive Series Circuit',
      explanation: 'Connect Battery (+) to LDR Pin 1, LDR Pin 2 to Bulb Terminal A, and Bulb Terminal B back to Battery (-). Under ambient light, the LDR resistance drops, allowing electric current to flow through the filament.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'ldr1', toPin: 'pin1', label: 'Battery (+) to LDR Pin 1' },
        { fromComp: 'ldr1', fromPin: 'pin2', toComp: 'bulb1', toPin: 'pin1', label: 'LDR Pin 2 to Bulb Terminal A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Bulb Terminal B to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const ldr = components.find(c => c.type === 'ldr' && c.state.powered);
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return !!ldr && !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 17,
    title: 'Level 17: Automatic Night Light: NPN Transistor + LDR Sensor',
    category: 'Automation',
    badge: 'Expert',
    summary: 'Build an automated smart light-trigger circuit using the LDR Photoresistor, NPN Transistor, and an LED!',
    instructions: 'Wire the LED branch through the NPN Transistor (Battery (+) -> Resistor -> LED -> NPN Collector -> Emitter -> Battery (-)), and feed the NPN Base pin through the LDR sensor!',
    hint: 'LED branch: Battery (+) -> Resistor -> LED Anode (+) -> LED Cathode (-) -> NPN Collector (c) -> NPN Emitter (e) -> Battery (-). Base trigger: Battery (+) -> LDR -> NPN Base (b).',
    theory: 'Combining optical sensors with transistor switches is the core design behind automatic dusk-to-dawn streetlights, camera exposure meters, and solar tracking systems.',
    allowedComponents: ['battery', 'resistor', 'led', 'ldr', 'npn'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'resistor', x: 260, y: 100, id: 'res1' },
      { type: 'led', x: 470, y: 90, id: 'led1', stateProps: { color: 'yellow' } },
      { type: 'ldr', x: 260, y: 290, id: 'ldr1' },
      { type: 'npn', x: 620, y: 170, id: 'npn1' }
    ],
    referenceSolution: {
      summary: 'LED: Battery (+) ➔ Resistor ➔ LED (+) ➔ NPN (c) | Emitter (e) ➔ Bat (-) | Trigger: Bat (+) ➔ LDR ➔ NPN Base (b)',
      circuitType: 'Transistor Phototube / Optical Trigger Switch',
      explanation: 'Connect Battery (+) to Resistor Pin 1, Resistor Pin 2 to LED Anode (+), and LED Cathode (-) to NPN Collector (c). Return NPN Emitter (e) to Battery (-). Wire the optical sensor from Battery (+) through LDR to NPN Base (b).',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery (+) to Current-Limit Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'npn1', toPin: 'c', label: 'LED Cathode to NPN Collector (c)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'NPN Emitter (e) to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'ldr1', toPin: 'pin1', label: 'Battery (+) to LDR Sensor' },
        { fromComp: 'ldr1', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'LDR to NPN Base (b)' }
      ]
    },
    checkWin: (status, components) => {
      const npn = components.find(c => c.type === 'npn');
      const led = components.find(c => c.type === 'led' && c.state.powered && !c.state.burnt);
      const ldr = components.find(c => c.type === 'ldr');
      return !!npn && !!led && !!ldr && !status.circuitFailed;
    }
  },

  {
    id: 18,
    title: 'Level 18: Inverted Logic: PNP Transistor Active-Low Switch',
    category: 'Inverted Logic',
    badge: 'Advanced',
    summary: 'Explore active-LOW switching with the PNP Transistor! Pulling the Base LOW to Ground (-) turns ON the DC Motor!',
    instructions: 'Connect Battery (+) to PNP Emitter (e). Connect PNP Collector (c) to DC Motor (+), and Motor (-) back to Battery (-). Then pull the PNP Base (b) LOW by wiring it through a 220Ω Resistor to Battery (-) to start the motor!',
    hint: 'Emitter (e) -> Battery (+). Collector (c) -> Motor (+) -> Motor (-) -> Battery (-). Base (b) -> Resistor -> Battery (-). The motor will spin with high speed!',
    theory: 'PNP transistors are complementary to NPN transistors. While NPN turns ON with positive base current, PNP conducts when its Base is pulled to a lower potential than its Emitter. They are widely used as high-side power switches.',
    allowedComponents: ['battery', 'pnp', 'resistor', 'motor'],
    initialComponents: [
      { type: 'battery', x: 70, y: 200, id: 'bat1' },
      { type: 'pnp', x: 340, y: 160, id: 'pnp1' },
      { type: 'resistor', x: 340, y: 340, id: 'res1' },
      { type: 'motor', x: 630, y: 160, id: 'motor1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ PNP Emitter (e) | Collector (c) ➔ Motor (+) ➔ Motor (-) ➔ Battery (-) | Base (b) ➔ Resistor ➔ Battery (-)',
      circuitType: 'PNP High-Side Active-Low Switch',
      explanation: 'Connect Battery (+) to PNP Emitter (e). Connect PNP Collector (c) to Motor (+) and Motor (-) to Battery (-). Pull the PNP Base (b) low by wiring it through a Resistor to Battery (-). This turns ON the high-side PNP switch.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pnp1', toPin: 'e', label: 'Battery (+) to PNP Emitter (e)' },
        { fromComp: 'pnp1', fromPin: 'c', toComp: 'motor1', toPin: 'pin1', label: 'PNP Collector (c) to Motor (+)' },
        { fromComp: 'motor1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Motor (-) Return to Battery (-)' },
        { fromComp: 'pnp1', fromPin: 'b', toComp: 'res1', toPin: 'pin1', label: 'PNP Base (b) to Pull-Down Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Resistor to Ground Return (-)' }
      ]
    },
    checkWin: (status, components) => {
      const pnp = components.find(c => c.type === 'pnp');
      const motor = components.find(c => c.type === 'motor' && c.state.powered && !c.state.burnt);
      return !!pnp && (pnp.state.conducting || !!motor) && !status.circuitFailed;
    }
  },

  {
    id: 19,
    title: 'Level 19: High-Voltage Safety: Step-Down Transformer',
    category: 'AC Power',
    badge: 'Master',
    summary: 'Experience real electrical grid safety! Step 230V AC mains down to a safe 12V AC to power the Incandescent Bulb without blowing it up!',
    instructions: 'Connect the 230V AC Voltage Supply (Line L & Neutral N) to the Step-Down Transformer Primary coil (Pri L and Pri N). Then connect the Incandescent Bulb across the Transformer Secondary coil (Sec L and Sec N)!',
    hint: 'AC Source Line (l) -> Transformer Pri L (pri1). AC Source Neutral (n) -> Transformer Pri N (pri2). Transformer Sec L (sec1) -> Bulb Terminal A. Transformer Sec N (sec2) -> Bulb Terminal B.',
    theory: 'Plugging an incandescent bulb directly into 230V AC would instantly vaporize its tungsten filament! Transformers use electromagnetic induction between two coils around an iron core to step voltages up or down safely (V_p / V_s = N_p / N_s).',
    allowedComponents: ['ac_source', 'transformer', 'bulb'],
    initialComponents: [
      { type: 'ac_source', x: 80, y: 180, id: 'ac1' },
      { type: 'transformer', x: 360, y: 180, id: 'trans1' },
      { type: 'bulb', x: 640, y: 170, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'AC Source (L/N) ➔ Transformer Primary (Pri1/Pri2) | Transformer Secondary (Sec1/Sec2) ➔ Bulb (A/B)',
      circuitType: 'Galvanically Isolated AC Step-Down',
      explanation: 'Connect AC Source Line (l) to Transformer Pri Line (pri1), and Neutral (n) to Pri Neutral (pri2). Then connect the safe 12V AC secondary: Sec Line (sec1) to Bulb Terminal A, and Sec Neutral (sec2) to Bulb Terminal B.',
      connections: [
        { fromComp: 'ac1', fromPin: 'l', toComp: 'trans1', toPin: 'pri1', label: '230V AC Line to Transformer Pri L' },
        { fromComp: 'ac1', fromPin: 'n', toComp: 'trans1', toPin: 'pri2', label: '230V AC Neutral to Transformer Pri N' },
        { fromComp: 'trans1', fromPin: 'sec1', toComp: 'bulb1', toPin: 'pin1', label: '12V AC Sec Line to Bulb A' },
        { fromComp: 'trans1', fromPin: 'sec2', toComp: 'bulb1', toPin: 'pin2', label: '12V AC Sec Neutral to Bulb B' }
      ]
    },
    checkWin: (status, components) => {
      const trans = components.find(c => c.type === 'transformer' && c.state.powered);
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return !!trans && !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 20,
    title: 'Level 20: The Grand Master Circuit: Multi-Stage Control Lab',
    category: 'Master Lab',
    badge: 'Grand Champion',
    summary: 'Construct an all-in-one control console combining a Two-Way Switch, DC Electric Motor, Electronic Buzzer, and LED indicator!',
    instructions: 'Wire Battery (+) to the Two-Way Switch COM. Connect Way 1 (L1) to the DC Electric Motor. Connect Way 2 (L2) through a Resistor to the Buzzer and LED. Return all load negatives back to Battery (-)!',
    hint: 'Battery (+) -> Switch COM. Switch L1 -> Motor (+) -> Battery (-). Switch L2 -> Resistor -> Buzzer (+) and LED Anode (+). Return all (-) terminals to Battery (-). Flick switch to toggle modes!',
    theory: 'Congratulations on reaching the Grand Master Mission! Complex industrial control consoles use multi-way routing switches and parallel sub-circuits to toggle machines between regular operation and emergency alarm modes.',
    allowedComponents: ['battery', 'twowayswitch', 'motor', 'resistor', 'buzzer', 'led'],
    initialComponents: [
      { type: 'battery', x: 70, y: 210, id: 'bat1' },
      { type: 'twowayswitch', x: 280, y: 200, id: 'sw2' },
      { type: 'motor', x: 500, y: 90, id: 'motor1' },
      { type: 'resistor', x: 500, y: 280, id: 'res1' },
      { type: 'buzzer', x: 720, y: 210, id: 'buzzer1' },
      { type: 'led', x: 720, y: 340, id: 'led1', stateProps: { color: 'purple' } }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switch COM | L1 ➔ Motor (+) | L2 ➔ Resistor ➔ Buzzer (+) & LED (+) | All Negatives ➔ Bat (-)',
      circuitType: 'Multi-Branch Industrial Console',
      explanation: 'Connect Battery (+) to Switch COM. Way L1 feeds Motor (+). Way L2 feeds Resistor Pin 1. Resistor Pin 2 branches to Buzzer (+) and LED Anode (+). Connect Motor (-), Buzzer (-), and LED Cathode (-) to Battery (-).',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw2', toPin: 'com', label: 'Battery (+) to Switch COM' },
        { fromComp: 'sw2', fromPin: 'l1', toComp: 'motor1', toPin: 'pin1', label: 'Way L1 to Motor (+)' },
        { fromComp: 'motor1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Motor (-) to Battery (-)' },
        { fromComp: 'sw2', fromPin: 'l2', toComp: 'res1', toPin: 'pin1', label: 'Way L2 to Resistor' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'buzzer1', toPin: 'pin1', label: 'Resistor to Buzzer (+)' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'buzzer1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Buzzer (-) to Battery (-)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sw = components.find(c => c.type === 'twowayswitch');
      const anyActive = components.find(c => (c.type === 'motor' || c.type === 'buzzer' || c.type === 'led') && c.state.powered && !c.state.burnt);
      return !!sw && !!anyActive && !status.circuitFailed;
    }
  },

  {
    id: 21,
    title: 'Level 21: The Energy Reservoir: Electrolytic Capacitor & Power Backup',
    category: 'Capacitors',
    badge: 'Reservoir Master',
    summary: 'Discover how capacitors store electric charge like an electronic water tower! Wire a 1000µF Electrolytic Capacitor in parallel with an LED to create power backup.',
    instructions: 'Wire the Battery through a Switch to the 1000µF Electrolytic Capacitor (Anode +) and a 470Ω Resistor to the LED. Connect the Capacitor Cathode (-) and LED Cathode (-) to Battery (-). Turn ON the switch to charge the capacitor, then turn it OFF to witness stored energy discharge!',
    hint: 'Battery (+) -> Switch pin 1. Switch pin 2 -> Capacitor Anode (anode) AND Resistor pin1. Resistor pin2 -> LED Anode (anode). Capacitor Cathode (cathode) AND LED Cathode (cathode) -> Battery (-).',
    theory: 'Capacitors store energy in an electric field between two conductive plates separated by a dielectric. The energy stored is E = ½·C·V². When the main power source is disconnected, the capacitor discharges stored charge into the load, providing uninterrupted backup power!',
    allowedComponents: ['battery', 'switch', 'capacitor', 'resistor', 'led'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'switch', x: 250, y: 150, id: 'sw1' },
      { type: 'capacitor', x: 440, y: 290, id: 'cap1', stateProps: { capacitance: 1000, ratedVoltage: 16 } },
      { type: 'resistor', x: 440, y: 120, id: 'res1', stateProps: { resistance: 470 } },
      { type: 'led', x: 670, y: 190, id: 'led1', stateProps: { color: 'green' } }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switch | Switch ➔ Cap (+) & Resistor ➔ LED (+) | Cap (-) & LED (-) ➔ Bat (-)',
      circuitType: 'Parallel Reservoir Energy Storage Loop',
      explanation: 'Connect Battery (+) to Switch Pin 1. From Switch Pin 2, wire parallel branches to Capacitor Anode (anode) and Resistor Pin 1. Wire Resistor Pin 2 to LED Anode (anode). Connect both Capacitor Cathode and LED Cathode back to Battery (-).',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Pin 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'cap1', toPin: 'anode', label: 'Switched Supply to Capacitor Anode (+)' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'res1', toPin: 'pin1', label: 'Switched Supply to Resistor Pin 1' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'cap1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'Capacitor Cathode (-) to Battery (-)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const cap = components.find(c => c.type === 'capacitor');
      const led = components.find(c => c.type === 'led' && !c.state.burnt);
      return !!cap && (cap.state.storedVoltage > 2.0 || (cap.state.chargePercent || 0) > 20) && !!led && (led.state.powered || cap.state.storedVoltage > 1.5) && !status.circuitFailed;
    }
  },

  {
    id: 22,
    title: 'Level 22: The AC Ripple Smoother: Power Supply Filter Lab',
    category: 'Capacitors',
    badge: 'Filter Engineer',
    summary: 'Turn jagged, pulsating AC into silky-smooth DC! Add an Electrolytic Reservoir Capacitor across a Full-Wave Bridge Rectifier to eliminate voltage ripple.',
    instructions: 'Step down 230V AC to 12V AC with the Transformer, feed it into the AC terminals of the Rectifier, and place a 1000µF Electrolytic Capacitor across the DC (+) and (-) output terminals with an Incandescent Bulb!',
    hint: 'Transformer Sec L & N -> Rectifier AC pins (ac1, ac2). Rectifier DC (+) (dc_pos) -> Capacitor Anode (anode) -> Bulb pin1. Rectifier DC (-) (dc_neg) -> Capacitor Cathode (cathode) -> Bulb pin2.',
    theory: 'Rectifiers produce pulsating DC with high voltage ripple. By adding a large reservoir capacitor across the output, the capacitor charges at the sine peaks and discharges into the load between valleys, smoothing pulsating ripple into clean, steady DC power just like a laptop power brick!',
    allowedComponents: ['ac_source', 'transformer', 'rectifier', 'capacitor', 'bulb'],
    initialComponents: [
      { type: 'ac_source', x: 60, y: 190, id: 'ac1' },
      { type: 'transformer', x: 260, y: 190, id: 'trans1' },
      { type: 'rectifier', x: 480, y: 190, id: 'rect1' },
      { type: 'capacitor', x: 660, y: 290, id: 'cap1', stateProps: { capacitance: 1000, ratedVoltage: 25 } },
      { type: 'bulb', x: 700, y: 130, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'AC Source ➔ Transformer (Pri) | Transformer (Sec) ➔ Rectifier (AC) | Rectifier (DC) ➔ Capacitor & Bulb in Parallel',
      circuitType: 'Full-Wave Rectified & Filtered Linear DC Supply',
      explanation: 'Connect AC Source (l/n) to Transformer (pri1/pri2). Connect Transformer (sec1/sec2) to Rectifier AC inputs (ac1/ac2). Connect Rectifier DC (+) (dc_pos) in parallel to Capacitor Anode and Bulb Pin 1. Connect Rectifier DC (-) (dc_neg) to Capacitor Cathode and Bulb Pin 2.',
      connections: [
        { fromComp: 'ac1', fromPin: 'l', toComp: 'trans1', toPin: 'pri1', label: 'AC Line to Transformer Pri Line' },
        { fromComp: 'ac1', fromPin: 'n', toComp: 'trans1', toPin: 'pri2', label: 'AC Neutral to Transformer Pri Neutral' },
        { fromComp: 'trans1', fromPin: 'sec1', toComp: 'rect1', toPin: 'ac1', label: '12V AC Sec 1 to Rectifier AC 1' },
        { fromComp: 'trans1', fromPin: 'sec2', toComp: 'rect1', toPin: 'ac2', label: '12V AC Sec 2 to Rectifier AC 2' },
        { fromComp: 'rect1', fromPin: 'dc_pos', toComp: 'cap1', toPin: 'anode', label: 'Rectified DC (+) to Capacitor Anode' },
        { fromComp: 'rect1', fromPin: 'dc_pos', toComp: 'bulb1', toPin: 'pin1', label: 'Smoothed DC (+) to Bulb A' },
        { fromComp: 'rect1', fromPin: 'dc_neg', toComp: 'cap1', toPin: 'cathode', label: 'Rectified DC (-) to Capacitor Cathode' },
        { fromComp: 'rect1', fromPin: 'dc_neg', toComp: 'bulb1', toPin: 'pin2', label: 'Smoothed DC (-) to Bulb B' }
      ]
    },
    checkWin: (status, components) => {
      const rect = components.find(c => c.type === 'rectifier' && c.state.powered);
      const cap = components.find(c => c.type === 'capacitor');
      const bulb = components.find(c => c.type === 'bulb' && c.state.powered && !c.state.burnt);
      return !!rect && !!cap && cap.state.storedVoltage > 3.0 && !!bulb && !status.circuitFailed;
    }
  },

  {
    id: 23,
    title: 'Level 23: Ceramic Decoupling & EIA Code Master (104 Decoupling Lab)',
    category: 'Capacitors',
    badge: 'Code Decoder',
    summary: 'Master the 3-digit EIA standard capacitor code (104 = 100nF)! Connect a Ceramic Disc Capacitor to bypass high-frequency electrical noise without any polarity worries.',
    instructions: 'Examine the stamped EIA code: 104 means 10 followed by 4 zeros in picofarads = 100,000 pF = 100 nF = 0.1 µF! Connect the Ceramic Capacitor across the Battery rails with the Buzzer. Click the stepper to explore 102, 103, and 104 codes!',
    hint: 'Battery (+) -> Switch -> Resistor -> Buzzer (+) AND Ceramic Capacitor t1. Battery (-) -> Buzzer (-) AND Ceramic Capacitor t2. Notice ceramic capacitors are non-polarized: either lead can go to (+) or (-)!',
    theory: 'Unlike electrolytic capacitors which have polarity markings (+/−) and large capacitance for DC reservoir storage, Ceramic Disc Capacitors are non-polarized and excel at high-frequency RF noise suppression and digital decoupling due to negligible internal inductance.',
    allowedComponents: ['battery', 'switch', 'ceramic_capacitor', 'buzzer', 'resistor'],
    initialComponents: [
      { type: 'battery', x: 80, y: 200, id: 'bat1' },
      { type: 'switch', x: 260, y: 130, id: 'sw1' },
      { type: 'ceramic_capacitor', x: 460, y: 270, id: 'cer1', stateProps: { ceramicCode: '104', capacitanceNf: 100, capacitanceUf: 0.1, capacitancePf: 100000, capacitance: 0.1 } },
      { type: 'resistor', x: 460, y: 130, id: 'res1', stateProps: { resistance: 100 } },
      { type: 'buzzer', x: 680, y: 200, id: 'buzz1' }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switch ➔ Resistor ➔ Buzzer (+) & Ceramic Cap (t1) | Buzzer (-) & Ceramic Cap (t2) ➔ Bat (-)',
      circuitType: 'High-Frequency Decoupling / Noise Bypass Filter',
      explanation: 'Connect Battery (+) to Switch Pin 1, Switch Pin 2 to Resistor Pin 1. Wire Resistor Pin 2 to Buzzer (+) and Ceramic Capacitor Terminal 1 (t1). Connect Buzzer (-) and Ceramic Capacitor Terminal 2 (t2) to Battery (-).',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Pin 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'res1', toPin: 'pin1', label: 'Switch to Resistor Pin 1' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'buzz1', toPin: 'pin1', label: 'Resistor to Buzzer (+)' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'cer1', toPin: 't1', label: 'Resistor to Ceramic Cap Terminal 1' },
        { fromComp: 'buzz1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Buzzer (-) Return to Battery (-)' },
        { fromComp: 'cer1', fromPin: 't2', toComp: 'bat1', toPin: 'neg', label: 'Ceramic Cap Terminal 2 to Ground' }
      ]
    },
    checkWin: (status, components) => {
      const cer = components.find(c => c.type === 'ceramic_capacitor');
      const buzz = components.find(c => c.type === 'buzzer' && !c.state.burnt);
      return !!cer && (cer.state.storedVoltage > 1.5 || cer.state.powered) && !!buzz && buzz.state.powered && !status.circuitFailed;
    }
  },

  {
    id: 24,
    title: "Level 24: Kirchhoff's Current Law (KCL: Particle Splitting Lab)",
    category: 'Laws',
    badge: 'KCL Master',
    summary: 'Witness the Conservation of Charge in action! Connect two parallel branches to observe the incoming current split: I_in = I_1 + I_2.',
    instructions: 'Wire the 9V Battery to two parallel branch resistors: 100Ω and 220Ω. Watch the dense electron particle swarm split smoothly at the wire junction node in exact proportion to the branch resistances!',
    hint: 'Battery (+) to a wire junction dividing to Resistor 1 (100Ω) and Resistor 2 (220Ω). Connect the other leads together at a return junction back to Battery (-).',
    theory: "Kirchhoff's Current Law (KCL) dictates that charge cannot be created or destroyed: the total current entering any electrical junction must equal the total current exiting (∑ I_in = ∑ I_out). Lower resistance branches carry proportionately more particles (I = V / R)!",
    allowedComponents: ['battery', 'resistor', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 80, y: 200, id: 'bat1' },
      { type: 'resistor', x: 420, y: 120, id: 'res1', stateProps: { resistance: 100 } },
      { type: 'resistor', x: 420, y: 280, id: 'res2', stateProps: { resistance: 220 } }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Branch 1 (100Ω) & Branch 2 (220Ω) in Parallel ➔ Battery (-)',
      circuitType: 'Parallel Branch Current Divider (KCL)',
      explanation: 'Connect Battery (+) to both Resistor 1 Pin 1 (100Ω) and Resistor 2 Pin 1 (220Ω). Connect both Resistor 1 Pin 2 and Resistor 2 Pin 2 back to Battery (-). The incoming current splits according to KCL: I_in = I_1 + I_2.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res1', toPin: 'pin1', label: 'Battery (+) to Branch 1 Resistor (100Ω)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'res2', toPin: 'pin1', label: 'Battery (+) to Branch 2 Resistor (220Ω)' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Branch 1 Return to Battery (-)' },
        { fromComp: 'res2', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Branch 2 Return to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const r1 = components.find(c => c.id === 'res1' && c.state.powered);
      const r2 = components.find(c => c.id === 'res2' && c.state.powered);
      return !!r1 && !!r2 && status.isComplete && !status.circuitFailed;
    }
  },

  {
    id: 25,
    title: 'Level 25: Voltage Division & Multimeter Needle Sweep (V_out = V · R₂ / (R₁ + R₂))',
    category: 'Laws',
    badge: 'Divider Guru',
    usesMultimeter: true,
    multimeterMode: 'dcv',
    summary: 'Master the 3-terminal Potentiometer voltage divider and watch the multimeter voltage sweep live with dial rotation!',
    instructions: 'Wire the Battery across Terminal 1 (pin1) and Terminal 3 (pin2) of the Potentiometer. The top menu Digital Multimeter is active: connect its V/Ω/mA lead to the center Wiper (wiper) and COM lead to Terminal 3 (or drag the probes). Rotate the knob to sweep divided output voltage V_out!',
    hint: 'Battery (+) -> Potentiometer Terminal 1 (pin1). Battery (-) -> Potentiometer Terminal 3 (pin2). Multimeter V/Ω/mA -> Potentiometer center Wiper (wiper). Multimeter COM -> Potentiometer Terminal 3 (pin2). Rotate the knob to see voltage change!',
    theory: "A voltage divider uses two resistances in series to create a fraction of the input voltage: V_out = V_in · [R₂ / (R₁ + R₂)]. When the potentiometer wiper slides along the resistive track, it continuously adjusts R₁ and R₂, smoothly sweeping output potential from 0V up to full battery voltage!",
    allowedComponents: ['battery', 'potentiometer'],
    initialComponents: [
      { type: 'battery', x: 100, y: 220, id: 'bat1' },
      { type: 'potentiometer', x: 420, y: 190, id: 'pot1', stateProps: { resistance: 500, wiperRatio: 0.5 } }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Pot Pin 1 | Bat (-) ➔ Pot Pin 3 | Meter V/Ω/mA ➔ Pot Wiper | Meter COM ➔ Pot Pin 3',
      circuitType: '3-Terminal Potentiometer Voltage Divider',
      explanation: 'Connect Battery (+) to Potentiometer Terminal 1 (pin1) and Battery (-) to Terminal 3 (pin2). Connect Multimeter V/Ω/mA to the center Wiper (wiper), and Multimeter COM to Terminal 3 (pin2). Rotating the dial sweeps divided output voltage V_out.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'pot1', toPin: 'pin1', label: 'Battery (+) to Potentiometer Terminal 1' },
        { fromComp: 'bat1', fromPin: 'neg', toComp: 'pot1', toPin: 'pin2', label: 'Battery (-) to Potentiometer Terminal 3' },
        { fromComp: 'multimeter_tool', fromPin: 'vin', toComp: 'pot1', toPin: 'wiper', label: 'Multimeter V/Ω/mA to Potentiometer Wiper' },
        { fromComp: 'multimeter_tool', fromPin: 'com', toComp: 'pot1', toPin: 'pin2', label: 'Multimeter COM to Potentiometer Terminal 3' }
      ]
    },
    checkWin: (status, components, app) => {
      const pot = components.find(c => c.type === 'potentiometer' && c.state.powered);
      const mm = components.find(c => c.type === 'multimeter');
      const mmCompReading = mm ? (mm.state.displayStr || '') : '';
      const mmToolReading = (app && app.multimeterReading) ? app.multimeterReading.value : (status.multimeterReading ? status.multimeterReading.value : '');
      const display = mmToolReading || mmCompReading || '';
      const hasReading = display.includes('V') && !display.startsWith('0.00') && !display.startsWith('+0.00') && !display.startsWith('-0.00') && !display.includes('O.L');
      const hasVoltage = hasReading || (!app && !display && pot && (pot.state.wiperVoltage > 0 || (pot.state.voltageDrop > 0 && (pot.state.wiperRatio !== undefined ? pot.state.wiperRatio > 0 : true))));
      return !!pot && hasVoltage && !status.circuitFailed;
    }
  },

  {
    id: 26,
    title: 'Level 26: RC Time Constant & Nightlight Fade-Out Timer (τ = R × C)',
    category: 'RC Circuits',
    badge: 'Timer Engineer',
    summary: 'Create a smooth exponential fade-out nightlight timer using an RC circuit: V(t) = V₀ · e^(-t / τ) where τ = R × C.',
    instructions: 'Wire the 9V Battery through a Switch to charge the 1000µF Capacitor and power the LED nightlight. When you toggle the switch OFF, watch the capacitor smoothly keep the LED glowing as it exponentially dims over several seconds!',
    hint: 'Battery (+) -> Switch pin 1. Switch pin 2 -> Capacitor Anode (+) AND Resistor (470Ω). Resistor -> LED Anode (+). Return Capacitor Cathode (-) and LED Cathode (-) to Battery (-). Turn ON to charge, then turn OFF to observe the RC fade-out!',
    theory: 'The product of resistance and capacitance defines the RC time constant τ = R × C (in seconds). During discharge through the load, voltage decays exponentially according to V(t) = V₀ · e^(-t/τ). After one time constant (1τ), voltage falls to 36.8%, providing a smooth, gentle fade-out!',
    allowedComponents: ['battery', 'switch', 'capacitor', 'resistor', 'led'],
    initialComponents: [
      { type: 'battery', x: 80, y: 220, id: 'bat1' },
      { type: 'switch', x: 260, y: 140, id: 'sw1' },
      { type: 'capacitor', x: 440, y: 300, id: 'cap1', stateProps: { capacitance: 1000, ratedVoltage: 16 } },
      { type: 'resistor', x: 440, y: 120, id: 'res1', stateProps: { resistance: 470 } },
      { type: 'led', x: 670, y: 200, id: 'led1', stateProps: { color: 'yellow' } }
    ],
    referenceSolution: {
      summary: 'Bat (+) ➔ Switch | Switch ➔ Cap (+) & Resistor ➔ LED (+) | Cap (-) & LED (-) ➔ Bat (-)',
      circuitType: 'RC Low-Pass / Exponential Decay Nightlight Timer',
      explanation: 'Connect Battery (+) to Switch Pin 1. From Switch Pin 2, feed both Capacitor Anode (anode) and Resistor Pin 1. Wire Resistor Pin 2 to LED Anode (anode). Return Capacitor Cathode and LED Cathode to Battery (-). When the switch opens, the capacitor discharges exponentially through the resistor and LED.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Pin 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'cap1', toPin: 'anode', label: 'Switched Feed to Capacitor Anode' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'res1', toPin: 'pin1', label: 'Switched Feed to Resistor Pin 1' },
        { fromComp: 'res1', fromPin: 'pin2', toComp: 'led1', toPin: 'anode', label: 'Resistor to LED Anode (+)' },
        { fromComp: 'cap1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'Capacitor Cathode (-) to Battery (-)' },
        { fromComp: 'led1', fromPin: 'cathode', toComp: 'bat1', toPin: 'neg', label: 'LED Cathode (-) to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const cap = components.find(c => c.type === 'capacitor');
      const led = components.find(c => c.type === 'led' && !c.state.burnt);
      return !!cap && (cap.state.storedVoltage > 2.0 || cap.state.chargePercent > 20) && !!led && !status.circuitFailed;
    }
  },

  {
    id: 27,
    title: 'Level 27: Electromagnetism & Solenoid Actuator (B = μ·n·I Pinball Flipper)',
    category: 'Electromagnetism',
    badge: 'Magnetic Master',
    summary: 'Harness Ampere and Faraday’s electromagnetic principles: energize a Solenoid coil to snap down a pinball flipper or crane magnet with magnetic flux B = μ·n·I!',
    instructions: 'Wire the 9V Battery to the Solenoid through a Switch. When you close the switch, current rushes through the copper coil, generating magnetic flux (B = μ·n·I) that pulls the steel plunger and snaps the flipper arm down!',
    hint: 'Battery (+) -> Switch pin 1. Switch pin 2 -> Solenoid Lead A (pin1). Solenoid Lead B (pin2) -> Battery (-). Close the switch to energize the coil!',
    theory: 'When electric current flows through a helical coil of wire, it creates a concentrated magnetic field inside the core: B = μ · n · I. The resulting magnetic attraction pulls ferromagnetic steel cores with force F ∝ B², powering real-world pinball flippers, car starter relays, and high-speed door chimes!',
    allowedComponents: ['battery', 'switch', 'solenoid', 'resistor'],
    initialComponents: [
      { type: 'battery', x: 80, y: 200, id: 'bat1' },
      { type: 'switch', x: 280, y: 200, id: 'sw1' },
      { type: 'solenoid', x: 520, y: 190, id: 'sol1' }
    ],
    referenceSolution: {
      summary: 'Battery (+) ➔ Switch Pin 1 ➔ Switch Pin 2 ➔ Solenoid Coil A ➔ Solenoid Coil B ➔ Battery (-)',
      circuitType: 'Electromagnetic Actuator Solenoid Driver',
      explanation: 'Connect Battery (+) to Switch Pin 1, Switch Pin 2 to Solenoid Coil A (pin1), and Solenoid Coil B (pin2) to Battery (-). Closing the switch unleashes current through the 500-turn coil, generating magnetic flux B = μ·n·I to snap the plunger.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'sw1', toPin: 'pin1', label: 'Battery (+) to Switch Pin 1' },
        { fromComp: 'sw1', fromPin: 'pin2', toComp: 'sol1', toPin: 'pin1', label: 'Switched Power to Solenoid Coil A' },
        { fromComp: 'sol1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'Solenoid Coil B to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const sol = components.find(c => c.type === 'solenoid' && c.state.powered && !c.state.burnt);
      return !!sol && !status.circuitFailed;
    }
  },

  {
    id: 28,
    title: 'Level 28: Transistor Switching & Automatic Darkness Night-Lamp (I_c = β · I_b)',
    category: 'Transistors',
    badge: 'Transistor Genius',
    summary: 'Build an automatic night-lamp using an NPN transistor and an LDR light sensor! When darkness falls, the base bias rises above 0.65V to conduct collector current I_c = β·I_b.',
    instructions: 'Wire a 9V Battery to an NPN Transistor. Place the 100Ω Resistor and Incandescent Bulb in the Collector circuit. Connect an LDR from Base to Ground, and a 10kΩ Resistor from Battery (+) to Base. In daylight, the lamp stays OFF; in darkness, the lamp switches ON automatically!',
    hint: 'Battery (+) -> Bulb -> Collector (c). Battery (+) -> 10kΩ Resistor -> Base (b). Base (b) -> LDR -> Battery (-). Emitter (e) -> Battery (-). Click the LDR to toggle light/dark!',
    theory: 'A Bipolar Junction Transistor (BJT) acts as a current amplifier and switch. When base-emitter voltage V_be < 0.65V, the transistor is in CUTOFF (switch OFF). When the LDR darkens, its resistance increases, pulling V_be above 0.65V into SATURATION, unleashing amplified collector current (I_c = β · I_b) to illuminate the lamp!',
    allowedComponents: ['battery', 'npn', 'ldr', 'resistor', 'bulb'],
    initialComponents: [
      { type: 'battery', x: 70, y: 220, id: 'bat1' },
      { type: 'resistor', x: 260, y: 110, id: 'r_base', stateProps: { resistance: 10000 } },
      { type: 'ldr', x: 260, y: 320, id: 'ldr1' },
      { type: 'npn', x: 450, y: 220, id: 'npn1' },
      { type: 'bulb', x: 650, y: 120, id: 'bulb1' }
    ],
    referenceSolution: {
      summary: 'Load: Bat (+) ➔ Bulb ➔ NPN (c) | Emitter (e) ➔ Bat (-) | Bias Divider: Bat (+) ➔ 10kΩ ➔ Base (b) ➔ LDR ➔ Bat (-)',
      circuitType: 'Optical Automatic Darkness Sensor Switch',
      explanation: 'Connect Battery (+) to Bulb Terminal A, Bulb Terminal B to NPN Collector (c), and NPN Emitter (e) to Battery (-). Form the base voltage divider: Battery (+) to 10kΩ Resistor (r_base), resistor to NPN Base (b), and Base (b) through LDR (ldr1) to Battery (-). Darkness raises LDR resistance, biasing the base ON and illuminating the lamp.',
      connections: [
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'bulb1', toPin: 'pin1', label: 'Battery (+) to Bulb Terminal A' },
        { fromComp: 'bulb1', fromPin: 'pin2', toComp: 'npn1', toPin: 'c', label: 'Bulb Terminal B to NPN Collector (c)' },
        { fromComp: 'npn1', fromPin: 'e', toComp: 'bat1', toPin: 'neg', label: 'NPN Emitter (e) to Battery (-)' },
        { fromComp: 'bat1', fromPin: 'pos', toComp: 'r_base', toPin: 'pin1', label: 'Battery (+) to 10kΩ Bias Resistor' },
        { fromComp: 'r_base', fromPin: 'pin2', toComp: 'npn1', toPin: 'b', label: 'Bias Resistor to NPN Base (b)' },
        { fromComp: 'npn1', fromPin: 'b', toComp: 'ldr1', toPin: 'pin1', label: 'NPN Base (b) to LDR Pin 1' },
        { fromComp: 'ldr1', fromPin: 'pin2', toComp: 'bat1', toPin: 'neg', label: 'LDR Pin 2 to Battery (-)' }
      ]
    },
    checkWin: (status, components) => {
      const npn = components.find(c => c.type === 'npn');
      const bulb = components.find(c => c.type === 'bulb' && !c.state.burnt);
      return !!npn && npn.state.conducting && !!bulb && bulb.state.powered && !status.circuitFailed;
    }
  }
];

window.GAME_LEVELS = GAME_LEVELS;
