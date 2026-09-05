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
            return "משתמש לא נמצא";
        }
        if (favoriteRepository.getItemFavorite(email) != null) {

            if (favoriteRepository.getItemFavorite(email).contains(itemId) ) {
                return "הפריט כבר נמצא במועדפים";
            }
        }
        // Kept in English on purpose - AdminController/FavoriteController check
        // this exact string via .contains("successfully") to decide OK vs
        // BAD_REQUEST. Translating it would silently break that check; the
        // frontend never shows the success string to the user anyway, only
        // the error branches above (which is what was actually leaking
        // English to the UI).
        return favoriteRepository.addItemFavorite(email, itemId);
    }
    public String removeItemFavorite(String email, int itemId) {
        if (userService.getUserByEmail(email) == null) {
            return "משתמש לא נמצא";
        }

        if (!favoriteRepository.getItemFavorite(email).contains(itemId)) {
            return "הפריט לא נמצא ברשימת המועדפים";
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
            // behind it is gone, so the frontend can show "המוצר כבר לא
            // במלאי" rather than either crashing or silently making the
            // favorite disappear with no explanation. Deliberately never
            // auto-removed from the favorites table on item deletion - the
            // customer decides whether to clear it (Favorite.jsx's "הסר
            // ממועדפים" button), not the admin deleting the product.
            Item found = itemService.getItemById(id);
            if (found != null) {
                item.add(found);
            } else {
                Item missing = new Item();
                missing.setId(id);
                missing.setName("המוצר כבר לא במלאי");
                missing.setMissing(true);
                item.add(missing);
            }
        }
        return item;
    }
    public String deleteAllItemFavorites(String email) {
        if (userService.getUserByEmail(email) == null) {
            return "משתמש לא נמצא";
        }
        return favoriteRepository.deleteAllItemFavorites(email);
    }

}
