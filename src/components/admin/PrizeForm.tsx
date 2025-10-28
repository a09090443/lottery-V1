'use client';

/**
 * Prize Form Component
 * 獎項表單元件
 */

import { useState } from 'react';
import { Prize, CreatePrizeInput, UpdatePrizeInput } from '@/types';
import { createPrize, updatePrize } from '@/lib/data/prizes';

export interface PrizeFormProps {
  eventId: string;
  prize?: Prize; // 如果提供則為編輯模式
  onSuccess?: (prize: Prize) => void;
  onCancel?: () => void;
}

export function PrizeForm({ eventId, prize, onSuccess, onCancel }: PrizeFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    totalQuantity: number;
    displayOrder: number;
  }>({
    name: prize?.name ?? '',
    description: prize?.description ?? '',
    totalQuantity: prize?.totalQuantity ?? 1,
    displayOrder: prize?.displayOrder ?? 999,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!prize;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result: Prize;

      if (isEditMode) {
        // 編輯模式
        const input: UpdatePrizeInput = {
          name: formData.name,
          description: formData.description || null,
          totalQuantity: formData.totalQuantity,
          displayOrder: formData.displayOrder,
        };
        result = await updatePrize(prize.id, input);
      } else {
        // 新增模式
        const input: CreatePrizeInput = {
          eventId,
          name: formData.name,
          description: formData.description || undefined,
          totalQuantity: formData.totalQuantity,
          displayOrder: formData.displayOrder,
        };
        result = await createPrize(input);
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

    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
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
          獎項名稱 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="例如：頭獎、貳獎、參獎"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          獎項說明
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="獎品內容或說明..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-700">
            總數量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="totalQuantity"
            name="totalQuantity"
            value={formData.totalQuantity}
            onChange={handleChange}
            required
            min={isEditMode ? (prize.totalQuantity - prize.remainingQuantity) : 1}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {isEditMode && prize && (
            <p className="mt-1 text-xs text-gray-500">
              已抽出 {prize.totalQuantity - prize.remainingQuantity} 個，最小值為該數量
            </p>
          )}
        </div>

        <div>
          <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">
            顯示順序
          </label>
          <input
            type="number"
            id="displayOrder"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            min={0}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">數字越小排序越前面</p>
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
          {isSubmitting ? '處理中...' : isEditMode ? '更新獎項' : '建立獎項'}
        </button>
      </div>
    </form>
  );
}
