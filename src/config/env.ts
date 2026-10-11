export const ENV = {
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ??
    "https://aria-ai-s5go.onrender.com",

  WS_URL:
    process.env.NEXT_PUBLIC_WS_URL ??
    "wss://aria-ai-s5go.onrender.com",

  APP_NAME: "ARIA",

  VERSION: "1.0.0"
};
