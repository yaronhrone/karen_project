package com.example.security.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

/**
 * Product image storage. Replaces Cloudinary - uploads/deletes objects
 * directly in the keren-diamonds-product-images S3 bucket. No access keys
 * anywhere in this app: S3Client uses the default AWS credential provider
 * chain, which resolves to the EC2 instance's IAM role in production and
 * the local AWS CLI profile for local dev.
 */
@Service
public class S3Service {

    @Value("${aws.s3.bucket}")
    private String bucket;
    @Value("${aws.s3.region}")
    private String region;

    private S3Client s3Client;

    @PostConstruct
    private void init() {
        s3Client = S3Client.builder().region(Region.of(region)).build();
    }

    public UploadResult upload(MultipartFile file) throws IOException {
        String key = "products/" + UUID.randomUUID() + extensionFor(file.getContentType());
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );
        String url = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
        return new UploadResult(url, key);
    }

    // key is what upload() returned as UploadResult.key() - stored in the
    // item's delete_img_id column (same column Cloudinary's public_id used
    // to live in; repurposed rather than adding a new one).
    public void delete(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }

    private String extensionFor(String contentType) {
        if (contentType == null) {
            return ".jpg";
        }
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }

    public record UploadResult(String url, String key) {}
}
