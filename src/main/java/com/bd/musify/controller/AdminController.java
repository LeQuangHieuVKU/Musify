package com.bd.musify.controller;

import com.bd.musify.dto.request.SongRequest;
import com.bd.musify.dto.response.MessageResponse;
import com.bd.musify.dto.response.SongResponse;
import com.bd.musify.service.SongService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {

    @Autowired
    private SongService songService;

    @PostMapping("/addSong")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SongResponse>  addSong(
            @RequestParam("title") @NotBlank(message = "Title is required")
            @Size(max = 100, message = "Title must not exceed 100 characters") String title,
            @RequestParam("artist") @NotBlank(message = "Artist is required")
            @Size(max = 100, message = "Artist must not exceed 100 characters") String artist,
            @RequestParam("songFile") MultipartFile songFile,
            @RequestParam(value = "imageFile") MultipartFile imageFile,
            Authentication authentication
    ) {
        String email = authentication.getName();

        SongRequest request = new SongRequest(title, artist);
        SongResponse response  = songService.addSong(request, songFile, imageFile, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/getAllSongs")
    public ResponseEntity<?> getAllSongs(@RequestParam(required = false) Long userId,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size,
                                                     @RequestParam(required = false) String search) {
        return ResponseEntity.ok(songService.getAllSongs(userId, page, size, search));
    }

    @GetMapping("/getSongById/{id}")
    public ResponseEntity<SongResponse> getSongById(@PathVariable Long id) {
        SongResponse song = songService.getSongById(id);
        return ResponseEntity.ok(song);
    }

    @PutMapping("/updateSong/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SongResponse> updateSong(@PathVariable Long id,
                                                    @RequestParam("title") @NotBlank(message = "Title is required")
                                                        @Size(max = 100, message = "Title must not exceed 100 characters") String title,
                                                    @RequestParam("artist") @NotBlank(message = "Artist is required")
                                                        @Size(max = 100, message = "Artist must not exceed 100 characters") String artist,
                                                    @RequestParam(value = "songFile", required = false) MultipartFile songFile,
                                                    @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
                                                    Authentication authentication){
        String email = authentication.getName();
        SongRequest songRequest = new SongRequest(title, artist);

        SongResponse response = songService.updateSong(id,songRequest,songFile,imageFile,email);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deleteSong/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteSong(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        MessageResponse response = songService.deleteSong(id, email);
        return ResponseEntity.ok(response);
    }
}
