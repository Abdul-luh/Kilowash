-- ============================================================================
-- Kilowash Waitlist & Referral System — Supabase SQL Setup
-- ============================================================================
-- HOW TO RUN:
-- 1. Open your Supabase project → SQL Editor → New query.
-- 2. Paste this entire file and click "Run".
-- 3. Copy your Project URL and anon / publishable key from Project Settings → API
--    into `.env.local`:
--      VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
--      VITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key
-- ============================================================================

-- 1. Core Waitlist Table
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  school text not null,
  referral_code text not null unique,
  referred_by text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_waitlist_referred_by on public.waitlist (referred_by);

-- 2. Lock down direct public table access (prevents anyone in DevTools from scraping emails)
alter table public.waitlist enable row level security;

-- 3. Admin View (for viewing referral counts & unlocked free washes in Supabase Table Editor)
create or replace view public.waitlist_referral_summary as
select
  w.id,
  w.created_at,
  w.email,
  w.school,
  w.referral_code,
  w.referred_by,
  count(r.id)::int as referrals_count,
  (count(r.id) >= 3) as free_wash_unlocked
from public.waitlist w
left join public.waitlist r on r.referred_by = w.referral_code
group by w.id;

revoke all on public.waitlist_referral_summary from anon, authenticated;

-- 4. Helper: exclude internal test emails from inflating real counts
create or replace function public.is_kilowash_test_email(p_email text)
returns boolean
language sql
immutable
as $$
  select lower(trim(coalesce(p_email, ''))) like 'lagbaj%'
      or lower(trim(coalesce(p_email, ''))) like '%odulate%';
$$;

