-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    passing_score numeric(5,2) DEFAULT 60 NOT NULL,
    deadline timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessments_passing_score_check CHECK (((passing_score >= (0)::numeric) AND (passing_score <= (100)::numeric))),
    CONSTRAINT assessments_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text])))
);

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

CREATE TABLE public.assessment_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    question_text text NOT NULL,
    competency_id uuid,
    points numeric(8,2) DEFAULT 1 NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_questions_points_check CHECK ((points > (0)::numeric)),
    CONSTRAINT assessment_questions_position_check CHECK (("position" > 0))
);

CREATE TABLE public.question_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    "position" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT question_options_position_check CHECK (("position" > 0))
);

CREATE TABLE public.assessment_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_id uuid NOT NULL,
    trainee_id uuid NOT NULL,
    score numeric(8,2) DEFAULT 0 NOT NULL,
    percentage numeric(5,2) DEFAULT 0 NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assessment_attempts_percentage_check CHECK (((percentage >= (0)::numeric) AND (percentage <= (100)::numeric)))
);

-- 20260913000004_assessments_assignments.sql
-- Assessments, questions, options, attempts, answers, assignments, submissions, assessment/assignment functions

CREATE TABLE public.assessment_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL,
    selected_option_id uuid,
    is_correct boolean DEFAULT false NOT NULL,
    points_awarded numeric(8,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    module_id uuid,
    title text NOT NULL,
    description text NOT NULL,
    max_score numeric DEFAULT 100 NOT NULL,
    due_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assignments_description_not_blank CHECK ((length(TRIM(BOTH FROM description)) > 0)),
    CONSTRAINT assignments_max_score_positive CHECK ((max_score > (0)::numeric)),
    CONSTRAINT assignments_status_valid CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text]))),
    CONSTRAINT assignments_title_not_blank CHECK ((length(TRIM(BOTH FROM title)) > 0))
);

CREATE TABLE public.assignment_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid NOT NULL,
    trainee_id uuid NOT NULL,
    submission_text text,
    submission_url text,
    status text DEFAULT 'submitted'::text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    score numeric,
    feedback text,
    evaluated_by uuid,
    evaluated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT assignment_submission_has_content CHECK (((NULLIF(TRIM(BOTH FROM COALESCE(submission_text, ''::text)), ''::text) IS NOT NULL) OR (NULLIF(TRIM(BOTH FROM COALESCE(submission_url, ''::text)), ''::text) IS NOT NULL))),
    CONSTRAINT assignment_submission_status_valid CHECK ((status = ANY (ARRAY['submitted'::text, 'evaluated'::text, 'resubmission_required'::text])))
);

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_attempt_id_question_id_key UNIQUE (attempt_id, question_id);

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_assessment_id_position_key UNIQUE (assessment_id, "position");

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submission_unique UNIQUE (assignment_id, trainee_id);

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_question_id_position_key UNIQUE (question_id, "position");

CREATE INDEX assignment_submissions_assignment_idx ON public.assignment_submissions USING btree (assignment_id);

CREATE INDEX assignment_submissions_trainee_idx ON public.assignment_submissions USING btree (trainee_id);

CREATE INDEX assignments_course_idx ON public.assignments USING btree (course_id);

CREATE INDEX assignments_module_idx ON public.assignments USING btree (module_id);

