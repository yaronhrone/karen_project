
CREATE TABLE users (
    id INT AUTO_INCREMENT,
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
CREATE TABLE orders (
    id INT AUTO_INCREMENT ,
    user_email VARCHAR(255) NOT NULL,
    order_status VARCHAR(255) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Optional - set only when Keren advances an order to IN_PROGRESS (see
    -- OrderService.advanceOrderStatus). Nullable on purpose: most orders
    -- never get one, and it must never be overwritten by a later status
    -- change (READY/CANCELLED) once set.
    ready_by TIMESTAMP,
    address_shipping VARCHAR(255) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_email) REFERENCES users (email)
    );

CREATE TABLE order_items (
    id INT AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders (id)
);
CREATE TABLE favorites (
    user_email VARCHAR(255) NOT NULL,
    item_id INT NOT NULL,
    PRIMARY KEY (user_email, item_id),
    FOREIGN KEY (user_email) REFERENCES users (email)
    );

-- "Forgot password" reset links. token_hash is SHA-256 of the raw token
-- emailed to the user - never store the raw token at rest. used_at makes a
-- token single-use; expires_at bounds how long a link stays valid. A new
-- request deletes any prior unused row for that email (see
-- PasswordResetTokenRepository.deleteAllForEmail) rather than allowing more
-- than one live token per user.
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_email) REFERENCES users (email)
);


-- Local dev/test seed accounts only. Password hashes are kept unchanged so
-- existing local logins keep working; real names/emails/phones/addresses
-- that used to sit here were replaced with placeholders so they don't live
-- in source control. Passwords behind these hashes are only known to
-- whoever originally set them - swap in your own test data as needed, and
-- never seed real customer data here.
INSERT INTO users (first_name, last_name, email, phone, address, password, role, auth_provider) VALUES
('Test', 'User', 'user1@example.com', '0500000001', '1 Example St', '$2a$10$24P9JHWZJm8yRsJRpP4a.e11OvU9ynMvz6XAKJOrxl8Nhph7mojJ2', 'USER', 'LOCAL'),
('Test', 'Admin', 'admin1@example.com', '0500000002', '2 Example St', '$2a$10$K78Qy75RrDNQcAolPojuM.sI.otXpP23xhZYJ7p2fXrIMoI.k2ehO', 'ADMIN', 'LOCAL'),
('Test', 'Admin', 'admin2@example.com', '0500000003', '3 Example St', '$2a$10$bsK1s9DDupJJV0W6B.BrH.IitOJPFUsnyq.K2/iIH3sPL/lAkYvde', 'ADMIN', 'LOCAL');









