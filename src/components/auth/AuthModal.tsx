'use client'

import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../lib/contexts/AuthContext'

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { signIn, signUp } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        await signUp(email, password, fullName)
      } else {
        await signIn(email, password)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100"
                    >
                      {isRegistering ? 'Create an account' : 'Sign in to your account'}
                    </Dialog.Title>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {isRegistering && (
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-indigo-500"
                        placeholder="Enter your name"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-indigo-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-indigo-500"
                      placeholder="Enter your password"
                    />
                  </div>

                  {isRegistering && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-indigo-500"
                        placeholder="Confirm your password"
                      />
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

                  <div className="mt-5 sm:mt-6 space-y-4">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
                    >
                      {isRegistering ? 'Sign up' : 'Sign in'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(!isRegistering)
                        setError('')
                      }}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    >
                      {isRegistering
                        ? 'Already have an account? Sign in'
                        : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 