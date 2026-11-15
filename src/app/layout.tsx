import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import SidebarNavigation from '@/components/SidebarNavigation';
import { AuthProvider } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n/context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ChessArena — Pro Chess Platform',
  description: 'Play pro chess, online streaming, interactive academy, live coaching, and tournaments in Arabic, English, and French.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-text-primary min-h-screen flex flex-col md:flex-row`}>
        <AuthProvider>
          <I18nProvider>
            {/* Persistent Sidebar Navigation */}
            <SidebarNavigation />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
              <header className="md:hidden bg-background-secondary border-b border-text-secondary/15 p-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/" className="text-xl font-bold text-accent">
                  ChessArena
                </Link>
                <nav aria-label="Primary navigation" className="flex items-center gap-1">
                  <Link href="/play" className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white">
                    Play
                  </Link>
                  <Link href="/learn" className="rounded-lg px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary">
                    Learn
                  </Link>
                  <Link href="/live" className="rounded-lg px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary">
                    Live
                  </Link>
                  <Link href="/sessions" className="rounded-lg px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary">
                    Sessions
                  </Link>
                  <Link href="/auth/login" className="rounded-lg bg-background-tertiary px-2.5 py-1.5 text-xs text-text-primary">
                    Login
                  </Link>
                </nav>
              </header>

              <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>

              <footer className="bg-background-secondary border-t border-text-secondary/15 py-6 px-4 text-center text-text-secondary text-sm">
                <p>&copy; 2026 ChessArena. Inspired by Chess.com & Lichess. All rights reserved.</p>
              </footer>
            </div>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
