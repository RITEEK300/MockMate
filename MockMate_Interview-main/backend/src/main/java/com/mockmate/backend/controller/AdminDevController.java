package com.mockmate.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mockmate.backend.service.DbResetService;

@RestController
@RequestMapping("/api/admin/dev")
public class AdminDevController {

    private static final Logger log = LoggerFactory.getLogger(AdminDevController.class);

    @Value("${app.dev-reset-enabled:false}")
    private boolean devResetEnabled;

    private final DbResetService dbResetService;

    public AdminDevController(DbResetService dbResetService) {
        this.dbResetService = dbResetService;
    }

    @PostMapping("/reset-db")
    public ResponseEntity<?> resetDb() {
        if (!devResetEnabled) {
            log.warn("DB reset attempt when DEV_RESET_ENABLED=false");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("DB reset disabled"));
        }

        try {
            log.info("Starting database reset...");
            dbResetService.resetAllCollections();
            log.info("Database reset completed successfully");
            return ResponseEntity.ok(new SuccessResponse("Database reset completed"));
        } catch (Exception ex) {
            log.error("Database reset failed", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Database reset failed: " + ex.getMessage()));
        }
    }

    record SuccessResponse(String message) {
    }

    record ErrorResponse(String message) {
    }
}
