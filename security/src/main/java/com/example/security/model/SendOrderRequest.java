package com.example.security.model;

// Optional body of PUT /order (sending the cart). The body itself is optional
// too - older frontends send none at all - so a null request means "no note".
public record SendOrderRequest(String note) {
}
