package com.example.security.service;

import com.example.security.model.Item;
import com.example.security.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FavoriteService {
    @Autowired
    private FavoriteRepository favoriteRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private ItemService itemService;


    public String addItemFavorite(String email, int itemId) {
        if (userService.getUserByEmail(email) == null) {
            return "User not found";
        }
        if (favoriteRepository.getItemFavorite(email) != null) {

            if (favoriteRepository.getItemFavorite(email).contains(itemId) ) {
                return "Item already exists";
            }
        }
        return favoriteRepository.addItemFavorite(email, itemId);
    }
    public String removeItemFavorite(String email, int itemId) {
        if (userService.getUserByEmail(email) == null) {
            return "User not found";
        }

        if (!favoriteRepository.getItemFavorite(email).contains(itemId)) {
            return "Item not found";
        }
        return favoriteRepository.removeItemFavorite(email, itemId);
    }
    public List<Item> getItemFavorite(String email) {
        if (userService.getUserByEmail(email) == null) {
            return null;
        }
        List<Integer> ids = favoriteRepository.getItemFavorite(email);
        List<Item> item = new ArrayList<>();
        for (Integer id : ids ) {
            // itemService.getItemById returns null (via ItemsClientFallback)
            // when the item behind a favorite no longer exists - e.g. it was
            // deleted from the catalog after being favorited. Adding that
            // null straight into the response crashed the frontend outright:
            // it renders this list directly, has no null-guard, and no
            // error boundary, so one stale favorite blanked the whole page
            // (favorites tab, and the category pages' heart-fill lookup
            // that reads this same endpoint). Skip it instead - it's a
            // dangling reference at that point, nothing to show.
            Item found = itemService.getItemById(id);
            if (found != null) {
                item.add(found);
            }
        }
        return item;
    }
    public String deleteAllItemFavorites(String email) {
        if (userService.getUserByEmail(email) == null) {
            return "User not found";
        }
        return favoriteRepository.deleteAllItemFavorites(email);
    }



}
