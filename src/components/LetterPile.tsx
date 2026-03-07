"use client";

import { useRef, useState, useCallback } from "react";
import { useMotionValue } from "framer-motion";
import LetterCard from "./LetterCard";
import PostModal from "./PostModal";
import type { Post } from "@/lib/types";

interface Props {
  posts: Post[];
}

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seeded(seed: number, salt: number): number {
  return ((Math.imul(seed ^ salt, 2654435761) >>> 0) / 4294967296);
}

function getCardLayout(id: string) {
  const s = hashStr(id);
  return {
    offsetX: (seeded(s, 1) - 0.5) * 170,
    offsetY: (seeded(s, 2) - 0.5) * 130,
    rotation: (seeded(s, 3) - 0.5) * 26,
  };
}

export default function LetterPile({ posts }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const [activePost, setActivePost] = useState<Post | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(Infinity);
    mouseY.set(Infinity);
  }, [mouseX, mouseY]);

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
          fontSize: "13px",
          letterSpacing: "1px",
        }}
      >
        no entries yet.
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {posts.map((post, i) => {
          const layout = getCardLayout(post.id);
          return (
            <LetterCard
              key={post.id}
              post={post}
              index={i}
              total={posts.length}
              mouseX={mouseX}
              mouseY={mouseY}
              containerRef={containerRef}
              offsetX={layout.offsetX}
              offsetY={layout.offsetY}
              rotation={layout.rotation}
              onClick={() => setActivePost(post)}
            />
          );
        })}
      </div>

      <PostModal post={activePost} onClose={() => setActivePost(null)} />
    </>
  );
}
