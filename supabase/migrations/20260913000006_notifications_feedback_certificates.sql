-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    entity_type text,
    entity_id uuid,
    action_url text,
    priority text DEFAULT 'normal'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['course_assignment'::text, 'assessment_published'::text, 'assessment_deadline'::text, 'course_completed'::text, 'development_plan'::text, 'announcement'::text, 'system'::text])))
);

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    audience_type text DEFAULT 'all'::text NOT NULL,
    organizational_unit_id uuid,
    priority text DEFAULT 'normal'::text NOT NULL,
    action_url text,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT announcements_audience_valid CHECK ((audience_type = ANY (ARRAY['all'::text, 'trainees'::text, 'trainers'::text, 'organizational_unit'::text]))),
    CONSTRAINT announcements_message_not_blank CHECK ((length(TRIM(BOTH FROM message)) > 0)),
    CONSTRAINT announcements_priority_valid CHECK ((priority = ANY (ARRAY['normal'::text, 'important'::text, 'urgent'::text]))),
    CONSTRAINT announcements_status_valid CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT announcements_title_not_blank CHECK ((length(TRIM(BOTH FROM title)) > 0)),
    CONSTRAINT announcements_unit_required CHECK (((audience_type <> 'organizational_unit'::text) OR (organizational_unit_id IS NOT NULL)))
);

-- 20260913000006_notifications_feedback_certificates.sql
-- Notifications, announcements, course feedback, certificates, certificate detail, verify certificate, reports

CREATE TABLE public.course_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainee_id uuid NOT NULL,
    course_id uuid NOT NULL,
    trainer_id uuid,
    course_rating integer NOT NULL,
    trainer_rating integer,
    comments text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_feedback_course_rating_check CHECK (((course_rating >= 1) AND (course_rating <= 5))),
    CONSTRAINT course_feedback_trainer_rating_check CHECK (((trainer_rating IS NULL) OR ((trainer_rating >= 1) AND (trainer_rating <= 5))))
);

CREATE TABLE public.certificates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainee_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    certificate_number text NOT NULL,
    verification_code text NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    revocation_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_number_key UNIQUE (certificate_number);

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_trainee_id_course_id_key UNIQUE (trainee_id, course_id);

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_verification_code_key UNIQUE (verification_code);

ALTER TABLE ONLY public.course_feedback
    ADD CONSTRAINT course_feedback_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.course_feedback
    ADD CONSTRAINT course_feedback_trainee_id_course_id_key UNIQUE (trainee_id, course_id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

CREATE INDEX announcements_published_idx ON public.announcements USING btree (published_at DESC);

CREATE INDEX announcements_status_idx ON public.announcements USING btree (status);

CREATE INDEX announcements_unit_idx ON public.announcements USING btree (organizational_unit_id);

CREATE INDEX certificates_course_id_idx ON public.certificates USING btree (course_id);

CREATE INDEX certificates_trainee_id_idx ON public.certificates USING btree (trainee_id);

CREATE INDEX certificates_verification_code_idx ON public.certificates USING btree (verification_code);

CREATE INDEX course_feedback_course_id_idx ON public.course_feedback USING btree (course_id);

CREATE INDEX course_feedback_trainer_id_idx ON public.course_feedback USING btree (trainer_id);

CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at DESC);

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);

