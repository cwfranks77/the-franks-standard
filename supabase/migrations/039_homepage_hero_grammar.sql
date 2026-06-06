-- Homepage hero line 2: present tense for correct grammar ("seller puts proof on file").
update public.site_marketing_content
set payload = jsonb_set(
  payload,
  '{heroTitleLine2}',
  '"the seller puts proof on file."'::jsonb
)
where content_key = 'homepage'
  and payload->>'heroTitleLine2' = 'the seller put proof on file.';
