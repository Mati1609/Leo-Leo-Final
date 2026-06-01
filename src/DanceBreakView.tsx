import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music } from 'lucide-react';
import { soundService } from '../services/soundService';

interface DanceBreakViewProps {
  onFinish: () => void;
}

const PETS = [
  '/leon-lenguaje.png',
  '/leon-matematicas.png',
  '/leon-historia.png',
  '/leon-ciencias.png',
  '/leon base.png',
  '/puma.png',
  '/panda.png',
  '/tigre.png'
];

export const DanceBreakView: React.FC<DanceBreakViewProps> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    soundService.playDanceMusic();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      soundService.stopDanceMusic();
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      onFinishRef.current();
    }
  }, [timeLeft]);

  return (
    <main className="min-h-screen bg-primary-container flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div 
        className="fixed inset-0 pointer-events-none opacity-10" 
        style={{ backgroundImage: "url('/huella.png')", backgroundSize: '150px', backgroundRepeat: 'repeat' }}
      />
      {/* Scattered Characters */}
      {PETS.map((petSrc, idx) => {
        const angle = (idx / PETS.length) * Math.PI * 2;
        const leftOffset = Math.cos(angle) * 38; // 38% from center
        const topOffset = Math.sin(angle) * 38; // 38% from center
        
        return (
          <div 
            key={idx}
            className="absolute z-0 pointer-events-none"
            style={{
              left: `calc(50% + ${leftOffset}vw)`,
              top: `calc(50% + ${topOffset}vh)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.div 
              animate={{ 
                y: [0, -30, 0, -30, 0],
                rotate: [0, 15, -15, 15, 0],
                scale: [1, 1.1, 1, 1.1, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "easeInOut",
                delay: idx * 0.15
              }}
              className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl"
            >
              <img src={petSrc} alt={`Mascota ${idx}`} className="w-full h-full object-contain pointer-events-none" />
            </motion.div>
          </div>
        );
      })}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center z-10 bg-white p-8 rounded-3xl border-4 border-surface-dim shadow-xl max-w-md w-full"
      >
        <div className="flex justify-center mb-4">
          <Music className="w-12 h-12 text-primary animate-bounce" />
        </div>
        <h1 className="text-4xl font-extrabold text-primary mb-4">¡Hora de Bailar!</h1>
        <p className="text-xl text-on-surface-variant font-medium mb-8">
          ¡Si se detecta que bailas los puntos serán dobles!
        </p>
        
        <div className="bg-secondary-container text-on-secondary-container rounded-2xl py-6 px-12 border-4 border-secondary chunky-shadow-secondary inline-block">
          <span className="text-6xl font-black">{timeLeft}</span>
          <span className="text-2xl font-bold ml-2">seg</span>
        </div>
      </motion.div>

      {/* Floating music notes */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: "110vh", 
            x: Math.random() * window.innerWidth,
            opacity: 0.8
          }}
          animate={{ 
            y: "-10vh",
            x: `calc(${Math.random() * 100}vw)`,
            rotate: 360
          }}
          transition={{ 
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute text-4xl text-primary opacity-30 pointer-events-none"
        >
          {i % 2 === 0 ? '🎵' : '🎶'}
        </motion.div>
      ))}
    </main>
  );
};
