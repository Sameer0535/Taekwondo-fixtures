import kyorixLogo from './assets/kyorix-logo.png';
import { useState, useEffect, useMemo } from 'react';
import CompetitorList from './components/CompetitorList';
import BracketView from './components/BracketView';
import ResultsView from './components/ResultsView';
import { generateBracket } from './utils/bracketBuilder';
import { SEED_DASARA_COMPETITORS, SEED_DASARA_BRACKETS } from './data/seedData';
import './App.css';

const SAMPLE_COMPETITORS = [
  // Division: Male Senior Under 68kg (5 players - tests walkovers & bye propagation)
  { id: 'c1', name: 'Lee Dae-hoon', club: 'Seoul TKD', country: 'KOR', seed: 1, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '3rd Dan' },
  { id: 'c2', name: 'Alexei Denisenko', club: 'Rostov Club', country: 'RUS', seed: 2, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '2nd Dan' },
  { id: 'c3', name: 'Joel Gonzalez', club: 'Madrid High Performance', country: 'ESP', seed: 3, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '4th Dan' },
  { id: 'c4', name: 'Servet Tazegul', club: 'Istanbul Warriors', country: 'TUR', seed: 4, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '3rd Dan' },
  { id: 'c5', name: 'Ahmad Abughaush', club: 'Amman Lions', country: 'JOR', seed: null, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 68kg', rank: '1st Dan' },

  // Division: Female Senior Under 57kg (4 players - perfect power of 2)
  { id: 'c6', name: 'Jade Jones', club: 'Manchester Elite', country: 'GBR', seed: 1, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '3rd Dan' },
  { id: 'c7', name: 'Eva Calvo', club: 'Madrid High Performance', country: 'ESP', seed: 2, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '2nd Dan' },
  { id: 'c8', name: 'Hedaya Malak', club: 'Cairo TKD Academy', country: 'EGY', seed: 3, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '1st Dan' },
  { id: 'c9', name: 'Kimia Alizadeh', club: 'Karaj Club', country: 'IRI', seed: 4, gender: 'Female', ageCategory: 'Senior', weightClass: 'Under 57kg', rank: '2nd Dan' },

  // Division: Male Junior Under 59kg (3 players - tests single bye)
  { id: 'c10', name: 'Marc-Andre', club: 'Montreal Peak', country: 'CAN', seed: 1, gender: 'Male', ageCategory: 'Junior', weightClass: 'Under 59kg', rank: '1st Dan' },
  { id: 'c11', name: 'Park Tae-joon', club: 'Incheon High', country: 'KOR', seed: 2, gender: 'Male', ageCategory: 'Junior', weightClass: 'Under 59kg', rank: '1st Poom' },
  { id: 'c12', name: 'Vito Dell\'Aquila', club: 'Roma Warriors', country: 'ITA', seed: null, gender: 'Male', ageCategory: 'Junior', weightClass: 'Under 59kg', rank: '1st Poom' },

  // Division: Male Senior Under 80kg (8 players - perfect 8-player bracket, no byes)
  { id: 'c13', name: 'Cheick Sallah Cisse', club: 'Abidjan Elite', country: 'IND', seed: 1, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '4th Dan' },
  { id: 'c14', name: 'Lutalo Muhammad', club: 'London Academy', country: 'GBR', seed: 2, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '3rd Dan' },
  { id: 'c15', name: 'Milad Beigi', club: 'Baku Warriors', country: 'IND', seed: 3, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '3rd Dan' },
  { id: 'c16', name: 'Albert Gaun', club: 'Moscow Club', country: 'RUS', seed: 4, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '2nd Dan' },
  { id: 'c17', name: 'Oussama Oueslati', club: 'Tunis Center', country: 'IND', seed: 5, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '1st Dan' },
  { id: 'c18', name: 'Steven Lopez', club: 'Texas Legacy', country: 'USA', seed: 6, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '5th Dan' },
  { id: 'c19', name: 'Aaron Cook', club: 'Chisinau Giants', country: 'GBR', seed: 7, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '4th Dan' },
  { id: 'c20', name: 'Nikita Rafalovich', club: 'Tashkent Peak', country: 'UZB', seed: 8, gender: 'Male', ageCategory: 'Senior', weightClass: 'Under 80kg', rank: '3rd Dan' },
  ...Array.from({ length: 52 }, (_, index) => {
    const i = index + 1;
    return {
      id: `c_large_${i}`,
      name: `Player ${i}`,
      club: `Academy ${String.fromCharCode(65 + (i % 26))}`,
      country: i % 2 === 0 ? 'KOR' : 'IND',
      seed: i <= 8 ? i : null,
      gender: 'Male',
      ageCategory: 'Senior',
      weightClass: 'Under 58kg',
      rank: `${(i % 4) + 1}st Dan`
    };
  })
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
  { id: 'g4_18', name: 'Avani Reddy', club: 'Hyderabad Center', country: 'IND', seed: null, gender: 'Female', ageCategory: 'U-8', weightClass: '', rank: 'Yellow Belt' },

  // Male U-12 (4 players -> 1 group of 4 players)
  { id: 'g4_19', name: 'Devansh Reddy', club: 'Hyderabad Center', country: 'IND', seed: 1, gender: 'Male', ageCategory: 'U-12', weightClass: '', rank: 'Red Belt' },
  { id: 'g4_20', name: 'Ishaan Nair', club: 'Kerala TKD', country: 'IND', seed: 2, gender: 'Male', ageCategory: 'U-12', weightClass: '', rank: 'Blue Belt' },
  { id: 'g4_21', name: 'Reyansh Rao', club: 'Bangalore Center', country: 'IND', seed: 3, gender: 'Male', ageCategory: 'U-12', weightClass: '', rank: 'Red Belt' },
  { id: 'g4_22', name: 'Yash Vardhan', club: 'Indore TKD', country: 'IND', seed: 4, gender: 'Male', ageCategory: 'U-12', weightClass: '', rank: 'Blue Belt' },

  // Female U-15 (5 players -> 2 groups)
  { id: 'g4_23', name: 'Pari Choudhary', club: 'Jaipur TKD', country: 'IND', seed: 1, gender: 'Female', ageCategory: 'U-15', weightClass: '', rank: 'Red Belt' },
  { id: 'g4_24', name: 'Nisha Agarwal', club: 'Delhi TKD', country: 'IND', seed: 2, gender: 'Female', ageCategory: 'U-15', weightClass: '', rank: 'Black Belt' },
  { id: 'g4_25', name: 'Simran Gill', club: 'Punjab Academy', country: 'IND', seed: 3, gender: 'Female', ageCategory: 'U-15', weightClass: '', rank: 'Red Belt' },
  { id: 'g4_26', name: 'Tanvi Shah', club: 'Ahmedabad Strikers', country: 'IND', seed: 4, gender: 'Female', ageCategory: 'U-15', weightClass: '', rank: 'Blue Belt' },
  { id: 'g4_27', name: 'Meera Iyer', club: 'Chennai Lions', country: 'IND', seed: null, gender: 'Female', ageCategory: 'U-15', weightClass: '', rank: 'Red Belt' }
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
    } catch (e) {}
    const initial = [...SEED_DASARA_COMPETITORS, ...SAMPLE_COMPETITORS];
    try {
      localStorage.setItem('tkd_competitors_v3', JSON.stringify(initial));
      localStorage.setItem('tkd_competitors_v1', JSON.stringify(initial));
    } catch (e) {}
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
    } catch (e) {
      return SEED_DASARA_BRACKETS;
    }
  });

  const [activeTab, setActiveTab] = useState('brackets');
  const [regenerateToast, setRegenerateToast] = useState(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState('Male_Dasara_Under_56kg');
  const [syncStatus, setSyncStatus] = useState('synced');
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Auto-save and live broadcast state to EvtMgr and backend
  useEffect(() => {
    try {
      const serialized = JSON.stringify(competitors);
      if (localStorage.getItem('tkd_competitors_v3') !== serialized) {
        localStorage.setItem('tkd_competitors_v3', serialized);
        localStorage.setItem('tkd_competitors_v1', serialized);
      }
    } catch(e) {}

    // Broadcast to parent window (EvtMgr iframe container) and opener
    const payload = {
      type: 'TKD_DRAWS_UPDATED',
      competitors,
      brackets,
      courts: divisionCourts
    };
    if (typeof window !== 'undefined') {
      if (window.parent && window.parent !== window) {
        try { window.parent.postMessage(payload, '*'); } catch(e) {}
      }
      if (window.opener && !window.opener.closed) {
        try { window.opener.postMessage(payload, '*'); } catch(e) {}
      }
    }

    // Push to backend live-sync if available
    const endpoints = ['/api/live-sync', 'http://localhost:3000/api/live-sync'];
    endpoints.forEach(ep => {
      try {
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competitors, brackets, divisionCourts })
        }).catch(() => {});
      } catch(e) {}
    });
  }, [competitors]);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(brackets);
      if (localStorage.getItem('tkd_brackets_v3') !== serialized) {
        localStorage.setItem('tkd_brackets_v3', serialized);
        localStorage.setItem('tkd_match_updated', Date.now().toString());
      }
    } catch(e) {}

    const payload = {
      type: 'TKD_DRAWS_UPDATED',
      competitors,
      brackets,
      courts: divisionCourts
    };
    if (typeof window !== 'undefined') {
      if (window.parent && window.parent !== window) {
        try { window.parent.postMessage(payload, '*'); } catch(e) {}
      }
      if (window.opener && !window.opener.closed) {
        try { window.opener.postMessage(payload, '*'); } catch(e) {}
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
      } catch(e) {}
    });
  }, [brackets]);

  // Live incoming synchronization from EvtMgr (postMessage, storage event, and server polling)
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
              // Preserve Dasara competitors always
              SEED_DASARA_COMPETITORS.forEach(c => compMap.set((c.id || c.name || '').toLowerCase(), c));
              parsed.forEach(c => {
                const k = (c.id || c.name || '').toLowerCase();
                compMap.set(k, { ...(compMap.get(k) || {}), ...c });
              });
              setCompetitors(Array.from(compMap.values()));
            }
          } catch(e) {}
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
          } catch(e) {}
        }
        if (savedMode) setTournamentMode(savedMode);
        if (savedCourts) {
          try {
            const parsed = JSON.parse(savedCourts);
            if (parsed && typeof parsed === 'object') setDivisionCourts(parsed);
          } catch(e) {}
        }
        if (savedTotalCourts) setTotalCourts(Number(savedTotalCourts));
        setSyncStatus('synced');
        setLastSyncTime(new Date());
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

    // Safe non-destructive background server synchronization
    const checkServerData = async () => {
      const endpoints = ['/api/live-sync', 'http://localhost:3000/api/live-sync'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep + '?t=' + Date.now());
          if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
              if (data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0) {
                setCompetitors(prev => {
                  const compMap = new Map();
                  // 1. Keep seed Dasara competitors
                  SEED_DASARA_COMPETITORS.forEach(c => compMap.set((c.id || c.name || '').toLowerCase(), c));
                  // 2. Keep local state
                  prev.forEach(c => compMap.set((c.id || c.name || '').toLowerCase(), c));
                  // 3. Merge server competitors
                  data.competitors.forEach(c => {
                    const k = (c.id || c.name || '').toLowerCase();
                    compMap.set(k, { ...(compMap.get(k) || {}), ...c });
                  });
                  const merged = Array.from(compMap.values());
                  const serialized = JSON.stringify(merged);
                  if (localStorage.getItem('tkd_competitors_v3') !== serialized) {
                    localStorage.setItem('tkd_competitors_v3', serialized);
                    localStorage.setItem('tkd_competitors_v1', serialized);
                  }
                  return merged;
                });
              }
              if (data.brackets && typeof data.brackets === 'object' && Object.keys(data.brackets).length > 0) {
                setBrackets(prev => {
                  const merged = {
                    ...SEED_DASARA_BRACKETS,
                    ...prev,
                    ...data.brackets
                  };
                  // Never allow Male_Dasara_Under_56kg to be cleared if it was seeded
                  if (!merged['Male_Dasara_Under_56kg'] || merged['Male_Dasara_Under_56kg'].length === 0) {
                    merged['Male_Dasara_Under_56kg'] = SEED_DASARA_BRACKETS['Male_Dasara_Under_56kg'];
                  }
                  const serialized = JSON.stringify(merged);
                  if (localStorage.getItem('tkd_brackets_v3') !== serialized) {
                    localStorage.setItem('tkd_brackets_v3', serialized);
                  }
                  return merged;
                });
              }
              if (data.divisionCourts && typeof data.divisionCourts === 'object') {
                setDivisionCourts(prev => ({ ...prev, ...data.divisionCourts }));
              }
              setSyncStatus('synced');
              setLastSyncTime(new Date());
              break;
            }
          }
        } catch(e) {}
      }
    };

    checkServerData();
    const interval = setInterval(checkServerData, 4000);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(interval);
    };
  }, []);


  // Compute divisions dynamically based on tournamentMode
  const divisions = useMemo(() => {
    const divs = {};
    if (tournamentMode === 'group4') {
      const categories = {};
      const ageMap = {
        'Senior': 'A-18',
        'Junior': 'U-18',
        'Cadet': 'U-15',
        'Sub-Junior': 'U-12'
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
            count: groupComps.length,
            competitors: groupComps
          };
        }
      });
    } else {
      competitors.forEach(c => {
        const wc = c.weightClass || 'Open';
        const divId = `${c.gender}_${c.ageCategory}_${wc}`.replace(/\s+/g, '_');
        const divName = `${c.gender} ${c.ageCategory} ${wc}`;
        if (!divs[divId]) {
          divs[divId] = { id: divId, name: divName, count: 0, competitors: [] };
        }
        divs[divId].count++;
        divs[divId].competitors.push(c);
      });
    }
    return divs;
  }, [competitors, tournamentMode]);

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
    if (window.confirm("Load sample competitors? (This will overwrite current data)")) {
      const samples = tournamentMode === 'group4' ? SAMPLE_GROUP4_COMPETITORS : SAMPLE_COMPETITORS;
      setCompetitors(samples);
      setBrackets({});
      setSelectedDivisionId('');
    }
  };

  const handleForceSyncNow = async () => {
    setSyncStatus('syncing');
    try {
      // 1. Save local state
      localStorage.setItem('tkd_competitors_v3', JSON.stringify(competitors));
      localStorage.setItem('tkd_competitors_v1', JSON.stringify(competitors));
      localStorage.setItem('tkd_brackets_v3', JSON.stringify(brackets));
      localStorage.setItem('tkd_division_courts_v1', JSON.stringify(divisionCourts));
      localStorage.setItem('tkd_match_updated', Date.now().toString());

      // 2. Broadcast to parent window / iframe container
      const payload = {
        type: 'TKD_DRAWS_UPDATED',
        competitors,
        brackets,
        courts: divisionCourts
      };
      if (typeof window !== 'undefined') {
        if (window.parent && window.parent !== window) {
          try { window.parent.postMessage(payload, '*'); } catch(e) {}
        }
        if (window.opener && !window.opener.closed) {
          try { window.opener.postMessage(payload, '*'); } catch(e) {}
        }
      }

      // 3. Push to server endpoints
      const endpoints = ['/api/live-sync', 'http://localhost:3000/api/live-sync'];
      for (const ep of endpoints) {
        try {
          await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ competitors, brackets, divisionCourts })
          });
        } catch(e) {}
      }
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      alert('Tournament data synchronized successfully with EvtMgr and server!');
    } catch(err) {
      setSyncStatus('error');
      alert('Sync notice: ' + (err.message || 'Synced locally and broadcasted to EvtMgr'));
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
            Divisions ({Object.keys(divisions).length})
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
            <div className="card-title">
              <span>Active Divisions ({Object.keys(divisions).length})</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }} className="no-print">
                <button className="btn btn-primary btn-sm" onClick={handleGenerateAllBrackets}>
                  Generate All Brackets
                </button>
              </div>
            </div>
            
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Division Name</th>
                    <th>Competitors</th>
                    <th>Bracket Status</th>
                    <th>Court / Ring</th>
                    <th className="no-print" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(divisions).length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No competitors registered yet. Please add competitors first.
                      </td>
                    </tr>
                  ) : (
                    Object.values(divisions).map(div => (
                      <tr key={div.id}>
                        <td><strong>{div.name}</strong></td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {activeTab === 'brackets' && (
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{selectedDivisionId && divisions[selectedDivisionId] ? divisions[selectedDivisionId].name : 'Bracket Viewer'}</span>
              <select 
                value={selectedDivisionId}
                onChange={(e) => setSelectedDivisionId(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '250px' }}
              >
                <option value="" disabled>Select a division</option>
                {Object.values(divisions).map(div => (
                  <option key={div.id} value={div.id}>{div.name} ({div.count} players)</option>
                ))}
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
