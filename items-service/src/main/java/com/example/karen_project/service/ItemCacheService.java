package com.example.karen_project.service;

import com.example.karen_project.model.Items;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// Product catalog cache - see ItemService for where this is wired in
// (getItemsByCategory/getItemById on read, evictCategory/evictById on
// every write). Every method here is wrapped in try/catch: a Redis
// failure must never break a request, only make it fall through to
// Postgres - see the application.yaml comment on management.health.redis
// for why the health indicator is disabled to match this same philosophy
// (mirrors MailService/WhatsAppNotificationService in the security
// module - "external service failure never blocks the primary request").
@Service
public class ItemCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${product-cache.ttl-hours}")
    private long ttlHours;

    private static final String CATEGORY_PREFIX = "items:category:";
    private static final String BY_ID_PREFIX = "items:byid:";

    @SuppressWarnings("unchecked")
    public List<Items> getCategoryPage(String category, int page, int size) {
        try {
            Object cached = redisTemplate.opsForValue().get(categoryKey(category, page, size));
            return (List<Items>) cached;
        } catch (Exception e) {
            return null;
        }
    }

    public void putCategoryPage(String category, int page, int size, List<Items> items) {
        if (items == null) {
            // Don't cache a transient DB error as if it were a legitimate
            // empty category - ItemRepository returns null on a query
            // exception, distinct from a genuine empty List (which IS
            // still worth caching - a valid negative result).
            return;
        }
        try {
            redisTemplate.opsForValue().set(categoryKey(category, page, size), items, Duration.ofHours(ttlHours));
        } catch (Exception e) {
        }
    }

    public Items getById(int id) {
        try {
            return (Items) redisTemplate.opsForValue().get(byIdKey(id));
        } catch (Exception e) {
            return null;
        }
    }

    public void putById(int id, Items item) {
        if (item == null) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(byIdKey(id), item, Duration.ofHours(ttlHours));
        } catch (Exception e) {
        }
    }

    // Wipes every page/size variant cached for this category (a single
    // create/delete can shift what any page contains, not just page 1) -
    // category names are admin-controlled, no glob-special-character risk
    // worth guarding against here.
    public void evictCategory(String category) {
        try {
            Set<String> keys = new HashSet<>();
            ScanOptions options = ScanOptions.scanOptions().match(CATEGORY_PREFIX + category + ":*").count(100).build();
            try (Cursor<String> cursor = redisTemplate.scan(options)) {
                while (cursor.hasNext()) {
                    keys.add(cursor.next());
                }
            }
            if (!keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
        }
    }

    public void evictById(int id) {
        try {
            redisTemplate.delete(byIdKey(id));
        } catch (Exception e) {
        }
    }

    private String categoryKey(String category, int page, int size) {
        return CATEGORY_PREFIX + category + ":" + page + ":" + size;
    }

    private String byIdKey(int id) {
        return BY_ID_PREFIX + id;
    }
}
