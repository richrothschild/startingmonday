import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Starting Monday - The Operating System for Senior Executives',
    template: '%s - Starting Monday',
  },
  description: 'Pipeline tracking, company intelligence, and AI-powered interview prep for senior executives in active search.',
  keywords: [
    'executive job search',
    'CIO job search',
    'CTO job search',
    'AI career platform',
    'executive search tools',
    'technology executive career',
    'job search tracker executives',
    'VP CIO transition',
    'executive interview prep',
    'senior technology executive',
  ],
  metadataBase: new URL('https://startingmonday.app'),
  alternates: {
    canonical: './',
  },
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/apple-icon',
  },
  openGraph: {
    siteName: 'Starting Monday',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@startingmonday',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
