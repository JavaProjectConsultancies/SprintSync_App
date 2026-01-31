package com.sprintsync.api.controller;

import com.sprintsync.api.entity.ChatMessage;
import com.sprintsync.api.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Chat Message operations.
 */
@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "*")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    /**
     * Get all chat messages for a specific entity.
     */
    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<ChatMessage>> getMessages(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            List<ChatMessage> messages = chatMessageService.getMessagesForEntity(entityType, entityId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Post a new chat message.
     */
    @PostMapping
    public ResponseEntity<ChatMessage> postMessage(@RequestBody ChatMessage message) {
        try {
            ChatMessage savedMessage = chatMessageService.saveMessage(message);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
