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

INSERT INTO packages (pointer, name, creation_method, downloads, stargazers_count, data)
VALUES (
  'd28c7ce5-c9c4-4fb6-a499-a7c6dcec355b', 'language-css', 'user made', 400004, 76,
  '{"name": "language-css", "description": "CSS Support in Atom", "keywords": ["tree-sitter"]}'
), (
  'd27dbd37-e58e-4e02-b804-9e3e6ae02fb1', 'language-cpp', 'user made', 849156, 91,
  '{"name": "language-cpp", "description": "C++ Support in Atom", "keywords": ["tree-sitter"]}'
);

INSERT INTO names (name, pointer)
VALUES ('language-css', 'd28c7ce5-c9c4-4fb6-a499-a7c6dcec355b'),
	('language-cpp', 'd27dbd37-e58e-4e02-b804-9e3e6ae02fb1');

INSERT INTO versions (id, package, status, semver, license, engine, meta)
VALUES (
  1, 'd28c7ce5-c9c4-4fb6-a499-a7c6dcec355b', 'published', '0.45.7', 'MIT', '{"atom": "*", "node": "*"}',
  '{"name": "language-css", "description": "CSS Support in Atom", "keywords": ["tree-sitter"]}'
), (
  2, 'd28c7ce5-c9c4-4fb6-a499-a7c6dcec355b', 'latest', '0.46.0', 'MIT', '{"atom": "*", "node": "*"}',
  '{"name": "language-css", "description": "CSS Support in Atom", "keywords": ["tree-sitter"]}'
), (
  3, 'd27dbd37-e58e-4e02-b804-9e3e6ae02fb1', 'published', '0.11.8', 'MIT', '{"atom": "*", "node": "*"}',
  '{"name": "language-cpp", "description": "C++ Support in Atom", "keywords": ["tree-sitter"]}'
), (
  4, 'd27dbd37-e58e-4e02-b804-9e3e6ae02fb1', 'latest', '0.11.9', 'MIT', '{"atom": "*", "node": "*"}',
  '{"name": "language-cpp", "description": "C++ Support in Atom", "keywords": ["tree-sitter"]}'
);
