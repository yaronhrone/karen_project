
CREATE TABLE users (
    id INT AUTO_INCREMENT,
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
CREATE TABLE orders (
    id INT AUTO_INCREMENT ,
    username VARCHAR(255) NOT NULL,
    order_status VARCHAR(255) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address_shipping VARCHAR(255) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (username) REFERENCES users (username)
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
    username VARCHAR(255) NOT NULL,
    item_id INT NOT NULL,
    PRIMARY KEY (username, item_id),
    FOREIGN KEY (username) REFERENCES users (username)
    );


-- Local dev/test seed accounts only. Usernames and password hashes are kept
-- unchanged so existing local logins keep working; real names/emails/phones/
-- addresses that used to sit here were replaced with placeholders so they
-- don't live in source control. Passwords behind these hashes are only
-- known to whoever originally set them - swap in your own test data as
-- needed, and never seed real customer data here.
INSERT INTO users (first_name, last_name, email, phone, address, username, password, role) VALUES
('Test', 'User', 'user1@example.com', '0500000001', '1 Example St', 'mikigabay', '$2a$10$24P9JHWZJm8yRsJRpP4a.e11OvU9ynMvz6XAKJOrxl8Nhph7mojJ2', 'USER'),
('Test', 'Admin', 'admin1@example.com', '0500000002', '2 Example St', 'amitaygabay', '$2a$10$K78Qy75RrDNQcAolPojuM.sI.otXpP23xhZYJ7p2fXrIMoI.k2ehO', 'ADMIN'),
('Test', 'Admin', 'admin2@example.com', '0500000003', '3 Example St', 'yaron', '$2a$10$bsK1s9DDupJJV0W6B.BrH.IitOJPFUsnyq.K2/iIH3sPL/lAkYvde', 'ADMIN');









