package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class Order {
    private int id;
    private String username;
    private Status status;
    @JsonProperty("order_date")
    private LocalDate orderDate;
    @JsonProperty("total_price")
    private BigDecimal totalPrice;
    @JsonProperty("address_shipping")
    private String addressShipping;
    private List<OrderItem> orderItems;

    public Order(int id, String username, Status status, LocalDate orderDate, BigDecimal totalPrice, String addressShipping, List<OrderItem> orderItems) {
        this.id = id;
        this.username = username;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Order(String username) {
        this.username = username;
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
                ", username='" + username + '\'' +
                ", status=" + status +
                ", orderDate=" + orderDate +
                ", totalPrice=" + totalPrice +
                ", addressShipping='" + addressShipping + '\'' +
                ", orderItems=" + orderItems +
                '}';
    }
}
