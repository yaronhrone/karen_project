package com.example.security.controller;

import com.example.security.model.Chocolate;
import com.example.security.model.CustomUser;
import com.example.security.service.ChocolateService;
import com.example.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserService userService;
    @Autowired
    private ChocolateService chocolateService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(value = "/all-users")
    public ResponseEntity<List<CustomUser>> getAllUsers() {
        try{
            List<CustomUser> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e){
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete-user/{username}")
    public ResponseEntity<String> deleteAnotherUser(@PathVariable String username) {
        try {
            String result = userService.deleteUser(username);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/chocolate")
public ResponseEntity<String> createChocolate(@RequestBody Chocolate chocolate) {
    try {
        return ResponseEntity.ok().body( chocolateService.createChocolate(chocolate));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body (e.getMessage());
    }
}
@PreAuthorize("hasRole('ADMIN')")
@GetMapping(value = "/chocolate/{name}")
    public ResponseEntity<Chocolate> getCholate(@PathVariable String name){
    System.out.println(
            "name" + name
    );
        try {
            return ResponseEntity.ok().body(chocolateService.getChocolate(name));
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        }
}


