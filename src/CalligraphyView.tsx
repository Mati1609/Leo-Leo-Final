import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Eraser, Check, Volume2, PenTool } from 'lucide-react';
import { soundService } from '../services/soundService';

interface CalligraphyViewProps {
  onBack: () => void;
  onFinish: (success: boolean) => void;
  wordToCopy?: string;
}

const WORDS = [
  { text: 'Leo', image: '🦁', description: '¡Copia el nombre de tu amigo!' },
  { text: 'Sol', image: '☀️', description: 'El sol brilla fuerte.' },
  { text: 'Luna', image: '🌙', description: 'La luna sale de noche.' },
  { text: 'Mamá', image: '❤️', description: '¡Con mucho amor!' },
  { text: 'Papá', image: '👨', description: '¡Qué gran equipo!' },
];

export const CalligraphyView: React.FC<CalligraphyViewProps> = ({ onBack, onFinish, wordToCopy }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSomething, setHasDrawnSomething] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const strokeMoveCount = useRef(0);

  const currentWord = wordToCopy 
    ? { text: wordToCopy, image: '✏️', description: '¡Sigue la guía!' }
    : WORDS[currentWordIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set display size
    const container = canvas.parentElement;
    if (!container) return;
    
    const scale = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * scale;
    canvas.height = container.clientHeight * scale;
    canvas.style.width = `${container.clientWidth}px`;
    canvas.style.height = `${container.clientHeight}px`;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.scale(scale, scale);
    context.lineCap = 'round';
    context.strokeStyle = '#446370'; // Primary color
    context.lineWidth = 14; // Slightly thicker for better tracing coverage
    contextRef.current = context;
    
    drawBackground();
  }, [currentWord.text]);

  const calculateAccuracy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const mctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!mctx) return;

    const displayWidth = width / scale;
    const displayHeight = height / scale;
    const centerY = displayHeight / 2;
    const lineSpacing = 70;

    mctx.scale(scale, scale);
    mctx.font = 'bold 120px "Dancing Script"';
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = 'red';
    mctx.fillText(currentWord.text, displayWidth / 2, centerY + lineSpacing / 2);

    const targetData = mctx.getImageData(0, 0, width, height).data;
    const userData = canvas.getContext('2d')?.getImageData(0, 0, width, height).data;
    if (!userData) return;

    let targetTotalPixels = 0;
    let hitPixels = 0;
    let outPixels = 0;

    const step = 4;
    for (let i = 0; i < targetData.length; i += 4 * step) {
      const isTarget = targetData[i] > 128; // Red channel
      const isUser = userData[i + 3] > 150; // User drawing (ignores the guide alpha 51)

      if (isTarget) {
        targetTotalPixels++;
        if (isUser) hitPixels++;
      } else if (isUser) {
        outPixels++;
      }
    }

    if (targetTotalPixels === 0) return;
    
    // Coverage is progress on the target
    const coverage = (hitPixels / targetTotalPixels) * 100;
    // Penalty for messy strokes
    const penalty = (outPixels / targetTotalPixels) * 20; 
    
    const finalScore = Math.max(0, Math.min(100, Math.round(coverage - penalty)));
    setAccuracy(finalScore);
  };

  const drawBackground = () => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const lineSpacing = 70;

    // "Cielo, Pasto, Tierra" Zones
    // Cielo (Top)
    ctx.fillStyle = 'rgba(135, 206, 235, 0.1)'; 
    ctx.fillRect(0, centerY - lineSpacing, width, lineSpacing);
    
    // Pasto (Middle)
    ctx.fillStyle = 'rgba(144, 238, 144, 0.2)'; 
    ctx.fillRect(0, centerY, width, lineSpacing);
    
    // Tierra (Bottom)
    ctx.fillStyle = 'rgba(210, 180, 140, 0.1)'; 
    ctx.fillRect(0, centerY + lineSpacing, width, lineSpacing);

    // Draw school lines
    ctx.lineWidth = 2;
    
    // Cielo line (top)
    ctx.strokeStyle = '#b0e0e6';
    ctx.beginPath();
    ctx.moveTo(0, centerY - lineSpacing);
    ctx.lineTo(width, centerY - lineSpacing);
    ctx.stroke();

    // Pasto lines (middle zone borders)
    ctx.strokeStyle = '#2e8b57';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(0, centerY + lineSpacing);
    ctx.lineTo(width, centerY + lineSpacing);
    ctx.stroke();

    // Tierra line (bottom)
    ctx.strokeStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(0, centerY + lineSpacing * 2);
    ctx.lineTo(width, centerY + lineSpacing * 2);
    ctx.stroke();

    // Draw the word as dotted guide (Cursive)
    ctx.font = 'bold 120px "Dancing Script"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    
    ctx.strokeText(currentWord.text, width / 2, centerY + lineSpacing / 2);
    ctx.setLineDash([]);
  };

  const startDrawing = (e: React.PointerEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasDrawnSomething(true);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
    
    // Live accuracy adjustment (throttled)
    strokeMoveCount.current++;
    if (strokeMoveCount.current % 15 === 0) {
      calculateAccuracy();
    }
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
    calculateAccuracy();
    strokeMoveCount.current = 0;
  };

  const clearCanvas = () => {
    soundService.playSFX('click');
    drawBackground();
    setHasDrawnSomething(false);
    setAccuracy(null);
  };

  const handleNext = () => {
    if (wordToCopy) {
      soundService.playSFX('correct');
      onFinish(true);
      return;
    }

    if (currentWordIndex < WORDS.length - 1) {
      soundService.playSFX('correct');
      setCurrentWordIndex(currentWordIndex + 1);
      setHasDrawnSomething(false);
      setAccuracy(null);
    } else {
      soundService.playSFX('coin');
      onFinish(true);
    }
  };

  return (
    <main className="pt-2 sm:pt-4 pb-24 sm:pb-32 px-4 sm:px-6 max-w-4xl mx-auto min-h-screen flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between gap-2 h-12">
        <button onClick={() => { soundService.playSFX('click'); onBack(); }} className="p-2 bg-surface-container rounded-full text-primary hover:bg-surface-container-high transition-colors">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="bg-primary-container text-on-primary-container px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold border-b-4 border-primary text-xs sm:text-base">
          Caligrafía: Nivel {currentWordIndex + 1} de {WORDS.length}
        </div>
        <div className="w-10" />
      </div>

      <div className="bg-white rounded-3xl border-4 border-surface-container p-4 sm:p-6 shadow-sm flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 mb-4 sm:mb-6 w-full">
          <div className="flex items-center gap-4 sm:gap-6 w-full">
            <div className="text-4xl sm:text-6xl drop-shadow-sm">{currentWord.image}</div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface-variant flex flex-wrap items-center gap-2 leading-tight">
                Modelo: 
                <span className="text-2xl sm:text-3xl font-cursive text-primary">{currentWord.text}</span>
              </h2>
              <p className="text-on-surface-variant text-xs sm:text-base font-medium hidden xs:block">{currentWord.description}</p>
            </div>
            {accuracy !== null && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-secondary-container text-on-secondary-container px-3 sm:px-4 py-1 sm:py-2 rounded-2xl border-b-4 border-secondary flex flex-col items-center min-w-[80px] sm:min-w-[100px]"
              >
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider">Puntería</span>
                <span className="text-xl sm:text-2xl font-black">{accuracy}%</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="w-full h-[220px] xs:h-[280px] sm:h-[350px] lg:h-[380px] bg-slate-50 rounded-2xl border-4 border-surface-dim relative touch-none cursor-crosshair overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="w-full h-full relative z-10"
          />
          {!hasDrawnSomething && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 z-20">
              <div className="flex flex-col items-center gap-2">
                <PenTool className="w-12 sm:w-20 h-12 sm:h-20 text-primary animate-bounce" />
                <span className="font-bold text-primary text-sm sm:text-base">¡Traza la palabra aquí!</span>
              </div>
            </div>
          )}
          {/* Starting point indicator */}
          {!hasDrawnSomething && (
            <motion.div 
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute left-[20%] top-[50%] w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md z-30 pointer-events-none"
              style={{ transform: 'translate(-50%, -50%)' }}
            />
          )}
        </div>

        <div className="flex gap-4 mt-4 sm:mt-6 w-full">
          <button
            onClick={clearCanvas}
            className="flex-1 py-3 sm:py-4 bg-surface-container text-on-surface-variant font-bold rounded-2xl flex items-center justify-center gap-2 chunky-button text-sm sm:text-base"
          >
            <Eraser className="w-5 h-5 sm:w-6 sm:h-6" />
            Borrar
          </button>
          <button
            onClick={handleNext}
            disabled={!hasDrawnSomething}
            className={`flex-[2] py-3 sm:py-4 font-bold rounded-2xl flex items-center justify-center gap-2 chunky-button text-sm sm:text-base ${
              hasDrawnSomething ? 'bg-primary text-white chunky-shadow-primary' : 'bg-surface-dim text-on-surface-variant opacity-50'
            }`}
          >
            {currentWordIndex === WORDS.length - 1 ? '¡Terminar!' : '¡Listo!'}
            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <div className="mt-2 sm:mt-4 flex items-center gap-4 bg-tertiary-fixed p-4 sm:p-6 rounded-3xl border-2 border-tertiary-fixed-dim">
        <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 hidden xs:block">
          <img src="/logo.png" alt="Leo" className="w-full h-full object-contain" />
        </div>
        <p className="text-on-tertiary-container font-bold text-xs sm:text-base leading-tight">
          "Usa tu dedo o el mouse para seguir las líneas punteadas. ¡Practicar caligrafía te ayudará a escribir increíble!"
        </p>
      </div>
    </main>
  );
};
