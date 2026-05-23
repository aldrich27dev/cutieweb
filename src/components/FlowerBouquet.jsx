import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";

const flowers = ["flower", "rose", "sun", "blossom", "spark", "petal"];

export default function FlowerBouquet({ onComplete }) {
  const bouquet = useMemo(
    () =>
      flowers.map((flower, index) => ({
        id: flower,
        x: (index - 2.5) * 120,
        y: (index % 2 === 0 ? -1 : 1) * 80,
        delay: index * 0.2,
      })),
    [],
  );

  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-slate-950">
      {bouquet.map((item) => (
        <motion.div
          key={item.id}
          initial={{ x: item.x, y: item.y, scale: 0 }}
          animate={{ x: 0, y: 0, scale: 2, rotate: 360 }}
          transition={{
            duration: 2,
            delay: item.delay,
            ease: "backOut",
          }}
          className="absolute text-4xl"
        >
          *
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-[70px] left-0 z-[9] w-full text-center text-xl font-bold text-white"
      >
        For you
      </motion.div>
    </div>
  );
}
