package com.bd.musify.serviceImpl;

import com.bd.musify.dto.request.SongRequest;
import com.bd.musify.dto.response.MessageResponse;
import com.bd.musify.dto.response.PaginatedResponse;
import com.bd.musify.dto.response.SongAiInsightsResponse;
import com.bd.musify.dto.response.SongResponse;
import com.bd.musify.entity.AppUser;
import com.bd.musify.entity.Song;
import com.bd.musify.respository.AppUserResponsitory;
import com.bd.musify.respository.PlaylistSongRepository;
import com.bd.musify.respository.SongRepository;
import com.bd.musify.service.GenericGeminiService;
import com.bd.musify.service.SongService;
import com.bd.musify.util.FileHandlerUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SongServiceImpl implements SongService {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private AppUserResponsitory  appUserResponsitory;

    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    @Autowired
    private FileHandlerUtil fileHandlerUtil;

    @Value("${app.base.url}")
    private String baseUrl;

    @Autowired
    private GenericGeminiService geminiService;


    @Override
    public SongResponse addSong(SongRequest request, MultipartFile songFile, MultipartFile imageFile, String email) {
        AppUser appUser = getUserByEmail(email);
        String uniqueId = UUID.randomUUID().toString();

        Song song = new Song();
        song.setAppUser(appUser);
        updateSongMetaData(song,request);

        String songUrl = processSongFile(songFile, uniqueId);
        song.setSongUrl(songUrl);

        String imageUrl = processImageFile(imageFile,uniqueId);
        song.setImageUrl(imageUrl);

        Song savedSong = songRepository.save(song);
        return SongResponse.fromEntity(savedSong, baseUrl);
    }

    @Override
    public Object getAllSongs(Long userId, int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Song> songPage;

        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasUserId = userId != null;

        if (hasUserId && hasSearch) {
            songPage = songRepository.findByAppUserIdAndTitleContainingIgnoreCaseOrAppUserIdAndArtistContainingIgnoreCase(
                    userId, search.trim(), userId, search.trim(), pageable);
        } else if (hasSearch){
            songPage =  songRepository.findByTitleContainingIgnoreCaseAndArtistContainingIgnoreCase(search.trim(), search.trim(), pageable);
        } else if (hasUserId) {
            songPage = songRepository.findByAppUserId(userId, pageable);
        } else {
            songPage = songRepository.findAll(pageable);
        }

        List<SongResponse> songResponses = songPage.getContent().stream()
                .map(song -> SongResponse.fromEntity(song, baseUrl))
                .collect(Collectors.toList());
        return new PaginatedResponse<>(
                songResponses,
                songPage.getNumber(),
                songPage.getSize(),
                songPage.getTotalElements(),
                songPage.getTotalPages(),
                songPage.isLast(),
                songPage.isFirst()
        );
    }

    @Override
    public SongResponse getSongById(Long id) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found"));
        return SongResponse.fromEntity(song, baseUrl);
    }

    @Override
    public SongResponse updateSong(Long id, SongRequest request, MultipartFile songFile, MultipartFile imageFile, String email) {
        Song song = validateAccess(id,email);
        updateSongMetaData(song,request);

        if (songFile != null && !songFile.isEmpty()) {
            deleteOldSongFile(song.getSongUrl());
            String unique = UUID.randomUUID().toString();
            String songUrl = processSongFile(songFile, unique);
            song.setSongUrl(songUrl);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            deleteOldImageFile(song.getImageUrl());
            String unique = UUID.randomUUID().toString();
            String imageUrl = processImageFile(imageFile, unique);
            song.setImageUrl(imageUrl);
        }

        Song updatedSong = songRepository.save(song);
        return SongResponse.fromEntity(updatedSong, baseUrl);
    }

    @Override
    public MessageResponse deleteSong(Long id, String email) {
        Song song = validateAccess(id,email);
        playlistSongRepository.deleteBySongId(id);
        deleteSongFiles(song);
        songRepository.delete(song);
        return new MessageResponse("Song deleted successfully");
    }

    @Override
    public SongAiInsightsResponse getSongAiInsights(Long songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        String prompt = buildSongAnalysisPrompt(song);
        return geminiService.generateContent(prompt, SongAiInsightsResponse.class);
    }




    private Song validateAccess(Long id, String email) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        AppUser appUser = getUserByEmail(email);

        boolean isOwner = song.getAppUser().getId().equals(appUser.getId());
        boolean isAdmin = "ADMIN".equals(appUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Access denied: You do not have permission to update this song");
        }

        return song;

    }


    private void updateSongMetaData(Song song, SongRequest request) {
        song.setTitle(request.getTitle());
        song.setArtist(request.getArtist());
    }

    private AppUser getUserByEmail(String email) {
        return appUserResponsitory.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private String processSongFile(MultipartFile songFile, String uniqueId) {
        String songExtension = fileHandlerUtil.getFileExtension(songFile.getOriginalFilename());
        String songFileName = uniqueId + songExtension;
        fileHandlerUtil.saveSongFileWithName(songFile, songFileName);
        return "/api/file/song/"+ songFileName;
    }

    private String processImageFile(MultipartFile imageFile, String uniqueId) {
        if(imageFile == null || imageFile.isEmpty()) {
            return null;
        }
        String imageExtension = fileHandlerUtil.getFileExtension(imageFile.getOriginalFilename());
        String imageFileName = uniqueId + imageExtension;
        fileHandlerUtil.saveImageFileWithName(imageFile, imageFileName);
        return "/api/file/image/"+ imageFileName;
    }

    private void deleteOldImageFile(String imageUrl) {
        if (imageUrl != null) {
            String oldImageFileName = fileHandlerUtil.extractFilename(imageUrl);
            if (oldImageFileName != null) {
                fileHandlerUtil.deleteImageFile(oldImageFileName);
            }
        }
    }

    private void deleteOldSongFile(String songUrl) {
        if (songUrl != null){
            String oldSongFileName = fileHandlerUtil.extractFilename(songUrl);
            if (oldSongFileName != null) {
                fileHandlerUtil.deleteSongFile(oldSongFileName);
            }
        }
    }

    private void deleteSongFiles(Song song) {
        deleteOldSongFile(song.getSongUrl());
        deleteOldImageFile(song.getImageUrl());
    }

    private String buildSongAnalysisPrompt(Song song) {
        return String.format("""
                Analyze the song '%s' by '%s' and provide detailed insights in JSON format.
                
                Return a JSON object with the following structure:
                {
                  "analysis": "A detailed 2-3 sentence analysis of the track's musical characteristics, production quality, and emotional impact",
                  "moods": ["List", "of", "4-6", "mood", "keywords"],
                  "genre": "Primary genre classification",
                  "tempo": 120,
                  "key": "Musical key (e.g., C Major, D Minor)",
                  "energy": 7,
                  "similarArtists": ["List", "of", "4-6", "similar", "artists"],
                  "recommendedFor": "A 1-2 sentence recommendation about when and where to listen to this song"
                }
                
                Important:
                - The 'tempo' should be an estimated BPM (beats per minute) between 60-200
                - The 'energy' should be a rating from 1-10
                - Base your analysis on the artist's typical style and the song title
                - Be creative but realistic
                - Return ONLY the JSON object, no additional text
                """, song.getTitle(), song.getArtist()
        );

    }
}
