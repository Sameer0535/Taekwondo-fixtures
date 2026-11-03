import kyorixLogo from './assets/kyorix-logo.png';
import { useState, useEffect, useMemo } from 'react';
import CompetitorList from './components/CompetitorList';
import BracketView from './components/BracketView';
import ResultsView from './components/ResultsView';
import { generateBracket } from './utils/bracketBuilder';
import { SEED_DASARA_COMPETITORS, SEED_DASARA_BRACKETS } from './data/seedData';
import { getCompetitorDivision, EVENT_TYPES } from './data/tournamentCategories';
import './App.css';

const SAMPLE_COMPETITORS = [
  // === KYORUGI - REGULAR ===
  // Division: Male Senior Under 68kg (5 players - tests walkovers & bye propagation)
  { id: 'c1', name: 'Lee Dae-hoon', club: 'Seoul TKD', country: 'KOR', seed: 1, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '3rd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c2', name: 'Alexei Denisenko', club: 'Rostov Club', country: 'RUS', seed: 2, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '2nd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c3', name: 'Joel Gonzalez', club: 'Madrid High Performance', country: 'ESP', seed: 3, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '4th Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c4', name: 'Servet Tazegul', club: 'Istanbul Warriors', country: 'TUR', seed: 4, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '3rd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c5', name: 'Ahmad Abughaush', club: 'Amman Lions', country: 'JOR', seed: null, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '1st Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },

  // Division: Female Senior Under 57kg (4 players - perfect power of 2)
  { id: 'c6', name: 'Jade Jones', club: 'Manchester Elite', country: 'GBR', seed: 1, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '3rd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c7', name: 'Eva Calvo', club: 'Madrid High Performance', country: 'ESP', seed: 2, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '2nd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c8', name: 'Hedaya Malak', club: 'Cairo TKD Academy', country: 'EGY', seed: 3, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '1st Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c9', name: 'Kimia Alizadeh', club: 'Karaj Club', country: 'IRI', seed: 4, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '2nd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },

  // Division: Male Junior Under 59kg (3 players - tests single bye)
  { id: 'c10', name: 'Marc-Andre', club: 'Montreal Peak', country: 'CAN', seed: 1, gender: 'Male', ageCategory: 'Junior', weightClass: 'Under 59kg', rank: '1st Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c11', name: 'Park Tae-joon', club: 'Incheon High', country: 'KOR', seed: 2, gender: 'Male', ageCategory: 'Junior', weightClass: 'Under 59kg', rank: '1st Poom', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c12', name: 'Vito Dell\'Aquila', club: 'Roma Warriors', country: 'ITA', seed: null, gender: 'Male', ageCategory: 'Junior', weightClass: 'Under 59kg', rank: '1st Poom', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },

  // Division: Male Senior Under 80kg (4 players)
  { id: 'c13', name: 'Cheick Sallah Cisse', club: 'Abidjan Elite', country: 'IND', seed: 1, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '4th Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c14', name: 'Lutalo Muhammad', club: 'London Academy', country: 'GBR', seed: 2, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '3rd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c15', name: 'Milad Beigi', club: 'Baku Warriors', country: 'IND', seed: 3, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '3rd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },
  { id: 'c16', name: 'Albert Gaun', club: 'Moscow Club', country: 'RUS', seed: 4, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '2nd Dan', event: 'Kyorugi', categoryType: 'Regular', subCategory: 'Individual' },

  // === KYORUGI - FRESHERS (Separate Divisions) ===
  // Division: Male Children Under 22kg (Freshers)
  { id: 'kf_c1', name: 'Aarav Gupta', club: 'Delhi TKD', country: 'IND', seed: 1, gender: 'Male', ageCategory: 'Children', weightClass: 'Under 22kg', rank: 'Yellow Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_c2', name: 'Reyansh Sharma', club: 'Mumbai TKD', country: 'IND', seed: 2, gender: 'Male', ageCategory: 'Children', weightClass: 'Under 22kg', rank: 'Yellow Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_c3', name: 'Vivaan Jain', club: 'Bangalore Center', country: 'IND', seed: null, gender: 'Male', ageCategory: 'Children', weightClass: 'Under 22kg', rank: 'Green Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_c4', name: 'Atharv Joshi', club: 'Pune TKD', country: 'IND', seed: null, gender: 'Male', ageCategory: 'Children', weightClass: 'Under 22kg', rank: 'Yellow Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },

  // Division: Female Sub-Junior Under 24kg (Freshers)
  { id: 'kf_sj1', name: 'Ananya Singh', club: 'Delhi TKD', country: 'IND', seed: 1, gender: 'Female', ageCategory: 'Sub-Junior', weightClass: 'Under 24kg', rank: 'Green Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_sj2', name: 'Diya Verma', club: 'Jaipur TKD', country: 'IND', seed: 2, gender: 'Female', ageCategory: 'Sub-Junior', weightClass: 'Under 24kg', rank: 'Yellow Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_sj3', name: 'Myra Patel', club: 'Ahmedabad Strikers', country: 'IND', seed: null, gender: 'Female', ageCategory: 'Sub-Junior', weightClass: 'Under 24kg', rank: 'Yellow Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_sj4', name: 'Kavya Nair', club: 'Kerala TKD', country: 'IND', seed: null, gender: 'Female', ageCategory: 'Sub-Junior', weightClass: 'Under 24kg', rank: 'Green Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },

  // Division: Male Cadet Under 45kg (Freshers)
  { id: 'kf_cd1', name: 'Kabir Rao', club: 'Hyderabad Center', country: 'IND', seed: 1, gender: 'Male', ageCategory: 'Cadet', weightClass: 'Under 45kg', rank: 'Blue Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_cd2', name: 'Aditya Mehta', club: 'Mumbai TKD', country: 'IND', seed: 2, gender: 'Male', ageCategory: 'Cadet', weightClass: 'Under 45kg', rank: 'Green Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_cd3', name: 'Rohan Kapoor', club: 'Chandigarh TKD', country: 'IND', seed: null, gender: 'Male', ageCategory: 'Cadet', weightClass: 'Under 45kg', rank: 'Blue Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'kf_cd4', name: 'Arjun Reddy', club: 'Bangalore Center', country: 'IND', seed: null, gender: 'Male', ageCategory: 'Cadet', weightClass: 'Under 45kg', rank: 'Red Belt', event: 'Kyorugi', categoryType: 'Freshers', subCategory: 'Individual' },

  // === POOMSAE - FRESHERS & REGULAR ===
  // Freshers: Mix Pair Children
  { id: 'pm_f1', name: 'Aryan & Ishita', club: 'KTA', country: 'IND', seed: 1, gender: 'Mix Pair', ageCategory: 'Children', weightClass: 'Mix Pair', rank: '1st Poom', event: 'Poomsae', categoryType: 'Freshers', subCategory: 'Recognised Mix Pair' },
  { id: 'pm_f2', name: 'Rishi & Tanvi', club: 'Prince Tkd', country: 'IND', seed: 2, gender: 'Mix Pair', ageCategory: 'Children', weightClass: 'Mix Pair', rank: '1st Poom', event: 'Poomsae', categoryType: 'Freshers', subCategory: 'Recognised Mix Pair' },
  { id: 'pm_f3', name: 'Dhruv & Meera', club: 'Dominant', country: 'IND', seed: null, gender: 'Mix Pair', ageCategory: 'Children', weightClass: 'Mix Pair', rank: '1st Poom', event: 'Poomsae', categoryType: 'Freshers', subCategory: 'Recognised Mix Pair' },

  // Regular: Female Cadet Recognised Individual
  { id: 'pm_r1', name: 'Chen Wei', club: 'Taipei Elite', country: 'TPE', seed: 1, gender: 'Female', ageCategory: 'Cadet', weightClass: 'Individual', rank: '2nd Poom', event: 'Poomsae', categoryType: 'Regular', subCategory: 'Recognised Individual' },
  { id: 'pm_r2', name: 'Kento Saito', club: 'Tokyo Academy', country: 'JPN', seed: 2, gender: 'Female', ageCategory: 'Cadet', weightClass: 'Individual', rank: '2nd Poom', event: 'Poomsae', categoryType: 'Regular', subCategory: 'Recognised Individual' },
  { id: 'pm_r3', name: 'Sunita Rao', club: 'KTA', country: 'IND', seed: null, gender: 'Female', ageCategory: 'Cadet', weightClass: 'Individual', rank: '1st Poom', event: 'Poomsae', categoryType: 'Regular', subCategory: 'Recognised Individual' },

  // === SPEED KICKING ===
  // Freshers: Junior Male Front Kick
  { id: 'sk_f1', name: 'Alex Miller', club: 'London Academy', country: 'GBR', seed: 1, gender: 'Male', ageCategory: 'Junior', weightClass: 'Front Kick', rank: '1st Dan', event: 'Speed Kicking', categoryType: 'Freshers', subCategory: 'Front Kick' },
  { id: 'sk_f2', name: 'Ryan Clark', club: 'Manchester Elite', country: 'GBR', seed: 2, gender: 'Male', ageCategory: 'Junior', weightClass: 'Front Kick', rank: '1st Dan', event: 'Speed Kicking', categoryType: 'Freshers', subCategory: 'Front Kick' },
  { id: 'sk_f3', name: 'Liam Davis', club: 'Dublin TKD', country: 'IRL', seed: null, gender: 'Male', ageCategory: 'Junior', weightClass: 'Front Kick', rank: '1st Dan', event: 'Speed Kicking', categoryType: 'Freshers', subCategory: 'Front Kick' },

  // Regular: Female Over 17 Round House Kick
  { id: 'sk_r1', name: 'Elena Rostova', club: 'Moscow Club', country: 'RUS', seed: 1, gender: 'Female', ageCategory: 'Over 17', weightClass: 'Round House Kick', rank: '3rd Dan', event: 'Speed Kicking', categoryType: 'Regular', subCategory: 'Round House Kick' },
  { id: 'sk_r2', name: 'Clara Martin', club: 'Paris Elite', country: 'FRA', seed: 2, gender: 'Female', ageCategory: 'Over 17', weightClass: 'Round House Kick', rank: '2nd Dan', event: 'Speed Kicking', categoryType: 'Regular', subCategory: 'Round House Kick' },
  { id: 'sk_r3', name: 'Maria Rossi', club: 'Roma Warriors', country: 'ITA', seed: null, gender: 'Female', ageCategory: 'Over 17', weightClass: 'Round House Kick', rank: '2nd Dan', event: 'Speed Kicking', categoryType: 'Regular', subCategory: 'Round House Kick' },

  // === BREAKING (E-BREAKING) ===
  // Freshers: Male Cadet Knife Hand
  { id: 'brk_f1', name: 'David Kim', club: 'Seoul TKD', country: 'KOR', seed: 1, gender: 'Male', ageCategory: 'Cadet', weightClass: 'Knife Hand', rank: '1st Poom', event: 'Breaking', categoryType: 'Freshers', subCategory: 'Knife Hand' },
  { id: 'brk_f2', name: 'Kenji Sato', club: 'Osaka Center', country: 'JPN', seed: 2, gender: 'Male', ageCategory: 'Cadet', weightClass: 'Knife Hand', rank: '1st Poom', event: 'Breaking', categoryType: 'Freshers', subCategory: 'Knife Hand' },
  { id: 'brk_f3', name: 'Lucas Silva', club: 'Rio Club', country: 'BRA', seed: null, gender: 'Male', ageCategory: 'Cadet', weightClass: 'Knife Hand', rank: '1st Poom', event: 'Breaking', categoryType: 'Freshers', subCategory: 'Knife Hand' },

  // Regular: Female Junior Side Kick
  { id: 'brk_r1', name: 'Chloe Dupont', club: 'Lyon TKD', country: 'FRA', seed: 1, gender: 'Female', ageCategory: 'Junior', weightClass: 'Side Kick', rank: '2nd Dan', event: 'Breaking', categoryType: 'Regular', subCategory: 'Side Kick' },
  { id: 'brk_r2', name: 'Anna Schmidt', club: 'Berlin TKD', country: 'GER', seed: 2, gender: 'Female', ageCategory: 'Junior', weightClass: 'Side Kick', rank: '2nd Dan', event: 'Breaking', categoryType: 'Regular', subCategory: 'Side Kick' },
  { id: 'brk_r3', name: 'Sophie Brown', club: 'London Academy', country: 'GBR', seed: null, gender: 'Female', ageCategory: 'Junior', weightClass: 'Side Kick', rank: '1st Dan', event: 'Breaking', categoryType: 'Regular', subCategory: 'Side Kick' },

  // === VIRTUAL TAEKWONDO ===
  // Freshers: Male Junior Individual
  { id: 'vt_f1', name: 'Tyler Vance', club: 'Cyber TKD', country: 'USA', seed: 1, gender: 'Male', ageCategory: 'Junior', weightClass: 'Individual', rank: '1st Dan', event: 'Virtual Taekwondo', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'vt_f2', name: 'Leo Sparks', club: 'Virtua Sports', country: 'KOR', seed: 2, gender: 'Male', ageCategory: 'Junior', weightClass: 'Individual', rank: '1st Dan', event: 'Virtual Taekwondo', categoryType: 'Freshers', subCategory: 'Individual' },
  { id: 'vt_f3', name: 'Mason Reed', club: 'Pixel Strikers', country: 'IND', seed: null, gender: 'Male', ageCategory: 'Junior', weightClass: 'Individual', rank: '1st Dan', event: 'Virtual Taekwondo', categoryType: 'Freshers', subCategory: 'Individual' },

  // Regular: Mix Gender Senior Individual
  { id: 'vt_r1', name: 'Jordan Lee', club: 'Meta Fighters', country: 'KOR', seed: 1, gender: 'Mix Gender', ageCategory: 'Senior', weightClass: 'Mix Gender', rank: '3rd Dan', event: 'Virtual Taekwondo', categoryType: 'Regular', subCategory: 'Mix Gender' },
  { id: 'vt_r2', name: 'Sam Rivera', club: 'Holo TKD', country: 'MEX', seed: 2, gender: 'Mix Gender', ageCategory: 'Senior', weightClass: 'Mix Gender', rank: '2nd Dan', event: 'Virtual Taekwondo', categoryType: 'Regular', subCategory: 'Mix Gender' },
  { id: 'vt_r3', name: 'Taylor Swift', club: 'Virtual Arena', country: 'USA', seed: null, gender: 'Mix Gender', ageCategory: 'Senior', weightClass: 'Mix Gender', rank: '2nd Dan', event: 'Virtual Taekwondo', categoryType: 'Regular', subCategory: 'Mix Gender' }
];

const SAMPLE_GROUP4_COMPETITORS = [
  // Male U-10 (10 players -> 3 groups of max 4 players)
  { id: 'g4_1', name: 'Rahul Sharma', club: 'Delhi TKD', country: 'IND', seed: 1, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_2', name: 'Aarav Patel', club: 'Mumbai TKD', country: 'IND', seed: 2, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Green Belt' },
  { id: 'g4_3', name: 'Kabir Singh', club: 'Punjab Academy', country: 'IND', seed: 3, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_4', name: 'Vivaan Joshi', club: 'Delhi TKD', country: 'IND', seed: 4, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Blue Belt' },
  { id: 'g4_5', name: 'Rohan Gupta', club: 'Bangalore Center', country: 'IND', seed: null, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_6', name: 'Aditya Verma', club: 'Pune TKD', country: 'IND', seed: null, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Green Belt' },
  { id: 'g4_7', name: 'Arjun Mehta', club: 'Jaipur TKD', country: 'IND', seed: null, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_8', name: 'Reyansh Deshmukh', club: 'Nagpur Club', country: 'IND', seed: null, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Green Belt' },
  { id: 'g4_9', name: 'Atharv Kulkarni', club: 'Nashik Academy', country: 'IND', seed: null, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_10', name: 'Vihaan Saxena', club: 'Lucknow Center', country: 'IND', seed: null, gender: 'Male', ageCategory: 'U-10', weightClass: '', rank: 'Blue Belt' },

  // Female U-8 (8 players -> 2 groups of 4 players)
  { id: 'g4_11', name: 'Ananya Roy', club: 'Kolkata Strikers', country: 'IND', seed: 1, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_12', name: 'Diya Kumar', club: 'Chennai Lions', country: 'IND', seed: 2, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_13', name: 'Sanya Malhotra', club: 'Delhi TKD', country: 'IND', seed: 3, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Green Belt' },
  { id: 'g4_14', name: 'Myra Kapoor', club: 'Mumbai TKD', country: 'IND', seed: 4, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_15', name: 'Isha Bhatia', club: 'Chandigarh TKD', country: 'IND', seed: null, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_16', name: 'Kavya Sharma', club: 'Agra Strikers', country: 'IND', seed: null, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Green Belt' },
  { id: 'g4_17', name: 'Riya Sen', club: 'Ranchi Center', country: 'IND', seed: null, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Yellow Belt' },
  { id: 'g4_18', name: 'Avani Reddy', club: 'Hyderabad Center', country: 'IND', seed: null, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Yellow Belt' }
];

function App() {
  const [tournamentMode, setTournamentMode] = useState(() => {
    const saved = localStorage.getItem('tkd_tournament_mode_v1');
    return saved || 'official';
  });

  const [totalCourts, setTotalCourts] = useState(() => {
    const saved = localStorage.getItem('tkd_total_courts_v1');
    return saved ? Number(saved) : 4;
  });

  const [divisionCourts, setDivisionCourts] = useState(() => {
    const saved = localStorage.getItem('tkd_division_courts_v1');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('tkd_tournament_mode_v1', tournamentMode);
  }, [tournamentMode]);

  useEffect(() => {
    localStorage.setItem('tkd_total_courts_v1', totalCourts);
  }, [totalCourts]);

  useEffect(() => {
    localStorage.setItem('tkd_division_courts_v1', JSON.stringify(divisionCourts));
  }, [divisionCourts]);

  const handleAssignCourt = (divId, courtNo) => {
    setDivisionCourts(prev => ({
      ...prev,
      [divId]: courtNo
    }));
  };

  const handleSetTournamentMode = (newMode) => {
    setTournamentMode(newMode);
    if (newMode === 'group4' && (competitors === SAMPLE_COMPETITORS || (competitors.length > 0 && competitors[0].ageCategory === 'Senior' && competitors[0].weightClass === 'Under 68kg'))) {
      setCompetitors(SAMPLE_GROUP4_COMPETITORS);
      setBrackets({});
      setSelectedDivisionId('');
    } else if (newMode === 'official' && competitors === SAMPLE_GROUP4_COMPETITORS) {
      setCompetitors(SAMPLE_COMPETITORS);
      setBrackets({});
      setSelectedDivisionId('');
    }
  };

  const [competitors, setCompetitors] = useState(() => {
    try {
      const saved = localStorage.getItem('tkd_competitors_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(c => (c.id || c.name || '').toLowerCase()));
          const missingDasara = SEED_DASARA_COMPETITORS.filter(c => !existingIds.has((c.id || c.name || '').toLowerCase()));
          if (missingDasara.length > 0) {
            const merged = [...missingDasara, ...parsed];
            localStorage.setItem('tkd_competitors_v3', JSON.stringify(merged));
            localStorage.setItem('tkd_competitors_v1', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch (_e) {}
    const initial = [...SEED_DASARA_COMPETITORS, ...SAMPLE_COMPETITORS];
    try {
      localStorage.setItem('tkd_competitors_v3', JSON.stringify(initial));
      localStorage.setItem('tkd_competitors_v1', JSON.stringify(initial));
    } catch (_e) {}
    return initial;
  });

  const [brackets, setBrackets] = useState(() => {
    try {
      const saved = localStorage.getItem('tkd_brackets_v3');
      let parsed = saved ? JSON.parse(saved) : {};
      if (!parsed || typeof parsed !== 'object') parsed = {};
      if (!parsed['Male_Dasara_Under_56kg'] || !Array.isArray(parsed['Male_Dasara_Under_56kg']) || parsed['Male_Dasara_Under_56kg'].length === 0) {
        parsed = { ...SEED_DASARA_BRACKETS, ...parsed };
        localStorage.setItem('tkd_brackets_v3', JSON.stringify(parsed));
      }
      return parsed;
    } catch (_e) {
      return SEED_DASARA_BRACKETS;
    }
  });

  const [activeTab, setActiveTab] = useState('brackets');
  const [regenerateToast, setRegenerateToast] = useState(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState('Male_Dasara_Under_56kg');

  // Filter state for Divisions tab and Brackets tab
  const [divFilterTier, setDivFilterTier] = useState('all'); // 'all' | 'Regular' | 'Freshers'
  const [divFilterEvent, setDivFilterEvent] = useState('all'); // 'all' | Event Name

  // Auto-save and live broadcast state
  useEffect(() => {
    try {
      const serialized = JSON.stringify(competitors);
      if (localStorage.getItem('tkd_competitors_v3') !== serialized) {
        localStorage.setItem('tkd_competitors_v3', serialized);
        localStorage.setItem('tkd_competitors_v1', serialized);
      }
    } catch(_e) {}

    const payload = {
      type: 'TKD_DRAWS_UPDATED',
      competitors,
      brackets,
      courts: divisionCourts
    };
    if (typeof window !== 'undefined') {
      if (window.parent && window.parent !== window) {
        try { window.parent.postMessage(payload, '*'); } catch(_e) {}
      }
      if (window.opener && !window.opener.closed) {
        try { window.opener.postMessage(payload, '*'); } catch(_e) {}
      }
    }

    const endpoints = ['/api/live-sync', 'http://localhost:3000/api/live-sync'];
    endpoints.forEach(ep => {
      try {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competitors, brackets, divisionCourts })
        }).catch(() => {});
      } catch(_e) {}
    });
  }, [competitors, brackets, divisionCourts]);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(brackets);
      if (localStorage.getItem('tkd_brackets_v3') !== serialized) {
        localStorage.setItem('tkd_brackets_v3', serialized);
        localStorage.setItem('tkd_match_updated', Date.now().toString());
      }
    } catch(_e) {}

    const payload = {
      type: 'TKD_DRAWS_UPDATED',
      competitors,
      brackets,
      courts: divisionCourts
    };
    if (typeof window !== 'undefined') {
      if (window.parent && window.parent !== window) {
        try { window.parent.postMessage(payload, '*'); } catch(_e) {}
      }
      if (window.opener && !window.opener.closed) {
        try { window.opener.postMessage(payload, '*'); } catch(_e) {}
      }
    }
  }, [brackets, competitors, divisionCourts]);

  // Live incoming synchronization
  useEffect(() => {
    const reloadFromStorage = () => {
      try {
        const savedComps = localStorage.getItem('tkd_competitors_v3');
        const savedBrackets = localStorage.getItem('tkd_brackets_v3');
        const savedMode = localStorage.getItem('tkd_tournament_mode_v1');
        const savedCourts = localStorage.getItem('tkd_division_courts_v1');
        const savedTotalCourts = localStorage.getItem('tkd_total_courts_v1');

        if (savedComps) {
          try {
            const parsed = JSON.parse(savedComps);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const compMap = new Map();
              SEED_DASARA_COMPETITORS.forEach(c => compMap.set((c.id || c.name || '').toLowerCase(), c));
              parsed.forEach(c => {
                const k = (c.id || c.name || '').toLowerCase();
                compMap.set(k, { ...(compMap.get(k) || {}), ...c });
              });
              setCompetitors(Array.from(compMap.values()));
            }
          } catch(_e) {}
        }
        if (savedBrackets) {
          try {
            const parsed = JSON.parse(savedBrackets);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              setBrackets(prev => ({
                ...SEED_DASARA_BRACKETS,
                ...prev,
                ...parsed
              }));
            }
          } catch(_e) {}
        }
        if (savedMode) setTournamentMode(savedMode);
        if (savedCourts) {
          try {
            const parsed = JSON.parse(savedCourts);
            if (parsed && typeof parsed === 'object') setDivisionCourts(parsed);
          } catch(_e) {}
        }
        if (savedTotalCourts) setTotalCourts(Number(savedTotalCourts));
      } catch (err) {
        console.warn('Storage sync notice:', err);
      }
    };

    const handleMessage = (e) => {
      if (!e || !e.data) return;
      if (e.data.type === 'TKD_RELOAD_BRACKETS' || e.data.type === 'TKD_SYNC_ROSTER' || e.data.type === 'TKD_DRAWS_RELOAD') {
        reloadFromStorage();
      }
    };

    const handleStorageEvent = (e) => {
      if (!e) return;
      if (e.key === 'tkd_competitors_v3' || e.key === 'tkd_brackets_v3' || e.key === 'tkd_tournament_mode_v1' || e.key === 'tkd_division_courts_v1' || e.key === 'tkd_match_updated') {
        reloadFromStorage();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Compute divisions dynamically — Strictly separating Regular and Freshers
  const divisions = useMemo(() => {
    const divs = {};
    if (tournamentMode === 'group4') {
      const categories = {};
      const ageMap = {
        'Senior': 'A-18',
        'Over 17': 'A-18',
        'Junior': 'U-18',
        'Cadet': 'U-15',
        'Sub-Junior': 'U-12',
        'Sub Junior': 'U-12',
        'Children': 'U-8'
      };

      competitors.forEach(c => {
        const ageCat = ageMap[c.ageCategory] || c.ageCategory;
        const catKey = `${c.gender}_${ageCat}`.replace(/\s+/g, '_');
        if (!categories[catKey]) {
          categories[catKey] = {
            gender: c.gender,
            ageCategory: ageCat,
            competitors: []
          };
        }
        categories[catKey].competitors.push(c);
      });

      Object.entries(categories).forEach(([catKey, cat]) => {
        const comps = cat.competitors;
        const groupSize = 4;
        const totalGroups = Math.ceil(comps.length / groupSize);

        for (let i = 0; i < totalGroups; i++) {
          const groupComps = comps.slice(i * groupSize, (i + 1) * groupSize);
          const groupSuffix = totalGroups > 1 ? ` (Group ${i + 1})` : '';
          const divId = `${catKey}_g${i + 1}`;
          const divName = `${cat.gender} ${cat.ageCategory}${groupSuffix}`;

          divs[divId] = {
            id: divId,
            name: divName,
            event: 'Kyorugi',
            categoryType: 'Regular',
            count: groupComps.length,
            competitors: groupComps
          };
        }
      });
    } else {
      competitors.forEach(c => {
        const { divId, divName, event: compEvent, categoryType: compTier } = getCompetitorDivision(c);
        if (!divs[divId]) {
          divs[divId] = { 
            id: divId, 
            name: divName, 
            event: compEvent,
            categoryType: compTier,
            count: 0, 
            competitors: [] 
          };
        }
        divs[divId].count++;
        divs[divId].competitors.push(c);
      });
    }
    return divs;
  }, [competitors, tournamentMode]);

  // Filtered divisions list based on active filters
  const filteredDivisionsList = useMemo(() => {
    return Object.values(divisions).filter(div => {
      if (divFilterTier !== 'all' && (div.categoryType || 'Regular') !== divFilterTier) return false;
      if (divFilterEvent !== 'all' && (div.event || 'Kyorugi') !== divFilterEvent) return false;
      return true;
    });
  }, [divisions, divFilterTier, divFilterEvent]);

  // Counts for filter pills
  const totalDivCount = Object.keys(divisions).length;
  const regularDivCount = Object.values(divisions).filter(d => (d.categoryType || 'Regular') === 'Regular').length;
  const freshersDivCount = Object.values(divisions).filter(d => d.categoryType === 'Freshers').length;

  // Select Male_Dasara_Under_56kg by default or first available division
  useEffect(() => {
    const keys = Object.keys(divisions);
    if (keys.length > 0) {
      if (!selectedDivisionId || !keys.includes(selectedDivisionId)) {
        if (keys.includes('Male_Dasara_Under_56kg')) {
          setSelectedDivisionId('Male_Dasara_Under_56kg');
        } else {
          setSelectedDivisionId(keys[0]);
        }
      }
    }
  }, [divisions, selectedDivisionId]);

  const handleGenerateBracket = (divId) => {
    const divComps = divisions[divId]?.competitors || [];
    if (divComps.length < 2) {
      alert("A division needs at least 2 competitors to generate a bracket.");
      return;
    }
    const newBracket = generateBracket(divComps);
    setBrackets(prev => {
      const nextBrackets = {
        ...prev,
        [divId]: newBracket
      };
      delete nextBrackets[divId + "_repechage"];
      return nextBrackets;
    });
  };

  const handleGenerateAllBrackets = () => {
    setBrackets(prev => {
      const nextBrackets = { ...prev };
      Object.keys(divisions).forEach(divId => {
        const divComps = divisions[divId].competitors;
        if (divComps.length >= 2) {
          nextBrackets[divId] = generateBracket(divComps);
          delete nextBrackets[divId + "_repechage"];
        }
      });
      return nextBrackets;
    });
    alert("Brackets generated/reset for all valid divisions!");
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear ALL competitors and tournament brackets?")) {
      setCompetitors([]);
      setBrackets({});
      setSelectedDivisionId('');
    }
  };

  const handleLoadSampleData = () => {
    if (window.confirm("Load sample competitors with separate Regular and Freshers divisions? (This will reset current data)")) {
      const samples = tournamentMode === 'group4' ? SAMPLE_GROUP4_COMPETITORS : SAMPLE_COMPETITORS;
      setCompetitors(samples);
      setBrackets({});
      setSelectedDivisionId('');
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.competitors && Array.isArray(data.competitors)) {
          setCompetitors(data.competitors);
          setBrackets(data.brackets || {});
          alert("Tournament data imported successfully!");
        } else {
          alert("Invalid data format. File must contain 'competitors' list.");
        }
      } catch (err) {
        alert("Error reading file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      competitors,
      brackets
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taekwondo_tournament_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Group filtered divisions into Freshers and Regular for Brackets select
  const freshersDivisions = filteredDivisionsList.filter(d => d.categoryType === 'Freshers');
  const regularDivisions = filteredDivisionsList.filter(d => (d.categoryType || 'Regular') === 'Regular');

  return (
    <div className="app-layout">
      <header className="app-header no-print">
        <div className="brand-section" onClick={() => setActiveTab('competitors')} style={{ cursor: 'pointer' }} title="Kyorix Tournament Manager">
          <img 
            src={kyorixLogo} 
            alt="Kyorix" 
            className="brand-logo" 
          />
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'competitors' ? 'active' : ''}`}
            onClick={() => setActiveTab('competitors')}
          >
            Competitors
          </button>
          <button 
            className={`nav-tab ${activeTab === 'divisions' ? 'active' : ''}`}
            onClick={() => setActiveTab('divisions')}
          >
            Divisions ({totalDivCount})
          </button>
          <button 
            className={`nav-tab ${activeTab === 'brackets' ? 'active' : ''}`}
            onClick={() => setActiveTab('brackets')}
          >
            Brackets
          </button>
          <button 
            className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Results
          </button>
        </nav>

        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExportData}>Export JSON</button>
          <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", margin: 0 }}>
            Import JSON
            <input type="file" onChange={handleImportData} style={{ display: "none" }} accept=".json" />
          </label>
        </div>
      </header>

      <main className="container">
        {activeTab === 'competitors' && (
          <CompetitorList 
            competitors={competitors} 
            setCompetitors={setCompetitors} 
            onLoadSamples={handleLoadSampleData}
            onClearAll={handleClearAllData}
            tournamentMode={tournamentMode}
            setTournamentMode={handleSetTournamentMode}
            totalCourts={totalCourts}
            setTotalCourts={setTotalCourts}
          />
        )}

        {activeTab === 'divisions' && (
          <div className="card">
            {regenerateToast && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Bracket regenerated & shuffled for: <strong>{regenerateToast}</strong></span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(Same academy players separated)</span>
              </div>
            )}
            
            <div className="card-title" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Active Divisions ({totalDivCount})</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }} className="no-print">
                <button className="btn btn-primary btn-sm" onClick={handleGenerateAllBrackets}>
                  Generate All Brackets
                </button>
              </div>
            </div>

            {/* Quick Filter Bar for Divisions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div className="filter-pills-container">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tier:</span>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterTier === 'all' ? 'active' : ''}`}
                  onClick={() => setDivFilterTier('all')}
                >
                  All ({totalDivCount})
                </button>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterTier === 'Regular' ? 'active-blue' : ''}`}
                  onClick={() => setDivFilterTier('Regular')}
                >
                  Regular ({regularDivCount})
                </button>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterTier === 'Freshers' ? 'active-green' : ''}`}
                  onClick={() => setDivFilterTier('Freshers')}
                >
                  Freshers ({freshersDivCount})
                </button>
              </div>

              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

              <div className="filter-pills-container">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event:</span>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterEvent === 'all' ? 'active' : ''}`}
                  onClick={() => setDivFilterEvent('all')}
                >
                  All Events
                </button>
                {EVENT_TYPES.map(ev => {
                  const count = Object.values(divisions).filter(d => (d.event || 'Kyorugi') === ev).length;
                  if (count === 0 && divFilterEvent !== ev) return null;
                  return (
                    <button 
                      key={ev}
                      type="button" 
                      className={`filter-pill ${divFilterEvent === ev ? 'active' : ''}`}
                      onClick={() => setDivFilterEvent(ev)}
                    >
                      {ev} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Division Name</th>
                    <th>Category Tier</th>
                    <th>Competitors</th>
                    <th>Bracket Status</th>
                    <th>Court / Ring</th>
                    <th className="no-print" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDivisionsList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No divisions found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDivisionsList.map(div => {
                      const isFreshers = div.categoryType === 'Freshers';
                      return (
                        <tr key={div.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="badge badge-purple">{div.event || 'Kyorugi'}</span>
                              <strong>{div.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${isFreshers ? 'badge-green' : 'badge-blue'}`}>
                              {isFreshers ? 'Freshers' : 'Regular'}
                            </span>
                          </td>
                          <td>{div.count} Athletes</td>
                          <td>
                            {brackets[div.id] ? (
                              <span className="badge badge-blue">Generated ({brackets[div.id].length} Rounds)</span>
                            ) : (
                              <span className="badge badge-gray">Not Generated</span>
                            )}
                          </td>
                          <td>
                            <select
                              className="form-control"
                              style={{ width: 'auto', minWidth: '110px', fontSize: '0.85rem', padding: '0.3rem 0.5rem' }}
                              value={divisionCourts[div.id] || ''}
                              onChange={(e) => handleAssignCourt(div.id, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {Array.from({ length: totalCourts }, (_, i) => i + 1).map(courtNum => (
                                <option key={courtNum} value={courtNum}>
                                  Court {courtNum}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="no-print" style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button 
                                className="btn btn-secondary btn-sm" 
                                onClick={() => {
                                  const isAlreadyGenerated = !!brackets[div.id];
                                  handleGenerateBracket(div.id);
                                  if (!isAlreadyGenerated) {
                                    setSelectedDivisionId(div.id);
                                    setActiveTab('brackets');
                                  } else {
                                    setRegenerateToast(div.name);
                                    setTimeout(() => setRegenerateToast(null), 3000);
                                  }
                                }}
                                disabled={div.count < 2}
                              >
                                {brackets[div.id] ? 'Regenerate' : 'Generate'}
                              </button>
                              {brackets[div.id] && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setSelectedDivisionId(div.id);
                                    setActiveTab('brackets');
                                  }}
                                >
                                  View Bracket
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {activeTab === 'brackets' && (
          <div className="card">
            {/* Filter Pills for Brackets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div className="filter-pills-container">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tier:</span>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterTier === 'all' ? 'active' : ''}`}
                  onClick={() => setDivFilterTier('all')}
                >
                  All ({totalDivCount})
                </button>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterTier === 'Regular' ? 'active-blue' : ''}`}
                  onClick={() => setDivFilterTier('Regular')}
                >
                  Regular ({regularDivCount})
                </button>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterTier === 'Freshers' ? 'active-green' : ''}`}
                  onClick={() => setDivFilterTier('Freshers')}
                >
                  Freshers ({freshersDivCount})
                </button>
              </div>

              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

              <div className="filter-pills-container">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event:</span>
                <button 
                  type="button" 
                  className={`filter-pill ${divFilterEvent === 'all' ? 'active' : ''}`}
                  onClick={() => setDivFilterEvent('all')}
                >
                  All Events
                </button>
                {EVENT_TYPES.map(ev => {
                  const count = Object.values(divisions).filter(d => (d.event || 'Kyorugi') === ev).length;
                  if (count === 0 && divFilterEvent !== ev) return null;
                  return (
                    <button 
                      key={ev}
                      type="button" 
                      className={`filter-pill ${divFilterEvent === ev ? 'active' : ''}`}
                      onClick={() => setDivFilterEvent(ev)}
                    >
                      {ev} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card-title" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedDivisionId && divisions[selectedDivisionId] && (
                  <span className={`badge ${divisions[selectedDivisionId].categoryType === 'Freshers' ? 'badge-green' : 'badge-blue'}`}>
                    {divisions[selectedDivisionId].categoryType === 'Freshers' ? 'Freshers' : 'Regular'}
                  </span>
                )}
                <span>{selectedDivisionId && divisions[selectedDivisionId] ? divisions[selectedDivisionId].name : 'Bracket Viewer'}</span>
              </div>

              <select 
                value={selectedDivisionId}
                onChange={(e) => setSelectedDivisionId(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '280px' }}
              >
                <option value="" disabled>Select a division</option>
                {freshersDivisions.length > 0 && (
                  <optgroup label="Freshers Divisions">
                    {freshersDivisions.map(div => (
                      <option key={div.id} value={div.id}>
                        {div.name} ({div.count} players)
                      </option>
                    ))}
                  </optgroup>
                )}
                {regularDivisions.length > 0 && (
                  <optgroup label="Regular Divisions">
                    {regularDivisions.map(div => (
                      <option key={div.id} value={div.id}>
                        {div.name} ({div.count} players)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              {selectedDivisionId && !brackets[selectedDivisionId] && (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleGenerateBracket(selectedDivisionId)}
                  disabled={(divisions[selectedDivisionId]?.count || 0) < 2}
                >
                  Generate Bracket
                </button>
              )}
            </div>

            {selectedDivisionId && brackets[selectedDivisionId] ? (
              <BracketView 
                divisionId={selectedDivisionId}
                divisionName={divisions[selectedDivisionId]?.name}
                courtNo={divisionCourts[selectedDivisionId]}
                rounds={brackets[selectedDivisionId]}
                setBrackets={setBrackets}
                onRegenerate={() => handleGenerateBracket(selectedDivisionId)}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                {selectedDivisionId 
                  ? "This division has no generated bracket. Click 'Generate Bracket' above." 
                  : "Please select a division to view its bracket."}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <ResultsView
            divisions={divisions}
            brackets={brackets}
            divisionCourts={divisionCourts}
            totalCourts={totalCourts}
            setBrackets={setBrackets}
          />
        )}
      </main>
    </div>
  );
}

export default App;
