-- Table: public.packages

-- DROP TABLE IF EXISTS public.packages;

CREATE TABLE IF NOT EXISTS public.packages
(
    pointer uuid NOT NULL,
    data jsonb
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.packages
    OWNER to doadmin;

COMMENT ON TABLE public.packages
    IS 'Container for all package data.';
