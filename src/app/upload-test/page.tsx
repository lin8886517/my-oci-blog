"use client";

import { useState } from "react";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");

  async function handleUpload() {
    if (!file) {
      setResult("select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  }

  return (
    <main style={{ padding: "40px", maxWidth: "720px", margin: "0 auto" }}>
      <h1>Upload Test</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        onClick={handleUpload}
        style={{ display: "block", marginTop: "16px", padding: "8px 16px" }}
      >
        上传到 OCI
      </button>
      <pre style={{ marginTop: "24px", whiteSpace: "pre-wrap" }}>{result}</pre>
    </main>
  );
}