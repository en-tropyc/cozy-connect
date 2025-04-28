import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Profile } from '@/lib/airtable';
import Image from 'next/image';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface ProfileCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
  style?: {
    zIndex?: number;
    scale?: number;
    opacity?: number;
    translateY?: number;
  };
  isMatch?: boolean;
}

export default function ProfileCard({ 
  profile, 
  onSwipeLeft, 
  onSwipeRight, 
  isActive, 
  style = {}, 
  isMatch = false
}: ProfileCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const cardOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const [imageError, setImageError] = useState(false);
  
  const backgroundOpacity = useTransform(x, [-200, -100, 0, 100, 200], [1, 0, 0, 0, 1]);
  const backgroundColor = useTransform(x, [-200, 0, 200], ['#ef4444', '#ffffff', '#22c55e']);

  return (
    <motion.div
      className="absolute w-full h-[calc(100vh-160px)] max-w-md bg-white rounded-3xl shadow-xl overflow-hidden"
      style={{
        x,
        rotate,
        opacity: style.opacity ?? cardOpacity,
        zIndex: style.zIndex ?? 0,
        scale: style.scale ?? 1,
        translateY: style.translateY ?? 0,
        willChange: 'transform, opacity',
      }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) {
          onSwipeRight();
        } else if (info.offset.x < -100) {
          onSwipeLeft();
        }
      }}
      initial={{ scale: style.scale ?? 0.95, opacity: 0 }}
      animate={{ 
        scale: style.scale ?? 1, 
        opacity: style.opacity ?? 1,
      }}
      exit={{ scale: style.scale ?? 0.95, opacity: 0 }}
      layout={false}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
    >
      {/* Background color indicator for swipe direction */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ opacity: backgroundOpacity, backgroundColor }}
      />

      {/* Profile content */}
      <div className="relative h-full w-full">
        {/* Swipe indicators at the top */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-center z-20">
          <motion.div 
            className="rounded-full bg-green-500 px-6 py-2"
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          >
            <span className="text-white font-semibold">Interested!</span>
          </motion.div>
          <motion.div 
            className="rounded-full bg-red-500 px-6 py-2"
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          >
            <span className="text-white font-semibold">Not Interested</span>
          </motion.div>
        </div>

        {/* Profile image */}
        <div className="absolute inset-0">
          {profile.picture?.[0]?.url && !imageError ? (
            <Image
              src={profile.picture[0].url}
              alt={profile.name}
              fill
              className="object-cover"
              priority={0 === 0}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={75}
              loading={0 === 0 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QjY4NC43OC0tQkY/RU9NTkJCSY6NkZBJjpCNkZH/2wBDARUXFx4aHR4eHZGMJSORkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-24 h-24 rounded-full bg-gray-400 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-600 text-lg">No Image Available</span>
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/90" />
        </div>

        {/* Profile info overlay */}
        <div className="absolute bottom-0 left-0 right-0 text-white z-10">
          {/* Profile info content */}
          <div className="p-6 space-y-4">
            {/* Basic Info Section */}
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <h2 className="text-3xl font-bold">{profile.name}</h2>
                {profile.location && (
                  <span className="text-sm opacity-90">{profile.location}</span>
                )}
              </div>
              {profile.companyTitle && (
                <p className="text-base opacity-90">{profile.companyTitle}</p>
              )}
            </div>

            {/* Categories Section */}
            {profile.categories && profile.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Bio Section */}
            {profile.shortIntro && (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed opacity-90 line-clamp-3">{profile.shortIntro}</p>
              </div>
            )}

            {/* Looking For & Can Offer Section */}
            <div className="space-y-2">
              {profile.lookingFor && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase opacity-75">Looking for</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{profile.lookingFor}</p>
                </div>
              )}
              {profile.canOffer && (
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold uppercase opacity-75">Can offer</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{profile.canOffer}</p>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              {profile.instagram && (
                <a
                  href={
                    profile.instagram.startsWith('http')
                      ? profile.instagram
                      : `https://instagram.com/${profile.instagram.replace('@', '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {profile.linkedinLink && (
                <a
                  href={profile.linkedinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Action buttons at the bottom */}
          <div className="bg-black/40 backdrop-blur-sm p-4 flex justify-center gap-8 items-center">
            <button
              onClick={onSwipeLeft}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              disabled={!isActive}
            >
              <XMarkIcon className="w-8 h-8 text-red-500" />
            </button>
            <button
              onClick={onSwipeRight}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              disabled={!isActive}
            >
              <HeartIcon className="w-8 h-8 text-green-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 
