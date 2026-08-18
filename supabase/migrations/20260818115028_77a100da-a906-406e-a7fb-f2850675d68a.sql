-- ROLES ---------------------------------------------------------------
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','moderator'))
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "staff read roles" on public.user_roles for select to authenticated using (public.is_staff(auth.uid()));

-- shared updated_at ------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- PROFILES ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  email text,
  city text not null default 'Bengaluru',
  occupation text,
  company_or_college text,
  gender text,
  age int,
  about text,
  photo_url text,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  work_verified boolean not null default false,
  id_verified boolean not null default false,
  trust_score int not null default 0,
  profile_score int not null default 0,
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles for select using (banned = false);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles staff update" on public.profiles for update to authenticated using (public.is_staff(auth.uid()));
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- PERSON MODES -----------------------------------------------------------
create type public.person_mode as enum ('room_seeker','replacement_host','property_owner','managed_owner');

create table public.person_modes (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.profiles(id) on delete cascade,
  mode public.person_mode not null,
  active boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (person_id, mode)
);
grant select, insert, update, delete on public.person_modes to authenticated;
grant all on public.person_modes to service_role;
alter table public.person_modes enable row level security;
create policy "modes own all" on public.person_modes for all to authenticated using (person_id = auth.uid()) with check (person_id = auth.uid());
create policy "modes staff read" on public.person_modes for select to authenticated using (public.is_staff(auth.uid()));
create trigger person_modes_touch before update on public.person_modes for each row execute function public.touch_updated_at();

-- SUPPLY GRAPH -----------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  authority text not null default 'tenant',
  title text not null default '',
  address text not null default '',
  city text not null default 'Bengaluru',
  area text not null default '',
  lat double precision,
  lng double precision,
  bhk int,
  furnishing text,
  gated boolean not null default false,
  managed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Bedroom',
  room_type text not null default 'Private room',
  attached_bath boolean not null default false,
  balcony boolean not null default false,
  ac boolean not null default false,
  furnished text,
  size_sqft int,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.vacancies (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  available_from date,
  rent int,
  deposit int,
  maintenance int default 0,
  utilities_estimate int default 0,
  one_time_costs int default 0,
  min_duration_months int default 11,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.properties, public.rooms, public.vacancies to authenticated;
grant select on public.properties, public.rooms, public.vacancies to anon;
grant all on public.properties, public.rooms, public.vacancies to service_role;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.vacancies enable row level security;
create trigger properties_touch before update on public.properties for each row execute function public.touch_updated_at();
create trigger rooms_touch before update on public.rooms for each row execute function public.touch_updated_at();
create trigger vacancies_touch before update on public.vacancies for each row execute function public.touch_updated_at();

-- LISTINGS ---------------------------------------------------------------
create type public.listing_status as enum ('draft','pending','limited','live','rejected','filled');
create type public.listing_kind as enum ('replacement_room','owner_room','whole_flat','managed_unit');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  vacancy_id uuid references public.vacancies(id) on delete cascade,
  kind public.listing_kind not null default 'replacement_room',
  title text not null default '',
  description text not null default '',
  city text not null default 'Bengaluru',
  area text not null default '',
  rent int,
  deposit int,
  available_from date,
  photos jsonb not null default '[]'::jsonb,
  household jsonb not null default '{}'::jsonb,
  money jsonb not null default '{}'::jsonb,
  status public.listing_status not null default 'draft',
  quality_score int not null default 0,
  auto_decision text,
  missing jsonb not null default '[]'::jsonb,
  reject_reasons jsonb not null default '[]'::jsonb,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  content_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listings_status_idx on public.listings(status);
create index listings_city_area_idx on public.listings(city, area);
grant select, insert, update, delete on public.listings to authenticated;
grant select on public.listings to anon;
grant all on public.listings to service_role;
alter table public.listings enable row level security;
create trigger listings_touch before update on public.listings for each row execute function public.touch_updated_at();

create policy "listings public read" on public.listings for select using (status in ('live','limited'));
create policy "listings owner read" on public.listings for select to authenticated using (owner_id = auth.uid());
create policy "listings staff read" on public.listings for select to authenticated using (public.is_staff(auth.uid()));
create policy "listings owner insert" on public.listings for insert to authenticated with check (owner_id = auth.uid() and status = 'draft');
create policy "listings owner update" on public.listings for update to authenticated
  using (owner_id = auth.uid() and status in ('draft','rejected','limited','live','filled'))
  with check (owner_id = auth.uid() and status in ('draft','filled'));
create policy "listings staff update" on public.listings for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "listings owner delete" on public.listings for delete to authenticated using (owner_id = auth.uid());

-- supply graph policies (public sees only rows behind a visible listing)
create policy "properties public read" on public.properties for select using (
  exists (select 1 from public.listings l where l.property_id = properties.id and l.status in ('live','limited')));
create policy "properties own all" on public.properties for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "properties staff read" on public.properties for select to authenticated using (public.is_staff(auth.uid()));

create policy "rooms public read" on public.rooms for select using (
  exists (select 1 from public.listings l where l.room_id = rooms.id and l.status in ('live','limited')));
create policy "rooms own all" on public.rooms for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "rooms staff read" on public.rooms for select to authenticated using (public.is_staff(auth.uid()));

create policy "vacancies public read" on public.vacancies for select using (
  exists (select 1 from public.listings l where l.vacancy_id = vacancies.id and l.status in ('live','limited')));
create policy "vacancies own all" on public.vacancies for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "vacancies staff read" on public.vacancies for select to authenticated using (public.is_staff(auth.uid()));

-- MODERATION / SPAM ------------------------------------------------------
create table public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  subject_person_id uuid references public.profiles(id) on delete cascade,
  actor text not null default 'system',
  actor_id uuid references auth.users(id),
  decision text not null,
  score int,
  reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.moderation_events to authenticated;
grant all on public.moderation_events to service_role;
alter table public.moderation_events enable row level security;
create policy "moderation staff read" on public.moderation_events for select to authenticated using (public.is_staff(auth.uid()));
create policy "moderation owner read" on public.moderation_events for select to authenticated using (
  exists (select 1 from public.listings l where l.id = moderation_events.listing_id and l.owner_id = auth.uid()));

create table public.spam_signals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  person_id uuid references public.profiles(id) on delete cascade,
  signal text not null,
  severity int not null default 1,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.spam_signals to authenticated;
grant all on public.spam_signals to service_role;
alter table public.spam_signals enable row level security;
create policy "spam staff read" on public.spam_signals for select to authenticated using (public.is_staff(auth.uid()));

create table public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.profiles(id) on delete cascade,
  bucket text not null,
  day date not null default (now() at time zone 'utc')::date,
  count int not null default 0,
  unique (person_id, bucket, day)
);
grant select on public.rate_limits to authenticated;
grant all on public.rate_limits to service_role;
alter table public.rate_limits enable row level security;
create policy "rate own read" on public.rate_limits for select to authenticated using (person_id = auth.uid());
create policy "rate staff read" on public.rate_limits for select to authenticated using (public.is_staff(auth.uid()));