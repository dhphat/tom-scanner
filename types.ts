export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Point {
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1
  color: string;
  size: number;
}

export interface Artifact {
  id: number;
  angle: number; // In radians
  type: 'pottery' | 'mask' | 'gem';
  icon: string;
  color: string;
  spawnTime: number;
}

export interface GameConfig {
  baseSpeed: number;
  maxSpeed: number;
  speedIncrement: number;
  tolerance: number; // Radians of error allowed for a hit
}