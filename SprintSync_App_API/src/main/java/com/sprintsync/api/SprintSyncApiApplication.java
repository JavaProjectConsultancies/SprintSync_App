package com.sprintsync.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * SprintSync API Application
 * 
 * Main Spring Boot application class for the SprintSync project management API.
 * Provides REST endpoints for managing projects, epics, releases, stories, tasks, and more.
 * 
 * @author Mayuresh G
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class SprintSyncApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SprintSyncApiApplication.class, args);
    }
}
