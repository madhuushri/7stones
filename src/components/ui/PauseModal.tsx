import React from 'react';
import { useGameStore } from '../../state/useGameStore';
import { Play, RotateCcw, Home, BookOpen } from 'lucide-react';

interface PauseModalProps {
  onOpenTutorial: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onOpenTutorial }) => {
  const { resumeMatch, resetRound, returnToMenu, score } = useGameStore();

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl bg-slate-900 p-6 border border-slate-700 shadow-2xl text-center space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">Game Paused</h2>
          <p className="text-xs text-slate-400 mt-1">Round {score.currentRound} of {score.maxRounds}</p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            onClick={resumeMatch}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 font-black text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg"
          >
            <Play className="h-5 w-5 fill-slate-950" />
            <span>RESUME MATCH</span>
          </button>

          <button
            onClick={resetRound}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3 font-bold text-slate-200 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <RotateCcw className="h-4 w-4 text-amber-400" />
            <span>RESTART ROUND</span>
          </button>

          <button
            onClick={onOpenTutorial}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3 font-bold text-slate-200 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <BookOpen className="h-4 w-4 text-sky-400" />
            <span>VIEW RULES</span>
          </button>

          <button
            onClick={returnToMenu}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-950/40 py-3 font-bold text-rose-300 border border-rose-900/50 hover:bg-rose-900/60 active:scale-95 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
