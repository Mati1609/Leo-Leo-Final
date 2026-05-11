class ProceduralBGM {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTimeout: number | undefined;
  
  private notes = [
    // Upbeat C Major bouncy melody
    261.63, 392.00, 329.63, 523.25, 392.00, 659.25, 523.25, 783.99,
    659.25, 523.25, 392.00, 329.63, 523.25, 392.00, 329.63, 261.63,
    // F Major bouncy
    349.23, 523.25, 440.00, 698.46, 523.25, 880.00, 698.46, 1046.50,
    880.00, 698.46, 523.25, 440.00, 698.46, 523.25, 440.00, 349.23
  ];
  
  private step = 0;
  private tempoMs = 280; // upbeat pace
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
    
    // Music box / xylophone sound
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    // Envelope for soft, relaxing strike
    const maxGain = 0.08 * this.volume;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(maxGain, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + this.tempoMs / 1000 + 0.5); // long tail
    
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
      // Remove listeners after first interaction
      window.removeEventListener('click', handleInteract);
      window.removeEventListener('touchstart', handleInteract);
      window.removeEventListener('keydown', handleInteract);
      window.removeEventListener('pointerdown', handleInteract);
    };

    window.addEventListener('click', handleInteract, { once: true });
    window.addEventListener('touchstart', handleInteract, { once: true });
    window.addEventListener('keydown', handleInteract, { once: true });
    window.addEventListener('pointerdown', handleInteract, { once: true });
  };

  private initCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playBGM() {
    if (this.isMuted) return;
    this.initCtx();
    if (this.audioCtx) {
      this.proceduralBgm.start(this.audioCtx);
    }
  }

  resumeBGMOnInteract() {
    this.hasInteracted = true;
    if (!this.isMuted) {
      this.playBGM();
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

  playSFX(type: 'correct' | 'incorrect' | 'click' | 'coin') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    const baseGain = this.volume;

    switch (type) {
      case 'click':
        // A very short, gentle woodblock tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gainNode.gain.setValueAtTime(0.5 * baseGain, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'correct':
        // A delightful quick major arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gainNode.gain.setValueAtTime(0.2 * baseGain, now);
        gainNode.gain.linearRampToValueAtTime(0.1 * baseGain, now + 0.3);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      case 'incorrect':
        // A dissonant, descending "womp" that is clear for children
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
        // "Chaching" or double ding
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.1); // E6
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
