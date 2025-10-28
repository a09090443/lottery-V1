'use client';

/**
 * Admin Result Detail Page
 * 管理端中獎結果詳情頁面
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DrawingResultWithDetails } from '@/types';
import { getDrawingResultWithDetails, updateDrawingResultStatus } from '@/lib/data/results';
import { formatDateTime } from '@/lib/utils/date';

export default function AdminResultDetailPage({
  params,
}: {
  params: { eventId: string; resultId: string };
}) {
  const router = useRouter();
  const { eventId, resultId } = params;

  const [result, setResult] = useState<DrawingResultWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const resultData = await getDrawingResultWithDetails(resultId);

      if (!resultData) {
        setError('中獎結果不存在');
        return;
      }

      if (resultData.eventId !== eventId) {
        setError('此結果不屬於當前活動');
        return;
      }

      setResult(resultData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelResult = async () => {
    if (!result || result.status === 'cancelled') {
      return;
    }

    if (!confirm('確定要取消此筆中獎結果嗎？\n\n取消後獎項數量將會恢復，但此操作無法復原。')) {
      return;
    }

    setIsProcessing(true);

    try {
      await updateDrawingResultStatus(resultId, 'cancelled', '手動取消');
      await loadResult(); // Reload to get updated status
      alert('中獎結果已取消');
    } catch (err) {
      alert(`取消失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreResult = async () => {
    if (!result || result.status === 'confirmed') {
      return;
    }

    if (!confirm('確定要恢復此筆中獎結果嗎？\n\n恢復後獎項數量將會減少。')) {
      return;
    }

    setIsProcessing(true);

    try {
      await updateDrawingResultStatus(resultId, 'confirmed', '手動恢復');
      await loadResult();
      alert('中獎結果已恢復');
    } catch (err) {
      alert(`恢復失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || '資料不存在'}</p>
          <button
            onClick={() => router.push(`/admin/results/${eventId}`)}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            返回結果列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/admin/results/${eventId}`)}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回結果列表
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">中獎結果詳情</h1>
            <p className="text-gray-600 mt-2">{result.eventName}</p>
          </div>

          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              result.status === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {result.status === 'confirmed' ? '✓ 已確認' : '✗ 已取消'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Prize Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">獎項資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">獎項名稱</div>
              <div className="text-lg font-medium text-gray-900">{result.prize.name}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">抽獎序號</div>
              <div className="text-lg font-medium text-gray-900">第 {result.drawSequence} 個</div>
            </div>

            {result.prize.description && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">獎項說明</div>
                <div className="text-gray-900">{result.prize.description}</div>
              </div>
            )}
          </div>
        </div>

        {/* Winner Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">中獎者資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">姓名</div>
              <div className="text-lg font-medium text-gray-900">{result.participant.name}</div>
            </div>

            {result.participant.employeeId && (
              <div>
                <div className="text-sm text-gray-600 mb-1">員工編號</div>
                <div className="text-lg font-medium text-gray-900">
                  {result.participant.employeeId}
                </div>
              </div>
            )}

            {result.participant.nationalId && (
              <div>
                <div className="text-sm text-gray-600 mb-1">身分證字號</div>
                <div className="text-lg font-medium text-gray-900 font-mono">
                  {result.participant.nationalId}
                </div>
              </div>
            )}

            {result.participant.email && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="text-gray-900">{result.participant.email}</div>
              </div>
            )}

            {result.participant.phone && (
              <div>
                <div className="text-sm text-gray-600 mb-1">電話</div>
                <div className="text-gray-900">{result.participant.phone}</div>
              </div>
            )}
          </div>
        </div>

        {/* Drawing Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">抽獎資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">抽獎時間</div>
              <div className="text-gray-900">{formatDateTime(result.drawnAt)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">狀態</div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.status === 'confirmed' ? '已確認' : '已取消'}
                </span>
              </div>
            </div>

            {result.notes && (
              <div className="md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">備註</div>
                <div className="text-gray-900">{result.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">操作</h2>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/admin/events/${eventId}`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              返回活動詳情
            </button>

            {result.status === 'confirmed' ? (
              <button
                onClick={handleCancelResult}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? '處理中...' : '取消此結果'}
              </button>
            ) : (
              <button
                onClick={handleRestoreResult}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? '處理中...' : '恢復此結果'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
