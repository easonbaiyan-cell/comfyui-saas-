import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'papagaga',
  description: 'ComfyUI Workflow SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`bg-background text-foreground min-h-screen antialiased`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
