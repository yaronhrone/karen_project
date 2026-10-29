package com.example.security.repository.mapper;

import com.example.security.model.BoxChocolate;
import com.example.security.model.OrderItem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

public class OrderItemsMapper implements RowMapper<OrderItem> {
    private static final ObjectMapper JSON = new ObjectMapper();

    @Override
    public OrderItem mapRow(ResultSet rs, int rowNum) throws SQLException {
        OrderItem orderItem = new OrderItem();
        orderItem.setId(rs.getInt("id"));
        orderItem.setProductId(rs.getInt("product_id"));
        orderItem.setOrderId(rs.getInt("order_id"));
        orderItem.setQuantity(rs.getInt("quantity"));
        orderItem.setPrice(rs.getBigDecimal("price"));
        orderItem.setComposition(parseComposition(rs.getString("composition")));
        return orderItem;
    }

    // A malformed value must not take the whole order view down: treat it as
    // "no composition".
    private static List<BoxChocolate> parseComposition(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return JSON.readValue(json, new TypeReference<List<BoxChocolate>>() { });
        } catch (Exception e) {
            return null;
        }
    }
}
