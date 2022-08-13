-- Table: stars 
-- Provided By: @Digitalone1

CREATE TABLE IF NOT EXISTS public.stars (
    packagePointer UUID REFERENCES packages(pointer),
    userId SERIAL REFERENCES users(id),
    PRIMARY KEY (packagePointer, userId)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.stars 
    OWNER to doadmin;
    
COMMENT ON TABLE public.stars 
    IS 'Container for all Star Data.';
