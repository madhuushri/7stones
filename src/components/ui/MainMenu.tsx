import React, { useState } from 'react';
import { useGameStore } from '../../state/useGameStore';
import { TeamType, GameMode } from '../../types/game';
import {
  Play,
  Target,
  User,
  Settings,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface MainMenuProps {
  onOpenCustomizer: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onOpenCustomizer,
  onOpenSettings,
  onOpenTutorial,
}) => {
  const { startMatch, humanTeam, setHumanTeam, settings, updateSettings } = useGameStore();
  const [selectedTeam, setSelectedTeam] = useState<TeamType>(humanTeam);
  const [isMuted, setIsMuted] = useState(false);

  const handleStartTournament = () => {
    soundManager.playWhistle();
    startMatch('match', selectedTeam);
  };

  const handleStartPractice = () => {
    soundManager.playWhistle();
    startMatch('practice', selectedTeam);
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between overflow-y-auto bg-gradient-to-b from-slate-950/80 via-slate-900/85 to-amber-950/80 p-6 backdrop-blur-md">
      {/* Top Bar with Brand & Sound Button */}
      <div className="flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 border border-amber-400/30">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Traditional Indian 3D Sports
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all shadow-lg active:scale-95"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Title Hero Section */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="mb-2 inline-flex items-center gap-2 rounded-2xl bg-amber-500/20 px-4 py-1 border border-amber-400/40">
          <span className="text-xs font-black tracking-widest uppercase text-amber-300">
            LAGORI • PITTHU • SATODIYU
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_8px_24px_rgba(245,158,11,0.4)]">
          SEVEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-rose-400">STONES</span>
        </h1>

        <p className="mt-3 max-w-lg text-sm md:text-base text-slate-300 font-medium">
          Experience the fast-paced traditional Indian playground game in vibrant 3D! Knock down the stones, dodge the ball, and rebuild the tower to claim victory!
        </p>

        {/* Team Selection Cards */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          {/* Runner Team Option */}
          <button
            onClick={() => {
              setSelectedTeam('runners');
              setHumanTeam('runners');
            }}
            className={`flex-1 flex flex-col items-center gap-2 rounded-2xl p-4 transition-all border-2 text-left w-full ${
              selectedTeam === 'runners'
                ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.35)] scale-105'
                : 'bg-slate-900/60 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl shadow-md">
              🏃
            </div>
            <div className="text-center">
              <div className="font-black text-amber-300 text-base">RUNNERS TEAM</div>
              <div className="text-xs text-slate-300">Scatter stones, dodge hits, rebuild 7 stones!</div>
            </div>
          </button>

          {/* Seeker Team Option */}
          <button
            onClick={() => {
              setSelectedTeam('seekers');
              setHumanTeam('seekers');
            }}
            className={`flex-1 flex flex-col items-center gap-2 rounded-2xl p-4 transition-all border-2 text-left w-full ${
              selectedTeam === 'seekers'
                ? 'bg-sky-500/25 border-sky-400 shadow-[0_0_24px_rgba(14,165,233,0.35)] scale-105'
                : 'bg-slate-900/60 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white font-black text-2xl shadow-md">
              🎯
            </div>
            <div className="text-center">
              <div className="font-black text-sky-300 text-base">SEEKERS TEAM</div>
              <div className="text-xs text-slate-300">Grab the ball, aim at runners, eliminate them!</div>
            </div>
          </button>
        </div>

        {/* Primary Play Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <button
            onClick={handleStartTournament}
            className="group flex-1 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 px-6 py-4 font-black text-slate-950 shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all text-lg w-full"
          >
            <Play className="h-6 w-6 fill-slate-950" />
            <span>PLAY MATCH</span>
          </button>

          <button
            onClick={handleStartPractice}
            className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 px-6 py-4 font-bold text-slate-100 hover:bg-slate-700 hover:text-white active:scale-95 transition-all text-base w-full shadow-lg"
          >
            <Target className="h-5 w-5 text-amber-400" />
            <span>PRACTICE</span>
          </button>
        </div>

        {/* Secondary Navigation (Customize, Rules, Settings) */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 border border-slate-700/80 hover:bg-slate-800 transition-all hover:border-amber-400/50"
          >
            <User className="h-4 w-4 text-amber-400" />
            <span>Avatar</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 border border-slate-700/80 hover:bg-slate-800 transition-all hover:border-amber-400/50"
          >
            <BookOpen className="h-4 w-4 text-sky-400" />
            <span>Rules</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 border border-slate-700/80 hover:bg-slate-800 transition-all hover:border-amber-400/50"
          >
            <Settings className="h-4 w-4 text-emerald-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Footer copyright & credits */}
      <div className="text-center text-xs text-slate-400">
        Seven Stones 3D • React Three Fiber & Physics • Playable on Desktop & Mobile
      </div>
    </div>
  );
};
