package com.bd.musify.controller;

import com.bd.musify.dto.request.ForgotPassworkRequest;
import com.bd.musify.dto.request.LoginUserRequest;
import com.bd.musify.dto.request.RefreshTokenRequest;
import com.bd.musify.dto.request.RegisterUserRequest;
import com.bd.musify.dto.response.AppUserResponse;
import com.bd.musify.dto.response.MessageResponse;
import com.bd.musify.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/registerUser")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterUserRequest request) {
        MessageResponse response = authService.registerUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/loginUser")
    public ResponseEntity<AppUserResponse> loginUser(@Valid @RequestBody LoginUserRequest request) {
        AppUserResponse response = authService.loginUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refreshAccessToken")
    public ResponseEntity<AppUserResponse> refreshAccessToken(@Valid @RequestBody RefreshTokenRequest request) {
        AppUserResponse response = authService.refreshAccessToken(request);
        return ResponseEntity.ok(response);

    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPassworkRequest request) {
        MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }
}
