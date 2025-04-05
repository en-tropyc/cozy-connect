import { motion } from 'framer-motion';

interface BalloonProps {
  emoji: string;
  delay: number;
  x: number;
}

function Balloon({ emoji, delay, x }: BalloonProps) {
  return (
    <motion.div
      className="absolute text-4xl z-50"
      initial={{ y: -100, x, scale: 0 }}
      animate={{ 
        y: '100vh', 
        scale: [0, 1, 1, 1],
        rotate: [0, 0, 360, 360]
      }}
      transition={{
        duration: 3,
        delay,
        ease: "linear",
        times: [0, 0.2, 0.8, 1],
      }}
    >
      {emoji}
    </motion.div>
  );
}

export default function MatchAnimation() {
  const balloons = [
    { emoji: '🎈', delay: 0, x: -100 },
    { emoji: '🎈', delay: 0.2, x: -50 },
    { emoji: '🎈', delay: 0.4, x: 0 },
    { emoji: '🎈', delay: 0.6, x: 50 },
    { emoji: '🎈', delay: 0.8, x: 100 },
    { emoji: '🎉', delay: 0.1, x: -75 },
    { emoji: '🎉', delay: 0.3, x: -25 },
    { emoji: '🎉', delay: 0.5, x: 25 },
    { emoji: '🎉', delay: 0.7, x: 75 },
    { emoji: '❤️', delay: 0.15, x: -60 },
    { emoji: '❤️', delay: 0.35, x: -10 },
    { emoji: '❤️', delay: 0.55, x: 40 },
    { emoji: '❤️', delay: 0.75, x: 90 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {balloons.map((balloon, index) => (
        <Balloon key={index} {...balloon} />
      ))}
    </div>
  );
} 
