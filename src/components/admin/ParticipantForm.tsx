'use client';

/**
 * Participant Form Component
 * 參與者表單元件
 */

import { useState } from 'react';
import { Participant, CreateParticipantInput, UpdateParticipantInput } from '@/types';
import { createParticipant, updateParticipant } from '@/lib/data/participants';
import { addParticipantToEvent } from '@/lib/data/eventParticipants';

export interface ParticipantFormProps {
  eventId?: string; // 如果提供，建立後會自動加入活動
  participant?: Participant; // 如果提供則為編輯模式
  onSuccess?: (participant: Participant) => void;
  onCancel?: () => void;
}

export function ParticipantForm({ eventId, participant, onSuccess, onCancel }: ParticipantFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    employeeId: string;
    nationalId: string;
    email: string;
    phone: string;
  }>({
    name: participant?.name ?? '',
    employeeId: participant?.employeeId ?? '',
    nationalId: participant?.nationalId ?? '',
    email: participant?.email ?? '',
    phone: participant?.phone ?? '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!participant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result: Participant;

      if (isEditMode) {
        // 編輯模式
        const input: UpdateParticipantInput = {
          name: formData.name,
          employeeId: formData.employeeId || null,
          nationalId: formData.nationalId || null,
          email: formData.email || null,
          phone: formData.phone || null,
        };
        result = await updateParticipant(participant.id, input);
      } else {
        // 新增模式
        const input: CreateParticipantInput = {
          name: formData.name,
          employeeId: formData.employeeId || undefined,
          nationalId: formData.nationalId || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        };
        result = await createParticipant(input);

        // 如果有提供 eventId，自動加入活動
        if (eventId) {
          await addParticipantToEvent(eventId, result.id);
        }
      }

      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="請輸入姓名"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            員工編號
          </label>
          <input
            type="text"
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="例如：E001234"
          />
        </div>

        <div>
          <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
            身分證字號
          </label>
          <input
            type="text"
            id="nationalId"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="例如：A123456789"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="example@company.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            電話
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="0912-345-678"
          />
        </div>
      </div>

      <div className="rounded-md bg-yellow-50 p-4">
        <p className="text-xs text-yellow-800">
          提示：至少需要提供<strong>員工編號</strong>或<strong>身分證字號</strong>其中一項，以確保參與者的唯一性。
        </p>
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
          {isSubmitting ? '處理中...' : isEditMode ? '更新參與者' : '新增參與者'}
        </button>
      </div>
    </form>
  );
}
