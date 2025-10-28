'use client';

/**
 * Public Homepage
 * 公開前台首頁 - 活動列表與快速導航
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LotteryEvent } from '@/types';
import { listEvents } from '@/lib/data/events';
import { listDrawingResultsByEvent } from '@/lib/data/results';
import { CompactEventCard } from '@/components/public/EventCard';
import Link from 'next/link';

export default function PublicHomePage() {
  const router = useRouter();
  const [activeEvents, setActiveEvents] = useState<LotteryEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<LotteryEvent[]>([]);
  const [winnersCountMap, setWinnersCountMap] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);

    try {
      const allEvents = await listEvents();

      // 分離進行中和已完成的活動
      const active = allEvents.filter((e) => e.status === 'active');
      const completed = allEvents.filter((e) => e.status === 'completed').slice(0, 3);

      setActiveEvents(active);
      setCompletedEvents(completed);

      // 載入每個活動的中獎人數
      const countsMap = new Map<string, number>();
      for (const event of [...active, ...completed]) {
        const results = await listDrawingResultsByEvent(event.id, { status: 'confirmed' });
        countsMap.set(event.id, results.length);
      }
      setWinnersCountMap(countsMap);
    } catch (error) {
      console.error('載入活動失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">抽獎系統</h1>
              <p className="text-blue-100">公平、公正、公開的抽獎平台</p>
            </div>

            <Link
              href="/admin"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-medium transition-colors shadow-md"
            >
              管理端登入
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/events"
            className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition-all cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">瀏覽活動</h3>
            <p className="text-gray-600 text-sm">查看所有進行中或已結束的抽獎活動</p>
          </Link>

          <Link
            href="/winners"
            className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition-all cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">查詢中獎</h3>
            <p className="text-gray-600 text-sm">輸入姓名或證件號碼查詢中獎紀錄</p>
          </Link>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
            <div className="text-5xl mb-4">💾</div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">本地運作</h3>
            <p className="text-gray-600 text-sm">資料儲存於瀏覽器，支援離線使用</p>
          </div>
        </div>

        {/* Active Events Section */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">載入中...</div>
          </div>
        ) : (
          <>
            {activeEvents.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">🎉 進行中的活動</h2>
                  <Link
                    href="/events?status=active"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    查看全部 →
                  </Link>
                </div>

                <div className="space-y-4">
                  {activeEvents.map((event) => (
                    <CompactEventCard
                      key={event.id}
                      event={event}
                      winnersCount={winnersCountMap.get(event.id) || 0}
                      onClick={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedEvents.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">📋 最近結束的活動</h2>
                  <Link
                    href="/events?status=completed"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    查看全部 →
                  </Link>
                </div>

                <div className="space-y-4">
                  {completedEvents.map((event) => (
                    <CompactEventCard
                      key={event.id}
                      event={event}
                      winnersCount={winnersCountMap.get(event.id) || 0}
                      onClick={() => router.push(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeEvents.length === 0 && completedEvents.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🎰</div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">目前沒有活動</h2>
                <p className="text-gray-600 mb-6">暫無進行中或已結束的抽獎活動</p>
                <Link
                  href="/admin"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium transition-colors"
                >
                  前往管理端建立活動
                </Link>
              </div>
            )}
          </>
        )}

        {/* Features Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">系統特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">公平抽獎</h3>
              <p className="text-gray-600 text-sm">採用 Fisher-Yates 隨機演算法，確保抽獎結果公正公平</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">🎰</div>
              <h3 className="text-lg font-semibold mb-2">視覺特效</h3>
              <p className="text-gray-600 text-sm">吃角子老虎機動畫效果，增添抽獎過程的樂趣與期待</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">即時統計</h3>
              <p className="text-gray-600 text-sm">即時顯示抽獎進度與中獎名單，資訊透明公開</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Browser-Based Lottery System v1.0.0 · 單機版網頁抽獎系統
          </p>
        </div>
      </footer>
    </div>
  );
}
