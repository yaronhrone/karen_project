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

    public String addItemFavorite(String email, int itemId) {
        String sql = "INSERT INTO " + FAVORITE_TABLE + " (user_email, item_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, email, itemId);
        return "item added successfully";
    }
    public String removeItemFavorite(String email, int itemId) {
        String sql = "DELETE FROM " + FAVORITE_TABLE + " WHERE user_email = ? AND item_id = ?";
        jdbcTemplate.update(sql, email, itemId);
        return "Item removed successfully";
    }
    public List<Integer> getItemFavorite(String email) {
        try {

            String sql = "SELECT item_id FROM " + FAVORITE_TABLE + " WHERE user_email = ?";
            return jdbcTemplate.queryForList(sql, Integer.class, email);
        } catch (Exception e) {
            return null;
        }
    }
    public String deleteAllItemFavorites(String email) {
        String sql = "DELETE FROM " + FAVORITE_TABLE + " WHERE user_email = ?";
        jdbcTemplate.update(sql, email);
        return "Favorites deleted successfully";
    }

}
