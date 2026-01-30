import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Artifact, Particle, GameConfig } from '../types';
import { CONFIG, COLORS } from '../constants';
import { audioService } from '../services/audioService';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onScoreUpdate,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable Game State (Ref pattern for high-freq updates without re-renders)
  const gameRef = useRef({
    score: 0,
    scannerAngle: 0,
    speed: CONFIG.baseSpeed,
    artifacts: [] as Artifact[],
    particles: [] as Particle[],
    lastFrameTime: 0,
    isActive: false,
    radius: 0,
    centerX: 0,
    centerY: 0,
  });

  // --- Helper Functions ---

  const spawnArtifact = useCallback(() => {
    const { artifacts } = gameRef.current;
    if (artifacts.length > 0) return; // Only one target at a time for clarity

    // Random angle
    const angle = Math.random() * Math.PI * 2;
    
    // Determine type
    const rand = Math.random();
    let type: Artifact['type'] = 'pottery';
    let icon = '⚱️';
    let color = COLORS.artifactPottery;

    if (rand > 0.7) {
      type = 'mask';
      icon = '👺';
      color = COLORS.artifactMask;
    } else if (rand > 0.9) {
      type = 'gem';
      icon = '💎';
      color = COLORS.artifactGem;
    }

    gameRef.current.artifacts.push({
      id: Date.now(),
      angle,
      type,
      icon,
      color,
      spawnTime: Date.now(),
    });
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      gameRef.current.particles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  };

  const endGame = useCallback(() => {
    gameRef.current.isActive = false;
    onGameOver(gameRef.current.score);
  }, [onGameOver]);

  const handleTap = useCallback(() => {
    if (gameRef.current.isActive === false) return;

    const state = gameRef.current;
    const scannerAngleNormalized = state.scannerAngle % (Math.PI * 2);
    
    let hit = false;
    const remainingArtifacts: Artifact[] = [];

    // Check collision
    state.artifacts.forEach((art) => {
      // Calculate minimal angular difference
      let diff = Math.abs(scannerAngleNormalized - art.angle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;

      if (diff < CONFIG.tolerance) {
        // HIT!
        hit = true;
        state.score += 1; // Simple score increment
        
        // Increase Speed on EVERY hit
        state.speed = Math.min(CONFIG.maxSpeed, state.speed + CONFIG.speedIncrement);
        
        // Effects
        const hitX = state.centerX + Math.cos(art.angle) * state.radius;
        const hitY = state.centerY + Math.sin(art.angle) * state.radius;
        spawnParticles(hitX, hitY, art.color, 25);
        audioService.playSuccess();
        
        // Trigger UI updates
        onScoreUpdate(state.score);
      } else {
        remainingArtifacts.push(art);
      }
    });

    if (hit) {
      state.artifacts = remainingArtifacts;
      setTimeout(spawnArtifact, 300); // Faster respawn
    } else {
      // MISS = INSTANT DEATH
      spawnParticles(state.centerX, state.centerY, COLORS.particleFail, 10);
      audioService.playError();
      endGame();
    }
  }, [onScoreUpdate, spawnArtifact, endGame]);

  // --- Game Loop ---

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let animationFrameId: number;

    const render = (time: number) => {
      if (gameState !== GameState.PLAYING) return;

      const state = gameRef.current;
      
      // Update dimensions if needed
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          state.centerX = width / 2;
          state.centerY = height / 2;
          state.radius = Math.min(width, height) * 0.35; // Radar radius
        }
      }

      // --- UPDATE LOGIC ---
      if (state.isActive) {
        // Rotate Scanner
        state.scannerAngle += state.speed;
        
        // Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
          if (p.life <= 0) state.particles.splice(i, 1);
        }

        if (state.artifacts.length === 0) {
            spawnArtifact();
        }
      }

      // --- DRAW LOGIC ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = state.centerX;
      const cy = state.centerY;
      const r = state.radius;

      // 1. Draw Radar Grid
      ctx.strokeStyle = '#1e293b'; // Slate-800
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // 2. Draw Artifacts
      state.artifacts.forEach(art => {
        const ax = cx + Math.cos(art.angle) * r;
        const ay = cy + Math.sin(art.angle) * r;
        
        // Draw Hit Zone (Visual Aid)
        ctx.beginPath();
        // Draw an arc representing the tolerance window
        ctx.arc(cx, cy, r, art.angle - CONFIG.tolerance, art.angle + CONFIG.tolerance);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; 
        ctx.lineWidth = 25;
        ctx.lineCap = 'butt';
        ctx.stroke();

        // Draw glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = art.color;
        ctx.fillStyle = art.color;
        
        // Draw Icon
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(art.icon, ax, ay);
        
        // Reset Shadow
        ctx.shadowBlur = 0;
      });

      // 3. Draw Scanner Line
      const lx = cx + Math.cos(state.scannerAngle) * r;
      const ly = cy + Math.sin(state.scannerAngle) * r;

      ctx.strokeStyle = COLORS.scanner;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 20;
      ctx.shadowColor = COLORS.scanner;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(lx, ly);
      ctx.stroke();

      // Draw Scanner Trail
      for(let i=1; i<=15; i++) {
        const trailAngle = state.scannerAngle - (i * 0.04);
        const tx = cx + Math.cos(trailAngle) * r;
        const ty = cy + Math.sin(trailAngle) * r;
        ctx.globalAlpha = 1 - (i/15);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // 4. Draw Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Loop
      animationFrameId = requestAnimationFrame(() => render(performance.now()));
    };

    // Start
    if (gameState === GameState.PLAYING) {
      if (!gameRef.current.isActive) {
        // Reset game
        gameRef.current = {
            ...gameRef.current,
            score: 0,
            scannerAngle: 0,
            speed: CONFIG.baseSpeed,
            artifacts: [],
            particles: [],
            isActive: true,
        };
        spawnArtifact();
      }
      render(performance.now());
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, onScoreUpdate, spawnArtifact, endGame]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full cursor-pointer touch-manipulation"
      onClick={handleTap}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};