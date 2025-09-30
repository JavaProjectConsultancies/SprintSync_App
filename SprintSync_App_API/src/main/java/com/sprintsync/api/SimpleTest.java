package com.sprintsync.api;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Simple test to check database connection and identify issues
 * 
 * @author Mayuresh G
 */
public class SimpleTest {
    
    public static void main(String[] args) {
        System.out.println("=== SprintSync API Diagnostic Test ===");
        
        // Test 1: Java Version
        System.out.println("\n1. Java Version:");
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("Java Home: " + System.getProperty("java.home"));
        
        // Test 2: Database Connection
        System.out.println("\n2. Database Connection Test:");
        testDatabaseConnection();
        
        // Test 3: Class Loading
        System.out.println("\n3. Class Loading Test:");
        testClassLoading();
        
        System.out.println("\n=== Test Complete ===");
    }
    
    private static void testDatabaseConnection() {
        String url = "jdbc:postgresql://localhost:5432/sprintsync";
        String username = "postgres";
        String password = "pass121word";
        
        try {
            System.out.println("Testing database connection...");
            Connection connection = DriverManager.getConnection(url, username, password);
            System.out.println("✅ Database connection successful!");
            connection.close();
        } catch (SQLException e) {
            System.err.println("❌ Database connection failed:");
            e.printStackTrace();
        }
    }
    
    private static void testClassLoading() {
        try {
            Class.forName("org.springframework.boot.SpringApplication");
            System.out.println("✅ Spring Boot classes found");
        } catch (ClassNotFoundException e) {
            System.err.println("❌ Spring Boot classes not found in classpath");
            System.err.println("This is expected if running without Maven dependencies");
        }
        
        try {
            Class.forName("com.sprintsync.api.entity.User");
            System.out.println("✅ User entity class found");
        } catch (ClassNotFoundException e) {
            System.err.println("❌ User entity class not found");
        }
    }
}
