'use client';

/**
 * Public Events Listing Page
 * 公開活動列表頁面
 */

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LotteryEvent } from '@/types';
import { listEvents } from '@/lib/data/events';
import { listDrawingResultsByEvent } from '@/lib/data/results';
import { EventCard } from '@/components/public/EventCard';
import Link from 'next/link';

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  const [events, setEvents] = useState<LotteryEvent[]>([]);
  const [winnersCountMap, setWinnersCountMap] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(statusFilter || 'all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFilterStatus(statusFilter);
    }
  }, [statusFilter]);

  const loadEvents = async () => {
    setIsLoading(true);

    try {
      const allEvents = await listEvents();
      setEvents(allEvents);

      // 載入每個活動的中獎人數
      const countsMap = new Map<string, number>();
      for (const event of allEvents) {
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

  // 篩選活動
  const filteredEvents = useMemo(() => {
    if (filterStatus === 'all') {
      return events;
    }
    return events.filter((e) => e.status === filterStatus);
  }, [events, filterStatus]);

  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    if (newStatus === 'all') {
      router.push('/events');
    } else {
      router.push(`/events?status=${newStatus}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
                ← 返回首頁
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">活動列表</h1>
            </div>

            <Link
              href="/winners"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              查詢中獎
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-8 inline-flex gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleFilterChange('active')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            進行中
          </button>
          <button
            onClick={() => handleFilterChange('completed')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              filterStatus === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            已結束
          </button>
          <button
            onClick={() => handleFilterChange('draft')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              filterStatus === 'draft'
                ? 'bg-gray-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            籌備中
          </button>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-gray-500">載入中...</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              {filterStatus === 'all' ? '暫無活動' : `暫無${getStatusLabel(filterStatus)}的活動`}
            </h2>
            <p className="text-gray-600 mb-6">目前沒有符合條件的抽獎活動</p>
            <button
              onClick={() => handleFilterChange('all')}
              className="inline-block text-blue-600 hover:text-blue-800 font-medium"
            >
              查看全部活動
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  winnersCount={winnersCountMap.get(event.id) || 0}
                  showDetails={false}
                />
              ))}
            </div>

            <div className="mt-8 text-center text-gray-600">
              共顯示 <span className="font-semibold text-gray-900">{filteredEvents.length}</span> 個活動
            </div>
          </>
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

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: '籌備中',
    active: '進行中',
    completed: '已結束',
    archived: '已封存',
  };
  return labels[status] || status;
}

export default function PublicEventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
