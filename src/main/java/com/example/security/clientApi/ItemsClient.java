package com.example.security.clientApi;

import com.example.security.model.Item;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "items", url = "http://localhost:8080/api/items", fallback = ItemsClientFallback.class)
public interface ItemsClient
{
    @GetMapping("/{name}")
    Item getItem(@PathVariable String name);
    @PostMapping
    String createItem(@RequestBody Item item);
    @DeleteMapping("/{name}")
    String deleteItem(@PathVariable String name);
    @PutMapping("/update")
    String updateItem(@RequestBody Item item);
    @GetMapping("/all/")
    List<Item> getAllItem(@RequestParam int page,@RequestParam int size);
    @GetMapping("/get-by-id/{id}")
    Item getItemById(@PathVariable int id);
    @DeleteMapping("/delete_by_id/{id}")
    String deleteItemById(@PathVariable int id);

}
