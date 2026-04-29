import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { OfflineState } from '@/components/ui/states/OfflineState';

export const metadata: Metadata = {
  title: 'Aureus Market Analytics',
  description: 'Análise Avançada e Arbitragem para o Mercado de Albion Online',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[var(--mw-bg)] text-[var(--mw-text-main)] min-h-screen selection:bg-[var(--mw-gold-primary)]/30 font-sans" suppressHydrationWarning>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--mw-gold-primary)]/10 via-[var(--mw-bg)] to-[var(--mw-bg)] pointer-events-none z-[-1]" />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster theme="dark" position="top-right" />
        <OfflineState />
      </body>
    </html>
  );
}
