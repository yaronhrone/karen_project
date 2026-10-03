package com.example.security.clientApi;

import com.example.security.model.Item;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ItemsClientFallback implements ItemsClient {
    @Override
    public Item getItem(String name) {
        return null;
    }
    @Override
    public String createItem(Item item) {
        // Shown to the admin as-is when the items service is unreachable.
        return "לא ניתן להוסיף את המוצר כרגע, נסו שוב בעוד רגע";
    }

    @Override
    public String deleteItem(String name) {
        return "";
    }

    @Override
    public String updateItem(Item item) {
        return "";
    }

    @Override
    public List<Item> getAllItem(int page , int size) {
        return List.of();
    }

    @Override
    public Item getItemById(int id) {
        return null;
    }
    @Override
    public String deleteItemById(int id) {
        return "";
    }

}
