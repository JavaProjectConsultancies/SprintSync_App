package com.sprintsync.api.repository;

import com.sprintsync.api.entity.LoginActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for LoginActivityLog entity.
 */
@Repository
public interface LoginActivityLogRepository extends JpaRepository<LoginActivityLog, String> {
    
    /**
     * Finds all login activity logs sorted by login time descending.
     * @return List of LoginActivityLog
     */
    List<LoginActivityLog> findAllByOrderByLoginTimeDesc();

    /**
     * Finds login activity logs within a date range, sorted by login time descending.
     * @param start start of the range
     * @param end end of the range
     * @return List of LoginActivityLog
     */
    List<LoginActivityLog> findByLoginTimeBetweenOrderByLoginTimeDesc(LocalDateTime start, LocalDateTime end);
}
