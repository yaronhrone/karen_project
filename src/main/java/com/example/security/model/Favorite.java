package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Favorite {
    private int id;
    @JsonProperty("user_id")
    private int userId;
    @JsonProperty("product_id")
    private int productId;

    public Favorite(int id, int userId, int productId) {
        this.id = id;
        this.userId = userId;
        this.productId = productId;
    }

    @Override
    public String toString() {
        return "Favorite{" +
                "id=" + id +
                ", userId=" + userId +
                ", productId=" + productId +
                '}';
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }
}
