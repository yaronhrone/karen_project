#!/bin/sh
# Runs once, only when the postgres data volume is first initialized (the
# official postgres image only creates the single database named by
# POSTGRES_DB - this creates the second one so items-service and
# users-service each get their own database in the same container).
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE items_db;
    CREATE DATABASE users_db;
EOSQL
