"use client";

import { useState, useCallback } from "react";
import EnvelopeCard from "./EnvelopeCard";
import type { Post } from "@/lib/types";

interface Props {
  posts: Post[];
  selectedId: string | null;
  onSelect: (post: Post) => void;
}

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seeded(seed: number, salt: number): number {
  return (Math.imul(seed ^ salt, 2654435761) >>> 0) / 4294967296;
}

function getLayout(id: string) {
  const s = hashStr(id);
  return {
    offsetX: (seeded(s, 1) - 0.5) * 90,
    offsetY: (seeded(s, 2) - 0.5) * 160,
    rotation: (seeded(s, 3) - 0.5) * 18,
  };
}

export default function EnvelopePile({ posts, selectedId, onSelect }: Props) {
  // Tracks interaction order: last item = on top (highest z-index).
  // Initialized so newest post (index 0) starts on top.
  const [order, setOrder] = useState<string[]>(() => [...posts.map((p) => p.id)].reverse());

  const bringToTop = useCallback((id: string) => {
    setOrder((prev) => {
      if (prev[prev.length - 1] === id) return prev; // already on top
      return [...prev.filter((x) => x !== id), id];
    });
  }, []);

  if (posts.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "1px", padding: "20px", textAlign: "center" }}>
        no letters yet.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: "relative", overflow: "visible" }}>
      {posts.map((post) => {
        const layout = getLayout(post.id);
        const orderIndex = order.indexOf(post.id); // higher = rendered on top
        return (
          <EnvelopeCard
            key={post.id}
            post={post}
            orderIndex={orderIndex}
            offsetX={layout.offsetX}
            offsetY={layout.offsetY}
            rotation={layout.rotation}
            isSelected={post.id === selectedId}
            onBringToTop={() => bringToTop(post.id)}
            onClick={() => onSelect(post)}
          />
        );
      })}
    </div>
  );
}
