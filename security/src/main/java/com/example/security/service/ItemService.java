package com.example.security.service;

import com.example.security.clientApi.ItemsClient;
import com.example.security.model.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemsClient itemClient;
    @Autowired
    private S3Service s3Service;
    @Autowired
    private FavoriteService favoriteService;



    public Item getItem(String name) {
        return itemClient.getItem(name);
    }
    public Item getItemById(int id) {
        return itemClient.getItemById(id);
    }


    public String createItem(Item item) {

//            Item existing = itemClient.getItem(item.getName());
//        if (existing != null) {
//            return "Item already exists";
//        }
        // Pass items-service's own result straight through - it was
        // previously always prefixed with "Chocolate created ", which made
        // AdminController's `result.contains("created")` success check
        // always true even when itemClient.createItem() actually failed
        // (e.g. the ItemsClientFallback string "Fallback cold not create"),
        // silently masking every failed creation as a success.
        return itemClient.createItem(item);
    }
    public String deleteItemByName(String name) {

      Item existing = itemClient.getItem(name);
        if (existing != null) {
            // delete_img_id holds the S3 object key (see S3Service) - the
            // same field a Cloudinary public_id used to live in.
            s3Service.delete(existing.getDeleteImgId());
            String result = itemClient.deleteItem(name);
            // Otherwise every customer who'd favorited this item is left
            // with a dangling favorites row - see FavoriteService's
            // "פריט זה חסר" handling for what that looked like unfixed.
            favoriteService.deleteFavoritesByItemId(existing.getId());
            return result;
    } return "Item not found";
    }
    public String updateItem(Item item) {

        return itemClient.updateItem(item);

    }
    public List<Item> getAllItem(int page, int size) {return itemClient.getAllItem(page,size); }
    public String deleteItemById(int id) {
        Item existing = itemClient.getItemById(id);
        if (existing != null) {
            s3Service.delete(existing.getDeleteImgId());
        }
        String result = itemClient.deleteItemById(id);
        // Otherwise every customer who'd favorited this item is left with a
        // dangling favorites row - see FavoriteService's "פריט זה חסר"
        // handling for what that looked like unfixed.
        favoriteService.deleteFavoritesByItemId(id);
        return result;
    }
}
