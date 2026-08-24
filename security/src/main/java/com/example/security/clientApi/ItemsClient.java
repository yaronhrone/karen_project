package com.example.security.clientApi;

import com.example.security.model.Item;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// url was previously hardcoded to http://localhost:8080/api/items, duplicating
// (and overriding, since a literal `url` always wins) the external-api.items.url
// property that already existed in application.yaml but was never actually read.
// Wired to that property instead so it can be pointed at the items container's
// Docker network hostname without a code change.
@FeignClient(name = "items", url = "${external-api.items.url}", fallback = ItemsClientFallback.class, configuration = ItemsClientConfig.class)
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
