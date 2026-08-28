package com.example.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        // jwt.secret has no default in application.yaml anymore (it used to fall back to a
        // hardcoded, publicly-committed value - see application.yaml's comment), so it must be
        // supplied here for the context to boot; this value is test-only.
        properties = "jwt.secret=test-only-secret-not-used-in-production-0123456789abcdef")
class SecurityApplicationTests {

	@Test
	void contextLoads() {
	}

}
