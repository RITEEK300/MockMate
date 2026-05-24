package com.mockmate.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.client.MongoClient;

import jakarta.annotation.PostConstruct;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);

    @Value("${spring.data.mongodb.uri:mongodb://localhost:27017/mockmate}")
    private String mongoUri;

    @Value("${spring.data.mongodb.database:mockmate}")
    private String database;

    private final MongoTemplate mongoTemplate;
    private final MongoClient mongoClient;

    public MongoConfig(MongoTemplate mongoTemplate, MongoClient mongoClient) {
        this.mongoTemplate = mongoTemplate;
        this.mongoClient = mongoClient;
    }

    @PostConstruct
    public void logMongoConfiguration() {
        try {
            // Log sanitized connection info (no password)
            String sanitizedUri = mongoUri.replaceAll("://.*:.*@", "://***:***@");
            log.info("MongoDB URI (sanitized): {}", sanitizedUri);
            log.info("MongoDB Database: {}", database);

            // Get actual database name from MongoTemplate
            String actualDb = mongoTemplate.getDb().getName();
            log.info("MongoDB Connected Database: {}", actualDb);

            // List available databases
            log.debug("Testing MongoDB connection...");
            mongoTemplate.executeCommand("{ ping: 1 }");
            log.info("MongoDB connection verified successfully");

        } catch (Exception ex) {
            log.error("MongoDB configuration/connection error: {}", ex.getMessage(), ex);
        }
    }
}
