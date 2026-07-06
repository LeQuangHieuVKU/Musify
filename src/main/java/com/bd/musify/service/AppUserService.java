package com.bd.musify.service;

import com.bd.musify.dto.request.AppUserRequest;
import com.bd.musify.dto.response.AppUserResponse;
import com.bd.musify.dto.response.PaginatedResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public interface AppUserService {
    AppUserResponse getUserProfile(String email);

    AppUserResponse updateUserProfile(AppUserRequest request, String email);

    PaginatedResponse<AppUserResponse> getAllUsers(int page, int size);

    AppUserResponse updateUserRole(Long userId, String role, String email);
}
