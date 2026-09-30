import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  QuizModuleId,
  QuizItem,
  AnswerStatus,
  ItemResult,
  GameMode,
  QuizStats,
} from '../types/quiz';
import { QUIZ_MODULES, getQuizItemsForModule } from '../data/quizModules';
import { soundEffects } from '../utils/audio';

interface HighScore {
  scorePercent: number;
  timeSeconds: number;
  date: string;
}

export function useQuizGame(initialModuleId: QuizModuleId = 'england-all') {
  const [activeModuleId, setActiveModuleId] = useState<QuizModuleId>(initialModuleId);
  const [gameMode, setGameMode] = useState<GameMode>('pin');
  const [items, setItems] = useState<QuizItem[]>([]);
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Explicit state variable for failed attempts on the current prompt (0 to 3)
  const [incorrectAttemptsCount, setIncorrectAttemptsCount] = useState<number>(0);

  // Explicit input disabled state to block rapid multi-touches during transitions
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false);

  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [wrongClickInfo, setWrongClickInfo] = useState<{ id: string; name: string } | null>(null);
  const [revealedTargetId, setRevealedTargetId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [streak, setStreak] = useState<number>(0);
  const [inspectItem, setInspectItem] = useState<QuizItem | null>(null);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<QuizItem[]>([]);

  const startTimeRef = useRef<number>(Date.now());
  const transitionTimerRef = useRef<number | null>(null);
  const wrongClickTimerRef = useRef<number | null>(null);

  // Clear all pending timeouts safely
  const clearTimers = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (wrongClickTimerRef.current !== null) {
      window.clearTimeout(wrongClickTimerRef.current);
      wrongClickTimerRef.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Reset quiz or start module
  const restartQuiz = useCallback((moduleId: QuizModuleId = activeModuleId) => {
    clearTimers();

    const moduleItems = getQuizItemsForModule(moduleId);
    setItems(moduleItems);

    // Randomize questions
    const shuffled = [...moduleItems].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
    setIncorrectAttemptsCount(0);
    setIsInputDisabled(false);
    setResults({});
    setWrongClickInfo(null);
    setRevealedTargetId(null);
    setIsCompleted(false);
    setFinalElapsedSeconds(0);
    setStreak(0);
    setInspectItem(null);

    const now = Date.now();
    startTimeRef.current = now;
    setStartTime(now);
  }, [activeModuleId, clearTimers]);

  // Handle module change
  useEffect(() => {
    restartQuiz(activeModuleId);
  }, [activeModuleId, restartQuiz]);

  // Reset lingering state when mode changes (e.g. Pin -> Explore or Explore -> Pin)
  const handleSetGameMode = useCallback((newMode: GameMode) => {
    clearTimers();
    setIsInputDisabled(false);
    setIncorrectAttemptsCount(0);
    setWrongClickInfo(null);
    setRevealedTargetId(null);
    setGameMode(newMode);
  }, [clearTimers]);

  const currentTarget: QuizItem | undefined = queue[currentIndex];

  // Generate multiple choice options when currentTarget changes in multiple-choice mode
  useEffect(() => {
    if (gameMode === 'multiple-choice' && currentTarget && items.length > 0) {
      const wrong = items
        .filter(item => item.id !== currentTarget.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const combined = [currentTarget, ...wrong].sort(() => Math.random() - 0.5);
      setMultipleChoiceOptions(combined);
    }
  }, [currentTarget, gameMode, items]);

  // Save high score
  const saveHighScore = useCallback((scorePercent: number, elapsed: number) => {
    const key = `realmquest_highscores_${activeModuleId}`;
    try {
      const existingStr = localStorage.getItem(key);
      const existing: HighScore[] = existingStr ? JSON.parse(existingStr) : [];
      const newScore: HighScore = {
        scorePercent,
        timeSeconds: elapsed,
        date: new Date().toLocaleDateString('en-GB'),
      };
      existing.push(newScore);
      existing.sort((a, b) => b.scorePercent - a.scorePercent || a.timeSeconds - b.timeSeconds);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 10)));
    } catch {
      // LocalStorage guard
    }
  }, [activeModuleId]);

  // Handle answer recording and progression
  const recordAnswer = useCallback((itemId: string, status: AnswerStatus, attempts: number) => {
    const nextResults = {
      ...results,
      [itemId]: {
        itemId,
        attempts,
        status,
      },
    };
    setResults(nextResults);

    // Check if that was the last question in the quiz
    if (currentIndex + 1 >= queue.length) {
      const elapsed = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
      setFinalElapsedSeconds(elapsed);
      setIsCompleted(true);
      soundEffects.playComplete();

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#38bdf8', '#f59e0b', '#ec4899', '#ffffff'],
        });
      } catch {
        // Safe fail
      }

      // Compute final score
      let earnedPoints = 0;
      Object.values(nextResults).forEach(r => {
        if (r.status === 'correct-1st') earnedPoints += 100;
        else if (r.status === 'correct-2nd') earnedPoints += 66;
        else if (r.status === 'correct-3rd') earnedPoints += 33;
      });
      const finalScore = Math.round(earnedPoints / (queue.length * 100) * 100);
      saveHighScore(finalScore, elapsed);
    } else {
      // Advance to next county prompt
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, queue.length, results, saveHighScore]);

  // Main selection handler with strict 3-attempt limit and transition locking
  const handleItemSelect = useCallback((selectedId: string) => {
    // 1. Guard against clicks when completed or during transition lock
    if (isCompleted || isInputDisabled) {
      return;
    }

    // 2. Handle Learn / Explore Mode
    if (gameMode === 'learn') {
      const selectedItem = items.find(i => i.id === selectedId);
      if (selectedItem) {
        setInspectItem(selectedItem);
        soundEffects.playSuccess(1);
      }
      return;
    }

    // 3. Quiz Mode Guards
    if (!currentTarget) return;
    if (results[selectedId]) return; // Already answered

    const isCorrect = selectedId === currentTarget.id;

    if (isCorrect) {
      // Correct guess!
      clearTimers();
      setWrongClickInfo(null);
      setRevealedTargetId(null);

      // Status determined by number of failed attempts
      let status: AnswerStatus = 'correct-1st';
      if (incorrectAttemptsCount === 1) status = 'correct-2nd';
      else if (incorrectAttemptsCount >= 2) status = 'correct-3rd';

      const newStreak = incorrectAttemptsCount === 0 ? streak + 1 : 0;
      setStreak(newStreak);
      soundEffects.playSuccess(newStreak);

      // Reset incorrect attempts and advance
      setIncorrectAttemptsCount(0);
      recordAnswer(currentTarget.id, status, incorrectAttemptsCount + 1);
    } else {
      // Incorrect guess! Increment strict attempt counter
      const nextIncorrect = incorrectAttemptsCount + 1;
      setIncorrectAttemptsCount(nextIncorrect);
      setStreak(0);

      const wrongItem = items.find(i => i.id === selectedId);
      if (wrongItem) {
        setWrongClickInfo({ id: wrongItem.id, name: wrongItem.name });
      }

      // Check if maximum 3 failed attempts reached
      if (nextIncorrect >= 3) {
        // STRICT 3-ATTEMPT ENFORCEMENT:
        // 1. Disable user inputs immediately to prevent double-counting rapid taps
        setIsInputDisabled(true);

        // 2. Highlight/flash the correct county in distinct gold/beacon
        setRevealedTargetId(currentTarget.id);
        soundEffects.playFail();

        // 3. Clear mistake message after short duration
        if (wrongClickTimerRef.current !== null) {
          window.clearTimeout(wrongClickTimerRef.current);
        }
        wrongClickTimerRef.current = window.setTimeout(() => {
          setWrongClickInfo(null);
        }, 1200);

        // 4. Automatically advance after exactly 1.5 seconds (1500ms)
        if (transitionTimerRef.current !== null) {
          window.clearTimeout(transitionTimerRef.current);
        }
        transitionTimerRef.current = window.setTimeout(() => {
          // Mark prompt as missed (0 score for this item)
          recordAnswer(currentTarget.id, 'missed', 3);

          // Reset incorrect attempts to 0
          setIncorrectAttemptsCount(0);

          // Clear highlight and mistake info
          setRevealedTargetId(null);
          setWrongClickInfo(null);

          // Re-enable inputs for the next county
          setIsInputDisabled(false);
          transitionTimerRef.current = null;
        }, 1500);
      } else {
        // Less than 3 incorrect attempts: allow next guess
        soundEffects.playMistake();
        if (wrongClickTimerRef.current !== null) {
          window.clearTimeout(wrongClickTimerRef.current);
        }
        wrongClickTimerRef.current = window.setTimeout(() => {
          setWrongClickInfo(null);
        }, 1200);
      }
    }
  }, [
    isCompleted,
    isInputDisabled,
    gameMode,
    currentTarget,
    results,
    items,
    incorrectAttemptsCount,
    streak,
    clearTimers,
    recordAnswer,
  ]);

  // Compute stats on-demand
  const computeStats = useCallback((): QuizStats => {
    let earnedPoints = 0;
    let firstTry = 0;
    let secondTry = 0;
    let thirdTry = 0;
    let missed = 0;

    Object.values(results).forEach(r => {
      if (r.status === 'correct-1st') {
        earnedPoints += 100;
        firstTry++;
      } else if (r.status === 'correct-2nd') {
        earnedPoints += 66;
        secondTry++;
      } else if (r.status === 'correct-3rd') {
        earnedPoints += 33;
        thirdTry++;
      } else if (r.status === 'missed') {
        missed++;
      }
    });

    const answeredCount = Object.keys(results).length;
    const scorePercent = answeredCount === 0 ? 100 : Math.round(earnedPoints / (answeredCount * 100) * 100);

    return {
      scorePercent,
      elapsedSeconds: isCompleted ? finalElapsedSeconds : Math.floor((Date.now() - startTimeRef.current) / 1000),
      firstTryCount: firstTry,
      secondTryCount: secondTry,
      thirdTryCount: thirdTry,
      missedCount: missed,
      totalQuestions: queue.length,
    };
  }, [queue.length, results, isCompleted, finalElapsedSeconds]);

  const getBestScore = useCallback((): HighScore | null => {
    const key = `realmquest_highscores_${activeModuleId}`;
    try {
      const existingStr = localStorage.getItem(key);
      if (!existingStr) return null;
      const scores: HighScore[] = JSON.parse(existingStr);
      return scores[0] || null;
    } catch {
      return null;
    }
  }, [activeModuleId]);

  return {
    activeModuleId,
    setActiveModuleId,
    activeModule: QUIZ_MODULES.find(m => m.id === activeModuleId)!,
    gameMode,
    setGameMode: handleSetGameMode,
    items,
    currentTarget,
    currentIndex,
    totalQuestions: queue.length,
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
    stats: computeStats(),
    bestScore: getBestScore(),
  };
}
