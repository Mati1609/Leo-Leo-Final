/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Settings, 
  Home, 
  BarChart2, 
  ShoppingBag, 
  Users, 
  ArrowRight, 
  Cake, 
  Volume2,
  VolumeX,
  Check,
  Lock,
  Play,
  ArrowLeft,
  Circle,
  Star,
  Crown,
  Gift,
  X,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  Clock,
  TrendingUp,
  Target,
  Award,
  Eye,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { AppState, AppView, UserProfile, CategoryProgress, AvatarConfig } from './types';
import { generateLessonQuestions, GeneratedQuestion } from './services/geminiService';
import { CalligraphyView } from './CalligraphyView';

// --- Components ---

const AvatarDisplay = ({ config, className = "" }: { config: AvatarConfig, className?: string }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!config) return <img src="/logo.png" referrerPolicy="no-referrer" alt="Leo" className={`object-cover ${className}`} />;
  
  const getAccessoryStyle = (accessory: string) => {
    // Afinación de posición y tamaño - Ajuste final
    switch (accessory) {
      case '🎩':
        return { fontSize: '30cqw', top: '3%', left: '0', width: '100%', zIndex: 20 };
      case '👑':
        return { fontSize: '30cqw', top: '3%', left: '0', width: '100%', zIndex: 20 };
      case '👓':
        // Buscando el nivel superior (-1%)
        return { fontSize: '45cqw', top: '23%', left: '0', width: '100%', zIndex: 20 };
      case '🎀':
      default:
        // Listón en el lateral derecho
        return { fontSize: '24cqw', top: '18%', left: '24%', transform: 'rotate(15deg)', zIndex: 20 };
    }
  };

  return (
    <div className={`@container relative flex items-center justify-center ${config.color} ${className} overflow-visible`}>
      <div className="relative inline-flex items-center justify-center w-full h-full">
        {!imageError ? (
          <img 
            src="/leon base.png" 
            alt="Leo" 
            className="w-[90%] h-[90%] object-contain z-10"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-opacity-100 z-10 leading-none" style={{fontSize: '80cqw'}}>{config.emoji}</span>
        )}
        
        {config.accessory && (
          <span className="absolute drop-shadow-md leading-none flex justify-center w-full pointer-events-none" style={getAccessoryStyle(config.accessory)}>
            {config.accessory}
          </span>
        )}
      </div>
    </div>
  );
};

import { soundService } from './services/soundService';

const Header = ({ coins, onSettings }: { coins: number; onSettings: () => void }) => {
  const [isMuted, setIsMuted] = useState(soundService.isMuted);
  const [volume, setVolume] = useState(soundService.volume);
  const [showVolume, setShowVolume] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  // Sync state if it changes elsewhere
  useEffect(() => {
    const handleSync = () => {
       setVolume(soundService.volume);
       setIsMuted(soundService.isMuted);
    };
    window.addEventListener('click', handleSync);
    return () => window.removeEventListener('click', handleSync);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolume(false);
      }
    };
    if (showVolume) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showVolume]);

  const handleToggleVolumeMenu = () => {
    soundService.playSFX('click');
    if (!showVolume && isMuted && volume > 0) {
      // Unmute implicitly if they are opening menu and it was muted
      soundService.toggleMute();
      setIsMuted(false);
    }
    setShowVolume(!showVolume); // Toggle slider on click
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundService.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      const volMuted = soundService.toggleMute();
      setIsMuted(volMuted);
    } else if (newVol === 0 && !isMuted) {
      const volMuted = soundService.toggleMute();
      setIsMuted(volMuted);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-white border-b-4 border-surface-container shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-tertiary-fixed rounded-full border-2 border-primary-container overflow-hidden">
          <img 
            src="/logo.png" 
            referrerPolicy="no-referrer"
            alt="Leo Leo"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-2xl font-black text-on-primary-container tracking-tight font-sans hidden sm:inline-block">Leo Leo</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 bg-tertiary-fixed px-3 py-2 sm:px-5 rounded-full border-b-4 border-tertiary-fixed-dim">
          <img src="/leo-coin.png" alt="Leo Coin" className="w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow-sm" />
          <span className="font-bold text-base sm:text-lg text-on-tertiary-fixed">{coins}</span>
        </div>
        
        <div className="relative flex items-center" ref={volumeRef}>
          <button onClick={handleToggleVolumeMenu} className="p-2 text-surface-tint hover:bg-surface-container transition-colors rounded-full text-primary">
            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          
          {showVolume && (
            <div className="absolute top-14 right-0 bg-white border-2 border-surface-dim shadow-lg rounded-2xl p-4 w-40 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center text-sm font-bold text-on-surface">
                 <span>Volumen</span>
                 <span>{Math.round(volume * 100)}%</span>
               </div>
               <input 
                 type="range" 
                 min="0" 
                 max="1" 
                 step="0.05" 
                 value={volume} 
                 onChange={handleVolumeChange}
                 onPointerUp={() => {
                   soundService.playSFX('click');
                   setTimeout(() => setShowVolume(false), 800); // Also close after a small delay on adjust
                 }}
                 className="w-full h-3 bg-surface-container rounded-full appearance-none outline-none accent-primary"
               />
            </div>
          )}
        </div>

        <button onClick={() => { soundService.playSFX('click'); onSettings(); }} className="p-2 text-surface-tint hover:bg-surface-container transition-colors rounded-full">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

const BottomNav = ({ activeView, setView }: { activeView: AppView; setView: (v: AppView) => void }) => (
  <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-24 bg-white border-t-4 border-surface-container shadow-lg rounded-t-[32px]">
    {[
      { id: 'map', icon: Home, label: 'Inicio' },
      { id: 'shop', icon: ShoppingBag, label: 'Tienda' },
      { id: 'parents', icon: Users, label: 'Tutores' },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => { soundService.playSFX('click'); setView(item.id as AppView); }}
        className={`flex flex-col items-center justify-center px-6 py-2 rounded-2xl transition-all ${
          activeView === item.id 
            ? 'bg-primary-fixed text-on-primary-container border-b-4 border-primary-container' 
            : 'text-on-surface-variant hover:bg-surface-container'
        }`}
      >
        <item.icon className="w-6 h-6" />
        <span className="font-sans font-bold text-[10px] uppercase tracking-wider mt-1">{item.label}</span>
      </button>
    ))}
  </nav>
);

// --- Content Views ---

