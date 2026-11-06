/**
 * Web Audio API synthesizer for cute pink sound effects & ringtone
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private ringOscillator: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private isRinging = false;
  private ringInterval: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Cute pop sound when sending message
  playPop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Cute double chime when message arrives
  playChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [784, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch {
      // Audio context might be restricted
    }
  }

  // Sweet sparkles sound (e.g. for hugs/kisses action)
  playSparkle() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [659.25, 783.99, 987.77, 1318.51];
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } catch {
      // Ignored
    }
  }

  private activeRingingGains: GainNode[] = [];

  // Cute music-box style phone call ringtone
  startRinging() {
    if (this.isRinging) return;
    this.isRinging = true;

    const playChimeSequence = () => {
      if (!this.isRinging) return;
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const melody = [587.33, 659.25, 783.99, 880, 783.99, 987.77];

        melody.forEach((freq, idx) => {
          if (!this.isRinging) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.14, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          this.activeRingingGains.push(gain);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
      } catch {
        // Ignored
      }
    };

    playChimeSequence();
    this.ringInterval = setInterval(playChimeSequence, 2000);
  }

  stopRinging() {
    this.isRinging = false;
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    // Instantly mute and disconnect all ringing notes
    if (this.activeRingingGains.length > 0) {
      this.activeRingingGains.forEach((g) => {
        try {
          if (this.ctx) {
            g.gain.setValueAtTime(0, this.ctx.currentTime);
          }
          g.disconnect();
        } catch {}
      });
      this.activeRingingGains = [];
    }
  }

  // Call connect short beep
  playCallConnected() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignored
    }
  }

  // Call end beep
  playCallEnd() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [500, 400, 300].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.08);
      });
    } catch {
      // Ignored
    }
  }
}

export const sounds = new SoundEffects();

// Speech Synthesis for character speaking Vietnamese
export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*[^*]+\*/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[🥺💕🥰👉👈🌸🍓✨]/g, '')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.name.toLowerCase().includes('vietnam'));
    if (viVoice) {
      utterance.voice = viVoice;
    } else {
      utterance.lang = 'vi-VN';
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
    if (onEnd) onEnd();
  }
}

let currentAudio: HTMLAudioElement | null = null;

export function stopTanVuVoice() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Dedicated Yunxi Neural male voice for Tấn Vũ (zh-CN-YunxiNeural)
 * Giọng con trai nũng nịu, ngọt ngào, cưng chiều
 */
export async function speakChineseMaleVoice(
  chineseText: string,
  _voiceOrPitch?: string | number,
  onEnd?: () => void
) {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  stopTanVuVoice();

  const cleanText = chineseText
    .replace(/\*[^*]+\*/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[🥺💕🥰👉👈🌸🍓✨]/g, '')
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText }),
    });

    const data = await res.json();
    if (data.success && data.audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };

      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Neural TTS playback fallback to WebSpeech:', err);
  }

  // Graceful browser fallback if network issue
  try {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.88;
    utterance.pitch = 0.65;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  } catch {
    if (onEnd) onEnd();
  }
}

export const playTanVuVoice = speakChineseMaleVoice;

