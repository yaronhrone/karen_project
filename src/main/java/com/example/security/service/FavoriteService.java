package com.example.security.service;

import com.example.security.model.Cake;
import com.example.security.model.Chocolate;
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
    private ChocolateService chocolateService;
    @Autowired
    private CakeService cakeService;

    public String addChocolateFavorite(String username, int chocolateId) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }
        if (favoriteRepository.getChocolateFavorite(username) != null) {

            if (favoriteRepository.getChocolateFavorite(username).contains(chocolateId) ) {
                return "Chocolate already exists";
            }
        }
        return favoriteRepository.addChocolateFavorite(username, chocolateId);
    }
    public String removeChocolateFavorite(String username, int chocolateId) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }

        if (!favoriteRepository.getChocolateFavorite(username).contains(chocolateId)) {
            return "Chocolate not found";
        }
        return favoriteRepository.removeChocolateFavorite(username, chocolateId);
    }
    public List<Chocolate> getChocolateFavorite(String username) {
        if (userService.getUserByUsername(username) == null) {
            return null;
        }
        List<Integer> ids = favoriteRepository.getChocolateFavorite(username);
        System.out.println(ids + " ids chocolate");
        List<Chocolate> chocolates = new ArrayList<>();
        for (Integer id : ids ) {
            chocolates.add( chocolateService.getChocolateById(id));
        }
        return chocolates;
    }
    public String deleteAllChocolateFavorites(String username) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }
        return favoriteRepository.deleteAllChocolateFavorites(username);
    }


    // CAKES


    public String addCakeFavorite(String username, int cake) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }
        if (favoriteRepository.getCakeFavorite(username) != null) {

            if (favoriteRepository.getCakeFavorite(username).contains(cake) ) {
                return "Cake already exists";
            }
        }
        return favoriteRepository.addCakeFavorite(username, cake);
    }
    public String removeCakeFavorite(String username, int cake) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }
        if (!favoriteRepository.getCakeFavorite(username).contains(cake)) {
            return "Cake not found";
        }
        return favoriteRepository.removeCakeFavorite(username, cake);
    }
    public List<Cake> getCakeFavorite(String username) {
        if (userService.getUserByUsername(username) == null) {
            return null;
        }
        List<Integer> names = favoriteRepository.getCakeFavorite(username);

        List <Cake> cakes = new ArrayList<>();
        for (Integer name : names ) {
            cakes.add( cakeService.getCakeById(name));

        }

        return cakes;
    }
    public String deleteAllCakeFavorites(String username) {
        if (userService.getUserByUsername(username) == null) {
            return "User not found";
        }
        return favoriteRepository.deleteAllCakeFavorites(username);
    }
}
