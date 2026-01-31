import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { GameState } from './types';
import { audioService } from './services/audioService';
import { highScoreService } from './services/highScoreService';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Load high score from sheet on mount
    const loadHighScore = async () => {
      const score = await highScoreService.fetchHighScore();
      setHighScore(score);
    };
    loadHighScore();

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

  const handleGameOver = async (finalScore: number) => {
    setGameState(GameState.GAME_OVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('tomb-scanner-high-score', finalScore.toString());
      // Sync with sheet
      await highScoreService.updateHighScore(finalScore);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
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
        isFullscreen={isFullscreen}
        onStart={startGame}
        onRestart={startGame}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}