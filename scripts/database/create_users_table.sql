-- Table: users
-- Including data in case we start to track created packages which is not in scope at the current time.

CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    pulsarToken VARCHAR(256) NOT NULL,
    githubToken VARCHAR(256) NOT NULL,
    created_at BIGINT NOT NULL,
    data JSONB
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to doadmin;
    
COMMENT ON TABLE public.users
    IS 'Container for all Users data.';
