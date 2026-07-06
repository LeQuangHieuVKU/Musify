package com.bd.musify.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Component
public class FileHandlerUtil {

    @Value("${file.storage.song.path}")
    private String songStoragePath;

    @Value("${file.storage.image.path}")
    private String imageStoragePath;

    public String saveSongFileWithName(MultipartFile file, String customFileName) {
        return saveFileWithCustomName(file, songStoragePath, customFileName, "song");
    }

    public String saveImageFileWithName(MultipartFile file, String customFileName) {
        return saveFileWithCustomName(file, imageStoragePath, customFileName, "image");
    }

    private String saveFileWithCustomName(MultipartFile file, String songStoragePath, String customFileName, String fileType) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }

        try {
            Path directoryPath = Paths.get(songStoragePath);

            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }

            Path destinationPath = directoryPath.resolve(customFileName);
            Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

            return customFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file." + fileType + "file: " + ex.getMessage(), ex);
        }

    }

    public Resource loadSongFile(String fileName) {
        return loadFile(fileName, songStoragePath);
    }

    public Resource loadImageFile(String fileName) {
        return loadFile(fileName, imageStoragePath);
    }

    private Resource loadFile(String fileName, String storagePath) {
        try {
            Path filePath = Paths.get(storagePath).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error to load file: " + fileName, e);
        }
    }

    public void deleteSongFile(String fileName) {
        deleteFile(fileName, songStoragePath);
    }

    public void deleteImageFile(String fileName) {
        deleteFile(fileName,imageStoragePath);
    }

    private void deleteFile(String fileName, String storagePath) {
        try {
            Path filePath = Paths.get(storagePath).resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e){
            throw new RuntimeException("Error to delete file: " + fileName, e);
        }
    }

    public String extractFilename(String url){
        if(url != null && url.contains("/")){
            return url.substring(url.lastIndexOf("/")+1);
        }
        return null;
    }

    public String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf(".") + 1);
        }
        return "";
    }

}
