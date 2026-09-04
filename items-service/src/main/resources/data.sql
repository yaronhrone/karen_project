-- No seed product rows on purpose - the catalog now holds Keren's real
-- products (as of 2026-09-04). This file re-runs on every startup
-- (spring.sql.init.mode: always), so fake seed data left here would keep
-- silently reappearing - it did, for months, which is what prompted this
-- cleanup. Add real products via the admin UI or CSV import instead.
CREATE TABLE items (
id INT AUTO_INCREMENT,
name VARCHAR(200) UNIQUE NOT NULL,
description VARCHAR(1255) NOT NULL,
isVeg BOOLEAN NOT NULL,
image VARCHAR(1000) ,
price DECIMAL(10,2) NOT NULL,
category VARCHAR(100) NOT NULL,
delete_img_id VARCHAR(1000),
PRIMARY KEY(id)
);
