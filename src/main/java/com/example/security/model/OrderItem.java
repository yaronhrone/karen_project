package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OrderItem {
    private int id;
    @JsonProperty("product_id")
    private int productId;
    @JsonProperty("order_id")
    private int orderId;
    @JsonProperty("product_type")
    private ProductType productType;
    private String name;
    private double price;
    private int quantity;

    public OrderItem() {
    }

    public OrderItem(int id, int productId, int orderId, ProductType productType, String name, double price, int quantity) {
        this.id = id;
        this.productId = productId;
        this.orderId = orderId;
        this.productType = productType;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }


    public ProductType getProductType() {
        return productType;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
