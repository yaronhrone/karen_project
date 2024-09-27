package com.example.security.controller;

import com.example.security.model.CustomUser;
import com.example.security.service.UserService;
import com.example.security.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

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
        return ResponseEntity.ok(createdUser);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // Change: Ensure correct roles
    @DeleteMapping(value = "/delete")
    public ResponseEntity<String> deleteUser(@RequestHeader(value = "Authorization") String token) {
        System.out.println("token: " + token);
        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);
        System.out.println("Username extracted: " + username); // Debugging
        String result = userService.deleteUser(username);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "search", params = "id")
    public ResponseEntity<CustomUser> getUserById(@RequestParam Integer id) {
        CustomUser user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<CustomUser> getUserByUsername(@RequestHeader(value = "Authorization") String token) {
        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);
        CustomUser user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping(value = "search", params = "email")
    public ResponseEntity<CustomUser> getUserByEmail(@RequestParam String email) {
        CustomUser user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping(value = "/all-users")
    public ResponseEntity<List<CustomUser>> getAllUsers() {
        List<CustomUser> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // Change: Ensure correct roles
    @PutMapping("/update")
    public ResponseEntity<CustomUser> updateUser(@RequestBody CustomUser updatedUser, Principal principal) {
        CustomUser existingUser = userService.getUserByUsername(principal.getName());
        updatedUser.setId(existingUser.getId()); // Ensure the ID is set
        CustomUser user = userService.updateUser(updatedUser);
        return ResponseEntity.ok(user);
    }
}


