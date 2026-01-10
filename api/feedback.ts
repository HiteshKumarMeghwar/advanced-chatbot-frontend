const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function sendFeedback(
  messageId: number,      // JS number is fine (BigInt only if > 9 quadrillion)
  rating: "up" | "down",
  reason?: string,
  model?: string,
  toolUsed?: string | null,
  latencyMs?: number | null
) {
  const res = await fetch(`${API_URL}/feedback/user_feedback`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message_id: messageId,
      rating,
      reason: reason?.trim() || null,
      model: model ?? null,
      tool_used: toolUsed ?? null,
      latency_ms: latencyMs ?? null,
    }),
  });
  if (!res.ok) throw new Error("Failed to save feedback");
  return res.json();
}