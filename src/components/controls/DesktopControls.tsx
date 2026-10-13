import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../state/useGameStore';
import { useFrame } from '@react-three/fiber';

export const DesktopControls: React.FC = () => {
  const {
    phase,
    handlePlayerMove,
    startChargingThrow,
    updateChargingThrow,
    releaseThrow,
    handleInteract,
    pauseMatch,
    resumeMatch,
    isChargingThrow,
  } = useGameStore();

  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      if (e.code === 'KeyE') {
        handleInteract();
      }

      if (e.code === 'Escape') {
        const currentPhase = useGameStore.getState().phase;
        if (currentPhase === 'paused') {
          resumeMatch();
        } else if (currentPhase === 'active' || currentPhase === 'aiming_throw') {
          pauseMatch();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      // Do not charge throw if clicking on HTML UI buttons or modals
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.closest('button') ||
          target.tagName === 'INPUT' ||
          target.closest('input'))
      ) {
        return;
      }

      // Primary left click charges throw
      if (e.button === 0) {
        startChargingThrow();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        releaseThrow();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleInteract, pauseMatch, resumeMatch, startChargingThrow, releaseThrow]);

  // Frame tick for movement input and charging throw
  useFrame((_, delta) => {
    if (phase !== 'active' && phase !== 'aiming_throw') return;

    // Movement calculation
    let dx = 0;
    let dz = 0;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) dz += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) dz -= 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) dx -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dx += 1;

    const isSprinting = Boolean(keys.current['ShiftLeft'] || keys.current['ShiftRight']);
    const isJumping = Boolean(keys.current['Space']);

    // Normalize diagonal movement
    if (dx !== 0 && dz !== 0) {
      const invLen = 1 / Math.sqrt(dx * dx + dz * dz);
      dx *= invLen;
      dz *= invLen;
    }

    handlePlayerMove(dx, dz, isSprinting, isJumping);

    if (isChargingThrow) {
      updateChargingThrow(delta);
    }
  });

  return null;
};
