CREATE TABLE public.tg_posts (
  chat_id bigint NOT NULL,
  message_id bigint NOT NULL,
  media_group_id text,
  text text NOT NULL DEFAULT '',
  kind text,
  file_id text,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chat_id, message_id)
);
CREATE INDEX tg_posts_posted_at_idx ON public.tg_posts (posted_at DESC);
GRANT SELECT ON public.tg_posts TO anon, authenticated;
GRANT ALL ON public.tg_posts TO service_role;
ALTER TABLE public.tg_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Channel posts are public" ON public.tg_posts FOR SELECT TO anon, authenticated USING (true);