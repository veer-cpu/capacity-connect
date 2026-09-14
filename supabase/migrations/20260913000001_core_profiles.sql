-- 20260913000001_core_profiles.sql
-- Core schemas, organizational units, job roles, profiles, trainee/trainer profiles, professional details

CREATE SCHEMA IF NOT EXISTS private;

CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE public.organizational_units (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text,
    description text,
    parent_unit_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT organizational_units_code_not_blank CHECK (((code IS NULL) OR (length(TRIM(BOTH FROM code)) > 0))),
    CONSTRAINT organizational_units_name_not_blank CHECK ((length(TRIM(BOTH FROM name)) > 0))
);

CREATE TABLE public.job_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizational_unit_id uuid,
    name text NOT NULL,
    code text,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT job_roles_code_not_blank CHECK (((code IS NULL) OR (length(TRIM(BOTH FROM code)) > 0))),
    CONSTRAINT job_roles_name_not_blank CHECK ((length(TRIM(BOTH FROM name)) > 0))
);

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    role text DEFAULT 'trainee'::text NOT NULL,
    designation text,
    department text,
    bio text,
    avatar_url text,
    is_approved boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    organizational_unit_id uuid,
    job_role_id uuid,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['trainee'::text, 'trainer'::text, 'admin'::text])))
);

CREATE TABLE public.trainee_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    employee_code text,
    qualifications text,
    work_experience text,
    professional_interests text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.trainer_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    years_of_experience integer DEFAULT 0 NOT NULL,
    trainer_bio text,
    availability_status text DEFAULT 'available'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT trainer_profiles_availability_status_check CHECK ((availability_status = ANY (ARRAY['available'::text, 'limited'::text, 'unavailable'::text]))),
    CONSTRAINT trainer_profiles_years_of_experience_check CHECK ((years_of_experience >= 0))
);

CREATE TABLE public.profile_qualifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    qualification text NOT NULL,
    field_of_study text,
    institution text,
    completion_year integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profile_qualifications_completion_year_check CHECK (((completion_year IS NULL) OR ((completion_year >= 1950) AND (completion_year <= 2100))))
);

CREATE TABLE public.profile_work_experiences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization text NOT NULL,
    role_title text NOT NULL,
    department text,
    start_date date,
    end_date date,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profile_work_experiences_dates_check CHECK (((end_date IS NULL) OR (start_date IS NULL) OR (end_date >= start_date)))
);

CREATE TABLE public.profile_interests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profile_interests_name_check CHECK (((length(TRIM(BOTH FROM name)) >= 2) AND (length(TRIM(BOTH FROM name)) <= 100)))
);

CREATE TABLE public.external_certifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    issuing_organization text,
    issue_date date,
    expiry_date date,
    credential_id text,
    credential_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT external_certifications_dates_check CHECK (((expiry_date IS NULL) OR (issue_date IS NULL) OR (expiry_date >= issue_date)))
);

ALTER TABLE ONLY public.external_certifications
    ADD CONSTRAINT external_certifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.organizational_units
    ADD CONSTRAINT organizational_units_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profile_interests
    ADD CONSTRAINT profile_interests_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profile_interests
    ADD CONSTRAINT profile_interests_unique UNIQUE (user_id, name);

ALTER TABLE ONLY public.profile_qualifications
    ADD CONSTRAINT profile_qualifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profile_work_experiences
    ADD CONSTRAINT profile_work_experiences_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.trainee_profiles
    ADD CONSTRAINT trainee_profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.trainee_profiles
    ADD CONSTRAINT trainee_profiles_user_id_key UNIQUE (user_id);

ALTER TABLE ONLY public.trainer_profiles
    ADD CONSTRAINT trainer_profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.trainer_profiles
    ADD CONSTRAINT trainer_profiles_user_id_key UNIQUE (user_id);

CREATE INDEX external_certifications_user_idx ON public.external_certifications USING btree (user_id);

CREATE UNIQUE INDEX job_roles_code_unique ON public.job_roles USING btree (lower(code)) WHERE (code IS NOT NULL);

CREATE UNIQUE INDEX job_roles_unit_name_unique ON public.job_roles USING btree (organizational_unit_id, lower(name));

CREATE UNIQUE INDEX organizational_units_code_unique ON public.organizational_units USING btree (lower(code)) WHERE (code IS NOT NULL);

CREATE UNIQUE INDEX organizational_units_name_unique ON public.organizational_units USING btree (lower(name));

CREATE INDEX profile_interests_user_idx ON public.profile_interests USING btree (user_id);

CREATE INDEX profile_qualifications_user_idx ON public.profile_qualifications USING btree (user_id);

CREATE INDEX profile_work_experiences_user_idx ON public.profile_work_experiences USING btree (user_id);

