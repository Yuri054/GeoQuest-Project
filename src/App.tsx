/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuizGame } from './hooks/useQuizGame';
import { TopBar } from './components/TopBar';
import { QuizPromptHeader } from './components/QuizPromptHeader';
import { EnglandMap } from './components/EnglandMap';
import { GameMenuDrawer } from './components/GameMenuDrawer';
import { QuizResultsModal } from './components/QuizResultsModal';
import { LearnDetailsModal } from './components/LearnDetailsModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { QUIZ_MODULES } from './data/quizModules';

export default function App() {
  const {
    activeModuleId,
    setActiveModuleId,
    activeModule,
    gameMode,
    setGameMode,
    currentTarget,
    currentIndex,
    totalQuestions,
    incorrectAttemptsCount,
    isInputDisabled,
    results,
    wrongClickInfo,
    revealedTargetId,
    isCompleted,
    startTime,
    streak,
    inspectItem,
    setInspectItem,
    multipleChoiceOptions,
    handleItemSelect,
    restartQuiz,
    stats,
    bestScore,
  } = useQuizGame('england-all');

  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);

  // Advance to next module on quiz results modal
  const handleNextModule = () => {
    const currentIndex = QUIZ_MODULES.findIndex(m => m.id === activeModuleId);
    const nextIndex = (currentIndex + 1) % QUIZ_MODULES.length;
    const nextModule = QUIZ_MODULES[nextIndex];
    setActiveModuleId(nextModule.id);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950 flex justify-center items-stretch overflow-hidden select-none">
      {/* Forced Portrait Mobile Single-Column Container (Fits 9:16 portrait phones natively) */}
      <div className="w-full max-w-[430px] h-full flex flex-col bg-slate-950 overflow-hidden relative shadow-2xl border-x border-slate-900/60">
        {/* 1. Ultra-Compact Top Bar (~40px) */}
        <TopBar
          activeModule={activeModule}
          scorePercent={stats.scorePercent}
          startTime={startTime}
          isCompleted={isCompleted}
          onOpenMenu={() => setIsMenuDrawerOpen(true)}
        />

        {/* 2. Compact Target HUD Banner with Strict 3-Attempt Counter (~34px) */}
        <QuizPromptHeader
          currentTarget={currentTarget}
          gameMode={gameMode}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          incorrectAttemptsCount={incorrectAttemptsCount}
          wrongClickInfo={wrongClickInfo}
          revealedTargetId={revealedTargetId}
          streak={streak}
          multipleChoiceOptions={multipleChoiceOptions}
          onSelectOption={handleItemSelect}
        />

        {/* 3. Maximized High-Priority Vector Map Canvas (>85% vertical real estate) */}
        <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
          <EnglandMap
            key={`${activeModuleId}-${gameMode}`}
            activeModule={activeModule}
            gameMode={gameMode}
            currentTarget={currentTarget}
            results={results}
            wrongClickId={wrongClickInfo?.id || null}
            revealedTargetId={revealedTargetId}
            isInputDisabled={isInputDisabled}
            onSelectItem={handleItemSelect}
          />
        </main>

        {/* 4. Collapsible Drawer Menu */}
        <GameMenuDrawer
          isOpen={isMenuDrawerOpen}
          onClose={() => setIsMenuDrawerOpen(false)}
          activeModuleId={activeModuleId}
          onSelectModule={(id) => setActiveModuleId(id)}
          gameMode={gameMode}
          onSelectGameMode={setGameMode}
          onRestartQuiz={() => restartQuiz(activeModuleId)}
          onOpenApkGuide={() => setIsApkGuideOpen(true)}
          bestScore={bestScore}
        />

        {/* 5. Modals & Overlays */}
        {isCompleted && (
          <QuizResultsModal
            stats={stats}
            module={activeModule}
            onPlayAgain={() => restartQuiz(activeModuleId)}
            onNextModule={handleNextModule}
            onClose={() => restartQuiz(activeModuleId)}
          />
        )}

        {inspectItem && (
          <LearnDetailsModal
            item={inspectItem}
            onClose={() => setInspectItem(null)}
          />
        )}

        <ApkGuideModal
          isOpen={isApkGuideOpen}
          onClose={() => setIsApkGuideOpen(false)}
        />

        {/* 6. Offline Connectivity Toast */}
        <OfflineIndicator />
      </div>
    </div>
  );
}
