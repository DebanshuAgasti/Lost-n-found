package com.lostfound.service;

import com.lostfound.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final Path storageDirectory;

    public record StoredFileInfo(String filename, String filePath, String url, long fileSize, String mimeType) {}

    public ImageStorageService(@Value("${lostfound.storage.upload-dir:./uploads/images}") String uploadDir) {
        this.storageDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize image storage directory at " + this.storageDirectory, e);
        }
    }

    public StoredFileInfo storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty image file.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String storedFilename = UUID.randomUUID() + extension;
        Path targetLocation = this.storageDirectory.resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store image " + originalFilename + ". Please try again!", ex);
        }

        String url = "/api/images/" + storedFilename;
        return new StoredFileInfo(
                storedFilename,
                targetLocation.toString(),
                url,
                file.getSize(),
                file.getContentType()
        );
    }

    public Resource loadAsResource(String filename) {
        try {
            Path filePath = this.storageDirectory.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("File not found or unreadable: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new BadRequestException("File not found: " + filename);
        }
    }
}
