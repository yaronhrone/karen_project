package com.example.security.controller;

import com.example.security.model.GreenApiWebhookPayload;
import com.example.security.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

// GreenAPI calls this directly (see SecurityConfigure - it's in permitAll,
// there's no JWT to check here). Lets Keren advance an order's status by
// simply replying to the WhatsApp notification she already gets for it -
// see WhatsAppNotificationService for the "reply with ... " instructions
// baked into that notification text.
@RestController
@RequestMapping("/webhook")
public class WhatsAppWebhookController {
    @Autowired
    private OrderService orderService;

    @Value("${green-api.keren-phone}")
    private String kerenPhone;

    private static final Pattern ORDER_NUMBER = Pattern.compile("\\d+");

    @PostMapping("/greenapi")
    public ResponseEntity<Void> handleGreenApiWebhook(@RequestBody GreenApiWebhookPayload payload) {
        try {
            process(payload);
        } catch (Exception e) {
            // A webhook must never fail from GreenAPI's point of view - an
            // unparseable/unexpected message is just skipped, not an error.
            System.out.println(e.getMessage() + " - failed to process WhatsApp webhook");
        }
        return ResponseEntity.ok().build();
    }

    private void process(GreenApiWebhookPayload payload) {
        if (payload == null || !"incomingMessageReceived".equals(payload.getTypeWebhook())) {
            return;
        }

        // Only messages from/to Keren's own number count - this instance IS
        // her personal WhatsApp, so it also carries her completely unrelated
        // personal conversations. Anything not in her own self-chat must be
        // left alone.
        String chatId = payload.getSenderData() != null ? payload.getSenderData().getChatId() : null;
        if (chatId == null || !chatId.equals(kerenPhone + "@c.us")) {
            return;
        }

        String text = extractText(payload);
        if (text == null || text.isBlank()) {
            return;
        }

        String status = null;
        if (text.contains("בהכנה")) {
            status = "IN_PROGRESS";
        } else if (text.contains("מוכן")) {
            status = "READY";
        }
        if (status == null) {
            return;
        }

        Matcher matcher = ORDER_NUMBER.matcher(text);
        if (!matcher.find()) {
            return;
        }
        int orderId = Integer.parseInt(matcher.group());

        orderService.advanceOrderStatus(orderId, status);
    }

    private String extractText(GreenApiWebhookPayload payload) {
        if (payload.getMessageData() == null) {
            return null;
        }
        if (payload.getMessageData().getTextMessageData() != null) {
            return payload.getMessageData().getTextMessageData().getTextMessage();
        }
        if (payload.getMessageData().getExtendedTextMessageData() != null) {
            return payload.getMessageData().getExtendedTextMessageData().getText();
        }
        return null;
    }
}
