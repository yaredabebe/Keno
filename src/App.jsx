import { useState } from 'react';
import { FaDice, FaHome, FaGamepad, FaCrown, FaGithub, FaHeart, FaRocket, FaLayerGroup, FaSkull } from 'react-icons/fa';
import { GiEgyptianWalk, GiScarabBeetle, GiLightningHelix , GiCardPlay, GiStoneBlock  } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import ClassicKeno from './ClassicKeno';
import CleopatraKeno from './CleopatraKeno';
import PowerKeno from './PowerKeno';
import MultiCardKeno from './MultiCardKeno';
import CavemanKeno from './CavemanKeno';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState(null);

  const gameOptions = [
    {
      id: 'classic',
      title: 'Classic Keno',
      icon: <FaDice />,
      description: 'Traditional Keno gameplay with authentic rules',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: ['Pick 5 numbers', 'Match to win', 'Classic experience'],
      popularity: '★ 4.8',
      players: '2.3k active'
    },
    {
      id: 'cleopatra',
      title: 'Cleopatra Bonus Keno',
      icon: <FaCrown />,
      description: 'Egyptian themed bonus game with special rewards',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      features: ['Bonus feature', 'Free game trigger', 'Double rewards'],
      popularity: '★ 4.9',
      players: '1.8k active'
    },
    {
      id: 'power',
      title: 'Power Keno',
      icon: <GiLightningHelix  />,
      description: 'Multiplier madness with explosive wins',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      features: ['4x/8x multipliers', 'High volatility', 'Big wins'],
      popularity: '★ 4.7',
      players: '1.5k active'
    },
    {
      id: 'multicard',
      title: 'Multi-Card Keno',
      icon: <FaLayerGroup />,
      description: 'Play 4 cards simultaneously for more action',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      features: ['4 cards at once', 'Better odds', 'Fast-paced'],
      popularity: '★ 4.6',
      players: '1.2k active'
    },
    {
      id: 'caveman',
      title: 'Caveman Keno',
      icon: <GiStoneBlock  />,
      description: 'Prehistoric theme with unique bonus rounds',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      features: ['Cave bonus', 'Wild numbers', 'Adventure theme'],
      popularity: '★ 4.5',
      players: '980 active'
    }
  ];

  const handleGameSelect = (mode) => {
    setGameMode(mode);
  };

  const handleBackToMenu = () => {
    setGameMode(null);
  };

  const currentYear = new Date().getFullYear();

  // Game Selection Menu
  if (!gameMode) {
    return (
      <div className="app-container">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        
        <motion.div 
          className="menu-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-section">
            <motion.div 
              className="logo-wrapper"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <GiScarabBeetle className="logo-icon" />
            </motion.div>
            <motion.h1 
              className="main-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Keno <span className="highlight">Master</span>
            </motion.h1>
            <motion.p 
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Choose your gaming experience
            </motion.p>
          </div>

          <div className="games-grid">
            {gameOptions.map((game, index) => (
              <motion.button
                key={game.id}
                className="game-card"
                style={{ background: game.color }}
                onClick={() => handleGameSelect(game.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="game-stats">
                  <span className="popularity">{game.popularity}</span>
                  <span className="players-count">{game.players}</span>
                </div>
                <div className="game-icon-wrapper">
                  {game.icon}
                </div>
                <h2 className="game-title">{game.title}</h2>
                <p className="game-description">{game.description}</p>
                <div className="features-list">
                  {game.features.map((feature, i) => (
                    <span key={i} className="feature-tag">{feature}</span>
                  ))}
                </div>
                <div className="play-button">
                  Play Now <span className="arrow">→</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer Section */}
          <motion.footer 
            className="app-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="footer-content">
              <div className="footer-brand">
                <GiScarabBeetle className="footer-icon" />
                <span>Keno Master Gaming</span>
              </div>
              
              <div className="footer-creator">
                <FaHeart className="heart-icon" />
                <span>Created by <strong>Yared Abebe</strong></span>
                <FaRocket className="rocket-icon" />
              </div>
              
              <div className="footer-links">
                <a href="#" className="footer-link">About</a>
                <a href="#" className="footer-link">Privacy</a>
                <a href="#" className="footer-link">Terms</a>
                <a href="#" className="footer-link">Support</a>
              </div>
              
              <div className="footer-copyright">
                <span>© {currentYear} Yared Abebe. All rights reserved.</span>
              </div>
              
              <div className="footer-social">
                <a href="https://github.com/yaredabebe" className="social-icon" aria-label="GitHub">
                  <FaGithub />
                </a>
                <a href="#" className="social-icon" aria-label="Heart">
                  <FaHeart />
                </a>
              </div>
            </div>
          </motion.footer>
        </motion.div>
      </div>
    );
  }

  // Active Game View
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="game-view-container"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="game-header">
          <motion.button 
            className="back-button"
            onClick={handleBackToMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome className="back-icon" />
            <span>Main Menu</span>
          </motion.button>
          <div className="game-badge">
            {gameMode === 'classic' && (
              <>
                <FaGamepad className="badge-icon" />
                <span>Classic Mode</span>
              </>
            )}
            {gameMode === 'cleopatra' && (
              <>
                <FaCrown className="badge-icon" />
                <span>Cleopatra Mode</span>
              </>
            )}
            {gameMode === 'power' && (
              <>
                <GiLightningHelix  className="badge-icon" />
                <span>Power Mode</span>
              </>
            )}
            {gameMode === 'multicard' && (
              <>
                <FaLayerGroup className="badge-icon" />
                <span>Multi-Card Mode</span>
              </>
            )}
            {gameMode === 'caveman' && (
              <>
                <GiStoneBlock  className="badge-icon" />
                <span>Caveman Mode</span>
              </>
            )}
          </div>
        </div>
        
        <motion.div 
          className="game-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {gameMode === 'classic' && <ClassicKeno />}
          {gameMode === 'cleopatra' && <CleopatraKeno />}
          {gameMode === 'power' && <PowerKeno />}
          {gameMode === 'multicard' && <MultiCardKeno />}
          {gameMode === 'caveman' && <CavemanKeno />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;