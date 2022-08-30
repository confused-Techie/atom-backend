-- Table: public.users
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(256) NOT NULL UNIQUE,
    token VARCHAR(256) UNIQUE,
    avatar VARCHAR(100),
    data JSONB
);
