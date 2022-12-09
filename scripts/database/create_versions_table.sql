-- Table: public.versions
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE TYPE versionStatus AS ENUM('latest', 'published', 'removed');

CREATE TABLE versions (
    id SERIAL PRIMARY KEY,
    package UUID NOT NULL REFERENCES packages(pointer),
    status versionStatus NOT NULL,
    semver VARCHAR(256) NOT NULL,
    license VARCHAR(128) NOT NULL,
    engine JSONB NOT NULL,
    meta JSONB
);

-- Constrain to avoiding the duplication of already published versions

ALTER TABLE versions ADD CONSTRAINT unique_pack_version UNIQUE(package, semver);

-- Constrain to force the semantic version 2.0 format

ALTER TABLE versions ADD CONSTRAINT semver2_format CHECK (semver ~ '^\d+\.\d+\.\d+');

-- Generated columns to help sorting by semver

ALTER TABLE versions ADD COLUMN semver_v1 INTEGER
    GENERATED ALWAYS AS (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[1] AS INTEGER)) STORED;
ALTER TABLE versions ADD COLUMN semver_v2 INTEGER
    GENERATED ALWAYS AS (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[2] AS INTEGER)) STORED;
ALTER TABLE versions ADD COLUMN semver_v3 INTEGER
    GENERATED ALWAYS AS (CAST ((regexp_match(semver, '^(\d+)\.(\d+)\.(\d+)'))[3] AS INTEGER)) STORED;
