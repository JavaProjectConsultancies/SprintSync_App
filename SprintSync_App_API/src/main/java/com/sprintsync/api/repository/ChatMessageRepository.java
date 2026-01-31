package com.sprintsync.api.repository;

import com.sprintsync.api.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ChatMessage entity.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    /**
     * Find messages for a specific entity ordered by creation time.
     */
    List<ChatMessage> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(String entityType, String entityId);
}
