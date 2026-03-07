"use client";

import { useRef, useEffect, RefObject } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Post } from "@/lib/types";

const SIGMA = 140;
const MAX_LIFT = 0.72;

interface Props {
  post: Post;
  index: number;
  total: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  containerRef: RefObject<HTMLDivElement | null>;
  offsetX: number;
  offsetY: number;
  rotation: number;
  onClick: () => void;
}

export default function LetterCard({
  post,
  index,
  total,
  mouseX,
  mouseY,
  containerRef,
  offsetX,
  offsetY,
  rotation,
  onClick,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cx = useRef(0);
  const cy = useRef(0);

  useEffect(() => {
    const update = () => {
      if (!cardRef.current || !containerRef.current) return;
      const r = cardRef.current.getBoundingClientRect();
      const c = containerRef.current.getBoundingClientRect();
      cx.current = r.left - c.left + r.width / 2;
      cy.current = r.top - c.top + r.height / 2;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [containerRef, offsetX, offsetY]);

  const scale = useTransform([mouseX, mouseY] as MotionValue<number>[], (latest: number[]) => {
    const [mx, my] = latest;
    if (mx === Infinity) return 1;
    const dist = Math.sqrt((mx - cx.current) ** 2 + (my - cy.current) ** 2);
    return 1 + MAX_LIFT * Math.exp(-(dist ** 2) / (2 * SIGMA ** 2));
  });

  const date = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const preview = post.content
    .replace(/\$\$[\s\S]*?\$\$/g, "[math]")
    .replace(/\$[^$]*\$/g, "[math]")
    .replace(/[#*`_\[\]]/g, "")
    .trim()
    .slice(0, 140);

  return (
    <motion.div
      ref={cardRef}
      className="letter-card"
      onClick={onClick}
      style={{
        x: offsetX,
        y: offsetY,
        rotate: rotation,
        scale,
        zIndex: total - index,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <div className="letter-card-date">{date}</div>
      <h3 className="letter-card-title">{post.title}</h3>
      <p className="letter-card-preview">{preview}{preview.length >= 140 ? "…" : ""}</p>
    </motion.div>
  );
}
