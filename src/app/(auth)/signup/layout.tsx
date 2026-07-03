import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://startingmonday.app/signup',
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
