'use client';

/**
 * Export Button Component
 * 匯出按鈕元件（含下拉選單）
 */

import { useState, useRef, useEffect } from 'react';
import { executeExport, ExportFormat, ExportType } from '@/lib/export';

export interface ExportButtonProps {
  /** 活動 ID */
  eventId: string;
  /** 獎項 ID（選填，用於匯出單一獎項） */
  prizeId?: string;
  /** 按鈕文字 */
  label?: string;
  /** 按鈕樣式 */
  variant?: 'primary' | 'secondary' | 'outline';
  /** 按鈕大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 匯出成功回調 */
  onExportSuccess?: (filename: string) => void;
  /** 匯出失敗回調 */
  onExportError?: (error: string) => void;
}

/**
 * 匯出按鈕元件
 */
export function ExportButton({
  eventId,
  prizeId,
  label = '匯出',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onExportSuccess,
  onExportError,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = async (format: ExportFormat, type: ExportType) => {
    setIsOpen(false);
    setIsExporting(true);

    try {
      const result = await executeExport({
        format,
        type,
        eventId,
        prizeId,
      });

      if (result.success && result.filename) {
        onExportSuccess?.(result.filename);
      } else {
        onExportError?.(result.error || '匯出失敗');
      }
    } catch (error) {
      onExportError?.(error instanceof Error ? error.message : '匯出失敗');
    } finally {
      setIsExporting(false);
    }
  };

  // Button styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
    disabled || isExporting ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className={buttonClasses}
      >
        {isExporting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            匯出中...
          </>
        ) : (
          <>
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {label}
            <svg
              className="ml-2 -mr-1 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isExporting && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu">
            {/* CSV Options */}
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              CSV 格式
            </div>
            <button
              onClick={() => handleExport('csv', 'results')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              匯出中獎名單 (CSV)
            </button>

            {prizeId && (
              <button
                onClick={() => handleExport('csv', 'prize')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                role="menuitem"
              >
                <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                匯出本獎項得主 (CSV)
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />

            {/* JSON Options */}
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              JSON 格式
            </div>
            <button
              onClick={() => handleExport('json', 'results')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              匯出中獎名單 (JSON)
            </button>

            <button
              onClick={() => handleExport('json', 'full-backup')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              完整備份 (JSON)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
