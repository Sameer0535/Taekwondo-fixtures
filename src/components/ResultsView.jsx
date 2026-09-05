import React, { useState, useMemo, useEffect } from 'react';
import BracketView from './BracketView';
import { nocToIso } from '../utils/countries';

// Clean SVG Icons
const TrophyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const MedalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const CourtIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="12" x2="12" y1="5" y2="19" />
  </svg>
);

function ResultsView({ divisions = {}, brackets = {}, divisionCourts = {}, totalCourts = 4, setBrackets }) {
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [viewMode, setViewMode] = useState('bracket'); // 'bracket' | 'podium'

  // 1. Gather all divisions with their brackets, court assignments, and calculate completion statistics
  const allDivisionStats = useMemo(() => {
    const list = Object.keys(divisions).map(id => {
      const division = divisions[id];
      const rounds = brackets[id];
      const courtNo = divisionCourts[id] ? String(divisionCourts[id]) : 'Unassigned';
      
      let status = 'Not Started';
      let totalMatches = 0;
      let completedMatches = 0;
      let podium = null;
      let matchHistory = [];

      if (rounds && rounds.length > 0) {
        rounds.forEach(round => {
          round.forEach(match => {
            if (match.status !== 'walkover') {
              totalMatches++;
              if (match.status === 'completed') {
                completedMatches++;
                matchHistory.push(match);
              }
            }
          });
        });

        const finalRound = rounds[rounds.length - 1];
        const finalMatch = finalRound?.[0];
        const isMainComplete = finalMatch?.status === 'completed';

        if (totalMatches === 0) {
          status = 'Not Started';
        } else if (isMainComplete) {
          status = 'Completed';
        } else {
          status = 'In Progress';
        }

        if (completedMatches > 0) {
          const first = (finalMatch?.status === 'completed' && finalMatch.winnerId) ? 
            (finalMatch.winnerId === finalMatch.p1?.id ? finalMatch.p1 : finalMatch.p2) : null;
          const second = (finalMatch?.status === 'completed' && finalMatch.winnerId) ? 
            (finalMatch.winnerId === finalMatch.p1?.id ? finalMatch.p2 : finalMatch.p1) : null;
          
          let bronze1 = null;
          let bronze2 = null;

          const semiRound = rounds[rounds.length - 2];
          if (semiRound) {
            const m1 = semiRound[0];
            const m2 = semiRound[1];
            if (m1 && m1.winnerId) {
              const loser = m1.winnerId === m1.p1?.id ? m1.p2 : m1.p1;
              if (loser && loser.name) {
                bronze1 = loser;
              }
            }
            if (m2 && m2.winnerId) {
              const loser = m2.winnerId === m2.p1?.id ? m2.p2 : m2.p1;
              if (loser && loser.name) {
                bronze2 = loser;
              }
            }
          }

          podium = { first, second, bronze1, bronze2 };
        }
      }

      return {
        id,
        name: division.name,
        competitorsCount: division.competitors?.length || 0,
        status,
        courtNo,
        totalMatches,
        completedMatches,
        podium,
        matchHistory: matchHistory.sort((a, b) => (a.matchNo || 0) - (b.matchNo || 0))
      };
    });

    return list;
  }, [divisions, brackets, divisionCourts]);

  // 2. Filter division stats according to selected court
  const filteredDivisionStats = useMemo(() => {
    let list = allDivisionStats;
    if (selectedCourt !== 'all') {
      if (selectedCourt === 'unassigned') {
        list = list.filter(d => d.courtNo === 'Unassigned');
      } else {
        list = list.filter(d => String(d.courtNo) === String(selectedCourt));
      }
    }
    return list;
  }, [allDivisionStats, selectedCourt]);

  // Auto-select first division if current selection is invalid for filtered list
  useEffect(() => {
    if (filteredDivisionStats.length > 0) {
      const exists = filteredDivisionStats.some(d => d.id === selectedDivisionId);
      if (!exists) {
        setSelectedDivisionId(filteredDivisionStats[0].id);
      }
    } else {
      setSelectedDivisionId('');
    }
  }, [filteredDivisionStats, selectedDivisionId]);

  // Overall statistics for active court filter
  const statsSummary = useMemo(() => {
    const totalDivisions = filteredDivisionStats.length;
    const completedDivisions = filteredDivisionStats.filter(d => d.status === 'Completed').length;
    const inProgressDivisions = filteredDivisionStats.filter(d => d.status === 'In Progress').length;
    
    let totalM = 0;
    let completedM = 0;
    filteredDivisionStats.forEach(d => {
      totalM += d.totalMatches;
      completedM += d.completedMatches;
    });

    return {
      totalDivisions,
      completedDivisions,
      inProgressDivisions,
      totalMatches: totalM,
      completedMatches: completedM,
      matchPercent: totalM > 0 ? Math.round((completedM / totalM) * 100) : 0
    };
  }, [filteredDivisionStats]);

  const selectedDivision = allDivisionStats.find(d => d.id === selectedDivisionId);

  // Count unassigned divisions
  const unassignedCount = useMemo(() => {
    return allDivisionStats.filter(d => d.courtNo === 'Unassigned').length;
  }, [allDivisionStats]);

  const renderFlag = (countryCode) => {
    if (!countryCode || countryCode === 'none') return null;
    const iso = nocToIso(countryCode);
    if (!iso) return null;
    return (
      <img 
        src={'https://flagcdn.com/w40/' + iso + '.png'} 
        alt={countryCode} 
        style={{ width: '18px', height: '12px', borderRadius: '1px', objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* 1. Court Selector & Quick Summary Bar */}
      <div className="card no-print" style={{ padding: '0.85rem 1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Court Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.25rem' }}>
              Court Filter:
            </span>

            <button
              className={('btn ' + (selectedCourt === 'all' ? 'btn-primary' : 'btn-secondary'))}
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', borderRadius: '8px' }}
              onClick={() => setSelectedCourt('all')}
            >
              All Courts ({allDivisionStats.length})
            </button>
            
            {Array.from({ length: totalCourts }, (_, i) => i + 1).map(courtNum => {
              const courtStr = String(courtNum);
              const count = allDivisionStats.filter(d => String(d.courtNo) === courtStr).length;
              const isActive = selectedCourt === courtStr;
              return (
                <button
                  key={courtNum}
                  className={('btn ' + (isActive ? 'btn-primary' : 'btn-secondary'))}
                  style={{ 
                    fontSize: '0.85rem', 
                    padding: '0.35rem 0.85rem', 
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#3b82f6' : undefined,
                    color: isActive ? '#ffffff' : undefined
                  }}
                  onClick={() => setSelectedCourt(courtStr)}
                >
                  <CourtIcon /> Court {courtNum} ({count})
                </button>
              );
            })}

            {unassignedCount > 0 && (
              <button
                className={('btn ' + (selectedCourt === 'unassigned' ? 'btn-primary' : 'btn-secondary'))}
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', borderRadius: '8px' }}
                onClick={() => setSelectedCourt('unassigned')}
              >
                Unassigned ({unassignedCount})
              </button>
            )}
          </div>

          {/* Compact Court Statistics Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: '600' }}>
              {statsSummary.totalDivisions} Divisions
            </span>
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', color: 'var(--green-comp)', fontWeight: '600' }}>
              {statsSummary.completedDivisions} Completed
            </span>
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: 'var(--blue-comp)', fontWeight: '600' }}>
              {statsSummary.inProgressDivisions} In Progress
            </span>
            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600' }}>
              {statsSummary.completedMatches}/{statsSummary.totalMatches} Matches ({statsSummary.matchPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Results Card (Full Width) */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {filteredDivisionStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              No divisions found for {selectedCourt === 'all' ? 'any court' : selectedCourt === 'unassigned' ? 'unassigned courts' : ('Court ' + selectedCourt)}.
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              Assign courts in the Home or Brackets tab to see them listed here.
            </div>
          </div>
        ) : (
          <div>
            {/* Division Selector & View Mode Switcher Header Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              
              {/* Left: Division Dropdown & Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="results-div-select" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Division:
                  </label>
                  <select
                    id="results-div-select"
                    value={selectedDivisionId}
                    onChange={(e) => setSelectedDivisionId(e.target.value)}
                    className="form-control"
                    style={{ fontWeight: '700', fontSize: '0.95rem', minWidth: '260px', width: 'auto' }}
                  >
                    {filteredDivisionStats.map(div => (
                      <option key={div.id} value={div.id}>
                        {div.name} ({div.competitorsCount} players) — {div.courtNo !== 'Unassigned' ? ('Court ' + div.courtNo) : 'Unassigned'}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDivision && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      backgroundColor: selectedDivision.courtNo !== 'Unassigned' ? '#3b82f6' : '#9ca3af',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      <CourtIcon /> {selectedDivision.courtNo !== 'Unassigned' ? ('Court ' + selectedDivision.courtNo) : 'Unassigned'}
                    </span>

                    <span className={('badge ' + (selectedDivision.status === 'Completed' ? 'badge-blue' : selectedDivision.status === 'In Progress' ? 'badge-red' : 'badge-gray'))} style={{ fontSize: '0.75rem' }}>
                      {selectedDivision.status}
                    </span>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                      {selectedDivision.competitorsCount} Competitors • {selectedDivision.completedMatches} of {selectedDivision.totalMatches} Matches Completed
                    </span>
                  </div>
                )}
              </div>

              {/* Right: View Mode Toggle */}
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setViewMode('bracket')}
                    style={{
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: viewMode === 'bracket' ? 'var(--primary)' : 'transparent',
                      color: viewMode === 'bracket' ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <TrophyIcon /> Updated Bracket
                  </button>
                  <button
                    onClick={() => setViewMode('podium')}
                    style={{
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: viewMode === 'podium' ? 'var(--primary)' : 'transparent',
                      color: viewMode === 'podium' ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <MedalIcon /> Standings & Podium
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Division Switcher Chips (when 2 to 10 divisions in current court) */}
            {filteredDivisionStats.length > 1 && filteredDivisionStats.length <= 10 && (
              <div className="no-print" style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)' }}>
                {filteredDivisionStats.map(div => {
                  const isSelected = div.id === selectedDivisionId;
                  return (
                    <button
                      key={div.id}
                      onClick={() => setSelectedDivisionId(div.id)}
                      style={{
                        padding: '0.3rem 0.7rem',
                        fontSize: '0.8rem',
                        fontWeight: isSelected ? '700' : '500',
                        borderRadius: '6px',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{div.name}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        ({div.completedMatches}/{div.totalMatches})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div style={{ marginTop: '1rem' }}>
              {selectedDivision && viewMode === 'bracket' && (
                <div>
                  {brackets[selectedDivision.id] && brackets[selectedDivision.id].length > 0 ? (
                    <BracketView
                      divisionId={selectedDivision.id}
                      divisionName={selectedDivision.name}
                      courtNo={selectedDivision.courtNo !== 'Unassigned' ? selectedDivision.courtNo : null}
                      rounds={brackets[selectedDivision.id]}
                      setBrackets={setBrackets}
                      hideHeaderTitle={true}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                        No bracket diagram generated yet for this division. Please generate the bracket in the <strong>Brackets</strong> tab.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedDivision && viewMode === 'podium' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Medal Podium Section */}
                  {selectedDivision.podium ? (
                    <div>
                      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        <MedalIcon /> Medal Podium Standings
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        
                        {/* 1st Place (Gold) */}
                        {selectedDivision.podium.first && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.85rem 1.25rem', 
                            borderRadius: '8px', 
                            border: '1.5px solid #eab308', 
                            background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.12) 0%, rgba(255, 255, 255, 0) 100%)',
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              backgroundColor: '#eab308', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: 'white', 
                              fontWeight: 'bold', 
                              fontSize: '1rem', 
                              marginRight: '1rem',
                              boxShadow: '0 2px 4px rgba(234, 179, 8, 0.3)'
                            }}>
                              1st
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                                {selectedDivision.podium.first.name}
                                {renderFlag(selectedDivision.podium.first.country)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {selectedDivision.podium.first.club} • {selectedDivision.podium.first.rank || 'Competitor'}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              GOLD MEDAL
                            </div>
                          </div>
                        )}

                        {/* 2nd Place (Silver) */}
                        {selectedDivision.podium.second && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.85rem 1.25rem', 
                            borderRadius: '8px', 
                            border: '1.5px solid #94a3b8', 
                            background: 'linear-gradient(90deg, rgba(148, 163, 184, 0.12) 0%, rgba(255, 255, 255, 0) 100%)',
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              backgroundColor: '#94a3b8', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: 'white', 
                              fontWeight: 'bold', 
                              fontSize: '1rem', 
                              marginRight: '1rem',
                              boxShadow: '0 2px 4px rgba(148, 163, 184, 0.3)'
                            }}>
                              2nd
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                                {selectedDivision.podium.second.name}
                                {renderFlag(selectedDivision.podium.second.country)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {selectedDivision.podium.second.club} • {selectedDivision.podium.second.rank || 'Competitor'}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              SILVER MEDAL
                            </div>
                          </div>
                        )}

                        {/* 3rd Place A (Bronze) */}
                        {selectedDivision.podium.bronze1 && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.85rem 1.25rem', 
                            borderRadius: '8px', 
                            border: '1.5px solid #d97706', 
                            background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              backgroundColor: '#d97706', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: 'white', 
                              fontWeight: 'bold', 
                              fontSize: '1rem', 
                              marginRight: '1rem',
                              boxShadow: '0 2px 4px rgba(217, 119, 6, 0.3)'
                            }}>
                              3rd
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                                {selectedDivision.podium.bronze1.name}
                                {renderFlag(selectedDivision.podium.bronze1.country)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {selectedDivision.podium.bronze1.club} • {selectedDivision.podium.bronze1.rank || 'Competitor'}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              BRONZE MEDAL
                            </div>
                          </div>
                        )}

                        {/* 3rd Place B (Bronze) */}
                        {selectedDivision.podium.bronze2 && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.85rem 1.25rem', 
                            borderRadius: '8px', 
                            border: '1.5px solid #d97706', 
                            background: 'linear-gradient(90deg, rgba(217, 119, 6, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              backgroundColor: '#d97706', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: 'white', 
                              fontWeight: 'bold', 
                              fontSize: '1rem', 
                              marginRight: '1rem',
                              boxShadow: '0 2px 4px rgba(217, 119, 6, 0.3)'
                            }}>
                              3rd
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                                {selectedDivision.podium.bronze2.name}
                                {renderFlag(selectedDivision.podium.bronze2.country)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {selectedDivision.podium.bronze2.club} • {selectedDivision.podium.bronze2.rank || 'Competitor'}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              BRONZE MEDAL
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Medal Standings Pending
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Complete semifinal and final matches in the <strong>Updated Bracket</strong> to determine gold, silver, and bronze medalists.
                      </div>
                    </div>
                  )}

                  {/* Completed Matches Section */}
                  {selectedDivision.matchHistory.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        Completed Matches ({selectedDivision.matchHistory.length})
                      </h3>
                      
                      <div className="table-container">
                        <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Match</th>
                              <th>Competitors & Scores</th>
                              <th>Winner</th>
                              <th>Result Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDivision.matchHistory.map(m => {
                              const p1Winner = m.winnerId === m.p1?.id;
                              const p2Winner = m.winnerId === m.p2?.id;

                              return (
                                <tr key={m.id}>
                                  <td style={{ fontWeight: 'bold' }}>#{m.matchNo}</td>
                                  <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: p1Winner ? 'var(--blue-comp-light)' : 'transparent', color: p1Winner ? 'var(--blue-comp)' : 'inherit', fontWeight: p1Winner ? 'bold' : 'normal' }}>
                                        <span>
                                          {m.p1?.name || 'TBD'}
                                          {m.p1 && renderFlag(m.p1.country)}
                                        </span>
                                        <span>{m.score1 !== null ? m.score1 : '-'}</span>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: p2Winner ? 'var(--red-comp-light)' : 'transparent', color: p2Winner ? 'var(--red-comp)' : 'inherit', fontWeight: p2Winner ? 'bold' : 'normal' }}>
                                        <span>
                                          {m.p2?.name || 'TBD'}
                                          {m.p2 && renderFlag(m.p2.country)}
                                        </span>
                                        <span>{m.score2 !== null ? m.score2 : '-'}</span>
                                      </div>
                                      {m.roundScores && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', paddingLeft: '0.4rem', fontStyle: 'italic' }}>
                                          Rounds: {m.roundScores.map((r, i) => r.blue !== null && r.red !== null ? 'R' + (i + 1) + ': ' + r.blue + '-' + r.red : null).filter(Boolean).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {m.winnerId === m.p1?.id ? m.p1?.name : (m.winnerId === m.p2?.id ? m.p2?.name : 'TBD')}
                                  </td>
                                  <td>
                                    <span className="badge badge-blue">
                                      {m.winType}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsView;
