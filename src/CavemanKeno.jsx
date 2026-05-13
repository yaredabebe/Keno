import { useState, useCallback, useRef } from 'react';
import './CavemanKeno.css';

const ANIMALS = ['🦣','🐅','🐻','🦌','🐺','🦏','🦃','🐘','🦥','🐊','🦅','🦖','🧙','🔥','💎','🌋','🍄','🪨','🌿','✨'];
const MAX_PICKS = 5;
const NUMS = 20;
const DRAWS = 10;
const MULT = { 0:0, 1:0, 2:0, 3:8, 4:20, 5:80 };

function CavemanKeno() {
  const [picks, setPicks]       = useState([]);
  const [drawn, setDrawn]       = useState([]);
  const [drawing, setDrawing]   = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [result, setResult]     = useState(null);
  const [wildNum, setWildNum]   = useState(null);
  const [wildBonus, setWildBonus] = useState(false);
  const [balance, setBalance]   = useState(1000);
  const [bet, setBet]           = useState(10);
  const [combo, setCombo]       = useState(0);
  const [progress, setProgress] = useState(0);
  const [stats, setStats]       = useState({ played:0, wins:0, bigWin:0, bonuses:0 });
  const [history, setHistory]   = useState([]);
  const comboTimer = useRef(null);

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

  const spiritPick = () => {
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
    setWildNum(null);
    setWildBonus(false);
    setProgress(0);
  };

  const newTribe = () => {
    if (drawing) return;
    clearBoard();
    setBalance(1000);
    setCombo(0);
    setStats({ played:0, wins:0, bigWin:0, bonuses:0 });
    setHistory([]);
  };

  const adjustBet = (amt) => {
    if (drawing) return;
    setBet(prev => Math.max(5, Math.min(100, prev + amt)));
  };

  const getCellClass = (n) => {
    const ip = picks.includes(n);
    const id = drawn.includes(n);
    const iw = wildNum === n;
    if (ip && id) return 'cell hit';
    if (ip)       return 'cell picked';
    if (id)       return 'cell drawn-plain';
    if (iw && !id) return 'cell wild-glow';
    return 'cell';
  };

  const draw = useCallback(async () => {
    if (picks.length !== MAX_PICKS || drawing || hasResult) return;
    if (balance < bet) { alert('Not enough mammoth bones!'); return; }

    setDrawing(true);
    setDrawn([]);
    setHasResult(false);
    setResult(null);
    setWildNum(null);
    setWildBonus(false);
    setProgress(0);
    setBalance(prev => prev - bet);

    const dn = [];
    for (let i = 0; i < DRAWS; i++) {
      await new Promise(r => setTimeout(r, 150));
      let rand;
      do { rand = Math.floor(Math.random() * NUMS) + 1; } while (dn.includes(rand));
      dn.push(rand);
      setDrawn([...dn]);
      setProgress(Math.round(((i + 1) / DRAWS) * 100));
    }

    const wn = Math.floor(Math.random() * NUMS) + 1;
    setWildNum(wn);
    const isWild = picks.includes(wn) && !dn.includes(wn);

    let matches = picks.filter(p => dn.includes(p)).length;
    if (isWild) matches = Math.min(matches + 1, MAX_PICKS);

    let win = MULT[matches] * bet;
    let currentCombo = combo;
    if (currentCombo > 0 && win > 0) win += Math.floor(win * currentCombo * 0.1);

    if (win > 0) {
      setBalance(prev => prev + win);
      const next = currentCombo + 1;
      setCombo(next);
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(0), 6000);
    } else {
      setCombo(0);
    }

    if (isWild) {
      setWildBonus(true);
      setStats(prev => ({ ...prev, bonuses: prev.bonuses + 1 }));
    }

    setStats(prev => ({
      ...prev,
      played: prev.played + 1,
      wins: prev.wins + (win > 0 ? 1 : 0),
      bigWin: Math.max(prev.bigWin, win),
    }));

    setHistory(prev => [{
      id: Date.now(),
      matches,
      win,
      wild: isWild,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, ...prev].slice(0, 8));

    setResult({ matches, win, wild: isWild, wn });
    setHasResult(true);
    setDrawing(false);
    setProgress(0);
  }, [picks, balance, bet, combo, drawing, hasResult]);

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) + '%' : '—';

  return (
    <div className="ck-wrap">
      {/* Header */}
      <div className="ck-header">
        <div className="ck-eyebrow">◆ THE ANCIENT HUNT ◆</div>
        <h1 className="ck-title">CAVEMAN KENO</h1>
        <div className="ck-subtitle">Mark the cave · Summon the spirits · Claim the bones</div>
      </div>

      {/* Stats */}
      <div className="ck-stats">
        <div className="ck-stat">
          <div className="ck-stat-lbl">Mammoth Bones</div>
          <div className="ck-stat-val">${balance.toLocaleString()}</div>
        </div>
        <div className="ck-stat">
          <div className="ck-stat-lbl">Biggest Hunt</div>
          <div className="ck-stat-val">${stats.bigWin.toLocaleString()}</div>
        </div>
        <div className="ck-stat">
          <div className="ck-stat-lbl">Cave Bonuses</div>
          <div className="ck-stat-val">{stats.bonuses}</div>
        </div>
        {combo > 0 ? (
          <div className="ck-stat combo">
            <div className="ck-stat-lbl">Combo</div>
            <div className="ck-stat-val">x{combo}</div>
          </div>
        ) : (
          <div className="ck-stat">
            <div className="ck-stat-lbl">Win Rate</div>
            <div className="ck-stat-val">{winRate}</div>
          </div>
        )}
      </div>

      {/* Bet Controls */}
      <div className="ck-bet-row">
        <div className="ck-bet-panel">
          <div className="ck-bet-lbl">Wager</div>
          <button className="ck-step" onClick={() => adjustBet(-5)} disabled={drawing}>−</button>
          <div className="ck-bet-val">${bet}</div>
          <button className="ck-step" onClick={() => adjustBet(5)} disabled={drawing}>+</button>
          <div className="ck-presets">
            {[5, 10, 25, 50].map(a => (
              <button key={a} className="ck-pre" onClick={() => !drawing && setBet(a)} disabled={drawing}>${a}</button>
            ))}
          </div>
        </div>
        <button className="ck-spirit-btn" onClick={spiritPick} disabled={drawing}>⚡ Spirit Pick</button>
      </div>

      {/* Board */}
      <div className="ck-board">
        <div className="ck-board-top">
          <div className="ck-board-lbl">Mark Your Cave Paintings</div>
          <div className="ck-pips">
            {Array.from({ length: MAX_PICKS }).map((_, i) => (
              <span key={i} className={`ck-pip${i < picks.length ? ' on' : ''}`} />
            ))}
            <span className="ck-pip-count">{picks.length} / {MAX_PICKS}</span>
          </div>
        </div>
        <div className="ck-grid">
          {Array.from({ length: NUMS }).map((_, i) => {
            const n = i + 1;
            const isHit = picks.includes(n) && drawn.includes(n);
            return (
              <button
                key={n}
                className={getCellClass(n)}
                onClick={() => togglePick(n)}
                disabled={hasResult || drawing}
              >
                <span className="cnum">{n}</span>
                <span className="cicon">{ANIMALS[i]}</span>
                {isHit && <span className="hit-mark">★</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress */}
      {drawing && (
        <div className="ck-prog">
          <div className="ck-prog-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Actions */}
      <div className="ck-actions">
        <button
          className={`ck-draw-btn${drawing ? ' drawing' : ''}`}
          onClick={draw}
          disabled={picks.length !== MAX_PICKS || drawing || hasResult}
        >
          {drawing ? 'Hunting...' : 'Begin the Hunt'}
        </button>
        <button className="ck-sec-btn" onClick={clearBoard} disabled={drawing}>Clear</button>
        <button className="ck-sec-btn" onClick={newTribe} disabled={drawing}>New Tribe</button>
      </div>

      {/* Wild Banner */}
      {result && result.wild && (
        <div className="ck-wild-banner">
          <div>
            <div className="ck-wild-lbl">Cave Spirit Bonus</div>
            <div className="ck-wild-txt">Wild {result.wn} {ANIMALS[result.wn - 1]} gave +1 match!</div>
          </div>
          <div className="ck-wild-badge">BONUS ACTIVE</div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`ck-result${result.win > 0 ? ' win' : ' lose'}`}>
          <div>
            <div className="ck-res-lbl">Animals Caught</div>
            <div className="ck-res-main">{result.matches} of {MAX_PICKS}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={`ck-res-amt${result.win > 0 ? ' pos' : ' zero'}`}>
              {result.win > 0 ? '+' : ''}${result.win.toLocaleString()}
            </div>
            <div className={`ck-res-sub${result.win > 0 ? ' pos' : ' zero'}`}>
              {result.win > 0 ? '✦ Successful Hunt ✦' : 'The hunt failed'}
            </div>
          </div>
        </div>
      )}

      {/* Drawn Chips */}
      {drawn.length > 0 && (
        <div className="ck-drawn">
          <div className="ck-drawn-hdr">Animals Revealed</div>
          <div className="ck-chips">
            {drawn.map((n, idx) => (
              <div key={idx} className={`ck-chip${picks.includes(n) ? ' matched' : ' plain'}`}>{n}</div>
            ))}
            {result && result.wild && (
              <div className="ck-chip wild-chip">W{result.wn}</div>
            )}
          </div>
        </div>
      )}

      <div className="ck-divider" />

      {/* Payout Table */}
      <div className="ck-payout">
        <div className="ck-payout-hdr">Hunt Rewards</div>
        {[3, 4, 5].map(m => (
          <div key={m} className={`ck-pay-row${result && result.matches === m && result.win > 0 ? ' lit' : ''}`}>
            <span className="ck-pay-lbl">{m} animals caught</span>
            <span className="ck-pay-mult">{MULT[m]}× wager{m === 5 ? ' + Spirit Bonus' : ''}</span>
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="ck-hist">
          <div className="ck-hist-hdr">Hunt Chronicle</div>
          {history.map(g => (
            <div key={g.id} className="ck-hist-row">
              <div className={`ck-hdot${g.win > 0 ? ' win' : ' lose'}`} />
              <div className="ck-htime">{g.time}</div>
              <div className="ck-hmatch">
                {g.wild && <span className="ck-hwild">W </span>}
                {g.matches} animal{g.matches !== 1 ? 's' : ''}
              </div>
              <div className={`ck-hamt${g.win > 0 ? ' pos' : ' zero'}`}>
                {g.win > 0 ? '+' : ''}${g.win}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CavemanKeno;
