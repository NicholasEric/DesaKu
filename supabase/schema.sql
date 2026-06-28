-- =============================================================================
-- DesaKu — Ethical Rural Tourism Booking Platform
-- Supabase / PostgreSQL schema (MVP)
-- =============================================================================
-- Revenue split philosophy (enforced in application code, see calculateDistribution):
--   50% -> local host family   (homestays.host_profile_id)
--   30% -> local guide/artisan (experiences.guide_profile_id)
--   20% -> village communal fund / BUMDes (villages.bumdes_bank_account)
--
-- Run with:  supabase db reset   (or paste into the Supabase SQL editor)
-- Idempotent-friendly: drops are ordered to respect foreign keys.
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto on Supabase (already enabled by default,
-- but we declare the dependency explicitly so the file is self-contained).
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('tourist', 'admin', 'village_head');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type distribution_status as enum ('pending', 'disbursed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type whatsapp_status as enum ('sent', 'delivered', 'failed');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- profiles
-- One row per authenticated user. id mirrors auth.users.id (Supabase Auth).
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          user_role   not null default 'tourist',
  full_name     text,
  phone_number  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- villages
-- A certified rural village. Must pass the sanitation/comfort curation check.
-- -----------------------------------------------------------------------------
create table if not exists villages (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  region               text,
  bumdes_bank_account  text,                         -- communal fund payout target (20%)
  sanitation_rating    smallint check (sanitation_rating between 1 and 5),
  description          text,
  hero_image_url       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- homestays
-- Lodging hosted by a local family (the 50% recipient of a booking).
-- Hosts have no dashboard; they are reached via the WhatsApp "Village Concierge".
-- -----------------------------------------------------------------------------
create table if not exists homestays (
  id                    uuid primary key default gen_random_uuid(),
  village_id            uuid not null references villages (id)  on delete cascade,
  host_profile_id       uuid references profiles (id)           on delete set null,
  host_whatsapp_number  text not null,                -- concierge target for confirmations
  price_per_night       numeric(12,2) not null check (price_per_night >= 0),
  max_guests            smallint check (max_guests > 0),
  amenities             jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- experiences
-- A bookable local activity led by a guide/artisan (the 30% recipient).
-- Rural tourism is broader than lodging: gamelan/angklung performances, batik
-- workshops, rice-paddy walks, coffee processing, etc. `category` keeps these
-- diverse activity types first-class and filterable.
-- -----------------------------------------------------------------------------
create table if not exists experiences (
  id                     uuid primary key default gen_random_uuid(),
  village_id             uuid not null references villages (id) on delete cascade,
  guide_profile_id       uuid references profiles (id)          on delete set null,
  guide_whatsapp_number  text not null,               -- concierge target for confirmations
  title                  text not null,
  description            text,
  category               text,                         -- e.g. music, craft, culinary, agriculture, nature, ritual
  price_per_pax          numeric(12,2) not null check (price_per_pax >= 0),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- bookings
-- A tourist reserves a homestay and optionally one or more experiences.
-- experience_ids is a uuid[] as specified. NOTE: Postgres cannot enforce a
-- foreign key on array elements; integrity is checked in the booking action.
-- A booking_experiences junction table is the recommended production upgrade.
-- -----------------------------------------------------------------------------
-- tourist_id is nullable: the MVP supports guest checkout (no tourist auth
-- yet), so guest_name / guest_phone carry the traveller's details instead.
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  tourist_id      uuid references profiles (id) on delete restrict,
  guest_name      text,
  guest_phone     text,
  homestay_id     uuid not null references homestays (id) on delete restrict,
  experience_ids  uuid[] not null default '{}',
  check_in        date not null,
  check_out       date not null,
  total_amount    numeric(12,2) not null check (total_amount >= 0),
  status          booking_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in)
);

-- -----------------------------------------------------------------------------
-- distributions
-- The transparent 50/30/20 split, materialised per booking.
-- One row per booking. The three amounts must sum to the booking total — this
-- is asserted again in calculateDistribution() before insert.
-- -----------------------------------------------------------------------------
create table if not exists distributions (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null unique references bookings (id) on delete cascade,
  host_amount    numeric(12,2) not null check (host_amount   >= 0),  -- 50%
  guide_amount   numeric(12,2) not null check (guide_amount  >= 0),  -- 30%
  bumdes_amount  numeric(12,2) not null check (bumdes_amount >= 0),  -- 20%
  status         distribution_status not null default 'pending',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- whatsapp_logs
-- The mocked "Village Concierge". For the MVP we do not call the WhatsApp API;
-- we record the rendered payload here so the flow is auditable end-to-end.
-- -----------------------------------------------------------------------------
create table if not exists whatsapp_logs (
  id                   uuid primary key default gen_random_uuid(),
  booking_id           uuid references bookings (id) on delete cascade,
  target_phone_number  text not null,
  message_template     text not null,                -- template key, e.g. 'host_arrival'
  message_body         text not null,                -- fully rendered message
  status               whatsapp_status not null default 'sent',
  created_at           timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes for the common access paths
-- -----------------------------------------------------------------------------
create index if not exists idx_homestays_village      on homestays (village_id);
create index if not exists idx_experiences_village     on experiences (village_id);
create index if not exists idx_experiences_category    on experiences (category);
create index if not exists idx_bookings_tourist        on bookings (tourist_id);
create index if not exists idx_bookings_homestay       on bookings (homestay_id);
create index if not exists idx_bookings_status         on bookings (status);
create index if not exists idx_distributions_status    on distributions (status);
create index if not exists idx_whatsapp_logs_booking   on whatsapp_logs (booking_id);

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','villages','homestays','experiences','bookings','distributions']
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on %1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on %1$s
         for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- Left DISABLED for the MVP so the mocked booking + concierge flow can write
-- freely via the service role. Before any public launch, enable RLS on every
-- table and add policies (tourists read their own bookings, admins manage
-- villages/homestays, etc.). Tracked as a Step 4+ follow-up.
-- -----------------------------------------------------------------------------
-- alter table profiles      enable row level security;
-- alter table villages      enable row level security;
-- alter table homestays     enable row level security;
-- alter table experiences   enable row level security;
-- alter table bookings      enable row level security;
-- alter table distributions enable row level security;
-- alter table whatsapp_logs enable row level security;
