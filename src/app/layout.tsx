import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PS 26050 — High Altitude Counter-UAS Mission Control',
  description: 'Real-time tactical defense dashboard for high-altitude anti-drone sentry operations (Ladakh Sector, 4,850m MSL)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b12] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
