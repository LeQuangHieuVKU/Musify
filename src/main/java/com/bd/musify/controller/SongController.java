package com.bd.musify.controller;

import com.bd.musify.dto.response.SongAiInsightsResponse;
import com.bd.musify.entity.Song;
import com.bd.musify.service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/song")
public class SongController {

    @Autowired
    private SongService songService;

    @GetMapping("/getSongAiInsignts/{songId}")
    public ResponseEntity<SongAiInsightsResponse> getSongAiInsights(@PathVariable Long songId) {
        SongAiInsightsResponse response = songService.getSongAiInsights(songId);
        return ResponseEntity.ok(response);
    }
}
