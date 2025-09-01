package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProductRequest {
    @JsonProperty("product_id")
    private int productId;
    private String productType;

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public ProductRequest(int productId, String productType) {
        this.productId = productId;
        this.productType = productType;
    }
}
