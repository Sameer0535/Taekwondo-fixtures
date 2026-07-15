import React, { useState, useMemo } from 'react';
import { buildRepechageBrackets } from '../utils/bracketBuilder';
import { nocToIso } from '../utils/countries';

function ResultsView({ divisions, brackets, useRepechage }) {
  const [selectedDivisionId, setSelectedDivisionId] = useState('');

  // 1. Gather all divisions with their brackets and calculate completion statistics
  const divisionStats = useMemo(() => {
    const list = Object.keys(divisions).map(id => {
      const division = divisions[id];
      const rounds = brackets[id];
      
      let status = 'Not Started';
      let totalMatches = 0;
      let completedMatches = 0;
      let podium = null;
      let matchHistory = [];

      if (rounds && rounds.length > 0) {
        // Retrieve repechage from brackets state or build if not present
        let rep = null;
        if (useRepechage) {
          rep = brackets[id + "_repechage"] || buildRepechageBrackets(rounds);
        }

        // Count main bracket matches
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

        // Count repechage matches
        if (useRepechage && rep) {
          [...rep.bracketA, ...rep.bracketB].forEach(match => {
            if (match.status !== 'walkover') {
              totalMatches++;
              if (match.status === 'completed') {
                completedMatches++;
                matchHistory.push(match);
              }
            }
          });
        }

        // Determine status
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

        // Compute podium
        if (completedMatches > 0) {
          const first = (finalMatch?.status === 'completed' && finalMatch.winnerId) ? 
            (finalMatch.winnerId === finalMatch.p1?.id ? finalMatch.p1 : finalMatch.p2) : null;
          const second = (finalMatch?.status === 'completed' && finalMatch.winnerId) ? 
            (finalMatch.winnerId === finalMatch.p1?.id ? finalMatch.p2 : finalMatch.p1) : null;
          
          let bronze1 = null;
          let bronze2 = null;

          if (useRepechage && rep) {
            const repAFinal = rep.bracketA?.[rep.bracketA.length - 1];
            const repBFinal = rep.bracketB?.[rep.bracketB.length - 1];
            
            if (repAFinal?.winnerId) {
              bronze1 = repAFinal.winnerId === repAFinal.p1?.id ? repAFinal.p1 : repAFinal.p2;
            }
            if (repBFinal?.winnerId) {
              bronze2 = repBFinal.winnerId === repBFinal.p1?.id ? repBFinal.p1 : repBFinal.p2;
            }
          } else {
            const semiRound = rounds[rounds.length - 2];
            if (semiRound) {
              const m1 = semiRound[0];
              const m2 = semiRound[1];
              if (m1?.status === 'completed' && m1.winnerId) {
                bronze1 = m1.winnerId === m1.p1?.id ? m1.p2 : m1.p1;
              }
              if (m2?.status === 'completed' && m2.winnerId) {
                bronze2 = m2.winnerId === m2.p1?.id ? m2.p2 : m2.p1;
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
        totalMatches,
        completedMatches,
        podium,
        matchHistory: matchHistory.sort((a, b) => (a.matchNo || 0) - (b.matchNo || 0))
      };
    });

    return list;
  }, [divisions, brackets, useRepechage]);

  // Overall statistics for dashboard cards
  const statsSummary = useMemo(() => {
    const totalDivisions = divisionStats.length;
    const completedDivisions = divisionStats.filter(d => d.status === 'Completed').length;
    const inProgressDivisions = divisionStats.filter(d => d.status === 'In Progress').length;
    
    let totalM = 0;
    let completedM = 0;
    divisionStats.forEach(d => {
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
  }, [divisionStats]);

  const selectedDivision = divisionStats.find(d => d.id === selectedDivisionId);

  // Helper to format ISO code flag image
  const renderFlag = (countryCode) => {
    if (!countryCode || countryCode === 'none') return null;
    const iso = nocToIso(countryCode);
    if (!iso) return null;
    return (
      <img 
        src={`https://flagcdn.com/w40/${iso}.png`} 
        alt={countryCode} 
        style={{ width: '18px', height: '12px', borderRadius: '1px', objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Header Overview Dashboard Stats */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: 'var(--primary)' }}></div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Total Divisions</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>{statsSummary.totalDivisions}</div>
        </div>
        
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: 'var(--green-comp)' }}></div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Completed</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--green-comp)' }}>{statsSummary.completedDivisions}</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: 'var(--blue-comp)' }}></div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--blue-comp)' }}>{statsSummary.inProgressDivisions}</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', backgroundColor: 'var(--primary-glow)' }}></div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Match Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {statsSummary.completedMatches} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {statsSummary.totalMatches}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{statsSummary.matchPercent}% Complete</div>
        </div>
      </div>

      {/* 2. Grid list of Division Podium Cards */}
      <div className="dashboard-grid">
        {/* Left Side: Division List Selection */}
        <div className="card no-print" style={{ alignSelf: 'start' }}>
          <div className="card-title">
            <span>Select Division</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {divisionStats.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDivisionId(d.id === selectedDivisionId ? '' : d.id)}
                className={`btn ${d.id === selectedDivisionId ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  textAlign: 'left', 
                  justifyContent: 'space-between',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  padding: '0.65rem 0.85rem'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  {d.name}
                </span>
                
                {d.status === 'Completed' && (
                  <span className="badge badge-blue" style={{ backgroundColor: 'var(--green-comp-light)', color: 'var(--green-comp)', border: '1px solid var(--green-comp)' }}>✓ Complete</span>
                )}
                {d.status === 'In Progress' && (
                  <span className="badge badge-blue" style={{ animation: 'pulse 2s infinite' }}>⚙️ {d.completedMatches}/{d.totalMatches}</span>
                )}
                {d.status === 'Not Started' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not Started</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Results Display */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selectedDivision ? `${selectedDivision.name} Results` : 'Select a division on the left to see results'}</span>
            {selectedDivision && selectedDivision.status === 'Completed' && (
              <button className="btn btn-secondary btn-sm no-print" onClick={() => window.print()}>
                Print Standings
              </button>
            )}
          </div>

          {!selectedDivision ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', margin: '0 auto 1rem', stroke: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Click on any division in the left list to inspect detailed scores, brackets progress, and the medal podium!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Status Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.85rem 1rem', 
                borderRadius: '8px', 
                backgroundColor: selectedDivision.status === 'Completed' ? 'var(--green-comp-light)' : (selectedDivision.status === 'In Progress' ? 'var(--blue-comp-light)' : 'var(--bg-tertiary)'),
                border: `1px solid ${selectedDivision.status === 'Completed' ? 'var(--green-comp)' : (selectedDivision.status === 'In Progress' ? 'var(--blue-comp)' : 'var(--border-color)')}`
              }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tournament Status:</span>
                  <strong style={{ 
                    marginLeft: '0.5rem', 
                    color: selectedDivision.status === 'Completed' ? 'var(--green-comp)' : (selectedDivision.status === 'In Progress' ? 'var(--blue-comp)' : 'var(--text-main)') 
                  }}>
                    {selectedDivision.status}
                  </strong>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Matches Played: {selectedDivision.completedMatches} / {selectedDivision.totalMatches}
                </div>
              </div>

              {/* Medal Podium Standings */}
              {selectedDivision.podium ? (
                <div>
                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    🏅 Medal Podium
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    
                    {/* 1st Place (Gold) */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '0.85rem 1.25rem', 
                      borderRadius: '8px', 
                      border: '1px solid #ffd700', 
                      background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 255, 255, 0) 100%)',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: '#ffd700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        marginRight: '1rem',
                        boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3)'
                      }}>
                        1st
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                          {selectedDivision.podium.first ? selectedDivision.podium.first.name : 'TBD'}
                          {selectedDivision.podium.first && renderFlag(selectedDivision.podium.first.country)}
                        </div>
                        {selectedDivision.podium.first && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {selectedDivision.podium.first.club} • {selectedDivision.podium.first.rank || 'Competitor'}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#c5a000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🏆 GOLD MEDAL
                      </div>
                    </div>

                    {/* 2nd Place (Silver) */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '0.85rem 1.25rem', 
                      borderRadius: '8px', 
                      border: '1px solid #c0c0c0', 
                      background: 'linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: '#c0c0c0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        marginRight: '1rem',
                        boxShadow: '0 2px 4px rgba(192, 192, 192, 0.3)'
                      }}>
                        2nd
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                          {selectedDivision.podium.second ? selectedDivision.podium.second.name : 'TBD'}
                          {selectedDivision.podium.second && renderFlag(selectedDivision.podium.second.country)}
                        </div>
                        {selectedDivision.podium.second && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {selectedDivision.podium.second.club} • {selectedDivision.podium.second.rank || 'Competitor'}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        🥈 SILVER MEDAL
                      </div>
                    </div>

                    {/* 3rd Place (Bronze A) */}
                    {selectedDivision.podium.bronze1 && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '0.85rem 1.25rem', 
                        borderRadius: '8px', 
                        border: '1px solid #cd7f32', 
                        background: 'linear-gradient(90deg, rgba(205, 127, 50, 0.08) 0%, rgba(255, 255, 255, 0) 100%)',
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {selectedDivision.podium.bronze1.club} • {selectedDivision.podium.bronze1.rank || 'Competitor'}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#a05c1e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          🥉 BRONZE MEDAL
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
                        background: 'linear-gradient(90deg, rgba(205, 127, 50, 0.08) 0%, rgba(255, 255, 255, 0) 100%)',
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {selectedDivision.podium.bronze2.club} • {selectedDivision.podium.bronze2.rank || 'Competitor'}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#a05c1e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          🥉 BRONZE MEDAL
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    Standings will be compiled once matches begin! Start scoring in the <strong>Brackets</strong> tab.
                  </p>
                </div>
              )}

              {/* Match History Table */}
              {selectedDivision.matchHistory.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    📊 Completed Matches
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
      
    </div>
  );
}

export default ResultsView;
