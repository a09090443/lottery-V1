'use client';

/**
 * Confirmation Dialog Component
 * 確認對話框元件
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmDialogContextData {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextData | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }
  return context;
}

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState({ isOpen: false, options: null, resolve: null });
  }, [dialogState.resolve]);

  const handleCancel = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState({ isOpen: false, options: null, resolve: null });
  }, [dialogState.resolve]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialogState.isOpen && dialogState.options && (
        <ConfirmDialogModal
          options={dialogState.options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}

interface ConfirmDialogModalProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialogModal({ options, onConfirm, onCancel }: ConfirmDialogModalProps) {
  const typeConfig = {
    danger: {
      icon: '⚠️',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      titleColor: 'text-red-800',
    },
    warning: {
      icon: '⚡',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      titleColor: 'text-yellow-800',
    },
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      titleColor: 'text-blue-800',
    },
  };

  const config = typeConfig[options.type || 'info'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl">{config.icon}</div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-2 ${config.titleColor}`}>
              {options.title}
            </h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">{options.message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            {options.cancelText || '取消'}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${config.confirmBg} text-white font-medium rounded-md transition-colors`}
          >
            {options.confirmText || '確認'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 簡化版確認對話框（使用 window.confirm）
 */
export function simpleConfirm(message: string): boolean {
  return window.confirm(message);
}

/**
 * 使用範例：
 *
 * const { confirm } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: '刪除活動',
 *     message: '確定要刪除此活動嗎？此操作無法復原。',
 *     confirmText: '刪除',
 *     cancelText: '取消',
 *     type: 'danger',
 *   });
 *
 *   if (confirmed) {
 *     // 執行刪除操作
 *   }
 * };
 */
