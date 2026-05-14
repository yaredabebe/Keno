
import { useState, useCallback, useRef } from 'react';
import './PowerKeno.css';

const NUMS = 20;
const MAX_PICKS = 5;
const DRAWS = 10;
const BASE_MULT = { 0:0, 1:0, 2:0, 3:10, 4:25, 5:100 };
const POWER_OPTIONS = [2, 3, 5, 10];

function PowerKeno() {
  const [picks, setPicks]           = useState([]);
  const [drawn, setDrawn]           = useState([]);
  const [drawing, setDrawing]       = useState(false);
  const [hasResult, setHasResult]   = useState(false);
  const [result, setResult]         = useState(null);
  const [powerNum, setPowerNum]     = useState(null);
  const [powerHit, setPowerHit]     = useState(false);
  const [balance, setBalance]       = useState(1000);
  const [bet, setBet]               = useState(10);
  const [powerMult, setPowerMult]   = useState(2);
  const [progress, setProgress]     = useState(0);
  const [stats, setStats]           = useState({ played:0, wins:0, bigWin:0, powerHits:0 });
  const [history, setHistory]       = useState([]);

  const togglePick = useCallback((n) => {
    if (hasResult || drawing) return;
    setPicks(prev =>
      prev.includes(n)
        ? prev.filter(x => x !== n)
        : prev.length < MAX_PICKS
        ? [...prev, n].sort((a, b) => a - b)
        : prev
    );
  }, [hasResult, drawing]);

  const quickPick = () => {
    if (hasResult || drawing) return;
    const pool = [];
    while (pool.length < MAX_PICKS) {
      const r = Math.floor(Math.random() * NUMS) + 1;
      if (!pool.includes(r)) pool.push(r);
    }
    setPicks(pool.sort((a, b) => a - b));
  };

  const clearBoard = () => {
    if (drawing) return;
    setPicks([]);
    setDrawn([]);
    setHasResult(false);
    setResult(null);
    setPowerNum(null);
    setPowerHit(false);
    setProgress(0);
  };

  const newGame = () => {
    if (drawing) return;
    clearBoard();
    setBalance(1000);
    setStats({ played:0, wins:0, bigWin:0, powerHits:0 });
    setHistory([]);
  };

  const adjustBet = (amt) => {
    if (drawing) return;
    setBet(prev => Math.max(5, Math.min(100, prev + amt)));
  };

  const getCellClass = (n) => {
    const ip = picks.includes(n);
    const id = drawn.includes(n);
    const iw = powerNum === n;
    if (ip && id && iw) return 'pk-cell power-hit';
    if (ip && id)       return 'pk-cell hit';
    if (ip)             return 'pk-cell sel';
    if (id)             return 'pk-cell drwn';
    if (iw && !id)      return 'pk-cell power';
    return 'pk-cell';
  };

  const draw = useCallback(async () => {
    if (picks.length !== MAX_PICKS || drawing || hasResult) return;
    if (balance < bet) { alert('Insufficient balance!'); return; }

    setDrawing(true);
    setDrawn([]);
    setHasResult(false);
    setResult(null);
    setPowerNum(null);
    setPowerHit(false);
    setProgress(0);
    setBalance(prev => prev - bet);

    const dn = [];
    for (let i = 0; i < DRAWS; i++) {
      await new Promise(r => setTimeout(r, 145));
      let rand;
      do { rand = Math.floor(Math.random() * NUMS) + 1; } while (dn.includes(rand));
      dn.push(rand);
      setDrawn([...dn]);
      setProgress(Math.round(((i + 1) / DRAWS) * 100));
    }

    const pn = Math.floor(Math.random() * NUMS) + 1;
    setPowerNum(pn);
    const isPowerHit = picks.includes(pn);
    setPowerHit(isPowerHit);

    const matches = picks.filter(p => dn.includes(p)).length;
    const baseWin = BASE_MULT[matches] * bet;
    const finalWin = isPowerHit && baseWin > 0 ? baseWin * powerMult : baseWin;

    if (finalWin > 0) setBalance(prev => prev + finalWin);

    if (isPowerHit) {
      setStats(prev => ({ ...prev, powerHits: prev.powerHits + 1 }));
    }

    setStats(prev => ({
      ...prev,
      played: prev.played + 1,
      wins: prev.wins + (finalWin > 0 ? 1 : 0),
      bigWin: Math.max(prev.bigWin, finalWin),
    }));

    setHistory(prev => [{
      id: Date.now(),
      matches,
      win: finalWin,
      power: isPowerHit,
      mult: powerMult,
      pn,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, ...prev].slice(0, 8));

    setResult({ matches, finalWin, baseWin, isPowerHit, pn });
    setHasResult(true);
    setDrawing(false);
    setProgress(0);
  }, [picks, balance, bet, powerMult, drawing, hasResult]);

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) + '%' : '—';

  return (
    <div className="pk-wrap">

      {/* Header */}
      <div className="pk-header">
        <div className="pk-eyebrow">⚡ POWER KENO ⚡</div>
        <h1 className="pk-title">POWER<span className="pk-accent">KENO</span></h1>
        <div className="pk-subtitle">Pick your numbers · Activate the power number · Multiply your win</div>
      </div>

      {/* Stats */}
      <div className="pk-stats">
        <div className="pk-stat">
          <div className="pk-stat-lbl">Balance</div>
          <div className="pk-stat-val">${balance.toLocaleString()}</div>
        </div>
        <div className="pk-stat">
          <div className="pk-stat-lbl">Biggest Win</div>
          <div className="pk-stat-val">${stats.bigWin.toLocaleString()}</div>
        </div>
        <div className="pk-stat">
          <div className="pk-stat-lbl">Power Hits</div>
          <div className="pk-stat-val">{stats.powerHits}</div>
        </div>
        <div className="pk-stat">
          <div className="pk-stat-lbl">Win Rate</div>
          <div className="pk-stat-val">{winRate}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="pk-ctrl-row">
        <div className="pk-bet-panel">
          <div className="pk-bet-lbl">Bet</div>
          <button className="pk-step" onClick={() => adjustBet(-5)} disabled={drawing}>−</button>
          <div className="pk-bet-val">${bet}</div>
          <button className="pk-step" onClick={() => adjustBet(5)} disabled={drawing}>+</button>
          <div className="pk-presets">
            {[5, 10, 25, 50].map(a => (
              <button key={a} className="pk-pre" onClick={() => !drawing && setBet(a)} disabled={drawing}>${a}</button>
            ))}
          </div>
        </div>
        <div className="pk-power-panel">
          <div className="pk-power-lbl">Power Mult</div>
          <div className="pk-power-opts">
            {POWER_OPTIONS.map(m => (
              <button
                key={m}
                className={`pk-popt${powerMult === m ? ' on' : ''}`}
                onClick={() => { if (!drawing && !hasResult) setPowerMult(m); }}
                disabled={drawing || hasResult}
              >×{m}</button>
            ))}
          </div>
        </div>
        <button className="pk-qpick-btn" onClick={quickPick} disabled={drawing}>⚡ Quick Pick</button>
      </div>

      {/* Power Number Display */}
      <div className="pk-power-display">
        <div className="pk-pnd-lbl">Power Number</div>
        <div className={`pk-pnd-ball${powerNum ? (powerHit ? ' hit' : ' active') : ''}`}>
          {powerNum ?? '?'}
        </div>
        <div className="pk-pnd-info">
          The power number <span>multiplies your win</span> if it matches one of your picks
        </div>
        <div className={`pk-pnd-mult${powerHit ? ' hit-mult' : ''}`}>×{powerMult}</div>
      </div>

      {/* Board */}
      <div className="pk-board">
        <div className="pk-board-top">
          <div className="pk-board-lbl">Select 5 numbers</div>
          <div className="pk-pips">
            {Array.from({ length: MAX_PICKS }).map((_, i) => (
              <span key={i} className={`pk-pip${i < picks.length ? ' on' : ''}`} />
            ))}
            <span className="pk-pip-ct">{picks.length} / {MAX_PICKS}</span>
          </div>
        </div>
        <div className="pk-grid">
          {Array.from({ length: NUMS }).map((_, i) => {
            const n = i + 1;
            const isPowerCell = powerNum === n && !drawn.includes(n);
            return (
              <button
                key={n}
                className={getCellClass(n)}
                onClick={() => togglePick(n)}
                disabled={hasResult || drawing}
              >
                {n}
                {isPowerCell && <div className="pk-pw-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="pk-action-row">
        <button
          className={`pk-draw-btn${drawing ? ' drawing' : ''}`}
          onClick={draw}
          disabled={picks.length !== MAX_PICKS || drawing || hasResult}
        >
          {drawing ? 'Drawing...' : 'Activate Power Draw'}
        </button>
        <button className="pk-sec" onClick={clearBoard} disabled={drawing}>Clear</button>
        <button className="pk-sec" onClick={newGame} disabled={drawing}>New Game</button>
      </div>

      {/* Progress */}
      {drawing && (
        <div className="pk-prog">
          <div className="pk-prog-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Power Banner */}
      {result && result.isPowerHit && (
        <div className="pk-power-banner">
          <div>
            <div className="pk-pbb-lbl">Power Number Activated!</div>
            <div className="pk-pbb-txt">⚡ Power {result.pn} matches your pick — ×{powerMult} multiplier applied!</div>
          </div>
          <div className="pk-pbb-badge">×{powerMult} POWER ACTIVE</div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`pk-result${result.isPowerHit && result.finalWin > 0 ? ' power-win' : result.finalWin > 0 ? ' win' : ' lose'}`}>
          <div>
            <div className="pk-res-lbl">Matches + Power</div>
            <div className="pk-res-main">
              {result.matches} match{result.matches !== 1 ? 'es' : ''}
              {result.isPowerHit ? ' + ⚡ Power' : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={`pk-res-amt${result.isPowerHit && result.finalWin > 0 ? ' pwr' : result.finalWin > 0 ? ' pos' : ' zero'}`}>
              {result.finalWin > 0 ? '+' : ''}${result.finalWin.toLocaleString()}
            </div>
            <div className={`pk-res-sub${result.isPowerHit && result.finalWin > 0 ? ' pwr' : result.finalWin > 0 ? ' pos' : ' zero'}`}>
              {result.isPowerHit && result.finalWin > 0
                ? `⚡ Power Win ×${powerMult}!`
                : result.finalWin > 0
                ? '✦ Winner ✦'
                : 'No match this round'}
            </div>
          </div>
        </div>
      )}

      {/* Drawn Chips */}
      {drawn.length > 0 && (
        <div className="pk-drawn-sec">
          <div className="pk-drawn-hdr">Drawn Numbers</div>
          <div className="pk-chips">
            {drawn.map((n, idx) => (
              <div key={idx} className={`pk-chip${picks.includes(n) ? ' matched' : ' plain'}`}>{n}</div>
            ))}
            {result && result.isPowerHit && (
              <div className="pk-chip power-chip">⚡{result.pn}</div>
            )}
          </div>
        </div>
      )}

      <div className="pk-divider" />

      {/* Payout Table */}
      <div className="pk-payout">
        <div className="pk-pay-hdr">Payout Table</div>
        {[3, 4, 5].map(m => (
          <div key={m} className={`pk-pay-row${result && result.matches === m && result.finalWin > 0 ? ' lit' : ''}`}>
            <span className="pk-pay-lbl">{m} matches</span>
            <span>
              <span className="pk-pay-mult">{BASE_MULT[m]}× bet</span>
              <span className="pk-pay-power">→ ×{powerMult} power = {BASE_MULT[m] * powerMult}×</span>
            </span>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="pk-hist">
          <div className="pk-hist-hdr">Round History</div>
          {history.map(g => (
            <div key={g.id} className="pk-hist-row">
              <div className={`pk-hdot${g.power && g.win > 0 ? ' pwr' : g.win > 0 ? ' win' : ' lose'}`} />
              <div className="pk-htime">{g.time}</div>
              <div className="pk-hmatch">
                {g.power && <span className="pk-hpwr">⚡ </span>}
                {g.matches} match{g.matches !== 1 ? 'es' : ''}
              </div>
              <div className={`pk-hamt${g.power && g.win > 0 ? ' pwr' : g.win > 0 ? ' pos' : ' zero'}`}>
                {g.win > 0 ? '+' : ''}${g.win}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PowerKeno;

