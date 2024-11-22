package com.example.security.controller;

import com.example.security.model.CustomUser;
import com.example.security.service.UserService;
import com.example.security.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping(value = "/register")
    public ResponseEntity<CustomUser> createUser(@RequestBody CustomUser user) {
        CustomUser createdUser = userService.register(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // Change: Ensure correct roles
    @DeleteMapping
    public ResponseEntity<String> deleteUser(@RequestHeader(value = "Authorization") String token) {
        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);
        String result = userService.deleteUser(username);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<CustomUser> getUserByUsername(@RequestHeader(value = "Authorization") String token) {
        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);
        CustomUser user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }


    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // Change: Ensure correct roles
    @PutMapping
    public ResponseEntity<CustomUser> updateUser(@RequestHeader(value = "Authorization") String token, @RequestBody CustomUser updatedUser) {
        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);
        CustomUser user = userService.updateUser(username, updatedUser);
        return ResponseEntity.ok(user);
    }
}


