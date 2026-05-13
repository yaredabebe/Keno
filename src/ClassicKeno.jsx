import { useState, useCallback } from 'react';
import './ClassicKeno.css';

const MAX_PICKS = 5;
const NUMS = 20;
const DRAW_COUNT = 10;
const MULTIPLIERS = { 0: 0, 1: 0, 2: 0, 3: 10, 4: 25, 5: 100 };

function ClassicKeno() {
  const [picks, setPicks] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [result, setResult] = useState(null);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [stats, setStats] = useState({ played: 0, wins: 0, bigWin: 0 });
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(0);

  const togglePick = useCallback((n) => {
    if (hasResult || isDrawing) return;
    setPicks(prev =>
      prev.includes(n)
        ? prev.filter(x => x !== n)
        : prev.length < MAX_PICKS
        ? [...prev, n].sort((a, b) => a - b)
        : prev
    );
  }, [hasResult, isDrawing]);

  const quickPick = () => {
    if (hasResult || isDrawing) return;
    const pool = [];
    while (pool.length < MAX_PICKS) {
      const r = Math.floor(Math.random() * NUMS) + 1;
      if (!pool.includes(r)) pool.push(r);
    }
    setPicks(pool.sort((a, b) => a - b));
  };

  const clearBoard = () => {
    if (isDrawing) return;
    setPicks([]);
    setDrawn([]);
    setHasResult(false);
    setResult(null);
    setProgress(0);
  };

  const newGame = () => {
    if (isDrawing) return;
    clearBoard();
    setBalance(1000);
    setStats({ played: 0, wins: 0, bigWin: 0 });
    setHistory([]);
  };

  const adjustBet = (amount) => {
    if (isDrawing) return;
    setBet(prev => Math.max(5, Math.min(100, prev + amount)));
  };

  const drawNumbers = useCallback(async () => {
    if (picks.length !== MAX_PICKS || isDrawing || hasResult) return;
    if (balance < bet) { alert('Insufficient balance!'); return; }

    setIsDrawing(true);
    setDrawn([]);
    setHasResult(false);
    setResult(null);
    setProgress(0);
    setBalance(prev => prev - bet);

    const drawnNums = [];
    for (let i = 0; i < DRAW_COUNT; i++) {
      await new Promise(r => setTimeout(r, 160));
      let rand;
      do { rand = Math.floor(Math.random() * NUMS) + 1; } while (drawnNums.includes(rand));
      drawnNums.push(rand);
      setDrawn([...drawnNums]);
      setProgress(Math.round(((i + 1) / DRAW_COUNT) * 100));
    }

    const matches = picks.filter(p => drawnNums.includes(p)).length;
    const win = MULTIPLIERS[matches] * bet;
    if (win > 0) setBalance(prev => prev + win);

    setStats(prev => ({
      played: prev.played + 1,
      wins: prev.wins + (win > 0 ? 1 : 0),
      bigWin: Math.max(prev.bigWin, win),
    }));

    setHistory(prev => [{
      id: Date.now(),
      matches,
      win,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, ...prev].slice(0, 8));

    setResult({ matches, win });
    setHasResult(true);
    setIsDrawing(false);
    setProgress(0);
  }, [picks, balance, bet, isDrawing, hasResult]);

  const getCellClass = (n) => {
    const isPicked = picks.includes(n);
    const isDrawn = drawn.includes(n);
    if (isPicked && isDrawn) return 'num-cell hit';
    if (isPicked) return 'num-cell picked';
    if (isDrawn) return 'num-cell drawn-cell';
    return 'num-cell';
  };

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) + '%' : '—';

  return (
    <div className="keno-wrap">
      {/* Header */}
      <div className="header">
        <div className="header-eyebrow">◆ CLASSIC KENO ◆</div>
        <h1>KENO</h1>
        <div className="header-sub">Pick 5 · Match to Win</div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className="stat-val">${balance.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Biggest Win</div>
          <div className="stat-val">${stats.bigWin.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Win Rate</div>
          <div className="stat-val">{winRate}</div>
        </div>
      </div>

      {/* Bet Controls */}
      <div className="controls-row">
        <div className="bet-panel">
          <div className="bet-label">Bet</div>
          <div className="bet-stepper">
            <button className="step-btn" onClick={() => adjustBet(-5)} disabled={isDrawing}>−</button>
            <div className="bet-val">${bet}</div>
            <button className="step-btn" onClick={() => adjustBet(5)} disabled={isDrawing}>+</button>
          </div>
          <div className="bet-presets">
            {[5, 10, 25, 50].map(a => (
              <button key={a} className="preset-btn" onClick={() => !isDrawing && setBet(a)} disabled={isDrawing}>${a}</button>
            ))}
          </div>
        </div>
        <button className="qpick-btn" onClick={quickPick} disabled={isDrawing}>⚡ Quick Pick</button>
      </div>

      {/* Board */}
      <div className="board-wrap">
        <div className="board-top">
          <div className="board-title">Choose Your Numbers</div>
          <div className="pick-counter">
            {Array.from({ length: MAX_PICKS }).map((_, i) => (
              <span key={i} className={`pick-pip${i < picks.length ? ' filled' : ''}`} />
            ))}
            &nbsp;{picks.length} / {MAX_PICKS}
          </div>
        </div>
        <div className="board-grid">
          {Array.from({ length: NUMS }).map((_, i) => {
            const n = i + 1;
            return (
              <button
                key={n}
                className={getCellClass(n)}
                onClick={() => togglePick(n)}
                disabled={hasResult || isDrawing}
              >
                {n}
                {picks.includes(n) && drawn.includes(n) && <span className="hit-star">★</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      {isDrawing && (
        <div className="draw-progress">
          <div className="draw-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-row">
        <button
          className={`draw-btn${isDrawing ? ' drawing' : ''}`}
          onClick={drawNumbers}
          disabled={picks.length !== MAX_PICKS || isDrawing || hasResult}
        >
          {isDrawing ? 'Drawing...' : 'Draw Numbers'}
        </button>
        <button className="secondary-btn" onClick={clearBoard} disabled={isDrawing}>Clear</button>
        <button className="secondary-btn" onClick={newGame} disabled={isDrawing}>New Game</button>
      </div>

      {/* Result Banner */}
      {result && (
        <div className={`result-banner${result.win > 0 ? ' win' : ' lose'}`}>
          <div className="result-left">
            <div className="result-label-sm">Matches</div>
            <div className="result-matches-txt">{result.matches} of {MAX_PICKS}</div>
          </div>
          <div className="result-right">
            <div className={`result-win-amt${result.win > 0 ? ' positive' : ' zero'}`}>
              {result.win > 0 ? '+' : ''}${result.win.toLocaleString()}
            </div>
            <div className="congrats" style={result.win === 0 ? { color: 'var(--muted)' } : {}}>
              {result.win > 0 ? '✦ Winner ✦' : 'Better luck next time'}
            </div>
          </div>
        </div>
      )}

      {/* Drawn Chips */}
      {drawn.length > 0 && (
        <div className="drawn-section">
          <div className="drawn-header">Drawn Numbers</div>
          <div className="drawn-chips">
            {drawn.map((n, idx) => (
              <div key={idx} className={`drawn-chip${picks.includes(n) ? ' matched' : ' plain'}`}>{n}</div>
            ))}
          </div>
        </div>
      )}

      <div className="divider" />

      {/* Payout Table */}
      <div className="payout-panel">
        <div className="payout-title">Payout Table</div>
        {[3, 4, 5].map(m => (
          <div key={m} className={`payout-row${result && result.matches === m && result.win > 0 ? ' active-row' : ''}`}>
            <span className="payout-match">{m} matches</span>
            <span className="payout-mult">{MULTIPLIERS[m]}× bet{m === 5 ? ' 🎯' : ''}</span>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="history-section">
          <div className="hist-title">Recent Games</div>
          {history.map(g => (
            <div key={g.id} className="hist-row">
              <div className={`hist-dot${g.win > 0 ? ' win' : ' lose'}`} />
              <div className="hist-time">{g.time}</div>
              <div className="hist-match">{g.matches} match{g.matches !== 1 ? 'es' : ''}</div>
              <div className={`hist-amt${g.win > 0 ? ' positive' : ' zero'}`}>
                {g.win > 0 ? '+' : ''}${g.win}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClassicKeno;
