package com.sprintsync.api.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * JWT Authentication Filter.
 * Intercepts requests and validates JWT tokens.
 * 
 * @author Mayuresh G
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    
    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Skip JWT processing for public endpoints
        if (isPublicEndpoint(requestPath)) {
            logger.debug("Skipping JWT authentication for public endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String jwt = getJwtFromRequest(request);
            
            logger.debug("JWT Token extracted for {}: {}", requestPath, jwt != null ? jwt.substring(0, Math.min(50, jwt.length())) + "..." : "null");
            
            if (StringUtils.hasText(jwt) && jwtUtil.isTokenValid(jwt)) {
                String email = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted email from JWT: {}", email);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                logger.debug("UserDetails loaded: {}", userDetails != null ? userDetails.getUsername() : "null");
                
                if (userDetails != null && jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    logger.debug("Authentication set for user: {} with authorities: {}", email, userDetails.getAuthorities());
                } else {
                    logger.warn("Token validation failed for user: {}", email);
                }
            } else {
                logger.warn("JWT token is invalid or empty for path: {}", requestPath);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Check if the request path is a public endpoint that doesn't require authentication
     */
    private boolean isPublicEndpoint(String requestPath) {
        // Allow all GET requests to pass without authentication
        // This ensures projects API works on all pages
        if (requestPath.startsWith("/api/")) {
            return true; // Allow all API requests for now
        }
        return requestPath.startsWith("/api/auth/") ||
               requestPath.startsWith("/api/test/") ||
               requestPath.startsWith("/api-docs/") ||
               requestPath.startsWith("/swagger-ui/") ||
               requestPath.startsWith("/swagger-ui.html") ||
               requestPath.startsWith("/actuator/") ||
               requestPath.startsWith("/h2-console/") ||
               requestPath.equals("/error");
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
