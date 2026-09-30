import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { QuizItem, ItemResult, GameMode, QuizModule } from '../types/quiz';
import {
  GIS_COUNTIES,
  GIS_CITIES,
  MAP_VIEWBOX_WIDTH,
  MAP_VIEWBOX_HEIGHT,
  GisCounty,
  GisCity,
} from '../data/englandGisOptimized';
import { ENGLAND_COUNTIES } from '../data/englandCounties';
import { ZoomIn, ZoomOut, RotateCcw, Tag } from 'lucide-react';

interface EnglandMapProps {
  activeModule: QuizModule;
  gameMode: GameMode;
  currentTarget?: QuizItem;
  results: Record<string, ItemResult>;
  wrongClickId: string | null;
  revealedTargetId: string | null;
  isInputDisabled?: boolean;
  onSelectItem: (id: string) => void;
}

// ==========================================
// 1. MEMOIZED COUNTY POLYGON (Direct SVG Path Hit-Testing)
// ==========================================
interface CountyPolygonProps {
  county: GisCounty;
  fill: string;
  stroke: string;
  strokeWidth: string;
  isClickable: boolean;
  isRevealed: boolean;
  showLabel: boolean;
  isCitiesModule: boolean;
  isInputDisabled: boolean;
  onSelect: (id: string) => void;
  onHover: (name: string, subtitle: string, x: number, y: number) => void;
  onLeave: () => void;
}

