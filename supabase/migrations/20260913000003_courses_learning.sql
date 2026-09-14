-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    category text,
    difficulty text DEFAULT 'beginner'::text NOT NULL,
    thumbnail_url text,
    status text DEFAULT 'draft'::text NOT NULL,
    trainer_id uuid,
    estimated_duration_minutes integer,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    approval_status text DEFAULT 'draft'::text NOT NULL,
    submitted_for_review_at timestamp with time zone,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    review_reason text,
    CONSTRAINT courses_approval_status_valid CHECK ((approval_status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT courses_difficulty_check CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT courses_estimated_duration_minutes_check CHECK (((estimated_duration_minutes IS NULL) OR (estimated_duration_minutes >= 0))),
    CONSTRAINT courses_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])))
);

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

CREATE TABLE public.course_competencies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    relevance_weight numeric(5,2) DEFAULT 100 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_competencies_relevance_weight_check CHECK (((relevance_weight >= (0)::numeric) AND (relevance_weight <= (100)::numeric)))
);

-- 20260913000003_courses_learning.sql
-- Courses, modules, lessons, course competencies, enrollments, lesson progress, learning functions

CREATE TABLE public.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    "position" integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sequence_order integer NOT NULL,
    CONSTRAINT modules_position_check CHECK (("position" > 0)),
    CONSTRAINT modules_sequence_order_check CHECK ((sequence_order > 0))
);

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    lesson_type text DEFAULT 'text'::text NOT NULL,
    content text,
    resource_url text,
    "position" integer DEFAULT 1 NOT NULL,
    estimated_duration_minutes integer,
    is_required boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sequence_order integer NOT NULL,
    CONSTRAINT lessons_estimated_duration_minutes_check CHECK (((estimated_duration_minutes IS NULL) OR (estimated_duration_minutes >= 0))),
    CONSTRAINT lessons_lesson_type_check CHECK ((lesson_type = ANY (ARRAY['text'::text, 'video'::text, 'pdf'::text, 'presentation'::text, 'external_link'::text]))),
    CONSTRAINT lessons_position_check CHECK (("position" > 0)),
    CONSTRAINT lessons_sequence_order_check CHECK ((sequence_order > 0))
);

CREATE TABLE public.learning_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    lesson_id uuid,
    uploaded_by uuid NOT NULL,
    title text NOT NULL,
    description text,
    resource_type text NOT NULL,
    storage_path text NOT NULL,
    mime_type text NOT NULL,
    file_size_bytes bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT learning_resources_file_size_bytes_check CHECK ((file_size_bytes >= 0)),
    CONSTRAINT learning_resources_resource_type_check CHECK ((resource_type = ANY (ARRAY['pdf'::text, 'presentation'::text, 'document'::text, 'video'::text, 'other'::text])))
);

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainee_id uuid NOT NULL,
    course_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    progress_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT enrollments_progress_percentage_check CHECK (((progress_percentage >= (0)::numeric) AND (progress_percentage <= (100)::numeric))),
    CONSTRAINT enrollments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'withdrawn'::text])))
);

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.course_competencies
    ADD CONSTRAINT course_competencies_course_id_competency_id_key UNIQUE (course_id, competency_id);

ALTER TABLE ONLY public.course_competencies
    ADD CONSTRAINT course_competencies_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_trainee_id_course_id_key UNIQUE (trainee_id, course_id);

ALTER TABLE ONLY public.learning_resources
    ADD CONSTRAINT learning_resources_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_lesson_id_key UNIQUE (enrollment_id, lesson_id);

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_position_key UNIQUE (module_id, "position");

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_course_id_position_key UNIQUE (course_id, "position");

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);

CREATE INDEX learning_resources_course_id_idx ON public.learning_resources USING btree (course_id);

CREATE INDEX learning_resources_lesson_id_idx ON public.learning_resources USING btree (lesson_id);

CREATE INDEX learning_resources_uploaded_by_idx ON public.learning_resources USING btree (uploaded_by);

CREATE INDEX lessons_module_sequence_idx ON public.lessons USING btree (module_id, sequence_order);

CREATE INDEX modules_course_sequence_idx ON public.modules USING btree (course_id, sequence_order);

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.learning_resources
    ADD CONSTRAINT learning_resources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.course_competencies
    ADD CONSTRAINT course_competencies_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.course_competencies
    ADD CONSTRAINT course_competencies_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.learning_resources
    ADD CONSTRAINT learning_resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.learning_resources
    ADD CONSTRAINT learning_resources_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

