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


    public String addItemFavorite(String username, int itemId) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }
        if (favoriteRepository.getItemFavorite(username) != null) {

            if (favoriteRepository.getItemFavorite(username).contains(itemId) ) {
                return "Item already exists";
            }
        }
        return favoriteRepository.addItemFavorite(username, itemId);
    }
    public String removeItemFavorite(String username, int itemId) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }

        if (!favoriteRepository.getItemFavorite(username).contains(itemId)) {
            return "Item not found";
        }
        return favoriteRepository.removeItemFavorite(username, itemId);
    }
    public List<Item> getItemFavorite(String username) {
        if (userService.getUserByUsername(username) == null) {
            return null;
        }
        List<Integer> ids = favoriteRepository.getItemFavorite(username);
        System.out.println(ids + " ids item");
        List<Item> item = new ArrayList<>();
        for (Integer id : ids ) {
            item.add( itemService.getItemById(id));
        }
        return item;
    }
    public String deleteAllItemFavorites(String username) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }
        return favoriteRepository.deleteAllItemFavorites(username);
    }



}
