package com.example.security.model;

// Deliberately loose/partial mapping of GreenAPI's incomingMessageReceived
// webhook body - only the fields WhatsAppWebhookController actually needs.
// Unknown/irrelevant fields (instanceData, idMessage, ...) are simply
// ignored by Jackson rather than mapped.
public class GreenApiWebhookPayload {
    private String typeWebhook;
    private SenderData senderData;
    private MessageData messageData;

    public String getTypeWebhook() {
        return typeWebhook;
    }

    public void setTypeWebhook(String typeWebhook) {
        this.typeWebhook = typeWebhook;
    }

    public SenderData getSenderData() {
        return senderData;
    }

    public void setSenderData(SenderData senderData) {
        this.senderData = senderData;
    }

    public MessageData getMessageData() {
        return messageData;
    }

    public void setMessageData(MessageData messageData) {
        this.messageData = messageData;
    }

    public static class SenderData {
        private String chatId;

        public String getChatId() {
            return chatId;
        }

        public void setChatId(String chatId) {
            this.chatId = chatId;
        }
    }

    public static class MessageData {
        private TextMessageData textMessageData;
        // WhatsApp's "swipe to reply" gesture (the natural way to reply to a
        // specific message) produces this variant instead of textMessageData -
        // both need to be checked.
        private ExtendedTextMessageData extendedTextMessageData;

        public TextMessageData getTextMessageData() {
            return textMessageData;
        }

        public void setTextMessageData(TextMessageData textMessageData) {
            this.textMessageData = textMessageData;
        }

        public ExtendedTextMessageData getExtendedTextMessageData() {
            return extendedTextMessageData;
        }

        public void setExtendedTextMessageData(ExtendedTextMessageData extendedTextMessageData) {
            this.extendedTextMessageData = extendedTextMessageData;
        }
    }

    public static class TextMessageData {
        private String textMessage;

        public String getTextMessage() {
            return textMessage;
        }

        public void setTextMessage(String textMessage) {
            this.textMessage = textMessage;
        }
    }

    public static class ExtendedTextMessageData {
        private String text;

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }
}
