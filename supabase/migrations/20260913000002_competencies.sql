-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

CREATE TABLE public.competencies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    default_target_score numeric(5,2) DEFAULT 80 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT competencies_default_target_score_check CHECK (((default_target_score >= (0)::numeric) AND (default_target_score <= (100)::numeric)))
);

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

CREATE TABLE public.job_role_competencies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_role_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    required_score numeric NOT NULL,
    importance text DEFAULT 'core'::text NOT NULL,
    rationale text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_role_competencies_importance_valid CHECK ((importance = ANY (ARRAY['core'::text, 'important'::text, 'supporting'::text]))),
    CONSTRAINT job_role_competencies_required_score_range CHECK (((required_score >= (0)::numeric) AND (required_score <= (100)::numeric)))
);

-- 20260913000002_competencies.sql
-- Competencies, trainer competencies, user competencies, job role competencies, effective target helper

CREATE TABLE public.trainer_competencies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainer_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    expertise_score numeric(5,2) DEFAULT 0 NOT NULL,
    years_experience numeric(5,2) DEFAULT 0 NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT trainer_competencies_expertise_score_check CHECK (((expertise_score >= (0)::numeric) AND (expertise_score <= (100)::numeric))),
    CONSTRAINT trainer_competencies_years_experience_check CHECK ((years_experience >= (0)::numeric))
);

CREATE TABLE public.user_competencies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    current_score numeric(5,2) DEFAULT 0 NOT NULL,
    target_score numeric(5,2) DEFAULT 80 NOT NULL,
    last_updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_competencies_current_score_check CHECK (((current_score >= (0)::numeric) AND (current_score <= (100)::numeric))),
    CONSTRAINT user_competencies_target_score_check CHECK (((target_score >= (0)::numeric) AND (target_score <= (100)::numeric)))
);

ALTER TABLE ONLY public.job_role_competencies
    ADD CONSTRAINT job_role_competencies_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_role_competencies
    ADD CONSTRAINT job_role_competencies_unique UNIQUE (job_role_id, competency_id);

ALTER TABLE ONLY public.competencies
    ADD CONSTRAINT competencies_name_key UNIQUE (name);

ALTER TABLE ONLY public.competencies
    ADD CONSTRAINT competencies_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.trainer_competencies
    ADD CONSTRAINT trainer_competencies_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.trainer_competencies
    ADD CONSTRAINT trainer_competencies_trainer_id_competency_id_key UNIQUE (trainer_id, competency_id);

ALTER TABLE ONLY public.user_competencies
    ADD CONSTRAINT user_competencies_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_competencies
    ADD CONSTRAINT user_competencies_user_id_competency_id_key UNIQUE (user_id, competency_id);

ALTER TABLE ONLY public.job_role_competencies
    ADD CONSTRAINT job_role_competencies_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_role_competencies
    ADD CONSTRAINT job_role_competencies_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.trainer_competencies
    ADD CONSTRAINT trainer_competencies_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_competencies
    ADD CONSTRAINT user_competencies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.trainer_competencies
    ADD CONSTRAINT trainer_competencies_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_competencies
    ADD CONSTRAINT user_competencies_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE CASCADE;

CREATE VIEW public.trainer_directory_competencies AS
 SELECT tc.trainer_id,
    tc.competency_id,
    tc.expertise_score,
    tc.years_experience,
    c.name AS competency_name,
    c.category AS competency_category
   FROM ((public.trainer_competencies tc
     JOIN public.competencies c ON ((c.id = tc.competency_id)))
     JOIN public.profiles p ON ((p.id = tc.trainer_id)))
  WHERE ((tc.verified = true) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true));

