package com.sprintsync.api.security;

import com.sprintsync.api.entity.User;
import com.sprintsync.api.entity.enums.UserRole;
import com.sprintsync.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom UserDetailsService implementation for Spring Security.
 * 
 * @author Mayuresh G
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return new CustomUserPrincipal(user);
    }
    
    /**
     * Custom UserDetails implementation
     */
    public static class CustomUserPrincipal implements UserDetails {
        
        private final User user;
        
        public CustomUserPrincipal(User user) {
            this.user = user;
        }
        
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            UserRole role = user.getRole();
            String roleName = "ROLE_" + role.name().toUpperCase();
            return Collections.singletonList(new SimpleGrantedAuthority(roleName));
        }
        
        @Override
        public String getPassword() {
            return user.getPasswordHash();
        }
        
        @Override
        public String getUsername() {
            return user.getEmail();
        }
        
        @Override
        public boolean isAccountNonExpired() {
            return true;
        }
        
        @Override
        public boolean isAccountNonLocked() {
            return true;
        }
        
        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }
        
        @Override
        public boolean isEnabled() {
            return user.getIsActive();
        }
        
        // Additional methods to access user data
        public User getUser() {
            return user;
        }
        
        public String getUserId() {
            return user.getId();
        }
        
        public String getName() {
            return user.getName();
        }
        
        public UserRole getRole() {
            return user.getRole();
        }
    }
}


