package com.sprintsync.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Test application to diagnose entityManagerFactory issues
 * 
 * @author Mayuresh G
 */
@SpringBootApplication
@EntityScan("com.sprintsync.api.entity")
@EnableJpaRepositories("com.sprintsync.api.repository")
public class TestApplication {

    public static void main(String[] args) {
        try {
            System.out.println("Starting SprintSync Test Application...");
            SpringApplication.run(TestApplication.class, args);
            System.out.println("✅ Application started successfully!");
        } catch (Exception e) {
            System.err.println("❌ Application failed to start:");
            e.printStackTrace();
        }
    }
}
