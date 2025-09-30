package com.sprintsync.api;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Simple database connection test
 * 
 * @author Mayuresh G
 */
public class SimpleDatabaseTest {
    
    public static void main(String[] args) {
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
}
