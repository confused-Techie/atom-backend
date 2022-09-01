-- Table: stars 
-- Drafted: https://github.com/confused-Techie/atom-community-server-backend-JS/issues/39
-- Credit: @Digitalone1

CREATE TABLE stars (
    package UUID NOT NULL REFERENCES packages(pointer),
    userid INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (package, userid)
);
