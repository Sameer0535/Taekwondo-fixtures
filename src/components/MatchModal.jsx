import { useState, useEffect } from 'react';

function MatchModal({ match, onClose, onSave }) {
  const { p1, p2, score1: initScore1, score2: initScore2, winnerId: initWinnerId, winType: initWinType } = match;

  const [score1, setScore1] = useState(initScore1 !== null ? initScore1 : 0);
  const [score2, setScore2] = useState(initScore2 !== null ? initScore2 : 0);
  const [winnerId, setWinnerId] = useState(initWinnerId || '');
  const [winType, setWinType] = useState(initWinType || 'PTS');

  // Auto-select winner if scores change (standard points win)
  useEffect(() => {
    if (winType === 'PTS' || winType === 'PTG') {
      if (score1 > score2 && p1) {
        setWinnerId(p1.id);
      } else if (score2 > score1 && p2) {
        setWinnerId(p2.id);
      } else {
        setWinnerId('');
      }
    }
  }, [score1, score2, winType, p1, p2]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!winnerId) {
      alert("Please select a winner before saving.");
      return;
    }
    onSave(winnerId, Number(score1), Number(score2), winType);
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
                    <div style={{ marginTop: '0.5rem' }}>
                      <label className="form-label" style={{ color: 'var(--blue-comp)' }}>Points</label>
                      <input 
                        type="number" 
                        min="0"
                        className="form-control"
                        style={{ borderColor: 'var(--blue-comp-border)' }}
                        value={score1}
                        onChange={e => setScore1(Number(e.target.value))}
                        disabled={winType === 'WDR' || winType === 'DSQ' && winnerId !== p1.id}
                      />
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
                    <div style={{ marginTop: '0.5rem' }}>
                      <label className="form-label" style={{ color: 'var(--red-comp)' }}>Points</label>
                      <input 
                        type="number" 
                        min="0"
                        className="form-control"
                        style={{ borderColor: 'var(--red-comp-border)' }}
                        value={score2}
                        onChange={e => setScore2(Number(e.target.value))}
                        disabled={winType === 'WDR' || winType === 'DSQ' && winnerId !== p2.id}
                      />
                    </div>
                  )}
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
