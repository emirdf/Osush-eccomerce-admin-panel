import { cn } from '@/lib/cn'

/** Static placeholder block (no shimmer — motion is reserved for user actions). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('rounded-md bg-gray-200', className)} />
}
