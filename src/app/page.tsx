import { createClient } from "@/lib/supabase/server";
import DeskView from "@/components/DeskView";
import type { Post } from "@/lib/types";

export const revalidate = 0;

async function getPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("post_date", { ascending: false });
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
  return <DeskView posts={posts} isAdmin={!!user} />;
}
