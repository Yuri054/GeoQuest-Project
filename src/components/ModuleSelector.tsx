import React from 'react';
import { QuizModuleId } from '../types/quiz';
import { QUIZ_MODULES } from '../data/quizModules';
import { Map, MapPin } from 'lucide-react';

interface ModuleSelectorProps {
  activeModuleId: QuizModuleId;
  onSelectModule: (id: QuizModuleId) => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  activeModuleId,
  onSelectModule,
}) => {
  return (
    <div
      className="bg-slate-950 border-b border-slate-800/80 py-1.5 px-2.5 select-none shrink-0 overflow-x-auto no-scrollbar"
      style={{
        touchAction: 'pan-x',
        overscrollBehaviorX: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex items-center gap-1.5 min-w-max">
        {QUIZ_MODULES.map((module) => {
          const isActive = module.id === activeModuleId;
          const isCity = module.category === 'cities';

          return (
            <button
              key={module.id}
              onPointerDown={(e) => {
                e.preventDefault();
                onSelectModule(module.id);
              }}
              style={{ touchAction: 'manipulation' }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap active:scale-95 ${
                isActive
                  ? isCity
                    ? 'bg-amber-600 text-white font-semibold shadow-xs'
                    : 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {isCity ? (
                <MapPin className={`w-3 h-3 ${isActive ? 'text-white' : 'text-amber-400'}`} />
              ) : (
                <Map className={`w-3 h-3 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
              )}
              <span>{module.title}</span>
              <span className="text-[9.5px] tabular-nums font-mono opacity-75">
                ({module.itemCount})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
