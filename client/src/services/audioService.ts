// Pokédex Audio Engine: Cries + Synthesized Sci-Fi SFX with Web Audio API

class PokedexAudioService {
  private audioCtx: AudioContext | null = null;
  private currentCryAudio: HTMLAudioElement | null = null;
  private crySourceNode: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentCryAudio) {
      this.currentCryAudio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.currentCryAudio) {
      this.currentCryAudio.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Synthesized mechanical sci-fi sound for opening/closing the Kalos Pokédex
  public playMechanicalSlideSound(isOpen: boolean) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      if (isOpen) {
        // Ascending sci-fi power up
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.35);
      } else {
        // Descending lock down
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);
      }

      gain.gain.setValueAtTime(0.08 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isOpen ? 0.38 : 0.32));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  // High-tech holographic beep for button taps & keypad
  public playBeep(freq: number = 880, duration: number = 0.08) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + duration);

      gain.gain.setValueAtTime(0.05 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // AudioContext gesture ignore
    }
  }

  // Play Pokémon official cry with analyser hook
  public playPokemonCry(
    url: string,
    onEnded?: () => void,
    onError?: (err: unknown) => void
  ): { stop: () => void } {
    this.initContext();

    if (this.currentCryAudio) {
      this.currentCryAudio.pause();
      this.currentCryAudio.src = '';
      this.currentCryAudio = null;
    }

    const audio = new Audio(url);
    audio.crossOrigin = 'anonymous';
    audio.volume = this.isMuted ? 0 : this.volume;
    this.currentCryAudio = audio;

    // Connect to analyser if AudioContext is active
    if (this.audioCtx && this.analyser) {
      try {
        if (!this.crySourceNode) {
          this.crySourceNode = this.audioCtx.createMediaElementSource(audio);
          this.crySourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        }
      } catch {
        // Fallback directly to normal element output if media source already tied
      }
    }

    const handleEnded = () => {
      if (onEnded) onEnded();
    };

    audio.addEventListener('ended', handleEnded);

    audio.play().catch((err) => {
      if (onError) onError(err);
      if (onEnded) onEnded();
    });

    return {
      stop: () => {
        audio.pause();
        audio.removeEventListener('ended', handleEnded);
        if (onEnded) onEnded();
      }
    };
  }

  public stopCry() {
    if (this.currentCryAudio) {
      this.currentCryAudio.pause();
      this.currentCryAudio.currentTime = 0;
      this.currentCryAudio = null;
    }
  }
}

export const audioService = new PokedexAudioService();
