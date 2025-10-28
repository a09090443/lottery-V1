'use client';

/**
 * Admin Event Detail Page
 * 管理端單一活動詳情頁面
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LotteryEvent, Prize } from '@/types';
import { getEvent } from '@/lib/data/events';
import { PrizeForm } from '@/components/admin/PrizeForm';
import { PrizeList } from '@/components/admin/PrizeList';
import { ParticipantForm } from '@/components/admin/ParticipantForm';
import { ParticipantList } from '@/components/admin/ParticipantList';
import { ParticipantImport } from '@/components/admin/ParticipantImport';
import { formatDateTime } from '@/lib/utils/date';

export default function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [event, setEvent] = useState<LotteryEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prizes' | 'participants'>('prizes');

  // Prize state
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | undefined>(undefined);
  const [prizeRefreshTrigger, setPrizeRefreshTrigger] = useState(0);

  // Participant state
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [showParticipantImport, setShowParticipantImport] = useState(false);
  const [participantRefreshTrigger, setParticipantRefreshTrigger] = useState(0);

  useEffect(() => {
    loadEvent();
  }, [params.id]);

  const loadEvent = async () => {
    setIsLoading(true);
    try {
      const data = await getEvent(params.id);
      if (!data) {
        alert('活動不存在');
        router.push('/admin/events');
        return;
      }
      setEvent(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : '載入活動失敗');
      router.push('/admin/events');
    } finally {
      setIsLoading(false);
    }
  };

  // Prize handlers
  const handleCreatePrize = () => {
    setEditingPrize(undefined);
    setShowPrizeForm(true);
  };

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    setShowPrizeForm(true);
  };

  const handlePrizeFormSuccess = () => {
    setShowPrizeForm(false);
    setEditingPrize(undefined);
    setPrizeRefreshTrigger((prev) => prev + 1);
    loadEvent(); // Reload to update prize count
  };

  const handlePrizeFormCancel = () => {
    setShowPrizeForm(false);
    setEditingPrize(undefined);
  };

  // Participant handlers
  const handleCreateParticipant = () => {
    setShowParticipantForm(true);
  };

  const handleImportParticipants = () => {
    setShowParticipantImport(true);
  };

  const handleParticipantFormSuccess = () => {
    setShowParticipantForm(false);
    setParticipantRefreshTrigger((prev) => prev + 1);
    loadEvent(); // Reload to update participant count
  };

  const handleParticipantFormCancel = () => {
    setShowParticipantForm(false);
  };

  const handleParticipantImportSuccess = () => {
    setShowParticipantImport(false);
    setParticipantRefreshTrigger((prev) => prev + 1);
    loadEvent(); // Reload to update participant count
  };

  const handleParticipantImportCancel = () => {
    setShowParticipantImport(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/events')}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回活動列表
        </button>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900">{event.name}</h1>
          {event.description && <p className="mt-2 text-sm text-gray-600">{event.description}</p>}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">預定時間</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateTime(event.scheduledAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">參與者</dt>
              <dd className="mt-1 text-sm text-gray-900">{event.participantCount} 位</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">獎項</dt>
              <dd className="mt-1 text-sm text-gray-900">{event.prizeCount} 個</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">已抽出</dt>
              <dd className="mt-1 text-sm text-gray-900">{event.drawnWinnersCount} 位</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('prizes')}
            className={`${
              activeTab === 'prizes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            獎項管理
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`${
              activeTab === 'participants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            參與者管理
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === 'prizes' && (
          <div>
            {showPrizeForm ? (
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  {editingPrize ? '編輯獎項' : '建立新獎項'}
                </h2>
                <PrizeForm
                  eventId={event.id}
                  prize={editingPrize}
                  onSuccess={handlePrizeFormSuccess}
                  onCancel={handlePrizeFormCancel}
                />
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <button
                    onClick={handleCreatePrize}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    新增獎項
                  </button>
                </div>
                <PrizeList
                  eventId={event.id}
                  onPrizeEdit={handleEditPrize}
                  refreshTrigger={prizeRefreshTrigger}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'participants' && (
          <div>
            {showParticipantForm ? (
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">新增參與者</h2>
                <ParticipantForm
                  eventId={event.id}
                  onSuccess={handleParticipantFormSuccess}
                  onCancel={handleParticipantFormCancel}
                />
              </div>
            ) : showParticipantImport ? (
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">匯入參與者</h2>
                <ParticipantImport
                  eventId={event.id}
                  onSuccess={handleParticipantImportSuccess}
                  onCancel={handleParticipantImportCancel}
                />
              </div>
            ) : (
              <div>
                <div className="mb-4 flex space-x-3">
                  <button
                    onClick={handleCreateParticipant}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    新增參與者
                  </button>
                  <button
                    onClick={handleImportParticipants}
                    className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                  >
                    匯入 CSV
                  </button>
                </div>
                <ParticipantList eventId={event.id} refreshTrigger={participantRefreshTrigger} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
