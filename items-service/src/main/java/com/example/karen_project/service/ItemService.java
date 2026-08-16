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
       if (itemRepository.getItemByName(item.getName()) == null )
       {
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
//        if (itemRepository.getItemByName(name) == null) {
//            return "The chocolate is not exists";
//        }
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
        System.out.println(itemRepository.getItemById(item.getId()) + "item update from service" );
        if (itemRepository.getItemById(item.getId()) == null) {
            return "The item is not exists";
        }
        return itemRepository.updateItem(item);
    }
}
