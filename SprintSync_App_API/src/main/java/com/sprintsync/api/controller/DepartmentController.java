package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Department;
import com.sprintsync.api.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Department entity operations.
 * Provides endpoints for department management operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Autowired
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    /**
     * Create a new department.
     * 
     * @param department the department to create
     * @return ResponseEntity containing the created department
     */
    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        try {
            Department createdDepartment = departmentService.createDepartment(department);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get department by ID.
     * 
     * @param id the department ID
     * @return ResponseEntity containing the department if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable String id) {
        Optional<Department> department = departmentService.findById(id);
        return department.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all departments with pagination.
     * 
     * @param page page number (default: 0)
     * @param size page size (default: 10)
     * @param sortBy sort field (default: name)
     * @param sortDir sort direction (default: asc)
     * @return ResponseEntity containing page of departments
     */
    @GetMapping
    public ResponseEntity<Page<Department>> getAllDepartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Department> departments = departmentService.getAllDepartments(pageable);
        return ResponseEntity.ok(departments);
    }

    /**
     * Get all departments without pagination.
     * 
     * @return ResponseEntity containing list of all departments
     */
    @GetMapping("/all")
    public ResponseEntity<List<Department>> getAllDepartmentsList() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    /**
     * Get active departments.
     * 
     * @return ResponseEntity containing list of active departments
     */
    @GetMapping("/active")
    public ResponseEntity<List<Department>> getActiveDepartments() {
        List<Department> departments = departmentService.findActiveDepartments();
        return ResponseEntity.ok(departments);
    }

    /**
     * Search departments by name.
     * 
     * @param name the name to search for
     * @return ResponseEntity containing list of departments with matching names
     */
    @GetMapping("/search")
    public ResponseEntity<List<Department>> searchDepartmentsByName(@RequestParam String name) {
        List<Department> departments = departmentService.searchDepartmentsByName(name);
        return ResponseEntity.ok(departments);
    }

    /**
     * Update an existing department.
     * 
     * @param id the department ID
     * @param departmentDetails the updated department details
     * @return ResponseEntity containing the updated department
     */
    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable String id, @RequestBody Department departmentDetails) {
        try {
            // Set the ID to ensure we're updating the correct department
            departmentDetails.setId(id);
            Department updatedDepartment = departmentService.updateDepartment(departmentDetails);
            return ResponseEntity.ok(updatedDepartment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a department by ID.
     * 
     * @param id the department ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable String id) {
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // TODO: Add is_active column to database and uncomment this method
    // /**
    //  * Activate or deactivate a department.
    //  * 
    //  * @param id the department ID
    //  * @param isActive the active status
    //  * @return ResponseEntity with no content if successful
    //  */
    // @PatchMapping("/{id}/active")
    // public ResponseEntity<Void> setDepartmentActiveStatus(@PathVariable String id, @RequestParam boolean isActive) {
    //     try {
    //         departmentService.setDepartmentActiveStatus(id, isActive);
    //         return ResponseEntity.noContent().build();
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.notFound().build();
    //     }
    // }

    /**
     * Get department statistics.
     * 
     * @return ResponseEntity containing department statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<String> getDepartmentStats() {
        long totalDepartments = departmentService.getAllDepartments().size();
        long activeDepartments = departmentService.findActiveDepartments().size();
        
        String stats = String.format("Total Departments: %d, Active Departments: %d", 
                                   totalDepartments, activeDepartments);
        return ResponseEntity.ok(stats);
    }
}
