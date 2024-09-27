package com.example.security.controller;

import com.example.security.model.CustomUser;
import com.example.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserService userService;

    // Route for updating another user's information (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{username}")
    public ResponseEntity<CustomUser> updateAnotherUser(@PathVariable String username, @RequestBody CustomUser updatedUser) {
        updatedUser.setUsername(username); // Ensure the username is set
        CustomUser user = userService.updateAnotherUser(updatedUser);
        return ResponseEntity.ok(user);
    }

    // Route for deleting another user (Admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{username}")
    public ResponseEntity<String> deleteAnotherUser(@PathVariable String username) {
        return ResponseEntity.ok(userService.deleteUser(username));
    }
}

