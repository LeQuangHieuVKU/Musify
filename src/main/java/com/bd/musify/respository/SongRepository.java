package com.bd.musify.respository;

import com.bd.musify.entity.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    Page<Song> findByAppUserIdAndTitleContainingIgnoreCaseOrAppUserIdAndArtistContainingIgnoreCase(
            Long userId1,String title,Long userId2, String artist ,Pageable pageable);

    Page<Song> findByTitleContainingIgnoreCaseAndArtistContainingIgnoreCase(
            String title, String artist, Pageable pageable);

    Page<Song> findByAppUserId(Long appUserId, Pageable pageable);
}
