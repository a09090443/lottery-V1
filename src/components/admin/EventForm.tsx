'use client';

/**
 * Event Form Component
 * 活動表單元件
 */

import { useState } from 'react';
import { LotteryEvent, CreateEventInput, UpdateEventInput } from '@/types';
import { createEvent, updateEvent } from '@/lib/data/events';
import { datetimeLocalToISO } from '@/lib/utils/date';

export interface EventFormProps {
  event?: LotteryEvent; // 如果提供則為編輯模式
  onSuccess?: (event: LotteryEvent) => void;
  onCancel?: () => void;
}

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    scheduledAt: string;
    allowDuplicateWinners: boolean;
  }>({
    name: event?.name ?? '',
    description: event?.description ?? '',
    scheduledAt: event?.scheduledAt ?? new Date().toISOString().slice(0, 16),
    allowDuplicateWinners: event?.allowDuplicateWinners ?? false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!event;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result: LotteryEvent;

      // 將 datetime-local 格式轉換為 ISO 8601 格式
      const scheduledAtISO = datetimeLocalToISO(formData.scheduledAt);

      if (isEditMode) {
        // 編輯模式
        const input: UpdateEventInput = {
          name: formData.name,
          description: formData.description || null,
          scheduledAt: scheduledAtISO,
          allowDuplicateWinners: formData.allowDuplicateWinners,
        };
        result = await updateEvent(event.id, input);
      } else {
        // 新增模式
        const input: CreateEventInput = {
          name: formData.name,
          description: formData.description || undefined,
          scheduledAt: scheduledAtISO,
          allowDuplicateWinners: formData.allowDuplicateWinners,
        };
        result = await createEvent(input);
      }

      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          活動名稱 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="例如：2024 年度尾牙抽獎"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          活動描述
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="活動的詳細說明..."
        />
      </div>

      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
          預定時間 <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="scheduledAt"
          name="scheduledAt"
          value={formData.scheduledAt}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            id="allowDuplicateWinners"
            name="allowDuplicateWinners"
            checked={formData.allowDuplicateWinners}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="allowDuplicateWinners" className="font-medium text-gray-700">
            允許重複中獎
          </label>
          <p className="text-gray-500">參與者可以在同一活動中多次中獎</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? '處理中...' : isEditMode ? '更新活動' : '建立活動'}
        </button>
      </div>
    </form>
  );
}
