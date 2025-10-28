'use client';

/**
 * Public Event Detail Page
 * 公開活動詳情頁面
 */

import { useState, useEffect } from 'react';
import { LotteryEvent, Prize } from '@/types';
import { getEvent } from '@/lib/data/events';
import { listPrizesByEvent } from '@/lib/data/prizes';
import { listEventParticipants } from '@/lib/data/eventParticipants';
import { listDrawingResultsByEvent, getDrawingResultWithDetails } from '@/lib/data/results';
import { toDisplayData } from '@/lib/data/participants';
import { EventDetail } from '@/components/public/EventDetail';
import { WinnerList, WinnerDisplayData } from '@/components/public/WinnerList';
import Link from 'next/link';

export default function PublicEventDetailPage({ params }: { params: { id: string } }) {
  const { id: eventId } = params;

  const [event, setEvent] = useState<LotteryEvent | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<WinnerDisplayData[]>([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [winnersCount, setWinnersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [eventData, prizesData, participantsData, resultsData] = await Promise.all([
        getEvent(eventId),
        listPrizesByEvent(eventId),
        listEventParticipants(eventId),
        listDrawingResultsByEvent(eventId, { status: 'confirmed' }),
      ]);

      if (!eventData) {
        setError('活動不存在');
        return;
      }

      setEvent(eventData);
      setPrizes(prizesData);
      setParticipantsCount(participantsData.length);
      setWinnersCount(resultsData.length);

      // 載入完整中獎資料（含遮罩）
      const winnersData = await Promise.all(
        resultsData.map(async (result) => {
          const fullResult = await getDrawingResultWithDetails(result.id);
          if (!fullResult) return null;

          const participantDisplay = toDisplayData(fullResult.participant);

          return {
            resultId: fullResult.id,
            drawSequence: fullResult.drawSequence,
            drawnAt: fullResult.drawnAt,
            prizeName: fullResult.prize.name,
            participant: participantDisplay,
          } as WinnerDisplayData;
        })
      );

      setWinners(winnersData.filter((w): w is WinnerDisplayData => w !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入資料失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 mb-4">{error || '活動不存在'}</p>
            <Link
              href="/events"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              返回活動列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← 返回活動列表
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Event Details */}
        <EventDetail
          event={event}
          prizes={prizes}
          participantsCount={participantsCount}
          winnersCount={winnersCount}
        />

        {/* Winners List */}
        {winners.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🏆 中獎名單</h2>
              <Link
                href="/winners"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                查詢我的中獎紀錄 →
              </Link>
            </div>

            <WinnerList winners={winners} showPrize={true} showTime={true} />
          </div>
        )}

        {/* Call to Action */}
        {event.status === 'active' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">活動進行中</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>此活動仍在進行中，中獎名單將持續更新。請稍後再次查看最新的抽獎結果。</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Browser-Based Lottery System v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}
