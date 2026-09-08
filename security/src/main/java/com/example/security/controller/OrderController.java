package com.example.security.controller;


import com.example.security.model.Order;
import com.example.security.model.ProductRequest;
import com.example.security.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")

public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/{item_id}")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<String> addItemOrder(Authentication authentication, @PathVariable (value = "item_id") int  itemId) {
        try {
            String response = orderService.addToOrder(authentication.getName(), itemId);
            if (response.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<List<Order>> getOrder(Authentication authentication) {
        try {
            List<Order> result = orderService.getAllOrderByEmail(authentication.getName());
            // Temporary diagnostic - a customer with a real, confirmed-in-the-
            // DB order got an empty result here with no exception thrown
            // (2026-09-08). Need to see the exact identity this endpoint is
            // actually querying with and how many rows it got back, since
            // nothing else explains a genuine row existing but not returning.
            System.out.println("GET /order for '" + authentication.getName() + "' -> " + result.size() + " order(s)");
            return ResponseEntity.ok().body(result);
        } catch (Exception e) {
            // Was silent - a customer hit a frontend crash traced back to
            // this endpoint returning something other than an array, with
            // zero server-side trace of why. Logging the actual exception
            // (not just e.getMessage(), which is null for several common
            // exception types) so a repeat is actually diagnosable.
            e.printStackTrace();
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<String> updateOrder(Authentication authentication) {
        try {
            String response = orderService.changeOrderStatus(authentication.getName());

            return ResponseEntity.ok().body(response);
        }  catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    @DeleteMapping("item/{item_id}")
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public ResponseEntity<String> removeOrderItem(Authentication authentication, @PathVariable (value = "item_id" ) int itemId) {
        try {
            String response = orderService.removeItemFromOrder(authentication.getName(), itemId);
            if (response.contains("not found")) {
                return new ResponseEntity(response, HttpStatus.BAD_REQUEST);
            }
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
        public ResponseEntity<String> deleteOrder(Authentication authentication, @PathVariable int id){
        try {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equals("ADMIN"));
            String result = orderService.deleteOrder(id, authentication.getName(), isAdmin);
            if (result.contains("not found")) {
                return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
            }
            if (result.contains("Not authorized")) {
                return new ResponseEntity(result, HttpStatus.FORBIDDEN);
            }

        return new ResponseEntity<>(result,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        }

}
