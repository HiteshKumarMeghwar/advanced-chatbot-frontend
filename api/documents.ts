const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/* ---------- upload (with progress) ---------- */
export function uploadDocuments(files, threadId, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.responseText || "Upload failed"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("thread_id", threadId);

    xhr.open("POST", `${API_URL}/documents/upload`);
    xhr.withCredentials = true;
    xhr.send(form);
  });
}


/* ---------- delete a single document ---------- */
export async function deleteDocument(threadId, docId) {
  const res = await fetch(
    `${API_URL}/documents/delete/${threadId}/${docId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete document");
  }

  return res.json();
}