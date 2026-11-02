package com.example.security.clientApi;

import com.example.security.model.Item;
import com.example.security.model.StockLine;
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
    @Override
    public List<String> takeStock(String authorization, List<StockLine> lines) {
        // null, not an empty list: "could not check" must never read as "taken".
        return null;
    }
    @Override
    public void restoreStock(String authorization, List<StockLine> lines) {
        System.err.println("Could not give stock back to items-service: " + lines);
    }

}
