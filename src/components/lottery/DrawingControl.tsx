'use client';

/**
 * Drawing Control Component
 * 抽獎控制元件
 */

export interface DrawingControlProps {
  /** 是否正在抽獎 */
  isDrawing: boolean;

  /** 是否有選中的獎項 */
  hasPrizeSelected: boolean;

  /** 是否可以繼續抽下一個（多數量獎項） */
  canDrawNext: boolean;

  /** 是否顯示中獎者（等待確認） */
  showingWinner: boolean;

  /** 開始抽獎按鈕點擊 */
  onStartDraw: () => void;

  /** 確認中獎按鈕點擊 */
  onConfirmWinner: () => void;

  /** 取消中獎按鈕點擊 */
  onCancelWinner: () => void;

  /** 抽下一個按鈕點擊（多數量獎項） */
  onDrawNext?: () => void;
}

/**
 * 抽獎控制元件
 */
export function DrawingControl({
  isDrawing,
  hasPrizeSelected,
  canDrawNext,
  showingWinner,
  onStartDraw,
  onConfirmWinner,
  onCancelWinner,
  onDrawNext,
}: DrawingControlProps) {
  // 正在抽獎中
  if (isDrawing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent" />
          <span className="text-blue-700 font-medium text-lg">抽獎進行中...</span>
        </div>
      </div>
    );
  }

  // 顯示中獎者，等待確認
  if (showingWinner) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
        <button
          onClick={onConfirmWinner}
          className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          ✓ 確認中獎
        </button>

        <button
          onClick={onCancelWinner}
          className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          ✗ 取消並重抽
        </button>

        {canDrawNext && onDrawNext && (
          <button
            onClick={onDrawNext}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            → 抽下一個
          </button>
        )}
      </div>
    );
  }

  // 準備開始抽獎
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <button
        onClick={onStartDraw}
        disabled={!hasPrizeSelected}
        className={`
          px-12 py-4 text-xl font-bold rounded-lg shadow-lg transition-all transform
          ${
            hasPrizeSelected
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {hasPrizeSelected ? '🎰 開始抽獎' : '請先選擇獎項'}
      </button>

      {!hasPrizeSelected && (
        <p className="text-sm text-gray-500">請在上方選擇要抽獎的獎項</p>
      )}
    </div>
  );
}
