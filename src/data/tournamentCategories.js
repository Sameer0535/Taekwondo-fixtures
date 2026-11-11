// Official Tournament Structure & Weight Categories
// Enforces separate Regular and Freshers divisions across all official events:
// Kyorugi, Poomsae, Speed Kicking, Breaking, Virtual Taekwondo, Dasara, and Para K41/K44.

export const EVENT_TYPES = [
  'Kyorugi',
  'Poomsae',
  'Speed Kicking',
  'Breaking',
  'Virtual Taekwondo',
  'Dasara',
  'Para K41/K44'
];

export const CATEGORY_TIERS = ['Regular', 'Freshers'];

// Official Weight Categories
export const WEIGHT_CATEGORIES = {
  'Children': {
    Male: [
      { value: 'Under 18kg', label: 'Under 18kg' },
      { value: 'Under 20kg', label: 'Under 20kg' },
      { value: 'Under 22kg', label: 'Under 22kg' },
      { value: 'Under 24kg', label: 'Under 24kg' },
      { value: 'Under 26kg', label: 'Under 26kg' },
      { value: 'Under 29kg', label: 'Under 29kg' },
      { value: 'Under 32kg', label: 'Under 32kg' },
      { value: 'Under 35kg', label: 'Under 35kg' },
      { value: 'Under 38kg', label: 'Under 38kg' },
      { value: 'Over 38kg', label: 'Over 38kg' }
    ],
    Female: [
      { value: 'Under 16kg', label: 'Under 16kg' },
      { value: 'Under 18kg', label: 'Under 18kg' },
      { value: 'Under 20kg', label: 'Under 20kg' },
      { value: 'Under 22kg', label: 'Under 22kg' },
      { value: 'Under 24kg', label: 'Under 24kg' },
      { value: 'Under 26kg', label: 'Under 26kg' },
      { value: 'Under 29kg', label: 'Under 29kg' },
      { value: 'Under 32kg', label: 'Under 32kg' },
      { value: 'Under 35kg', label: 'Under 35kg' },
      { value: 'Over 35kg', label: 'Over 35kg' }
    ]
  },
  'Sub-Junior': {
    Male: [
      { value: 'Under 18kg', label: 'Under 18kg' },
      { value: 'Under 21kg', label: 'Under 21kg' },
      { value: 'Under 23kg', label: 'Under 23kg' },
      { value: 'Under 25kg', label: 'Under 25kg' },
      { value: 'Under 27kg', label: 'Under 27kg' },
      { value: 'Under 29kg', label: 'Under 29kg' },
      { value: 'Under 32kg', label: 'Under 32kg' },
      { value: 'Under 35kg', label: 'Under 35kg' },
      { value: 'Under 38kg', label: 'Under 38kg' },
      { value: 'Under 41kg', label: 'Under 41kg' },
      { value: 'Under 44kg', label: 'Under 44kg' },
      { value: 'Under 50kg', label: 'Under 50kg' }
    ],
    Female: [
      { value: 'Under 16kg', label: 'Under 16kg' },
      { value: 'Under 18kg', label: 'Under 18kg' },
      { value: 'Under 20kg', label: 'Under 20kg' },
      { value: 'Under 22kg', label: 'Under 22kg' },
      { value: 'Under 24kg', label: 'Under 24kg' },
      { value: 'Under 26kg', label: 'Under 26kg' },
      { value: 'Under 29kg', label: 'Under 29kg' },
      { value: 'Under 32kg', label: 'Under 32kg' },
      { value: 'Under 35kg', label: 'Under 35kg' },
      { value: 'Under 38kg', label: 'Under 38kg' },
      { value: 'Under 41kg', label: 'Under 41kg' },
      { value: 'Under 47kg', label: 'Under 47kg' }
    ]
  },
  'Sub Junior': { // Alias
    Male: [
      { value: 'Under 18kg', label: 'Under 18kg' },
      { value: 'Under 21kg', label: 'Under 21kg' },
      { value: 'Under 23kg', label: 'Under 23kg' },
      { value: 'Under 25kg', label: 'Under 25kg' },
      { value: 'Under 27kg', label: 'Under 27kg' },
      { value: 'Under 29kg', label: 'Under 29kg' },
      { value: 'Under 32kg', label: 'Under 32kg' },
      { value: 'Under 35kg', label: 'Under 35kg' },
      { value: 'Under 38kg', label: 'Under 38kg' },
      { value: 'Under 41kg', label: 'Under 41kg' },
      { value: 'Under 44kg', label: 'Under 44kg' },
      { value: 'Under 50kg', label: 'Under 50kg' }
    ],
    Female: [
      { value: 'Under 16kg', label: 'Under 16kg' },
      { value: 'Under 18kg', label: 'Under 18kg' },
      { value: 'Under 20kg', label: 'Under 20kg' },
      { value: 'Under 22kg', label: 'Under 22kg' },
      { value: 'Under 24kg', label: 'Under 24kg' },
      { value: 'Under 26kg', label: 'Under 26kg' },
      { value: 'Under 29kg', label: 'Under 29kg' },
      { value: 'Under 32kg', label: 'Under 32kg' },
      { value: 'Under 35kg', label: 'Under 35kg' },
      { value: 'Under 38kg', label: 'Under 38kg' },
      { value: 'Under 41kg', label: 'Under 41kg' },
      { value: 'Under 47kg', label: 'Under 47kg' }
    ]
  },
  'Cadet': {
    Male: [
      { value: 'Under 33kg', label: 'Under 33kg' },
      { value: 'Under 37kg', label: 'Under 37kg' },
      { value: 'Under 41kg', label: 'Under 41kg' },
      { value: 'Under 45kg', label: 'Under 45kg' },
      { value: 'Under 49kg', label: 'Under 49kg' },
      { value: 'Under 53kg', label: 'Under 53kg' },
      { value: 'Under 57kg', label: 'Under 57kg' },
      { value: 'Under 61kg', label: 'Under 61kg' },
      { value: 'Under 65kg', label: 'Under 65kg' },
      { value: 'Over 65kg', label: 'Over 65kg' }
    ],
    Female: [
      { value: 'Under 29kg', label: 'Under 29kg' },
      { value: 'Under 33kg', label: 'Under 33kg' },
      { value: 'Under 37kg', label: 'Under 37kg' },
      { value: 'Under 41kg', label: 'Under 41kg' },
      { value: 'Under 44kg', label: 'Under 44kg' },
      { value: 'Under 47kg', label: 'Under 47kg' },
      { value: 'Under 51kg', label: 'Under 51kg' },
      { value: 'Under 55kg', label: 'Under 55kg' },
      { value: 'Under 59kg', label: 'Under 59kg' },
      { value: 'Over 59kg', label: 'Over 59kg' }
    ]
  },
  'Junior': {
    Male: [
      { value: 'Under 45kg', label: 'Under 45kg' },
      { value: 'Under 48kg', label: 'Under 48kg' },
      { value: 'Under 51kg', label: 'Under 51kg' },
      { value: 'Under 55kg', label: 'Under 55kg' },
      { value: 'Under 59kg', label: 'Under 59kg' },
      { value: 'Under 63kg', label: 'Under 63kg' },
      { value: 'Under 68kg', label: 'Under 68kg' },
      { value: 'Under 73kg', label: 'Under 73kg' },
      { value: 'Under 78kg', label: 'Under 78kg' },
      { value: 'Over 78kg', label: 'Over 78kg' }
    ],
    Female: [
      { value: 'Under 42kg', label: 'Under 42kg' },
      { value: 'Under 44kg', label: 'Under 44kg' },
      { value: 'Under 46kg', label: 'Under 46kg' },
      { value: 'Under 49kg', label: 'Under 49kg' },
      { value: 'Under 52kg', label: 'Under 52kg' },
      { value: 'Under 55kg', label: 'Under 55kg' },
      { value: 'Under 59kg', label: 'Under 59kg' },
      { value: 'Under 63kg', label: 'Under 63kg' },
      { value: 'Under 68kg', label: 'Under 68kg' },
      { value: 'Over 68kg', label: 'Over 68kg' }
    ]
  },
  'Over 17': {
    Male: [
      { value: 'Under 54kg', label: 'Under 54kg' },
      { value: 'Under 58kg', label: 'Under 58kg' },
      { value: 'Under 63kg', label: 'Under 63kg' },
      { value: 'Under 68kg', label: 'Under 68kg' },
      { value: 'Under 74kg', label: 'Under 74kg' },
      { value: 'Under 80kg', label: 'Under 80kg' },
      { value: 'Under 87kg', label: 'Under 87kg' },
      { value: 'Over 87kg', label: 'Over 87kg' }
    ],
    Female: [
      { value: 'Under 46kg', label: 'Under 46kg' },
      { value: 'Under 49kg', label: 'Under 49kg' },
      { value: 'Under 53kg', label: 'Under 53kg' },
      { value: 'Under 57kg', label: 'Under 57kg' },
      { value: 'Under 62kg', label: 'Under 62kg' },
      { value: 'Under 67kg', label: 'Under 67kg' },
      { value: 'Under 73kg', label: 'Under 73kg' },
      { value: 'Over 73kg', label: 'Over 73kg' }
    ]
  },
  'Senior': { // Senior alias for Over 17
    Male: [
      { value: 'Under 54kg', label: 'Under 54kg' },
      { value: 'Under 58kg', label: 'Under 58kg' },
      { value: 'Under 63kg', label: 'Under 63kg' },
      { value: 'Under 68kg', label: 'Under 68kg' },
      { value: 'Under 74kg', label: 'Under 74kg' },
      { value: 'Under 80kg', label: 'Under 80kg' },
      { value: 'Under 87kg', label: 'Under 87kg' },
      { value: 'Over 87kg', label: 'Over 87kg' }
    ],
    Female: [
      { value: 'Under 46kg', label: 'Under 46kg' },
      { value: 'Under 49kg', label: 'Under 49kg' },
      { value: 'Under 53kg', label: 'Under 53kg' },
      { value: 'Under 57kg', label: 'Under 57kg' },
      { value: 'Under 62kg', label: 'Under 62kg' },
      { value: 'Under 67kg', label: 'Under 67kg' },
      { value: 'Under 73kg', label: 'Under 73kg' },
      { value: 'Over 73kg', label: 'Over 73kg' }
    ]
  },
  'Dasara': {
    Male: [
      { value: 'Under 45kg', label: 'Under 45kg' },
      { value: 'Under 50kg', label: 'Under 50kg' },
      { value: 'Under 56kg', label: 'Under 56kg' },
      { value: 'Under 62kg', label: 'Under 62kg' },
      { value: 'Under 69kg', label: 'Under 69kg' },
      { value: 'Under 76kg', label: 'Under 76kg' },
      { value: 'Under 82kg', label: 'Under 82kg' },
      { value: 'Above 82kg', label: 'Above 82kg' }
    ],
    Female: [
      { value: 'Under 42kg', label: 'Under 42kg' },
      { value: 'Under 46kg', label: 'Under 46kg' },
      { value: 'Under 50kg', label: 'Under 50kg' },
      { value: 'Under 55kg', label: 'Under 55kg' },
      { value: 'Under 60kg', label: 'Under 60kg' },
      { value: 'Under 65kg', label: 'Under 65kg' },
      { value: 'Under 70kg', label: 'Under 70kg' },
      { value: 'Above 70kg', label: 'Above 70kg' }
    ]
  },
  'Para K41/K44': {
    Male: [
      { value: 'K41/K44 -58 kg', label: 'K41/K44 -58 kg' },
      { value: 'K41/K44 -63 kg', label: 'K41/K44 -63 kg' },
      { value: 'K41/K44 -70 kg', label: 'K41/K44 -70 kg' },
      { value: 'K41/K44 -80 kg', label: 'K41/K44 -80 kg' },
      { value: 'K41/K44 +80 kg', label: 'K41/K44 +80 kg' }
    ],
    Female: [
      { value: 'K41/K44 -47 kg', label: 'K41/K44 -47 kg' },
      { value: 'K41/K44 -52 kg', label: 'K41/K44 -52 kg' },
      { value: 'K41/K44 -57 kg', label: 'K41/K44 -57 kg' },
      { value: 'K41/K44 -65 kg', label: 'K41/K44 -65 kg' },
      { value: 'K41/K44 +65 kg', label: 'K41/K44 +65 kg' }
    ]
  }
};

