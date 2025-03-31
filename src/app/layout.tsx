import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MiniMovies - Watch Short Videos',
  description: 'A platform for watching and sharing short videos',
}

// Add script to handle initial theme
function setInitialTheme() {
  return {
    __html: `
      (function() {
        function getInitialTheme() {
          const savedTheme = localStorage.getItem('theme')
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          
          return savedTheme === 'dark' || (!savedTheme && prefersDark) ? 'dark' : ''
        }
        
        document.documentElement.classList.add(getInitialTheme())
      })()
    `,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={setInitialTheme()} />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 