const CountyPolygon = memo<CountyPolygonProps>(({
  county,
  fill,
  stroke,
  strokeWidth,
  isClickable,
  isRevealed,
  showLabel,
  isCitiesModule,
  isInputDisabled,
  onSelect,
  onHover,
  onLeave,
}) => {
  // Direct tap/click handler: binds strictly to this unique county ID
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClickable && !isInputDisabled) {
      onSelect(county.id);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent pointer event from bubbling to container pan drag
    e.stopPropagation();
  };

  return (
    <g>
      {/* Exact SVG path boundary with non-scaling-stroke & visiblePainted */}
      <path
        id={`county-path-${county.id}`}
        data-county-id={county.id}
        d={county.pathD}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{
          pointerEvents: isClickable ? 'visiblePainted' : 'none',
          touchAction: 'manipulation',
          vectorEffect: 'non-scaling-stroke',
          willChange: 'fill, stroke',
        }}
        className={`transition-colors duration-100 ${
          isClickable ? 'cursor-pointer active:brightness-125' : 'cursor-default'
        } ${isRevealed ? 'animate-pulse' : ''}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onMouseEnter={() => onHover(county.name, 'Ceremonial County', county.centroid[0], county.centroid[1])}
        onMouseLeave={onLeave}
      />

      {/* County Name Label */}
      {showLabel && !isCitiesModule && (
        <text
          x={county.centroid[0]}
          y={county.centroid[1] + 3.5}
          textAnchor="middle"
          pointerEvents="none"
          className="text-[8.5px] font-bold fill-white select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
        >
          {county.name}
        </text>
      )}
    </g>
  );
}, (prev, next) => {
  return (
    prev.fill === next.fill &&
    prev.stroke === next.stroke &&
    prev.strokeWidth === next.strokeWidth &&
    prev.isClickable === next.isClickable &&
    prev.isRevealed === next.isRevealed &&
    prev.showLabel === next.showLabel &&
    prev.isCitiesModule === next.isCitiesModule &&
    prev.isInputDisabled === next.isInputDisabled
  );
});

CountyPolygon.displayName = 'CountyPolygon';

// ==========================================
// 2. MEMOIZED CITY PIN (Direct Pin Hit-Testing)
// ==========================================
interface CityPinProps {
  city: GisCity;
  fill: string;
  isTarget: boolean;
  isAnswered: boolean;
  isClickable: boolean;
  showLabel: boolean;
  isInputDisabled: boolean;
  onSelect: (id: string) => void;
  onHover: (name: string, subtitle: string, x: number, y: number) => void;
  onLeave: () => void;
}

const CityPin = memo<CityPinProps>(({
  city,
  fill,
  isTarget,
  isAnswered,
  isClickable,
  showLabel,
  isInputDisabled,
  onSelect,
  onHover,
  onLeave,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClickable && !isInputDisabled) {
      onSelect(city.id);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <g
      transform={`translate(${city.x}, ${city.y})`}
      className={isClickable ? 'cursor-pointer' : 'cursor-default'}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onMouseEnter={() => onHover(city.name, `${city.countyName} (${city.region})`, city.x, city.y)}
      onMouseLeave={onLeave}
    >
      {/* Target Pulsing Beacon ring */}
      {isTarget && (
        <circle
          cx="0"
          cy="0"
          r="14"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          className="animate-ping"
          opacity="0.8"
          pointerEvents="none"
        />
      )}

      {/* Pin Shadow */}
      <circle cx="0" cy="1" r="5.5" fill="#000000" opacity="0.6" pointerEvents="none" />

      {/* Pin Body with precise hit testing */}
      <circle
        id={`city-pin-${city.id}`}
        data-city-id={city.id}
        data-is-pin="true"
        cx="0"
        cy="0"
        r="6"
        fill={fill}
        stroke="#0f172a"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        style={{
          pointerEvents: isClickable ? 'visiblePainted' : 'none',
          touchAction: 'manipulation',
          vectorEffect: 'non-scaling-stroke',
        }}
        className="transition-colors duration-100"
      />

      {/* Pin Center Dot */}
      <circle
        cx="0"
        cy="0"
        r="1.8"
        fill={isAnswered ? '#ffffff' : '#0284c7'}
        pointerEvents="none"
      />

      {/* City Label */}
      {showLabel && (
        <text
          x="8"
          y="3.5"
          pointerEvents="none"
          className="text-[9px] font-bold fill-white select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
        >
          {city.name}
        </text>
      )}
    </g>
  );
}, (prev, next) => {
  return (
    prev.fill === next.fill &&
    prev.isTarget === next.isTarget &&
    prev.isAnswered === next.isAnswered &&
    prev.isClickable === next.isClickable &&
    prev.showLabel === next.showLabel &&
    prev.isInputDisabled === next.isInputDisabled
  );
});

CityPin.displayName = 'CityPin';

// ==========================================
// 3. MAIN ENGLAND MAP (Responsive, Robust Touch Engine)
// ==========================================
export const EnglandMap: React.FC<EnglandMapProps> = memo(({
  activeModule,
  gameMode,
  currentTarget,
  results,
  wrongClickId,
  revealedTargetId,
  isInputDisabled = false,
  onSelectItem,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [hoveredItem, setHoveredItem] = useState<{ name: string; subtitle: string; x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialTouchDistanceRef = useRef<number | null>(null);

  const isCitiesModule = activeModule.category === 'cities';

  // Check if county is in active module
  const isCountyInModule = useCallback((countyId: string) => {
    if (isCitiesModule) return true;
    if (!activeModule.regionFilter) return true;
    const meta = ENGLAND_COUNTIES.find(c => c.id === countyId);
    return meta?.regionalSubset === activeModule.regionFilter;
  }, [activeModule.regionFilter, isCitiesModule]);

  // Clean reset of view
  const handleResetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.8), 3.5));
  }, []);

  // Mode or module switch: reset pan/zoom and clear any lingering pointers
  useEffect(() => {
    isDraggingRef.current = false;
    initialTouchDistanceRef.current = null;
    setHoveredItem(null);
  }, [gameMode, activeModule.id]);

  // Global safety cleanup to guarantee drag states never get trapped
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isDraggingRef.current = false;
      initialTouchDistanceRef.current = null;
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

  // Container pan drag handlers: only triggered when clicking neutral ocean background
  const handleContainerPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // Disallow drag initiation if the user tapped on a county path or city pin
    if (target.tagName.toLowerCase() === 'path' || target.getAttribute('data-is-pin') === 'true') {
      return;
    }
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleContainerPointerUp = () => {
    isDraggingRef.current = false;
  };

  // Pinch-to-zoom support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialTouchDistanceRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = (currentDist - initialTouchDistanceRef.current) * 0.006;
      setScale(prev => Math.min(Math.max(prev + diff, 0.8), 3.5));
      initialTouchDistanceRef.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistanceRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setScale(prev => Math.min(Math.max(prev + zoomDelta, 0.8), 3.5));
  };

  const handleHover = useCallback((name: string, subtitle: string, x: number, y: number) => {
    setHoveredItem({ name, subtitle, x, y });
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none"
      style={{
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerCancel={handleContainerPointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Floating Map Zoom/Reset Actions (Discreet mobile thumb pill) */}
      <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
        <button
          onClick={() => handleZoom(0.25)}
          style={{ touchAction: 'manipulation' }}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => handleZoom(-0.25)}
          style={{ touchAction: 'manipulation' }}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleResetView}
          style={{ touchAction: 'manipulation' }}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition"
          title="Reset View"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        <div className="w-full h-px bg-slate-800 my-0.5" />

        <button
          onClick={() => setShowLabels(!showLabels)}
          style={{ touchAction: 'manipulation' }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center active:scale-95 transition ${
            showLabels
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle Labels"
        >
          <Tag className="w-3 h-3" />
        </button>
      </div>

      {/* Map Viewport Frame: Maximized portrait screen real estate without overlays */}
      <div className="w-[94%] sm:w-[86%] max-w-[400px] aspect-[480/650] max-h-[88vh] flex items-center justify-center relative">
        <svg
          viewBox={`0 0 ${MAP_VIEWBOX_WIDTH} ${MAP_VIEWBOX_HEIGHT}`}
          className="w-full h-full"
          style={{
            touchAction: 'none',
          }}
        >
          <defs>
            <filter id="realmGisGlow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#020617" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background catch-rect for ocean panning only (never catches county clicks) */}
          <rect
            width={MAP_VIEWBOX_WIDTH}
            height={MAP_VIEWBOX_HEIGHT}
            fill="#020617"
            className="cursor-grab active:cursor-grabbing"
          />

          {/* Hardware-accelerated Map Group */}
          <g
            filter="url(#realmGisGlow)"
            className="gpu-layer"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            {/* North Compass Rose */}
            <g transform={`translate(${MAP_VIEWBOX_WIDTH - 40}, 50)`} opacity="0.3" pointerEvents="none">
              <circle cx="0" cy="0" r="14" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
              <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
              <polygon points="0,-12 0,0 3,-3" fill="#38bdf8" />
              <text x="0" y="-15" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">N</text>
            </g>

            {/* 1. COUNTIES LAYER (Direct SVG Path Hit Testing) */}
            {GIS_COUNTIES.map((county) => {
              const inActiveModule = isCountyInModule(county.id);
              const isRevealed = revealedTargetId === county.id;
              const isWrong = wrongClickId === county.id;
              const result = results[county.id];
              const isAnswered = !!result;
              const isClickable = !isCitiesModule && (inActiveModule || gameMode === 'learn') && !isAnswered;

              // Color determination
              let fill = '#334155';
              let stroke = inActiveModule ? '#64748b' : '#1e293b';
              let strokeWidth = inActiveModule ? '1' : '0.6';

              if (isWrong) {
                fill = '#dc2626'; // Red flash on mistake
                stroke = '#f87171';
                strokeWidth = '2';
              } else if (isRevealed) {
                // Highlight/flash the correct county in distinct Gold after 3 failed guesses
                fill = '#fbbf24';
                stroke = '#fef08a';
                strokeWidth = '2.5';
              } else if (result) {
                if (result.status === 'correct-1st') fill = '#22c55e'; // Green
                else if (result.status === 'correct-2nd') fill = '#eab308'; // Amber
                else if (result.status === 'correct-3rd') fill = '#f97316'; // Orange
                else if (result.status === 'missed') fill = '#ef4444'; // Red
                stroke = '#0f172a';
                strokeWidth = '1';
              } else if (isCitiesModule) {
                fill = '#1e293b';
              } else if (!inActiveModule) {
                fill = '#090d16';
              }

              return (
                <CountyPolygon
                  key={county.id}
                  county={county}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  isClickable={isClickable}
                  isRevealed={isRevealed}
                  showLabel={showLabels && (isAnswered || gameMode === 'learn')}
                  isCitiesModule={isCitiesModule}
                  isInputDisabled={isInputDisabled}
                  onSelect={onSelectItem}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              );
            })}

            {/* 2. CITIES LAYER */}
            {isCitiesModule && GIS_CITIES.map((city) => {
              const isTarget = currentTarget?.id === city.id;
              const isRevealed = revealedTargetId === city.id;
              const isWrong = wrongClickId === city.id;
              const result = results[city.id];
              const isAnswered = !!result;
              const isClickable = !isAnswered;

              let fill = '#f8fafc';
              if (isWrong) fill = '#dc2626';
              else if (isRevealed) fill = '#fbbf24'; // Gold on revealed target
              else if (result) {
                if (result.status === 'correct-1st') fill = '#22c55e';
                else if (result.status === 'correct-2nd') fill = '#eab308';
                else if (result.status === 'correct-3rd') fill = '#f97316';
                else if (result.status === 'missed') fill = '#ef4444';
              }

              return (
                <CityPin
                  key={city.id}
                  city={city}
                  fill={fill}
                  isTarget={isTarget}
                  isAnswered={isAnswered}
                  isClickable={isClickable}
                  showLabel={showLabels && (isAnswered || gameMode === 'learn')}
                  isInputDisabled={isInputDisabled}
                  onSelect={onSelectItem}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredItem && (
        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 shadow-xl text-xs max-w-[190px]">
          <p className="font-bold text-slate-100 truncate">{hoveredItem.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{hoveredItem.subtitle}</p>
        </div>
      )}
    </div>
  );
});

EnglandMap.displayName = 'EnglandMap';
