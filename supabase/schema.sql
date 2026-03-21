create table if not exists public.found_records (
  id uuid primary key,
  image_url text not null,
  thumbnail_url text,
  image_hash text not null,
  captured_at timestamptz not null,
  created_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  location_label text,
  location_hash text,
  category text not null,
  ai_category text,
  description text not null,
  ai_description text,
  handoff_type text not null check (
    handoff_type in (
      'police_box',
      'station_counter',
      'airport_counter',
      'hotel_front',
      'facility_desk',
      'event_staff',
      'school_office',
      'office_reception',
      'other_authorized_desk'
    )
  ),
  handoff_note text,
  status text not null check (
    status in ('draft', 'recorded', 'anchored')
  ),
  proof_chain text not null default 'symbol' check (proof_chain = 'symbol'),
  proof_tx_hash text,
  proof_record_hash text not null,
  proof_version text not null,
  search_keywords text[] default '{}'
);

create index if not exists found_records_category_idx on public.found_records (category);
create index if not exists found_records_captured_at_idx on public.found_records (captured_at desc);
create index if not exists found_records_location_label_idx on public.found_records (location_label);
create index if not exists found_records_handoff_type_idx on public.found_records (handoff_type);
create index if not exists found_records_keywords_idx
  on public.found_records using gin (search_keywords);
