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
public class FavoriteController {
    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/item/{id}")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<String> addFavorite(@RequestHeader(value = "Authorization") String token, @PathVariable int id) {
        try {
            String jwtToken = token.substring(7);
            String email = jwtUtil.extractEmail(jwtToken);
            String result = favoriteService.addItemFavorite(email, id);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @DeleteMapping("/item/{id}")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<String> removeItemFromFavorite(@RequestHeader(value = "Authorization") String token, @PathVariable int id) {
        try {
            String jwtToken = token.substring(7);
            String email = jwtUtil.extractEmail(jwtToken);
            String result = favoriteService.removeItemFavorite(email, id);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @GetMapping ("/item")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<String> getFavorite(@RequestHeader(value = "Authorization") String token) {
        try {
            String jwtToken = token.substring(7);
            String email = jwtUtil.extractEmail(jwtToken);
            List<Item> result = favoriteService.getItemFavorite(email);

                return new ResponseEntity(result, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    @DeleteMapping("/item")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<String> deleteAllFavorite(@RequestHeader(value = "Authorization") String token) {
        try {
            String jwtToken = token.substring(7);
            String email = jwtUtil.extractEmail(jwtToken);
            String result = favoriteService.deleteAllItemFavorites(email);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }


    }

}
