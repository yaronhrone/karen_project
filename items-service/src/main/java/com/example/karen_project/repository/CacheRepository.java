package com.example.karen_project.repository;


import com.example.karen_project.config.RedisConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.JedisPooled;

@Repository
public class CacheRepository {
    @Autowired(required = false)
    private RedisConfig redisConfig;
    @Autowired(required = false)
    private JedisPooled jedisPooled;

    public void setWithExpiry(String key, String value){
        if(redisConfig != null && jedisPooled != null){
            jedisPooled.setex(key, redisConfig.getTtl(), value);
        } else {
            System.out.println("Redis is not available");
        }
    }

    public String get(String key){
        if(jedisPooled != null){
            return jedisPooled.get(key);
        }
        return null;
    }

    public boolean exists(String key){
        if(jedisPooled != null){
            return jedisPooled.exists(key);
        }
        return false;
    }

    public void delete(String key){
        if(jedisPooled != null){
            jedisPooled.del(key);
        } else {
            System.out.println("Redis is not available");
        }
    }
}



