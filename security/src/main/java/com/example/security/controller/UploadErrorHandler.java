package com.example.security.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

// A photo over spring.servlet.multipart.max-file-size used to end as a 401/403:
// the exception sent the request to /error, which Spring Security blocks, so
// the admin saw "login required" instead of "image too big". Answer it here,
// with a real 413 and a message the frontend can show as is.
@RestControllerAdvice
public class UploadErrorHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> tooBig(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("התמונה גדולה מדי (עד 10MB). נסה/י תמונה קטנה יותר.");
    }
}
