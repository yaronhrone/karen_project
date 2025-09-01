package com.example.security.repository;

import com.example.security.model.Chocolate;
import com.example.security.service.ChocolateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class FavoriteRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private ChocolateService chocolateService;

    private final static String FAVORITE_CHOCOLATE_TABLE = "favorites_chocolate";
    private final static String FAVORITE_CAKE_TABLE = "favorites_cake";

    public String addChocolateFavorite(String username, int chocolateId) {
        String sql = "INSERT INTO " + FAVORITE_CHOCOLATE_TABLE + " (username, chocolate_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, username, chocolateId);
        return "Chocolate added successfully";
    }
    public String removeChocolateFavorite(String username, int chocolateId) {
        String sql = "DELETE FROM " + FAVORITE_CHOCOLATE_TABLE + " WHERE username = ? AND chocolate_id = ?";
        jdbcTemplate.update(sql, username, chocolateId);
        return "Chocolate removed successfully";
    }
    public List<Integer> getChocolateFavorite(String username) {
        try {
            String sql = "SELECT chocolate_id FROM " + FAVORITE_CHOCOLATE_TABLE + " WHERE username = ?";
            return jdbcTemplate.queryForList(sql, Integer.class, username);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public String deleteAllChocolateFavorites(String username) {
        String sql = "DELETE FROM " + FAVORITE_CHOCOLATE_TABLE + " WHERE username = ?";
        jdbcTemplate.update(sql, username);
        return "Favorites deleted successfully";
    }

    // CAKES

    public String addCakeFavorite(String username, int cake) {
        String sql = "INSERT INTO " + FAVORITE_CAKE_TABLE + " (username, cake_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, username, cake);
        return "Cake added successfully";
    }
    public String removeCakeFavorite(String username, int cake) {
        String sql = "DELETE FROM " + FAVORITE_CAKE_TABLE + " WHERE username = ? AND cake_id = ?";
        jdbcTemplate.update(sql, username, cake);
        return "Cake removed successfully";
    }
    public List<Integer> getCakeFavorite(String username) {
        try {
            String sql = "SELECT cake_id FROM " + FAVORITE_CAKE_TABLE + " WHERE username = ?";
            return jdbcTemplate.queryForList(sql, Integer.class, username);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public String deleteAllCakeFavorites(String username) {
        String sql = "DELETE FROM " + FAVORITE_CAKE_TABLE + " WHERE username = ?";
        jdbcTemplate.update(sql, username);
        return "Favorites deleted successfully";
    }


}
