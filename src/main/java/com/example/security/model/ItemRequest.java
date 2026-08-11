package com.example.security.model;

import java.math.BigDecimal;

public class ItemRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private boolean isVeg;

    public ItemRequest() {
    }

    public ItemRequest(String name, String description, BigDecimal price, String category, boolean isVeg) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.isVeg = isVeg;
    }

    @Override
    public String toString() {
        return "ItemRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", category='" + category + '\'' +
                '}';
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isVeg() {
        return isVeg;
    }

    public void setVeg(boolean veg) {
        isVeg = veg;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
