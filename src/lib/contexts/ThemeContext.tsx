'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      const initialTheme = savedTheme === 'dark' || (!savedTheme && prefersDark)
      setIsDark(initialTheme)
      document.documentElement.classList.toggle('dark', initialTheme)
    } catch (error) {
      console.error('Error setting initial theme:', error)
    } finally {
      setMounted(true)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    try {
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', newTheme)
    } catch (error) {
      console.error('Error toggling theme:', error)
    }
  }

  // Return a default context value while mounting
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ isDark: false, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 