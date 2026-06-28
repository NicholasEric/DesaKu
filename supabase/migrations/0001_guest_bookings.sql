-- Migration 0001 — guest checkout
-- Tourists can book without an account in the MVP (no tourist auth yet).
-- Make tourist_id optional and capture the guest's name/phone on the booking
-- itself, which the WhatsApp concierge (Step 5) uses for the arrival message.
--
-- Run this once in the Supabase SQL editor on a database created from the
-- original schema.sql. Fresh installs already include these via schema.sql.

alter table bookings
  alter column tourist_id drop not null;

alter table bookings
  add column if not exists guest_name  text,
  add column if not exists guest_phone text;
