-- Create users table
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'USER',
    PRIMARY KEY (id)
);

--INSERT INTO users (first_name, last_name, email, phone, address, username, password, role)
--VALUES('a', 'aa', 'a@gmail.com', '0524436671', 'aen eliezer 45, netanya', 'Amitay', 'Amitay@1', 'ADMIN'),
--('b', 'bb', 'b@gmail.com', '0504380333', 'ben eliezer 45, netanya', 'Bmitay', 'Bmitay@2', 'USER'),
--('c', 'cc', 'c@gmail.com', '0524125553', 'cen eliezer 45, netanya', 'Cmitay', 'Cmitay@3', 'USER'),
--('d', 'dd', 'd@gmail.com', '0523715940', 'den eliezer 45, netanya', 'Dmitay', 'Dmitay@4', 'USER'),
--('e', 'ee', 'e@gmail.com', '0548976525', 'een eliezer 45, netanya', 'Emitay', 'Emitay@5', 'USER'),
--('f', 'ff', 'f@gmail.com', '0527468720', 'fen eliezer 45, netanya', 'Fmitay', 'Fmitay@6', 'USER'),
--('g', 'gg', 'g@gmail.com', '0554809620', 'gen eliezer 45, netanya', 'Gmitay', 'Gmitay@7', 'USER'),
--('h', 'hh', 'h@gmail.com', '0508887777', 'hen eliezer 45, netanya', 'Hmitay', 'Hmitay@8', 'USER'),
--('i', 'ii', 'i@gmail.com', '0556632241', 'ien eliezer 45, netanya', 'Imitay', 'Imitay@9', 'USER'),
--('j', 'jj', 'j@gmail.com', '0536645528', 'jen eliezer 45, netanya', 'Jmitay', 'Jmitay@10', 'USER');

-- After bcrypt
INSERT INTO users (first_name, last_name, email, phone, address, username, password, role)
VALUES('a', 'aa', 'a@gmail.com', '0524436671', 'aen eliezer 45, netanya', 'Amitay', '$2a$10$hZZgiyI3PBkK0ydU1yAwIuBWTwe0iz0eTyO7IDF1Envvm2tTwi6OQa', 'ADMIN'),
('b', 'bb', 'b@gmail.com', '0504380333', 'ben eliezer 45, netanya', 'Bmitay', '$2a$10$qbRkHgRVU9iq2TtFkeGVmOlo9/TYFXkaLqEu2D8xCrOeC3P0H.6v6', 'USER'),
('c', 'cc', 'c@gmail.com', '0524125553', 'cen eliezer 45, netanya', 'Cmitay', '$2a$10$7D6bOBFh9UPfH5e5ms3PquMeUBGoHNkFcz2fDEUg7DNTJKnnm6e4O', 'USER'),
('d', 'dd', 'd@gmail.com', '0523715940', 'den eliezer 45, netanya', 'Dmitay', '$2a$10$Y1JBr2/NoCMtpN8yJhOXCOYF2XrOUKddOBB1OTgB.Xam9eU8eF4iu', 'USER'),
('e', 'ee', 'e@gmail.com', '0548976525', 'een eliezer 45, netanya', 'Emitay', '$2a$10$ujxNV1/rLOnIK6H7F9Y7gO5jokZa3jMK9WhTBhJxqP39a65xSRi6e', 'USER'),
('f', 'ff', 'f@gmail.com', '0527468720', 'fen eliezer 45, netanya', 'Fmitay', '$2a$10$e8ZKHp.j93u3NCyWhwGfE.vAw4Xx9x6cpBOhN4ltAKBUB31LBvP4W', 'USER'),
('g', 'gg', 'g@gmail.com', '0554809620', 'gen eliezer 45, netanya', 'Gmitay', '$2a$10$bl60lU/p8zG9WSwSYZ.Oy.4K.SA8dXk05PCaGhn9Fs1z6ZdaB9ziG', 'USER'),
('h', 'hh', 'h@gmail.com', '0508887777', 'hen eliezer 45, netanya', 'Hmitay', '$2a$10$hU.GZJ/w.6W3IBtrCPb/1eOa2MOEAzywD9fn1OWr9TYRpHZW50niW', 'USER'),
('i', 'ii', 'i@gmail.com', '0556632241', 'ien eliezer 45, netanya', 'Imitay', '$2a$10$FQrTpy/lbw4w9KO3QQEJDOUqW1jKr3X8GvPBgkTeU4wt.OO5W1VHi', 'USER'),
('j', 'jj', 'j@gmail.com', '0536645528', 'jen eliezer 45, netanya', 'Jmitay', '$2a$10$GOnzLwK9x5fKTX0.tK60teyW7TX9M3jZg8iZf4VGzP12ZuZdbQk4C', 'USER');






