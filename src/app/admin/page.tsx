'use client';

/**
 * Admin Dashboard Page
 * 管理儀表板首頁
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '@/lib/auth/admin-auth';
import {
  getStorageMonitorData,
  getExportReminderData,
  snoozeExportReminder,
  type ExportReminderData,
} from '@/lib/utils/storage';

interface StorageInfo {
  info: {
    used: number;
    available: number;
    total: number;
    usagePercent: number;
    usedFormatted: string;
    totalFormatted: string;
  };
  warningLevel: 'safe' | 'warning' | 'critical' | 'full';
  message: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [exportReminder, setExportReminder] = useState<ExportReminderData | null>(null);

  useEffect(() => {
    // 取得儲存空間資訊
    const data = getStorageMonitorData();
    setStorageInfo(data);

    // 取得匯出提醒資訊
    const reminderData = getExportReminderData();
    setExportReminder(reminderData);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleDismissReminder = () => {
    snoozeExportReminder();
    setExportReminder(null);
  };

  const getStorageColorClass = () => {
    if (!storageInfo) return 'text-gray-600';

    switch (storageInfo.warningLevel) {
      case 'safe':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'full':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStorageBgClass = () => {
    if (!storageInfo) return 'bg-gray-100';

    switch (storageInfo.warningLevel) {
      case 'safe':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
      case 'full':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStorageIcon = () => {
    if (!storageInfo) return '💾';

    switch (storageInfo.warningLevel) {
      case 'safe':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
      case 'full':
        return '🔴';
      default:
        return '💾';
    }
  };

  const getReminderColorClass = () => {
    if (!exportReminder) return 'bg-blue-50 border-blue-200';

    switch (exportReminder.level) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'urgent':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getReminderTextClass = () => {
    if (!exportReminder) return 'text-blue-800';

    switch (exportReminder.level) {
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      case 'urgent':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  const getReminderIcon = () => {
    if (!exportReminder) return '📦';

    switch (exportReminder.level) {
      case 'info':
        return '📦';
      case 'warning':
        return '⚠️';
      case 'urgent':
        return '🚨';
      default:
        return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">管理儀表板</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* 匯出提醒 */}
        {exportReminder && exportReminder.shouldShowReminder && (
          <div className={`mb-6 rounded-lg shadow p-4 border ${getReminderColorClass()}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{getReminderIcon()}</span>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${getReminderTextClass()}`}>
                    資料匯出提醒
                  </h3>
                  <p className={`text-sm ${getReminderTextClass()}`}>{exportReminder.message}</p>
                  {exportReminder.lastExportAt && (
                    <p className={`text-xs mt-1 ${getReminderTextClass()} opacity-75`}>
                      上次匯出：
                      {new Date(exportReminder.lastExportAt).toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 border border-gray-300">
                      前往匯出
                    </button>
                    <button
                      onClick={handleDismissReminder}
                      className="text-gray-600 px-3 py-2 rounded-md text-sm hover:bg-white/50"
                    >
                      稍後提醒
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismissReminder}
                className={`ml-2 ${getReminderTextClass()} hover:opacity-75`}
                aria-label="關閉提醒"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">活動管理</h2>
            <p className="text-gray-600 mb-4">建立、編輯與管理抽獎活動</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              進入活動管理
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">抽獎執行</h2>
            <p className="text-gray-600 mb-4">執行抽獎流程</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              開始抽獎
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">結果管理</h2>
            <p className="text-gray-600 mb-4">查看與匯出抽獎結果</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
              查看結果
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">系統狀態</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <p className="text-sm text-gray-600">總活動數</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-sm text-gray-600">總參與者數</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-sm text-gray-600">總抽獎結果數</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        {/* 儲存空間監控 */}
        {storageInfo && (
          <div className={`mt-6 rounded-lg shadow p-6 border ${getStorageBgClass()}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>{getStorageIcon()}</span>
                <span>儲存空間使用率</span>
              </h2>
              <span className={`text-sm font-medium ${getStorageColorClass()}`}>
                {storageInfo.warningLevel === 'safe' && '正常'}
                {storageInfo.warningLevel === 'warning' && '警告'}
                {storageInfo.warningLevel === 'critical' && '危險'}
                {storageInfo.warningLevel === 'full' && '已滿'}
              </span>
            </div>

            <div className="space-y-3">
              {/* 進度條 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>已使用：{storageInfo.info.usedFormatted}</span>
                  <span>總容量：{storageInfo.info.totalFormatted}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      storageInfo.warningLevel === 'safe'
                        ? 'bg-green-600'
                        : storageInfo.warningLevel === 'warning'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(storageInfo.info.usagePercent, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  使用率：{storageInfo.info.usagePercent.toFixed(1)}%
                </p>
              </div>

              {/* 提示訊息 */}
              <div className={`p-3 rounded text-sm ${getStorageColorClass()}`}>
                <p>{storageInfo.message}</p>
              </div>

              {/* 建議操作（當儲存空間不足時）*/}
              {(storageInfo.warningLevel === 'warning' ||
                storageInfo.warningLevel === 'critical' ||
                storageInfo.warningLevel === 'full') && (
                <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm font-semibold mb-2">建議操作：</p>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 匯出並刪除已完成的舊活動</li>
                    <li>• 將活動狀態改為「已封存」</li>
                    <li>• 刪除已取消的抽獎結果</li>
                    <li>• 清除瀏覽器快取資料（⚠️ 會刪除所有資料，請先備份！）</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
