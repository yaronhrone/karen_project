package com.example.security.repository;

import com.example.security.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FavoriteRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private ItemService itemService;

    private final static String FAVORITE_TABLE = "favorites";

    public String addItemFavorite(String username, int itemId) {
        String sql = "INSERT INTO " + FAVORITE_TABLE + " (username, item_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, username, itemId);
        return "item added successfully";
    }
    public String removeItemFavorite(String username, int itemId) {
        String sql = "DELETE FROM " + FAVORITE_TABLE + " WHERE username = ? AND item_id = ?";
        jdbcTemplate.update(sql, username, itemId);
        return "Item removed successfully";
    }
    public List<Integer> getItemFavorite(String username) {
        try {

            String sql = "SELECT item_id FROM " + FAVORITE_TABLE + " WHERE username = ?";
            return jdbcTemplate.queryForList(sql, Integer.class, username);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public String deleteAllItemFavorites(String username) {
        String sql = "DELETE FROM " + FAVORITE_TABLE + " WHERE username = ?";
        jdbcTemplate.update(sql, username);
        return "Favorites deleted successfully";
    }



}
