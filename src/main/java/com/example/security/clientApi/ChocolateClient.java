package com.example.security.clientApi;

import com.example.security.model.Chocolate;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "chocolate", url = "http://localhost:8080/api/chocolate")
public interface ChocolateClient
{
    @GetMapping("{name}")
Chocolate getChocolate(@PathVariable String name);
    @PostMapping
String createChocolate(@RequestBody Chocolate chocolate);
}
