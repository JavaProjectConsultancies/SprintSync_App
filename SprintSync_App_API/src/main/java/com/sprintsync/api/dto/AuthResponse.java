package com.sprintsync.api.dto;

import com.sprintsync.api.entity.User;

/**
 * Data Transfer Object for authentication responses.
 * 
 * @author Mayuresh G
 */
public class AuthResponse {
    
    private String token;
    private String type = "Bearer";
    private User user;
    private long expiresIn;
    
    public AuthResponse() {}
    
    public AuthResponse(String token, User user, long expiresIn) {
        this.token = token;
        this.user = user;
        this.expiresIn = expiresIn;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public long getExpiresIn() {
        return expiresIn;
    }
    
    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
    
    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='[PROTECTED]'" +
                ", type='" + type + '\'' +
                ", user=" + (user != null ? user.getEmail() : "null") +
                ", expiresIn=" + expiresIn +
                '}';
    }
}