-- 5. Public RPC: Read total count + optional personal referral count
create or replace function public.get_waitlist_status(p_referral_code text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_code text := nullif(lower(trim(coalesce(p_referral_code, ''))), '');
  v_my_referrals int := 0;
begin
  select count(*)::int
    into v_total
    from public.waitlist
   where not public.is_kilowash_test_email(email);

  if v_code is not null then
    select count(*)::int
      into v_my_referrals
      from public.waitlist
     where referred_by = v_code
       and not public.is_kilowash_test_email(email);
  end if;

  return jsonb_build_object(
    'ok', true,
    'count', v_total,
    'referral_code', coalesce(v_code, ''),
    'my_referrals', v_my_referrals,
    'referral_goal', 3,
    'reward_unlocked', (v_my_referrals >= 3)
  );
end;
$$;

-- 6. Public RPC: Join waitlist (deduplicates emails, validates referrals, returns live stats)
create or replace function public.join_waitlist(
  p_email text,
  p_school text,
  p_referral_code text,
  p_referred_by text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_school text := trim(coalesce(p_school, ''));
  v_code text := lower(trim(coalesce(p_referral_code, '')));
  v_ref_by text := nullif(lower(trim(coalesce(p_referred_by, ''))), '');
  v_existing_code text;
  v_total int;
  v_my_referrals int := 0;
  v_already_registered boolean := false;
begin
  if v_email = '' or position('@' in v_email) = 0 or v_school = '' then
    return jsonb_build_object('ok', false, 'error', 'Invalid email or school');
  end if;

  -- Test accounts can preview post-signup UI without inserting rows or altering counts
  if public.is_kilowash_test_email(v_email) then
    select count(*)::int
      into v_total
      from public.waitlist
     where not public.is_kilowash_test_email(email);

    return jsonb_build_object(
      'ok', true,
      'count', v_total,
      'referral_code', coalesce(nullif(v_code, ''), 'testpreview'),
      'my_referrals', 0,
      'referral_goal', 3,
      'reward_unlocked', false,
      'excluded_test_email', true
    );
  end if;

  -- Check if student already joined previously
  select referral_code
    into v_existing_code
    from public.waitlist
   where email = v_email;

  if v_existing_code is not null then
    v_already_registered := true;
    v_code := v_existing_code;
  else
    if v_code = '' then
      v_code := substr(regexp_replace(split_part(v_email, '@', 1), '[^a-z0-9]', '', 'g'), 1, 8)
                || floor(random() * 900 + 100)::int::text;
    end if;

    -- Prevent rare referral_code collision across two different emails
    if exists (select 1 from public.waitlist where referral_code = v_code) then
      v_code := v_code || floor(random() * 90 + 10)::int::text;
    end if;

    -- Block self-referral & only credit an existing valid referral_code
    if v_ref_by is not null then
      if v_ref_by = v_code or not exists (
        select 1 from public.waitlist where referral_code = v_ref_by
      ) then
        v_ref_by := null;
      end if;
    end if;

    insert into public.waitlist (email, school, referral_code, referred_by)
    values (v_email, v_school, v_code, v_ref_by)
    on conflict (email) do nothing;
  end if;

  select count(*)::int
    into v_total
    from public.waitlist
   where not public.is_kilowash_test_email(email);

  select count(*)::int
    into v_my_referrals
    from public.waitlist
   where referred_by = v_code
     and not public.is_kilowash_test_email(email);

  return jsonb_build_object(
    'ok', true,
    'count', v_total,
    'referral_code', v_code,
    'my_referrals', v_my_referrals,
    'referral_goal', 3,
    'reward_unlocked', (v_my_referrals >= 3),
    'already_registered', v_already_registered
  );
end;
$$;

grant execute on function public.get_waitlist_status(text) to anon, authenticated;
grant execute on function public.join_waitlist(text, text, text, text) to anon, authenticated;

-- 7. Seed the 45 verified LASU signups (safe to re-run; skips existing emails)
insert into public.waitlist (created_at, email, school, referral_code, referred_by)
values
  ('2026-11-12T15:04:23Z', 'abdulazeezjide13@gmail.com', 'Lagos State University (LASU)', 'abdulaze946', null),
  ('2026-11-13T16:50:59Z', 'abdurrasheedkhabbab@gmail.com', 'Lagos State University (LASU)', 'abdurras518', null),
  ('2026-11-18T07:59:00Z', 'ade206182@gmail.com', 'Lagos State University (LASU)', 'ade20618426', null),
  ('2026-11-12T10:01:52Z', 'adeaayat2706@gmail.com', 'Lagos State University (LASU)', 'adeaayat674', null),
  ('2026-11-12T11:13:45Z', 'adeolah0328@gmail.com', 'Lagos State University (LASU)', 'adeolah0744', null),
  ('2026-11-12T16:31:27Z', 'adexlr8@gmail.com', 'Lagos State University (LASU)', 'adexlr8697', null),
  ('2026-11-13T07:59:27Z', 'afolabioluwadabira83@gmail.com', 'Lagos State University (LASU)', 'afolabio519', null),
  ('2026-11-14T20:05:49Z', 'ayetobaoladimeji@gmail.com', 'Lagos State University (LASU)', 'ayetobao874', null),
  ('2026-11-12T18:04:14Z', 'balogunsewey4@gmail.com', 'Lagos State University (LASU)', 'baloguns994', null),
  ('2026-11-13T07:51:26Z', 'basitolokunola@gmail.com', 'Lagos State University (LASU)', 'basitolo432', null),
  ('2026-11-17T11:42:41Z', 'bellofuhad200@gmail.com', 'Lagos State University (LASU)', 'bellofuh683', null),
  ('2026-11-14T16:04:49Z', 'benedictbanjo00@gmail.com', 'Lagos State University (LASU)', 'benedict549', null),
  ('2026-11-14T13:10:42Z', 'daviesprecious202@gmail.com', 'Lagos State University (LASU)', 'daviespr939', null),
  ('2026-11-14T11:03:12Z', 'erinfolamizainab67@gmail.com', 'Lagos State University (LASU)', 'erinfola571', null),
  ('2026-11-13T08:58:58Z', 'faosideenolowolagba@gmail.com', 'Lagos State University (LASU)', 'faosidee776', null),
  ('2026-11-13T12:04:00Z', 'giftayomikun76@gmail.com', 'Lagos State University (LASU)', 'giftayom993', null),
  ('2026-11-14T11:06:19Z', 'ifeoluwaojuroye2005@gmail.com', 'Lagos State University (LASU)', 'ifeoluwa461', null),
  ('2026-11-15T19:48:25Z', 'israelcabala06@gmail.com', 'Lagos State University (LASU)', 'israelca289', null),
  ('2026-11-12T14:20:18Z', 'kennyclassical4real@gmail.com', 'Lagos State University (LASU)', 'kennycla165', null),
  ('2026-11-16T14:30:54Z', 'koikiafusattaiwo@gmail.com', 'Lagos State University (LASU)', 'koikiafu888', null),
  ('2026-11-12T11:24:06Z', 'kolapotaofeek4@gmail.com', 'Lagos State University (LASU)', 'kolapota534', null),
  ('2026-11-12T23:18:22Z', 'makinderidwan0@gmail.com', 'Lagos State University (LASU)', 'makinder193', null),
  ('2026-11-13T21:39:47Z', 'mathewsedicity@gmail.com', 'Lagos State University (LASU)', 'mathewse489', null),
  ('2026-11-12T15:55:00Z', 'mayowayusuf3004@gmail.com', 'Lagos State University (LASU)', 'mayowayu346', null),
  ('2026-11-12T13:12:00Z', 'mimirunsewe96@gmail.com', 'Lagos State University (LASU)', 'mimiruns357', null),
  ('2026-11-13T11:37:31Z', 'mojereolamichael1@gmail.com', 'Lagos State University (LASU)', 'mojereol591', null),
  ('2026-11-14T19:08:00Z', 'mujeebsanni679@gmail.com', 'Lagos State University (LASU)', 'mujeebsa106', null),
  ('2026-11-12T23:32:13Z', 'mutmainnahgiwa@gmail.com', 'Lagos State University (LASU)', 'mutmainn389', null),
  ('2026-11-14T19:16:00Z', 'nurudeenolumegbon1@gmail.com', 'Lagos State University (LASU)', 'nurudeen868', null),
  ('2026-11-14T17:24:01Z', 'odogiyonm@gmail.com', 'Lagos State University (LASU)', 'odogiyon922', null),
  ('2026-11-11T20:49:00Z', 'ojugbelelateef2006@gmail.com', 'Lagos State University (LASU)', 'ojugbele801', null),
  ('2026-11-11T20:37:00Z', 'okehabeeboluwatobiloba@gmail.com', 'Lagos State University (LASU)', 'okehabee665', null),
  ('2026-11-15T06:15:39Z', 'oladiposamuel1708@gmail.com', 'Lagos State University (LASU)', 'oladipos640', null),
  ('2026-11-13T10:27:29Z', 'olugasarah84@gmail.com', 'Lagos State University (LASU)', 'olugasar782', null),
  ('2026-11-14T15:19:00Z', 'omoleeniola2@gmail.com', 'Lagos State University (LASU)', 'omoleeni833', null),
  ('2026-11-12T11:44:17Z', 'owolabititobi452@gmail.com', 'Lagos State University (LASU)', 'owolabit476', null),
  ('2026-11-12T12:53:30Z', 'preciousfuwa14@gmail.com', 'Lagos State University (LASU)', 'precious181', null),
  ('2026-11-12T14:38:38Z', 'savagehush007@gmail.com', 'Lagos State University (LASU)', 'savagehu923', null),
  ('2026-11-12T15:20:19Z', 'slamsbaba005@gmail.com', 'Lagos State University (LASU)', 'slamsbab154', null),
  ('2026-11-13T09:23:56Z', 'taiwoireoluwakunmi@gmail.com', 'Lagos State University (LASU)', 'taiwoire919', null),
  ('2026-11-12T14:08:32Z', 'trustypeter16@gmail.com', 'Lagos State University (LASU)', 'trustype477', null),
  ('2026-11-13T09:01:15Z', 'uthmanfathiu8@gmail.com', 'Lagos State University (LASU)', 'uthmanfa481', null),
  ('2026-11-14T12:42:56Z', 'wabimbola9@gmail.com', 'Lagos State University (LASU)', 'wabimbol700', null),
  ('2026-11-13T07:56:44Z', 'wareezahoyeshola05@gmail.com', 'Lagos State University (LASU)', 'wareezah655', null),
  ('2026-11-15T08:15:41Z', 'yusufhalimah78@gmail.com', 'Lagos State University (LASU)', 'yusufhal448', null)
on conflict (email) do nothing;