const RegistrationView = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<UserProfile>({
    name: '',
    lastName: '',
    age: 8,
    grade: '4to básico',
    parentEmail: '',
    avatar: { emoji: '🦁', color: 'bg-orange-200', accessory: '' }
  });

  const avatars = ['🦁'];
  const avatarColors = ['bg-orange-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-yellow-200', 'bg-pink-200'];
  const accessories = ['', '👑', '👓', '🎩', '🎀'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playSFX('click');
    if (step < 4) {
      setStep(step + 1);
    } else {
      soundService.playSFX('coin');
      onComplete(form);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center mb-8">
        <div className="w-full bg-surface-container rounded-full h-4 mb-2 overflow-hidden border border-outline-variant/20">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <span className="font-bold text-primary tracking-wide">Paso {step} de 4</span>
      </div>

      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative mb-4">
          <img 
            src="/logo.png" 
            referrerPolicy="no-referrer"
            alt="Leo" 
            className="w-40 h-auto"
          />
          <div className="absolute -top-4 -right-16 bg-tertiary-fixed text-on-tertiary-fixed px-6 py-3 rounded-xl rounded-bl-none shadow-[4px_4px_0_0_#d3c794] border-2 border-tertiary-fixed-dim">
            <span className="font-bold text-xl">¡Hola!</span>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-primary mt-4">¡Cuéntanos sobre ti!</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="font-bold text-on-surface-variant px-2">Nombre</label>
              <input 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
                className="w-full min-h-[56px] rounded-lg bg-white border-primary-container border-2 focus:border-primary focus:ring-0 px-6 text-lg shadow-[0_4px_0_0_#a9c9d9]"
                placeholder="¿Cómo te llamas?" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-on-surface-variant px-2">Apellido</label>
              <input 
                value={form.lastName}
                onChange={e => setForm({...form, lastName: e.target.value})}
                required
                className="w-full min-h-[56px] rounded-lg bg-white border-primary-container border-2 focus:border-primary focus:ring-0 px-6 text-lg shadow-[0_4px_0_0_#a9c9d9]"
                placeholder="Tu apellido" 
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="font-bold text-on-surface-variant px-2">Edad</label>
              <div className="relative">
                <input 
                  type="number"
                  value={form.age === 0 || Number.isNaN(form.age) ? '' : form.age}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setForm({...form, age: Number.isNaN(val) ? 0 : val});
                  }}
                  className="w-full min-h-[56px] rounded-lg bg-white border-tertiary-container border-2 focus:border-tertiary focus:ring-0 px-6 text-lg shadow-[0_4px_0_0_#d0c492]"
                />
                <Cake className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiary w-5 h-5 -mr-[10px] m-0 pr-0" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-on-surface-variant px-2">Curso</label>
              <select 
                value={form.grade}
                onChange={e => setForm({...form, grade: e.target.value})}
                className="w-full min-h-[56px] rounded-lg bg-white border-tertiary-container border-2 focus:border-tertiary focus:ring-0 px-6 text-lg shadow-[0_4px_0_0_#d0c492] appearance-none"
              >
                <option>1ro básico</option>
                <option>2do básico</option>
                <option>3ro básico</option>
                <option>4to básico</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <label className="font-bold text-on-surface-variant px-2">¡Arma tu avatar!</label>
              <div className="flex justify-center border-4 border-surface-dim rounded-[32px] p-4 bg-surface-container shadow-inner">
                <AvatarDisplay config={form.avatar} className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-bold text-sm text-on-surface-variant px-2 uppercase tracking-wider">Color de fondo</label>
              <div className="flex gap-2 justify-center flex-wrap">
                {avatarColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({...form, avatar: {...form.avatar, color}})}
                    className={`w-12 h-12 rounded-full border-4 transition-all chunky-button ${form.avatar.color === color ? 'border-primary shadow-[0_4px_0_0_#bbbbbb] scale-110' : 'border-transparent shadow-sm hover:scale-105'}`}
                  >
                    <div className={`w-full h-full rounded-full ${color}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-bold text-sm text-on-surface-variant px-2 uppercase tracking-wider">Acesorio</label>
              <div className="flex justify-center gap-3">
                {accessories.map(acc => (
                  <button
                    key={acc || 'none'}
                    type="button"
                    onClick={() => setForm({...form, avatar: {...form.avatar, accessory: acc}})}
                    className={`text-3xl w-14 h-14 rounded-2xl flex items-center justify-center transition-all chunky-button ${form.avatar.accessory === acc ? 'bg-primary-container border-4 border-primary shadow-[0_4px_0_0_#bbbbbb] scale-110' : 'bg-surface-container border-2 border-outline-variant/30 hover:scale-105'}`}
                  >
                    {acc ? acc : <X className="w-6 h-6 text-on-surface-variant/50" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <label className="font-bold text-on-surface-variant px-2">Email del tutor</label>
            <input 
              type="email"
              value={form.parentEmail}
              onChange={e => setForm({...form, parentEmail: e.target.value})}
              required
              className="w-full min-h-[56px] rounded-lg bg-white border-secondary-container border-2 focus:border-secondary focus:ring-0 px-6 text-lg shadow-[0_4px_0_0_#d0e9d1]"
              placeholder="papa@ejemplo.com" 
            />
            <p className="text-on-surface-variant/70 text-sm px-2 italic">para que podamos terminar de configurar</p>
          </div>
        )}

        <div className="pt-10">
          <button 
            type="submit"
            className="chunky-button w-full h-14 bg-primary text-white font-bold text-xl rounded-full flex items-center justify-center gap-2 chunky-shadow-primary"
          >
            {step === 4 ? '¡Empezar!' : 'Siguiente'}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

const AdventureMapView = ({ progress, onSelectLesson, onViewShop }: { progress: CategoryProgress; onSelectLesson: (cat: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias') => void; onViewShop: () => void }) => {
  const getLevel = (p: number) => Math.floor(p / 20); // 100 / 5 = 20% per level

  return (
    <main className="pt-28 pb-32 px-6 max-w-4xl mx-auto min-h-screen">
      <section className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-on-background mb-2">¡Elige tu aventura!</h1>
        <p className="text-xl text-on-surface-variant">¿Qué quieres aprender hoy con Leo?</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <button 
          onClick={() => { soundService.playSFX('click'); onSelectLesson('lenguaje'); }}
          className="bg-[#A9C9D9] p-8 rounded-xl border-b-8 border-[#8FB6C6] text-left chunky-button flex flex-col justify-between h-64 group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <img src="/leon-lenguaje.png" alt="Lenguaje" className="w-[93px] h-[93px] object-contain filter drop-shadow-md" />
            <span className="bg-white/30 px-3 py-1 rounded-full text-white font-bold text-sm">Nivel {getLevel(progress.lenguaje)}/5</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Lenguaje</h2>
            <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden">
              <div className="bg-white h-full transition-all duration-500" style={{ width: `${progress.lenguaje}%` }} />
            </div>
          </div>
        </button>

        <button 
          onClick={() => { soundService.playSFX('click'); onSelectLesson('matematicas'); }}
          className="bg-[#F4E7B2] p-8 rounded-xl border-b-8 border-[#DDCF95] text-left chunky-button flex flex-col justify-between h-64 group"
        >
          <div className="flex justify-between items-start">
            <img src="/leon-matematicas.png" alt="Matemáticas" className="w-[93px] h-[93px] object-contain filter drop-shadow-md" />
            <span className="bg-amber-800/10 px-3 py-1 rounded-full text-amber-900 font-bold text-sm">Nivel {getLevel(progress.matematicas)}/5</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Matemáticas</h2>
            <div className="w-full bg-amber-800/10 h-4 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full transition-all duration-500" style={{ width: `${progress.matematicas}%` }} />
            </div>
          </div>
        </button>

        <button 
          onClick={() => { soundService.playSFX('click'); onSelectLesson('historia'); }}
          className="bg-[#BFD8C1] p-8 rounded-xl border-b-8 border-[#A6C0A8] text-left chunky-button flex flex-col justify-between h-64 group"
        >
          <div className="flex justify-between items-start">
            <img src="/leon-historia.png" alt="Historia" className="w-[93px] h-[93px] object-contain filter drop-shadow-md" />
            <span className="bg-green-800/10 px-3 py-1 rounded-full text-green-900 font-bold text-sm">Nivel {getLevel(progress.historia)}/5</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Historia</h2>
            <div className="w-full bg-green-800/10 h-4 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full transition-all duration-500" style={{ width: `${progress.historia}%` }} />
            </div>
          </div>
        </button>

        <button 
          onClick={() => { soundService.playSFX('click'); onSelectLesson('ciencias'); }}
          className="bg-[#D8B4E2] p-8 rounded-xl border-b-8 border-[#BD9AC7] text-left chunky-button flex flex-col justify-between h-64 group"
        >
          <div className="flex justify-between items-start">
            <img src="/leon-ciencias.png" alt="Ciencias" className="w-[93px] h-[93px] object-contain filter drop-shadow-md" />
            <span className="bg-purple-800/10 px-3 py-1 rounded-full text-purple-900 font-bold text-sm">Nivel {getLevel(progress.ciencias || 0)}/5</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2">Ciencias</h2>
            <div className="w-full bg-purple-800/10 h-4 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${progress.ciencias || 0}%` }} />
            </div>
          </div>
        </button>
      </div>

      {/* Hero Banner */}
      <section className="relative rounded-xl overflow-hidden mb-12 border-4 border-white shadow-xl bg-primary-container/20 p-8 min-h-[200px]">
        <div className="relative z-10 flex flex-col items-start max-w-lg">
          <span className="bg-tertiary text-white px-4 py-1 rounded-full font-bold text-xs mb-4">¡NUEVO!</span>
          <h2 className="text-3xl font-extrabold text-primary mb-2">Categorías Premium</h2>
          <p className="text-on-surface-variant mb-6">Explora el mundo de los Dinosaurios y los misterios del Espacio Exterior.</p>
          <button 
            onClick={onViewShop}
            className="bg-secondary text-white px-8 py-3 rounded-full font-bold chunky-button chunky-shadow-secondary"
          >
            Ver más
          </button>
        </div>
      </section>
    </main>
  );
};

