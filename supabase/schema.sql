-- =============================================
-- LIMPAR TUDO (rodar isso primeiro)
-- =============================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop table if exists installments cascade;
drop table if exists transactions cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;

-- =============================================
-- EXTENSÃO
-- =============================================
create extension if not exists "uuid-ossp";

-- =============================================
-- PERFIL
-- =============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  salary numeric(10,2) default 0,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "p_sel" on profiles for select using (auth.uid() = id);
create policy "p_upd" on profiles for update using (auth.uid() = id);
create policy "p_ins" on profiles for insert with check (auth.uid() = id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================
-- CATEGORIAS
-- =============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default '💰',
  color text not null default '#6366f1',
  type text check (type in ('income', 'expense')) not null,
  is_default boolean default false,
  created_at timestamptz default now()
);
alter table categories enable row level security;
create policy "c_sel" on categories for select using (auth.uid() = user_id);
create policy "c_ins" on categories for insert with check (auth.uid() = user_id);
create policy "c_del" on categories for delete using (auth.uid() = user_id);

-- =============================================
-- TRANSAÇÕES
-- =============================================
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  amount numeric(10,2) not null,
  type text check (type in ('income', 'expense')) not null,
  payment_method text check (payment_method in ('pix', 'debito', 'credito', 'dinheiro', 'transferencia')) default 'pix',
  date date not null,
  note text,
  created_at timestamptz default now()
);
alter table transactions enable row level security;
create policy "t_sel" on transactions for select using (auth.uid() = user_id);
create policy "t_ins" on transactions for insert with check (auth.uid() = user_id);
create policy "t_del" on transactions for delete using (auth.uid() = user_id);

-- =============================================
-- PARCELAMENTOS
-- =============================================
create table installments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  total_amount numeric(10,2) not null,
  installment_amount numeric(10,2) not null,
  total_installments int not null,
  paid_installments int default 0,
  payment_method text check (payment_method in ('pix', 'debito', 'credito', 'dinheiro', 'transferencia')) default 'credito',
  start_date date not null,
  note text,
  created_at timestamptz default now()
);
alter table installments enable row level security;
create policy "i_sel" on installments for select using (auth.uid() = user_id);
create policy "i_ins" on installments for insert with check (auth.uid() = user_id);
create policy "i_upd" on installments for update using (auth.uid() = user_id);
create policy "i_del" on installments for delete using (auth.uid() = user_id);
