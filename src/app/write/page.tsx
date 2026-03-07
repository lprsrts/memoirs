"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import nextDynamic from "next/dynamic";
import Link from "next/link";

const MarkdownRenderer = nextDynamic(() => import("@/components/MarkdownRenderer"), { ssr: false });

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function detectDateFromText(text: string): string | null {
  const trMonths: Record<string, number> = {
    ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5,
    temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11,
  };
  const enMonths: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };

  // "7 Mart 2026" or "7 March 2026"
  const nameMatch = text.match(/(\d{1,2})\s+([A-Za-zÇĞİÖŞÜçğışöşü]+)\s+(\d{4})/i);
  if (nameMatch) {
    const day = parseInt(nameMatch[1]);
    const monthStr = nameMatch[2].toLowerCase();
    const year = parseInt(nameMatch[3]);
    const month = trMonths[monthStr] ?? enMonths[monthStr];
    if (month !== undefined && year >= 1900 && year <= 2100) {
      const d = new Date(year, month, day);
      if (d.getMonth() === month && d.getDate() === day)
        return d.toISOString().slice(0, 10);
    }
  }

  // "DD.MM.YYYY" or "DD/MM/YYYY"
  const numMatch = text.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (numMatch) {
    const day = parseInt(numMatch[1]);
    const month = parseInt(numMatch[2]) - 1;
    const year = parseInt(numMatch[3]);
    if (year >= 1900 && year <= 2100) {
      const d = new Date(year, month, day);
      if (d.getMonth() === month && d.getDate() === day)
        return d.toISOString().slice(0, 10);
    }
  }

  return null;
}

export default function WritePage() {
  return (
    <Suspense>
      <WritePageInner />
    </Suspense>
  );
}

function WritePageInner() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postDate, setPostDate] = useState(todayISO());
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dateManuallySet, setDateManuallySet] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load existing post when editing
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/posts/${editId}`)
      .then((r) => r.json())
      .then((post) => {
        setTitle(post.title ?? "");
        setContent(post.content ?? "");
        setPostDate(post.post_date?.slice(0, 10) ?? todayISO());
        setImageUrls(post.image_urls ?? []);
        setDateManuallySet(true);
      })
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoadingPost(false));
  }, [editId]);

  function handleContentChange(value: string) {
    setContent(value);
    if (!dateManuallySet) {
      const detected = detectDateFromText(value);
      if (detected) setPostDate(detected);
    }
  }

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
    const res = await fetch(isEdit ? `/api/posts/${editId}` : "/api/posts", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        image_urls: imageUrls,
        post_date: postDate,
      }),
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

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "none",
    border: "none",
    color: "var(--fg)",
    fontFamily: "var(--font-body)",
    outline: "none",
    resize: "none",
  };

  if (loadingPost) {
    return (
      <main style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-muted)", letterSpacing: "1px" }}>
          loading...
        </p>
      </main>
    );
  }

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid var(--border)", gap: "12px" }}>
        <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-muted)", textDecoration: "none", letterSpacing: "1px" }}>
          &larr; back
        </Link>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button type="button" onClick={() => setPreview((p) => !p)}
            style={{ background: "none", border: "1px solid var(--border)", color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "4px 10px", cursor: "pointer", letterSpacing: "1px" }}>
            {preview ? "[ EDIT ]" : "[ PREVIEW ]"}
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ background: "none", border: "1px solid var(--border)", color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "4px 10px", cursor: uploading ? "wait" : "pointer", letterSpacing: "1px" }}>
            {uploading ? "uploading..." : "[ IMAGE ]"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          <button type="button" onClick={handleSignOut}
            style={{ background: "none", border: "none", color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer", letterSpacing: "1px" }}>
            sign out
          </button>
        </div>
      </div>

      {/* Editor */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{ ...inputBase, borderBottom: "1px solid var(--border)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", padding: "28px 48px 16px", fontWeight: 700 }}
        />

        {/* Date */}
        <div style={{ padding: "10px 48px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-muted)", letterSpacing: "1.5px", textTransform: "uppercase", flexShrink: 0 }}>
            date
          </label>
          <input
            type="date"
            value={postDate}
            onChange={(e) => { setPostDate(e.target.value); setDateManuallySet(true); }}
            style={{ ...inputBase, fontFamily: "var(--font-mono)", fontSize: "12px", width: "auto", colorScheme: "light dark" }}
          />
          {!dateManuallySet && detectDateFromText(content) && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-muted)", letterSpacing: "0.5px" }}>
              detected from text
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 48px" }}>
          {preview ? (
            <MarkdownRenderer content={content || "*nothing to preview yet*"} />
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={"Write in Markdown. Use $...$ for inline math, $$...$$ for display math."}
              style={{ ...inputBase, borderBottom: "1px solid var(--border)", fontSize: "15px", lineHeight: "1.8", height: "100%", minHeight: "300px", fontFamily: "var(--font-mono)" }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 48px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "16px" }}>
          {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#e55", flex: 1 }}>{error}</p>}
          {success && <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", flex: 1 }}>saved. returning...</p>}
          {!error && !success && <span style={{ flex: 1 }} />}
          <button type="submit" disabled={saving || success}
            style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "1.5px", padding: "8px 20px", cursor: saving ? "wait" : "pointer" }}>
            {saving ? "saving..." : isEdit ? "[ UPDATE ]" : "[ PUBLISH ]"}
          </button>
        </div>
      </form>
    </main>
  );
}
