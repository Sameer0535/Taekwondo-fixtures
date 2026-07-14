import { useState, useEffect, useRef } from 'react';
import { COUNTRY_LIST } from '../utils/countries';

// Exact weight categories mapping based on the tournament regulation sheet
const WEIGHT_CATEGORIES = {
  'Sub-Junior': {
    Male: [
      { value: 'Under 18kg', label: 'Under 18kg (Not exceeding 18kg)' },
      { value: 'Under 21kg', label: 'Under 21kg (18-21kg)' },
      { value: 'Under 23kg', label: 'Under 23kg (21-23kg)' },
      { value: 'Under 25kg', label: 'Under 25kg (23-25kg)' },
      { value: 'Under 27kg', label: 'Under 27kg (25-27kg)' },
      { value: 'Under 29kg', label: 'Under 29kg (27-29kg)' },
      { value: 'Under 32kg', label: 'Under 32kg (29-32kg)' },
      { value: 'Under 35kg', label: 'Under 35kg (32-35kg)' },
      { value: 'Under 38kg', label: 'Under 38kg (35-38kg)' },
      { value: 'Under 41kg', label: 'Under 41kg (38-41kg)' },
      { value: 'Under 44kg', label: 'Under 44kg (41-44kg)' },
      { value: 'Under 50kg', label: 'Under 50kg (44-50kg)' }
    ],
    Female: [
      { value: 'Under 16kg', label: 'Under 16kg (Not exceeding 16kg)' },
      { value: 'Under 18kg', label: 'Under 18kg (16-18kg)' },
      { value: 'Under 20kg', label: 'Under 20kg (18-20kg)' },
      { value: 'Under 22kg', label: 'Under 22kg (20-22kg)' },
      { value: 'Under 24kg', label: 'Under 24kg (22-24kg)' },
      { value: 'Under 26kg', label: 'Under 26kg (24-26kg)' },
      { value: 'Under 29kg', label: 'Under 29kg (26-29kg)' },
      { value: 'Under 32kg', label: 'Under 32kg (29-32kg)' },
      { value: 'Under 35kg', label: 'Under 35kg (32-35kg)' },
      { value: 'Under 38kg', label: 'Under 38kg (35-38kg)' },
      { value: 'Under 41kg', label: 'Under 41kg (38-41kg)' },
      { value: 'Under 47kg', label: 'Under 47kg (41-47kg)' }
    ]
  },
  'Cadet': {
    Male: [
      { value: 'Under 33kg', label: 'Under 33kg (Not exceeding 33kg)' },
      { value: 'Under 37kg', label: 'Under 37kg (33-37kg)' },
      { value: 'Under 41kg', label: 'Under 41kg (37-41kg)' },
      { value: 'Under 45kg', label: 'Under 45kg (41-45kg)' },
      { value: 'Under 49kg', label: 'Under 49kg (45-49kg)' },
      { value: 'Under 53kg', label: 'Under 53kg (49-53kg)' },
      { value: 'Under 57kg', label: 'Under 57kg (53-57kg)' },
      { value: 'Under 61kg', label: 'Under 61kg (57-61kg)' },
      { value: 'Under 65kg', label: 'Under 65kg (61-65kg)' },
      { value: 'Over 65kg', label: 'Over 65kg' }
    ],
    Female: [
      { value: 'Under 29kg', label: 'Under 29kg (Not exceeding 29kg)' },
      { value: 'Under 33kg', label: 'Under 33kg (29-33kg)' },
      { value: 'Under 37kg', label: 'Under 37kg (33-37kg)' },
      { value: 'Under 41kg', label: 'Under 41kg (37-41kg)' },
      { value: 'Under 44kg', label: 'Under 44kg (41-44kg)' },
      { value: 'Under 47kg', label: 'Under 47kg (44-47kg)' },
      { value: 'Under 51kg', label: 'Under 51kg (47-51kg)' },
      { value: 'Under 55kg', label: 'Under 55kg (51-55kg)' },
      { value: 'Under 59kg', label: 'Under 59kg (55-59kg)' },
      { value: 'Over 59kg', label: 'Over 59kg' }
    ]
  },
  'Junior': {
    Male: [
      { value: 'Under 45kg', label: 'Under 45kg (Not exceeding 45kg)' },
      { value: 'Under 48kg', label: 'Under 48kg (45-48kg)' },
      { value: 'Under 51kg', label: 'Under 51kg (48-51kg)' },
      { value: 'Under 55kg', label: 'Under 55kg (51-55kg)' },
      { value: 'Under 59kg', label: 'Under 59kg (55-59kg)' },
      { value: 'Under 63kg', label: 'Under 63kg (59-63kg)' },
      { value: 'Under 68kg', label: 'Under 68kg (63-68kg)' },
      { value: 'Under 73kg', label: 'Under 73kg (68-73kg)' },
      { value: 'Under 78kg', label: 'Under 78kg (73-78kg)' },
      { value: 'Over 78kg', label: 'Over 78kg' }
    ],
    Female: [
      { value: 'Under 42kg', label: 'Under 42kg (Not exceeding 42kg)' },
      { value: 'Under 44kg', label: 'Under 44kg (42-44kg)' },
      { value: 'Under 46kg', label: 'Under 46kg (44-46kg)' },
      { value: 'Under 49kg', label: 'Under 49kg (46-49kg)' },
      { value: 'Under 52kg', label: 'Under 52kg (49-52kg)' },
      { value: 'Under 55kg', label: 'Under 55kg (52-55kg)' },
      { value: 'Under 59kg', label: 'Under 59kg (55-59kg)' },
      { value: 'Under 63kg', label: 'Under 63kg (59-63kg)' },
      { value: 'Under 68kg', label: 'Under 68kg (63-68kg)' },
      { value: 'Over 68kg', label: 'Over 68kg' }
    ]
  },
  'Senior': {
    Male: [
      { value: 'Under 54kg', label: 'Under 54kg (Not exceeding 54kg)' },
      { value: 'Under 58kg', label: 'Under 58kg (54-58kg)' },
      { value: 'Under 63kg', label: 'Under 63kg (58-63kg)' },
      { value: 'Under 68kg', label: 'Under 68kg (63-68kg)' },
      { value: 'Under 74kg', label: 'Under 74kg (68-74kg)' },
      { value: 'Under 80kg', label: 'Under 80kg (74-80kg)' },
      { value: 'Under 87kg', label: 'Under 87kg (80-87kg)' },
      { value: 'Over 87kg', label: 'Over 87kg' }
    ],
    Female: [
      { value: 'Under 46kg', label: 'Under 46kg (Not exceeding 46kg)' },
      { value: 'Under 49kg', label: 'Under 49kg (46-49kg)' },
      { value: 'Under 53kg', label: 'Under 53kg (49-53kg)' },
      { value: 'Under 57kg', label: 'Under 57kg (53-57kg)' },
      { value: 'Under 62kg', label: 'Under 62kg (57-62kg)' },
      { value: 'Under 67kg', label: 'Under 67kg (62-67kg)' },
      { value: 'Under 73kg', label: 'Under 73kg (67-73kg)' },
      { value: 'Over 73kg', label: 'Over 73kg' }
    ]
  }
};



