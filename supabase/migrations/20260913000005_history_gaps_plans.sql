-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

CREATE TABLE public.competency_score_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    previous_score numeric(5,2),
    assessment_score numeric(5,2),
    new_score numeric(5,2) NOT NULL,
    source_type text DEFAULT 'assessment'::text NOT NULL,
    source_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT competency_score_history_assessment_score_check CHECK (((assessment_score IS NULL) OR ((assessment_score >= (0)::numeric) AND (assessment_score <= (100)::numeric)))),
    CONSTRAINT competency_score_history_new_score_check CHECK (((new_score >= (0)::numeric) AND (new_score <= (100)::numeric))),
    CONSTRAINT competency_score_history_source_type_check CHECK ((source_type = ANY (ARRAY['assessment'::text, 'manual'::text, 'baseline'::text])))
);

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

CREATE TABLE public.skill_gaps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainee_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    current_score numeric(5,2) NOT NULL,
    target_score numeric(5,2) NOT NULL,
    gap_score numeric(5,2) NOT NULL,
    priority text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT skill_gaps_current_score_check CHECK (((current_score >= (0)::numeric) AND (current_score <= (100)::numeric))),
    CONSTRAINT skill_gaps_gap_score_check CHECK (((gap_score >= (0)::numeric) AND (gap_score <= (100)::numeric))),
    CONSTRAINT skill_gaps_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT skill_gaps_status_check CHECK ((status = ANY (ARRAY['open'::text, 'improving'::text, 'resolved'::text]))),
    CONSTRAINT skill_gaps_target_score_check CHECK (((target_score >= (0)::numeric) AND (target_score <= (100)::numeric)))
);

-- 20260913000005_history_gaps_plans.sql
-- Competency score history, skill gaps, development plans, plan items, submit_assessment, Capacity Grid & analytics

CREATE TABLE public.development_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainee_id uuid NOT NULL,
    title text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    source text DEFAULT 'system'::text NOT NULL,
    start_date date DEFAULT CURRENT_DATE NOT NULL,
    target_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT development_plans_source_check CHECK ((source = ANY (ARRAY['system'::text, 'admin'::text, 'trainer'::text, 'ai'::text]))),
    CONSTRAINT development_plans_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'archived'::text])))
);

CREATE TABLE public.development_plan_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    recommended_course_id uuid,
    recommended_trainer_id uuid,
    current_score_snapshot numeric NOT NULL,
    target_score_snapshot numeric NOT NULL,
    gap_score_snapshot numeric NOT NULL,
    priority text NOT NULL,
    course_recommendation_score numeric,
    trainer_match_score numeric,
    sequence_order integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    rationale text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    latest_current_score numeric,
    latest_gap_score numeric,
    latest_priority text,
    last_evaluated_at timestamp with time zone,
    CONSTRAINT development_plan_items_course_recommendation_score_check CHECK (((course_recommendation_score IS NULL) OR ((course_recommendation_score >= (0)::numeric) AND (course_recommendation_score <= (100)::numeric)))),
    CONSTRAINT development_plan_items_current_score_snapshot_check CHECK (((current_score_snapshot >= (0)::numeric) AND (current_score_snapshot <= (100)::numeric))),
    CONSTRAINT development_plan_items_gap_score_snapshot_check CHECK (((gap_score_snapshot >= (0)::numeric) AND (gap_score_snapshot <= (100)::numeric))),
    CONSTRAINT development_plan_items_latest_current_score_check CHECK (((latest_current_score IS NULL) OR ((latest_current_score >= (0)::numeric) AND (latest_current_score <= (100)::numeric)))),
    CONSTRAINT development_plan_items_latest_gap_score_check CHECK (((latest_gap_score IS NULL) OR ((latest_gap_score >= (0)::numeric) AND (latest_gap_score <= (100)::numeric)))),
    CONSTRAINT development_plan_items_latest_priority_check CHECK (((latest_priority IS NULL) OR (latest_priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))),
    CONSTRAINT development_plan_items_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT development_plan_items_sequence_order_check CHECK ((sequence_order > 0)),
    CONSTRAINT development_plan_items_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'skipped'::text]))),
    CONSTRAINT development_plan_items_target_score_snapshot_check CHECK (((target_score_snapshot >= (0)::numeric) AND (target_score_snapshot <= (100)::numeric))),
    CONSTRAINT development_plan_items_trainer_match_score_check CHECK (((trainer_match_score IS NULL) OR ((trainer_match_score >= (0)::numeric) AND (trainer_match_score <= (100)::numeric))))
);

