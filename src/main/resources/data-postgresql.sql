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
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'USER',
    PRIMARY KEY (username)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(255) NOT NULL,
    order_status VARCHAR(255) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address_shipping VARCHAR(255) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (username) REFERENCES users (username)
);

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
    username VARCHAR(255) NOT NULL,
    item_id INT NOT NULL,
    PRIMARY KEY (username, item_id),
    FOREIGN KEY (username) REFERENCES users (username)
);

-- Local dev/test seed accounts only. See data.sql (the H2/default variant) for
-- the full explanation - same placeholders, same hashes, same usernames.
INSERT INTO users (first_name, last_name, email, phone, address, username, password, role) VALUES
('Test', 'User', 'user1@example.com', '0500000001', '1 Example St', 'mikigabay', '$2a$10$24P9JHWZJm8yRsJRpP4a.e11OvU9ynMvz6XAKJOrxl8Nhph7mojJ2', 'USER'),
('Test', 'Admin', 'admin1@example.com', '0500000002', '2 Example St', 'amitaygabay', '$2a$10$K78Qy75RrDNQcAolPojuM.sI.otXpP23xhZYJ7p2fXrIMoI.k2ehO', 'ADMIN'),
('Test', 'Admin', 'admin2@example.com', '0500000003', '3 Example St', 'yaron', '$2a$10$bsK1s9DDupJJV0W6B.BrH.IitOJPFUsnyq.K2/iIH3sPL/lAkYvde', 'ADMIN')
ON CONFLICT (username) DO NOTHING;
