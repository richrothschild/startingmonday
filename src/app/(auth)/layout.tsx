import { PHProvider } from '@/components/PosthogProvider'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PHProvider>{children}</PHProvider>
}