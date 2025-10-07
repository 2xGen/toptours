import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedHeroBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const dots = Array.from({ length: 3 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((_, i) => {
        const size = Math.random() * 150 + 100;
        const duration = Math.random() * 15 + 20;
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              width: size,
              height: size,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              x: [0, Math.random() * 150 - 75, Math.random() * 150 - 75, 0],
              y: [0, Math.random() * 150 - 75, Math.random() * 150 - 75, 0],
              backgroundColor: [
                "rgba(255, 107, 107, 0.15)",
                "rgba(72, 219, 251, 0.2)",
                "rgba(254, 202, 87, 0.2)",
                "rgba(102, 126, 234, 0.15)",
                "rgba(255, 107, 107, 0.15)",
              ],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

export default AnimatedHeroBackground;