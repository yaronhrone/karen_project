package com.example.security.model;

public class GreenApiMessageRequest {
    private String chatId;
    private String message;

    public GreenApiMessageRequest() {
    }

    public GreenApiMessageRequest(String chatId, String message) {
        this.chatId = chatId;
        this.message = message;
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
