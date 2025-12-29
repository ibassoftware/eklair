"use client"

import { Star, FolderOpen, LayoutDashboard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { bucketStorage } from '@/lib/storage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Header() {
  const pathname = usePathname()
  const [leadsCount, setLeadsCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setLeadsCount(bucketStorage.getAll().length)

    const handleLeadsUpdate = () => {
      setLeadsCount(bucketStorage.getAll().length)
    }

    window.addEventListener('bucket-updated', handleLeadsUpdate)

    return () => {
      window.removeEventListener('bucket-updated', handleLeadsUpdate)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center shadow-md cursor-pointer">
              <Star className="w-5 h-5 text-white" />
            </div>
          </Link>
          <div>
            <h1 className="text-gray-900 font-bold text-lg">Eklair Influencer Search</h1>
            <p className="text-gray-500 text-xs">Platform</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`transition-colors text-sm font-medium flex items-center gap-2 ${
              pathname === '/' ? 'text-blue-900' : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/search"
            className={`transition-colors text-sm font-medium ${
              pathname === '/search' ? 'text-blue-900' : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            Search
          </Link>
          <Link
            href="/leads"
            className={`transition-colors text-sm font-medium flex items-center gap-2 ${
              pathname === '/leads' ? 'text-blue-900' : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            Leads
            {mounted && leadsCount > 0 && (
              <Badge variant="secondary" className="h-5 px-2 bg-blue-100 text-blue-800">
                {leadsCount}
              </Badge>
            )}
          </Link>
          <Link
            href="/history"
            className={`transition-colors text-sm font-medium ${
              pathname === '/history' ? 'text-blue-900' : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            History
          </Link>
          <Link
            href="/support"
            className={`transition-colors text-sm font-medium ${
              pathname === '/support' ? 'text-blue-900' : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            Support
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-900 hover:bg-transparent flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}
