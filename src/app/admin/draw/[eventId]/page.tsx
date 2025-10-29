'use client';

/**
 * Admin Drawing Page
 * 管理端抽獎執行頁面
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LotteryEvent, Prize, Participant } from '@/types';
import { getEvent } from '@/lib/data/events';
import { listPrizesByEvent } from '@/lib/data/prizes';
import { listEventParticipants } from '@/lib/data/eventParticipants';
import { executeDraw } from '@/lib/lottery/executor';
import { toDisplayData } from '@/lib/data/participants';
import { SlotMachine } from '@/components/lottery/SlotMachine';
import { PrizeSelector } from '@/components/lottery/PrizeSelector';
import { DrawingControl } from '@/components/lottery/DrawingControl';
import { WinnerDisplay } from '@/components/lottery/WinnerDisplay';
import { DrawingProgress } from '@/components/lottery/DrawingProgress';
import { DrawProvider, useDrawContext } from '@/contexts/DrawContext';

export default function AdminDrawingPage({ params }: { params: { eventId: string } }) {
  return (
    <DrawProvider>
      <DrawingPageContent eventId={params.eventId} />
    </DrawProvider>
  );
}

function DrawingPageContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const drawContext = useDrawContext();

  const [event, setEvent] = useState<LotteryEvent | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入活動資料
  const loadEventData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [eventData, prizesData, participantsData] = await Promise.all([
        getEvent(eventId),
        listPrizesByEvent(eventId),
        listEventParticipants(eventId),
      ]);

      if (!eventData) {
        setError('活動不存在');
        return;
      }

      if (eventData.status !== 'active') {
        setError('活動未啟用，無法執行抽獎');
        return;
      }

      setEvent(eventData);
      setPrizes(prizesData);
      setParticipants(participantsData);

      if (prizesData.length === 0) {
        setError('活動尚未設定獎項');
      }

      if (participantsData.length === 0) {
        setError('活動沒有參與者');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入資料失敗');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  // 處理獎項選擇
  const handlePrizeSelect = async (prizeId: string) => {
    const prize = prizes.find((p) => p.id === prizeId);
    if (prize) {
      drawContext.selectPrize(prize);

      // 重新載入獎項資料以更新剩餘數量
      const updatedPrizes = await listPrizesByEvent(eventId);
      setPrizes(updatedPrizes);
    }
  };

  // 處理開始抽獎
  const handleStartDraw = async () => {
    if (!drawContext.selectedPrize) {
      alert('請先選擇獎項');
      return;
    }

    try {
      drawContext.startDrawing();

      // 執行抽獎
      const result = await executeDraw(eventId, drawContext.selectedPrize.id);

      if (!result.success) {
        alert(`抽獎失敗：${result.error}`);
        drawContext.cancelWinner();
        return;
      }

      if (result.winner) {
        const winnerDisplay = toDisplayData(result.winner);
        drawContext.setWinner(result.winner, winnerDisplay);

        // 更新序號
        if (result.result) {
          drawContext.setSequence(result.result.drawSequence);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '抽獎執行失敗');
      drawContext.cancelWinner();
    }
  };

  // 處理動畫完成
  const handleAnimationComplete = () => {
    drawContext.completeAnimation();
  };

  // 處理確認中獎
  const handleConfirmWinner = async () => {
    try {
      if (drawContext.currentResult) {
        drawContext.confirmWinner(drawContext.currentResult);

        // 重新載入獎項資料
        const updatedPrizes = await listPrizesByEvent(eventId);
        setPrizes(updatedPrizes);

        // 檢查該獎項是否還有剩餘
        const currentPrize = updatedPrizes.find((p) => p.id === drawContext.selectedPrize?.id);

        if (currentPrize && currentPrize.remainingQuantity > 0) {
          // 還有剩餘，可以繼續抽下一個
          alert('中獎者已確認！可繼續抽下一個。');
          drawContext.selectPrize(currentPrize);
        } else {
          // 此獎項已抽完
          alert('中獎者已確認！此獎項已全數抽出。');
          drawContext.reset();
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '確認失敗');
    }
  };

  // 處理取消中獎
  const handleCancelWinner = () => {
    if (confirm('確定要取消此次抽獎結果並重新抽選嗎？')) {
      drawContext.cancelWinner();

      // 重新載入以恢復資料
      loadEventData();
    }
  };

  // 處理抽下一個
  const handleDrawNext = () => {
    if (drawContext.selectedPrize) {
      drawContext.selectPrize(drawContext.selectedPrize);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => router.push('/admin/events')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            返回活動列表
          </button>
        </div>
      </div>
    );
  }

  const currentPrize = drawContext.selectedPrize;
  const canDrawNext = currentPrize ? currentPrize.remainingQuantity > 1 : false;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/admin/events/${eventId}`)}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回活動詳情
        </button>

        <h1 className="text-3xl font-bold text-gray-900">{event?.name}</h1>
        <p className="text-gray-600 mt-2">抽獎執行</p>
      </div>

      {/* Warning Message */}
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
        {/* Prize Selector */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <PrizeSelector
            prizes={prizes}
            selectedPrizeId={currentPrize?.id ?? null}
            onSelectPrize={handlePrizeSelect}
            disabled={drawContext.isAnimating}
          />
        </div>

        {/* Drawing Progress */}
        {currentPrize && (
          <DrawingProgress
            prizeName={currentPrize.name}
            currentSequence={drawContext.currentSequence}
            totalQuantity={currentPrize.totalQuantity}
            drawnCount={currentPrize.totalQuantity - currentPrize.remainingQuantity}
            remainingCount={currentPrize.remainingQuantity}
          />
        )}

        {/* Slot Machine */}
        <SlotMachine
          participants={participants}
          winner={drawContext.currentWinner}
          isAnimating={drawContext.isAnimating}
          duration={3}
          onAnimationComplete={handleAnimationComplete}
          className="max-w-4xl mx-auto"
        />

        {/* Winner Display */}
        {drawContext.state === 'winner_revealed' && drawContext.currentWinnerDisplay && (
          <WinnerDisplay
            winner={drawContext.currentWinnerDisplay}
            prizeName={currentPrize?.name}
            drawSequence={drawContext.currentSequence}
            animate={true}
          />
        )}

        {/* Drawing Control */}
        <DrawingControl
          isDrawing={drawContext.isAnimating}
          hasPrizeSelected={!!currentPrize}
          canDrawNext={canDrawNext}
          showingWinner={drawContext.state === 'winner_revealed'}
          onStartDraw={handleStartDraw}
          onConfirmWinner={handleConfirmWinner}
          onCancelWinner={handleCancelWinner}
          onDrawNext={handleDrawNext}
        />
      </div>
    </div>
  );
}
