const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function fetchAccounts() {
  const res = await fetch(`${API_URL}/accounts/integrations`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function toggleAccount(id: string, is_active: boolean) {
  const res = await fetch(
    `${API_URL}/accounts/integrations/${id}/toggle`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    }
  );
  if (!res.ok) throw new Error("Failed to toggle account");
  return res.json();
}

export async function disconnectAccount(id: string) {
  const res = await fetch(
    `${API_URL}/accounts/integrations/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Failed to disconnect");
  return res.json();
}
