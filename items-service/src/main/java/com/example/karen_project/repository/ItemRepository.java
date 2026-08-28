package com.example.karen_project.repository;


import com.example.karen_project.model.Items;
import com.example.karen_project.repository.mapper.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ItemRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final static String ITEMS_TABLE = "items";


    public String  createItem(Items item){
      String sql = String.format("INSERT INTO %s (name, description, IsVeg, image,price, category,delete_img_id) VALUES (?,?,?,?,?,?,?)",ITEMS_TABLE);
      jdbcTemplate.update(sql,item.getName(), item.getDescription(),item.getVeg(),item.getImage(),item.getPrice(),item.getCategory(),item.getDeleteImgId());

      return "The item is created!";
    }
    public List<Items> getItemByName(String name){
        try {

        String sql = String.format("SELECT *  FROM %s WHERE LOWER(name) LIKE LOWER(?)",ITEMS_TABLE);
    return  jdbcTemplate.query(sql, new ItemMapper(),"%"+name+"%");
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public Items getItemById(int id){
        try {
            String sql = String.format("SELECT *  FROM %s WHERE id = ?", ITEMS_TABLE);
            return     jdbcTemplate.queryForObject(sql, new ItemMapper(),id);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public String deleteItem(String name){
        String sql = String.format("DELETE FROM %s WHERE name = ?",ITEMS_TABLE);
        jdbcTemplate.update(sql,name);
        return "The item is deleted!";
    }

    public List<Items> getAll(int page,int size){
        page = clampPage(page);
        size = clampSize(size);
        int offset = (page - 1) * size;
        String sql = String.format("SELECT * FROM %s ORDER BY id DESC LIMIT ? OFFSET ?",ITEMS_TABLE);
        return jdbcTemplate.query(sql,new ItemMapper(),size,offset);
    }

    // page/size come straight from a public, unauthenticated @RequestParam
    // with no upper/lower bound - without this, an anonymous caller could
    // send a negative page (negative OFFSET, a raw SQL error surfaced to the
    // client) or a huge size (forcing a huge LIMIT) with nothing else in
    // front of these routes to stop them.
    private static int clampPage(int page) {
        return Math.max(page, 1);
    }
    private static int clampSize(int size) {
        return Math.max(1, Math.min(size, 100));
    }
    public String updateItem(Items item){
        String sql = String.format("UPDATE %s SET name = ?, description = ?, IsVeg = ?, image = ?, price = ?, category = ?, delete_img_id = ? WHERE id = ?",ITEMS_TABLE);
        jdbcTemplate.update(sql,item.getName(),item.getDescription(),item.getVeg(),item.getImage(),item.getPrice(),item.getCategory(),item.getDeleteImgId(),item.getId());
        return "The item is updated!";
    }
    public List<Items> getItemsByCategory(String category,int page,int size){
        try {
            page = clampPage(page);
            size = clampSize(size);
            int offset = (page - 1) * size;
            String sql = String.format("SELECT * FROM %s WHERE category = ? ORDER BY id DESC  LIMIT ? OFFSET ?",ITEMS_TABLE);
        return jdbcTemplate.query(sql,new ItemMapper(),category,size,offset);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public List<Items> getItemsByCategoryAndName(String category,String name){
        try {  String sql = String.format("SELECT * FROM %s WHERE category = ? AND name = ? ",ITEMS_TABLE);
        return jdbcTemplate.query(sql,new ItemMapper(),category,name);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }
    public String deleteItemById(int id){
        String sql = String.format("DELETE FROM %s WHERE id = ?",ITEMS_TABLE);
        jdbcTemplate.update(sql,id);
        return "The item is deleted";
    }
}