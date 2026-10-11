import SpeechService from "@/services/speech";
import VoiceService from "@/services/voice";
import ARIA from "@/services/aria";
import { useARIAState } from "@/store/ariaState";
import { useSettingsStore } from "@/store/settings";

class VoiceController {
  private listening = false;
  private holdActive = false;

  isListening() {
    return this.listening;
  }

  async start() {
    if (this.listening) return;

    this.listening = true;

    useARIAState.getState().setReactor("LISTENING");

    SpeechService.start();
  }

  async stop() {
    this.listening = false;
    this.holdActive = false;

    SpeechService.stop();

    VoiceService.stop();

    useARIAState.getState().setReactor("IDLE");
  }

  async toggle() {
    if (VoiceService.isSpeaking()) {
      await this.stop();
      return;
    }

    if (this.listening) {
      await this.stop();
    } else {
      await this.start();
    }
  }

  async beginHold() {
    if (this.holdActive) return;

    this.holdActive = true;

    await this.start();
  }

  async endHold() {
    if (!this.holdActive) return;

    this.holdActive = false;

    SpeechService.stop();
  }

  async process(text: string) {
    const query = text.trim();

    if (!query) {
      return;
    }

    try {
      // Stop active recognition before sending the command
      // to ARIA. This prevents duplicate transcripts while
      // ARIA is processing the request.
      SpeechService.stop();

      this.listening = false;
      this.holdActive = false;

      useARIAState.getState().setReactor("THINKING");

      // -------------------------------------------------
      // PHASE 6 — VOICE → ARIA COGNITIVE PIPELINE
      // -------------------------------------------------
      // Voice input uses the exact same ARIA.execute()
      // pathway as normal text input.
      const reply = await ARIA.execute(query);

      if (!reply) {
        useARIAState.getState().setReactor("IDLE");
        return;
      }

      useARIAState.getState().setReactor("SPEAKING");

      await VoiceService.speak(reply);

      const continuous =
        useSettingsStore.getState().continuousConversation;

      if (continuous) {
        await this.start();
      } else {
        this.listening = false;

        useARIAState.getState().setReactor("IDLE");
      }

      this.holdActive = false;

      return reply;
    } catch (error) {
      console.error(
        "[VoiceController] Voice command failed:",
        error
      );

      this.listening = false;
      this.holdActive = false;

      useARIAState.getState().setReactor("ERROR");

      throw error;
    }
  }
}

export default new VoiceController();
