package com.sprintsync.api.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Cache configuration for SprintSync API.
 * Uses Caffeine for in-memory caching to improve performance.
 * 
 * Cache configuration is done via application.properties:
 * - spring.cache.type=caffeine
 * - spring.cache.cache-names=projects,projects-summary,users,departments,domains,epics,releases,stories,tasks
 * - spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=30m
 * 
 * @author SprintSync Team
 */
@Configuration
@EnableCaching
public class ProjectCacheConfig {
    // Cache configuration is done via application.properties
    // Spring Boot 3.x auto-configures Caffeine cache manager
}

