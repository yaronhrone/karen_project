package com.example.security.controller;

import com.example.security.model.CustomUser;
import com.example.security.service.UserService;
import com.example.security.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;

    @PostMapping(value = "/register")
    public CustomUser createUser(@RequestBody CustomUser user) {
        return userService.register(user);
    }

    @DeleteMapping(value = "/delete-user", params = "Authorization")
    public String deleteUser(@RequestParam(value = "Authorization") String token) {
        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);
        return userService.deleteUser(username);
    }

    @GetMapping(value = "search", params = "id")
    public CustomUser getUserById(@RequestParam Integer id) {
        return userService.getUserById(id);
    }

    @GetMapping(params = "Authorization")
    public CustomUser getUserByUsername(@RequestParam(value = "Authorization") String token) {
        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);
        return userService.getUserByUsername(username);
    }

    @GetMapping(value = "search", params = "email")
    public CustomUser getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }

    @GetMapping(value = "/all-users")
    public List<CustomUser> getAllUsers() {
        return userService.getAllUsers();
    }
}
