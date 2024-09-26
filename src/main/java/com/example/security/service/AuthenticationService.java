package com.example.security.service;

import com.example.security.security.CustomUserDetailsService;
import com.example.security.model.AuthenticationRequest;
import com.example.security.model.AuthenticationResponse;
import com.example.security.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthenticationService {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthenticationResponse createAuthenticationToken(AuthenticationRequest authenticationRequest) throws Exception {
        // Validate the username and password using the authentication manager
        try {

            System.out.println("Attempting to authenticate user: " + authenticationRequest.getUsername()); // Use plain text password

            String encryptedPassword = passwordEncoder.encode(authenticationRequest.getPassword());
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), encryptedPassword)
            );
        } catch (Exception exception) {

            System.out.println("Authentication failed: " + exception.getMessage()); // Log the exception message

            throw new Exception("Incorrect username or password");
        }

        // Load user details
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(authenticationRequest.getUsername());

        // Generate and return the JWT token
        return new AuthenticationResponse(jwtUtil.generateToken(userDetails));
    }
}





