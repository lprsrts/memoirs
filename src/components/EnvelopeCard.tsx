"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "@/lib/types";

const W = 210;
const H = 148;
const FLAP_H = 74;
const LETTER_H = 82;
// In closed state the letter sits inside the envelope body (covered by it).
// LETTER_TOP is where the letter's top edge rests within the outer wrapper.
const LETTER_TOP = H - LETTER_H - 8; // 58px from outer-div top
// How far the letter slides up when open — chosen to show ~60px above envelope.
const LETTER_OPEN_Y = -(LETTER_TOP + 60); // -118

const EASE = "easeInOut";

interface Props {
  post: Post;
  index: number;
  total: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function EnvelopeCard({
  post,
  index,
  total,
  offsetX,
  offsetY,
  rotation,
  isSelected,
  onClick,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const isOpen = hovered || isSelected;

  const date = new Date(post.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      // Outer wrapper: controls pile position, rotation, and z-order.
      // width/height set explicitly so children can reference them.
      animate={{ rotate: isOpen ? 0 : rotation, scale: isOpen ? 1.08 : 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: -W / 2,
        marginTop: -H / 2,
        x: offsetX,
        y: offsetY,
        width: W,
        height: H,
        zIndex: hovered ? 200 : isSelected ? 150 : total - index,
        cursor: "pointer",
      }}
    >
      {/*
       * Letter paper — sits BEHIND the envelope body (z: 0).
       * In closed state it lives inside the envelope area, fully covered.
       * On open it slides up so ~60 px peeks above the envelope.
       */}
      <motion.div
        animate={{ y: isOpen ? LETTER_OPEN_Y : 0 }}
        transition={{ duration: 0.42, ease: EASE, delay: isOpen ? 0.08 : 0 }}
        style={{
          position: "absolute",
          top: LETTER_TOP,
          left: 14,
          right: 14,
          height: LETTER_H,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          padding: "9px 11px",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--fg-muted)",
            letterSpacing: "0.5px",
            marginBottom: "7px",
          }}
        >
          {date}
        </div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--fg)",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {post.title}
        </div>
      </motion.div>

      {/*
       * Envelope body — ON TOP of the letter (z: 1).
       * Physically covers the letter when it is inside.
       */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          zIndex: 1,
          boxShadow: isOpen
            ? "3px 8px 28px var(--shadow)"
            : "2px 3px 10px var(--shadow)",
          transition: `box-shadow 0.4s ${EASE}`,
        }}
      >
        {/* SVG fold lines — four triangular panels of a real envelope */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <line x1="0"  y1={H} x2={W / 2} y2={H / 2} stroke="var(--border)" strokeWidth="0.9" opacity="0.6" />
          <line x1={W} y1={H} x2={W / 2} y2={H / 2} stroke="var(--border)" strokeWidth="0.9" opacity="0.6" />
          <line x1="0"  y1="0" x2={W / 2} y2={H / 2} stroke="var(--border)" strokeWidth="0.9" opacity="0.3" />
          <line x1={W} y1="0" x2={W / 2} y2={H / 2} stroke="var(--border)" strokeWidth="0.9" opacity="0.3" />
        </svg>

        {/* Flap — triangle covering the top half; slides up and fades on open */}
        <motion.div
          animate={{
            y: isOpen ? -(FLAP_H * 0.95) : 0,
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: FLAP_H + 2,
            background: "var(--bg-card-edge)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </motion.div>
  );
}
