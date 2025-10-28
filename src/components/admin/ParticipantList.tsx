'use client';

/**
 * Participant List Component
 * 參與者列表元件
 */

import { useState, useEffect } from 'react';
import { ParticipantDisplayData } from '@/types';
import { listEventParticipants, removeParticipantFromEvent } from '@/lib/data/eventParticipants';
import { toDisplayData } from '@/lib/data/participants';
import { useConfirm } from '@/components/common/ConfirmDialog';

export interface ParticipantListProps {
  eventId: string;
  refreshTrigger?: number; // 用於觸發重新載入
}

export function ParticipantList({ eventId, refreshTrigger }: ParticipantListProps) {
  const { confirm } = useConfirm();
  const [participants, setParticipants] = useState<ParticipantDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 50;

  const loadParticipants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listEventParticipants(eventId);
      const displayData = data.map(toDisplayData);
      setParticipants(displayData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入參與者失敗');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [eventId, refreshTrigger]);

  const handleRemove = async (participantId: string, participantName: string) => {
    const confirmed = await confirm({
      title: '移除參與者',
      message: `確定要將「${participantName}」從此活動中移除嗎？\n此操作可復原（可重新加入）。`,
      confirmText: '移除',
      cancelText: '取消',
      type: 'warning',
    });

    if (!confirmed) {
      return;
    }

    setRemovingId(participantId);

    try {
      await removeParticipantFromEvent(eventId, participantId);
      await loadParticipants();
    } catch (err) {
      await confirm({
        title: '移除失敗',
        message: err instanceof Error ? err.message : '移除參與者時發生錯誤',
        confirmText: '確定',
        type: 'danger',
      });
    } finally {
      setRemovingId(null);
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

  if (participants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">尚未新增任何參與者</p>
      </div>
    );
  }

  // 過濾參與者
  const filteredParticipants = searchTerm
    ? participants.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.maskedEmployeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.maskedNationalId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : participants;

  // 分頁計算
  const totalPages = Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedParticipants = filteredParticipants.slice(startIndex, endIndex);

  // 重置搜尋時回到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      {/* 搜尋框 */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="搜尋姓名、編號或 Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-sm text-gray-600 ml-4">
          顯示 {startIndex + 1}-{Math.min(endIndex, filteredParticipants.length)} / 共 {filteredParticipants.length} 筆
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              姓名
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">員工編號</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">身分證字號</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">電話</th>
            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedParticipants.map((participant) => (
            <tr key={participant.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {participant.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {participant.maskedEmployeeId || '-'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {participant.maskedNationalId || '-'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {participant.email || '-'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {participant.phone || '-'}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleRemove(participant.id, participant.name)}
                    disabled={removingId === participant.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {removingId === participant.id ? '移除中...' : '移除'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* 分頁控制器 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一頁
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                顯示第 <span className="font-medium">{startIndex + 1}</span> 到{' '}
                <span className="font-medium">{Math.min(endIndex, filteredParticipants.length)}</span> 筆，
                共 <span className="font-medium">{filteredParticipants.length}</span> 筆
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">上一頁</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* 頁碼按鈕 */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">下一頁</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
