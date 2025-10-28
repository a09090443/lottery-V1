'use client';

/**
 * Results Filter Component
 * 中獎結果篩選元件
 */

import { useState } from 'react';
import { Prize } from '@/types';

export interface ResultsFilterOptions {
  /** 獎項 ID 篩選 */
  prizeId: string | null;
  /** 狀態篩選 */
  status: 'all' | 'confirmed' | 'cancelled';
  /** 搜尋關鍵字（中獎者姓名） */
  searchKeyword: string;
}

export interface ResultsFilterProps {
  /** 獎項列表（用於篩選選項） */
  prizes: Prize[];
  /** 當前篩選選項 */
  currentFilter: ResultsFilterOptions;
  /** 篩選變更處理函式 */
  onFilterChange: (filter: ResultsFilterOptions) => void;
  /** 是否顯示搜尋框 */
  showSearch?: boolean;
}

/**
 * 中獎結果篩選元件
 */
export function ResultsFilter({
  prizes,
  currentFilter,
  onFilterChange,
  showSearch = true,
}: ResultsFilterProps) {
  const [localFilter, setLocalFilter] = useState<ResultsFilterOptions>(currentFilter);

  const handlePrizeChange = (prizeId: string) => {
    const newFilter = {
      ...localFilter,
      prizeId: prizeId === 'all' ? null : prizeId,
    };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleStatusChange = (status: 'all' | 'confirmed' | 'cancelled') => {
    const newFilter = {
      ...localFilter,
      status,
    };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSearchChange = (keyword: string) => {
    const newFilter = {
      ...localFilter,
      searchKeyword: keyword,
    };
    setLocalFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleReset = () => {
    const resetFilter: ResultsFilterOptions = {
      prizeId: null,
      status: 'all',
      searchKeyword: '',
    };
    setLocalFilter(resetFilter);
    onFilterChange(resetFilter);
  };

  const hasActiveFilter =
    localFilter.prizeId !== null ||
    localFilter.status !== 'all' ||
    localFilter.searchKeyword !== '';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">篩選條件</h3>
        {hasActiveFilter && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            清除篩選
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 獎項篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">獎項</label>
          <select
            value={localFilter.prizeId || 'all'}
            onChange={(e) => handlePrizeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部獎項</option>
            {prizes.map((prize) => (
              <option key={prize.id} value={prize.id}>
                {prize.name} ({prize.totalQuantity - prize.remainingQuantity}/{prize.totalQuantity})
              </option>
            ))}
          </select>
        </div>

        {/* 狀態篩選 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">狀態</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                localFilter.status === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleStatusChange('confirmed')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                localFilter.status === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已確認
            </button>
            <button
              onClick={() => handleStatusChange('cancelled')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                localFilter.status === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已取消
            </button>
          </div>
        </div>

        {/* 搜尋框 */}
        {showSearch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜尋中獎者</label>
            <div className="relative">
              <input
                type="text"
                value={localFilter.searchKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="輸入姓名搜尋..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 篩選結果摘要 */}
      {hasActiveFilter && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">已套用篩選：</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {localFilter.prizeId && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  獎項：
                  {prizes.find((p) => p.id === localFilter.prizeId)?.name}
                </span>
              )}
              {localFilter.status !== 'all' && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    localFilter.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  狀態：{localFilter.status === 'confirmed' ? '已確認' : '已取消'}
                </span>
              )}
              {localFilter.searchKeyword && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  搜尋：{localFilter.searchKeyword}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
