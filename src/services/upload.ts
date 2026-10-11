import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://aria-ai-s5go.onrender.com";

export async function uploadFile(file: File) {
  const form = new FormData();

  form.append("file", file);
  form.append("session_id", "web");

  try {
    const response = await axios.post(
      `${API}/upload`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      }
    );

    alert("4. Upload completed");

    return response.data;

  } catch (error: any) {

    if (error.response) {
      alert(
        `Status: ${error.response.status}\n\n` +
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      alert("Request sent but no response received.");
    } else {
      alert(error.message);
    }

    throw error;
  }
}
