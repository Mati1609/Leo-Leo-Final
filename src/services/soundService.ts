class ProceduralBGM {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTimeout: number | undefined;
  
  private notes = [
    261.63, 392.00, 329.63, 523.25, 392.00, 659.25, 523.25, 783.99,
    659.25, 523.25, 392.00, 329.63, 523.25, 392.00, 329.63, 261.63,
    349.23, 523.25, 440.00, 698.46, 523.25, 880.00, 698.46, 1046.50,
    880.00, 698.46, 523.25, 440.00, 698.46, 523.25, 440.00, 349.23
  ];
  
  private step = 0;
  private tempoMs = 280;
  public volume = 0.5;

  start(ctx: AudioContext) {
    if (this.isPlaying) return;
    this.ctx = ctx;
    this.isPlaying = true;
    this.playNextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }
  }

  private playNextNote = () => {
    if (!this.isPlaying || !this.ctx) return;
    
    const freq = this.notes[this.step % this.notes.length];
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const maxGain = 0.08 * this.volume;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(maxGain, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + this.tempoMs / 1000 + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + this.tempoMs / 1000 + 1);
    
    this.step++;
    this.currentTimeout = window.setTimeout(this.playNextNote, this.tempoMs);
  }
}

class SoundService {
  private audioCtx: AudioContext | null = null;
  private proceduralBgm: ProceduralBGM = new ProceduralBGM();
  public isMuted: boolean = false;
  private hasInteracted: boolean = false;
  public volume = 0.5;

  constructor() {
    this.setupInteractionListeners();
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.proceduralBgm.volume = this.volume;
  }

  private setupInteractionListeners = () => {
    const handleInteract = () => {
      this.resumeBGMOnInteract();
    };

    // Sin { once: true } — en iOS a veces no dispara correctamente
    // Los removemos manualmente después de la primera interacción
    const events = ['click', 'touchstart', 'touchend', 'keydown', 'pointerdown'];
    
    const onceHandler = () => {
      handleInteract();
      events.forEach(e => window.removeEventListener(e, onceHandler));
    };

    events.forEach(e => window.addEventListener(e, onceHandler, { passive: true }));
  };

  private async initCtx() {
    if (!this.audioCtx) {
      // iOS requiere webkit prefix
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }

    // CRÍTICO en iOS: siempre intentar resume si está suspended
    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn('AudioContext resume failed:', e);
      }
    }
  }

  async playBGM() {
    if (this.isMuted) return;
    await this.initCtx();
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.proceduralBgm.start(this.audioCtx);
    }
  }

  async resumeBGMOnInteract() {
    this.hasInteracted = true;
    if (!this.isMuted) {
      await this.playBGM();
    }
  }

  stopBGM() {
    this.proceduralBgm.stop();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      if (this.hasInteracted) {
        this.playBGM();
      }
    }
    return this.isMuted;
  }

  async playSFX(type: 'correct' | 'incorrect' | 'click' | 'coin') {
    if (this.isMuted) return;
    await this.initCtx();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    const baseGain = this.volume;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gainNode.gain.setValueAtTime(0.5 * baseGain, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'correct':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.50, now + 0.3);
        gainNode.gain.setValueAtTime(0.2 * baseGain, now);
        gainNode.gain.linearRampToValueAtTime(0.1 * baseGain, now + 0.3);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'incorrect':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        
        const osc2 = this.audioCtx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(220, now);
        osc2.frequency.exponentialRampToValueAtTime(110, now + 0.3);
        osc2.connect(gainNode);
        
        gainNode.gain.setValueAtTime(0.2 * baseGain, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.3);
        osc2.stop(now + 0.3);
        break;

      case 'coin':
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.1);
        gainNode.gain.setValueAtTime(0.1 * baseGain, now);
        gainNode.gain.linearRampToValueAtTime(0.1 * baseGain, now + 0.3);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
    }
  }
}

export const soundService = new SoundService();
export const soundService = new SoundService();
