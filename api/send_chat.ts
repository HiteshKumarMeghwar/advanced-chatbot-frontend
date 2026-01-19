import { toast } from "sonner";

// utils/sendChatSSE.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface ChatSSEOptions {
  threadId: string;
  query: string;
  image_url?: string | null;
  ocr_text?: string | null;
  edit_message_id?: number | null;
  onToken: (token: string) => void;
  onInterrupt?: (data: any) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
  onMessageCreated?: (messageId: number) => void;
}

export function sendChatSSE({
  threadId,
  query,
  image_url,
  ocr_text,
  edit_message_id,
  onToken,
  onInterrupt,
  onError,
  onDone,
  onMessageCreated,
}: ChatSSEOptions): () => void {
  const controller = new AbortController();
  let aborted = false;
  let messageIdReceived = false;

  // Start the POST request
  fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    signal: controller.signal,
    body: JSON.stringify({
      thread_id: threadId,
      query: query.trim(),
      image_url: image_url ?? null,
      ocr_text: ocr_text ?? null,
      edit_message_id: edit_message_id ?? null,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text || "Unknown"}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split on \n\n but keep the last incomplete part in buffer
          let parts = buffer.split("\n\n");
          const completeParts = parts.slice(0, -1);  // All complete events
          buffer = parts[parts.length - 1];          // Remainder (incomplete)

          for (const part of completeParts) {
            if (!part.trim()) continue;

            const lines = part.split("\n");
            const dataLine = lines.find(l => l.startsWith("data:"))?.substring(5).trim();

            if (!dataLine) continue;

            if (dataLine === "[DONE]") {
              onDone?.();
              return;
            }

            try {
              const data = JSON.parse(dataLine);

              if (data.type === "telemetry" && Array.isArray(data.ui_events)) {
                data.ui_events.forEach((evt) => {
                  const message = TOAST_COPY[evt.type];
                  if (!message) return;

                  toast[evt.severity || "default"](message, { duration: 3000 });
                });
              }


              if (data.type === "interrupt") {
                onInterrupt?.(data);
                onDone?.();
                return;
              }

              if (data.error) {
                onError?.(data.error);
                onDone?.();
                return;
              }

              if (data.token) {
                onToken(data.token);
              }
              
              /* message id handshake (ONCE) */
              if (data.type === "message_created" && !messageIdReceived) {
                messageIdReceived = true;
                onMessageCreated?.(data.message_id);
                // DO NOT return / DO NOT continue stream loop
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", dataLine, e);
            }
          }
        }
        onDone?.();
      } catch (err: any) {
        if (!aborted && err.name !== "AbortError") {
          onError?.(err.message || "Stream failed");
          onDone?.();
        }
      }
    })
    .catch((err) => {
      if (!aborted && err.name !== "AbortError") {
        onError?.(err.message || "Connection failed");
        onDone?.();
      }
    });

  // Return cleanup function
  return () => {
    aborted = true;
    controller.abort();
  };
}

export const TOAST_COPY = {
  memory_used: "Using your previous context to improve this response.",
  memory_updated: "Saved for future conversations.",
  privacy_protected: "Sensitive details were automatically protected.",
  conversation_compacted: "Older messages were compressed to keep things fast.",
  model_degraded: "Response generated with limited capacity.",
};


// export async function sendChatSSE({ threadId, query, onToken, onDone }) {
//   const res = await fetch(`${API_URL}/chat/stream`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     credentials: "include",
//     body: JSON.stringify({ thread_id: threadId, query }),
//   });

//   if (!res.body) throw new Error("No stream");

//   const reader = res.body.getReader();
//   const decoder = new TextDecoder("utf-8");

//   let buffer = "";

//   while (true) {
//     const { value, done } = await reader.read();
//     if (done) break;

//     buffer += decoder.decode(value, { stream: true });

//     const events = buffer.split("\n\n");
//     buffer = events.pop();

//     for (const event of events) {
//       if (!event.startsWith("data:")) continue;

//       const data = event.replace("data:", "").trim();
//       if (data === "[DONE]") {
//         onDone();
//         return;
//       }

//       const parsed = JSON.parse(data);
//       onToken(parsed.token);
//     }
//   }
// }


// export async function sendChat({
//   threadId,
//   query,
// }: {
//   threadId: string;
//   query: string;
// }) {
//   const res = await fetch(`${API_URL}/chat/send`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify({
//       thread_id: threadId,
//       query,
//     }),
//   });

//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.detail || "Chat sending failed");
//   }

//   return res.json(); // ChatResponse
// }
