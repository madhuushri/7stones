import React from 'react';
import { useGameStore } from '../../state/useGameStore';
import { Trophy, RotateCcw, Home, ArrowRight, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

export const GameOverModal: React.FC = () => {
  const {
    phase,
    score,
    stones,
    players,
    humanTeam,
    resetRound,
    startMatch,
    returnToMenu,
  } = useGameStore();

  if (phase !== 'lagori' && phase !== 'eliminated' && phase !== 'time_up') {
    return null;
  }

  const isRunnerVictory = phase === 'lagori';
  const userWon = (isRunnerVictory && humanTeam === 'runners') || (!isRunnerVictory && humanTeam === 'seekers');
  const stackedCount = stones.filter((s) => s.isStacked).length;
  const remainingRunners = players.filter((p) => p.team === 'runners' && !p.isEliminated).length;

  const handleNextRound = () => {
    useGameStore.setState((state) => ({
      score: {
        ...state.score,
        currentRound: state.score.currentRound + 1,
      },
    }));
    resetRound();
  };

  const handleRestartMatch = () => {
    startMatch();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl bg-slate-900 p-8 border border-slate-700/80 shadow-2xl text-center space-y-6">
        {/* Victory Icon / Banner */}
        <div className="relative">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl ${
              userWon
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950'
                : 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white'
            }`}
          >
            <Trophy className="h-10 w-10 animate-bounce" />
          </div>
          {userWon && (
            <Sparkles className="absolute -top-2 -right-2 h-7 w-7 text-yellow-300 animate-spin" />
          )}
        </div>

        {/* Title */}
        <div>
          <span
            className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border ${
              isRunnerVictory
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
            }`}
          >
            {isRunnerVictory ? 'LAGORI! STACK REBUILT' : phase === 'eliminated' ? 'ALL RUNNERS ELIMINATED' : 'ROUND TIME EXPIRED'}
          </span>

          <h2 className="mt-3 text-3xl font-black text-white">
            {userWon ? 'ROUND VICTORY!' : 'ROUND DEFEAT'}
          </h2>

          <p className="mt-1 text-sm text-slate-300">
            {isRunnerVictory
              ? 'The Runners successfully placed all 7 stones back in order!'
              : phase === 'eliminated'
              ? 'The Seekers tagged out all opposing runners with the ball!'
              : 'The Seekers defended the stone stack until time ran out!'}
          </p>
        </div>

        {/* Round Statistics Card */}
        <div className="grid grid-cols-2 gap-3 w-full rounded-2xl bg-slate-950/80 p-4 border border-slate-800 text-left">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Stones Rebuilt
            </span>
            <div className="text-xl font-black text-amber-400">
              {stackedCount} / 7
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Runners
            </span>
            <div className="text-xl font-black text-emerald-400">
              {remainingRunners}
            </div>
          </div>
          <div className="space-y-0.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Runners Total
            </span>
            <div className="text-base font-black text-amber-300">
              {score.runnersScore} Rounds
            </div>
          </div>
          <div className="space-y-0.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Seekers Total
            </span>
            <div className="text-base font-black text-sky-300">
              {score.seekersScore} Rounds
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3">
          {score.currentRound < score.maxRounds ? (
            <button
              onClick={handleNextRound}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3.5 font-black text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg text-base"
            >
              <span>NEXT ROUND ({score.currentRound + 1}/{score.maxRounds})</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleRestartMatch}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3.5 font-black text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg text-base"
            >
              <RotateCcw className="h-5 w-5" />
              <span>PLAY NEW MATCH</span>
            </button>
          )}

          <button
            onClick={returnToMenu}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-3 font-bold text-slate-200 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>RETURN TO MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
