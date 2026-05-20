import { PHProvider } from '@/components/PosthogProvider'

export default function ForCoachesLayout({ children }: { children: React.ReactNode }) {
  return <PHProvider>{children}</PHProvider>
}
