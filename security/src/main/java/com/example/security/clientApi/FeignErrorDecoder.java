package com.example.security.clientApi;

import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.stereotype.Component;

@Component
public class FeignErrorDecoder implements ErrorDecoder {
    private final ErrorDecoder defaultErrorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        return switch (response.status()) {
            case 400 -> new IllegalArgumentException("Bad Request to " + methodKey);
            case 404 -> new RuntimeException("Not Found: " + methodKey);
            case 500 -> new RuntimeException("Internal Server Error at " + methodKey);
            default -> new RuntimeException("Unexpected error: " + response.status());
        };


    }

}
