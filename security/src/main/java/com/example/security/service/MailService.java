package com.example.security.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the "forgot password" reset email via Gmail SMTP. Same shape as
 * WhatsAppNotificationService: config comes from a placeholder-defaulted
 * @Value (see application.yaml), isConfigured()/isSet() no-ops cleanly
 * before Yaron sets up the real Gmail App Password, and a send failure
 * never throws back to the caller - see PasswordResetService, which wraps
 * this the same way OrderService wraps the WhatsApp notification.
 */
@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

    // Doubles as the "From" address - with Gmail SMTP the From has to match
    // the authenticated account anyway, so there's no reason to configure
    // it separately from spring.mail.username.
    @Value("${spring.mail.username}")
    private String gmailAddress;

    private boolean isConfigured() {
        return isSet(gmailAddress);
    }

    private boolean isSet(String value) {
        return value != null && !value.isBlank() && !value.startsWith("PASTE_");
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (!isConfigured()) {
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(gmailAddress);
        message.setTo(toEmail);
        message.setSubject("איפוס סיסמה - היהלומים של קרן");
        message.setText(
                "קיבלנו בקשה לאיפוס הסיסמה שלך.\n\n" +
                "לחצו על הקישור הבא כדי לבחור סיסמה חדשה (בתוקף ל-30 דקות):\n" +
                resetLink + "\n\n" +
                "אם לא ביקשתם איפוס סיסמה, אפשר להתעלם מהודעה זו."
        );
        mailSender.send(message);
    }
}
