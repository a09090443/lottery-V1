'use client';

/**
 * Event Card Component (Public)
 * 公開活動卡片元件
 */

import { LotteryEvent } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import Link from 'next/link';

export interface EventCardProps {
  /** 活動資料 */
  event: LotteryEvent;
  /** 中獎人數統計 */
  winnersCount?: number;
  /** 是否顯示詳細資訊 */
  showDetails?: boolean;
}

/**
 * 活動卡片元件（公開版）
 */
export function EventCard({ event, winnersCount = 0, showDetails = false }: EventCardProps) {
  const statusConfig = {
    draft: { label: '籌備中', color: 'bg-gray-100 text-gray-800' },
    active: { label: '進行中', color: 'bg-green-100 text-green-800' },
    completed: { label: '已結束', color: 'bg-blue-100 text-blue-800' },
    archived: { label: '已封存', color: 'bg-gray-100 text-gray-600' },
  };

  const status = statusConfig[event.status];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header with Status Badge */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
          >
            {status.label}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-white px-6 text-center">{event.name}</h3>
      </div>

      {/* Content */}
      <div className="p-6">
        {event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        )}

        <div className="space-y-2 text-sm">
          {/* Date Range */}
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>

          {/* Winners Count */}
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>
              已抽出 <span className="font-semibold text-blue-600">{winnersCount}</span> 位中獎者
            </span>
          </div>

          {/* Created Time (if showDetails) */}
          {showDetails && (
            <div className="flex items-center text-gray-500 text-xs">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>建立於 {formatDateTime(event.createdAt)}</span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <div className="mt-6">
          <Link
            href={`/events/${event.id}`}
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            查看詳情
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * 精簡活動卡片（列表模式）
 */
export interface CompactEventCardProps {
  event: LotteryEvent;
  winnersCount?: number;
  onClick?: () => void;
}

export function CompactEventCard({ event, winnersCount = 0, onClick }: CompactEventCardProps) {
  const statusConfig = {
    draft: { label: '籌備中', color: 'bg-gray-100 text-gray-800' },
    active: { label: '進行中', color: 'bg-green-100 text-green-800' },
    completed: { label: '已結束', color: 'bg-blue-100 text-blue-800' },
    archived: { label: '已封存', color: 'bg-gray-100 text-gray-600' },
  };

  const status = statusConfig[event.status];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(event.startDate)}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {winnersCount} 位中獎者
            </div>
          </div>
        </div>

        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
