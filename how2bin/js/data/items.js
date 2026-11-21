/**
 * Waste Items Dataset for how2bin
 * Fully calibrated for the 4-Bin Standard from the user's reference image:
 * 1. Green Bin: Wet / Biodegradable Waste (Leaf symbol)
 * 2. Blue Bin: Dry / Recyclable Waste (Recycling 3-arrow Mobius symbol)
 * 3. Red Bin: Sanitary Waste (Biohazard symbol)
 * 4. Black Bin: Special Care / Domestic Hazardous Waste (Trash / Special waste symbol)
 * 
 * Features child-friendly, everyday items that children use at school, home, and play!
 */

const WASTE_ITEMS = [
  // ==========================================
  // 1. GREEN BIN: WET / BIODEGRADABLE WASTE
  // ==========================================
  {
    id: 'banana_peel',
    name: 'Banana Peel',
    icon: '🍌',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 50,
    hint: 'Lunchbox fruit peels break down naturally into nutrient-rich soil!',
    safetyTip: 'Compost fruit peels to make free plant food and reduce landfill methane gas.',
    incorrectFeedback: {
      blue: 'Banana peels are wet and organic! They ruin clean paper and recyclable plastics in the Blue bin.',
      red: 'Banana peels are food compost, not sanitary waste! Place them in the Green Wet bin.',
      black: 'Banana peels are pure organic matter, not dangerous toxic chemicals or e-waste.'
    }
  },
  {
    id: 'apple_core',
    name: 'Apple Core',
    icon: '🍏',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 50,
    hint: 'Leftover apple pieces turn into black gold compost for our garden.',
    safetyTip: 'Always remove plastic fruit price stickers before composting!',
    incorrectFeedback: {
      blue: 'Organic fruit scraps dirty clean recycling paper and plastics.',
      red: 'Apples are food scraps, not sanitary items or soiled dressings!',
      black: 'Apples are completely organic and safe for soil, not hazardous waste.'
    }
  },
  {
    id: 'sandwich_crusts',
    name: 'School Lunch Sandwich Crusts',
    icon: '🥪',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 45,
    hint: 'Leftover bread crusts from your lunchbox break down quickly in compost!',
    safetyTip: 'Bread and sandwich crusts feed hungry compost microbes.',
    incorrectFeedback: {
      blue: 'Bread scraps grease up and destroy dry paper and cardboard!',
      red: 'Food leftovers belong in the Green wet bin, never in sanitary waste.',
      black: 'Bread crusts are organic food waste, not domestic hazardous trash.'
    }
  },
  {
    id: 'orange_peel',
    name: 'Orange & Clementine Peels',
    icon: '🍊',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 45,
    hint: 'Citrus fruit peels give compost a fresh, zesty scent!',
    safetyTip: 'Natural fruit rinds rot down into nutritious humus for plants.',
    incorrectFeedback: {
      blue: 'Wet citrus peels ruin dry paper recycling batches.',
      red: 'Fruit peels belong in the Green wet waste bin.',
      black: 'Fruit rinds are natural, not hazardous chemicals.'
    }
  },
  {
    id: 'watermelon_rind',
    name: 'Watermelon Slice Rind',
    icon: '🍉',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 50,
    hint: 'Watermelon rinds are mostly water and break down super fast in the compost bin!',
    safetyTip: 'Keep plastic wrap and forks off watermelon rinds before binning.',
    incorrectFeedback: {
      blue: 'Watermelon juice makes recyclable paper soggy and moldy.',
      red: 'Melon rinds are kitchen wet waste, not sanitary products.',
      black: 'Watermelon is biodegradable wet waste, not special hazmat.'
    }
  },
  {
    id: 'carrot_sticks',
    name: 'Uneaten Carrot Sticks',
    icon: '🥕',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 40,
    hint: 'Crispy veggie snacks turn into rich plant food in the Green bin.',
    safetyTip: 'Raw vegetables rot down cleanly without odors if composted properly.',
    incorrectFeedback: {
      blue: 'Vegetable scraps contaminate clean dry recyclables in the Blue bin.',
      red: 'Carrots belong in the Green wet bin, not the Red sanitary bin.',
      black: 'Vegetables are natural plant matter, not hazardous waste.'
    }
  },
  {
    id: 'popcorn_leftover',
    name: 'Leftover Movie Popcorn',
    icon: '🍿',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 40,
    hint: 'Popped corn kernels are pure corn grain—earthworms love them!',
    safetyTip: 'Separate the popcorn from any plastic bag before composting.',
    incorrectFeedback: {
      blue: 'Greasy popcorn ruins clean paper in the Blue recycling bin.',
      red: 'Popcorn is food waste for the Green bin.',
      black: 'Popcorn is 100% organic snack waste.'
    }
  },
  {
    id: 'dry_leaves',
    name: 'Garden Trimmings & Leaves',
    icon: '🍂',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 40,
    hint: 'Brown dry leaves provide essential carbon balance to compost piles.',
    safetyTip: 'Fallen leaves and garden trimmings are valuable brown compost.',
    incorrectFeedback: {
      blue: 'Garden trimmings cannot be remanufactured at recycling mills; compost them!',
      red: 'Leaves are natural garden waste, not sanitary waste.',
      black: 'Leaves are non-toxic organic garden waste.'
    }
  },
  {
    id: 'tea_bag',
    name: 'Used Tea Bag & Leaves',
    icon: '🫖',
    category: 'green',
    targetBin: 'green',
    prepRequired: 'separate',
    prepAction: 'Remove staple & tag',
    prepPrompt: 'Separate the tiny metal staple and plastic tag before composting tea leaves!',
    points: 60,
    hint: 'Tea leaves make wonderful organic fertilizer once staples are removed.',
    safetyTip: 'Always check if tea bags have tiny metal staples or plastic strings first.',
    incorrectFeedback: {
      blue: 'Wet tea leaves contaminate clean cardboard and paper.',
      red: 'Tea leaves are herbal beverages, not hospital or sanitary waste.',
      black: 'Tea leaves are pure plant herbs, safe for wet waste compost.'
    }
  },
  {
    id: 'egg_shells',
    name: 'Crushed Egg Shells',
    icon: '🥚',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 45,
    hint: 'Eggshells provide valuable calcium minerals to garden soil.',
    safetyTip: 'Crushing eggshells slightly helps them break down faster.',
    incorrectFeedback: {
      blue: 'Eggshells cannot be processed by recycling machinery.',
      red: 'Eggshells are kitchen organics, not sanitary products.',
      black: 'Eggshells are harmless natural minerals.'
    }
  },
  {
    id: 'coffee_grounds',
    name: 'Used Coffee Grounds',
    icon: '☕',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 50,
    hint: 'Coffee grounds are rich in nitrogen, earthworms absolutely love them!',
    safetyTip: 'Used coffee grounds and paper filters can go straight into compost.',
    incorrectFeedback: {
      blue: 'Wet coffee grounds stain and destroy dry paper and cardboard!',
      red: 'Coffee grounds are kitchen wet waste, not sanitary products.',
      black: 'Coffee grounds are natural food leftovers, not chemical hazards.'
    }
  },
  {
    id: 'food_leftovers',
    name: 'Cooked Rice & Dinner Leftovers',
    icon: '🍲',
    category: 'green',
    targetBin: 'green',
    prepRequired: null,
    prepAction: null,
    points: 50,
    hint: 'Leftover cooked food is biodegradable wet waste.',
    safetyTip: 'Never throw food into dry recycling—it creates foul odors and bugs!',
    incorrectFeedback: {
      blue: 'Food leftovers will ruin clean paper and plastic recycling batches.',
      red: 'Food leftovers belong in the Green bin for wet biodegradable waste.',
      black: 'Food leftovers are organic waste, not domestic hazardous items.'
    }
  },

  // ==========================================
  // 2. BLUE BIN: DRY / RECYCLABLE WASTE
  // ==========================================
  {
    id: 'juice_box',
    name: 'Empty School Juice Box',
    icon: '🧃',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'crush',
    prepAction: 'Flatten juice carton',
    prepPrompt: 'Drink every drop and flatten the carton to save space in the Blue bin!',
    points: 60,
    hint: 'Cartons and tetra paks have high quality paper fibers that make new books.',
    safetyTip: 'Make sure it is empty so sweet juice doesn’t spill on dry papers.',
    incorrectFeedback: {
      green: 'Juice boxes have plastic/foil layers that never rot in compost piles!',
      red: 'Juice boxes are clean recyclables, not sanitary waste.',
      black: 'Clean empty cartons belong in the Blue dry recycling bin.'
    }
  },
  {
    id: 'school_notebook_paper',
    name: 'Used Homework & Drawing Paper',
    icon: '📝',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: null,
    prepAction: null,
    points: 50,
    hint: 'Clean sheets of notebook paper can be pulped and remade into new paper 7 times!',
    safetyTip: 'Keep paper dry! Water and grease break down paper fibers prematurely.',
    incorrectFeedback: {
      green: 'Clean writing paper is much better recycled into new notebooks in the Blue bin!',
      red: 'School papers are dry recyclables, not sanitary items.',
      black: 'Paper is valuable dry recyclable material, not hazardous waste.'
    }
  },
  {
    id: 'broken_plastic_ruler',
    name: 'Broken Plastic School Ruler',
    icon: '📐',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: null,
    prepAction: null,
    points: 55,
    hint: 'Rigid plastic school supplies can be shredded and melted into new items.',
    safetyTip: 'Plastic items should be clean and dry before recycling.',
    incorrectFeedback: {
      green: 'Plastic rulers take 500 years to break down; never put plastics in compost!',
      red: 'Plastic rulers are dry recyclables, not sanitary waste.',
      black: 'Non-electronic plastic items belong in the Blue dry recycling bin.'
    }
  },
  {
    id: 'empty_glue_stick',
    name: 'Empty Craft Glue Stick Tube',
    icon: '🧪',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'rinse',
    prepAction: 'Rinse out glue residue',
    prepPrompt: 'Twist the stick all the way out and wipe dry so plastic can be recycled!',
    points: 60,
    hint: 'Hard polypropylene plastic glue tubes can be remelted into plastic bins.',
    safetyTip: 'Ensure the glue tube is fully used up before placing in recycling.',
    incorrectFeedback: {
      green: 'Plastic glue tubes will contaminate natural compost soil.',
      red: 'Craft supplies belong in Blue dry recyclables, not sanitary waste.',
      black: 'Non-toxic kids glue containers belong in Blue recycling when empty.'
    }
  },
  {
    id: 'cereal_box',
    name: 'Breakfast Cereal Cardboard Box',
    icon: '🥣',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'flatten',
    prepAction: 'Flatten box flat',
    prepPrompt: 'Flatten the cereal box to make space for more recyclables!',
    points: 55,
    hint: 'Cardboard boxes are 100% recyclable into new packaging.',
    safetyTip: 'Remember to remove the inner plastic cereal bag first!',
    incorrectFeedback: {
      green: 'Large dry cardboard boxes belong in the Blue recycling bin.',
      red: 'Cereal boxes are clean paper recyclables, not sanitary waste.',
      black: 'Clean cardboard is recyclable in the Blue bin.'
    }
  },
  {
    id: 'chocolate_foil_wrapper',
    name: 'Clean Chocolate Bar Foil Wrap',
    icon: '🍫',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'crush',
    prepAction: 'Scrunch into a foil ball',
    prepPrompt: 'Scrunch clean foil into a ball so recycling sorting magnets can grab it!',
    points: 55,
    hint: 'Clean aluminum foil is 100% recyclable into new metal parts and cans.',
    safetyTip: 'Only recycle clean foil; wipe off melted chocolate drops first.',
    incorrectFeedback: {
      green: 'Metal foil never decomposes in garden soil.',
      red: 'Clean foil is dry recyclable metal, not sanitary waste.',
      black: 'Clean aluminum foil belongs in the Blue dry recycling bin.'
    }
  },
  {
    id: 'plastic_water_bottle',
    name: 'Plastic Water Bottle (PET #1)',
    icon: '🧴',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'crush',
    prepAction: 'Empty & crush',
    prepPrompt: 'Empty every drop of water and crush to save space in the Blue bin!',
    points: 55,
    hint: 'Clear PET plastic bottles get recycled into warm fleece jackets and playground equipment!',
    safetyTip: 'Keep bottle caps screwed on so they get recycled together.',
    incorrectFeedback: {
      green: 'Plastic bottles never decompose in compost; place in the Blue bin!',
      red: 'Water bottles belong in the Blue dry recyclable bin.',
      black: 'Empty plastic bottles are clean recyclables, not hazardous waste.'
    }
  },
  {
    id: 'soda_can',
    name: 'Aluminum Soda Can',
    icon: '🥫',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'crush',
    prepAction: 'Crush can flat',
    prepPrompt: 'Crush the empty can flat to save space in the recycling truck!',
    points: 60,
    hint: 'Aluminum can be melted and recycled forever without losing quality!',
    safetyTip: 'Ensure cans are completely empty so leftover liquid doesn’t splash.',
    incorrectFeedback: {
      green: 'Metal cans never decompose in compost and will damage garden soil!',
      red: 'Aluminum cans are clean recyclables, not sanitary waste.',
      black: 'Clean aluminum is valuable dry recyclables, not hazardous trash.'
    }
  },
  {
    id: 'cardboard_box',
    name: 'Clean Shipping Box',
    icon: '📦',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'flatten',
    prepAction: 'Flatten cardboard',
    prepPrompt: 'Flatten the cardboard box to leave room for other recyclables!',
    points: 55,
    hint: 'Corrugated cardboard fibers can be made into new shipping boxes 7 times!',
    safetyTip: 'Remove plastic bubble wrap and sticky tape before recycling.',
    incorrectFeedback: {
      green: 'Large shipping boxes take too long to break down in small compost bins.',
      red: 'Cardboard boxes are dry paper recyclables, not sanitary waste.',
      black: 'Clean cardboard is fully recyclable in the Blue bin.'
    }
  },
  {
    id: 'glass_jam_jar',
    name: 'Clear Glass Jam Jar',
    icon: '🫙',
    category: 'blue',
    targetBin: 'blue',
    prepRequired: 'rinse',
    prepAction: 'Rinse sticky residue',
    prepPrompt: 'Rinse the sticky sweet jam out so ants don’t swarm the recycling!',
    points: 65,
    hint: 'Glass is 100% recyclable and can be melted into new glass endlessly.',
    safetyTip: 'Do not smash glass—keep jars whole for safe factory handling.',
    incorrectFeedback: {
      green: 'Glass never rots in compost and creates sharp hazards for worms and soil!',
      red: 'Glass jars are dry recyclables, not sanitary waste.',
      black: 'Clean glass containers belong in the Blue dry recyclables bin.'
    }
  },

  // ==========================================
  // 3. RED BIN: SANITARY WASTE
  // ==========================================
  {
    id: 'used_bandaid',
    name: 'Used Adhesive Band-Aid',
    icon: '🩹',
    category: 'red',
    targetBin: 'red',
    prepRequired: 'wrap',
    prepAction: 'Wrap in tissue paper',
    prepPrompt: 'Wrap the used plaster in tissue before dropping into the Red bin!',
    points: 70,
    hint: 'Band-Aids peeled off scraped knees contain bodily fluids and germs.',
    safetyTip: 'Always wrap used plasters hygienically; never leave them on floors or benches.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Adhesive bandages have synthetic glue and germs; never compost!',
      blue: 'Band-Aids are biological sanitary waste, not dry clean recycling.',
      black: 'Used plasters belong in the Red Sanitary bin for high-temperature incineration.'
    }
  },
  {
    id: 'snotty_tissue',
    name: 'Used Runny-Nose Cold Tissue',
    icon: '🤧',
    category: 'red',
    targetBin: 'red',
    prepRequired: 'wrap',
    prepAction: 'Fold securely in paper',
    prepPrompt: 'Fold the tissue securely so virus germs don’t spread to others!',
    points: 65,
    hint: 'Tissues used for blowing runny noses carry cold viruses and germs.',
    safetyTip: 'Throw germy tissues into the Red Sanitary bin and wash hands with soap!',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Cold viruses and mucus can spread pathogens in open compost.',
      blue: 'Used dirty tissues contaminate clean paper recycling batches!',
      black: 'Germy tissues belong in the Red Sanitary bin.'
    }
  },
  {
    id: 'baby_diaper',
    name: 'Younger Sibling Baby Diaper',
    icon: '🚼',
    category: 'red',
    targetBin: 'red',
    prepRequired: 'wrap',
    prepAction: 'Wrap securely in paper',
    prepPrompt: 'Wrap the diaper tightly in newspaper before dropping into the Red bin!',
    points: 75,
    hint: 'Diapers contain biological waste and must go into the Red Sanitary bin.',
    safetyTip: 'Never throw diapers in the Blue or Green bins—wrap securely for hygiene!',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Biological pathogens in diapers ruin garden compost and spread dangerous diseases!',
      blue: 'Diapers are heavily contaminated; never place them in dry recycling!',
      black: 'Diapers belong specifically in the Red Sanitary Waste bin.'
    }
  },
  {
    id: 'blood_bandage',
    name: 'Soiled Bandage & Gauze',
    icon: '🩹',
    category: 'red',
    targetBin: 'red',
    prepRequired: 'wrap',
    prepAction: 'Wrap in paper wrapper',
    prepPrompt: 'Wrap blood-stained dressings carefully before dropping into the Red bin.',
    points: 70,
    hint: 'Dressings with blood or bodily fluids must go into Red Sanitary waste.',
    safetyTip: 'Wear gloves or use tongs when handling blood-stained bandages.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Blood pathogens will contaminate natural garden compost!',
      blue: 'Blood stains destroy dry paper batches in recycling factories.',
      black: 'Soiled bandages belong in the Red Sanitary bin for bio-secure disposal.'
    }
  },
  {
    id: 'cotton_swab',
    name: 'Used Cotton Swab / Earbud',
    icon: '🥢',
    category: 'red',
    targetBin: 'red',
    prepRequired: null,
    prepAction: null,
    points: 50,
    hint: 'Used cotton swabs and cosmetic pads belong in the Red Sanitary bin.',
    safetyTip: 'Never flush cotton swabs down the toilet—they jam wastewater pumps!',
    requiresTongs: true,
    incorrectFeedback: {
      green: 'Plastic stems on swabs will poison compost soil.',
      blue: 'Used hygiene swabs are personal waste, not clean dry recycling.',
      black: 'Sanitary hygiene swabs belong in the Red Sanitary bin.'
    }
  },
  {
    id: 'sanitary_napkin',
    name: 'Sanitary Hygiene Pad',
    icon: '🩹',
    category: 'red',
    targetBin: 'red',
    prepRequired: 'wrap',
    prepAction: 'Wrap in paper pouch',
    prepPrompt: 'Wrap in paper to protect sanitation workers handling the bin!',
    points: 75,
    hint: 'Sanitary pads must be disposed of with care in the Red Sanitary bin.',
    safetyTip: 'Always wrap sanitary pads in paper. Never flush them down the toilet!',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Sanitary pads contain synthetic polymers and pathogens; never compost!',
      blue: 'Sanitary pads contaminate clean dry recyclables. Use the Red Sanitary bin.',
      black: 'Sanitary pads belong in the Red Sanitary bin for high-temperature incineration.'
    }
  },

  // ==========================================
  // 4. BLACK BIN: SPECIAL CARE & DOMESTIC HAZARDOUS WASTE
  // ==========================================
  {
    id: 'toy_aaa_battery',
    name: 'Dead Toy Remote AAA Battery',
    icon: '🔋',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'tape',
    prepAction: 'Tape battery ends',
    prepPrompt: 'Tape both positive and negative ends with clear tape to prevent fire sparks!',
    points: 80,
    hint: 'Batteries from toy cars and game remotes contain acid and fire hazards.',
    safetyTip: 'Never toss dead batteries into regular trash; they can ignite garbage trucks!',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Corrosive battery acid will poison garden soil and kill earthworms!',
      blue: 'Batteries get crushed in paper recycling machines and cause explosive fires!',
      red: 'Batteries are electrical chemical hazards, not sanitary waste.'
    }
  },
  {
    id: 'button_battery',
    name: 'Dead Watch / Toy Button Battery',
    icon: '⌚',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'tape',
    prepAction: 'Tape on both sides',
    prepPrompt: 'Tape both sides of tiny button batteries—they are a severe hazard for toddlers!',
    points: 85,
    hint: 'Shiny coin batteries are extremely dangerous if swallowed and carry toxic lithium.',
    safetyTip: 'Store coin batteries safely out of reach of younger siblings and pets.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Heavy metals from button cells contaminate natural compost soil.',
      blue: 'Tiny metal batteries spark and start paper fires in recycling facilities.',
      red: 'Coin batteries belong in the Black Special Care / Hazardous bin.'
    }
  },
  {
    id: 'kids_fever_syrup',
    name: 'Expired Kids Cough & Fever Syrup',
    icon: '🌡️',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'seal',
    prepAction: 'Tighten cap securely',
    prepPrompt: 'Tightly seal the childproof cap; never pour medicine down the sink drain!',
    points: 80,
    hint: 'Expired medicines pollute rivers and drinking water if poured down sinks or toilets.',
    safetyTip: 'Always drop old medicines in Black hazardous bins or pharmacy take-back boxes.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Active drugs in syrups kill beneficial garden microbes in compost.',
      blue: 'Syrup bottles with liquid medicine will contaminate clean recycling.',
      red: 'Pharmaceutical medicines belong in the Black Special Care container.'
    }
  },
  {
    id: 'desk_lamp_bulb',
    name: 'Burnt-Out Desk Study Bulb',
    icon: '💡',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'wrap',
    prepAction: 'Wrap in scrap paper',
    prepPrompt: 'Wrap the bulb in paper so glass shards don’t cut sanitation workers!',
    points: 70,
    hint: 'Study desk light bulbs contain tungsten filaments and heat-treated glass.',
    safetyTip: 'Bulb glass has a different melting temperature than jam jars; keep in Black bin.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Light bulbs do not rot in organic soil and pose cut hazards.',
      blue: 'Bulb glass contains metal coatings that ruin bottle recycling batches!',
      red: 'Light bulbs belong in the Black Special Waste bin.'
    }
  },
  {
    id: 'broken_headphones',
    name: 'Broken Kids Headphones & Cable',
    icon: '🎧',
    category: 'black',
    targetBin: 'black',
    prepRequired: null,
    prepAction: null,
    points: 75,
    hint: 'Broken headphones contain copper wire, magnets, and plastic circuitry (e-waste).',
    safetyTip: 'Never throw cords into regular recycling—long wires wrap around conveyor rollers!',
    incorrectFeedback: {
      green: 'Electronics and copper wiring will never rot in compost.',
      blue: 'Long cables wrap around and jam recycling conveyor wheels (tanglers)!',
      red: 'Headphones are electronic e-waste, not sanitary waste.'
    }
  },
  {
    id: 'broken_calculator',
    name: 'Old Broken School Calculator',
    icon: '📱',
    category: 'black',
    targetBin: 'black',
    prepRequired: null,
    prepAction: null,
    points: 75,
    hint: 'Contains solar panels, circuit boards, and button batteries that need e-recycling.',
    safetyTip: 'E-waste should be dismantled by certified recyclers to recover rare metals.',
    incorrectFeedback: {
      green: 'Circuit boards contain heavy metals that poison soil.',
      blue: 'Electronics cannot be processed at normal curbside paper/bottle plants.',
      red: 'Electronics belong in the Black Special Care / E-Waste bin.'
    }
  },
  {
    id: 'frayed_charger_cable',
    name: 'Frayed Tablet Charger Cable',
    icon: '🔌',
    category: 'black',
    targetBin: 'black',
    prepRequired: null,
    prepAction: null,
    points: 70,
    hint: 'Frayed charging cords are electrical fire risks and contain copper e-waste.',
    safetyTip: 'Never use frayed cords! Send them to e-waste recycling.',
    incorrectFeedback: {
      green: 'Copper wiring and plastic jackets will never rot in compost.',
      blue: 'Long cables tangle and jam conveyor belts in recycling sorting centers!',
      red: 'Cables are electronic waste, not sanitary waste.'
    }
  },
  {
    id: 'injection_needle',
    name: 'Used Insulin Syringe & Needle',
    icon: '💉',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'tongs',
    prepAction: 'Equip Safety Tongs',
    prepPrompt: 'NEVER touch needles barehanded! Use Safety Tongs to safely grip and drop.',
    points: 100,
    hint: 'Sharp needles pose severe puncture hazards and belong in the Black/Sharps container.',
    safetyTip: 'Never recap needles with hands! Always place into puncture-proof disposal.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'CRITICAL HAZARD: Needles in compost cause severe injuries to gardeners!',
      blue: 'EXTREME DANGER: Loose needles on recycling conveyor belts stab workers!',
      red: 'Rigid sharps must go into the Black Special Care container to prevent punctures!'
    }
  },
  {
    id: 'tube_light',
    name: 'Fluorescent Tube Light',
    icon: '💡',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'wrap',
    prepAction: 'Wrap carefully in sleeve',
    prepPrompt: 'Fluorescent tubes contain toxic mercury vapor! Handle gently without breaking.',
    points: 90,
    hint: 'Tube lights contain toxic mercury vapor and must go to Black Special Care disposal.',
    safetyTip: 'Never break tube lights—mercury vapor can be inhaled and causes poisoning.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Mercury vapor poisons compost soil and groundwater!',
      blue: 'Tube light glass contains hazardous mercury phosphors, not recyclable jar glass.',
      red: 'Tube lights are toxic chemical hazards, not sanitary waste.'
    }
  },
  {
    id: 'paint_can',
    name: 'Art Paint Can & Thinner',
    icon: '🎨',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'seal',
    prepAction: 'Tighten lid securely',
    prepPrompt: 'Tightly seal the lid so volatile chemical fumes do not escape!',
    points: 85,
    hint: 'Oil and solvent paints are flammable chemicals requiring Black Hazmat disposal.',
    safetyTip: 'Never pour paint down the storm drain—it poisons fish and wetlands.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Chemical solvents in paint sterilize soil and pollute crops.',
      blue: 'Wet paint coats and destroys entire trucks of clean dry recyclables.',
      red: 'Paint cans are toxic chemical hazards, not sanitary waste.'
    }
  },
  {
    id: 'blood_lancet',
    name: 'Blood Glucose Test Lancet',
    icon: '🩸',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'tongs',
    prepAction: 'Use Safety Tongs',
    prepPrompt: 'Lancets have sharp hidden blades! Always use tongs to place in Black container.',
    points: 85,
    hint: 'Lancets are sharp medical items; dispose in Black/Sharps puncture-proof container.',
    safetyTip: 'Always drop lancets directly into puncture-proof safety containers.',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Sharp steel lancets cause puncture wounds to compost workers.',
      blue: 'Sharps in dry recyclables are a severe biohazard hazard to factory workers.',
      red: 'Rigid lancet needles belong in the puncture-proof Black Special container.'
    }
  },
  {
    id: 'mercury_thermometer',
    name: 'Old Mercury Thermometer',
    icon: '🌡️',
    category: 'black',
    targetBin: 'black',
    prepRequired: 'wrap',
    prepAction: 'Place in cushioned case',
    prepPrompt: 'Mercury is a deadly neurotoxin! Cushion securely so glass does not break.',
    points: 100,
    hint: 'Mercury thermometers are dangerous hazardous domestic waste.',
    safetyTip: 'If broken, never vacuum mercury beads—they vaporize into toxic air!',
    requiresTongs: true,
    isHazardous: true,
    incorrectFeedback: {
      green: 'Mercury causes permanent neurological damage if it enters garden soil!',
      blue: 'Mercury is highly toxic and ruins all recycling plant operations.',
      red: 'Mercury is a domestic hazardous chemical for the Black bin.'
    }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WASTE_ITEMS };
}
