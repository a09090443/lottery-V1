'use client';

/**
 * Winner List Component (Public)
 * 公開中獎名單元件
 */

import { ParticipantDisplayData } from '@/types';
import { formatDateTime } from '@/lib/utils/date';

export interface WinnerDisplayData {
  /** 結果 ID */
  resultId: string;
  /** 抽獎序號 */
  drawSequence: number;
  /** 抽獎時間 */
  drawnAt: string;
  /** 獎項名稱 */
  prizeName: string;
  /** 中獎者資訊（含遮罩） */
  participant: ParticipantDisplayData;
}

export interface WinnerListProps {
  /** 中獎者列表 */
  winners: WinnerDisplayData[];
  /** 是否顯示獎項欄位 */
  showPrize?: boolean;
  /** 是否顯示時間 */
  showTime?: boolean;
  /** 是否為載入中狀態 */
  isLoading?: boolean;
}

/**
 * 中獎名單元件（公開版）
 */
export function WinnerList({
  winners,
  showPrize = true,
  showTime = true,
  isLoading = false,
}: WinnerListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500">尚無中獎紀錄</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                序號
              </th>
              {showPrize && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  獎項
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                中獎者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                員工編號
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                身分證字號
              </th>
              {showTime && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  抽獎時間
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {winners.map((winner) => (
              <tr key={winner.resultId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{winner.drawSequence}
                </td>
                {showPrize && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {winner.prizeName}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {winner.participant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {winner.participant.maskedEmployeeId || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {winner.participant.maskedNationalId || '-'}
                </td>
                {showTime && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(winner.drawnAt)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with total count */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          共 <span className="font-semibold text-gray-900">{winners.length}</span> 位中獎者
        </div>
      </div>
    </div>
  );
}

/**
 * 精簡版中獎名單（卡片模式）
 */
export interface CompactWinnerListProps {
  winners: WinnerDisplayData[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function CompactWinnerList({
  winners,
  maxItems = 10,
  showViewAll = true,
  onViewAll,
}: CompactWinnerListProps) {
  const displayWinners = winners.slice(0, maxItems);
  const hasMore = winners.length > maxItems;

  if (winners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        尚無中獎紀錄
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="divide-y divide-gray-200">
        {displayWinners.map((winner) => (
          <div key={winner.resultId} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                    {winner.drawSequence}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{winner.participant.name}</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {winner.participant.maskedEmployeeId || winner.participant.maskedNationalId}
                  </span>
                </div>
                <div className="ml-11 text-sm text-gray-600">
                  {winner.prizeName}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {formatDateTime(winner.drawnAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && showViewAll && onViewAll && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            查看全部 {winners.length} 位中獎者 →
          </button>
        </div>
      )}
    </div>
  );
}
