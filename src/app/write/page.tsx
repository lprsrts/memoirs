"use client";

export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic";
import Link from "next/link";

const MarkdownRenderer = nextDynamic(() => import("@/components/MarkdownRenderer"), { ssr: false });

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": file.type, "x-filename": file.name },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrls((prev) => [...prev, data.url]);
      setContent((prev) => prev + `\n\n![${file.name}](${data.url})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), image_urls: imageUrls }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save.");
      setSaving(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/"), 1200);
  }

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const sharedInputStyle: React.CSSProperties = {
    width: "100%",
    background: "none",
    border: "none",
    borderBottom: "1px solid var(--border)",
    color: "var(--fg)",
    fontFamily: "var(--font-body)",
    outline: "none",
    resize: "none",
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 32px",
          borderBottom: "1px solid var(--border)",
          gap: "12px",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--fg-muted)",
            textDecoration: "none",
            letterSpacing: "1px",
          }}
        >
          &larr; back
        </Link>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              padding: "4px 10px",
              cursor: "pointer",
              letterSpacing: "1px",
            }}
          >
            {preview ? "[ EDIT ]" : "[ PREVIEW ]"}
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              padding: "4px 10px",
              cursor: uploading ? "wait" : "pointer",
              letterSpacing: "1px",
            }}
          >
            {uploading ? "uploading..." : "[ IMAGE ]"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "none",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              cursor: "pointer",
              letterSpacing: "1px",
            }}
          >
            sign out
          </button>
        </div>
      </div>

      {/* Editor */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            ...sharedInputStyle,
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            padding: "28px 48px 16px",
            fontWeight: 700,
          }}
        />

        <div style={{ flex: 1, overflow: "auto", padding: "24px 48px" }}>
          {preview ? (
            <MarkdownRenderer content={content || "*nothing to preview yet*"} />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"Write in Markdown. Use $...$ for inline math, $$...$$ for display math.\n\nExample:\nThe quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$."}
              style={{
                ...sharedInputStyle,
                fontSize: "15px",
                lineHeight: "1.8",
                height: "100%",
                minHeight: "300px",
                fontFamily: "var(--font-mono)",
              }}
            />
          )}
        </div>

        <div
          style={{
            padding: "14px 48px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {error && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#e55", flex: 1 }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", flex: 1 }}>
              saved. returning...
            </p>
          )}
          {!error && !success && <span style={{ flex: 1 }} />}
          <button
            type="submit"
            disabled={saving || success}
            style={{
              background: "none",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "1.5px",
              padding: "8px 20px",
              cursor: saving ? "wait" : "pointer",
            }}
          >
            {saving ? "saving..." : "[ PUBLISH ]"}
          </button>
        </div>
      </form>
    </main>
  );
}
