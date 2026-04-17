package com.sprintsync.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity class for Login Activity Log.
 * Tracks user login events including IP address and timestamp.
 */
@Entity
@Table(name = "login_activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LoginActivityLog extends BaseEntity {

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "user_name", length = 255)
    private String userName;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;
}
