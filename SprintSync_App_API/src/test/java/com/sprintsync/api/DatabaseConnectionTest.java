package com.sprintsync.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Simple test to check if the application can start and connect to the database
 * 
 * @author Mayuresh G
 */
@SpringBootTest
@ActiveProfiles("test")
public class DatabaseConnectionTest {

    @Test
    public void contextLoads() {
        // This test will pass if the application context loads successfully
        // If it fails, we'll see the specific error with entityManagerFactory
    }
}
