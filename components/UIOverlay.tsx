import React from 'react';
import { GameState } from '../types';
import { Crosshair, Play, RefreshCw, Trophy, AlertCircle, Medal, Maximize, Minimize } from 'lucide-react';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  isFullscreen: boolean;
  onStart: () => void;
  onRestart: () => void;
  onToggleFullscreen: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  gameState,
  score,
  highScore,
  isFullscreen,
  onStart,
  onRestart,
  onToggleFullscreen,
}) => {
  const isNewRecord = score > highScore && highScore > 0;

  const FullscreenButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleFullscreen();
      }}
      className="absolute top-6 right-6 z-[60] p-3 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl text-cyan-400 transition-all hover:scale-110 active:scale-95 backdrop-blur-sm group pointer-events-auto"
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFullscreen ? (
        <Minimize size={20} className="group-hover:text-cyan-300" />
      ) : (
        <Maximize size={20} className="group-hover:text-cyan-300" />
      )}
    </button>
  );

  if (gameState === GameState.PLAYING) {
    return (
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        {FullscreenButton}
        {/* Top HUD */}
        <div className="flex justify-between items-start animate-fade-in-down">
          <div className="flex flex-col">
            <span className="text-cyan-400 text-xs tracking-widest uppercase mb-1">Found Artifacts</span>
            <span className={`text-6xl font-black font-mono neon-text drop-shadow-lg transition-colors duration-300 ${isNewRecord ? 'text-yellow-400 animate-pulse' : 'text-cyan-50'}`}>
              {score.toString()}
            </span>
            {isNewRecord && (
              <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest animate-bounce mt-1">
                New Record!
              </span>
            )}
          </div>
          <div className="flex flex-col items-end pr-16"> {/* Add padding to avoid overlap with FS button */}
            <div className="flex items-center gap-2 mb-1 opacity-70">
              <Trophy size={14} className="text-yellow-500" />
              <span className="text-yellow-500 text-xs tracking-widest uppercase font-bold">
                Record
              </span>
            </div>
            <span className="text-2xl font-mono text-yellow-500/80">
              {Math.max(score, highScore)}
            </span>
          </div>
        </div>

        {/* Bottom Hint */}
        <div className="text-center mb-8 opacity-60">
          <span className="text-xs text-red-400 uppercase tracking-[0.2em] font-bold">
            One Miss = Game Over
          </span>
        </div>
      </div>
    );
  }

  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 animate-fade-in text-center">
        {FullscreenButton}
        <div className="mb-6 relative">
          <div className={`absolute inset-0 blur-3xl opacity-20 animate-pulse ${isNewRecord ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          {isNewRecord ? (
            <Medal size={80} className="text-yellow-400 relative z-10 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)] animate-bounce" />
          ) : (
            <AlertCircle size={80} className="text-red-500 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          )}
        </div>

        {isNewRecord ? (
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-2 neon-text tracking-tight animate-pulse">NEW RECORD!</h2>
        ) : (
          <h2 className="text-5xl font-black text-white mb-2 neon-text tracking-tight">SCAN FAILED</h2>
        )}

        <p className="text-slate-400 mb-8 font-mono uppercase tracking-widest text-sm">Signal Lost</p>

        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl w-full max-w-xs mb-8 shadow-2xl">
          <div className="flex justify-between mb-4 items-end">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Score</span>
            <span className="text-3xl font-mono text-cyan-400 leading-none">{score}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-4 items-end">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Best</span>
            <span className={`text-3xl font-mono leading-none ${isNewRecord ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-slate-500'}`}>
              {Math.max(score, highScore)}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="group flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(8,145,178,0.5)] active:scale-95"
        >
          <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" /> Retry Scan
        </button>
      </div>
    );
  }

  // MENU State
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950">
      {FullscreenButton}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/20 rounded-full animate-spin-slow" style={{ animationDuration: '30s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-400/20 rounded-full animate-reverse-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md h-full justify-center">

        {/* Branding */}
        <div className="absolute top-8 left-0 right-0 text-center animate-fade-in-down">
          <p className="text-cyan-500/80 font-bold uppercase tracking-[0.15em] text-[10px] mb-1">
            FIRST Tech Challenge Vietnam
          </p>
          <p className="text-white/60 text-[10px] tracking-widest uppercase">
            Mini Game
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-10 mt-12">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <Crosshair size={40} className="text-cyan-400 animate-spin-slow" style={{ animationDuration: '6s' }} />
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 neon-text tracking-tighter text-center leading-[0.85] mb-2">
            TOMB<br />SCANNER
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        </div>

        {/* High Score Preview */}
        {highScore > 0 && (
          <div className="mb-8 flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50">
            <Trophy size={14} className="text-yellow-500" />
            <span className="text-xs text-slate-300 uppercase tracking-wider">Record: <span className="text-yellow-400 font-bold font-mono text-sm">{highScore}</span></span>
          </div>
        )}

        <button
          onClick={onStart}
          className="group relative flex items-center justify-center w-28 h-28 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all hover:scale-110 active:scale-95 hover:shadow-[0_0_60px_rgba(6,182,212,0.6)]"
        >
          <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-0 rounded-full border-t border-white/50"></div>
          <Play size={48} className="text-white fill-current translate-x-1 group-hover:text-yellow-200 transition-colors drop-shadow-md" />
        </button>

        <div className="mt-8 text-[10px] text-cyan-800 uppercase tracking-[0.3em] font-bold animate-pulse">
          System Ready
        </div>
      </div>
    </div>
  );
};