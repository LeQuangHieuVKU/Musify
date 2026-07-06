package com.bd.musify.dto.response;

import com.bd.musify.entity.Playlist;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistResponse {

    private Long id;
    private String name;
    private String description;
    private Boolean isPublic;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long appUserId;
    private String appUserName;

    public static PlaylistResponse fromEntity(Playlist playlist, String baseUrl) {
        PlaylistResponse response = new PlaylistResponse();
        response.setId(playlist.getId());
        response.setName(playlist.getName());
        response.setDescription(playlist.getDescription());
        response.setIsPublic(playlist.getIsPublic());
        response.setImageUrl(playlist.getImageUrl() != null ? baseUrl + playlist.getImageUrl() : null);
        response.setCreatedAt(playlist.getCreatedAt());
        response.setUpdatedAt(playlist.getUpdatedAt());
        response.setAppUserId(playlist.getAppUser().getId());
        response.setAppUserName(playlist.getAppUser().getName());
        return response;
    }
}
