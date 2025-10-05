package com.sprintsync.api.controller;

import com.sprintsync.api.dto.AuthRequest;
import com.sprintsync.api.dto.AuthResponse;
import com.sprintsync.api.dto.RegisterRequest;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

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
    
    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
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
            
            AuthResponse authResponse = authService.register(registerRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("data", authResponse);
            
            logger.info("Registration successful for email: {}", registerRequest.getEmail());
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
