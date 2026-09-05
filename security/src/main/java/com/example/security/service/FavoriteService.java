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
            // that reads this same endpoint). Stand in with a placeholder
            // instead - the favorite itself still exists, only the product
            // behind it is gone, so the frontend can show "פריט זה חסר"
            // rather than either crashing or silently making the favorite
            // disappear with no explanation.
            Item found = itemService.getItemById(id);
            if (found != null) {
                item.add(found);
            } else {
                Item missing = new Item();
                missing.setId(id);
                missing.setName("פריט זה חסר");
                missing.setMissing(true);
                item.add(missing);
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

    // Called by ItemService right after an item is actually deleted from the
    // catalog - cleans up every user's favorite pointing at it, not just one
    // user's, so it never needs a user-existence check like the methods above.
    public void deleteFavoritesByItemId(int itemId) {
        favoriteRepository.deleteFavoritesByItemId(itemId);
    }



}
