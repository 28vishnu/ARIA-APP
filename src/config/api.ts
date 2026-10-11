import { ENV } from "./env";

export const API = {
  BASE_URL: ENV.API_URL,

  HEALTH: "/",

  CHAT: "/chat",

  TELEGRAM: "/telegram-webhook",

  VOICE: "/voice",

  MEMORY: "/memory",

  DOCUMENTS: "/documents",

  SEARCH: "/search",

  AGENTS: "/agents"
};
