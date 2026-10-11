import { useARIAState } from "@/store/ariaState";

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

class SpeechService {
  recognition: SpeechRecognitionInstance | null = null;

  private callback: ((text: string) => void) | null = null;
  private supported = false;
  private listening = false;
  private starting = false;

  initialize(onResult: (text: string) => void) {
    if (typeof window === "undefined") {
      return false;
    }

    this.callback = onResult;

    const SpeechRecognitionAPI = (
      window as any
    ).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.supported = false;

      console.warn(
        "[SpeechService] Speech Recognition is not supported by this browser."
      );

      return false;
    }

    this.supported = true;

    // Prevent duplicate recognition instances.
    if (this.recognition) {
      return true;
    }

    const Recognition =
      SpeechRecognitionAPI as SpeechRecognitionConstructor;

    this.recognition = new Recognition();

    this.recognition.lang = "en-US";

    // ARIA currently uses hold-to-talk / single-command recognition.
    this.recognition.continuous = false;

    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.starting = false;
      this.listening = true;

      useARIAState.getState().setReactor("LISTENING");
    };

    this.recognition.onresult = (event: any) => {
      try {
        const result = event?.results?.[0]?.[0];

        if (!result) {
          return;
        }

        const transcript = String(
          result.transcript || ""
        ).trim();

        if (!transcript) {
          return;
        }

        console.debug(
          "[SpeechService] Transcript:",
          transcript
        );

        if (this.callback) {
          this.callback(transcript);
        }
      } catch (error) {
        console.error(
          "[SpeechService] Failed to process speech result:",
          error
        );
      }
    };

    this.recognition.onerror = (event: any) => {
      this.starting = false;
      this.listening = false;

      const error = String(
        event?.error || "unknown"
      );

      console.warn(
        "[SpeechService] Speech recognition error:",
        error
      );

      // These are normal/recoverable browser states.
      if (
        error === "aborted" ||
        error === "no-speech"
      ) {
        const reactor =
          useARIAState.getState().reactor;

        if (reactor === "LISTENING") {
          useARIAState.getState().setReactor("IDLE");
        }

        return;
      }

      // Permission/security/network errors are real errors.
      useARIAState.getState().setReactor("ERROR");
    };

    this.recognition.onend = () => {
      this.starting = false;
      this.listening = false;

      const reactor =
        useARIAState.getState().reactor;

      if (reactor === "LISTENING") {
        useARIAState.getState().setReactor("IDLE");
      }
    };

    return true;
  }

  start() {
    if (!this.recognition || !this.supported) {
      console.warn(
        "[SpeechService] Cannot start: speech recognition unavailable."
      );

      return false;
    }

    if (this.listening || this.starting) {
      return true;
    }

    try {
      // -------------------------------------------------
      // PHASE 6 — VOICE BARGE-IN
      // -------------------------------------------------
      // Starting STT means the user wants to speak.
      // Cancel any active browser TTS immediately so
      // ARIA does not continue speaking over the user.
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        window.speechSynthesis.speaking
      ) {
        window.speechSynthesis.cancel();
      }

      this.starting = true;

      this.recognition.start();

      return true;
    } catch (error) {
      this.starting = false;

      console.warn(
        "[SpeechService] Failed to start recognition:",
        error
      );

      return false;
    }
  }

  stop() {
    if (!this.recognition) {
      return;
    }

    if (!this.listening && !this.starting) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      console.warn(
        "[SpeechService] Failed to stop recognition:",
        error
      );

      this.listening = false;
      this.starting = false;
    }
  }

  abort() {
    if (!this.recognition) {
      return;
    }

    try {
      this.recognition.abort();
    } catch (error) {
      console.warn(
        "[SpeechService] Failed to abort recognition:",
        error
      );
    }

    this.listening = false;
    this.starting = false;
  }

  isSupported() {
    return this.supported;
  }

  isListening() {
    return this.listening || this.starting;
  }
}

export default new SpeechService();
