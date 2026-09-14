-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

CREATE TABLE public.knowledge_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    resource_type text NOT NULL,
    category text,
    storage_path text,
    external_url text,
    mime_type text,
    file_size_bytes bigint,
    uploaded_by uuid NOT NULL,
    competency_id uuid,
    course_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    review_reason text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT knowledge_resources_resource_type_check CHECK ((resource_type = ANY (ARRAY['pdf'::text, 'presentation'::text, 'video'::text, 'external_link'::text, 'guide'::text, 'sop'::text, 'case_study'::text, 'operational_note'::text, 'best_practice'::text, 'document'::text]))),
    CONSTRAINT knowledge_resources_source_check CHECK (((storage_path IS NOT NULL) OR (external_url IS NOT NULL))),
    CONSTRAINT knowledge_resources_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'archived'::text])))
);

ALTER TABLE ONLY public.knowledge_resources
    ADD CONSTRAINT knowledge_resources_pkey PRIMARY KEY (id);

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

CREATE INDEX knowledge_resources_competency_idx ON public.knowledge_resources USING btree (competency_id);

CREATE INDEX knowledge_resources_course_idx ON public.knowledge_resources USING btree (course_id);

CREATE INDEX knowledge_resources_status_idx ON public.knowledge_resources USING btree (status);

CREATE INDEX knowledge_resources_uploaded_by_idx ON public.knowledge_resources USING btree (uploaded_by);

-- 20260913000007_knowledge_hub_audit_storage.sql
-- Knowledge hub resources, storage policies, cross-domain grants and remaining policies

CREATE INDEX knowledge_resources_category_idx ON public.knowledge_resources USING btree (category);

ALTER TABLE ONLY public.knowledge_resources
    ADD CONSTRAINT knowledge_resources_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.knowledge_resources
    ADD CONSTRAINT knowledge_resources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.knowledge_resources
    ADD CONSTRAINT knowledge_resources_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competencies(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.knowledge_resources
    ADD CONSTRAINT knowledge_resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;

CREATE FUNCTION private.admin_review_knowledge_resource(p_resource_id uuid, p_action text, p_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_admin_id uuid;
begin
  v_admin_id := auth.uid();

  if v_admin_id is null then
    raise exception 'Unauthenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_admin_id
      and p.role = 'admin'
      and p.is_active = true
      and p.is_approved = true
  ) then
    raise exception 'Forbidden';
  end if;

  if p_action not in ('approve', 'reject', 'archive') then
    raise exception 'Invalid action';
  end if;

  update public.knowledge_resources
  set
    status = case
      when p_action = 'approve' then 'approved'
      when p_action = 'reject' then 'rejected'
      when p_action = 'archive' then 'archived'
    end,
    review_reason = case
      when p_action = 'approve' then null
      else nullif(trim(p_reason), '')
    end,
    reviewed_by = v_admin_id,
    reviewed_at = now(),
    updated_at = now()
  where id = p_resource_id;

  if not found then
    raise exception 'Knowledge resource not found';
  end if;
end;
$$;

CREATE FUNCTION public.admin_review_knowledge_resource(p_resource_id uuid, p_action text, p_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE sql
    SET search_path TO ''
    AS $$
  select private.admin_review_knowledge_resource(
    p_resource_id,
    p_action,
    p_reason
  );
$$;

ALTER TABLE public.knowledge_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can upload knowledge hub files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'knowledge-hub'::text) AND (split_part(name, '/'::text, 1) = 'knowledge-hub'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_approved = true) AND (p.is_active = true))))));

CREATE POLICY "Trainers can view own knowledge hub files" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'knowledge-hub'::text) AND (split_part(name, '/'::text, 1) = 'knowledge-hub'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true))))));

CREATE POLICY "Trainees can view materials for enrolled courses" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'course-materials'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainee'::text) AND (p.is_active = true) AND (p.is_approved = true)))) AND (EXISTS ( SELECT 1
   FROM public.enrollments e
  WHERE (((e.course_id)::text = split_part(objects.name, '/'::text, 1)) AND (e.trainee_id = auth.uid()) AND (e.status = ANY (ARRAY['active'::text, 'completed'::text])))))));

