"use client"

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        // Use window.location for full page reload to ensure cookie is set
        window.location.href = '/'
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid password')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-gray-200 bg-white">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Eklair Influencer Search
            </h1>
            <p className="text-sm text-gray-600">
              Enter your password to access the platform
            </p>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                required
              />
              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2.5"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Need help getting started?</p>
            <Link
              href="/support"
              className="text-sm text-blue-900 hover:text-blue-700 font-medium"
            >
              View our deployment and support services →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
