/**
 * Admin Layout
 * 管理端 layout，包含 ProtectedRoute 保護
 */

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ConfirmDialogProvider } from '@/components/common/ConfirmDialog';

export const metadata = {
  title: '管理端 - 抽獎系統',
  description: '單機版網頁抽獎系統管理端',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmDialogProvider>
      <ProtectedRoute>{children}</ProtectedRoute>
    </ConfirmDialogProvider>
  );
}
