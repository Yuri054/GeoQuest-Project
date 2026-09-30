import React from 'react';
import { QuizItem, GameMode } from '../types/quiz';
import { Target, AlertTriangle, Flame, Sparkles } from 'lucide-react';

interface QuizPromptHeaderProps {
  currentTarget?: QuizItem;
  gameMode: GameMode;
  currentIndex: number;
  totalQuestions: number;
  incorrectAttemptsCount: number;
  wrongClickInfo: { id: string; name: string } | null;
  revealedTargetId: string | null;
  streak?: number;
  multipleChoiceOptions?: QuizItem[];
  onSelectOption?: (id: string) => void;
}

export const QuizPromptHeader: React.FC<QuizPromptHeaderProps> = ({
  currentTarget,
  gameMode,
  currentIndex,
  totalQuestions,
  incorrectAttemptsCount,
  wrongClickInfo,
  revealedTargetId,
  streak = 0,
  multipleChoiceOptions = [],
  onSelectOption,
}) => {
  if (gameMode === 'learn') {
    return (
      <div className="bg-slate-900/95 border-b border-slate-800/80 px-3 py-1.5 shrink-0 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            <p className="text-[11px] font-bold text-slate-200">
              Explore Mode: <span className="font-normal text-slate-400">Tap any county or city outline to view trivia</span>
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
            {totalQuestions} Total
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/80 px-2.5 py-1.5 shrink-0 select-none">
      <div className="flex items-center justify-between gap-1.5">
        {/* Left: Target Prompt with Icon */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Target className="w-3 h-3 text-emerald-400" />
          </div>

          <div className="min-w-0 flex items-baseline gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">
              {currentTarget?.type === 'city' ? 'City:' : 'Tap:'}
            </span>
            <h2 className="text-sm font-extrabold text-white tracking-tight truncate drop-shadow-xs">
              {currentTarget?.name || 'Loading...'}
            </h2>
          </div>
        </div>

        {/* Right: Streak, Strict Attempt Pips (Max 3), and Progress */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Streak indicator */}
          {streak >= 2 && (
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded border border-amber-800/50">
              <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span>{streak}</span>
            </div>
          )}

          {/* Strict 3 Attempts Indicator / Revealed badge */}
          {revealedTargetId ? (
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/60 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>Revealed!</span>
            </span>
          ) : (
            <div
              className="flex items-center gap-1 bg-slate-950/80 px-1.5 py-1 rounded border border-slate-800/80"
              title={`${3 - incorrectAttemptsCount} attempts remaining`}
            >
              {[0, 1, 2].map((idx) => {
                const isFailed = idx < incorrectAttemptsCount;
                return (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isFailed
                        ? 'bg-rose-500 ring-1 ring-rose-500/40'
                        : 'bg-emerald-400'
                    }`}
                  />
                );
              })}
            </div>
          )}

          {/* Item Progress counter */}
          <span className="font-mono text-[10.5px] text-slate-400 tabular-nums">
            {Math.min(currentIndex + 1, totalQuestions)}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Mistake Alert Banner */}
      {wrongClickInfo && !revealedTargetId && (
        <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/90 border border-rose-700/80 text-rose-200 text-[10.5px] font-medium shadow-xs animate-bounce">
          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="truncate">
            That was <strong>{wrongClickInfo.name}</strong>! ({3 - incorrectAttemptsCount} tries left)
          </span>
        </div>
      )}

      {/* Multiple Choice Mode Option Buttons */}
      {gameMode === 'multiple-choice' && multipleChoiceOptions.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 pt-1.5">
          {multipleChoiceOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectOption && onSelectOption(opt.id)}
              style={{ touchAction: 'manipulation' }}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 font-semibold text-xs border border-slate-700 text-center truncate shadow-xs transition"
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
