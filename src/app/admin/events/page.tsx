'use client';

/**
 * Admin Events Page
 * 管理端活動列表頁面
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LotteryEvent } from '@/types';
import { EventList } from '@/components/admin/EventList';
import { EventForm } from '@/components/admin/EventForm';

export default function AdminEventsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LotteryEvent | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateClick = () => {
    setEditingEvent(undefined);
    setShowForm(true);
  };

  const handleEditClick = (event: LotteryEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleViewClick = (event: LotteryEvent) => {
    router.push(`/admin/events/${event.id}`);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEvent(undefined);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEvent(undefined);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">活動管理</h1>
          <p className="mt-2 text-sm text-gray-700">管理所有抽獎活動，包含建立、編輯與刪除。</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handleCreateClick}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            建立新活動
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {editingEvent ? '編輯活動' : '建立新活動'}
          </h2>
          <EventForm event={editingEvent} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
        </div>
      ) : (
        <div className="mt-8">
          <EventList
            onEventSelect={handleViewClick}
            onEventEdit={handleEditClick}
            refreshTrigger={refreshTrigger}
          />
        </div>
      )}
    </div>
  );
}
