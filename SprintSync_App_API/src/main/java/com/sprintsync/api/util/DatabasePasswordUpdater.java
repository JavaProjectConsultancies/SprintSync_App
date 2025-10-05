//package com.sprintsync.api.util;
//
//import com.sprintsync.api.entity.User;
//import com.sprintsync.api.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.context.annotation.ComponentScan;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//
//import java.util.List;
//
///**
// * Utility to directly update user passwords in the database with real BCrypt hashes.
// * This will update all users with placeholder passwords to use real BCrypt hashes.
// * 
// * @author Mayuresh G
// */
//@SpringBootApplication
//@ComponentScan(basePackages = "com.sprintsync.api")
//public class DatabasePasswordUpdater implements CommandLineRunner {
//
//    @Autowiredpackage com.sprintsync.api.util;
//
//import com.sprintsync.api.entity.User;
//import com.sprintsync.api.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.context.annotation.ComponentScan;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//
//import java.util.List;
//
///**
// * Utility to directly update user passwords in the database with real BCrypt hashes.
// * This will update all users with placeholder passwords to use real BCrypt hashes.
// * 
// * @author Mayuresh G
// */
//@SpringBootApplication
//@ComponentScan(basePackages = "com.sprintsync.api")
//public class DatabasePasswordUpdater implements CommandLineRunner {
//
//    @Autowired
//    private UserRepository userRepository;
//    
//    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
//
//    public static void main(String[] args) {
//        SpringApplication.run(DatabasePasswordUpdater.class, args);
//    }
//
//    @Override
//    public void run(String... args) throws Exception {
//        System.out.println("=== SPRINTSYNC DATABASE PASSWORD UPDATER ===");
//        System.out.println();
//
//        try {
//            // Get all users
//            List<User> users = userRepository.findAll();
//            
//            System.out.println("Found " + users.size() + " users in database");
//            System.out.println();
//            
//            // Define passwords for different roles
//            String adminPassword = "admin123";
//            String managerPassword = "manager123";
//            String developerPassword = "dev123";
//            String designerPassword = "design123";
//            String testerPassword = "test123";
//            String analystPassword = "analyst123";
//            
//            int updatedCount = 0;
//            
//            System.out.println("=== UPDATING USER PASSWORDS ===");
//            System.out.println();
//            
//            for (User user : users) {
//                // Check if user has placeholder password
//                if (user.getPasswordHash().contains("example_hash")) {
//                    String newPassword = getPasswordForRole(user.getRole().toString());
//                    String newPasswordHash = passwordEncoder.encode(newPassword);
//                    
//                    user.setPasswordHash(newPasswordHash);
//                    userRepository.save(user);
//                    
//                    System.out.println("✅ Updated: " + user.getEmail() + " (" + user.getRole() + ")");
//                    System.out.println("   Password: " + newPassword);
//                    updatedCount++;
//                } else {
//                    System.out.println("⏭️  Skipped: " + user.getEmail() + " (already has valid password)");
//                }
//            }
//            
//            System.out.println();
//            System.out.println("=== UPDATE SUMMARY ===");
//            System.out.println("Total users: " + users.size());
//            System.out.println("Updated users: " + updatedCount);
//            System.out.println("Skipped users: " + (users.size() - updatedCount));
//            
//            if (updatedCount > 0) {
//                System.out.println();
//                System.out.println("=== LOGIN CREDENTIALS ===");
//                System.out.println();
//                
//                // Show login credentials for updated users
//                List<User> updatedUsers = userRepository.findAll().stream()
//                    .filter(user -> !user.getPasswordHash().contains("example_hash"))
//                    .toList();
//                
//                for (User user : updatedUsers) {
//                    if (user.getIsActive()) {
//                        String password = getPasswordForRole(user.getRole().toString());
//                        System.out.println("Email: " + user.getEmail());
//                        System.out.println("Password: " + password);
//                        System.out.println("Role: " + user.getRole());
//                        System.out.println("Name: " + user.getName());
//                        System.out.println("---");
//                    }
//                }
//                
//                System.out.println();
//                System.out.println("🎉 Password update completed successfully!");
//                System.out.println("You can now login with the credentials shown above.");
//            } else {
//                System.out.println("ℹ️  No users needed password updates.");
//            }
//            
//        } catch (Exception e) {
//            System.err.println("❌ Error updating database: " + e.getMessage());
//            e.printStackTrace();
//            System.err.println();
//            System.err.println("Make sure your PostgreSQL database is running and accessible.");
//            System.err.println("Database URL: jdbc:postgresql://localhost:5432/sprintsync");
//        }
//        
//        System.exit(0);
//    }
//    
//    private String getPasswordForRole(String role) {
//        switch (role.toLowerCase()) {
//            case "admin":
//                return "admin123";
//            case "manager":
//                return "manager123";
//            case "developer":
//                return "dev123";
//            case "designer":
//                return "design123";
//            case "tester":
//                return "test123";
//            case "analyst":
//                return "analyst123";
//            default:
//                return "password123";
//        }
//    }
//}
//
//    private UserRepository userRepository;
//    
//    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
//
//    public static void main(String[] args) {
//        SpringApplication.run(DatabasePasswordUpdater.class, args);
//    }
//
//    @Override
//    public void run(String... args) throws Exception {
//        System.out.println("=== SPRINTSYNC DATABASE PASSWORD UPDATER ===");
//        System.out.println();
//
//        try {
//            // Get all users
//            List<User> users = userRepository.findAll();
//            
//            System.out.println("Found " + users.size() + " users in database");
//            System.out.println();
//            
//            // Define passwords for different roles
//            String adminPassword = "admin123";
//            String managerPassword = "manager123";
//            String developerPassword = "dev123";
//            String designerPassword = "design123";
//            String testerPassword = "test123";
//            String analystPassword = "analyst123";
//            
//            int updatedCount = 0;
//            
//            System.out.println("=== UPDATING USER PASSWORDS ===");
//            System.out.println();
//            
//            for (User user : users) {
//                // Check if user has placeholder password
//                if (user.getPasswordHash().contains("example_hash")) {
//                    String newPassword = getPasswordForRole(user.getRole().toString());
//                    String newPasswordHash = passwordEncoder.encode(newPassword);
//                    
//                    user.setPasswordHash(newPasswordHash);
//                    userRepository.save(user);
//                    
//                    System.out.println("✅ Updated: " + user.getEmail() + " (" + user.getRole() + ")");
//                    System.out.println("   Password: " + newPassword);
//                    updatedCount++;
//                } else {
//                    System.out.println("⏭️  Skipped: " + user.getEmail() + " (already has valid password)");
//                }
//            }
//            
//            System.out.println();
//            System.out.println("=== UPDATE SUMMARY ===");
//            System.out.println("Total users: " + users.size());
//            System.out.println("Updated users: " + updatedCount);
//            System.out.println("Skipped users: " + (users.size() - updatedCount));
//            
//            if (updatedCount > 0) {
//                System.out.println();
//                System.out.println("=== LOGIN CREDENTIALS ===");
//                System.out.println();
//                
//                // Show login credentials for updated users
//                List<User> updatedUsers = userRepository.findAll().stream()
//                    .filter(user -> !user.getPasswordHash().contains("example_hash"))
//                    .toList();
//                
//                for (User user : updatedUsers) {
//                    if (user.getIsActive()) {
//                        String password = getPasswordForRole(user.getRole().toString());
//                        System.out.println("Email: " + user.getEmail());
//                        System.out.println("Password: " + password);
//                        System.out.println("Role: " + user.getRole());
//                        System.out.println("Name: " + user.getName());
//                        System.out.println("---");
//                    }
//                }
//                
//                System.out.println();
//                System.out.println("🎉 Password update completed successfully!");
//                System.out.println("You can now login with the credentials shown above.");
//            } else {
//                System.out.println("ℹ️  No users needed password updates.");
//            }
//            
//        } catch (Exception e) {
//            System.err.println("❌ Error updating database: " + e.getMessage());
//            e.printStackTrace();
//            System.err.println();
//            System.err.println("Make sure your PostgreSQL database is running and accessible.");
//            System.err.println("Database URL: jdbc:postgresql://localhost:5432/sprintsync");
//        }
//        
//        System.exit(0);
//    }
//    
//    private String getPasswordForRole(String role) {
//        switch (role.toLowerCase()) {
//            case "admin":
//                return "admin123";
//            case "manager":
//                return "manager123";
//            case "developer":
//                return "dev123";
//            case "designer":
//                return "design123";
//            case "tester":
//                return "test123";
//            case "analyst":
//                return "analyst123";
//            default:
//                return "password123";
//        }
//    }
//}
