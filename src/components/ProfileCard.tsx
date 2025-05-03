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