CREATE FUNCTION private.admin_archive_course(p_course_id uuid) RETURNS void
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
    from public.courses c
    where c.id = p_course_id
      and c.status = 'published'
  ) then
    raise exception 'Course not found or not archivable';
  end if;

  update public.courses
  set
    status = 'archived',
    updated_at = now()
  where id = p_course_id;
end;
$$;

CREATE FUNCTION private.admin_assign_course_trainer(p_course_id uuid, p_trainer_id uuid) RETURNS void
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
    from public.courses c
    where c.id = p_course_id
  ) then
    raise exception 'Course not found';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_trainer_id
      and p.role = 'trainer'
      and p.is_approved = true
      and p.is_active = true
  ) then
    raise exception 'Trainer is not active and approved';
  end if;

  update public.courses
  set
    trainer_id = p_trainer_id,
    updated_at = now()
  where id = p_course_id;
end;
$$;

CREATE FUNCTION private.admin_course_completion_report() RETURNS TABLE(enrollment_id uuid, course_id uuid, course_title text, trainee_id uuid, trainee_name text, trainee_email text, enrollment_status text, progress_percentage numeric, enrolled_at timestamp with time zone, completed_at timestamp with time zone, trainer_name text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin

  -- -------------------------------------------------------
  -- Authentication
  -- -------------------------------------------------------

  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;


  -- -------------------------------------------------------
  -- Admin authorization
  -- -------------------------------------------------------

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


  -- -------------------------------------------------------
  -- Report-safe data only
  -- -------------------------------------------------------

  return query

  select
    e.id as enrollment_id,
    c.id as course_id,
    c.title as course_title,

    trainee.id as trainee_id,

    coalesce(
      nullif(trim(trainee.full_name), ''),
      trainee.email,
      'Trainee'
    ) as trainee_name,

    trainee.email as trainee_email,

    e.status as enrollment_status,

    coalesce(
      e.progress_percentage,
      0
    )::numeric as progress_percentage,

    coalesce(
      e.enrolled_at,
      e.created_at
    ) as enrolled_at,

    e.completed_at,

    coalesce(
      nullif(trim(trainer.full_name), ''),
      'Unassigned'
    ) as trainer_name

  from public.enrollments e

  join public.courses c
    on c.id = e.course_id

  join public.profiles trainee
    on trainee.id = e.trainee_id

  left join public.profiles trainer
    on trainer.id = c.trainer_id

  order by
    coalesce(
      e.enrolled_at,
      e.created_at
    ) desc;

end;
$$;

CREATE FUNCTION private.admin_create_course(p_title text, p_slug text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
declare
  v_course_id uuid;
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

  if p_title is null
     or length(trim(p_title)) < 2 then
    raise exception 'Course title is required';
  end if;

  if p_slug is null
     or length(trim(p_slug)) < 2 then
    raise exception 'Course slug is required';
  end if;

  if p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Course slug must contain lowercase letters, numbers, and hyphens only';
  end if;

  if p_difficulty not in (
    'beginner',
    'intermediate',
    'advanced'
  ) then
    raise exception 'Invalid difficulty';
  end if;

  if p_estimated_duration_minutes is not null
     and p_estimated_duration_minutes < 0 then
    raise exception 'Estimated duration cannot be negative';
  end if;

  if exists (
    select 1
    from public.courses c
    where c.slug = trim(p_slug)
  ) then
    raise exception 'Course slug already exists';
  end if;

  insert into public.courses (
    title,
    slug,
    description,
    category,
    difficulty,
    status,
    trainer_id,
    estimated_duration_minutes,
    created_by,
    updated_at
  )
  values (
    trim(p_title),
    trim(p_slug),
    nullif(trim(coalesce(p_description, '')), ''),
    nullif(trim(coalesce(p_category, '')), ''),
    p_difficulty,
    'draft',
    null,
    p_estimated_duration_minutes,
    auth.uid(),
    now()
  )
  returning id
  into v_course_id;

  return v_course_id;
end;
$_$;

CREATE FUNCTION private.admin_create_lesson(p_module_id uuid, p_title text, p_content text, p_is_required boolean) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_id uuid;
  v_next_order integer;
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

  if not exists (
    select 1
    from public.modules m
    join public.courses c
      on c.id = m.course_id
    where m.id = p_module_id
      and c.status <> 'archived'
  ) then
    raise exception 'Module not found or course archived';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'Lesson title is required';
  end if;

  select coalesce(max(l.sequence_order), 0) + 1
  into v_next_order
  from public.lessons l
  where l.module_id = p_module_id;

  insert into public.lessons (
    module_id,
    title,
    content,
    is_required,
    sequence_order
  )
  values (
    p_module_id,
    trim(p_title),
    nullif(trim(p_content), ''),
    p_is_required,
    v_next_order
  )
  returning id
  into v_id;

  return v_id;
end;
$$;

CREATE FUNCTION private.admin_create_module(p_course_id uuid, p_title text, p_description text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_id uuid;
  v_next_order integer;
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

  if not exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.status <> 'archived'
  ) then
    raise exception 'Course not found or archived';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'Module title is required';
  end if;

  select coalesce(max(m.sequence_order), 0) + 1
  into v_next_order
  from public.modules m
  where m.course_id = p_course_id;

  insert into public.modules (
    course_id,
    title,
    description,
    sequence_order
  )
  values (
    p_course_id,
    trim(p_title),
    nullif(trim(p_description), ''),
    v_next_order
  )
  returning id
  into v_id;

  return v_id;
end;
$$;

CREATE FUNCTION private.admin_get_course_content(p_course_id uuid) RETURNS TABLE(course_id uuid, title text, slug text, description text, category text, difficulty text, estimated_duration_minutes integer, status text, trainer_id uuid, trainer_name text, module_id uuid, module_title text, module_description text, module_sequence_order integer, lesson_id uuid, lesson_title text, lesson_content text, lesson_sequence_order integer, lesson_is_required boolean)
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

  return query
  select
    c.id,
    c.title,
    c.slug,
    c.description,
    c.category,
    c.difficulty,
    c.estimated_duration_minutes,
    c.status,
    c.trainer_id,
    tp.full_name,

    m.id,
    m.title,
    m.description,
    m.sequence_order,

    l.id,
    l.title,
    l.content,
    l.sequence_order,
    l.is_required

  from public.courses c

  left join public.profiles tp
    on tp.id = c.trainer_id

  left join public.modules m
    on m.course_id = c.id

  left join public.lessons l
    on l.module_id = m.id

  where c.id = p_course_id

  order by
    m.sequence_order asc nulls last,
    l.sequence_order asc nulls last;
end;
$$;

CREATE FUNCTION private.admin_list_competencies() RETURNS TABLE(competency_id uuid, name text, description text, category text, default_target_score numeric, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, mapped_course_count bigint, trainee_count bigint, verified_trainer_count bigint)
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

  return query
  select
    c.id,
    c.name,
    c.description,
    c.category,
    c.default_target_score,
    c.is_active,
    c.created_at,
    c.updated_at,

    (
      select count(*)
      from public.course_competencies cc
      where cc.competency_id = c.id
    )::bigint,

    (
      select count(distinct uc.user_id)
      from public.user_competencies uc
      where uc.competency_id = c.id
    )::bigint,

    (
      select count(distinct tc.trainer_id)
      from public.trainer_competencies tc
      where tc.competency_id = c.id
        and tc.verified = true
    )::bigint

  from public.competencies c

  order by
    c.is_active desc,
    c.category asc nulls last,
    c.name asc;
end;
$$;

CREATE FUNCTION private.admin_list_course_competencies(p_course_id uuid) RETURNS TABLE(competency_id uuid, competency_name text, relevance_weight numeric, mapped boolean)
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
    from public.courses c
    where c.id = p_course_id
  ) then
    raise exception 'Course not found';
  end if;

  return query
  select
    c.id,
    c.name,
    coalesce(cc.relevance_weight, 100),
    (cc.id is not null)
  from public.competencies c
  left join public.course_competencies cc
    on cc.competency_id = c.id
   and cc.course_id = p_course_id
  where c.is_active = true
  order by c.name asc;
end;
$$;

CREATE FUNCTION private.admin_list_courses() RETURNS TABLE(course_id uuid, title text, slug text, description text, category text, difficulty text, status text, trainer_id uuid, trainer_name text, estimated_duration_minutes integer, created_at timestamp with time zone)
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
    c.id,
    c.title,
    c.slug,
    c.description,
    c.category,
    c.difficulty,
    c.status,
    c.trainer_id,
    p.full_name,
    c.estimated_duration_minutes,
    c.created_at
  from public.courses c
  left join public.profiles p
    on p.id = c.trainer_id
  order by c.created_at desc;
end;
$$;

CREATE FUNCTION private.admin_move_lesson(p_lesson_id uuid, p_direction text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_module_id uuid;
  v_current_order integer;
  v_target_id uuid;
  v_target_order integer;
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

  if p_direction not in ('up', 'down') then
    raise exception 'Invalid direction';
  end if;

  select
    l.module_id,
    l.sequence_order
  into
    v_module_id,
    v_current_order
  from public.lessons l
  where l.id = p_lesson_id;

  if v_module_id is null then
    raise exception 'Lesson not found';
  end if;

  if p_direction = 'up' then
    select
      l.id,
      l.sequence_order
    into
      v_target_id,
      v_target_order
    from public.lessons l
    where l.module_id = v_module_id
      and l.sequence_order < v_current_order
    order by l.sequence_order desc
    limit 1;
  else
    select
      l.id,
      l.sequence_order
    into
      v_target_id,
      v_target_order
    from public.lessons l
    where l.module_id = v_module_id
      and l.sequence_order > v_current_order
    order by l.sequence_order asc
    limit 1;
  end if;

  if v_target_id is null then
    return;
  end if;

  update public.lessons
  set
    sequence_order = case
      when id = p_lesson_id
        then v_target_order
      when id = v_target_id
        then v_current_order
      else sequence_order
    end,
    updated_at = now()
  where id in (
    p_lesson_id,
    v_target_id
  );
end;
$$;

CREATE FUNCTION private.admin_move_module(p_module_id uuid, p_direction text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_course_id uuid;
  v_current_order integer;
  v_target_id uuid;
  v_target_order integer;
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

  if p_direction not in ('up', 'down') then
    raise exception 'Invalid direction';
  end if;

  select
    m.course_id,
    m.sequence_order
  into
    v_course_id,
    v_current_order
  from public.modules m
  where m.id = p_module_id;

  if v_course_id is null then
    raise exception 'Module not found';
  end if;

  if p_direction = 'up' then
    select
      m.id,
      m.sequence_order
    into
      v_target_id,
      v_target_order
    from public.modules m
    where m.course_id = v_course_id
      and m.sequence_order < v_current_order
    order by m.sequence_order desc
    limit 1;
  else
    select
      m.id,
      m.sequence_order
    into
      v_target_id,
      v_target_order
    from public.modules m
    where m.course_id = v_course_id
      and m.sequence_order > v_current_order
    order by m.sequence_order asc
    limit 1;
  end if;

  if v_target_id is null then
    return;
  end if;

  update public.modules
  set
    sequence_order = case
      when id = p_module_id
        then v_target_order
      when id = v_target_id
        then v_current_order
      else sequence_order
    end,
    updated_at = now()
  where id in (
    p_module_id,
    v_target_id
  );
end;
$$;

CREATE FUNCTION private.admin_publish_course(p_course_id uuid) RETURNS void
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
    from public.courses c
    where c.id = p_course_id
      and c.status = 'draft'
  ) then
    raise exception 'Course not found or not publishable';
  end if;

  if exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.trainer_id is null
  ) then
    raise exception 'Assign a trainer before publishing';
  end if;

  if not exists (
    select 1
    from public.course_competencies cc
    where cc.course_id = p_course_id
  ) then
    raise exception 'Map at least one competency before publishing';
  end if;

  update public.courses
  set
    status = 'published',
    updated_at = now()
  where id = p_course_id;
end;
$$;

CREATE FUNCTION private.admin_remove_course_competency(p_course_id uuid, p_competency_id uuid) RETURNS void
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
    from public.courses c
    where c.id = p_course_id
  ) then
    raise exception 'Course not found';
  end if;

  delete from public.course_competencies
  where course_id = p_course_id
    and competency_id = p_competency_id;
