const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function parseImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_URL}/image_upload/parse`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });

  if (!res.ok) throw new Error("Image parse failed");
  return res.json();
}
