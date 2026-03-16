import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SessionProviderWrapper } from '@/components/session-provider';

export const metadata: Metadata = {
  title: 'Inventory Intelligence',
  description: 'Internal inventory analytics MVP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
