import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { GameState } from './types';
import { audioService } from './services/audioService';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('tomb-scanner-high-score');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    // Initialize audio context on first user interaction
    audioService.playScanPing();
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleGameOver = (finalScore: number) => {
    setGameState(GameState.GAME_OVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('tomb-scanner-high-score', finalScore.toString());
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vh] h-[120vh] bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      <GameCanvas 
        gameState={gameState} 
        onScoreUpdate={handleScoreUpdate}
        onGameOver={handleGameOver}
      />
      
      <UIOverlay 
        gameState={gameState}
        score={score}
        highScore={highScore}
        onStart={startGame}
        onRestart={startGame}
      />
    </div>
  );
}