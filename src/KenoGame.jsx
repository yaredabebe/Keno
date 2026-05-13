import { useState } from 'react';
import './KenoGame.css';

function KenoGame({ mode }) {
  const [picks, setPicks] = useState([]);
  const [draw, setDraw] = useState([]);
  const [result, setResult] = useState(null);
  const [bonusTriggered, setBonusTriggered] = useState(false);

  const togglePick = (num) => {
    if (picks.includes(num)) {
      setPicks(picks.filter(n => n !== num));
    } else if (picks.length < 5) {
      setPicks([...picks, num].sort((a,b) => a-b));
    }
  };

  const drawNumbers = () => {
    const drawn = [];
    while (drawn.length < 10) {
      const rand = Math.floor(Math.random() * 20) + 1;
      if (!drawn.includes(rand)) drawn.push(rand);
    }
    drawn.sort((a,b) => a-b);
    setDraw(drawn);
    
    const matches = picks.filter(p => drawn.includes(p)).length;
    let winAmount = 0;
    if (matches >= 3) winAmount = matches * 10;
    setResult({ matches, winAmount });
    
    // Cleopatra bonus: last drawn number matches any pick
    if (mode === 'cleopatra' && drawn[drawn.length-1] && picks.includes(drawn[drawn.length-1])) {
      setBonusTriggered(true);
      setTimeout(() => setBonusTriggered(false), 3000);
    } else {
      setBonusTriggered(false);
    }
  };

  const resetGame = () => {
    setPicks([]);
    setDraw([]);
    setResult(null);
    setBonusTriggered(false);
  };

  return (
    <div className="keno-container">
      <h2>{mode === 'classic' ? '🎯 Classic Keno' : '👑 Cleopatra Keno'}</h2>
      
      {bonusTriggered && <div className="bonus-message">✨ CLEOPATRA BONUS! ✨</div>}
      
      <div className="board">
        {[...Array(20)].map((_, i) => {
          const num = i+1;
          const isPicked = picks.includes(num);
          const isDrawn = draw.includes(num);
          return (
            <button
              key={num}
              className={`cell ${isPicked ? 'picked' : ''} ${isDrawn ? 'drawn' : ''}`}
              onClick={() => togglePick(num)}
              disabled={draw.length > 0}
            >
              {num}
            </button>
          );
        })}
      </div>
      
      <div className="controls">
        <button onClick={drawNumbers} disabled={picks.length !== 5 || draw.length > 0}>
          Draw Numbers
        </button>
        <button onClick={resetGame}>New Game</button>
      </div>
      
      {result && (
        <div className="result">
          <p>Matches: {result.matches}/5</p>
          <p>Win: {result.winAmount} coins</p>
        </div>
      )}
      
      {draw.length > 0 && (
        <div className="drawn-numbers">
          Drawn: {draw.join(', ')}
        </div>
      )}
    </div>
  );
}

export default KenoGame;