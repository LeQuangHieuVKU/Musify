package com.bd.musify.service;

import com.bd.musify.dto.request.SongRequest;
import com.bd.musify.dto.response.MessageResponse;
import com.bd.musify.dto.response.SongAiInsightsResponse;
import com.bd.musify.dto.response.SongResponse;
import org.springframework.web.multipart.MultipartFile;

public interface SongService {
    SongResponse addSong(SongRequest request, MultipartFile songFile, MultipartFile imageFile, String email);

    Object getAllSongs(Long userId, int page, int size, String search);

    SongResponse getSongById(Long id);

    SongResponse updateSong(Long id, SongRequest songRequest, MultipartFile songFile, MultipartFile imageFile, String email);

    MessageResponse deleteSong(Long id, String email);

    SongAiInsightsResponse getSongAiInsights(Long songId);
}
