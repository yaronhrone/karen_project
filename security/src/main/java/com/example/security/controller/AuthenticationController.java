package com.example.security.controller;

import com.example.security.model.AuthenticationRequest;
import com.example.security.model.AuthenticationResponse;
import com.example.security.model.GoogleAuthRequest;
import com.example.security.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) {
        try {
            AuthenticationResponse authResponse = authenticationService.createAuthenticationToken(authenticationRequest);
            return ResponseEntity.ok(authResponse);
        } catch (BadCredentialsException e) {
            // 403 (not 401) - a 401 response body to a POST trips a known JDK HttpURLConnection
            // bug ("cannot retry due to server authentication, in streaming mode") in Java HTTP
            // clients; browsers/axios are unaffected, but this also keeps parity with
            // /authenticate/google below, which fails the same way for the same reason.
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Incorrect Email Or Password");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal error: " + e.getMessage());
        }
    }

    @PostMapping("/authenticate/google")
    public ResponseEntity<?> createAuthenticationTokenFromGoogle(@RequestBody GoogleAuthRequest googleAuthRequest) {
        try {
            AuthenticationResponse authResponse = authenticationService.createAuthenticationTokenFromGoogle(googleAuthRequest);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Google authentication failed");
        }
    }
}
