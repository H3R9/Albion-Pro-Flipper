import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Albion Pro Flipper',
  description: 'Albion Online Black Market Flipper',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0b0c10] text-slate-100 min-h-screen selection:bg-amber-500/30 font-sans" suppressHydrationWarning>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-[#0b0c10] to-[#0b0c10] pointer-events-none z-[-1]" />
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
