package com.example.security.controller;

import com.cloudinary.utils.ObjectUtils;
import com.example.security.model.*;
import com.example.security.service.ItemImportService;
import com.example.security.service.ItemService;
import com.example.security.service.OrderService;
import com.example.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;
    @Autowired
    private ItemService itemService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private CloudinaryConfig cloudinaryConfig;
    @Autowired
    private ItemImportService itemImportService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping(value = "/all-users/")
    public ResponseEntity<List<CustomUser>> getAllUsers(@RequestParam (defaultValue = "1") int page , @RequestParam (defaultValue = "10" ) int size) {
        try {
            List<CustomUser> users = userService.getAllUsers(page, size);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete-user/{email}")
    public ResponseEntity<String> deleteAnotherUser(@PathVariable String email) {
        try {
            String result = userService.deleteUser(email);
            if (result.contains("successfully")) {
                return new ResponseEntity(result, HttpStatus.OK);
            }
            return new ResponseEntity(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/item" , consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<String> createItem(@RequestPart("item") ItemRequest itemRequest , @RequestPart("file") MultipartFile file) throws IOException {

            try {
                if(file.isEmpty()) {
                    return ResponseEntity.badRequest().body("Please upload a file");
                }
        // העלאה ל-Cloudinary
        Map uploadResult = cloudinaryConfig.getCloudinary()
                .uploader()
                .upload(file.getBytes(), ObjectUtils.emptyMap());

        String imageUrl = (String) uploadResult.get("secure_url");
        String imageId = (String) uploadResult.get("public_id");
                System.out.println(imageId);
        System.out.println(imageUrl);

                    Item item = new Item();
                    item.setDeleteImgId(imageId);
                    item.setName(itemRequest.getName());
                    item.setCategory(itemRequest.getCategory());
                    item.setDescription(itemRequest.getDescription());
                    item.setPrice(itemRequest.getPrice());
                    item.setImage(imageUrl);
                    item.setVeg(itemRequest.isVeg());
                    System.out.println(item + " item from create item");
                    String result = itemService.createItem(item);
                System.out.println(result);
                    if (result.contains("created")) {

                        return ResponseEntity.ok().body(result);
                    }
                    return ResponseEntity.badRequest().body(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping(value = "/{name}")
    public ResponseEntity<Item> getItem(@PathVariable String name) {

        try {
            Item item = itemService.getItem(name);

            return ResponseEntity.ok().body(item);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/delete_by_name/{name}")
    public ResponseEntity<String> deleteItemByName( @PathVariable String name) {
        try {

            String result = itemService.deleteItemByName(name);
            if (result.contains("deleted")) {
                return new ResponseEntity<>(result, HttpStatus.OK);
            }
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping(value = "/update_item")
    public ResponseEntity<String> updateItem(@RequestBody Item item) {

        try {
            String result = itemService.updateItem(item);
            if (result.contains("updated")) {
                return new ResponseEntity<>(result, HttpStatus.OK);
            }
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping(value = "/all_items/")
    public ResponseEntity<List<Item>> getAllItem(@RequestParam (defaultValue = "1") int page , @RequestParam (defaultValue = "10" ) int size) {
        try {
            return ResponseEntity.ok().body(itemService.getAllItem(page, size));
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("delete_by_id/{id}")
    public ResponseEntity<String> deleteItemById(@PathVariable int id) {
        try {
            System.out.println("delete" + id);
            String result = itemService.deleteItemById(id);
            if (result.contains("deleted")) {
                return new ResponseEntity<>(result, HttpStatus.OK);
            }
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // Bulk product import from a CSV file (header row: name, description,
    // price, category, veg, image_url) - see ItemImportService for the
    // per-row validation/upload logic. A failed row is skipped and reported,
    // it doesn't abort the whole file.
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/items/import", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ItemImportResult> importItems(@RequestPart("file") MultipartFile file) {
        try {
            ItemImportResult result = itemImportService.importItemsFromCsv(file.getInputStream());
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/order/{email}")
    public ResponseEntity<List<Order>> getOrder(@PathVariable String email) {
        try {
            return ResponseEntity.ok().body(orderService.getAllOrderByEmail(email));
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    // Orders already sent by a customer (RECEIVED/IN_PROGRESS) that still
    // need Keren's attention, across all users - the inbox view in Admin.
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/orders/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        try {
            return ResponseEntity.ok().body(orderService.getActiveOrders());
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/order/{id}/status")
    public ResponseEntity<String> advanceOrderStatus(@PathVariable int id, @RequestParam String status) {
        try {
            String result = orderService.advanceOrderStatus(id, status);
            if ("Invalid status".equals(result)) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok().body(result);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}