CREATE INDEX assignments_status_idx ON public.assignments USING btree (status);

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.assessment_questions(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assessment_answers
    ADD CONSTRAINT assessment_answers_selected_option_id_fkey FOREIGN KEY (selected_option_id) REFERENCES public.question_options(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.assessment_questions(id) ON DELETE CASCADE;

CREATE FUNCTION private.close_trainer_assessment(p_assessment_id uuid) RETURNS void
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
    raise exception 'Unauthorized trainer';
  end if;

  update public.assessments a
  set
    status = 'closed',
    updated_at = now()
  from public.courses c
  where a.id = p_assessment_id
    and c.id = a.course_id
    and c.trainer_id = auth.uid()
    and a.status = 'published';

  if not found then
    raise exception 'Assessment not found or not closable';
  end if;
end;
$$;

CREATE FUNCTION private.create_trainer_assessment_question(p_assessment_id uuid, p_question_text text, p_competency_id uuid, p_points numeric, p_options jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_question_id uuid;
  v_course_id uuid;
  v_correct_count integer;
  v_option_count integer;
  v_position integer;
  v_option jsonb;
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
    raise exception 'Unauthorized trainer';
  end if;

  select a.course_id
  into v_course_id
  from public.assessments a
  join public.courses c
    on c.id = a.course_id
  where a.id = p_assessment_id
    and a.status = 'draft'
    and c.trainer_id = auth.uid();

  if v_course_id is null then
    raise exception 'Assessment not found or not editable';
  end if;

  if p_question_text is null
     or length(trim(p_question_text)) < 2 then
    raise exception 'Question text is required';
  end if;

  if p_points is null
     or p_points <= 0 then
    raise exception 'Points must be greater than zero';
  end if;

  if p_competency_id is not null
     and not exists (
       select 1
       from public.course_competencies cc
       where cc.course_id = v_course_id
         and cc.competency_id = p_competency_id
     ) then
    raise exception 'Competency is not mapped to this course';
  end if;

  if jsonb_typeof(p_options) <> 'array' then
    raise exception 'Options must be an array';
  end if;

  v_option_count :=
    jsonb_array_length(p_options);

  if v_option_count < 2
     or v_option_count > 6 then
    raise exception 'Question must have between 2 and 6 options';
  end if;

  select count(*)
  into v_correct_count
  from jsonb_array_elements(p_options) option_row
  where coalesce(
    (option_row ->> 'is_correct')::boolean,
    false
  ) = true;

  if v_correct_count <> 1 then
    raise exception 'Exactly one option must be correct';
  end if;

  select coalesce(
    max(q.position),
    0
  ) + 1
  into v_position
  from public.assessment_questions q
  where q.assessment_id = p_assessment_id;

  insert into public.assessment_questions (
    assessment_id,
    question_text,
    competency_id,
    points,
    position
  )
  values (
    p_assessment_id,
    trim(p_question_text),
    p_competency_id,
    p_points,
    v_position
  )
  returning id
  into v_question_id;

  for v_option in
    select value
    from jsonb_array_elements(p_options)
  loop
    if length(
      trim(
        coalesce(
          v_option ->> 'option_text',
          ''
        )
      )
    ) < 1 then
      raise exception 'Option text cannot be empty';
    end if;

    insert into public.question_options (
      question_id,
      option_text,
      is_correct,
      position
    )
    values (
      v_question_id,
      trim(
        v_option ->> 'option_text'
      ),
      (
        v_option ->> 'is_correct'
      )::boolean,
      (
        v_option ->> 'position'
      )::integer
    );
  end loop;

  return v_question_id;
end;
$$;

CREATE FUNCTION private.delete_trainer_assessment_question(p_question_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_assessment_id uuid;
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
    raise exception 'Unauthorized trainer';
  end if;

  select q.assessment_id
  into v_assessment_id
  from public.assessment_questions q
  join public.assessments a
    on a.id = q.assessment_id
  join public.courses c
    on c.id = a.course_id
  where q.id = p_question_id
    and a.status = 'draft'
    and c.trainer_id = auth.uid();

  if v_assessment_id is null then
    raise exception 'Question not found or not editable';
  end if;

  delete from public.question_options
  where question_id = p_question_id;

  delete from public.assessment_questions
  where id = p_question_id;
end;
$$;

CREATE FUNCTION private.get_trainer_assessment_analytics(p_course_id uuid) RETURNS TABLE(assessment_id uuid, title text, submitted_count bigint, average_percentage numeric, pass_rate numeric, highest_percentage numeric, lowest_percentage numeric)
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
    raise exception 'Unauthorized trainer';
  end if;

  if not exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.trainer_id = auth.uid()
  ) then
    raise exception 'Course not found or not assigned to trainer';
  end if;

  return query
  with latest_attempts as (
    select distinct on (
      aa.trainee_id,
      aa.assessment_id
    )
      aa.trainee_id,
      aa.assessment_id,
      aa.percentage,
      aa.passed,
      aa.submitted_at
    from public.assessment_attempts aa
    join public.assessments a
      on a.id = aa.assessment_id
    where a.course_id = p_course_id
      and aa.submitted_at is not null
    order by
      aa.trainee_id,
      aa.assessment_id,
      aa.submitted_at desc
  )

  select
    a.id,
    a.title,
    count(la.trainee_id),
    coalesce(
      round(avg(la.percentage), 2),
      0
    ),
    coalesce(
      round(
        (
          count(*) filter (
            where la.passed = true
          )::numeric
          /
          nullif(
            count(la.trainee_id),
            0
          )
        ) * 100,
        2
      ),
      0
    ),
    coalesce(
      max(la.percentage),
      0
    ),
    coalesce(
      min(la.percentage),
      0
    )
  from public.assessments a
  left join latest_attempts la
    on la.assessment_id = a.id
  where a.course_id = p_course_id
  group by
    a.id,
    a.title,
    a.created_at
  order by a.created_at desc;
end;
$$;

CREATE FUNCTION private.get_trainer_course_performance(p_course_id uuid) RETURNS TABLE(trainee_id uuid, full_name text, designation text, department text, progress_percentage numeric, assessments_completed bigint, average_percentage numeric, pass_rate numeric, latest_submission timestamp with time zone)
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
    raise exception 'Unauthorized trainer';
  end if;

  if not exists (
    select 1
    from public.courses c
    where c.id = p_course_id
      and c.trainer_id = auth.uid()
  ) then
    raise exception 'Course not found or not assigned to trainer';
  end if;

  return query
  with latest_attempts as (
    select distinct on (
      aa.trainee_id,
      aa.assessment_id
    )
      aa.trainee_id,
      aa.assessment_id,
      aa.percentage,
      aa.passed,
      aa.submitted_at
    from public.assessment_attempts aa
    join public.assessments a
      on a.id = aa.assessment_id
    where a.course_id = p_course_id
      and aa.submitted_at is not null
    order by
      aa.trainee_id,
      aa.assessment_id,
      aa.submitted_at desc
  ),

  trainee_stats as (
    select
      la.trainee_id,
      count(*) as assessments_completed,
      round(avg(la.percentage), 2) as average_percentage,
      round(
        (
          count(*) filter (
            where la.passed = true
          )::numeric
          /
          nullif(count(*), 0)
        ) * 100,
        2
      ) as pass_rate,
      max(la.submitted_at) as latest_submission
    from latest_attempts la
    group by la.trainee_id
  )

  select
    e.trainee_id,
    p.full_name,
    p.designation,
    p.department,
    e.progress_percentage,
    coalesce(ts.assessments_completed, 0),
    coalesce(ts.average_percentage, 0),
    coalesce(ts.pass_rate, 0),
    ts.latest_submission
  from public.enrollments e
  join public.profiles p
    on p.id = e.trainee_id
  left join trainee_stats ts
    on ts.trainee_id = e.trainee_id
where e.course_id = p_course_id
  and e.status in ('active', 'completed')
  order by p.full_name asc;
end;
$$;

CREATE FUNCTION private.reopen_trainer_assessment(p_assessment_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_deadline timestamptz;
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
    raise exception 'Unauthorized trainer';
  end if;

  select a.deadline
  into v_deadline
  from public.assessments a
  join public.courses c
    on c.id = a.course_id
  where a.id = p_assessment_id
    and c.trainer_id = auth.uid()
    and a.status = 'closed';

  if not found then
    raise exception 'Assessment not found or not reopenable';
  end if;

  if v_deadline is not null
     and v_deadline <= now()
  then
    raise exception 'Assessment deadline has already passed';
  end if;

  update public.assessments
  set
    status = 'published',
    updated_at = now()
  where id = p_assessment_id;
end;
$$;

CREATE FUNCTION private.submit_assignment(p_assignment_id uuid, p_submission_text text, p_submission_url text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid := auth.uid();
  v_submission_id uuid;
begin

  if v_user_id is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user_id
      and p.role = 'trainee'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Unauthorized';
  end if;

  if nullif(trim(coalesce(p_submission_text, '')), '') is null
     and nullif(trim(coalesce(p_submission_url, '')), '') is null
  then
    raise exception 'Submission is required';
  end if;

  if not exists (
    select 1
    from public.assignments a
    join public.enrollments e
      on e.course_id = a.course_id
    where a.id = p_assignment_id
      and a.status = 'published'
      and e.trainee_id = v_user_id
      and e.status = 'active'
      and (
        a.due_at is null
        or now() <= a.due_at
      )
  ) then
    raise exception 'Assignment unavailable';
  end if;

  insert into public.assignment_submissions (
    assignment_id,
    trainee_id,
    submission_text,
    submission_url,
    status,
    submitted_at
  )
  values (
    p_assignment_id,
    v_user_id,
    nullif(trim(coalesce(p_submission_text, '')), ''),
    nullif(trim(coalesce(p_submission_url, '')), ''),
    'submitted',
    now()
  )
  on conflict (assignment_id, trainee_id)
  do update set
    submission_text = excluded.submission_text,
    submission_url = excluded.submission_url,
    status = 'submitted',
    submitted_at = now(),
    score = null,
    feedback = null,
    evaluated_by = null,
    evaluated_at = null,
    updated_at = now()
  returning id into v_submission_id;

  return v_submission_id;

end;
$$;

CREATE FUNCTION private.trainer_evaluate_assignment(p_submission_id uuid, p_score numeric, p_feedback text, p_status text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_max_score numeric;
begin

  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  if p_status not in (
    'evaluated',
    'resubmission_required'
  ) then
    raise exception 'Invalid evaluation status';
  end if;

  select a.max_score
  into v_max_score
  from public.assignment_submissions s
  join public.assignments a
    on a.id = s.assignment_id
  join public.courses c
    on c.id = a.course_id
  join public.profiles p
    on p.id = auth.uid()
  where s.id = p_submission_id
    and c.trainer_id = auth.uid()
    and p.role = 'trainer'
    and p.is_active = true
    and p.is_approved = true;

  if v_max_score is null then
    raise exception 'Unauthorized or submission not found';
  end if;

  if p_status = 'evaluated'
     and (
       p_score is null
       or p_score < 0
       or p_score > v_max_score
     )
  then
    raise exception 'Invalid score';
  end if;

  update public.assignment_submissions
  set
    score =
      case
        when p_status = 'evaluated'
        then p_score
        else null
      end,

    feedback =
      nullif(trim(coalesce(p_feedback, '')), ''),

    status = p_status,

    evaluated_by = auth.uid(),
    evaluated_at = now(),
    updated_at = now()

  where id = p_submission_id;

end;
$$;

CREATE FUNCTION private.trainer_save_assignment(p_id uuid, p_course_id uuid, p_module_id uuid, p_title text, p_description text, p_max_score numeric, p_due_at timestamp with time zone, p_status text) RETURNS uuid
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
    join public.courses c
      on c.trainer_id = p.id
    where p.id = auth.uid()
      and p.role = 'trainer'
      and p.is_active = true
      and p.is_approved = true
      and c.id = p_course_id
  ) then
    raise exception 'Unauthorized';
  end if;

  if trim(coalesce(p_title, '')) = '' then
    raise exception 'Title is required';
  end if;

  if trim(coalesce(p_description, '')) = '' then
    raise exception 'Description is required';
  end if;

  if p_max_score <= 0 then
    raise exception 'Maximum score must be positive';
  end if;

  if p_status not in ('draft', 'published', 'closed') then
    raise exception 'Invalid assignment status';
  end if;

  if p_module_id is not null
     and not exists (
       select 1
       from public.modules m
       where m.id = p_module_id
         and m.course_id = p_course_id
     )
  then
    raise exception 'Module does not belong to course';
  end if;

  if p_id is null then

    insert into public.assignments (
      course_id,
      module_id,
      title,
      description,
      max_score,
      due_at,
      status,
      created_by
    )
    values (
      p_course_id,
      p_module_id,
      trim(p_title),
      trim(p_description),
      p_max_score,
      p_due_at,
      p_status,
      auth.uid()
    )
    returning id into v_id;

  else

    update public.assignments a
    set
      module_id = p_module_id,
      title = trim(p_title),
      description = trim(p_description),
      max_score = p_max_score,
      due_at = p_due_at,
      status = p_status,
      updated_at = now()
    where a.id = p_id
      and a.course_id = p_course_id
    returning a.id into v_id;

    if v_id is null then
      raise exception 'Assignment not found';
    end if;

  end if;

  return v_id;

end;
$$;

CREATE FUNCTION private.update_trainer_assessment_deadline(p_assessment_id uuid, p_deadline timestamp with time zone) RETURNS void
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
    raise exception 'Unauthorized trainer';
  end if;

  if p_deadline is not null
     and p_deadline <= now()
  then
    raise exception 'Deadline must be in the future';
  end if;

  update public.assessments a
  set
    deadline = p_deadline,
    updated_at = now()
  from public.courses c
  where a.id = p_assessment_id
    and c.id = a.course_id
    and c.trainer_id = auth.uid()
    and a.status in (
      'draft',
      'published'
    );

  if not found then
    raise exception 'Assessment not found or deadline cannot be changed';
  end if;
end;
$$;

CREATE FUNCTION public.get_trainer_course_performance(p_course_id uuid) RETURNS TABLE(trainee_id uuid, full_name text, designation text, department text, progress_percentage numeric, assessments_completed bigint, average_percentage numeric, pass_rate numeric, latest_submission timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.get_trainer_course_performance(
    p_course_id
  );
$$;

CREATE FUNCTION public.create_trainer_assessment_question(p_assessment_id uuid, p_question_text text, p_competency_id uuid, p_points numeric, p_options jsonb) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.create_trainer_assessment_question(
    p_assessment_id,
    p_question_text,
    p_competency_id,
    p_points,
    p_options
  );
$$;

CREATE FUNCTION public.delete_trainer_assessment_question(p_question_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.delete_trainer_assessment_question(
    p_question_id
  );
$$;

CREATE FUNCTION public.get_trainer_assessment_analytics(p_course_id uuid) RETURNS TABLE(assessment_id uuid, title text, submitted_count bigint, average_percentage numeric, pass_rate numeric, highest_percentage numeric, lowest_percentage numeric)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.get_trainer_assessment_analytics(
    p_course_id
  );
$$;

CREATE FUNCTION public.reopen_trainer_assessment(p_assessment_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.reopen_trainer_assessment(
    p_assessment_id
  );
$$;

CREATE FUNCTION public.submit_assignment(p_assignment_id uuid, p_submission_text text, p_submission_url text) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.submit_assignment(
    p_assignment_id,
    p_submission_text,
    p_submission_url
  );
$$;

CREATE FUNCTION public.trainer_evaluate_assignment(p_submission_id uuid, p_score numeric, p_feedback text, p_status text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.trainer_evaluate_assignment(
    p_submission_id,
    p_score,
    p_feedback,
    p_status
  );
$$;

CREATE FUNCTION public.trainer_save_assignment(p_id uuid, p_course_id uuid, p_module_id uuid, p_title text, p_description text, p_max_score numeric, p_due_at timestamp with time zone, p_status text) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.trainer_save_assignment(
    p_id,
    p_course_id,
    p_module_id,
    p_title,
    p_description,
    p_max_score,
    p_due_at,
    p_status
  );
$$;

CREATE FUNCTION public.update_trainer_assessment_deadline(p_assessment_id uuid, p_deadline timestamp with time zone) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.update_trainer_assessment_deadline(
    p_assessment_id,
    p_deadline
  );
$$;

-- Migration 004: Assessments, Question Options Security, Authoritative Scoring, Assignments & Evaluation

CREATE FUNCTION public.close_trainer_assessment(p_assessment_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.close_trainer_assessment(
    p_assessment_id
  );
$$;

ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainees can view available assignments" ON public.assignments FOR SELECT TO authenticated USING (((status = ANY (ARRAY['published'::text, 'closed'::text])) AND (EXISTS ( SELECT 1
   FROM (public.profiles p
     JOIN public.enrollments e ON ((e.trainee_id = p.id)))
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainee'::text) AND (p.is_active = true) AND (p.is_approved = true) AND (e.course_id = assignments.course_id) AND (e.status = ANY (ARRAY['active'::text, 'completed'::text])))))));

CREATE POLICY "Trainers can create draft assessments for assigned courses" ON public.assessments FOR INSERT TO authenticated WITH CHECK (((created_by = ( SELECT auth.uid() AS uid)) AND (status = 'draft'::text) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = assessments.course_id) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainer'::text) AND (p.is_approved = true) AND (p.is_active = true))))));

CREATE POLICY "Trainers can update own draft assessments" ON public.assessments FOR UPDATE TO authenticated USING (((status = 'draft'::text) AND (EXISTS ( SELECT 1
   FROM (public.courses c
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((c.id = assessments.course_id) AND (c.trainer_id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))))) WITH CHECK (((status = 'draft'::text) AND (EXISTS ( SELECT 1
   FROM (public.courses c
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((c.id = assessments.course_id) AND (c.trainer_id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true))))));

CREATE POLICY "Trainers can view assessments for assigned courses" ON public.assessments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.courses c
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((c.id = assessments.course_id) AND (c.trainer_id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))));

CREATE POLICY "Trainers can view assigned course assignments" ON public.assignments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.courses c
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((c.id = assignments.course_id) AND (c.trainer_id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))));

CREATE POLICY "Trainers can view assigned course submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM ((public.assignments a
     JOIN public.courses c ON ((c.id = a.course_id)))
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((a.id = assignment_submissions.assignment_id) AND (c.trainer_id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))));

CREATE POLICY "Trainers can view options for assigned course assessments" ON public.question_options FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (((public.assessment_questions q
     JOIN public.assessments a ON ((a.id = q.assessment_id)))
     JOIN public.courses c ON ((c.id = a.course_id)))
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((q.id = question_options.question_id) AND (c.trainer_id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))));

CREATE POLICY "Trainers can view questions for assigned course assessments" ON public.assessment_questions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM ((public.assessments a
     JOIN public.courses c ON ((c.id = a.course_id)))
     JOIN public.profiles p ON ((p.id = auth.uid())))
  WHERE ((a.id = assessment_questions.assessment_id) AND (c.trainer_id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))));

CREATE POLICY "Trainees can view available assessments" ON public.assessments FOR SELECT TO authenticated USING (((status = 'published'::text) AND ((deadline IS NULL) OR (deadline >= now())) AND (EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.course_id = assessments.course_id) AND (e.trainee_id = ( SELECT auth.uid() AS uid)) AND (e.status = 'active'::text))))));

CREATE POLICY "Trainees can view questions for available assessments" ON public.assessment_questions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.assessments a
     JOIN public.enrollments e ON ((e.course_id = a.course_id)))
  WHERE ((a.id = assessment_questions.assessment_id) AND (a.status = 'published'::text) AND ((a.deadline IS NULL) OR (a.deadline >= now())) AND (e.trainee_id = ( SELECT auth.uid() AS uid)) AND (e.status = 'active'::text)))));

