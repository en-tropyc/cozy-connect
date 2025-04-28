import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import type { Match } from '@/app/matches/MatchesClient'

interface ProfileModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ match, isOpen, onClose }: ProfileModalProps) {
  if (!match) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="relative h-96 -mx-6 -mt-6 mb-6 bg-gray-100">
                  {match.picture?.[0]?.url ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={match.picture[0].url}
                        alt={match.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-6xl text-gray-600">
                        {match.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      {match.name}
                    </Dialog.Title>
                    {match.companyTitle && (
                      <p className="mt-1 text-lg text-gray-600">{match.companyTitle}</p>
                    )}
                    {match.location && (
                      <p className="mt-1 text-gray-600">{match.location}</p>
                    )}
                  </div>

                  {match.shortIntro && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">About</h3>
                      <p className="mt-2 text-gray-600">{match.shortIntro}</p>
                    </div>
                  )}

                  {match.categories && match.categories.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Categories/Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {match.categories.map((category: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.lookingFor && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Looking For</h3>
                      <p className="mt-2 text-gray-600">{match.lookingFor}</p>
                    </div>
                  )}

                  {match.canOffer && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Can Offer</h3>
                      <p className="mt-2 text-gray-600">{match.canOffer}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {match.linkedinLink && (
                      <a
                        href={
                          match.linkedinLink.startsWith('http')
                            ? match.linkedinLink
                            : `https://linkedin.com/in/${match.linkedinLink.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {match.instagram && (
                      <a
                        href={
                          match.instagram.startsWith('http')
                            ? match.instagram
                            : `https://instagram.com/${match.instagram.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
