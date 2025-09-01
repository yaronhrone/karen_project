package com.example.security.clientApi;

import com.example.security.model.Chocolate;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "chocolate", url = "http://localhost:8080/api/chocolate")
public interface ChocolateClient
{
    @GetMapping("{name}")
    Chocolate getChocolate(@PathVariable String name);
    @PostMapping
    String createChocolate(@RequestBody Chocolate chocolate);
    @DeleteMapping("/{name}")
    String deleteChocolate(@PathVariable String name);
    @PutMapping
    String updateChocolate(@RequestBody Chocolate chocolate);
    @GetMapping
    List<Chocolate> getAllChocolates();
    @GetMapping("get-by-id/{id}")
    Chocolate getChocolateById(@PathVariable int id);
}
