const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function fetchThreads() {
  const res = await fetch(`${API_URL}/threads/show_all`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch threads");
  return res.json();
}

export async function createThread(title: string) {
  const res = await fetch(`${API_URL}/threads/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create thread");
  return res.json();
}

export async function deleteThread(threadId: string) {
  const res = await fetch(`${API_URL}/threads/delete/${threadId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete thread");
  return res.json();
}

export async function fetchThreadMessages(threadId: string) {
  const res = await fetch(`${API_URL}/threads/show/${threadId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}


export async function renameThread(threadId: string, title: string) {
  const res = await fetch(`${API_URL}/threads/rename/${threadId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename thread");
  return res.json();
}