import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ComfyUI SaaS Platform',
  description: 'AI Workflow Generation Platform powered by RunningHub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-background font-sans text-foreground`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
            <Link href="/" className="flex items-center space-x-2 mr-6">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="hidden font-bold sm:inline-block">
                ComfyUI SaaS
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
              <Link
                href="/"
                className="transition-colors hover:text-foreground/80 text-foreground"
              >
                工作流市场
              </Link>
              <Link
                href="/admin"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                工作台
              </Link>
            </nav>
            <div className="flex items-center justify-end space-x-4">
              <div className="text-sm font-medium border px-3 py-1 rounded-full border-primary/20 bg-primary/10 text-primary">
                积分: 1500
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8 max-w-screen-2xl">
          {children}
        </main>
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row px-4 mx-auto max-w-screen-2xl">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by Jules. The ComfyUI SaaS Platform.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