end;
$$;

CREATE FUNCTION private.admin_review_course(p_course_id uuid, p_decision text, p_reason text) RETURNS void
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

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Invalid review decision';
  end if;

  if p_decision = 'rejected'
     and trim(coalesce(p_reason, '')) = ''
  then
    raise exception 'Rejection reason is required';
  end if;

  if not exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.approval_status = 'submitted'
  ) then
    raise exception 'Course is not awaiting review';
  end if;

  update public.courses
  set
    approval_status = p_decision,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_reason =
      nullif(trim(coalesce(p_reason, '')), ''),
    updated_at = now()
  where id = p_course_id;

end;
$$;

CREATE FUNCTION private.admin_update_course_metadata(p_course_id uuid, p_title text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) RETURNS void
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

  if nullif(trim(p_title), '') is null then
    raise exception 'Course title is required';
  end if;

  if p_difficulty not in (
    'beginner',
    'intermediate',
    'advanced'
  ) then
    raise exception 'Invalid difficulty';
  end if;

  if p_estimated_duration_minutes is null
     or p_estimated_duration_minutes < 1
  then
    raise exception 'Duration must be positive';
  end if;

  update public.courses
  set
    title = trim(p_title),
    description = nullif(trim(p_description), ''),
    category = nullif(trim(p_category), ''),
    difficulty = p_difficulty,
    estimated_duration_minutes = p_estimated_duration_minutes,
    updated_at = now()
  where id = p_course_id;

  if not found then
    raise exception 'Course not found';
  end if;