const playAudioForKids = (text: string, onStart: () => void, onEnd: () => void) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    
    // Configurar voz para que suene más infantil/amigable
    utterance.pitch = 1.4; // Tono más alto
    utterance.rate = 0.9;  // Un poco más lento para mejor comprensión

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
      
      const preferredVoice = spanishVoices.find(v => v.name.includes('Google') && v.name.includes('español')) || 
                             spanishVoices.find(v => v.name.includes('Paulina')) || 
                             spanishVoices.find(v => v.name.includes('Sabina')) ||
                             spanishVoices.find(v => v.name.includes('Monica')) ||
                             spanishVoices[0];
                             
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = onStart;
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
      window.speechSynthesis.speak(utterance);
    };

    // If voices are not loaded yet, wait for them
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
      setVoiceAndSpeak();
    }
  } else {
    onStart();
    setTimeout(() => {
      onEnd();
    }, 2000);
  }
};

const LessonView = ({ 
  category, 
  user, 
  coins,
  showShopOverlay,
  onBack, 
  onFinish,
  onModifyCoins,
  onGoToShop,
  onShopBack,
  onBuyCoins,
  onAnswerResult
}: { 
  category: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias'; 
  user: UserProfile; 
  coins: number;
  showShopOverlay?: boolean;
  onBack: () => void; 
  onFinish: (success: boolean) => void;
  onModifyCoins: (amount: number) => void;
  onGoToShop: () => void;
  onShopBack: () => void;
  onBuyCoins: (amount: number) => void;
  onAnswerResult: (category: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias', correct: boolean) => void;
}) => {
  const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStep, setQuestionStep] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hasMistake, setHasMistake] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const data = await generateLessonQuestions(category, user.age, user.grade);
        setQuestions(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("¡Oh no! Leo tuvo un problema preparando tu aventura. Intenta de nuevo. Detalles: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [category, user.age, user.grade]);

  const currentQuestion = questions ? questions[currentQuestionIndex] : null;

  const handleCheck = () => {
    if (!selectedOption || !currentQuestion) return;
    const isCorrect = selectedOption.toLowerCase() === currentQuestion.answer.toLowerCase();
    onAnswerResult(category, isCorrect);
    if (isCorrect) {
      soundService.playSFX('correct');
      setFeedback('correct');
    } else {
      soundService.playSFX('incorrect');
      setFeedback('incorrect');
      setHasMistake(true);
    }
  };

  const handleNext = () => {
    soundService.playSFX('click');
    if (!questions) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStep(false);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      soundService.playSFX('coin');
      setIsFinished(true);
    }
  };

  const handlePlayAudio = () => {
    if (!currentQuestion) return;
    playAudioForKids(
      currentQuestion.text,
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  };

  React.useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (showShopOverlay) {
    return <ShopView onBuyCoins={onBuyCoins} onBack={onShopBack} />;
  }

  if (loading) {
    return (
      <main className="pt-32 px-6 text-center max-w-xl mx-auto flex flex-col items-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 bg-primary-fixed rounded-full border-8 border-primary-container flex items-center justify-center"
        >
          <img 
            src="/logo.png" 
            referrerPolicy="no-referrer"
            alt="Leo"
            className="w-20 h-20 object-contain"
          />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-primary">¡Leo está preparando tu aventura!</h1>
        <p className="text-xl text-on-surface-variant italic">Buscando los mejores desafios para un experto de {user.grade}...</p>
      </main>
    );
  }

  if (error || !questions) {
    return (
      <main className="pt-32 px-6 text-center max-w-xl mx-auto flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">{error || "Algo salió mal"}</h1>
        <button onClick={() => { soundService.playSFX('click'); onBack(); }} className="bg-primary text-white px-8 py-3 rounded-full font-bold chunky-button chunky-shadow-primary">
          Volver
        </button>
      </main>
    );
  }

  if (isFinished) {
    if (hasMistake) {
      return (
        <main className="pt-32 px-6 text-center max-w-xl mx-auto relative">
           {showShopModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="bg-white p-8 rounded-3xl max-w-sm w-full border-4 border-surface-container shadow-xl text-center">
                  <h2 className="text-2xl font-bold text-primary mb-4">¿Te faltan Leo Coins?</h2>
                  <p className="text-on-surface-variant mb-6">No tienes suficientes Leo Coins para reintentar. ¡Visita la tienda para conseguir más!</p>
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => { setShowShopModal(false); onGoToShop(); }} 
                      className="w-full bg-secondary text-white py-4 rounded-full font-bold chunky-button chunky-shadow-secondary"
                    >
                      Ir a la Tienda
                    </button>
                    <button 
                      onClick={() => setShowShopModal(false)} 
                      className="w-full bg-surface-container text-on-surface-variant py-4 rounded-full font-bold chunky-button"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
             </div>
           )}
          <div className="w-40 h-40 bg-red-100 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-red-300">
            <span className="text-red-500 text-6xl font-black">X</span>
          </div>
          <h1 className="text-4xl font-extrabold text-red-500 mb-4">¡Casi lo logras!</h1>
          <p className="text-xl text-on-surface-variant mb-8">Tuviste algunos errores y no pudiste pasar de nivel. ¡Pero no te rindas!</p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                if (coins >= 20) {
                  onModifyCoins(-20);
                  setHasMistake(false);
                  setCurrentQuestionIndex(0);
                  setQuestionStep(false);
                  setSelectedOption(null);
                  setFeedback(null);
                  setIsFinished(false);
                } else {
                  setShowShopModal(true);
                }
              }}
              className="w-full mx-auto bg-tertiary text-white font-bold text-xl py-5 rounded-full chunky-button chunky-shadow-tertiary"
            >
              Reintentar por 20 Leo Coins
            </button>
            <button 
              onClick={() => {
                // Simulate watching an ad
                alert("Simulando: Viendo publicidad... ¡Felicidades! Has desbloqueado el nivel.");
                setHasMistake(false);
                setCurrentQuestionIndex(0);
                setQuestionStep(false);
                setSelectedOption(null);
                setFeedback(null);
                setIsFinished(false);
              }}
              className="w-full mx-auto bg-secondary text-white font-bold text-xl py-5 rounded-full chunky-button chunky-shadow-secondary flex items-center justify-center gap-2"
            >
              Ver publicidad para reintentar
            </button>
            <button 
              onClick={() => onFinish(false)}
              className="w-full mx-auto bg-surface-container text-on-surface-variant font-bold text-xl py-5 rounded-full chunky-button"
            >
              Volver al Mapa
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="pt-32 px-6 text-center max-w-xl mx-auto">
        <div className="w-40 h-40 bg-secondary-container rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-secondary">
          <Check className="w-20 h-20 text-secondary" />
        </div>
        <h1 className="text-4xl font-extrabold text-primary mb-4">¡Nivel Completado!</h1>
        <p className="text-xl text-on-surface-variant mb-8">¡Lo hiciste perfecto! Has ganado 50 Leo Coins y mejorado tu aventura.</p>
        <button 
          onClick={() => onFinish(true)}
          className="w-full max-w-sm bg-primary text-white font-bold text-xl py-5 rounded-full chunky-button chunky-shadow-primary mx-auto"
        >
          ¡Volver al Mapa!
        </button>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => { soundService.playSFX('click'); onBack(); }} className="p-2 bg-surface-container rounded-full text-primary hover:bg-surface-container-high transition-colors shrink-0">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-bold border-b-4 border-primary capitalize text-sm sm:text-base text-center truncate">
          {category} <span className="hidden sm:inline">· Pregunta</span> {currentQuestionIndex + 1}
        </div>
        <div className="font-bold text-on-surface-variant text-sm sm:text-base shrink-0">{currentQuestionIndex + 1} de 5</div>
      </div>

      <div className="w-full bg-white rounded-2xl border-4 border-surface-container p-8 shadow-sm">
        <p className="text-2xl font-medium text-on-surface leading-normal">
          {currentQuestion.text}
        </p>
        {!questionStep && user.grade === '1ro básico' && (
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handlePlayAudio}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold border-b-4 transition-all chunky-button ${isPlaying ? 'bg-secondary text-white border-secondary shadow-inner scale-95 pointer-events-none' : 'bg-secondary-container text-on-secondary-container border-secondary'}`}
            >
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              {isPlaying ? 'Escuchando...' : 'Escuchar'}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!questionStep ? (
          <motion.div 
            key="read"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 mt-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-tertiary-fixed rounded-full border-4 border-primary-container overflow-hidden">
                <img 
                  src="/logo.png" 
                  referrerPolicy="no-referrer"
                  alt="Leo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-tertiary-fixed text-on-tertiary-container p-4 rounded-xl rounded-bl-none font-bold shadow-sm">
                ¡Lee bien, después te pregunto!
              </div>
            </div>
            <button 
              onClick={() => setQuestionStep(true)}
              className="w-full max-w-sm bg-tertiary text-white font-bold text-xl py-5 rounded-full chunky-button chunky-shadow-tertiary flex items-center justify-center gap-2"
            >
              ¡Listo, empezar!
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-center text-on-surface flex-1">{currentQuestion.q}</h2>
              {user.grade === '1ro básico' && (
                <button 
                  onClick={() => {
                    const textToRead = currentQuestion.q + '. Opciones: ' + currentQuestion.options.join(', o ');
                    playAudioForKids(
                      textToRead,
                      () => setIsPlaying(true),
                      () => setIsPlaying(false)
                    );
                  }}
                  className={`flex shrink-0 items-center justify-center w-12 h-12 rounded-full border-b-4 transition-all chunky-button ${isPlaying ? 'bg-secondary text-white border-secondary shadow-inner scale-95 pointer-events-none' : 'bg-secondary-container text-on-secondary-container border-secondary'}`}
                >
                  <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt) => {
                const isCorrectOption = opt.toLowerCase() === currentQuestion.answer.toLowerCase();
                const isSelected = selectedOption === opt.toLowerCase();
                const showCorrect = feedback && isCorrectOption;
                const showIncorrectError = feedback && isSelected && !isCorrectOption;

                return (
                  <motion.button
                    key={opt}
                    onClick={() => {
                      if (!feedback) {
                        soundService.playSFX('click');
                        setSelectedOption(opt.toLowerCase());
                      }
                    }}
                    disabled={feedback !== null}
                    animate={
                      showCorrect 
                        ? { scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px rgba(74,222,128,0)", "0px 0px 20px rgba(74,222,128,0.8)", "0px 0px 10px rgba(74,222,128,0.4)"] } 
                        : showIncorrectError
                          ? { x: [-8, 8, -8, 8, 0], scale: 0.95 }
                          : isSelected
                            ? { scale: 0.98 } 
                            : { scale: 1 }
                    }
                    transition={{ duration: 0.4 }}
                    className={`p-6 rounded-xl border-4 text-xl font-bold transition-colors relative overflow-hidden flex items-center justify-center ${
                      feedback 
                        ? isCorrectOption
                          ? 'border-green-500 bg-green-100 text-green-800 ring-4 ring-green-500/20 z-10'
                          : isSelected
                            ? 'border-red-500 bg-red-50 text-red-800 opacity-90'
                            : 'border-surface-container bg-white opacity-40'
                        : isSelected 
                          ? 'border-primary ring-4 ring-primary/20 bg-primary-fixed' 
                          : 'border-surface-container bg-white hover:border-primary/50'
                    }`}
                  >
                    {showCorrect && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="absolute top-2 right-2 text-green-600"
                       >
                         <Check className="w-5 h-5" />
                       </motion.div>
                    )}
                    {showIncorrectError && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="absolute top-2 right-2 text-red-500"
                       >
                         <X className="w-5 h-5" />
                       </motion.div>
                    )}
                    <span className="relative z-0">{opt}</span>
                  </motion.button>
                );
              })}
            </div>
            {!feedback ? (
              <button 
                onClick={handleCheck}
                disabled={!selectedOption}
                className={`w-full h-16 rounded-full font-bold text-xl chunky-button flex items-center justify-center gap-2 ${
                  selectedOption ? 'bg-primary text-white chunky-shadow-primary' : 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-50'
                }`}
              >
                Comprobar
                <Check className="w-6 h-6" />
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-xl border-4 font-bold text-lg text-center ${feedback === 'correct' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
                  {feedback === 'correct' ? '¡Correcto! ¡Muy bien!' : '¡Oh no! Esa no era la respuesta correcta.'}
                </div>
                <button 
                  onClick={handleNext}
                  className="w-full h-16 rounded-full font-bold text-xl chunky-button flex items-center justify-center gap-2 bg-primary text-white chunky-shadow-primary"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Terminar' : 'Siguiente'}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

const ShopView = ({ onBuyCoins, onBack }: { onBuyCoins: (amount: number) => void; onBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'suscripcion' | 'monedas'>('suscripcion');

  const subs = [
    { title: 'Mensual', price: '$5,990', icon: Star, color: 'bg-primary-fixed', shadow: 'chunky-shadow-primary', bgButton: 'bg-primary' },
    { title: 'Anual', price: '$39,990', icon: Crown, color: 'bg-secondary-container', shadow: 'chunky-shadow-secondary', popular: true, bgButton: 'bg-secondary' },
    { title: 'Familiar (3 niños)', price: '$59,990', icon: Users, color: 'bg-tertiary-fixed', shadow: 'chunky-shadow-tertiary', bgButton: 'bg-tertiary' },
  ];

  const coinPacks = [
    { title: 'Pack pequeño', amount: 100, price: '$990', color: 'bg-primary-fixed', shadow: 'chunky-shadow-primary', bgButton: 'bg-primary' },
    { title: 'Pack mediano', amount: 350, price: '$2,990', color: 'bg-secondary-container', shadow: 'chunky-shadow-secondary', popular: true, bgButton: 'bg-secondary' },
    { title: 'Pack grande', amount: 800, price: '$5,990', color: 'bg-tertiary-fixed', shadow: 'chunky-shadow-tertiary', bgButton: 'bg-tertiary' },
    { title: 'Pack premium', amount: 2000, price: '$12,990', color: 'bg-primary-container', shadow: 'chunky-shadow-primary', bgButton: 'bg-primary' },
  ];

  return (
    <main className="pt-28 pb-40 px-6 max-w-4xl mx-auto min-h-screen">
      <section className="mb-8 text-center relative flex items-center justify-center">
        {onBack && (
          <button onClick={() => { soundService.playSFX('click'); onBack(); }} className="absolute left-0 p-2 bg-surface-container rounded-full text-primary hover:bg-surface-container-high transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          <h1 className="text-4xl font-extrabold text-on-background mb-2">Tienda de LeoLeo</h1>
          <p className="text-xl text-on-surface-variant">¡Desbloquea contenido premium y consigue Leo Coins!</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex bg-surface-container rounded-full p-2 mb-8 overflow-x-auto gap-2">
        <button 
          onClick={() => { soundService.playSFX('click'); setActiveTab('suscripcion'); }}
          className={`flex-1 py-3 px-6 rounded-full font-bold whitespace-nowrap transition-all ${activeTab === 'suscripcion' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          Suscripción
        </button>
        <button 
          onClick={() => { soundService.playSFX('click'); setActiveTab('monedas'); }}
          className={`flex-1 py-3 px-6 rounded-full font-bold whitespace-nowrap transition-all ${activeTab === 'monedas' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          Leo Coins
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Suscripciones */}
          {activeTab === 'suscripcion' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subs.map((plan) => (
                <div 
                  key={plan.title}
                  className={`relative p-8 rounded-3xl border-4 border-surface-container bg-white flex flex-col items-center text-center transition-transform hover:scale-[1.02] ${plan.popular ? 'ring-4 ring-primary/20' : ''}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-4 bg-primary text-white px-4 py-1 rounded-full font-bold text-sm shadow-md">
                      ¡MÁS POPULAR!
                    </span>
                  )}
                  <div className={`w-20 h-20 ${plan.color} rounded-full flex items-center justify-center mb-6 shadow-inner`}>
                    <plan.icon className="w-10 h-10 text-on-primary-container" />
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-1">{plan.title}</h2>
                  <p className="text-on-surface-variant font-medium mb-6">Suscripción Premium</p>
                  <div className="mt-auto w-full">
                    <button className={`w-full py-4 rounded-full font-bold text-xl text-white chunky-button ${plan.shadow} ${plan.bgButton}`}>
                      {plan.price}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leo Monedas */}
          {activeTab === 'monedas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coinPacks.map((pack) => (
                <div 
                  key={pack.title}
                  className={`relative p-6 rounded-3xl border-4 border-surface-container bg-white flex flex-col items-center text-center transition-transform hover:scale-[1.02] ${pack.popular ? 'ring-4 ring-primary/20' : ''}`}
                >
                  {pack.popular && (
                    <span className="absolute -top-4 bg-primary text-white px-4 py-1 rounded-full font-bold text-[10px] shadow-md uppercase">
                      Mejor Valor
                    </span>
                  )}
                  <div className="flex items-center justify-center mb-4 min-h-[80px]">
                    <img src="/leo-coin.png" alt="Leo Coin" className="w-[80px] h-[80px] object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h2 className="text-xl font-bold text-on-surface mb-1">{pack.amount} LC</h2>
                  <p className="text-sm text-on-surface-variant font-medium mb-6">{pack.title}</p>
                  <div className="mt-auto w-full">
                    <button 
                      onClick={() => { soundService.playSFX('coin'); onBuyCoins(pack.amount); }}
                      className={`w-full py-3 rounded-full font-bold text-lg text-white chunky-button ${pack.shadow} ${pack.bgButton}`}
                    >
                      {pack.price}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leo Pase */}
          {false && (
            <div className="max-w-2xl mx-auto">
              <div className="relative p-8 rounded-3xl border-4 border-surface-container bg-white flex flex-col items-center text-center">
                <div className="absolute -top-4 bg-secondary text-white px-6 py-1 rounded-full font-bold text-sm shadow-md uppercase">
                  Temporada 1
                </div>
                
                <div className="w-24 h-24 bg-tertiary-fixed rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-tertiary-fixed-dim">
                  <Gift className="w-12 h-12 text-tertiary fill-current" />
                </div>
                
                <h2 className="text-4xl font-extrabold text-on-surface mb-2">Leo Pase</h2>
                <p className="text-xl text-on-surface-variant mb-8">Desbloquea recompensas increíbles mientras aprendes.</p>
                
                <div className="w-full space-y-4 mb-8 text-left bg-surface-container-low p-6 rounded-2xl border-2 border-surface-container">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-fixed p-2 rounded-full">
                      <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg text-on-surface">30 Niveles de Aventura</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary-container p-2 rounded-full">
                      <Crown className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="font-bold text-lg text-on-surface">18 Cosméticos Exclusivos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-tertiary-fixed w-10 h-10 flex items-center justify-center rounded-full border border-tertiary/20">
                      <img src="/leo-coin.png" alt="Leo Coin" className="w-8 h-8 object-contain" />
                    </div>
                    <span className="font-bold text-lg text-on-surface">400 LC <span className="font-normal text-on-surface-variant text-base">(dividido en 12 niveles)</span></span>
                  </div>
                </div>
                
                <div className="w-full">
                  <button className="w-full py-4 rounded-full font-bold text-2xl text-white chunky-button chunky-shadow-secondary bg-secondary">
                    Comprar Pase por $5,990
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 p-8 bg-surface-container-low rounded-3xl border-2 border-surface-container flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 shrink-0">
          <img 
            src="/logo.png" 
            referrerPolicy="no-referrer"
            alt="Leo Ayuda" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-xl font-bold text-primary mb-2">¿Necesitas ayuda?</h3>
          <p className="text-on-surface-variant">Pide permiso a un adulto antes de realizar cualquier compra en la tienda.</p>
        </div>
      </div>
    </main>
  );
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'registration',
    user: null,
    coins: 0,
    progress: 0,
    categoryProgress: {
      lenguaje: 0,
      matematicas: 0,
      historia: 0,
      ciencias: 0
    },
    activeCategory: null,
    stats: {
      screenTime: 0,
      readingTime: 0,
      answers: {
        lenguaje: { correct: 0, total: 0 },
        matematicas: { correct: 0, total: 0 },
        historia: { correct: 0, total: 0 },
        ciencias: { correct: 0, total: 0 }
      }
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        if (!prev.user) return prev; // Don't track if not registered
        return {
          ...prev,
          stats: {
            ...prev.stats,
            screenTime: prev.stats.screenTime + 1,
            readingTime: prev.view === 'lesson' ? prev.stats.readingTime + 1 : prev.stats.readingTime
          }
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegistrationComplete = (user: UserProfile) => {
    setState({ ...state, user, view: 'map' });
  };

  const handleFinishLesson = (success: boolean) => {
    if (!state.activeCategory) return;
    
    if (success) {
      setState(prev => {
        const newProgress = { ...prev.categoryProgress };
        newProgress[prev.activeCategory!] = Math.min(100, newProgress[prev.activeCategory!] + 20);
        
        const vals = Object.values(newProgress) as number[];
        const overall = vals.reduce((a, b) => a + b, 0) / 4;

        return {
          ...prev,
          coins: prev.coins + 50,
          view: 'map',
          categoryProgress: newProgress,
          progress: overall,
          activeCategory: null
        };
      });
    } else {
      setState({ ...state, view: 'map', activeCategory: null });
    }
  };

  const handleModifyCoins = (amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const handleSelectCategory = (cat: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias') => {
    setState({ ...state, view: 'progress', activeCategory: cat });
  };

  const handleBuyCoins = (amount: number) => {
    const nextView = state.returnToView || 'map';
    setState({ ...state, coins: state.coins + amount, view: nextView, returnToView: null });
    alert(`¡Felicidades! Has conseguido ${amount} Leo Coins.`);
  };

  const handleAnswerResult = (category: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias', correct: boolean) => {
    setState(prev => {
      const currentStats = prev.stats.answers[category];
      return {
        ...prev,
        stats: {
          ...prev.stats,
          answers: {
            ...prev.stats.answers,
            [category]: {
              correct: currentStats.correct + (correct ? 1 : 0),
              total: currentStats.total + 1
            }
          }
        }
      };
    });
  };

  const isMainView = ['map', 'shop', 'progress', 'parents'].includes(state.view);

  // When changing view manually from BottomNav, clear returnToView
  const handleNavChange = (view: AppView) => {
    setState({ ...state, view, returnToView: null });
  };

  return (
    <div className="min-h-screen bg-surface relative" onPointerDown={() => soundService.resumeBGMOnInteract()}>
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10" 
        style={{ backgroundImage: "url('/huella.png')", backgroundSize: '150px', backgroundRepeat: 'repeat' }}
      />
      
      {state.view !== 'registration' && (
        <Header coins={state.coins} onSettings={() => setState({ ...state, view: 'parents' })} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={state.view}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {state.view === 'registration' && (
            <RegistrationView onComplete={handleRegistrationComplete} />
          )}
          {state.view === 'map' && (
            <AdventureMapView 
              progress={state.categoryProgress} 
              onSelectLesson={handleSelectCategory} 
              onViewShop={() => setState({ ...state, view: 'shop' })}
            />
          )}
          {state.view === 'lesson' && state.activeCategory && state.user && (
            <LessonView 
              category={state.activeCategory}
              user={state.user}
              coins={state.coins}
              showShopOverlay={state.returnToView === 'lesson'}
              onBack={() => setState({ ...state, view: 'map', activeCategory: null })} 
              onFinish={handleFinishLesson}
              onModifyCoins={handleModifyCoins}
              onGoToShop={() => setState({ ...state, returnToView: 'lesson' })}
              onShopBack={() => setState({ ...state, returnToView: null })}
              onBuyCoins={handleBuyCoins}
              onAnswerResult={handleAnswerResult}
            />
          )}  
          {state.view === 'calligraphy' && (
            <CalligraphyView 
              onBack={() => setState({ ...state, view: 'map', activeCategory: null })}
              onFinish={handleFinishLesson}
            />
          )}  
          {state.view === 'shop' && state.returnToView !== 'lesson' && (
            <ShopView 
              onBuyCoins={handleBuyCoins} 
              onBack={state.returnToView ? () => {
                setState({ ...state, view: state.returnToView!, returnToView: null });
              } : undefined}
            />
          )}
          {state.view === 'progress' && (
            <ProgressView 
              user={state.user!} 
              coins={state.coins} 
              progress={state.categoryProgress} 
              overall={state.progress} 
              initialCategory={state.activeCategory || 'lenguaje'}
              onStartLesson={(cat) => setState({...state, view: 'lesson', activeCategory: cat})}
              onGoToCalligraphy={() => setState({...state, view: 'calligraphy'})}
            />
          )}
          {state.view === 'parents' && state.user && (
            <ParentsView 
              user={state.user} 
              progress={state.categoryProgress}
              stats={state.stats}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {isMainView && (
        <BottomNav activeView={state.view} setView={handleNavChange} />
      )}
    </div>
  );
}

const ProgressView = ({ user, coins, progress, overall, initialCategory, onStartLesson, onGoToCalligraphy }: { user: UserProfile; coins: number; progress: CategoryProgress; overall: number; initialCategory: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias'; onStartLesson: (cat: 'lenguaje' | 'matematicas' | 'historia' | 'ciencias') => void; onGoToCalligraphy: () => void;}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'lenguaje' | 'matematicas' | 'historia' | 'ciencias'>(initialCategory || 'lenguaje');

  const categories = [
    { id: 'lenguaje', label: 'Lenguaje', color: 'bg-primary-container', activeColor: 'bg-primary', text: 'text-on-primary-container', onActiveText: 'text-on-primary', border: 'border-primary', value: progress.lenguaje || 0, iconSrc: '/leon-lenguaje.png' },
    { id: 'matematicas', label: 'Matemáticas', color: 'bg-tertiary-container', activeColor: 'bg-tertiary', text: 'text-on-tertiary-container', onActiveText: 'text-on-tertiary', border: 'border-tertiary', value: progress.matematicas || 0, iconSrc: '/leon-matematicas.png' },
    { id: 'historia', label: 'Historia', color: 'bg-secondary-container', activeColor: 'bg-secondary', text: 'text-on-secondary-container', onActiveText: 'text-on-secondary', border: 'border-secondary', value: progress.historia || 0, iconSrc: '/leon-historia.png' },
    { id: 'ciencias', label: 'Ciencias', color: 'bg-purple-200', activeColor: 'bg-purple-500', text: 'text-purple-900', onActiveText: 'text-white', border: 'border-purple-500', value: progress.ciencias || 0, iconSrc: '/leon-ciencias.png' },
  ] as const;

  const currentCategory = categories.find(c => c.id === activeCategory)!;
  const currentLevelsCompleted = Math.floor(currentCategory.value / 20);

  return (
    <main className="pt-28 pb-40 px-6 max-w-4xl mx-auto min-h-screen relative">
      {/* Floating Profile Widget */}
      <div className="fixed bottom-28 right-6 z-40 flex flex-col items-end">
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.9, rotate: 2 }}
              className="bg-surface-bright rounded-3xl border-4 border-primary shadow-[8px_8px_0_0_#a9c9d9] mb-4 w-72 origin-bottom-right overflow-hidden flex flex-col"
            >
              <div className="bg-primary px-6 py-4 flex justify-between items-center relative overflow-hidden text-on-primary">
                <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none">
                  <Star className="w-24 h-24 fill-current" />
                </div>
                <div className="flex items-center gap-3 relative z-10 w-full pr-8">
                  <AvatarDisplay config={user.avatar} className="w-12 h-12 rounded-full border-4 border-primary-fixed shadow-sm" />
                  <h2 className="text-xl font-black truncate drop-shadow-sm flex-1">{user.name} {user.lastName}</h2>
                </div>
                <button onClick={() => setIsProfileOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-20">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-3 bg-[radial-gradient(circle_at_10px_10px,#f0eee9_1px,transparent_0)] bg-[size:20px_20px]">
                <div className="flex justify-between items-center bg-white px-4 py-3 rounded-2xl border-2 border-surface-dim shadow-sm">
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-on-surface-variant text-sm">Curso</span>
                  </div>
                  <span className="font-black text-on-surface bg-secondary-container px-3 py-1 rounded-xl text-sm border-b-2 border-secondary/20">{user.grade}</span>
                </div>
                <div className="flex justify-between items-center bg-white px-4 py-3 rounded-2xl border-2 border-surface-dim shadow-sm">
                  <div className="flex items-center gap-2">
                    <Cake className="w-5 h-5 text-tertiary" />
                    <span className="font-bold text-on-surface-variant text-sm">Edad</span>
                  </div>
                  <span className="font-black text-on-surface font-sans bg-tertiary-container px-3 py-1 rounded-xl text-sm border-b-2 border-tertiary/20">{user.age} años</span>
                </div>
                <div className="flex justify-between items-center bg-tertiary-fixed px-4 py-3 rounded-2xl border-b-4 border-tertiary-fixed-dim mt-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-tertiary fill-tertiary" />
                    <span className="font-bold text-on-tertiary-fixed text-sm">Avance Total</span>
                  </div>
                  <span className="font-black text-on-tertiary-fixed text-lg">{Math.round(overall || 0)}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`group flex items-center gap-3 px-5 py-4 rounded-[28px] chunky-button transition-all ${isProfileOpen ? 'bg-surface-dim text-on-surface-variant border-b-4 border-outline-variant shadow-sm' : 'bg-primary text-white shadow-[0_8px_0_0_#2c4b58] hover:-translate-y-1 hover:shadow-[0_10px_0_0_#2c4b58] active:translate-y-[8px] active:shadow-none'}`}
        >
          <div className="flex items-center gap-3">
            <AvatarDisplay config={user.avatar} className="w-10 h-10 rounded-2xl shadow-sm" />
            <span className="font-black text-lg hidden sm:inline tracking-wide">{isProfileOpen ? 'Cerrar Perfil' : 'Mi Perfil'}</span>
          </div>
          <div className="bg-white/20 rounded-full p-1 ml-1">
            {isProfileOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </button>
      </div>

      <section className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-on-background mb-2">Tu Progreso</h1>
        <p className="text-xl text-on-surface-variant italic">Elige una categoría para ver tu mapa</p>
      </section>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 sm:gap-4 pb-6 mb-4 px-2 snap-x">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { soundService.playSFX('click'); setActiveCategory(cat.id as any); }}
              className={`snap-center shrink-0 w-auto flex-1 flex flex-row items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 rounded-3xl transition-all chunky-button ${isActive ? `${cat.activeColor} ${cat.onActiveText} shadow-[0_6px_0_0_rgba(0,0,0,0.2)] -translate-y-1 font-black ring-4 ring-offset-2 ring-transparent ring-offset-surface-dim` : `bg-white ${cat.text} border-2 border-surface-dim shadow-[0_6px_0_0_#eae8e3] font-bold hover:-translate-y-1 hover:shadow-[0_8px_0_0_#eae8e3]`}`}
            >
              <div className={`${isActive ? 'bg-white/20' : 'bg-surface-container'} p-2 rounded-2xl shrink-0`}>
                <img src={cat.iconSrc} alt={cat.label} className="w-8 h-8 object-contain filter drop-shadow-md" />
              </div>
              <span className="text-sm sm:text-lg tracking-wide whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Map Visualization */}
      <div className={`rounded-[40px] border-8 border-surface-container ${currentCategory.color}/30 p-8 mb-12 shadow-[0_8px_0_0_#eae8e3] relative overflow-hidden transition-colors duration-500`}>
        {currentCategory.id === 'lenguaje' ? (
          <div className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160'%3E%3Crect width='240' height='160' fill='transparent'/%3E%3Crect x='0' y='145' width='240' height='15' fill='%23c19a6b'/%3E%3Crect x='0' y='160' width='240' height='5' fill='%23a68254'/%3E%3Crect x='15' y='65' width='25' height='80' fill='%23ff6b6b' rx='3'/%3E%3Crect x='20' y='75' width='15' height='60' fill='%23ee5253' rx='1'/%3E%3Crect x='45' y='45' width='35' height='100' fill='%234ecdc4' rx='4'/%3E%3Crect x='50' y='55' width='25' height='80' fill='%230abde3' rx='2'/%3E%3Crect x='85' y='85' width='20' height='60' fill='%23feca57' rx='2'/%3E%3Crect x='110' y='55' width='30' height='90' fill='%23ff9ff3' rx='3'/%3E%3Crect x='145' y='95' width='15' height='50' fill='%2354a0ff' rx='2'/%3E%3Cg transform='rotate(12 170 145)'%3E%3Crect x='170' y='65' width='25' height='80' fill='%235f27cd' rx='3'/%3E%3Crect x='175' y='85' width='15' height='40' fill='%23341f97' rx='1'/%3E%3C/g%3E%3Crect x='210' y='75' width='20' height='70' fill='%23ff9f43' rx='2'/%3E%3C/svg%3E")`, backgroundSize: '160px 106px' }} />
        ) : currentCategory.id === 'matematicas' ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none rounded-[32px] overflow-hidden" style={{ backgroundColor: '#2c4c3b', backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cg fill='%23ffffff' font-family='sans-serif' font-size='20' font-weight='bold' opacity='0.4'%3E%3Ctext x='10' y='40'%3E2 %2B 2 %3D 4%3C/text%3E%3Ctext x='110' y='30'%3Ex %3D y %2B 3%3C/text%3E%3Ctext x='30' y='90'%3E15 %C3%B7 3 %3D 5%3C/text%3E%3Ctext x='130' y='90'%3E4 %C3%97 5 %3D 20%3C/text%3E%3Ctext x='140' y='150'%3Ea%C2%B2 %2B b%C2%B2%3C/text%3E%3Ctext x='10' y='150'%3E10 - 7 %3D 3%3C/text%3E%3Cpath d='M 50 180 L 60 180 M 55 175 L 55 185' stroke='%23fff' stroke-width='3'/%3E%3Ctext x='80' y='190'%3EE%3Dmc%C2%B2%3C/text%3E%3Ctext x='150' y='190'%3E%E2%88%9A64 %3D 8%3C/text%3E%3Ctext x='80' y='130'%3E%CF%80 %E2%89%88 3.14%3C/text%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '200px 200px', border: '12px solid #8e6b4e' }} />
        ) : currentCategory.id === 'historia' ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none rounded-[32px] overflow-hidden opacity-90" style={{ backgroundColor: '#ebd5b3', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cg stroke='%238c694a' stroke-width='1' opacity='0.2'%3E%3Cpath d='M0 100 L400 100 M0 200 L400 200 M0 300 L400 300' /%3E%3Cpath d='M100 0 L100 400 M200 0 L200 400 M300 0 L300 400' /%3E%3C/g%3E%3Cpath d='M0 50 Q50 60 80 30 T150 20 T200 80 T250 50 T300 100 T350 40 L400 50 L400 0 L0 0 Z' fill='%23d4af7a' opacity='0.3' stroke='%238c694a' stroke-width='2' /%3E%3Cpath d='M0 350 Q40 320 100 350 T180 300 T250 360 T320 310 T400 380 L400 400 L0 400 Z' fill='%23d4af7a' opacity='0.3' stroke='%238c694a' stroke-width='2' /%3E%3Cg transform='translate(330, 80) scale(0.6)' opacity='0.4'%3E%3Ccircle cx='0' cy='0' r='40' fill='none' stroke='%238c694a' stroke-width='2' /%3E%3Ccircle cx='0' cy='0' r='30' fill='none' stroke='%238c694a' stroke-width='1' /%3E%3Cpath d='M0 -50 L10 0 L0 50 L-10 0 Z' fill='%238c694a' /%3E%3Cpath d='M-50 0 L0 10 L50 0 L0 -10 Z' fill='%238c694a' /%3E%3Cpath d='M0 -50 L0 50' stroke='%23ebd5b3' stroke-width='1' /%3E%3Cpath d='M-50 0 L50 0' stroke='%23ebd5b3' stroke-width='1' /%3E%3C/g%3E%3Cg transform='translate(80, 250)' stroke='%238c694a' stroke-width='3' stroke-linecap='round'%3E%3Cline x1='-10' y1='-10' x2='10' y2='10' /%3E%3Cline x1='10' y1='-10' x2='-10' y2='10' /%3E%3C/g%3E%3Cg transform='translate(280, 280)' stroke='%238c694a' stroke-width='3' stroke-linecap='round'%3E%3Cline x1='-10' y1='-10' x2='10' y2='10' /%3E%3Cline x1='10' y1='-10' x2='-10' y2='10' /%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '400px 400px', border: '12px solid #c39c6b' }} />
        ) : currentCategory.id === 'ciencias' ? (
          <div className="absolute inset-0 w-full h-full pointer-events-none rounded-[32px] overflow-hidden opacity-100" style={{ backgroundColor: '#faf5ff', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Cg stroke='%23c4b5fd' stroke-width='2' opacity='0.4' fill='none'%3E%3Cpath d='M30,0 L60,15 L60,45 L30,60 L0,45 L0,15 Z' /%3E%3Cpath d='M105,45 L135,60 L135,90 L105,105 L75,90 L75,60 Z' /%3E%3Cpath d='M30,90 L60,105 L60,135 L30,150 L0,135 L0,105 Z' /%3E%3C/g%3E%3Ccircle cx='15' cy='75' r='5' fill='%23a78bfa' opacity='0.5' /%3E%3Ccircle cx='25' cy='85' r='3' fill='%238b5cf6' opacity='0.6' /%3E%3Ccircle cx='45' cy='25' r='4' fill='%23a78bfa' opacity='0.5' /%3E%3Ccircle cx='115' cy='15' r='6' fill='%23c4b5fd' opacity='0.4' /%3E%3Cg transform='translate(80, 110)' opacity='0.8'%3E%3Cpath d='M -10,15 L 10,15 L 15,25 L -15,25 Z' fill='%2334d399' /%3E%3Cpath d='M -5,-5 L 5,-5 L 5,5 L 15,25 L 15,30 L -15,30 L -15,25 L -5,5 Z' fill='none' stroke='%23a855f7' stroke-width='2' stroke-linejoin='round' /%3E%3Ccircle cx='0' cy='20' r='2' fill='%23fff' opacity='0.9' /%3E%3Ccircle cx='-5' cy='25' r='1.5' fill='%23fff' opacity='0.7' /%3E%3Ccircle cx='5' cy='22' r='1' fill='%23fff' opacity='0.8' /%3E%3C/g%3E%3Cg transform='translate(130, 20) rotate(15)' opacity='0.9'%3E%3Cpath d='M -4,10 L 4,10 L 4,25 A 4,4 0 0,1 -4,25 Z' fill='%232dd4bf' /%3E%3Cpath d='M -4,0 L 4,0 M -4,0 L -4,25 A 4,4 0 0,0 4,25 L 4,0' fill='none' stroke='%237c3aed' stroke-width='2' stroke-linecap='round' /%3E%3Ccircle cx='0' cy='15' r='1.5' fill='%23fff' opacity='0.9' /%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '150px 150px', border: '12px solid #c084fc' }} />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, currentColor 3px, transparent 0)', backgroundSize: '40px 40px', color: 'var(--color-primary)' }} />
        )}
        
        {/* Cute decorative elements */}
        <div className="absolute top-10 left-10 opacity-30 animate-pulse pointer-events-none"><Star className={`w-8 h-8 ${currentCategory.id === 'matematicas' ? 'text-white' : currentCategory.text} fill-current`} style={{ filter: currentCategory.id === 'ciencias' ? 'hue-rotate(180deg)' : undefined }} /></div>
        <div className="absolute bottom-16 right-12 opacity-30 animate-[pulse_3s_ease-in-out_infinite] pointer-events-none"><Star className={`w-10 h-10 ${currentCategory.id === 'matematicas' ? 'text-white' : currentCategory.text} fill-current`} style={{ filter: currentCategory.id === 'ciencias' ? 'hue-rotate(180deg)' : undefined }} /></div>
        
        <div className="text-center mb-6 relative z-10 w-full">
          <div className={`inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white ${currentCategory.text} font-black tracking-widest uppercase text-sm border-b-4 ${currentCategory.border} shadow-sm`}>
            <MapIcon className="w-5 h-5" />
            <span>Mapa de progreso: {currentCategory.value}% completado</span>
          </div>
        </div>

        <div className="relative w-full max-w-sm mx-auto h-[400px]">
          {/* SVG Path connecting the nodes */}
          <svg className="absolute inset-0 w-full h-[360px]" style={{ zIndex: 0 }}>
             <defs>
               <style>
                 {`
                   @keyframes march {
                     to { stroke-dashoffset: -40; }
                   }
                   .animate-march {
                     animation: march 1.5s linear infinite;
                   }
                   @keyframes pulse-path {
                     0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
                     50% { opacity: 0.8; filter: drop-shadow(0 0 2px currentColor); }
                   }
                   .animate-pulse-path {
                     animation: pulse-path 3s ease-in-out infinite;
                   }
                 `}
               </style>
             </defs>
             {/* Background dotted path */}
             <path 
               d="M 50 320 C 120 320, 150 250, 250 250 C 350 250, 300 180, 200 180 C 100 180, 100 100, 200 100 C 300 100, 320 40, 250 40" 
               fill="none" 
               stroke={currentCategory.id === 'matematicas' ? 'rgba(255,255,255,0.3)' : currentCategory.id === 'historia' ? 'rgba(140,105,74,0.4)' : currentCategory.id === 'ciencias' ? 'rgba(113,128,150,0.5)' : 'rgba(0,0,0,0.35)'} 
               strokeWidth="20" 
               strokeLinecap="round" 
               strokeLinejoin="round"
               strokeDasharray="0 40"
               className="animate-march"
             />
             {/* Foreground progress path */}
             <path 
               d="M 50 320 C 120 320, 150 250, 250 250 C 350 250, 300 180, 200 180 C 100 180, 100 100, 200 100 C 300 100, 320 40, 250 40" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="20" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
               className={`transition-all duration-1000 ease-out animate-pulse-path ${currentCategory.id === 'matematicas' ? 'text-white' : currentCategory.id === 'historia' ? 'text-amber-900' : currentCategory.id === 'ciencias' ? 'text-blue-300' : currentCategory.text}`}
               strokeDasharray="1000"
               strokeDashoffset={1000 - (1000 * ((Number(currentCategory.value) || 0) / 100))}
             />
          </svg>

          {/* Nodes */}
          {[
            { pos: { left: '50px', top: '320px' }, num: 1 },
            { pos: { left: '250px', top: '250px' }, num: 2 },
            { pos: { left: '200px', top: '180px' }, num: 3 },
            { pos: { left: '200px', top: '100px' }, num: 4 },
            { pos: { left: '250px', top: '40px' }, num: 5, isEnd: true },
          ].map((node, i) => {
            const isCompleted = currentLevelsCompleted > i;
            const isCurrent = currentLevelsCompleted === i;
            const isLocked = currentLevelsCompleted < i;
            
            return (
              <div key={node.num} className="absolute z-10 transition-transform duration-500 hover:scale-110 flex items-center justify-center cursor-pointer" style={{ left: node.pos.left, top: node.pos.top, transform: 'translate(-50%, -50%)' }}>
                 <button 
                  onClick={() => {
                    if (isCurrent) {
                      soundService.playSFX('click');
                      onStartLesson(currentCategory.id as any);
                    }
                  }}
                  className={`w-16 h-16 rounded-3xl rotate-45 border-4 flex items-center justify-center relative ${
                   isCompleted ? `${currentCategory.activeColor} border-black/20 shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]` : 
                   isCurrent ? `bg-white ${currentCategory.border} border-dashed shadow-[6px_6px_0_0_rgba(0,0,0,0.1)] animate-[pulse_2s_infinite] cursor-pointer hover:shadow-lg` : 
                   'bg-surface-container border-surface-dim shadow-none cursor-default'
                 }`}>
                   <div className="-rotate-45 flex items-center justify-center w-full h-full pointer-events-none">
                     {isCompleted && !node.isEnd && <Check className={`w-8 h-8 ${currentCategory.onActiveText}`} strokeWidth={4} />}
                     {isCompleted && node.isEnd && <Crown className={`w-8 h-8 ${currentCategory.onActiveText} fill-current`} />}
                     {isCurrent && !node.isEnd && <span className={`text-2xl font-black ${currentCategory.text}`}>{node.num}</span>}
                     {isCurrent && node.isEnd && <Crown className={`w-8 h-8 ${currentCategory.text}`} />}
                     {isLocked && !node.isEnd && <Lock className="w-6 h-6 text-on-surface-variant/30" />}
                     {isLocked && node.isEnd && <Lock className="w-6 h-6 text-on-surface-variant/30" />}
                   </div>

                   {isCurrent && (
                     <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none -rotate-45">
                       <img src={currentCategory.iconSrc} referrerPolicy="no-referrer" alt={currentCategory.label} className="w-[60px] h-[60px] max-w-none object-contain bounce-animation filter drop-shadow-xl" />
                     </div>
                   )}
                   {isCompleted && node.isEnd && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none -rotate-45">
                       <Crown className="w-12 h-12 text-[#FFD700] fill-current bounce-animation" style={{ filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.2))' }} />
                     </div>
                   )}
                 </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
};

const ParentsView = ({ user, progress, stats }: { user: UserProfile; progress: CategoryProgress; stats: import('./types').Stats }) => {
  // Real data mapped to display formats
  const radarData = [
    { subject: 'Lenguaje', value: progress.lenguaje || 0, fullMark: 100 },
    { subject: 'Matemáticas', value: progress.matematicas || 0, fullMark: 100 },
    { subject: 'Historia', value: progress.historia || 0, fullMark: 100 },
    { subject: 'Ciencias', value: progress.ciencias || 0, fullMark: 100 },
  ];

  // Ranking data sorted by value
  const rankingData = [...radarData].sort((a, b) => b.value - a.value);

  const getAvg = (s: { correct: number; total: number }) => s.total > 0 ? Math.round((s.correct / s.total) * 10 * 10) / 10 : 0;

  // Real bar chart data representing average correct answers by category
  const barData = [
    { name: 'Lenguaje', respuestas:  getAvg(stats.answers.lenguaje), fill: '#a9c9d9' },
    { name: 'Matemáticas', respuestas: getAvg(stats.answers.matematicas), fill: '#e6e1ad' },
    { name: 'Historia', respuestas: getAvg(stats.answers.historia), fill: '#c19a6b' },
    { name: 'Ciencias', respuestas: getAvg(stats.answers.ciencias), fill: '#e9d5ff' },
  ];

  const [volume, setVolume] = useState(soundService.volume);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundService.setVolume(newVol);
  };

  return (
    <main className="pt-28 pb-40 px-6 max-w-5xl mx-auto min-h-screen relative">
      <section className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-primary mb-2">Panel de Tutores</h1>
          <p className="text-xl text-on-surface-variant">Estadísticas y progreso de {user.name}</p>
        </div>
        <div className="hidden sm:block">
          <AvatarDisplay config={user.avatar} className="w-20 h-20 rounded-full border-4 border-primary shadow-sm" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[28px] border-4 border-surface-dim shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tiempo en pantalla</p>
            <p className="text-3xl font-black text-on-surface">{formatTime(stats.screenTime)}</p>
            <p className="text-sm text-green-600 font-bold mt-1">✓ Activo hoy</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[28px] border-4 border-surface-dim shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <Book className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tiempo de lectura</p>
            <p className="text-3xl font-black text-on-surface">{formatTime(stats.readingTime)}</p>
            <p className="text-sm text-on-surface-variant mt-1">Acumulado total</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[32px] border-4 border-surface-dim shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-on-surface">Configuración y Sonido</h2>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-on-surface">Volumen ({Math.round(volume * 100)}%)</label>
              <Volume2 className="w-5 h-5 text-on-surface-variant" />
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume} 
              onChange={handleVolumeChange}
              onPointerUp={() => soundService.playSFX('click')}
              className="w-full h-3 bg-surface-container rounded-full appearance-none outline-none accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-[32px] border-4 border-surface-dim shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-on-surface">Ranking de Materias</h2>
          </div>
          <div className="space-y-4">
            {rankingData.map((item, index) => (
              <div key={item.subject} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-tertiary-container text-tertiary shadow-[0_4px_0_0_#d3c794] border-2 border-tertiary' : 'bg-surface-container text-on-surface-variant'}`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-bold text-on-surface">{item.subject}</span>
                    <span className="font-bold text-on-surface-variant">{item.value}% completado</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${item.value}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[32px] border-4 border-surface-dim shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold text-on-surface">Respuestas por Categoría</h2>
          </div>
          <p className="text-sm text-on-surface-variant mb-6 font-bold">Promedio de respuestas correctas (sobre 10)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '16px', border: '4px solid #E5E7EB', fontWeight: 'bold', padding: '12px' }}
                />
                <Bar dataKey="respuestas" radius={[8, 8, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {activeCategory === 'lenguaje' && user.grade === '1ro básico' && (
  <div className="mb-8 p-6 bg-primary-fixed rounded-3xl border-4 border-primary-container flex flex-col sm:flex-row items-center gap-6 shadow-[0_6px_0_0_#a9c9d9]">
    <div className="w-20 h-20 shrink-0 bg-white rounded-2xl flex items-center justify-center border-4 border-primary-container shadow-inner">
      <span className="text-4xl">✏️</span>
    </div>
    <div className="flex-1 text-center sm:text-left">
      <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
        ¡Actividad especial!
      </span>
      <h3 className="text-2xl font-extrabold text-on-primary-container mb-1">Práctica de Caligrafía</h3>
      <p className="text-on-primary-container/80 font-medium">Traza palabras y mejora tu escritura con Leo.</p>
    </div>
    <button
      onClick={() => { soundService.playSFX('click'); onGoToCalligraphy(); }}
      className="shrink-0 bg-primary text-white font-bold text-lg px-8 py-4 rounded-full chunky-button chunky-shadow-primary whitespace-nowrap"
    >
      ¡Practicar!
    </button>
  </div>
)}
    </main>
  );
};
