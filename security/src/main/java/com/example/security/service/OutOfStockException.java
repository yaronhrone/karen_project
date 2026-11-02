package com.example.security.service;

// An order could not be sent because some of its items are not in stock any more.
// The message is shown to the customer as-is.
public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String message) {
        super(message);
    }
}
