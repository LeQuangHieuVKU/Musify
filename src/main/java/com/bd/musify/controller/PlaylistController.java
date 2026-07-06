package com.bd.musify.controller;


import com.bd.musify.dto.request.PlaylistRequest;
import com.bd.musify.dto.response.MessageResponse;
<<<<<<< HEAD
import com.bd.musify.dto.response.PaginatedResponse;
import com.bd.musify.dto.response.PlaylistResponse;
import com.bd.musify.entity.Playlist;
import com.bd.musify.entity.PlaylistSong;
=======
import com.bd.musify.dto.response.PlaylistResponse;
import com.bd.musify.entity.Playlist;
>>>>>>> 509e4e47d967fb60afeb5bd9a44f74e58903cee9
import com.bd.musify.service.PlaylistService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/playlist")
@Validated
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @PostMapping("/createPlaylist")
    public ResponseEntity<PlaylistResponse> createPlaylist(@RequestParam("name") @NotBlank(message = "Playlist name is required") @Size(max = 100, message = "Playlist name must not exceed 100 characters") String name,
                                                           @RequestParam(value = "description", required = false) @Size(max = 500, message = "Description must not exceed 500 characters") String description,
                                                           @RequestParam(value = "isPublic", defaultValue = "false") Boolean isPublic,
                                                           @RequestParam(value = "imageFile", required = true) MultipartFile imageFile,
                                                           Authentication authentication) {
        String email = authentication.getName();

        PlaylistRequest request = new PlaylistRequest(name, description, isPublic);
        PlaylistResponse response = playlistService.createPlaylist(request,imageFile,email);

        return new ResponseEntity<>(response, HttpStatus.CREATED);

    }

    @PatchMapping("/updatePlaylistPrivacy/{id}")
    public ResponseEntity<PlaylistResponse> updatePlaylistPrivacy(@PathVariable Long id,
                                                                  @RequestParam("isPublic") Boolean isPublic,
                                                                  Authentication authentication) {
        String email = authentication.getName();
        PlaylistResponse response = playlistService.updatePlaylistPrivacy(id, isPublic, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/addSongToPlaylist/{playlistId}")
    public ResponseEntity<MessageResponse> addSongToPlaylist(@PathVariable Long playlistId,
                                                             @RequestParam("songId") Long songId,
                                                             Authentication authentication) {
        String email = authentication.getName();
        MessageResponse response = playlistService.addSongToPlayList(playlistId, songId, email);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/removeSongFromPlaylist/{playlistId}")
    public ResponseEntity<MessageResponse> removeSongFromPlaylist(@PathVariable Long playlistId,
                                                                @RequestParam("songId") Long songId,
                                                                Authentication authentication) {
        String email = authentication.getName();
        MessageResponse response = playlistService.removeSongFromPlaylist(playlistId, songId, email);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/reorderSongInPlaylist/{playlistId}")
    public ResponseEntity<MessageResponse> reorderSongInPlaylist(@PathVariable Long playlistId,
                                                                 @RequestParam("songId") Long songId,
                                                                 @RequestParam("newPosition") int newPosition,
                                                                 Authentication authentication) {
        String email = authentication.getName();
        MessageResponse response = playlistService.reorderSongInPlaylist(playlistId, songId, newPosition, email);
        return ResponseEntity.ok(response);
    }
<<<<<<< HEAD

    @GetMapping("/getAllPublicPlaylists")
    public ResponseEntity<?> getAllPublicPlaylists(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size,
                                                   @RequestParam(required = false) String search) {
        return ResponseEntity.ok(playlistService.getAllPublicPlaylists(page, size, search));
    }

    @GetMapping("/getMyPlaylists")
    public ResponseEntity<?> getMyPlaylists(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size,
                                            @RequestParam(required = false) String search,
                                            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized: Please log in to access your playlists.");
        }

        String email = authentication.getName();
        PaginatedResponse<PlaylistResponse> result = playlistService.getMyPlaylists(email,page,size,search);

        return ResponseEntity.ok(result);
    }

=======
>>>>>>> 509e4e47d967fb60afeb5bd9a44f74e58903cee9
}
