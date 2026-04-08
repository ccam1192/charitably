-- Optional city for neighbor list / filtering (run if you already applied 00001)
alter table public.neighbors add column if not exists city text;

create index if not exists neighbors_city_idx on public.neighbors (chapter_id, city)
  where city is not null;
