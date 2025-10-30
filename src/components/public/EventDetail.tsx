'use client';

/**
 * Event Detail Component (Public)
 * 公開活動詳情元件
 */

import { LotteryEvent, Prize } from '@/types';
import { formatDate } from '@/lib/utils/date';

export interface EventDetailProps {
  /** 活動資料 */
  event: LotteryEvent;
  /** 獎項列表 */
  prizes: Prize[];
  /** 總參與人數 */
  participantsCount?: number;
  /** 總中獎人數 */
  winnersCount?: number;
}

/**
 * 活動詳情元件（公開版）
 */
export function EventDetail({
  event,
  prizes,
  participantsCount = 0,
  winnersCount = 0,
}: EventDetailProps) {
  const statusConfig = {
    draft: { label: '籌備中', color: 'bg-gray-100 text-gray-800', icon: '📝' },
    active: { label: '進行中', color: 'bg-green-100 text-green-800', icon: '🎉' },
    completed: { label: '已結束', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    archived: { label: '已封存', color: 'bg-gray-100 text-gray-600', icon: '📦' },
  };

  const status = statusConfig[event.status];

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
            {event.description && (
              <p className="text-blue-100 text-lg">{event.description}</p>
            )}
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-blue-100 text-sm mb-1">預定時間</div>
            <div className="text-white font-semibold">
              {formatDate(event.scheduledAt)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-blue-100 text-sm mb-1">參與人數</div>
            <div className="text-white font-semibold text-2xl">{participantsCount} 人</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-blue-100 text-sm mb-1">中獎人數</div>
            <div className="text-white font-semibold text-2xl">{winnersCount} 人</div>
          </div>
        </div>
      </div>

      {/* Prizes Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">獎項列表</h2>

        {prizes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            尚未設定獎項
          </div>
        ) : (
          <div className="space-y-4">
            {prizes.map((prize, index) => {
              const drawnCount = prize.totalQuantity - prize.remainingQuantity;
              const progressPercent = (drawnCount / prize.totalQuantity) * 100;

              return (
                <div
                  key={prize.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-semibold text-sm">
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900">{prize.name}</h3>
                      </div>

                      {prize.description && (
                        <p className="text-gray-600 ml-11">{prize.description}</p>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-600 mb-1">已抽出</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {drawnCount} <span className="text-base text-gray-400">/ {prize.totalQuantity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="ml-11">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          progressPercent === 100
                            ? 'bg-green-500'
                            : progressPercent > 0
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{progressPercent.toFixed(0)}% 完成</span>
                      {prize.remainingQuantity > 0 ? (
                        <span>剩餘 {prize.remainingQuantity} 個</span>
                      ) : (
                        <span className="text-green-600 font-semibold">已全數抽出</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Additional Information */}
      {event.allowDuplicateWinners && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-yellow-800 text-sm font-medium">
              此活動允許重複中獎
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