end;
$$;

CREATE FUNCTION private.admin_update_lesson(p_lesson_id uuid, p_title text, p_content text, p_is_required boolean) RETURNS void
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

  if nullif(trim(p_title), '') is null then
    raise exception 'Lesson title is required';
  end if;

  update public.lessons
  set
    title = trim(p_title),
    content = nullif(trim(p_content), ''),
    is_required = p_is_required,
    updated_at = now()
  where id = p_lesson_id;

  if not found then
    raise exception 'Lesson not found';
  end if;
end;
$$;

CREATE FUNCTION private.admin_update_module(p_module_id uuid, p_title text, p_description text) RETURNS void
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

  if nullif(trim(p_title), '') is null then
    raise exception 'Module title is required';
  end if;

  update public.modules
  set
    title = trim(p_title),
    description = nullif(trim(p_description), ''),
    updated_at = now()
  where id = p_module_id;

  if not found then
    raise exception 'Module not found';
  end if;
end;
$$;

CREATE FUNCTION private.admin_upsert_course_competency(p_course_id uuid, p_competency_id uuid, p_relevance_weight numeric) RETURNS void
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
    from public.courses c
    where c.id = p_course_id
  ) then
    raise exception 'Course not found';
  end if;

  if not exists (
    select 1
    from public.competencies c
    where c.id = p_competency_id
      and c.is_active = true
  ) then
    raise exception 'Competency not found or inactive';
  end if;

  if p_relevance_weight is null
     or p_relevance_weight < 0
     or p_relevance_weight > 100 then
    raise exception 'Relevance weight must be between 0 and 100';
  end if;

  insert into public.course_competencies (
    course_id,
    competency_id,
    relevance_weight
  )
  values (
    p_course_id,
    p_competency_id,
    p_relevance_weight
  )
  on conflict (
    course_id,
    competency_id
  )
  do update
  set relevance_weight =
    excluded.relevance_weight;
