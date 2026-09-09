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

-- ADD COLUMN, not part of the CREATE TABLE above - same reason as ready_by
-- on orders (see the security service's data-postgresql.sql): CREATE TABLE
-- IF NOT EXISTS is a no-op against a table that already exists in every
-- deployed environment, so a new column has to arrive as its own statement.
--
-- This is a genuinely Postgres-specific feature (generated tsvector column +
-- GIN index) with no comparable built-in equivalent in MySQL - full-text
-- search there means either a much cruder FULLTEXT index (no real ranking,
-- weaker multi-word matching) or reaching for an external search engine
-- entirely. GENERATED ALWAYS ... STORED means this column recomputes itself
-- automatically on every INSERT/UPDATE - no manual trigger to maintain, and
-- no way for it to drift out of sync with name/description.
--
-- 'simple' text search config on purpose, not 'english' or a Hebrew one:
-- Postgres ships no real Hebrew stemming dictionary, and English stemming
-- rules applied to Hebrew text would be actively wrong (not just unhelpful) -
-- 'simple' just lowercases and tokenizes without guessing at word stems,
-- which is the safe, honest choice for a bilingual (Hebrew product
-- names/English admin conventions) catalog like this one.
ALTER TABLE items ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))) STORED;

CREATE INDEX IF NOT EXISTS items_search_vector_idx ON items USING GIN (search_vector);
