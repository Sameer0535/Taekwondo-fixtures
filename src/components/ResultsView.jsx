import React, { useState, useMemo, useEffect } from 'react';
import BracketView from './BracketView';
import { nocToIso } from '../utils/countries';

function ResultsView({ divisions = {}, brackets = {}, divisionCourts = {}, totalCourts = 4, setBrackets }) {
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [viewMode, setViewMode] = useState('bracket'); // 'bracket' | 'podium'
  const [searchTerm, setSearchTerm] = useState('');

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

  // 2. Filter division stats according to selected court and search term
  const filteredDivisionStats = useMemo(() => {
    let list = allDivisionStats;
    if (selectedCourt !== 'all') {
      if (selectedCourt === 'unassigned') {
        list = list.filter(d => d.courtNo === 'Unassigned');
      } else {
        list = list.filter(d => String(d.courtNo) === String(selectedCourt));
      }
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(term));
    }
    return list;
  }, [allDivisionStats, selectedCourt, searchTerm]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Court Selection Bar */}
      <div className="card no-print" style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>???</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)' }}>Select Court for Results & Brackets</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Choose a court to filter standings, view statistics, and inspect live updated bracket diagrams
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={('btn ' + (selectedCourt === 'all' ? 'btn-primary' : 'btn-secondary'))}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', borderRadius: '8px' }}
              onClick={() => setSelectedCourt('all')}
            >
              All Courts ({allDivisionStats.length})
            </button>
            
            {Array.from({ length: totalCourts }, (_, i) => i + 1).map(courtNum => {
              const courtStr = String(courtNum);
              const count = allDivisionStats.filter(d => String(d.courtNo) === courtStr).length;
              return (
                <button
                  key={courtNum}
                  className={('btn ' + (selectedCourt === courtStr ? 'btn-primary' : 'btn-secondary'))}
                  style={{ 
                    fontSize: '0.85rem', 
                    padding: '0.45rem 0.9rem', 
                    borderRadius: '8px',
                    backgroundColor: selectedCourt === courtStr ? '#3b82f6' : undefined,
                    color: selectedCourt === courtStr ? '#ffffff' : undefined
                  }}
                  onClick={() => setSelectedCourt(courtStr)}
                >
                  Court {courtNum} ({count})
                </button>
              );
            })}

            {unassignedCount > 0 && (
              <button
                className={('btn ' + (selectedCourt === 'unassigned' ? 'btn-primary' : 'btn-secondary'))}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', borderRadius: '8px' }}
                onClick={() => setSelectedCourt('unassigned')}
              >
                Unassigned ({unassignedCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Dashboard Stats (Filtered by Active Court) */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: 'var(--primary)' }}></div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Total Divisions</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{statsSummary.totalDivisions}</div>
        </div>
        
        <div className="card" style={{ padding: '1.1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: 'var(--green-comp)' }}></div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Completed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--green-comp)' }}>{statsSummary.completedDivisions}</div>
        </div>

        <div className="card" style={{ padding: '1.1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: 'var(--blue-comp)' }}></div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>In Progress</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--blue-comp)' }}>{statsSummary.inProgressDivisions}</div>
        </div>

        <div className="card" style={{ padding: '1.1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: '#8b5cf6' }}></div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Total Matches</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{statsSummary.totalMatches}</div>
        </div>

        <div className="card" style={{ padding: '1.1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: '#ec4899' }}></div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Completion Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ec4899' }}>{statsSummary.matchPercent}%</div>
        </div>
      </div>

      {/* Main Content Layout: Divisions List & Division Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Division Selector Sidebar */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 'bold' }}>Divisions</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedCourt === 'all' ? 'All Courts' : selectedCourt === 'unassigned' ? 'Unassigned' : ('Court ' + selectedCourt) }
            </span>
          </div>

          <input
            type="text"
            className="form-control"
            placeholder="Search division..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredDivisionStats.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No divisions found for active filter.
              </div>
            ) : (
              filteredDivisionStats.map(div => {
                const isSelected = div.id === selectedDivisionId;

                return (
                  <button
                    key={div.id}
                    onClick={() => setSelectedDivisionId(div.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: isSelected ? 'bold' : '600', fontSize: '0.9rem', lineHeight: '1.2' }}>
                      {div.name}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {div.competitorsCount} Competitors
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: div.courtNo !== 'Unassigned' ? '#e0e7ff' : '#f3f4f6',
                          color: div.courtNo !== 'Unassigned' ? '#3730a3' : '#6b7280',
                          border: div.courtNo !== 'Unassigned' ? '1px solid #c7d2fe' : '1px solid #e5e7eb'
                        }}>
                          {div.courtNo !== 'Unassigned' ? ('Court ' + div.courtNo) : 'Unassigned'}
                        </span>

                        <span className={('badge ' + (div.status === 'Completed' ? 'badge-blue' : div.status === 'In Progress' ? 'badge-red' : 'badge-gray'))} style={{ fontSize: '0.7rem' }}>
                          {div.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
        {/* Right Column: Selected Division Results & Brackets */}
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
 {!selectedDivision ? (
 <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
 Select a division from the list to view standings, match results, and bracket view.
 </div>
 ) : (
 <div>
 {/* Header Info & View Mode Toggle */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
 <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 'bold' }}>
 {selectedDivision.name}
 </h2>
 
 {/* Court Badge Header */}
 <span style={{
 fontSize: '0.78rem',
 fontWeight: '700',
 padding: '0.2rem 0.6rem',
 borderRadius: '6px',
 backgroundColor: selectedDivision.courtNo !== 'Unassigned' ? '#3b82f6' : '#9ca3af',
 color: '#ffffff',
 display: 'inline-flex',
 alignItems: 'center',
 gap: '0.3rem'
 }}>
 ??? {selectedDivision.courtNo !== 'Unassigned' ? ('Court ' + selectedDivision.courtNo) : 'Unassigned Court'}
 </span>

 <span className={('badge ' + (selectedDivision.status === 'Completed' ? 'badge-blue' : selectedDivision.status === 'In Progress' ? 'badge-red' : 'badge-gray'))}>
 {selectedDivision.status}
 </span>
 </div>
 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
 {selectedDivision.competitorsCount} Competitors ? {selectedDivision.completedMatches} of {selectedDivision.totalMatches} Matches Completed
 </div>
 </div>

 {/* View Mode Toggle Buttons & Print */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
 <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
 <button
 onClick={() => setViewMode('bracket')}
 style={{
 padding: '0.4rem 0.85rem',
 fontSize: '0.82rem',
 fontWeight: '600',
 borderRadius: '6px',
 border: 'none',
 backgroundColor: viewMode === 'bracket' ? 'var(--primary)' : 'transparent',
 color: viewMode === 'bracket' ? 'white' : 'var(--text-muted)',
 cursor: 'pointer',
 transition: 'all 0.15s ease',
 display: 'flex',
 alignItems: 'center',
 gap: '0.4rem'
 }}
 >
 ?? Updated Bracket
 </button>
 <button
 onClick={() => setViewMode('podium')}
 style={{
 padding: '0.4rem 0.85rem',
 fontSize: '0.82rem',
 fontWeight: '600',
 borderRadius: '6px',
 border: 'none',
 backgroundColor: viewMode === 'podium' ? 'var(--primary)' : 'transparent',
 color: viewMode === 'podium' ? 'white' : 'var(--text-muted)',
 cursor: 'pointer',
 transition: 'all 0.15s ease',
 display: 'flex',
 alignItems: 'center',
 gap: '0.4rem'
 }}
 >
 ?? Standings & Podium
 </button>
 </div>

 <button className="btn btn-secondary btn-sm no-print" onClick={() => window.print()}>
 ??? Print
 </button>
 </div>
 </div>

 {/* View Mode 1: BRACKET VIEW */}
 {viewMode === 'bracket' && (
 <div>
 {brackets[selectedDivision.id] && brackets[selectedDivision.id].length > 0 ? (
 <BracketView
 divisionId={selectedDivision.id}
 divisionName={selectedDivision.name}
 courtNo={selectedDivision.courtNo !== 'Unassigned' ? selectedDivision.courtNo : null}
 rounds={brackets[selectedDivision.id]}
 setBrackets={setBrackets}
 />
 ) : (
 <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
 <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
 No bracket diagram available yet for this division. Generate brackets in the <strong>Brackets</strong> tab!
 </p>
 </div>
 )}
 </div>
 )}

 {/* View Mode 2: STANDINGS & PODIUM */}
 {viewMode === 'podium' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
 
 {/* Podium Standings Section */}
 {selectedDivision.podium ? (
 <div>
 <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
 ?? Medal Podium
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
 {selectedDivision.podium.first.club} ? {selectedDivision.podium.first.rank || 'Competitor'}
 </div>
 </div>
 <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ca8a04', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
 ?? GOLD MEDAL
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
 <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
 {selectedDivision.podium.second.name}
 {renderFlag(selectedDivision.podium.second.country)}
 </div>
 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
 {selectedDivision.podium.second.club} ? {selectedDivision.podium.second.rank || 'Competitor'}
 </div>
 </div>
 <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
 ?? SILVER MEDAL
 </div>
 </div>
 )}

 {/* 3rd Place (Bronze A) */}
 {selectedDivision.podium.bronze1 && (
 <div style={{ 
 display: 'flex', 
 alignItems: 'center', 
 padding: '0.85rem 1.25rem', 
 borderRadius: '8px', 
 border: '1px solid #cd7f32', 
 background: 'linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
 position: 'relative'
 }}>
 <div style={{ 
 width: '36px', 
 height: '36px', 
 borderRadius: '50%', 
 backgroundColor: '#cd7f32', 
 display: 'flex', 
 alignItems: 'center', 
 justifyContent: 'center',
 color: 'white',
 fontWeight: 'bold',
 fontSize: '1rem',
 marginRight: '1rem',
 boxShadow: '0 2px 4px rgba(205, 127, 50, 0.3)'
 }}>
 3rd
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
 {selectedDivision.podium.bronze1.name}
 {renderFlag(selectedDivision.podium.bronze1.country)}
 </div>
 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
 {selectedDivision.podium.bronze1.club} ? {selectedDivision.podium.bronze1.rank || 'Competitor'}
 </div>
 </div>
 <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#a05c1e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
 ?? BRONZE MEDAL
 </div>
 </div>
 )}
                        {/* 3rd Place (Bronze B) */}
                        {selectedDivision.podium.bronze2 && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.85rem 1.25rem', 
                            borderRadius: '8px', 
                            border: '1px solid #cd7f32', 
                            background: 'linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                            position: 'relative'
                          }}>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%', 
                              backgroundColor: '#cd7f32', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              marginRight: '1rem',
                              boxShadow: '0 2px 4px rgba(205, 127, 50, 0.3)'
                            }}>
                              3rd
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                                {selectedDivision.podium.bronze2.name}
                                {renderFlag(selectedDivision.podium.bronze2.country)}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {selectedDivision.podium.bronze2.club} ? {selectedDivision.podium.bronze2.rank || 'Competitor'}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#a05c1e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              ?? BRONZE MEDAL
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        Standings will be compiled once matches begin! Start scoring in the <strong>Brackets</strong> tab or view the <strong>Updated Bracket</strong> diagram above.
                      </p>
                    </div>
                  )}

                  {/* Match History Table */}
                  {selectedDivision.matchHistory.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        ?? Completed Matches
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
 )}
 </div>
 </div>
 
 </div>
 );
}

export default ResultsView;
