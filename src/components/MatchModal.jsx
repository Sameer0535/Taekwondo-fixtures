import { useState, useEffect } from 'react';

function MatchModal({ match, onClose, onSave }) {
  const { p1, p2, score1: initScore1, score2: initScore2, winnerId: initWinnerId, winType: initWinType, roundScores: initRoundScores } = match;

  const [score1, setScore1] = useState(initScore1 !== null ? initScore1 : 0);
  const [score2, setScore2] = useState(initScore2 !== null ? initScore2 : 0);
  const [winnerId, setWinnerId] = useState(initWinnerId || '');
  const [winType, setWinType] = useState(initWinType || 'PTS');

  // Round scores state (WT Best of 3 Rounds)
  const [r1Blue, setR1Blue] = useState(() => {
    if (initRoundScores?.[0]) return initRoundScores[0].blue ?? '';
    return initScore1 !== null && initScore1 !== 0 && initScore1 !== 2 ? initScore1 : '';
  });
  const [r1Red, setR1Red] = useState(() => {
    if (initRoundScores?.[0]) return initRoundScores[0].red ?? '';
    return initScore2 !== null && initScore2 !== 0 && initScore2 !== 2 ? initScore2 : '';
  });
  
  const [r2Blue, setR2Blue] = useState(initRoundScores?.[1]?.blue ?? '');
  const [r2Red, setR2Red] = useState(initRoundScores?.[1]?.red ?? '');
  const [r3Blue, setR3Blue] = useState(initRoundScores?.[2]?.blue ?? '');
  const [r3Red, setR3Red] = useState(initRoundScores?.[2]?.red ?? '');

  // Auto-calculate rounds won and winner based on round points
  useEffect(() => {
    if (winType === 'PTS' || winType === 'PTG') {
      let blueRounds = 0;
      let redRounds = 0;

      const evaluateRound = (blueVal, redVal) => {
        const b = Number(blueVal);
        const r = Number(redVal);
        if (blueVal === '' || redVal === '' || isNaN(b) || isNaN(r)) return 0;
        if (b > r) return 1;
        if (r > b) return -1;
        return 0;
      };

      const r1 = evaluateRound(r1Blue, r1Red);
      const r2 = evaluateRound(r2Blue, r2Red);
      const r3 = evaluateRound(r3Blue, r3Red);

      if (r1 === 1) blueRounds++;
      if (r1 === -1) redRounds++;
      
      if (r2 === 1) blueRounds++;
      if (r2 === -1) redRounds++;
      
      if (r3 === 1) blueRounds++;
      if (r3 === -1) redRounds++;

      setScore1(blueRounds);
      setScore2(redRounds);

      // Best of 3: Winner is whoever wins 2 rounds
      if (blueRounds >= 2 && p1) {
        setWinnerId(p1.id);
      } else if (redRounds >= 2 && p2) {
        setWinnerId(p2.id);
      } else {
        setWinnerId('');
      }
    }
  }, [r1Blue, r1Red, r2Blue, r2Red, r3Blue, r3Red, winType, p1, p2]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!winnerId) {
      alert("Please select a winner before saving.");
      return;
    }

    const roundScores = [
      { blue: r1Blue === '' ? null : Number(r1Blue), red: r1Red === '' ? null : Number(r1Red) },
      { blue: r2Blue === '' ? null : Number(r2Blue), red: r2Red === '' ? null : Number(r2Red) },
      { blue: r3Blue === '' ? null : Number(r3Blue), red: r3Red === '' ? null : Number(r3Red) }
    ];

    onSave(winnerId, Number(score1), Number(score2), winType, roundScores);
  };

  const hasP1 = !!p1;
  const hasP2 = !!p2;

  if (!hasP1 && !hasP2) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Invalid Match</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>This match does not have any competitors yet.</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Record Match Result</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Competitors and Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Blue Corner */}
                <div style={{ 
                  backgroundColor: 'var(--blue-comp-bg)', 
                  border: `1px solid ${winnerId === p1?.id ? 'var(--blue-comp)' : 'var(--blue-comp-border)'}`,
                  padding: '1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--blue-comp)', fontWeight: 'bold', textTransform: 'uppercase' }}>Blue Corner</div>
                  <strong style={{ fontSize: '1.1rem' }}>{p1 ? p1.name : 'TBD'}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p1?.club || '-'}</div>
                  
                  {p1 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rounds Won:</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--blue-comp)' }}>{score1}</strong>
                    </div>
                  )}
                </div>

                {/* Red Corner */}
                <div style={{ 
                  backgroundColor: 'var(--red-comp-bg)', 
                  border: `1px solid ${winnerId === p2?.id ? 'var(--red-comp)' : 'var(--red-comp-border)'}`,
                  padding: '1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--red-comp)', fontWeight: 'bold', textTransform: 'uppercase' }}>Red Corner</div>
                  <strong style={{ fontSize: '1.1rem' }}>{p2 ? p2.name : 'TBD'}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p2?.club || '-'}</div>

                  {p2 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rounds Won:</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--red-comp)' }}>{score2}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Round scores input panel */}
              <div style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '1.25rem',
                backgroundColor: 'var(--bg-tertiary)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  🥋 Round Scores (Best of 3)
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', alignItems: 'center', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>Round</div>
                  <div style={{ color: 'var(--blue-comp)' }}>Blue Corner</div>
                  <div style={{ color: 'var(--red-comp)' }}>Red Corner</div>
                </div>

                {/* Round 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Round 1</div>
                  <div>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Points"
                      className="form-control"
                      style={{ borderColor: 'var(--blue-comp-border)' }}
                      value={r1Blue}
                      onChange={e => setR1Blue(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={winType === 'WDR' || winType === 'DSQ'}
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Points"
                      className="form-control"
                      style={{ borderColor: 'var(--red-comp-border)' }}
                      value={r1Red}
                      onChange={e => setR1Red(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={winType === 'WDR' || winType === 'DSQ'}
                    />
                  </div>
                </div>

                {/* Round 2 */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Round 2</div>
                  <div>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Points"
                      className="form-control"
                      style={{ borderColor: 'var(--blue-comp-border)' }}
                      value={r2Blue}
                      onChange={e => setR2Blue(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={winType === 'WDR' || winType === 'DSQ'}
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Points"
                      className="form-control"
                      style={{ borderColor: 'var(--red-comp-border)' }}
                      value={r2Red}
                      onChange={e => setR2Red(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={winType === 'WDR' || winType === 'DSQ'}
                    />
                  </div>
                </div>

                {/* Round 3 */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Round 3</div>
                  <div>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Points"
                      className="form-control"
                      style={{ borderColor: 'var(--blue-comp-border)' }}
                      value={r3Blue}
                      onChange={e => setR3Blue(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={winType === 'WDR' || winType === 'DSQ'}
                    />
                  </div>
                  <div>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Points"
                      className="form-control"
                      style={{ borderColor: 'var(--red-comp-border)' }}
                      value={r3Red}
                      onChange={e => setR3Red(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={winType === 'WDR' || winType === 'DSQ'}
                    />
                  </div>
                </div>
              </div>

              {/* Victory Type */}
              <div className="form-group">
                <label className="form-label">Victory Method</label>
                <select className="form-control" value={winType} onChange={e => setWinType(e.target.value)}>
                  <option value="PTS">Points (PTS) - Normal score-based win</option>
                  <option value="PTG">Points Gap (PTG) - Win by 12 points margin</option>
                  <option value="SUP">Superiority (SUP) - Referee decision / active play</option>
                  <option value="WDR">Withdrawal (WDR) - Injured or retired during match</option>
                  <option value="DSQ">Disqualification (DSQ) - Misconduct or max warnings</option>
                </select>
              </div>

              {/* Winner Selector */}
              <div className="form-group">
                <label className="form-label">Declared Winner</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {p1 && (
                    <button
                      type="button"
                      className={`btn ${winnerId === p1.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, backgroundColor: winnerId === p1.id ? 'var(--blue-comp)' : '' }}
                      onClick={() => setWinnerId(p1.id)}
                    >
                      Blue: {p1.name}
                    </button>
                  )}
                  {p2 && (
                    <button
                      type="button"
                      className={`btn ${winnerId === p2.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, backgroundColor: winnerId === p2.id ? 'var(--red-comp)' : '' }}
                      onClick={() => setWinnerId(p2.id)}
                    >
                      Red: {p2.name}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Result</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MatchModal;
