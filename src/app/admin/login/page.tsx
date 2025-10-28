'use client';

/**
 * Admin Login Page
 * 管理員登入頁面
 */

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  verifyPassword,
  createSession,
  isPasswordSet,
  setPassword,
  checkLockout,
  recordLoginFailure,
  getLoginAttempts,
} from '@/lib/auth/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(!isPasswordSet());
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 檢查鎖定狀態
  useEffect(() => {
    const lockout = checkLockout();
    setIsLocked(lockout.isLocked);
    setRemainingSeconds(lockout.remainingSeconds);

    const attempts = getLoginAttempts();
    setAttemptCount(attempts?.failedCount || 0);

    // 如果被鎖定，設定倒數計時器
    if (lockout.isLocked) {
      const interval = setInterval(() => {
        const newLockout = checkLockout();
        setRemainingSeconds(newLockout.remainingSeconds);

        if (!newLockout.isLocked) {
          setIsLocked(false);
          setAttemptCount(0);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 檢查鎖定狀態
      const lockout = checkLockout();
      if (lockout.isLocked) {
        setIsLocked(true);
        setRemainingSeconds(lockout.remainingSeconds);
        setError(`帳號已被鎖定，請在 ${lockout.remainingSeconds} 秒後重試`);
        return;
      }

      const isValid = await verifyPassword(password);
      if (isValid) {
        createSession();
        router.push('/admin');
      } else {
        recordLoginFailure();
        const attempts = getLoginAttempts();
        const failedCount = attempts?.failedCount || 0;
        setAttemptCount(failedCount);

        if (failedCount >= 5) {
          setIsLocked(true);
          setRemainingSeconds(300); // 5 分鐘
          setError('登入失敗次數過多，帳號已被鎖定 5 分鐘');
        } else {
          setError(`密碼錯誤，還剩 ${5 - failedCount} 次嘗試機會`);
        }
        setPasswordInput('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('密碼長度至少需要 8 字元');
      return;
    }

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setIsLoading(true);

    try {
      await setPassword(password);
      setIsSettingPassword(false);
      setPasswordInput('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定密碼失敗');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">首次設定密碼</h1>

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密碼（至少 8 字元）
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                確認密碼
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
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
                  設定中...
                </>
              ) : (
                '設定密碼'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ 安全提示：</p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 請在安全的環境下使用本系統（個人電腦、專用裝置）</li>
              <li>• 建議密碼包含數字、字母、特殊符號</li>
              <li>• 密碼遺失後需清除所有資料重新設定</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">管理員登入</h1>

        {isLocked && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">🔒 帳號已被鎖定</p>
            <p className="text-sm mt-1">
              登入失敗次數過多，請在 {Math.floor(remainingSeconds / 60)} 分 {remainingSeconds % 60} 秒後重試
            </p>
          </div>
        )}

        {!isLocked && attemptCount > 0 && attemptCount < 5 && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p className="text-sm">
              ⚠️ 已嘗試登入 {attemptCount} 次，還剩 {5 - attemptCount} 次機會
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密碼
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="請輸入管理員密碼"
              required
              disabled={isLocked || isLoading}
            />
          </div>

          {error && !isLocked && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
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
                登入中...
              </>
            ) : isLocked ? (
              '帳號已鎖定'
            ) : (
              '登入'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800 font-semibold mb-2">🔒 安全提示：</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 密碼錯誤 5 次後將鎖定帳號 5 分鐘</li>
            <li>• 請在安全的環境下使用本系統（個人電腦、專用裝置）</li>
            <li>• 使用完畢後請關閉瀏覽器視窗</li>
            <li>• 請勿在公共電腦上登入管理端</li>
            <li>• 本系統資料儲存於瀏覽器本地，請妥善保護裝置安全</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