// Official Poomsae Regular Individual Divisions from regulation chart
// Ready-to-Use JavaScript / JSON Array (for ID Card Generator & EvtMgr)
export const POOMSAE_CATEGORIES = [
  // Individual - Regular
  { code: "PO-IND-REG-JUN1", name: "Recognised Individual (Junior I)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 12 Yrs (Born 2014+)" },
  { code: "PO-IND-REG-JUN2", name: "Recognised Individual (Junior II)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 15 Yrs (2011–2013)" },
  { code: "PO-IND-REG-JUN3", name: "Recognised Individual (Junior III)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 18 Yrs (2008–2010)" },
  { code: "PO-IND-REG-SEN1", name: "Recognised Individual (Senior I)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 29 Yrs (1997–2007)" },
  { code: "PO-IND-REG-SEN2", name: "Recognised Individual (Senior II)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 39 Yrs (1987–1996)" },
  { code: "PO-IND-REG-SEN3", name: "Recognised Individual (Senior III)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 49 Yrs (1977–1986)" },
  { code: "PO-IND-REG-SEN4", name: "Recognised Individual (Senior IV)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 59 Yrs (1967–1976)" },
  { code: "PO-IND-REG-MAS1", name: "Recognised Individual (Master I)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Under 69 Yrs (1957–1966)" },
  { code: "PO-IND-REG-MAS2", name: "Recognised Individual (Master II)", type: "INDIVIDUAL", tier: "REGULAR", ageRange: "Over 70 Yrs (Born <= 1956)" },
  // Individual - Freshers
  { code: "PO-IND-FR-CHILD", name: "Recognised Individual (Children)", type: "INDIVIDUAL", tier: "FRESHERS", ageRange: "Under 12 Yrs (Ages 5–11)" },
  { code: "PO-IND-FR-SUBJUN", name: "Recognised Individual (Sub Junior)", type: "INDIVIDUAL", tier: "FRESHERS", ageRange: "Ages 10–11 (2013–2014)" },
  { code: "PO-IND-FR-CADET", name: "Recognised Individual (Cadet)", type: "INDIVIDUAL", tier: "FRESHERS", ageRange: "Ages 12–14 (2010–2012)" },
  // Pair - Regular
  { code: "PO-PAIR-REG-CHILD", name: "Recognised Mix Pair (Children)", type: "PAIR", tier: "REGULAR", ageRange: "Under 12 Yrs (Born 2014+)" },
  { code: "PO-PAIR-REG-SUBJUN", name: "Recognised Mix Pair (Sub Junior)", type: "PAIR", tier: "REGULAR", ageRange: "Ages 10–11 (2013–2014)" },
  { code: "PO-PAIR-REG-CADET", name: "Recognised Mix Pair (Cadet)", type: "PAIR", tier: "REGULAR", ageRange: "Ages 12–14 (2010–2012)" },
  { code: "PO-PAIR-REG-JUN", name: "Recognised Mix Pair (Junior)", type: "PAIR", tier: "REGULAR", ageRange: "Ages 15–17 (2007–2009)" },
  { code: "PO-PAIR-REG-U30", name: "Recognised Mix Pair (Under 30 Yrs)", type: "PAIR", tier: "REGULAR", ageRange: "Ages 18–30 (1994–2006)" },
  { code: "PO-PAIR-REG-A30", name: "Recognised Mix Pair (Above 30 Yrs)", type: "PAIR", tier: "REGULAR", ageRange: "31+ Yrs (Born <= 1993)" },
  // Pair - Freshers
  { code: "PO-PAIR-FR-CHILD", name: "Recognised Mix Pair (Children)", type: "PAIR", tier: "FRESHERS", ageRange: "Under 12 Yrs (Ages 5–11)" },
  { code: "PO-PAIR-FR-SUBJUN", name: "Recognised Mix Pair (Sub Junior)", type: "PAIR", tier: "FRESHERS", ageRange: "Ages 10–11 (2013–2014)" },
  { code: "PO-PAIR-FR-CADET", name: "Recognised Mix Pair (Cadet)", type: "PAIR", tier: "FRESHERS", ageRange: "Ages 12–14 (2010–2012)" },
  // Team - Regular
  { code: "PO-TEAM-REG-CHILD", name: "Recognised Team Male / Female (Children)", type: "TEAM", tier: "REGULAR", ageRange: "Under 12 Yrs (Born 2014+)" },
  { code: "PO-TEAM-REG-SUBJUN", name: "Recognised Team Male / Female (Sub Junior)", type: "TEAM", tier: "REGULAR", ageRange: "Ages 10–11 (2013–2014)" },
  { code: "PO-TEAM-REG-CADET", name: "Recognised Team Male / Female (Cadet)", type: "TEAM", tier: "REGULAR", ageRange: "Ages 12–14 (2010–2012)" },
  { code: "PO-TEAM-REG-JUN", name: "Recognised Team Male / Female (Junior)", type: "TEAM", tier: "REGULAR", ageRange: "Ages 15–17 (2007–2009)" },
  { code: "PO-TEAM-REG-U30", name: "Recognised Team Male / Female (Under 30 Yrs)", type: "TEAM", tier: "REGULAR", ageRange: "Ages 18–30 (1994–2006)" },
  { code: "PO-TEAM-REG-A30", name: "Recognised Team Male / Female (Above 30 Yrs)", type: "TEAM", tier: "REGULAR", ageRange: "31+ Yrs (Born <= 1993)" },
  // Team - Freshers
  { code: "PO-TEAM-FR-CHILD", name: "Recognised Team Male / Female (Children)", type: "TEAM", tier: "FRESHERS", ageRange: "Under 12 Yrs (Ages 5–11)" },
  { code: "PO-TEAM-FR-SUBJUN", name: "Recognised Team Male / Female (Sub Junior)", type: "TEAM", tier: "FRESHERS", ageRange: "Ages 10–11 (2013–2014)" },
  { code: "PO-TEAM-FR-CADET", name: "Recognised Team Male / Female (Cadet)", type: "TEAM", tier: "FRESHERS", ageRange: "Ages 12–14 (2010–2012)" },
];

