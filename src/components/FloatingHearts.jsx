import { motion } from "framer-motion";
import { useMemo } from "react";

export default function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 15 }, (_, index) => ({
        id: index,
        left: `${(index * 100) / 15}%`,
        duration: 5 + (index % 5) * 0.8,
        delay: (index % 5) * 0.6,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear",
          }}
          className="absolute text-2xl text-pink-500/20"
          style={{ left: heart.left }}
        >
          &hearts;
        </motion.div>
      ))}
    </div>
  );
}
