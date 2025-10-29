'use client';

/**
 * Protected Route Component
 * 保護管理端路由，需登入才能存取
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isLoggedIn } from '@/lib/auth/admin-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // 登入頁面不需要保護
      if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      if (!isLoggedIn()) {
        router.push('/admin/login');
      } else {
        setIsAuthorized(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">驗證中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
