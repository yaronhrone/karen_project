package com.example.security.repository.mapper;

import com.example.security.model.OrderItem;
import com.example.security.model.ProductType;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class OrderItemsMapper implements RowMapper<OrderItem> {
    @Override
    public OrderItem mapRow(ResultSet rs, int rowNum) throws SQLException {
        OrderItem orderItem = new OrderItem();
        orderItem.setId(rs.getInt("id"));
        orderItem.setProductId(rs.getInt("product_id"));
        orderItem.setOrderId(rs.getInt("order_id"));
        orderItem.setProductType(ProductType.valueOf(rs.getString("product_type")));
        orderItem.setQuantity(rs.getInt("quantity"));
        return orderItem;
    }
}