CREATE INDEX profiles_job_role_idx ON public.profiles USING btree (job_role_id);

CREATE INDEX profiles_organizational_unit_idx ON public.profiles USING btree (organizational_unit_id);

ALTER TABLE ONLY public.external_certifications
    ADD CONSTRAINT external_certifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_organizational_unit_id_fkey FOREIGN KEY (organizational_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.organizational_units
    ADD CONSTRAINT organizational_units_parent_unit_id_fkey FOREIGN KEY (parent_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.profile_interests
    ADD CONSTRAINT profile_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profile_qualifications
    ADD CONSTRAINT profile_qualifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profile_work_experiences
    ADD CONSTRAINT profile_work_experiences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_organizational_unit_id_fkey FOREIGN KEY (organizational_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.trainee_profiles
    ADD CONSTRAINT trainee_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.trainer_profiles
    ADD CONSTRAINT trainer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE VIEW public.trainer_directory AS
 SELECT p.id AS trainer_id,
    p.full_name,
    p.designation,
    p.department,
    p.bio,
    p.avatar_url,
    tp.years_of_experience,
    tp.trainer_bio,
    tp.availability_status
   FROM (public.profiles p
     JOIN public.trainer_profiles tp ON ((tp.user_id = p.id)))
  WHERE ((p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true));

CREATE FUNCTION private.admin_approve_user(p_user_id uuid) RETURNS void
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

  if p_user_id = auth.uid() then
    raise exception 'Admin cannot approve their own account through this action';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
  ) then
    raise exception 'User not found';
  end if;

  update public.profiles
  set
    is_approved = true,
    is_active = true,
    updated_at = now()
  where id = p_user_id;
end;
$$;

CREATE FUNCTION private.admin_assign_trainee_organization(p_user_id uuid, p_organizational_unit_id uuid, p_job_role_id uuid) RETURNS void
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


  if not exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.role = 'trainee'
  ) then
    raise exception 'Trainee not found';
  end if;


  if p_job_role_id is not null then

    if not exists (
      select 1
      from public.job_roles jr
      where jr.id = p_job_role_id
        and jr.is_active = true
    ) then
      raise exception 'Invalid job role';
    end if;

  end if;


  if p_organizational_unit_id is not null then

    if not exists (
      select 1
      from public.organizational_units ou
      where ou.id = p_organizational_unit_id
        and ou.is_active = true
    ) then
      raise exception 'Invalid organizational unit';
    end if;

  end if;


  update public.profiles

  set
    organizational_unit_id =
      p_organizational_unit_id,

    job_role_id =
      p_job_role_id,

    updated_at =
      now()

  where id = p_user_id;

end;
$$;

CREATE FUNCTION private.admin_deactivate_user(p_user_id uuid) RETURNS void
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

  if p_user_id = auth.uid() then
    raise exception 'Admin cannot deactivate their own account';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
  ) then
    raise exception 'User not found';
  end if;

  update public.profiles
  set
    is_active = false,
    updated_at = now()
  where id = p_user_id;
end;
$$;

CREATE FUNCTION private.admin_list_assignable_trainers() RETURNS TABLE(trainer_id uuid, full_name text, email text)
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
    p.email
  from public.profiles p
  where p.role = 'trainer'
    and p.is_approved = true
    and p.is_active = true
  order by p.full_name asc;
end;
$$;

CREATE FUNCTION private.admin_list_users() RETURNS TABLE(user_id uuid, full_name text, email text, role text, designation text, department text, is_approved boolean, is_active boolean, created_at timestamp with time zone)
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
    p.role,
    p.designation,
    p.department,
    p.is_approved,
    p.is_active,
    p.created_at
  from public.profiles p
  order by
    p.is_approved asc,
    p.created_at desc;
end;
$$;

CREATE FUNCTION private.admin_reactivate_user(p_user_id uuid) RETURNS void
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
    where p.id = p_user_id
  ) then
    raise exception 'User not found';
  end if;

  /*
   * Reactivation should not bypass approval.
   */
  if not exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.is_approved = true
  ) then
    raise exception 'Pending users must be approved instead of reactivated';
  end if;

  update public.profiles
  set
    is_active = true,
    updated_at = now()
  where id = p_user_id;
end;
$$;

