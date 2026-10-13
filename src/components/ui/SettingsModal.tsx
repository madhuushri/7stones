import React from 'react';
import { useGameStore } from '../../state/useGameStore';
import { AIDifficulty } from '../../types/game';
import { X, Sliders, Volume2, Shield, Clock, Heart, Zap } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useGameStore();

  const handleDifficulty = (diff: AIDifficulty) => {
    updateSettings({ difficulty: diff });
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateSettings({ audioVolume: val });
    soundManager.setVolume(val, settings.musicVolume);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="flex h-full max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Game Settings</h2>
              <p className="text-xs text-slate-400">Match rules & gameplay preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* AI Difficulty */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>AI Opponents & Teammates Difficulty</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficulty(d)}
                  className={`rounded-xl py-3 font-bold text-xs uppercase tracking-wider transition-all border ${
                    settings.difficulty === d
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {settings.difficulty === 'easy' && 'Easy: Slower AI, relaxed throw aim, ideal for beginners.'}
              {settings.difficulty === 'normal' && 'Normal: Balanced team coordination, realistic stone delivery.'}
              {settings.difficulty === 'hard' && 'Hard: Agile dodging, fast sprints, accurate lead-target throws!'}
            </p>
          </div>

          {/* Round Duration */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-400" />
                <span>Round Duration</span>
              </span>
              <span className="text-amber-400 font-mono">{settings.roundDuration} seconds</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[60, 90, 120].map((dur) => (
                <button
                  key={dur}
                  onClick={() => updateSettings({ roundDuration: dur })}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all border ${
                    settings.roundDuration === dur
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Runner Lives */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <span>Runner Lives before Elimination</span>
              </span>
              <span className="text-rose-400 font-mono">{settings.runnerLives} Lives</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((l) => (
                <button
                  key={l}
                  onClick={() => updateSettings({ runnerLives: l })}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all border ${
                    settings.runnerLives === l
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400 font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {l} {l === 1 ? 'Life' : 'Lives'}
                </button>
              ))}
            </div>
          </div>

          {/* Safe Zones Toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="font-bold text-white text-xs uppercase tracking-wider">Corner Safe Zones</div>
                <div className="text-[11px] text-slate-400">Green circular zones protect runners from tag-outs</div>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ safeZonesEnabled: !settings.safeZonesEnabled })}
              className={`h-7 w-12 rounded-full p-1 transition-colors ${
                settings.safeZonesEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition-transform ${
                  settings.safeZonesEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Audio Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span>Sound Effects Volume</span>
              </span>
              <span className="font-mono text-amber-400">{Math.round(settings.audioVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.audioVolume}
              onChange={handleAudioChange}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Camera Sensitivity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Camera Mouse / Touch Sensitivity</span>
              <span className="font-mono text-amber-400">{settings.cameraSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.cameraSensitivity}
              onChange={(e) => updateSettings({ cameraSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-amber-400 transition-all text-xs uppercase tracking-wider"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
