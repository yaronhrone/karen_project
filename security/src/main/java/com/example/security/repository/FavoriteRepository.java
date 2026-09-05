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

    // Called when an item is deleted from the catalog, across every user who
    // favorited it - not scoped to one email like the methods above. Without
    // this, deleting an item left a dangling favorites row behind for anyone
    // who'd favorited it (that's what "פריט זה חסר" now covers for the rows
    // that were already orphaned before this existed).
    public void deleteFavoritesByItemId(int itemId) {
        String sql = "DELETE FROM " + FAVORITE_TABLE + " WHERE item_id = ?";
        jdbcTemplate.update(sql, itemId);
    }



}
