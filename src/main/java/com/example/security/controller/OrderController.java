package com.example.security.controller;


import com.example.security.model.Order;
import com.example.security.model.ProductRequest;
import com.example.security.service.OrderService;
import com.example.security.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/order")

public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/{item_id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> addItemOrder(@RequestHeader("Authorization") String token , @PathVariable (value = "item_id") int  itemId) {
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);

            String response = orderService.addToOrder(username, itemId);
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Order>> getOrder(@RequestHeader("Authorization") String token) {
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            return ResponseEntity.ok().body(orderService.getAllOrderByUsername(username));
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PutMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> updateOrder(@RequestHeader("Authorization") String token  ) {
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            String response = orderService.changeOrderStatus(username);

            return ResponseEntity.ok().body(response);
        }  catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    @DeleteMapping("item/{item_id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> removeOrderItem(@RequestHeader("Authorization") String token, @PathVariable (value = "item_id" ) int itemId) {
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            String response = orderService.removeItemFromOrder(username, itemId);
            if (response.contains("not found")) {
                return new ResponseEntity(response, HttpStatus.BAD_REQUEST);
            }
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('USER')")
        public ResponseEntity<String> deleteOrder(@RequestHeader("Authorization") String token, @PathVariable int id){
        try {
            String jwtToken = token.substring(7);
            String username = jwtUtil.extractUsername(jwtToken);
            String result = orderService.deleteOrder(id);
            if (result.contains("not found")) {
                return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
            }

        return new ResponseEntity<>(result,HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        }

}