CREATE FUNCTION private.admin_set_user_role(p_user_id uuid, p_new_role text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_current_role text;
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

  if p_user_id = auth.uid() then
    raise exception 'Admin cannot change their own role';
  end if;

  if p_new_role not in ('trainee', 'trainer') then
    raise exception 'Only trainee and trainer roles can be assigned here';
  end if;

  select p.role
  into v_current_role
  from public.profiles p
  where p.id = p_user_id;

  if v_current_role is null then
    raise exception 'User not found';
  end if;

  if v_current_role = 'admin' then
    raise exception 'Admin accounts cannot be modified through this action';
  end if;

  if v_current_role = p_new_role then
    return;
  end if;

  if p_new_role = 'trainer' then
    insert into public.trainer_profiles (
      user_id
    )
    values (
      p_user_id
    )
    on conflict (user_id)
    do nothing;
  end if;

  if p_new_role = 'trainee' then
    insert into public.trainee_profiles (
      user_id
    )
    values (
      p_user_id
    )
    on conflict (user_id)
    do nothing;
  end if;

  update public.profiles
  set
    role = p_new_role,
    updated_at = now()
  where id = p_user_id;
end;
$$;

CREATE FUNCTION private.admin_upsert_job_role(p_id uuid, p_organizational_unit_id uuid, p_name text, p_code text, p_description text, p_is_active boolean) RETURNS uuid
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

  if p_id is null then
    insert into public.job_roles (
      organizational_unit_id,
      name,
      code,
      description,
      is_active
    )
    values (
      p_organizational_unit_id,
      trim(p_name),
      nullif(trim(p_code), ''),
      nullif(trim(p_description), ''),
      coalesce(p_is_active, true)
    )
    returning id into v_id;
  else
    update public.job_roles
    set
      organizational_unit_id = p_organizational_unit_id,
      name = trim(p_name),
      code = nullif(trim(p_code), ''),
      description = nullif(trim(p_description), ''),
      is_active = coalesce(p_is_active, true),
      updated_at = now()
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Job role not found';
    end if;
  end if;

  return v_id;
end;
$$;

CREATE FUNCTION private.admin_upsert_organizational_unit(p_id uuid, p_name text, p_code text, p_description text, p_parent_unit_id uuid, p_is_active boolean) RETURNS uuid
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

  if p_id is null then
    insert into public.organizational_units (
      name,
      code,
      description,
      parent_unit_id,
      is_active
    )
    values (
      trim(p_name),
      nullif(trim(p_code), ''),
      nullif(trim(p_description), ''),
      p_parent_unit_id,
      coalesce(p_is_active, true)
    )
    returning id into v_id;
  else
    update public.organizational_units
    set
      name = trim(p_name),
      code = nullif(trim(p_code), ''),
      description = nullif(trim(p_description), ''),
      parent_unit_id = p_parent_unit_id,
      is_active = coalesce(p_is_active, true),
      updated_at = now()
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Organizational unit not found';
    end if;
  end if;

  return v_id;
end;
$$;

CREATE FUNCTION public.admin_approve_user(p_user_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_approve_user(
    p_user_id
  );
$$;

CREATE FUNCTION public.admin_assign_trainee_organization(p_user_id uuid, p_organizational_unit_id uuid, p_job_role_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_assign_trainee_organization(
    p_user_id,
    p_organizational_unit_id,
    p_job_role_id
  );
$$;

CREATE FUNCTION public.admin_deactivate_user(p_user_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_deactivate_user(
    p_user_id
  );
$$;

CREATE FUNCTION public.admin_list_users() RETURNS TABLE(user_id uuid, full_name text, email text, role text, designation text, department text, is_approved boolean, is_active boolean, created_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_list_users();
$$;

CREATE FUNCTION public.admin_reactivate_user(p_user_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_reactivate_user(
    p_user_id
  );
$$;

CREATE FUNCTION public.admin_set_user_role(p_user_id uuid, p_new_role text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_set_user_role(
    p_user_id,
    p_new_role
  );
$$;

CREATE FUNCTION public.admin_upsert_job_role(p_id uuid, p_organizational_unit_id uuid, p_name text, p_code text, p_description text, p_is_active boolean) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_upsert_job_role(
    p_id,
    p_organizational_unit_id,
    p_name,
    p_code,
    p_description,
    p_is_active
  );
$$;

CREATE FUNCTION public.admin_upsert_organizational_unit(p_id uuid, p_name text, p_code text, p_description text, p_parent_unit_id uuid, p_is_active boolean) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_upsert_organizational_unit(
    p_id,
    p_name,
    p_code,
    p_description,
    p_parent_unit_id,
    p_is_active
  );
$$;

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    is_approved,
    is_active
  )
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    'trainee',
    false,
    true
  );

  return new;
end;
$$;

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;

CREATE FUNCTION public.admin_list_assignable_trainers() RETURNS TABLE(trainer_id uuid, full_name text, email text)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_list_assignable_trainers();
$$;

ALTER TABLE public.external_certifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organizational_units ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profile_qualifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profile_work_experiences ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trainee_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active job roles" ON public.job_roles FOR SELECT TO authenticated USING ((is_active = true));

CREATE POLICY "Authenticated users can view active organizational units" ON public.organizational_units FOR SELECT TO authenticated USING ((is_active = true));

CREATE POLICY "Trainees can create own trainee profile" ON public.trainee_profiles FOR INSERT TO authenticated WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainee'::text) AND (p.is_active = true) AND (p.is_approved = true))))));

CREATE POLICY "Trainees can update own trainee profile" ON public.trainee_profiles FOR UPDATE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Trainees can view own trainee profile" ON public.trainee_profiles FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Trainers can create own trainer profile" ON public.trainer_profiles FOR INSERT TO authenticated WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true))))));

