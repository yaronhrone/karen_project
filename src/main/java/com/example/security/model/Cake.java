package com.example.security.model;

public class Cake {

    private int id;
    private String name;
    private String image;
    private double price;
    private boolean isVeg;
    private String description;

    public Cake(int id, String name, String image, double price, boolean isVeg, String description) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.price = price;
        this.isVeg = isVeg;
        this.description = description;
    }

    public Cake() {
    }

    @Override
    public String toString() {
        return "Cakes{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", image='" + image + '\'' +
                ", price=" + price +
                ", isVeg=" + isVeg +
                ", description='" + description + '\'' +
                '}';
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
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

}
