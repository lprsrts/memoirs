-- Run this in your Supabase SQL editor

-- Posts table
create table if not exists posts (
  id          uuid        default gen_random_uuid() primary key,
  title       text        not null,
  content     text        not null,
  image_urls  text[]      not null default '{}',
  created_at  timestamptz default now() not null
);

-- Row Level Security
alter table posts enable row level security;

-- Anyone can read posts
create policy "Public read posts"
  on posts for select
  using (true);

-- Only authenticated users can insert/update/delete
create policy "Auth insert posts"
  on posts for insert
  with check (auth.role() = 'authenticated');

create policy "Auth update posts"
  on posts for update
  using (auth.role() = 'authenticated');

create policy "Auth delete posts"
  on posts for delete
  using (auth.role() = 'authenticated');

-- Storage bucket for images
-- Run via Supabase dashboard: Storage > New bucket > "memoir-images" > Public
-- Or run the SQL below:

insert into storage.buckets (id, name, public)
values ('memoir-images', 'memoir-images', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public read images"
  on storage.objects for select
  using (bucket_id = 'memoir-images');

create policy "Auth upload images"
  on storage.objects for insert
  with check (bucket_id = 'memoir-images' and auth.role() = 'authenticated');

create policy "Auth delete images"
  on storage.objects for delete
  using (bucket_id = 'memoir-images' and auth.role() = 'authenticated');
