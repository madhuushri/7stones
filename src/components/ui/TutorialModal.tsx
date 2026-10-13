import React, { useState } from 'react';
import { X, Layers, Target, Shield, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'rules' | 'runners' | 'seekers' | 'controls'>('rules');

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="flex h-full max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">How to Play Seven Stones (Lagori)</h2>
              <p className="text-xs text-slate-400">Traditional Indian street & playground sport rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-2 bg-slate-950/40">
          <button
            onClick={() => setTab('rules')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              tab === 'rules'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab('runners')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              tab === 'runners'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Runners Guide
          </button>
          <button
            onClick={() => setTab('seekers')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              tab === 'seekers'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Seekers Guide
          </button>
          <button
            onClick={() => setTab('controls')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              tab === 'controls'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Controls
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {tab === 'rules' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
                <h3 className="font-bold text-amber-300 mb-1">What is Seven Stones (Lagori / Pitthu)?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Seven Stones is one of India's most beloved traditional sports played outdoors. A tower of 7 flat stones is placed in the center circle. Two teams of equal players compete: Runners and Seekers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">Step 1: The Throw</div>
                  <p className="text-xs text-slate-400">
                    A Runner hurls the ball from behind the throwing crease to knock over the 7 stones!
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">Step 2: The Chaos</div>
                  <p className="text-xs text-slate-400">
                    The stones scatter! Seekers chase down the ball while Runners rush to pick up scattered stones.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">Step 3: Lagori!</div>
                  <p className="text-xs text-slate-400">
                    Runners rebuild the tower from bottom to top. Placing the 7th stone wins the round!
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'runners' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
                <h3 className="font-bold text-amber-300 text-base mb-1">Runner Strategy</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your goal is to reconstruct the 7 stones in the center pedestal without getting hit by the ball!
                </p>
              </div>

              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">1</span>
                  <div>
                    <strong className="text-white">Knock Down the Stones:</strong> Aim with the trajectory arc and release with sufficient power to topple the stones.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">2</span>
                  <div>
                    <strong className="text-white">Pick Up Scattered Stones:</strong> Approach any fallen stone and press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">E</kbd> to pick it up.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">3</span>
                  <div>
                    <strong className="text-white">Deposit at Center:</strong> Run inside the white center circle and press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">E</kbd> to stack the stone.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">4</span>
                  <div>
                    <strong className="text-white">Safe Zones:</strong> Use the marked green corner circles to take shelter when a seeker is aiming at you!
                  </div>
                </li>
              </ul>
            </div>
          )}

          {tab === 'seekers' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-sky-500/10 p-4 border border-sky-500/20">
                <h3 className="font-bold text-sky-300 text-base mb-1">Seeker Strategy</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your goal is to hunt down the ball and hit active runners with it before they can complete the stone stack!
                </p>
              </div>

              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">1</span>
                  <div>
                    <strong className="text-white">Retrieve the Ball:</strong> Sprint to where the ball rolled and press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-400 font-mono">E</kbd> to scoop it up.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">2</span>
                  <div>
                    <strong className="text-white">Target High Priority Runners:</strong> Prioritize runners who are carrying stones or running toward the center pedestal!
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">3</span>
                  <div>
                    <strong className="text-white">Aim with Lead:</strong> Hold <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-400 font-mono">LMB</kbd> to charge throw power. Aim slightly ahead of their movement path!
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">4</span>
                  <div>
                    <strong className="text-white">Tag Out:</strong> Hitting a runner drops their stone and removes 1 life. Eliminating all runners wins the round!
                  </div>
                </li>
              </ul>
            </div>
          )}

          {tab === 'controls' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Desktop Controls */}
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Desktop Keyboard & Mouse</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">WASD / Arrow Keys</span>
                      <span className="font-semibold text-white">Move Avatar</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Mouse Drag / Move</span>
                      <span className="font-semibold text-white">Look & Aim Camera</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Left Click (Hold & Release)</span>
                      <span className="font-semibold text-white">Charge & Throw Ball</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">E Key</span>
                      <span className="font-semibold text-white">Interact / Pick / Place Stone</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Spacebar</span>
                      <span className="font-semibold text-white">Jump</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Left Shift</span>
                      <span className="font-semibold text-white">Sprint Fast</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Escape (Esc)</span>
                      <span className="font-semibold text-white">Pause Menu</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Touch Controls */}
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 text-xs uppercase tracking-wider">Mobile Touch Controls</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Left Screen Joystick</span>
                      <span className="font-semibold text-white">Smooth 360° Movement</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Swipe Screen</span>
                      <span className="font-semibold text-white">Rotate Camera View</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Throw Button (Hold)</span>
                      <span className="font-semibold text-white">Charge Power Meter & Throw</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Interact [E] Button</span>
                      <span className="font-semibold text-white">Pick up Stone / Rebuild</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Jump Button</span>
                      <span className="font-semibold text-white">Jump Obstacles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-amber-400 transition-all text-xs uppercase tracking-wider"
          >
            Got It! Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
