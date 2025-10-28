package com.sprintsync.api.service;

import com.sprintsync.api.dto.AuthRequest;
import com.sprintsync.api.dto.AuthResponse;
import com.sprintsync.api.dto.RegisterRequest;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.entity.enums.UserRole;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.security.CustomUserDetailsService;
import com.sprintsync.api.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Service class for authentication operations.
 * 
 * @author Mayuresh G
 */
@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public AuthService(
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Authenticate user and generate JWT token
     */
    public AuthResponse authenticate(AuthRequest authRequest) {
        try {
            logger.info("Attempting authentication for user: {}", authRequest.getEmail());
            
            // TEMPORARY: Direct password comparison for testing
            Optional<User> userOpt = userRepository.findByEmail(authRequest.getEmail());
            if (userOpt.isEmpty()) {
                logger.warn("User not found: {}", authRequest.getEmail());
                throw new RuntimeException("Invalid email or password");
            }
            
            User user = userOpt.get();
            // Use password encoder to match passwords (handles BCrypt hashing)
            if (!passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())) {
                logger.warn("Password mismatch for user: {}", authRequest.getEmail());
                throw new RuntimeException("Invalid email or password");
            }
            
            // Create user details manually
            CustomUserDetailsService.CustomUserPrincipal customUserPrincipal = 
                new CustomUserDetailsService.CustomUserPrincipal(user);
            
            // Create JWT token with additional claims
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("name", user.getName());
            claims.put("role", user.getRole().name().toUpperCase());
            claims.put("department", user.getDepartmentId());
            claims.put("domain", user.getDomainId());
            
            String token = jwtUtil.generateToken(customUserPrincipal, claims);
            
            // TEMPORARY: Skip updating last login time to avoid database schema issues
            // TODO: Fix database schema for experience enum and re-enable this
            // user.setLastLogin(LocalDateTime.now());
            // userRepository.save(user);
            
            logger.info("Authentication successful for user: {}", user.getEmail());
            
            return new AuthResponse(token, user, jwtUtil.getExpirationTime());
            
        } catch (BadCredentialsException e) {
            logger.warn("Authentication failed for user: {} - Invalid credentials", authRequest.getEmail());
            throw new RuntimeException("Invalid email or password");
        } catch (Exception e) {
            logger.error("Authentication error for user: {} - {}", authRequest.getEmail(), e.getMessage());
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Register new user
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        try {
            logger.info("Attempting registration for user: {}", registerRequest.getEmail());
            
            // Check if user already exists
            if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
                throw new RuntimeException("User with email " + registerRequest.getEmail() + " already exists");
            }
            
            // Create new user
            User user = new User();
            user.setName(registerRequest.getName());
            user.setEmail(registerRequest.getEmail());
            user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
            user.setRole(registerRequest.getRole());
            user.setDepartmentId(registerRequest.getDepartment());
            user.setDomainId(registerRequest.getDomain());
            user.setAvatarUrl(registerRequest.getAvatarUrl());
            user.setIsActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            // Save user
            User savedUser = userRepository.save(user);
            
            // Generate token for immediate login
            UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
            
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", savedUser.getId());
            claims.put("name", savedUser.getName());
            claims.put("role", savedUser.getRole().name());
            claims.put("department", savedUser.getDepartmentId());
            claims.put("domain", savedUser.getDomainId());
            
            String token = jwtUtil.generateToken(userDetails, claims);
            
            logger.info("Registration successful for user: {}", savedUser.getEmail());
            
            return new AuthResponse(token, savedUser, jwtUtil.getExpirationTime());
            
        } catch (Exception e) {
            logger.error("Registration error for user: {} - {}", registerRequest.getEmail(), e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
    
    /**
     * Get current user from token
     */
    public User getCurrentUser(String token) {
        try {
            String email = jwtUtil.extractUsername(token);
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } catch (Exception e) {
            logger.error("Error getting current user: {}", e.getMessage());
            throw new RuntimeException("Invalid token");
        }
    }
    
    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        return jwtUtil.isTokenValid(token);
    }
    
    /**
     * Refresh token (generate new token with same user)
     */
    public AuthResponse refreshToken(String token) {
        try {
            if (!jwtUtil.isTokenValid(token)) {
                throw new RuntimeException("Invalid token");
            }
            
            String email = jwtUtil.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("name", user.getName());
            claims.put("role", user.getRole().name());
            claims.put("department", user.getDepartmentId());
            claims.put("domain", user.getDomainId());
            
            String newToken = jwtUtil.generateToken(userDetails, claims);
            
            return new AuthResponse(newToken, user, jwtUtil.getExpirationTime());
            
        } catch (Exception e) {
            logger.error("Token refresh error: {}", e.getMessage());
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }
}
