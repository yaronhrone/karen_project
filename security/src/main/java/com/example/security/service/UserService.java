package com.example.security.service;

import com.example.security.model.CustomUser;
import com.example.security.model.Role;
import com.example.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public String register(CustomUser user) {
        if (isBlank(user.getFirstName()) || isBlank(user.getLastName()) || isBlank(user.getEmail())
                || isBlank(user.getPassword())) {
            return "User not created, first name, last name, email and password are required";
        }
        CustomUser userWithTheSameEmail = getUserByEmail(user.getEmail());
        if(userWithTheSameEmail != null){
            return "User not created, This email already exists in the system.";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Always USER, regardless of what the client sent - public self-registration
        // must never be able to assign a role (there is no admin-promotion endpoint;
        // an ADMIN account can only be created directly in the database).
        user.setRole(Role.USER);
        if (user.getAuthProvider() == null) {
            user.setAuthProvider("LOCAL");
        }
        return userRepository.register(user);
    }

    public CustomUser getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public List<CustomUser> getAllUsers(int page, int size) {
        return userRepository.findAllUsers(page, size);
    }

    public CustomUser updateUser(CustomUser updatedUser, String currentEmail) {
        return userRepository.updateUser(updatedUser, currentEmail);
    }

    public String deleteUser(String email) {
        CustomUser registeredUser = userRepository.findUserByEmail(email);
        if (registeredUser == null) {
            return "The user with this email does not exist, so it cannot be deleted";
        }
        favoriteService.deleteAllItemFavorites(registeredUser.getEmail());
        orderService.deleteAllOrders(registeredUser.getEmail());
        return userRepository.deleteUser(registeredUser.getEmail());
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

}
