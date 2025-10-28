'use client';

/**
 * Results List Component
 * 中獎結果列表元件
 */

import { DrawingResultWithDetails } from '@/types';
import { formatDateTime } from '@/lib/utils/date';

export interface ResultsListProps {
  /** 中獎結果列表 */
  results: DrawingResultWithDetails[];
  /** 點擊結果項目的處理函式 */
  onResultClick?: (result: DrawingResultWithDetails) => void;
  /** 是否顯示操作按鈕 */
  showActions?: boolean;
  /** 操作按鈕渲染函式 */
  renderActions?: (result: DrawingResultWithDetails) => React.ReactNode;
  /** 是否為載入中狀態 */
  isLoading?: boolean;
}

/**
 * 中獎結果列表元件
 */
export function ResultsList({
  results,
  onResultClick,
  showActions = false,
  renderActions,
  isLoading = false,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500">尚無中獎結果</div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                抽獎時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                獎項名稱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                中獎者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                員工編號
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                身分證字號
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              {showActions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr
                key={result.id}
                onClick={() => onResultClick?.(result)}
                className={onResultClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.drawSequence}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(result.drawnAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.prize.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.participant.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.participant.employeeId || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.participant.nationalId || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      result.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.status === 'confirmed' ? '已確認' : '已取消'}
                  </span>
                </td>
                {showActions && renderActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {renderActions(result)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 統計資訊 */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          共 <span className="font-semibold text-gray-900">{results.length}</span> 筆中獎結果
        </div>
      </div>
    </div>
  );
}

/**
 * 精簡版結果列表（用於概覽）
 */
export interface CompactResultsListProps {
  results: DrawingResultWithDetails[];
  maxItems?: number;
  onViewAll?: () => void;
}

export function CompactResultsList({
  results,
  maxItems = 5,
  onViewAll,
}: CompactResultsListProps) {
  const displayResults = results.slice(0, maxItems);
  const hasMore = results.length > maxItems;

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        尚無中獎結果
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="divide-y divide-gray-200">
        {displayResults.map((result) => (
          <div key={result.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900">
                    #{result.drawSequence}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{result.participant.name}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      result.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {result.status === 'confirmed' ? '已確認' : '已取消'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {result.prize.name} · {formatDateTime(result.drawnAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && onViewAll && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            查看全部 {results.length} 筆結果 →
          </button>
        </div>
      )}
    </div>
  );
}
