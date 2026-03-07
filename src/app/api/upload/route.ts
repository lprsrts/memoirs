import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filename = request.headers.get("x-filename") ?? `image-${Date.now()}`;
  const contentType = request.headers.get("content-type") ?? "application/octet-stream";
  const ext = filename.split(".").pop() ?? "bin";
  const storagePath = `${user.id}/${Date.now()}.${ext}`;

  const buffer = await request.arrayBuffer();

  const { error } = await supabase.storage
    .from("memoir-images")
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { publicUrl },
  } = supabase.storage.from("memoir-images").getPublicUrl(storagePath);

  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
