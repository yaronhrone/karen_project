package com.example.karen_project.controller;


import com.example.karen_project.model.Items;
import com.example.karen_project.model.StockLine;
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
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }


    // Stock take/restore for sent and cancelled orders. Not for people: only the
    // orders service holds a token with STOCK_SERVICE, so no customer or admin
    // token can call these. Always 200 (same Feign reason as createItem above) -
    // the body is the names of the items that were short; empty = it worked.
    @PostMapping("/stock/take")
    @PreAuthorize("hasAuthority('STOCK_SERVICE')")
    public ResponseEntity<List<String>> takeStock(@RequestBody List<StockLine> lines) {
        try {
            return new ResponseEntity<>(itemService.takeStock(lines), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/stock/restore")
    @PreAuthorize("hasAuthority('STOCK_SERVICE')")
    public ResponseEntity<Void> restoreStock(@RequestBody List<StockLine> lines) {
        try {
            itemService.restoreStock(lines);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // All chocolate boxes in one call (the box builder and the home page list
    // them). Public, like every other catalog read.
    @GetMapping("/boxes")
    public ResponseEntity<List<Items>> getBoxes() {
        try {
            return new ResponseEntity<>(itemService.getBoxes(), HttpStatus.OK);
        } catch (Exception e) {
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
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // Postgres full-text search (tsvector + GIN, see data-postgresql.sql) -
    // matches partial words and multi-word queries in any order (e.g. "שוקו
    // כה" finds "שוקולד כהה"), which the substring LIKE this replaced could
    // never do. Same endpoint/response shape as before - only what powers it
    // changed.
    @GetMapping("/{name}")
    public ResponseEntity<List<Items>> getItemBYName(@PathVariable String name){
        try {
            List<Items> item = itemService.searchItems(name);

if (item == null || item.isEmpty()){
    return new ResponseEntity("not found",HttpStatus.NOT_FOUND);
}
        return new ResponseEntity<>( item,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all/")
    // Was `private` - harmless before @EnableMethodSecurity, but that
    // annotation (added alongside @PreAuthorize on the write endpoints
    // below) makes Spring Security AOP-proxy this whole bean via CGLIB
    // subclassing, which cannot override a private method. Calls routed
    // through the proxy to a private method don't reach the properly
    // dependency-injected target instance, so itemService came back null -
    // a live 500 on the public catalog endpoint. Every other method here is
    // already public; this one just needs to match.
    public ResponseEntity<List<Items>> getAll(@RequestParam (defaultValue = "1") int page ,@RequestParam (defaultValue = "10") int size){
        try {
List<Items> items = itemService.getAll(page, size);
        return new ResponseEntity<>(items,HttpStatus.OK);
        } catch (Exception e) {
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
            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @DeleteMapping("/delete_by_id/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteItemById(@PathVariable int id){
        try {
            String r = itemService.deleteItemById(id);
            if (r.contains("deleted")){
                return new ResponseEntity<>(r,HttpStatus.OK);
            }
            return new ResponseEntity<>(r,HttpStatus.NOT_FOUND);
        } catch (Exception e) {
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
            // Always 200, like createItem: the caller (security's ItemsClient) reads
            // the text for "updated". A 404 here used to be swallowed by Feign's
            // fallback, so the admin never saw why an edit was refused.
            return new ResponseEntity<>(itemService.updateItem(item),HttpStatus.OK);
        } catch (Exception e) {

            return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
