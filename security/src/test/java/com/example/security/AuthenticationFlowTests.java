package com.example.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "spring.datasource.url=jdbc:h2:mem:authFlowTestDb")
class AuthenticationFlowTests {

    @Autowired
    private TestRestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void registerThenLoginThenFetchCurrentUser_worksWithEmailOnly() throws Exception {
        String email = "flow-test-user@example.com";
        String password = "Sup3r$ecret";

        Map<String, Object> registerBody = new LinkedHashMap<>();
        registerBody.put("first_name", "Flow");
        registerBody.put("last_name", "Tester");
        registerBody.put("password", password);
        registerBody.put("address", "1 Test St");
        registerBody.put("email", email);
        registerBody.put("phone", "0500000000");

        ResponseEntity<String> registerResponse = restTemplate.postForEntity("/users/register", registerBody, String.class);
        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        Map<String, Object> loginBody = new LinkedHashMap<>();
        loginBody.put("email", email);
        loginBody.put("password", password);

        ResponseEntity<String> loginResponse = restTemplate.postForEntity("/authenticate", loginBody, String.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode loginJson = objectMapper.readTree(loginResponse.getBody());
        String jwt = loginJson.get("jwt").asText();
        assertThat(jwt).isNotBlank();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwt);
        ResponseEntity<String> currentUserResponse = restTemplate.exchange(
                "/users", HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertThat(currentUserResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String body = currentUserResponse.getBody();
        assertThat(body).doesNotContain("\"username\"");
        assertThat(body).contains(email);
    }

    @Test
    void authenticate_withWrongPassword_isRejected() {
        Map<String, Object> loginBody = new LinkedHashMap<>();
        loginBody.put("email", "user1@example.com");
        loginBody.put("password", "definitely-wrong-password");

        ResponseEntity<String> response = restTemplate.postForEntity("/authenticate", loginBody, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void authenticateGoogle_withInvalidToken_failsCleanly() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("idToken", "not-a-real-google-token");

        ResponseEntity<String> response = restTemplate.postForEntity("/authenticate/google", body, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
