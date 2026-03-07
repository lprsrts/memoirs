"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import EnvelopePile from "./EnvelopePile";
import MarkdownRenderer from "./MarkdownRenderer";
import ThemeToggle from "./ThemeToggle";
import type { Post } from "@/lib/types";

interface Props {
  posts: Post[];
  isAdmin: boolean;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export default function DeskView({ posts, isAdmin }: Props) {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<Post | null>(null);
  const [mobileView, setMobileView] = useState<"pile" | "reading">("pile");

  const handleSelect = (post: Post) => {
    const next = selected?.id === post.id ? null : post;
    setSelected(next);
    if (isMobile) setMobileView(next ? "reading" : "pile");
  };

  const handleClose = () => {
    setSelected(null);
    if (isMobile) setMobileView("pile");
  };

  const date = selected
    ? new Date(
        selected.post_date ? selected.post_date + "T12:00:00" : selected.created_at
      ).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  const showPile = !isMobile || mobileView === "pile";
  const showReading = !isMobile || mobileView === "reading";

  return (
    <main style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>

      {/* ── Envelope desk ── */}
      {showPile && (
        <aside
          style={{
            width: isMobile ? "100%" : "380px",
            minWidth: isMobile ? "unset" : "380px",
            height: "100%",
            background: "var(--sidebar-bg)",
            borderRight: isMobile ? "none" : "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
            overflow: "visible",
            position: "relative",
          }}
        >
          <div style={{ padding: isMobile ? "36px 28px 12px" : "44px 36px 16px", flexShrink: 0 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-muted)", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" }}>
              memoirs
            </p>
            <h1 style={{ fontSize: "clamp(1.5rem, 2vw, 2rem)", fontFamily: "var(--font-body)", color: "var(--fg)", lineHeight: 1.15, marginBottom: "12px" }}>
              A pile of<br />letters.
            </h1>
            <p style={{ fontSize: "12px", color: "var(--fg-muted)", lineHeight: 1.6 }}>
              {isMobile ? "Tap a letter to read it." : "Hover to find what calls to you."}
            </p>
          </div>

          <EnvelopePile posts={posts} selectedId={selected?.id ?? null} onSelect={handleSelect} />

          <div style={{ padding: isMobile ? "12px 28px 28px" : "16px 36px 32px", display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
            {isAdmin && (
              <Link href="/write" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "1px", color: "var(--accent)", textDecoration: "none", border: "1px solid var(--accent)", padding: "5px 10px", display: "inline-block" }}>
                [ WRITE ]
              </Link>
            )}
            <ThemeToggle />
          </div>
        </aside>
      )}

      {/* ── Reading panel ── */}
      {showReading && (
        <section style={{ flex: 1, overflowY: "auto", position: "relative", background: "var(--bg)", width: isMobile ? "100%" : undefined }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 16 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{ padding: isMobile ? "36px 24px 48px" : "60px 72px", maxWidth: "780px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "44px" }}>
                  <button
                    onClick={handleClose}
                    style={{ background: "none", border: "none", color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: "11px", cursor: "pointer", letterSpacing: "1px", padding: 0 }}
                  >
                    &larr; {isMobile ? "back" : "close"}
                  </button>
                  {isAdmin && (
                    <Link href={`/write?id=${selected.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "1px", color: "var(--fg-muted)", textDecoration: "none", border: "1px solid var(--border)", padding: "3px 8px" }}>
                      [ EDIT ]
                    </Link>
                  )}
                </div>

                <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-muted)", letterSpacing: "0.5px", marginBottom: "14px" }}>
                  {date}
                </p>
                <h1 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", fontFamily: "var(--font-body)", color: "var(--fg)", lineHeight: 1.2, marginBottom: "44px" }}>
                  {selected.title}
                </h1>
                <MarkdownRenderer content={selected.content} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "1.5px" }}
              >
                select a letter.
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </main>
  );
}