export const POOMSAE_REGULAR_INDIVIDUAL_DIVISIONS = [
  'Junior I (Under 12 Years)',
  'Junior II (Under 15 Years)',
  'Junior III (Under 18 Years)',
  'Senior I (Under 29 Years)',
  'Senior II (Under 39 Years)',
  'Senior III (Under 49 Years)',
  'Senior IV (Under 59 Years)',
  'Master I (Under 69 Years)',
  'Master II (Over 70 Years)'
];

// Full structured definitions per event and tier matching the regulation tables
export const TOURNAMENT_STRUCTURE = {
  Kyorugi: {
    Freshers: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Individual Freshers',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: true
        }
      ]
    },
    Regular: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Individual Regular',
          ageDivisions: ['Sub Junior', 'Cadet', 'Junior', 'Over 17', 'Dasara', 'Para K41/K44'],
          genders: ['Male', 'Female'],
          hasWeights: true
        },
        {
          id: 'Team',
          name: 'Team Regular (Team of 3 athletes)',
          ageDivisions: ['Senior'],
          genders: ['Senior Boys', 'Senior Girls'],
          hasWeights: false,
          defaultWeight: 'Team of 3'
        }
      ]
    }
  },
  Poomsae: {
    Freshers: {
      subCategories: [
        {
          id: 'Recognised Individual',
          name: 'Recognised Individual',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Individual'
        },
        {
          id: 'Recognised Mix Pair',
          name: 'Recognised Mix Pair',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet'],
          genders: ['Mix Pair'],
          hasWeights: false,
          defaultWeight: 'Mix Pair'
        },
        {
          id: 'Recognised Team',
          name: 'Recognised Team (3 athletes)',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet'],
          genders: ['Male Team', 'Female Team'],
          hasWeights: false,
          defaultWeight: 'Team of 3'
        }
      ]
    },
    Regular: {
      subCategories: [
        {
          id: 'Recognised Individual',
          name: 'Recognised Individual',
          ageDivisions: POOMSAE_REGULAR_INDIVIDUAL_DIVISIONS,
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Individual'
        },
        {
          id: 'Recognised Mix Pair',
          name: 'Recognised Mix Pair',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Under 30 Yrs', 'Above 30 Yrs'],
          genders: ['Mix Pair'],
          hasWeights: false,
          defaultWeight: 'Mix Pair'
        },
        {
          id: 'Recognised Team',
          name: 'Recognised Team (3 athletes)',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Under 30 Yrs', 'Above 30 Yrs'],
          genders: ['Male Team', 'Female Team'],
          hasWeights: false,
          defaultWeight: 'Team of 3'
        }
      ]
    }
  },
  'Speed Kicking': {
    Freshers: {
      subCategories: [
        {
          id: 'Front Kick',
          name: 'Speed Kicking - Front Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Front Kick'
        }
      ]
    },
    Regular: {
      subCategories: [
        {
          id: 'Round House Kick',
          name: 'Speed Kicking - Round House Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Round House Kick'
        },
        {
          id: 'Turning Kick',
          name: 'Speed Kicking - Turning Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Turning Kick'
        },
        {
          id: 'Team',
          name: 'Speed Kicking Team (3 athletes)',
          ageDivisions: ['Under 17 Years', 'Over 17 Years'],
          genders: ['Male Team', 'Female Team'],
          hasWeights: false,
          defaultWeight: 'Team of 3'
        }
      ]
    }
  },
  Breaking: {
    Freshers: {
      subCategories: [
        {
          id: 'Knife Hand',
          name: 'E-Breaking - Knife Hand',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Knife Hand'
        },
        {
          id: 'Close Fist Jireugi',
          name: 'E-Breaking - Close Fist Jireugi',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Close Fist Jireugi'
        },
        {
          id: 'Side Kick',
          name: 'E-Breaking - Side Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Side Kick'
        },
        {
          id: 'Back Kick',
          name: 'E-Breaking - Back Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Back Kick'
        }
      ]
    },
    Regular: {
      subCategories: [
        {
          id: 'Knife Hand',
          name: 'E-Breaking - Knife Hand',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Knife Hand'
        },
        {
          id: 'Close Fist Jireugi',
          name: 'E-Breaking - Close Fist Jireugi',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Close Fist Jireugi'
        },
        {
          id: 'Side Kick',
          name: 'E-Breaking - Side Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Side Kick'
        },
        {
          id: 'Back Kick',
          name: 'E-Breaking - Back Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Back Kick'
        }
      ]
    }
  },
  'Virtual Taekwondo': {
    Freshers: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Virtual Taekwondo Individual',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Senior'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Individual'
        },
        {
          id: 'Mix Gender',
          name: 'Virtual Taekwondo Mix Gender Individual',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Senior'],
          genders: ['Mix Gender'],
          hasWeights: false,
          defaultWeight: 'Mix Gender'
        }
      ]
    },
    Regular: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Virtual Taekwondo Individual',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Senior'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Individual'
        },
        {
          id: 'Mix Gender',
          name: 'Virtual Taekwondo Mix Gender Individual',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Senior'],
          genders: ['Mix Gender'],
          hasWeights: false,
          defaultWeight: 'Mix Gender'
        }
      ]
    }
  },
  Dasara: {
    Regular: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Dasara Individual',
          ageDivisions: ['Dasara'],
          genders: ['Male', 'Female'],
          hasWeights: true
        }
      ]
    },
    Freshers: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Dasara Individual',
          ageDivisions: ['Dasara'],
          genders: ['Male', 'Female'],
          hasWeights: true
        }
      ]
    }
  },
  'Para K41/K44': {
    Regular: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Para K41/K44 Individual',
          ageDivisions: ['Para K41/K44'],
          genders: ['Male', 'Female'],
          hasWeights: true
        }
      ]
    },
    Freshers: {
      subCategories: [
        {
          id: 'Individual',
          name: 'Para K41/K44 Individual',
          ageDivisions: ['Para K41/K44'],
          genders: ['Male', 'Female'],
          hasWeights: true
        }
      ]
    }
  }
};

