package com.perfume.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    public Map<String, String> uploadImage(MultipartFile file, String folder) throws IOException {
        if ("your_api_key".equals(apiKey) || apiKey == null || apiKey.trim().isEmpty()) {
            // Local file storage fallback
            String uploadDir = "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path path = Paths.get(uploadDir, fileName);
            Files.write(path, file.getBytes());

            String fileUrl = "/uploads/" + fileName;
            return Map.of(
                    "url", fileUrl,
                    "publicId", "local_" + fileName
            );
        }

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "perfume/" + folder,
                        "resource_type", "image",
                        "quality", "auto",
                        "fetch_format", "auto"
                )
        );
        return Map.of(
                "url", result.get("secure_url").toString(),
                "publicId", result.get("public_id").toString()
        );
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId != null && publicId.startsWith("local_")) {
            String fileName = publicId.substring("local_".length());
            File file = new File("uploads/" + fileName);
            if (file.exists()) {
                file.delete();
            }
            return;
        }
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
