package com.example.security.service;

import com.example.security.model.AuthenticationRequest;
import com.example.security.model.AuthenticationResponse;
import com.example.security.model.CustomUser;
import com.example.security.model.GoogleAuthRequest;
import com.example.security.model.Role;
import com.example.security.repository.UserRepository;
import com.example.security.security.CustomUserDetailsService;
import com.example.security.utils.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AuthenticationService {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${google.client-id}")
    private String googleClientId;

    public AuthenticationResponse createAuthenticationToken(AuthenticationRequest authenticationRequest) throws Exception {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(authenticationRequest.getEmail());
        if (userDetails.getPassword() == null || userDetails.getPassword().isEmpty()) {
            throw new BadCredentialsException("This account uses Google Sign-In. Please continue with Google.");
        }
        if (!passwordEncoder.matches(authenticationRequest.getPassword(), userDetails.getPassword())) {
            throw new BadCredentialsException("Incorrect password");
        }
        return new AuthenticationResponse(jwtUtil.generateToken(userDetails));
    }

    public AuthenticationResponse createAuthenticationTokenFromGoogle(GoogleAuthRequest googleAuthRequest) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(googleAuthRequest.getIdToken());
        if (idToken == null) {
            throw new BadCredentialsException("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");

        CustomUser user = userRepository.findUserByEmail(email);
        if (user == null) {
            user = new CustomUser();
            user.setEmail(email);
            user.setFirstName(firstName != null ? firstName : "Google");
            user.setLastName(lastName != null ? lastName : "User");
            user.setAddress("");
            user.setPhone("");
            user.setRole(Role.USER);
            user.setAuthProvider("GOOGLE");
            user.setPassword(null);
            userRepository.register(user);
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        return new AuthenticationResponse(jwtUtil.generateToken(userDetails));
    }
}
