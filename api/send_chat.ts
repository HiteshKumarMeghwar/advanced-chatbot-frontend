const API_URL = process.env.NEXT_PUBLIC_API_URL as string;



export async function sendChatSSE({ threadId, query, onToken, onDone }) {
  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ thread_id: threadId, query }),
  });

  if (!res.body) throw new Error("No stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop();

    for (const event of events) {
      if (!event.startsWith("data:")) continue;

      const data = event.replace("data:", "").trim();
      if (data === "[DONE]") {
        onDone();
        return;
      }

      const parsed = JSON.parse(data);
      onToken(parsed.token);
    }
  }
}


export async function sendChat({
  threadId,
  query,
}: {
  threadId: string;
  query: string;
}) {
  const res = await fetch(`${API_URL}/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      thread_id: threadId,
      query,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Chat sending failed");
  }

  return res.json(); // ChatResponse
}
