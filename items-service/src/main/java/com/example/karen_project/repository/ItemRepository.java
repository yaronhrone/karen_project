package com.example.karen_project.repository;


import com.example.karen_project.model.Items;
import com.example.karen_project.repository.mapper.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
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
            return null;
        }
    }
    public Items getItemById(int id){
        try {
            String sql = String.format("SELECT *  FROM %s WHERE id = ?", ITEMS_TABLE);
            return     jdbcTemplate.queryForObject(sql, new ItemMapper(),id);
        } catch (Exception e) {
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
            return null;
        }
    }
    // Powers the customer-facing search box (itemController's GET /{name}) -
    // deliberately a separate method from getItemByName above, which is a
    // substring LIKE used by createItem/deleteItem's "does this name already
    // exist" checks and needs to keep behaving exactly as it does today.
    // Repurposing that shared method for full-text matching would have
    // silently changed those duplicate-detection checks too (e.g. creating
    // "שוקולד" could then flag as a duplicate against any existing item
    // whose name/description merely contains that word).
    public List<Items> searchItemsFullText(String rawQuery){
        String tsQuery = buildTsQuery(rawQuery);
        if (tsQuery == null) {
            return new ArrayList<>();
        }
        try {
            String sql = String.format(
                "SELECT * FROM %s WHERE search_vector @@ to_tsquery('simple', ?) " +
                "ORDER BY ts_rank(search_vector, to_tsquery('simple', ?)) DESC",
                ITEMS_TABLE
            );
            return jdbcTemplate.query(sql, new ItemMapper(), tsQuery, tsQuery);
        } catch (Exception e) {
            return null;
        }
    }

    // Turns free-typed input like "שוקו כה" into a tsquery string like
    // "שוקו:* & כה:*" - each word becomes its own prefix-match term, ANDed
    // together so a multi-word search matches a product containing all of
    // them regardless of order or which field (name vs description) each
    // word actually landed in. Returns null for blank/whitespace-only input
    // rather than ever building an empty or invalid tsquery string, which
    // Postgres would reject with a syntax error.
    private String buildTsQuery(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return null;
        }
        StringBuilder tsQuery = new StringBuilder();
        for (String word : rawQuery.trim().split("\\s+")) {
            // Strips tsquery's own operator characters (&, |, :, ( ) etc.)
            // along with anything else that isn't a letter or digit - \p{L}
            // covers Hebrew (and any other script) the same as Latin, so a
            // user typing one of those operators never reaches to_tsquery()
            // as literal syntax.
            String cleaned = word.replaceAll("[^\\p{L}\\p{N}]", "");
            if (cleaned.isEmpty()) {
                continue;
            }
            if (tsQuery.length() > 0) {
                tsQuery.append(" & ");
            }
            tsQuery.append(cleaned).append(":*");
        }
        return tsQuery.length() == 0 ? null : tsQuery.toString();
    }

    public List<Items> getItemsByCategoryAndName(String category,String name){
        try {  String sql = String.format("SELECT * FROM %s WHERE category = ? AND name = ? ",ITEMS_TABLE);
        return jdbcTemplate.query(sql,new ItemMapper(),category,name);
        } catch (Exception e) {
            return null;
        }
    }
    public String deleteItemById(int id){
        String sql = String.format("DELETE FROM %s WHERE id = ?",ITEMS_TABLE);
        jdbcTemplate.update(sql,id);
        return "The item is deleted";
    }
}