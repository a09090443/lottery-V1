'use client';

/**
 * Error Boundary Component
 * React 錯誤邊界元件
 */

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 錯誤邊界元件
 * 捕獲子元件樹中的 JavaScript 錯誤並顯示錯誤 UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 記錄錯誤到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 呼叫自訂錯誤處理函式
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 使用自訂 fallback 或預設錯誤 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">發生錯誤</h1>
              <p className="text-gray-600">應用程式遇到了一個問題</p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-mono text-red-800 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                重試
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                返回首頁
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>如果問題持續發生，請嘗試：</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>重新整理頁面</li>
                <li>清除瀏覽器快取</li>
                <li>使用無痕模式開啟</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 精簡版錯誤 UI（用於小區塊）
 */
export function CompactErrorFallback({
  error,
  onReset
}: {
  error: Error;
  onReset?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">發生錯誤</h3>
      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          重試
        </button>
      )}
    </div>
  );
}
