-- Migration 0002 — experience-only bookings + review system
-- Run in the Supabase SQL editor after 0001.

-- 1. Allow experience-only bookings (no overnight stay required).
alter table bookings
  alter column homestay_id drop not null;

-- 2. Distinguish what was booked so logic and UI can branch correctly.
do $$ begin
  create type booking_type as enum ('stay', 'experience', 'bundle');
exception when duplicate_object then null; end $$;

alter table bookings
  add column if not exists booking_type booking_type not null default 'stay';

-- 3. Relax the date constraint: experience bookings are same-day
--    (check_in = check_out), so change > to >=.
alter table bookings
  drop constraint if exists bookings_dates_valid;

alter table bookings
  add constraint bookings_dates_valid check (check_out >= check_in);

-- 4. Reviews — one per booking, tied to the homestay and/or experience reviewed.
create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid unique not null references bookings (id) on delete cascade,
  tourist_name  text not null,
  homestay_id   uuid references homestays   (id) on delete set null,
  experience_id uuid references experiences (id) on delete set null,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_reviews_homestay    on reviews (homestay_id);
create index if not exists idx_reviews_experience  on reviews (experience_id);
create index if not exists idx_reviews_booking     on reviews (booking_id);
