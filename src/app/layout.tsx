import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { headers } from 'next/headers'
import { AssistWidget } from "@/components/AssistWidget";
import { getBrandContextFromHosts } from '@/lib/brand'
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

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const brand = getBrandContextFromHosts([
    requestHeaders.get('host'),
    requestHeaders.get('x-forwarded-host'),
  ])

  const description = brand.isMandateSignal
    ? 'MandateSignal helps retained search and recruiting teams detect likely-to-open mandates early, prioritize target accounts, and act before broad posting.'
    : 'Pipeline tracking, company intelligence, and AI-powered interview prep for senior executives in active search.'

  return {
    title: {
      default: `${brand.name} - The Operating System for Senior Executives`,
      template: `%s - ${brand.name}`,
    },
    description,
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
    metadataBase: new URL(brand.origin),
    alternates: {
      canonical: './',
    },
    icons: {
      icon: '/icon',
      shortcut: '/icon',
      apple: '/apple-icon',
    },
    openGraph: {
      siteName: brand.name,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: brand.isMandateSignal ? undefined : '@startingmonday',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

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
        <AssistWidget />
      </body>
    </html>
  );
}
