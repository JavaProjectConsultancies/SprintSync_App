package com.sprintsync.api.service;

import com.sprintsync.api.entity.ChatMessage;
import com.sprintsync.api.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for Chat Message operations.
 */
@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    /**
     * Get all messages for a specific entity.
     */
    public List<ChatMessage> getMessagesForEntity(String entityType, String entityId) {
        return chatMessageRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(entityType, entityId);
    }

    /**
     * Save a new chat message.
     */
    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }
}
