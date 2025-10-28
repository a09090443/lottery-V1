import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '抽獎系統',
  description: '單機版網頁抽獎系統 - Browser-Based Lottery System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">{children}</body>
    </html>
  );
}
