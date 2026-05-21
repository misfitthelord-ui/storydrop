-- Run this in your Supabase SQL editor

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  is_pro boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  stories_this_month int default 0,
  created_at timestamp with time zone default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Reset story count monthly (run as a cron job or Supabase edge function)
-- UPDATE public.profiles SET stories_this_month = 0;

-- Row level security
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
