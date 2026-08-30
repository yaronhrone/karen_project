package com.example.security.model;

import java.sql.Timestamp;

public class PasswordResetToken {
    private int id;
    private String tokenHash;
    private String userEmail;
    private Timestamp expiresAt;
    private Timestamp usedAt;
    private Timestamp createdAt;

    public PasswordResetToken() {
    }

    public PasswordResetToken(String tokenHash, String userEmail, Timestamp expiresAt) {
        this.tokenHash = tokenHash;
        this.userEmail = userEmail;
        this.expiresAt = expiresAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Timestamp getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Timestamp expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Timestamp getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Timestamp usedAt) {
        this.usedAt = usedAt;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
