"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, TrendingUp, Sparkles } from "lucide-react";

interface CelebrationAnimationProps {
  show: boolean;
  increase: number;
  message?: string;
}

export function CelebrationAnimation({ show, increase, message }: CelebrationAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          {/* Confetti particles */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                y: -20,
                x: `${particle.x}%`,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 100,
                opacity: [1, 1, 0],
                rotate: 360,
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: "easeOut",
              }}
              className="absolute text-2xl"
              style={{
                left: `${particle.x}%`,
              }}
            >
              {["🎉", "🎊", "✨", "⭐", "💫"][particle.id % 5]}
            </motion.div>
          ))}

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="bg-gradient-to-br from-primary/90 to-primary/70 backdrop-blur-sm text-primary-foreground rounded-2xl shadow-2xl p-8 border-4 border-primary/50 max-w-md mx-4 pointer-events-auto"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="flex justify-center"
              >
                <PartyPopper className="h-16 w-16 text-yellow-300" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold"
              >
                🎊 Downloads Increased! 🎊
              </motion.h3>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex items-center justify-center gap-2 text-xl"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="font-bold">+{increase.toLocaleString()}</span>
                <span className="text-sm">more downloads today!</span>
              </motion.div>

              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm opacity-90 mt-2"
                >
                  {message}
                </motion.p>
              )}

              {/* Sparkle effects */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute"
                  style={{
                    top: `${20 + (i % 4) * 20}%`,
                    left: `${10 + (i % 2) * 80}%`,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
