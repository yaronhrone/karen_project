package com.example.security.controller;

import com.example.security.model.*;
import com.example.security.service.ItemImportService;
import com.example.security.service.ItemService;
import com.example.security.service.OrderService;
import com.example.security.service.S3Service;
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
    private S3Service s3Service;
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
                    return ResponseEntity.badRequest().body("יש להעלות תמונה");
                }
        // העלאה ל-S3
        S3Service.UploadResult uploadResult = s3Service.upload(file);

                    Item item = new Item();
                    item.setDeleteImgId(uploadResult.key());
                    item.setName(itemRequest.getName());
                    item.setCategory(itemRequest.getCategory());
                    item.setDescription(itemRequest.getDescription());
                    item.setPrice(itemRequest.getPrice());
                    item.setImage(uploadResult.url());
                    item.setVeg(itemRequest.isVeg());
                    String result = itemService.createItem(item);
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

    // Multipart, mirroring createItem below - a new photo is optional (a
    // text-only edit sends no "file" part at all, and the existing
    // image/delete_img_id just carry forward unchanged). When a new file IS
    // provided, it's uploaded to S3 before the old object is deleted - if
    // the upload throws, the item keeps its original image instead of
    // ending up with none.
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping(value = "/update_item", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<String> updateItem(@RequestPart("item") ItemUpdateRequest itemRequest,
                                              @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            Item existing = itemService.getItemById(itemRequest.getId());
            if (existing == null) {
                return ResponseEntity.badRequest().body("המוצר לא קיים במערכת");
            }

            Item item = new Item();
            item.setId(itemRequest.getId());
            item.setName(itemRequest.getName());
            item.setCategory(itemRequest.getCategory());
            item.setDescription(itemRequest.getDescription());
            item.setPrice(itemRequest.getPrice());
            item.setVeg(itemRequest.isVeg());

            if (file != null && !file.isEmpty()) {
                S3Service.UploadResult uploadResult = s3Service.upload(file);
                item.setImage(uploadResult.url());
                item.setDeleteImgId(uploadResult.key());
                s3Service.delete(existing.getDeleteImgId());
            } else {
                item.setImage(existing.getImage());
                item.setDeleteImgId(existing.getDeleteImgId());
            }

            String result = itemService.updateItem(item);
            if (result.contains("updated")) {
                return ResponseEntity.ok().body(result);
            }
            return ResponseEntity.badRequest().body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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

    // Every order on Keren's admin board (RECEIVED/IN_PROGRESS/READY) -
    // AdminOrders.jsx groups these into its 3 sections. A CANCELLED order
    // drops off this list entirely once its status changes (by design -
    // history stays in the DB, not surfaced as a 4th board section).
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/orders/board")
    public ResponseEntity<List<Order>> getOrdersForAdminBoard() {
        try {
            return ResponseEntity.ok().body(orderService.getOrdersForAdminBoard());
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/order/{id}/status")
    public ResponseEntity<String> advanceOrderStatus(@PathVariable int id, @RequestParam String status,
                                                       @RequestParam(required = false) String readyBy) {
        try {
            java.time.LocalDate parsedReadyBy = (readyBy != null && !readyBy.isBlank())
                    ? java.time.LocalDate.parse(readyBy) : null;
            String result = orderService.advanceOrderStatus(id, status, parsedReadyBy);
            if ("Invalid status".equals(result)) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok().body(result);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}



