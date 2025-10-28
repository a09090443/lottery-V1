'use client';

/**
 * Event List Component
 * 活動列表元件
 */

import { useState, useEffect } from 'react';
import { LotteryEvent, EventStatusType } from '@/types';
import { listEvents, deleteEvent } from '@/lib/data/events';
import { formatDateTime } from '@/lib/utils/date';

export interface EventListProps {
  onEventSelect?: (event: LotteryEvent) => void;
  onEventEdit?: (event: LotteryEvent) => void;
  refreshTrigger?: number; // 用於觸發重新載入
}

const STATUS_LABELS: Record<EventStatusType, string> = {
  draft: '草稿',
  active: '進行中',
  completed: '已完成',
  archived: '已封存',
};

const STATUS_COLORS: Record<EventStatusType, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-500',
};

export function EventList({ onEventSelect, onEventEdit, refreshTrigger }: EventListProps) {
  const [events, setEvents] = useState<LotteryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入活動失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [refreshTrigger]);

  const handleDelete = async (eventId: string) => {
    if (!confirm('確定要刪除此活動嗎？此操作無法復原。')) {
      return;
    }

    setDeletingId(eventId);

    try {
      await deleteEvent(eventId);
      await loadEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">尚未建立任何活動</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              活動名稱
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">預定時間</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">狀態</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">參與者</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">獎項</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">中獎者</th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="font-medium text-gray-900">{event.name}</div>
                {event.description && <div className="text-gray-500">{event.description}</div>}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatDateTime(event.scheduledAt)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${STATUS_COLORS[event.status]}`}>
                  {STATUS_LABELS[event.status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{event.participantCount}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{event.prizeCount}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{event.drawnWinnersCount}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end space-x-2">
                  {onEventSelect && (
                    <button
                      onClick={() => onEventSelect(event)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      查看
                    </button>
                  )}
                  {onEventEdit && (
                    <button
                      onClick={() => onEventEdit(event)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      編輯
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {deletingId === event.id ? '刪除中...' : '刪除'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
