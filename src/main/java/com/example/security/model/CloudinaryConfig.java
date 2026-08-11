package com.example.security.model;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Component;

@Component
public class CloudinaryConfig {
    private static final Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "dwlxymqgw",
            "api_key", "312272572583384",
            "api_secret", "wFvWt5HzwcPEAZCDaWGUcswcWQg"
    ));
    public static Cloudinary getCloudinary() {
        return cloudinary;
    }
}
