import Link from 'next/link'
import { Mountain } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <Mountain className="h-12 w-12 text-mountain-600 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6 max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-primary font-medium hover:underline"
      >
        Back to home →
      </Link>
    </div>
  )
}
