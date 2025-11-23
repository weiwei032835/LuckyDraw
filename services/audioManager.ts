/**
 * A procedural audio manager using Web Audio API.
 * No external files are required.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentVolume: number = 0.5;
  private bgmOscillators: OscillatorNode[] = [];
  private isBgmPlaying: boolean = false;

  constructor() {
    // Initialize on user interaction usually, but we set up structure here
  }

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateGain();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.currentVolume = Math.max(0, Math.min(1, val));
    this.updateGain();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateGain();
    return this.isMuted;
  }

  private updateGain() {
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = this.isMuted ? 0 : this.currentVolume;
      this.masterGain.gain.setTargetAtTime(target, now, 0.1);
    }
  }

  public playTick() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playWin() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Major chord arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; // C Major
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      
      osc.connect(gain);
      gain.connect(this.masterGain!);

      const startTime = t + (i * 0.1);
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

      osc.start(startTime);
      osc.stop(startTime + 1);
    });
  }

  public startBGM() {
    this.init();
    if (this.isBgmPlaying || !this.ctx || !this.masterGain) return;
    
    this.isBgmPlaying = true;
    this.scheduleBGMNote();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.bgmOscillators = [];
  }

  private scheduleBGMNote() {
    if (!this.isBgmPlaying || !this.ctx || !this.masterGain) return;

    // Simple cheerful loop
    const bpm = 120;
    const beatDur = 60 / bpm;
    const t = this.ctx.currentTime;

    // Bass line (very simple)
    const playBass = (freq: number, time: number, dur: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(this.masterGain!);
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
      osc.start(time);
      osc.stop(time + dur);
      this.bgmOscillators.push(osc);
    };

    // Play a simple 4-beat loop
    playBass(261.63, t, beatDur); // C4
    playBass(329.63, t + beatDur, beatDur); // E4
    playBass(392.00, t + beatDur * 2, beatDur); // G4
    playBass(261.63, t + beatDur * 3, beatDur); // C4

    // Schedule next loop
    setTimeout(() => {
      if(this.isBgmPlaying) this.scheduleBGMNote();
    }, beatDur * 4 * 1000);
  }
}

export const audioManager = new AudioManager();