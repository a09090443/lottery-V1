'use client';

/**
 * Participant Import Component
 * 參與者 CSV 匯入元件
 */

import { useState, useRef } from 'react';
import { importParticipantsCSV, previewParticipantsCSV, ImportError } from '@/lib/import/csvImport';
import { ParticipantCSVRow } from '@/lib/import/csvValidator';

export interface ParticipantImportProps {
  eventId: string;
  onSuccess?: (importedCount: number) => void;
  onCancel?: () => void;
}

type ImportStep = 'select' | 'preview' | 'importing' | 'complete';

export function ParticipantImport({ eventId, onSuccess, onCancel }: ParticipantImportProps) {
  const [step, setStep] = useState<ImportStep>('select');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ParticipantCSVRow[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [importResult, setImportResult] = useState<{
    totalRows: number;
    importedCount: number;
    skippedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // 預覽 CSV
    try {
      const result = await previewParticipantsCSV(selectedFile, eventId);
      setPreviewData(result.validRows);
      setErrors(result.errors);
      setStep('preview');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'CSV 解析失敗');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setStep('importing');

    try {
      const result = await importParticipantsCSV(file, { eventId, skipDuplicates: true });
      setImportResult({
        totalRows: result.totalRows,
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
      });
      setErrors(result.errors);
      setStep('complete');
      onSuccess?.(result.importedCount);
    } catch (err) {
      alert(err instanceof Error ? err.message : '匯入失敗');
      setStep('preview');
    }
  };

  const handleReset = () => {
    setStep('select');
    setFile(null);
    setPreviewData([]);
    setErrors([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 選擇檔案 */}
      {step === 'select' && (
        <div>
          <div className="rounded-md bg-blue-50 p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">CSV 檔案格式說明</h3>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>必要欄位：<code className="bg-blue-100 px-1 rounded">name</code></li>
              <li>
                可選欄位：
                <code className="bg-blue-100 px-1 rounded mx-1">employeeId</code>
                <code className="bg-blue-100 px-1 rounded mx-1">nationalId</code>
                <code className="bg-blue-100 px-1 rounded mx-1">email</code>
                <code className="bg-blue-100 px-1 rounded mx-1">phone</code>
              </li>
              <li>至少需提供 employeeId 或 nationalId 其中一項</li>
              <li>第一列為標題列</li>
            </ul>
          </div>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">點擊上傳</span> 或拖曳檔案至此
                </p>
                <p className="text-xs text-gray-500">CSV 檔案</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>
      )}

      {/* 預覽 */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">預覽匯入資料</h3>
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              重新選擇檔案
            </button>
          </div>

          {errors.length > 0 && (
            <div className="rounded-md bg-red-50 p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                發現 {errors.length} 個錯誤或警告
              </h4>
              <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto">
                {errors.slice(0, 10).map((error, index) => (
                  <li key={index}>
                    {error.rowIndex && `列 ${error.rowIndex}: `}
                    {error.message}
                  </li>
                ))}
                {errors.length > 10 && <li>...以及其他 {errors.length - 10} 個錯誤</li>}
              </ul>
            </div>
          )}

          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">
              可匯入 <strong>{previewData.length}</strong> 筆有效資料
            </p>
          </div>

          {previewData.length > 0 && (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-2 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-6">
                      姓名
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">員工編號</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">
                      身分證字號
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">電話</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {previewData.slice(0, 50).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-xs text-gray-900 sm:pl-6">
                        {row.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                        {row.employeeId || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                        {row.nationalId || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                        {row.email || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                        {row.phone || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 50 && (
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
                  僅顯示前 50 筆，實際將匯入 {previewData.length} 筆
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                取消
              </button>
            )}
            <button
              onClick={handleImport}
              disabled={previewData.length === 0}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              開始匯入
            </button>
          </div>
        </div>
      )}

      {/* 匯入中 */}
      {step === 'importing' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">正在匯入資料...</p>
        </div>
      )}

      {/* 完成 */}
      {step === 'complete' && importResult && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">匯入完成</h3>
          </div>

          <div className="rounded-md bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">總筆數：</span>
              <span className="font-medium text-gray-900">{importResult.totalRows}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">成功匯入：</span>
              <span className="font-medium text-green-600">{importResult.importedCount}</span>
            </div>
            {importResult.skippedCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">跳過（重複）：</span>
                <span className="font-medium text-orange-600">{importResult.skippedCount}</span>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div className="rounded-md bg-yellow-50 p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">警告與錯誤</h4>
              <ul className="text-xs text-yellow-700 space-y-1 max-h-40 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index}>
                    {error.rowIndex && `列 ${error.rowIndex}: `}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleReset}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              繼續匯入
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                完成
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
