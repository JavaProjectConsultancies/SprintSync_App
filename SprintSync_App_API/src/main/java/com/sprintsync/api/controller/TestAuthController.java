package com.sprintsync.api.controller;

import com.sprintsync.api.dto.AuthRequest;
import com.sprintsync.api.dto.AuthResponse;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Temporary test authentication controller for debugging
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestAuthController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> testLogin(@RequestBody AuthRequest authRequest) {
        try {
            System.out.println("Test login attempt for: " + authRequest.getEmail());
            
            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(authRequest.getEmail());
            
            if (userOpt.isEmpty()) {
                System.out.println("User not found: " + authRequest.getEmail());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                response.put("data", null);
                return ResponseEntity.status(404).body(response);
            }
            
            User user = userOpt.get();
            System.out.println("Found user: " + user.getName() + ", Role: " + user.getRole());
            System.out.println("Stored password hash: " + user.getPasswordHash());
            System.out.println("Provided password: " + authRequest.getPassword());
            
            // Simple password comparison (temporary for testing)
            if (!user.getPasswordHash().equals(authRequest.getPassword())) {
                System.out.println("Password mismatch");
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid password");
                response.put("data", null);
                return ResponseEntity.status(401).body(response);
            }
            
            // Generate token with user email as subject
            String token = jwtUtil.generateTokenForSubject(user.getEmail());
            
            AuthResponse authResponse = new AuthResponse(token, user, 86400000L);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test login successful");
            response.put("data", authResponse);
            
            System.out.println("Test login successful!");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Test login error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Test login failed: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(500).body(response);
        }
    }
}



