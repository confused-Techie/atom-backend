-- Table: public.pointers
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE TABLE names (
    name VARCHAR(128) NOT NULL PRIMARY KEY,
    pointer UUID NOT NULL REFERENCES packages(pointer)
);
