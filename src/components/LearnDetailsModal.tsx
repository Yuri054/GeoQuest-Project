import React from 'react';
import { QuizItem, CountyData, CityData } from '../types/quiz';
import { X, MapPin, Users, Info, Building2 } from 'lucide-react';

interface LearnDetailsModalProps {
  item: QuizItem | null;
  onClose: () => void;
}

export const LearnDetailsModal: React.FC<LearnDetailsModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isCity = item.type === 'city';
  const countyData = !isCity ? (item.data as CountyData) : null;
  const cityData = isCity ? (item.data as CityData) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-left">
        {/* Mobile handle indicator */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-sky-400">
                {isCity ? 'City in England' : 'Ceremonial County'}
              </span>
              <h3 className="text-xl font-bold text-white">{item.name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isCity ? 'Ceremonial County' : 'County Town'}</span>
            </div>
            <p className="text-sm font-semibold text-slate-100">
              {isCity ? cityData?.countyName : countyData?.countyTown}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Population</span>
            </div>
            <p className="text-sm font-semibold text-slate-100 font-mono">
              {isCity ? cityData?.population : countyData?.population}
            </p>
          </div>
        </div>

        {/* Details & Trivia */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 mb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Key History &amp; Geography</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
            {isCity ? cityData?.famousFor : countyData?.funFact}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>Region: {item.data.region}</span>
            {!isCity && countyData && (
              <>
                <span>·</span>
                <span>Area: {countyData.areaSqKm.toLocaleString()} km²</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
        >
          Back to Map
        </button>
      </div>
    </div>
  );
};
