import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CoreSense',
  description: 'Real-time tactical defense dashboard for high-altitude anti-drone sentry operations (Ladakh Sector, 4,850m MSL)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
