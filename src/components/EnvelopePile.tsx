"use client";

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
  if (posts.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "1px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        no letters yet.
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "visible",
      }}
    >
      {posts.map((post, i) => {
        const layout = getLayout(post.id);
        return (
          <EnvelopeCard
            key={post.id}
            post={post}
            index={i}
            total={posts.length}
            offsetX={layout.offsetX}
            offsetY={layout.offsetY}
            rotation={layout.rotation}
            isSelected={post.id === selectedId}
            onClick={() => onSelect(post)}
          />
        );
      })}
    </div>
  );
}
