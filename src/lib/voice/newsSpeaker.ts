import { NewsEvent } from "@/types/trading";

type SpeechStateListener = (isSpeaking: boolean) => void;

/**
 * NewsSpeakerService: Disabled as speech speaking has been removed per instructor requirements.
 * Sound alerts and chimes remain active via audio.ts.
 */
class NewsSpeakerService {
  private enabled: boolean = false;

  public setEnabled(enabled: boolean): void {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return false;
  }

  public onSpeakingChange(listener: SpeechStateListener): () => void {
    return () => {};
  }

  public speak(news: NewsEvent): void {
    // Disabled: Speech synthesis speaking removed
  }

  public stop(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const newsSpeaker = new NewsSpeakerService();
