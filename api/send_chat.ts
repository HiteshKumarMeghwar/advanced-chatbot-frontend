const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

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
