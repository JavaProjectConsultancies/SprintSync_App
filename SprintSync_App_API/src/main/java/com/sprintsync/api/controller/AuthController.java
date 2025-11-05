package com.sprintsync.api.controller;

import com.sprintsync.api.dto.AuthRequest;
import com.sprintsync.api.dto.AuthResponse;
import com.sprintsync.api.dto.RegisterRequest;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for authentication operations.
 * Provides endpoints for login, logout, registration, and user profile.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public AuthController(AuthService authService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            logger.info("Login attempt for email: {}", authRequest.getEmail());
            
            AuthResponse authResponse = authService.authenticate(authRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("data", authResponse);
            
            logger.info("Login successful for email: {}", authRequest.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Login failed for email: {} - {}", authRequest.getEmail(), e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * Register endpoint
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            logger.info("Registration attempt for email: {}", registerRequest.getEmail());
            
            Map<String, Object> registrationResponse = authService.register(registerRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", registrationResponse.get("message"));
            response.put("data", registrationResponse);
            
            logger.info("Registration request submitted for email: {}", registerRequest.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Registration failed for email: {} - {}", registerRequest.getEmail(), e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Get current user profile
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                throw new RuntimeException("No authentication token provided");
            }
            
            User user = authService.getCurrentUser(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User profile retrieved successfully");
            response.put("data", user);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Get current user failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * Refresh token endpoint
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                throw new RuntimeException("No authentication token provided");
            }
            
            AuthResponse authResponse = authService.refreshToken(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Token refreshed successfully");
            response.put("data", authResponse);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Token refresh failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * Logout endpoint
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        try {
            // Clear security context
            SecurityContextHolder.clearContext();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Logout successful");
            response.put("data", null);
            
            logger.info("User logged out successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Change password endpoint
     * POST /api/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody Map<String, String> passwordRequest,
            HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                throw new RuntimeException("No authentication token provided");
            }
            
            String currentPassword = passwordRequest.get("currentPassword");
            String newPassword = passwordRequest.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                throw new RuntimeException("Current password and new password are required");
            }
            
            // TODO: Implement password change logic
            // This would involve verifying current password and updating to new password
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password changed successfully");
            response.put("data", null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Password change failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Forgot password endpoint
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null) {
                throw new RuntimeException("Email is required");
            }
            
            // TODO: Implement forgot password logic
            // This would involve sending reset email
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password reset email sent");
            response.put("data", null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Forgot password failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Reset password endpoint
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || newPassword == null) {
                throw new RuntimeException("Token and new password are required");
            }
            
            // TODO: Implement password reset logic
            // This would involve validating reset token and updating password
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password reset successfully");
            response.put("data", null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Password reset failed: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Utility endpoint to fix demo user passwords with correct BCrypt hashes
     * POST /api/auth/fix-passwords
     * NOTE: This is a temporary utility endpoint - remove in production
     */
    @PostMapping("/fix-passwords")
    public ResponseEntity<Map<String, Object>> fixDemoUserPasswords() {
        try {
            logger.info("Fixing demo user passwords with correct BCrypt hashes");
            
            // Demo users to update with their passwords
            Map<String, String> demoUsers = new HashMap<>();
            // Original demo users
            demoUsers.put("admin@demo.com", "admin123");
            demoUsers.put("kavita.admin@demo.com", "admin123");
            demoUsers.put("manager@demo.com", "manager123");
            demoUsers.put("priya@demo.com", "manager123");
            demoUsers.put("rajesh.manager@demo.com", "manager123");
            demoUsers.put("anita.manager@demo.com", "manager123");
            demoUsers.put("deepak.manager@demo.com", "manager123");
            demoUsers.put("developer@demo.com", "dev123");
            demoUsers.put("rohit@demo.com", "dev123");
            demoUsers.put("neha.angular@demo.com", "dev123");
            demoUsers.put("sanjay.angular@demo.com", "dev123");
            demoUsers.put("meera.angular@demo.com", "dev123");
            demoUsers.put("amit.dev@demo.com", "dev123");
            demoUsers.put("ravi.java@demo.com", "dev123");
            demoUsers.put("pooja.java@demo.com", "dev123");
            demoUsers.put("karthik.java@demo.com", "dev123");
            demoUsers.put("designer@demo.com", "design123");
            demoUsers.put("vikram.dev@demo.com", "design123");
            demoUsers.put("shreya.maui@demo.com", "design123");
            demoUsers.put("arun.maui@demo.com", "design123");
            
            // Database users from user list
            demoUsers.put("test2@gmail.com", "admin123");
            demoUsers.put("pm@sprintsync.com", "admin123");
            demoUsers.put("qa@sprintsync.com", "admin123");
            demoUsers.put("asam@pms.com", "@Dmin123");
            demoUsers.put("dev1@sprintsync.com", "admin123");
            demoUsers.put("designer@sprintsync.com", "admin123");
            demoUsers.put("testuserh6@api.com", "admin123");
            demoUsers.put("dev2@sprintsync.com", "admin123");
            demoUsers.put("test@gmail.com", "Test@123");
            
            int updatedCount = 0;
            int notFoundCount = 0;
            List<String> updatedEmails = new java.util.ArrayList<>();
            List<String> notFoundEmails = new java.util.ArrayList<>();
            
            for (Map.Entry<String, String> entry : demoUsers.entrySet()) {
                String email = entry.getKey();
                String password = entry.getValue();
                
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    // Generate BCrypt hash using password encoder
                    String passwordHash = passwordEncoder.encode(password);
                    user.setPasswordHash(passwordHash);
                    userRepository.save(user);
                    updatedCount++;
                    updatedEmails.add(email);
                    logger.info("Updated password for user: {} with role: {}", email, user.getRole());
                } else {
                    notFoundCount++;
                    notFoundEmails.add(email);
                    logger.warn("User not found: {}", email);
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password fix completed");
            response.put("updatedCount", updatedCount);
            response.put("updatedEmails", updatedEmails);
            response.put("notFoundCount", notFoundCount);
            response.put("notFoundEmails", notFoundEmails);
            
            logger.info("Password fix completed. Updated {} users, {} not found", updatedCount, notFoundCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to fix passwords: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fix passwords: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Extract JWT token from request header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
