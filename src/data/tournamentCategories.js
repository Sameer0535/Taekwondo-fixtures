// Official Tournament Structure & Weight Categories
// Enforces separate Regular and Freshers divisions across all official events:
// Kyorugi, Poomsae, Speed Kicking, Breaking, and Virtual Taekwondo.

export const EVENT_TYPES = [
  'Kyorugi',
  'Poomsae',
  'Speed Kicking',
  'Breaking',
  'Virtual Taekwondo'
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
          name: 'Recognised Poomsae Individual',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Individual'
        },
        {
          id: 'Recognised Mix Pair',
          name: 'Recognised Poomsae Mix Pair',
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
          name: 'Recognised Poomsae Individual',
          ageDivisions: ['Sub Junior', 'Cadet', 'Junior', 'U30 Yrs', 'U 40 yrs', 'U 50 yrs', 'U 60 Yrs', 'U 65 Yrs', 'O 65 Yrs'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Individual'
        },
        {
          id: 'Recognised Mix Pair',
          name: 'Recognised Poomsae Mix Pair',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'U30 Yrs', 'U 40 yrs', 'U 50 yrs', 'U 60 Yrs', 'O 60 Yrs'],
          genders: ['Mix Pair'],
          hasWeights: false,
          defaultWeight: 'Mix Pair'
        },
        {
          id: 'Recognised Team',
          name: 'Recognised Team (3 athletes)',
          ageDivisions: ['Cadet', 'Junior', 'U30 Yrs', 'U 40 yrs', 'U 50 yrs', 'U 60 Yrs', 'O 60 Yrs'],
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
          name: 'Speed Kicking Individual - Front Kick',
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
          name: 'Speed Kicking Individual - Round House Kick',
          ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
          genders: ['Male', 'Female'],
          hasWeights: false,
          defaultWeight: 'Round House Kick'
        },
        {
          id: 'Turning Kick',
          name: 'Speed Kicking Individual - Turning Kick',
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
          name: 'Virtual Taekwondo Male/Female Individual',
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
          name: 'Virtual Taekwondo Male/Female Individual',
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
  }
};

/**
 * Derives a division ID and human-readable Name for any competitor,
 * strictly keeping Regular and Freshers separate.
 */
export function getCompetitorDivision(c) {
  // 1. Maintain 100% backward compatibility for Dasara seed brackets
  if (c.ageCategory === 'Dasara' && (!c.event || c.event === 'Kyorugi') && (!c.categoryType || c.categoryType === 'Regular')) {
    const wc = c.weightClass || 'Under 56kg';
    return {
      divId: `${c.gender}_Dasara_${wc}`.replace(/\s+/g, '_'),
      divName: `${c.gender} Dasara ${wc}`,
      event: 'Kyorugi',
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

  // Human-readable title
  let nameParts = [];
  nameParts.push(`${event} (${categoryType})`);
  nameParts.push(gender);
  nameParts.push(ageCat);
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
