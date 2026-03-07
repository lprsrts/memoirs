"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";
import type { Post } from "@/lib/types";

interface Props {
  post: Post | null;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: Props) {
  useEffect(() => {
    if (!post) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [post, onClose]);

  const date = post
    ? new Date(post.created_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <AnimatePresence>
      {post && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(2px)",
              zIndex: 1000,
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(90vw, 780px)",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
              padding: "48px 52px",
              zIndex: 1001,
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "20px",
                background: "none",
                border: "none",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              [ ESC ]
            </button>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--fg-muted)",
                letterSpacing: "0.5px",
                marginBottom: "12px",
              }}
            >
              {date}
            </p>
            <h1
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontFamily: "var(--font-body)",
                color: "var(--fg)",
                marginBottom: "32px",
                lineHeight: 1.25,
              }}
            >
              {post.title}
            </h1>

            <MarkdownRenderer content={post.content} />

            {post.image_urls && post.image_urls.length > 0 && (
              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {post.image_urls.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Image ${i + 1}`}
                    style={{ maxWidth: "100%", border: "1px solid var(--border)" }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
