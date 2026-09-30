import React from 'react';
import { QuizStats, QuizModule } from '../types/quiz';
import { Trophy, Clock, CheckCircle2, RotateCcw, ArrowRight, Share2, Check } from 'lucide-react';

interface QuizResultsModalProps {
  stats: QuizStats;
  module: QuizModule;
  onPlayAgain: () => void;
  onNextModule: () => void;
  onClose: () => void;
}

export const QuizResultsModal: React.FC<QuizResultsModalProps> = ({
  stats,
  module,
  onPlayAgain,
  onNextModule,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    const text = `🎯 RealmQuest: England Map Quiz\nModule: ${module.title}\nScore: ${stats.scorePercent}%\nTime: ${formatTime(stats.elapsedSeconds)}\nCan you beat my geography score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Trophy Header */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Quiz Completed!</h3>
        <p className="text-xs text-slate-400 mt-1">{module.title} · {module.subtitle}</p>

        {/* Big Score Card */}
        <div className="my-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-around">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Score</span>
            <span className={`text-4xl font-extrabold font-mono tabular-nums ${
              stats.scorePercent >= 90 ? 'text-emerald-400' : stats.scorePercent >= 70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {stats.scorePercent}%
            </span>
          </div>

          <div className="w-px h-10 bg-slate-800" />

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">Time</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-200 flex items-center gap-1.5 justify-center">
              <Clock className="w-4 h-4 text-slate-400" />
              {formatTime(stats.elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Seterra Attempt Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-left mb-6 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-emerald-900/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mb-1"></span>
            <p className="text-[10px] text-slate-400 font-medium">1st Try</p>
            <p className="font-bold text-slate-100 font-mono text-sm">{stats.firstTryCount}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-amber-900/40">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mb-1"></span>
            <p className="text-[10px] text-slate-400 font-medium">2nd Try</p>
            <p className="font-bold text-slate-100 font-mono text-sm">{stats.secondTryCount}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-orange-900/40">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block mb-1"></span>
            <p className="text-[10px] text-slate-400 font-medium">3rd Try</p>
            <p className="font-bold text-slate-100 font-mono text-sm">{stats.thirdTryCount}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-rose-900/40">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mb-1"></span>
            <p className="text-[10px] text-slate-400 font-medium">Missed</p>
            <p className="font-bold text-slate-100 font-mono text-sm">{stats.missedCount}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            style={{ touchAction: 'manipulation' }}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-98 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onNextModule}
            style={{ touchAction: 'manipulation' }}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-98 transition"
          >
            <span>Next Quiz Module</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={handleShare}
              style={{ touchAction: 'manipulation' }}
              className="h-9 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share Score'}</span>
            </button>

            <button
              onClick={onClose}
              style={{ touchAction: 'manipulation' }}
              className="h-9 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Inspect Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
