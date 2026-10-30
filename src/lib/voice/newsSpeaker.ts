import { NewsEvent } from "@/types/trading";

type SpeechStateListener = (isSpeaking: boolean) => void;

class NewsSpeakerService {
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<SpeechStateListener> = new Set();
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.initVoice();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
    }
  }

  private initVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer Indian English voice, or high quality natural voices
    const indianVoice = voices.find(
      (v) => v.lang === "en-IN" || v.lang.startsWith("en-IN") || v.name.includes("India")
    );
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Online"))
    );
    const englishVoice = voices.find((v) => v.lang.startsWith("en"));

    this.preferredVoice = indianVoice || naturalVoice || englishVoice || voices[0];
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public onSpeakingChange(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(isSpeaking: boolean) {
    this.listeners.forEach((fn) => {
      try {
        fn(isSpeaking);
      } catch (err) {
        console.error("Speech listener error:", err);
      }
    });
  }

  public speak(news: NewsEvent): void {
    if (!this.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    this.stop();

    // Configure sentiment-driven vocal dynamics
    let pitch = 1.0;
    let rate = 1.0;
    let prefix = "Attention trading floor: Breaking news alert.";

    if (news.sentiment.includes("strongly_bearish") || news.soundCue === "crash_alert") {
      pitch = 1.15;
      rate = 1.12;
      prefix = "Urgent market warning! Emergency alert!";
    } else if (news.sentiment.includes("strongly_bullish")) {
      pitch = 1.06;
      rate = 1.06;
      prefix = "Market surge alert! Major positive update!";
    } else if (news.soundCue === "fed_bell") {
      pitch = 0.98;
      rate = 0.96;
      prefix = "Central bank policy announcement.";
    }

    // Override if scenario defines specific prosody
    if (news.voiceNarration) {
      if (news.voiceNarration.pitch) pitch = news.voiceNarration.pitch;
      if (news.voiceNarration.rate) rate = news.voiceNarration.rate;
    }

    const script = `${prefix} ${news.title}. ${news.description}`;
    const utterance = new SpeechSynthesisUtterance(script);

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.currentUtterance = utterance;
      this.notify(true);
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      this.notify(false);
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      this.notify(false);
    };

    // Small delay allows audio fanfare/chime to play first
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis error:", err);
      }
    }, 450);
  }

  public stop(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.currentUtterance = null;
    this.notify(false);
  }
}

export const newsSpeaker = new NewsSpeakerService();
