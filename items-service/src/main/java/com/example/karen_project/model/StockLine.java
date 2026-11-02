package com.example.karen_project.model;

// One line of a stock take/restore request: how many of item `id`.
public record StockLine(int id, int quantity) {
}
