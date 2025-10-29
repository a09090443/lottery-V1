'use client';

/**
 * Prize List Component
 * 獎項列表元件
 */

import { useState, useEffect, useCallback } from 'react';
import { Prize } from '@/types';
import { listPrizesByEvent, deletePrize } from '@/lib/data/prizes';

export interface PrizeListProps {
  eventId: string;
  onPrizeEdit?: (prize: Prize) => void;
  refreshTrigger?: number; // 用於觸發重新載入
}

export function PrizeList({ eventId, onPrizeEdit, refreshTrigger }: PrizeListProps) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPrizes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listPrizesByEvent(eventId);
      setPrizes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入獎項失敗');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadPrizes();
  }, [loadPrizes, refreshTrigger]);

  const handleDelete = async (prizeId: string) => {
    if (!confirm('確定要刪除此獎項嗎？此操作無法復原。')) {
      return;
    }

    setDeletingId(prizeId);

    try {
      await deletePrize(prizeId);
      await loadPrizes();
    } catch (err) {
      alert(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (prizes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">尚未設定任何獎項</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              順序
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">獎項名稱</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">說明</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">總數量</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">剩餘數量</th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {prizes.map((prize) => {
            const drawnCount = prize.totalQuantity - prize.remainingQuantity;
            const canDelete = drawnCount === 0;

            return (
              <tr key={prize.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                  {prize.displayOrder}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {prize.name}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{prize.description || '-'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {prize.totalQuantity}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={
                      prize.remainingQuantity === 0
                        ? 'text-gray-400'
                        : prize.remainingQuantity < prize.totalQuantity * 0.3
                          ? 'text-orange-600'
                          : 'text-green-600'
                    }
                  >
                    {prize.remainingQuantity}
                  </span>
                  {drawnCount > 0 && <span className="text-gray-400 ml-1">({drawnCount} 已抽)</span>}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end space-x-2">
                    {onPrizeEdit && (
                      <button
                        onClick={() => onPrizeEdit(prize)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        編輯
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(prize.id)}
                      disabled={!canDelete || deletingId === prize.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!canDelete ? '已有中獎者，無法刪除' : ''}
                    >
                      {deletingId === prize.id ? '刪除中...' : '刪除'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
