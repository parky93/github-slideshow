'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  TrendingUp,
  Settings,
  Mountain,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/qualifications', label: 'Library', icon: BookOpen },
  { href: '/history', label: 'Progress', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface AppShellProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  backHref?: string
  headerRight?: React.ReactNode
}

export function AppShell({
  children,
  title,
  showBack,
  backHref,
  headerRight,
}: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top header */}
      {title && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
            {showBack && backHref && (
              <Link
                href={backHref}
                className="p-1 -ml-1 rounded-md hover:bg-accent touch-target flex items-center"
              >
                <ChevronRight className="h-5 w-5 rotate-180 text-muted-foreground" />
              </Link>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-base truncate">{title}</h1>
            </div>
            {headerRight && <div>{headerRight}</div>}
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 pb-20 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t safe-bottom">
        <div className="flex items-center justify-around max-w-2xl mx-auto px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors touch-target',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
