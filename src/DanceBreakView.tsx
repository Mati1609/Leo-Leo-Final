/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
 
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Music } from 'lucide-react';
import { soundService } from './services/soundService';
 
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
 
export const DanceBreakView = ({ onFinish }: DanceBreakViewProps) => {
  const [countdown, setCountdown] = useState(12);
 
  useEffect(() => {
    if (countdown <= 0) { onFinish(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onFinish]);
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
 
  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#A9C9D9' }}
    >
      {/* Paw-print background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: "url('/huella.png')",
          backgroundSize: '80px',
          backgroundRepeat: 'repeat',
        }}
      />
 
      {/* Bouncing animals */}
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
     
        return (
          <motion.div
            key={i}
            style={posStyle}
            className="pointer-events-none"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: a.dur, repeat: Infinity, delay: a.delay, ease: 'easeInOut' }}
          >
            <img
              src={a.src}
              alt="personaje"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-lg"
              style={a.flip ? { transform: 'scaleX(-1)' } : undefined}
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                if (!t.src.includes('logo.png')) t.src = '/logo.png';
              }}
            />
          </motion.div>
        );
      })}
 
      {/* Central white card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 mx-4 w-full max-w-xs text-center"
        style={{ border: '3px solid rgba(255,255,255,0.9)' }}
      >
        {/* Music note */}
        <div
          className="text-4xl mb-3 select-none"
          style={{ color: 'var(--color-on-surface-variant, #6b7280)' }}
        >
          ♩♫
        </div>
 
        <h1 className="text-3xl font-black text-on-surface mb-3 tracking-tight">
          ¡Hora de Bailar!
        </h1>
 
        <p className="text-on-surface-variant font-medium text-base leading-snug mb-8">
          ¡Si se detecta que bailas, los puntos serán dobles!
        </p>
 
        {/* Animated countdown */}
        <motion.div
          key={countdown}
          initial={{ scale: 1.25, opacity: 0.5 }}
          animate={{ scale: 1,    opacity: 1   }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="inline-flex items-baseline gap-2 bg-secondary-container rounded-2xl border-b-4 border-secondary px-10 py-4 mb-6"
        >
          <span className="text-5xl font-black text-on-surface">{countdown}</span>
          <span className="text-xl font-bold text-on-surface-variant">seg</span>
        </motion.div>
 
        <button
          onClick={onFinish}
          className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-lg chunky-button chunky-shadow-primary"
        >
          ¡Saltar!
        </button>
      </motion.div>
    </div>
  );
})
 
export default DanceBreakView;
