import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../../state/useGameStore';
import { ArrowUp, Hand, Crosshair } from 'lucide-react';

export const MobileControls: React.FC = () => {
  const {
    phase,
    handlePlayerMove,
    handleInteract,
    startChargingThrow,
    updateChargingThrow,
    releaseThrow,
    isChargingThrow,
  } = useGameStore();

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const isMoving = useRef(false);
  const moveVector = useRef<{ dx: number; dz: number }>({ dx: 0, dz: 0 });

  // Joystick touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateJoystick(touch.clientX, touch.clientY);
    isMoving.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setStickPos({ x: 0, y: 0 });
        isMoving.current = false;
        moveVector.current = { dx: 0, dz: 0 };
        handlePlayerMove(0, 0, false, false);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const diffX = clientX - centerX;
    const diffY = clientY - centerY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    const maxRadius = rect.width / 2;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(diffY, diffX);

    const nx = Math.cos(angle) * (clampedDist / maxRadius);
    const ny = Math.sin(angle) * (clampedDist / maxRadius);

    setStickPos({ x: nx * 38, y: ny * 38 });

    // In 3D: ny maps to forward/back (dz), nx maps to strafe (dx)
    moveVector.current = { dx: nx, dz: -ny };
  };

  // Dispatch continuous movement loop while joystick active
  useEffect(() => {
    if (phase !== 'active' && phase !== 'aiming_throw') return;

    let animId: number;
    const loop = () => {
      if (isMoving.current) {
        handlePlayerMove(
          moveVector.current.dx,
          moveVector.current.dz,
          true, // sprint by default on mobile for snappy feel
          false
        );
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [phase, handlePlayerMove]);

  // Throw button touch charging
  const handleThrowTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startChargingThrow();
  };

  const handleThrowTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    releaseThrow();
  };

  if (phase !== 'active' && phase !== 'aiming_throw') return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-15 flex items-end justify-between p-6 select-none md:hidden">
      {/* Virtual Movement Joystick on Left */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-900/60 backdrop-blur-md border-2 border-slate-700/80 shadow-2xl active:border-amber-400"
      >
        {/* Center Knob */}
        <div
          className="h-14 w-14 rounded-full bg-amber-500 shadow-lg border-2 border-white/80 transition-transform duration-75"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        />
      </div>

      {/* Action Buttons on Right */}
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/* Interact / Stack Stone Button [E] */}
        <button
          onClick={handleInteract}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl border-2 border-white/80 active:scale-90 transition-all active:bg-emerald-500"
          title="Interact / Stack"
        >
          <Hand className="h-7 w-7" />
        </button>

        {/* Throw Ball Button (Press & Hold to charge, release to hurl) */}
        <button
          onTouchStart={handleThrowTouchStart}
          onTouchEnd={handleThrowTouchEnd}
          onMouseDown={startChargingThrow}
          onMouseUp={releaseThrow}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-2xl border-2 border-white/80 transition-all ${
            isChargingThrow
              ? 'bg-rose-600 scale-110 ring-4 ring-amber-400'
              : 'bg-amber-500 text-slate-950 active:scale-95'
          }`}
          title="Throw Ball"
        >
          <Crosshair className="h-9 w-9" />
        </button>
      </div>
    </div>
  );
};
