const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchExpenses(filters: Record<string, any>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const res = await fetch(
    `${API_URL}/expenses/list?${params.toString()}`,
    { credentials: "include" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return res.json();
}


