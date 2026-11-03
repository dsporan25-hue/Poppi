import { AppLanguage, VoiceSettings } from '../types';

class CyberSoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // High-tech futuristic JARVIS activation chime
  playJarvisWake() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // AudioContext policy
    }
  }

  // Futuristic task complete chime
  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  // Warning / Approval required alert
  playAlert() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(480, now + 0.1);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export const soundEngine = new CyberSoundEngine();

// Speech Synthesis & Recognition Handler
export class VoiceManager {
  private recognition: any = null;
  private isListeningInternal = false;

  constructor(
    private settings: VoiceSettings,
    private onWake: () => void,
    private onStop: () => void,
    private onTranscript: (text: string) => void
  ) {
    this.initRecognition();
  }

  updateSettings(newSettings: VoiceSettings) {
    this.settings = newSettings;
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition is not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      const langMap: Record<AppLanguage, string> = {
        en: 'en-US',
        bn: 'bn-BD',
        hi: 'hi-IN',
      };
      this.recognition.lang = langMap[this.settings.language] || 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interimTranscript += piece;
          }
        }

        const combined = (finalTranscript + ' ' + interimTranscript).toLowerCase().trim();

        // Check wake and stop phrases
        if (combined.includes('hello poppy') || combined.includes('helo poppy') || combined.includes('হ্যাল Poppy') || combined.includes('হ্যালো পপি')) {
          soundEngine.playJarvisWake();
          this.onWake();
        } else if (combined.includes('stop poppy') || combined.includes('থাম Poppy') || combined.includes('रुको')) {
          this.stopSpeaking();
          this.onStop();
        }

        if (finalTranscript.trim()) {
          this.onTranscript(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition event:', e.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListeningInternal && this.settings.isListening) {
          // Restart recognition for continuous wake listening if enabled
          try {
            this.recognition.start();
          } catch (e) {}
        }
      };
    } catch (err) {
      console.error('Failed to init SpeechRecognition:', err);
    }
  }

  startListening() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (this.recognition) {
      try {
        this.isListeningInternal = true;
        this.recognition.start();
      } catch (e) {
        // Already started
      }
    }
  }

  stopListening() {
    this.isListeningInternal = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  speak(text: string, langOverride?: AppLanguage) {
    if (!this.settings.isVoiceActive || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel current speaking
    window.speechSynthesis.cancel();

    // Clean text of code blocks and markdown symbols for natural speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted from audio output.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_~#]/g, '')
      .slice(0, 400); // Keep voice response punchy

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = this.settings.volume;
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;

    const targetLang = langOverride || this.settings.language;
    const langCodes: Record<AppLanguage, string> = {
      en: 'en-US',
      bn: 'bn-IN',
      hi: 'hi-IN',
    };
    utterance.lang = langCodes[targetLang] || 'en-US';

    // Try to find a matching voice (prefer robotic / Jarvis-like / native)
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matched = voices.find((v) => {
        if (targetLang === 'bn') return v.lang.startsWith('bn');
        if (targetLang === 'hi') return v.lang.startsWith('hi');
        return v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Jarvis'));
      });
      if (matched) {
        utterance.voice = matched;
      }
    }

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
