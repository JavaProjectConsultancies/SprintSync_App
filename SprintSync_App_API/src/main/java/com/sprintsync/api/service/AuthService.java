package com.sprintsync.api.service;

import com.sprintsync.api.dto.AuthRequest;
import com.sprintsync.api.dto.AuthResponse;
import com.sprintsync.api.dto.RegisterRequest;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.security.CustomUserDetailsService;
import com.sprintsync.api.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PendingRegistrationService pendingRegistrationService;
    
    @Autowired
    public AuthService(
            CustomUserDetailsService userDetailsService,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PendingRegistrationService pendingRegistrationService) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.pendingRegistrationService = pendingRegistrationService;
    }
    
    /**
     * Authenticate user and generate JWT token
     */
    public AuthResponse authenticate(AuthRequest authRequest) {
        try {
            logger.info("Attempting authentication for user: {}", authRequest.getEmail());
            
            Optional<User> userOpt = userRepository.findByEmail(authRequest.getEmail());
            if (userOpt.isEmpty()) {
                logger.warn("User not found: {}", authRequest.getEmail());
                throw new RuntimeException("Invalid email or password");
            }
            
            User user = userOpt.get();
            
            // Check if user is active
            if (!user.getIsActive()) {
                logger.warn("User account is inactive: {}", authRequest.getEmail());
                throw new RuntimeException("Account is disabled. Please contact administrator.");
            }
            
            String storedPasswordHash = user.getPasswordHash();
            String providedPassword = authRequest.getPassword();
            
            // Try BCrypt password matching first (for hashed passwords)
            boolean passwordMatches = passwordEncoder.matches(providedPassword, storedPasswordHash);
            
            // If BCrypt matching fails, try plain text comparison (for migration scenario)
            if (!passwordMatches) {
                logger.debug("BCrypt matching failed, trying plain text comparison for user: {}", authRequest.getEmail());
                if (storedPasswordHash.equals(providedPassword)) {
                    // Plain text password matches - hash it and update in database
                    logger.info("Plain text password detected for user: {}. Hashing password...", authRequest.getEmail());
                    String hashedPassword = passwordEncoder.encode(providedPassword);
                    user.setPasswordHash(hashedPassword);
                    userRepository.save(user);
                    logger.info("Password hashed and saved for user: {}", authRequest.getEmail());
                    passwordMatches = true;
                } else {
                    // Neither BCrypt nor plain text matches
                    logger.warn("Password mismatch for user: {}", authRequest.getEmail());
                    throw new RuntimeException("Invalid email or password");
                }
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
     * Register new user - now saves to pending registrations for admin approval
     */
    public Map<String, Object> register(RegisterRequest registerRequest) {
        try {
            logger.info("Attempting registration for user: {}", registerRequest.getEmail());
            
            // Create pending registration instead of direct user creation
            com.sprintsync.api.entity.enums.UserRole role = registerRequest.getRole() != null 
                ? registerRequest.getRole() 
                : com.sprintsync.api.entity.enums.UserRole.developer;
            
            pendingRegistrationService.createPendingRegistration(
                registerRequest.getName(),
                registerRequest.getEmail(),
                registerRequest.getPassword(),
                role,
                registerRequest.getDepartment(),
                registerRequest.getDomain()
            );
            
            logger.info("Registration request submitted for admin approval: {}", registerRequest.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration request submitted successfully. Waiting for admin approval.");
            
            return response;
            
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



