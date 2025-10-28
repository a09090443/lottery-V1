'use client';

/**
 * Public Winner Search Page
 * 公開中獎查詢頁面
 */

import { useState } from 'react';
import { listDrawingResultsByEvent, getDrawingResultWithDetails } from '@/lib/data/results';
import { listEvents } from '@/lib/data/events';
import { toDisplayData } from '@/lib/data/participants';
import { WinnerDisplayData } from '@/components/public/WinnerList';
import { WinnerCard } from '@/components/public/WinnerCard';
import Link from 'next/link';

export default function PublicWinnerSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WinnerDisplayData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('請輸入姓名或證件號碼');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // 載入所有活動
      const events = await listEvents();
      const allResults: WinnerDisplayData[] = [];

      // 搜尋每個活動的中獎結果
      for (const event of events) {
        const eventResults = await listDrawingResultsByEvent(event.id, { status: 'confirmed' });

        for (const result of eventResults) {
          const fullResult = await getDrawingResultWithDetails(result.id);
          if (!fullResult) continue;

          const participant = fullResult.participant;

          // 比對姓名、員工編號、身分證字號（不區分大小寫）
          const query = searchQuery.toLowerCase();
          const matchesName = participant.name.toLowerCase().includes(query);
          const matchesEmployeeId = participant.employeeId?.toLowerCase().includes(query);
          const matchesNationalId = participant.nationalId?.toLowerCase().includes(query);

          if (matchesName || matchesEmployeeId || matchesNationalId) {
            const participantDisplay = toDisplayData(participant);

            allResults.push({
              resultId: fullResult.id,
              drawSequence: fullResult.drawSequence,
              drawnAt: fullResult.drawnAt,
              prizeName: fullResult.prize.name,
              participant: participantDisplay,
            });
          }
        }
      }

      setSearchResults(allResults);
    } catch (error) {
      console.error('搜尋失敗:', error);
      alert('搜尋失敗，請稍後再試');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm text-blue-100 hover:text-white mb-2 inline-block">
            ← 返回首頁
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">中獎查詢</h1>
          <p className="text-blue-100">輸入姓名或證件號碼查詢您的中獎紀錄</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                搜尋條件
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="輸入姓名、員工編號或身分證字號..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSearching}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0">搜尋</label>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? '搜尋中...' : '搜尋'}
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>💡 提示：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>可輸入完整或部分姓名</li>
              <li>可輸入員工編號或身分證字號（完整或部分）</li>
              <li>搜尋不區分大小寫</li>
            </ul>
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="text-center py-12">
            <div className="text-gray-500">搜尋中，請稍候...</div>
          </div>
        )}

        {!isSearching && hasSearched && (
          <>
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">未找到中獎紀錄</h2>
                <p className="text-gray-600 mb-6">
                  使用「<span className="font-semibold">{searchQuery}</span>」未找到任何中獎紀錄
                </p>
                <div className="text-sm text-gray-600">
                  <p>請確認：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>姓名拼寫正確</li>
                    <li>證件號碼輸入正確</li>
                    <li>是否已參加抽獎活動</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    🎉 恭喜！找到 {searchResults.length} 筆中獎紀錄
                  </h2>
                  <p className="text-gray-600 mt-2">
                    搜尋條件：「{searchQuery}」
                  </p>
                </div>

                <div className="space-y-6">
                  {searchResults.map((winner) => (
                    <WinnerCard
                      key={winner.resultId}
                      prizeName={winner.prizeName}
                      drawSequence={winner.drawSequence}
                      totalQuantity={1} // 不顯示總數（公開版）
                      winner={winner.participant}
                      showCongratulations={false}
                      size="normal"
                    />
                  ))}
                </div>

                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-green-800">領獎提醒</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>請於活動結束後依照活動規則領取獎品，詳情請洽活動主辦單位。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">開始查詢中獎紀錄</h2>
            <p className="text-gray-600">在上方輸入您的姓名或證件號碼進行查詢</p>
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
