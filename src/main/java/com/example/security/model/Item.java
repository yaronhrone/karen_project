package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class Item {

        private int id;
        private String name;
        private String description;
        private Boolean isVeg;
        private String image;
        private BigDecimal price;
        private String category;
        @JsonProperty("delete_img_id")
        private String deleteImgId;

        public Item() {
        }

    public Item(int id, String name, String description, Boolean isVeg, String image, BigDecimal price, String category, String deleteImgId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isVeg = isVeg;
        this.image = image;
        this.price = price;
        this.category = category;
        this.deleteImgId = deleteImgId;
    }

    public String getDeleteImgId() {
        return deleteImgId;
    }

    public void setDeleteImgId(String deleteImgId) {
        this.deleteImgId = deleteImgId;
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
        return "Item{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", isVeg=" + isVeg +
                ", image='" + image + '\'' +
                ", price=" + price +
                ", category='" + category + '\'' +
                '}';
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

        public void setVeg(Boolean isVeg) {
            this.isVeg = isVeg;}

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }
    }

