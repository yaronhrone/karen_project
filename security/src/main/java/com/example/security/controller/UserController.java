package com.example.security.controller;

import com.example.security.model.AuthenticationRequest;
import com.example.security.model.AuthenticationResponse;
import com.example.security.model.CustomUser;
import com.example.security.model.ForgotPasswordRequest;
import com.example.security.model.ResetPasswordRequest;
import com.example.security.service.AuthenticationService;
import com.example.security.service.PasswordResetService;
import com.example.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping(value = "/register")
    public ResponseEntity<?> register(@RequestBody CustomUser user) {
        try {
            String rowPassword = user.getPassword();
            String result = userService.register(user);
            if (result.contains("successfully")) {

              AuthenticationResponse response =  authenticationService.createAuthenticationToken(new AuthenticationRequest(user.getEmail(), rowPassword));
                return new ResponseEntity(response, HttpStatus.CREATED);
            }
            return new ResponseEntity(result , HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<CustomUser> getCurrentUser(Authentication authentication) {
        try {
            CustomUser user = userService.getUserByEmail(authentication.getName());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    @PutMapping
    public ResponseEntity<CustomUser> updateUser(Authentication authentication, @RequestBody CustomUser updatedUser) {
        try {
            String currentEmail = authentication.getName();
            if (updatedUser.getFirstName() == null || updatedUser.getLastName() == null || updatedUser.getEmail() == null) {
                return new ResponseEntity("User not updated, first name, last name and email are required", HttpStatus.BAD_REQUEST);
            }
            CustomUser userFromDB = userService.getUserByEmail(currentEmail);
            if (userFromDB == null) {
                return new ResponseEntity("User not updated. this user does not exist in the system.", HttpStatus.BAD_REQUEST);
            }
            if(!userFromDB.getEmail().equals(updatedUser.getEmail())){
                CustomUser userWithTheSameEmail = userService.getUserByEmail(updatedUser.getEmail());
                if(userWithTheSameEmail != null){
                    return new ResponseEntity("User not updated, This email already exist in the system.", HttpStatus.BAD_REQUEST);
                }
            }
            CustomUser user = userService.updateUser(updatedUser, currentEmail);
            if (user == null) {
                return new ResponseEntity("User not updated. this user does not exist in the system.", HttpStatus.BAD_REQUEST);
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    @DeleteMapping
    public ResponseEntity<String> deleteUser(Authentication authentication) {
        try {
            String result = userService.deleteUser(authentication.getName());
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Deliberately public (permitAll, see SecurityConfigure) and always the
    // exact same 200 + fixed body, whether the email exists, sending
    // succeeded, or anything unexpected happened internally - none of those
    // may ever be distinguishable from outside, or this becomes an
    // email-enumeration oracle.
    private static final String FORGOT_PASSWORD_RESPONSE =
            "אם קיים חשבון עם האימייל הזה, נשלח אליו קישור לאיפוס הסיסמה";

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.requestReset(request.getEmail());
        } catch (Exception e) {
        }
        return ResponseEntity.ok(FORGOT_PASSWORD_RESPONSE);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            boolean success = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            if (success) {
                return ResponseEntity.ok("הסיסמה עודכנה בהצלחה");
            }
            // Only ever reveals something about a token the caller already
            // possesses (invalid, expired, or already used) - not about
            // whether any particular email exists.
            return new ResponseEntity<>("הקישור אינו תקין או שפג תוקפו", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
