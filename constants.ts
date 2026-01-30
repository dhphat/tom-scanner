import { GameConfig } from './types';

export const CONFIG: GameConfig = {
  baseSpeed: 0.025, // Slightly faster start
  maxSpeed: 0.25,  // Higher cap
  speedIncrement: 0.005, // Significant speed up per hit
  tolerance: 0.45, // Keep generous tolerance for the increased speed
};

export const COLORS = {
  background: '#020617', // slate-950
  scanner: '#00ffff', // cyan
  scannerGlow: 'rgba(0, 255, 255, 0.4)',
  artifactPottery: '#fbbf24', // amber
  artifactMask: '#a855f7', // purple
  artifactGem: '#ef4444', // red
  particleSuccess: '#fde047',
  particleFail: '#ef4444',
  text: '#e2e8f0',
};