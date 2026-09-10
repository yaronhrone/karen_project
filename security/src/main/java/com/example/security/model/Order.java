package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class Order {
    private int id;
    @JsonProperty("user_email")
    private String userEmail;
    private Status status;
    @JsonProperty("order_date")
    private LocalDate orderDate;
    // Optional - set only when advanced to IN_PROGRESS (see
    // OrderService.advanceOrderStatus). Null for most orders.
    @JsonProperty("ready_by")
    private LocalDate readyBy;
    // Actual moment Keren advanced the order to READY/SENT (server-side, set
    // in OrderRepository via NOW() - not user-entered like ready_by above).
    @JsonProperty("ready_at")
    private LocalDate readyAt;
    @JsonProperty("sent_at")
    private LocalDate sentAt;
    @JsonProperty("total_price")
    private BigDecimal totalPrice;
    @JsonProperty("address_shipping")
    private String addressShipping;
    @JsonProperty("order_items")
    private List<OrderItem> orderItems;

    public Order(int id, String userEmail, Status status, LocalDate orderDate, BigDecimal totalPrice, String addressShipping, List<OrderItem> orderItems) {
        this.id = id;
        this.userEmail = userEmail;
        this.status = status;
        this.orderDate = orderDate;
        this.totalPrice = totalPrice;
        this.addressShipping = addressShipping;
        this.orderItems = orderItems;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public String getAddressShipping() {
        return addressShipping;
    }

    public void setAddressShipping(String addressShipping) {
        this.addressShipping = addressShipping;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public Order() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Order(String userEmail) {
        this.userEmail = userEmail;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDate getReadyBy() {
        return readyBy;
    }

    public void setReadyBy(LocalDate readyBy) {
        this.readyBy = readyBy;
    }

    public LocalDate getReadyAt() {
        return readyAt;
    }

    public void setReadyAt(LocalDate readyAt) {
        this.readyAt = readyAt;
    }

    public LocalDate getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDate sentAt) {
        this.sentAt = sentAt;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", userEmail='" + userEmail + '\'' +
                ", status=" + status +
                ", orderDate=" + orderDate +
                ", readyBy=" + readyBy +
                ", readyAt=" + readyAt +
                ", sentAt=" + sentAt +
                ", totalPrice=" + totalPrice +
                ", addressShipping='" + addressShipping + '\'' +
                ", orderItems=" + orderItems +
                '}';
    }
}
