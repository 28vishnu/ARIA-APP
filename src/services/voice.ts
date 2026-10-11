class VoiceService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private speaking = false;

  private getSpeechSynthesis(): SpeechSynthesis | null {
    if (typeof window === "undefined") {
      return null;
    }

    if (!("speechSynthesis" in window)) {
      return null;
    }

    return window.speechSynthesis;
  }

  private getPreferredVoice(
    voices: SpeechSynthesisVoice[]
  ): SpeechSynthesisVoice | undefined {
    if (!voices.length) {
      return undefined;
    }

    // Prefer a natural English voice.
    const preferredNames = [
      "Google US English",
      "Microsoft Aria Online",
      "Microsoft Aria",
      "Samantha",
      "Alex",
    ];

    for (const name of preferredNames) {
      const match = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes(name.toLowerCase()) &&
          voice.lang.toLowerCase().startsWith("en")
      );

      if (match) {
        return match;
      }
    }

    return (
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() === "en-us"
      ) ||
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en")
      ) ||
      voices[0]
    );
  }

  async speak(text: string): Promise<void> {
    const speech = this.getSpeechSynthesis();

    const message = String(text || "").trim();

    if (!message) {
      return;
    }

    if (!speech) {
      console.warn(
        "[VoiceService] Speech synthesis is not supported."
      );

      return;
    }

    return new Promise((resolve) => {
      speech.cancel();

      const utterance =
        new SpeechSynthesisUtterance(message);

      this.utterance = utterance;

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = "en-US";

      const voices = speech.getVoices();
      const preferred = this.getPreferredVoice(voices);

      if (preferred) {
        utterance.voice = preferred;
        utterance.lang = preferred.lang;
      }

      let settled = false;

      const finish = () => {
        if (settled) {
          return;
        }

        settled = true;
        this.speaking = false;

        if (this.utterance === utterance) {
          this.utterance = null;
        }

        resolve();
      };

      utterance.onstart = () => {
        this.speaking = true;
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (event) => {
        console.warn(
          "[VoiceService] Speech synthesis error:",
          event
        );

        finish();
      };

      speech.speak(utterance);
    });
  }

  stop() {
    const speech = this.getSpeechSynthesis();

    if (!speech) {
      return;
    }

    speech.cancel();

    this.speaking = false;
    this.utterance = null;
  }

  isSpeaking() {
    const speech = this.getSpeechSynthesis();

    if (!speech) {
      return false;
    }

    return this.speaking || speech.speaking;
  }
}

export default new VoiceService();