package com.example.security.service;

import com.cloudinary.utils.ObjectUtils;
import com.example.security.clientApi.ItemsClient;
import com.example.security.model.CloudinaryConfig;
import com.example.security.model.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ItemService {

    @Autowired
    private ItemsClient itemClient;
    @Autowired
    private CloudinaryConfig cloudinaryConfig;



    public Item getItem(String name) {
        System.out.println(name + "name item from service");
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
        System.out.println(item + "item from service back from microservice");
        // Pass items-service's own result straight through - it was
        // previously always prefixed with "Chocolate created ", which made
        // AdminController's `result.contains("created")` success check
        // always true even when itemClient.createItem() actually failed
        // (e.g. the ItemsClientFallback string "Fallback cold not create"),
        // silently masking every failed creation as a success.
        return itemClient.createItem(item);
    }
    public String deleteItemByName(String name) throws IOException {

      Item existing = itemClient.getItem(name);
        if (existing != null) {
            Map deleteResult = cloudinaryConfig.getCloudinary()
                    .uploader()
                    .destroy(existing.getImage(), ObjectUtils.emptyMap());
            System.out.println(deleteResult + " delete result name");

            return itemClient.deleteItem(name);
    } return "Item not found";
    }
    public String updateItem(Item item) {
        System.out.println(itemClient.getItemById(item.getId()) + "item from service back from microservice");

        return itemClient.updateItem(item);

    }
    public List<Item> getAllItem(int page, int size) {return itemClient.getAllItem(page,size); }
    public String deleteItemById(int id) throws IOException {
        Item existing = itemClient.getItemById(id);
        if (existing != null) {
            if (existing.getDeleteImgId() != null) {

            Map deleteResult = cloudinaryConfig.getCloudinary()
                    .uploader()
                    .destroy(existing.getDeleteImgId(), ObjectUtils.emptyMap());
            System.out.println(deleteResult + " delete result id");
            }

        }
            return itemClient.deleteItemById(id);
    }
}
