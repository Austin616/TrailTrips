-- All personal data is protected by ownership checks, even with direct REST requests.
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (length(trim(name)) between 1 and 80),
  destination text not null check (length(trim(destination)) > 0),
  start_date date not null,
  end_date date not null,
  photo text not null,
  lodging jsonb not null check (jsonb_typeof(lodging) = 'object'),
  created_at timestamptz not null default now(),
  check (end_date >= start_date and end_date - start_date < 30)
);
create index trips_user_id_idx on public.trips(user_id);
create table public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  title text not null,
  unique (trip_id, date)
);
create table public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.trip_days(id) on delete cascade,
  -- IDs reference the intentionally retained mock trail catalog.
  trail_id text not null check (trail_id in ('multnomah-falls','wahclella-falls','latourell-falls','panther-creek-falls','dog-mountain','mirror-lake')),
  created_at timestamptz not null default clock_timestamp()
);
create index trip_stops_day_id_idx on public.trip_stops(day_id);
alter table public.trips enable row level security;
alter table public.trip_days enable row level security;
alter table public.trip_stops enable row level security;
create policy own_trips on public.trips for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_days on public.trip_days for all to authenticated
  using (exists (select 1 from public.trips where id = trip_id and user_id = (select auth.uid())))
  with check (exists (select 1 from public.trips where id = trip_id and user_id = (select auth.uid())));
create policy own_stops on public.trip_stops for all to authenticated
  using (exists (select 1 from public.trip_days d join public.trips t on t.id = d.trip_id where d.id = day_id and t.user_id = (select auth.uid())))
  with check (exists (select 1 from public.trip_days d join public.trips t on t.id = d.trip_id where d.id = day_id and t.user_id = (select auth.uid())));
revoke all on public.trips, public.trip_days, public.trip_stops from anon;
grant select, insert, update, delete on public.trips, public.trip_days, public.trip_stops to authenticated;

-- Atomic creation: a trip and its days either all save or none do. Caller RLS still applies.
create function public.create_trip(trip jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  trip_id uuid := (trip->>'id')::uuid;
  first_day date := (trip->>'startDate')::date;
  last_day date := (trip->>'endDate')::date;
  day jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in to get started'; end if;
  if jsonb_typeof(trip->'days') is distinct from 'array' then raise exception 'Trip days are required'; end if;
  if jsonb_array_length(trip->'days') <> last_day - first_day + 1 then raise exception 'Invalid trip days'; end if;
  insert into public.trips(id, user_id, name, destination, start_date, end_date, photo, lodging)
  values (trip_id, auth.uid(), trip->>'name', trip->>'destination', first_day, last_day, trip->>'photo', trip->'lodging');
  for day in select value from jsonb_array_elements(trip->'days') loop
    if (day->>'date')::date < first_day or (day->>'date')::date > last_day then raise exception 'Day outside trip dates'; end if;
    insert into public.trip_days(id, trip_id, date, title)
    values ((day->>'id')::uuid, trip_id, (day->>'date')::date, day->>'title');
  end loop;
  return trip_id;
end;
$$;
revoke all on function public.create_trip(jsonb) from public, anon;
grant execute on function public.create_trip(jsonb) to authenticated;
