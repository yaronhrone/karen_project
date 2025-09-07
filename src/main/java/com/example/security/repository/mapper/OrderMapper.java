package com.example.security.repository.mapper;

import com.example.security.model.Order;
import com.example.security.model.Status;
import org.springframework.jdbc.core.RowMapper;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;

public class OrderMapper implements RowMapper<Order> {
    @Override
    public Order mapRow(ResultSet rs, int rowNum) throws SQLException {
        Order order = new Order();
        order.setId(rs.getInt("id"));
        order.setUsername(rs.getString("username"));
        order.setAddressShipping(rs.getString("address_shipping"));
        order.setStatus(Status.valueOf(rs.getString("order_status")));
        order.setOrderDate(rs.getDate("order_date").toLocalDate());
        order.setTotalPrice(BigDecimal.valueOf(rs.getDouble("total_price")));
        return order;
    }
}
