//package com.sprintsync.api.service;
//
//import com.sprintsync.api.entity.*;
//import com.sprintsync.api.entity.enums.*;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.List;
//// import java.util.String; // Removed - using String IDs
//
///**
// * Service for initializing dummy data in the database.
// * This service runs on application startup to populate the database with sample data.
// * 
// * @author Mayuresh G
// */
//@Service
//@Transactional
//public class DataInitializationService implements CommandLineRunner {
//
//    @Autowired
//    private UserService userService;
//
//    @Autowired
//    private ProjectService projectService;
//
//    @Autowired
//    private EpicService epicService;
//
//    @Autowired
//    private ReleaseService releaseService;
//
//    @Autowired
//    private QualityGateService qualityGateService;
//
//    @Override
//    public void run(String... args) throws Exception {
//        System.out.println("Initializing dummy data...");
//        
//        // Check if data already exists
//        if (userService.getAllUsers().isEmpty()) {
//            initializeData();
//            System.out.println("Dummy data initialization completed!");
//        } else {
//            System.out.println("Data already exists, skipping initialization.");
//        }
//    }
//
//    private void initializeData() {
//        // Create Departments
//        Department engineering = createDepartment("Engineering", "Software development and engineering");
//        Department product = createDepartment("Product", "Product management and strategy");
//        Department design = createDepartment("Design", "UI/UX design and user experience");
//        Department qa = createDepartment("Quality Assurance", "Testing and quality control");
//        Department marketing = createDepartment("Marketing", "Marketing and communications");
//
//        // Create Domains
//        Domain webDevelopment = createDomain("Web Development", "Web applications and services");
//        Domain mobileDevelopment = createDomain("Mobile Development", "Mobile applications");
//        Domain dataAnalytics = createDomain("Data Analytics", "Data processing and analytics");
//        Domain devops = createDomain("DevOps", "Infrastructure and deployment");
//        Domain ai = createDomain("AI/ML", "Artificial Intelligence and Machine Learning");
//
//        // Create Users
//        User admin = createUser("admin@sprintsync.com", "Admin User", UserRole.ADMIN, engineering.getId(), webDevelopment.getId(), "senior", new BigDecimal("120.00"));
//        User pm1 = createUser("pm1@sprintsync.com", "Sarah Johnson", UserRole.MANAGER, product.getId(), webDevelopment.getId(), "senior", new BigDecimal("100.00"));
//        User dev1 = createUser("dev1@sprintsync.com", "John Smith", UserRole.DEVELOPER, engineering.getId(), webDevelopment.getId(), "senior", new BigDecimal("85.00"));
//        User dev2 = createUser("dev2@sprintsync.com", "Emily Davis", UserRole.DEVELOPER, engineering.getId(), mobileDevelopment.getId(), "mid", new BigDecimal("70.00"));
//        User dev3 = createUser("dev3@sprintsync.com", "Michael Brown", UserRole.DEVELOPER, engineering.getId(), dataAnalytics.getId(), "junior", new BigDecimal("60.00"));
//        User designer1 = createUser("designer1@sprintsync.com", "Lisa Wilson", UserRole.DESIGNER, design.getId(), webDevelopment.getId(), "senior", new BigDecimal("80.00"));
//        User qa1 = createUser("qa1@sprintsync.com", "David Lee", UserRole.DEVELOPER, qa.getId(), webDevelopment.getId(), "mid", new BigDecimal("65.00"));
//
//        // Create Projects
//        Project ecommerceProject = createProject("E-commerce Platform", "Modern e-commerce platform with microservices architecture", 
//            ProjectStatus.ACTIVE, Priority.HIGH, "scrum", "web-app", engineering.getId(), pm1.getId(), 
//            LocalDate.now().minusMonths(2), LocalDate.now().plusMonths(4), new BigDecimal("500000"), new BigDecimal("125000"), 25);
//
//        Project mobileApp = createProject("Mobile Banking App", "Secure mobile banking application", 
//            ProjectStatus.ACTIVE, Priority.CRITICAL, "kanban", "mobile-app", engineering.getId(), pm1.getId(), 
//            LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(6), new BigDecimal("300000"), new BigDecimal("50000"), 15);
//
//        Project dataPlatform = createProject("Data Analytics Platform", "Enterprise data analytics and reporting platform", 
//            ProjectStatus.PLANNING, Priority.MEDIUM, "waterfall", "data-analytics", engineering.getId(), pm1.getId(), 
//            LocalDate.now().plusDays(30), LocalDate.now().plusMonths(8), new BigDecimal("750000"), BigDecimal.ZERO, 0);
//
//        // Create Epics
//        Epic userAuthEpic = createEpic(ecommerceProject.getId(), "User Authentication System", 
//            "Complete user authentication and authorization system", "Implement secure user login, registration, and role-based access control",
//            Priority.HIGH, EpicStatus.IN_PROGRESS, dev1.getId(), admin.getId(), LocalDate.now().minusDays(30), LocalDate.now().plusDays(30), 21);
//
//        Epic paymentEpic = createEpic(ecommerceProject.getId(), "Payment Processing", 
//            "Secure payment processing system", "Implement multiple payment gateways and secure transaction handling",
//            Priority.CRITICAL, EpicStatus.PLANNING, dev2.getId(), pm1.getId(), LocalDate.now().plusDays(10), LocalDate.now().plusDays(60), 34);
//
//        Epic mobileLoginEpic = createEpic(mobileApp.getId(), "Mobile Authentication", 
//            "Biometric and PIN-based authentication for mobile app", "Implement secure mobile authentication with biometric support",
//            Priority.CRITICAL, EpicStatus.BACKLOG, dev2.getId(), pm1.getId(), LocalDate.now().plusDays(20), LocalDate.now().plusDays(50), 21);
//
//        Epic dataIngestionEpic = createEpic(dataPlatform.getId(), "Data Ingestion Pipeline", 
//            "Real-time data ingestion and processing pipeline", "Build scalable data ingestion system for various data sources",
//            Priority.HIGH, EpicStatus.PLANNING, dev3.getId(), pm1.getId(), LocalDate.now().plusDays(45), LocalDate.now().plusDays(90), 55);
//
//        // Create Releases
//        Release v1Release = createRelease(ecommerceProject.getId(), "E-commerce Platform v1.0", "1.0.0", 
//            "Initial release with core e-commerce functionality", ReleaseStatus.DEVELOPMENT, 
//            LocalDate.now().plusDays(90), LocalDate.now().plusDays(120), admin.getId());
//
//        Release mobileV1Release = createRelease(mobileApp.getId(), "Mobile Banking v1.0", "1.0.0", 
//            "Initial mobile banking application release", ReleaseStatus.TESTING, 
//            LocalDate.now().plusDays(60), LocalDate.now().plusDays(75), admin.getId());
//
//        Release dataV1Release = createRelease(dataPlatform.getId(), "Data Platform v1.0", "1.0.0", 
//            "Initial data analytics platform release", ReleaseStatus.PLANNING, 
//            LocalDate.now().plusDays(180), LocalDate.now().plusDays(210), admin.getId());
//
//        // Create Quality Gates
//        createQualityGate(v1Release.getId(), "Security Testing", "Comprehensive security testing and vulnerability assessment", true);
//        createQualityGate(v1Release.getId(), "Performance Testing", "Load testing and performance benchmarking", true);
//        createQualityGate(v1Release.getId(), "User Acceptance Testing", "End-to-end user acceptance testing", true);
//        createQualityGate(v1Release.getId(), "Code Quality Review", "Static code analysis and code review", false);
//
//        createQualityGate(mobileV1Release.getId(), "Mobile Security Testing", "Mobile-specific security testing", true);
//        createQualityGate(mobileV1Release.getId(), "Device Compatibility Testing", "Testing across different mobile devices", true);
//        createQualityGate(mobileV1Release.getId(), "Performance Testing", "Mobile app performance testing", true);
//
//        createQualityGate(dataV1Release.getId(), "Data Quality Validation", "Data accuracy and quality validation", true);
//        createQualityGate(dataV1Release.getId(), "Scalability Testing", "Testing data processing at scale", true);
//
//        System.out.println("Sample data created:");
//        System.out.println("- 5 Departments");
//        System.out.println("- 5 Domains");
//        System.out.println("- 7 Users");
//        System.out.println("- 3 Projects");
//        System.out.println("- 4 Epics");
//        System.out.println("- 3 Releases");
//        System.out.println("- 9 Quality Gates");
//    }
//
//    private Department createDepartment(String name, String description) {
//        Department department = new Department(name, description);
//        // Note: We would need a DepartmentService to save this
//        System.out.println("Created department: " + name);
//        return department;
//    }
//
//    private Domain createDomain(String name, String description) {
//        Domain domain = new Domain(name, description);
//        // Note: We would need a DomainService to save this
//        System.out.println("Created domain: " + name);
//        return domain;
//    }
//
//    private User createUser(String email, String name, UserRole role, String departmentId, String domainId, String experience, BigDecimal hourlyRate) {
//        User user = new User();
//        user.setEmail(email);
//        user.setPasswordHash("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjxGz7d3x3k9LQkKjYVqjxGz"); // dummy hash
//        user.setName(name);
//        user.setRole(role);
//        user.setDepartmentId(departmentId);
//        user.setDomainId(domainId);
//        user.setExperience(experience);
//        user.setHourlyRate(hourlyRate);
//        user.setAvailabilityPercentage(100);
//        user.setSkills("[\"Java\", \"Spring Boot\", \"React\", \"PostgreSQL\"]");
//        user.setIsActive(true);
//        user.setLastLogin(LocalDateTime.now().minusDays(1));
//        
//        return userService.createUser(user);
//    }
//
//    private Project createProject(String name, String description, ProjectStatus status, Priority priority, 
//                                String methodology, String template, String departmentId, String managerId, 
//                                LocalDate startDate, LocalDate endDate, BigDecimal budget, BigDecimal spent, Integer progress) {
//        Project project = new Project();
//        project.setName(name);
//        project.setDescription(description);
//        project.setStatus(status);
//        project.setPriority(priority);
//        project.setMethodology(methodology);
//        project.setTemplate(template);
//        project.setDepartmentId(departmentId);
//        project.setManagerId(managerId);
//        project.setStartDate(startDate);
//        project.setEndDate(endDate);
//        project.setBudget(budget);
//        project.setSpent(spent);
//        project.setProgressPercentage(progress);
//        project.setScope("Full implementation of " + name.toLowerCase());
//        project.setSuccessCriteria("[\"User satisfaction > 90%\", \"Performance targets met\", \"Security requirements satisfied\"]");
//        project.setObjectives("[\"Deliver on time\", \"Meet quality standards\", \"Stay within budget\"]");
//        project.setIsActive(true);
//        
//        return projectService.createProject(project);
//    }
//
//    private Epic createEpic(String projectId, String title, String description, String summary, Priority priority, 
//                          EpicStatus status, String assigneeId, String owner, LocalDate startDate, LocalDate endDate, Integer storyPoints) {
//        Epic epic = new Epic();
//        epic.setProjectId(projectId);
//        epic.setTitle(title);
//        epic.setDescription(description);
//        epic.setSummary(summary);
//        epic.setPriority(priority);
//        epic.setStatus(status);
//        epic.setAssigneeId(assigneeId);
//        epic.setOwner(owner);
//        epic.setStartDate(startDate);
//        epic.setEndDate(endDate);
//        epic.setProgress(calculateProgress(status));
//        epic.setStoryPoints(storyPoints);
//        epic.setCompletedStoryPoints(calculateCompletedStoryPoints(status, storyPoints));
//        epic.setTheme(determineTheme(title));
//        epic.setBusinessValue(determineBusinessValue(title));
//        epic.setAcceptanceCriteria("[\"All acceptance criteria met\", \"Code reviewed and approved\", \"Tests passing\"]");
//        epic.setLabels("[\"" + priority.toString().toLowerCase() + "\", \"" + status.toString().toLowerCase() + "\"]");
//        
//        if (status == EpicStatus.COMPLETED) {
//            epic.setCompletedAt(LocalDate.now());
//        }
//        
//        return epicService.createEpic(epic);
//    }
//
//    private Release createRelease(String projectId, String name, String version, String description, 
//                                ReleaseStatus status, LocalDate releaseDate, LocalDate targetDate, String createdBy) {
//        Release release = new Release();
//        release.setProjectId(projectId);
//        release.setName(name);
//        release.setVersion(version);
//        release.setDescription(description);
//        release.setStatus(status);
//        release.setReleaseDate(releaseDate);
//        release.setTargetDate(targetDate);
//        release.setProgress(calculateReleaseProgress(status));
//        release.setCreatedBy(createdBy);
//        release.setReleaseNotes("Release notes for " + name);
//        release.setRisks("[\"Technical risks\", \"Resource constraints\", \"Timeline dependencies\"]");
//        release.setDependencies("[\"External API dependencies\", \"Third-party service dependencies\"]");
//        
//        if (status == ReleaseStatus.RELEASED) {
//            release.setCompletedAt(LocalDate.now());
//        }
//        
//        return releaseService.createRelease(release);
//    }
//
//    private QualityGate createQualityGate(String releaseId, String name, String description, Boolean required) {
//        QualityGate qualityGate = new QualityGate();
//        qualityGate.setReleaseId(releaseId);
//        qualityGate.setName(name);
//        qualityGate.setDescription(description);
//        qualityGate.setStatus(QualityGateStatus.PENDING);
//        qualityGate.setRequired(required);
//        
//        return qualityGateService.createQualityGate(qualityGate);
//    }
//
//    // Helper methods
//    private Integer calculateProgress(EpicStatus status) {
//        switch (status) {
//            case BACKLOG: return 0;
//            case PLANNING: return 10;
//            case IN_PROGRESS: return 50;
//            case REVIEW: return 80;
//            case COMPLETED: return 100;
//            case CANCELLED: return 0;
//            default: return 0;
//        }
//    }
//
//    private Integer calculateCompletedStoryPoints(EpicStatus status, Integer totalStoryPoints) {
//        return (int) (totalStoryPoints * calculateProgress(status) / 100.0);
//    }
//
//    private Integer calculateReleaseProgress(ReleaseStatus status) {
//        switch (status) {
//            case PLANNING: return 10;
//            case DEVELOPMENT: return 30;
//            case TESTING: return 60;
//            case STAGING: return 80;
//            case READY_FOR_RELEASE: return 95;
//            case RELEASED: return 100;
//            case CANCELLED: return 0;
//            default: return 0;
//        }
//    }
//
//    private String determineTheme(String title) {
//        if (title.toLowerCase().contains("auth")) return "Security";
//        if (title.toLowerCase().contains("payment")) return "Financial";
//        if (title.toLowerCase().contains("mobile")) return "Mobile";
//        if (title.toLowerCase().contains("data")) return "Data";
//        return "General";
//    }
//
//    private String determineBusinessValue(String title) {
//        if (title.toLowerCase().contains("auth")) return "Critical for platform security and user management";
//        if (title.toLowerCase().contains("payment")) return "Essential for revenue generation and user experience";
//        if (title.toLowerCase().contains("mobile")) return "Key for mobile user engagement and accessibility";
//        if (title.toLowerCase().contains("data")) return "Important for business intelligence and decision making";
//        return "Valuable for business operations";
//    }
//}



