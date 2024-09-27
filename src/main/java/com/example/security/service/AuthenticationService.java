package com.example.security.service;

import com.example.security.model.CustomUser;
import com.example.security.security.CustomUserDetailsService;
import com.example.security.model.AuthenticationRequest;
import com.example.security.model.AuthenticationResponse;
import com.example.security.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthenticationResponse createAuthenticationToken(AuthenticationRequest authenticationRequest) throws Exception {

//       option 1
        // Validate the username and password using the authentication manager
//        try {
//
//            System.out.println("Attempting to authenticate user: " + authenticationRequest.getUsername());
//
//            authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
//            );
//        } catch (Exception exception) {
//
//            System.out.println("Authentication failed: " + exception.getMessage()); // Log the exception message
//
//            throw new Exception("Incorrect username or password");
//        }

//        option 2
        // Load user details
        CustomUser user = userService.getUserByUsername(authenticationRequest.getUsername());
        if (user == null || !passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect username or password");
        }


        // Load user details
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(authenticationRequest.getUsername());

        // Generate and return the JWT token
        return new AuthenticationResponse(jwtUtil.generateToken(userDetails));
    }
}





