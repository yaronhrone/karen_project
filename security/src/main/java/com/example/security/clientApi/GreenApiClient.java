package com.example.security.clientApi;

import com.example.security.model.GreenApiMessageRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// GreenAPI's REST endpoint bakes the instance id and its token straight into
// the URL path (not headers/query), so both are passed as @PathVariables on
// every call rather than configured once on the client.
@FeignClient(name = "green-api", url = "https://api.green-api.com")
public interface GreenApiClient {
    @PostMapping("/waInstance{idInstance}/sendMessage/{apiTokenInstance}")
    String sendMessage(@PathVariable String idInstance, @PathVariable String apiTokenInstance,
                        @RequestBody GreenApiMessageRequest body);
}
