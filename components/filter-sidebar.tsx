"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { useState, useCallback } from 'react'

interface Filters {
  minFollowers: number
  minEngagement: number
  verifiedOnly: boolean
  qualityLevels: ('High' | 'Medium' | 'Low')[]
}

interface FilterSidebarProps {
  onFilterChange: (filters: Filters) => void
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState({
    minFollowers: 0,
    minEngagement: 0,
    verifiedOnly: false,
    qualityLevels: ['High', 'Medium', 'Low'] as ('High' | 'Medium' | 'Low')[]
  })

  const handleQualityToggle = (level: 'High' | 'Medium' | 'Low') => {
    const newLevels: ('High' | 'Medium' | 'Low')[] = filters.qualityLevels.includes(level)
      ? filters.qualityLevels.filter(l => l !== level)
      : [...filters.qualityLevels, level]

    const updatedFilters: Filters = { ...filters, qualityLevels: newLevels }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleReset = () => {
    const resetFilters: Filters = {
      minFollowers: 0,
      minEngagement: 0,
      verifiedOnly: false,
      qualityLevels: ['High', 'Medium', 'Low']
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg">
      <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50/80 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-700" />
            Filters
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="text-gray-500 hover:text-blue-900"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quality Level Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-700" />
            Quality Level
          </h4>
          <div className="space-y-2">
            {(['High', 'Medium', 'Low'] as const).map((level) => {
              const colors = {
                High: 'border-green-600 text-green-700',
                Medium: 'border-yellow-600 text-yellow-700',
                Low: 'border-red-600 text-red-700'
              }
              
              return (
                <label 
                  key={level}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-200 cursor-pointer transition-all"
                >
                  <Checkbox
                    checked={filters.qualityLevels.includes(level)}
                    onCheckedChange={() => handleQualityToggle(level)}
                    className={`border-gray-300 ${filters.qualityLevels.includes(level) ? 'bg-blue-700 border-blue-700' : ''}`}
                  />
                  <span className={`font-semibold text-sm ${colors[level]}`}>
                    {level} Quality
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Minimum Followers */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Minimum Followers</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              max="10000000"
              step="1000"
              value={filters.minFollowers}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                const updatedFilters: Filters = { ...filters, minFollowers: value }
                setFilters(updatedFilters)
                onFilterChange(updatedFilters)
              }}
              className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-700/30"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updatedFilters: Filters = { ...filters, minFollowers: 0 }
                setFilters(updatedFilters)
                onFilterChange(updatedFilters)
              }}
              className="border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Slider
            value={[filters.minFollowers]}
            onValueChange={(values: number[]) => {
              const updatedFilters: Filters = { ...filters, minFollowers: values[0] }
              setFilters(updatedFilters)
              onFilterChange(updatedFilters)
            }}
            max={10000000}
            step={10000}
            className="[&_[data-orientation=horizontal]>span]:bg-blue-700/40 [&_[role=slider]]:border-blue-700 [&_[role=slider]]:bg-white"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>10M</span>
          </div>
        </div>

        {/* Minimum Engagement Rate */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Min Engagement Rate (%)</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={filters.minEngagement}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                const updatedFilters: Filters = { ...filters, minEngagement: value }
                setFilters(updatedFilters)
                onFilterChange(updatedFilters)
              }}
              className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-700/30"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updatedFilters: Filters = { ...filters, minEngagement: 0 }
                setFilters(updatedFilters)
                onFilterChange(updatedFilters)
              }}
              className="border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Slider
            value={[filters.minEngagement]}
            onValueChange={(values: number[]) => {
              const updatedFilters: Filters = { ...filters, minEngagement: values[0] }
              setFilters(updatedFilters)
              onFilterChange(updatedFilters)
            }}
            max={20}
            step={0.5}
            className="[&_[data-orientation=horizontal]>span]:bg-blue-700/40 [&_[role=slider]]:border-blue-700 [&_[role=slider]]:bg-white"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Verified Only */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Account Status</h4>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-200 cursor-pointer transition-all">
            <Checkbox
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => {
                const newFilters = { ...filters, verifiedOnly: checked as boolean }
                setFilters(newFilters)
                onFilterChange(newFilters)
              }}
              className={`border-gray-300 ${filters.verifiedOnly ? 'bg-blue-700 border-blue-700' : ''}`}
            />
            <span className="text-sm text-gray-700 font-medium">Verified accounts only</span>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
