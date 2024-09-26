package com.example.security.repository;

import com.example.security.model.CustomUser;
import com.example.security.repository.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public class UserRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    private static final String USERS_TABLE = "users";

    public CustomUser register(CustomUser user) {
        try {
            String sql = String.format("INSERT INTO %s (first_name, last_name, email, phone, address, username, password) VALUES (?,?,?,?,?,?,?)", USERS_TABLE);
            jdbcTemplate.update(sql, user.getFirstName(), user.getLastName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getUsername(), user.getPassword());
            CustomUser registeredUser = getUserByUsername(user.getUsername());
            registeredUser.setPassword("******");
            return registeredUser;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public String deleteUser(Integer id) {
        try {
            String sql = String.format("DELETE FROM %s WHERE id = ?", USERS_TABLE);
            jdbcTemplate.update(sql, id);
            return "User deleted successfully";
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    public CustomUser getUserById(Integer id) {
        try {
            String sql = String.format("SELECT * FROM %s WHERE id = ?", USERS_TABLE);
            CustomUser user = jdbcTemplate.queryForObject(sql, new UserMapper(), id);
            user.setPassword("******");
            return user;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public CustomUser getUserByUsername(String username) {
        try {
            String sql = String.format("SELECT * FROM %s WHERE username = ?", USERS_TABLE);
            CustomUser user = jdbcTemplate.queryForObject(sql, new UserMapper(), username);
            return user;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public CustomUser getUserByEmail(String email) {
        try {
            String sql = String.format("SELECT * FROM %s WHERE email = ?", USERS_TABLE);
            CustomUser user = jdbcTemplate.queryForObject(sql, new UserMapper(), email);
            user.setPassword("******");
            return user;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public List<CustomUser> getAllUsers() {
        try {
            String sql = String.format("SELECT * FROM %s", USERS_TABLE);
            List<CustomUser> users = jdbcTemplate.query(sql, new UserMapper());
            return users;
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
}
