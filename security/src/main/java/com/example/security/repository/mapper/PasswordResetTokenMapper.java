package com.example.security.repository.mapper;

import com.example.security.model.PasswordResetToken;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class PasswordResetTokenMapper implements RowMapper<PasswordResetToken> {
    @Override
    public PasswordResetToken mapRow(ResultSet rs, int rowNum) throws SQLException {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(rs.getInt("id"));
        token.setTokenHash(rs.getString("token_hash"));
        token.setUserEmail(rs.getString("user_email"));
        token.setExpiresAt(rs.getTimestamp("expires_at"));
        token.setUsedAt(rs.getTimestamp("used_at"));
        token.setCreatedAt(rs.getTimestamp("created_at"));
        return token;
    }
}
