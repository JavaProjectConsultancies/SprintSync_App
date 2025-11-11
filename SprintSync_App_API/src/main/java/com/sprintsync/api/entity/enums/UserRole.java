package com.sprintsync.api.entity.enums;

/**
 * User role enumeration for the SprintSync application.
 * Defines the different roles that users can have in the system.
 * 
 * @author Mayuresh G
 */
public enum UserRole {
    admin("admin"),
    manager("manager"),
    developer("developer"),
    qa("qa");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
