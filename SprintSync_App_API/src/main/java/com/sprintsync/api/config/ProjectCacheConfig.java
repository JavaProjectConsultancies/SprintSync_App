package com.sprintsync.api.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;

/**
 * Cache configuration for SprintSync API.
 * Configures the default cache manager from application properties and
 * provides a short-lived cache manager for frequently requested dashboards.
 */
@Configuration
@EnableCaching
@SuppressWarnings("null")
public class ProjectCacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager(
            @Value("${spring.cache.caffeine.spec:maximumSize=1000,expireAfterWrite=30m}") String caffeineSpec) {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.from(caffeineSpec));
        return cacheManager;
    }

    @Bean(name = "shortLivedCacheManager")
    public CacheManager shortLivedCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                "dashboardStats",
                "dashboardRecent",
                "dashboardTaskDistribution",
                "dashboardPriorityDistribution",
                "dashboardTeamAllocation",
                "dashboardOverdue",
                "dashboardUpcomingDeadlines",
                "userDashboardStats",
                "searchOverdue",
                "reportsOverdue",
                "dateRangeStats");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(Duration.ofMinutes(1)));
        return cacheManager;
    }
}





