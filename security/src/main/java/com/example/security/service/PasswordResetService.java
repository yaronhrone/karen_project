package com.example.security.service;

import com.example.security.model.CustomUser;
import com.example.security.model.PasswordResetToken;
import com.example.security.repository.PasswordResetTokenRepository;
import com.example.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.regex.Pattern;

@Service
public class PasswordResetService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${password-reset.token-expiry-minutes}")
    private int tokenExpiryMinutes;

    // Same value SecurityConfigure already uses for CORS - reused here
    // rather than adding a second env var that would need to be kept in
    // sync with it.
    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    // Minimum gap between two reset emails to the same address - catches an
    // accidental double-click on "שלח קישור לאיפוס" (fires within ~1s) and
    // acts as a basic anti-spam guard, without any new infrastructure
    // (Redis, a scheduled job, etc. would all be overkill for a single-
    // instance app - the existing created_at column is enough).
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    // Same strength rule already enforced client-side in Register.jsx -
    // enforced here too since this is a brand-new password-setting path,
    // not an existing one that already relied on client-only validation.
    private static final Pattern PASSWORD_REGEX =
            Pattern.compile("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");

    // No email-enumeration signal: does real work only when the account
    // exists, but the caller (UserController) returns the exact same
    // response either way - this method's return type is intentionally
    // void so nothing here can accidentally leak that distinction outward.
    public void requestReset(String email) {
        CustomUser user = userRepository.findUserByEmail(email);
        if (user == null) {
            return;
        }
        // Silently skip if we already sent one within the cooldown window -
        // same response either way to the caller, so this stays invisible
        // and doesn't become a second enumeration signal of its own.
        if (tokenRepository.hasRecentRequest(email, RESEND_COOLDOWN_SECONDS)) {
            return;
        }

        String rawToken = generateRawToken();
        String tokenHash = sha256Hex(rawToken);
        Timestamp expiresAt = Timestamp.from(Instant.now().plusSeconds(tokenExpiryMinutes * 60L));

        // A fresh request supersedes anything requested before, used or not
        // - at most one live token per user.
        tokenRepository.deleteAllForEmail(email);
        tokenRepository.insert(new PasswordResetToken(tokenHash, email, expiresAt));

        String resetLink = frontendUrl + "/reset-password/" + rawToken;
        try {
            mailService.sendPasswordResetEmail(email, resetLink);
        } catch (Exception e) {
            // Same rule as OrderService's WhatsApp notification: a
            // mail-sending failure must never surface differently than
            // "email not found" (no enumeration oracle), and must never
            // block anything else this request does.
        }
    }

    // Called from UserService.deleteUser - password_reset_tokens.user_email has
    // a FK on users.email with no cascade, so a leftover row (from anyone who
    // ever requested a reset, used or not) blocks the DELETE outright.
    public void deleteAllTokensForEmail(String email) {
        tokenRepository.deleteAllForEmail(email);
    }

    public boolean resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || newPassword == null || !PASSWORD_REGEX.matcher(newPassword).matches()) {
            return false;
        }
        String tokenHash = sha256Hex(rawToken);
        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash);
        boolean expired = token == null || token.getExpiresAt().before(Timestamp.from(Instant.now()));
        if (token == null || token.getUsedAt() != null || expired) {
            return false;
        }

        userRepository.updatePassword(token.getUserEmail(), passwordEncoder.encode(newPassword));
        tokenRepository.markUsed(tokenHash, Timestamp.from(Instant.now()));
        return true;
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // SHA-256, not bcrypt: the raw token is already a full-entropy 256-bit
    // random value (unlike a human password), so there's nothing for a slow
    // hash to defend against here - a fast cryptographic hash is enough to
    // keep a DB leak alone from handing out usable tokens.
    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed available on every JVM - unreachable in
            // practice, the checked exception just has to go somewhere.
            throw new IllegalStateException(e);
        }
    }
}
