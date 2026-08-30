package com.example.security.repository;

import com.example.security.model.PasswordResetToken;
import com.example.security.repository.mapper.PasswordResetTokenMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;

@Repository
public class PasswordResetTokenRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final String TABLE = "password_reset_tokens";

    // Called before every insert so at most one live token ever exists per
    // user - a fresh request supersedes whatever was requested before,
    // used or not.
    public void deleteAllForEmail(String email) {
        String sql = String.format("DELETE FROM %s WHERE user_email = ?", TABLE);
        jdbcTemplate.update(sql, email);
    }

    public void insert(PasswordResetToken token) {
        String sql = String.format("INSERT INTO %s (token_hash, user_email, expires_at) VALUES (?, ?, ?)", TABLE);
        jdbcTemplate.update(sql, token.getTokenHash(), token.getUserEmail(), token.getExpiresAt());
    }

    public PasswordResetToken findByTokenHash(String tokenHash) {
        try {
            String sql = String.format("SELECT * FROM %s WHERE token_hash = ?", TABLE);
            return jdbcTemplate.queryForObject(sql, new PasswordResetTokenMapper(), tokenHash);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public void markUsed(String tokenHash, Timestamp usedAt) {
        String sql = String.format("UPDATE %s SET used_at = ? WHERE token_hash = ?", TABLE);
        jdbcTemplate.update(sql, usedAt, tokenHash);
    }
}
