package com.perfume.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;


@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;


    public Map<String, String> uploadImage(MultipartFile file, String folder) throws IOException {
        if ("your_api_key".equals(apiKey) || apiKey == null || apiKey.trim().isEmpty()
                || "your_cloud_name".equals(cloudName) || cloudName == null || cloudName.trim().isEmpty()) {
            throw new IOException(
                "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, " +
                "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."
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
