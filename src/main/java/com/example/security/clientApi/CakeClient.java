package com.example.security.clientApi;

import com.example.security.model.Cake;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "cake" , url = "http://localhost:8080/api/cakes")
public interface CakeClient {
@GetMapping("/{cake}")
     Cake getCake(@PathVariable String cake);
@PostMapping
String createCake(@RequestBody Cake cake);
}
