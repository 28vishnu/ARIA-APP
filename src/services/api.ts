const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || "https://aria-ai-s5go.onrender.com";

export function getApiBase() {
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("aria.backendUrl");
    if (saved) return saved.replace(/\/+$/, "");
  }
  return DEFAULT_API.replace(/\/+$/, "");
}

export async function sendMessage(message: string, sessionId = "web", baseUrl?: string, signal?: AbortSignal) {
  const response = await fetch(`${(baseUrl || getApiBase()).replace(/\/+$/, "")}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || data.reply || `ARIA backend returned HTTP ${response.status}`);
  if (data.success === false) throw new Error(data.reply || "ARIA could not complete the request.");
  return String(data.reply ?? data.response ?? JSON.stringify(data, null, 2));
}

export async function checkBackend(baseUrl?: string) {
  const response = await fetch(`${(baseUrl || getApiBase()).replace(/\/+$/, "")}/health`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}`);
  return response.json();
}

export async function uploadFile(file: File, sessionId = "web", baseUrl?: string, signal?: AbortSignal) {
  const form = new FormData();
  form.append("file", file);
  form.append("session_id", sessionId);
  const response = await fetch(`${(baseUrl || getApiBase()).replace(/\/+$/, "")}/upload`, {
    method: "POST", body: form, signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Upload failed with HTTP ${response.status}`);
  return data as { success?: boolean; filename?: string; summary?: string };
}
