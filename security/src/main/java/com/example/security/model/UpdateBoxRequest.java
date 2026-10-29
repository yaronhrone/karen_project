package com.example.security.model;

import java.util.List;

// Body of PUT /order/box/{order_item_id}: the new contents of a box that is
// already in the customer's open order.
public record UpdateBoxRequest(List<BoxChoice> chocolates) {
}