CREATE INDEX notifications_user_unread_idx ON public.notifications USING btree (user_id, is_read);

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_organizational_unit_id_fkey FOREIGN KEY (organizational_unit_id) REFERENCES public.organizational_units(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.course_feedback
    ADD CONSTRAINT course_feedback_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.course_feedback
    ADD CONSTRAINT course_feedback_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.course_feedback
    ADD CONSTRAINT course_feedback_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

CREATE FUNCTION private.issue_course_certificate(p_enrollment_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();

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
    raise exception 'Unauthorized trainee';
  end if;

  if not exists (
    select 1
    from public.enrollments e
    where e.id = p_enrollment_id
      and e.trainee_id = v_user_id
  ) then
    raise exception 'Enrollment not found';
  end if;

  return private.issue_certificate_for_enrollment(
    p_enrollment_id
  );
end;
$$;

CREATE FUNCTION private.mark_lesson_complete(p_enrollment_id uuid, p_lesson_id uuid) RETURNS numeric
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid;
  v_total_required integer;
  v_completed_required integer;
  v_progress numeric;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Unauthenticated';
  end if;

  /*
   * Verify that:
   * - this enrollment belongs to the current user
   * - the enrollment is active
   * - the lesson belongs to the enrolled course
   */
  if not exists (
    select 1
    from public.enrollments e
    join public.modules m
      on m.course_id = e.course_id
    join public.lessons l
      on l.module_id = m.id
    where e.id = p_enrollment_id
      and e.trainee_id = v_user_id
      and e.status = 'active'
      and l.id = p_lesson_id
  ) then
    raise exception 'Unauthorized lesson';
  end if;

  /*
   * Mark lesson complete.
   * Idempotent: completing the same lesson again
   * does not create another progress row.
   */
  insert into public.lesson_progress (
    enrollment_id,
    lesson_id,
    is_completed,
    completed_at,
    updated_at
  )
  values (
    p_enrollment_id,
    p_lesson_id,
    true,
    now(),
    now()
  )
  on conflict (enrollment_id, lesson_id)
  do update set
    is_completed = true,
    completed_at = coalesce(
      public.lesson_progress.completed_at,
      now()
    ),
    updated_at = now();

  /*
   * Count all required lessons belonging
   * to this enrollment's course.
   */
  select count(*)
  into v_total_required
  from public.lessons l
  join public.modules m
    on m.id = l.module_id
  join public.enrollments e
    on e.course_id = m.course_id
  where e.id = p_enrollment_id
    and l.is_required = true;

  /*
   * Count required lessons that the learner
   * has completed.
   */
  select count(*)
  into v_completed_required
  from public.lesson_progress lp
  join public.lessons l
    on l.id = lp.lesson_id
  join public.modules m
    on m.id = l.module_id
  join public.enrollments e
    on e.id = lp.enrollment_id
    and e.course_id = m.course_id
  where lp.enrollment_id = p_enrollment_id
    and lp.is_completed = true
    and l.is_required = true;

  /*
   * Calculate progress.
   */
  if v_total_required = 0 then
    v_progress := 0;
  else
    v_progress :=
      round(
        (
          v_completed_required::numeric
          /
          v_total_required::numeric
        ) * 100,
        2
      );
  end if;

  /*
   * Update enrollment.
   *
   * When progress reaches 100:
   * active -> completed
   * completed_at -> now()
   */
  update public.enrollments
  set
    progress_percentage = v_progress,

    status = case
      when v_progress >= 100
        then 'completed'
      else status
    end,

    completed_at = case
      when v_progress >= 100
        then coalesce(completed_at, now())
      else completed_at
    end,

    updated_at = now()

  where id = p_enrollment_id
    and trainee_id = v_user_id
    and status = 'active';

  /*
   * Certificate must only be issued
   * after enrollment has become completed.
   */
  if v_progress >= 100 then
    perform private.issue_certificate_for_enrollment(
      p_enrollment_id
    );
  end if;

  return v_progress;
end;
$$;

CREATE FUNCTION private.publish_trainer_assessment(p_assessment_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_course_id uuid;
  v_course_title text;
  v_assessment_title text;
  v_question_count integer;
  v_trainee record;
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

  select
    a.course_id,
    a.title,
    c.title
  into
    v_course_id,
    v_assessment_title,
    v_course_title
  from public.assessments a
  join public.courses c
    on c.id = a.course_id
  where a.id = p_assessment_id
    and a.status = 'draft'
    and c.trainer_id = auth.uid();

  if v_course_id is null then
    raise exception 'Assessment not found or not publishable';
  end if;

  select count(*)
  into v_question_count
  from public.assessment_questions q
  where q.assessment_id = p_assessment_id;

  if v_question_count < 1 then
    raise exception 'Assessment must contain at least one question';
  end if;

  if exists (
    select 1
    from public.assessment_questions q
    where q.assessment_id = p_assessment_id
      and (
        select count(*)
        from public.question_options o
        where o.question_id = q.id
      ) < 2
  ) then
    raise exception 'Every question must contain at least two options';
  end if;

  if exists (
    select 1
    from public.assessment_questions q
    where q.assessment_id = p_assessment_id
      and (
        select count(*)
        from public.question_options o
        where o.question_id = q.id
          and o.is_correct = true
      ) <> 1
  ) then
    raise exception 'Every question must have exactly one correct option';
  end if;

  if exists (
    select 1
    from public.assessment_questions q
    where q.assessment_id = p_assessment_id
      and q.competency_id is not null
      and not exists (
        select 1
        from public.course_competencies cc
        where cc.course_id = v_course_id
          and cc.competency_id = q.competency_id
      )
  ) then
    raise exception
      'One or more question competencies are invalid for this course';
  end if;

  update public.assessments
  set
    status = 'published',
    updated_at = now()
  where id = p_assessment_id;

  /*
   * Notify every currently relevant enrolled trainee.
   */
  for v_trainee in
    select distinct e.trainee_id
    from public.enrollments e
    join public.profiles p
      on p.id = e.trainee_id
    where e.course_id = v_course_id
      and e.status in ('active', 'completed')
      and p.role = 'trainee'
      and p.is_active = true
      and p.is_approved = true
  loop
    perform private.create_notification(
      v_trainee.trainee_id,
      'assessment_published',
      'New assessment published',
      format(
        '%s has been published for %s.',
        v_assessment_title,
        v_course_title
      ),
      'assessment',
      p_assessment_id,
      '/trainee/assessments',
      'high'
    );
  end loop;
end;
$$;

CREATE FUNCTION private.create_development_plan(p_title text, p_target_date date, p_items jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_item jsonb;

  v_competency_id uuid;
  v_course_id uuid;
  v_trainer_id uuid;

  v_current numeric;
  v_target numeric;
  v_gap numeric;

  v_priority text;

  v_course_score numeric;
  v_trainer_score numeric;

  v_sequence integer;
  v_rationale text;
begin
  v_user_id := auth.uid();

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
    raise exception 'Unauthorized trainee';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'Plan title is required';
  end if;

  if p_target_date is not null
     and p_target_date < current_date
  then
    raise exception 'Target date cannot be in the past';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
  then
    raise exception 'Development plan requires at least one item';
  end if;

  -- Only one active system plan at a time.
  if exists (
    select 1
    from public.development_plans dp
    where dp.trainee_id = v_user_id
      and dp.status = 'active'
  ) then
    raise exception 'An active development plan already exists';
  end if;

  insert into public.development_plans (
    trainee_id,
    title,
    status,
    source,
    start_date,
    target_date
  )
  values (
    v_user_id,
    trim(p_title),
    'active',
    'system',
    current_date,
    p_target_date
  )
  returning id
  into v_plan_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop

    v_competency_id :=
      nullif(
        v_item ->> 'competencyId',
        ''
      )::uuid;

    v_course_id :=
      nullif(
        v_item ->> 'recommendedCourseId',
        ''
      )::uuid;

    v_trainer_id :=
      nullif(
        v_item ->> 'recommendedTrainerId',
        ''
      )::uuid;

    v_current :=
      (v_item ->> 'currentScore')::numeric;

    v_target :=
      (v_item ->> 'targetScore')::numeric;

    v_gap :=
      (v_item ->> 'gapScore')::numeric;

    v_priority :=
      v_item ->> 'priority';

    v_course_score :=
      nullif(
        v_item ->> 'courseRecommendationScore',
        ''
      )::numeric;

    v_trainer_score :=
      nullif(
        v_item ->> 'trainerMatchScore',
        ''
      )::numeric;

    v_sequence :=
      (v_item ->> 'sequenceOrder')::integer;

    v_rationale :=
      nullif(
        trim(v_item ->> 'rationale'),
        ''
      );

    if not exists (
      select 1
      from public.competencies c
      where c.id = v_competency_id
        and c.is_active = true
    ) then
      raise exception 'Invalid competency';
    end if;

    /*
     * Verify the snapshot still corresponds to the
     * trainee's current active gap.
     */
    if not exists (
      select 1
      from public.skill_gaps sg
      where sg.trainee_id = v_user_id
        and sg.competency_id = v_competency_id
        and sg.status <> 'resolved'
        and sg.gap_score > 0

        and sg.current_score = v_current
        and sg.target_score = v_target
        and sg.gap_score = v_gap
        and sg.priority = v_priority
    ) then
      raise exception
        'Competency gap changed. Refresh recommendations before creating plan.';
    end if;

    if v_course_id is not null then
      if not exists (
        select 1
        from public.courses c
        join public.course_competencies cc
          on cc.course_id = c.id
        where c.id = v_course_id
          and c.status = 'published'
          and cc.competency_id = v_competency_id
      ) then
        raise exception
          'Recommended course is not valid for competency';
      end if;
    end if;

    if v_trainer_id is not null then
      if not exists (
        select 1
        from public.profiles p
        join public.trainer_competencies tc
          on tc.trainer_id = p.id
        where p.id = v_trainer_id
          and p.role = 'trainer'
          and p.is_active = true
          and p.is_approved = true
          and tc.competency_id = v_competency_id
          and tc.verified = true
      ) then
        raise exception
          'Recommended trainer is not valid for competency';
      end if;
    end if;

    insert into public.development_plan_items (
      plan_id,
      competency_id,
      recommended_course_id,
      recommended_trainer_id,

      current_score_snapshot,
      target_score_snapshot,
      gap_score_snapshot,
      priority,

      course_recommendation_score,
      trainer_match_score,

      sequence_order,
      status,
      rationale
    )
    values (
      v_plan_id,
      v_competency_id,
      v_course_id,
      v_trainer_id,

      v_current,
      v_target,
      v_gap,
      v_priority,

      v_course_score,
      v_trainer_score,

      v_sequence,
      'pending',
      v_rationale
    );

  end loop;

  perform private.create_notification(
    v_user_id,
    'development_plan',
    'Development plan ready',
    'Your personalized competency-development plan is ready to review.',
    'development_plan',
    v_plan_id,
    '/trainee/development-plan',
    'high'
  );

  return v_plan_id;
end;
$$;

CREATE FUNCTION private.refresh_development_plan() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_plan_completed boolean := false;
begin
  v_user_id := auth.uid();

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
    raise exception 'Unauthorized trainee';
  end if;

  select dp.id
  into v_plan_id
  from public.development_plans dp
  where dp.trainee_id = v_user_id
    and dp.status = 'active'
  order by dp.created_at desc
  limit 1;

  if v_plan_id is null then
    raise exception 'No active development plan found';
  end if;

  update public.development_plan_items dpi
  set
    latest_current_score = coalesce(
      uc.current_score,
      dpi.current_score_snapshot
    ),

    latest_gap_score = greatest(
      coalesce(
        uc.target_score,
        dpi.target_score_snapshot
      )
      -
      coalesce(
        uc.current_score,
        dpi.current_score_snapshot
      ),
      0
    ),

    latest_priority =
      case
        when greatest(
          coalesce(
            uc.target_score,
            dpi.target_score_snapshot
          )
          -
          coalesce(
            uc.current_score,
            dpi.current_score_snapshot
          ),
          0
        ) >= 35
        then 'critical'

        when greatest(
          coalesce(
            uc.target_score,
            dpi.target_score_snapshot
          )
          -
          coalesce(
            uc.current_score,
            dpi.current_score_snapshot
          ),
          0
        ) >= 20
        then 'high'

        when greatest(
          coalesce(
            uc.target_score,
            dpi.target_score_snapshot
          )
          -
          coalesce(
            uc.current_score,
            dpi.current_score_snapshot
          ),
          0
        ) >= 10
        then 'medium'

        else 'low'
      end,

    last_evaluated_at = now(),
    updated_at = now()

  from public.user_competencies uc

  where dpi.plan_id = v_plan_id
    and uc.user_id = v_user_id
    and uc.competency_id = dpi.competency_id;

  /*
   * Competency target reached:
   * automatically complete relevant item.
   */
  update public.development_plan_items
  set
    status = 'completed',
    completed_at = coalesce(
      completed_at,
      now()
    ),
    updated_at = now()
  where plan_id = v_plan_id
    and coalesce(
      latest_gap_score,
      gap_score_snapshot
    ) <= 0
    and status not in (
      'completed',
      'skipped'
    );

  /*
   * Complete plan if every item is terminal.
   */
  if not exists (
    select 1
    from public.development_plan_items dpi
    where dpi.plan_id = v_plan_id
      and dpi.status not in (
        'completed',
        'skipped'
      )
  ) then

    update public.development_plans
    set
      status = 'completed',
      completed_at = coalesce(
        completed_at,
        now()
      ),
      updated_at = now()
    where id = v_plan_id
      and status = 'active';

    v_plan_completed := found;
  end if;

  if v_plan_completed then
    perform private.create_notification(
      v_user_id,
      'development_plan',
      'Development plan completed',
      'Your latest competency results have completed your development plan.',
      'development_plan',
      v_plan_id,
      '/trainee/development-plan',
      'normal'
    );
  end if;
end;
$$;

CREATE FUNCTION private.update_development_plan_item_status(p_item_id uuid, p_status text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_plan_completed boolean := false;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Unauthenticated';
  end if;

  if p_status not in (
    'pending',
    'in_progress',
    'completed',
    'skipped'
  ) then
    raise exception 'Invalid plan item status';
  end if;

  select dpi.plan_id
  into v_plan_id
  from public.development_plan_items dpi
  join public.development_plans dp
    on dp.id = dpi.plan_id
  where dpi.id = p_item_id
    and dp.trainee_id = v_user_id
    and dp.status = 'active';

  if v_plan_id is null then
    raise exception 'Development plan item not found';
  end if;

  update public.development_plan_items
  set
    status = p_status,

    started_at =
      case
        when p_status = 'in_progress'
          and started_at is null
        then now()
        else started_at
      end,

    completed_at =
      case
        when p_status = 'completed'
          then now()

        when p_status <> 'completed'
          then null

        else completed_at
      end,

    updated_at = now()

  where id = p_item_id;

  if not exists (
    select 1
    from public.development_plan_items dpi
    where dpi.plan_id = v_plan_id
      and dpi.status not in (
        'completed',
        'skipped'
      )
  ) then

    update public.development_plans
    set
      status = 'completed',
      completed_at = coalesce(
        completed_at,
        now()
      ),
      updated_at = now()
    where id = v_plan_id
      and status = 'active';

    v_plan_completed := found;
  end if;

  if v_plan_completed then
    perform private.create_notification(
      v_user_id,
      'development_plan',
      'Development plan completed',
      'You completed your personalized competency-development plan.',
      'development_plan',
      v_plan_id,
      '/trainee/development-plan',
      'normal'
    );
  end if;
end;
$$;

CREATE FUNCTION private.admin_feedback_overview() RETURNS TABLE(trainer_id uuid, trainer_name text, trainer_email text, feedback_count bigint, average_trainer_rating numeric, average_course_rating numeric)
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
    t.id,
    coalesce(
      nullif(trim(t.full_name), ''),
      'Unnamed Trainer'
    ),
    t.email,

    count(f.id)::bigint,

    round(
      avg(f.trainer_rating)
        filter (
          where f.trainer_rating is not null
        ),
      2
    ),

    round(
      avg(f.course_rating),
      2
    )

  from public.profiles t

  left join public.course_feedback f
    on f.trainer_id = t.id

  where t.role = 'trainer'
    and t.is_active = true
    and t.is_approved = true

  group by
    t.id,
    t.full_name,
    t.email

  order by
    average_trainer_rating desc nulls last,
    feedback_count desc,
    t.full_name asc;
end;
$$;

CREATE FUNCTION private.admin_list_certificates() RETURNS TABLE(certificate_id uuid, certificate_number text, trainee_id uuid, trainee_name text, course_id uuid, course_title text, issued_at timestamp with time zone, revoked_at timestamp with time zone, revocation_reason text)
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
    cert.id,
    cert.certificate_number,

    p.id,
    coalesce(
      nullif(trim(p.full_name), ''),
      'Unnamed Learner'
    ),

    c.id,
    c.title,

    cert.issued_at,

    cert.revoked_at,
    cert.revocation_reason

  from public.certificates cert

  join public.profiles p
    on p.id = cert.trainee_id

  join public.courses c
    on c.id = cert.course_id

  order by cert.issued_at desc;
end;
$$;

CREATE FUNCTION private.admin_revoke_certificate(p_certificate_id uuid, p_reason text) RETURNS void
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

  if nullif(trim(p_reason), '') is null then
    raise exception 'Revocation reason is required';
  end if;

  update public.certificates
  set
    revoked_at = now(),
    revocation_reason = trim(p_reason)
  where id = p_certificate_id
    and revoked_at is null;

  if not found then
    raise exception 'Certificate not found or already revoked';
  end if;
end;
$$;

CREATE FUNCTION private.admin_save_announcement(p_id uuid, p_title text, p_message text, p_audience_type text, p_organizational_unit_id uuid, p_priority text, p_action_url text, p_status text, p_expires_at timestamp with time zone) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$

declare

  v_id uuid;

  v_publish_time timestamptz;

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


  if trim(coalesce(p_title, '')) = '' then
    raise exception 'Title is required';
  end if;


  if trim(coalesce(p_message, '')) = '' then
    raise exception 'Message is required';
  end if;


  if p_audience_type not in (
    'all',
    'trainees',
    'trainers',
    'organizational_unit'
  ) then

    raise exception 'Invalid audience';

  end if;


  if p_priority not in (
    'normal',
    'important',
    'urgent'
  ) then

    raise exception 'Invalid priority';

  end if;


  if p_status not in (
    'draft',
    'published',
    'archived'
  ) then

    raise exception 'Invalid status';

  end if;


  if p_audience_type = 'organizational_unit'
     and p_organizational_unit_id is null
  then

    raise exception
      'Organizational unit is required';

  end if;


  v_publish_time :=
    case
      when p_status = 'published'
        then now()
      else null
    end;


  if p_id is null then

    insert into public.announcements (

      title,
      message,
      audience_type,
      organizational_unit_id,
      priority,
      action_url,
      status,
      published_at,
      expires_at,
      created_by

    )

    values (

      trim(p_title),
      trim(p_message),
      p_audience_type,

      case
        when p_audience_type =
             'organizational_unit'
        then p_organizational_unit_id
        else null
      end,

      p_priority,

      nullif(
        trim(coalesce(p_action_url, '')),
        ''
      ),

      p_status,

      v_publish_time,

      p_expires_at,

      auth.uid()

    )

    returning id
    into v_id;


  else

    update public.announcements

    set

      title =
        trim(p_title),

      message =
        trim(p_message),

      audience_type =
        p_audience_type,

      organizational_unit_id =
        case
          when p_audience_type =
               'organizational_unit'
          then p_organizational_unit_id
          else null
        end,

      priority =
        p_priority,

      action_url =
        nullif(
          trim(coalesce(p_action_url, '')),
          ''
        ),

      status =
        p_status,

      published_at =
        case

          when p_status = 'published'
               and announcements.published_at
                   is null
          then now()

          when p_status = 'published'
          then announcements.published_at

          else null

        end,

      expires_at =
        p_expires_at,

      updated_at =
        now()

    where announcements.id = p_id

    returning announcements.id
    into v_id;


    if v_id is null then
      raise exception 'Announcement not found';
    end if;

  end if;


  return v_id;

end;

$$;

CREATE FUNCTION private.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_entity_type text DEFAULT NULL::text, p_entity_id uuid DEFAULT NULL::uuid, p_action_url text DEFAULT NULL::text, p_priority text DEFAULT 'normal'::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_notification_id uuid;
begin
  if p_user_id is null then
    raise exception 'Notification user is required';
  end if;

  if p_type not in (
    'course_assignment',
    'assessment_published',
    'assessment_deadline',
    'course_completed',
    'development_plan',
    'announcement',
    'system'
  ) then
    raise exception 'Invalid notification type';
  end if;

  if p_priority not in (
    'low',
    'normal',
    'high',
    'urgent'
  ) then
    raise exception 'Invalid notification priority';
  end if;

  if nullif(trim(p_title), '') is null then
    raise exception 'Notification title is required';
  end if;

  if nullif(trim(p_message), '') is null then
    raise exception 'Notification message is required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.is_active = true
  ) then
    raise exception 'Notification recipient not found';
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    entity_type,
    entity_id,
    action_url,
    priority
  )
  values (
    p_user_id,
    p_type,
    trim(p_title),
    trim(p_message),
    nullif(trim(p_entity_type), ''),
    p_entity_id,
    nullif(trim(p_action_url), ''),
    p_priority
  )
  returning id
  into v_notification_id;

  return v_notification_id;
end;
$$;

CREATE FUNCTION private.get_my_competency_passport() RETURNS TABLE(competency_id uuid, competency_name text, competency_category text, competency_description text, current_score numeric, target_score numeric, gap_score numeric, proficiency_band text, assessment_evidence_count bigint, latest_assessment_percentage numeric, latest_assessment_at timestamp with time zone, score_history_count bigint, previous_score numeric, improvement numeric, last_score_update timestamp with time zone, certificate_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid := auth.uid();
begin

  -- -------------------------------------------------------
  -- 1. Authentication
  -- -------------------------------------------------------

  if v_user_id is null then
    raise exception 'Unauthenticated';
  end if;


  -- -------------------------------------------------------
  -- 2. Only approved + active trainees may use passport
  -- -------------------------------------------------------

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


  return query

  with

  -- =======================================================
  -- COMPETENCY SET
  --
  -- Include:
  -- A. competencies already recorded for this trainee
  -- B. competencies required by their job role
  --
  -- This means an unassessed required competency still
  -- appears in the passport with current score = 0.
  -- =======================================================

  competency_set as (

    select uc.competency_id
    from public.user_competencies uc
    where uc.user_id = v_user_id

    union

    select jrc.competency_id
    from public.profiles p
    join public.job_role_competencies jrc
      on jrc.job_role_id = p.job_role_id
    where p.id = v_user_id

  ),


  -- =======================================================
  -- MOST RECENT COMPETENCY HISTORY
  -- =======================================================

  latest_history as (

    select distinct on (h.competency_id)

      h.competency_id,
      h.previous_score,
      h.new_score,
      h.created_at

    from public.competency_score_history h

    where h.user_id = v_user_id

    order by
      h.competency_id,
      h.created_at desc

  ),


  -- =======================================================
  -- HISTORY COUNT
  -- =======================================================

  history_counts as (

    select
      h.competency_id,
      count(*)::bigint as evidence_count

    from public.competency_score_history h

    where h.user_id = v_user_id

    group by h.competency_id

  ),


  -- =======================================================
  -- ASSESSMENT EVIDENCE
  -- =======================================================

  assessment_evidence as (

    select
      cc.competency_id,

      count(
        distinct aa.id
      ) filter (
        where aa.submitted_at is not null
      )::bigint as assessment_count,

      (
        array_agg(
          aa.percentage
          order by aa.submitted_at desc
        )
        filter (
          where aa.submitted_at is not null
        )
      )[1] as latest_percentage,

      max(
        aa.submitted_at
      ) as latest_submitted_at

    from public.course_competencies cc

    join public.assessments a
      on a.course_id = cc.course_id

    join public.assessment_attempts aa
      on aa.assessment_id = a.id
     and aa.trainee_id = v_user_id

    group by cc.competency_id

  ),


  -- =======================================================
  -- CERTIFICATE EVIDENCE
  -- =======================================================

  certificate_evidence as (

    select

      cc.competency_id,

      count(
        distinct cert.id
      )::bigint as certificate_count

    from public.certificates cert

    join public.course_competencies cc
      on cc.course_id = cert.course_id

    where cert.trainee_id = v_user_id
      and cert.revoked_at is null

    group by cc.competency_id

  )


  -- =======================================================
  -- FINAL PASSPORT
  -- =======================================================

  select

    c.id,
    c.name,
    c.category,
    c.description,


    -- Current competency.
    -- If required by role but never assessed, show 0.

    coalesce(
      uc.current_score,
      0
    )::numeric,


    -- IMPORTANT:
    -- target now comes from our authoritative resolver:
    --
    -- job-role requirement
    --        ↓
    -- individual target
    --        ↓
    -- default competency target

    private.get_effective_competency_target(
      v_user_id,
      c.id
    )::numeric,


    -- Skill gap

    greatest(

      private.get_effective_competency_target(
        v_user_id,
        c.id
      )

      -

      coalesce(
        uc.current_score,
        0
      ),

      0

    )::numeric,


    -- Proficiency band

    case

      when coalesce(
        uc.current_score,
        0
      ) >= 80
        then 'Advanced'

      when coalesce(
        uc.current_score,
        0
      ) >= 60
        then 'Proficient'

      when coalesce(
        uc.current_score,
        0
      ) >= 40
        then 'Developing'

      else 'Beginner'

    end,


    -- Assessment evidence

    coalesce(
      ae.assessment_count,
      0
    ),


    ae.latest_percentage,

    ae.latest_submitted_at,


    -- Competency score history

    coalesce(
      hc.evidence_count,
      0
    ),


    lh.previous_score,


    case

      when lh.previous_score is null
        then null

      else (
        lh.new_score
        -
        lh.previous_score
      )::numeric

    end,


    coalesce(
      lh.created_at,
      uc.last_updated_at
    ),


    -- Certificates

    coalesce(
      ce.certificate_count,
      0
    )


  from competency_set cs


  join public.competencies c
    on c.id = cs.competency_id


  left join public.user_competencies uc
    on uc.user_id = v_user_id
   and uc.competency_id = c.id


  left join latest_history lh
    on lh.competency_id = c.id


  left join history_counts hc
    on hc.competency_id = c.id


  left join assessment_evidence ae
    on ae.competency_id = c.id


  left join certificate_evidence ce
    on ce.competency_id = c.id


  where c.is_active = true


  order by

    greatest(

      private.get_effective_competency_target(
        v_user_id,
        c.id
      )

      -

      coalesce(
        uc.current_score,
        0
      ),

      0

    ) desc,

    c.name asc;

end;
$$;

CREATE FUNCTION private.get_trainer_feedback_details(p_trainer_id uuid) RETURNS TABLE(feedback_id uuid, course_id uuid, course_title text, course_rating integer, trainer_rating integer, comments text, created_at timestamp with time zone, updated_at timestamp with time zone)
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
      and p.is_active = true
      and p.is_approved = true
      and (
        (
          p.role = 'trainer'
          and auth.uid() = p_trainer_id
        )
        or p.role = 'admin'
      )
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    f.id,
    f.course_id,
    c.title,
    f.course_rating,
    f.trainer_rating,
    f.comments,
    f.created_at,
    f.updated_at
  from public.course_feedback f
  join public.courses c
    on c.id = f.course_id
  where f.trainer_id = p_trainer_id
  order by f.updated_at desc;
end;
$$;

CREATE FUNCTION private.get_trainer_feedback_summary(p_trainer_id uuid) RETURNS TABLE(trainer_id uuid, total_feedback bigint, average_trainer_rating numeric, average_course_rating numeric, five_star_count bigint, four_star_count bigint, three_star_count bigint, two_star_count bigint, one_star_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  -- Trainer may view only their own summary.
  -- Admin may view any trainer.
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.is_approved = true
      and (
        (
          p.role = 'trainer'
          and auth.uid() = p_trainer_id
        )
        or p.role = 'admin'
      )
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    p_trainer_id,

    count(f.id)::bigint,

    round(
      avg(f.trainer_rating)
        filter (where f.trainer_rating is not null),
      2
    ),

    round(
      avg(f.course_rating),
      2
    ),

    count(*) filter (
      where f.trainer_rating = 5
    )::bigint,

    count(*) filter (
      where f.trainer_rating = 4
    )::bigint,

    count(*) filter (
      where f.trainer_rating = 3
    )::bigint,

    count(*) filter (
      where f.trainer_rating = 2
    )::bigint,

    count(*) filter (
      where f.trainer_rating = 1
    )::bigint

  from public.course_feedback f
  where f.trainer_id = p_trainer_id;
end;
$$;

CREATE FUNCTION private.get_trainer_recommendation_metrics(p_trainer_ids uuid[]) RETURNS TABLE(trainer_id uuid, assessment_sample_count bigint, average_assessment_score numeric, enrollment_sample_count bigint, completion_rate numeric, improvement_sample_count bigint, competency_improvement_rate numeric, performance_score numeric, feedback_count bigint, average_trainer_rating numeric, feedback_score numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  -- Recommendation metrics may be consumed by active,
  -- approved trainees and admins.
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and p.is_approved = true
      and p.role in ('trainee', 'admin')
  ) then
    raise exception 'Unauthorized';
  end if;

  if p_trainer_ids is null
     or cardinality(p_trainer_ids) = 0
  then
    return;
  end if;

  return query

  with candidate_trainers as (
    select p.id
    from public.profiles p
    where p.id = any(p_trainer_ids)
      and p.role = 'trainer'
      and p.is_active = true
      and p.is_approved = true
  ),

  /*
   * Canonical assessment rule:
   * latest submitted attempt per trainee per assessment.
   */
  latest_attempts as (
    select distinct on (
      aa.trainee_id,
      aa.assessment_id
    )
      aa.trainee_id,
      aa.assessment_id,
      aa.percentage,
      aa.submitted_at,
      c.trainer_id

    from public.assessment_attempts aa

    join public.assessments a
      on a.id = aa.assessment_id

    join public.courses c
      on c.id = a.course_id

    join candidate_trainers ct
      on ct.id = c.trainer_id

    where aa.submitted_at is not null

    order by
      aa.trainee_id,
      aa.assessment_id,
      aa.submitted_at desc
  ),

  assessment_stats as (
    select
      la.trainer_id,

      count(*)::bigint
        as assessment_sample_count,

      round(
        avg(la.percentage),
        2
      ) as average_assessment_score

    from latest_attempts la

    group by la.trainer_id
  ),

  /*
   * Withdrawn enrollments are excluded from completion rate.
   */
  completion_stats as (
    select
      c.trainer_id,

      count(*) filter (
        where e.status in (
          'active',
          'completed'
        )
      )::bigint as enrollment_sample_count,

      round(
        (
          count(*) filter (
            where e.status = 'completed'
          )::numeric
          /
          nullif(
            count(*) filter (
              where e.status in (
                'active',
                'completed'
              )
            ),
            0
          )
        ) * 100,
        2
      ) as completion_rate

    from public.courses c

    join candidate_trainers ct
      on ct.id = c.trainer_id

    join public.enrollments e
      on e.course_id = c.id

    group by c.trainer_id
  ),

  /*
   * Competency improvement is linked to assessment-driven
   * competency history through source_id = assessment.id.
   *
   * We measure the percentage of comparable updates where
   * new_score > previous_score.
   */
  improvement_stats as (
    select
      c.trainer_id,

      count(*) filter (
        where csh.previous_score is not null
      )::bigint as improvement_sample_count,

      round(
        (
          count(*) filter (
            where csh.previous_score is not null
              and csh.new_score > csh.previous_score
          )::numeric
          /
          nullif(
            count(*) filter (
              where csh.previous_score is not null
            ),
            0
          )
        ) * 100,
        2
      ) as competency_improvement_rate

    from public.competency_score_history csh

    join public.assessments a
      on a.id = csh.source_id
     and csh.source_type = 'assessment'

    join public.courses c
      on c.id = a.course_id

    join candidate_trainers ct
      on ct.id = c.trainer_id

    group by c.trainer_id
  ),

  feedback_global as (
    select
      avg(f.trainer_rating) filter (
        where f.trainer_rating is not null
      ) as global_average
    from public.course_feedback f
  ),

  feedback_stats as (
    select
      f.trainer_id,

      count(f.trainer_rating) filter (
        where f.trainer_rating is not null
      )::bigint as feedback_count,

      round(
        avg(f.trainer_rating) filter (
          where f.trainer_rating is not null
        ),
        2
      ) as average_trainer_rating

    from public.course_feedback f

    join candidate_trainers ct
      on ct.id = f.trainer_id

    group by f.trainer_id
  )

  select
    ct.id as trainer_id,

    coalesce(
      ast.assessment_sample_count,
      0
    ),

    ast.average_assessment_score,

    coalesce(
      cs.enrollment_sample_count,
      0
    ),

    cs.completion_rate,

    coalesce(
      ims.improvement_sample_count,
      0
    ),

    ims.competency_improvement_rate,

    /*
     * Trainer Performance Score:
     *
     * 50% assessment performance
     * 30% completion
     * 20% competency improvement
     *
     * Missing components receive neutral prior = 50.
     */
    round(
      greatest(
        0,
        least(
          100,

          (
            0.50 * coalesce(
              ast.average_assessment_score,
              50
            )
          )
          +
          (
            0.30 * coalesce(
              cs.completion_rate,
              50
            )
          )
          +
          (
            0.20 * coalesce(
              ims.competency_improvement_rate,
              50
            )
          )
        )
      ),
      2
    ) as performance_score,

    coalesce(
      fs.feedback_count,
      0
    ),

    fs.average_trainer_rating,

    /*
     * Confidence-adjusted feedback.
     *
     * Bayesian-style weighted rating:
     *
     * (v * R + m * C) / (v + m)
     *
     * v = trainer feedback count
     * R = trainer average
     * C = organization-wide average
     * m = 5 confidence observations
     *
     * Rating is then converted from 1-5 to 0-100.
     */
    round(
      greatest(
        0,
        least(
          100,

          case

            when fg.global_average is null
              then 50

            else (
              (
                (
                  coalesce(
                    fs.feedback_count,
                    0
                  )::numeric
                  *
                  coalesce(
                    fs.average_trainer_rating,
                    fg.global_average
                  )
                )
                +
                (
                  5::numeric
                  *
                  fg.global_average
                )
              )
              /
              (
                coalesce(
                  fs.feedback_count,
                  0
                )::numeric
                +
                5::numeric
              )
            ) * 20

          end
        )
      ),
      2
    ) as feedback_score

  from candidate_trainers ct

  left join assessment_stats ast
    on ast.trainer_id = ct.id

  left join completion_stats cs
    on cs.trainer_id = ct.id

  left join improvement_stats ims
    on ims.trainer_id = ct.id

  left join feedback_stats fs
    on fs.trainer_id = ct.id

  cross join feedback_global fg

  order by ct.id;
end;
$$;

CREATE FUNCTION private.submit_course_feedback(p_course_id uuid, p_course_rating integer, p_trainer_rating integer DEFAULT NULL::integer, p_comments text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_user_id uuid;
  v_trainer_id uuid;
  v_feedback_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Unauthenticated';
  end if;

  -- Must be an approved, active trainee.
  if not exists (
    select 1
    from public.profiles p
    where p.id = v_user_id
      and p.role = 'trainee'
      and p.is_approved = true
      and p.is_active = true
  ) then
    raise exception 'Unauthorized trainee';
  end if;

  -- Validate course rating.
  if p_course_rating < 1 or p_course_rating > 5 then
    raise exception 'Course rating must be between 1 and 5';
  end if;

  -- Validate optional trainer rating.
  if p_trainer_rating is not null
     and (
       p_trainer_rating < 1
       or p_trainer_rating > 5
     )
  then
    raise exception 'Trainer rating must be between 1 and 5';
  end if;

  -- Limit comment length.
  if p_comments is not null
     and char_length(p_comments) > 1000
  then
    raise exception 'Comments cannot exceed 1000 characters';
  end if;

  -- Trainee must actually be enrolled.
  if not exists (
    select 1
    from public.enrollments e
    where e.trainee_id = v_user_id
      and e.course_id = p_course_id
      and e.status in ('active', 'completed')
  ) then
    raise exception 'You are not enrolled in this course';
  end if;

  -- Trainer is derived from the authoritative course row.
  select c.trainer_id
  into v_trainer_id
  from public.courses c
  where c.id = p_course_id;

  if not found then
    raise exception 'Course not found';
  end if;

  -- A trainer rating only makes sense if a trainer exists.
  if v_trainer_id is null then
    p_trainer_rating := null;
  end if;

  insert into public.course_feedback (
    trainee_id,
    course_id,
    trainer_id,
    course_rating,
    trainer_rating,
    comments,
    updated_at
  )
  values (
    v_user_id,
    p_course_id,
    v_trainer_id,
    p_course_rating,
    p_trainer_rating,
    nullif(trim(p_comments), ''),
    now()
  )
  on conflict (trainee_id, course_id)
  do update
  set
    trainer_id = excluded.trainer_id,
    course_rating = excluded.course_rating,
    trainer_rating = excluded.trainer_rating,
    comments = excluded.comments,
    updated_at = now()

  returning id
  into v_feedback_id;

  return v_feedback_id;
end;
$$;

CREATE FUNCTION private.issue_certificate_for_enrollment(p_enrollment_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_trainee_id uuid;
  v_course_id uuid;
  v_status text;
  v_progress numeric;
  v_completed_at timestamptz;

  v_existing_id uuid;

  v_certificate_id uuid;
  v_certificate_number text;
  v_verification_code text;
begin
  select
    e.trainee_id,
    e.course_id,
    e.status,
    e.progress_percentage,
    e.completed_at
  into
    v_trainee_id,
    v_course_id,
    v_status,
    v_progress,
    v_completed_at
  from public.enrollments e
  where e.id = p_enrollment_id;

  if v_trainee_id is null then
    raise exception 'Enrollment not found';
  end if;

  if v_status <> 'completed'
     or coalesce(v_progress, 0) < 100
     or v_completed_at is null
  then
    raise exception 'Course is not complete';
  end if;

  select c.id
  into v_existing_id
  from public.certificates c
  where c.trainee_id = v_trainee_id
    and c.course_id = v_course_id;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  v_certificate_number :=
    'CC-' ||
    to_char(current_date, 'YYYY') ||
    '-' ||
    upper(
      substr(
        replace(
          gen_random_uuid()::text,
          '-',
          ''
        ),
        1,
        10
      )
    );

  v_verification_code :=
    upper(
      replace(
        gen_random_uuid()::text,
        '-',
        ''
      )
    );

  insert into public.certificates (
    trainee_id,
    course_id,
    enrollment_id,
    certificate_number,
    verification_code
  )
  values (
    v_trainee_id,
    v_course_id,
    p_enrollment_id,
    v_certificate_number,
    v_verification_code
  )
  returning id
  into v_certificate_id;

  return v_certificate_id;
end;
$$;

CREATE FUNCTION private.mark_notification_read(p_notification_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  update public.notifications
  set
    is_read = true,
    read_at = coalesce(read_at, now())
  where id = p_notification_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Notification not found';
  end if;
end;
$$;

-- Migration 006: Notifications, Announcements, Course Feedback, Certificates & Completion Reporting

CREATE FUNCTION private.mark_all_notifications_read() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  update public.notifications
  set
    is_read = true,
    read_at = coalesce(read_at, now())
  where user_id = auth.uid()
    and is_read = false;
end;
$$;

CREATE FUNCTION public.mark_all_notifications_read() RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.mark_all_notifications_read();
$$;

CREATE FUNCTION public.get_trainer_recommendation_metrics(p_trainer_ids uuid[]) RETURNS TABLE(trainer_id uuid, assessment_sample_count bigint, average_assessment_score numeric, enrollment_sample_count bigint, completion_rate numeric, improvement_sample_count bigint, competency_improvement_rate numeric, performance_score numeric, feedback_count bigint, average_trainer_rating numeric, feedback_score numeric)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.get_trainer_recommendation_metrics(
    p_trainer_ids
  );
$$;

CREATE FUNCTION public.mark_lesson_complete(p_enrollment_id uuid, p_lesson_id uuid) RETURNS numeric
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  return private.mark_lesson_complete(
    p_enrollment_id,
    p_lesson_id
  );
end;
$$;

CREATE FUNCTION public.publish_trainer_assessment(p_assessment_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.publish_trainer_assessment(
    p_assessment_id
  );
$$;

CREATE FUNCTION public.create_development_plan(p_title text, p_target_date date, p_items jsonb) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.create_development_plan(
    p_title,
    p_target_date,
    p_items
  );
$$;

CREATE FUNCTION public.get_my_competency_passport() RETURNS TABLE(competency_id uuid, competency_name text, competency_category text, competency_description text, current_score numeric, target_score numeric, gap_score numeric, proficiency_band text, assessment_evidence_count bigint, latest_assessment_percentage numeric, latest_assessment_at timestamp with time zone, score_history_count bigint, previous_score numeric, improvement numeric, last_score_update timestamp with time zone, certificate_count bigint)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.get_my_competency_passport();
$$;

CREATE FUNCTION public.refresh_development_plan() RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.refresh_development_plan();
$$;

CREATE FUNCTION public.update_development_plan_item_status(p_item_id uuid, p_status text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.update_development_plan_item_status(
    p_item_id,
    p_status
  );
$$;

CREATE FUNCTION public.admin_feedback_overview() RETURNS TABLE(trainer_id uuid, trainer_name text, trainer_email text, feedback_count bigint, average_trainer_rating numeric, average_course_rating numeric)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_feedback_overview();
$$;

CREATE FUNCTION public.admin_list_certificates() RETURNS TABLE(certificate_id uuid, certificate_number text, trainee_id uuid, trainee_name text, course_id uuid, course_title text, issued_at timestamp with time zone, revoked_at timestamp with time zone, revocation_reason text)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_list_certificates();
$$;

CREATE FUNCTION public.admin_revoke_certificate(p_certificate_id uuid, p_reason text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_revoke_certificate(
    p_certificate_id,
    p_reason
  );
$$;

CREATE FUNCTION public.admin_save_announcement(p_id uuid, p_title text, p_message text, p_audience_type text, p_organizational_unit_id uuid, p_priority text, p_action_url text, p_status text, p_expires_at timestamp with time zone) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$

  select private.admin_save_announcement(

    p_id,

    p_title,

    p_message,

    p_audience_type,

    p_organizational_unit_id,

    p_priority,

    p_action_url,

    p_status,

    p_expires_at

  );

$$;

CREATE FUNCTION public.get_trainer_feedback_details(p_trainer_id uuid) RETURNS TABLE(feedback_id uuid, course_id uuid, course_title text, course_rating integer, trainer_rating integer, comments text, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.get_trainer_feedback_details(
    p_trainer_id
  );
$$;

CREATE FUNCTION public.get_trainer_feedback_summary(p_trainer_id uuid) RETURNS TABLE(trainer_id uuid, total_feedback bigint, average_trainer_rating numeric, average_course_rating numeric, five_star_count bigint, four_star_count bigint, three_star_count bigint, two_star_count bigint, one_star_count bigint)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.get_trainer_feedback_summary(
    p_trainer_id
  );
$$;

CREATE FUNCTION public.issue_course_certificate(p_enrollment_id uuid) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.issue_course_certificate(
    p_enrollment_id
  );
$$;

CREATE FUNCTION public.mark_notification_read(p_notification_id uuid) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.mark_notification_read(
    p_notification_id
  );
$$;

CREATE FUNCTION public.submit_course_feedback(p_course_id uuid, p_course_rating integer, p_trainer_rating integer DEFAULT NULL::integer, p_comments text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.submit_course_feedback(
    p_course_id,
    p_course_rating,
    p_trainer_rating,
    p_comments
  );
$$;

CREATE FUNCTION public.get_my_certificate_detail(p_certificate_id uuid) RETURNS TABLE(certificate_id uuid, certificate_number text, verification_code text, trainee_name text, course_title text, issued_at timestamp with time zone, revoked_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select
    cert.id,
    cert.certificate_number,
    cert.verification_code,

    coalesce(
      nullif(trim(p.full_name), ''),
      'Unnamed Learner'
    ),

    c.title,

    cert.issued_at,
    cert.revoked_at

  from public.certificates cert

  join public.profiles p
    on p.id = cert.trainee_id

  join public.courses c
    on c.id = cert.course_id

  where cert.id = p_certificate_id
    and cert.trainee_id = auth.uid()

  limit 1;
$$;

CREATE FUNCTION public.verify_certificate(p_verification_code text) RETURNS TABLE(valid boolean, certificate_number text, trainee_name text, course_title text, issued_at timestamp with time zone, revoked boolean)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select
    cert.revoked_at is null as valid,

    cert.certificate_number,

    coalesce(
      nullif(trim(p.full_name), ''),
      'Unnamed Learner'
    ),

    c.title,

    cert.issued_at,

    cert.revoked_at is not null

  from public.certificates cert

  join public.profiles p
    on p.id = cert.trainee_id

  join public.courses c
    on c.id = cert.course_id

  where cert.verification_code =
    upper(trim(p_verification_code))

  limit 1;
$$;

CREATE FUNCTION public.get_my_certificates() RETURNS TABLE(certificate_id uuid, certificate_number text, verification_code text, course_id uuid, course_title text, course_slug text, issued_at timestamp with time zone, revoked_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select
    cert.id,
    cert.certificate_number,
    cert.verification_code,

    c.id,
    c.title,
    c.slug,

    cert.issued_at,
    cert.revoked_at

  from public.certificates cert

  join public.courses c
    on c.id = cert.course_id

  where cert.trainee_id = auth.uid()

  order by cert.issued_at desc;
$$;

CREATE FUNCTION public.get_my_notifications(p_limit integer DEFAULT 50) RETURNS TABLE(id uuid, type text, title text, message text, entity_type text, entity_id uuid, action_url text, priority text, is_read boolean, read_at timestamp with time zone, created_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select
    n.id,
    n.type,
    n.title,
    n.message,
    n.entity_type,
    n.entity_id,
    n.action_url,
    n.priority,
    n.is_read,
    n.read_at,
    n.created_at
  from public.notifications n
  where n.user_id = auth.uid()
  order by n.created_at desc
  limit greatest(
    least(coalesce(p_limit, 50), 100),
    1
  );
$$;

CREATE FUNCTION public.get_my_unread_notification_count() RETURNS bigint
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select count(*)
  from public.notifications n
  where n.user_id = auth.uid()
    and n.is_read = false;
$$;

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.course_feedback ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view applicable announcements" ON public.announcements FOR SELECT TO authenticated USING (((status = 'published'::text) AND ((published_at IS NULL) OR (published_at <= now())) AND ((expires_at IS NULL) OR (expires_at > now())) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.is_active = true) AND (p.is_approved = true) AND ((announcements.audience_type = 'all'::text) OR ((announcements.audience_type = 'trainees'::text) AND (p.role = 'trainee'::text)) OR ((announcements.audience_type = 'trainers'::text) AND (p.role = 'trainer'::text)) OR ((announcements.audience_type = 'organizational_unit'::text) AND (p.organizational_unit_id = announcements.organizational_unit_id))))))));

CREATE POLICY "Trainees can submit feedback for enrolled courses" ON public.course_feedback FOR INSERT TO authenticated WITH CHECK (((trainee_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainee'::text) AND (p.is_approved = true) AND (p.is_active = true)))) AND (EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE ((e.trainee_id = ( SELECT auth.uid() AS uid)) AND (e.course_id = course_feedback.course_id) AND (e.status = ANY (ARRAY['active'::text, 'completed'::text]))))) AND ((trainer_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE ((c.id = course_feedback.course_id) AND (c.trainer_id = course_feedback.trainer_id)))))));

CREATE POLICY "Trainees can update own course feedback" ON public.course_feedback FOR UPDATE TO authenticated USING ((trainee_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((trainee_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Trainees can view own certificates" ON public.certificates FOR SELECT TO authenticated USING ((trainee_id = auth.uid()));

CREATE POLICY "Trainees can view own course feedback" ON public.course_feedback FOR SELECT TO authenticated USING ((trainee_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING ((user_id = auth.uid()));

REVOKE ALL ON FUNCTION private.admin_feedback_overview() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_feedback_overview() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_list_certificates() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_list_certificates() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_revoke_certificate(p_certificate_id uuid, p_reason text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_revoke_certificate(p_certificate_id uuid, p_reason text) TO authenticated;

REVOKE ALL ON FUNCTION private.admin_save_announcement(p_id uuid, p_title text, p_message text, p_audience_type text, p_organizational_unit_id uuid, p_priority text, p_action_url text, p_status text, p_expires_at timestamp with time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_save_announcement(p_id uuid, p_title text, p_message text, p_audience_type text, p_organizational_unit_id uuid, p_priority text, p_action_url text, p_status text, p_expires_at timestamp with time zone) TO authenticated;

REVOKE ALL ON FUNCTION private.create_development_plan(p_title text, p_target_date date, p_items jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION private.create_development_plan(p_title text, p_target_date date, p_items jsonb) TO authenticated;

REVOKE ALL ON FUNCTION private.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_entity_type text, p_entity_id uuid, p_action_url text, p_priority text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.create_notification(p_user_id uuid, p_type text, p_title text, p_message text, p_entity_type text, p_entity_id uuid, p_action_url text, p_priority text) TO authenticated;

REVOKE ALL ON FUNCTION private.get_my_competency_passport() FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_my_competency_passport() TO authenticated;

REVOKE ALL ON FUNCTION private.get_trainer_feedback_details(p_trainer_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_trainer_feedback_details(p_trainer_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.get_trainer_feedback_summary(p_trainer_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_trainer_feedback_summary(p_trainer_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.get_trainer_recommendation_metrics(p_trainer_ids uuid[]) FROM PUBLIC;

GRANT ALL ON FUNCTION private.get_trainer_recommendation_metrics(p_trainer_ids uuid[]) TO authenticated;

REVOKE ALL ON FUNCTION private.issue_certificate_for_enrollment(p_enrollment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.issue_certificate_for_enrollment(p_enrollment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.issue_course_certificate(p_enrollment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.issue_course_certificate(p_enrollment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.mark_all_notifications_read() FROM PUBLIC;

GRANT ALL ON FUNCTION private.mark_all_notifications_read() TO authenticated;

REVOKE ALL ON FUNCTION private.mark_lesson_complete(p_enrollment_id uuid, p_lesson_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.mark_lesson_complete(p_enrollment_id uuid, p_lesson_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.mark_notification_read(p_notification_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.mark_notification_read(p_notification_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.publish_trainer_assessment(p_assessment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.publish_trainer_assessment(p_assessment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.refresh_development_plan() FROM PUBLIC;

GRANT ALL ON FUNCTION private.refresh_development_plan() TO authenticated;

REVOKE ALL ON FUNCTION private.submit_course_feedback(p_course_id uuid, p_course_rating integer, p_trainer_rating integer, p_comments text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.submit_course_feedback(p_course_id uuid, p_course_rating integer, p_trainer_rating integer, p_comments text) TO authenticated;

REVOKE ALL ON FUNCTION private.update_development_plan_item_status(p_item_id uuid, p_status text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.update_development_plan_item_status(p_item_id uuid, p_status text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_feedback_overview() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_feedback_overview() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_certificates() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_list_certificates() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_revoke_certificate(p_certificate_id uuid, p_reason text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_revoke_certificate(p_certificate_id uuid, p_reason text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_save_announcement(p_id uuid, p_title text, p_message text, p_audience_type text, p_organizational_unit_id uuid, p_priority text, p_action_url text, p_status text, p_expires_at timestamp with time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_save_announcement(p_id uuid, p_title text, p_message text, p_audience_type text, p_organizational_unit_id uuid, p_priority text, p_action_url text, p_status text, p_expires_at timestamp with time zone) TO authenticated;

REVOKE ALL ON FUNCTION public.create_development_plan(p_title text, p_target_date date, p_items jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.create_development_plan(p_title text, p_target_date date, p_items jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_certificate_detail(p_certificate_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_my_certificate_detail(p_certificate_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_certificates() FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_my_certificates() TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_competency_passport() FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_my_competency_passport() TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_notifications(p_limit integer) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_my_notifications(p_limit integer) TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_unread_notification_count() FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_my_unread_notification_count() TO authenticated;

REVOKE ALL ON FUNCTION public.get_trainer_feedback_details(p_trainer_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_trainer_feedback_details(p_trainer_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_trainer_feedback_summary(p_trainer_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_trainer_feedback_summary(p_trainer_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_trainer_recommendation_metrics(p_trainer_ids uuid[]) FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_trainer_recommendation_metrics(p_trainer_ids uuid[]) TO authenticated;

REVOKE ALL ON FUNCTION public.issue_course_certificate(p_enrollment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.issue_course_certificate(p_enrollment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.mark_all_notifications_read() FROM PUBLIC;

GRANT ALL ON FUNCTION public.mark_all_notifications_read() TO authenticated;

REVOKE ALL ON FUNCTION public.mark_lesson_complete(p_enrollment_id uuid, p_lesson_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.mark_lesson_complete(p_enrollment_id uuid, p_lesson_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.mark_notification_read(p_notification_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.mark_notification_read(p_notification_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.publish_trainer_assessment(p_assessment_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.publish_trainer_assessment(p_assessment_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.refresh_development_plan() FROM PUBLIC;

GRANT ALL ON FUNCTION public.refresh_development_plan() TO authenticated;

REVOKE ALL ON FUNCTION public.submit_course_feedback(p_course_id uuid, p_course_rating integer, p_trainer_rating integer, p_comments text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.submit_course_feedback(p_course_id uuid, p_course_rating integer, p_trainer_rating integer, p_comments text) TO authenticated;

REVOKE ALL ON FUNCTION public.update_development_plan_item_status(p_item_id uuid, p_status text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.update_development_plan_item_status(p_item_id uuid, p_status text) TO authenticated;

GRANT ALL ON FUNCTION public.verify_certificate(p_verification_code text) TO anon;

GRANT ALL ON FUNCTION public.verify_certificate(p_verification_code text) TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.announcements TO service_role;

GRANT SELECT ON TABLE public.announcements TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.certificates TO service_role;

GRANT SELECT ON TABLE public.certificates TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.course_feedback TO service_role;

GRANT SELECT ON TABLE public.course_feedback TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.notifications TO service_role;

GRANT SELECT ON TABLE public.notifications TO authenticated;
