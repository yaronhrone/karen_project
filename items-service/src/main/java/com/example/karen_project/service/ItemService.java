package com.example.karen_project.service;



import com.example.karen_project.model.Items;
import com.example.karen_project.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;
import java.util.Map;

@Service
public class ItemService {

    @Autowired
    public ItemRepository itemRepository;


    public String createItem(Items item){
        // ItemImportService's CSV path already validates price > 0 - the
        // single-item create/update paths (this method and updateItem below)
        // didn't, so a negative/zero price could reach the public catalog
        // and order-total math through this route even though the admin
        // frontend form also checks it (a direct API call skips that).
        if (item.getPrice() == null || item.getPrice().signum() <= 0) {
            return "Price must be greater than 0";
        }
        // Was inverted: getItemByName never actually returns null in the
        // normal case (it returns an empty List when nothing matches, only
        // null on a genuine query exception) - so this condition was true
        // for every brand-new product name, and createItem was never
        // reached at all; an item with an already-taken name fell through
        // to the insert instead of being blocked. Both directions backwards.
        List<Items> existing = itemRepository.getItemByName(item.getName());
        if (existing != null && !existing.isEmpty()) {
            return "The item is exists";
        }

        return itemRepository.createItem(item);
    }
    public List<Items> getAll(int page,int size){
      return   itemRepository.getAll(page,size);
    }
    public List<Items> getItemsByCategory(String category , int page,int size){
        return itemRepository.getItemsByCategory(category, page,size);
    }
    public List<Items> getItemsByCategoryAndName(String category,String name){
        return itemRepository.getItemsByCategoryAndName(category,name);
    }

    public List<Items> getItemByName(String name){

     return itemRepository.getItemByName(name.toLowerCase());

    }
    public String deleteItem(String name){
        // getItemByName returns an empty List (not null) when nothing
        // matches - same gotcha noted in createItem() above. Without this
        // check, deleting a name that doesn't exist still ran a no-op
        // DELETE and reported success either way.
        List<Items> existing = itemRepository.getItemByName(name);
        if (existing == null || existing.isEmpty()) {
            return "The item is not exists";
        }
        return itemRepository.deleteItem(name);
    }
    public String deleteItemById(int id){
        if (itemRepository.getItemById(id) == null) {
            return "The item is not exists";
        }
        return itemRepository.deleteItemById(id);
    }

    public Items getItemById(int id){

        return itemRepository.getItemById(id);
    }
    public String updateItem(Items item){
        if (item.getPrice() == null || item.getPrice().signum() <= 0) {
            return "Price must be greater than 0";
        }
        if (itemRepository.getItemById(item.getId()) == null) {
            return "The item is not exists";
        }
        return itemRepository.updateItem(item);
    }
}
