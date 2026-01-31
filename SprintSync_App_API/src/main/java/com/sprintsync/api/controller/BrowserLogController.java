package com.sprintsync.api.controller;

import com.sprintsync.api.dto.BrowserLogRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class BrowserLogController {

    private static final Logger logger = LoggerFactory.getLogger("BROWSER");

    @PostMapping("/browser")
    public ResponseEntity<Void> receiveBrowserLogs(@RequestBody List<BrowserLogRequest> logs) {
        for (BrowserLogRequest log : logs) {
            String formattedMessage = String.format("[%s] %s", log.getLevel().toUpperCase(), log.getMessage());

            switch (log.getLevel().toLowerCase()) {
                case "error":
                    logger.error(formattedMessage);
                    break;
                case "warn":
                    logger.warn(formattedMessage);
                    break;
                case "info":
                    logger.info(formattedMessage);
                    break;
                default:
                    logger.info(formattedMessage);
            }
        }
        return ResponseEntity.ok().build();
    }
}
