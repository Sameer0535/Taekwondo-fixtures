import { useState, useEffect, useRef } from 'react';
import { COUNTRY_LIST } from '../utils/countries';
import { 
  WEIGHT_CATEGORIES, 
  EVENT_TYPES, 
  CATEGORY_TIERS, 
  TOURNAMENT_STRUCTURE 
} from '../data/tournamentCategories';

function CompetitorList({ 
  competitors, 
  setCompetitors, 
  onLoadSamples, 
  onClearAll, 
  tournamentMode = 'official', 
  setTournamentMode, 
  totalCourts = 4, 
  setTotalCourts 
}) {
  // Form State
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [country, setCountry] = useState('IND');
  const [event, setEvent] = useState('Kyorugi');
  const [categoryType, setCategoryType] = useState('Regular'); // 'Regular' | 'Freshers'
  const [subCategory, setSubCategory] = useState('Individual');
  const [gender, setGender] = useState('Male');
  const [ageCategory, setAgeCategory] = useState('Over 17');
  const [weightClass, setWeightClass] = useState('Under 68kg');

  const GROUP4_AGE_CLASSES = ['U-4', 'U-6', 'U-8', 'U-10', 'U-12', 'U-15', 'U-18', 'A-18'];

  // Current event configuration
  const currentEventConfig = TOURNAMENT_STRUCTURE[event] || TOURNAMENT_STRUCTURE['Kyorugi'];
  const currentTierConfig = currentEventConfig[categoryType] || currentEventConfig['Regular'] || { subCategories: [] };
  const currentSubCats = currentTierConfig.subCategories || [];
  const activeSubCat = currentSubCats.find(sc => sc.id === subCategory) || currentSubCats[0] || {
    id: 'Individual',
    name: 'Individual',
    ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
    genders: ['Male', 'Female'],
    hasWeights: true
  };

  useEffect(() => {
    if (tournamentMode === 'group4') {
      if (!GROUP4_AGE_CLASSES.includes(ageCategory)) {
        setAgeCategory('U-10');
      }
    } else {
      if (GROUP4_AGE_CLASSES.includes(ageCategory)) {
        setAgeCategory('Over 17');
        const weights = WEIGHT_CATEGORIES['Over 17']?.[gender] || [];
        if (weights.length > 0) setWeightClass(weights[0].value);
      }
    }
  }, [tournamentMode, ageCategory, gender]);

  // Custom Searchable Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Event & Tier Change Handlers
  const handleEventChange = (newEvent) => {
    setEvent(newEvent);
    const eventCfg = TOURNAMENT_STRUCTURE[newEvent] || TOURNAMENT_STRUCTURE['Kyorugi'];
    const tierCfg = eventCfg[categoryType] || eventCfg['Regular'] || { subCategories: [] };
    const firstSub = tierCfg.subCategories?.[0];
    if (firstSub) {
      setSubCategory(firstSub.id);
      const validGenders = firstSub.genders || ['Male', 'Female'];
      const newGender = validGenders.includes(gender) ? gender : validGenders[0];
      setGender(newGender);
      const validAges = firstSub.ageDivisions || ['Over 17'];
      const newAge = validAges.includes(ageCategory) ? ageCategory : validAges[0];
      setAgeCategory(newAge);
      if (firstSub.hasWeights) {
        const weights = WEIGHT_CATEGORIES[newAge]?.[newGender] || [];
        setWeightClass(weights.length > 0 ? weights[0].value : '');
      } else {
        setWeightClass(firstSub.defaultWeight || '');
      }
    }
  };

  const handleCategoryTypeChange = (newTier) => {
    setCategoryType(newTier);
    const eventCfg = TOURNAMENT_STRUCTURE[event] || TOURNAMENT_STRUCTURE['Kyorugi'];
    const tierCfg = eventCfg[newTier] || eventCfg['Regular'] || { subCategories: [] };
    const firstSub = tierCfg.subCategories?.[0];
    if (firstSub) {
      setSubCategory(firstSub.id);
      const validGenders = firstSub.genders || ['Male', 'Female'];
      const newGender = validGenders.includes(gender) ? gender : validGenders[0];
      setGender(newGender);
      const validAges = firstSub.ageDivisions || ['Over 17'];
      const newAge = validAges.includes(ageCategory) ? ageCategory : validAges[0];
      setAgeCategory(newAge);
      if (firstSub.hasWeights) {
        const weights = WEIGHT_CATEGORIES[newAge]?.[newGender] || [];
        setWeightClass(weights.length > 0 ? weights[0].value : '');
      } else {
        setWeightClass(firstSub.defaultWeight || '');
      }
    }
  };

  const handleSubCategoryChange = (newSubId) => {
    setSubCategory(newSubId);
    const sub = currentSubCats.find(s => s.id === newSubId);
    if (sub) {
      const validGenders = sub.genders || ['Male', 'Female'];
      const newGender = validGenders.includes(gender) ? gender : validGenders[0];
      setGender(newGender);
      const validAges = sub.ageDivisions || ['Over 17'];
      const newAge = validAges.includes(ageCategory) ? ageCategory : validAges[0];
      setAgeCategory(newAge);
      if (sub.hasWeights) {
        const weights = WEIGHT_CATEGORIES[newAge]?.[newGender] || [];
        setWeightClass(weights.length > 0 ? weights[0].value : '');
      } else {
        setWeightClass(sub.defaultWeight || '');
      }
    }
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    if (activeSubCat.hasWeights) {
      const weights = WEIGHT_CATEGORIES[ageCategory]?.[newGender] || [];
      if (weights.length > 0) {
        setWeightClass(weights[0].value);
      }
    }
  };

  const handleAgeCategoryChange = (newAge) => {
    setAgeCategory(newAge);
    if (tournamentMode !== 'group4' && activeSubCat.hasWeights) {
      const weights = WEIGHT_CATEGORIES[newAge]?.[gender] || [];
      if (weights.length > 0) {
        setWeightClass(weights[0].value);
      }
    }
  };

  // Bulk Import State
  const [bulkText, setBulkText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkEvent, setBulkEvent] = useState('Kyorugi');
  const [bulkCategoryType, setBulkCategoryType] = useState('Regular');
  const [bulkSubCategory, setBulkSubCategory] = useState('Individual');
  const [bulkGender, setBulkGender] = useState('Male');
  const [bulkAgeCategory, setBulkAgeCategory] = useState('Over 17');
  const [bulkWeightClass, setBulkWeightClass] = useState('Under 68kg');

  const bulkEventCfg = TOURNAMENT_STRUCTURE[bulkEvent] || TOURNAMENT_STRUCTURE['Kyorugi'];
  const bulkTierCfg = bulkEventCfg[bulkCategoryType] || bulkEventCfg['Regular'] || { subCategories: [] };
  const bulkSubCats = bulkTierCfg.subCategories || [];
  const bulkActiveSub = bulkSubCats.find(s => s.id === bulkSubCategory) || bulkSubCats[0] || {
    id: 'Individual',
    ageDivisions: ['Children', 'Sub Junior', 'Cadet', 'Junior', 'Over 17'],
    genders: ['Male', 'Female'],
    hasWeights: true
  };

  const handleBulkEventChange = (newEvent) => {
    setBulkEvent(newEvent);
    const eventCfg = TOURNAMENT_STRUCTURE[newEvent] || TOURNAMENT_STRUCTURE['Kyorugi'];
    const tierCfg = eventCfg[bulkCategoryType] || eventCfg['Regular'] || { subCategories: [] };
    const firstSub = tierCfg.subCategories?.[0];
    if (firstSub) {
      setBulkSubCategory(firstSub.id);
      const validGenders = firstSub.genders || ['Male', 'Female'];
      const newGender = validGenders.includes(bulkGender) ? bulkGender : validGenders[0];
      setBulkGender(newGender);
      const validAges = firstSub.ageDivisions || ['Over 17'];
      const newAge = validAges.includes(bulkAgeCategory) ? bulkAgeCategory : validAges[0];
      setBulkAgeCategory(newAge);
      if (firstSub.hasWeights) {
        const weights = WEIGHT_CATEGORIES[newAge]?.[newGender] || [];
        setBulkWeightClass(weights.length > 0 ? weights[0].value : '');
      } else {
        setBulkWeightClass(firstSub.defaultWeight || '');
      }
    }
  };

  const handleBulkCategoryTypeChange = (newTier) => {
    setBulkCategoryType(newTier);
    const eventCfg = TOURNAMENT_STRUCTURE[bulkEvent] || TOURNAMENT_STRUCTURE['Kyorugi'];
    const tierCfg = eventCfg[newTier] || eventCfg['Regular'] || { subCategories: [] };
    const firstSub = tierCfg.subCategories?.[0];
    if (firstSub) {
      setBulkSubCategory(firstSub.id);
      const validGenders = firstSub.genders || ['Male', 'Female'];
      const newGender = validGenders.includes(bulkGender) ? bulkGender : validGenders[0];
      setBulkGender(newGender);
      const validAges = firstSub.ageDivisions || ['Over 17'];
      const newAge = validAges.includes(bulkAgeCategory) ? bulkAgeCategory : validAges[0];
      setBulkAgeCategory(newAge);
      if (firstSub.hasWeights) {
        const weights = WEIGHT_CATEGORIES[newAge]?.[newGender] || [];
        setBulkWeightClass(weights.length > 0 ? weights[0].value : '');
      } else {
        setBulkWeightClass(firstSub.defaultWeight || '');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCompetitor = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      club: club.trim() || 'Independent',
      country,
      event: tournamentMode === 'group4' ? 'Kyorugi' : event,
      categoryType: tournamentMode === 'group4' ? 'Regular' : categoryType,
      subCategory: tournamentMode === 'group4' ? 'Individual' : (activeSubCat.id || subCategory),
      gender,
      ageCategory,
      weightClass: tournamentMode === 'group4' ? '' : (activeSubCat.hasWeights ? weightClass : (activeSubCat.defaultWeight || '')),
      rank: '',
      seed: null
    };

    setCompetitors(prev => [...prev, newCompetitor]);
    setName('');
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const newComps = [];

    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(',').map(p => p.trim());
      if (parts[0]) {
        const compName = parts[0];
        const compClub = parts[1] || 'Independent';
        const compGender = parts.length >= 5 ? parts[2] : bulkGender;
        const compAgeCategory = parts.length >= 5 ? parts[3] : bulkAgeCategory;
        const compWeightClass = parts.length >= 5 ? parts[4] : (tournamentMode === 'group4' ? '' : (bulkActiveSub.hasWeights ? bulkWeightClass : (bulkActiveSub.defaultWeight || '')));
        const compCountry = parts.length >= 6 ? parts[5].toUpperCase() : 'IND';
        const compTier = parts.length >= 7 ? parts[6] : bulkCategoryType;
        const compEvent = parts.length >= 8 ? parts[7] : bulkEvent;

        newComps.push({
          id: 'c_' + Math.random().toString(36).substr(2, 9),
          name: compName,
          club: compClub,
          gender: compGender,
          ageCategory: compAgeCategory,
          weightClass: compWeightClass,
          country: compCountry,
          categoryType: compTier,
          event: compEvent,
          subCategory: bulkActiveSub.id || bulkSubCategory,
          rank: '',
          seed: null
        });
      }
    });

    if (newComps.length > 0) {
      setCompetitors(prev => [...prev, ...newComps]);
      setBulkText('');
      setShowBulkImport(false);
      const targetDiv = tournamentMode === 'group4' 
        ? `${bulkGender} ${bulkAgeCategory}` 
        : `[${bulkCategoryType}] ${bulkEvent} - ${bulkGender} ${bulkAgeCategory} ${bulkWeightClass}`;
      alert(`Successfully imported ${newComps.length} competitors into ${targetDiv}!`);
    } else {
      alert("No valid competitors found in the pasted text.");
    }
  };

  const handleDelete = (id) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
  };

  // Filtered country list based on search query
  const filteredCountriesForSelect = COUNTRY_LIST.filter(c => 
    c.noc !== 'KM' && c.noc !== 'EE' && (
      c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
      c.noc.toLowerCase().includes(countrySearchQuery.toLowerCase())
    )
  );

  const selectedCountryObj = COUNTRY_LIST.find(c => c.noc === country);
  const selectedLabel = country === 'none' ? 'No Flag' : (selectedCountryObj ? `${selectedCountryObj.name} (${selectedCountryObj.noc})` : 'India (IND)');

  // Competitor list filters
  const [filterTier, setFilterTier] = useState('all'); // 'all' | 'Regular' | 'Freshers'
  const [filterEvent, setFilterEvent] = useState('all'); // 'all' | event name
  const [searchQuery, setSearchQuery] = useState('');

  const regularCount = competitors.filter(c => (c.categoryType || 'Regular') === 'Regular').length;
  const freshersCount = competitors.filter(c => c.categoryType === 'Freshers').length;

  const filteredCompetitors = competitors.filter(c => {
    const cTier = c.categoryType || 'Regular';
    const cEvent = c.event || 'Kyorugi';

    if (filterTier !== 'all' && cTier !== filterTier) return false;
    if (filterEvent !== 'all' && cEvent !== filterEvent) return false;

    const q = searchQuery.toLowerCase();
    if (!q) return true;

    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.club || '').toLowerCase().includes(q) ||
      (c.weightClass || '').toLowerCase().includes(q) ||
      (c.ageCategory || '').toLowerCase().includes(q) ||
      cTier.toLowerCase().includes(q) ||
      cEvent.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-grid">
      {/* Sidebar: Entry Form */}
      <div>
        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tournament Mode
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: tournamentMode === 'official' ? 'var(--blue-comp)' : 'transparent',
                color: tournamentMode === 'official' ? '#ffffff' : 'var(--text-color)',
                boxShadow: tournamentMode === 'official' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setTournamentMode && setTournamentMode('official')}
            >
              Official
            </button>
            <button
              type="button"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: tournamentMode === 'group4' ? 'var(--blue-comp)' : 'transparent',
                color: tournamentMode === 'group4' ? '#ffffff' : 'var(--text-color)',
                boxShadow: tournamentMode === 'group4' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setTournamentMode && setTournamentMode('group4')}
            >
              Group-4
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Courts Available
          </div>
          <select 
            className="form-control"
            value={totalCourts}
            onChange={e => setTotalCourts && setTotalCourts(Number(e.target.value))}
            style={{ fontSize: '0.85rem' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'Court' : 'Courts'}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Add Competitor</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Participant Name" 
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Club / Affiliation</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={club} 
                  onChange={e => setClub(e.target.value)} 
                  placeholder="Academy Name" 
                />
              </div>
              <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
                <label className="form-label">Country</label>
                
                <div 
                  className="form-control" 
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setCountrySearchQuery('');
                  }}
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    backgroundColor: 'white',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '4px', flex: 1, textAlign: 'left' }}>{selectedLabel}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>▼</span>
                </div>

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 1000,
                    marginTop: '4px',
                    maxHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '6px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                      <input 
                        type="text"
                        className="form-control"
                        value={countrySearchQuery}
                        onChange={e => setCountrySearchQuery(e.target.value)}
                        placeholder="Search country..."
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                        autoFocus
                      />
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {('no flag'.includes(countrySearchQuery.toLowerCase()) || 'none'.includes(countrySearchQuery.toLowerCase())) && (
                        <div 
                          onClick={() => {
                            setCountry('none');
                            setIsDropdownOpen(false);
                          }}
                          style={{ 
                            padding: '0.45rem 0.75rem', 
                            fontSize: '0.85rem', 
                            cursor: 'pointer',
                            backgroundColor: country === 'none' ? 'var(--blue-comp-light)' : 'transparent',
                            color: country === 'none' ? 'var(--blue-comp)' : 'inherit',
                            fontWeight: country === 'none' ? 'bold' : 'normal'
                          }}
                          className="dropdown-item"
                        >
                          No Flag
                        </div>
                      )}
                      
                      {filteredCountriesForSelect.length === 0 ? (
                        <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                          No countries found
                        </div>
                      ) : (
                        filteredCountriesForSelect.map(c => (
                          <div 
                            key={c.noc}
                            onClick={() => {
                              setCountry(c.noc);
                              setIsDropdownOpen(false);
                            }}
                            style={{ 
                              padding: '0.45rem 0.75rem', 
                              fontSize: '0.85rem', 
                              cursor: 'pointer',
                              backgroundColor: country === c.noc ? 'var(--blue-comp-light)' : 'transparent',
                              color: country === c.noc ? 'var(--blue-comp)' : 'inherit',
                              fontWeight: country === c.noc ? 'bold' : 'normal'
                            }}
                            className="dropdown-item"
                          >
                            {c.name} ({c.noc})
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event & Category Tier (Regular vs Freshers) */}
            {tournamentMode !== 'group4' && (
              <>
                <div className="form-group">
                  <label className="form-label">Competition Event</label>
                  <select 
                    className="form-control" 
                    value={event} 
                    onChange={e => handleEventChange(e.target.value)}
                  >
                    {EVENT_TYPES.map(ev => (
                      <option key={ev} value={ev}>{ev}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Category Tier</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: categoryType === 'Freshers' ? '#047857' : '#2563eb' }}>
                      {categoryType === 'Freshers' ? '🌱 Freshers (Separate)' : '⭐ Regular (Separate)'}
                    </span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: categoryType === 'Regular' ? 'var(--blue-comp)' : 'transparent',
                        color: categoryType === 'Regular' ? '#ffffff' : 'var(--text-color)',
                        boxShadow: categoryType === 'Regular' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleCategoryTypeChange('Regular')}
                    >
                      Regular
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: categoryType === 'Freshers' ? '#059669' : 'transparent',
                        color: categoryType === 'Freshers' ? '#ffffff' : 'var(--text-color)',
                        boxShadow: categoryType === 'Freshers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleCategoryTypeChange('Freshers')}
                    >
                      Freshers
                    </button>
                  </div>
                </div>

                {/* Sub-Category / Technique selector when event has multiple */}
                {currentSubCats.length > 1 && (
                  <div className="form-group">
                    <label className="form-label">Discipline / Format</label>
                    <select 
                      className="form-control" 
                      value={subCategory} 
                      onChange={e => handleSubCategoryChange(e.target.value)}
                    >
                      {currentSubCats.map(sc => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select 
                  className="form-control" 
                  value={gender} 
                  onChange={e => handleGenderChange(e.target.value)}
                >
                  {(activeSubCat.genders || ['Male', 'Female']).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Division</label>
                <select 
                  className="form-control" 
                  value={ageCategory} 
                  onChange={e => handleAgeCategoryChange(e.target.value)}
                >
                  {tournamentMode === 'group4' ? (
                    GROUP4_AGE_CLASSES.map(ac => (
                      <option key={ac} value={ac}>{ac}</option>
                    ))
                  ) : (
                    (activeSubCat.ageDivisions || ['Over 17']).map(ac => (
                      <option key={ac} value={ac}>{ac}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {tournamentMode !== 'group4' && activeSubCat.hasWeights && (
              <div className="form-group">
                <label className="form-label">Weight Category</label>
                <select 
                  className="form-control" 
                  value={weightClass} 
                  onChange={e => setWeightClass(e.target.value)}
                >
                  {(WEIGHT_CATEGORIES[ageCategory]?.[gender] || WEIGHT_CATEGORIES['Over 17']?.[gender] || []).map(wc => (
                    <option key={wc.value} value={wc.value}>{wc.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Add Competitor
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowBulkImport(!showBulkImport)}
            >
              {showBulkImport ? 'Hide Bulk Import' : 'Bulk Import (CSV/Paste)'}
            </button>

            <button className="btn btn-secondary" onClick={onLoadSamples}>
              Reset with Sample Data
            </button>
            
            <button className="btn btn-danger btn-sm" onClick={onClearAll}>
              Clear All Competitors
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel: Competitors Table */}
      <div className="card">
        {showBulkImport && (
          <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Bulk Competitor Import</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Event</label>
                <select 
                  className="form-control" 
                  style={{ fontSize: '0.85rem' }} 
                  value={bulkEvent} 
                  onChange={e => handleBulkEventChange(e.target.value)}
                >
                  {EVENT_TYPES.map(ev => (
                    <option key={ev} value={ev}>{ev}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Category Tier</label>
                <select 
                  className="form-control" 
                  style={{ fontSize: '0.85rem' }} 
                  value={bulkCategoryType} 
                  onChange={e => handleBulkCategoryTypeChange(e.target.value)}
                >
                  {CATEGORY_TIERS.map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>

              {bulkSubCats.length > 1 && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Discipline</label>
                  <select 
                    className="form-control" 
                    style={{ fontSize: '0.85rem' }} 
                    value={bulkSubCategory} 
                    onChange={e => setBulkSubCategory(e.target.value)}
                  >
                    {bulkSubCats.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Gender</label>
                <select 
                  className="form-control" 
                  style={{ fontSize: '0.85rem' }} 
                  value={bulkGender} 
                  onChange={e => {
                    const g = e.target.value;
                    setBulkGender(g);
                    if (tournamentMode !== 'group4' && bulkActiveSub.hasWeights) {
                      const weights = WEIGHT_CATEGORIES[bulkAgeCategory]?.[g] || [];
                      if (weights.length > 0) setBulkWeightClass(weights[0].value);
                    }
                  }}
                >
                  {(bulkActiveSub.genders || ['Male', 'Female']).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Division</label>
                <select 
                  className="form-control" 
                  style={{ fontSize: '0.85rem' }} 
                  value={bulkAgeCategory} 
                  onChange={e => {
                    const a = e.target.value;
                    setBulkAgeCategory(a);
                    if (tournamentMode !== 'group4' && bulkActiveSub.hasWeights) {
                      const weights = WEIGHT_CATEGORIES[a]?.[bulkGender] || [];
                      if (weights.length > 0) setBulkWeightClass(weights[0].value);
                    }
                  }}
                >
                  {(bulkActiveSub.ageDivisions || ['Over 17']).map(ac => (
                    <option key={ac} value={ac}>{ac}</option>
                  ))}
                </select>
              </div>

              {tournamentMode !== 'group4' && bulkActiveSub.hasWeights && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Weight Category</label>
                  <select 
                    className="form-control" 
                    style={{ fontSize: '0.85rem' }} 
                    value={bulkWeightClass} 
                    onChange={e => setBulkWeightClass(e.target.value)}
                  >
                    {(WEIGHT_CATEGORIES[bulkAgeCategory]?.[bulkGender] || WEIGHT_CATEGORIES['Over 17']?.[bulkGender] || []).map(wc => (
                      <option key={wc.value} value={wc.value}>{wc.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Competitor List (Format: <em>Name, Academy</em> - one per line)
            </label>
            <textarea
              className="form-control"
              rows="6"
              style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.25rem' }}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="Lee Dae-hoon, Seoul TKD&#10;Alexei Denisenko, Rostov Club&#10;Joel Gonzalez, Madrid High Performance"
            />

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
              <button className="btn btn-primary btn-sm" onClick={handleBulkImport}>Import List</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkImport(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card-title" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span>Registered Competitors ({competitors.length})</span>
          </div>
          
          <input 
            type="text" 
            className="form-control"
            style={{ minWidth: '160px', flex: 1, maxWidth: '250px', fontSize: '0.85rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search competitor, club, division..."
          />
        </div>

        {/* Quick Filter Bar: Regular vs Freshers, Event Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tier:</span>
            <button 
              type="button" 
              className={`filter-pill ${filterTier === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTier('all')}
            >
              All ({competitors.length})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${filterTier === 'Regular' ? 'active-blue' : ''}`}
              onClick={() => setFilterTier('Regular')}
            >
               Regular ({regularCount})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${filterTier === 'Freshers' ? 'active-green' : ''}`}
              onClick={() => setFilterTier('Freshers')}
            >
               Freshers ({freshersCount})
            </button>
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

          <div className="filter-pills-container">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event:</span>
            <button 
              type="button" 
              className={`filter-pill ${filterEvent === 'all' ? 'active' : ''}`}
              onClick={() => setFilterEvent('all')}
            >
              All Events
            </button>
            {EVENT_TYPES.map(ev => {
              const count = competitors.filter(c => (c.event || 'Kyorugi') === ev).length;
              if (count === 0 && filterEvent !== ev) return null;
              return (
                <button 
                  key={ev}
                  type="button" 
                  className={`filter-pill ${filterEvent === ev ? 'active' : ''}`}
                  onClick={() => setFilterEvent(ev)}
                >
                  {ev} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Filter Bar: Regular vs Freshers, Event Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="filter-pills-container">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tier:</span>
            <button 
              type="button" 
              className={`filter-pill ${filterTier === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTier('all')}
            >
              All ({competitors.length})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${filterTier === 'Regular' ? 'active-blue' : ''}`}
              onClick={() => setFilterTier('Regular')}
            >
              ⭐ Regular ({regularCount})
            </button>
            <button 
              type="button" 
              className={`filter-pill ${filterTier === 'Freshers' ? 'active-green' : ''}`}
              onClick={() => setFilterTier('Freshers')}
            >
              🌱 Freshers ({freshersCount})
            </button>
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

          <div className="filter-pills-container">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event:</span>
            <button 
              type="button" 
              className={`filter-pill ${filterEvent === 'all' ? 'active' : ''}`}
              onClick={() => setFilterEvent('all')}
            >
              All Events
            </button>
            {EVENT_TYPES.map(ev => {
              const count = competitors.filter(c => (c.event || 'Kyorugi') === ev).length;
              if (count === 0 && filterEvent !== ev) return null;
              return (
                <button 
                  key={ev}
                  type="button" 
                  className={`filter-pill ${filterEvent === ev ? 'active' : ''}`}
                  onClick={() => setFilterEvent(ev)}
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
                <th>Name</th>
                <th>Club</th>
                <th>Tier</th>
                <th>Event & Division</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompetitors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {competitors.length === 0 ? "No competitors registered. Add some using the form!" : "No matches found for your filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredCompetitors.map(comp => {
                  const isFreshers = comp.categoryType === 'Freshers';
                  const compEvent = comp.event || 'Kyorugi';
                  return (
                    <tr key={comp.id}>
                      <td>
                        <strong>{comp.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {comp.gender} {comp.country && comp.country !== 'none' ? `• ${comp.country}` : ''}
                        </div>
                      </td>
                      <td>{comp.club || 'Independent'}</td>
                      <td>
                        <span className={`badge ${isFreshers ? 'badge-green' : 'badge-blue'}`}>
                          {isFreshers ? '🌱 Freshers' : '⭐ Regular'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          <span className="badge badge-purple">{compEvent}</span>
                          <span className="badge badge-gray">
                            {comp.ageCategory}
                            {comp.weightClass ? ` ${comp.weightClass}` : ''}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(comp.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompetitorList;
