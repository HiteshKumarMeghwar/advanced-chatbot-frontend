const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function fetchMemoryMetrics() {
  const res = await fetch(`${API_URL}/memory/metrics`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch memory metrics");
  return res.json();
}

export async function fetchMemorySettings() {
  const res = await fetch(`${API_URL}/memory/user_memory_settings`, {
    credentials: "include",
  });
  return res.json();
}

export async function fetchEpisodicRecentMemories() {
  const res = await fetch(`${API_URL}/memory/episodic/recent`, {
    credentials: "include",
  });
  return res.json();
}

export async function fetchSemanticMemories() {
  const res = await fetch(`${API_URL}/memory/semantic`, {
    credentials: "include",
  });
  return res.json();
}

export async function fetchProceduralMemories() {
  const res = await fetch(`${API_URL}/memory/procedural`, {
    credentials: "include",
  });
  return res.json();
}

export async function disableSemanticMemory(id: number) {
  const res = await fetch(`${API_URL}/memory/semantic/${id}/disable`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to disable semantic memory');
  return res.json();
}

export async function deleteSemanticMemory(id: number) {
  const res = await fetch(`${API_URL}/memory/semantic/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete semantic memory');
  return res.json(); // { ok: true }
}

export async function disableProceduralMemory(id: number) {
  const res = await fetch(`${API_URL}/memory/procedural/${id}/disable`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to disable procedural memory');
  return res.json();
}

export async function deleteProceduralMemory(id: number) {
  const res = await fetch(`${API_URL}/memory/procedural/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete procedural memory');
  return res.json(); // { ok: true }
}

export async function toggleMemorySetting(field: string) {
  const res = await fetch(`${API_URL}/memory/toggle/${field}`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Toggle failed");
  return res.json(); // { field, enabled }
}