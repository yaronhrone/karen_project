package com.example.security.model;

// What the customer picked for a box, as sent by the frontend: a chocolate id
// and in how many squares. Names and prices are never taken from the client.
public record BoxChoice(int id, int quantity) {
}
