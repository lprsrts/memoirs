import { createClient } from "@/lib/supabase/server";
import LetterPile from "@/components/LetterPile";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import type { Post } from "@/lib/types";

export const revalidate = 0;

async function getPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data as Post[];
}

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default async function Home() {
  const [posts, user] = await Promise.all([getPosts(), getUser()]);

  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          minWidth: "260px",
          height: "100%",
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "48px 32px 36px",
          zIndex: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--fg-muted)",
              letterSpacing: "2px",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            memoirs
          </p>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
              fontFamily: "var(--font-body)",
              color: "var(--fg)",
              lineHeight: 1.15,
              marginBottom: "24px",
            }}
          >
            A pile of
            <br />
            letters.
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg-muted)",
              lineHeight: 1.65,
              marginBottom: "40px",
            }}
          >
            Thoughts, observations, and memories — hover to find what calls to
            you.
          </p>

          {posts.length > 0 && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--fg-muted)",
                letterSpacing: "0.5px",
              }}
            >
              {posts.length} {posts.length === 1 ? "entry" : "entries"}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {user && (
            <Link
              href="/write"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "1px",
                color: "var(--accent)",
                textDecoration: "none",
                border: "1px solid var(--accent)",
                padding: "5px 10px",
                display: "inline-block",
              }}
            >
              [ WRITE ]
            </Link>
          )}
          <ThemeToggle />
        </div>
      </aside>

      {/* Letter pile area */}
      <LetterPile posts={posts} />
    </main>
  );
}
