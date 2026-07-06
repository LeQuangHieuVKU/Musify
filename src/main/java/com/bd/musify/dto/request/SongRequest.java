package com.bd.musify.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongRequest {

    @NotBlank(message = "Song title is required")
    @Size(max=100, message = "Song title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "Artist name is required")
    @Size(max=100, message = "Artist name must not exceed 100 characters")
    private String artist;
}
