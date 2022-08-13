-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    pulsartoken character varying(256) COLLATE pg_catalog."default" NOT NULL,
    githubtoken character varying(256) COLLATE pg_catalog."default" NOT NULL,
    created_at bigint NOT NULL,
    data jsonb,
    username character varying(256) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to doadmin;

COMMENT ON TABLE public.users
    IS 'Container for all Users data.';
