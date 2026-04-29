import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "StartingMonday – Find Your Dream Job",
  description:
    "Browse hand-picked job opportunities from the world's best companies. Land the role that moves your career forward.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              StartingMonday
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Jobs
              </Link>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Companies
              </a>
              <a
                href="#"
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                Post a job
              </a>
            </div>
          </div>
        </nav>

        {children}

        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p className="font-semibold text-gray-600">StartingMonday</p>
            <p>
              © {new Date().getFullYear()} StartingMonday. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-600 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-gray-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
