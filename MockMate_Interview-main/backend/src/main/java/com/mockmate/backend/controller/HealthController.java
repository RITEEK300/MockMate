package com.mockmate.backend.controller;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final MongoTemplate mongoTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    public HealthController(MongoTemplate mongoTemplate, RedisTemplate<String, Object> redisTemplate) {
        this.mongoTemplate = mongoTemplate;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running");
    }

    @GetMapping("/db")
    public ResponseEntity<HealthResponse> healthDb() {
        HealthResponse response = new HealthResponse();

        // Check MongoDB
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            response.mongo = "UP";
        } catch (Exception ex) {
            response.mongo = "DOWN";
            response.mongoError = ex.getMessage();
        }

        // Check Redis
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            response.redis = "UP";
        } catch (Exception ex) {
            response.redis = "DOWN";
            response.redisError = ex.getMessage();
        }

        // Overall status
        boolean allUp = "UP".equals(response.mongo) && "UP".equals(response.redis);
        HttpStatus status = allUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

        return new ResponseEntity<>(response, status);
    }

    public static class HealthResponse {
        public String mongo;
        public String redis;
        public String mongoError;
        public String redisError;
    }
}
