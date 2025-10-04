package com.example.security.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class Chocolate {

        private int id;
        private String name;
        private String description;
        private Boolean isVeg;
        private String image;
        private BigDecimal price;

        public Chocolate() {
        }

    public Chocolate(int id, String name, String description, Boolean isVeg, String image, BigDecimal price) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isVeg = isVeg;
        this.image = image;
        this.price = price;
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
        return "Chocolate{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", isVeg=" + isVeg +
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

        public void setVeg(Boolean isVeg) {
            this.isVeg = isVeg;}

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }
    }

