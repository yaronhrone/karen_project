-- PostgreSQL variant of data.sql, used only when spring.sql.init.platform=postgresql
-- (see application.yaml / the docker-compose environment). Postgres is a real,
-- persistent database - unlike the H2 in-memory DB used for local dev, this file
-- runs on every container start, so both the DDL and the seed inserts must be
-- idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING) or restarting the stack
-- would fail on the second run.

CREATE TABLE IF NOT EXISTS items (
    id INT GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(200) UNIQUE NOT NULL,
    description VARCHAR(1255) NOT NULL,
    isVeg BOOLEAN NOT NULL,
    image VARCHAR(1000),
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    delete_img_id VARCHAR(1000),
    PRIMARY KEY(id)
);

-- No seed product rows on purpose - the catalog now holds Keren's real
-- products (as of 2026-09-04). This file re-runs on every container start
-- (spring.sql.init.mode: always) - fake seed data left here would keep
-- silently reappearing after every wipe, which is exactly what happened for
-- months before this cleanup. Add real products via the admin UI or CSV
-- import instead - never re-add fake seed rows here.
