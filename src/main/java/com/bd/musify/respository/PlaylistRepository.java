package com.bd.musify.respository;

import com.bd.musify.entity.Playlist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    @Query("SELECT DISTINCT p FROM Playlist p JOIN PlaylistSong ps ON p.id = ps.playlist.id WHERE p.isPublic = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Playlist> findPublicPlaylistsWithSongsByNameOrDescription(String search, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Playlist p JOIN PlaylistSong ps ON p.id = ps.playlist.id WHERE p.isPublic = true")
    Page<Playlist> findPublicPlaylistsWithSongs(Pageable pageable);

    Page<Playlist> findByAppUserIdAndNameContainingIgnoreCaseOrAppUserIdAndDescriptionContainingIgnoreCase(
            Long userId1, String name, Long userId2, String description, Pageable pageable);

    Page<Playlist> findByAppUserId(Long id, Pageable pageable);

}
