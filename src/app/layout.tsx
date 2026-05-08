import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PHProvider } from "@/components/PosthogProvider";
import { ToastProvider } from "@/lib/toast";
import { CommandPalette } from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Starting Monday — AI Career Platform for Senior Technology Executives',
    template: '%s — Starting Monday',
  },
  description: 'Pipeline tracking, company intelligence, and AI-powered interview prep for CIOs, CTOs, and senior technology executives in active search.',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PHProvider>
          <ToastProvider>
            {children}
            <CommandPalette />
          </ToastProvider>
        </PHProvider>
      </body>
    </html>
  );
}
