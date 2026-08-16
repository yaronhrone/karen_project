package com.example.karen_project.model;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class Items {
    private int id;
    private String name;
    private String description;
    private Boolean isVeg;
    private String category;
    private String image;
    private BigDecimal price;
    @JsonProperty("delete_img_id")
    private String deleteImgId;

    public Items() {
    }

    public Items(int id, String name, String description, Boolean isVeg, String category, String image, BigDecimal price, String deleteImgId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isVeg = isVeg;
        this.category = category;
        this.image = image;
        this.price = price;
        this.deleteImgId = deleteImgId;
    }

    public String getDeleteImgId() {
        return deleteImgId;
    }

    public void setDeleteImgId(String deleteImgId) {
        this.deleteImgId = deleteImgId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getId() {

        return id;
    }

    public void setId(int id) {


        this.id = id;
    }

    @Override
    public String toString() {
        return "Items{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", isVeg=" + isVeg +
                ", category='" + category + '\'' +
                ", image='" + image + '\'' +
                ", price=" + price +

                '}';
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public Boolean getVeg() {
        return isVeg;
    }

    public void setVeg(Boolean veg) {
        this.isVeg = veg;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
