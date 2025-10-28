'use client';

/**
 * Winner Display Component
 * 中獎者顯示元件
 */

import { ParticipantDisplayData } from '@/types';

export interface WinnerDisplayProps {
  /** 中獎者資料 */
  winner: ParticipantDisplayData | null;

  /** 獎項名稱 */
  prizeName?: string;

  /** 中獎序號（多數量獎項） */
  drawSequence?: number;

  /** 是否顯示動畫效果 */
  animate?: boolean;
}

/**
 * 中獎者顯示元件
 */
export function WinnerDisplay({ winner, prizeName, drawSequence, animate = false }: WinnerDisplayProps) {
  if (!winner) {
    return null;
  }

  return (
    <div
      className={`
        bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-8 border-2 border-yellow-400 shadow-xl
        ${animate ? 'animate-bounce-once' : ''}
      `}
    >
      {/* 標題 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
          🎉 恭喜中獎！
        </h2>
        {prizeName && <p className="text-lg text-gray-700 mt-2">獎項：{prizeName}</p>}
        {drawSequence !== undefined && (
          <p className="text-sm text-gray-600 mt-1">第 {drawSequence} 位中獎者</p>
        )}
      </div>

      {/* 中獎者資訊 */}
      <div className="bg-white rounded-lg p-6 shadow-inner">
        <div className="space-y-4">
          {/* 姓名 */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">中獎者姓名</div>
            <div className="text-4xl font-bold text-gray-900">{winner.name}</div>
          </div>

          {/* 分隔線 */}
          <div className="border-t border-gray-200"></div>

          {/* 詳細資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {winner.maskedEmployeeId && (
              <div>
                <div className="text-gray-500 mb-1">員工編號</div>
                <div className="font-mono text-gray-900">{winner.maskedEmployeeId}</div>
              </div>
            )}

            {winner.maskedNationalId && (
              <div>
                <div className="text-gray-500 mb-1">身分證字號</div>
                <div className="font-mono text-gray-900">{winner.maskedNationalId}</div>
              </div>
            )}

            {winner.email && (
              <div>
                <div className="text-gray-500 mb-1">Email</div>
                <div className="text-gray-900 truncate">{winner.email}</div>
              </div>
            )}

            {winner.phone && (
              <div>
                <div className="text-gray-500 mb-1">電話</div>
                <div className="text-gray-900">{winner.phone}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 裝飾性元素 */}
      <div className="flex justify-center space-x-4 mt-6 text-4xl">
        <span className="animate-pulse">🎊</span>
        <span className="animate-pulse delay-100">🎉</span>
        <span className="animate-pulse delay-200">🎊</span>
      </div>
    </div>
  );
}
