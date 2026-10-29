package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

// Body of POST /order/box.
public record AddBoxRequest(@JsonProperty("box_item_id") int boxItemId, List<BoxChoice> chocolates) {
}