CREATE POLICY "Trainers can delete own course materials" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'course-materials'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE (((c.id)::text = split_part(objects.name, '/'::text, 1)) AND (c.trainer_id = auth.uid()))))));

CREATE POLICY "Trainers can upload course materials" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'course-materials'::text) AND (split_part(name, '/'::text, 2) = (( SELECT auth.uid() AS uid))::text) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE (((c.id)::text = split_part(objects.name, '/'::text, 1)) AND (c.trainer_id = ( SELECT auth.uid() AS uid))))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'trainer'::text) AND (p.is_approved = true) AND (p.is_active = true))))));

CREATE POLICY "Trainers can view materials for assigned courses" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'course-materials'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))) AND (EXISTS ( SELECT 1
   FROM public.courses c
  WHERE (((c.id)::text = split_part(objects.name, '/'::text, 1)) AND (c.trainer_id = auth.uid()))))));

CREATE POLICY "Trainers can submit knowledge resources" ON public.knowledge_resources FOR INSERT TO authenticated WITH CHECK (((uploaded_by = auth.uid()) AND (status = 'pending'::text) AND (reviewed_by IS NULL) AND (reviewed_at IS NULL) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_approved = true) AND (p.is_active = true))))));

CREATE POLICY "Trainers can view own knowledge submissions" ON public.knowledge_resources FOR SELECT TO authenticated USING (((uploaded_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_approved = true) AND (p.is_active = true))))));

CREATE POLICY "Authenticated users can view approved knowledge resources" ON public.knowledge_resources FOR SELECT TO authenticated USING ((status = 'approved'::text));

CREATE POLICY "Trainers can delete own reviewable knowledge resources" ON public.knowledge_resources FOR DELETE TO authenticated USING (((uploaded_by = auth.uid()) AND (status = ANY (ARRAY['pending'::text, 'rejected'::text]))));

CREATE POLICY "Trainers can edit own reviewable knowledge resources" ON public.knowledge_resources FOR UPDATE TO authenticated USING (((uploaded_by = auth.uid()) AND (status = ANY (ARRAY['pending'::text, 'rejected'::text])))) WITH CHECK (((uploaded_by = auth.uid()) AND (status = ANY (ARRAY['pending'::text, 'rejected'::text]))));

CREATE POLICY "Authenticated users can view approved knowledge hub files" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'knowledge-hub'::text) AND (EXISTS ( SELECT 1
   FROM public.knowledge_resources kr
  WHERE ((kr.storage_path = objects.name) AND (kr.status = 'approved'::text)))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.is_active = true) AND (p.is_approved = true) AND (p.role = ANY (ARRAY['trainee'::text, 'trainer'::text, 'admin'::text])))))));

CREATE POLICY "Trainers can delete own knowledge hub files" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'knowledge-hub'::text) AND (split_part(name, '/'::text, 1) = 'knowledge-hub'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'trainer'::text) AND (p.is_active = true) AND (p.is_approved = true)))) AND (EXISTS ( SELECT 1
   FROM public.knowledge_resources kr
  WHERE ((kr.storage_path = objects.name) AND (kr.uploaded_by = auth.uid()) AND (kr.status = ANY (ARRAY['pending'::text, 'rejected'::text])))))));

REVOKE ALL ON FUNCTION private.admin_review_knowledge_resource(p_resource_id uuid, p_action text, p_reason text) FROM PUBLIC;

GRANT ALL ON FUNCTION private.admin_review_knowledge_resource(p_resource_id uuid, p_action text, p_reason text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_review_knowledge_resource(p_resource_id uuid, p_action text, p_reason text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.admin_review_knowledge_resource(p_resource_id uuid, p_action text, p_reason text) TO authenticated;

GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.knowledge_resources TO service_role;

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.knowledge_resources TO authenticated;
