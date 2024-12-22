import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { AuthGuard } from '@/components/auth-guard';
import { FloatingDock } from '@/components/floating-dock';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cerebral Sync',
  description: 'A place where you can drop ideas of project components and divide work and organise meetings and resources.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthGuard>
              <div className="grid-background flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                  <FloatingDock />
                </main>
                <Toaster />
              </div>
            </AuthGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