function CompetitorList({ competitors, setCompetitors, onLoadSamples, onClearAll }) {
  // Form State
  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [country, setCountry] = useState('IND');
  const [gender, setGender] = useState('Male');
  const [ageCategory, setAgeCategory] = useState('Senior');
  const [weightClass, setWeightClass] = useState('Under 68kg');

  // Custom Searchable Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Bulk Import State
  const [bulkText, setBulkText] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Dynamic selector helpers
  const handleGenderChange = (newGender) => {
    setGender(newGender);
    const weights = WEIGHT_CATEGORIES[ageCategory]?.[newGender] || [];
    if (weights.length > 0) {
      setWeightClass(weights[0].value);
    }
  };

  const handleAgeCategoryChange = (newAge) => {
    setAgeCategory(newAge);
    const weights = WEIGHT_CATEGORIES[newAge]?.[gender] || [];
    if (weights.length > 0) {
      setWeightClass(weights[0].value);
    }
  };
  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCompetitor = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      club: club.trim() || 'Independent',
      country,
      gender,
      ageCategory,
      weightClass,
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
      
      // Expected format: Name, Club, Gender, AgeCategory, WeightClass, CountryCode
      const parts = line.split(',').map(p => p.trim());
      if (parts[0]) {
        newComps.push({
          id: 'c_' + Math.random().toString(36).substr(2, 9),
          name: parts[0],
          club: parts[1] || 'Independent',
          gender: parts[2] || 'Male',
          ageCategory: parts[3] || 'Senior',
          weightClass: parts[4] || 'Under 68kg',
          country: parts[5] ? parts[5].toUpperCase() : 'IND',
          rank: '',
          seed: null
        });
      }
    });

    if (newComps.length > 0) {
      setCompetitors(prev => [...prev, ...newComps]);
      setBulkText('');
      setShowBulkImport(false);
      alert(`Successfully imported ${newComps.length} competitors!`);
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

  // Filtered list
  const filteredCompetitors = competitors.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.club.toLowerCase().includes(q) ||
      c.weightClass.toLowerCase().includes(q) ||
      c.ageCategory.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dashboard-grid">
      {/* Sidebar: Entry Form */}
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-control" value={gender} onChange={e => handleGenderChange(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Age Class</label>
              <select className="form-control" value={ageCategory} onChange={e => handleAgeCategoryChange(e.target.value)}>
                <option value="Sub-Junior">Sub-Junior</option>
                <option value="Cadet">Cadet (12-14)</option>
                <option value="Junior">Junior (15-17)</option>
                <option value="Senior">Senior (18+)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Weight Division</label>
            <select className="form-control" value={weightClass} onChange={e => setWeightClass(e.target.value)}>
              {(WEIGHT_CATEGORIES[ageCategory]?.[gender] || []).map(wc => (
                <option key={wc.value} value={wc.value}>{wc.label}</option>
              ))}
            </select>
          </div>

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

      {/* Main Panel: Competitors Table */}
      <div className="card">
        {showBulkImport && (
          <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4>Bulk Competitor Import</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Paste comma-separated rows. Format: <em>Name, Club, Gender, AgeCategory, WeightClass</em>
            </p>
            <textarea
              className="form-control"
              rows="6"
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="Lee Dae-hoon, Seoul TKD, Male, Senior, Under 68kg&#10;Jade Jones, Manchester Elite, Female, Senior, Under 57kg"
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem' }}>
              <button className="btn btn-primary btn-sm" onClick={handleBulkImport}>Import List</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkImport(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Registered Competitors ({competitors.length})</span>
          <input 
            type="text" 
            className="form-control"
            style={{ minWidth: '140px', flex: 1, maxWidth: '250px', fontSize: '0.85rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search competitor, club..."
          />
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Club</th>
                <th>Division</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompetitors.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {competitors.length === 0 ? "No competitors registered. Add some using the form!" : "No matches found for your search query."}
                  </td>
                </tr>
              ) : (
                filteredCompetitors.map(comp => (
                  <tr key={comp.id}>
                    <td>
                      <strong>{comp.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{comp.gender}</div>
                    </td>
                    <td>{comp.club}</td>
                    <td>
                      <span className="badge badge-gray">{comp.ageCategory} {comp.weightClass}</span>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompetitorList;
