package com.sprintsync.api.service;

import com.sprintsync.api.entity.Department;
import com.sprintsync.api.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Department entity operations.
 * Provides business logic for department management.
 * 
 * @author Mayuresh G
 */
@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Autowired
    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    /**
     * Create a new department.
     * 
     * @param department the department to create
     * @return the created department
     * @throws IllegalArgumentException if department data is invalid
     */
    public Department createDepartment(Department department) {
        if (department == null) {
            throw new IllegalArgumentException("Department cannot be null");
        }
        if (department.getName() == null || department.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Department name is required");
        }

        // Check if department with same name already exists
        if (departmentRepository.findByNameContainingIgnoreCase(department.getName()).stream()
            .anyMatch(d -> d.getName().equalsIgnoreCase(department.getName()))) {
            throw new IllegalArgumentException("Department with this name already exists");
        }

        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        
        // Set default values if not provided
        if (department.getIsActive() == null) {
            department.setIsActive(true);
        }

        return departmentRepository.save(department);
    }

    /**
     * Find department by ID.
     * 
     * @param id the department ID
     * @return Optional containing the department if found
     */
    public Optional<Department> findById(String id) {
        return departmentRepository.findById(id);
    }

    /**
     * Get all departments with pagination.
     * 
     * @param pageable pagination information
     * @return page of departments
     */
    public Page<Department> getAllDepartments(Pageable pageable) {
        return departmentRepository.findAll(pageable);
    }

    /**
     * Get all departments without pagination.
     * 
     * @return list of all departments
     */
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    /**
     * Find active departments.
     * 
     * @return list of active departments
     */
    public List<Department> findActiveDepartments() {
<<<<<<< HEAD
        return departmentRepository.findAll().stream()
            .filter(d -> d.getIsActive() != null && d.getIsActive())
            .toList();
=======
        return departmentRepository.findByIsActiveTrue();
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    }

    /**
     * Search departments by name.
     * 
     * @param name the name to search for
     * @return list of departments with matching names
     */
    public List<Department> searchDepartmentsByName(String name) {
        return departmentRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Update an existing department.
     * 
     * @param department the department with updated information
     * @return the updated department
     * @throws IllegalArgumentException if department is not found or data is invalid
     */
    public Department updateDepartment(Department department) {
        if (department == null || department.getId() == null) {
            throw new IllegalArgumentException("Department and ID are required");
        }

        Optional<Department> existingDepartment = departmentRepository.findById(department.getId());
        if (existingDepartment.isEmpty()) {
            throw new IllegalArgumentException("Department not found with ID: " + department.getId());
        }

        Department existing = existingDepartment.get();
        
        // Update fields if provided
        if (department.getName() != null && !department.getName().trim().isEmpty()) {
            // Check if another department with same name exists
            if (departmentRepository.findByNameContainingIgnoreCase(department.getName()).stream()
                .anyMatch(d -> d.getName().equalsIgnoreCase(department.getName()) && !d.getId().equals(department.getId()))) {
                throw new IllegalArgumentException("Department with this name already exists");
            }
            existing.setName(department.getName());
        }
        
        if (department.getDescription() != null) {
            existing.setDescription(department.getDescription());
        }
        
        if (department.getIsActive() != null) {
            existing.setIsActive(department.getIsActive());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return departmentRepository.save(existing);
    }

    /**
     * Delete a department by ID.
     * 
     * @param id the department ID
     * @throws IllegalArgumentException if department is not found
     */
    public void deleteDepartment(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Department ID is required");
        }

        Optional<Department> department = departmentRepository.findById(id);
        if (department.isEmpty()) {
            throw new IllegalArgumentException("Department not found with ID: " + id);
        }

        departmentRepository.deleteById(id);
    }

    // TODO: Add is_active column to database and uncomment this method
    // /**
    //  * Set department active status.
    //  * 
    //  * @param id the department ID
    //  * @param isActive the active status
    //  * @throws IllegalArgumentException if department is not found
    //  */
    // public void setDepartmentActiveStatus(String id, boolean isActive) {
    //     if (id == null || id.trim().isEmpty()) {
    //         throw new IllegalArgumentException("Department ID is required");
    //     }

    //     Optional<Department> department = departmentRepository.findById(id);
    //     if (department.isEmpty()) {
    //         throw new IllegalArgumentException("Department not found with ID: " + id);
    //     }

    //     Department existing = department.get();
    //     existing.setIsActive(isActive);
    //     existing.setUpdatedAt(LocalDateTime.now());
    //     departmentRepository.save(existing);
    // }

    /**
     * Check if department exists by name.
     * 
     * @param name the department name
     * @return true if department exists, false otherwise
     */
    public boolean existsByName(String name) {
        return departmentRepository.findByNameContainingIgnoreCase(name).stream()
            .anyMatch(d -> d.getName().equalsIgnoreCase(name));
    }

    // TODO: Add is_active column to database and uncomment this method
    // /**
    //  * Count departments by active status.
    //  * 
    //  * @param isActive the active status
    //  * @return count of departments
    //  */
    // public long countByIsActive(boolean isActive) {
    //     return departmentRepository.countByIsActive(isActive);
    // }
}
