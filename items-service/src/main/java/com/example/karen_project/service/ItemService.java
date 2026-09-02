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
    @Autowired
    private ItemCacheService itemCacheService;


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

        String result = itemRepository.createItem(item);
        // Only reached once the insert actually happened (both guard checks
        // above passed) - safe to evict unconditionally here.
        itemCacheService.evictCategory(item.getCategory());
        return result;
    }
    public List<Items> getAll(int page,int size){
      return   itemRepository.getAll(page,size);
    }
    public List<Items> getItemsByCategory(String category , int page,int size){
        List<Items> cached = itemCacheService.getCategoryPage(category, page, size);
        if (cached != null) {
            return cached;
        }
        List<Items> result = itemRepository.getItemsByCategory(category, page,size);
        itemCacheService.putCategoryPage(category, page, size, result);
        return result;
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
        String result = itemRepository.deleteItem(name);
        // getItemByName above is a case-insensitive SUBSTRING match
        // ("LIKE '%name%'"), but the actual DELETE is an exact match - so
        // `existing` can contain more rows than were really deleted (e.g.
        // deleting "Pizza" while "Margherita Pizza" also exists returns
        // both, but only one row is dropped). Evicting every item in
        // `existing`, not just the deleted one, is the safe/defensive
        // choice: over-eviction just costs an extra cache miss, but
        // under-eviction would let a genuinely-deleted item's stale cache
        // entry keep serving from Redis for up to 12h.
        for (Items possiblyDeleted : existing) {
            itemCacheService.evictCategory(possiblyDeleted.getCategory());
            itemCacheService.evictById(possiblyDeleted.getId());
        }
        return result;
    }
    public String deleteItemById(int id){
        Items existing = itemRepository.getItemById(id);
        if (existing == null) {
            return "The item is not exists";
        }
        String result = itemRepository.deleteItemById(id);
        itemCacheService.evictCategory(existing.getCategory());
        itemCacheService.evictById(id);
        return result;
    }

    public Items getItemById(int id){
        Items cached = itemCacheService.getById(id);
        if (cached != null) {
            return cached;
        }
        Items result = itemRepository.getItemById(id);
        itemCacheService.putById(id, result);
        return result;
    }
    public String updateItem(Items item){
        if (item.getPrice() == null || item.getPrice().signum() <= 0) {
            return "Price must be greater than 0";
        }
        // Deliberately itemRepository.getItemById, not this class's own
        // getItemById - that method is cache-wrapped, and routing this
        // existence/pre-update-state check through it would risk reading a
        // stale cached copy right at the one place meant to establish
        // ground truth (the item's category before the update, used below
        // for eviction).
        Items existing = itemRepository.getItemById(item.getId());
        if (existing == null) {
            return "The item is not exists";
        }
        String result = itemRepository.updateItem(item);
        // Evict both the old category (in case this update changed it) and
        // the new one - either could now hold stale cached pages.
        itemCacheService.evictCategory(existing.getCategory());
        if (!existing.getCategory().equals(item.getCategory())) {
            itemCacheService.evictCategory(item.getCategory());
        }
        itemCacheService.evictById(item.getId());
        return result;
    }
}
