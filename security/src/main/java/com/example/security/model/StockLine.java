package com.example.security.model;

// One line of a stock take/restore call to items-service: how many of item `id`.
public record StockLine(int id, int quantity) {
}
