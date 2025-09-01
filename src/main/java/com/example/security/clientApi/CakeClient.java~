package com.example.security.clientApi;

import com.example.security.model.Cake;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "cake" , url = "http://localhost:8080/api/cakes")
public interface CakeClient {
@GetMapping("/{cake}")
     Cake getCake(@PathVariable String cake);
@PostMapping
String createCake(@RequestBody Cake cake);
@GetMapping
List<Cake> getAllCakes();
@DeleteMapping("/{name}")
     String deleteCake(@PathVariable String name);
@PutMapping("/update")
     String updateCake(@RequestBody Cake cake);
}