/**
 * Derives a division ID and clean human-readable Name for any competitor,
 * strictly keeping Regular and Freshers separate, with zero emojis.
 */
export function getCompetitorDivision(c) {
  // 1. Maintain 100% backward compatibility for Dasara
  if (c.ageCategory === 'Dasara' || c.event === 'Dasara') {
    const wc = c.weightClass || 'Under 56kg';
    return {
      divId: `${c.gender}_Dasara_${wc}`.replace(/\s+/g, '_'),
      divName: `${c.gender} Dasara ${wc}`,
      event: 'Dasara',
      categoryType: 'Regular'
    };
  }

  // 2. Para K41/K44
  if (c.ageCategory === 'Para K41/K44' || c.event === 'Para K41/K44') {
    const wc = c.weightClass || 'K41/K44 -58 kg';
    return {
      divId: `Para_K41_K44_${c.gender}_${wc}`.replace(/[\s/-]+/g, '_'),
      divName: `Para K41/K44 ${c.gender} ${wc}`,
      event: 'Para K41/K44',
      categoryType: 'Regular'
    };
  }

  const event = c.event || 'Kyorugi';
  const categoryType = c.categoryType || 'Regular';
  const gender = c.gender || 'Male';
  const ageCat = c.ageCategory || 'Senior';
  const subCat = c.subCategory || '';
  const wc = c.weightClass || '';

  // Clean identifier safe for IDs and URLs
  const clean = (str) => String(str || '').trim().replace(/[\s/-]+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

  let idParts = [event, categoryType, gender, ageCat];
  if (subCat && subCat !== 'Individual' && !wc.includes(subCat)) {
    idParts.push(subCat);
  }
  if (wc) {
    idParts.push(wc);
  }
  const divId = idParts.map(clean).filter(Boolean).join('_');

  // Human-readable title without emojis
  let nameParts = [`${event} (${categoryType})`, gender, ageCat];
  if (subCat && subCat !== 'Individual' && !wc.includes(subCat)) {
    nameParts.push(subCat);
  }
  if (wc) {
    nameParts.push(wc);
  }

  const divName = nameParts.join(' ').trim();

  return {
    divId,
    divName,
    event,
    categoryType
  };
}
