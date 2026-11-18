import './globals.css';
import { Inter } from 'next/font/google';
import SidebarNavigation from '@/components/SidebarNavigation';
import { MobileHeader, SiteFooter } from '@/components/MobileHeader';
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
              <MobileHeader />

              <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>

              <SiteFooter />
            </div>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
