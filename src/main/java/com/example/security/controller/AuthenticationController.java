package com.example.security.controller;

import com.example.security.model.AuthenticationRequest;
import com.example.security.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;


    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) throws Exception {
        try{
            return ResponseEntity.ok(authenticationService.createAuthenticationToken(authenticationRequest));
        } catch (Exception exception){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Incorrect Username Or Password");
        }
    }
}


