const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function updateThemeDB(theme: string) {
  const res = await fetch(`${API_URL}/user_theme/change`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // cookie-based auth
    body: JSON.stringify({ theme }),
  });

  if (!res.ok) {
    throw new Error("Failed to update theme");
  }

  return res.json();
}

export async function updateToolStatus(
  status: string,
  tool_id: number // ✅ FIXED
) {
  const res = await fetch(`${API_URL}/user_tool/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, tool_id }),
  });

  if (!res.ok) {
    throw new Error("Failed to update tool status");
  }

  return res.json();
}

export async function updateUserNotification(
  notification_enabled: boolean // ✅ correct TS boolean
) {
  const res = await fetch(`${API_URL}/user_notification/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ notification_enabled }),
  });

  if (!res.ok) {
    throw new Error("Failed to update notification settings");
  }

  return res.json();
}

export async function fetchTools() {
  const res = await fetch(`${API_URL}/user_tool/view`, {
    method: "POST",          // ← was missing
    credentials: "include",  // cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}), // empty body is fine
  });
  if (!res.ok) throw new Error("Failed to fetch Tools");
  return res.json();
}