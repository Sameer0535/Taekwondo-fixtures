import { useState } from 'react';
import MatchModal from './MatchModal';
import { updateMatchScore } from '../utils/bracketBuilder';

function CourtSchedule({ divisions, brackets, setBrackets, courtCount }) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Compile all matches that need to be played (excluding walkovers)
  const allMatches = [];
  
  Object.keys(brackets).forEach(divisionId => {
    const divisionName = divisions[divisionId]?.name || 'Unknown Division';
    const rounds = brackets[divisionId];
    
    rounds.forEach((round, rIndex) => {
      round.forEach(match => {
        if (match.status !== 'walkover') {
          const court = match.court || 1;
          allMatches.push({
            ...match,
            divisionId,
            divisionName,
            court,
            roundIndex: rIndex,
            priority: rIndex * 100 + match.matchIndex
          });
        }
      });
    });
  });

  // Sort matches by priority (Round index first, then match index)
  allMatches.sort((a, b) => a.priority - b.priority);

  // Group matches by court
  const courts = Array.from({ length: courtCount }, (_, i) => i + 1);
  const matchesByCourt = {};
  
  courts.forEach(courtNum => {
    matchesByCourt[courtNum] = allMatches.filter(m => m.court === courtNum);
  });

  const handleCourtChange = (divisionId, matchId, newCourt) => {
    setBrackets(prev => {
      const rounds = prev[divisionId];
      const updatedRounds = rounds.map(round => 
        round.map(match => {
          if (match.id === matchId) {
            return { ...match, court: Number(newCourt) };
          }
          return match;
        })
      );
      return {
        ...prev,
        [divisionId]: updatedRounds
      };
    });
  };

  const handleSaveScore = (winnerId, score1, score2, winType) => {
    if (!selectedMatch) return;
    
    setBrackets(prev => {
      const currentRounds = prev[selectedMatch.divisionId];
      const updated = updateMatchScore(currentRounds, selectedMatch.id, winnerId, score1, score2, winType);
      return {
        ...prev,
        [selectedMatch.divisionId]: updated
      };
    });
    
    setSelectedMatch(null);
  };

  const getMatchReadyStatus = (match) => {
    if (match.status === 'completed') return { text: 'Completed', class: 'badge-gray' };
    if (match.p1 && match.p2) return { text: 'Ready', class: 'badge-blue' };
    return { text: 'Waiting', class: 'badge-gray' };
  };

  const getRoundName = (rIndex, totalRounds) => {
    if (!totalRounds) return `Round ${rIndex + 1}`;
    const remaining = totalRounds - 1 - rIndex;
    if (remaining === 0) return "Finals";
    if (remaining === 1) return "Semifinals";
    if (remaining === 2) return "Quarterfinals";
    return `Round of ${Math.pow(2, remaining + 1)}`;
  };

  return (
    <div className="card">
      <div className="card-title no-print" style={{ display: 'flex', alignItems: 'center' }}>
        <span>Court Queue Schedule</span>
        <button 
          className="btn btn-secondary btn-sm" 
          style={{ marginLeft: 'auto' }}
          onClick={() => window.print()}
        >
          Print Ring Lists
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }} className="no-print">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Linear fight list view modeled after <strong>kihapp.com</strong>. Matches are dynamically numbered by 
          Court + fight sequence (e.g. Fight 101, 102, 201) and ordered by tournament round priority.
        </p>
      </div>

      {allMatches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No brackets generated yet. Please generate brackets in the Divisions tab.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {courts.map(courtNum => {
            const courtMatches = matchesByCourt[courtNum] || [];
            
            return (
              <div key={courtNum} className="court-section">
                <h3 style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: '2px solid var(--border-color)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1.25rem'
                }}>
                  <span>Ring / Court {courtNum}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                    {courtMatches.filter(m => m.status !== 'completed').length} active fights remaining
                  </span>
                </h3>

                <div className="fight-card-list">
                  {courtMatches.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                      No fights assigned to Court {courtNum}
                    </div>
                  ) : (
                    courtMatches.map((match, index) => {
                      const readyStatus = getMatchReadyStatus(match);
                      const fightNo = `${courtNum}${String(index + 1).padStart(2, '0')}`;
                      const isActive = match.status === 'pending' && match.p1 && match.p2;
                      const divRounds = brackets[match.divisionId]?.length;

                      return (
                        <div 
                          key={match.id} 
                          className={`fight-card ${isActive ? 'active' : ''}`}
                          style={{ opacity: match.status === 'completed' ? 0.65 : 1 }}
                        >
                          {/* Fight number block */}
                          <div className="fight-number">
                            <span>Fight</span>
                            #{fightNo}
                          </div>

                          {/* Fight details */}
                          <div className="fight-details">
                            {/* Division info */}
                            <div className="fight-division-info">
                              <span className="fight-division-title">{match.divisionName}</span>
                              <span className="fight-round-title">
                                {getRoundName(match.roundIndex, divRounds)}
                              </span>
                            </div>

                            {/* Competitors block */}
                            <div className="fight-competitors">
                              {/* Blue Side */}
                              <div className="fight-competitor-block blue-side">
                                <div>
                                  <div className={`fight-competitor-name ${match.status === 'completed' && match.winnerId === match.p1?.id ? 'winner-bold' : match.status === 'completed' ? 'strikethrough-loser' : ''}`}>
                                    {match.p1 ? match.p1.name : 'TBD'}
                                  </div>
                                  <div className="fight-competitor-club">{match.p1?.club || '-'}</div>
                                </div>
                                {match.status === 'completed' && match.score1 !== null && (
                                  <span className="match-score blue-score">{match.score1}</span>
                                )}
                              </div>

                              <span className="vs-divider">VS</span>

                              {/* Red Side */}
                              <div className="fight-competitor-block red-side">
                                {match.status === 'completed' && match.score2 !== null && (
                                  <span className="match-score red-score" style={{ marginRight: '0.5rem' }}>{match.score2}</span>
                                )}
                                <div style={{ textAlign: 'right', flex: 1 }}>
                                  <div className={`fight-competitor-name ${match.status === 'completed' && match.winnerId === match.p2?.id ? 'winner-bold' : match.status === 'completed' ? 'strikethrough-loser' : ''}`}>
                                    {match.p2 ? match.p2.name : 'TBD'}
                                  </div>
                                  <div className="fight-competitor-club">{match.p2?.club || '-'}</div>
                                </div>
                              </div>
                            </div>

                            {/* Actions & Status */}
                            <div className="fight-status-actions">
                              {match.status === 'completed' ? (
                                <span className="badge badge-gray" style={{ fontWeight: 'bold' }}>
                                  {match.winType} Win
                                </span>
                              ) : (
                                <span className={`badge ${readyStatus.class}`}>{readyStatus.text}</span>
                              )}

                              <select 
                                value={match.court}
                                onChange={(e) => handleCourtChange(match.divisionId, match.id, e.target.value)}
                                className="form-control no-print"
                                style={{ width: '90px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', margin: 0 }}
                              >
                                {courts.map(c => (
                                  <option key={c} value={c}>Court {c}</option>
                                ))}
                              </select>

                              <button
                                className={`btn btn-sm no-print ${match.status === 'completed' ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => setSelectedMatch(match)}
                                disabled={!match.p1 || !match.p2}
                                style={{ padding: '0.4rem 0.75rem' }}
                              >
                                {match.status === 'completed' ? 'Edit' : 'Score'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMatch && (
        <MatchModal 
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSave={handleSaveScore}
        />
      )}
    </div>
  );
}

export default CourtSchedule;
