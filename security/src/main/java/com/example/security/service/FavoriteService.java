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
        System.out.println(ids + " ids item");
        List<Item> item = new ArrayList<>();
        for (Integer id : ids ) {
            item.add( itemService.getItemById(id));
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
