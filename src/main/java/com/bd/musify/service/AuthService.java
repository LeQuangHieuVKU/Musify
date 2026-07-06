package com.bd.musify.service;

import com.bd.musify.dto.request.ForgotPassworkRequest;
import com.bd.musify.dto.request.LoginUserRequest;
import com.bd.musify.dto.request.RefreshTokenRequest;
import com.bd.musify.dto.request.RegisterUserRequest;
import com.bd.musify.dto.response.AppUserResponse;
import com.bd.musify.dto.response.MessageResponse;
import jakarta.validation.Valid;

public interface AuthService {
    MessageResponse registerUser( RegisterUserRequest request);

    AppUserResponse loginUser(LoginUserRequest request);

    AppUserResponse refreshAccessToken(RefreshTokenRequest request);

    MessageResponse forgotPassword(ForgotPassworkRequest request);
}
