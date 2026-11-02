package com.example.karen_project.service;



import com.example.karen_project.model.Items;
import com.example.karen_project.model.StockLine;
import com.example.karen_project.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ItemService {

    @Autowired
    public ItemRepository itemRepository;
    @Autowired
    private ItemCacheService itemCacheService;
    @Autowired
    private TransactionTemplate transactionTemplate;

    private static final String INVALID_STOCK_MESSAGE = "המלאי חייב להיות מספר שלם, 0 או יותר";

    // Stock is optional (null = not tracked), but a number must not be negative.
    private static boolean hasValidStock(Items item) {
        return item.getStock() == null || item.getStock() >= 0;
    }

    // Called only by the orders service (see SecurityConfig: STOCK_SERVICE),
    // when a customer sends an order. All or nothing: if any line is short
    // nothing is taken, and the names of the items that are short come back
    // (an empty list = everything was taken).
    public List<String> takeStock(List<StockLine> lines) {
        List<String> shortItems = transactionTemplate.execute(status -> {
            List<String> missing = new ArrayList<>();
            for (StockLine line : lines) {
                if (line.quantity() < 1) {
                    continue;
                }
                Items item = itemRepository.getItemById(line.id());
                if (item == null) {
                    missing.add("#" + line.id());
                } else if (!itemRepository.takeStock(line.id(), line.quantity())) {
                    missing.add(item.getName());
                }
            }
            if (!missing.isEmpty()) {
                status.setRollbackOnly();
            }
            return missing;
        });
        // After the commit, not inside it - evicting first would let a read in
        // between put the old stock back into the cache for hours.
        evictStockCaches(lines);
        return shortItems;
    }

    public void restoreStock(List<StockLine> lines) {
        transactionTemplate.executeWithoutResult(status -> {
            for (StockLine line : lines) {
                if (line.quantity() > 0) {
                    itemRepository.restoreStock(line.id(), line.quantity());
                }
            }
        });
        evictStockCaches(lines);
    }

    private void evictStockCaches(List<StockLine> lines) {
        for (StockLine line : lines) {
            Items item = itemRepository.getItemById(line.id());
            if (item != null) {
                itemCacheService.evictCategory(item.getCategory());
            }
            itemCacheService.evictById(line.id());
        }
    }


    // Chocolates (pralines) are never sold on their own - they only matter
    // inside a box, and the box carries the price - so the person adding one
    // does not have to enter a price, and 0 is allowed for them.
    private static boolean hasValidPrice(Items item) {
        if (item.getPrice() == null) {
            return false;
        }
        return "chocolate".equals(item.getCategory())
                ? item.getPrice().signum() >= 0
                : item.getPrice().signum() > 0;
    }

    public String createItem(Items item){
        // The single-item create/update paths (this method and updateItem
        // below) didn't validate this, so a negative/zero price could reach
        // the public catalog and order-total math through this route even
        // though the admin frontend form also checks it (a direct API call
        // skips that).
        if (!hasValidPrice(item)) {
            return "המחיר חייב להיות גדול מ-0";
        }
        if (!hasValidStock(item)) {
            return INVALID_STOCK_MESSAGE;
        }
        // Was inverted: getItemByName never actually returns null in the
        // normal case (it returns an empty List when nothing matches, only
        // null on a genuine query exception) - so this condition was true
        // for every brand-new product name, and createItem was never
        // reached at all; an item with an already-taken name fell through
        // to the insert instead of being blocked. Both directions backwards.
        List<Items> existing = itemRepository.getItemByName(item.getName());
        if (existing != null && !existing.isEmpty()) {
            return "מוצר בשם הזה כבר קיים במערכת";
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
    // See ItemRepository.searchItemsFullText for why this is a separate
    // method from getItemByName above rather than that one's implementation
    // being swapped out.
    public List<Items> searchItems(String query){
        return itemRepository.searchItemsFullText(query);
    }
    public String deleteItem(String name){
        // getItemByName returns an empty List (not null) when nothing
        // matches - same gotcha noted in createItem() above. Without this
        // check, deleting a name that doesn't exist still ran a no-op
        // DELETE and reported success either way.
        List<Items> existing = itemRepository.getItemByName(name);
        if (existing == null || existing.isEmpty()) {
            return "המוצר לא קיים במערכת";
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
            return "המוצר לא קיים במערכת";
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
        if (!hasValidPrice(item)) {
            return "המחיר חייב להיות גדול מ-0";
        }
        if (!hasValidStock(item)) {
            return INVALID_STOCK_MESSAGE;
        }
        // Deliberately itemRepository.getItemById, not this class's own
        // getItemById - that method is cache-wrapped, and routing this
        // existence/pre-update-state check through it would risk reading a
        // stale cached copy right at the one place meant to establish
        // ground truth (the item's category before the update, used below
        // for eviction).
        Items existing = itemRepository.getItemById(item.getId());
        if (existing == null) {
            return "המוצר לא קיים במערכת";
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
