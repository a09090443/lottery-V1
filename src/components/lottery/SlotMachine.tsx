'use client';

/**
 * Slot Machine Animation Component
 * 吃角子老虎機動畫元件
 */

import { useState, useEffect, useRef } from 'react';
import { useAnimate, LazyMotion, domAnimation } from 'framer-motion';
import { Participant } from '@/types';
import { generateAnimationSequence } from '@/lib/lottery/algorithm';

export interface SlotMachineProps {
  /** 所有參與者列表 */
  participants: Participant[];

  /** 最終中獎者 */
  winner: Participant | null;

  /** 是否正在播放動畫 */
  isAnimating: boolean;

  /** 動畫持續時間（秒），預設 3 秒 */
  duration?: number;

  /** 動畫完成回調 */
  onAnimationComplete?: () => void;

  /** 自定義樣式類名 */
  className?: string;
}

/**
 * 吃角子老虎機動畫元件
 *
 * 功能：
 * - 快速捲動參與者名單
 * - 漸進減速效果
 * - 中獎者揭曉動畫（放大 + 背景顏色）
 * - 使用 LazyMotion 優化效能
 */
export function SlotMachine({
  participants,
  winner,
  isAnimating,
  duration = 3,
  onAnimationComplete,
  className = '',
}: SlotMachineProps) {
  const [scope, animate] = useAnimate();
  const [displayedParticipants, setDisplayedParticipants] = useState<Participant[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 生成動畫序列（隨機參與者列表用於捲動效果）
  useEffect(() => {
    if (participants.length > 0) {
      // 生成足夠多的隨機序列以確保流暢的捲動動畫
      const sequenceLength = Math.max(50, participants.length * 3);
      const sequence = generateAnimationSequence(participants, sequenceLength);

      // 如果有中獎者，確保最後顯示中獎者
      if (winner) {
        sequence.push(winner);
      }

      setDisplayedParticipants(sequence);
    }
  }, [participants, winner]);

  // 執行動畫
  useEffect(() => {
    if (!isAnimating || displayedParticipants.length === 0 || !scope.current) {
      return;
    }

    const runAnimation = async () => {
      try {
        setIsRevealing(false);

        // 計算捲動距離
        const itemHeight = 80; // 每個項目高度（px）

        // 中獎者（最後一個項目）需要停在容器中央
        // 容器中心在 120px，中央高亮區域範圍 80-160px
        // padding-top 是 80px，所以第一個項目中心在 120px
        // 第 n-1 個項目原始中心在: 120 + (n-1) * 80
        // 要移到 120px，需要向上移動: -(n-1) * 80
        const finalPosition = -(displayedParticipants.length - 1) * itemHeight;

        // Phase 1: 快速捲動（前 60% 時間）
        const rapidDuration = duration * 0.6;
        await animate(
          scope.current,
          { y: finalPosition * 0.5 },
          {
            duration: rapidDuration,
            ease: 'linear',
          }
        );

        // Phase 2: 減速捲動（後 40% 時間）
        const decelerationDuration = duration * 0.4;
        await animate(
          scope.current,
          { y: finalPosition },
          {
            duration: decelerationDuration,
            ease: [0.25, 0.1, 0.25, 1], // 貝茲曲線：平滑減速
          }
        );

        // Phase 3: 中獎者揭曉動畫
        setIsRevealing(true);

        // 觸發完成回調
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      } catch (error) {
        console.error('Animation error:', error);
      }
    };

    runAnimation();
  }, [isAnimating, displayedParticipants, duration, scope, animate, onAnimationComplete]);

  if (participants.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">沒有參與者</p>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl ${className}`}
        style={{ height: '240px' }}
      >
        {/* 上下漸層遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-800 to-transparent z-10 pointer-events-none" />

        {/* 中央高亮區域 */}
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-20 border-y-2 border-yellow-400 bg-yellow-400 bg-opacity-10 z-10 pointer-events-none" />

        {/* 捲動內容 */}
        <div ref={scope} className="relative py-20">
          {displayedParticipants.map((participant, index) => {
            const isWinner = isRevealing && index === displayedParticipants.length - 1;

            return (
              <div
                key={`${participant.id}-${index}`}
                className={`
                  flex items-center justify-center h-20 text-2xl font-bold transition-all duration-300
                  ${isWinner ? 'text-yellow-400 scale-125 bg-yellow-400 bg-opacity-20' : 'text-white'}
                `}
              >
                <div className="text-center">
                  <div>{participant.name}</div>
                  {isWinner && (
                    <div className="text-sm font-normal text-yellow-300 mt-1">🎉 恭喜中獎！</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 狀態指示器 */}
        {isAnimating && !isRevealing && (
          <div className="absolute top-4 right-4 z-20">
            <div className="flex items-center space-x-2 bg-blue-500 bg-opacity-90 px-3 py-1 rounded-full">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              <span className="text-white text-sm font-medium">抽獎中...</span>
            </div>
          </div>
        )}
      </div>
    </LazyMotion>
  );
}
