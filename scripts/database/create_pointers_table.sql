-- Table: public.pointers

-- DROP TABLE IF EXISTS public.pointers;

CREATE TABLE IF NOT EXISTS public.pointers
(
    name text COLLATE pg_catalog."default" NOT NULL,
    pointer uuid NOT NULL
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.pointers
    OWNER to doadmin;
