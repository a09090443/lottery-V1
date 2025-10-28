'use client';

/**
 * Drawing Progress Component
 * 抽獎進度元件
 */

export interface DrawingProgressProps {
  /** 獎項名稱 */
  prizeName: string;

  /** 當前抽獎序號 */
  currentSequence: number;

  /** 總數量 */
  totalQuantity: number;

  /** 已抽出數量 */
  drawnCount: number;

  /** 剩餘數量 */
  remainingCount: number;
}

/**
 * 抽獎進度元件
 * 顯示「第 X 個，共 Y 個」
 */
export function DrawingProgress({
  prizeName,
  currentSequence,
  totalQuantity,
  drawnCount,
  remainingCount,
}: DrawingProgressProps) {
  const progressPercentage = totalQuantity > 0 ? (drawnCount / totalQuantity) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* 獎項名稱 */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{prizeName}</h3>
      </div>

      {/* 當前進度文字 */}
      <div className="text-center mb-4">
        <p className="text-3xl font-bold text-blue-600">
          第 {currentSequence} 個
        </p>
        <p className="text-gray-600 mt-1">共 {totalQuantity} 個獎項</p>
      </div>

      {/* 進度條 */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="w-full h-full bg-white opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{Math.round(progressPercentage)}%</span>
          <span>{totalQuantity}</span>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">{totalQuantity}</div>
          <div className="text-xs text-gray-600 mt-1">總數量</div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{drawnCount}</div>
          <div className="text-xs text-gray-600 mt-1">已抽出</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-600">{remainingCount}</div>
          <div className="text-xs text-gray-600 mt-1">剩餘</div>
        </div>
      </div>

      {/* 完成狀態 */}
      {remainingCount === 0 && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg text-center">
          <span className="font-semibold">✓ 此獎項已全數抽出</span>
        </div>
      )}
    </div>
  );
}
