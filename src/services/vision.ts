import { getApiBase } from "./api";

export async function analyzeImage(image: string) {
  const response = await fetch(`${getApiBase()}/vision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, session_id: "web" }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Vision request failed with HTTP ${response.status}`);
  return data;
}
