const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function fetchMcpServers() {
  const res = await fetch(`${API_URL}/mcp_server/show_all`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch servers");
  return res.json();
}

export async function createMcpServer(data: {
  name: string;
  url: string;
  token?: string;
}) {
  const res = await fetch(`${API_URL}/mcp_server/create`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      payload: {
        transport: "streamable_http",
        url: data.url,
        extra: data.token ? { token: data.token } : undefined,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to create server");
  }

  return res.json();
}

export async function deleteMcpServer(name: string) {
  const res = await fetch(
    `${API_URL}/mcp_server/delete_for_user?mcp_name=${encodeURIComponent(name)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to delete server");
  return res.json();
}

export async function refreshTools() {
  const res = await fetch(`${API_URL}/mcp_server/insert_tool_user`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to inserting tools");
  return res.json();
}

