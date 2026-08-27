package com.example.security.service;

import com.example.security.clientApi.GreenApiClient;
import com.example.security.model.GreenApiMessageRequest;
import com.example.security.model.Order;
import com.example.security.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppNotificationService {
    @Autowired
    private GreenApiClient greenApiClient;

    @Value("${green-api.id-instance}")
    private String idInstance;
    @Value("${green-api.api-token-instance}")
    private String apiTokenInstance;
    @Value("${green-api.keren-phone}")
    private String kerenPhone;

    // These three env vars aren't set up yet (Yaron still needs to create the
    // GreenAPI account/instance himself) - application.yaml defaults them to
    // placeholder strings starting with PASTE_ when the env var is unset.
    // But docker-compose.yml gives them a `:-` (empty string) fallback so
    // compose doesn't warn about missing vars - and Spring's ${VAR:default}
    // only falls back to the placeholder when the env var is truly unset, not
    // when it's set-but-empty. So both "still the placeholder" and "blank"
    // count as not configured here.
    private boolean isConfigured() {
        return isSet(idInstance) && isSet(apiTokenInstance) && isSet(kerenPhone);
    }

    private boolean isSet(String value) {
        return value != null && !value.isBlank() && !value.startsWith("PASTE_");
    }

    public void sendNewOrderNotification(Order order, String customerPhone) {
        if (!isConfigured()) {
            System.out.println("GreenAPI not configured yet - skipping WhatsApp notification for order " + order.getId());
            return;
        }

        String chatId = kerenPhone + "@c.us";
        String message = buildMessage(order, customerPhone);
        greenApiClient.sendMessage(idInstance, apiTokenInstance, new GreenApiMessageRequest(chatId, message));
    }

    private String buildMessage(Order order, String customerPhone) {
        StringBuilder sb = new StringBuilder();
        sb.append("הזמנה #").append(order.getId()).append(" התקבלה!\n");
        sb.append("לקוח: ").append(order.getUserEmail()).append("\n");
        // The whole point of including this: Keren can immediately open
        // Bit/PayBox and send a payment request to this exact number for the
        // order total, without having to go look it up anywhere first.
        sb.append("טלפון: ").append(customerPhone != null && !customerPhone.isBlank() ? customerPhone : "לא זמין").append("\n\n");
        for (OrderItem item : order.getOrderItems()) {
            sb.append("- ").append(item.getName())
                    .append(" x").append(item.getQuantity())
                    .append(" (₪").append(item.getTotalPrice()).append(")\n");
        }
        sb.append("\nסה\"כ: ₪").append(order.getTotalPrice());
        // Tried having Keren reply here to update status, but the instance
        // IS her own WhatsApp number - a message she sends to her own
        // self-chat is never delivered as an "incoming" webhook event (there's
        // no second party for it to come from), confirmed directly against
        // GreenAPI's own API, not just our side. Would need a second, separate
        // number acting as the "bot" for that to work - decided not to do
        // that for now, so status stays admin-panel-only (see DECISIONS.md).
        return sb.toString();
    }
}
