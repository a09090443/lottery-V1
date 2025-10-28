'use client';

/**
 * Draw Context
 * 抽獎狀態管理 Context
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { Prize, Participant, DrawingResult, ParticipantDisplayData } from '@/types';

/**
 * 抽獎狀態
 */
export type DrawingState =
  | 'idle' // 閒置，等待選擇獎項
  | 'prize_selected' // 已選擇獎項，等待開始抽獎
  | 'animating' // 動畫播放中
  | 'winner_revealed' // 中獎者已揭曉，等待確認
  | 'confirming' // 確認中
  | 'completed'; // 完成

/**
 * 抽獎 Context 資料
 */
export interface DrawContextData {
  // 當前狀態
  state: DrawingState;

  // 選中的獎項
  selectedPrize: Prize | null;

  // 當前中獎者
  currentWinner: Participant | null;

  // 當前中獎者顯示資料（ID 已遮罩）
  currentWinnerDisplay: ParticipantDisplayData | null;

  // 當前抽獎結果
  currentResult: DrawingResult | null;

  // 當前抽獎序號
  currentSequence: number;

  // 是否正在播放動畫
  isAnimating: boolean;

  // Actions
  selectPrize: (prize: Prize) => void;
  startDrawing: () => void;
  setWinner: (winner: Participant, winnerDisplay: ParticipantDisplayData) => void;
  completeAnimation: () => void;
  confirmWinner: (result: DrawingResult) => void;
  cancelWinner: () => void;
  reset: () => void;
  setSequence: (sequence: number) => void;
}

const DrawContext = createContext<DrawContextData | undefined>(undefined);

export interface DrawProviderProps {
  children: ReactNode;
}

/**
 * Draw Provider
 */
export function DrawProvider({ children }: DrawProviderProps) {
  const [state, setState] = useState<DrawingState>('idle');
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [currentWinnerDisplay, setCurrentWinnerDisplay] = useState<ParticipantDisplayData | null>(null);
  const [currentResult, setCurrentResult] = useState<DrawingResult | null>(null);
  const [currentSequence, setCurrentSequence] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const selectPrize = (prize: Prize) => {
    setSelectedPrize(prize);
    setState('prize_selected');
    setCurrentWinner(null);
    setCurrentWinnerDisplay(null);
    setCurrentResult(null);
  };

  const startDrawing = () => {
    setState('animating');
    setIsAnimating(true);
    setCurrentWinner(null);
    setCurrentWinnerDisplay(null);
    setCurrentResult(null);
  };

  const setWinner = (winner: Participant, winnerDisplay: ParticipantDisplayData) => {
    setCurrentWinner(winner);
    setCurrentWinnerDisplay(winnerDisplay);
  };

  const completeAnimation = () => {
    setIsAnimating(false);
    setState('winner_revealed');
  };

  const confirmWinner = (result: DrawingResult) => {
    setCurrentResult(result);
    setState('completed');
  };

  const cancelWinner = () => {
    setState('prize_selected');
    setCurrentWinner(null);
    setCurrentWinnerDisplay(null);
    setCurrentResult(null);
    setIsAnimating(false);
  };

  const reset = () => {
    setState('idle');
    setSelectedPrize(null);
    setCurrentWinner(null);
    setCurrentWinnerDisplay(null);
    setCurrentResult(null);
    setCurrentSequence(1);
    setIsAnimating(false);
  };

  const setSequence = (sequence: number) => {
    setCurrentSequence(sequence);
  };

  const value: DrawContextData = {
    state,
    selectedPrize,
    currentWinner,
    currentWinnerDisplay,
    currentResult,
    currentSequence,
    isAnimating,
    selectPrize,
    startDrawing,
    setWinner,
    completeAnimation,
    confirmWinner,
    cancelWinner,
    reset,
    setSequence,
  };

  return <DrawContext.Provider value={value}>{children}</DrawContext.Provider>;
}

/**
 * Use Draw Context Hook
 */
export function useDrawContext() {
  const context = useContext(DrawContext);

  if (context === undefined) {
    throw new Error('useDrawContext must be used within a DrawProvider');
  }

  return context;
}
