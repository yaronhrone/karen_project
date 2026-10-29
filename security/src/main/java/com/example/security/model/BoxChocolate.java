package com.example.security.model;

// One chocolate inside a box line: how many squares of the box hold it.
// `name` is a snapshot taken when the box was added to the order.
public record BoxChocolate(int id, String name, int quantity) {
}
