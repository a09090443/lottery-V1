'use client';

/**
 * Admin Results Listing Page
 * 管理端中獎結果列表頁面
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LotteryEvent, Prize, DrawingResultWithDetails } from '@/types';
import { getEvent } from '@/lib/data/events';
import { listPrizesByEvent } from '@/lib/data/prizes';
import { listDrawingResultsByEvent, getDrawingResultWithDetails } from '@/lib/data/results';
import { ResultsList } from '@/components/results/ResultsList';
import { ResultsFilter, ResultsFilterOptions } from '@/components/results/ResultsFilter';
import { ExportButton } from '@/components/results/ExportButton';
import { ResultActions } from '@/components/results/ResultActions';

export default function AdminResultsPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const { eventId } = params;

  const [event, setEvent] = useState<LotteryEvent | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [allResults, setAllResults] = useState<DrawingResultWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filter, setFilter] = useState<ResultsFilterOptions>({
    prizeId: null,
    status: 'all',
    searchKeyword: '',
  });

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [eventData, prizesData, resultsData] = await Promise.all([
        getEvent(eventId),
        listPrizesByEvent(eventId),
        listDrawingResultsByEvent(eventId),
      ]);

      if (!eventData) {
        setError('活動不存在');
        return;
      }

      setEvent(eventData);
      setPrizes(prizesData);

      // Enrich results with full details
      const enrichedResults = await Promise.all(
        resultsData.map((r) => getDrawingResultWithDetails(r.id))
      );

      setAllResults(enrichedResults.filter((r): r is DrawingResultWithDetails => r !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入資料失敗');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply filters
  const filteredResults = useMemo(() => {
    let results = [...allResults];

    // Filter by prize
    if (filter.prizeId) {
      results = results.filter((r) => r.prizeId === filter.prizeId);
    }

    // Filter by status
    if (filter.status !== 'all') {
      results = results.filter((r) => r.status === filter.status);
    }

    // Filter by search keyword
    if (filter.searchKeyword) {
      const keyword = filter.searchKeyword.toLowerCase();
      results = results.filter((r) =>
        r.participant.name.toLowerCase().includes(keyword)
      );
    }

    return results;
  }, [allResults, filter]);

  const handleFilterChange = (newFilter: ResultsFilterOptions) => {
    setFilter(newFilter);
  };

  const handleResultClick = (result: DrawingResultWithDetails) => {
    router.push(`/admin/results/${eventId}/${result.id}`);
  };

  const handleActionSuccess = () => {
    loadData();
  };

  const handleActionError = (errorMsg: string) => {
    alert(`操作失敗：${errorMsg}`);
  };

  const handleExportSuccess = (filename: string) => {
    alert(`匯出成功！\n檔案：${filename}`);
  };

  const handleExportError = (errorMsg: string) => {
    alert(`匯出失敗：${errorMsg}`);
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{event?.name}</h1>
            <p className="text-gray-600 mt-2">中獎結果管理</p>
          </div>

          <ExportButton
            eventId={eventId}
            onExportSuccess={handleExportSuccess}
            onExportError={handleExportError}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">總中獎人數</div>
          <div className="text-3xl font-bold text-gray-900">{allResults.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">已確認</div>
          <div className="text-3xl font-bold text-green-600">
            {allResults.filter((r) => r.status === 'confirmed').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">已取消</div>
          <div className="text-3xl font-bold text-red-600">
            {allResults.filter((r) => r.status === 'cancelled').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <ResultsFilter
          prizes={prizes}
          currentFilter={filter}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Results List */}
      <ResultsList
        results={filteredResults}
        onResultClick={handleResultClick}
        showActions={true}
        renderActions={(result) => (
          <ResultActions
            result={result}
            onActionSuccess={handleActionSuccess}
            onActionError={handleActionError}
            onViewDetails={handleResultClick}
          />
        )}
      />
    </div>
  );
}
