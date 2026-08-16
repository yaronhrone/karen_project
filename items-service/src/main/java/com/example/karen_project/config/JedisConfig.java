package com.example.karen_project.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.JedisPooled;

@Configuration
public class JedisConfig {
    @Autowired(required = false)
    private RedisConfig redisConfig;

    @Bean
    @ConditionalOnBean(RedisConfig.class)
    @ConditionalOnProperty(name = "spring.redis.is-redis-server-active")
    public JedisPooled initiateJedis(){
        if(redisConfig != null){
            return new JedisPooled(redisConfig.getHost(), redisConfig.getPort());
        }
        return null;
    }
}
