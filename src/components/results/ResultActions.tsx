'use client';

/**
 * Result Actions Component
 * 中獎結果操作元件
 */

import { useState } from 'react';
import { DrawingResult } from '@/types';
import { updateDrawingResultStatus } from '@/lib/data/results';

export interface ResultActionsProps {
  /** 中獎結果 */
  result: DrawingResult;
  /** 操作成功回調 */
  onActionSuccess?: () => void;
  /** 操作失敗回調 */
  onActionError?: (error: string) => void;
  /** 查看詳情回調 */
  onViewDetails?: (resultId: string) => void;
}

/**
 * 中獎結果操作元件
 */
export function ResultActions({
  result,
  onActionSuccess,
  onActionError,
  onViewDetails,
}: ResultActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancelResult = async () => {
    if (result.status === 'cancelled') {
      return;
    }

    if (!confirm('確定要取消此筆中獎結果嗎？\n\n取消後獎項數量將會恢復，但此操作無法復原。')) {
      return;
    }

    setIsProcessing(true);

    try {
      await updateDrawingResultStatus(result.id, 'cancelled', '手動取消');
      onActionSuccess?.();
    } catch (error) {
      onActionError?.(error instanceof Error ? error.message : '取消失敗');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreResult = async () => {
    if (result.status === 'confirmed') {
      return;
    }

    if (!confirm('確定要恢復此筆中獎結果嗎？\n\n恢復後獎項數量將會減少。')) {
      return;
    }

    setIsProcessing(true);

    try {
      await updateDrawingResultStatus(result.id, 'confirmed', '手動恢復');
      onActionSuccess?.();
    } catch (error) {
      onActionError?.(error instanceof Error ? error.message : '恢復失敗');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* View Details Button */}
      {onViewDetails && (
        <button
          onClick={() => onViewDetails(result.id)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          disabled={isProcessing}
        >
          查看
        </button>
      )}

      {/* Cancel/Restore Button */}
      {result.status === 'confirmed' ? (
        <button
          onClick={handleCancelResult}
          disabled={isProcessing}
          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
        >
          {isProcessing ? '處理中...' : '取消'}
        </button>
      ) : (
        <button
          onClick={handleRestoreResult}
          disabled={isProcessing}
          className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
        >
          {isProcessing ? '處理中...' : '恢復'}
        </button>
      )}
    </div>
  );
}

/**
 * 批次操作元件
 */
export interface BatchActionsProps {
  /** 選中的結果 ID 列表 */
  selectedResultIds: string[];
  /** 清除選擇 */
  onClearSelection: () => void;
  /** 批次取消成功回調 */
  onBatchCancelSuccess?: () => void;
  /** 操作失敗回調 */
  onError?: (error: string) => void;
}

export function BatchActions({
  selectedResultIds,
  onClearSelection,
  onBatchCancelSuccess,
  onError,
}: BatchActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBatchCancel = async () => {
    if (selectedResultIds.length === 0) {
      return;
    }

    if (
      !confirm(
        `確定要取消 ${selectedResultIds.length} 筆中獎結果嗎？\n\n此操作無法復原。`
      )
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      for (const resultId of selectedResultIds) {
        await updateDrawingResultStatus(resultId, 'cancelled', '批次取消');
      }

      onBatchCancelSuccess?.();
      onClearSelection();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : '批次取消失敗');
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedResultIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="text-sm text-blue-800">
        已選擇 <span className="font-semibold">{selectedResultIds.length}</span> 筆結果
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onClearSelection}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          disabled={isProcessing}
        >
          取消選擇
        </button>

        <button
          onClick={handleBatchCancel}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {isProcessing ? '處理中...' : '批次取消'}
        </button>
      </div>
    </div>
  );
}
