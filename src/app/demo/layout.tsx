import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://startingmonday.app/demo',
  },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
