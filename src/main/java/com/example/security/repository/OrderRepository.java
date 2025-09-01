package com.example.security.repository;

import com.example.security.model.Order;
import com.example.security.model.OrderItem;
import com.example.security.model.ProductType;
import com.example.security.repository.mapper.OrderItemsMapper;
import com.example.security.repository.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrderRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final static String ORDER_TABLE = "orders";
    private final static String ORDER_ITEM_TABLE = "order_items";

    public Integer createOrder(Order order) {
        String sql = "INSERT INTO " + ORDER_TABLE + " (username, order_status, total_price,address_shipping) VALUES (?,?, ?, 0)";
        jdbcTemplate.update(sql, order.getUsername(), order.getStatus(), order.getTotalPrice(),order.getAddressShipping());
        return jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
    }
    public String updateOrder(Order order) {
        String sql = "UPDATE " + ORDER_TABLE + " SET username = ?, order_status = ?, order_date = ?, total_price = ? WHERE id = ?";
        jdbcTemplate.update(sql, order.getUsername(), order.getStatus(), order.getOrderDate(), order.getTotalPrice(), order.getId());
        return "Order updated successfully";
    }
    public String deleteOrder(int id) {
        String sql = "DELETE FROM " + ORDER_TABLE + " WHERE id = ?";
        jdbcTemplate.update(sql, id);
        return "Order deleted successfully";
    }
    public List<Order> getOrderCloseByUsername(String username) {
        String sql = "SELECT * FROM " + ORDER_TABLE + " WHERE username = ? AND order_status = 'CLOSED'";
        return jdbcTemplate.query(sql, new OrderMapper(), username);
    }
    public List<Order> getAllOrderOpen(String username) {
        String sql = "SELECT * FROM " + ORDER_TABLE + " WHERE username = ? AND order_status = 'OPEN'";
        return jdbcTemplate.query(sql, new OrderMapper(), username);
    }
    public List<Order> getAllOrderByUsername(String username) {
        String sql = "SELECT * FROM " + ORDER_TABLE + " WHERE username = ?";
        return jdbcTemplate.query(sql, new OrderMapper(), username);
    }
    public String changeOrderStatusToClose(int orderId) {
        String sql = "UPDATE " + ORDER_TABLE + " SET order_status = 'CLOSED' WHERE id = ?";
        jdbcTemplate.update(sql, orderId);
        return "Order status updated successfully";
    }

    // Order Items

    public List<OrderItem> getOrderTypeChocolate(int orderId) {
        String sql = "SELECT * FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ? AND order_type = 'CHOCOLATE'";
        return jdbcTemplate.query(sql, new OrderItemsMapper(), orderId);
    }
    public List<OrderItem> getOrderTypeCake(int orderId) {
        String sql = "SELECT * FROM " + ORDER_ITEM_TABLE + " WHERE orderId = ? AND order_type = 'CAKE'";
        return jdbcTemplate.query(sql, new OrderItemsMapper(), orderId);
    }
    public String addOrderItem(OrderItem orderItem) {
        String sql = "INSERT INTO " + ORDER_ITEM_TABLE + " (order_id, product_id, product_type, quantity) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, orderItem.getOrderId(), orderItem.getProductId(), orderItem.getProductType(), orderItem.getQuantity());
        return "Order item added successfully";
    }
    public String updateOrderItem(OrderItem orderItem) {
        String sql = "UPDATE " + ORDER_ITEM_TABLE + " SET order_id = ?, product_id = ?, product_type = ?, quantity = ? WHERE id = ?";
        jdbcTemplate.update(sql, orderItem.getOrderId(), orderItem.getProductId(), orderItem.getProductType(), orderItem.getQuantity(), orderItem.getId());
        return "Order item updated successfully";
    }
    public String deleteOrderItem(int id) {
        String sql = "DELETE FROM " + ORDER_ITEM_TABLE + " WHERE id = ?";
        jdbcTemplate.update(sql, id);
        return "Order item deleted successfully";
    }
    public List<OrderItem> getOrderItemsByOrderId(int orderId) {
        String sql = "SELECT * FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ?";
        return jdbcTemplate.query(sql, new OrderItemsMapper(), orderId);
    }
public String deleteOrderItemsByOrderId(int orderId, int productId, ProductType productType) {
    String sql = "DELETE FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ? AND product_id = ? AND product_type = ?";
    jdbcTemplate.update(sql, orderId, productId, productType);
    return "Order items deleted successfully";
    }
    public Integer getProductQuantityFromOrder(int orderId, int productId, ProductType productType) {
        try {
        String sql = "SELECT quantity FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ? AND product_id = ? AND product_type = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, orderId, productId, productType);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public void deleteAllOrderItemsByOrderId(int orderId) {
        String sql = "DELETE FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ?";
        jdbcTemplate.update(sql, orderId);
    }
}
