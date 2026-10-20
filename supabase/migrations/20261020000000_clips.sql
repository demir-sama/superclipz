-- SuperClipz: clips table + storage bucket with RLS
create extension if not exists "pgcrypto";

create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default 'Untitled clip',
  caption text,
  start double precision not null default 0,
  "end" double precision not null,
  aspect text not null default '16:9' check (aspect in ('9:16','1:1','16:9')),
  watermark boolean not null default true,
  source_url text,
  storage_path text,
  transcript jsonb,
  created_at timestamptz not null default now()
);
create index if not exists clips_user_created_idx on public.clips (user_id, created_at desc);

alter table public.clips enable row level security;
create policy "clips: owner can select" on public.clips for select using (auth.uid() = user_id);
create policy "clips: owner can insert" on public.clips for insert with check (auth.uid() = user_id);
create policy "clips: owner can update" on public.clips for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "clips: owner can delete" on public.clips for delete using (auth.uid() = user_id);

-- Storage bucket. Public read so share links work; writes restricted to the owner's folder: <user_id>/<file>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('clips', 'clips', true, 524288000, array['video/mp4','video/webm','audio/mpeg','audio/mp4','audio/wav'])
on conflict (id) do nothing;

create policy "clips bucket: public read" on storage.objects for select using (bucket_id = 'clips');
create policy "clips bucket: owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "clips bucket: owner update" on storage.objects for update to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "clips bucket: owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);
