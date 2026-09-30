import React from 'react';
import { Volume2, VolumeX, Menu, Shield, ChevronDown } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { QuizModule } from '../types/quiz';
import { TimerDisplay } from './TimerDisplay';

interface TopBarProps {
  activeModule: QuizModule;
  scorePercent: number;
  startTime: number;
  isCompleted: boolean;
  onOpenMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeModule,
  scorePercent,
  startTime,
  isCompleted,
  onOpenMenu,
}) => {
  const [muted, setMuted] = React.useState(soundEffects.getMuted());

  const handleToggleMute = () => {
    const nextMuted = soundEffects.toggleMute();
    setMuted(nextMuted);
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 pt-[env(safe-area-inset-top,0px)] pb-1.5 h-11 flex items-center justify-between z-30 select-none shrink-0 gap-2">
      {/* Zone 1: RealmQuest Brand & Active Module Switcher trigger */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex items-center gap-1 shrink-0">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-black tracking-wider text-white uppercase">
            RealmQuest
          </span>
        </div>

        {/* Clickable Module Pill */}
        <button
          onClick={onOpenMenu}
          style={{ touchAction: 'manipulation' }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 text-[10.5px] font-semibold text-slate-300 max-w-[125px] sm:max-w-[170px] truncate transition active:scale-95"
          title="Switch quiz module or mode"
        >
          <span className="truncate">{activeModule.title}</span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Zone 2: Mini HUD Stats (Score & Live Stopwatch) */}
      <div className="hidden min-[380px]:flex items-center gap-2 text-[11px] bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
        <div className="flex items-center gap-1 font-mono font-bold tabular-nums">
          <span className={`text-[10px] ${
            scorePercent >= 80 ? 'text-emerald-400' : scorePercent >= 60 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {scorePercent}%
          </span>
        </div>
        <span className="text-slate-700">·</span>
        <TimerDisplay startTime={startTime} isRunning={!isCompleted} />
      </div>

      {/* Zone 3: Audio & Menu Drawer Trigger */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleToggleMute}
          style={{ touchAction: 'manipulation' }}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 transition"
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {muted ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>

        <button
          onClick={onOpenMenu}
          style={{ touchAction: 'manipulation' }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition active:scale-95"
          title="Open Menu"
        >
          <Menu className="w-3.5 h-3.5" />
          <span className="hidden min-[340px]:inline">Menu</span>
        </button>
      </div>
    </header>
  );
};
