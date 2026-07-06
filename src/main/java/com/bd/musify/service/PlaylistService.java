package com.bd.musify.service;

import com.bd.musify.dto.request.PlaylistRequest;
import com.bd.musify.dto.response.MessageResponse;
import com.bd.musify.dto.response.PaginatedResponse;
import com.bd.musify.dto.response.PlaylistResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PlaylistService {
    PlaylistResponse createPlaylist(PlaylistRequest request, MultipartFile imageFile, String email);

    PlaylistResponse updatePlaylistPrivacy(Long id, Boolean isPublic, String email);

    MessageResponse addSongToPlayList(Long playlistId, Long songId, String email);

    MessageResponse removeSongFromPlaylist(Long playlistId, Long songId, String email);

    MessageResponse reorderSongInPlaylist(Long playlistId, Long songId, int newPosition, String email);


    PaginatedResponse<PlaylistResponse> getAllPublicPlaylists(int page, int size, String search);

    PaginatedResponse<PlaylistResponse> getMyPlaylists(String email, int page, int size, String search);

}