CREATE POLICY "Trainees can view safe options for available assessments" ON public.question_options FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM ((public.assessment_questions q
     JOIN public.assessments a ON ((a.id = q.assessment_id)))
     JOIN public.enrollments e ON ((e.course_id = a.course_id)))
  WHERE ((q.id = question_options.question_id) AND (a.status = 'published'::text) AND ((a.deadline IS NULL) OR (a.deadline >= now())) AND (e.trainee_id = ( SELECT auth.uid() AS uid)) AND (e.status = 'active'::text)))));

CREATE POLICY "Trainees can view own assessment attempts" ON public.assessment_attempts FOR SELECT TO authenticated USING ((trainee_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Trainees can view own assignment submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING ((trainee_id = auth.uid()));

REVOKE ALL ON FUNCTION private.close_trainer_assessment(p_assessment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.close_trainer_assessment(p_assessment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.create_trainer_assessment_question(p_assessment_id uuid, p_question_text text, p_competency_id uuid, p_points numeric, p_options jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION private.create_trainer_assessment_question(p_assessment_id uuid, p_question_text text, p_competency_id uuid, p_points numeric, p_options jsonb) TO authenticated;

REVOKE ALL ON FUNCTION private.delete_trainer_assessment_question(p_question_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.delete_trainer_assessment_question(p_question_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.get_trainer_assessment_analytics(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_trainer_assessment_analytics(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.get_trainer_course_performance(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_trainer_course_performance(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.reopen_trainer_assessment(p_assessment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.reopen_trainer_assessment(p_assessment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.submit_assignment(p_assignment_id uuid, p_submission_text text, p_submission_url text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.submit_assignment(p_assignment_id uuid, p_submission_text text, p_submission_url text) TO authenticated;

REVOKE ALL ON FUNCTION private.trainer_evaluate_assignment(p_submission_id uuid, p_score numeric, p_feedback text, p_status text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.trainer_evaluate_assignment(p_submission_id uuid, p_score numeric, p_feedback text, p_status text) TO authenticated;

REVOKE ALL ON FUNCTION private.trainer_save_assignment(p_id uuid, p_course_id uuid, p_module_id uuid, p_title text, p_description text, p_max_score numeric, p_due_at timestamp with time zone, p_status text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.trainer_save_assignment(p_id uuid, p_course_id uuid, p_module_id uuid, p_title text, p_description text, p_max_score numeric, p_due_at timestamp with time zone, p_status text) TO authenticated;

REVOKE ALL ON FUNCTION private.update_trainer_assessment_deadline(p_assessment_id uuid, p_deadline timestamp with time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION private.update_trainer_assessment_deadline(p_assessment_id uuid, p_deadline timestamp with time zone) TO authenticated;

REVOKE ALL ON FUNCTION public.close_trainer_assessment(p_assessment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.close_trainer_assessment(p_assessment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.create_trainer_assessment_question(p_assessment_id uuid, p_question_text text, p_competency_id uuid, p_points numeric, p_options jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.create_trainer_assessment_question(p_assessment_id uuid, p_question_text text, p_competency_id uuid, p_points numeric, p_options jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_trainer_assessment_question(p_question_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.delete_trainer_assessment_question(p_question_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_trainer_assessment_analytics(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_trainer_assessment_analytics(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_trainer_course_performance(p_course_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_trainer_course_performance(p_course_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.reopen_trainer_assessment(p_assessment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.reopen_trainer_assessment(p_assessment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.submit_assignment(p_assignment_id uuid, p_submission_text text, p_submission_url text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.submit_assignment(p_assignment_id uuid, p_submission_text text, p_submission_url text) TO authenticated;

REVOKE ALL ON FUNCTION public.trainer_evaluate_assignment(p_submission_id uuid, p_score numeric, p_feedback text, p_status text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.trainer_evaluate_assignment(p_submission_id uuid, p_score numeric, p_feedback text, p_status text) TO authenticated;

REVOKE ALL ON FUNCTION public.trainer_save_assignment(p_id uuid, p_course_id uuid, p_module_id uuid, p_title text, p_description text, p_max_score numeric, p_due_at timestamp with time zone, p_status text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.trainer_save_assignment(p_id uuid, p_course_id uuid, p_module_id uuid, p_title text, p_description text, p_max_score numeric, p_due_at timestamp with time zone, p_status text) TO authenticated;

REVOKE ALL ON FUNCTION public.update_trainer_assessment_deadline(p_assessment_id uuid, p_deadline timestamp with time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION public.update_trainer_assessment_deadline(p_assessment_id uuid, p_deadline timestamp with time zone) TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.assessment_answers TO service_role;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.assessment_attempts TO service_role;

GRANT SELECT ON TABLE public.assessment_attempts TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.assessment_questions TO service_role;

GRANT SELECT ON TABLE public.assessment_questions TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.assessments TO service_role;

GRANT SELECT ON TABLE public.assessments TO authenticated;

GRANT INSERT(course_id) ON TABLE public.assessments TO authenticated;

GRANT INSERT(title),UPDATE(title) ON TABLE public.assessments TO authenticated;

GRANT INSERT(description),UPDATE(description) ON TABLE public.assessments TO authenticated;

GRANT INSERT(passing_score),UPDATE(passing_score) ON TABLE public.assessments TO authenticated;

GRANT INSERT(deadline),UPDATE(deadline) ON TABLE public.assessments TO authenticated;

GRANT INSERT(status) ON TABLE public.assessments TO authenticated;

GRANT INSERT(created_by) ON TABLE public.assessments TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.assignment_submissions TO service_role;

GRANT SELECT ON TABLE public.assignment_submissions TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.assignments TO service_role;

GRANT SELECT ON TABLE public.assignments TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.question_options TO service_role;

GRANT SELECT(id) ON TABLE public.question_options TO authenticated;

GRANT SELECT(question_id) ON TABLE public.question_options TO authenticated;

GRANT SELECT(option_text) ON TABLE public.question_options TO authenticated;

GRANT SELECT("position") ON TABLE public.question_options TO authenticated;

REVOKE ALL ON TABLE public.question_options FROM authenticated;

GRANT SELECT(id, question_id, option_text, position) ON TABLE public.question_options TO authenticated;

REVOKE ALL ON TABLE public.assessment_answers FROM authenticated;

REVOKE ALL ON TABLE public.assessment_answers FROM anon;
