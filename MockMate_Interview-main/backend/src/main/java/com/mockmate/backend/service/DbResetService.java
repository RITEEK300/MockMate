package com.mockmate.backend.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class DbResetService {

    private static final Logger log = LoggerFactory.getLogger(DbResetService.class);

    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final Set<String> COLLECTIONS_TO_DROP = new HashSet<>(Arrays.asList(
            "users",
            "feedback",
            "rooms",
            "matches",
            "matchmaking",
            "chats",
            "messages"
    ));

    public DbResetService(MongoTemplate mongoTemplate, RedisTemplate<String, Object> redisTemplate) {
        this.mongoTemplate = mongoTemplate;
        this.redisTemplate = redisTemplate;
    }

    public void resetAllCollections() {
        log.info("Resetting MongoDB collections...");
        for (String collectionName : COLLECTIONS_TO_DROP) {
            try {
                if (mongoTemplate.collectionExists(collectionName)) {
                    mongoTemplate.dropCollection(collectionName);
                    log.info("Dropped MongoDB collection: {}", collectionName);
                }
            } catch (Exception ex) {
                log.error("Failed to drop collection {}: {}", collectionName, ex.getMessage());
            }
        }

        log.info("Clearing Redis matchmaking queues...");
        try {
            Set<String> keysToDelete = redisTemplate.keys("mockmate:queue:*");
            if (keysToDelete != null && !keysToDelete.isEmpty()) {
                redisTemplate.delete(keysToDelete);
                log.info("Cleared {} Redis queue keys", keysToDelete.size());
            }
        } catch (Exception ex) {
            log.error("Failed to clear Redis queues: {}", ex.getMessage());
        }

        log.info("Database reset completed");
    }
}