end;
$$;

CREATE FUNCTION private.get_trainer_course_trainees(p_course_id uuid) RETURNS TABLE(trainee_id uuid, full_name text, designation text, department text, enrollment_status text, progress_percentage numeric, enrolled_at timestamp with time zone, completed_at timestamp with time zone)
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
      and p.role = 'trainer'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized user';
  end if;

  if not exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.trainer_id = auth.uid()
  ) then
    raise exception 'Unauthorized course';
  end if;

  return query

  select
    p.id,
    p.full_name,
    p.designation,
    p.department,
    e.status,
    e.progress_percentage,
    e.enrolled_at,
    e.completed_at

  from public.enrollments e

  join public.profiles p
    on p.id = e.trainee_id

  where e.course_id = p_course_id

  order by p.full_name asc;

end;
$$;

CREATE FUNCTION private.trainer_submit_course_for_review(p_course_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin

  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.courses c
    join public.profiles p
      on p.id = auth.uid()
    where c.id = p_course_id
      and c.trainer_id = auth.uid()
      and c.status = 'draft'
      and p.role = 'trainer'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized or invalid course';
  end if;

  if not exists (
    select 1
    from public.modules m
    where m.course_id = p_course_id
  ) then
    raise exception 'Course must contain at least one module';
  end if;

  if not exists (
    select 1
    from public.course_competencies cc
    where cc.course_id = p_course_id
  ) then
    raise exception 'Course must have at least one mapped competency';
  end if;

  update public.courses
  set
    approval_status = 'submitted',
    submitted_for_review_at = now(),
    reviewed_by = null,
    reviewed_at = null,
    review_reason = null,
    updated_at = now()
  where id = p_course_id;

end;
$$;

-- Migration 003: Courses, Modules, Lessons, Enrollments, Progress & Course Approval Workflow

CREATE FUNCTION private.is_enrolled_in_course(p_course_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1
    from public.enrollments e
    where e.course_id = p_course_id
      and e.trainee_id = auth.uid()
      and e.status in ('active', 'completed')
  );
$$;

CREATE FUNCTION public.admin_list_competencies() RETURNS TABLE(competency_id uuid, name text, description text, category text, default_target_score numeric, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone, mapped_course_count bigint, trainee_count bigint, verified_trainer_count bigint)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_list_competencies();
$$;

CREATE FUNCTION public.admin_archive_course(p_course_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_archive_course(
    p_course_id
  );
$$;

CREATE FUNCTION public.admin_assign_course_trainer(p_course_id uuid, p_trainer_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_assign_course_trainer(
    p_course_id,
    p_trainer_id
  );
$$;

CREATE FUNCTION public.admin_create_course(p_title text, p_slug text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_create_course(
    p_title,
    p_slug,
    p_description,
    p_category,
    p_difficulty,
    p_estimated_duration_minutes
  );
$$;

CREATE FUNCTION public.admin_create_lesson(p_module_id uuid, p_title text, p_content text, p_is_required boolean) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_create_lesson(
    p_module_id,
    p_title,
    p_content,
    p_is_required
  );
$$;

CREATE FUNCTION public.admin_create_module(p_course_id uuid, p_title text, p_description text) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_create_module(
    p_course_id,
    p_title,
    p_description
  );
$$;

CREATE FUNCTION public.admin_get_course_content(p_course_id uuid) RETURNS TABLE(course_id uuid, title text, slug text, description text, category text, difficulty text, estimated_duration_minutes integer, status text, trainer_id uuid, trainer_name text, module_id uuid, module_title text, module_description text, module_sequence_order integer, lesson_id uuid, lesson_title text, lesson_content text, lesson_sequence_order integer, lesson_is_required boolean)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_get_course_content(
    p_course_id
  );
$$;

CREATE FUNCTION public.admin_list_course_competencies(p_course_id uuid) RETURNS TABLE(competency_id uuid, competency_name text, relevance_weight numeric, mapped boolean)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_list_course_competencies(
    p_course_id
  );
$$;

CREATE FUNCTION public.admin_list_courses() RETURNS TABLE(course_id uuid, title text, slug text, description text, category text, difficulty text, status text, trainer_id uuid, trainer_name text, estimated_duration_minutes integer, created_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_list_courses();
$$;

CREATE FUNCTION public.admin_move_lesson(p_lesson_id uuid, p_direction text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_move_lesson(
    p_lesson_id,
    p_direction
  );
$$;

CREATE FUNCTION public.admin_move_module(p_module_id uuid, p_direction text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_move_module(
    p_module_id,
    p_direction
  );
$$;

CREATE FUNCTION public.admin_publish_course(p_course_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_publish_course(
    p_course_id
  );
$$;

CREATE FUNCTION public.admin_remove_course_competency(p_course_id uuid, p_competency_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_remove_course_competency(
    p_course_id,
    p_competency_id
  );
$$;

CREATE FUNCTION public.admin_review_course(p_course_id uuid, p_decision text, p_reason text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_review_course(
    p_course_id,
    p_decision,
    p_reason
  );
$$;

CREATE FUNCTION public.admin_update_course_metadata(p_course_id uuid, p_title text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_update_course_metadata(
    p_course_id,
    p_title,
    p_description,
    p_category,
    p_difficulty,
    p_estimated_duration_minutes
  );
$$;

CREATE FUNCTION public.admin_update_lesson(p_lesson_id uuid, p_title text, p_content text, p_is_required boolean) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_update_lesson(
    p_lesson_id,
    p_title,
    p_content,
    p_is_required
  );
$$;

CREATE FUNCTION public.admin_update_module(p_module_id uuid, p_title text, p_description text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_update_module(
    p_module_id,
    p_title,
    p_description
  );
$$;

CREATE FUNCTION public.admin_upsert_course_competency(p_course_id uuid, p_competency_id uuid, p_relevance_weight numeric) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_upsert_course_competency(
    p_course_id,
    p_competency_id,
    p_relevance_weight
  );
$$;

CREATE FUNCTION public.get_trainer_course_trainees(p_course_id uuid) RETURNS TABLE(trainee_id uuid, full_name text, designation text, department text, enrollment_status text, progress_percentage numeric, enrolled_at timestamp with time zone, completed_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.get_trainer_course_trainees(
    p_course_id
  );
$$;

CREATE FUNCTION public.trainer_submit_course_for_review(p_course_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.trainer_submit_course_for_review(
    p_course_id
  );
$$;

CREATE FUNCTION public.admin_course_completion_report() RETURNS TABLE(enrollment_id uuid, course_id uuid, course_title text, trainee_id uuid, trainee_name text, trainee_email text, enrollment_status text, progress_percentage numeric, enrolled_at timestamp with time zone, completed_at timestamp with time zone, trainer_name text)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_course_completion_report();
$$;

ALTER TABLE public.course_competencies ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authorized users can view course lessons" ON public.lessons FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.modules m
     JOIN public.courses c ON ((c.id = m.course_id)))
  WHERE ((m.id = lessons.module_id) AND ((c.trainer_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.enrollments e
          WHERE ((e.course_id = c.id) AND (e.trainee_id = auth.uid()) AND (e.status = ANY (ARRAY['active'::text, 'completed'::text]))))) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text) AND (p.is_active = true) AND (p.is_approved = true)))))))));

CREATE POLICY "Trainees can enroll themselves" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (((trainee_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainee'::text) AND (p.is_active = true) AND (p.is_approved = true)))) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = enrollments.course_id) AND (c.status = 'published'::text))))));

CREATE POLICY "Trainers can add resources to assigned courses" ON public.learning_resources FOR INSERT TO authenticated WITH CHECK (((uploaded_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = learning_resources.course_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainer'::text) AND (p.is_approved = true) AND (p.is_active = true))))));

CREATE POLICY "Trainers can view assigned courses" ON public.courses FOR SELECT TO authenticated USING (((trainer_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true))))));

CREATE POLICY "Authenticated users can view published courses" ON public.courses FOR SELECT TO authenticated USING ((status = 'published'::text));

CREATE POLICY "Enrolled trainees can view archived courses" ON public.courses FOR SELECT TO authenticated USING (((status = 'archived'::text) AND private.is_enrolled_in_course(id)));

CREATE POLICY "Trainees can create own lesson progress" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM ((public.enrollments e
     JOIN public.modules m ON ((m.course_id = e.course_id)))
     JOIN public.lessons l ON ((l.module_id = m.id)))
  WHERE ((e.id = lesson_progress.enrollment_id) AND (e.trainee_id = ( SELECT auth.uid() AS uid)) AND (e.status = 'active'::text) AND (l.id = lesson_progress.lesson_id)))));

CREATE POLICY "Trainees can update own lesson progress" ON public.lesson_progress FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.id = lesson_progress.enrollment_id) AND (e.trainee_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((public.enrollments e
     JOIN public.modules m ON ((m.course_id = e.course_id)))
     JOIN public.lessons l ON ((l.module_id = m.id)))
  WHERE ((e.id = lesson_progress.enrollment_id) AND (e.trainee_id = ( SELECT auth.uid() AS uid)) AND (l.id = lesson_progress.lesson_id)))));

CREATE POLICY "Trainees can view own enrollments" ON public.enrollments FOR SELECT TO authenticated USING ((trainee_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Trainees can view own lesson progress" ON public.lesson_progress FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.id = lesson_progress.enrollment_id) AND (e.trainee_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Trainees can view resources for enrolled courses" ON public.learning_resources FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.course_id = learning_resources.course_id) AND (e.trainee_id = auth.uid()) AND (e.status = ANY (ARRAY['active'::text, 'completed'::text]))))));

