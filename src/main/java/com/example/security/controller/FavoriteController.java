package com.example.security.controller;

import com.example.security.model.Item;
import com.example.security.service.FavoriteService;
import com.example.security.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorite")
@CrossOrigin(origins ="http://localhost:3000")
public class FavoriteController {
    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/item/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> addFavorite(@RequestHeader(value = "Authorization") String token, @PathVariable int id) {
        try {
            System.out.println(id + " id chocolate");
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            String result = favoriteService.addItemFavorite(username, id);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @DeleteMapping("/item/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> removeItemFromFavorite(@RequestHeader(value = "Authorization") String token, @PathVariable int id) {
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            String result = favoriteService.removeItemFavorite(username, id);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping ("/item")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> getFavorite(@RequestHeader(value = "Authorization") String token) {
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            List<Item> result = favoriteService.getItemFavorite(username);
            System.out.println(result + " result");

                return new ResponseEntity(result, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    @DeleteMapping("/item")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> deleteAllFavorite(@RequestHeader(value = "Authorization") String token) {
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            String result = favoriteService.deleteAllItemFavorites(username);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }


    }

}
