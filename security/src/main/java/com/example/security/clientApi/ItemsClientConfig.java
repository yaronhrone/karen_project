package com.example.security.clientApi;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

// Deliberately NOT annotated @Configuration/@Component - it must only be
// picked up via @FeignClient(configuration = ItemsClientConfig.class) on
// ItemsClient, scoping this interceptor to that one client. If this were a
// normal Spring bean it would apply to every Feign client in the app,
// including GreenApiClient - which must never receive one of our users' JWTs.
//
// items-service independently verifies ADMIN-role JWTs on its own write
// endpoints (POST/PUT/DELETE /api/items/**, see its SecurityConfig) rather
// than trusting that only this service calls it - so every outgoing
// ItemsClient call needs the caller's own Authorization header forwarded,
// or items-service correctly (but silently, from this side) rejects it.
public class ItemsClientConfig {
    @Bean
    public RequestInterceptor authForwardingInterceptor() {
        return template -> {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return;
            }
            HttpServletRequest request = attrs.getRequest();
            String auth = request.getHeader("Authorization");
            if (auth != null) {
                template.header("Authorization", auth);
            }
        };
    }
}
