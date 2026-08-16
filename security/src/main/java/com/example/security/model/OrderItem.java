package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class OrderItem {
    private int id;
    @JsonProperty("product_id")
    private int productId;
    @JsonProperty("order_id")
    private int orderId;
    private String name;
    private BigDecimal price;
    private int quantity;
    private String image;
    private String description;
    private boolean isVeg;
    @JsonProperty("total_price")
    private BigDecimal totalPrice;

    public OrderItem() {
    }

    public OrderItem(int id, int productId, int orderId, String name, BigDecimal price, int quantity, String image, String description, boolean isVeg, BigDecimal totalPrice) {
        this.id = id;
        this.productId = productId;
        this.orderId = orderId;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.image = image;
        this.description = description;
        this.isVeg = isVeg;
        this.totalPrice = totalPrice;
    }

    public BigDecimal getPrice() {
        return price;
    }



    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getDescription() {
        return description;
    }

    public boolean isVeg() {
        return isVeg;
    }

    public void setVeg(boolean veg) {
        isVeg = veg;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public void setPrice(BigDecimal price) {
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


    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    @Override
    public String toString() {
        return "OrderItem{" +
                "id=" + id +
                ", productId=" + productId +
                ", orderId=" + orderId +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                ", image='" + image + '\'' +
                ", description='" + description + '\'' +
                ", isVeg=" + isVeg +
                ", totalPrice=" + totalPrice +
                '}';
    }
}