CREATE FUNCTION private.admin_capacity_grid() RETURNS TABLE(trainee_id uuid, trainee_name text, employee_code text, designation text, department text, organizational_unit_id uuid, organizational_unit_name text, job_role_id uuid, job_role_name text, competency_id uuid, competency_name text, competency_category text, importance text, current_score numeric, target_score numeric, gap_score numeric, priority text, gap_status text, last_updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    p.id,
    coalesce(nullif(trim(p.full_name), ''), p.email),
    tp.employee_code,
    p.designation,
    coalesce(nullif(trim(p.department), ''), 'Unassigned'),

    ou.id,
    ou.name,

    jr.id,
    jr.name,

    c.id,
    c.name,
    c.category,

    jrc.importance,

    coalesce(uc.current_score, 0),

    private.get_effective_competency_target(
      p.id,
      c.id
    ),

    greatest(
      private.get_effective_competency_target(
        p.id,
        c.id
      ) - coalesce(uc.current_score, 0),
      0
    ),

    case
      when greatest(
        private.get_effective_competency_target(p.id, c.id)
        - coalesce(uc.current_score, 0),
        0
      ) >= 35 then 'critical'

      when greatest(
        private.get_effective_competency_target(p.id, c.id)
        - coalesce(uc.current_score, 0),
        0
      ) >= 20 then 'high'

      when greatest(
        private.get_effective_competency_target(p.id, c.id)
        - coalesce(uc.current_score, 0),
        0
      ) >= 10 then 'medium'

      else 'low'
    end,

    case
      when greatest(
        private.get_effective_competency_target(p.id, c.id)
        - coalesce(uc.current_score, 0),
        0
      ) = 0 then 'resolved'
      else 'open'
    end,

    uc.last_updated_at

  from public.profiles p

  left join public.trainee_profiles tp
    on tp.user_id = p.id

  join public.job_roles jr
    on jr.id = p.job_role_id
   and jr.is_active = true

  left join public.organizational_units ou
    on ou.id = p.organizational_unit_id

  join public.job_role_competencies jrc
    on jrc.job_role_id = jr.id

  join public.competencies c
    on c.id = jrc.competency_id
   and c.is_active = true

  left join public.user_competencies uc
    on uc.user_id = p.id
   and uc.competency_id = c.id

  where p.role = 'trainee'
    and p.is_active = true
    and p.is_approved = true

  order by
    organizational_unit_name,
    job_role_name,
    trainee_name,
    competency_name;
end;
$$;

CREATE FUNCTION private.admin_create_competency(p_name text, p_description text, p_category text, p_default_target_score numeric) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized admin';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Competency name is required';
  end if;

  if p_default_target_score is null
     or p_default_target_score < 0
     or p_default_target_score > 100
  then
    raise exception 'Default target score must be between 0 and 100';
  end if;

  if exists (
    select 1
    from public.competencies c
    where lower(trim(c.name)) = lower(trim(p_name))
  ) then
    raise exception 'Competency already exists';
  end if;

  insert into public.competencies (
    name,
    description,
    category,
    default_target_score,
    is_active
  )
  values (
    trim(p_name),
    nullif(trim(p_description), ''),
    nullif(trim(p_category), ''),
    p_default_target_score,
    true
  )
  returning id
  into v_id;

  return v_id;
end;
$$;

CREATE FUNCTION private.admin_list_trainer_competencies() RETURNS TABLE(trainer_id uuid, trainer_name text, trainer_email text, competency_id uuid, competency_name text, expertise_score numeric, years_experience numeric, verified boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_approved = true
      and p.is_active = true
  ) then
    raise exception 'Unauthorized admin';
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.email,
    c.id,
    c.name,
    coalesce(tc.expertise_score, 0),
    coalesce(tc.years_experience, 0),
    coalesce(tc.verified, false)
  from public.profiles p
  cross join public.competencies c
  left join public.trainer_competencies tc
    on tc.trainer_id = p.id
   and tc.competency_id = c.id
  where p.role = 'trainer'
    and p.is_active = true
    and p.is_approved = true
    and c.is_active = true
  order by
    p.full_name asc,
    c.name asc;
end;
$$;

CREATE FUNCTION private.admin_remove_job_role_competency(p_job_role_id uuid, p_competency_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized';
  end if;

  delete from public.job_role_competencies
  where job_role_id = p_job_role_id
    and competency_id = p_competency_id;
end;
$$;

CREATE FUNCTION private.admin_set_competency_active(p_competency_id uuid, p_is_active boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized admin';
  end if;

  update public.competencies
  set
    is_active = p_is_active,
    updated_at = now()
  where id = p_competency_id;

  if not found then
    raise exception 'Competency not found';
  end if;
end;
$$;

CREATE FUNCTION private.admin_set_job_role_competency(p_job_role_id uuid, p_competency_id uuid, p_required_score numeric, p_importance text, p_rationale text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized';
  end if;

  if p_required_score < 0 or p_required_score > 100 then
    raise exception 'Required score must be between 0 and 100';
  end if;

  if p_importance not in ('core', 'important', 'supporting') then
    raise exception 'Invalid importance';
  end if;

  insert into public.job_role_competencies (
    job_role_id,
    competency_id,
    required_score,
    importance,
    rationale
  )
  values (
    p_job_role_id,
    p_competency_id,
    p_required_score,
    p_importance,
    nullif(trim(p_rationale), '')
  )
  on conflict (job_role_id, competency_id)
  do update set
    required_score = excluded.required_score,
    importance = excluded.importance,
    rationale = excluded.rationale,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

CREATE FUNCTION private.admin_update_competency(p_competency_id uuid, p_name text, p_description text, p_category text, p_default_target_score numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized admin';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Competency name is required';
  end if;

  if p_default_target_score is null
     or p_default_target_score < 0
     or p_default_target_score > 100
  then
    raise exception 'Default target score must be between 0 and 100';
  end if;

  if exists (
    select 1
    from public.competencies c
    where lower(trim(c.name)) = lower(trim(p_name))
      and c.id <> p_competency_id
  ) then
    raise exception 'Another competency already uses this name';
  end if;

  update public.competencies
  set
    name = trim(p_name),
    description = nullif(trim(p_description), ''),
    category = nullif(trim(p_category), ''),
    default_target_score = p_default_target_score,
    updated_at = now()
  where id = p_competency_id;

  if not found then
    raise exception 'Competency not found';
  end if;
end;
$$;

CREATE FUNCTION private.admin_upsert_trainer_competency(p_trainer_id uuid, p_competency_id uuid, p_expertise_score numeric, p_years_experience numeric, p_verified boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_approved = true
      and p.is_active = true
  ) then
    raise exception 'Unauthorized admin';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_trainer_id
      and p.role = 'trainer'
      and p.is_approved = true
      and p.is_active = true
  ) then
    raise exception 'Target user is not an active approved trainer';
  end if;

  if not exists (
    select 1
    from public.competencies c
    where c.id = p_competency_id
      and c.is_active = true
  ) then
    raise exception 'Competency not found or inactive';
  end if;

  if p_expertise_score is null
     or p_expertise_score < 0
     or p_expertise_score > 100 then
    raise exception 'Expertise score must be between 0 and 100';
  end if;

  if p_years_experience is null
     or p_years_experience < 0 then
    raise exception 'Years of experience cannot be negative';
  end if;

  insert into public.trainer_competencies (
    trainer_id,
    competency_id,
    expertise_score,
    years_experience,
    verified,
    updated_at
  )
  values (
    p_trainer_id,
    p_competency_id,
    p_expertise_score,
    p_years_experience,
    p_verified,
    now()
  )
  on conflict (
    trainer_id,
    competency_id
  )
  do update
  set
    expertise_score = excluded.expertise_score,
    years_experience = excluded.years_experience,
    verified = excluded.verified,
    updated_at = now();
end;
$$;

CREATE FUNCTION private.get_effective_competency_target(p_user_id uuid, p_competency_id uuid) RETURNS numeric
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select coalesce(
    (
      select jrc.required_score
      from public.profiles p
      join public.job_role_competencies jrc
        on jrc.job_role_id = p.job_role_id
      where p.id = p_user_id
        and jrc.competency_id = p_competency_id
      limit 1
    ),

    (
      select uc.target_score
      from public.user_competencies uc
      where uc.user_id = p_user_id
        and uc.competency_id = p_competency_id
      limit 1
    ),

    (
      select c.default_target_score
      from public.competencies c
      where c.id = p_competency_id
      limit 1
    ),

    80
  );
$$;

CREATE FUNCTION public.admin_remove_job_role_competency(p_job_role_id uuid, p_competency_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_remove_job_role_competency(
    p_job_role_id,
    p_competency_id
  );
$$;

CREATE FUNCTION public.admin_set_job_role_competency(p_job_role_id uuid, p_competency_id uuid, p_required_score numeric, p_importance text, p_rationale text) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_set_job_role_competency(
    p_job_role_id,
    p_competency_id,
    p_required_score,
    p_importance,
    p_rationale
  );
$$;

CREATE FUNCTION public.admin_create_competency(p_name text, p_description text, p_category text, p_default_target_score numeric) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_create_competency(
    p_name,
    p_description,
    p_category,
    p_default_target_score
  );
$$;

CREATE FUNCTION public.admin_list_trainer_competencies() RETURNS TABLE(trainer_id uuid, trainer_name text, trainer_email text, competency_id uuid, competency_name text, expertise_score numeric, years_experience numeric, verified boolean)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_list_trainer_competencies();
$$;

CREATE FUNCTION public.admin_set_competency_active(p_competency_id uuid, p_is_active boolean) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_set_competency_active(
    p_competency_id,
    p_is_active
  );
$$;

CREATE FUNCTION public.admin_update_competency(p_competency_id uuid, p_name text, p_description text, p_category text, p_default_target_score numeric) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_update_competency(
    p_competency_id,
    p_name,
    p_description,
    p_category,
    p_default_target_score
  );
$$;

CREATE FUNCTION public.admin_upsert_trainer_competency(p_trainer_id uuid, p_competency_id uuid, p_expertise_score numeric, p_years_experience numeric, p_verified boolean) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_upsert_trainer_competency(
    p_trainer_id,
    p_competency_id,
    p_expertise_score,
    p_years_experience,
    p_verified
  );
$$;

-- Migration 002: Competencies, Skills, User Competencies, Trainer Expertise & Heatmap/Capacity Grid

CREATE FUNCTION public.admin_capacity_grid() RETURNS TABLE(trainee_id uuid, trainee_name text, employee_code text, designation text, department text, organizational_unit_id uuid, organizational_unit_name text, job_role_id uuid, job_role_name text, competency_id uuid, competency_name text, competency_category text, importance text, current_score numeric, target_score numeric, gap_score numeric, priority text, gap_status text, last_updated_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_capacity_grid();
$$;

ALTER TABLE public.job_role_competencies ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trainer_competencies ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view role competency requirements" ON public.job_role_competencies FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.job_roles jr
  WHERE ((jr.id = job_role_competencies.job_role_id) AND (jr.is_active = true)))));

CREATE POLICY "Authenticated users can view active competencies" ON public.competencies FOR SELECT TO authenticated USING ((is_active = true));

CREATE POLICY "Authenticated users can view verified trainer competencies" ON public.trainer_competencies FOR SELECT TO authenticated USING ((verified = true));

CREATE POLICY "Users can view own competencies" ON public.user_competencies FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));

REVOKE ALL ON FUNCTION private.admin_create_competency(p_name text, p_description text, p_category text, p_default_target_score numeric) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_create_competency(p_name text, p_description text, p_category text, p_default_target_score numeric) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_list_trainer_competencies() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_list_trainer_competencies() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_remove_job_role_competency(p_job_role_id uuid, p_competency_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_remove_job_role_competency(p_job_role_id uuid, p_competency_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_set_competency_active(p_competency_id uuid, p_is_active boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_set_competency_active(p_competency_id uuid, p_is_active boolean) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_set_job_role_competency(p_job_role_id uuid, p_competency_id uuid, p_required_score numeric, p_importance text, p_rationale text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_set_job_role_competency(p_job_role_id uuid, p_competency_id uuid, p_required_score numeric, p_importance text, p_rationale text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_update_competency(p_competency_id uuid, p_name text, p_description text, p_category text, p_default_target_score numeric) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_update_competency(p_competency_id uuid, p_name text, p_description text, p_category text, p_default_target_score numeric) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_upsert_trainer_competency(p_trainer_id uuid, p_competency_id uuid, p_expertise_score numeric, p_years_experience numeric, p_verified boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_upsert_trainer_competency(p_trainer_id uuid, p_competency_id uuid, p_expertise_score numeric, p_years_experience numeric, p_verified boolean) TO authenticated;

REVOKE ALL ON FUNCTION private.get_effective_competency_target(p_user_id uuid, p_competency_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_effective_competency_target(p_user_id uuid, p_competency_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_create_competency(p_name text, p_description text, p_category text, p_default_target_score numeric) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_create_competency(p_name text, p_description text, p_category text, p_default_target_score numeric) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_trainer_competencies() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_list_trainer_competencies() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_set_competency_active(p_competency_id uuid, p_is_active boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_set_competency_active(p_competency_id uuid, p_is_active boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_update_competency(p_competency_id uuid, p_name text, p_description text, p_category text, p_default_target_score numeric) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_update_competency(p_competency_id uuid, p_name text, p_description text, p_category text, p_default_target_score numeric) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_upsert_trainer_competency(p_trainer_id uuid, p_competency_id uuid, p_expertise_score numeric, p_years_experience numeric, p_verified boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_upsert_trainer_competency(p_trainer_id uuid, p_competency_id uuid, p_expertise_score numeric, p_years_experience numeric, p_verified boolean) TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.competencies TO service_role;

GRANT SELECT ON TABLE public.competencies TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.job_role_competencies TO service_role;

GRANT SELECT ON TABLE public.job_role_competencies TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.trainer_competencies TO service_role;

GRANT SELECT ON TABLE public.trainer_competencies TO authenticated;

GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.trainer_directory_competencies TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.trainer_directory_competencies TO service_role;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.user_competencies TO service_role;

GRANT SELECT ON TABLE public.user_competencies TO authenticated;
