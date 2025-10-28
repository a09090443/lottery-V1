/**
 * Vitest 測試環境設定
 * 此檔案會在所有測試執行前載入
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// IndexedDB 模擬
import { IDBKeyRange, indexedDB } from 'fake-indexeddb';
global.indexedDB = indexedDB as any;
global.IDBKeyRange = IDBKeyRange as any;

// localStorage 模擬
import 'vitest-localstorage-mock';

// 每個測試後清理
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// 模擬 Web Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn(async (algorithm: string, data: ArrayBuffer) => {
        // 簡化的 hash 實作用於測試
        const uint8Array = new Uint8Array(data);
        const hashArray = Array.from(uint8Array);
        return new Uint8Array(hashArray).buffer;
      }),
    },
    randomUUID: vi.fn(() => '550e8400-e29b-41d4-a716-446655440000'),
  },
});
