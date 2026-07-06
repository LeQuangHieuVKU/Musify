package com.bd.musify.serviceImpl;

import com.bd.musify.dto.request.ForgotPassworkRequest;
import com.bd.musify.dto.request.LoginUserRequest;
import com.bd.musify.dto.request.RefreshTokenRequest;
import com.bd.musify.dto.request.RegisterUserRequest;
import com.bd.musify.dto.response.AppUserResponse;
import com.bd.musify.dto.response.MessageResponse;
import com.bd.musify.entity.AppUser;
import com.bd.musify.exception.EmailAlreadyExitsException;
import com.bd.musify.exception.InvalidCredentialException;
import com.bd.musify.exception.InvalidTokenException;
import com.bd.musify.exception.TokenExpiredException;
import com.bd.musify.respository.AppUserResponsitory;
import com.bd.musify.service.AuthService;
import com.bd.musify.service.EmailService;
import com.bd.musify.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AppUserResponsitory appUserResponsitory;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public MessageResponse registerUser(RegisterUserRequest request) {
        if (appUserResponsitory.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExitsException("Email already exists");
        }
        String tempPassword = generateTemporaryPassword();
        AppUser appUser = new AppUser();
        appUser.setName(request.getName());
        appUser.setEmail(request.getEmail());
        appUser.setPassword(passwordEncoder.encode(tempPassword));
        appUser.setRole(request.getRole() != null ? request.getRole() : "USER");
        appUserResponsitory.save(appUser);
        emailService.sendWelcomeEmail(appUser.getEmail(), appUser.getName(), tempPassword);
        return new MessageResponse("Account created successfully. A temporary password has been sent to your email.");
    }

    @Override
    public AppUserResponse loginUser(LoginUserRequest request) {
        AppUser appUser = appUserResponsitory.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), appUser.getPassword())) {
            throw new InvalidCredentialException("Invalid email or password");
        }

        String accessToken = jwtUtil.generateAccessToken(appUser.getId(), appUser.getName(), appUser.getEmail(), appUser.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(appUser.getId(), appUser.getEmail());

        appUser.setRefreshToken(refreshToken);
        appUserResponsitory.save(appUser);

        return AppUserResponse.fromEntity(appUser, accessToken, refreshToken);
    }

    @Override
    public AppUserResponse refreshAccessToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String email = jwtUtil.extractEmail(refreshToken);

        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new InvalidCredentialException("Invalid refresh token");
        }

        AppUser appUser = appUserResponsitory.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if(!jwtUtil.validateToken(refreshToken, email)) {
            throw new TokenExpiredException("Refresh token has expired or invalid");
        }

        String newAccessToken = jwtUtil.generateAccessToken(appUser.getId(), appUser.getName(), appUser.getEmail(), appUser.getRole());


        return AppUserResponse.fromEntity(appUser, newAccessToken, refreshToken);
    }

    @Override
    public MessageResponse forgotPassword(ForgotPassworkRequest request) {
        AppUser appUser = appUserResponsitory.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialException("User not found with email: " + request.getEmail()));

        String tempPassword = generateTemporaryPassword();
        appUser.setPassword(passwordEncoder.encode(tempPassword));
        appUserResponsitory.save(appUser);

        emailService.sendCredentialsEmail(appUser.getEmail(), appUser.getName(), tempPassword);
        return new MessageResponse("Temporary password has been sent to your email.");
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(chars.length());

        for (int i = 0; i < 10; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
}
