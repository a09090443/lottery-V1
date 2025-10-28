'use client';

/**
 * Prize Selector Component
 * 獎項選擇器元件
 */

import { Prize } from '@/types';

export interface PrizeSelectorProps {
  /** 獎項列表 */
  prizes: Prize[];

  /** 當前選中的獎項 ID */
  selectedPrizeId: string | null;

  /** 選擇獎項的回調 */
  onSelectPrize: (prizeId: string) => void;

  /** 是否禁用（抽獎進行中） */
  disabled?: boolean;
}

/**
 * 獎項選擇器元件
 */
export function PrizeSelector({
  prizes,
  selectedPrizeId,
  onSelectPrize,
  disabled = false,
}: PrizeSelectorProps) {
  if (prizes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">此活動尚未設定獎項</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">選擇要抽獎的獎項</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prizes.map((prize) => {
          const isSelected = prize.id === selectedPrizeId;
          const isAvailable = prize.remainingQuantity > 0;
          const drawnCount = prize.totalQuantity - prize.remainingQuantity;
          const progressPercentage =
            prize.totalQuantity > 0 ? (drawnCount / prize.totalQuantity) * 100 : 0;

          return (
            <button
              key={prize.id}
              onClick={() => onSelectPrize(prize.id)}
              disabled={disabled || !isAvailable}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
            >
              {/* 獎項名稱 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{prize.name}</h4>
                  {prize.description && (
                    <p className="text-sm text-gray-600 mt-1">{prize.description}</p>
                  )}
                </div>
                {isSelected && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* 數量資訊 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">總數量：</span>
                  <span className="font-medium text-gray-900">{prize.totalQuantity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">已抽出：</span>
                  <span className={drawnCount > 0 ? 'font-medium text-orange-600' : 'text-gray-900'}>
                    {drawnCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">剩餘數量：</span>
                  <span
                    className={
                      prize.remainingQuantity === 0
                        ? 'font-medium text-red-600'
                        : 'font-medium text-green-600'
                    }
                  >
                    {prize.remainingQuantity}
                  </span>
                </div>

                {/* 進度條 */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        prize.remainingQuantity === 0 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* 狀態標籤 */}
                {prize.remainingQuantity === 0 && (
                  <div className="mt-2 inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                    已抽完
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