CREATE POLICY "Trainers can delete resources from assigned courses" ON public.learning_resources FOR DELETE TO authenticated USING (((uploaded_by = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = learning_resources.course_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid)))))));

CREATE POLICY "Trainers can view competencies for assigned courses" ON public.course_competencies FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = course_competencies.course_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Trainers can view enrollments for assigned courses" ON public.enrollments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = enrollments.course_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Trainers can view lessons for assigned courses" ON public.lessons FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.modules m
     JOIN public.courses c ON ((c.id = m.course_id)))
  WHERE ((m.id = lessons.module_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Trainers can view modules for assigned courses" ON public.modules FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = modules.course_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Trainers can view resources for assigned courses" ON public.learning_resources FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = learning_resources.course_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "Users can view competencies for published courses" ON public.course_competencies FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = course_competencies.course_id) AND (c.status = 'published'::text)))));

CREATE POLICY "Users can view modules of published courses" ON public.modules FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = modules.course_id) AND (c.status = 'published'::text)))));

REVOKE ALL ON FUNCTION private.admin_archive_course(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_archive_course(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_assign_course_trainer(p_course_id uuid, p_trainer_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_assign_course_trainer(p_course_id uuid, p_trainer_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_course_completion_report() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_course_completion_report() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_create_course(p_title text, p_slug text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_create_course(p_title text, p_slug text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_create_lesson(p_module_id uuid, p_title text, p_content text, p_is_required boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_create_lesson(p_module_id uuid, p_title text, p_content text, p_is_required boolean) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_create_module(p_course_id uuid, p_title text, p_description text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_create_module(p_course_id uuid, p_title text, p_description text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_get_course_content(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_get_course_content(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_list_competencies() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_list_competencies() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_list_course_competencies(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_list_course_competencies(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_list_courses() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_list_courses() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_move_lesson(p_lesson_id uuid, p_direction text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_move_lesson(p_lesson_id uuid, p_direction text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_move_module(p_module_id uuid, p_direction text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_move_module(p_module_id uuid, p_direction text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_publish_course(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_publish_course(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_remove_course_competency(p_course_id uuid, p_competency_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_remove_course_competency(p_course_id uuid, p_competency_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_review_course(p_course_id uuid, p_decision text, p_reason text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_review_course(p_course_id uuid, p_decision text, p_reason text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_update_course_metadata(p_course_id uuid, p_title text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_update_course_metadata(p_course_id uuid, p_title text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_update_lesson(p_lesson_id uuid, p_title text, p_content text, p_is_required boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_update_lesson(p_lesson_id uuid, p_title text, p_content text, p_is_required boolean) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_update_module(p_module_id uuid, p_title text, p_description text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_update_module(p_module_id uuid, p_title text, p_description text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_upsert_course_competency(p_course_id uuid, p_competency_id uuid, p_relevance_weight numeric) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_upsert_course_competency(p_course_id uuid, p_competency_id uuid, p_relevance_weight numeric) TO authenticated;

REVOKE ALL ON FUNCTION private.get_trainer_course_trainees(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_trainer_course_trainees(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.is_enrolled_in_course(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_enrolled_in_course(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.trainer_submit_course_for_review(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.trainer_submit_course_for_review(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_archive_course(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_archive_course(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_assign_course_trainer(p_course_id uuid, p_trainer_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_assign_course_trainer(p_course_id uuid, p_trainer_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_course_completion_report() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_course_completion_report() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_create_course(p_title text, p_slug text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_create_course(p_title text, p_slug text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_create_lesson(p_module_id uuid, p_title text, p_content text, p_is_required boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_create_lesson(p_module_id uuid, p_title text, p_content text, p_is_required boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_create_module(p_course_id uuid, p_title text, p_description text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_create_module(p_course_id uuid, p_title text, p_description text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_get_course_content(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_get_course_content(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_competencies() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_list_competencies() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_course_competencies(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_list_course_competencies(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_courses() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_list_courses() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_move_lesson(p_lesson_id uuid, p_direction text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_move_lesson(p_lesson_id uuid, p_direction text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_move_module(p_module_id uuid, p_direction text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_move_module(p_module_id uuid, p_direction text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_publish_course(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_publish_course(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_remove_course_competency(p_course_id uuid, p_competency_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_remove_course_competency(p_course_id uuid, p_competency_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_review_course(p_course_id uuid, p_decision text, p_reason text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_review_course(p_course_id uuid, p_decision text, p_reason text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_update_course_metadata(p_course_id uuid, p_title text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_update_course_metadata(p_course_id uuid, p_title text, p_description text, p_category text, p_difficulty text, p_estimated_duration_minutes integer) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_update_lesson(p_lesson_id uuid, p_title text, p_content text, p_is_required boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_update_lesson(p_lesson_id uuid, p_title text, p_content text, p_is_required boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_update_module(p_module_id uuid, p_title text, p_description text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_update_module(p_module_id uuid, p_title text, p_description text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_upsert_course_competency(p_course_id uuid, p_competency_id uuid, p_relevance_weight numeric) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_upsert_course_competency(p_course_id uuid, p_competency_id uuid, p_relevance_weight numeric) TO authenticated;

REVOKE ALL ON FUNCTION public.get_trainer_course_trainees(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_trainer_course_trainees(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.trainer_submit_course_for_review(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.trainer_submit_course_for_review(p_course_id uuid) TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.course_competencies TO service_role;

GRANT SELECT ON TABLE public.course_competencies TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.courses TO service_role;

GRANT SELECT ON TABLE public.courses TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.enrollments TO service_role;

GRANT SELECT,INSERT ON TABLE public.enrollments TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.learning_resources TO anon;

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.learning_resources TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.learning_resources TO service_role;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.lesson_progress TO service_role;

GRANT SELECT,INSERT,UPDATE ON TABLE public.lesson_progress TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.lessons TO service_role;

GRANT SELECT ON TABLE public.lessons TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.modules TO service_role;

GRANT SELECT ON TABLE public.modules TO authenticated;
