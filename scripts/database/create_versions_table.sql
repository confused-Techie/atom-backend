-- Table: public.versions
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE TYPE versionStatus AS ENUM('latest', 'published', 'removed');

CREATE TABLE versions (
    id SERIAL PRIMARY KEY,
    package UUID NOT NULL REFERENCES packages(pointer),
    status versionStatus NOT NULL,
    semver VARCHAR(256) NOT NULL,
    license VARCHAR(256) NOT NULL,
    engine JSONB NOT NULL,
    meta JSONB
);
