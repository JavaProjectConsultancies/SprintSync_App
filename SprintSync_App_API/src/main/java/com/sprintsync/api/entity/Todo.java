package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Todo entity representing todos in the SprintSync application.
 * Maps to the 'todos' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "todos")
public class Todo extends BaseEntity {

    @NotNull(message = "User ID cannot be null")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotBlank(message = "Title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "priority")
    private String priority;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "category")
    private String category;

    // Constructors
    public Todo() {}

    public Todo(String userId, String title, String description) {
        this.userId = userId;
        this.title = title;
        this.description = description;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
