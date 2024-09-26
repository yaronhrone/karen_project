package com.example.security.security;

import com.example.security.model.CustomUser;
import com.example.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserService userService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        CustomUser user = userService.getUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("The user with this username does not exist");
        }

        System.out.println("Loaded user password: " + user.getPassword()); // Debugging log

        // Instead of withDefaultPasswordEncoder(), use the PasswordEncoder
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword()) // Keep the encoded password as is
                .roles(user.getRole().name())
                .build();
    }
}


