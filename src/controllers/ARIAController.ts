import ARIA from "@/services/aria";
import { uploadFile } from "@/services/upload";
import VoiceService from "@/services/voice";
import SpeechService from "@/services/speech";
import { analyzeImage } from "@/services/vision";

import { useARIAState } from "@/store/ariaState";
import { useDocumentStore } from "@/store/document";
import { useChatStore } from "@/store/chat";

class ARIAController {
  async processVoice(text: string) {
    const query = text.trim();

    if (!query) {
      return;
    }

    const setReactor =
      useARIAState.getState().setReactor;

    try {
      // Stop recognition before processing the command.
      SpeechService.stop();

      // Stop any previous TTS before starting a new response.
      VoiceService.stop();

      setReactor("THINKING");

      useChatStore.getState().addUser(query);

      // -------------------------------------------------
      // PHASE 6 — VOICE → ARIA → TTS
      // -------------------------------------------------
      const reply = await ARIA.execute(query);

      if (!reply) {
        setReactor("IDLE");
        return;
      }

      useChatStore.getState().addAssistant(reply);

      setReactor("SPEAKING");

      await VoiceService.speak(reply);

      return reply;
    } catch (error) {
      console.error(
        "[ARIAController] Voice processing failed:",
        error
      );

      setReactor("ERROR");

      throw error;
    } finally {
      // Do not blindly force IDLE while another voice
      // operation may already be running.
      const currentReactor =
        useARIAState.getState().reactor;

      if (
        currentReactor === "THINKING" ||
        currentReactor === "SPEAKING"
      ) {
        setReactor("IDLE");
      }
    }
  }

  async upload(file: File) {
    const setReactor = useARIAState.getState().setReactor;
    const setDocument = useDocumentStore.getState().setDocument;

    try {
      setReactor("PROCESSING_FILE");

      const result = await uploadFile(file);

      setDocument(
        result.filename,
        result.summary
      );

      setReactor("SPEAKING");

      await VoiceService.speak(
        "Document uploaded successfully. I have analyzed it. Ask me anything about this document."
      );

      return result;
    } catch (error) {
      setReactor("ERROR");
      throw error;
    } finally {
      setTimeout(() => {
        useARIAState.getState().setReactor("IDLE");
      }, 3500);
    }
  }

  async analyzeImage(image: string) {
    const setReactor = useARIAState.getState().setReactor;

    try {
      if (!image) {
        throw new Error("No image data was provided.");
      }

      setReactor("THINKING");

      // Send captured image to the backend Vision API.
      const result = await analyzeImage(image);

      if (!result?.success) {
        throw new Error(
          result?.description || "Vision analysis failed."
        );
      }

      // Gemini's current VisionEngine returns its analysis
      // inside the text field.
      const reply =
        result.text ||
        result.description ||
        "I analyzed the image, but there was no visual result.";

      // Add the vision result to the normal ARIA conversation.
      useChatStore.getState().addAssistant(reply);

      setReactor("SPEAKING");

      await VoiceService.speak(reply);

      return reply;
    } catch (error) {
      console.error(
        "[ARIAController] Image analysis failed:",
        error
      );

      setReactor("ERROR");

      throw error;
    } finally {
      const currentReactor =
        useARIAState.getState().reactor;

      if (
        currentReactor === "THINKING" ||
        currentReactor === "SPEAKING"
      ) {
        setReactor("IDLE");
      }
    }
  }

  startListening() {
    // User is taking control of the conversation.
    // Stop any active ARIA speech first.
    VoiceService.stop();

    useARIAState.getState().setReactor("LISTENING");

    const started = SpeechService.start();

    if (!started) {
      useARIAState.getState().setReactor("ERROR");
    }

    return started;
  }

  toggle() {
    const state =
      useARIAState.getState().reactor;

    if (
      state === "LISTENING" ||
      SpeechService.isListening()
    ) {
      SpeechService.stop();

      useARIAState.getState().setReactor("IDLE");

      return;
    }

    if (
      state === "SPEAKING" ||
      VoiceService.isSpeaking()
    ) {
      VoiceService.stop();
    }

    this.startListening();
  }
}

export default new ARIAController();
