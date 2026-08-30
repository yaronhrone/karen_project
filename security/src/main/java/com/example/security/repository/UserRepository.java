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

    public String register(CustomUser user) {
        String sql = String.format("INSERT INTO %s (first_name, last_name, email, phone, address, password, role, auth_provider) VALUES (?,?,?,?,?,?,?,?)", USERS_TABLE);
        jdbcTemplate.update(sql, user.getFirstName(), user.getLastName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getPassword(), user.getRole().name(), user.getAuthProvider());
        return "User registered successfully";
    }

    public CustomUser findUserByEmail(String email) {
        try{
            String sql = String.format("SELECT * FROM %s WHERE email = ?", USERS_TABLE);
            CustomUser user = jdbcTemplate.queryForObject(sql, new UserMapper(), email);
            return user;
        } catch (Exception e){
            System.out.println(e.getMessage());
            return null;
        }
    }

    public List<CustomUser> findAllUsers(int page, int size) {
        int offset = (page - 1) * size;
        String sql = String.format("SELECT * FROM %s LIMIT ? OFFSET ?", USERS_TABLE);
        List<CustomUser> users = jdbcTemplate.query(sql, new UserMapper(), size, offset);
        return users;
    }

    public CustomUser updateUser(CustomUser user, String currentEmail) {
        String sql = String.format("UPDATE %s SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ? WHERE email = ?", USERS_TABLE);
        jdbcTemplate.update(sql, user.getFirstName(), user.getLastName(), user.getEmail(), user.getPhone(), user.getAddress(), currentEmail);
        return findUserByEmail(user.getEmail());
    }

    public String deleteUser(String email) {
        String sql = String.format("DELETE FROM %s WHERE email = ?", USERS_TABLE);
        jdbcTemplate.update(sql, email);
        return "User deleted successfully";
    }

    // Separate from updateUser on purpose - that method has no business
    // ever silently accepting a password change via the general
    // profile-update path. Only PasswordResetService calls this.
    public void updatePassword(String email, String newHashedPassword) {
        String sql = String.format("UPDATE %s SET password = ? WHERE email = ?", USERS_TABLE);
        jdbcTemplate.update(sql, newHashedPassword, email);
    }
}