ALTER TABLE ONLY public.competency_score_history
    ADD CONSTRAINT competency_score_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.development_plan_items
    ADD CONSTRAINT development_plan_items_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.development_plan_items
    ADD CONSTRAINT development_plan_items_plan_id_competency_id_key UNIQUE (plan_id, competency_id);

ALTER TABLE ONLY public.development_plans
    ADD CONSTRAINT development_plans_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.skill_gaps
    ADD CONSTRAINT skill_gaps_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.skill_gaps
    ADD CONSTRAINT skill_gaps_trainee_id_competency_id_key UNIQUE (trainee_id, competency_id);

CREATE INDEX development_plan_items_competency_id_idx ON public.development_plan_items USING btree (competency_id);

CREATE INDEX development_plan_items_course_id_idx ON public.development_plan_items USING btree (recommended_course_id);

CREATE INDEX development_plan_items_plan_id_idx ON public.development_plan_items USING btree (plan_id);

CREATE INDEX development_plan_items_trainer_id_idx ON public.development_plan_items USING btree (recommended_trainer_id);

CREATE INDEX development_plans_trainee_id_idx ON public.development_plans USING btree (trainee_id);

ALTER TABLE ONLY public.competency_score_history
    ADD CONSTRAINT competency_score_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.development_plan_items
    ADD CONSTRAINT development_plan_items_recommended_trainer_id_fkey FOREIGN KEY (recommended_trainer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.development_plans
    ADD CONSTRAINT development_plans_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.skill_gaps
    ADD CONSTRAINT skill_gaps_trainee_id_fkey FOREIGN KEY (trainee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.competency_score_history
    ADD CONSTRAINT competency_score_history_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.development_plan_items
    ADD CONSTRAINT development_plan_items_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.skill_gaps
    ADD CONSTRAINT skill_gaps_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.development_plan_items
    ADD CONSTRAINT development_plan_items_recommended_course_id_fkey FOREIGN KEY (recommended_course_id) REFERENCES public.courses(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.development_plan_items
    ADD CONSTRAINT development_plan_items_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.development_plans(id) ON DELETE CASCADE;

CREATE FUNCTION private.admin_competency_heatmap() RETURNS TABLE(department text, competency_id uuid, competency_name text, learner_count bigint, average_current_score numeric, average_target_score numeric, average_gap numeric, users_below_target bigint, critical_gap_count bigint, high_gap_count bigint)
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
    coalesce(
      nullif(trim(p.department), ''),
      'Unspecified'
    ) as department,

    c.id as competency_id,
    c.name as competency_name,

    count(distinct uc.user_id) as learner_count,

    round(
      avg(uc.current_score),
      2
    ) as average_current_score,

    round(
      avg(uc.target_score),
      2
    ) as average_target_score,

    round(
      avg(
        greatest(
          uc.target_score - uc.current_score,
          0
        )
      ),
      2
    ) as average_gap,

    count(*) filter (
      where uc.current_score < uc.target_score
    ) as users_below_target,

    count(*) filter (
      where sg.priority = 'critical'
        and sg.status <> 'resolved'
    ) as critical_gap_count,

    count(*) filter (
      where sg.priority = 'high'
        and sg.status <> 'resolved'
    ) as high_gap_count

  from public.user_competencies uc

  join public.profiles p
    on p.id = uc.user_id

  join public.competencies c
    on c.id = uc.competency_id

  left join public.skill_gaps sg
    on sg.trainee_id = uc.user_id
   and sg.competency_id = uc.competency_id

  where p.role = 'trainee'
    and p.is_active = true
    and p.is_approved = true
    and c.is_active = true

  group by
    coalesce(
      nullif(trim(p.department), ''),
      'Unspecified'
    ),
    c.id,
    c.name

  order by
    department asc,
    average_gap desc,
    c.name asc;
end;
$$;

CREATE FUNCTION private.admin_dashboard_summary() RETURNS TABLE(total_users bigint, pending_users bigint, active_trainees bigint, active_trainers bigint, published_courses bigint, critical_gap_groups bigint, high_gap_groups bigint)
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
  with gap_groups as (
    select
      coalesce(
        nullif(trim(p.department), ''),
        'Unspecified'
      ) as department,

      uc.competency_id,

      avg(
        greatest(
          uc.target_score - uc.current_score,
          0
        )
      ) as avg_gap,

      count(*) filter (
        where sg.priority = 'critical'
          and sg.status <> 'resolved'
      ) as critical_count,

      count(*) filter (
        where sg.priority = 'high'
          and sg.status <> 'resolved'
      ) as high_count

    from public.user_competencies uc

    join public.profiles p
      on p.id = uc.user_id

    left join public.skill_gaps sg
      on sg.trainee_id = uc.user_id
     and sg.competency_id = uc.competency_id

    where p.role = 'trainee'
      and p.is_active = true
      and p.is_approved = true

    group by
      coalesce(
        nullif(trim(p.department), ''),
        'Unspecified'
      ),
      uc.competency_id
  )

  select
    (
      select count(*)
      from public.profiles
    ) as total_users,

    (
      select count(*)
      from public.profiles
      where is_approved = false
    ) as pending_users,

    (
      select count(*)
      from public.profiles
      where role = 'trainee'
        and is_active = true
        and is_approved = true
    ) as active_trainees,

    (
      select count(*)
      from public.profiles
      where role = 'trainer'
        and is_active = true
        and is_approved = true
    ) as active_trainers,

    (
      select count(*)
      from public.courses
      where status = 'published'
    ) as published_courses,

    (
      select count(*)
      from gap_groups
      where avg_gap >= 35
         or critical_count > 0
    ) as critical_gap_groups,

    (
      select count(*)
      from gap_groups
      where (
        avg_gap >= 20
        or high_count > 0
      )
      and not (
        avg_gap >= 35
        or critical_count > 0
      )
    ) as high_gap_groups;
end;
$$;

CREATE FUNCTION private.admin_training_impact() RETURNS TABLE(course_id uuid, course_title text, trainer_id uuid, trainer_name text, completed_trainees bigint, pre_training_sample bigint, post_training_sample bigint, average_before_score numeric, average_after_score numeric, average_improvement numeric, improved_trainees bigint, target_attainment_count bigint, improvement_rate numeric, target_attainment_rate numeric)
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


  return query

  with

  -- =======================================================
  -- COMPLETED ENROLLMENTS
  -- =======================================================

  completed as (

    select
      e.trainee_id as completed_trainee_id,
      e.course_id as completed_course_id,
      e.completed_at as course_completed_at

    from public.enrollments e

    where e.status = 'completed'
      and e.completed_at is not null

  ),


  -- =======================================================
  -- RELEVANT COMPETENCY HISTORY
  -- =======================================================

  relevant_history as (

    select

      comp.completed_course_id,
      comp.completed_trainee_id,

      cc.competency_id
        as mapped_competency_id,

      h.previous_score,
      h.new_score,

      h.created_at
        as history_created_at,

      row_number() over (
        partition by
          comp.completed_course_id,
          comp.completed_trainee_id,
          cc.competency_id

        order by h.created_at asc
      ) as first_rank,

      row_number() over (
        partition by
          comp.completed_course_id,
          comp.completed_trainee_id,
          cc.competency_id

        order by h.created_at desc
      ) as last_rank

    from completed comp

    join public.course_competencies cc
      on cc.course_id =
         comp.completed_course_id

    join public.competency_score_history h
      on h.user_id =
         comp.completed_trainee_id

     and h.competency_id =
         cc.competency_id

    where h.created_at <=
          comp.course_completed_at

  ),


  -- =======================================================
  -- BEFORE SCORE
  -- =======================================================

  before_scores as (

    select

      rh.completed_course_id,
      rh.completed_trainee_id,
      rh.mapped_competency_id,

      coalesce(
        rh.previous_score,
        rh.new_score
      ) as before_score

    from relevant_history rh

    where rh.first_rank = 1

  ),


  -- =======================================================
  -- AFTER SCORE
  -- =======================================================

  after_scores as (

    select

      rh.completed_course_id,
      rh.completed_trainee_id,
      rh.mapped_competency_id,

      rh.new_score
        as after_score

    from relevant_history rh

    where rh.last_rank = 1

  ),


  -- =======================================================
  -- MATCH BEFORE AND AFTER
  -- =======================================================

  paired_scores as (

    select

      b.completed_course_id,
      b.completed_trainee_id,
      b.mapped_competency_id,

      b.before_score,
      a.after_score,

      (
        a.after_score
        -
        b.before_score
      )::numeric as score_improvement

    from before_scores b

    join after_scores a

      on a.completed_course_id =
         b.completed_course_id

     and a.completed_trainee_id =
         b.completed_trainee_id

     and a.mapped_competency_id =
         b.mapped_competency_id

  ),


  -- =======================================================
  -- EFFECTIVE TARGET
  --
  -- THIS IS THE IMPORTANT UPGRADE
  -- =======================================================

  trainee_targets as (

    select

      ps.completed_course_id,
      ps.completed_trainee_id,
      ps.mapped_competency_id,

      ps.before_score,
      ps.after_score,
      ps.score_improvement,

      private.get_effective_competency_target(
        ps.completed_trainee_id,
        ps.mapped_competency_id
      ) as target_score

    from paired_scores ps

  ),


  -- =======================================================
  -- COURSE IMPACT
  -- =======================================================

  course_stats as (

    select

      tt.completed_course_id
        as stats_course_id,

      count(*)::bigint
        as paired_measurements,

      avg(
        tt.before_score
      ) as avg_before,

      avg(
        tt.after_score
      ) as avg_after,

      avg(
        tt.score_improvement
      ) as avg_improvement,

      count(*) filter (
        where tt.score_improvement > 0
      )::bigint as improved_count,

      count(*) filter (
        where tt.after_score >=
              tt.target_score
      )::bigint as target_count

    from trainee_targets tt

    group by
      tt.completed_course_id

  ),


  -- =======================================================
  -- COURSE COMPLETION COUNT
  -- =======================================================

  completion_stats as (

    select

      comp.completed_course_id
        as completion_course_id,

      count(
        distinct comp.completed_trainee_id
      )::bigint as completed_count

    from completed comp

    group by
      comp.completed_course_id

  )


  -- =======================================================
  -- FINAL RESULT
  -- =======================================================

  select

    c.id,

    c.title,

    c.trainer_id,

    coalesce(
      nullif(
        trim(p_trainer.full_name),
        ''
      ),
      'Unassigned'
    ),

    coalesce(
      completion.completed_count,
      0
    ),

    coalesce(
      stats.paired_measurements,
      0
    ),

    coalesce(
      stats.paired_measurements,
      0
    ),

    round(
      stats.avg_before,
      2
    ),

    round(
      stats.avg_after,
      2
    ),

    round(
      stats.avg_improvement,
      2
    ),

    coalesce(
      stats.improved_count,
      0
    ),

    coalesce(
      stats.target_count,
      0
    ),


    -- Improvement rate

    case

      when coalesce(
        stats.paired_measurements,
        0
      ) = 0

      then 0::numeric

      else round(

        (
          stats.improved_count::numeric
          /
          stats.paired_measurements::numeric
        )

        * 100,

        2
      )

    end,


    -- Target attainment rate

    case

      when coalesce(
        stats.paired_measurements,
        0
      ) = 0

      then 0::numeric

      else round(

        (
          stats.target_count::numeric
          /
          stats.paired_measurements::numeric
        )

        * 100,

        2
      )

    end


  from public.courses c


  left join public.profiles p_trainer
    on p_trainer.id = c.trainer_id


  left join course_stats stats
    on stats.stats_course_id = c.id


  left join completion_stats completion
    on completion.completion_course_id = c.id


  where c.status in (
    'published',
    'archived'
  )


  order by

    stats.avg_improvement desc
      nulls last,

    c.title asc;

end;
$$;

CREATE FUNCTION private.staff_get_development_plan(p_plan_id uuid) RETURNS TABLE(plan_id uuid, trainee_id uuid, trainee_name text, department text, designation text, plan_title text, plan_status text, start_date date, target_date date, item_id uuid, sequence_order integer, competency_id uuid, competency_name text, original_current_score numeric, target_score numeric, original_gap_score numeric, original_priority text, latest_current_score numeric, latest_gap_score numeric, latest_priority text, recommended_course_id uuid, recommended_course_title text, recommended_trainer_id uuid, recommended_trainer_name text, item_status text, rationale text, started_at timestamp with time zone, completed_at timestamp with time zone, last_evaluated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_role text;
  v_trainee_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  select p.role
  into v_role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
    and p.is_approved = true;

  if v_role not in ('trainer', 'admin') then
    raise exception 'Unauthorized';
  end if;

  select dp.trainee_id
  into v_trainee_id
  from public.development_plans dp
  where dp.id = p_plan_id;

  if v_trainee_id is null then
    raise exception 'Development plan not found';
  end if;

  if v_role = 'trainer'
     and not exists (
       select 1
       from public.enrollments e
       join public.courses c
         on c.id = e.course_id
       where e.trainee_id = v_trainee_id
         and c.trainer_id = auth.uid()
         and e.status in ('active', 'completed')
     )
  then
    raise exception 'You do not have access to this trainee';
  end if;

  return query
  select
    dp.id,
    dp.trainee_id,

    coalesce(
      nullif(trim(tp.full_name), ''),
      'Unnamed Trainee'
    ),

    tp.department,
    tp.designation,

    dp.title,
    dp.status,
    dp.start_date,
    dp.target_date,

    dpi.id,
    dpi.sequence_order,

    comp.id,
    comp.name,

    dpi.current_score_snapshot,
    dpi.target_score_snapshot,
    dpi.gap_score_snapshot,
    dpi.priority,

    dpi.latest_current_score,
    dpi.latest_gap_score,
    dpi.latest_priority,

    cr.id,
    cr.title,

    rt.id,
    rt.full_name,

    dpi.status,
    dpi.rationale,

    dpi.started_at,
    dpi.completed_at,
    dpi.last_evaluated_at

  from public.development_plans dp

  join public.profiles tp
    on tp.id = dp.trainee_id

  join public.development_plan_items dpi
    on dpi.plan_id = dp.id

  join public.competencies comp
    on comp.id = dpi.competency_id

  left join public.courses cr
    on cr.id = dpi.recommended_course_id

  left join public.profiles rt
    on rt.id = dpi.recommended_trainer_id

  where dp.id = p_plan_id

  order by dpi.sequence_order asc;
end;
$$;

CREATE FUNCTION private.staff_list_development_plans() RETURNS TABLE(plan_id uuid, trainee_id uuid, trainee_name text, department text, designation text, plan_title text, plan_status text, start_date date, target_date date, completed_items bigint, total_items bigint, progress_percentage numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  select p.role
  into v_role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
    and p.is_approved = true;

  if v_role not in ('trainer', 'admin') then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    dp.id,
    dp.trainee_id,

    coalesce(
      nullif(trim(tp.full_name), ''),
      'Unnamed Trainee'
    ),

    tp.department,
    tp.designation,

    dp.title,
    dp.status,
    dp.start_date,
    dp.target_date,

    count(dpi.id) filter (
      where dpi.status = 'completed'
    )::bigint,

    count(dpi.id) filter (
      where dpi.status <> 'skipped'
    )::bigint,

    case
      when count(dpi.id) filter (
        where dpi.status <> 'skipped'
      ) = 0
      then 0

      else round(
        (
          count(dpi.id) filter (
            where dpi.status = 'completed'
          )::numeric
          /
          count(dpi.id) filter (
            where dpi.status <> 'skipped'
          )::numeric
        ) * 100,
        2
      )
    end

  from public.development_plans dp

  join public.profiles tp
    on tp.id = dp.trainee_id

  left join public.development_plan_items dpi
    on dpi.plan_id = dp.id

  where
    tp.role = 'trainee'

    and (
      v_role = 'admin'

      or exists (
        select 1
        from public.enrollments e
        join public.courses c
          on c.id = e.course_id
        where e.trainee_id = dp.trainee_id
          and c.trainer_id = auth.uid()
          and e.status in ('active', 'completed')
      )
    )

  group by
    dp.id,
    dp.trainee_id,
    tp.full_name,
    tp.department,
    tp.designation,
    dp.title,
    dp.status,
    dp.start_date,
    dp.target_date

  order by
    case
      when dp.status = 'active' then 0
      else 1
    end,
    dp.created_at desc;
end;
$$;

CREATE FUNCTION private.submit_assessment(p_assessment_id uuid, p_answers jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
declare
  v_user_id uuid;
  v_attempt_id uuid;

  v_total_points numeric := 0;
  v_score numeric := 0;
  v_percentage numeric := 0;
  v_passing_score numeric := 0;

  v_question_count integer := 0;
  v_answer_count integer := 0;

  v_comp record;

  v_previous_score numeric;
  v_assessment_score numeric;
  v_new_score numeric;
  v_target_score numeric;
  v_gap_score numeric;

  v_priority text;
  v_status text;

v_assessment_status text;
v_deadline timestamptz;

  v_has_history boolean;

  v_competency_updates jsonb := '[]'::jsonb;
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
    raise exception 'Unauthorized user';
  end if;

  if not exists (
    select 1
    from public.assessments a
    join public.enrollments e
      on e.course_id = a.course_id
    where a.id = p_assessment_id
      and a.status = 'published'
      and (
        a.deadline is null
        or a.deadline >= now()
      )
      and e.trainee_id = v_user_id
      and e.status = 'active'
  ) then
    raise exception 'Assessment unavailable';
  end if;

select
  a.status,
  a.deadline
into
  v_assessment_status,
  v_deadline
from public.assessments a
where a.id = p_assessment_id;
if v_assessment_status is null then
  raise exception 'Assessment not found';
end if;

if v_assessment_status <> 'published' then
  raise exception 'Assessment is not currently available';
end if;

if v_deadline is not null
   and now() > v_deadline
then
  raise exception 'Assessment deadline has passed';
end if;

  select
    count(*),
    coalesce(sum(points), 0)
  into
    v_question_count,
    v_total_points
  from public.assessment_questions
  where assessment_id = p_assessment_id;

  select count(*)
  into v_answer_count
  from jsonb_object_keys(p_answers);

  if v_question_count = 0 then
    raise exception 'Assessment has no questions';
  end if;

  if v_answer_count <> v_question_count then
    raise exception 'All questions must be answered';
  end if;

  select passing_score
  into v_passing_score
  from public.assessments
  where id = p_assessment_id;

  insert into public.assessment_attempts (
    assessment_id,
    trainee_id,
    score,
    percentage,
    passed,
    submitted_at
  )
  values (
    p_assessment_id,
    v_user_id,
    0,
    0,
    false,
    now()
  )
  returning id
  into v_attempt_id;

  insert into public.assessment_answers (
    attempt_id,
    question_id,
    selected_option_id,
    is_correct,
    points_awarded
  )
  select
    v_attempt_id,
    q.id,
    selected.id,
    coalesce(selected.is_correct, false),
    case
      when selected.is_correct = true
        then q.points
      else 0
    end
  from public.assessment_questions q
  left join public.question_options selected
    on selected.id =
      nullif(
        p_answers ->> q.id::text,
        ''
      )::uuid
    and selected.question_id = q.id
  where q.assessment_id = p_assessment_id;

  select coalesce(sum(points_awarded), 0)
  into v_score
  from public.assessment_answers
  where attempt_id = v_attempt_id;

  if v_total_points > 0 then
    v_percentage :=
      round(
        (v_score / v_total_points) * 100,
        2
      );
  end if;

if p_answers is null
   or jsonb_typeof(p_answers) <> 'object'
then
  raise exception 'Invalid assessment answers';
end if;
if exists (
  select 1
  from jsonb_each_text(p_answers) a(key, value)
  where
    a.key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    or
    a.value !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
) then
  raise exception 'Invalid assessment answers';
end if;
if exists (
  select 1
  from jsonb_object_keys(p_answers) submitted_question_id
  where not exists (
    select 1
    from public.assessment_questions q
    where q.assessment_id = p_assessment_id
      and q.id::text =
        submitted_question_id
  )
) then
  raise exception 'Invalid assessment question';
end if;
if exists (
  select 1
  from jsonb_each_text(p_answers) submitted
  where not exists (
    select 1
    from public.assessment_questions q
    join public.question_options qo
      on qo.question_id = q.id
    where q.assessment_id =
      p_assessment_id

      and q.id::text =
        submitted.key

      and qo.id::text =
        submitted.value
  )
) then
  raise exception 'Invalid assessment option';
end if;

  update public.assessment_attempts
  set
    score = v_score,
    percentage = v_percentage,
    passed = (
      v_percentage >= v_passing_score
    )
  where id = v_attempt_id;

  /*
    COMPETENCY PROCESSING

    Each competency is calculated independently.
  */

  for v_comp in
    select
      q.competency_id,

      sum(q.points) as total_points,

      coalesce(
        sum(aa.points_awarded),
        0
      ) as earned_points

    from public.assessment_questions q

    join public.assessment_answers aa
      on aa.question_id = q.id
      and aa.attempt_id = v_attempt_id

    where q.assessment_id = p_assessment_id
      and q.competency_id is not null

    group by q.competency_id
  loop

    if v_comp.total_points <= 0 then
      continue;
    end if;

    v_assessment_score :=
      round(
        (
          v_comp.earned_points
          / v_comp.total_points
        ) * 100,
        2
      );

    select
      uc.current_score,
      coalesce(
        uc.target_score,
        c.default_target_score,
        80
      )
    into
      v_previous_score,
      v_target_score

    from public.competencies c

    left join public.user_competencies uc
      on uc.competency_id = c.id
      and uc.user_id = v_user_id

    where c.id = v_comp.competency_id;

    if v_target_score is null then
      v_target_score := 80;
    end if;

    select exists (
      select 1
      from public.competency_score_history h
      where h.user_id = v_user_id
        and h.competency_id =
          v_comp.competency_id
        and h.source_type = 'assessment'
    )
    into v_has_history;

    /*
      First meaningful assessment:

      no record
      OR zero baseline with no assessment history
    */

    if v_previous_score is null
       or (
         v_previous_score = 0
         and not v_has_history
       )
    then

      v_new_score :=
        v_assessment_score;

    else

      v_new_score :=
        round(
          (
            v_previous_score * 0.70
          )
          +
          (
            v_assessment_score * 0.30
          ),
          2
        );

    end if;

    v_new_score :=
      least(
        100,
        greatest(
          0,
          v_new_score
        )
      );

    /*
      Upsert current competency.
    */

    insert into public.user_competencies (
      user_id,
      competency_id,
      current_score,
      target_score,
      last_updated_at
    )
    values (
      v_user_id,
      v_comp.competency_id,
      v_new_score,
      v_target_score,
      now()
    )

    on conflict (
      user_id,
      competency_id
    )

    do update set
      current_score = excluded.current_score,
      target_score = excluded.target_score,
      last_updated_at = now();

    /*
      History
    */

    insert into public.competency_score_history (
      user_id,
      competency_id,
      previous_score,
      assessment_score,
      new_score,
      source_type,
      source_id
    )
    values (
      v_user_id,
      v_comp.competency_id,
      v_previous_score,
      v_assessment_score,
      v_new_score,
      'assessment',
      v_attempt_id
    );

    /*
      Skill gap
    */

    v_gap_score :=
      greatest(
        v_target_score - v_new_score,
        0
      );

    if v_gap_score >= 35 then
      v_priority := 'critical';

    elsif v_gap_score >= 20 then
      v_priority := 'high';

    elsif v_gap_score >= 10 then
      v_priority := 'medium';

    else
      v_priority := 'low';
    end if;

    if v_gap_score = 0 then

      v_status := 'resolved';

    elsif
      v_previous_score is not null
      and v_new_score > v_previous_score

    then

      v_status := 'improving';

    else

      v_status := 'open';

    end if;

    insert into public.skill_gaps (
      trainee_id,
      competency_id,
      current_score,
      target_score,
      gap_score,
      priority,
      status,
      detected_at,
      updated_at,
      resolved_at
    )
    values (
      v_user_id,
      v_comp.competency_id,
      v_new_score,
      v_target_score,
      v_gap_score,
      v_priority,
      v_status,
      now(),
      now(),
      case
        when v_status = 'resolved'
          then now()
        else null
      end
    )

    on conflict (
      trainee_id,
      competency_id
    )

    do update set
      current_score = excluded.current_score,
      target_score = excluded.target_score,
      gap_score = excluded.gap_score,
      priority = excluded.priority,
      status = excluded.status,
      updated_at = now(),
      resolved_at =
        case
          when excluded.status = 'resolved'
            then now()
          else null
        end;

    /*
      Add result summary.
    */

    v_competency_updates :=
      v_competency_updates
      ||
      jsonb_build_array(
        jsonb_build_object(
          'competency_id',
            v_comp.competency_id,

          'previous_score',
            v_previous_score,

          'assessment_score',
            v_assessment_score,

          'new_score',
            v_new_score,

          'improvement',
            case
              when v_previous_score is null
                then null
              else round(
                v_new_score
                - v_previous_score,
                2
              )
            end,

          'target_score',
            v_target_score,

          'gap_score',
            v_gap_score,

          'priority',
            v_priority,

          'status',
            v_status
        )
      );

  end loop;

  return jsonb_build_object(
    'attempt_id',
      v_attempt_id,

    'score',
      v_score,

    'total_points',
      v_total_points,

    'percentage',
      v_percentage,

    'passed',
      (
        v_percentage
        >= v_passing_score
      ),

    'competency_updates',
      v_competency_updates
  );
end;
$_$;

-- Migration 005: Competency History, Skill Gaps, Development Plans & Training Impact Analytics

CREATE FUNCTION private.can_view_development_plan(p_plan_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1
    from public.development_plans dp
    where dp.id = p_plan_id
      and dp.trainee_id = auth.uid()
  );
$$;

CREATE FUNCTION public.admin_competency_heatmap() RETURNS TABLE(department text, competency_id uuid, competency_name text, learner_count bigint, average_current_score numeric, average_target_score numeric, average_gap numeric, users_below_target bigint, critical_gap_count bigint, high_gap_count bigint)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_competency_heatmap();
$$;

CREATE FUNCTION public.submit_assessment(p_assessment_id uuid, p_answers jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
begin
  if auth.uid() is null then
    raise exception 'Unauthenticated';
  end if;

  return private.submit_assessment(
    p_assessment_id,
    p_answers
  );
end;
$$;

CREATE FUNCTION public.admin_training_impact() RETURNS TABLE(course_id uuid, course_title text, trainer_id uuid, trainer_name text, completed_trainees bigint, pre_training_sample bigint, post_training_sample bigint, average_before_score numeric, average_after_score numeric, average_improvement numeric, improved_trainees bigint, target_attainment_count bigint, improvement_rate numeric, target_attainment_rate numeric)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_training_impact();
$$;

CREATE FUNCTION public.staff_get_development_plan(p_plan_id uuid) RETURNS TABLE(plan_id uuid, trainee_id uuid, trainee_name text, department text, designation text, plan_title text, plan_status text, start_date date, target_date date, item_id uuid, sequence_order integer, competency_id uuid, competency_name text, original_current_score numeric, target_score numeric, original_gap_score numeric, original_priority text, latest_current_score numeric, latest_gap_score numeric, latest_priority text, recommended_course_id uuid, recommended_course_title text, recommended_trainer_id uuid, recommended_trainer_name text, item_status text, rationale text, started_at timestamp with time zone, completed_at timestamp with time zone, last_evaluated_at timestamp with time zone)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.staff_get_development_plan(
    p_plan_id
  );
$$;

CREATE FUNCTION public.staff_list_development_plans() RETURNS TABLE(plan_id uuid, trainee_id uuid, trainee_name text, department text, designation text, plan_title text, plan_status text, start_date date, target_date date, completed_items bigint, total_items bigint, progress_percentage numeric)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.staff_list_development_plans();
$$;

CREATE FUNCTION public.admin_dashboard_summary() RETURNS TABLE(total_users bigint, pending_users bigint, active_trainees bigint, active_trainers bigint, published_courses bigint, critical_gap_groups bigint, high_gap_groups bigint)
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select *
  from private.admin_dashboard_summary();
$$;

ALTER TABLE public.competency_score_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.development_plan_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.development_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainees can view own competency history" ON public.competency_score_history FOR SELECT TO authenticated USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY "Trainees can view own development plan items" ON public.development_plan_items FOR SELECT TO authenticated USING (private.can_view_development_plan(plan_id));

CREATE POLICY "Trainees can view own development plans" ON public.development_plans FOR SELECT TO authenticated USING ((trainee_id = auth.uid()));

CREATE POLICY "Trainees can view own skill gaps" ON public.skill_gaps FOR SELECT TO authenticated USING ((trainee_id = ( SELECT auth.uid() AS uid)));

REVOKE ALL ON FUNCTION private.admin_competency_heatmap() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_competency_heatmap() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_dashboard_summary() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_dashboard_summary() TO authenticated;

REVOKE ALL ON FUNCTION private.admin_training_impact() FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_training_impact() TO authenticated;

REVOKE ALL ON FUNCTION private.can_view_development_plan(p_plan_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.can_view_development_plan(p_plan_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.staff_get_development_plan(p_plan_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.staff_get_development_plan(p_plan_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.staff_list_development_plans() FROM PUBLIC;

GRANT ALL ON FUNCTION private.staff_list_development_plans() TO authenticated;

REVOKE ALL ON FUNCTION private.submit_assessment(p_assessment_id uuid, p_answers jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION private.submit_assessment(p_assessment_id uuid, p_answers jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_competency_heatmap() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_competency_heatmap() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_dashboard_summary() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_dashboard_summary() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_training_impact() FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_training_impact() TO authenticated;

REVOKE ALL ON FUNCTION public.staff_get_development_plan(p_plan_id uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.staff_get_development_plan(p_plan_id uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.staff_list_development_plans() FROM PUBLIC;

GRANT ALL ON FUNCTION public.staff_list_development_plans() TO authenticated;

REVOKE ALL ON FUNCTION public.submit_assessment(p_assessment_id uuid, p_answers jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.submit_assessment(p_assessment_id uuid, p_answers jsonb) TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.competency_score_history TO service_role;

GRANT SELECT ON TABLE public.competency_score_history TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.development_plan_items TO service_role;

GRANT SELECT ON TABLE public.development_plan_items TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.development_plans TO service_role;

GRANT SELECT ON TABLE public.development_plans TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.skill_gaps TO service_role;

GRANT SELECT ON TABLE public.skill_gaps TO authenticated;
