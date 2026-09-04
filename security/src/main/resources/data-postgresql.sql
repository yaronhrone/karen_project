-- PostgreSQL variant of data.sql, used only when spring.sql.init.platform=postgresql
-- (see application.yaml / the docker-compose environment). Postgres is a real,
-- persistent database - unlike the H2 in-memory DB used for local dev, this file
-- runs on every container start, so both the DDL and the seed inserts must be
-- idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING) or restarting the stack
-- would fail on the second run.

CREATE TABLE IF NOT EXISTS users (
    id INT GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    password VARCHAR(255),
    role VARCHAR(255) DEFAULT 'USER',
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    PRIMARY KEY (email)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT GENERATED ALWAYS AS IDENTITY,
    user_email VARCHAR(255) NOT NULL,
    order_status VARCHAR(255) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ready_by TIMESTAMP,
    address_shipping VARCHAR(255) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_email) REFERENCES users (email)
);

-- CREATE TABLE IF NOT EXISTS above is a no-op against the orders table
-- that already exists in every deployed environment - this is what
-- actually adds the column there. Optional - set only when Keren advances
-- an order to IN_PROGRESS (see OrderService.advanceOrderStatus); must
-- never be overwritten by a later status change (READY/CANCELLED) once set.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ready_by TIMESTAMP;

CREATE TABLE IF NOT EXISTS order_items (
    id INT GENERATED ALWAYS AS IDENTITY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE TABLE IF NOT EXISTS favorites (
    user_email VARCHAR(255) NOT NULL,
    item_id INT NOT NULL,
    PRIMARY KEY (user_email, item_id),
    FOREIGN KEY (user_email) REFERENCES users (email)
);

-- "Forgot password" reset links - see data.sql (H2 variant) for the full
-- explanation. token_hash is SHA-256 of the raw emailed token, never the
-- raw value; used_at makes a token single-use; a new request deletes any
-- prior unused row for that email rather than allowing more than one live
-- token per user.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT GENERATED ALWAYS AS IDENTITY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_email) REFERENCES users (email)
);

-- Local dev/test seed accounts only. See data.sql (the H2/default variant) for
-- the full explanation - same placeholders, same hashes.
INSERT INTO users (first_name, last_name, email, phone, address, password, role, auth_provider) VALUES
('Test', 'User', 'user1@example.com', '0500000001', '1 Example St', '$2a$10$24P9JHWZJm8yRsJRpP4a.e11OvU9ynMvz6XAKJOrxl8Nhph7mojJ2', 'USER', 'LOCAL'),
('Test', 'Admin', 'admin1@example.com', '0500000002', '2 Example St', '$2a$10$K78Qy75RrDNQcAolPojuM.sI.otXpP23xhZYJ7p2fXrIMoI.k2ehO', 'ADMIN', 'LOCAL'),
('Test', 'Admin', 'admin2@example.com', '0500000003', '3 Example St', '$2a$10$bsK1s9DDupJJV0W6B.BrH.IitOJPFUsnyq.K2/iIH3sPL/lAkYvde', 'ADMIN', 'LOCAL')
ON CONFLICT (email) DO NOTHING;
