// utils/sendChatSSE.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

interface ChatSSEOptions {
  threadId: string;
  query: string;
  image_url?: string | null;
  onToken: (token: string) => void;
  onInterrupt?: (data: any) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

export function sendChatSSE({
  threadId,
  query,
  image_url,
  onToken,
  onInterrupt,
  onError,
  onDone,
}: ChatSSEOptions): () => void {
  const controller = new AbortController();
  let aborted = false;

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
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text || "Unknown"}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.trim()) continue;

            const dataLine = part
              .split("\n")
              .find((line) => line.startsWith("data:"))
              ?.slice(5)
              .trim();

            if (!dataLine) continue;

            if (dataLine === "[DONE]") {
              onDone?.();
              return;
            }

            try {
              const data = JSON.parse(dataLine);

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
            } catch (e) {
              console.error("Parse error:", dataLine);
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
