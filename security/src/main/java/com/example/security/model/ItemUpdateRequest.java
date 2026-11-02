package com.example.security.model;

import java.math.BigDecimal;

// Same shape as ItemRequest (used by createItem) plus the id being edited -
// kept as its own DTO rather than bolting id onto the create-only
// ItemRequest, since the update endpoint's file part is optional (a
// text-only edit sends no image, unlike create where it's always required).
public class ItemUpdateRequest {
    private int id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private boolean isVeg;
    // Optional: null = stock is not tracked for this product.
    private Integer stock;
    // Chocolate boxes only: the squares' layout as a JSON string.
    private String layout;

    public ItemUpdateRequest() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
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
