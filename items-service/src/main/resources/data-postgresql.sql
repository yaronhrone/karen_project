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

-- Cookies (15)
INSERT INTO items (name, description, isVeg, image, price, category) VALUES
('עוגיית שוקולד צ׳יפס', 'עוגיית שוקולד צ׳יפס טרייה ופריכה', true, '', 6.50, 'cookie'),
('עוגיית חמאה', 'עוגייה קלאסית חמאתית', true, '', 5.50, 'cookie'),
('עוגיית שיבולת שועל', 'עוגייה בריאה עם שיבולת שועל ודבש', true, '', 7.00, 'cookie'),
('עוגיית בוטנים', 'עוגייה פריכה עם גרגירי בוטנים', true, '', 7.50, 'cookie'),
('עוגיית מייפל', 'עוגייה מתוקה בטעם מייפל', true, '', 6.00, 'cookie'),
('עוגיית קינמון', 'עוגייה מתובלת בקינמון', true, '', 6.50, 'cookie'),
('עוגיית שקדים', 'עוגייה פריכה עם חתיכות שקדים', true, '', 7.00, 'cookie'),
('עוגיית שוקולד לבן', 'עוגיית שוקולד לבן רכה', true, '', 7.50, 'cookie'),
('עוגיית פקאן', 'עוגייה פריכה עם אגוזי פקאן', true, '', 8.00, 'cookie'),
('עוגיית חמאת בוטנים', 'עוגייה עשירה בחמאת בוטנים', true, '', 7.50, 'cookie'),
('עוגיית קוקוס', 'עוגייה רכה ומתוקה עם קוקוס', true, '', 6.50, 'cookie'),
('עוגיית תפוחים וקינמון', 'עוגייה עם חתיכות תפוחים וקינמון', true, '', 7.00, 'cookie'),
('עוגיית שוקולד מריר', 'עוגייה עשירה בשוקולד מריר', true, '', 7.50, 'cookie'),
('עוגיית דובדבנים', 'עוגייה עם דובדבנים מיובשים', true, '', 7.00, 'cookie'),
('עוגיית וניל', 'עוגייה קלאסית בטעם וניל', true, '', 6.00, 'cookie')
ON CONFLICT (name) DO NOTHING;

-- Cakes (15)
INSERT INTO items (name, description, isVeg, image, price, category) VALUES
('עוגת שוקולד', 'עוגת שוקולד עשירה ועסיסית', true, '', 45.00, 'cake'),
('עוגת וניל', 'עוגת וניל קלאסית', true, '', 40.00, 'cake'),
('עוגת גבינה', 'עוגת גבינה אפויה עם קרם גבינה', true, '', 50.00, 'cake'),
('עוגת שכבות שוקולד', 'עוגת שכבות עם קרם שוקולד', true, '', 55.00, 'cake'),
('עוגת פירות יער', 'עוגה עם פירות יער טריים', true, '', 52.00, 'cake'),
('עוגת תפוחים', 'עוגת תפוחים רכה ומתוקה', true, '', 48.00, 'cake'),
('עוגת קרם וניל', 'עוגה עם קרם וניל עשיר', true, '', 50.00, 'cake'),
('עוגת שוקולד ואגוזים', 'עוגה עם שוקולד ואגוזים קלויים', true, '', 55.00, 'cake'),
('עוגת מוס שוקולד', 'עוגת מוס שוקולד אוורירית', true, '', 60.00, 'cake'),
('עוגת דובדבנים', 'עוגה עם דובדבנים טריים', true, '', 52.00, 'cake'),
('עוגת לימון', 'עוגה בטעם לימון רענן', true, '', 50.00, 'cake'),
('עוגת קרם שקדים', 'עוגת קרם עם טעם שקדים', true, '', 55.00, 'cake'),
('עוגת פיסטוק', 'עוגה עשירה בפיסטוק', true, '', 60.00, 'cake'),
('עוגת שוקולד לבן ופירות', 'עוגת שוקולד לבן עם פירות', true, '', 58.00, 'cake'),
('עוגת קרם שוקולד', 'עוגת קרם שוקולד עסיסית', true, '', 55.00, 'cake')
ON CONFLICT (name) DO NOTHING;

-- Chocolates (20)
INSERT INTO items (name, description, isVeg, image, price, category) VALUES
('שוקולד מריר 70%', 'שוקולד מריר איכותי 70%', true, '', 15.00, 'chocolate'),
('שוקולד חלב', 'שוקולד חלב עשיר', true, '', 14.00, 'chocolate'),
('שוקולד לבן', 'שוקולד לבן חלק', true, '', 14.50, 'chocolate'),
('שוקולד אגוזים', 'שוקולד עם חתיכות אגוזים', true, '', 16.00, 'chocolate'),
('שוקולד מריר עם פירות יער', 'שוקולד מריר עם פירות יער', true, '', 16.50, 'chocolate'),
('שוקולד קרמל', 'שוקולד עם קרמל עשיר', true, '', 16.00, 'chocolate'),
('שוקולד מנטה', 'שוקולד בטעם מנטה מרענן', true, '', 15.50, 'chocolate'),
('שוקולד שקדים', 'שוקולד עם שקדים קלויים', true, '', 16.50, 'chocolate'),
('שוקולד לוז', 'שוקולד עם לוז קלוי', true, '', 16.50, 'chocolate'),
('שוקולד קוקוס', 'שוקולד עם קוקוס טחון', true, '', 15.50, 'chocolate'),
('שוקולד תפוז', 'שוקולד בטעם תפוזים', true, '', 15.50, 'chocolate'),
('שוקולד פטל', 'שוקולד עם פטל מיובש', true, '', 16.00, 'chocolate'),
('שוקולד בננה', 'שוקולד עם פירות בננה מיובשים', true, '', 16.00, 'chocolate'),
('שוקולד דובדבן', 'שוקולד עם דובדבנים מיובשים', true, '', 16.50, 'chocolate'),
('שוקולד חם', 'שוקולד מותך חם', true, '', 15.00, 'chocolate'),
('שוקולד קרמל מלוח', 'שוקולד עם קרמל מלוח', true, '', 16.50, 'chocolate'),
('שוקולד פקאן', 'שוקולד עם פקאן קלוי', true, '', 17.00, 'chocolate'),
('שוקולד מריר אגוזי לוז', 'שוקולד מריר עם אגוזי לוז', true, '', 17.00, 'chocolate'),
('שוקולד מוס', 'שוקולד מוס אוורירי', true, '', 17.50, 'chocolate'),
('שוקולד בוטנים', 'שוקולד עם חמאת בוטנים', true, '', 16.50, 'chocolate')
ON CONFLICT (name) DO NOTHING;