CREATE POLICY "Trainers can update own trainer profile" ON public.trainer_profiles FOR UPDATE TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Trainers can view own trainer profile" ON public.trainer_profiles FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Users can manage own external certifications" ON public.external_certifications TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can manage own interests" ON public.profile_interests TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can manage own qualifications" ON public.profile_qualifications TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can manage own work experience" ON public.profile_work_experiences TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "Users can read own external certifications" ON public.external_certifications FOR SELECT TO authenticated USING ((user_id = auth.uid()));

CREATE POLICY "Users can read own interests" ON public.profile_interests FOR SELECT TO authenticated USING ((user_id = auth.uid()));

CREATE POLICY "Users can read own qualifications" ON public.profile_qualifications FOR SELECT TO authenticated USING ((user_id = auth.uid()));

CREATE POLICY "Users can read own work experience" ON public.profile_work_experiences FOR SELECT TO authenticated USING ((user_id = auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = id)) WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = id));

GRANT USAGE ON SCHEMA private TO authenticated;

GRANT USAGE ON SCHEMA public TO postgres;

GRANT USAGE ON SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT USAGE ON SCHEMA public TO service_role;

REVOKE ALL ON FUNCTION private.admin_approve_user(p_user_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_approve_user(p_user_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_assign_trainee_organization(p_user_id uuid, p_organizational_unit_id uuid, p_job_role_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_assign_trainee_organization(p_user_id uuid, p_organizational_unit_id uuid, p_job_role_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_deactivate_user(p_user_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_deactivate_user(p_user_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_list_assignable_trainers() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_list_assignable_trainers() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_list_users() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_list_users() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_reactivate_user(p_user_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_reactivate_user(p_user_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_set_user_role(p_user_id uuid, p_new_role text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_set_user_role(p_user_id uuid, p_new_role text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_upsert_job_role(p_id uuid, p_organizational_unit_id uuid, p_name text, p_code text, p_description text, p_is_active boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_upsert_job_role(p_id uuid, p_organizational_unit_id uuid, p_name text, p_code text, p_description text, p_is_active boolean) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_upsert_organizational_unit(p_id uuid, p_name text, p_code text, p_description text, p_parent_unit_id uuid, p_is_active boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_upsert_organizational_unit(p_id uuid, p_name text, p_code text, p_description text, p_parent_unit_id uuid, p_is_active boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_approve_user(p_user_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_approve_user(p_user_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_assign_trainee_organization(p_user_id uuid, p_organizational_unit_id uuid, p_job_role_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_assign_trainee_organization(p_user_id uuid, p_organizational_unit_id uuid, p_job_role_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_deactivate_user(p_user_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_deactivate_user(p_user_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_assignable_trainers() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_list_assignable_trainers() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_list_users() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_reactivate_user(p_user_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_reactivate_user(p_user_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_set_user_role(p_user_id uuid, p_new_role text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_set_user_role(p_user_id uuid, p_new_role text) TO authenticated;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.external_certifications TO service_role;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.external_certifications TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.job_roles TO service_role;

GRANT SELECT ON TABLE public.job_roles TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.organizational_units TO service_role;

GRANT SELECT ON TABLE public.organizational_units TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.profile_interests TO service_role;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.profile_interests TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.profile_qualifications TO service_role;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.profile_qualifications TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.profile_work_experiences TO service_role;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.profile_work_experiences TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.profiles TO service_role;

GRANT SELECT ON TABLE public.profiles TO authenticated;

GRANT UPDATE(full_name) ON TABLE public.profiles TO authenticated;

GRANT UPDATE(designation) ON TABLE public.profiles TO authenticated;

GRANT UPDATE(department) ON TABLE public.profiles TO authenticated;

GRANT UPDATE(bio) ON TABLE public.profiles TO authenticated;

GRANT UPDATE(avatar_url) ON TABLE public.profiles TO authenticated;

GRANT UPDATE(updated_at) ON TABLE public.profiles TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.trainee_profiles TO service_role;

GRANT SELECT,INSERT,UPDATE ON TABLE public.trainee_profiles TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.trainer_profiles TO service_role;

GRANT SELECT,INSERT,UPDATE ON TABLE public.trainer_profiles TO authenticated;

GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.trainer_directory TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.trainer_directory TO service_role;
