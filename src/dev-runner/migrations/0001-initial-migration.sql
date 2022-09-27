-- Create packages TABLE

CREATE EXTENSION pgcrypto;

CREATE TABLE packages (
  pointer UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  creation_method VARCHAR(128),
  downloads BIGINT NOT NULL DEFAULT 0,
  stargazers_count BIGINT NOT NULL DEFAULT 0,
  original_stargazers BIGINT NOT NULL DEFAULT 0,
  data JSONB
);

-- Create names Table

CREATE TABLE names (
  name VARCHAR(128) NOT NULL PRIMARY KEY,
  pointer UUID NOT NULL REFERENCES packages(pointer)
);

-- Create users Table

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  username VARCHAR(256) NOT NULL UNIQUE,
  token VARCHAR(256) UNIQUE,
  avatar VARCHAR(100),
  data JSONB
);

-- Create stars Table

CREATE TABLE stars (
  package UUID NOT NULL REFERENCES packages(pointer),
  userid INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (package, userid)
);

-- Create versions Table

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

------------------------------------------------------------------------------

-- Enter our Test data into the Database.
