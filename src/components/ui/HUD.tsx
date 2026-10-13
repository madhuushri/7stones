import React from 'react';
import { useGameStore } from '../../state/useGameStore';
import { STONE_COLORS } from '../gameplay/StoneStack';
import { getDist2D, getDist3D } from '../../state/gameEngine';
import {
  Trophy,
  Clock,
  Shield,
  Heart,
  Crosshair,
  Volume2,
  VolumeX,
  Pause,
  Layers,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

export const HUD: React.FC = () => {
  const {
    phase,
    score,
    roundTimeLeft,
    players,
    stones,
    ball,
    humanTeam,
    throwPower,
    isChargingThrow,
    notification,
    pauseMatch,
    settings,
    updateSettings,
  } = useGameStore();

  const human = players.find((p) => p.isHuman);
  const stackedCount = stones.filter((s) => s.isStacked).length;

  // Contextual prompts determination
  let actionPrompt: string | null = null;
  if (human && !human.isEliminated && (phase === 'active' || phase === 'aiming_throw')) {
    if (human.team === 'runners') {
      if (human.carryingStoneIndex !== null) {
        const distToBase = getDist2D(human.position, [0, 0, 0]);
        if (distToBase <= 2.8) {
          actionPrompt = 'Press [E] to Place Stone on Stack!';
        } else {
          actionPrompt = 'Bring Stone to the Center Circle!';
        }
      } else {
        // Check if near an unstacked stone
        let nearStone = false;
        for (const stone of stones) {
          if (!stone.isStacked && !stone.isHeld) {
            if (getDist3D(human.position, stone.position) < 2.0) {
              nearStone = true;
              break;
            }
          }
        }
        if (nearStone) {
          actionPrompt = 'Press [E] to Pick Up Stone';
        }
      }
    } else {
      // Seeker human
      if (ball.isFree && getDist3D(human.position, ball.position) < 2.0) {
        actionPrompt = 'Press [E] to Grab Ball';
      } else if (ball.holderId === human.id) {
        actionPrompt = 'Hold [LMB] to Aim & Throw Ball!';
      }
    }

    if (phase === 'aiming_throw' && ball.holderId === human.id) {
      actionPrompt = 'Hold [LMB] to Aim at Stones and Release to Throw!';
    }
  }

  const activeRunners = players.filter((p) => p.team === 'runners' && !p.isEliminated);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 select-none">
      {/* Top Header Bar: Team Scores, Round Info, Stone Tower Meter */}
      <div className="flex w-full items-start justify-between">
        {/* Left: Team Scores & Info */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-slate-900/85 p-3.5 shadow-xl backdrop-blur-md border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center px-2">
              <span className="text-xs font-bold tracking-wider uppercase text-amber-400">
                Runners
              </span>
              <span className="text-2xl font-black text-amber-300">
                {score.runnersScore}
              </span>
            </div>
            <div className="h-9 w-px bg-slate-700"></div>
            <div className="flex flex-col items-center px-2">
              <span className="text-xs font-bold tracking-wider uppercase text-sky-400">
                Seekers
              </span>
              <span className="text-2xl font-black text-sky-300">
                {score.seekersScore}
              </span>
            </div>
          </div>

          <div className="h-9 w-px bg-slate-700"></div>

          {/* Round Indicator */}
          <div className="flex flex-col text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Round {score.currentRound} / {score.maxRounds}</span>
            <span className="font-bold text-emerald-400">
              Role: {humanTeam === 'runners' ? '🏃 Runner' : '🎯 Seeker'}
            </span>
          </div>
        </div>

        {/* Center: The 7 Stones Tower Stack Progress Meter */}
        <div className="pointer-events-auto flex flex-col items-center rounded-2xl bg-slate-900/85 px-5 py-3 shadow-xl backdrop-blur-md border border-slate-700/60">
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Seven Stones Stack ({stackedCount}/7)
            </span>
          </div>

          {/* Visual Stone Discs: Stacked vs Scattered */}
          <div className="flex items-center gap-1.5">
            {stones.map((s, idx) => {
              const isStacked = s.isStacked;
              return (
                <div
                  key={s.id}
                  className={`flex h-6 w-7 items-center justify-center rounded-md font-bold text-xs transition-all ${
                    isStacked
                      ? 'scale-105 border-2 border-white shadow-lg text-white'
                      : 'opacity-40 grayscale border border-dashed border-slate-500 text-slate-400'
                  }`}
                  style={{
                    backgroundColor: isStacked ? STONE_COLORS[idx] : '#334155',
                  }}
                  title={`Stone ${idx + 1}`}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Round Timer, Lives, and Quick Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Round Timer */}
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900/85 px-4 py-3 shadow-xl backdrop-blur-md border border-slate-700/60">
            <Clock className={`h-5 w-5 ${roundTimeLeft < 20 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className={`text-xl font-black font-mono ${roundTimeLeft < 20 ? 'text-rose-400' : 'text-white'}`}>
              {Math.floor(roundTimeLeft / 60)}:{(Math.floor(roundTimeLeft % 60)).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Human Player Lives */}
          {human && (
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900/85 px-3.5 py-3 shadow-xl backdrop-blur-md border border-slate-700/60">
              <span className="text-xs font-semibold text-slate-400 mr-1">Lives:</span>
              {Array.from({ length: settings.runnerLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`h-4 w-4 ${
                    i < human.lives
                      ? 'fill-rose-500 text-rose-500'
                      : 'fill-slate-700 text-slate-600'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Pause Button */}
          <button
            onClick={pauseMatch}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/85 text-slate-300 shadow-xl backdrop-blur-md border border-slate-700/60 hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
            title="Pause (Esc)"
          >
            <Pause className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Center Screen: Reticle, Aiming Power Meter, and Notification Toast */}
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Aim Reticle */}
        <div className="relative flex h-8 w-8 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-white/80 ring-2 ring-black/40"></div>
          {isChargingThrow && (
            <div
              className="absolute -inset-3 rounded-full border-2 border-amber-400 animate-spin"
              style={{
                borderColor: `rgba(245, 158, 11, ${0.4 + throwPower * 0.6})`,
              }}
            ></div>
          )}
        </div>

        {/* Throwing Power Meter Bar */}
        {isChargingThrow && (
          <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-950/80 px-4 py-2 backdrop-blur-md border border-amber-500/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Throw Power {Math.round(throwPower * 100)}%
            </span>
            <div className="h-3 w-44 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 transition-all duration-75"
                style={{ width: `${throwPower * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* In-Game Announcement Notification */}
        {notification && (
          <div className="animate-bounce pointer-events-auto rounded-full bg-amber-500/95 px-6 py-2.5 font-bold text-slate-950 shadow-2xl backdrop-blur-md border-2 border-white/80 text-sm">
            {notification}
          </div>
        )}

        {/* Dynamic Contextual Action Prompt */}
        {actionPrompt && (
          <div className="rounded-xl bg-slate-900/90 px-4 py-2 font-bold text-amber-300 shadow-xl backdrop-blur-md border border-amber-500/40 text-sm animate-pulse">
            {actionPrompt}
          </div>
        )}
      </div>

      {/* Bottom Area: Minimap Radar & Controls Cheatsheet */}
      <div className="flex w-full items-end justify-between">
        {/* Desktop Controls Cheatsheet Hint */}
        <div className="flex flex-col gap-1 rounded-2xl bg-slate-900/75 p-3 text-xs text-slate-300 backdrop-blur-md border border-slate-800 hidden sm:flex">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono font-bold text-amber-400">WASD</span>
            <span>Move</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono font-bold text-amber-400">Shift</span>
            <span>Sprint</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono font-bold text-amber-400">Space</span>
            <span>Jump</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono font-bold text-amber-400">LMB</span>
            <span>Hold & Throw Ball</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono font-bold text-amber-400">E</span>
            <span>Interact / Stack Stone</span>
          </div>
        </div>

        {/* Minimap Playground Radar (Court top-down view) */}
        <div className="pointer-events-auto relative flex h-36 w-36 items-center justify-center rounded-2xl bg-slate-950/85 p-2 shadow-2xl backdrop-blur-md border-2 border-slate-700/80">
          {/* Court Boundary Square */}
          <div className="relative h-28 w-28 rounded-lg border border-slate-600 bg-emerald-950/40">
            {/* Center Stone Circle */}
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400 bg-amber-400/20"></div>

            {/* Ball dot */}
            {ball && (
              <div
                className="absolute h-2 w-2 rounded-full bg-lime-400 ring-1 ring-black transition-all"
                style={{
                  left: `${((ball.position[0] + 18) / 36) * 100}%`,
                  top: `${((ball.position[2] + 18) / 36) * 100}%`,
                }}
                title="Ball"
              ></div>
            )}

            {/* Stones dots on ground */}
            {stones.map((s) => {
              if (s.isStacked || s.isHeld) return null;
              return (
                <div
                  key={s.id}
                  className="absolute h-1.5 w-1.5 rounded-full bg-amber-300 opacity-80"
                  style={{
                    left: `${((s.position[0] + 18) / 36) * 100}%`,
                    top: `${((s.position[2] + 18) / 36) * 100}%`,
                  }}
                ></div>
              );
            })}

            {/* Players dots */}
            {players.map((p) => {
              if (p.isEliminated) return null;
              const isRunner = p.team === 'runners';
              return (
                <div
                  key={p.id}
                  className={`absolute rounded-full transition-all ${
                    p.isHuman
                      ? 'h-3 w-3 ring-2 ring-white z-10'
                      : 'h-2 w-2 opacity-90'
                  } ${isRunner ? 'bg-amber-400' : 'bg-sky-400'}`}
                  style={{
                    left: `${((p.position[0] + 18) / 36) * 100}%`,
                    top: `${((p.position[2] + 18) / 36) * 100}%`,
                  }}
                  title={p.name}
                ></div>
              );
            })}
          </div>
          <span className="absolute bottom-1 right-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Radar
          </span>
        </div>
      </div>
    </div>
  );
};
