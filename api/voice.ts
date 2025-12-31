const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export interface TranscriptionResponse {
  text: string;
  language: string;
  confidence: number;
}

/**
 * Send a recorded voice blob to backend and get transcription.
 */
export async function transcribeVoice(audioBlob: Blob): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append("file", audioBlob);

  const res = await fetch(`${API_URL}/voice/transcribe`, {
    method: "POST",
    body: formData,
    credentials: "include", // keep session if you are using cookies
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Voice transcription failed: ${errText}`);
  }

  const data = (await res.json()) as TranscriptionResponse;

  return data;
}
