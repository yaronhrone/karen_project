package com.example.security.service;

import com.example.security.model.CustomUser;
import com.example.security.model.Role;
import com.example.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public CustomUser register(CustomUser user) {
        if (user.getFirstName() == null || user.getLastName() == null || user.getEmail() == null || user.getAddress() == null
                || user.getUsername() == null || user.getPassword() == null) {
            System.out.println("User not created, first name, last name, email, address, username and password are required");
            return null;
        }
        CustomUser userWithTheSameEmail = getUserByEmail(user.getEmail());
        CustomUser userWithTheSameUsername = getUserByUsername(user.getUsername());
        if(userWithTheSameEmail != null || userWithTheSameUsername != null){
            System.out.println("This email or username already exists in the system");
            return null;
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        System.out.println("Encoded password: " + user.getPassword()); // Log the encoded password

        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        return userRepository.register(user);
    }

    public String deleteUser(String username) {
        if (username == null) {
            return "It is not possible to delete the user without username";
        }
        CustomUser registeredUser = userRepository.getUserByUsername(username);
        if (registeredUser == null) {
            return "The user with this username does not exist, so it cannot be deleted";
        }
        return userRepository.deleteUser(registeredUser.getUsername());
    }

    public CustomUser getUserByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            System.out.println("It is not possible to accept the user without username");
            return null;
        }
        return userRepository.getUserByUsername(username);
    }

    public CustomUser getUserByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            System.out.println("It is not possible to accept the user without email");
            return null;
        }
        return userRepository.getUserByEmail(email);
    }

    public List<CustomUser> getAllUsers() {
        return userRepository.getAllUsers();
    }

    public CustomUser updateUser(String username, CustomUser updatedUser) {
        // Implement update logic for the logged-in user
        return userRepository.updateUser(username, updatedUser);
    }

    public CustomUser updateAnotherUser(String username, CustomUser updatedUser) {
        // Implement update logic for another user (admin)
        return userRepository.updateUser(username, updatedUser);
    }

    // In UserService.java or a utility class
    public Collection<? extends GrantedAuthority> getAuthoritiesFromRoles(Set<Role> roles) {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name())) // Matches the expected format
                .collect(Collectors.toList());
    }

}

