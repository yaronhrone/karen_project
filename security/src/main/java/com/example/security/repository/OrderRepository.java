package com.example.security.repository;

import com.example.security.model.Order;
import com.example.security.model.OrderItem;
import com.example.security.repository.mapper.OrderItemsMapper;
import com.example.security.repository.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public class OrderRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final static String ORDER_TABLE = "orders";
    private final static String ORDER_ITEM_TABLE = "order_items";

    public Integer createOrder(Order order) {
        System.out.println(order.toString() + " order");
        String sql = "INSERT INTO " + ORDER_TABLE + " (user_email, order_status, total_price , address_shipping) VALUES (?,?, ?, ?)";
        jdbcTemplate.update(sql,order.getUserEmail(), order.getStatus().name(), order.getTotalPrice(),order.getAddressShipping());
        return getAllOrderOpen(order.getUserEmail()).getFirst().getId();
    }

    public String deleteOrder(int id) {
        try {
            String sql = "DELETE FROM " + ORDER_TABLE + " WHERE id = ?";
            jdbcTemplate.update(sql, id);
        return "Order deleted successfully";
        } catch (Exception e) {
            return e.getMessage();

        }
    }
    public Order getOrderById(int id) {
        try {

        String sql = "SELECT * FROM " + ORDER_TABLE + " WHERE id = ?";
        List<Order>  orders = jdbcTemplate.query(sql, new OrderMapper(), id);
        return orders.getFirst();
        } catch (Exception e) {
            return null;
        }
    }
    public void updateTotalPriceInOrder(BigDecimal totalPrice, int orderId) {
        String sql = "UPDATE " + ORDER_TABLE + " SET total_price = ?  WHERE id = ?";
        jdbcTemplate.update(sql, totalPrice, orderId);
    }

    public List<Order> getAllOrderOpen(String userEmail) {

        String sql = "SELECT * FROM " + ORDER_TABLE + " WHERE user_email = ? AND order_status = 'OPEN'";
        return jdbcTemplate.query(sql, new OrderMapper(), userEmail);
    }
    public List<Order> getAllOrderByEmail(String userEmail) {

        // ORDER BY added - without it, SQL row order is unspecified, but
        // Order.jsx assumes the LAST element of this list is the customer's
        // current/open order. id ASC (insertion order) makes that
        // deterministic instead of depending on incidental query-plan/vacuum
        // behavior.
        String sql = "SELECT * FROM " + ORDER_TABLE + " WHERE user_email = ? ORDER BY id ASC";
        return jdbcTemplate.query(sql, new OrderMapper(), userEmail);
    }
    public String changeOrderStatusToReceived(String userEmail) {
        String sql = "UPDATE " + ORDER_TABLE + " SET order_status = 'RECEIVED' WHERE user_email = ? AND order_status = 'OPEN'";
        jdbcTemplate.update(sql, userEmail);
        return "Order status updated successfully";
    }

    public void updateOrderStatus(int orderId, String status) {
        String sql = "UPDATE " + ORDER_TABLE + " SET order_status = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, orderId);
    }

    // Keren's "active orders" inbox in Admin - orders she still needs to act
    // on (already sent by the customer, not yet marked ready/shipped).
    public List<Order> getOrdersByStatuses(List<String> statuses) {
        String placeholders = String.join(",", statuses.stream().map(s -> "?").toArray(String[]::new));
        String sql = "SELECT * FROM " + ORDER_TABLE + " WHERE order_status IN (" + placeholders + ") ORDER BY order_date DESC";
        return jdbcTemplate.query(sql, new OrderMapper(), statuses.toArray());
    }

    // Order Items

    public List<OrderItem> getOrderItems(int orderId) {
        String sql = "SELECT * FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ?";
        return jdbcTemplate.query(sql, new OrderItemsMapper(), orderId);
    }

    public void addOrderItem(OrderItem orderItem) {
        String sql = "INSERT INTO " + ORDER_ITEM_TABLE + " (order_id, product_id ,quantity ,price) VALUES (?, ?, ?,?)";
        jdbcTemplate.update(sql, orderItem.getOrderId(), orderItem.getProductId(), orderItem.getQuantity(),orderItem.getPrice());
    }
    public void updateOrderItem(OrderItem orderItem) {
        System.out.println(orderItem + " order item updated");
        String sql = "UPDATE " + ORDER_ITEM_TABLE + " SET  quantity = ? - 1  WHERE order_id = ? AND product_id = ? ";
        jdbcTemplate.update(sql, orderItem.getQuantity(), orderItem.getOrderId(), orderItem.getProductId());

    }

    public List<OrderItem> getOrderItemsByOrderId(int orderId) {
        String sql = "SELECT * FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ?";
        return jdbcTemplate.query(sql, new OrderItemsMapper(), orderId);
    }
public void deleteOrderItemsByOrderId(int orderId, int productId) {
    String sql = "DELETE FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ? AND product_id = ? ";
    jdbcTemplate.update(sql, orderId, productId);
}
    public Integer getProductQuantityFromOrder(int orderId, int productId) {
        try {
        String sql = "SELECT quantity FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ? AND product_id = ? ";
        return jdbcTemplate.queryForObject(sql, Integer.class, orderId, productId);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return 0;
        }
    }
    public void deleteAllOrderItemsByOrderId(int orderId) {
        String sql = "DELETE FROM " + ORDER_ITEM_TABLE + " WHERE order_id = ?";
        jdbcTemplate.update(sql, orderId);
    }
    public void addQuantityToOrderItem(int orderId, int productId) {
        String sql = "UPDATE " + ORDER_ITEM_TABLE + " SET quantity = quantity + 1 WHERE order_id = ? AND product_id = ? ";
        jdbcTemplate.update(sql, orderId, productId);

    }

}
