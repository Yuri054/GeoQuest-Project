import React from 'react';
import {
  X,
  Compass,
  HelpCircle,
  CheckSquare,
  Volume2,
  VolumeX,
  Smartphone,
  RotateCcw,
  Trophy,
  MapPin,
  Map,
  Shield,
} from 'lucide-react';
import { QuizModuleId, GameMode } from '../types/quiz';
import { QUIZ_MODULES } from '../data/quizModules';
import { soundEffects } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface GameMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeModuleId: QuizModuleId;
  onSelectModule: (id: QuizModuleId) => void;
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  onRestartQuiz: () => void;
  onOpenApkGuide: () => void;
  bestScore: { scorePercent: number; timeSeconds: number; date: string } | null;
}

export const GameMenuDrawer: React.FC<GameMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeModuleId,
  onSelectModule,
  gameMode,
  onSelectGameMode,
  onRestartQuiz,
  onOpenApkGuide,
  bestScore,
}) => {
  const [muted, setMuted] = React.useState(soundEffects.getMuted());

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const next = soundEffects.toggleMute();
    setMuted(next);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const r = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer content card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-left z-10">
        {/* Drag handle on mobile */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">RealmQuest</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  England
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Map Quiz &amp; Regional Explorer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ touchAction: 'manipulation' }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 py-3 text-xs pr-1">
          {/* Best Score Banner if available */}
          {bestScore && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white text-[11.5px]">Personal Best</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-400 font-bold">{bestScore.scorePercent}%</span>
                <span className="text-slate-500">·</span>
                <span>{formatTime(bestScore.timeSeconds)}</span>
              </div>
            </div>
          )}

          {/* Section 1: Game Modes */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Game Mode
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  onSelectGameMode('pin');
                  onClose();
                }}
                style={{ touchAction: 'manipulation' }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition ${
                  gameMode === 'pin'
                    ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className={`w-4 h-4 ${gameMode === 'pin' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="font-bold text-[11px]">Pin Quiz</span>
                <span className="text-[9.5px] text-slate-400">Tap to locate</span>
              </button>

              <button
                onClick={() => {
                  onSelectGameMode('learn');
                  onClose();
                }}
                style={{ touchAction: 'manipulation' }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition ${
                  gameMode === 'learn'
                    ? 'bg-sky-600/20 border-sky-500/60 text-sky-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className={`w-4 h-4 ${gameMode === 'learn' ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="font-bold text-[11px]">Explore</span>
                <span className="text-[9.5px] text-slate-400">Study trivia</span>
              </button>

              <button
                onClick={() => {
                  onSelectGameMode('multiple-choice');
                  onClose();
                }}
                style={{ touchAction: 'manipulation' }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition ${
                  gameMode === 'multiple-choice'
                    ? 'bg-amber-600/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className={`w-4 h-4 ${gameMode === 'multiple-choice' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="font-bold text-[11px]">Options</span>
                <span className="text-[9.5px] text-slate-400">4 choices</span>
              </button>
            </div>
          </div>

          {/* Section 2: Quiz Modules */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Quiz Module
            </span>
            <div className="space-y-1">
              {QUIZ_MODULES.map((module) => {
                const isActive = module.id === activeModuleId;
                const isCity = module.category === 'cities';

                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      onSelectModule(module.id);
                      onClose();
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      isActive
                        ? isCity
                          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                          : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCity ? (
                        <MapPin className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      ) : (
                        <Map className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{module.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{module.subtitle}</p>
                      </div>
                    </div>

                    <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 tabular-nums shrink-0 ml-2">
                      {module.itemCount} items
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Actions & Controls */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleMute}
                style={{ touchAction: 'manipulation' }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold transition active:scale-98"
              >
                {muted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Sound On</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onRestartQuiz();
                  onClose();
                }}
                style={{ touchAction: 'manipulation' }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold transition active:scale-98"
              >
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span>Restart</span>
              </button>
            </div>

            <button
              onClick={() => {
                onOpenApkGuide();
                onClose();
              }}
              style={{ touchAction: 'manipulation' }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold transition active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>Android APK Build &amp; Export Guide</span>
            </button>

            <div className="flex justify-center pt-1">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
