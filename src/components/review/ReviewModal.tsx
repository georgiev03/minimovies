'use client'

import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTheme } from '@/lib/contexts/ThemeContext'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  movie: {
    id: string
    title: string
  }
}

export default function ReviewModal({ isOpen, onClose, movie }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isDark } = useTheme()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          rating,
          review,
        })

      if (error) throw error
      onClose()
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsSubmitting(false)
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
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6`}>
                <div>
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className={`rounded-md ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } text-gray-400 hover:text-gray-500 dark:hover:text-gray-300`}
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className={`text-lg font-semibold leading-6 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Review {movie.title}
                    </Dialog.Title>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    } mb-2`}>
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <StarIcon
                            className={`h-8 w-8 ${
                              (hoverRating || rating) >= star
                                ? 'text-yellow-400'
                                : isDark ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review" className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    } mb-2`}>
                      Review
                    </label>
                    <textarea
                      id="review"
                      rows={4}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className={`block w-full rounded-md border-0 py-1.5 ${
                        isDark ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'
                      } shadow-sm ring-1 ring-inset ${
                        isDark ? 'ring-gray-600' : 'ring-gray-300'
                      } placeholder:${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      } focus:ring-2 focus:ring-inset focus:${
                        isDark ? 'ring-indigo-500' : 'ring-indigo-600'
                      } sm:text-sm sm:leading-6`}
                      placeholder="Share your thoughts about the movie..."
                    />
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="submit"
                      disabled={rating === 0 || isSubmitting}
                      className={`inline-flex w-full justify-center rounded-md ${
                        isDark ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500'
                      } px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:${
                        isDark ? 'outline-indigo-400' : 'outline-indigo-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
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