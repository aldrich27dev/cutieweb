import { motion } from "framer-motion";
import { useEffect } from "react";

const flowers = ["🌷", "🌹", "🌻", "🌸", "💐", "🌺"];

export default function FlowerBouquet({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative h-dvh w-full bg-slate-950 overflow-hidden flex items-center justify-center">
      {/* Bouquet */}
      {flowers.map((flower, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: (Math.random() - 0.5) * 600, 
            y: (Math.random() - 0.5) * 600, 
            scale: 0 
          }}
          animate={{ 
            x: 0, 
            y: 0, 
            scale: 2, 
            rotate: 360 
          }}
          transition={{ 
            duration: 2, 
            delay: i * 0.2, 
            ease: "backOut" 
          }}
          className="absolute text-4xl"
        >
          {flower}
        </motion.div>
      ))}
      
      {/* Label at the bottom */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}        
        transition={{ delay: 2.5 }}
        className="absolute bottom-70 left-0 w-full text-center text-white text-xl font-bold z-[9]"
      >
        Para sa'yo... 💐
      </motion.div>
    </div>
  );
}