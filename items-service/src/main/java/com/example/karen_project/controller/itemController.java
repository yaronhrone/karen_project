package com.example.karen_project.controller;


import com.example.karen_project.model.Items;
import com.example.karen_project.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class itemController {

    @Autowired
    private ItemService itemService;


    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> createItem(@RequestBody Items item) {
        try {
            System.out.println(item + "item");
                String result = itemService.createItem(item);
                // Always 200, even for the "already exists" business rejection
                // (not just the real create). This is only ever called through
                // security's ItemsClient (a @FeignClient with a circuit
                // breaker/fallback) - Feign throws for any non-2xx status by
                // default, and the circuit breaker can't tell "items-service
                // rejected this on purpose" apart from a real fault, so a 400
                // here used to get replaced with the generic fallback message
                // ("Fallback cold not create") on the caller's side, hiding
                // the real "item already exists" reason completely. The
                // actual result text (still checked via .contains("created"))
                // is what carries the real outcome now, not the HTTP status.
                return new ResponseEntity<>(result, HttpStatus.OK);
            } catch (Exception e) {
                System.out.println(e.getMessage());
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }


    @GetMapping("/get_by_category/{category}/")
    public ResponseEntity<List<Items>> getItemByCategory(@PathVariable String category,@RequestParam (defaultValue = "1") int page ,@RequestParam (defaultValue = "10") int size){
        try {
            List<Items> result = itemService.getItemsByCategory(category,page,size);
            if (result == null){
                return new ResponseEntity("not found",HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(result,HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/get_by_name_and_category/{name}/{category}")
    public ResponseEntity<List<Items>> getItemByNameAndCategory(@PathVariable String name,@PathVariable String category){
        try {
            List<Items> result = itemService.getItemsByCategoryAndName(category,name);
            if (result == null){
                return new ResponseEntity("not found",HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(result,HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/{name}")
    public ResponseEntity<List<Items>> getItemBYName(@PathVariable String name){
        System.out.println(name + "name get by name");
        try {
            List<Items> item = itemService.getItemByName(name);

if (item.isEmpty()){
    return new ResponseEntity("not found",HttpStatus.NOT_FOUND);
}
        return new ResponseEntity<>( item,HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all/")
    private ResponseEntity<List<Items>> getAll(@RequestParam (defaultValue = "1") int page ,@RequestParam (defaultValue = "10") int size){
        try {
List<Items> items = itemService.getAll(page, size);
        return new ResponseEntity<>(items,HttpStatus.OK);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @DeleteMapping("/{name}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteItem(@PathVariable String name){
        try {
            String r = itemService.deleteItem(name);
            if (r.contains("deleted")){
            return new ResponseEntity<>(r,HttpStatus.OK);
            }
                return new ResponseEntity<>(r,HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @DeleteMapping("/delete_by_id/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteItemById(@PathVariable int id){
        try {
            String r = itemService.deleteItemById(id);
            System.out.println(r + "delete by id");
            if (r.contains("deleted")){
                return new ResponseEntity<>(r,HttpStatus.OK);
            }
            return new ResponseEntity<>(r,HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/get-by-id/{id}")
    public ResponseEntity<Items> getItemById(@PathVariable int id){
        try {
            Items item = itemService.getItemById(id);
            if (item == null){
                return new ResponseEntity("not found",HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(item,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> updateItem(@RequestBody Items item){
        try {
            System.out.println(item + "item update");
            String result = itemService.updateItem(item);
            if (result.contains("updated")) {
                return new ResponseEntity<>(result,HttpStatus.OK);
            }
            return new ResponseEntity<>(result,HttpStatus.NOT_FOUND);
        } catch (Exception e) {

            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
